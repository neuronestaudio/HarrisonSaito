/**
 * Visual check harness. Not part of the build — a dev tool for eyeballing
 * pages at real viewport sizes and catching layout regressions.
 *
 * node scripts/shots.mjs [baseUrl]
 */
import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs/promises';

const BASE = process.argv[2] || 'http://localhost:4321';
const OUT = path.resolve(import.meta.dirname, '..', '_shots');

const PAGES = [
  ['home', '/'],
  ['mens-coaching', '/mens-coaching'],
  ['hsc-tutoring', '/hsc-tutoring'],
  ['about', '/about'],
  ['media', '/media'],
  ['testimonials', '/testimonials'],
  ['apply', '/apply'],
  ['book', '/book'],
  ['contact', '/contact'],
  ['privacy', '/privacy'],
  ['404', '/404'],
];

await fs.mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const errors = [];

for (const [width, tag] of [
  [1440, 'desktop'],
  [390, 'mobile'],
]) {
  const ctx = await browser.newContext({
    viewport: { width, height: width === 1440 ? 900 : 844 },
    deviceScaleFactor: 1,
  });

  for (const [name, route] of PAGES) {
    const page = await ctx.newPage();

    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(`[${name}/${tag}] console: ${m.text()}`);
    });
    page.on('pageerror', (e) => errors.push(`[${name}/${tag}] pageerror: ${e.message}`));

    const res = await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 30000 });
    if (res && res.status() >= 400) errors.push(`[${name}] HTTP ${res.status()}`);

    // Let reveals settle and lazy content mount.
    await page.waitForTimeout(1200);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1800);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(900);

    await page.screenshot({
      path: path.join(OUT, `${name}-${tag}.png`),
      fullPage: true,
    });

    // Flag anything still stuck mid-reveal — the H7 regression guard.
    const dim = await page.evaluate(() => {
      const stuck = [];
      document.querySelectorAll('[data-reveal],[data-reveal-stagger]').forEach((el) => {
        const o = Number(getComputedStyle(el).opacity);
        if (o < 0.95) stuck.push(el.className || el.tagName);
      });
      return stuck;
    });
    if (dim.length) errors.push(`[${name}/${tag}] ${dim.length} element(s) below full opacity`);

    await page.close();
  }
  await ctx.close();
}

await browser.close();

if (errors.length) {
  console.log('\nISSUES:');
  errors.forEach((e) => console.log('  ' + e));
} else {
  console.log('\nNo console errors, no failed responses, no stuck reveals.');
}
console.log(`\nScreenshots in ${OUT}`);
