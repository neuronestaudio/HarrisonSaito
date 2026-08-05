# Drop raw brand assets here

Anything in this folder is a **source file**, not something the site serves. Drop originals in at
full quality and they get processed into `public/` by the media pipeline.

Don't optimise anything before dropping it in — bigger and cleaner is better here.

## Naming

Name the file for what it is and it will be picked up automatically:

| Drop this | Becomes |
|---|---|
| `logo.svg` *(best)* or `logo.png` | Nav mark, footer mark, favicons, share card |
| `logo-mark.svg` | Icon-only version, if the full logo is too wide for a favicon |
| `logo-light.svg` | Version for dark backgrounds, if the main logo is dark-on-light |
| `hero.mp4` / `hero.mov` | New hero background plate |
| anything else | Tell me what it is and where it goes |

## Formats, in order of preference

1. **SVG** — infinitely sharp, tiny, and it can be recoloured in CSS. If a designer made the logo,
   ask them for the SVG or the original Illustrator/Figma file.
2. **PNG with transparency**, at least 1000px on the long edge.
3. JPG only if there is genuinely nothing else — it cannot have a transparent background, so it
   will sit in a visible box on the dark nav.

## Then

Tell me it's here and I'll wire it into the nav, footer, favicons and the social share card, and
rebuild. This folder is git-ignored — only the processed output in `public/` gets committed.
