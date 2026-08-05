/**
 * Lead intake — Cloudflare Pages Function.
 *
 * The server half of audit finding C1. The browser fires a Pixel event; this
 * fires the matching Conversions API event with the same event_id, so Meta
 * collapses the pair into one conversion instead of double-counting. CAPI also
 * survives ad blockers and iOS tracking restrictions, which is most of why the
 * pixel alone is not enough to optimise a campaign.
 *
 * The lead itself is forwarded to whatever destination is configured — a CRM
 * webhook, n8n, Make, Zapier — and emailed via Resend if a key is present.
 * Every integration is optional; with none configured the endpoint still
 * accepts the submission and logs it, so the form never breaks in front of a
 * visitor.
 *
 * Environment (set in the Pages dashboard, never committed):
 *   META_PIXEL_ID, META_CAPI_TOKEN   Meta Conversions API
 *   LEAD_WEBHOOK_URL                 CRM / automation endpoint
 *   RESEND_API_KEY, LEAD_NOTIFY_TO   email notification
 *   TEST_EVENT_CODE                  optional, for Meta's Test Events tab
 */

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

async function sendToMeta(env: Env, body: Payload, request: Request): Promise<void> {
  if (!env.META_PIXEL_ID || !env.META_CAPI_TOKEN) return;

  const eventName =
    body.event_name === 'schedule'
      ? 'Schedule'
      : body.event_name === 'contact'
        ? 'Contact'
        : 'Lead';

  const userData: Record<string, unknown> = {
    client_user_agent: request.headers.get('user-agent') ?? undefined,
    client_ip_address: request.headers.get('cf-connecting-ip') ?? undefined,
  };

  if (typeof body.email === 'string' && body.email) userData.em = [await sha256(body.email)];
  if (typeof body.phone === 'string' && body.phone) {
    userData.ph = [await sha256(normalisePhone(body.phone))];
  }
  if (typeof body.name === 'string' && body.name) {
    const parts = body.name.trim().split(/\s+/);
    userData.fn = [await sha256(parts[0])];
    if (parts.length > 1) userData.ln = [await sha256(parts[parts.length - 1])];
  }
  if (body.fbc) userData.fbc = body.fbc;
  if (body.fbp) userData.fbp = body.fbp;

  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        // Same id the browser used — this is what makes deduplication work.
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
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    console.error('Meta CAPI rejected the event:', res.status, await res.text());
  }
}

async function sendToWebhook(env: Env, body: Payload): Promise<void> {
  if (!env.LEAD_WEBHOOK_URL) return;
  await fetch(env.LEAD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, received_at: new Date().toISOString() }),
  });
}

async function sendEmail(env: Env, body: Payload): Promise<void> {
  if (!env.RESEND_API_KEY || !env.LEAD_NOTIFY_TO) return;

  const rows = Object.entries(body)
    .filter(([k]) => !['event_id', 'fbc', 'fbp', 'event_name'].includes(k))
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 14px 6px 0;color:#8a8378;white-space:nowrap;vertical-align:top">${k}</td><td style="padding:6px 0;color:#1a1714">${String(v ?? '')}</td></tr>`
    )
    .join('');

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
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
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: Payload;

  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), {
      status: 400,
      headers: JSON_HEADERS,
    });
  }

  // Honeypot — the client filters this, but never trust the client.
  if (typeof body.website === 'string' && body.website.trim()) {
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: JSON_HEADERS });
  }

  const email = typeof body.email === 'string' ? body.email : '';
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) {
    return new Response(JSON.stringify({ ok: false, error: 'A valid email is required' }), {
      status: 422,
      headers: JSON_HEADERS,
    });
  }

  // Integrations run in parallel and are individually non-fatal: a CRM outage
  // must never cost us the lead or show the visitor an error.
  const results = await Promise.allSettled([
    sendToMeta(env, body, request),
    sendToWebhook(env, body),
    sendEmail(env, body),
  ]);

  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.error(['meta', 'webhook', 'email'][i], 'failed:', r.reason);
    }
  });

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: JSON_HEADERS });
};

/**
 * Anything other than POST gets a clear answer rather than a framework 404.
 * Declared per-method: a catch-all `onRequest` would shadow `onRequestPost`
 * rather than defer to it.
 */
const methodNotAllowed = () =>
  new Response(JSON.stringify({ ok: false, error: 'Method not allowed' }), {
    status: 405,
    headers: { ...JSON_HEADERS, Allow: 'POST' },
  });

export const onRequestGet: PagesFunction<Env> = methodNotAllowed;
export const onRequestPut: PagesFunction<Env> = methodNotAllowed;
export const onRequestDelete: PagesFunction<Env> = methodNotAllowed;
