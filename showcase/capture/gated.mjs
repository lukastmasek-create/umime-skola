import fs from 'node:fs';
import { chromium, loggedIn, LOCAL } from './login.mjs';
fs.mkdirSync('public/shots', { recursive: true });
const b = await chromium.launch({ args: ['--no-sandbox'] });
const routes = (process.env.ROUTES || 'farma:/cs/stale-hry/farma,mesto:/cs/stale-hry/mesto,zakladna:/cs/stale-hry/zakladna,ekonomika:/cs/stale-hry/ekonomika,mazlicci:/cs/stale-hry/mazlicci,tymy:/cs/tymy,profil:/cs/profil,obchod:/cs/obchod,zebricky:/cs/zebricky,pokoj:/cs/pokoj,parta:/cs/parta').split(',').map(s => s.split(/:(.+)/));
const ctx = await loggedIn(b, process.env.WHO || 'zak');
for (const [id, path] of routes) {
  const p = await ctx.newPage();
  try {
    const r = await p.goto(LOCAL + path, { waitUntil: 'load', timeout: 180000 });
    await p.waitForTimeout(6000);
    await p.screenshot({ path: `public/shots/g-${id}.png` });
    console.log(id, r?.status(), p.url().replace(LOCAL, ''));
  } catch (e) { console.log(id, 'ERR', e.message.slice(0, 90)); }
  await p.close();
}
await b.close();
