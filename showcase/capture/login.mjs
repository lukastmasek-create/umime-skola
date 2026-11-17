import { createRequire } from 'node:module';
const { chromium } = createRequire('/opt/node22/lib/node_modules/')('playwright');
export const LOCAL = 'http://localhost:3000';
export async function loggedIn(browser, who = 'zak', opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: opts.dpr ?? 2, locale: 'cs-CZ' });
  await ctx.addInitScript(() => { const st = document.createElement('style'); st.textContent = 'nextjs-portal,[data-nextjs-toast],[data-next-badge-root]{display:none!important}'; document.addEventListener('DOMContentLoaded', () => document.head.appendChild(st)); });
  const p = await ctx.newPage();
  await p.goto(LOCAL + '/cs/prihlaseni', { waitUntil: 'load', timeout: 120000 });
  await p.fill('input[type=email]', `demo.${who}@example.test`);
  await p.fill('input[type=password]', 'DemoPass-12345');
  await Promise.all([p.waitForURL(u => !u.pathname.includes('prihlaseni'), { timeout: 120000 }), p.click('button[type=submit]')]);
  await p.close();
  return ctx;
}
export { chromium };
