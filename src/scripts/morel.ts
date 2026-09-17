/**
 * Behaviour for the ported Morel page (MorelHome.astro), from the
 * harrison-saito-morel template's main.ts. Only the parts the page under the
 * hero uses: reveals, the letter-by-letter intro, grow-on-scroll, the video
 * modal, the patterns carousel and the newsletter. The template's header,
 * consent bar, CTA tracking and /book chooser are this site's own here
 * (Nav.astro, ConsentBar.astro, tracking.ts).
 *
 * Every query is scoped to the `.mo` root, so nothing here can reach the rest
 * of the page.
 */
import { track } from './tracking';

export function initMorel() {
  const root = document.querySelector<HTMLElement>('[data-morel]');
  if (!root) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. Reveal-on-scroll.
     A sweep rather than an IntersectionObserver on purpose. IO only fires for
     elements that are intersecting during a frame, so a fast fling — or a jump
     to an anchor deep in the page — can skip an element entirely and leave it
     invisible for good. This reveals anything whose top has passed the fold and
     drops it from the list, so nothing can be missed however fast you scroll. */
  (() => {
    let pending = [...root.querySelectorAll<HTMLElement>('.reveal')];
    if (!pending.length) return;
    if (reduceMotion) {
      pending.forEach((el) => el.classList.add('is-in'));
      return;
    }
    let ticking = false;
    const sweep = () => {
      const fold = window.innerHeight - 60;
      pending = pending.filter((el) => {
        if (el.getBoundingClientRect().top > fold) return true;
        el.classList.add('is-in');
        return false;
      });
      if (!pending.length) {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
      }
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(sweep);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    window.addEventListener('load', onScroll, { once: true });
    /* Lazy images change the page height after first paint, which moves
       elements across the fold without a scroll event. Re-sweep on growth. */
    if ('ResizeObserver' in window) new ResizeObserver(onScroll).observe(document.body);
    sweep();
  })();

  /* 2. Letter-by-letter colour reveal on the intro paragraph */
  (() => {
    const p = root.querySelector<HTMLElement>('.text-load');
    if (!p) return;
    const split = (node: Node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          for (const ch of child.textContent ?? '') {
            const s = document.createElement('span');
            s.textContent = ch;
            frag.appendChild(s);
          }
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          split(child);
        }
      });
    };
    split(p);
    const letters = p.querySelectorAll('span');
    const total = letters.length;
    const update = () => {
      const rect = p.getBoundingClientRect();
      const winH = window.innerHeight;
      const start = winH * 0.7;
      const end = winH * 0.2;
      const progress = Math.min(1, Math.max(0, (start - rect.top) / (start - end)));
      const n = Math.floor(total * progress);
      letters.forEach((l, i) => l.classList.toggle('colored', i < n));
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  })();

  /* 3. Grow-on-scroll: cards scale 0.9 → 1 as they enter the viewport */
  (() => {
    const els = root.querySelectorAll<HTMLElement>('.grow-on-scroll');
    if (!els.length) return;
    if (reduceMotion) { els.forEach((el) => (el.style.transform = 'none')); return; }
    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      const dist = vh * 0.75;
      els.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const progress = Math.min(Math.max((vh - rect.top) / dist, 0), 1);
        el.style.transform = `scale(${0.9 + 0.1 * progress})`;
      });
      ticking = false;
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  })();

  /* 4. Video modal (YouTube). Nothing from YouTube loads until a .js-video is clicked. */
  (() => {
    const modal = root.querySelector<HTMLElement>('#vmodal');
    const slot = root.querySelector<HTMLElement>('#vmodal-slot');
    if (!modal || !slot) return;
    const lenis = () => (window as unknown as { lenis?: { stop?: () => void; start?: () => void } | null }).lenis;
    const close = () => {
      if (!modal.classList.contains('is-open')) return;
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      slot.innerHTML = '';
      document.body.style.overflow = '';
      lenis()?.start?.();
    };
    root.addEventListener('click', (e) => {
      const target = e.target as Element;
      const trigger = target.closest<HTMLElement>('.js-video');
      if (trigger) {
        e.preventDefault();
        const id = trigger.dataset.video;
        if (!id) return;
        slot.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1" title="Video" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        lenis()?.stop?.();
        track('video_open', { video_id: id, page_path: location.pathname });
        return;
      }
      if (target.closest('[data-vmodal-close]')) close();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  })();

  /* 5. Newsletter — posts to this site's lead endpoint (GoHighLevel), then hands
     the visitor the practice straight away. A failed post still hands it over:
     the practice is the promise, and the function log keeps every submission. */
  (() => {
    const form = root.querySelector<HTMLFormElement>('.nl-form');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = (form.querySelector<HTMLInputElement>('input[type=email]')?.value || '').trim();
      const fallback = form.dataset.fallback || '#';
      fetch(form.getAttribute('action') || '/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, form_id: 'newsletter', page: location.pathname, referrer: document.referrer || undefined }),
        keepalive: true,
      }).catch(() => {});
      form.innerHTML = `<p class="fs-sm">Thanks. The practice is ready for you now:</p><a class="btn btn--filled" href="${fallback}" target="_blank" rel="noopener">Watch the 5-minute practice</a>`;
      track('newsletter_submit', { form_id: 'newsletter', page_path: location.pathname });
    });
  })();

  /* 6. The patterns carousel.
     The five cards are cloned once so the track can wrap without a seam; an
     rAF loop nudges scrollLeft and rewinds by exactly one set's width when it
     passes it. It pauses while a pointer is over it, a finger is on it, or a
     card has focus, and resumes a moment after the visitor lets go. Arrows and
     arrow keys step one card. With reduced motion it is just a swipeable row.
     (The track is marked data-track-el, not the template's data-track — this
     site's tracking.ts reports a click on anything carrying data-track.) */
  (() => {
    const car = root.querySelector<HTMLElement>('[data-carousel]');
    const trackEl = car?.querySelector<HTMLElement>('[data-track-el]');
    if (!car || !trackEl) return;
    const originals = [...trackEl.children] as HTMLElement[];
    if (originals.length < 2) return;
    originals.forEach((el) => {
      const clone = el.cloneNode(true) as HTMLElement;
      clone.setAttribute('aria-hidden', 'true');
      clone.dataset.clone = '1';
      trackEl.appendChild(clone);
    });
    const gap = () => parseFloat(getComputedStyle(trackEl).columnGap || getComputedStyle(trackEl).gap || '0') || 0;
    const setWidth = () => originals.reduce((w, el) => w + el.offsetWidth, 0) + gap() * originals.length;
    const step = () => originals[0].offsetWidth + gap();

    const speed = reduceMotion ? 0 : parseFloat(car.dataset.speed || '0.5');
    let paused = false;
    let resumeAt = 0;
    let raf = 0;
    /* scrollLeft rounds to whole pixels, so a sub-pixel step would never add
       up. Keep the true position here and write it through each frame. */
    let pos = 0;
    const idle = (now: number) => !paused && now > resumeAt;
    const wrap = () => {
      const w = setWidth();
      if (!w) return;
      if (pos >= w) pos -= w;
      else if (pos < 0) pos += w;
    };
    const tick = (now: number) => {
      if (idle(now) && speed) {
        pos += speed;
        wrap();
        trackEl.scrollLeft = pos;
      }
      raf = requestAnimationFrame(tick);
    };
    const hold = (ms = 1800) => { resumeAt = performance.now() + ms; };
    const sync = () => { pos = trackEl.scrollLeft; wrap(); if (Math.abs(trackEl.scrollLeft - pos) > 1) trackEl.scrollLeft = pos; };

    car.addEventListener('pointerenter', () => { paused = true; });
    car.addEventListener('pointerleave', () => { paused = false; hold(600); });
    car.addEventListener('focusin', () => { paused = true; });
    car.addEventListener('focusout', () => { paused = false; hold(); });
    trackEl.addEventListener('touchstart', () => { paused = true; }, { passive: true });
    trackEl.addEventListener('touchend', () => { paused = false; hold(2200); }, { passive: true });
    /* A scroll we did not write ourselves is the visitor's — adopt it. */
    trackEl.addEventListener('scroll', () => { if (!idle(performance.now())) sync(); }, { passive: true });

    /* mouse drag */
    let dragging = false, startX = 0, startLeft = 0;
    trackEl.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return;
      dragging = true; startX = e.clientX; startLeft = trackEl.scrollLeft; trackEl.classList.add('is-dragging');
    });
    window.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      trackEl.scrollLeft = startLeft - (e.clientX - startX);
      pos = trackEl.scrollLeft;
    });
    window.addEventListener('pointerup', () => { if (dragging) { dragging = false; trackEl.classList.remove('is-dragging'); hold(); } });
    trackEl.addEventListener('click', (e) => { if (Math.abs(trackEl.scrollLeft - startLeft) > 6) e.preventDefault(); }, true);

    const go = (dir: number) => { trackEl.scrollBy({ left: dir * step(), behavior: 'smooth' }); hold(2600); trackEl.setAttribute('data-manual', '1'); };
    car.querySelector('[data-prev]')?.addEventListener('click', () => go(-1));
    car.querySelector('[data-next]')?.addEventListener('click', () => go(1));
    trackEl.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    });

    /* Only spend frames while the carousel is on screen. */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) { if (!raf) raf = requestAnimationFrame(tick); }
          else if (raf) { cancelAnimationFrame(raf); raf = 0; }
        });
      }, { threshold: 0.05 }).observe(car);
    } else {
      raf = requestAnimationFrame(tick);
    }
  })();
}
