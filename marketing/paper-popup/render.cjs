// Renders the animation to MP4 (1920x1080, 30 fps, sound at about -15 LUFS).
//   npm i playwright-core ffmpeg-static     (ffmpeg-static replaces a system ffmpeg; Chrome/Chromium must be installed)
//   node render.cjs [samples=32] [outdir=video]
// samples = sub-renders per frame (motion blur, depth of field, soft shadows): 32 is good, 56 is the style's full quality.
// env: CHROME=/path/to/chrome (default: Playwright's Chromium), FRAMES=N (render only the first N frames, for a test)
const { chromium } = require('playwright-core');
const fs = require('fs'), http = require('http'), path = require('path'), cp = require('child_process');
let FF = 'ffmpeg'; try { FF = require('ffmpeg-static'); } catch (e) {}   // ffmpeg-static brings its own ffmpeg, so nothing else has to be installed
const samples = +(process.argv[2] || 32), out = path.resolve(process.argv[3] || 'video'), FPS = 30;
fs.mkdirSync(out, { recursive: true });
const server = http.createServer((q, r) => { const f = path.join(__dirname, q.url.split('?')[0] === '/' ? 'index.html' : q.url.split('?')[0]); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { 'Content-Type': f.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream' }); r.end(d); } }); });
(async () => {
  await new Promise((ok) => server.listen(0, ok));
  const br = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ['--no-sandbox', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=default', '--enable-unsafe-swiftshader'] });
  const p = await br.newPage({ viewport: { width: 1300, height: 800 } });
  p.on('pageerror', (e) => console.log('[page error]', e.message));
  await p.goto(`http://localhost:${server.address().port}/index.html?render&samples=${samples}`);
  await p.waitForFunction('window.DURATION', null, { timeout: 300000 });
  const dur = await p.evaluate('window.DURATION'), total = Math.min(+(process.env.FRAMES || Infinity), Math.ceil(dur * FPS));
  console.log(`duration ${dur.toFixed(2)} s, ${total} frames, ${samples} samples`);
  const b64 = await p.evaluate(async () => {
    const r = await SOUND.renderOffline((k) => STYLE.sound(k), STYLE.duration, 48000, { voiceover: false });
    const i16 = new Int16Array(r.inter.length); for (let i = 0; i < i16.length; i++) i16[i] = Math.max(-1, Math.min(1, r.inter[i])) * 32767;
    let s = ''; const u8 = new Uint8Array(i16.buffer); for (let i = 0; i < u8.length; i += 32768) s += String.fromCharCode.apply(null, u8.subarray(i, i + 32768)); return btoa(s);
  });
  fs.writeFileSync(`${out}/audio.raw`, Buffer.from(b64, 'base64')); console.log('sound rendered');
  const t0 = Date.now();
  for (let i = 0; i < total; i++) {
    const f = `${out}/f${String(i).padStart(4, '0')}.jpg`; if (fs.existsSync(f)) continue;   // a stopped render resumes where it was
    const d = await p.evaluate((t) => { window.seek(t); return document.getElementById('c').toDataURL('image/jpeg', 0.95); }, i / FPS);
    fs.writeFileSync(f, Buffer.from(d.split(',')[1], 'base64'));
    if (i % 15 === 0) console.log(`frame ${i}/${total}, ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  }
  await br.close(); server.close();
  cp.execSync(`"${FF}" -y -f s16le -ar 48000 -ac 2 -i "${out}/audio.raw" -af loudnorm=I=-15:TP=-1.5:LRA=11 -ar 48000 "${out}/audio.wav"`, { stdio: 'inherit' });
  cp.execSync(`"${FF}" -y -framerate ${FPS} -i "${out}/f%04d.jpg" -i "${out}/audio.wav" -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart -shortest "${out}/ucime-se-hrou.mp4"`, { stdio: 'inherit' });
  console.log('done:', `${out}/ucime-se-hrou.mp4`);
})();
