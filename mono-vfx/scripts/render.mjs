// Usage:
//   npm run render -- --id MONO-01-ObsidianSlash [--landscape] [--quality high|preview|ultra]
//   npm run render:katana            (family batch, both formats)
//   npm run preview -- --id ...      (quality=preview, scale 0.5, 30fps-equivalent not applied; timing unchanged)
//   npm run render:all
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';

const a = process.argv.slice(2);
const get = (k, d) => { const i = a.indexOf('--' + k); return i >= 0 && a[i + 1] && !a[i + 1].startsWith('--') ? a[i + 1] : d; };
const has = (k) => a.includes('--' + k);

// Registry mirror (id -> family). Keep in sync with src/registry.ts.
const REG = JSON.parse(fs.readFileSync(new URL('./registry.json', import.meta.url), 'utf8'));
const preview = has('preview');
const quality = preview ? 'preview' : get('quality', 'high');
const scale = preview ? 0.5 : Number(get('scale', 1));
const formats = has('landscape') ? ['landscape'] : has('portrait') ? ['portrait'] : ['portrait', 'landscape'];
const range = get('frames', null)?.split('-').map(Number);

let list = REG;
if (get('id', null)) list = REG.filter((e) => e.id === get('id'));
else if (get('family', null)) list = REG.filter((e) => e.family === get('family'));
else if (!has('all')) { console.error('Specify --id, --family or --all'); process.exit(1); }
if (!list.length) { console.error('No registered effect matches (only implemented effects are registered).'); process.exit(1); }

const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
for (const e of list) for (const f of formats) {
  const id = e.id + (f === 'landscape' ? '-16x9' : '');
  const props = {quality, orientation: f};
  const comp = await selectComposition({serveUrl, id, inputProps: props, chromiumOptions: {gl: 'swangle'}});
  const dir = preview ? 'previews' : `renders/${e.family}`;
  fs.mkdirSync(dir, {recursive: true});
  const out = path.join(dir, `${id}${preview ? '_preview' : ''}_${quality}.mp4`);
  let last = -1;
  await renderMedia({
    composition: comp, serveUrl, codec: 'h264', outputLocation: out, inputProps: props, scale,
    chromiumOptions: {gl: 'swangle'}, concurrency: 4, crf: 14, pixelFormat: 'yuv420p', overwrite: true,
    frameRange: range ? [range[0], range[1]] : null,
    onProgress: ({progress}) => { const p = Math.floor(progress * 20); if (p !== last) { last = p; console.log(`${id} ${p * 5}%`); } },
  });
  console.log('WROTE', out);
}
