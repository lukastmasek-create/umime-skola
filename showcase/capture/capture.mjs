// Captures real ucimesehrou.org pages at 1920x1080 @2x (3840x2160) for screen textures.
import { createRequire } from 'node:module';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('playwright');
import fs from 'node:fs';
const BASE = process.env.BASE || 'https://ucimesehrou.org';
const routes = (process.env.ROUTES || 'home:/cs,kurzy:/cs/kurzy,multiplayer:/cs/hrat-spolecne,hry:/cs/stale-hry,farma:/cs/stale-hry/farma,mesto:/cs/stale-hry/mesto,zakladna:/cs/stale-hry/zakladna,ekonomika:/cs/stale-hry/ekonomika,tymy:/cs/tymy,ucitele:/cs/ucitele,zebricky:/cs/zebricky,obchod:/cs/obchod,trziste:/cs/trziste,unikovky:/cs/unikovky,denni-kviz:/cs/denni-kviz,materialy:/cs/materialy,mapa:/cs/mapa,pro:/cs/pro,skola:/cs/skola,rodina:/cs/rodina,code:/cs/code,scratch:/cs/scratch,mazlicci:/cs/stale-hry/mazlicci,opakovani:/cs/opakovani')
  .split(',').map(s => s.split(/:(.+)/));
fs.mkdirSync('public/shots', { recursive: true });
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2, locale: 'cs-CZ' });
for (const [id, path] of routes) {
  const p = await ctx.newPage();
  try {
    const r = await p.goto(BASE + path, { waitUntil: 'load', timeout: 45000 });
    await p.waitForTimeout(3500);
    await p.screenshot({ path: `public/shots/${id}.png` });
    const h = await p.evaluate(() => document.documentElement.scrollHeight);
    console.log(id, path, r?.status(), p.url().replace(BASE, ''), 'h=' + h);
    if (id === 'home') {
      // full-height strips for scroll shots
      for (let i = 1; i * 1080 < Math.min(h, 7560); i++) {
        await p.evaluate(y => window.scrollTo(0, y), i * 1000);
        await p.waitForTimeout(1200);
        await p.screenshot({ path: `public/shots/home-s${i}.png` });
      }
    }
  } catch (e) { console.log(id, 'ERR', e.message.slice(0, 80)); }
  await p.close();
}
await browser.close();
