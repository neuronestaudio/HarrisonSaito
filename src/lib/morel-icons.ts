/**
 * The "who this is for" line marks, from the harrison-saito-morel template
 * (Home.astro there). One stroke weight, one copper, drawn to the sentence
 * they sit over.
 *
 * Every stroke carries pathLength="1" so CSS can draw it on when the card
 * reveals, and the parts that move on idle are wrapped in an `ico-*` group
 * (morel.css: blink, bob, nod, flicker, ping, drift). Static without JS and
 * under prefers-reduced-motion.
 */
const ICONS: Record<string, string> = {
  /* the mask they see — calm face, closed eyes that blink, flat mouth */
  mask: `<path pathLength="1" d="M8 7.5C10.5 6.2 13.2 5.5 16 5.5s5.5.7 8 2v8c0 6.2-3.3 10.4-8 12-4.7-1.6-8-5.8-8-12v-8z"/>
    <g class="ico-blink"><path pathLength="1" d="M10.8 14.6q2-1.9 4 0"/><path pathLength="1" d="M17.2 14.6q2-1.9 4 0"/></g>
    <path pathLength="1" d="M12.8 21h6.4"/>`,
  /* the "yes" you said — a speech bubble with the truth struck out */
  saidmeant: `<g class="ico-bob"><path pathLength="1" d="M7 6.5h18a3 3 0 0 1 3 3v9.5a3 3 0 0 1-3 3H14.5L9 26.5v-4.5H7a3 3 0 0 1-3-3V9.5a3 3 0 0 1 3-3z"/>
    <g class="ico-strike"><path pathLength="1" d="M13 10.7l6 6"/><path pathLength="1" d="M19 10.7l-6 6"/></g></g>`,
  /* approval — the thumb that nods and never lands */
  loop: `<g class="ico-nod"><path pathLength="1" d="M10.5 14.5H7A1.5 1.5 0 0 0 5.5 16v9A1.5 1.5 0 0 0 7 26.5h3.5"/>
    <path pathLength="1" d="M10.5 14.5v12"/>
    <path pathLength="1" d="M10.5 14.5l4.4-8.2a2 2 0 0 1 3.7 1.2L18 13h6.4a2 2 0 0 1 2 2.3l-1.5 9.4a2 2 0 0 1-2 1.8H10.5"/></g>`,
  /* held fire — the inner flame flickers */
  ember: `<path pathLength="1" d="M16 27.5c4.8 0 8-3.1 8-7.4 0-5.3-4.9-8.2-6.3-13.8-2.8 2.4-9.7 6.4-9.7 13.8 0 4.3 3.2 7.4 8 7.4z"/>
    <g class="ico-flicker"><path pathLength="1" d="M16 27.5c2.1 0 3.6-1.5 3.6-3.5 0-2.4-2.2-3.7-2.9-6.4-1.3 1.1-4.3 2.9-4.3 6.4 0 2 1.5 3.5 3.6 3.5z"/></g>`,
  /* the standard someone else set — a target whose outer ring keeps moving */
  bar: `<circle class="ico-ping" cx="16" cy="16" r="10"/>
    <circle pathLength="1" cx="16" cy="16" r="10"/>
    <circle pathLength="1" cx="16" cy="16" r="5"/>
    <circle pathLength="1" cx="16" cy="16" r="1.1" fill="currentColor"/>
    <path pathLength="1" d="M16 2.5v3.5M16 26v3.5M2.5 16H6M26 16h3.5"/>`,
  /* close, at arm's length — two links that drift apart and return */
  distance: `<g class="ico-link-l"><path pathLength="1" d="M13.2 18.8l-1.5 1.5a4.2 4.2 0 0 1-5.9-5.9l3.5-3.5a4.2 4.2 0 0 1 5.9 0"/></g>
    <g class="ico-link-r"><path pathLength="1" d="M18.8 13.2l1.5-1.5a4.2 4.2 0 0 1 5.9 5.9l-3.5 3.5a4.2 4.2 0 0 1-5.9 0"/></g>
    <path class="ico-bar" pathLength="1" d="M12.8 19.2l6.4-6.4"/>`,
};

export const forYouIcon = (k: string) =>
  `<svg class="fy__icon fy__icon--${k}" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[k] ?? ICONS.loop}</svg>`;

export const PLAY_ICON = `<svg class="t-card__play" viewBox="0 0 56 56" aria-hidden="true"><circle cx="28" cy="28" r="28" fill="#fff"/><path d="M23 19.5v17l14-8.5z" fill="#14100D"/></svg>`;
