/**
 * Text the team when a lead or a booking lands. Shared by api/lead.ts and
 * api/calendly.ts (the leading underscore stops Vercel serving it as a route).
 *
 * GHL can only send an SMS to a contact, so each person on the team is found
 * (or created) as a contact by phone, then messaged from the account's own AU
 * number. GHL refuses duplicate contacts, so the lookup comes first. Best
 * effort: a failure here is logged and never costs the lead.
 *
 * To add someone (Harrison, Danny), add a line to TEAM.
 */

declare const process: { env: Record<string, string | undefined> };

const GHL = 'https://services.leadconnectorhq.com';

const TEAM: { name: string; phone: string }[] = [
  { name: 'Dion', phone: '+61478029827' },
];

const head = (version: string): Record<string, string> => ({
  Authorization: `Bearer ${process.env.GHL_TOKEN}`,
  Version: version,
  Accept: 'application/json',
  'Content-Type': 'application/json',
  'User-Agent': 'Mozilla/5.0 (harrisonsaito.com.au alert)',
});

async function contactFor(person: { name: string; phone: string }): Promise<string> {
  const loc = process.env.GHL_LOCATION_ID as string;
  const found = await fetch(`${GHL}/contacts/search/duplicate?locationId=${loc}&number=${encodeURIComponent(person.phone)}`, {
    headers: head('2021-07-28'),
  });
  if (found.ok) {
    const id = ((await found.json()) as any)?.contact?.id;
    if (id) return id;
  }
  const up = await fetch(`${GHL}/contacts/upsert`, {
    method: 'POST',
    headers: head('2021-07-28'),
    body: JSON.stringify({ locationId: loc, firstName: person.name, lastName: '(team alert)', phone: person.phone, tags: ['internal-team'], source: 'Team alert' }),
  });
  if (!up.ok) throw new Error(`team contact HTTP ${up.status}`);
  const j = (await up.json()) as any;
  return j.contact?.id ?? j.id;
}

/** Returns true if at least one text was accepted by GHL. */
export async function textTeam(message: string): Promise<boolean> {
  if (!process.env.GHL_TOKEN || !process.env.GHL_LOCATION_ID) return false;
  const results = await Promise.allSettled(
    TEAM.map(async (p) => {
      const contactId = await contactFor(p);
      const res = await fetch(`${GHL}/conversations/messages`, {
        method: 'POST',
        headers: head('2021-04-15'),
        body: JSON.stringify({ type: 'SMS', contactId, message: message.slice(0, 600) }),
      });
      if (!res.ok) throw new Error(`SMS HTTP ${res.status}: ${(await res.text()).slice(0, 160)}`);
    }),
  );
  results.forEach((r) => { if (r.status === 'rejected') console.error('[alert] failed:', (r.reason as Error).message); });
  return results.some((r) => r.status === 'fulfilled');
}
