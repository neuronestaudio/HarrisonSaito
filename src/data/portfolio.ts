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
};

export const DOORS: Door[] = [
  {
    icon: 'stairs',
    tag: 'The programme',
    name: 'Return to Self',
    line: 'Twelve weeks, three phases. The core of the work.',
    href: '/return-to-self',
  },
  {
    icon: 'pause',
    tag: 'Three seats',
    name: 'The Workshop',
    line: 'One room, three people, one hour with Harrison.',
    href: '/workshop',
  },
  {
    icon: 'comment',
    name: '1:1 Coaching',
    line: 'Session by session, at your pace.',
    href: '/mens-coaching',
  },
  {
    icon: 'summit',
    name: 'Shinbukan Karate',
    line: 'His father’s school. 2nd Dan, Shido-In.',
    href: '/about',
  },
  {
    icon: 'explain',
    name: 'HSC & Youth Mentoring',
    line: 'English, mindset and pressure, one to one.',
    href: '/hsc-tutoring',
  },
  {
    icon: 'eye',
    name: 'Films & Media',
    line: 'SBS World News, the interviews, the practice on film.',
    href: '/media',
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
export type Room = { icon: string; name: string; sub: string };
export const ROOMS: Room[] = [
  { icon: 'stairs', name: 'The Core', sub: 'Twelve weeks. Separate, return, integrate.' },
  { icon: 'summit', name: 'Dojo', sub: 'Shinbukan. His father’s school.' },
  { icon: 'moon', name: 'Temple', sub: 'Koyasan. Attention, not belief.' },
  { icon: 'mirror', name: 'Return to Self', sub: 'The practice: notice, then choose.' },
  { icon: 'comment', name: 'One on One', sub: 'Coaching, session by session.' },
  { icon: 'ember', name: 'Breathwork', sub: 'The monthly room. Sixteen seats.' },
];

/** His other channels — the way out of the site, on purpose. */
export const CHANNELS = [
  { label: 'Instagram', href: 'https://www.instagram.com/harrison_saito/' },
  { label: 'YouTube', href: 'https://www.youtube.com/@Harrison_saito' },
  { label: 'SBS World News', href: LINKS.sbsWorldNews },
];
