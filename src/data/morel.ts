/**
 * The harrison-saito-morel template's copy, mapped onto this site.
 *
 * morel-source.ts is a verbatim copy of the template's data (see
 * scripts/morel/sync.mjs). Its links point at the template's own routes and
 * its logos at files that live under versioned names here, so everything the
 * home page uses is re-exported through `local()`, which rewrites both. The
 * words are untouched.
 */
import * as S from './morel-source';
import { LINKS } from './morel-source';

/** Template route → this site's page for the same thing. */
const ROUTES: Record<string, string> = {
  '/story': '/about',
  '/coaching': '/mens-coaching',
  '/return-to-self': '/mens-coaching',
  '/resources': '/media',
  /* /workshops is ported as its own page (src/pages/workshops.astro); /book,
     /privacy, /terms and /#faq exist here under the same paths. */
};

/** Button words. Not "Book a discovery chat" (Dion, 18 Sep: sell without
    selling), and not "Let me walk with you" either (19 Sep: too close to the
    reference, too spiritual). Firm, plain, and it leaves him room: the ask is
    a conversation. */
const LABELS: Record<string, string> = {
  'Book a discovery chat': 'Start the conversation',
  'Start the training': 'Break the cycle',
  'Book when you’re ready': 'Start when you’re ready',
};

/** Template asset → the versioned copy in public/img (immutable cache). */
const ASSETS: Record<string, string> = {
  '/img/logo-sbs-world-news.svg': '/img/mo/logo-sbs-world-news-v1.svg',
  '/img/logo-sbs.svg': '/img/mo/logo-sbs-v1.svg',
  '/img/mark-shinbukan-dark.png': '/img/mo/mark-shinbukan-dark-v1.webp',
  '/img/mark-seizanji-dark.png': '/img/mo/mark-seizanji-dark-v1.webp',
  '/img/logo-dark-512.png': '/img/logo-dark-512.webp',
  '/img/logo-light-512.png': '/img/logo-light-512.webp',
  /* Dion, 18 Sep: the SBS World News picture is Harrison in his gi, from the
     broadcast itself (its lower third names him "Shinbukan karate teacher"),
     not the group shot. */
  '/img/sbs-group.webp': '/img/sbs-karate-v1.webp',
};

/* Open to all (Dion, 25 Sep): the template's copy was written to men, and the
   site is not. These run over every string that comes through `local()`, so a
   re-sync of the template cannot quietly put the old framing back. Longest
   first — the short ones would otherwise land inside them. His own words are
   not in here: a quote stays as it was said. */
const OPEN: [string, string][] = [
  ['It is one man, a dojo, and twelve weeks', 'It is one teacher, a dojo, and twelve weeks'],
  ['a five-year-old still frozen inside a grown man.', 'a five-year-old still frozen inside you.'],
  ['Men who want someone else to do the work, men who book the call', 'Anyone who wants someone else to do the work, anyone who books the call'],
  ['A structured programme for men who are done performing.', 'A structured programme for anyone done performing.'],
  ['One-to-one training for men who built the life', 'One-to-one training for anyone who built the life'],
  ['Twelve weeks, one to one, for a small number of men at a time.', 'Twelve weeks, one to one, for a small number of people at a time.'],
  ['How is this different from a men’s group or a retreat?', 'How is this different from a group programme or a retreat?'],
  ['Some men book this call to be talked out of it.', 'Some people book this call to be talked out of it.'],
  ['The men I work with', 'The people I work with'],
  ['Most men who come to me', 'Most people who come to me'],
  ['Most men who come are functioning well', 'Most people who come are functioning well'],
  ['Plenty of men arrive having never trained.', 'Plenty of people arrive having never trained.'],
  ['Some men want the foundations first', 'Some people want the foundations first'],
  ['help men stop performing', 'help people stop performing'],
  ['Years coaching men in Chatswood', 'Years coaching in Chatswood'],
  ['Men’s coaching with Harrison Saito', 'Coaching with Harrison Saito'],
  ['Harrison Saito · Men’s coaching', 'Harrison Saito · Coaching'],
];

