/**
 * The wall — "what they took with them" (Dion, 18 Sep 2026: "heaps of photos
 * of testimonies… bento-box style… all the different types of people, the
 * successes, one thing they learned… a bit more credibility").
 *
 * Two kinds of tile, and they are kept honest about which is which:
 *
 *   quote  — the WORDS. Every one is lifted either from the eleven written
 *            testimonials in site.ts (TESTIMONIALS) or from what a client said
 *            on camera on 9 Sep (interviews.ts, `said` — word for word off the
 *            transcript), under the name of the person it came from. They lead
 *            with what the person GOT (Dion, 25 Sep: benefits, not features). `big` is the one thing they learned (two words, or
 *            four and more — three cannot wrap without stranding one), `quote`
 *            a fuller line; both must be found verbatim in that person's
 *            testimonial, and the check at the foot of this file fails the
 *            build if either is not. Cut for length, never for meaning.
 *   photo  — the PEOPLE. Harrison at work — sessions, classes, the five
 *            clients filmed for their testimonies on 9 Sep 2026 — captioned
 *            for what the picture is. No photo is captioned with a name, and
 *            no quote is hung on a face it did not come from: the filmed
 *            testimonies are not transcribed yet, so those men's own words are
 *            not here. (The four small portraits inside quote tiles ARE the
 *            people quoted — they came with the testimonials.)
 *
 * Before ads point here: each of the five filmed clients should have said yes
 * to being on the site (the shoot plan leaves releases open). Each is one
 * entry below; deleting the entry removes the man.
 *
 * Photographs: D:\CLIENTS\HARRISON\_cover-photo-sourcing (graded P/K sets),
 * stills from his own published films and the 9 Sep shoot; none with a
 * burned-in caption in frame, and no minors.
 */
import { TESTIMONIALS } from './site';
import { INTERVIEWS } from './interviews';

export type Tone = 'ink' | 'paper' | 'gold';

export type QuoteTile = {
  type: 'quote';
  size: 'feature' | 'line';
  tone: Tone;
  /** the kind of person this is */
  kicker: string;
  /** the one thing, in their words */
  big: string;
  /** a fuller line, in their words (feature tiles) */
  quote?: string;
  /** must match a TESTIMONIALS name */
  name: string;
  /** shown after the name when the words are someone else's that they chose */
  via?: string;
  /** 'filmed' = said on camera (interviews.ts) rather than written to him */
  voice?: 'filmed';
  /** kept off the shorter cut: true = tablet and phone, 'phone' = phone only */
  more?: boolean | 'phone';
};

export type PhotoTile = {
  type: 'photo';
  shape: 'tall' | 'square';
  img: string;
  alt: string;
  caption: string;
  /** object-position, for the square crops */
  pos?: string;
  more?: boolean;
};

export type WallTile = QuoteTile | PhotoTile;

const FILMED = {
  caption: 'Filmed testimony · Sept 2026',
  alt: 'One of Harrison’s clients, filmed giving his testimony in the temple room, September 2026',
};

