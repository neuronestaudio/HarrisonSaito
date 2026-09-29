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
import { wireFit } from './fit';

export function initMorel() {
  wireFit();
  const root = document.querySelector<HTMLElement>('[data-morel]');
  if (!root) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* The scroll position, taken once per scroll event in the CAPTURE phase at
     the window — before any other handler or animation frame has written a
     style. Reading window.scrollY after a style write forces Chrome to lay
     the whole page out first, and the effects below each did that every
     frame (29 Sep 2026). They read `sy` instead. */
  let sy = window.scrollY;
  window.addEventListener('scroll', () => { sy = window.scrollY; }, { capture: true, passive: true });

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
    /* Where each element sits on the PAGE, measured once and kept (Dion,
       29 Sep 2026: "insanely laggy"). Reading every pending element's rect on
       every scroll frame forced a full layout of the whole page each frame —
       1.6 s of main thread in a 60-step scroll at 4x CPU on the home page.
       The sweep now compares stored page offsets with scrollY, which costs no
       layout; the offsets are re-measured when the page changes size. */
    let tops: number[] = [];
    let stale = true;
    const measure = () => {
      const y = window.scrollY;
      tops = pending.map((el) => el.getBoundingClientRect().top + y);
      stale = false;
    };
    const sweep = () => {
      if (stale) measure();
      const line = sy + window.innerHeight - 60;
      const due = pending.filter((_, i) => tops[i] <= line);
      if (due.length) {
        const keep = tops.map((t) => t > line);
        pending = pending.filter((_, i) => keep[i]);
        tops = tops.filter((_, i) => keep[i]);
        due.forEach((el) => el.classList.add('is-in'));
      }
      if (!pending.length) {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onChange);
      }
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(sweep);
      }
    };
    /* anything that can move elements: re-measure before the next sweep */
    const onChange = () => { stale = true; onScroll(); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onChange);
    window.addEventListener('load', onChange, { once: true });
    /* Lazy images change the page height after first paint, which moves
       elements across the fold without a scroll event. Re-measure on growth. */
    if ('ResizeObserver' in window) new ResizeObserver(onChange).observe(document.body);
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
    /* once a frame, and only the letters whose state changed — it used to
       toggle every letter on every scroll event, then read the rect */
    let shown = 0;
    let ticking = false;
    /* the paragraph's place on the page, kept rather than read each frame
       (a per-frame rect read forced a whole-page layout — see the sweep) */
    let pageTop = 0;
    let stale = true;
    const update = () => {
      ticking = false;
      if (stale) { pageTop = p.getBoundingClientRect().top + window.scrollY; stale = false; }
      const top = pageTop - sy;
      const winH = window.innerHeight;
      const start = winH * 0.7;
      const end = winH * 0.2;
      const progress = Math.min(1, Math.max(0, (start - top) / (start - end)));
      const n = Math.floor(total * progress);
      for (let i = Math.min(n, shown); i < Math.max(n, shown); i++) letters[i].classList.toggle('colored', i < n);
      shown = n;
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    const onChange = () => { stale = true; onScroll(); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onChange);
    window.addEventListener('load', onChange, { once: true });
    if ('ResizeObserver' in window) new ResizeObserver(onChange).observe(document.body);
    update();
  })();

  /* 3. Grow-on-scroll: cards scale 0.9 → 1 as they enter the viewport */
  (() => {
    const els = root.querySelectorAll<HTMLElement>('.grow-on-scroll');
    if (!els.length) return;
    if (reduceMotion) { els.forEach((el) => (el.style.transform = 'none')); return; }
    let ticking = false;
    /* each card's place on the page, kept rather than read every frame (a
       per-frame rect read forced a whole-page layout — see the sweep). The
       0.9–1 scale moves a card's top by a few pixels at most; not worth a read. */
    let tops: number[] = [];
    let stale = true;
    const update = () => {
      if (stale) { const y = window.scrollY; tops = Array.from(els, (el) => el.getBoundingClientRect().top + y); stale = false; }
      const vh = window.innerHeight;
      const dist = vh * 0.75;
      const y = sy;
      els.forEach((el, i) => {
        const progress = Math.min(Math.max((vh - (tops[i] - y)) / dist, 0), 1);
        el.style.transform = `scale(${0.9 + 0.1 * progress})`;
      });
      ticking = false;
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    const onChange = () => { stale = true; onScroll(); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onChange);
    window.addEventListener('load', onChange, { once: true });
    if ('ResizeObserver' in window) new ResizeObserver(onChange).observe(document.body);
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

  /* 5. The callback (Dion, 30 Sep; it was the newsletter) — a name and a
     number, posted to this site's lead endpoint (GoHighLevel, on the phone),
     and a thank-you that names them. A post that fails says so and keeps the
     form, with his number as the way round it. */
  (() => {
    const form = root.querySelector<HTMLFormElement>('.nl-form');
    if (!form) return;
    const nameEl = form.querySelector<HTMLInputElement>('input[name=name]');
    const phoneEl = form.querySelector<HTMLInputElement>('input[name=phone]');
    const err = form.querySelector<HTMLElement>('.nl-form__error');
    const button = form.querySelector<HTMLButtonElement>('button');
    if (!nameEl || !phoneEl || !err || !button) return;
    const fail = (msg: string) => { err.textContent = msg; err.hidden = false; };
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      err.hidden = true;
      const name = nameEl.value.trim();
      const phone = phoneEl.value.trim();
      if (!name) { fail('Your name, so Harrison knows who he is calling.'); nameEl.focus(); return; }
      if (phone.replace(/\D/g, '').length < 8) { fail('Please include a full phone number.'); phoneEl.focus(); return; }
      button.disabled = true;
      /* what they tapped on the walk, so Harrison's notification says it (as the big forms do) */
      let fy: string | undefined;
      let fyPick: string | undefined;
      try {
        fy = sessionStorage.getItem('rts-fy') || undefined;
        fyPick = sessionStorage.getItem('rts-fy-pick') || undefined;
      } catch {}
      try {
        const res = await fetch(form.getAttribute('action') || '/api/lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, phone, form_id: 'callback', about: 'callback', about_label: 'Callback — name and number', page_path: location.pathname, page_url: location.href, referrer: document.referrer || undefined, fy, fy_pick: fyPick, event_name: 'lead' }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || json.ok === false) throw new Error(json.error || `HTTP ${res.status}`);
        const first = name.split(/\s+/)[0];
        form.innerHTML = `<p class="fs-sm">${(form.dataset.thanks || 'Thank you, {name}.').replace('{name}', first)}</p>`;
        track('lead', { form_id: 'callback', page_path: location.pathname });
      } catch (ex) {
        button.disabled = false;
        const tel = form.dataset.phone ? `<a href="tel:${form.dataset.phone}">${form.dataset.phoneDisplay || form.dataset.phone}</a>.` : 'Harrison directly.';
        err.innerHTML = (form.dataset.error || 'That did not send. Try again, or call ') + tel;
        err.hidden = false;
        track('form_error', { form_id: 'callback', page_path: location.pathname, message: String((ex as Error).message).slice(0, 80) });
      }
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