function local<T>(value: T): T {
  if (typeof value === 'string') {
    const mapped = ROUTES[value] ?? ASSETS[value] ?? LABELS[value];
    if (mapped !== undefined) return (mapped as unknown) as T;
    for (const [from, to] of OPEN) if (value.includes(from)) value = value.split(from).join(to) as unknown as typeof value;
    /* "program", not "programme" (Dion, 22 Sep) — in the words only: a path or a
       file name never contains it. */
    const worded = /^[/#]|^https?:|^mailto:/.test(value) ? value : value.replace(/rogrammes\b/g, 'rograms').replace(/rogramme\b/g, 'rogram');
    return (worded as unknown) as T;
  }
  if (Array.isArray(value)) return (value.map(local) as unknown) as T;
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = local(v);
    return out as T;
  }
  return value;
}

export const asset = (path: string) => ASSETS[path] ?? path;

/* 19 Sep: the landing title became "Break the habits you never chose." — the
   template's arrival title — so the arrival takes the line the landing gave
   up. It reads better here anyway: it is who he is, beside his photograph. */
export const HERO = {
  ...local(S.HERO),
  /* Dion, 22 Sep: not "It is not therapy. It is a dojo." — what he teaches was
     built there; that is the claim. */
  quoteLines: ['Principles built', 'in a dojo.'],
  titleLines: ['The Son Of', 'A Karate', '<mark>Grand Master.</mark>'],
  mobileTitle: 'The Son Of A Karate Grand Master. <mark>Rebuild Self-Worth.</mark>',
};
export const FOR_YOU_SECTION = local(S.FOR_YOU_SECTION);
export const FOR_YOU = local(S.FOR_YOU);
export const LOGOS = local(S.LOGOS);
/* Dion, 22 Sep, in Harrison's voice: not "the tools that caused my trauma" —
   the same discipline that made him succeed is what kept him in a life that
   was not his. DRAFT until Harrison signs it off. */
export const INTRO = {
  ...local(S.INTRO),
  big: 'The same tools that made me succeed — in my career, in my life — were the ones keeping me in a life that was not mine. Turning them around is the <em>method</em>, and it is why I do not teach anything I have not been through.',
};
/* The story has to carry his own proof (Dion, 25 Sep): the conversation with
   his father is one HE had — three years ago, without waiting to be met
   halfway — and that is what earns him the right to ask anyone else to have
   theirs. His words, off the 26 Aug tape (N_C1611 / N_C1612 and the "I used to
   think" takes; transcripts in _index-week2-26aug). The last sentence of the
   third paragraph is ours, written to his line — it needs his sign-off. */
export const STORY_SECTION = {
  ...local(S.STORY_SECTION),
  posterAlt: 'Harrison Saito in his gi at the Shinbukan dojo, in the SBS World News feature that names him as a karate teacher',
  paragraphs: [
    ...local(S.STORY_SECTION).paragraphs,
    'My dad is 81. I only really started talking to him three years ago. I used to think healing that meant getting him to change — I was wrong. He might never apologise, he might never change, and I might still be the one who looks after him. <strong>I had the conversation anyway.</strong> That is the work, and I did it before I asked it of anyone else.',
  ],
};
export const PATTERNS_SECTION = local(S.PATTERNS_SECTION);
export const PATTERNS = local(S.PATTERNS);
export const PHASES = local(S.PHASES);
/* The positioning (Dion's brief, 22 Sep 2026), in Harrison's first person: an
   integrated teacher; principles made in the dojo and seventeen years of
   karate; for men who have achieved a great deal and still feel disconnected;
   the tools to regulate, to rebuild self-worth, and to live by their own
   values in a fast, overstimulated world. DRAFT until Harrison signs the words
   off — they are ours, written to his brief, not quoted from him. */
