/**
 * /workshop — the three-seat room. The end point of the ads.
 *
 * Dion, 25 Sep 2026: "a new funnel page, /workshop — very minimal friction.
 * An exclusive workshop for three people; the three is the scarcity. A space
 * where we can actually be intimate and share with each other. We are trying
 * to sell Return to Self, but the barrier of entry is too high, so we funnel
 * people to this workshop: the touch point where they get to share with
 * Harrison, understand Harrison, and get a taste of the course."
 *
 * So the page sells a seat, not the twelve weeks. Every section is there to
 * make asking for one feel small: what the room is, why it is three, what
 * happens in it, who is holding it, and the straight answers.
 *
 * Three workshops now exist and are NOT the same thing:
 *   /workshops   the monthly breathwork room, capped at sixteen (template page)
 *   Wa 和        the full-moon event with Asami, Tunks Park, Humanitix
 *   /workshop    THIS — Harrison alone, three seats, the door to the twelve weeks
 *
 * What is not known yet lives in DETAILS as null and renders honestly ("to be
 * confirmed"). Nothing on this page states a date, a length or a price until
 * Harrison gives one. The seat is asked for, not bought, so no price is needed
 * for the page to work.
 *
 * Provenance: everything under `his` is his, on tape or on the site already
 * (the source is beside it). Everything else is OURS, written to Dion's brief,
 * and needs Harrison's OK before it is treated as his words.
 */
import { TESTIMONIALS } from './site';
import { INTERVIEWS } from './interviews';

/* ---- the facts, or the honest absence of them --------------------------- */
export const DETAILS = {
  seats: 3,
  /** Where. His base; the venue itself is Harrison's to name. */
  where: 'Chatswood, Sydney',
  /** e.g. 'Thursday 9 October · 7 pm'. null until Harrison sets a date. */
  when: null as string | null,
  /** e.g. 'Two hours'. null until Harrison sets it. */
  length: null as string | null,
  /** Never published until Harrison sets it — two numbers are in circulation
      and neither is his. The page asks for a seat; it does not sell one. */
  price: null as string | null,
};

/** How the missing facts read on the page. */
export const WHEN_LINE = DETAILS.when ?? 'Next room: date to be confirmed — the three who ask first hear first';
export const LENGTH_LINE = DETAILS.length ?? 'One session';

/* ---- the fold ----------------------------------------------------------- */
export const HERO = {
  eyebrow: 'Harrison Saito · Chatswood, Sydney',
  title: 'One room. Three seats. <mark>The work, before the commitment.</mark>',
  lede:
    'A small in-person session with Harrison — three people, not thirty. You get the first tool of Return to Self in your hands, you say as much or as little as you want about where you are, and you find out whether the twelve weeks are yours before you commit to any of them.',
  points: [
    'Three seats, so everyone in the room actually gets to speak',
    `In person, ${DETAILS.where} — ${LENGTH_LINE.toLowerCase()}, no homework, no follow-up pressure`,
    'You leave with one practice you can use the next morning',
    'No obligation — the twelve weeks are there if you want them, and only then',
  ],
  formLabel: 'Ask for a seat — thirty seconds',
  formNote:
    'Three places a room. Put your name down and Harrison replies personally, usually with a call, to say whether there is a seat and when.',
};

/* ---- why three ---------------------------------------------------------- */
export const WHY = {
  eyebrow: 'Why only three',
  title: 'Small enough to be honest. <mark>Big enough not to be about you.</mark>',
  cards: [
    {
      n: '01',
      title: 'You will be heard.',
      body: 'In a room of three nobody gets to hide at the back, and nobody has to hold the floor for an hour. Everyone speaks. Everyone is listened to.',
    },
    {
      n: '02',
      title: 'You are not the subject.',
      body: 'It is not a one-to-one session with every eye on you. Two other people are carrying something too, and that changes what you are willing to say out loud.',
    },
    {
      n: '03',
      title: 'You meet him, not a pitch.',
      body: 'A session in a room with Harrison tells you more than any page can — how he teaches, how he listens, and whether you would trust him with twelve weeks.',
    },
  ],
};

/* ---- what happens in the room ------------------------------------------ */
export const ROOM = {
  eyebrow: 'What happens in the room',
  title: 'A taste of the twelve weeks, <mark>in one sitting.</mark>',
  lede:
    'Return to Self is built on three keys — Separate, Return, Integrate — trained one to one over twelve weeks. The workshop takes one practice from each and puts it in your body in a single session.',
  steps: [
    {
      key: 'Separate',
      title: 'Name what runs you.',
      body: 'A short, direct exercise for seeing the pattern you are inside — the performing, the pleasing, the pushing — and pulling it apart from what you actually think and want. You keep the tool.',
    },
    {
      key: 'Return',
      title: 'Regulate, on the spot.',
      body: 'The first thing Harrison teaches, because it is the thing he uses most: breath and stance, from the dojo, to bring your state down when it rises. Done live, in the room, on you.',
      /* Harrison, unprompted, 26 Aug 2026 tape — _index-week2-26aug/ALL_TRANSCRIPTS.md [22:18]. */
      his: { quote: 'The biggest tool that helps me is regulation. I’ve got to regulate my state.', source: 'Harrison, on tape, 26 Aug 2026' },
    },
    {
      key: 'Integrate',
      title: 'Take one thing home.',
      body: 'You leave with one practice for the week after, not a folder of worksheets. If the twelve weeks are yours, this is week one in miniature. If they are not, you still have the practice.',
    },
  ],
  note: 'Not therapy, and not a retreat you have to come down from. Training — physical, mental and spiritual, taught the way a dojo teaches — in one room, once.',
};

