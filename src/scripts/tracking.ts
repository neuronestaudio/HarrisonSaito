/**
 * Event taxonomy.
 *
 * Audit Phase 1, item 1: "Track per-CTA WhatsApp clicks, 50/90% scroll,
 * testimonial expands, video views."
 *
 * Every event lands in three places at once:
 *   dataLayer  -> GTM, which fans out to GA4 and anywhere else
 *   gtag       -> GA4 directly, when GTM is not the container of record
 *   fbq        -> Meta, with a shared event_id so the browser event can be
 *                 deduplicated against the Conversions API event fired
 *                 server-side by functions/api/lead.ts
 *
 * All of it degrades to a no-op when the tags are absent.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    __HS_TRACKING__?: { gtm: string; ga4: string; pixel: string };
  }
}

/** Standard Meta events we mirror; anything else stays custom. */
const META_STANDARD: Record<string, string> = {
  lead: 'Lead',
  complete_registration: 'CompleteRegistration',
  contact: 'Contact',
  schedule: 'Schedule',
  view_content: 'ViewContent',
  initiate_checkout: 'InitiateCheckout',
};

export function eventId(): string {
  if (crypto?.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function track(name: string, params: Record<string, unknown> = {}): string {
  const id = (params.event_id as string) ?? eventId();
  const payload = { ...params, event_id: id };

  window.dataLayer?.push({ event: name, ...payload });

  // Only call gtag directly when GTM is not present, or the event doubles up.
  if (!window.__HS_TRACKING__?.gtm && typeof window.gtag === 'function') {
    window.gtag('event', name, payload);
  }

  if (typeof window.fbq === 'function') {
    const std = META_STANDARD[name];
    if (std) window.fbq('track', std, payload, { eventID: id });
    else window.fbq('trackCustom', name, payload, { eventID: id });
  }

  return id;
}

/* ------------------------------------------------------------ CTA clicks */

/**
 * Any element carrying data-track fires an event on click. The old site's only
 * conversion path was an untracked WhatsApp deep link (audit C2); now every one
 * of them reports which CTA, on which page, in which section.
 */
function bindCtaClicks() {
  document.addEventListener(
    'click',
    (e) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-track]');
      if (!el) return;

      const name = el.dataset.track || 'cta_click';
      const section = el.closest('[data-section]') as HTMLElement | null;

      track(name, {
        cta_label: el.dataset.trackLabel || el.textContent?.trim().slice(0, 80),
        cta_destination: (el as HTMLAnchorElement).href || undefined,
        cta_section: el.dataset.trackSection || section?.dataset.section || undefined,
        page_path: location.pathname,
      });
    },
    { capture: true }
  );
}

/* ----------------------------------------------------------- scroll depth */

function bindScrollDepth() {
  const marks = [25, 50, 75, 90];
  const fired = new Set<number>();

  const onScroll = () => {
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - window.innerHeight;
    if (scrollable <= 0) return;
    const pct = Math.round(((window.scrollY || doc.scrollTop) / scrollable) * 100);

    for (const m of marks) {
      if (pct >= m && !fired.has(m)) {
        fired.add(m);
        track('scroll_depth', { percent: m, page_path: location.pathname });
      }
    }
    if (fired.size === marks.length) window.removeEventListener('scroll', throttled);
  };

  let ticking = false;
  const throttled = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      onScroll();
      ticking = false;
    });
  };

  window.addEventListener('scroll', throttled, { passive: true });
}

/* ------------------------------------------------------------- engagement */

/** Time-on-page milestones, a decent proxy for content quality on a long read. */
function bindEngagement() {
  [15, 45, 120].forEach((s) => {
    setTimeout(() => {
      if (!document.hidden) {
        track('engaged_time', { seconds: s, page_path: location.pathname });
      }
    }, s * 1000);
  });
}

/* ------------------------------------------------------------------ init */

export function initTracking() {
  bindCtaClicks();
  bindScrollDepth();
  bindEngagement();

  // Section visibility — tells us which parts of a long page actually get read.
  const sections = document.querySelectorAll<HTMLElement>('[data-section]');
  if (sections.length) {
    const seen = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.section;
          if (entry.isIntersecting && id && !seen.has(id)) {
            seen.add(id);
            track('section_view', { section: id, page_path: location.pathname });
          }
        }
      },
      { threshold: 0.4 }
    );
    sections.forEach((s) => io.observe(s));
  }
}
