// Captures extra interactive UI states (clicks on real tabs) for gated game pages, logged in as the demo account.
import fs from 'node:fs';
import { chromium, loggedIn, LOCAL } from './login.mjs';
const b = await chromium.launch({ args: ['--no-sandbox'] });
const ctx = await loggedIn(b, 'zak');
const jobs = [
  ['farma', '/cs/stale-hry/farma', ['Zvířata', 'Sýpka', 'Zakázky']],
  ['zakladna', '/cs/stale-hry/zakladna', ['Pošta', 'Vesmír', 'Kodex']],
  ['mazlicci', '/cs/stale-hry/mazlicci', []],
  ['tymy', '/cs/tymy', ['Rozvum', 'Týmy']],
];
for (const [id, path, tabs] of jobs) {
  const p = await ctx.newPage();
  await p.goto(LOCAL + path, { waitUntil: 'load', timeout: 180000 }); await p.waitForTimeout(6000);
  for (const t of tabs) {
    try { await p.getByText(t, { exact: true }).first().click({ timeout: 4000 }); await p.waitForTimeout(1800); await p.screenshot({ path: `public/shots/g-${id}-${t.toLowerCase().normalize('NFD').replace(/[^a-z]/g, '')}.png` }); console.log(id, t, 'ok'); }
    catch (e) { console.log(id, t, 'miss'); }
  }
  await p.close();
}
// economy: create a demo character then capture dashboard
{
  const p = await ctx.newPage();
  await p.goto(LOCAL + '/cs/stale-hry/ekonomika', { waitUntil: 'load', timeout: 180000 }); await p.waitForTimeout(5000);
  try {
    await p.getByPlaceholder(/pojmenuj|jméno|Jak se/i).first().fill('Demo Firma'); await p.waitForTimeout(500);
    await p.screenshot({ path: 'public/shots/g-ekonomika-form.png' });
    await p.getByRole('button', { name: /Zažít/ }).click({ timeout: 5000 }); await p.waitForTimeout(7000);
    await p.screenshot({ path: 'public/shots/g-ekonomika-dash.png' }); console.log('eco dash ok');
    await p.evaluate(() => window.scrollTo(0, 700)); await p.waitForTimeout(1500);
    await p.screenshot({ path: 'public/shots/g-ekonomika-dash2.png' });
  } catch (e) { console.log('eco miss', String(e).slice(0, 80)); }
  await p.close();
}
// public multiplayer lobby with a typed join code
{
  const p = await (await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2, locale: 'cs-CZ' })).newPage();
  await p.goto('https://ucimesehrou.org/cs/hrat-spolecne', { waitUntil: 'load' }); await p.waitForTimeout(3000);
  await p.locator('input').first().fill('428913'); await p.waitForTimeout(800);
  await p.screenshot({ path: 'public/shots/multiplayer-typed.png' }); console.log('typed ok');
}
await b.close();

// manifest of existing shots (defs fall back to base shot when a state is missing)
fs.writeFileSync('src/film/manifest.json', JSON.stringify(fs.readdirSync('public/shots').filter(f => f.endsWith('.png')), null, 1));
