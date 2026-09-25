/**
 * What people walked away with — the pills above the wall.
 *
 * Dion, 25 Sep 2026: "all those emotional states you can gain… put simply as
 * pills and icons, like badges, so it's super easy to read how this can help
 * them and what the people who worked with Harrison walked away with."
 *
 * A pill is a LABEL, not a quotation — it is not in quote marks and it is not
 * hung on a face. But every one of them has to have come from somewhere, so
 * each carries the line it was drawn from and whose it is:
 *
 *   `from`  a name in TESTIMONIALS (written to him) or INTERVIEWS (said on
 *           camera, 9 Sep) — the check at the foot of this file fails the
 *           build if the name is on neither list
 *   `said`  their words, verbatim, containing the thing the label names; the
 *           check fails the build if that string is not in what they wrote or
 *           said, so no pill can drift into a promise nobody made
 *
 * Icons are the site's own line marks (lib/morel-icons.ts), the same set the
 * "who this is for" panel draws.
 */
import { TESTIMONIALS } from './site';
import { INTERVIEWS } from './interviews';

export type Gain = { icon: string; label: string; from: string; said: string };

export const GAINS: Gain[] = [
  { icon: 'mask', label: 'Took the mask off', from: 'Matt Halpin', said: 'Harrison helped me remove the mask' },
  { icon: 'pause', label: 'Calmer under pressure', from: 'John', said: 'a lot more calmer as a person' },
  { icon: 'eye', label: 'Present in the room', from: 'John', said: 'The ability to hone in and be present' },
  { icon: 'bolt', label: 'Less reactive', from: 'Andrew', said: 'Not being so reactive' },
  { icon: 'level', label: 'More decisive', from: 'Harshil Dave', said: 'be decisive' },
  { icon: 'battery', label: 'Deliberate with my energy', from: 'John', said: 'be more deliberate and choose how I want to interact' },
  { icon: 'shield', label: 'Confidence in myself', from: 'Meg Rolfe', said: 'I had developed a confidence within myself' },
  { icon: 'ember', label: 'Happier, day to day', from: 'Andrew', said: 'makes me happier, makes me calmer' },
  { icon: 'stairs', label: 'Able to live it fully', from: 'Shoaland Griffiths', said: 'you have taught me to experience life fully' },
  { icon: 'summit', label: 'Steady when it does not go my way', from: 'James', said: 'not let it disrupt you or upset you' },
];

/* ---- every pill traces back to something somebody actually said ---- */
const flat = (s: string) => s.toLowerCase().replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim();
for (const g of GAINS) {
  const written = TESTIMONIALS.find((x) => x.name === g.from);
  const filmed = INTERVIEWS.find((x) => x.name === g.from);
  if (!written && !filmed) throw new Error(`gains.ts: nothing on record from "${g.from}"`);
  const body = flat(written ? written.quote : filmed!.said.join(' … '));
  if (!body.includes(flat(g.said))) throw new Error(`gains.ts: "${g.said}" is not in what ${g.from} wrote or said`);
}
