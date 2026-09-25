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
 * the walk. This one is recognition: the guide's "you may recognise yourself
 * here" list (docs/VOICE.md §12), one line to a card — nobody is told what is
 * wrong with them; they are shown something they already know.
 *
 * Provenance, the same rule the badges follow: `kind` says where a line came
 * from. `guide` is Dion's voice guide of 25 Sep; `new` is ours. Neither is
 * Harrison's until he says so.
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
  kind: 'guide' | 'new' | 'his' | 'site';
  source: string;
};

export const AUDIENCE_SECTION = {
  label: 'The Fit',
  title: 'Who <mark>Return to Self</mark> is for.',
  lede:
    'For people who know how to keep going. You may recognise yourself here — and each one is picked up by one of the three keys above.',
  /* the guide's central idea, §2 */
  foot: 'The goal is not perfection. The goal is having more choice.',
  cta: { label: 'Start the conversation', href: '/book' },
};

const GUIDE = 'Voice guide, Dion, 25 Sep 2026 — §12 "Who it is for".';

export const AUDIENCE: AudienceCard[] = [
  {
    icon: 'trophy',
    text: 'You have achieved a lot,',
    emphasis: 'and struggle to feel satisfied by it.',
    key: 'Separate',
    weeks: 'Weeks 1–4',
    thread: 'The hero — "Break the habits you never chose" — and his own line in the intro: the tools that made him succeed were the ones that kept him in a life that was not his.',
    kind: 'guide',
    source: GUIDE,
  },
  {
    icon: 'mask',
    text: 'You know how to perform, handle pressure and keep moving,',
    emphasis: 'and less about what happens inside you when it gets hard.',
    key: 'Separate',
    weeks: 'Weeks 1–4',
    thread: 'The first key — see the pattern for what it is — and the first pill on the wall, "Took the mask off".',
    kind: 'guide',
    source: GUIDE + ' §4, "You learn how to perform… but very few of us are taught how to understand what happens inside us."',
  },
  {
    icon: 'bolt',
    text: 'You react strongly in certain relationships',
    emphasis: 'and cannot always explain why.',
    key: 'Return',
    weeks: 'Weeks 5–8',
    thread: 'The second key — where it started, your father, your family, your culture — and the patterns carousel at the foot of the page.',
    kind: 'guide',
    source: GUIDE,
  },
  {
    icon: 'hands',
    text: 'You want stronger relationships',
    emphasis: 'without losing yourself inside them.',
    key: 'Return',
    weeks: 'Weeks 5–8',
    thread: 'The wall, where people say the ones around them felt the difference.',
    kind: 'guide',
    source: GUIDE,
  },
  {
    icon: 'shield',
    text: 'You are disciplined in work, training or responsibility,',
    emphasis: 'and less sure what to do with what you feel.',
    key: 'Integrate',
    weeks: 'Weeks 9–12',
    thread: 'The third key — the discipline stays, the strength stays, and now they answer to you — and the story: the endurance to push past feelings, and what it cost.',
    kind: 'guide',
    source: GUIDE,
  },
  {
    icon: 'mirror',
    /* "You feel disconnected…" set "disconnected" alone on a line in a
       375px card, and so did "Disconnected from…" — a 12-letter word has no
       partner that fits beside it at that width. The same thought, in words
       that pair. */
    text: 'A long way from the person you became,',
    emphasis: 'and wanting to know what actually matters to you.',
    key: 'Integrate',
    weeks: 'Weeks 9–12',
    thread: 'The close, and the pills above the wall — present, less reactive, the mask off, the courage for a hard conversation.',
    kind: 'guide',
    source: GUIDE + ' §13, "Return to what actually matters."',
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
export const newLines = () => AUDIENCE.filter((c) => c.kind === 'new' || c.kind === 'guide');
