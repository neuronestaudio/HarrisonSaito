/**
 * Media pipeline for harrisonsaito.com.au
 *
 * Takes the raw assets scraped from the legacy Manus site (_source/assets) and
 * produces the optimised, semantically-named set the site actually ships.
 *
 * Closes audit findings:
 *   H5  5.3 MB autoplay hero video  -> ~1.2 MB MP4 + WebM, poster-first
 *   M5  PNG photos                  -> WebP at responsive widths
 *   M7  no favicon set              -> favicon.ico + PNGs + apple-touch-icon
 *   M1  no og:image                 -> generated 1200x630 share card
 *
 * Run: npm run media   (requires ffmpeg on PATH)
 */
import sharp from 'sharp';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import path from 'node:path';
import { existsSync } from 'node:fs';

const run = promisify(execFile);
const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, '_source', 'assets');
const IMG_OUT = path.join(ROOT, 'public', 'img');
const VID_OUT = path.join(ROOT, 'public', 'video');

// raw filename -> semantic slug
const IMAGES = {
  'about_shoji_e4da3927.jpg': 'about-shoji',
  'column_for_adults_d91873b5.png': 'for-adults',
  'IMG_6332_252aa23e.jpeg': 'sbs-group',
  'IMG_9301_b9abcb28.JPG': 'buddha',
  'naruto_group_7aa28188.png': 'naruto-group',
  'karate_group_e27c92f6.jpg': 'karate-group',
  'karate_photo_5_b455b1a1.png': 'karate-training',
  'Return_1978ba3a.jpg': 'phase-return',
  'Integrate_58316eab.JPG': 'phase-integrate',
  '063880f5-a2d7-4cd8-9c80-36d78256507a(1)_6702f4f0.JPG': 'hero-poster',
  'hero-dark-dojo-jhcM9hVoVo3RghqMDGhGbW.webp': 'dark-dojo',
  'ink-wash-abstract-Ky7YCpsxpJcjGRACooRyNN.webp': 'ink-wash',
};

const AVATARS = {
  'alex_wei_8a03c0ca.png': 'avatar-alex-wei',
  'lance_perez_cc0dcf07.png': 'avatar-lance-perez',
  'IMG_8626_6c61812f.jpg': 'avatar-matt-halpin',
  'IMG_8627_32f7a1ed.PNG': 'avatar-james-bolton',
};

const WIDTHS = [480, 768, 1200, 1920];
const AVATAR_WIDTHS = [96, 192];

const bytes = (n) => `${(n / 1024).toFixed(0)} KB`;

async function ensureDirs() {
  for (const d of [IMG_OUT, VID_OUT, path.join(ROOT, 'public')]) {
    await fs.mkdir(d, { recursive: true });
  }
}

async function emitResponsive(file, slug, widths) {
  const input = path.join(SRC, file);
  if (!existsSync(input)) {
    console.warn(`  ! missing source: ${file}`);
    return;
  }
  const meta = await sharp(input).metadata();
  const before = (await fs.stat(input)).size;
  let after = 0;

  for (const w of widths) {
    // Never upscale past the original.
    if (w > meta.width) continue;
    const out = path.join(IMG_OUT, `${slug}-${w}.webp`);
    await sharp(input)
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: 78, effort: 6 })
      .toFile(out);
    after += (await fs.stat(out)).size;
  }

  // A single full-size fallback at the natural width, capped at 1920.
  const fallbackWidth = Math.min(meta.width, 1920);
  const fallback = path.join(IMG_OUT, `${slug}.webp`);
  await sharp(input)
    .resize({ width: fallbackWidth, withoutEnlargement: true })
    .webp({ quality: 80, effort: 6 })
    .toFile(fallback);

  console.log(
    `  ${slug.padEnd(22)} ${String(meta.width).padStart(5)}px  ${bytes(before).padStart(9)} -> ${bytes(after).padStart(9)} (all sizes)`
  );
}

