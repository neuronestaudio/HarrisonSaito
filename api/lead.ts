/**
 * Lead intake — Vercel Function (Web-standard handler).
 *
 * The site moved from Cloudflare Pages to Vercel on 6 Sep 2026 and the Pages
 * Function that used to answer /api/lead was never deployed there, so every
 * submission after the cutover 404'd. This is that function, on Vercel.
 *
 * The browser fires a Pixel event; this fires the matching Conversions API
 * event with the same event_id, so Meta collapses the pair into one
 * conversion. The lead itself is forwarded to whatever is configured — a CRM
 * webhook (GHL inbound webhook, n8n, Make, Zapier) and/or an email through
 * Resend. Every integration is optional; with none configured the endpoint
 * still accepts the submission, logs it in full, and says so in its reply
 * (`delivered: false`) so the page can offer the direct route as well.
 *
 * Environment (Vercel → Project → Settings → Environment Variables):
 *   META_PIXEL_ID, META_CAPI_TOKEN   Meta Conversions API
 *   LEAD_WEBHOOK_URL                 CRM / automation endpoint
 *   RESEND_API_KEY, LEAD_NOTIFY_TO   email notification
 *   TEST_EVENT_CODE                  optional, for Meta's Test Events tab
 */

declare const process: { env: Record<string, string | undefined> };

interface Env {
  META_PIXEL_ID?: string;
  META_CAPI_TOKEN?: string;
  LEAD_WEBHOOK_URL?: string;
  RESEND_API_KEY?: string;
  LEAD_NOTIFY_TO?: string;
  TEST_EVENT_CODE?: string;
}

type Payload = Record<string, unknown>;

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
};

const reply = (status: number, body: Payload) =>
  new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });

/** Meta requires user data hashed with SHA-256, lowercased and trimmed. */
async function sha256(value: string): Promise<string> {
  const data = new TextEncoder().encode(value.trim().toLowerCase());
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** E.164-ish normalisation for AU numbers before hashing. */
function normalisePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('61')) return digits;
  if (digits.startsWith('0')) return `61${digits.slice(1)}`;
  return digits;
}

async function sendToMeta(env: Env, body: Payload, request: Request): Promise<boolean> {
  if (!env.META_PIXEL_ID || !env.META_CAPI_TOKEN) return false;

  const eventName =
    body.event_name === 'schedule' ? 'Schedule' : body.event_name === 'contact' ? 'Contact' : 'Lead';

  const forwarded = request.headers.get('x-forwarded-for') ?? '';
  const userData: Record<string, unknown> = {
    client_user_agent: request.headers.get('user-agent') ?? undefined,
    client_ip_address: forwarded.split(',')[0].trim() || undefined,
  };

  if (typeof body.email === 'string' && body.email) userData.em = [await sha256(body.email)];
  if (typeof body.phone === 'string' && body.phone) userData.ph = [await sha256(normalisePhone(body.phone))];
  if (typeof body.name === 'string' && body.name) {
    const parts = body.name.trim().split(/\s+/);
    userData.fn = [await sha256(parts[0])];
    if (parts.length > 1) userData.ln = [await sha256(parts[parts.length - 1])];
  }
  if (body.fbc) userData.fbc = body.fbc;
  if (body.fbp) userData.fbp = body.fbp;

  const payload: Payload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: body.event_id,
        event_source_url: body.page_url,
        action_source: 'website',
        user_data: userData,
        custom_data: {
          content_name: body.form_id,
          currency: 'AUD',
          value: typeof body.value === 'number' ? body.value : undefined,
        },
      },
    ],
  };
  if (env.TEST_EVENT_CODE) payload.test_event_code = env.TEST_EVENT_CODE;

  const res = await fetch(
    `https://graph.facebook.com/v21.0/${env.META_PIXEL_ID}/events?access_token=${env.META_CAPI_TOKEN}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
  );
  if (!res.ok) console.error('Meta CAPI rejected the event:', res.status, await res.text());
  return res.ok;
}

async function sendToWebhook(env: Env, body: Payload): Promise<boolean> {
  if (!env.LEAD_WEBHOOK_URL) return false;
  const res = await fetch(env.LEAD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, received_at: new Date().toISOString() }),
  });
  if (!res.ok) throw new Error(`webhook HTTP ${res.status}`);
  return true;
}

async function sendEmail(env: Env, body: Payload): Promise<boolean> {
  if (!env.RESEND_API_KEY || !env.LEAD_NOTIFY_TO) return false;

  const rows = Object.entries(body)
    .filter(([k]) => !['event_id', 'fbc', 'fbp', 'event_name', 'website'].includes(k))
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 14px 6px 0;color:#8a8378;white-space:nowrap;vertical-align:top">${k}</td><td style="padding:6px 0;color:#1a1714">${String(v ?? '')}</td></tr>`
    )
    .join('');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Website <leads@harrisonsaito.com.au>',
      to: [env.LEAD_NOTIFY_TO],
      reply_to: typeof body.email === 'string' ? body.email : undefined,
      subject: `New enquiry — ${body.form_id ?? 'website'}${body.name ? ` — ${body.name}` : ''}`,
      html: `<div style="font-family:system-ui,sans-serif;max-width:560px">
        <h2 style="font-weight:400;color:#1a1714">New enquiry from harrisonsaito.com.au</h2>
        <table style="border-collapse:collapse;font-size:14px">${rows}</table>
      </div>`,
    }),
  });
  if (!res.ok) throw new Error(`resend HTTP ${res.status}`);
  return true;
}

export async function POST(request: Request): Promise<Response> {
  const env = process.env as Env;
  let body: Payload;

  try {
    body = await request.json();
  } catch {
    return reply(400, { ok: false, error: 'Invalid JSON' });
  }

  // Honeypot — the client filters this, but never trust the client.
  if (typeof body.website === 'string' && body.website.trim()) return reply(200, { ok: true, delivered: true });

  const email = typeof body.email === 'string' ? body.email : '';
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) {
    return reply(422, { ok: false, error: 'A valid email is required' });
  }

  // Integrations run in parallel and are individually non-fatal: a CRM outage
  // must never cost us the lead or show the visitor an error.
  const results = await Promise.allSettled([
    sendToMeta(env, body, request),
    sendToWebhook(env, body),
    sendEmail(env, body),
  ]);
  results.forEach((r, i) => {
    if (r.status === 'rejected') console.error(['meta', 'webhook', 'email'][i], 'failed:', r.reason);
  });
  const delivered = results.slice(1).some((r) => r.status === 'fulfilled' && r.value === true);

  // Always in the function log, in full, so nothing is ever lost to a missing
  // integration: Vercel → Project → Logs, filter "[lead]".
  console.log('[lead]', JSON.stringify({ ...body, received_at: new Date().toISOString(), delivered }));

  return reply(200, { ok: true, delivered });
}

/** Anything other than POST gets a clear answer rather than a framework 404. */
export function GET(): Response {
  return reply(405, { ok: false, error: 'POST a JSON body to this endpoint' });
}
