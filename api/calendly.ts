/**
 * Calendly -> GoHighLevel. Vercel Function (Web-standard handler).
 *
 * Dion, 12 Nov 2026: the free discovery call is booked on Harrison's own
 * Calendly (30-minute discovery call event). Whatever they book must land in GHL as a contact
 * and an opportunity, with the booking written in the notes: name, phone,
 * email, when, and which "resonates most" line they tapped on /rts-coaching.
 *
 * Calendly posts here (a webhook subscription made once through its API, see
 * the memory note) on `invitee.created` and `invitee.canceled`. The URL carries
 * a shared secret, `?s=`, held in CALENDLY_HOOK_SECRET, because the webhook
 * signing key is a second moving part and this endpoint can only ever write
 * one contact, one opportunity and one note.
 *
 *   invitee.created   upsert contact (+ tags), open or move the opportunity to
 *                     Sales Pipeline / Booking Confirmed, add the note
 *   invitee.canceled  note it; if it was a plain cancel (not a reschedule) the
 *                     opportunity goes back to New Leads. A reschedule is a
 *                     cancel then a create: the create puts it right again.
 *
 * Environment: GHL_TOKEN, GHL_LOCATION_ID (shared with api/lead.ts),
 * CALENDLY_HOOK_SECRET.
 */

declare const process: { env: Record<string, string | undefined> };

/* ---- text the team (inlined: a relative import crashes under "type":"module") ---- */
const ALERT_GHL = 'https://services.leadconnectorhq.com';

const ALERT_TEAM: { name: string; phone: string }[] = [
  { name: 'Dion', phone: '+61478029827' },
  { name: 'Harrison', phone: '+61417884131' },
  { name: 'Danny', phone: '+61420806960' },
];

const alertHead = (version: string): Record<string, string> => ({
  Authorization: `Bearer ${process.env.GHL_TOKEN}`,
  Version: version,
  Accept: 'application/json',
  'Content-Type': 'application/json',
  'User-Agent': 'Mozilla/5.0 (harrisonsaito.com.au alert)',
});

async function alertContactFor(person: { name: string; phone: string }): Promise<string> {
  const loc = process.env.GHL_LOCATION_ID as string;
  const found = await fetch(`${ALERT_GHL}/contacts/search/duplicate?locationId=${loc}&number=${encodeURIComponent(person.phone)}`, {
    headers: alertHead('2021-07-28'),
  });
  if (found.ok) {
    const id = ((await found.json()) as any)?.contact?.id;
    if (id) return id;
  }
  const up = await fetch(`${ALERT_GHL}/contacts/upsert`, {
    method: 'POST',
    headers: alertHead('2021-07-28'),
    body: JSON.stringify({ locationId: loc, firstName: person.name, lastName: '(team alert)', phone: person.phone, tags: ['internal-team'], source: 'Team alert' }),
  });
  if (!up.ok) throw new Error(`team contact HTTP ${up.status}`);
  const j = (await up.json()) as any;
  return j.contact?.id ?? j.id;
}

/** Returns true if at least one text was accepted by GHL. */
async function textTeam(message: string, only?: string[]): Promise<boolean> {
  if (!process.env.GHL_TOKEN || !process.env.GHL_LOCATION_ID) return false;
  const results = await Promise.allSettled(
    ALERT_TEAM.filter((p) => !only || only.includes(p.name)).map(async (p) => {
      const contactId = await alertContactFor(p);
      const res = await fetch(`${ALERT_GHL}/conversations/messages`, {
        method: 'POST',
        headers: alertHead('2021-04-15'),
        body: JSON.stringify({ type: 'SMS', contactId, message: message.slice(0, 600) }),
      });
      if (!res.ok) throw new Error(`SMS HTTP ${res.status}: ${(await res.text()).slice(0, 160)}`);
    }),
  );
  results.forEach((r) => { if (r.status === 'rejected') console.error('[alert] failed:', (r.reason as Error).message); });
  return results.some((r) => r.status === 'fulfilled');
}


type J = Record<string, any>;

const GHL = 'https://services.leadconnectorhq.com';
const PIPELINE = 'Sales Pipeline';
const STAGE_BOOKED = 'Booking Confirmed';
const STAGE_NEW = 'New Leads';

/* The six lines of the Iteration 1 Meta form, which /rts-coaching step 1 reuses
   (src/data/workshop.ts FUNNEL.options). Keyed by the slug that rides in as
   utm_content; the function cannot import from src/, so change both together. */
const RESONATES: Record<string, string> = {
  disconnected: 'I feel disconnected from myself or what I actually want',
  patterns: 'I keep repeating the same patterns in my relationships',
  reacting: 'I keep reacting in ways I later regret',
  'switch-off': 'I struggle to switch off or slow down',
  'not-enough': 'I keep achieving, but it still doesn’t feel like enough',
  change: 'I know something needs to change, but I’m not sure what',
};

