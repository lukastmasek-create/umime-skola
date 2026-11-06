// Vyrenderuje plakáty (HTML) do PNG 1080 × 1350 px pro Instagram.
// Spuštění: node marketing/instagram/render.cjs   (vyžaduje Playwright s Chromium)
const { chromium } = require('playwright');
const path = require('path');
const dir = __dirname;
const files = ['01-uvod', '02-predmety', '03-hry', '04-unikovka', '05-jak-to-funguje', '06-spolu'];

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  for (const f of files) {
    await page.goto('file://' + path.join(dir, f + '.html'), { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    const overflow = await page.evaluate(() => {
      const p = document.querySelector('.poster');
      return p.scrollHeight - p.clientHeight;
    });
    if (overflow > 0) console.warn(`${f}: obsah přetéká o ${overflow} px`);
    await (await page.$('.poster')).screenshot({ path: path.join(dir, f + '.png') });
    console.log('hotovo:', f + '.png');

    // Černobílá varianta: stejný plakát, jen s odstíny šedé.
    await page.addStyleTag({ content: '.poster { filter: grayscale(1); }' });
    await page.waitForTimeout(100);
    await (await page.$('.poster')).screenshot({ path: path.join(dir, f + '-bw.png') });
    console.log('hotovo:', f + '-bw.png');
    await page.reload({ waitUntil: 'networkidle' });
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