/* ---- who is holding the room --------------------------------------------
   Verified lines only (22 Sep 2026, from the institutions' own pages and the
   SBS broadcast): 2nd Dan and Shido-In at Shinbukan; Kazuo Saito, 10th Dan,
   founded Shinbukan in 1978; ordained 2014 at Koyasan Seizanji — and NOT
   "monk" or "priest", the same page says he has not done monastic training;
   practising high-school teacher and the SBS feature are live site copy. */
export const WHO = {
  eyebrow: 'Who is holding the room',
  title: 'Harrison Saito',
  portrait: 'about-bed',
  portraitAlt: 'Harrison Saito, seated, in a plain black T-shirt',
  lines: [
    '2nd Dan black belt and Shido-In at Shinbukan Karate — the school his father, Kazuo Saito, 10th Dan, founded in 1978. Seventeen years on the mats.',
    'Ordained in 2014 at Koyasan Seizanji. Buddhism here is attention training, not belief — there is nothing you will be asked to sign up to.',
    'A practising high-school teacher, featured on SBS World News for his work with young people.',
  ],
  /* His words, 26 Aug 2026 tape (N_C1611 / N_C1612 and the "I used to think" takes). */
  his: {
    quote: 'My dad’s 81. I only really started talking to him three years ago.',
    source: 'Harrison, on tape, 26 Aug 2026',
    after: 'The conversation he asks people to have is one he had first. That is the whole of his credibility, and it is enough.',
  },
};

/* ---- in their words ------------------------------------------------------
   Verbatim, and checked at build: each `said` must be inside what the named
   person wrote (TESTIMONIALS) or said on camera on 9 Sep (INTERVIEWS). */
export type Word = { from: string; said: string; context: string };
export const WORDS: Word[] = [
  { from: 'Matt Halpin', context: 'Coaching · Return to Self', said: 'Harrison helped me remove the mask, calm the mind, and move with intention rather than just speed, power, and grit.' },
  { from: 'John', context: 'Consultant, 55 · filmed', said: 'people outside of my karate environment have noticed that difference of me being a lot more calmer as a person' },
  { from: 'Andrew', context: 'Drummer · filmed', said: 'how I use that in my day to day, makes me happier, makes me calmer, I think it makes me a better person' },
];

/* ---- straight answers ---------------------------------------------------- */
export const ANSWERS = [
  {
    q: 'Is this a sales pitch for the twelve weeks?',
    a: 'No. You will hear what Return to Self is, because people ask. You will not be pitched. If you want the twelve weeks afterwards, you ask; if you do not, the workshop was the workshop.',
  },
  {
    /* site copy — the FAQ on the home page */
    q: 'Do I have to share?',
    a: 'You are never required to disclose more than you choose, or to prove yourself through an exercise. The pacing is adapted to you.',
  },
  {
    /* site copy — the FAQ on the home page */
    q: 'Is this therapy?',
    a: 'No. This is coaching — a training framework for the inner world, built on martial arts, Buddhism and honest self-inquiry. It is not therapy, diagnosis or emergency care, and it is not a replacement for any of them. If you are in crisis, contact Lifeline on 13 11 14.',
  },
  {
    q: 'What does it cost?',
    a: DETAILS.price
      ? `${DETAILS.price}, paid once you have a confirmed seat. Asking for one costs nothing.`
      : 'Ask and Harrison will answer directly — nothing on this page is a pitch, and asking for a seat costs nothing. Nothing is charged until you have a confirmed seat.',
  },
  {
    /* site copy, opened to everyone */
    q: 'Do I need to have trained before?',
    a: 'No. Karate is used as a method for working with the nervous system, attention and pressure. Plenty of people arrive having never trained. The physical practice is adapted to the person in front of me.',
  },
  {
    q: 'What if the three seats are taken?',
    a: 'You are first for the next room. Rooms run as three people ask for them, so putting your name down is never wasted.',
  },
];

/* ---- the close ----------------------------------------------------------- */
export const CLOSE = {
  title: 'Three seats. <mark>One of them can be yours.</mark>',
  body: 'Put your name down. If this room is full, you are first for the next one.',
  cta: 'Ask for a seat',
};

/* ---- the form ------------------------------------------------------------ */
export const FORM = {
  id: 'workshop',
  submit: 'Ask for a seat',
  successHeading: 'Your name is down.',
  successBody: 'Harrison replies personally, usually with a call, usually within a day. If the three seats are taken, you are first for the next room.',
  whatsapp: 'Hi Harrison, I’d like one of the three seats at the workshop.',
};

/* ---- every quoted line is somebody's ------------------------------------- */
const flat = (s: string) => s.toLowerCase().replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim();
for (const w of WORDS) {
  const written = TESTIMONIALS.find((t) => t.name === w.from);
  const filmed = INTERVIEWS.find((i) => i.name === w.from);
  if (!written && !filmed) throw new Error(`workshop.ts: nothing on record from "${w.from}"`);
  const body = flat(written ? written.quote : filmed!.said.join(' … '));
  if (!body.includes(flat(w.said))) throw new Error(`workshop.ts: "${w.said}" is not in what ${w.from} wrote or said`);
}
