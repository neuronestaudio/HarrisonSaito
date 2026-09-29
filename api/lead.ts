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
 *   GHL_TOKEN, GHL_LOCATION_ID       GoHighLevel private integration → contact upsert
 *   META_PIXEL_ID, META_CAPI_TOKEN   Meta Conversions API
 *   LEAD_WEBHOOK_URL                 any other CRM / automation endpoint
 *   RESEND_API_KEY, LEAD_NOTIFY_TO   email notification (comma-separated recipients)
 *   TEST_EVENT_CODE                  optional, for Meta's Test Events tab
 */

declare const process: { env: Record<string, string | undefined> };

interface Env {
  GHL_TOKEN?: string;
  GHL_LOCATION_ID?: string;
  META_PIXEL_ID?: string;
  META_CAPI_TOKEN?: string;
  LEAD_WEBHOOK_URL?: string;
  RESEND_API_KEY?: string;
  LEAD_NOTIFY_TO?: string;
  TEST_EVENT_CODE?: string;
}

/* ---------------------------------------------------------------- GHL ----
   The contact lands in the "Harrison Saito - Return to Self" sub-account with
   the form's answers on custom fields created 12 Sep 2026 (keys below; the
   session and call-windows fields on 27 Sep, when the token was renewed), tags a
   workflow can trigger on, and the form as its source. Field ids are looked
   up by key at runtime and cached, so the fields may be recreated in GHL
   without touching this file. GHL's edge answers a bare client with
   Cloudflare 1010, hence the browser-shaped User-Agent. */

const GHL = 'https://services.leadconnectorhq.com';
const GHL_FIELDS: Record<string, string> = {
  about_label: 'contact.enquiry__about',
  topic_label: 'contact.enquiry__topic',
  /* "When suits" is a dropdown in GHL, but the API stores any string in it
     (checked 27 Sep 2026), so the workshop's sentence — "Tue 29 Sep, 4–5 pm
     or 5–6 pm (Sydney)" — reads there as-is beside the old forms' options. */
  timing_label: 'contact.enquiry__when_suits',
  /* /workshop: the machine list of the same windows ("2026-09-29 16:00-17:00;
     …", or "flexible"), for a workflow or calendar step later. Field created
     27 Sep 2026. Old forms put their slug here, harmlessly. */
  timing: 'contact.enquiry__call_windows',
  /* /workshop: which room they applied for ("Sunday 4 October · 1–2 pm").
     Field created 27 Sep 2026; the form also mirrors it into topic. */
  session_label: 'contact.enquiry__session',
  form_id: 'contact.enquiry__form',
  page_url: 'contact.enquiry__page',
  referrer: 'contact.enquiry__referrer',
  fbc: 'contact.meta_fbc',
  fbp: 'contact.meta_fbp',
};
let ghlFieldIds: { at: number; map: Record<string, string> } | null = null;

function ghlHeaders(env: Env): Record<string, string> {
  return {
    Authorization: `Bearer ${env.GHL_TOKEN}`,
    Version: '2021-07-28',
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (harrisonsaito.com.au lead function)',
  };
}

async function ghlFieldMap(env: Env): Promise<Record<string, string>> {
  if (ghlFieldIds && Date.now() - ghlFieldIds.at < 10 * 60 * 1000) return ghlFieldIds.map;
  const res = await fetch(`${GHL}/locations/${env.GHL_LOCATION_ID}/customFields?model=contact`, { headers: ghlHeaders(env) });
  if (!res.ok) throw new Error(`GHL customFields HTTP ${res.status}`);
  const data = (await res.json()) as { customFields?: Array<{ id: string; fieldKey: string }> };
  const map: Record<string, string> = {};
  for (const f of data.customFields ?? []) map[f.fieldKey] = f.id;
  ghlFieldIds = { at: Date.now(), map };
  return map;
}

/** "+61…" for GHL, from whatever an Australian typed. */
function e164(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('61')) return `+${digits}`;
  if (digits.startsWith('0')) return `+61${digits.slice(1)}`;
  return `+${digits}`;
}

