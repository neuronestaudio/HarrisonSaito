/**
 * Motion system.
 *
 * Three jobs:
 *   1. Smooth scroll (Lenis) driving a single GSAP ticker — one rAF loop, not two.
 *   2. Reveals that never start invisible. Audit finding H7: the legacy site
 *      animated from opacity 0, so fast scrolling or an #anchor jump left whole
 *      viewports blank. Here everything sits at 0.3 and only ever adds.
 *   3. The calligraphy wash and the scroll-drawn ensō.
 *
 * The entire module is opt-out: prefers-reduced-motion short-circuits it and
 * the CSS already renders every element in its final state.
 */
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Exposed so scripts/check-pin.mjs can interrogate live trigger ranges rather
// than guessing scroll offsets. Harmless in production.
(window as unknown as { ScrollTrigger?: typeof ScrollTrigger }).ScrollTrigger = ScrollTrigger;

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = window.matchMedia('(pointer: coarse)').matches;

/* ---------------------------------------------------------- smooth scroll */

function initLenis() {
  // Touch devices already have good native inertia; hijacking it makes things
  // worse and costs battery.
  if (reduceMotion || coarse) return null;

  const lenis = new Lenis({
    duration: 1.05,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.6,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Anchor links inside the page hand off to Lenis so the easing matches.
  document.addEventListener('click', (e) => {
    const link = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href')!;
    if (id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target as HTMLElement, { offset: -80, duration: 1.2 });
    history.pushState(null, '', id);
  });

  return lenis;
}

/* --------------------------------------------------------------- reveals */

/**
 * IntersectionObserver rather than ScrollTrigger for the bulk reveals: it is
 * cheaper, and critically it fires for elements already in view on load, which
 * is what keeps a deep-linked #anchor from landing on a dimmed section.
 */
function initReveals() {
  const items = document.querySelectorAll<HTMLElement>(
    '[data-reveal], [data-reveal-stagger], [data-ink-reveal]'
  );
  if (!items.length) return;

  if (reduceMotion) {
    items.forEach((el) => el.classList.add('is-revealed'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;

        // Stagger children by their own index rather than a fixed delay, so a
        // 12-item grid cascades instead of arriving in one slab.
        if (el.hasAttribute('data-reveal-stagger')) {
          const step = Number(el.dataset.revealStagger) || 70;
          Array.from(el.children).forEach((child, i) => {
            (child as HTMLElement).style.transitionDelay = `${i * step}ms`;
          });
        }

        el.classList.add('is-revealed');

        // Line-by-line rise for split headings.
        el.querySelectorAll<HTMLElement>('.split-line > span').forEach((line, i) => {
          line.style.setProperty('--line-delay', `${i * 90}ms`);
        });

        io.unobserve(el);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );

  items.forEach((el) => io.observe(el));

  // Safety net: anything still unrevealed after 3s gets revealed anyway. If an
  // observer ever misfires the visitor sees content, not a dim page.
  setTimeout(() => items.forEach((el) => el.classList.add('is-revealed')), 3000);
}

/* ---------------------------------------------------- calligraphy parallax */

/**
 * The faded brush layer. Each glyph carries data-speed; positive drifts slower
 * than the page (recedes), negative drifts faster (advances).
 */
function initCalligraphy() {
  if (reduceMotion) return;

  const glyphs = gsap.utils.toArray<HTMLElement>('.calligraphy, .drift-word');

  glyphs.forEach((el) => {
    const speed = Number(el.dataset.speed) || 0.25;
    const rotate = Number(el.dataset.rotate) || 0;

    gsap.fromTo(
      el,
      { yPercent: -speed * 50, rotate },
      {
        yPercent: speed * 50,
        rotate: rotate + (Number(el.dataset.rotateBy) || 0),
        ease: 'none',
        scrollTrigger: {
          trigger: el.closest('.section') || el.parentElement,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      }
    );
  });
}

/* ------------------------------------------------------- image parallax */

/** Slow drift on framed photography — subtle, never more than ~12% of height. */
function initImageParallax() {
  if (reduceMotion || coarse) return;

  gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
    const amount = Number(el.dataset.parallax) || 12;
    gsap.fromTo(
      el,
      { yPercent: -amount / 2 },
      {
        yPercent: amount / 2,
        ease: 'none',
        scrollTrigger: {
          trigger: el.parentElement,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      }
    );
  });
}

/* ------------------------------------------------------------------ ensō */

/**
 * 円相 — the ensō, which is also the brand mark: a brushed circle with an S
 * through it. It paints itself in clockwise as you scroll, sweeping from the
 * red accent at roughly ten o'clock. On the programme page the circle closes
 * exactly as the reader reaches the twelfth week.
 *
 * The sweep is a conic-gradient mask driven by a CSS custom property. GSAP
 * writes the value on each tick rather than interpolating the property itself,
 * which avoids needing @property registration for browser-side interpolation.
 */
function initEnso() {
  const ensos = document.querySelectorAll<HTMLElement>('[data-enso]');

  ensos.forEach((el) => {
    if (reduceMotion) {
      el.style.setProperty('--enso-sweep', '360deg');
      return;
    }

    // The hero mark is already at the top of the page, so a scroll-linked
    // sweep would be complete before the visitor did anything. It paints in
    // on load instead, as part of the hero timeline.
    if (el.closest('[data-hero]')) return;

    const state = { sweep: 0 };
    el.style.setProperty('--enso-sweep', '0deg');

    const scope = el.closest('[data-enso-scope]') || el.closest('.section') || el.parentElement;

    gsap.to(state, {
      sweep: 360,
      ease: 'none',
      onUpdate: () => el.style.setProperty('--enso-sweep', `${state.sweep}deg`),
      scrollTrigger: {
        trigger: scope,
        start: 'top 78%',
        end: 'bottom 85%',
        scrub: 0.6,
      },
    });
  });
}

/* -------------------------------------------------- pinned phase timeline */

/**
 * 守破離. The three phases scroll horizontally while the section is pinned,
 * so the reader physically travels through Separate -> Return -> Integrate.
 * Falls back to a normal vertical stack on touch and narrow viewports.
 */
function initPhaseTimeline() {
  const track = document.querySelector<HTMLElement>('[data-phase-track]');
  if (!track || reduceMotion) return;
  if (window.matchMedia('(max-width: 900px)').matches) return;

  const panels = gsap.utils.toArray<HTMLElement>('[data-phase-panel]', track);
  if (panels.length < 2) return;

  const scroller = track.parentElement!;

  const tween = gsap.to(panels, {
    xPercent: -100 * (panels.length - 1),
    ease: 'none',
    scrollTrigger: {
      trigger: scroller,
      pin: true,
      scrub: 0.8,
      snap: {
        snapTo: 1 / (panels.length - 1),
        duration: { min: 0.18, max: 0.42 },
        // Wait for the wheel to actually stop before settling, otherwise snap
        // grabs the page mid-gesture and feels like it is fighting the reader.
        delay: 0.1,
        ease: 'power2.inOut',
      },
      // Scroll distance == horizontal distance left to travel, so vertical
      // scroll maps 1:1 onto sideways movement. Using the full track width
      // overshoots by a panel and parks the reader on a static screen.
      end: () => `+=${Math.max(track.scrollWidth - window.innerWidth, 1)}`,
      invalidateOnRefresh: true,
    },
  });

  // Kanji swap in the backdrop as each phase takes the stage.
  panels.forEach((panel, i) => {
    const glyph = panel.querySelector('[data-phase-glyph]');
    if (!glyph) return;
    gsap.fromTo(
      glyph,
      { opacity: 0.05, scale: 0.94 },
      {
        opacity: 0.13,
        scale: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: panel,
          containerAnimation: tween,
          start: 'left center',
          end: 'right center',
          scrub: true,
        },
      }
    );
  });
}

/* ------------------------------------------------------------ hero intro */

function initHero() {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero) return;

  if (reduceMotion) return;

  // The brand mark is brushed in a single stroke, so it arrives that way —
  // painting clockwise from the red accent while the headline rises.
  const heroEnso = hero.querySelector<HTMLElement>('[data-enso]');
  if (heroEnso) {
    const state = { sweep: 0 };
    heroEnso.style.setProperty('--enso-sweep', '0deg');
    gsap.to(state, {
      sweep: 360,
      duration: 2.4,
      delay: 0.35,
      ease: 'power2.inOut',
      onUpdate: () => heroEnso.style.setProperty('--enso-sweep', `${state.sweep}deg`),
    });
  }

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from('[data-hero-eyebrow]', { y: 18, opacity: 0, duration: 0.9, delay: 0.15 })
    .from('[data-hero-line] > span', { yPercent: 110, duration: 1.15, stagger: 0.12 }, '-=0.6')
    .from('[data-hero-sub]', { y: 16, opacity: 0, duration: 0.9 }, '-=0.7')
    .from('[data-hero-cta]', { y: 14, opacity: 0, duration: 0.8, stagger: 0.1 }, '-=0.6')
    .from('[data-hero-scroll]', { opacity: 0, duration: 0.8 }, '-=0.4');

  // The hero plate drifts up and fades as you leave it.
  if (!coarse) {
    gsap.to('[data-hero-media]', {
      yPercent: 18,
      scale: 1.08,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
    });
    gsap.to('[data-hero-content]', {
      yPercent: 34,
      opacity: 0.15,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
    });
  }
}

/* ----------------------------------------------------- scroll progress bar */

function initProgress() {
  const bar = document.querySelector<HTMLElement>('[data-scroll-progress]');
  if (!bar) return;
  gsap.to(bar, {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: 0.3 },
  });
}

/* ------------------------------------------------------------------ init */

export function initMotion() {
  document.documentElement.classList.remove('no-js');

  initLenis();
  initReveals();

  if (!reduceMotion) {
    initHero();
    initCalligraphy();
    initImageParallax();
    initEnso();
    initPhaseTimeline();
    initProgress();
  }

  // Fonts change metrics; recalculate trigger positions once they land.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh());
}
