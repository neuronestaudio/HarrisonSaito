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

/* ---- the facts, or the honest absence of them --------------------------- */
export const DETAILS = {
  seats: 1,
  /** Where. His base; the venue itself is Harrison's to name. */
  where: 'Chatswood, Sydney',
  /* Dion, 26 Sep: two rooms, 1–2 pm on the third and the fourth (October
     2026 — a Saturday and a Sunday). The application picks one. */
  /* 11 Nov 2026: Private Coaching is 1:1, so there is no room to pick — the
     seat question is left out and Harrison's call picker is the only step. */
  sessions: [] as { id: string; label: string; time: string }[],
  when: null as string | null,
  length: '45 minutes, 1:1' as string | null,
  /** $60 and the full-refund line are Dion's terms (11 Nov 2026): pay for the session,
      full refund if by the end it is not for you. Harrison has not signed them off. */
  price: '$60' as string | null,
};

/** How the missing facts read on the page. */
export const WHEN_LINE = 'Free discovery call · 1:1 with Harrison';
export const LENGTH_LINE = DETAILS.length ?? 'One session';

/* ---- the fold ------------------------------------------------------------
   11 Nov 2026: /workshop IS the Before You React relationships workshop
   (pilot brief, 22 Oct), offered 1:1 as Private Coaching. Nothing on this page
   talks about the twelve weeks (Dion, 11 Nov). The first video sits right under
   the heading: Harrison's own words, cut from the VSL (343.9–426.5 s). */
export const HERO = {
  eyebrow: `Private Coaching · 1:1 · ${DETAILS.where}`,
  /* Dion, 11 Nov 2026: "You're waiting on a change that might never happen. You keep repeating the same
     patterns that ultimately affect your relationship. As much as you understand your own past, you still
     can't find a way to respond with your true intention." Replaces "1:1 Private Coaching with Harrison.
     What's involved?" (the eyebrow and the film still say what it is). */
  title: 'You’re waiting on a change <mark>that might never happen.</mark>',
  lede:
    'You keep repeating the same patterns that ultimately affect your relationship. As much as you understand your own past, you still can’t find a way to respond with your true intention.',
  cta: { label: 'Book your free call', href: '#apply' },
  more: { label: 'What happens in the session', href: '#room' },
  film: { src: '/video/ws-involved-v1.mp4', poster: '/img/ws-involved-v1-poster.webp', title: 'What’s involved in 1:1 Private Coaching' },
};

/* second video: Harrison's explanation, cut from the VSL (260.7–329.2 s) */
export const EXPLAIN = {
  title: 'You can’t change what happens. <mark>But you can change how you respond.</mark>',
  lead: 'Let me explain…',
  film: { src: '/video/ws-explain-v1.mp4', poster: '/img/ws-explain-v1-poster.webp', title: 'You can’t change what happens, but you can change how you respond' },
};

/* the pilot brief's everyday moments */
export const MOMENTS = {
  eyebrow: 'You may recognise this',
  title: 'You keep having the same argument, <mark>just with different words.</mark>',
  /* each line wears a mark from the badge set (lib/morel-icons.ts), as on the home page */
  list: [
    { icon: 'braced', text: 'Your jaw tightens.' },
    { icon: 'pause', text: 'You go quiet.' },
    { icon: 'explain', text: 'You over-explain.' },
    { icon: 'hands', text: 'You say yes reluctantly.' },
    { icon: 'phone', text: 'You reach for your phone after the tension.' },
  ],
};

/* ---- the pills: what people noticed afterwards ---------------------------- */
export const GAINS_INTRO = {
  eyebrow: 'What people noticed afterwards',
  title: 'Awareness <mark>creates choice.</mark>',
  lede: 'These are the changes people who trained with Harrison say they noticed, as written to him or said on camera.',
  /* Dion, 11 Nov: the four faces looked scripted. A link to the testimonials instead. */
  more: { label: 'Hear it from them', href: '/testimonials' },
};

