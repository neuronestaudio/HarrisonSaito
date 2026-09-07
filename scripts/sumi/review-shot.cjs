const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1150, height: 1200 }, deviceScaleFactor: 1 });
  await p.goto(pathToFileURL(path.join(__dirname, 'out', 'review.html')).href);
  await p.screenshot({ path: path.join(__dirname, 'out', 'review.png'), fullPage: true });
  await b.close();
})();
