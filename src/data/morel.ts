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
  /* Dion, 25 Sep: the studio portrait from his downloads (_DSF1394), not the
     broadcast grab with the watermark on it. A 16:9 band off a 4160x6240
     frame, his face in the upper third. */
  poster: '/img/story-gi-v2-1600.webp',
  posterAlt: 'Harrison Saito in his gi and black belt, standing before a lit shoji screen at the Shinbukan dojo',
  paragraphs: [
    ...local(S.STORY_SECTION).paragraphs,
    'My dad is 81. I only really started talking to him three years ago. I used to think healing that meant getting him to change — I was wrong. He might never apologise, he might never change, and I might still be the one who looks after him. <strong>I had the conversation anyway.</strong> That is the work, and I did it before I asked it of anyone else.',
  ],
};
/* The five patterns, in the voice guide's register (docs/VOICE.md, Dion,
   25 Sep): recognition, what it costs, and the way through — without telling
   anyone what is wrong with them. The names and the marks are the template's;
   the prose is ours, and on the sign-off list with the rest. */
export const PATTERNS_SECTION = {
  ...local(S.PATTERNS_SECTION),
  lede: 'Most people who come to me are not carrying a problem. They are carrying a pattern — one they inherited, never chose, and have rarely been able to name.',
  why: 'Naming it is not a personality quiz. It is the first move of the practice: <em>self-trust begins when you can tell the difference between an inherited reaction and what you actually think, feel and value.</em> You cannot create space around a pattern you cannot see.',
  foot: 'Recognised yourself in more than one? That is the usual answer — they tend to travel together.',
};
const PATTERN_VOICE: Record<string, { recognise: string; cost: string; through: string }> = {
  'The Performer': {
    recognise: 'You are competent in every room, and known in very few of them. The version of you other people rely on has been running so long it is hard to say what sits underneath it.',
    cost: 'A tiredness sleep does not touch, and a quiet sense that the life you built belongs to the performance more than to you.',
    through: 'Noticing the performance and the person as two different things — not taking the performance apart. The competence is real. It stops being the only thing you are allowed to be.',
  },
  'The Dutiful Child': {
    recognise: 'At some level you are still answering to a standard someone else set. You may have exceeded it. The bar moved, or the person who set it never said you had cleared it.',
    cost: 'A life arranged around an approval that may never arrive, and a grief that is hard to name while the person is still here.',
    through: 'Going back to where it started — the parent, the family, the culture — and understanding what is actually there, so it stops choosing for you.',
  },
  'The Peacekeeper': {
    recognise: 'You read a room before you enter it. You know what everyone needs and you supply it. Asked what you want, you go quiet — not because you do not know, but because wanting has rarely felt like the safe move.',
    cost: 'A resentment that is hard to justify, relationships built on a version of you that never disagrees, and less and less of you in the room.',
    through: 'Saying the true thing and staying in the room while it lands. Boundaries without the guilt that usually follows them.',
  },
  'The Achiever': {
    recognise: 'Achievement is the currency you trust most. Each one lands for about a day. Then the floor resets and you are behind again, measured against a standard that exists nowhere but in you.',
    cost: 'A career that looks like success and can feel like a treadmill, and a body that has been running on discipline instead of rest for years.',
    through: 'Noticing that the discipline was never the problem — what it was serving was. The strength stays. What it answers to changes.',
  },
  'The Held Fist': {
    recognise: 'It leaks — in traffic, at your kids, at nothing. Or it never leaks at all, which costs more, because it has to be held every single day and holding it is most of what you do.',
    cost: 'Something the people closest to you have learned to move around, and a younger version of you still waiting to be heard.',
    through: 'Meeting it in the body before analysing it. This is where the martial arts stop being a metaphor.',
  },
};
export const PATTERNS = local(S.PATTERNS).map((p) => ({ ...p, ...(PATTERN_VOICE[p.name] ?? {}) }));
export const PHASES = local(S.PHASES);
/* The positioning, in the voice guide's words (docs/VOICE.md, Dion, 25 Sep
   2026): recognition first, then what sits beneath the behaviour, then the
   central idea — you may not control what you feel first, but you can learn
   to understand it before it chooses what you do next. Nobody is told they
   are broken and nothing is promised. DRAFT until Harrison signs the words
   off — they are ours, written to his brief, not quoted from him. */
