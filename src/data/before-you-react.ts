/**
 * /before-you-react: the relationships workshop, Iteration 2's landing page.
 *
 * Dion, 4 Nov 2026: a landing page from Harrison's new copy, with the VSL and
 * the testimony on it "so people can understand the value he provides".
 *
 * Provenance:
 *   HERO, ROOM.lead, WHO.lead, NEXT.lead, APPLY.title are Harrison's body as
 *   Dion pasted it (one em dash became a comma, the words are his).
 *   ROOM.steps, LEAVE.example, MOMENTS, NEXT.body come from the 22 Oct brief
 *   (RTS_Relationships_Workshop_Pilot_Brief_22_Oct_2026.pdf).
 *   ANSWERS and the section heads are OURS and need Harrison's OK.
 *
 * Not known yet, so never stated: date, venue, format, price.
 *
 * NOT the same room as /workshop (three seats, October, breathwork format),
 * which is left as it was until Dion says to retire it.
 */
import { INTERVIEWS } from './interviews';

/* Paste the VSL here when it exists: a YouTube or Vimeo link, or a /video/*.mp4
   path. While it is null the film section and its hero link only show in
   `astro dev`, as a labelled slot, and are left out of a production build. */
export const VSL = {
  url: '/video/rts-vsl-v8.mp4' as string | null,
  /** a 16:9 still for the player (frame at 1.5 s of v8) */
  poster: '/img/rts-vsl-v8-poster.webp' as string | null,
  title: 'Harrison Saito on Return to Self',
};

export const HERO = {
  eyebrow: 'A Return to Self relationships workshop',
  title: 'Before You <mark>React</mark>',
  lede: 'A space to feel heard and understood. A room to practise a different way of responding to the people who matter to you.',
  cta: 'Register your interest',
  linkFilm: 'Watch the film',
  linkVoices: 'Hear from people he has taught',
  portrait: 'workshop-seiza-v1',
  portraitAlt: 'Harrison Saito kneeling in seiza on the dojo mats in his gi, eyes closed, hands folded in his lap',
};

/* The voice guide's relationship headline (§6), and the brief's everyday moments. */
export const MOMENTS = {
  title: 'You keep having the same argument, <mark>just with different words.</mark>',
  list: [
    'Your jaw tightens.',
    'You go quiet.',
    'You over-explain.',
    'You say yes reluctantly.',
    'You reach for your phone after the tension.',
  ],
};

export const ROOM = {
  title: 'Pause. Recognise. <mark>Choose.</mark>',
  lead: 'Across 45 minutes, I’ll guide you through Pause → Recognise → Choose, using one recent relationship moment you’d like to handle differently, whether you went quiet, became defensive or said yes when you wanted to say no.',
  steps: [
    { key: 'Pause', body: 'Feel your feet and take a comfortable breath. Give yourself a moment.' },
    { key: 'Recognise', body: 'What do I notice in my body? What feeling, story or usual reaction is showing up?' },
    { key: 'Choose', body: 'What matters to me here? Identify an alternative and choose one next action.' },
  ],
};

export const LEAVE = {
  lead: 'You’ll leave with one early signal to recognise, one usual reaction to notice and one alternative response to practise. Sharing is optional.',
  example: [
    { label: 'Early signal', text: 'My jaw tightens' },
    { label: 'Usual reaction', text: 'I defend myself' },
    { label: 'Alternative', text: 'I pause and ask what they meant' },
  ],
};

/* The four cuts in the Drive's Testimonial (Cuts) folder, at 720p (same files as the /testimonials video work; John's opening direction line is trimmed).
   `said` is word for word off the cut (checked against a fresh transcript). */
export const VOICES = {
  title: 'In their own <mark>voices.</mark>',
  films: [
    { id: 'john', name: 'John', role: 'Runs a consulting business, 55', length: '1:16', said: 'My wife and even kids will say that they feel that I’m a lot more calmer.' },
    { id: 'james', name: 'James Bolton', role: 'Construction, renewable energy', length: '1:00', said: 'You can pause.' },
    { id: 'jake', name: 'Jake', role: 'Musician', length: '1:06', said: 'Then I realize, oh wow, my shoulders are up here.' },
    { id: 'andrew', name: 'Andrew', role: 'Professional drummer and teacher', length: '0:42', said: 'I didn’t even know him but I felt like I knew him.' },
  ],
  /* Short, about him as a person. Checked at build against INTERVIEWS. */
  words: [
    { from: 'Harshil Dave', role: 'Martial arts student', face: '/img/faces/face-harshil-v2-160.webp', said: 'he speaks from experience' },
    { from: 'Alex Wei', role: 'Navy officer, four years of karate', face: '/img/faces/face-alex-v2-160.webp', said: 'Warm, very warm. Understanding, patient.' },
    { from: 'Aiden Jacobs', role: 'Martial arts student, Shinbukan', face: '/img/faces/face-aiden-v2-160.webp', said: 'grounded, patient, and encouraging' },
  ],
  more: 'Read every testimony',
};