export const WALL: WallTile[] = [
  /* The order is the layout. On a desk the grid is six columns and these are
     five bands of two rows, each band exactly twelve cells (feature 2×2, line
     2×1, tall photo 1×2, square 1×1), so auto-placement fills a clean
     rectangle with no holes — change a band as a whole or not at all.
     (scratch check: pack.py; 6 cols -> 10 rows, 0 holes.) */

  /* band 1 — feature · tall · tall · line/line */
  {
    type: 'quote', size: 'feature', tone: 'ink', kicker: 'Coaching · Return to Self', name: 'Matt Halpin',
    big: 'Helped me remove the mask',
    quote: 'Harrison helped me remove the mask, calm the mind, and move with intention rather than just speed, power, and grit.',
  },
  { type: 'photo', shape: 'tall', img: 'wall-p05-v1', ...FILMED },
  { type: 'photo', shape: 'tall', img: 'wall-p11-v1', ...FILMED },
  { type: 'quote', size: 'line', tone: 'paper', kicker: 'Karate · three years in', name: 'Alex Wei', big: 'Forge their own path' },
  {
    type: 'quote', size: 'line', tone: 'gold', kicker: 'Coaching · a year in', name: 'James', voice: 'filmed',
    big: 'Just not letting it affect you',
  },

  /* band 2 — tall · feature · tall · square square / line */
  { type: 'photo', shape: 'tall', img: 'wall-k09-v1', alt: 'A student mid-drill on the mats, laughing, Harrison behind her', caption: 'Training on the mats' },
  {
    type: 'quote', size: 'feature', tone: 'paper', kicker: 'Karate student', name: 'Harshil Dave',
    big: 'Be decisive',
    quote: 'I learned how to be calm by being in a state of panic… I learned to be free by imposing restrictions on myself.',
  },
  { type: 'photo', shape: 'tall', img: 'wall-p19-v1', ...FILMED },
  { type: 'photo', shape: 'square', img: 'wall-k16-v1', alt: 'Harrison and a student sitting on the mats, seen from behind, looking out over the valley', caption: 'Out over the valley', pos: '50% 74%', more: true },
  { type: 'photo', shape: 'square', img: 'wall-p53-v1', alt: 'Harrison and a friend sitting on the lawn, mid-conversation', caption: 'On the lawn', pos: '50% 64%', more: true },
  { type: 'quote', size: 'line', tone: 'ink', kicker: 'HSC student', name: 'Lance Perez', big: 'I actually experienced more academic success', more: 'phone' },

  /* band 3 — line/line · tall · feature · tall */
  { type: 'quote', size: 'line', tone: 'paper', kicker: 'HSC student · Brigidine College', name: 'Meg Rolfe', big: 'A confidence within myself' },
  { type: 'photo', shape: 'tall', img: 'wall-p59-v1', alt: 'Two karateka in gi and gloves sparring in the dojo', caption: 'Sparring class in the dojo' },
  {
    type: 'quote', size: 'feature', tone: 'gold', kicker: 'HSC student · Chatswood High', name: 'Marissa Wong',
    big: 'Rank 1 in my grade',
    quote: 'I was able to achieve the ATAR I was aiming for, but also gained a better understanding of myself.',
  },
  { type: 'photo', shape: 'tall', img: 'wall-p23-v1', ...FILMED },
  { type: 'quote', size: 'line', tone: 'ink', kicker: 'Coaching · consultant, 55', name: 'John', voice: 'filmed', big: 'A lot more calmer as a person', more: true },

  /* band 4 — tall · tall · feature · line / square square */
  { type: 'photo', shape: 'tall', img: 'wall-k11-v1', alt: 'Harrison standing with a client on the mats before a session', caption: 'With a client on the mats' },
  { type: 'photo', shape: 'tall', img: 'wall-p28-v1', ...FILMED },
  {
    type: 'quote', size: 'feature', tone: 'ink', kicker: 'Parents · youth martial arts', name: 'Scott & Lisa Bignold',
    big: 'Influencing our parenting in positive ways',
    quote: 'Harrison’s lessons are a safe place for the children to connect, learn about themselves, their lives and the world around them.',
  },
  { type: 'quote', size: 'line', tone: 'gold', kicker: 'Coaching · drummer', name: 'Andrew', voice: 'filmed', big: 'Makes me happier, makes me calmer', more: true },
  { type: 'photo', shape: 'square', img: 'wall-p55-v1', alt: 'Harrison and a client sitting cross-legged in meditation on the mats', caption: 'Meditation', pos: '50% 42%', more: true },
  { type: 'photo', shape: 'square', img: 'wall-k02-v1', alt: 'Harrison in his gi and black belt, teaching technique in the dojo', caption: 'In the dojo', pos: '50% 22%', more: true },

  /* band 5 — tall · feature · tall · the way on (2×2, drawn by the component) */
  { type: 'photo', shape: 'tall', img: 'wall-k13-v1', alt: 'An older student on the mats with one arm raised, grinning', caption: 'A student on the mats', more: true },
  {
    type: 'quote', size: 'feature', tone: 'paper', kicker: 'HSC student · Chatswood High', name: 'Kei Yomoda', more: true,
    big: 'Changed me positively as a person',
    quote: 'I quickly found myself looking forward to these lessons as it was like no ordinary tutoring I have had before.',
  },
  { type: 'photo', shape: 'tall', img: 'wall-p51-v1', alt: 'Harrison steadying a client through a balance drill outdoors', caption: 'Balance drill with a client', more: true },
];

/* ---- the words are theirs: fail the build if a line is not in the testimonial ---- */
const flat = (s: string) => s.toLowerCase().replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim();
for (const t of WALL) {
  if (t.type !== 'quote') continue;
  const written = TESTIMONIALS.find((x) => x.name === t.name);
  const filmed = INTERVIEWS.find((x) => x.name === t.name);
  if (!written && !filmed) throw new Error(`wall.ts: nothing on record from "${t.name}"`);
  const body = flat(written ? written.quote : filmed!.said.join(' … '));
  for (const line of [t.big, ...(t.quote ? t.quote.split('…') : [])]) {
    const piece = flat(line).replace(/[.,;:]+$/, '');
    if (piece && !body.includes(piece)) throw new Error(`wall.ts: "${line}" is not in ${t.name}'s testimonial`);
  }
}

/* The four filmed clients have no written testimonial and no portrait — the
   wall asks for one by name, so answer for them too. */
export const personOf = (name: string) =>
  TESTIMONIALS.find((x) => x.name === name) ?? { name, context: '', category: 'adults' as const, avatar: null, quote: '' };
