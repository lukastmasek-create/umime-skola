import { createRequire } from 'node:module';
const { chromium } = createRequire('/opt/node22/lib/node_modules/')('playwright');
import path from 'node:path';
const b = await chromium.launch({ args: ['--no-sandbox'] });
const c = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 });
const p = await c.newPage();
await p.goto('file://' + path.resolve('capture/logo.html')); await p.waitForTimeout(500);
await p.screenshot({ path: 'public/shots/logo.png' }); await b.close();
