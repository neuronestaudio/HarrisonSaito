/**
 * Infinite coverflow.
 *
 * Ported from formulamobile's www/assets/js/select.js and shared by every
 * carousel on the site, so the mechanic exists once rather than per component.
 *
 * Infinite looping without cloning any DOM. For each card we compute its
 * SIGNED SHORTEST distance to the active index, wrapped around the ring:
 *
 *     d = ((i - current) mod n + n + floor(n/2)) mod n - floor(n/2)
 *
 * so with 7 cards, card 0 sits at d = -1 when current is 1, and at d = +3 when
 * current is 4 — it takes the short way round either way. Cards are then placed
 * purely by transform from that d. Nothing is reordered, nothing is duplicated,
 * and there is no seam to jump at because there is no seam.
 *
 * TWO DELIBERATE DEVIATIONS from the source, both because the original owns an
 * entire fixed viewport and these instances sit inside a long scrolling page:
 *
 *   wheel     the source preventDefaults every wheel event. Here that would
 *             trap vertical scroll and strand the visitor mid-page, so only
 *             horizontal intent (trackpad swipe, shift-wheel) drives the ring.
 *   keyboard  the source binds arrow keys to window unconditionally. Here they
 *             only act while the carousel is actually on screen, so they are
 *             not stolen from someone reading a different section.
 */

export type CoverflowOptions = {
  /** Fired when the active index changes, for analytics. */
  onChange?: (index: number, card: HTMLElement) => void;
};

export function initCoverflow(root: HTMLElement, options: CoverflowOptions = {}) {
  const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-card]'));
  const bgs = Array.from(root.querySelectorAll<HTMLElement>('[data-bg]'));
  const pips = Array.from(root.querySelectorAll<HTMLElement>('[data-pip]'));
  const curEl = root.querySelector<HTMLElement>('[data-cur]');
  const n = cards.length;
  if (!n) return;

  let current = 0;

  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* signed shortest distance around the ring */
  function dist(i: number) {
    const half = Math.floor(n / 2);
    return ((((i - current) % n) + n + half) % n) - half;
  }

  function render() {
    cards.forEach((card, i) => {
      const d = dist(i);
      const ad = Math.abs(d);
      const active = d === 0;

      // only the nearest few are worth painting
      const visible = ad <= 3;
      card.style.setProperty('--d', String(d));
      card.style.setProperty('--ad', String(ad));
      card.style.setProperty('--s', String(active ? 1 : Math.max(0.66, 1 - ad * 0.13)));
      card.style.setProperty(
        '--o',
        String(visible ? (active ? 1 : Math.max(0, 0.62 - (ad - 1) * 0.22)) : 0)
      );
      card.style.setProperty('--z', String(20 - ad));
      card.classList.toggle('is-active', active);
      card.setAttribute('aria-hidden', active ? 'false' : 'true');
      card.tabIndex = active ? 0 : -1;
      // keep offscreen cards out of hit-testing
      card.style.pointerEvents = visible ? 'auto' : 'none';
    });

    bgs.forEach((b, i) => b.classList.toggle('is-on', i === current));
    pips.forEach((p, i) => p.setAttribute('aria-selected', i === current ? 'true' : 'false'));
    if (curEl) curEl.textContent = String(current + 1).padStart(2, '0');

    options.onChange?.(current, cards[current]);
  }

  const go = (delta: number) => {
    current = (((current + delta) % n) + n) % n;
    render();
  };
  const goTo = (i: number) => {
    current = ((i % n) + n) % n;
    render();
  };
  const touched = () => root.classList.add('is-touched');

  /* ---- wheel: horizontal intent only ---- */
  let acc = 0;
  let cooling = false;
  root.addEventListener(
    'wheel',
    (e) => {
      const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey;
      if (!horizontal) return; // let the page scroll

      e.preventDefault();
      touched();
      if (cooling) return;

      acc += e.shiftKey && !e.deltaX ? e.deltaY : e.deltaX;

      if (Math.abs(acc) > 42) {
        go(acc > 0 ? 1 : -1);
        acc = 0;
        cooling = true;
        setTimeout(() => { cooling = false; }, reduced() ? 40 : 340);
      }
    },
    { passive: false }
  );

  /* ---- drag / swipe ---- */
  let startX: number | null = null;
  let moved = false;

  root.addEventListener('pointerdown', (e) => {
    if ((e.target as HTMLElement).closest('a,button')) return;
    startX = e.clientX;
    moved = false;
  });

  root.addEventListener('pointermove', (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 60) {
      touched();
      go(dx < 0 ? 1 : -1);
      startX = e.clientX;
      moved = true;
    }
  });

  const endDrag = () => { startX = null; };
  root.addEventListener('pointerup', endDrag);
  root.addEventListener('pointercancel', endDrag);
  root.addEventListener('pointerleave', endDrag);

  /* ---- click a side card to bring it forward ---- */
  cards.forEach((card, i) => {
    card.addEventListener('click', (e) => {
      if (moved) { e.preventDefault(); return; }
      if (dist(i) !== 0) {
        e.preventDefault();
        touched();
        goTo(i);
      }
      // the active card's CTA is a real link — let it through
    });
  });

  /* ---- arrows + pips ---- */
  root.querySelector('[data-prev]')?.addEventListener('click', () => { touched(); go(-1); });
  root.querySelector('[data-next]')?.addEventListener('click', () => { touched(); go(1); });
  pips.forEach((p, i) => p.addEventListener('click', () => { touched(); goTo(i); }));

  /* ---- keyboard, scoped to when this carousel is on screen ---- */
  let inView = false;
  new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; }, { threshold: 0.35 })
    .observe(root);

  window.addEventListener('keydown', (e) => {
    if (!inView && !root.contains(document.activeElement)) return;
    if (e.key === 'ArrowRight') { touched(); go(1); e.preventDefault(); }
    else if (e.key === 'ArrowLeft') { touched(); go(-1); e.preventDefault(); }
    else if (e.key === 'Home') { touched(); goTo(0); e.preventDefault(); }
    else if (e.key === 'End') { touched(); goTo(n - 1); e.preventDefault(); }
  });

  render();
}
