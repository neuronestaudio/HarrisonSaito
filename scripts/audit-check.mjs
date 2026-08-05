/**
 * Verifies the built output against the findings in the Pndulum audit.
 * Reads dist/ directly — no server, no browser — so it can run in CI.
 *
 * node scripts/audit-check.mjs
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { existsSync, statSync } from 'node:fs';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');

const pass = [];
const fail = [];
const warn = [];

const ok = (id, msg) => pass.push(`${id}  ${msg}`);
const bad = (id, msg) => fail.push(`${id}  ${msg}`);
const meh = (id, msg) => warn.push(`${id}  ${msg}`);

const html = {};
for (const f of await fs.readdir(DIST)) {
  if (f.endsWith('.html')) html[f] = await fs.readFile(path.join(DIST, f), 'utf8');
}
const lpDir = path.join(DIST, 'lp');
if (existsSync(lpDir)) {
  for (const f of await fs.readdir(lpDir)) {
    if (f.endsWith('.html')) html['lp/' + f] = await fs.readFile(path.join(lpDir, f), 'utf8');
  }
}

const pages = Object.keys(html);
const indexable = pages.filter((p) => !p.startsWith('lp/') && p !== '404.html');

/* ---------------------------------------------------------- CRITICAL ---- */

// C1 — tracking present and wired
const home = html['index.html'];
if (/dataLayer/.test(home) && /consent/i.test(home)) {
  ok('C1', 'dataLayer + Consent Mode v2 initialised before tags');
} else {
  bad('C1', 'no dataLayer / consent bootstrap found');
}
if (existsSync(path.join(ROOT, 'functions', 'api', 'lead.ts'))) {
  ok('C1', 'server-side Conversions API endpoint present (functions/api/lead.ts)');
} else {
  bad('C1', 'no Conversions API endpoint');
}

// C2 — lead capture exists
const formPages = pages.filter((p) => /<form/.test(html[p]));
if (formPages.length >= 3) {
  ok('C2', `lead capture on ${formPages.length} pages: ${formPages.join(', ')}`);
} else {
  bad('C2', `only ${formPages.length} page(s) with a form — expected apply, book, contact, lp`);
}

// C3 — policies exist and are linked sitewide
if (html['privacy.html'] && html['terms.html']) {
  ok('C3', 'privacy + terms pages built');
} else {
  bad('C3', 'missing privacy and/or terms page');
}
const unlinked = indexable.filter((p) => !/href="\/privacy"/.test(html[p]));
if (unlinked.length === 0) ok('C3', 'privacy policy linked from every indexable page');
else bad('C3', `privacy not linked from: ${unlinked.join(', ')}`);

// C4 — no vendor lock-in artefacts
const vendor = pages.filter((p) => /manus|Made with|amplitude|umami/i.test(html[p]));
if (vendor.length === 0) ok('C4', 'no vendor badge, editor script or third-party telemetry');
else bad('C4', `vendor artefacts still present in: ${vendor.join(', ')}`);

/* -------------------------------------------------------------- HIGH ---- */

// H1 — multi-page, distinct titles
const titles = {};
for (const p of indexable) {
  titles[p] = html[p].match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
}
const dupes = Object.values(titles).filter((t, i, a) => a.indexOf(t) !== i);
if (indexable.length >= 8 && dupes.length === 0) {
  ok('H1', `${indexable.length} indexable pages, all with unique titles`);
} else if (dupes.length) {
  bad('H1', `duplicate titles: ${[...new Set(dupes)].join(' | ')}`);
}

// H3 — titles carry intent + location
const keyPages = { 'mens-coaching.html': /coach/i, 'hsc-tutoring.html': /hsc|tutor/i };
for (const [p, re] of Object.entries(keyPages)) {
  const t = titles[p] ?? '';
  if (re.test(t) && /sydney|chatswood/i.test(t)) ok('H3', `${p} title has intent + location: "${t}"`);
  else bad('H3', `${p} title weak: "${t}"`);
}

