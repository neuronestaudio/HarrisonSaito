/**
 * Walks the pinned phase timeline through its actual ScrollTrigger range
 * rather than guessing scroll offsets, and captures a frame at each step.
 */
import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs/promises';

const BASE = process.argv[2] || 'http://localhost:4321';
const OUT = path.resolve(import.meta.dirname, '..', '_shots');
await fs.mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

await page.goto(BASE + '/mens-coaching', { waitUntil: 'networkidle' });
await page.waitForTimeout(1800);

// Find the pinning trigger by asking GSAP, not by measuring the DOM.
const range = await page.evaluate(() => {
  const ST = window.ScrollTrigger;
  if (!ST) return null;
  const pinned = ST.getAll().find((t) => t.pin);
  return pinned ? { start: pinned.start, end: pinned.end } : null;
});

if (!range) {
  console.log('No pinned ScrollTrigger found — is ScrollTrigger exposed on window?');
} else {
  console.log(`Pin range: ${Math.round(range.start)} -> ${Math.round(range.end)} (${Math.round(range.end - range.start)}px of scroll)`);

  for (const [i, p] of [0, 0.34, 0.68, 1].entries()) {
    const y = range.start + (range.end - range.start) * p;
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(1100);

    const state = await page.evaluate(() => {
      const panels = Array.from(document.querySelectorAll('[data-phase-panel]'));
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const onScreen = panels
        .map((el) => {
          const r = el.getBoundingClientRect();
          const visW = Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0));
          return { name: el.querySelector('.phase__name')?.textContent?.trim(), pct: Math.round((visW / r.width) * 100), top: Math.round(r.top), h: Math.round(r.height) };
        })
        .filter((p) => p.pct > 5);
      return { onScreen, vh };
    });

    const desc = state.onScreen.map((p) => `${p.name} ${p.pct}%`).join(' | ');
    const v = state.onScreen[0];
    const slack = v ? state.vh - v.h : 0;
    console.log(`  ${(p * 100).toFixed(0).padStart(3)}%  ${desc}   [panel h=${v?.h}, vertical slack=${slack}px]`);

    await page.screenshot({ path: path.join(OUT, `pin-${i}.png`) });
  }
}

await browser.close();
