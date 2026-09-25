/**
 * /workshop — the three-seat room. The end point of the ads, and the lead
 * magnet.
 *
 * Dion, 25 Sep 2026: "a new funnel page, /workshop — very minimal friction.
 * An exclusive workshop for three people; the three is the scarcity. A space
 * where we can actually be intimate and share with each other. We are trying
 * to sell Return to Self, but the barrier of entry is too high, so we funnel
 * people to this workshop: the touch point where they get to share with
 * Harrison, understand Harrison, and get a taste of the course."
 *
 * And, on the first cut, later that day: "way too easy" — so the seat is
 * applied for, not asked for; "use this photo of Harrison" — the gi portrait;
 * "on this page there should be the pills"; "the landing page should land
 * them from [the six squares] onwards… who can benefit from the workshop"; and
 * the workshop itself is "similar to" the full-moon room he co-holds — the
 * Humanitix listing for Wa 和: sharing and connection, guided breathwork, a
 * moon meditation from Japanese and Shingon practice, release and gratitude.
 * That order is this room's order, cut to three people and taken indoors.
 *
 * The words follow the voice guide (docs/VOICE.md, Dion, 25 Sep): calm,
 * direct, reflective; recognition before anything else; nobody is diagnosed
 * and nothing is promised; the reader is asked to notice, and left with a
 * choice. Its central idea is the page's: you may not control what you feel
 * first, but you can learn to understand it before it chooses what you do
 * next.
 *
 * Three workshops now exist and are NOT the same thing:
 *   /workshops   the monthly breathwork room, capped at sixteen (template page)
 *   Wa 和        the full-moon event with Asami, Tunks Park, Humanitix
 *   /workshop    THIS — Harrison alone, three seats, the door to the twelve weeks
 *
 * What is not known yet lives in DETAILS as null and renders honestly ("to be
 * confirmed"). Nothing on this page states a date, a length or a price until
 * Harrison gives one. The seat is applied for, so no price is needed for the
 * page to work.
 *
 * Provenance: everything under `his` is his, on tape or on the site already
 * (the source is beside it). Lines from the voice guide and the Wa carousels
 * are Dion's. Everything else is OURS, written to the brief, and needs
 * Harrison's OK before it is treated as his words.
 */
import { TESTIMONIALS } from './site';
import { INTERVIEWS } from './interviews';
import type { WhoCard, WhoSection } from '../components/WhoFor.astro';

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
      and neither is his. The page asks for an application; it does not sell. */
  price: null as string | null,
};

/** How the missing facts read on the page. */
export const WHEN_LINE = DETAILS.when ?? 'Next room: date to be confirmed — applicants hear first';
export const LENGTH_LINE = DETAILS.length ?? 'One session';

/* ---- the fold ------------------------------------------------------------
   The guide's §7 line. The home page carries its primary hero ("You don't
   have to react to everything you feel"); the workshop, one session on
   noticing the moment in between, carries the line about that moment. */
export const HERO = {
  eyebrow: `The Workshop · ${DETAILS.seats} seats · ${DETAILS.where}`,
  title: 'There is a moment <mark>before the reaction.</mark>',
  lede:
    'Your first reaction may be automatic. What you do next doesn’t have to be. The workshop is one room, three people and one session with Harrison — learning to notice the moment in between: what you are feeling, what set it off, and what you would rather do next. The first practice of Return to Self, before you commit to any of it.',
  cta: { label: 'Apply for a seat', href: '#apply' },
  more: { label: 'What happens in the room', href: '#room' },
  portrait: 'workshop-gi-v1',
  portraitAlt: 'Harrison Saito standing in his gi in front of a shoji screen, hands at his sides',
};

/* ---- who the workshop is for: the six squares -----------------------------
   The same panel as the home page (WhoFor.astro), asked for here by Dion as
   the opening. The lines are the guide's "you may recognise yourself here"
   list (§12), one to a card; each card's through line is the movement of the
   room that answers it (ROOM below). */