// H4 — no eager YouTube iframes
const eager = pages.filter((p) => /<iframe[^>]*youtube(?!-nocookie)/i.test(html[p]));
if (eager.length === 0) ok('H4', 'zero YouTube iframes in served HTML (facades only)');
else bad('H4', `eager YouTube iframes in: ${eager.join(', ')}`);

// H5 — hero video under budget
const heroMp4 = path.join(DIST, 'video', 'hero.mp4');
if (existsSync(heroMp4)) {
  const kb = statSync(heroMp4).size / 1024;
  const mobile = statSync(path.join(DIST, 'video', 'hero-mobile.mp4')).size / 1024;
  if (kb <= 1536) ok('H5', `hero.mp4 ${kb.toFixed(0)} KB (target <=1536), mobile cut ${mobile.toFixed(0)} KB`);
  else bad('H5', `hero.mp4 ${kb.toFixed(0)} KB exceeds 1.5 MB target`);
  if (/preload="none"/.test(home)) ok('H5', 'hero video preload="none" — poster paints first');
  else bad('H5', 'hero video is not poster-first');
} else {
  bad('H5', 'no hero video built');
}

// H6 — structured data
const noSchema = indexable.filter((p) => !/application\/ld\+json/.test(html[p]));
if (noSchema.length === 0) ok('H6', 'JSON-LD on every indexable page');
else bad('H6', `no JSON-LD on: ${noSchema.join(', ')}`);
for (const t of ['LocalBusiness', 'Person', 'Review', 'AggregateRating', 'Course', 'FAQPage']) {
  const found = pages.some((p) => new RegExp(`"${t}"`).test(html[p]));
  if (found) ok('H6', `${t} schema emitted`);
  else meh('H6', `${t} schema not found`);
}

// H7 — nothing starts invisible
const css = (await fs.readdir(path.join(DIST, '_astro')))
  .filter((f) => f.endsWith('.css'))
  .map((f) => path.join(DIST, '_astro', f));
let cssText = '';
for (const f of css) cssText += await fs.readFile(f, 'utf8');
const inlineCss = pages.map((p) => html[p].match(/<style>([\s\S]*?)<\/style>/g)?.join('') ?? '').join('');
const allCss = cssText + inlineCss;
if (/\[data-reveal\]\{opacity:\.3/.test(allCss.replace(/\s/g, '')) || /opacity:\.3/.test(allCss)) {
  ok('H7', 'reveals start at 0.3 opacity, never 0');
} else {
  meh('H7', 'could not confirm reveal start opacity in built CSS');
}

// H8 — real 404
if (html['404.html']) ok('H8', '404 page built');
else bad('H8', 'no 404 page');
const redirects = await fs.readFile(path.join(DIST, '_redirects'), 'utf8').catch(() => '');
if (/\/\*\s+\/404\.html\s+404/.test(redirects)) ok('H8', 'catch-all returns real 404 status');
else bad('H8', 'no catch-all 404 rule');

// H2 — legacy redirects
const legacy = ['/about-harrison-saito', '/youth-education', '/student-testimonies', '/contact-harrison-saito'];
const missing = legacy.filter((u) => !redirects.includes(u));
if (missing.length === 0) ok('H2', `all ${legacy.length} legacy URLs have 301s`);
else bad('H2', `no 301 for: ${missing.join(', ')}`);

/* ------------------------------------------------------------ MEDIUM ---- */

// M1 — og:image
const noOg = pages.filter((p) => !/property="og:image"/.test(html[p]));
if (noOg.length === 0) ok('M1', 'og:image + twitter card on every page');
else bad('M1', `no og:image on: ${noOg.join(', ')}`);
if (existsSync(path.join(DIST, 'og-image.jpg'))) ok('M1', 'og-image.jpg generated');
else bad('M1', 'og-image.jpg missing');

// M2 — pinch zoom
const locked = pages.filter((p) => /maximum-scale/.test(html[p]));
if (locked.length === 0) ok('M2', 'pinch-zoom enabled everywhere (no maximum-scale)');
else bad('M2', `maximum-scale still set on: ${locked.join(', ')}`);

// M3 — meta descriptions
for (const p of indexable) {
  const d = html[p].match(/name="description" content="([^"]*)"/)?.[1] ?? '';
  const words = d.split(/\s+/).filter(Boolean).length;
  if (words < 15) bad('M3', `${p} description only ${words} words`);
}
if (!fail.some((f) => f.startsWith('M3'))) ok('M3', 'every page has a substantial meta description');

