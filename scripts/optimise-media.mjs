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

const DROP = path.join(ROOT, 'brand-drop');
const INK_BG = { r: 26, g: 23, b: 20, alpha: 1 }; // --ink-900, matches theme-color

/**
 * Turn a supplied logo into a transparent, tightly-cropped asset.
 *
 * The files we were given are flat 1254px PNGs with the background baked in —
 * white behind the dark version, black behind the light one — and the mark
 * sitting off-centre with ~290px of dead space along the bottom. Dropped
 * straight into the nav that would render as a visible box floating above its
 * own baseline, so both problems get fixed here:
 *
 *   1. alpha is derived from distance to the background colour, which keeps
 *      the red accent stroke opaque instead of fading it out the way a
 *      luminance key would;
 *   2. the result is cropped to the ink's real bounding box so the mark
 *      optically centres against text.
 */
async function knockOutBackground(file, { onWhite }) {
  const input = path.join(DROP, file);
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const out = Buffer.alloc(width * height * 4);

  let minX = width, minY = height, maxX = 0, maxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      const r = data[i], g = data[i + 1], b = data[i + 2];

      // Distance from the background. Using min/max across channels rather
      // than luminance is what preserves the red brush accent.
      const alpha = onWhite ? 255 - Math.min(r, g, b) : Math.max(r, g, b);

      const o = (y * width + x) * 4;
      out[o] = r;
      out[o + 1] = g;
      out[o + 2] = b;
      out[o + 3] = alpha;

      if (alpha > 24) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  // Square the crop around the mark so it scales predictably, with a hair of
  // breathing room so the brush edges are not clipped.
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const side = Math.max(maxX - minX, maxY - minY) * 1.06;
  const left = Math.max(0, Math.round(cx - side / 2));
  const top = Math.max(0, Math.round(cy - side / 2));
  const size = Math.min(Math.round(side), width - left, height - top);

  return sharp(out, { raw: { width, height, channels: 4 } })
    .extract({ left, top, width: size, height: size })
    .png();
}

async function buildLogo() {
  if (!existsSync(path.join(DROP, 'Logo-w.png'))) {
    console.warn('  ! no logo in brand-drop/ — skipping');
    return false;
  }

  // Light mark (white ink + red accent) for the dark nav, footer and hero.
  const light = await knockOutBackground('Logo-w.png', { onWhite: false });
  // Dark mark for cream sections.
  const dark = await knockOutBackground('Logo-b.png', { onWhite: true });

  for (const [name, img] of [['logo-light', light], ['logo-dark', dark]]) {
    for (const w of [64, 128, 256, 512]) {
      await img
        .clone()
        .resize(w, w)
        .webp({ quality: 92, effort: 6, alphaQuality: 100 })
        .toFile(path.join(IMG_OUT, `${name}-${w}.webp`));
    }
    await img
      .clone()
      .resize(512, 512)
      .webp({ quality: 92, effort: 6, alphaQuality: 100 })
      .toFile(path.join(IMG_OUT, `${name}.webp`));

    // PNG copy kept for the share card and anywhere WebP alpha is awkward.
    await img.clone().resize(512, 512).png().toFile(path.join(IMG_OUT, `${name}-512.png`));

    const size = (await fs.stat(path.join(IMG_OUT, `${name}-512.webp`))).size;
    console.log(`  ${name.padEnd(12)} transparent, square-cropped, 512px ${bytes(size)}`);
  }
  return true;
}

async function buildFavicons() {
  const source = path.join(IMG_OUT, 'logo-light-512.png');
  if (!existsSync(source)) {
    console.warn('  ! no processed logo — run buildLogo first');
    return;
  }

  // The mark sits on the site's warm near-black rather than transparency:
  // browser tab strips are light in light mode, and a white brush mark on
  // white would disappear entirely.
  const plate = async (s, pad) =>
    sharp({
      create: { width: s, height: s, channels: 4, background: INK_BG },
    })
      .composite([
        {
          input: await sharp(source)
            .resize(Math.round(s * pad), Math.round(s * pad))
            .toBuffer(),
          gravity: 'center',
        },
      ])
      .png();

  const sizes = [16, 32, 48, 180, 192, 512];
  for (const s of sizes) {
    const name = s === 180 ? 'apple-touch-icon.png' : `favicon-${s}.png`;
    // Small sizes get less padding or the mark turns to mush.
    const pad = s <= 32 ? 0.94 : s <= 48 ? 0.88 : 0.8;
    await (await plate(s, pad)).toFile(path.join(ROOT, 'public', name));
  }
  await (await plate(32, 0.94)).toFile(path.join(ROOT, 'public', 'favicon.ico'));
  console.log(`  favicons: ${sizes.join(', ')} + apple-touch-icon + favicon.ico (real mark on ink)`);
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
        <stop offset="55%" stop-color="#0d0b09" stop-opacity="0.62"/>
        <stop offset="100%" stop-color="#0d0b09" stop-opacity="0.92"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#v)"/>
    <text x="80" y="392" font-family="Georgia, 'Times New Roman', serif" font-size="82"
          fill="#f4f0e9">Harrison Saito</text>
    <text x="80" y="452" font-family="Helvetica, Arial, sans-serif" font-size="25"
          letter-spacing="7" fill="#d9a441">EDUCATOR · MARTIAL ARTIST · COACH</text>
    <text x="80" y="524" font-family="Georgia, 'Times New Roman', serif" font-size="31"
          font-style="italic" fill="#c9c2b6">How you do anything is how you do everything.</text>
  </svg>`);

  const composites = [{ input: overlay, top: 0, left: 0 }];

  // The real brand mark, dropped into the right-hand third of the card.
  const mark = path.join(IMG_OUT, 'logo-light-512.png');
  if (existsSync(mark)) {
    composites.push({
      input: await sharp(mark).resize(300, 300).toBuffer(),
      top: 165,
      left: 810,
    });
  }

  await sharp(base)
    .composite(composites)
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
  // Brand assets change far more often than photography or the hero video,
  // and re-encoding the video takes minutes. `--logo` does just the branding.
  const logoOnly = process.argv.includes('--logo');

  await ensureDirs();

  if (!logoOnly) {
    console.log('\nImages -> WebP (responsive)');
    for (const [file, slug] of Object.entries(IMAGES)) {
      await emitResponsive(file, slug, WIDTHS);
    }

    console.log('\nAvatars -> WebP');
    for (const [file, slug] of Object.entries(AVATARS)) {
      await emitResponsive(file, slug, AVATAR_WIDTHS);
    }
  }

  console.log('\nBrand mark');
  await buildLogo();

  console.log('\nFavicons');
  await buildFavicons();

  console.log('\nShare card');
  await buildOgImage();

  if (!logoOnly) {
    console.log('\nHero video');
    await buildVideo();
  }

  console.log('\nDone.\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