/* 14 Nov 2026: step 1 of /rts-coaching is now the six emotions (src/data/workshop.ts
   FEEL.cards); the slug rides in as utm_term. The six lines above stay so older bookings
   still read. Change both together. */
const FEELINGS: Record<string, string> = {
  anger: 'Anger: “I’m tired of not being heard.”',
  fear: 'Fear: “What if they reject me?”',
  shame: 'Shame: “Maybe I’m not good enough.”',
  guilt: 'Guilt: “I feel bad putting myself first.”',
  sadness: 'Sadness: “I wish things had been different.”',
  loneliness: 'Loneliness: “I don’t feel truly understood.”',
};

const reply = (status: number, body: J) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

const headers = (): Record<string, string> => ({
  Authorization: `Bearer ${process.env.GHL_TOKEN}`,
  Version: '2021-07-28',
  Accept: 'application/json',
  'Content-Type': 'application/json',
  'User-Agent': 'Mozilla/5.0 (harrisonsaito.com.au calendly function)',
});

async function ghl(method: string, path: string, body?: J): Promise<J> {
  const res = await fetch(`${GHL}${path}`, { method, headers: headers(), body: body ? JSON.stringify(body) : undefined });
  const text = await res.text();
  if (!res.ok) throw new Error(`GHL ${method} ${path.split('?')[0]} HTTP ${res.status}: ${text.slice(0, 200)}`);
  return text ? JSON.parse(text) : {};
}

/** "+61…" for GHL, from whatever Calendly was given. */
function e164(raw: string): string {
  const d = raw.replace(/\D/g, '');
  if (!d) return '';
  if (raw.trim().startsWith('+')) return `+${d}`;
  if (d.startsWith('61')) return `+${d}`;
  if (d.startsWith('0')) return `+61${d.slice(1)}`;
  return `+${d}`;
}

/** 0412 345 678 for people to read; anything else as given. */
function human(raw: string): string {
  const d = raw.replace(/\D/g, '');
  const local = d.startsWith('61') ? `0${d.slice(2)}` : d;
  return /^04\d{8}$/.test(local) ? `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}` : raw.trim();
}

const sydney = (iso: string) =>
  new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Sydney', weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
  }).format(new Date(iso)).replace(',', '') + ' (Sydney)';

let stages: { at: number; pipelineId: string; byName: Record<string, string> } | null = null;
async function pipeline(): Promise<{ pipelineId: string; byName: Record<string, string> }> {
  if (stages && Date.now() - stages.at < 10 * 60 * 1000) return stages;
  const d = await ghl('GET', `/opportunities/pipelines?locationId=${process.env.GHL_LOCATION_ID}`);
  const p = (d.pipelines ?? []).find((x: J) => x.name === PIPELINE);
  if (!p) throw new Error(`pipeline "${PIPELINE}" not found`);
  const byName: Record<string, string> = {};
  for (const s of p.stages ?? []) byName[s.name] = s.id;
  stages = { at: Date.now(), pipelineId: p.id, byName };
  return stages;
}