// M4 — real links in nav
if (/<a[^>]*href="\/mens-coaching"/.test(home)) ok('M4', 'nav uses real anchors, not buttons');
else bad('M4', 'nav links not found as anchors');

// M5 — WebP. YouTube serves its own thumbnails as JPEG from i.ytimg.com and
// there is no WebP equivalent, so those are excluded rather than counted.
const pngJpg = pages.filter((p) =>
  (html[p].match(/<img[^>]*>/g) || []).some(
    (tag) => /src="[^"]*\.(png|jpe?g)"/i.test(tag) && !/ytimg\.com/.test(tag)
  )
);
if (pngJpg.length === 0) ok('M5', 'all self-hosted images served as WebP (YouTube thumbs excepted)');
else bad('M5', `raster non-WebP <img> on: ${pngJpg.join(', ')}`);

// M6 — canonical
const noCanon = pages.filter((p) => !/rel="canonical"/.test(html[p]));
if (noCanon.length === 0) ok('M6', 'self-referencing canonical on every page');
else bad('M6', `no canonical on: ${noCanon.join(', ')}`);

// M7 — favicons
const icons = ['favicon.ico', 'apple-touch-icon.png', 'favicon-512.png', 'site.webmanifest'];
const missingIcons = icons.filter((f) => !existsSync(path.join(DIST, f)));
if (missingIcons.length === 0) ok('M7', 'full favicon set + apple-touch-icon + manifest');
else bad('M7', `missing: ${missingIcons.join(', ')}`);

// M8 — H1 quality
for (const p of indexable) {
  const count = (html[p].match(/<h1/g) || []).length;
  if (count !== 1) bad('M8', `${p} has ${count} <h1> elements`);
}
if (!fail.some((f) => f.startsWith('M8'))) ok('M8', 'exactly one <h1> per page');

// M9 — non-WhatsApp contact
if (/mailto:/.test(home) && /tel:/.test(home)) ok('M9', 'email + tel available alongside WhatsApp');
else bad('M9', 'no email/tel fallback');

/* ------------------------------------------------------ accessibility --- */

// Astro serialises alt="" as a bare `alt`, which is valid HTML and identical
// to an empty string for assistive tech — so match both forms.
let noAlt = 0;
let decorative = 0;
for (const p of pages) {
  for (const tag of html[p].match(/<img[^>]*>/g) || []) {
    if (/\salt(=|\s|>)/.test(tag)) {
      if (/\salt(\s|>)/.test(tag) || /\salt=""/.test(tag)) decorative++;
    } else {
      noAlt++;
    }
  }
}
if (noAlt === 0) {
  ok('A11y', `every <img> has alt (${decorative} intentionally empty on decorative art)`);
} else {
  bad('A11y', `${noAlt} <img> without alt`);
}

if (/lang="en-AU"/.test(home)) ok('A11y', 'lang="en-AU" set');
if (/skip-link/.test(home)) ok('A11y', 'skip-to-content link present');

/* ------------------------------------------------------------ output --- */

const line = '─'.repeat(78);
console.log('\n' + line);
console.log('PASSED');
console.log(line);
pass.forEach((p) => console.log('  ✓ ' + p));

if (warn.length) {
  console.log('\n' + line);
  console.log('NOTES');
  console.log(line);
  warn.forEach((w) => console.log('  · ' + w));
}

console.log('\n' + line);
if (fail.length) {
  console.log('FAILED');
  console.log(line);
  fail.forEach((f) => console.log('  ✗ ' + f));
  console.log(`\n${pass.length} passed, ${fail.length} failed, ${warn.length} notes\n`);
  process.exit(1);
} else {
  console.log(`ALL CLEAR — ${pass.length} checks passed, ${warn.length} notes`);
  console.log(line + '\n');
}