/* ---- what happens in the session (the pilot brief's flow, 45 minutes) ------ */
export const ROOM = {
  eyebrow: 'What happens in the session',
  title: 'Pause. Recognise. <mark>Choose.</mark>',
  lede: 'One recent moment with one person who matters to you. Sharing is optional.',
  movements: [
    { n: '01', key: 'Choose', title: 'Pick the moment.', body: 'One relationship, one recent incident.' },
    { n: '02', key: 'Pause', title: 'Feel your feet. Take a breath.', body: 'A moment before anything else.' },
    { n: '03', key: 'Recognise', title: 'Notice what is showing up.', body: 'What do I notice in my body?' },
    { n: '04', key: 'Practise', title: 'Rehearse something different.', body: 'Choose when you will practise it.' },
  ],
  leave: {
    lead: 'You leave with the tools to see what is happening inside you, and what stands between you and saying what you actually mean.',
    body: 'Most people can already name their patterns. What they lack is the space to express themselves, and a way to practise. In the end, it comes down to practice.',
    exampleLabel: 'For example',
    example: [
      { label: 'Early signal', text: 'My jaw tightens' },
      { label: 'Usual reaction', text: 'I defend myself' },
      { label: 'Alternative', text: 'I pause and ask what they meant' },
    ],
  },
  /* the two photographs beside the steps (Dion, 11 Nov): the hand-on-chest session, and Harrison seated on the mat */
  /* bento: one tile each, laid out by .ws-bento in rts-coaching.astro (a–e) */
  photos: [
    { cell: 'a', slug: 'coaching-chest-v1', w: 960, alt: 'Harrison kneeling beside a client in seiza, one hand resting on the client’s chest while the client sits with eyes closed', pos: '50% 32%' },
    { cell: 'b', slug: 'session-dojo-v1', w: 800, alt: 'Harrison and another man face to face in silhouette against a glowing orange shoji screen', pos: '50% 50%' },
    { cell: 'c', slug: 'session-heart-v1', w: 800, alt: 'Harrison sitting cross-legged on the grass at dusk, eyes closed, both hands held to his chest', pos: '45% 25%' },
    { cell: 'd', slug: 'session-moon-backs-v1', w: 800, alt: 'Four people seen from behind, looking up at the moon through the clouds at dusk', pos: '50% 50%' },
    { cell: 'e', slug: 'session-moon-circle-v1', w: 800, alt: 'Harrison sitting cross-legged on the grass at dusk with a small group, a full moon over the harbour behind him', pos: '50% 38%' },
  ],
  facts: ['1:1 with Harrison', `${LENGTH_LINE} · ${DETAILS.price}, full refund if it is not for you`, `In person · ${DETAILS.where}`, 'Bring comfortable clothing and an open mind'],
  note: 'Coaching, not therapy. A practice for one situation that matters to you.',
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
  eyebrow: 'Who is coaching you',
  title: 'Discipline taught me how to push. <mark>Presence taught me when not to.</mark>',
  /* the standing gi portrait that was the hero until the seiza frame took it */
  portrait: 'workshop-gi-v1',
  portraitAlt: 'Harrison Saito standing in his gi and black belt in front of a shoji screen',
  lines: [
    'Harrison Saito. 2nd Dan black belt and Shido-In at Shinbukan Karate — the school his father, Kazuo Saito, 10th Dan, founded in 1978. More than seventeen years of discipline, repetition, patience and practice.',
    'Ordained in 2014 at Koyasan Seizanji.',
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
export type Word = { from: string; said: string; context: string; face: string };
export const WORDS: Word[] = [
  { from: 'John', context: 'Consultant, 55 · filmed', face: 'face-john-v1', said: 'people outside of my karate environment have noticed that difference of me being a lot more calmer as a person' },
  { from: 'Andrew', context: 'Drummer · filmed', face: 'face-andrew-v1', said: 'how I use that in my day to day, makes me happier, makes me calmer, I think it makes me a better person' },
  { from: 'Matt Halpin', context: 'Coaching · Return to Self', face: 'avatar-matt-halpin', said: 'Harrison helped me remove the mask, calm the mind, and move with intention rather than just speed, power, and grit.' },
];

/* ---- straight answers ---------------------------------------------------- */
export const ANSWERS = [
  {
    q: 'What does it cost?',
    a: `The session is ${DETAILS.price}. If by the end you decide it is not for you, you get a full refund.`,
  },
  {
    q: 'Do I have to share?',
    a: 'No. Sharing is optional. You choose one relationship and one recent, manageable moment, and how much of it you say out loud is up to you.',
  },
  {
    q: 'Why apply, rather than just book?',
    a: 'Harrison keeps a small number of 1:1 sessions and reads every application himself. He calls you first, a short conversation. Nothing to prepare.',
  },
  {
    q: 'Is this therapy?',
    a: 'No. This is coaching. It is not therapy, diagnosis or emergency care, and it is not a replacement for any of them. If you are in crisis, contact Lifeline on 13 11 14.',
  },
  {
    q: 'Do I need to have trained before?',
    a: 'No. Plenty of people arrive having never trained. The practice is adapted to the person in front of me.',
  },
  {
    q: 'What if Harrison is fully booked?',
    a: 'You are first for the next opening. An application is never wasted.',
  },
];

/* ---- the ask ------------------------------------------------------------- */
export const APPLY = {
  eyebrow: 'Free discovery call',
  title: 'Take the <mark>first step.</mark>',
  body:
    'A free conversation with Harrison: a space to be heard, and to see whether the tools are right for you. Tell him what sounds like you, choose a time, and you are booked.',
  formLabel: 'Leave your details',
};

/* ---- the three steps (Dion, 12 Nov 2026) ---------------------------------
   1 what sounds like you (the six iteration-one identities + the relationship one),
   2 a time in Harrison's calendar, 3 your details (Calendly's own screen). */
export const FUNNEL = {
  badge: 'Free · 1:1 with Harrison',
  steps: ['What sounds like you', 'Choose a time', 'Your details'],
  q1: 'What sounds most like you?',
  q1hint: 'Pick any that land. There are no wrong answers, and it helps Harrison meet you where you are.',
  next: 'Continue',
  skip: 'Not sure yet — skip',
  relationship: { tag: 'The same argument', line: 'You keep having the same argument, just with different words.' },
  q2: 'Choose a time for your free call.',
  q2hint: 'Pick a day and time, then add your details to confirm. It goes straight into Harrison’s diary.',
  back: 'Change my answer',
  booked: 'You are booked. A confirmation is on its way to your email.',
  noTime: 'Can’t find a time? Leave your details instead.',
  backToCal: 'Back to times',
  formQ: 'Leave your details and Harrison will come back to you.',
  formSubmit: 'Request my free call',
  formSuccess: 'Thank you. Harrison will reach out directly. Pick up to three windows for his call.',
};

/* ---- the form ------------------------------------------------------------ */
export const FORM = {
  id: 'workshop',
  sessionLabel: 'Which session?',
  submit: 'Apply for a session',
  /* Dion, 26 Sep, as said: thank you, your spot is under review, Harrison will
     reach out directly, select a window for him to call you. */
  successHeading: 'Thank you.',
  successBody: 'Your application is under review, and Harrison will reach out directly. Pick up to three windows for his call.',
  callLabel: 'When can he call?',
  /* Dion, 26 Sep: "time-block hours to select, UI/UX high end." Then, 30 Sep:
     "the call can start anywhere between 8 and 8, but in windows — 8–10,
     10–12, 12–2, 2–4, 4–6, 6–8." So six two-hour blocks a day, every day,
     Sydney time, across the next seven days — from tomorrow, so he has read
     the application before the first window opens — and up to three picks
     across them. Change the hours here and nowhere else; SeatForm draws
     whatever this says. (Before 30 Sep: one-hour blocks, weekday 4–8 pm,
     weekend 9 am–1 pm.) */
  call: {
    tz: 'Australia/Sydney',
    /** how many days to offer, and how many days out the first one is */
    days: 7,
    from: 1,
    /** block start hours (24h), and how many hours each block runs */
    block: 2,
    weekday: [8, 10, 12, 14, 16, 18],
    weekend: [8, 10, 12, 14, 16, 18],
    max: 3,
    hint: 'Sydney time · two-hour windows · up to three',
    countLabel: '{n} of {max}',
    confirm: 'Confirm windows',
    flexible: 'I’m flexible — any time this week works',
    /** how "flexible" reads on the page and in GHL's "when suits" */
    flexibleLabel: 'any time this week',
  },
  doneHeading: 'Done.',
  doneBody: 'Harrison will call you — {window}. If he is fully booked, you are first for the next opening.',
  whatsapp: 'Hi Harrison, I’d like to apply for a Private Coaching session.',
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
