// node render.mjs stories/<story>/part-N [probe times via PROBE_T="1,5,9"]
import fs from 'fs'; import path from 'path'; import { execFileSync } from 'child_process'; import { createRequire } from 'module';
import { mix, readWav } from './sfx.mjs';
const require = createRequire('/opt/node-tools/node_modules/'); const { chromium } = require('playwright');
const HERE = path.dirname(new URL(import.meta.url).pathname);
const dir = path.resolve(process.argv[2]); const FPS = 30, WORKERS = 4;
const sc = JSON.parse(fs.readFileSync(path.join(dir, 'script.json'), 'utf8'));
const work = path.join(HERE, '.work', path.basename(path.dirname(dir)) + '-' + path.basename(dir)); fs.rmSync(work, { recursive: true, force: true }); fs.mkdirSync(work, { recursive: true });
const html = `<!doctype html><meta charset=utf-8><body style="margin:0;background:#000"><svg id="v" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 960" width="540" height="960" shape-rendering="geometricPrecision"></svg>
<script src="file://${HERE}/lib/engine.js"></script><script src="file://${HERE}/lib/envs.js"></script><script src="file://${HERE}/lib/fx.js"></script><script src="file://${path.join(dir, 'marks.js')}"></script><script src="file://${path.join(dir, 'part.js')}"></script></body>`;
fs.writeFileSync(path.join(work, 'page.html'), html);
const marks = JSON.parse(fs.readFileSync(path.join(dir, 'marks.js'), 'utf8').replace(/^window\.MARKS=/, '').replace(/;$/, ''));
const total = marks.total; const N = Math.ceil(total * FPS);
const browser = await chromium.launch();
const mk = async () => { const ctx = await browser.newContext({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2 }); const p = await ctx.newPage(); p.on('pageerror', e => console.log('PAGEERR', e.message)); p.on('console', m => m.type() === 'error' && console.log('CONERR', m.text())); await p.goto('file://' + path.join(work, 'page.html')); return p; };
const first = await mk();
const events = await first.evaluate(() => window.sfxEvents());
if (process.env.PROBE_T) {
  for (const t of process.env.PROBE_T.split(',').map(Number)) { await first.evaluate(t => renderAt(t), t); await first.screenshot({ path: path.join(HERE, '.work', `probe-${path.basename(path.dirname(dir))}-${path.basename(dir)}-${t}.png`) }); }
  await browser.close(); process.exit(0);
}
const pages = [first]; for (let i = 1; i < WORKERS; i++) pages.push(await mk());
let done = 0; const t0 = Date.now();
await Promise.all(pages.map(async (p, w) => { for (let i = w; i < N; i += WORKERS) { await p.evaluate(t => renderAt(t), i / FPS); await p.screenshot({ path: path.join(work, String(i).padStart(5, '0') + '.jpg'), type: 'jpeg', quality: 90 }); if (++done % 100 === 0) console.log(done + '/' + N, ((Date.now() - t0) / 1000).toFixed(0) + 's'); } }));
await browser.close();
const mixb = mix(readWav(path.join(dir, 'voice.wav')), events, sc.bed || 0, total); fs.writeFileSync(path.join(work, 'mix.wav'), mixb);
const out = path.join(path.dirname(dir), path.basename(dir) + '.mp4');
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(work, '%05d.jpg'), '-i', path.join(work, 'mix.wav'), '-c:v', 'libx264', '-preset', 'medium', '-crf', '25', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-ar', '44100', '-shortest', '-movflags', '+faststart', out]);
fs.rmSync(work, { recursive: true, force: true });
console.log('wrote', out, total.toFixed(1) + 's');
