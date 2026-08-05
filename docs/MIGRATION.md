# Migration notes

How the content and assets got here from the Manus build at `harrisonsaito.com.au`, so this is
reproducible rather than a one-off.

## The problem

The old site was a React/Vite SPA. `curl` returned only the shell — one `<title>` and an empty
`<div>`. All copy, all asset paths and all video IDs lived inside the JavaScript bundle.

## What was done

1. Fetched `/` and read the module script path from the shell: `/assets/index-BdZ7xert.js`.
2. Downloaded that bundle (404 KB) and the stylesheet.
3. The application code sits after the vendor code, starting at the asset map `me={heroDojo:…}`.
   Extracting from there gave:
   - **`me`** — the slug → asset-path map (17 entries: 15 on `/manus-storage/`, 2 on CloudFront).
   - **`Qn`** — the seven YouTube video IDs.
   - **`pi`** — the eleven testimonials as structured objects, complete with names and context.
   - Every rendered string, recoverable in DOM order by matching compiled JSX `children:` values.
4. Downloaded all 17 assets directly. All resolved except one truncated duplicate path, which was
   the same file as `Integrate_58316eab.JPG` — the hero poster and the Integrate phase image on the
   old site were byte-identical.
5. Design tokens came from the stylesheet's `:root` — gold `oklch(75% .12 75)`, cream
   `oklch(97% .005 60)`, near-black `oklch(15% .005 285)`, radius `0`, Cormorant Garamond +
   Nunito Sans. These are carried over deliberately: the visual identity was not the problem.

The scraping scripts live in `_source/` locally and are **not committed** — they were a one-time
migration tool and would only rot. The raw assets are also uncommitted; the optimised output in
`public/img` and `public/video` is what ships.

## Copy fidelity

Every string in `src/data/site.ts` is verbatim from the old site. The copy was the one genuinely
strong asset — differentiated positioning, a father-wound narrative that maps directly to the
campaign ICP, and published pricing, which is rare honesty in this market. It was not rewritten.

What changed is structure, not voice:

- Single page → 11 pages, so the two audiences stop competing for one title.
- Section headings became page `<h1>`s carrying real topical signal.
- Copy blocks were redistributed to the page that owns them (the story to `/about`, the programme
  detail to `/mens-coaching`, the youth material to `/hsc-tutoring`).

Genuinely new copy, written for this build and marked as such where it appears:

- `/privacy` and `/terms` in full.
- FAQ answers on `/mens-coaching` and `/hsc-tutoring`.
- The three "what changes" pillars on `/hsc-tutoring`.
- The Shu-Ha-Ri framing note on `/mens-coaching`.
- The `/lp/return-to-self` landing page.
- Form labels, help text and success messages.

## The Shu-Ha-Ri mapping

守破離 (shu-ha-ri) is the classical budo model of learning: hold the form, break the form, transcend
the form. It maps almost exactly onto Harrison's existing three phases — Separate, Return,
Integrate — and he is a 2nd Dan teaching from inside that tradition, so it is a structure the work
already had rather than a decoration laid over it. It drives the phase timeline, the calligraphy
vocabulary and the ensō.

This was an editorial addition. If Harrison does not want it, it lives in `PHASES` in
`src/data/site.ts` and comes out cleanly.

## Asset map

| Old filename | Now |
|---|---|
| `hero_final_v3_2b145e87.mp4` | `video/hero.{mp4,webm}` + `video/hero-mobile.mp4` |
| `063880f5-…(1)_6702f4f0.JPG` | `img/hero-poster-*.webp` |
| `about_shoji_e4da3927.jpg` | `img/about-shoji-*.webp` |
| `column_for_adults_d91873b5.png` | `img/for-adults-*.webp` |
| `IMG_6332_252aa23e.jpeg` | `img/sbs-group-*.webp` |
| `IMG_9301_b9abcb28.JPG` | `img/buddha-*.webp` |
| `naruto_group_7aa28188.png` | `img/naruto-group-*.webp` |
| `karate_group_e27c92f6.jpg` | `img/karate-group-*.webp` |
| `karate_photo_5_b455b1a1.png` | `img/karate-training-*.webp` |
| `Return_1978ba3a.jpg` | `img/phase-return-*.webp` |
| `Integrate_58316eab.JPG` | `img/phase-integrate-*.webp` |
| `hero-dark-dojo-…webp` (CloudFront) | `img/dark-dojo-*.webp` |
| `ink-wash-abstract-…webp` (CloudFront) | `img/ink-wash-*.webp` |
| `alex_wei`, `lance_perez`, `IMG_8626`, `IMG_8627` | `img/avatar-*.webp` |

`buddha` is carried over but not currently placed on any page — it is available if a section needs
it.

## Video IDs

| Key | ID |
|---|---|
| SBS World News | `YnHlcZLzu50` |
| I dream of schools valuing… | `yLh_R1g5uks` |
| Trauma, love and beyond | `gYdUjZLQzWc` |
| My vision for the youth (2024) | `nR62SogKKA0` |
| My father and I | `8vj462byS5w` |
| A father & son talk & heal | `m-r7VUuoBfc` |
| 5 Minute Guided Chakra Meditation | `XJ5Xjqmdvo8` |

## Still on the old platform

Nothing in this repo depends on Manus. But until DNS is switched:

- The live site is still the Manus build, still collecting telemetry to Manus's Amplitude and umami
  keys, and still carrying the "Made with Manus" badge.
- Signed CloudFront asset URLs on the old site will eventually expire. The two affected images are
  already downloaded and re-hosted here, so that is no longer a risk for this build.
- Confirm registrar and DNS access **before** cutover — the audit flagged this as an unknown.
