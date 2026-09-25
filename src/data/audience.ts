/**
 * Who Return to Self is for — the panel under the twelve weeks.
 *
 * Dion, 25 Sep 2026: a "who this is for" block directly below the twelve-week
 * section, built on the layout he sent (icon, one line, centred, six squares),
 * in our palette and our voice, "with a lot of through lines".
 *
 * The through line is literal. Every card names the key that picks it up —
 * Separate, Return, Integrate — so the panel reads as the answer to the
 * section directly above it rather than a second list of symptoms. Two cards
 * to each key, in order, so a scan down the grid walks the twelve weeks.
 *
 * It is NOT the hero's beat. That panel is the diagnosis (badges.ts: what is
 * running you, one comment ruining a day, guilt at doing nothing) and it gates
 * the walk. This one is recognition: what you have built, what it costs, and
 * what you want instead. Nothing here repeats a line from the beat set.
 *
 * Provenance, the same rule the badges follow: `kind` says where a line came
 * from, and every line written for this panel is `new` — OURS, written to
 * Dion's brief and to the positioning, not quoted from Harrison. They need his
 * OK before they are treated as his words.
 */
export type Key = 'Separate' | 'Return' | 'Integrate';

export type AudienceCard = {
  /** a mark from lib/morel-icons.ts */
  icon: string;
  /** the lead-in, in the site's register */
  text: string;
  /** the gold half — the turn in the sentence */
  emphasis: string;
  /** the key that picks this one up, and when */
  key: Key;
  weeks: string;
  /** what else on the page this card threads to, for whoever edits it next */
  thread: string;
  kind: 'new' | 'his' | 'site';
  source: string;
};

export const AUDIENCE_SECTION = {
  label: 'The Fit',
  title: 'Who <mark>Return to Self</mark> is for.',
  lede:
    'For the person who has already done it the hard way. You do not need more push — push is how you got here, and lately it is what it costs. If two or three of these land, these are your twelve weeks, and each one is picked up by one of the three keys above.',
  foot:
    'None of it asks you to be broken. It asks you to stop for long enough to feel what you have been pushing past.',
  cta: { label: 'Start the conversation', href: '/book' },
};

export const AUDIENCE: AudienceCard[] = [
  {
    icon: 'trophy',
    text: 'You have done everything you said you would.',
    emphasis: 'It still does not feel like yours.',
    key: 'Separate',
    weeks: 'Weeks 1–4',
    thread: 'The hero — "Break the habits you never chose" — and his own line in the intro: the tools that made him succeed were the ones that kept him in a life that was not his.',
    kind: 'new',
    source: 'Dion, 25 Sep 2026, written to the reference layout ("achieved traditional success, but want to feel deeply fulfilled and alive") in the site\'s voice.',
  },
  {
    icon: 'mask',
    text: 'You keep saying you have got it handled,',
    emphasis: 'and the same pattern comes back anyway.',
    key: 'Separate',
    weeks: 'Weeks 1–4',
    thread: 'The patterns carousel at the foot of the page — "Which one is running you?" — and the first pill on the wall, "Took the mask off".',
    kind: 'new',
    source: 'Dion, 25 Sep 2026, written to the reference layout ("tired of pretending you\'ve got it handled while repeating the same old patterns").',
  },
  {
    icon: 'echo',
    text: 'Something wants your attention all day,',
    emphasis: 'and you cannot hear yourself over it.',
    key: 'Return',
    weeks: 'Weeks 5–8',
    thread: 'The lede of the twelve weeks: the world has never been louder, and the more of your attention you hand over the harder it is to hear what is actually yours.',
    kind: 'new',
    source: 'Dion\'s voice brief, 25 Sep 2026: the overstimulating world, the distraction hijacking the dopamine system, and Return to Self as the pause that regulates it.',
  },
  {
    icon: 'hands',
    text: 'You want to be closer to the people you love,',
    emphasis: 'and steadier in your own body.',
    key: 'Return',
    weeks: 'Weeks 5–8',
    thread: 'The second key — where it started, trained in the body, not in theory — and the wall, where people say the ones around them felt the difference.',
    kind: 'new',
    source: 'Dion, 25 Sep 2026, written to the reference layout ("deeper intimacy, greater health, emotional resilience").',
  },
  {
    icon: 'scale',
    text: 'You lead, build, or create for a living.',
    emphasis: 'Now you want it to line up with you.',
    key: 'Integrate',
    weeks: 'Weeks 9–12',
    thread: 'The positioning: achieved a great deal and still disconnected from it. The third key is where the discipline and the strength stay, and start answering to you.',
    kind: 'new',
    source: 'Dion, 25 Sep 2026, written to the reference layout ("a leader, entrepreneur or creator who feels out of alignment internally").',
  },
  {
    icon: 'mirror',
    text: 'You are ready to be seen as all of it,',
    emphasis: 'not only the part that performs.',
    key: 'Integrate',
    weeks: 'Weeks 9–12',
    thread: 'The close, and the pills above the wall — present, less reactive, the mask off, the courage for a hard conversation.',
    kind: 'new',
    source: 'Dion, 25 Sep 2026, written to the reference layout ("ready to lead from peace, not pressure, and to be seen in all of who you are").',
  },
];

/* The keys these cards hand off to are the ones in the section above (the
   PHASES in morel-source.ts). If a key is ever renamed there, this throws
   rather than leaving a card pointing at a stage that no longer exists. */
import { PHASES } from './morel-source';
const KEYS = new Set(PHASES.map((p) => p.name));
for (const c of AUDIENCE) {
  if (!KEYS.has(c.key)) throw new Error(`audience.ts: "${c.key}" is not one of the three keys`);
}

/** Lines written for this panel, not quoted — they need Harrison's OK. */
export const newLines = () => AUDIENCE.filter((c) => c.kind === 'new');
