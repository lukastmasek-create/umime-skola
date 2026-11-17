// node scripts/still.mjs --id MONO-01-ObsidianSlash --frames 0,120,300 [--quality preview] [--landscape] [--scale 0.5]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition, openBrowser} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';
const a = process.argv.slice(2);
const get = (k, d) => { const i = a.indexOf('--' + k); return i >= 0 ? a[i + 1] : d; };
const id0 = get('id', 'MONO-01-ObsidianSlash');
const id = id0 + (a.includes('--landscape') ? '-16x9' : '');
const frames = get('frames', '0').split(',').map(Number);
const quality = get('quality', 'preview');
const scale = Number(get('scale', 1));
const out = get('out', 'previews/' + id0);
fs.mkdirSync(out, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browser = await openBrowser('chrome', {chromiumOptions: {gl: 'swangle'}});
const props = {quality, orientation: a.includes('--landscape') ? 'landscape' : 'portrait'};
const comp = await selectComposition({serveUrl, id, inputProps: props, puppeteerInstance: browser});
for (const f of frames) {
  const output = path.join(out, `${id}_${quality}_f${String(f).padStart(4, '0')}.png`);
  await renderStill({composition: comp, serveUrl, output, frame: f, inputProps: props, scale, puppeteerInstance: browser, chromiumOptions: {gl: 'swangle'}, overwrite: true});
  console.log(output);
}
await browser.close({silent: true});
