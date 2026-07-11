const { chromium } = require('playwright');
(async () => {
  const path = process.argv[2] || 'ui/index.html';
  const out = process.argv[3] || 'scratch-shot.png';
  const view = process.argv[4];
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 2 });
  const errors = [];
  page.on('console', m => { if (m.type()==='error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR: '+e.message));
  await page.goto('file://' + require('path').resolve(path));
  await page.waitForTimeout(400);
  if (view) { await page.click(`#tabs button[data-view="${view}"]`); await page.waitForTimeout(300); }
  await page.screenshot({ path: out, fullPage: true });
  console.log('shot:', out);
  console.log('errors:', errors.length ? JSON.stringify(errors, null, 2) : 'none');
  await browser.close();
})();
