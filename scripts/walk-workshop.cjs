/* Walk /workshop end to end against a local dev server with /api/lead stubbed:
   pick a room, apply, then the hour-block picker — two days, three blocks,
   one removed, confirm — and assert both posts. Screens at phone + desktop. */
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const { chromium } = require(path.join(REPO, 'node_modules/playwright'));
const BASE = process.env.BASE || 'http://localhost:4331';
const OUT = process.env.OUT || require('os').tmpdir();
const FLEX = process.env.FLEX === '1';

const assert = (c, m) => { if (!c) { console.error('FAIL:', m); process.exitCode = 1; } else console.log('ok  ', m); };

(async () => {
  const browser = await chromium.launch();
  for (const [tag, vp] of [['phone', { width: 390, height: 844 }], ['desk', { width: 1280, height: 900 }]]) {
    const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, timezoneId: 'Australia/Sydney', reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    const posts = [];
    await page.route('**/api/lead', async (route) => {
      posts.push(JSON.parse(route.request().postData() || '{}'));
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, delivered: true }) });
    });
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(`${BASE}/workshop`, { waitUntil: 'networkidle' });

    const sf = page.locator('[data-seat-form="workshop"]');
    await sf.scrollIntoViewIfNeeded();
    await sf.locator('[data-session="sun-4-oct"]').click();
    await sf.locator('[name="name"]').fill('Walk Test');
    await sf.locator('[name="phone"]').fill('0400 000 000');
    await sf.locator('[name="email"]').fill('walk@example.com');
    await sf.locator('[name="consent"]').check();
    await sf.locator('[data-submit]').click();
    await sf.locator('[data-success]').waitFor({ state: 'visible' });
    assert(posts.length === 1 && posts[0].event_name === 'lead' && posts[0].session === 'sun-4-oct', `${tag}: application posted as lead for sun-4-oct`);

    const days = sf.locator('[data-day]');
    const nDays = await days.count();
    assert(nDays === 7, `${tag}: seven day tiles (${nDays})`);
    const firstIso = await days.first().getAttribute('data-day');
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Australia/Sydney' });
    assert(firstIso > today, `${tag}: first day ${firstIso} is after today ${today}`);
    const hours0 = await sf.locator('[data-hour]').allTextContents();
    console.log('     first day hours:', hours0.join(' | '));
    assert(await sf.locator('[data-confirm]').isDisabled(), `${tag}: confirm disabled with no picks`);
    await sf.scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(OUT, `ws-${tag}-1-empty.png`), clip: await sf.boundingBox().then((b) => ({ x: 0, y: Math.max(0, b.y - 8), width: vp.width, height: Math.min(b.height + 16, 1900) })) });

    if (FLEX) {
      await sf.locator('[data-flexible]').click();
      await sf.locator('[data-done]').waitFor({ state: 'visible' });
      assert(posts[1].timing === 'flexible', `${tag}: flexible posted`);
      console.log('     done text:', await sf.locator('[data-done-text]').textContent());
      await ctx.close();
      continue;
    }

    // day 2: first two blocks; day 1: first block → three picks, cap reached
    await days.nth(1).click();
    await sf.locator('[data-hour]').nth(0).click();
    await sf.locator('[data-hour]').nth(1).click();
    await days.nth(0).click();
    await sf.locator('[data-hour]').nth(0).click();
    assert((await sf.locator('[data-count]').textContent()).trim() === '3 of 3', `${tag}: count reads 3 of 3`);
    assert((await sf.locator('[data-hour][aria-disabled="true"]').count()) >= 1, `${tag}: remaining blocks disabled at the cap`);
    assert((await sf.locator('.sf__day.has-picks').count()) === 2, `${tag}: two days carry the dot`);
    await sf.locator('[data-hour]').nth(1).click({ force: true }); // over the cap: must NOT pick
    assert((await sf.locator('[data-count]').textContent()).trim() === '3 of 3', `${tag}: fourth pick refused`);
    await page.screenshot({ path: path.join(OUT, `ws-${tag}-2-picked.png`), clip: await sf.boundingBox().then((b) => ({ x: 0, y: Math.max(0, b.y - 8), width: vp.width, height: Math.min(b.height + 16, 1900) })) });

    // remove one via its chip, then confirm
    await sf.locator('.sf__pick-x').first().click();
    assert((await sf.locator('[data-count]').textContent()).trim() === '2 of 3', `${tag}: chip removal drops to 2 of 3`);
    await sf.locator('[data-confirm]').click();
    await sf.locator('[data-done]').waitFor({ state: 'visible' });
    const s = posts[1];
    assert(s && s.event_name === 'schedule' && s.email === 'walk@example.com', `${tag}: windows posted as schedule for the same email`);
    assert(/^\d{4}-\d{2}-\d{2} \d{2}:00-\d{2}:00(; \d{4}-\d{2}-\d{2} \d{2}:00-\d{2}:00)?$/.test(s.timing), `${tag}: timing machine list "${s.timing}"`);
    assert(/\(Sydney\)$/.test(s.timing_label), `${tag}: timing_label "${s.timing_label}"`);
    console.log('     done text:', await sf.locator('[data-done-text]').textContent());
    await page.screenshot({ path: path.join(OUT, `ws-${tag}-3-done.png`), clip: await sf.boundingBox().then((b) => ({ x: 0, y: Math.max(0, b.y - 8), width: vp.width, height: Math.min(b.height + 16, 1900) })) });
    assert(errors.length === 0, `${tag}: no page errors ${errors.join(' | ')}`);
    await ctx.close();
  }
  await browser.close();
})();
