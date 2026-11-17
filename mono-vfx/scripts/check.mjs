// Visual inspection: node scripts/check.mjs MONO-07-GlassExplosion=100,300,330 [MONO-08-...=...] [--quality preview] [--scale 0.4] [--landscape]
// Writes stills + contact sheet to previews/check/<id>/sheet.png
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition, openBrowser} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
const a = process.argv.slice(2);
const get = (k, d) => { const i = a.indexOf('--' + k); return i >= 0 ? a[i + 1] : d; };
const quality = get('quality', 'preview'), scale = Number(get('scale', 0.4)), land = a.includes('--landscape');
const specs = a.filter((x) => x.includes('='));
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browser = await openBrowser('chrome', {chromiumOptions: {gl: 'swangle'}});
for (const s of specs) {
  const [id0, fr] = s.split('=');
  const id = id0 + (land ? '-16x9' : '');
  const frames = fr.split(',').map(Number);
  const dir = path.join('previews/check', id0); fs.rmSync(dir, {recursive: true, force: true}); fs.mkdirSync(dir, {recursive: true});
  const props = {quality, orientation: land ? 'landscape' : 'portrait'};
  try {
    const comp = await selectComposition({serveUrl, id, inputProps: props, puppeteerInstance: browser});
    for (const f of frames) await renderStill({composition: comp, serveUrl, output: path.join(dir, `f${String(f).padStart(5, '0')}.png`), frame: f, inputProps: props, scale, puppeteerInstance: browser, chromiumOptions: {gl: 'swangle'}, overwrite: true});
    const w = land ? 320 : 216;
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-pattern_type', 'glob', '-i', path.join(dir, 'f*.png'), '-filter_complex', `scale=${w}:-1,tile=${frames.length}x1`, '-frames:v', '1', path.join(dir, 'sheet.png')]);
    console.log('SHEET', path.join(dir, 'sheet.png'));
  } catch (e) { console.log('FAIL', id0, String(e.message).split('\n')[0]); }
}
await browser.close({silent: true});