async function sendToGHL(env: Env, body: Payload): Promise<boolean> {
  if (!env.GHL_TOKEN || !env.GHL_LOCATION_ID) return false;
  const ids = await ghlFieldMap(env);

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const parts = name.split(/\s+/).filter(Boolean);
  const customFields: Array<{ id: string; field_value: string }> = [];
  for (const [key, fieldKey] of Object.entries(GHL_FIELDS)) {
    const v = body[key];
    const id = ids[fieldKey];
    if (id && typeof v === 'string' && v) customFields.push({ id, field_value: v });
  }

  const formId = typeof body.form_id === 'string' ? body.form_id : 'website';
  const about = typeof body.about === 'string' && body.about ? body.about : 'other';
  const payload: Payload = {
    locationId: env.GHL_LOCATION_ID,
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
    email: typeof body.email === 'string' && body.email ? body.email : undefined,
    phone: typeof body.phone === 'string' && body.phone ? e164(body.phone) : undefined,
    source: `Website - ${formId}`,
    /* fy-<set> / fy-pick-<card>: which "Who This Is For" badge set the
       visitor saw, and which cards they tapped at the gate — up to six, comma
       separated (a protector's name, or the card's icon key; src/data/badges.ts). */
    tags: [
      'website',
      `enquiry-${about}`,
      `form-${formId}`,
      /* session-sat-3-oct / session-sun-4-oct: the room a workshop applicant chose */
      ...(typeof body.session === 'string' && /^[a-z0-9-]{2,24}$/.test(body.session) ? [`session-${body.session}`] : []),
      ...(typeof body.fy === 'string' && /^[a-z]{2,20}$/.test(body.fy) ? [`fy-${body.fy}`] : []),
      ...(typeof body.fy_pick === 'string'
        ? body.fy_pick
            .split(',')
            .slice(0, 6)
            .filter((k: string) => /^[a-z -]{2,24}$/i.test(k))
            .map((k: string) => `fy-pick-${k.toLowerCase().replace(/ /g, '-')}`)
        : []),
    ],
    customFields,
  };

  const res = await fetch(`${GHL}/contacts/upsert`, { method: 'POST', headers: ghlHeaders(env), body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(`GHL upsert HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return true;
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

/* ------------------------------------------------------- the notification ----
   What Harrison reads when someone reaches out. Dion, 29 Sep 2026: the GHL
   notification should map ALL the information and read logically, genuinely,
   concisely. So it is composed here, once, from the whole post, and every
   webhook call carries it finished:
     notify_kind    workshop-application | workshop-windows | application |
                    discovery-call | message | callback | enquiry
     notify_title   one line: the email subject
     notify_sms     the text: "Hey Harrison," + one line per form step + source
     notify_body    the same plus page, time received and what they were told
     notify_html    notify_body as small tables, for an email body
     notify_steps   just the step lines; lead_phone, came_from, recognised,
                    received_sydney: the pieces, for a layout built in GHL
   The GHL workflow's Internal Notification is then just those variables, and
   the Resend email (if a key is ever set) says the same thing. Six forms feed
   this; a workshop applicant posts twice — the application, then the call
   windows — so the first message says a second is coming. */

type Kind = 'workshop-application' | 'workshop-windows' | 'application' | 'discovery-call' | 'message' | 'callback' | 'enquiry';

/* The six "Who's this for?" cards on the home walk (src/data/identities.ts),
   as the line the visitor recognised. Kept here because the function cannot
   import from src/; if a card's words change there, change them here. */
const IDENTITY_LINES: Record<string, string> = {
  burnout: 'can’t switch off, even when there’s nothing left to do',
  regulation: 'one comment takes the whole day',
  ego: 'achieved a lot, struggles to feel satisfied by it',
  generational: 'carries what was never theirs to choose',
  unresolved: 'an anger underneath they cannot name',
  mask: 'says yes when they mean no',
};

/** Who the notification speaks to: it goes to Harrison (the email copies Dion). */
const GREETING = 'Hey Harrison,';

const s = (v: unknown): string => (typeof v === 'string' ? v.trim() : typeof v === 'number' ? String(v) : '');

/** 0412 345 678, from whatever was typed; anything that isn't an AU mobile is left as typed. */
function phoneForHumans(raw: string): string {
  const d = raw.replace(/\D/g, '');
  const local = d.startsWith('61') ? `0${d.slice(2)}` : d;
  if (/^04\d{8}$/.test(local)) return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
  if (/^0[2378]\d{8}$/.test(local)) return `${local.slice(0, 2)} ${local.slice(2, 6)} ${local.slice(6)}`;
  return raw.trim();
}

/** Where they came from, in words: the ad, the search, the site that linked, or nothing. */
function cameFrom(body: Payload): { from: string; page: string } {
  let url: URL | null = null;
  try { url = new URL(s(body.page_url)); } catch {}
  const q = url?.searchParams;
  const src = (q?.get('utm_source') ?? '').toLowerCase();
  const med = (q?.get('utm_medium') ?? '').toLowerCase();
  const camp = q?.get('utm_campaign') ?? '';
  const ad = q?.get('utm_content') ?? '';
  const paid = /paid|cpc|ppc|ads?$|paid_social|social_paid/.test(med);
  let from: string;
  if (q?.get('gclid') || q?.get('gbraid') || q?.get('wbraid') || (src === 'google' && paid)) from = 'Google ad';
  else if (/^(facebook|fb|instagram|ig|meta)$/.test(src)) from = paid || camp ? 'Meta ad' : 'Instagram / Facebook';
  else if (q?.get('fbclid')) from = 'Instagram / Facebook link';
  else if (src) from = med ? `${src} / ${med}` : src;
  else {
    let host = '';
    try { host = new URL(s(body.referrer)).hostname.replace(/^www\./, ''); } catch {}
    from = host && !host.endsWith('harrisonsaito.com.au') ? host : 'Direct (typed in or a saved link)';
  }
  if (camp) from += ` · campaign ${camp}`;
  if (ad) from += ` · ad ${ad}`;
  const page = url ? url.pathname || '/' : s(body.page_path) || '';
  return { from, page };
}

/** What they tapped before the form: the home walk's cards in their words, or an ad page's set. */
function recognised(body: Payload): string {
  const picks = s(body.fy_pick).split(',').map((p) => p.trim().toLowerCase()).filter(Boolean);
  if (!picks.length) return '';
  const lines = picks.map((p) => IDENTITY_LINES[p] ?? p.replace(/-/g, ' '));
  return lines.join('; ');
}

function kindOf(body: Payload): Kind {
  const form = s(body.form_id);
  if (form === 'workshop') return body.event_name === 'schedule' ? 'workshop-windows' : 'workshop-application';
  if (form === 'return-to-self-application' || form === 'lp-return-to-self') return 'application';
  if (form === 'discovery-chat') return 'discovery-call';
  if (form === 'general-contact') return 'message';
  if (form === 'callback') return 'callback';
  return 'enquiry';
}

const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function buildNotice(body: Payload, now = new Date()) {
  const kind = kindOf(body);
  const name = s(body.name) || 'No name given';
  const phone = s(body.phone) ? phoneForHumans(s(body.phone)) : '';
  const email = s(body.email);
  const about = s(body.about_label);
  const topic = s(body.topic_label);
  const when = s(body.timing_label);
  const room = s(body.session_label);
  const words = s(body.note).replace(/\s+/g, ' ');
  const picked = recognised(body);
  const { from, page } = cameFrom(body);
  const received = new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Sydney', weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
  }).format(now);

  /* Dion, 29 Sep 2026: "Hey Harrison," then one line per step of the form,
     in the order the visitor answered them. Per kind: the headline, those
     steps, and what the page told them would happen next — which is what
     Harrison now has to do. A step left blank reads "—" so the line is
     still there and he can see it was skipped. */
  const reachSteps: Array<[string, string]> = [['Name', name], ['Phone', phone], ['Email', email]];
  const askSteps: Array<[string, string]> = [['About', about], ['Wants to talk about', topic], ['When suits', when]];
  let head: string;
  let steps: Array<[string, string]>;
  let promise: string;
  switch (kind) {
    case 'workshop-application':
      head = 'Workshop application';
      steps = [['Session', room], ...reachSteps, ['Wants to understand', words ? `“${words}”` : '']];
      promise = 'They were told their seat is under review and you will reach out directly. They are picking call windows now; a second message follows if they do.';
      break;
    case 'workshop-windows':
      head = 'workshop call windows chosen';
      steps = [['Call them', when || 'no windows chosen'], ['Session', room], ['Name', name], ['Phone', phone]];
      promise = 'They were told you will call in one of these windows. Three seats a room; if theirs is full, they are first for the next.';
      break;
    case 'application':
      head = 'Return to Self application';
      steps = [...askSteps, ...reachSteps];
      promise = 'They were told you read it yourself and reply within two business days, usually with a call.';
      break;
    case 'discovery-call':
      head = 'Call request';
      steps = [...askSteps, ...reachSteps];
      promise = 'They were told you will come back with a couple of times, usually within a day.';
      break;
    case 'message':
      head = 'Message';
      steps = [...askSteps, ...reachSteps];
      promise = 'They were told you reply personally, usually within a day.';
      break;
    case 'callback':
      head = 'Callback request';
      steps = [['Name', name], ['Phone', phone]];
      promise = 'They left only a name and number, and expect a call back.';
      break;
    default:
      head = 'Enquiry';
      steps = [...askSteps, ...reachSteps, ['In their words', words]];
      promise = '';
  }
  steps = steps.map(([k, v]) => [k, v || '—'] as [string, string]);
  /* the windows are the same applicant coming back, not a second lead */
  const intro = kind === 'workshop-windows' ? `Update: ${head}` : `New lead: ${head}`;
  const title = `${intro} · ${name}`;

  /* after the steps: what they recognised on the walk, where they came from */
  const context: Array<[string, string]> = [
    ...(picked ? [['Recognised', picked] as [string, string]] : []),
    ['Came from', from],
  ];
  const extra: Array<[string, string]> = [['Page', page], ['Received', `${received} (Sydney)`]];
  const line = ([k, v]: [string, string]) => `${k}: ${v}`;

  const sms = [
    GREETING,
    intro,
    '',
    ...steps.map(line),
    '',
    ...context.map(line),
    ...(kind === 'workshop-application' ? ['Call windows to follow.'] : []),
  ].join('\n');

  const text = [
    GREETING,
    intro,
    '',
    ...steps.map(line),
    '',
    ...[...context, ...extra].map(line),
    ...(promise ? ['', promise] : []),
  ].join('\n');

  const tel = s(body.phone) ? e164(s(body.phone)) : '';
  const cell = ([k, v]: [string, string]) =>
    `<tr><td style="padding:6px 16px 6px 0;color:#8a8378;white-space:nowrap;vertical-align:top">${esc(k)}</td><td style="padding:6px 0;color:#1a1714">${
      k === 'Phone' && tel ? `<a href="tel:${tel}">${esc(v)}</a>` : k === 'Email' && email ? `<a href="mailto:${esc(email)}">${esc(v)}</a>` : esc(v)
    }</td></tr>`;
  const table = (rows: Array<[string, string]>) => `<table style="border-collapse:collapse;font-size:14px;margin:0 0 16px">${rows.map(cell).join('')}</table>`;
  const html = `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;color:#1a1714;font-size:14px">
  <p style="margin:0 0 4px">${esc(GREETING)}</p>
  <p style="margin:0 0 16px;font-size:18px">${esc(intro)}</p>
  ${table(steps)}
  ${table([...context, ...extra])}
  ${promise ? `<p style="margin:0;color:#5c564d">${esc(promise)}</p>` : ''}
</div>`;

  return {
    notify_kind: kind,
    notify_title: title,
    notify_sms: sms,
    notify_body: text,
    notify_html: html,
    /* the pieces, for anyone who would rather lay the message out in GHL */
    notify_steps: steps.map(line).join('\n'),
    lead_phone: phone,
    came_from: from,
    recognised: picked,
    received_sydney: `${received} (Sydney)`,
  };
}

async function sendToWebhook(env: Env, body: Payload): Promise<boolean> {
  if (!env.LEAD_WEBHOOK_URL) return false;
  const res = await fetch(env.LEAD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, ...buildNotice(body), received_at: new Date().toISOString() }),
  });
  if (!res.ok) throw new Error(`webhook HTTP ${res.status}`);
  return true;
}

async function sendEmail(env: Env, body: Payload): Promise<boolean> {
  if (!env.RESEND_API_KEY || !env.LEAD_NOTIFY_TO) return false;
  const notice = buildNotice(body);

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Website <leads@harrisonsaito.com.au>',
      /* "a@x, b@y" — Harrison and Dion, set 27 Sep 2026 */
      to: env.LEAD_NOTIFY_TO.split(/[,;\s]+/).filter(Boolean),
      reply_to: typeof body.email === 'string' && body.email ? body.email : undefined,
      subject: notice.notify_title,
      html: notice.notify_html,
      text: notice.notify_body,
    }),
  });
  if (!res.ok) throw new Error(`resend HTTP ${res.status}`);
  return true;
}

/** The env as configured, with the obvious spellings of the GHL pair accepted. */
function readEnv(): Env {
  const e = process.env;
  const pick = (...keys: string[]) => keys.map((k) => e[k]).find((v) => v && v.trim()) || undefined;
  return {
    ...(e as Env),
    GHL_TOKEN: pick('GHL_TOKEN', 'GHL_API_KEY', 'GHL_PRIVATE_TOKEN', 'GHL_PIT', 'GOHIGHLEVEL_TOKEN', 'HIGHLEVEL_TOKEN'),
    GHL_LOCATION_ID: pick('GHL_LOCATION_ID', 'GHL_LOCATION', 'GOHIGHLEVEL_LOCATION_ID', 'HIGHLEVEL_LOCATION_ID'),
  };
}

/** Names only — never values — of the variables that matter, so a test post can
    show what the deployment was actually given. */
function envSeen(): string[] {
  return Object.keys(process.env).filter((k) => /GHL|HIGHLEVEL|LEAD_|RESEND|META_|TEST_EVENT/i.test(k)).sort();
}

export async function POST(request: Request): Promise<Response> {
  const env = readEnv();
  let body: Payload;

  try {
    body = await request.json();
  } catch {
    return reply(400, { ok: false, error: 'Invalid JSON' });
  }

  // Honeypot — the client filters this, but never trust the client.
  if (typeof body.website === 'string' && body.website.trim()) return reply(200, { ok: true, delivered: true });

  // Email is optional on the site's forms (Dion, 27 Sep 2026): a phone is
  // enough to be called back, and GHL upserts on either. If an email is given
  // it has to be one; if not, the phone has to be real.
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const phoneDigits = typeof body.phone === 'string' ? body.phone.replace(/\D/g, '') : '';
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) {
    return reply(422, { ok: false, error: 'That email address does not look right' });
  }
  if (!email && phoneDigits.length < 8) {
    return reply(422, { ok: false, error: 'A phone number or an email is required' });
  }
  if (!email) delete body.email;

  // Integrations run in parallel and are individually non-fatal: a CRM outage
  // must never cost us the lead or show the visitor an error.
  const names = ['meta', 'ghl', 'webhook', 'email'];
  const results = await Promise.allSettled([
    sendToMeta(env, body, request),
    sendToGHL(env, body),
    sendToWebhook(env, body),
    sendEmail(env, body),
  ]);
  // What each integration did — "unconfigured", "ok", or its error — so a
  // test post from outside can see why a lead went nowhere without anyone
  // reading the function log. Never carries a secret.
  const integrations: Record<string, string> = {};
  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.error(names[i], 'failed:', r.reason);
      integrations[names[i]] = 'error: ' + String((r.reason && (r.reason as Error).message) || r.reason).slice(0, 160);
    } else integrations[names[i]] = r.value ? 'ok' : 'unconfigured';
  });
  const delivered = results.slice(1).some((r) => r.status === 'fulfilled' && r.value === true);

  // Always in the function log, in full, so nothing is ever lost to a missing
  // integration: Vercel → Project → Logs, filter "[lead]".
  console.log('[lead]', JSON.stringify({ ...body, received_at: new Date().toISOString(), delivered, integrations }));

  return reply(200, { ok: true, delivered, integrations, env_seen: envSeen() });
}

/** Anything other than POST gets a clear answer rather than a framework 404. */
export function GET(): Response {
  return reply(405, { ok: false, error: 'POST a JSON body to this endpoint' });
}