export const CORE = {
  ...local(S.CORE),
  lede: 'Very few of us are taught what happens inside us when things become difficult. So we react — we withdraw, we overwork, we get defensive, we reach for the next achievement. Sometimes that has worked for years. Return to Self is twelve weeks of learning to notice what you feel before it decides what you do next: the pattern, where it came from, what actually matters to you, and how you want to respond.',
  note: 'Not therapy, and not about becoming endlessly calm. It is not about suppressing anger, removing ambition or pretending difficult emotions do not exist. It is practice — conversation, reflection, awareness, and principles built over seventeen years in the dojo — handed over in three keys (Separate, Return, Integrate) until they are yours. In person around Chatswood and Sydney’s North Shore, or online Australia-wide.',
};
export const FAQ_SECTION = local(S.FAQ_SECTION);
/* The first five answers are the old site's, and his; the rest are ours, in
   the voice guide's register (25 Sep). Keyed on the template's questions
   before `local()` runs, so the de-gendering still applies to the questions. */
const FAQ_VOICE: Record<string, string> = {
  'What actually happens on the discovery chat?':
    'A short call, by phone or video. You talk first — where you are, in your own words. I ask a few direct questions about what you have noticed and what you have already tried. Then you get a straight answer on whether the twelve weeks fit you, and if they do not, where to look instead.',
  'Is Buddhism part of it? Do I need to be religious?':
    'No. Buddhism here is attention training — two and a half thousand years of practical method for noticing your own mind. There is no belief to adopt, no ritual to perform and nothing you will be asked to sign up to.',
  'I am not in crisis. Is this still for me?':
    'It is built for exactly that. Most people who come are functioning well by every outside measure — the work, the family, the discipline — and cannot say why it feels hollow. You do not need to be falling apart to start noticing. If you are in crisis, this is not the right door: contact Lifeline on 13 11 14 or your GP first.',
  'How is this different from a men’s group or a retreat?':
    'It is one to one, it runs for twelve weeks with a fixed end date, and it happens inside your ordinary life — not over one intense weekend you then have to come down from. The practice is in the body as much as in conversation, and it is paced to you.',
  'What do I tell my partner?':
    'The truth, plainly: that you are doing twelve weeks of structured practice with a coach on the patterns you keep repeating, and that it is not therapy and not a replacement for it. You are welcome to bring them into the first conversation.',
  'Is this a cult, or something woo?':
    'No. It is one teacher, a dojo, and twelve weeks with a fixed end date. The lineage is real and checkable — Shinbukan, since 1978 — and so is the temple. There is nothing you have to join and nowhere you have to fly to.',
  'Who is it not for?':
    'Anyone who wants someone else to do the noticing, anyone who books the call to be talked into or out of it, and anyone in acute crisis — who needs clinical care first. In that case I will say so and help you find it.',
};
export const FAQ = local(S.FAQ.map((f) => (FAQ_VOICE[f.q] ? { ...f, a: FAQ_VOICE[f.q] } : f)));
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
  body: 'One to one, a monthly breathwork room, or the twelve weeks — each one hands you a practice you can use the same day: to notice what you feel, to regulate it, and to choose what comes next. Underneath them are the two rooms they came from.',
  big: {
    ...FAMILY_BASE.big,
    image: '/img/ways-core-v1-1600.webp',
    body: 'Return to Self. Twelve weeks, three keys: Separate, Return, Integrate. For people who know how to keep going, and want more choice in how.',
  },
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
          ? { ...c, image: '/img/ways-breath-v1-900.webp', body: 'Once a month in Chatswood. A room of sixteen: the breath first, then a practice to take home.' }
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
export const NEWSLETTER = { ...local(S.NEWSLETTER), cta: 'Let’s connect', body: 'A five-minute guided practice — one small place to start noticing.' };
export const WORKSHOPS_PAGE = local(S.PAGES.find((p) => p.slug === 'workshops')!);
