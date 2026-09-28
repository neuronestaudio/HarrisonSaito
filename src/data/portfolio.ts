/**
 * The portfolio — six doors under the walk (Dion, 28–29 Sep 2026).
 *
 * "This section should actually be his portfolio (we had a portfolio, which
 * was what we had in the beginning), then the user can choose to progress to
 * learn more about Return to Self or navigate to Harrison's other channels…
 * the six squares IS the new portfolio section." So the home page no longer
 * sells the twelve weeks under the hero — that moved whole to
 * /return-to-self — it shows what he does, in the six-square panel he liked
 * from the walk's "Who this is for" beat (same dark glass, same marks, same
 * sheen), and every square is a door.
 *
 * Facts only. The doors are the site's own pages and the offers the first
 * build listed (src/data/site.ts OFFERS); the karate line is the verified
 * lineage (2nd Dan and Shido-In at Shinbukan, his father's school — see
 * WHO in workshop.ts). Nothing here is a claim he has not already made.
 */
import { LINKS } from './morel-source';

export const PORTFOLIO_SECTION = {
  label: 'Harrison Saito',
  title: 'Educator. Martial artist. <mark>Coach.</mark>',
  lede: 'One practice, taught six ways. Choose the door that fits where you are — the twelve weeks, a single hour, the dojo, or the work on film.',
  foot: 'Not sure which door? Start with a conversation.',
  cta: { label: 'Book a discovery chat', href: '/book' },
};

export type Door = {
  /** a mark from lib/morel-icons.ts */
  icon: string;
  name: string;
  line: string;
  href: string;
  /** a small gold word above the name */
  tag?: string;
  /** the photograph the tile is filled with (Dion, 29 Sep: "those 6 pills as
      image filled so there's actually images on this page"), and where its
      subject sits, as background-position */
  image: string;
  pos?: string;
};

export const DOORS: Door[] = [
  {
    icon: 'stairs',
    tag: 'The programme',
    name: 'Return to Self',
    line: 'Twelve weeks, three phases. The core of the work.',
    href: '/return-to-self',
    /* the match, from the arrival */
    image: '/img/harrison-arrival-v1-640.webp',
    pos: '50% 36%',
  },
  {
    icon: 'pause',
    tag: 'Three seats',
    name: 'The Workshop',
    line: 'One room, three people, one hour with Harrison.',
    href: '/workshop',
    /* the seiza two-shot */
    image: '/img/seiza-pair-v1-768.webp',
    pos: '50% 30%',
  },
  {
    icon: 'comment',
    name: '1:1 Coaching',
    line: 'Session by session, at your pace.',
    href: '/mens-coaching',
    /* him, before the shoji */
    image: '/img/about-shoji-768.webp',
    pos: '50% 28%',
  },
  {
    icon: 'summit',
    name: 'Shinbukan Karate',
    line: 'His father’s school. 2nd Dan, Shido-In.',
    href: '/about',
    /* the stance in the dojo, from the broadcast */
    image: '/img/sbs-karate-2-v1-768.webp',
    pos: '50% 40%',
  },
  {
    /* Dion, 29 Sep: not HSC here — "the temple that's affiliated". Koyasan
       Seizanji, where he was ordained in 2014 (WHO in workshop.ts; never
       "monk" or "priest"). */
    icon: 'moon',
    tag: 'The temple',
    name: 'Koyasan Seizanji',
    line: 'Ordained there in 2014. Attention, not belief.',
    href: '/about',
    image: '/img/buddha-768.webp',
    pos: '50% 42%',
  },
  {
    icon: 'eye',
    name: 'Films & Media',
    line: 'SBS World News, the interviews, the practice on film.',
    href: '/media',
    /* the SBS studio, with his father */
    image: '/img/sbs-group-768.webp',
    pos: '50% 45%',
  },
];

/**
 * The rooms of the house — what comes up along the walk on the home page.
 * Dion, 29 Sep 2026: "as you're going through the house I want the main
 * things to pop up like THE CORE, DOJO, TEMPLE, RETURN TO SELF, ONE ON ONE,
 * BREATHWORK, those box elements to pop up, so it gives direction and image
 * as the users are navigating through the house." His six, in his order;
 * each line is a fact the site already states. They ride the hallway
 * (FrameHero) where the recognition lines ride on the gated pages.
 */
/* 29 Sep, later: "as soon as the person scrolls after the beat, I want the
   core, the dojo, the temple, the other ones, all as a row element sitting at
   the top of the ceiling, and keyframes to stay there as the user progresses
   to the next checkpoint — that way there's references of what Hari does and
   avenues to get there from the get go." So the six ride at the ceiling of the
   walk as a row of links (FrameHero .hall-row), not past him one by one. */
/* Dion, 29 Sep, later still: "each with the picture so there's a proper
   thumbnail — that way the user journey sees a human / Harrison / others
   immediately after scroll; a sense of human touch is receptive." So each
   chip carries a face (`thumb` → /img/room-<k>-v1-{96,192}.webp, cut from
   photographs already on the site; the full-moon one from the asset album). */
export type Room = { icon: string; name: string; sub: string; href: string; thumb: string; thumbAlt: string };
export const ROOMS: Room[] = [
  { icon: 'stairs', name: 'The Core', sub: 'Twelve weeks. Separate, return, integrate.', href: '/return-to-self', thumb: 'room-core-v1', thumbAlt: 'Harrison, lit by a match' },
  { icon: 'summit', name: 'Dojo', sub: 'Shinbukan. His father’s school.', href: '/about', thumb: 'room-dojo-v1', thumbAlt: 'Harrison in his gi' },
  { icon: 'moon', name: 'Temple', sub: 'Koyasan. Attention, not belief.', href: '/about', thumb: 'room-temple-v1', thumbAlt: 'Harrison in seiza, eyes closed' },
  { icon: 'mirror', name: 'Return to Self', sub: 'The practice: notice, then choose.', href: '/return-to-self', thumb: 'room-rts-v1', thumbAlt: 'Harrison before the shoji' },
  { icon: 'comment', name: 'One on One', sub: 'Coaching, session by session.', href: '/mens-coaching', thumb: 'room-one-v1', thumbAlt: 'A client, seated, eyes closed' },
  { icon: 'ember', name: 'Breathwork', sub: 'The monthly room. Sixteen seats.', href: '/workshops', thumb: 'room-breath-v1', thumbAlt: 'Harrison seated on the grass by the water' },
];

/** His other channels — the way out of the site, on purpose. */
export const CHANNELS = [
  { label: 'Instagram', href: 'https://www.instagram.com/harrison_saito/' },
  { label: 'YouTube', href: 'https://www.youtube.com/@Harrison_saito' },
  { label: 'SBS World News', href: LINKS.sbsWorldNews },
];
