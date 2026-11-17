import { chromium, loggedIn, LOCAL } from './login.mjs';
const b = await chromium.launch({ args: ['--no-sandbox'] });
const ctx = await loggedIn(b, 'zak');
const p = await ctx.newPage();
await p.goto(LOCAL + '/cs/stale-hry/ekonomika', { waitUntil: 'load', timeout: 180000 }); await p.waitForTimeout(6000);
await p.screenshot({ path: 'public/shots/g-ekonomika-dash.png' });
for (const t of ['Práce', 'Firma', 'Investice', 'Banka']) {
  try { await p.locator('button', { hasText: t }).first().click({ timeout: 5000 }); await p.waitForTimeout(2000); await p.screenshot({ path: `public/shots/g-ekonomika-${t.toLowerCase().normalize('NFD').replace(/[^a-z]/g, '')}.png` }); console.log(t, 'ok'); } catch { console.log(t, 'miss'); }
}
await b.close();
