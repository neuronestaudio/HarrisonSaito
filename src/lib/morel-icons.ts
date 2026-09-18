/**
 * The "who this is for" line marks. One stroke weight, one copper, drawn to
 * the sentence they sit over.
 *
 * Every stroke carries pathLength="1" so CSS can draw it on when the card
 * reveals. After that each mark ACTS its sentence (Dion, 18 Sep: "animate
 * them… go hard"): the beam presses down on the column, the comment jolts the
 * bubble, the knob is pulled to off and springs back on, the pause cannot
 * hold still. The parts that move are wrapped in `ico-*` groups; the acts and
 * the clock they share — one card at a time, round the panel — are in
 * morel-overrides.css ("the marks act"). A part that is redrawn rather than
 * moved carries `ico-redraw` on the stroke itself, with --s for its turn.
 * Static without JS and under prefers-reduced-motion.
 */
const ICONS: Record<string, string> = {
  /* the mask they see — calm face, eyes that blink twice, a flat mouth drawn again */
  mask: `<g class="ico-sway"><path pathLength="1" d="M8 7.5C10.5 6.2 13.2 5.5 16 5.5s5.5.7 8 2v8c0 6.2-3.3 10.4-8 12-4.7-1.6-8-5.8-8-12v-8z"/>
    <g class="ico-blink"><path pathLength="1" d="M10.8 14.6q2-1.9 4 0"/><path pathLength="1" d="M17.2 14.6q2-1.9 4 0"/></g>
    <path class="ico-redraw" pathLength="1" d="M12.8 21h6.4"/></g>`,
  /* the "yes" you said — a speech bubble with the truth struck out, again */
  saidmeant: `<g class="ico-bob"><path pathLength="1" d="M7 6.5h18a3 3 0 0 1 3 3v9.5a3 3 0 0 1-3 3H14.5L9 26.5v-4.5H7a3 3 0 0 1-3-3V9.5a3 3 0 0 1 3-3z"/>
    <g class="ico-pop"><path class="ico-redraw" pathLength="1" d="M13 10.7l6 6"/><path class="ico-redraw" style="--s:1" pathLength="1" d="M19 10.7l-6 6"/></g></g>`,
  /* approval — the thumb that nods and never lands */
  loop: `<g class="ico-nod"><path pathLength="1" d="M10.5 14.5H7A1.5 1.5 0 0 0 5.5 16v9A1.5 1.5 0 0 0 7 26.5h3.5"/>
    <path pathLength="1" d="M10.5 14.5v12"/>
    <path pathLength="1" d="M10.5 14.5l4.4-8.2a2 2 0 0 1 3.7 1.2L18 13h6.4a2 2 0 0 1 2 2.3l-1.5 9.4a2 2 0 0 1-2 1.8H10.5"/></g>`,
  /* held fire — the whole flame leans, the inner one flickers */
  ember: `<g class="ico-lean"><path pathLength="1" d="M16 27.5c4.8 0 8-3.1 8-7.4 0-5.3-4.9-8.2-6.3-13.8-2.8 2.4-9.7 6.4-9.7 13.8 0 4.3 3.2 7.4 8 7.4z"/>
    <g class="ico-flicker"><path pathLength="1" d="M16 27.5c2.1 0 3.6-1.5 3.6-3.5 0-2.4-2.2-3.7-2.9-6.4-1.3 1.1-4.3 2.9-4.3 6.4 0 2 1.5 3.5 3.6 3.5z"/></g></g>`,
  /* the standard someone else set — a target whose rings keep moving out */
  bar: `<circle class="ico-ping" cx="16" cy="16" r="10"/>
    <circle pathLength="1" cx="16" cy="16" r="10"/>
    <g class="ico-pulse"><circle pathLength="1" cx="16" cy="16" r="5"/></g>
    <g class="ico-zap"><circle pathLength="1" cx="16" cy="16" r="1.1" fill="currentColor"/></g>
    <g class="ico-turn"><path pathLength="1" d="M16 2.5v3.5M16 26v3.5M2.5 16H6M26 16h3.5"/></g>`,
  /* close, at arm's length — two links that pull apart and come back */
  distance: `<g class="ico-link-l"><path pathLength="1" d="M13.2 18.8l-1.5 1.5a4.2 4.2 0 0 1-5.9-5.9l3.5-3.5a4.2 4.2 0 0 1 5.9 0"/></g>
    <g class="ico-link-r"><path pathLength="1" d="M18.8 13.2l1.5-1.5a4.2 4.2 0 0 1 5.9 5.9l-3.5 3.5a4.2 4.2 0 0 1-5.9 0"/></g>
    <path class="ico-bar" pathLength="1" d="M12.8 19.2l6.4-6.4"/>`,
};

