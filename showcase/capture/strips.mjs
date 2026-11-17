// Scroll-stitched strips: real viewport captures per 1080px band (reveal animations fire), stitched into <=3600px strips.
import { createRequire } from 'node:module';
const { chromium } = createRequire('/opt/node22/lib/node_modules/')('playwright');
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const BASE = process.env.BASE || 'https://ucimesehrou.org';
const pages = (process.env.PAGES || 'home:/cs,kurzy:/cs/kurzy,multiplayer:/cs/hrat-spolecne,ucitele:/cs/ucitele,hry:/cs/stale-hry,zebricky:/cs/zebricky,pro:/cs/pro,unikovky:/cs/unikovky,obchod:/cs/obchod,materialy:/cs/materialy').split(',').map(s => s.split(/:(.+)/));
fs.mkdirSync('public/strips', { recursive: true }); fs.mkdirSync('/tmp/bands', { recursive: true });
const CH = 3240; // 3 bands per strip -> 6480 device px
for (const [id, path] of pages) {
  const b = await chromium.launch({ args: ['--no-sandbox'] });
  const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2, locale: 'cs-CZ' });
  const p = await ctx.newPage();
  try {
    await p.goto(BASE + path, { waitUntil: 'load', timeout: 45000 });
    await p.waitForTimeout(3000);
    const H = Math.min(await p.evaluate(() => document.documentElement.scrollHeight), 11880);
    const nb = Math.ceil(H / 1080);
    const bands = [];
    for (let i = 0; i < nb; i++) {
      const y = Math.min(i * 1080, Math.max(0, H - 1080));
      await p.evaluate(y => window.scrollTo(0, y), y); await p.waitForTimeout(i === 0 ? 300 : 1800);
      if (i === 1) await p.addStyleTag({ content: 'header, [class*="sticky"], [class*="fixed"]:not(.space-page){visibility:hidden!important}' });
      const f = `/tmp/bands/${id}-${i}.png`;
      await p.screenshot({ path: f }); bands.push({ f, y });
    }
    fs.writeFileSync(`/tmp/bands/${id}.json`, JSON.stringify({ H, bands }));
    execFileSync('python3', ['capture/stitch.py', id, String(H), String(CH)], { stdio: 'inherit' });
    console.log(id, 'H=' + H, 'bands=' + nb);
  } catch (e) { console.log(id, 'ERR', e.message.slice(0, 90)); }
  await b.close();
}
