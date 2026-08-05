/**
 * Build-time manifest of the optimised image set.
 *
 * scripts/optimise-media.mjs emits `public/img/<slug>-<width>.webp` for every
 * width that does not upscale the original, plus a `<slug>.webp` fallback.
 * Rather than hard-coding which widths exist per image (and risking a srcset
 * entry that 404s), we read the directory once at build time.
 */
import fs from 'node:fs';
import path from 'node:path';

const IMG_DIR = path.resolve(process.cwd(), 'public', 'img');

type Manifest = Record<string, number[]>;

function build(): Manifest {
  const manifest: Manifest = {};
  let files: string[] = [];
  try {
    files = fs.readdirSync(IMG_DIR);
  } catch {
    return manifest; // media pipeline has not been run yet
  }

  for (const file of files) {
    const m = file.match(/^(.+)-(\d+)\.webp$/);
    if (!m) continue;
    const [, slug, width] = m;
    (manifest[slug] ??= []).push(Number(width));
  }

  for (const slug of Object.keys(manifest)) {
    manifest[slug].sort((a, b) => a - b);
  }
  return manifest;
}

const MANIFEST = build();

export function srcset(slug: string): string {
  const widths = MANIFEST[slug];
  if (!widths?.length) return '';
  return widths.map((w) => `/img/${slug}-${w}.webp ${w}w`).join(', ');
}

export function src(slug: string): string {
  return `/img/${slug}.webp`;
}

export function hasImage(slug: string): boolean {
  return Boolean(MANIFEST[slug]?.length);
}

/** Largest generated width — used as the intrinsic width hint. */
export function maxWidth(slug: string): number | undefined {
  const widths = MANIFEST[slug];
  return widths?.length ? widths[widths.length - 1] : undefined;
}