export const CORE = {
  ...local(S.CORE),
  lede: 'The world has never been louder. Every hour of the day something is built to hold your attention, and the more of it you hand over, the harder it gets to hear what is actually yours — what you want, what you value, what your body has been telling you the whole time. Return to Self is twelve weeks of learning to stop, and to hear it again.',
  note: 'Not therapy. Not spirituality for its own sake. Training — physical, mental and spiritual, taught the way a dojo teaches: practised until it holds under pressure, inside your ordinary week. Handed over in three stages (Separate, Return, Integrate) until the tools are yours. In person around Chatswood and Sydney’s North Shore, or online Australia-wide.',
};
export const FAQ_SECTION = local(S.FAQ_SECTION);
export const FAQ = local(S.FAQ);
export const QUOTE = local(S.QUOTE);
export const FILMS_SECTION = local(S.FILMS_SECTION);
/* The SBS film card takes the second still from the broadcast, so the story's
   poster and the film wall do not show the same frame twice. */
export const FILMS = local(S.FILMS).map((f) =>
  f.image === '/img/sbs-karate-v1.webp' ? { ...f, image: '/img/sbs-karate-2-v1.webp' } : f
);
const FAMILY_BASE = local(S.FAMILY);
/* The three doors show who is behind them (Dion, 22 Sep): the Core is a wall
   of his students — six of them, from the mats, the deck and the lawn — 1:1 is
   him, and the breathwork room keeps the temple Buddha. */
export const FAMILY = {
  ...FAMILY_BASE,
  body: 'One to one, a monthly breathwork room, or the twelve-week core — each one hands you tools you can use the same day: to regulate, to rebuild self-worth, and to live by your own values. Underneath them are the two rooms they came from.',
  big: { ...FAMILY_BASE.big, image: '/img/ways-core-v1-1600.webp' },
  /* Four doors now (Dion, 22 Sep: "below 1:1, below breathwork, have the
     temple, have the dojo"), so the grid runs two by two. The last two lead
     off the site — the dojo he teaches at and the temple the testimonies were
     filmed in — and say only what can be stood behind: their names, and where
     they are. What each relationship IS (trained, ordained, affiliated) is
     Harrison's to word, the same rule the footer's crests follow.
     They open in the same tab: the card markup is MorelHome.astro, which is
     open in another session. Worth a target="_blank" when it is free. */
  cards: [
    ...FAMILY_BASE.cards.map((c: any) =>
      c.title === '1:1 Coaching'
        ? { ...c, image: '/img/about-bed.webp' }
        : c.title === 'Breathwork Workshop'
          ? { ...c, image: '/img/ways-breath-v1-900.webp' }
          : c
    ),
    {
      title: 'The Dojo',
      lockup: ['The', 'Dojo'],
      accent: 'Shinbukan Martial Arts, Lane Cove',
      body: 'Where he trains, and where he teaches. The mats this all came off.',
      cta: { label: 'Visit the dojo', href: LINKS.shinbukan },
      image: '/img/dark-dojo.webp',
    },
    {
      title: 'The Temple',
      lockup: ['The', 'Temple'],
      accent: 'Koyasan Seizanji',
      body: 'Shingon Buddhism — the other half of what he teaches, and the mark at the foot of this page.',
      cta: { label: 'Visit the temple', href: LINKS.seizanji },
      image: '/img/buddha.webp',
    },
  ],
};
/* The close is one line (Dion, 18 Sep: drop the template's "If something here
   resonated," lead-in). 22 Sep: "Let's connect." — the same words as the ask
   under the newsletter, so the page closes the way it invites. */
export const CLOSE = { ...local(S.CLOSE), title: '<mark>Let’s connect.</mark>' };
/* "Send it to me" was the ask; the ask is really an introduction. */
export const NEWSLETTER = { ...local(S.NEWSLETTER), cta: 'Let’s connect' };
export const WORKSHOPS_PAGE = local(S.PAGES.find((p) => p.slug === 'workshops')!);