export const FIT: { section: WhoSection; cards: WhoCard[] } = {
  section: {
    label: 'Who the workshop is for',
    title: 'For people who <mark>know how to keep going.</mark>',
    lede: 'You may recognise yourself here. Each one names the part of the session that answers it.',
    foot: 'None of this asks you to become someone else. It asks for one session, and three people willing to notice what is already there.',
    cta: { label: 'Apply for a seat', href: '#apply' },
  },
  cards: [
    {
      icon: 'cycle',
      text: 'You understand your patterns,',
      emphasis: 'and you still repeat them.',
      key: 'Share',
      sub: 'Movement 01',
    },
    {
      icon: 'comment',
      text: 'You want greater clarity',
      emphasis: 'around what actually matters to you.',
      key: 'Share',
      sub: 'Movement 01',
    },
    {
      icon: 'pause',
      text: 'You find it difficult to switch off,',
      emphasis: 'and being told to relax has never worked.',
      key: 'Breathe',
      sub: 'Movement 02',
    },
    {
      icon: 'summit',
      text: 'You know how to push through,',
      emphasis: 'and every difficult feeling gets treated like another obstacle.',
      key: 'Breathe',
      sub: 'Movement 02',
    },
    {
      icon: 'eye',
      text: 'You are always thinking about what comes next,',
      emphasis: 'and rarely here for what is happening now.',
      key: 'Sit',
      sub: 'Movement 03',
    },
    {
      icon: 'stairs',
      text: 'You are not looking for another motivational speech.',
      emphasis: 'You are looking for a practice.',
      key: 'Take home',
      sub: 'Movement 04',
    },
  ],
};

/* ---- the pills: what people noticed afterwards ---------------------------- */
export const GAINS_INTRO = {
  eyebrow: 'What people noticed afterwards',
  title: 'Awareness <mark>creates choice.</mark>',
  lede:
    'These are the changes people who trained with Harrison say they noticed — as written to him, or said on camera. The workshop hands you the first practice behind them.',
};

/* ---- what happens in the room ------------------------------------------ */
export const ROOM = {
  eyebrow: 'What happens in the room',
  title: 'Four movements, <mark>in an order that matters.</mark>',
  lede:
    'That moment can be very small. With practice you begin to notice it — and when you can notice it, you can choose something different. One session, four movements, in the order that makes each one land. No experience needed.',
  movements: [
    {
      n: '01',
      key: 'Share',
      title: 'Say what you are carrying.',
      body: 'It begins with the three of you and Harrison, and a simple question: what are you navigating right now, and what would you like to understand better? Say as much as you want. Nobody performs, and nobody is watched.',
    },
    {
      n: '02',
      key: 'Breathe',
      title: 'Notice what the body does first.',
      /* "the part of you that decides whether to brace or settle does not take
         instructions in English" — Dion's line, Wa set 21, 22 Sep. */
      body: 'Breath and stance, taught the way the dojo teaches them: used deliberately to change what the nervous system is doing — the part of you that decides whether to brace or settle, which does not take instructions in English.',
      /* Harrison, unprompted, 26 Aug 2026 tape — _index-week2-26aug/ALL_TRANSCRIPTS.md [22:18]. */
      his: { quote: 'The biggest tool that helps me is regulation. I’ve got to regulate my state.', source: 'Harrison, on tape, 26 Aug 2026' },
    },
    {
      n: '03',
      key: 'Sit',
      title: 'Then the sitting.',
      body: 'A guided meditation drawn from the Japanese and Shingon Buddhist practice Harrison was ordained into in 2014. Not about removing difficulty — the pressure still exists. Practice changes the way you meet it: you learn to notice what you feel, then decide what deserves your attention, and what does not.',
    },
    {
      n: '04',
      key: 'Take home',
      title: 'Leave with one practice.',
      body: 'The room closes with release and gratitude, and you leave with one practice for the week after — not a folder. If the twelve weeks are yours, this was week one in miniature. If they are not, you still have the practice.',
    },
  ],
  facts: [
    `${DETAILS.seats} seats`,
    `In person · ${DETAILS.where}`,
    LENGTH_LINE,
    'Bring comfortable clothing, water and an open mind',
  ],
  note: 'Not therapy, and not about becoming endlessly calm. Practice — so that what you feel does not automatically make your decisions for you.',
};

/* ---- who is holding the room --------------------------------------------
   Verified lines only (22 Sep 2026, from the institutions' own pages and the
   SBS broadcast): 2nd Dan and Shido-In at Shinbukan; Kazuo Saito, 10th Dan,
   founded Shinbukan in 1978; ordained 2014 at Koyasan Seizanji — and NOT
   "monk" or "priest", the same page says he has not done monastic training;
   practising high-school teacher and the SBS feature are live site copy.
   The title is the guide's philosophy line (§8), in his first person — Dion's
   words for him, and on the sign-off list like everything else that is not
   on tape. */
