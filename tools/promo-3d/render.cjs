// Render MP4 z animace.html v headless Chromiu.
//   node render.cjs <out.mp4> [samples=16] [workers=2]
// Každý snímek: window.seek(i / 30), canvas -> JPEG -> ffmpeg. Zvuk: SOUND.renderOffline, v mixu asi -15 LUFS.
// S GPU nech samples=64 (plná kvalita). Bez GPU (SwiftShader) je to pomalé, proto nižší počet vzorků.
// Volitelně LOCAL_ASSETS=<složka s three.module.js, three.core.js a fonts/> pro render bez přístupu na CDN.
const { chromium } = require('playwright');
const { spawn, execFileSync } = require('child_process');
const fs = require('fs'), os = require('os'), path = require('path');
const FPS = 30, PAGE = path.join(__dirname, 'out/animace.test.html');

async function openPage(browser, samples) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('pageerror', (e) => console.error('PAGEERROR', e.message));
  const A = process.env.LOCAL_ASSETS;
  if (A) {
    const map = JSON.parse(fs.readFileSync(A + '/fonts/map.json'));
    await page.route('https://cdn.jsdelivr.net/**', (r) => r.fulfill({ path: A + '/' + (r.request().url().endsWith('three.core.js') ? 'three.core.js' : 'three.module.js'), contentType: 'text/javascript', headers: { 'access-control-allow-origin': '*' } }));
    await page.route('https://fonts.googleapis.com/**', (r) => { let css = fs.readFileSync(A + '/fonts/fonts.css', 'utf8'); for (const [u, f] of Object.entries(map)) css = css.split(u).join('https://fonts.gstatic.com/local/' + f); r.fulfill({ body: css, contentType: 'text/css', headers: { 'access-control-allow-origin': '*' } }); });
    await page.route('https://fonts.gstatic.com/local/**', (r) => r.fulfill({ path: A + '/fonts/' + r.request().url().split('/').pop(), contentType: 'font/woff2', headers: { 'access-control-allow-origin': '*' } }));
  }
  await page.goto('file://' + PAGE + '?render=1&samples=' + samples);
  await page.waitForFunction(() => window.__done, null, { timeout: 600000 });
  if ((await page.evaluate(() => String(window.__done))) !== 'true') throw new Error('stránka se nenačetla');
  return page;
}
const launch = () => chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-gpu-rasterization'] });

(async () => {
  const [mode] = process.argv.slice(2);
  if (mode === 'worker') {                       // node render.cjs worker <dir> <samples> <from> <to>
    const [, dir, samples, from, to] = process.argv.slice(2);
    const browser = await launch(), page = await openPage(browser, +samples);
    for (let i = +from; i < +to; i++) {
      const d = await page.evaluate((t) => { window.seek(t); return document.getElementById('cv').toDataURL('image/jpeg', 0.95); }, i / FPS);
      fs.writeFileSync(path.join(dir, `f${String(i).padStart(4, '0')}.jpg`), Buffer.from(d.split(',')[1], 'base64'));
      if ((i - +from) % 10 === 0) console.log(`frame ${i} (${from}-${to})`);
    }
    await browser.close(); return;
  }
  const [out, samples = '16', workers = '2'] = process.argv.slice(2);
  const browser = await launch(), page = await openPage(browser, 2);
  const dur = await page.evaluate(() => window.DURATION), total = Math.round(dur * FPS);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'promo3d-'));
  const wav = await page.evaluate(() => window.renderAudio()); fs.writeFileSync(dir + '/score.wav', Buffer.from(wav, 'base64'));
  await browser.close();
  console.log(`snímků ${total}, vzorků ${samples}, workerů ${workers}, složka ${dir}`);
  const n = +workers, per = Math.ceil(total / n);
  await Promise.all(Array.from({ length: n }, (_, k) => new Promise((res, rej) => {
    const p = spawn(process.execPath, [__filename, 'worker', dir, samples, k * per, Math.min(total, (k + 1) * per)], { stdio: 'inherit' });
    p.on('exit', (c) => (c ? rej(new Error('worker ' + k + ' skončil s ' + c)) : res()));
  })));
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-framerate', String(FPS), '-i', dir + '/f%04d.jpg', '-i', dir + '/score.wav',
    '-af', 'loudnorm=I=-15:TP=-1.5:LRA=11', '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-shortest', out]);
  fs.rmSync(dir, { recursive: true, force: true });
  console.log('hotovo', out);
})().catch((e) => { console.error(e); process.exit(1); });