/* The badge-set icons ("Who This Is For" badge sets, 18 Sep 2026 — claude.ai/artifact/HFxJACikTMB2uWdyViBrxc).
   Drawn to the same rules as the six above: 32 grid, 1.5 stroke, round caps, pathLength="1" on every
   stroke for the draw-on. */
export const BADGE_ICONS: Record<string, string> = {
  /* the one everyone leans on: the beam presses down, the columns take it */
  pillar: `<g class="ico-press"><path pathLength="1" d="M5.5 6.5h21"/><path pathLength="1" d="M7.5 6.5v3h17v-3"/></g><g class="ico-squash"><path pathLength="1" d="M10.5 9.5v14"/><path pathLength="1" d="M16 9.5v14"/><path pathLength="1" d="M21.5 9.5v14"/></g><path pathLength="1" d="M7.5 23.5h17"/><path pathLength="1" d="M5.5 26.5h21"/>`,
  /* one comment: the jolt lands and the whole bubble shakes */
  comment: `<g class="ico-shake"><path pathLength="1" d="M7 6.5h18a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H14l-5 4.5v-4.5H7a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3z"/><g class="ico-zap"><path pathLength="1" d="M17.2 9.6l-3.6 4.8h4.4l-3.6 4.8"/></g></g>`,
  /* running on empty: one bar left, blinking out */
  battery: `<g class="ico-sag"><path pathLength="1" d="M6 10.5h17a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z"/><path pathLength="1" d="M25 14h1.5a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H25"/><g class="ico-bar"><path pathLength="1" d="M7.5 14v4"/></g></g>`,
  /* can't switch off: the knob is pulled to off and springs back on */
  switch: `<path pathLength="1" d="M11 10h10a6 6 0 0 1 0 12H11a6 6 0 0 1 0-12z"/><g class="ico-tug"><circle pathLength="1" cx="21" cy="16" r="3.5"/></g>`,
  /* braced: the shoulders come up, the tension lines fire */
  braced: `<g class="ico-shrug"><circle pathLength="1" cx="16" cy="9.5" r="3.8"/><path pathLength="1" d="M6 26.5v-3c0-4 2.6-7 6-7.8l4 1.8 4-1.8c3.4.8 6 3.8 6 7.8v3"/></g><path class="ico-redraw" pathLength="1" d="M7 13.5l-2.5-1.2"/><path class="ico-redraw" pathLength="1" d="M25 13.5l2.5-1.2"/><path class="ico-redraw" style="--s:1" pathLength="1" d="M8.6 10.4L7.2 8.4"/><path class="ico-redraw" style="--s:1" pathLength="1" d="M23.4 10.4l1.4-2"/>`,
  /* snap: the bolt fires */
  bolt: `<circle class="ico-ping" cx="16" cy="16" r="9"/><g class="ico-zap"><path pathLength="1" d="M18 3.5L8.5 17.5h7l-2 11 10-14.5h-7z"/></g>`,
  /* awake, replaying: the moon rocks, the thoughts keep rising */
  moon: `<g class="ico-sway"><path pathLength="1" d="M23.5 20.5A10 10 0 1 1 12.2 6.8a8 8 0 0 0 11.3 13.7z"/></g><g class="ico-rise"><path pathLength="1" d="M21 7h5"/><path pathLength="1" d="M21 10.5h3.5"/></g>`,
  /* home, on guard: the shield beats at the door */
  homeguard: `<path pathLength="1" d="M4.5 15L16 5.5 27.5 15"/><path pathLength="1" d="M7.5 12.8v13.7h17V12.8"/><circle class="ico-ping" cx="16" cy="20.4" r="5.4"/><g class="ico-pulse"><path pathLength="1" d="M16 15.5l4 1.5v3c0 2.7-1.7 4.5-4 5.4-2.3-.9-4-2.7-4-5.4v-3z"/></g>`,
  /* worth as a to-do list: ticked, and ticked again */
  checklist: `<path pathLength="1" d="M9.5 7h13A1.5 1.5 0 0 1 24 8.5v18a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 8 26.5v-18A1.5 1.5 0 0 1 9.5 7z"/><g class="ico-bob"><path pathLength="1" d="M12.5 5h7v3.5h-7z"/></g><path class="ico-redraw" pathLength="1" d="M11.5 14.5l1.6 1.6 2.8-3.2"/><path class="ico-redraw" style="--s:1" pathLength="1" d="M18 14.8h3"/><path class="ico-redraw" style="--s:2" pathLength="1" d="M11.5 21l1.6 1.6 2.8-3.2"/><path class="ico-redraw" style="--s:3" pathLength="1" d="M18 21.3h3"/>`,
  /* praise vs criticism: the scale swings and never levels */
  scale: `<path pathLength="1" d="M16 7v19"/><path pathLength="1" d="M11 26.5h10"/><g class="ico-tilt"><path pathLength="1" d="M5.5 12.5l21-4"/><path pathLength="1" d="M5.5 12.5l-3 7"/><path pathLength="1" d="M5.5 12.5l3 7"/><path pathLength="1" d="M2.5 19.5a3 3 0 0 0 6 0z"/><path pathLength="1" d="M26.5 8.5l-3 7"/><path pathLength="1" d="M26.5 8.5l3 7"/><path pathLength="1" d="M23.5 15.5a3 3 0 0 0 6 0z"/></g>`,
  /* the caretaker: a hand holding a heart out, and it beats */
  hands: `<g class="ico-pulse"><path pathLength="1" d="M16 14c-3-2-5-3.9-5-6.1a2.7 2.7 0 0 1 5-1.4 2.7 2.7 0 0 1 5 1.4c0 2.2-2 4.1-5 6.1z"/></g><g class="ico-bob"><path pathLength="1" d="M3.5 21.5l4.3-2.2a4 4 0 0 1 3.6-.1l4.3 2a1.7 1.7 0 0 1-1.4 3.1l-3.3-1.2"/><path pathLength="1" d="M3.5 27l3.6-1.6a4 4 0 0 1 3 0l3.4 1.2a4.5 4.5 0 0 0 3.8-.3l8.6-5.1a1.8 1.8 0 0 0-2-3l-6.4 3.4"/></g>`,
  /* the performer: a star that never settles */
  star: `<circle class="ico-ping" cx="16" cy="15.5" r="9"/><g class="ico-twinkle"><path pathLength="1" d="M16 5l3.2 6.5 7.1 1-5.2 5 1.3 7.1L16 21.2l-6.4 3.4 1.3-7.1-5.2-5 7.1-1z"/></g>`,
  /* rest you haven't earned: the pause cannot hold still */
  pause: `<circle class="ico-ping" cx="16" cy="16" r="11"/><circle pathLength="1" cx="16" cy="16" r="11"/><g class="ico-shake"><path pathLength="1" d="M13.5 11.5v9"/><path pathLength="1" d="M18.5 11.5v9"/></g>`,
  /* the stage and its light: the beam swings */
  spotlight: `<path pathLength="1" d="M12.5 4.5h7"/><g class="ico-sweep"><path pathLength="1" d="M13 4.5l-5 20h16l-5-20"/><g class="ico-bar"><path pathLength="1" d="M16 9v4"/></g></g><path pathLength="1" d="M5.5 27.5h21"/>`,
  /* the perfectionist: a spirit level whose bubble won't settle */
  level: `<path pathLength="1" d="M4 12.5h24a1.5 1.5 0 0 1 1.5 1.5v4a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 18v-4A1.5 1.5 0 0 1 4 12.5z"/><path pathLength="1" d="M12.5 14.5h7v3h-7z"/><g class="ico-wander"><circle pathLength="1" cx="16" cy="16" r=".9" fill="currentColor"/></g><path pathLength="1" d="M7 12.5V15"/><path pathLength="1" d="M25 12.5V15"/>`,
  /* the people pleaser: a bubble that keeps explaining */
  explain: `<g class="ico-bob"><path pathLength="1" d="M7 5.5h18a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H14l-5 4.5v-4.5H7a3 3 0 0 1-3-3v-10a3 3 0 0 1 3-3z"/><path class="ico-redraw" pathLength="1" d="M9 10.5h14"/><path class="ico-redraw" style="--s:1" pathLength="1" d="M9 14h14"/><path class="ico-redraw" style="--s:2" pathLength="1" d="M9 17.5h9"/></g>`,
  /* the protector */
  shield: `<g class="ico-pulse"><path pathLength="1" d="M16 4.5l9 3.3v7.4c0 6-3.9 10.4-9 12.3-5.1-1.9-9-6.3-9-12.3V7.8z"/><path class="ico-redraw" pathLength="1" d="M12.2 16.2l2.6 2.6 5-5.3"/></g>`,
  /* escape: out the door, and gone */
  exit: `<path pathLength="1" d="M18.5 9V5.5h-12v21h12V23"/><g class="ico-leave"><path pathLength="1" d="M12.5 16h15"/><path pathLength="1" d="M23.5 12l4 4-4 4"/></g>`,
  /* reading the room: the eye darts */
  eye: `<path pathLength="1" d="M3 16s4.8-8.5 13-8.5S29 16 29 16s-4.8 8.5-13 8.5S3 16 3 16z"/><g class="ico-dart"><circle pathLength="1" cx="16" cy="16" r="3.8"/><circle pathLength="1" cx="16" cy="16" r="1" fill="currentColor"/></g>`,
  /* the same argument, again: a full turn, back where it started */
  cycle: `<g class="ico-spin"><path pathLength="1" d="M25 12.5A9.5 9.5 0 0 0 7.3 11.2"/><path pathLength="1" d="M25.3 7.5v5h-5"/><path pathLength="1" d="M7 19.5a9.5 9.5 0 0 0 17.7 1.3"/><path pathLength="1" d="M6.7 24.5v-5h5"/></g>`,
  /* what you pass on: the small one copies the big one */
  family: `<g class="ico-bob"><circle pathLength="1" cx="11.5" cy="8" r="3.2"/><path pathLength="1" d="M6 27v-7.5a5.5 5.5 0 0 1 11 0V27"/></g><g class="ico-bob ico-late"><circle pathLength="1" cx="22.5" cy="14.5" r="2.4"/><path pathLength="1" d="M19 27v-4.5a3.5 3.5 0 0 1 7 0V27"/></g>`,
  /* the goal, and nothing */
  trophy: `<circle class="ico-ping" cx="16" cy="11" r="8"/><g class="ico-tilt"><path pathLength="1" d="M10 5.5h12v6a6 6 0 0 1-12 0z"/><path pathLength="1" d="M10 7.5H6.8a3.2 3.2 0 0 0 3.6 4.6"/><path pathLength="1" d="M22 7.5h3.2a3.2 3.2 0 0 1-3.6 4.6"/></g><path pathLength="1" d="M16 17.5v4.5"/><path pathLength="1" d="M13 22h6v4.5h-6z"/><g class="ico-bar"><path pathLength="1" d="M10.5 26.5h11"/></g>`,
  /* discipline as a hiding place: the shackle lifts, and drops shut */
  lock: `<path pathLength="1" d="M9.5 14.5h13A1.5 1.5 0 0 1 24 16v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 8 25v-9a1.5 1.5 0 0 1 1.5-1.5z"/><g class="ico-lift"><path pathLength="1" d="M11.5 14.5V11a4.5 4.5 0 0 1 9 0v3.5"/></g><g class="ico-bar"><path pathLength="1" d="M16 19.2v3"/></g>`,
  /* the first step he won't take */
  stairs: `<path pathLength="1" d="M3.5 26.5h6v-5h6v-5h6v-5h7"/><g class="ico-climb"><circle pathLength="1" cx="6" cy="17.5" r="1.8"/><path pathLength="1" d="M6 19.5v7"/></g>`,
  /* the voice he uses on himself */
  mirror: `<ellipse pathLength="1" cx="16" cy="12.5" rx="7.5" ry="8.5"/><path pathLength="1" d="M16 21v5.5"/><path pathLength="1" d="M11.5 27h9"/><g class="ico-glint"><path pathLength="1" d="M12.3 10.2c.7-2 2-3.3 3.7-3.8"/></g>`,
  /* twenty years of holding it: the bowl shudders, the crack runs again */
  vessel: `<g class="ico-shake"><path pathLength="1" d="M4.5 11.5h23"/><path pathLength="1" d="M5.5 11.5c.5 7.5 4.8 12.5 10.5 12.5s10-5 10.5-12.5"/><path class="ico-redraw" pathLength="1" d="M18.5 11.5l-2 4 2.5 2.2-2 4"/></g><path pathLength="1" d="M16 24v3.5"/><path pathLength="1" d="M12 27.5h8"/>`,
  /* got there, not what you wanted: the flag flaps over nothing */
  summit: `<path pathLength="1" d="M3 26.5L12 12l4.5 6.5 3.5-5.5 9 13.5z"/><path pathLength="1" d="M20 13V5"/><g class="ico-wave"><path pathLength="1" d="M20 5.5l5.5 2.2L20 10"/></g>`,
  /* the one everyone calls: it rings */
  phone: `<g class="ico-ring"><path pathLength="1" d="M9.3 5.5l3.3 4.7-2.3 2.5a15.5 15.5 0 0 0 9.3 9.3l2.5-2.3 4.7 3.3-1.9 3.6c-9.6.5-19.2-9.1-18.7-18.7z"/></g><path class="ico-redraw" style="--s:1" pathLength="1" d="M19.5 9a3.5 3.5 0 0 1 3.5 3.5"/><path class="ico-redraw" style="--s:2" pathLength="1" d="M19.5 5a7.5 7.5 0 0 1 7.5 7.5"/>`,
  /* next year, again */
  calendar: `<path pathLength="1" d="M6 8h20v18.5H6z"/><path pathLength="1" d="M6 13h20"/><g class="ico-bob"><path pathLength="1" d="M11 5.5v5"/><path pathLength="1" d="M21 5.5v5"/></g><g class="ico-leave"><path pathLength="1" d="M11.5 19.5h8"/><path pathLength="1" d="M17 17l2.5 2.5L17 22"/></g>`,
  /* still waiting to be seen: struck out, again */
  unseen: `<path pathLength="1" d="M3 16s4.8-8.5 13-8.5S29 16 29 16s-4.8 8.5-13 8.5S3 16 3 16z"/><g class="ico-dart"><circle pathLength="1" cx="16" cy="16" r="3.8"/></g><path class="ico-redraw" style="--s:2" pathLength="1" d="M5.5 5.5l21 21"/>`,
  /* someone who isn't in the room */
  chair: `<path pathLength="1" d="M10 4.5h12v10H10z"/><path pathLength="1" d="M8 14.5h16v3.5H8z"/><path pathLength="1" d="M9.5 18v9"/><path pathLength="1" d="M22.5 18v9"/><circle class="ico-ping" cx="16" cy="11" r="7"/><circle class="ico-ping ico-late" cx="16" cy="11" r="7"/>`,
  /* his voice, still carrying: wave after wave */
  echo: `<g class="ico-pulse"><circle pathLength="1" cx="8.5" cy="16" r="2.5"/></g><path class="ico-redraw" pathLength="1" d="M13.5 11.5a6.5 6.5 0 0 1 0 9"/><path class="ico-redraw" style="--s:1" pathLength="1" d="M17.5 8.5a11 11 0 0 1 0 15"/><path class="ico-redraw" style="--s:2" pathLength="1" d="M21.5 5.5a15 15 0 0 1 0 21"/>`,
  /* waiting on him: turned over, and over */
  hourglass: `<g class="ico-flip"><path pathLength="1" d="M9 4.5h14"/><path pathLength="1" d="M9 27.5h14"/><path pathLength="1" d="M10.5 4.5c0 5.5 5.5 7.5 5.5 11.5s-5.5 6-5.5 11.5"/><path pathLength="1" d="M21.5 4.5c0 5.5-5.5 7.5-5.5 11.5s5.5 6 5.5 11.5"/><g class="ico-bar"><path pathLength="1" d="M13.2 24.5h5.6"/><path pathLength="1" d="M16 18v5"/></g></g>`,
  /* in his footsteps: one, then the other */
  footsteps: `<g class="ico-step-a"><ellipse pathLength="1" cx="11" cy="10.5" rx="3.2" ry="4.8"/><ellipse pathLength="1" cx="11" cy="19" rx="2.4" ry="2"/></g><g class="ico-step-b"><ellipse pathLength="1" cx="21" cy="15.5" rx="3.2" ry="4.8"/><ellipse pathLength="1" cx="21" cy="24" rx="2.4" ry="2"/></g>`,
  /* love and hurt, together: it beats, and the crack runs again */
  heartcrack: `<g class="ico-pulse"><path pathLength="1" d="M16 27C8.5 22 4 17.7 4 12.6 4 9.2 6.6 6.5 10 6.5c2.5 0 4.6 1.5 6 3.6 1.4-2.1 3.5-3.6 6-3.6 3.4 0 6 2.7 6 6.1 0 5.1-4.5 9.4-12 14.4z"/><path class="ico-redraw" style="--s:1" pathLength="1" d="M16 10.1l-2 4.2 3.4 2.6-2.3 4.3"/></g>`,
};

export const forYouIcon = (k: string) =>
  `<svg class="fy__icon fy__icon--${k}" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[k] ?? BADGE_ICONS[k] ?? ICONS.loop}</svg>`;

export const PLAY_ICON = `<svg class="t-card__play" viewBox="0 0 56 56" aria-hidden="true"><circle cx="28" cy="28" r="28" fill="#fff"/><path d="M23 19.5v17l14-8.5z" fill="#14100D"/></svg>`;