export async function POST(request: Request): Promise<Response> {
  const env = process.env;
  if (!env.GHL_TOKEN || !env.GHL_LOCATION_ID || !env.CALENDLY_HOOK_SECRET) return reply(503, { ok: false, error: 'not configured' });
  if ((new URL(request.url).searchParams.get('s') ?? '').trim() !== env.CALENDLY_HOOK_SECRET.trim()) return reply(401, { ok: false, error: 'no' });

  let hook: J;
  try { hook = await request.json(); } catch { return reply(400, { ok: false, error: 'Invalid JSON' }); }
  const event = String(hook.event ?? '');
  const p: J = hook.payload ?? {};
  if (event !== 'invitee.created' && event !== 'invitee.canceled') return reply(200, { ok: true, ignored: event });

  const email = String(p.email ?? '').trim();
  const name = String(p.name ?? '').trim() || [p.first_name, p.last_name].filter(Boolean).join(' ').trim();
  const qa: J[] = Array.isArray(p.questions_and_answers) ? p.questions_and_answers : [];
  const phoneAnswer = qa.find((q) => /phone|mobile|number/i.test(String(q.question ?? '')))?.answer;
  const phoneRaw = String(p.text_reminder_number || phoneAnswer || '').trim();
  const start = String(p.scheduled_event?.start_time ?? '');
  const when = start ? sydney(start) : 'time not given';
  /* utm_term arrives as "<emotion>~<ad set>": the funnel puts the emotion first and the ad's own
     utm_term ({{adset.name}} in the ad's URL parameters) after the tilde. Older bookings are just the pick. */
  const [termPick, ...termRest] = String(p.tracking?.utm_term ?? '').split('~');
  const pick = termPick.trim().toLowerCase();
  const adSet = termRest.join('~').trim();
  const ad = String(p.tracking?.utm_content ?? '').trim();
  const campaign = String(p.tracking?.utm_campaign ?? '').trim();
  const feeling = FEELINGS[pick] ?? '';
  const resonates = feeling ? '' : RESONATES[pick] ?? (pick ? pick.replace(/-/g, ' ') : '');
  const said = qa.filter((q) => q.answer && !/phone|mobile|number/i.test(String(q.question ?? '')))
    .map((q) => `${String(q.question).trim()}: ${String(q.answer).replace(/\s+/g, ' ').trim()}`);
  const parts = name.split(/\s+/).filter(Boolean);

  /* ---- contact: upsert on email / phone, tags a workflow can use ---- */
  const upsert = await ghl('POST', '/contacts/upsert', {
    locationId: env.GHL_LOCATION_ID,
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
    email: email || undefined,
    phone: phoneRaw ? e164(phoneRaw) : undefined,
    source: 'Calendly - free discovery call',
    tags: ['calendly-booking', 'form-discovery', ...(pick && /^[a-z-]{2,24}$/.test(pick) ? [`fy-pick-${pick}`] : [])],
  });
  const contactId: string = upsert.contact?.id ?? upsert.id;
  if (!contactId) throw new Error('GHL upsert returned no contact id');

  /* ---- opportunity: reuse the contact's open one in this pipeline, else open one ---- */
  const { pipelineId, byName } = await pipeline();
  const found = await ghl(
    'GET',
    `/opportunities/search?location_id=${env.GHL_LOCATION_ID}&pipeline_id=${pipelineId}&contact_id=${contactId}&status=open`,
  );
  const existing: J | undefined = (found.opportunities ?? [])[0];
  const canceled = event === 'invitee.canceled';
  const rescheduled = canceled && p.rescheduled === true;
  const stageId = canceled ? byName[STAGE_NEW] : byName[STAGE_BOOKED];
  if (!stageId) throw new Error('stage not found');
  let oppId = existing?.id as string | undefined;
  if (existing) {
    if (!rescheduled) await ghl('PUT', `/opportunities/${existing.id}`, { pipelineId, pipelineStageId: stageId, status: 'open' });
  } else if (!canceled) {
    const created = await ghl('POST', '/opportunities/', {
      pipelineId,
      locationId: env.GHL_LOCATION_ID,
      name: `Free discovery call - ${name || email}`,
      pipelineStageId: stageId,
      status: 'open',
      contactId,
      source: 'Calendly - free discovery call',
    });
    oppId = created.opportunity?.id ?? created.id;
  }

  /* ---- the note Harrison reads ---- */
  const lines = canceled
    ? [rescheduled ? 'Free discovery call: RESCHEDULED (a new time follows)' : 'Free discovery call: CANCELLED', `Was: ${when}`]
    : ['Free discovery call: BOOKED'];
  lines.push(
    `Name: ${name || 'not given'}`,
    `Phone: ${phoneRaw ? human(phoneRaw) : 'not given'}`,
    `Email: ${email || 'not given'}`,
  );
  if (!canceled) lines.push(`Booked: ${when}`);
  if (feeling) lines.push(`Feeling to work on: ${feeling}`);
  else if (resonates) lines.push(`Resonates most: "${resonates}"`);
  const cameFrom = ad || adSet || campaign
    ? `Meta ad${campaign ? ` · campaign ${campaign}` : ''}${adSet ? ` · ad set ${adSet}` : ''}${ad ? ` · ad ${ad}` : ''}`
    : 'Direct (no ad tracking)';
  lines.push(`Came from: ${cameFrom}`);
  lines.push(...said, 'Source: /rts-coaching free discovery call funnel (Calendly, 30 minutes)');
  await ghl('POST', `/contacts/${contactId}/notes`, { body: lines.join('\n') });

  /* ---- text the team: a booking is the thing Harrison is waiting for ---- */
  if (!rescheduled) {
    /* one text, in the layout of the form-lead notification ("Hey Harrison," then a line per input),
       so every alert reads the same: Dion, 14 Nov. */
    const sms = [
      'Hey Harrison,',
      canceled ? 'Call cancelled: free discovery call' : 'New call booked: free discovery call',
      '',
      `Name: ${name || '—'}`,
      `Phone: ${phoneRaw ? human(phoneRaw) : '—'}`,
      `Email: ${email || '—'}`,
      canceled ? `Was: ${when}` : `Booked: ${when}`,
      ...(feeling ? [`Feeling to work on: ${feeling}`] : resonates ? [`Resonates most: "${resonates}"`] : []),
      '',
      `Came from: ${cameFrom}`,
    ].join('\n');
    try { await textTeam(sms); } catch (e) { console.error('[calendly] alert failed', (e as Error).message); }
  }

  console.log('[calendly]', JSON.stringify({ event, contactId, oppId, when, pick }));
  return reply(200, { ok: true, event, contactId, opportunityId: oppId ?? null });
}

export function GET(): Response {
  return reply(405, { ok: false, error: 'POST only' });
}