async function buildFavicons() {
  // The mark is a gold ensō on near-black — drawn here rather than shipped as
  // a binary so it stays versionable and re-generatable.
  const enso = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#1a1714"/>
  <path d="M362 132 A 160 160 0 1 0 388 232"
        fill="none" stroke="#d9a441" stroke-width="30" stroke-linecap="round"
        transform="rotate(-18 256 256)"/>
</svg>`);

  const sizes = [16, 32, 48, 180, 192, 512];
  for (const s of sizes) {
    const name = s === 180 ? 'apple-touch-icon.png' : `favicon-${s}.png`;
    await sharp(enso).resize(s, s).png().toFile(path.join(ROOT, 'public', name));
  }
  // favicon.ico — 32px PNG payload is accepted by every current browser.
  await sharp(enso).resize(32, 32).png().toFile(path.join(ROOT, 'public', 'favicon.ico'));
  console.log(`  favicons: ${sizes.join(', ')} + apple-touch-icon + favicon.ico`);
}

async function buildOgImage() {
  // 1200x630 share card built from the hero poster, darkened, with the wordmark.
  const poster = path.join(SRC, '063880f5-a2d7-4cd8-9c80-36d78256507a(1)_6702f4f0.JPG');
  if (!existsSync(poster)) return console.warn('  ! no poster for og:image');

  const base = await sharp(poster)
    .resize(1200, 630, { fit: 'cover', position: 'attention' })
    .modulate({ brightness: 0.52 })
    .toBuffer();

  const overlay = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <defs>
      <linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"  stop-color="#0d0b09" stop-opacity="0.30"/>
        <stop offset="55%" stop-color="#0d0b09" stop-opacity="0.60"/>
        <stop offset="100%" stop-color="#0d0b09" stop-opacity="0.90"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#v)"/>
    <path d="M980 120 A 92 92 0 1 0 995 178" fill="none" stroke="#d9a441"
          stroke-opacity="0.85" stroke-width="9" stroke-linecap="round"/>
    <text x="80" y="392" font-family="Georgia, 'Times New Roman', serif" font-size="82"
          fill="#f4f0e9">Harrison Saito</text>
    <text x="80" y="452" font-family="Helvetica, Arial, sans-serif" font-size="25"
          letter-spacing="7" fill="#d9a441">EDUCATOR · MARTIAL ARTIST · COACH</text>
    <text x="80" y="524" font-family="Georgia, 'Times New Roman', serif" font-size="31"
          font-style="italic" fill="#c9c2b6">How you do anything is how you do everything.</text>
  </svg>`);

  await sharp(base)
    .composite([{ input: overlay, top: 0, left: 0 }])
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(path.join(ROOT, 'public', 'og-image.jpg'));

  const size = (await fs.stat(path.join(ROOT, 'public', 'og-image.jpg'))).size;
  console.log(`  og-image.jpg  1200x630  ${bytes(size)}`);
}

async function buildVideo() {
  const input = path.join(SRC, 'hero_final_v3_2b145e87.mp4');
  if (!existsSync(input)) return console.warn('  ! no hero video source');

  const before = (await fs.stat(input)).size;

  // 1280px wide is plenty for a background plate that sits behind a 55% scrim.
  // CRF 32 + slow preset keeps it under the 1.5 MB audit target for H5.
  await run('ffmpeg', [
    '-y', '-i', input,
    '-an',                                   // no audio track — it is muted anyway
    '-vf', 'scale=1280:-2',
    '-c:v', 'libx264', '-profile:v', 'high', '-crf', '32', '-preset', 'slow',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',               // metadata first so it starts streaming
    path.join(VID_OUT, 'hero.mp4'),
  ]);

  // VP9 only earns its place if it actually beats H.264 on this footage — at
  // CRF 38 it did not, so push harder. The <source> order means browsers only
  // take it when it is the better file.
  await run('ffmpeg', [
    '-y', '-i', input,
    '-an',
    '-vf', 'scale=1280:-2',
    '-c:v', 'libvpx-vp9', '-crf', '46', '-b:v', '0', '-deadline', 'good', '-cpu-used', '2',
    '-row-mt', '1',
    path.join(VID_OUT, 'hero.webm'),
  ]);

  // A 640px cut for phones, where the plate is never seen at full size.
  await run('ffmpeg', [
    '-y', '-i', input,
    '-an',
    '-vf', 'scale=640:-2',
    '-c:v', 'libx264', '-profile:v', 'main', '-crf', '32', '-preset', 'slow',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    path.join(VID_OUT, 'hero-mobile.mp4'),
  ]);

  for (const f of ['hero.mp4', 'hero.webm', 'hero-mobile.mp4']) {
    const s = (await fs.stat(path.join(VID_OUT, f))).size;
    console.log(`  ${f.padEnd(18)} ${bytes(before).padStart(9)} -> ${bytes(s).padStart(9)}`);
  }
}

async function main() {
  await ensureDirs();

  console.log('\nImages -> WebP (responsive)');
  for (const [file, slug] of Object.entries(IMAGES)) {
    await emitResponsive(file, slug, WIDTHS);
  }

  console.log('\nAvatars -> WebP');
  for (const [file, slug] of Object.entries(AVATARS)) {
    await emitResponsive(file, slug, AVATAR_WIDTHS);
  }

  console.log('\nFavicons');
  await buildFavicons();

  console.log('\nShare card');
  await buildOgImage();

  console.log('\nHero video');
  await buildVideo();

  console.log('\nDone.\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