/* Verified credentials, the same facts as /workshop's WHO (22 Sep 2026). */
export const WHO = {
  title: 'Discipline taught me how to push. <mark>Presence taught me when not to.</mark>',
  lead: 'This workshop brings together my 17+ years in martial arts and my experience in teaching and life coaching.',
  lines: [
    '2nd Dan black belt and Shido-In at Shinbukan Karate, the school his father, Kazuo Saito, 10th Dan, founded in 1978.',
    'Ordained in 2014 at Koyasan Seizanji.',
    'A practising high-school teacher, featured on SBS World News for his work with young people.',
  ],
  sbs: { label: 'Read the SBS feature', href: 'https://www.sbs.com.au/news/small-business-secrets/article/karate-helps-mental-physcial-health/sglf9zcfw' },
  portrait: 'workshop-gi-v1',
  portraitAlt: 'Harrison Saito standing in his gi and black belt in front of a shoji screen',
  /* already public on the home page's wall */
  photos: [
    { img: 'wall-k11-v1', alt: 'Harrison standing with a client on the mats before a session', caption: 'With a client on the mats', pos: '50% 12%' },
    { img: 'wall-p53-v1', alt: 'Harrison and a friend sitting on the lawn, mid-conversation', caption: 'On the lawn', pos: '50% 60%' },
    { img: 'wall-k16-v1', alt: 'Harrison and a student sitting on the mats, seen from behind, looking out over the valley', caption: 'Out over the valley', pos: '50% 74%' },
  ],
};

export const NEXT = {
  title: 'If you want to <mark>take it further.</mark>',
  lead: 'For those who want to take the work further, I’ll also explain how Return to Self provides 12 weeks of personalised practice and support.',
  body: 'The workshop gives you a complete practice for one situation. The 12 weeks are personalised work on recurring patterns, with repeated practice and feedback in the relationship you choose. If you’re interested, there is a conversation about fit, with room to decline.',
};

export const ANSWERS = [
  {
    q: 'Do I have to share?',
    a: 'No. Sharing is optional. You choose one relationship and one recent, manageable moment, and how much of it you say out loud is up to you.',
  },
  {
    q: 'Is this therapy?',
    a: 'No. This is coaching. It is not therapy, diagnosis or emergency care, and it is not a replacement for any of them. If you are in crisis, contact Lifeline on 13 11 14.',
  },
  {
    q: 'When is it, and what does it cost?',
    a: 'Registering your interest costs nothing. Harrison will share the next date and any cost when he speaks with you.',
  },
];

export const APPLY = {
  title: 'Apply to practise <mark>these tools with me.</mark>',
};

export const FORM = {
  id: 'before-you-react',
  submit: 'Register your interest',
  successHeading: 'Thank you.',
  successBody: 'Harrison will reach out directly. Pick up to three windows for his call.',
  callLabel: 'When can he call?',
  call: {
    tz: 'Australia/Sydney',
    days: 7,
    from: 1,
    block: 2,
    weekday: [8, 10, 12, 14, 16, 18],
    weekend: [8, 10, 12, 14, 16, 18],
    max: 3,
    hint: 'Sydney time, two-hour windows, up to three',
    countLabel: '{n} of {max}',
    confirm: 'Confirm windows',
    flexible: 'I’m flexible, any time this week works',
    flexibleLabel: 'any time this week',
  },
  doneHeading: 'Done.',
  doneBody: 'Harrison will call you: {window}.',
  whatsapp: 'Hi Harrison, I’d like to register my interest in the Before You React workshop.',
  ask: { label: 'What moment would you like to handle differently?', placeholder: 'As much or as little as you like' },
};

/* ---- every quoted line is somebody's ------------------------------------- */
const flat = (s: string) => s.toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim();
for (const w of VOICES.words) {
  const filmed = INTERVIEWS.find((i) => i.name === w.from);
  if (!filmed) throw new Error(`before-you-react.ts: nothing on record from "${w.from}"`);
  if (!flat(filmed.said.join(' … ')).includes(flat(w.said))) throw new Error(`before-you-react.ts: "${w.said}" is not what ${w.from} said`);
}
