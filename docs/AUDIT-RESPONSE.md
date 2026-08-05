# Audit response

Point-by-point against *Full Website Audit — harrisonsaito.com.au*, Pndulum, August 2026.
22 findings across 4 severity tiers. Status as at this commit.

`npm run audit` verifies most of these mechanically against `dist/`.

---

## Critical — blockers for the Meta ads plan

| ID | Finding | Status | How |
|---|---|---|---|
| **C1** | No Meta Pixel / Conversions API | **Closed** | `Analytics.astro` boots dataLayer + Consent Mode v2 before any tag; GTM, GA4 and Pixel all env-driven. `functions/api/lead.ts` fires the server-side CAPI event. Browser and server share an `event_id` per submission so Meta deduplicates rather than double-counting. Pixel is deferred to first interaction so it never competes with LCP. |
| **C2** | No lead capture — 0 forms | **Closed** | `LeadForm.astro` — a two-step application on `/apply` and `/lp/return-to-self` (qualifying questions first, contact details last), a booking request on `/book`, a general form on `/contact`. Honeypot + client and server validation. WhatsApp is retained as a secondary path because it converts, but it is no longer the only one. |
| **C3** | No privacy policy or terms | **Closed** | `/privacy` and `/terms`, written against what the site actually does — the cookies it sets, the processors it uses, the data the forms collect. Linked from the footer on every page. **Both still need review by an Australian legal practitioner.** |
| **C4** | Platform lock-in (Manus) | **Closed** | Plain Astro in git. No vendor badge, no editor script, no signed expiring asset URLs, no third-party telemetry. All 17 assets pulled from the old site and re-optimised into `public/`. Deploys anywhere that serves static files. |
| **C5** | No owned analytics | **Closed** | GA4 through GTM on Harrison's own property. Event taxonomy in `scripts/tracking.ts` covers per-CTA clicks, 25/50/75/90% scroll depth, section visibility, video plays, form start, form step, form error and time-on-page milestones. |

## High severity

| ID | Finding | Status | How |
|---|---|---|---|
| **H1** | Single-page SEO ceiling | **Closed** | 11 indexable pages. The two businesses now have separate tracks: `/mens-coaching` and `/hsc-tutoring`, each with its own title, description, schema and FAQ. |
| **H2** | Legacy URLs not redirected | **Closed** | 25 real 301s in `public/_redirects` and `vercel.json`, covering every legacy URL named in the audit plus programme aliases. |
| **H3** | Old site had better SEO titles | **Closed** | Every title carries intent + location — e.g. *"Men's Life Coach Sydney \| Return to Self"*, *"HSC English Tutor & Youth Mentor \| Chatswood, Sydney"*. The audit's own point: the old indexed titles proved this worked. |
| **H4** | 7 YouTube iframes eager-load | **Closed** | `YouTubeFacade.astro` — thumbnail + play button, real iframe created on click only, via `youtube-nocookie.com`. Zero iframes in served HTML. Saves ~4–7 MB per visit. |
| **H5** | 5.3 MB autoplay hero video | **Closed** | Poster paints first as the LCP element; video attaches on idle. Desktop 1.32 MB MP4 / 1.17 MB WebM, mobile 495 KB. `Save-Data` and 2g/3g get the poster only. Pauses on tab blur. |
| **H6** | No structured data | **Closed** | Connected JSON-LD `@graph` on every page: Person, LocalBusiness/ProfessionalService, WebSite, Service, Course (the 12-week programme with its three phases), FAQPage, BreadcrumbList, VideoObject, and Review + AggregateRating built from the 11 real testimonials. |
| **H7** | Scroll-reveal leaves blank screens | **Closed** | Nothing animates from `opacity: 0`. Reveals start at `0.3` and only add. IntersectionObserver fires for elements already in view on load, so `#anchor` deep links never land on a dimmed section, plus a 3s failsafe. Fully disabled under `prefers-reduced-motion`. |
| **H8** | Soft 404s — any URL returns 200 | **Closed** | Real `/404` page, served with a 404 status by the catch-all rule in `_redirects`. |

## Medium severity

| ID | Finding | Status | How |
|---|---|---|---|
| **M1** | No og:image / Twitter card | **Closed** | Generated 1200×630 share card (`scripts/optimise-media.mjs`), plus og + twitter tags on every page. Mattered most because the whole funnel ran through WhatsApp and IG DMs. |
| **M2** | Pinch-zoom disabled | **Closed** | `maximum-scale=1` removed. WCAG 1.4.4 satisfied. |
| **M3** | Weak meta description | **Closed** | Every page has a substantial description with location and offer. Verified ≥15 words by `npm run audit`. |
| **M4** | Nav items are buttons, not links | **Closed** | Real `<a href>` to real URLs throughout. |
| **M5** | Photos exported as PNG | **Closed** | All images WebP at 4 responsive widths with correct `sizes`. The worst offender went from 3.9 MB to 7 KB across all sizes; total image payload down ~85%. |
| **M6** | Apex + www both serve content | **Partly closed** | Self-referencing canonical on every page and `trailingSlash: 'never'`. **The apex → www 301 must be configured at DNS/host level at launch** — it cannot be done from the repo. |
| **M7** | No favicon links / touch icons | **Closed** | Full set generated from a gold ensō mark — 16/32/48/192/512, apple-touch-icon, `favicon.ico`, web manifest. |
| **M8** | H1 carries no topical signal | **Closed** | Exactly one `<h1>` per page, each carrying the page's actual topic. Heading hierarchy is sequential. |
| **M9** | WhatsApp-only contact | **Closed** | `mailto:` and `tel:` in the footer, on `/contact` and on `/book`. WhatsApp retained alongside. |

## Performance

| Metric | Before | Now |
|---|---|---|
| Hero video | 5.3 MB, `preload="auto"` | 1.32 MB desktop / 495 KB mobile, poster-first, `preload="none"` |
| YouTube embeds | 7 × eager (~4–7 MB) | 0 eager — facades |
| Images | PNG, up to 3.9 MB each | WebP, responsive, ~85% smaller |
| Fonts | Google Fonts (render-blocking third party) | Self-hosted, preloaded, 2 faces above the fold |
| JS | 117 KB gz (React/Vite SPA) | ~52 KB gz, deferred, mostly GSAP + Lenis |
| Render | Client-side SPA | Static HTML — content in the first response |

Re-run PageSpeed after deploy for scored CWV. The audit noted the API was rate-limiting during the
original assessment, so there is no clean before-benchmark to compare against.

---

## Not done in this pass

These are outside what a repo can close:

- **Apex → www 301** (M6) — host/DNS configuration at launch.
- **Google Search Console + Bing WMT** verification and sitemap submission — audit Phase 2, item 8.
- **Google Business Profile** — audit Phase 3, item 13. HSC tutoring is a local-pack query.
- **Legal review** of `/privacy` and `/terms` before they are relied on.
- **GTM container build** — the code sends the events; someone still has to create the triggers and
  tags inside the container and connect GA4.
- The `hello@harrisonsaito.com.au` address used throughout needs to exist, or be changed in
  `src/data/site.ts`.

## Open decisions

- **Booking tool.** `/book` renders a request form today. Set `PUBLIC_BOOKING_URL` to a Cal.com or
  Calendly embed and it becomes a real calendar. Cal.com is free and self-hostable.
- **CRM destination.** `LEAD_WEBHOOK_URL` is wired but unpointed. Until it is set, leads arrive by
  email only.
- **Video re-cut.** The hero plate is a re-encode of the original. A purpose-shot 6–8 second loop at
  a tighter crop would look better and compress smaller.
