/**
 * "Who's this for?" — the section under the walk on the home page.
 *
 * Dion, 29 Sep 2026: "change this to — who's this for? (so this is below the
 * hero) and it's those identities / ICPs: things relating to burnout,
 * regulation, identity through ego and generational trauma, unresolved
 * emotions etc." The six doors went mid-house (the walk's pause); this is
 * what stands where they stood: six identities in the same panel, one line
 * each, a gold word naming the pattern.
 *
 * Recognition, not diagnosis (docs/VOICE.md): nobody is told what is wrong
 * with them. Every line is one the site already carries — the badge sets
 * (badges.ts) or the voice guide's "who it is for" list (audience.ts) — and
 * `kind` says whose it is, as those files do. The one marked `new` is ours
 * and needs Harrison's OK. Where an identity has its own landing page
 * (/lp/<set>) the card goes there, so the lead form tags the enquiry with it;
 * the rest go to the twelve weeks, or to the workshop, where the one-hour
 * practice is exactly that identity's answer.
 */
export type Identity = {
  /** a mark from lib/morel-icons.ts */
  icon: string;
  /** the pattern, in a word or two — the gold tag */
  tag: string;
  text: string;
  emphasis: string;
  href: string;
  kind: 'his' | 'site' | 'team' | 'guide' | 'new';
  source: string;
};

export const IDENTITIES_SECTION = {
  label: 'Who this is for',
  title: 'Who’s this <mark>for?</mark>',
  /* the badge sets' own lede (badges.ts, control / core) */
  lede: 'If more than one of these lands, you are in the right place. They tend to travel together.',
  foot: 'Wherever you recognised yourself, the first step is the same conversation.',
  cta: { label: 'Start the conversation', href: '/book' },
};

export const IDENTITIES: Identity[] = [
  {
    icon: 'switch',
    tag: 'Burnout',
    text: 'You can’t switch off,',
    emphasis: 'even when there’s nothing left to do.',
    href: '/lp/burnout',
    kind: 'his',
    source: 'badges.ts (burnout) — paraphrased from his note: “can’t be present as noise in head trying to think of what to do next”',
  },
  {
    icon: 'comment',
    tag: 'Regulation',
    text: 'One comment',
    emphasis: 'takes your whole day.',
    href: '/workshop',
    kind: 'his',
    source: 'badges.ts (core, burnout) — Harrison, consultation cut 03: “Why can one comment ruin your day”',
  },
  {
    icon: 'trophy',
    tag: 'Identity through ego',
    text: 'You have achieved a lot,',
    emphasis: 'and struggle to feel satisfied by it.',
    href: '/lp/worth',
    kind: 'guide',
    source: 'audience.ts — voice guide, Dion, 25 Sep 2026, §12',
  },
  {
    icon: 'family',
    tag: 'Generational trauma',
    text: 'Some of what you carry',
    emphasis: 'was never yours to choose.',
    href: '/return-to-self',
    kind: 'new',
    source: 'Ours, 29 Sep 2026 — after the hero line “Break the habits you never chose” (morel-source.ts HERO) and the story: “he gave me people-pleasing, suppressed rage…”. Needs Harrison’s OK.',
  },
  {
    icon: 'ember',
    tag: 'Unresolved emotions',
    text: 'There is an anger underneath',
    emphasis: 'you cannot name.',
    href: '/return-to-self',
    kind: 'site',
    source: 'badges.ts (control) — live site',
  },
  {
    icon: 'saidmeant',
    tag: 'The mask',
    text: 'You say yes when you mean no,',
    emphasis: 'then call it keeping the peace.',
    href: '/lp/core',
    kind: 'site',
    source: 'badges.ts (control, core) — live site',
  },
];

/** The lines that are ours, for the sign-off list. */
export const newIdentityLines = () => IDENTITIES.filter((i) => i.kind === 'new').map((i) => `${i.text} ${i.emphasis}`);
