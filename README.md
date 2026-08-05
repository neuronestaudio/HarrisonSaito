# harrisonsaito.com.au

Rebuild of Harrison Saito's website — men's life coaching and HSC mentoring, Chatswood NSW.

Replaces an AI-generated Manus single-page app with an owned, versioned, ad-ready static site.
Built and managed by **Pndulum Digital Infrastructure**.

```
Astro 5 · GSAP + ScrollTrigger · Lenis · vanilla CSS · zero UI framework
Static output · deploys to Cloudflare Pages or Vercel · ~$0/mo
```

---

## Why this exists

The [full website audit](docs/AUDIT-RESPONSE.md) found 22 issues across 4 severity tiers, including
5 hard blockers for the planned Meta campaign. The old site had **1 indexable URL**, **0 forms**,
**0 tracking pixels** and **0 owned analytics**, and could not be edited outside a vendor's editor.

Every finding is closed here. Run `npm run audit` to verify against the built output.

## Quick start

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # -> dist/
npm run preview      # serve dist/
```

First checkout also needs the media pipeline, which reads the raw assets scraped from the old site:

```bash
npm run media        # WebP + responsive sizes, favicons, og:image, hero video (needs ffmpeg)
npm run media:logo   # branding only — skips the slow video re-encode
npm run fonts        # self-host Cormorant Garamond + Nunito Sans
```

All are committed as output, so you only re-run them when source assets change.

### Replacing the logo

Drop a new file into `brand-drop/` (see the README in there) and run `npm run media:logo`. The
pipeline knocks the baked background out to real transparency, preserves the red accent stroke,
crops to the ink's bounding box, and regenerates the nav mark, footer mark, full favicon set and
the social share card in one pass.

## Verification

```bash
npm run audit        # 36 checks against dist/ — every audit finding, plus a11y
npm run shots        # screenshots every page at 1440 + 390, flags console errors
npm run check:pin    # walks the pinned Shu-Ha-Ri timeline through its scroll range
```

`npm run audit` is the one that matters. It reads `dist/` directly, needs no browser, and fails the
build if a fix regresses.

## Structure

```
src/
  data/site.ts          all copy, offers, testimonials, video IDs — one source of truth
  lib/seo.ts            JSON-LD @graph builders (Person, LocalBusiness, Course, Review, FAQ)
  lib/images.ts         build-time manifest of the generated WebP set
  layouts/Base.astro    head, meta, canonical, schema, analytics, nav, footer
  components/           Hero, PhaseTimeline, Enso, Calligraphy, LeadForm, YouTubeFacade, …
  scripts/motion.ts     Lenis + reveals + parallax + ensō + pinned timeline
  scripts/tracking.ts   event taxonomy — one call fans out to dataLayer, gtag and fbq
  pages/                one file per route
functions/api/lead.ts   Cloudflare Pages Function — Meta CAPI, CRM webhook, email
scripts/                media pipeline, font fetch, audit + visual checks
```

**All copy lives in `src/data/site.ts`.** Editing text does not mean touching a template.

## Routes

| URL | Purpose |
|---|---|
| `/` | Brand home — establishes who Harrison is, routes the two audiences |
| `/mens-coaching` | SEO track 1 — men's life coaching + the Return to Self programme |
| `/hsc-tutoring` | SEO track 2 — HSC English tutoring and youth mentoring |
| `/about` | The full father-wound story |
| `/media` | SBS World News + 6 films, all as click-to-load facades |
| `/testimonials` | All 11, filterable |
| `/apply` | Two-step Return to Self application — the primary conversion |
| `/book` | Discovery chat request, or a calendar embed if `PUBLIC_BOOKING_URL` is set |
| `/contact` | Email, phone, WhatsApp and a form |
| `/privacy`, `/terms` | Required before Meta will run ads |
| `/lp/return-to-self` | Campaign landing page — noindex, no nav, one CTA |
| `/404` | Real 404 status via `_redirects` |

## The design system

Warm sumi-e palette carried over from the original: near-black ink, unbleached cream, a single gold
accent, zero border radius. Cormorant Garamond for display, Nunito Sans for body, both self-hosted.

Three signature elements:

- **The ensō (円相)** — which is the brand mark itself: a brushed circle with an S through it, with
  a small red accent stroke. It paints itself in clockwise via an animated conic mask. In the hero
  that runs on load; on `/mens-coaching` it is scroll-linked and completes exactly as the reader
  reaches week twelve.
- **The calligraphy wash** — oversized kanji at 3–6% opacity drifting at their own scroll rates.
  Vocabulary comes from the actual work (守破離, 道, 心, 継承, 傷), never decorative filler.
- **The Shu-Ha-Ri timeline** — the section pins and the three phases travel horizontally, so the
  reader physically moves through Separate → Return → Integrate. Degrades to a vertical stack
  below 900px and under `prefers-reduced-motion`.

### Motion rule

Nothing ever animates from `opacity: 0`. Reveals start at `0.3` and only add. This was audit finding
H7 — the old site left fast scrollers and `#anchor` jumps looking at blank viewports. There is also a
3-second failsafe in `motion.ts` that reveals anything an observer missed.

## Configuration

Copy `.env.example` to `.env`. Everything is optional; with nothing set the site builds clean, no
tags load, and the consent bar does not render.

| Variable | Purpose |
|---|---|
| `PUBLIC_GTM_ID` | GTM container — the container of record when present |
| `PUBLIC_GA4_ID` | GA4, loaded directly only when GTM is absent |
| `PUBLIC_META_PIXEL_ID` | Meta Pixel, deferred to first interaction |
| `PUBLIC_FORM_ENDPOINT` | Overrides `/api/lead` — point at a CRM, n8n, Make |
| `PUBLIC_BOOKING_URL` | Cal.com / Calendly embed for `/book` |
| `META_PIXEL_ID` + `META_CAPI_TOKEN` | Server-side Conversions API (secret) |
| `LEAD_WEBHOOK_URL` | Where leads are forwarded (secret) |
| `RESEND_API_KEY` + `LEAD_NOTIFY_TO` | Email notification (secret) |

Pixel and CAPI share an `event_id` per submission so Meta deduplicates the browser and server events
into one conversion instead of counting two.

## Deploying

**Cloudflare Pages** (recommended — `functions/` works with no adapter):

```
Build command:      npm run build
Output directory:   dist
```

`public/_redirects` and `public/_headers` are picked up automatically.

**Vercel:** same build, `vercel.json` carries the redirects and headers, but `functions/api/lead.ts`
needs porting to `api/lead.ts` (Vercel Functions signature) or replaced by `PUBLIC_FORM_ENDPOINT`.

### Before going live

1. Point DNS at the host; confirm apex → www 301.
2. Set env vars in the host dashboard.
3. Verify in Google Search Console, submit `sitemap-index.xml`.
4. Fire a test lead and confirm it appears in Meta Events Manager under Test Events.
5. **Have `/privacy` and `/terms` reviewed by an Australian legal practitioner.** They are drafted
   against how the site actually operates, but they are not legal advice.