export const WHO = {
  eyebrow: 'Who is holding the room',
  title: 'Discipline taught me how to push. <mark>Presence taught me when not to.</mark>',
  portrait: 'about-bed',
  portraitAlt: 'Harrison Saito, seated, in a plain black T-shirt',
  lines: [
    'Harrison Saito. 2nd Dan black belt and Shido-In at Shinbukan Karate — the school his father, Kazuo Saito, 10th Dan, founded in 1978. More than seventeen years of discipline, repetition, patience and practice.',
    'Ordained in 2014 at Koyasan Seizanji. Buddhism here is attention training, not belief — there is nothing you will be asked to sign up to.',
    'A practising high-school teacher, featured on SBS World News for his work with young people.',
  ],
  /* His words, 26 Aug 2026 tape (N_C1611 / N_C1612 and the "I used to think" takes). */
  his: {
    quote: 'My dad’s 81. I only really started talking to him three years ago.',
    source: 'Harrison, on tape, 26 Aug 2026',
    after: 'The conversation he asks people to have is one he had first.',
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
    q: 'Why apply, rather than just book?',
    a: 'Because three seats have to be the right three. Harrison reads every application himself and calls you first — a short conversation, so the room works for everyone in it. Nothing to prepare.',
  },
  {
    q: 'Is this a sales pitch for the twelve weeks?',
    a: 'No. You will hear what Return to Self is, because people ask. You will not be pitched. If you want the twelve weeks afterwards, you ask; if you do not, the workshop was the workshop.',
  },
  {
    /* the first sentence is site copy — the FAQ on the home page */
    q: 'Do I have to share?',
    a: 'You are never required to disclose more than you choose, or to prove yourself through an exercise. The first movement is a conversation; how much of it is yours to say is yours to decide.',
  },
  {
    /* site copy — the FAQ on the home page */
    q: 'Is this therapy?',
    a: 'No. This is coaching — a training framework for the inner world, built on martial arts, Buddhism and honest self-inquiry. It is not therapy, diagnosis or emergency care, and it is not a replacement for any of them. If you are in crisis, contact Lifeline on 13 11 14.',
  },
  {
    q: 'What does it cost?',
    a: DETAILS.price
      ? `${DETAILS.price}, paid once you have a confirmed seat. Applying costs nothing.`
      : 'Ask and Harrison will answer directly — nothing on this page is a pitch, and applying costs nothing. Nothing is charged until you have a confirmed seat.',
  },
  {
    /* site copy, opened to everyone */
    q: 'Do I need to have trained before?',
    a: 'No. Karate is used as a method for working with the nervous system, attention and pressure. Plenty of people arrive having never trained. The physical practice is adapted to the person in front of me.',
  },
  {
    q: 'What if the three seats are taken?',
    a: 'You are first for the next room. Rooms run as three people apply for them, so an application is never wasted.',
  },
];

/* ---- the ask ------------------------------------------------------------- */
export const APPLY = {
  eyebrow: 'Three seats',
  title: 'Take the <mark>first step.</mark>',
  body:
    'Not first come, first served. A short application, then a call with Harrison, so the room is right for the three people in it. If this room is full, you are first for the next.',
  formLabel: 'Apply — under a minute',
};

/* ---- the form ------------------------------------------------------------ */
export const FORM = {
  id: 'workshop',
  submit: 'Apply for a seat',
  successHeading: 'Application received.',
  successBody: 'Harrison reads every one himself and replies personally, usually with a call, usually within a day. Three seats a room — if this one is full, you are first for the next.',
  whatsapp: 'Hi Harrison, I’d like to apply for one of the three seats at the workshop.',
  ask: { label: 'In a sentence, what would you like to understand better?', placeholder: 'As much or as little as you like' },
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
/* …and every card points at a movement that exists */
const MOVES = new Set(ROOM.movements.map((m) => m.key));
for (const c of FIT.cards) if (!MOVES.has(c.key)) throw new Error(`workshop.ts: "${c.key}" is not a movement of the room`);
