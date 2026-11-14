// Renders the animation to MP4: node render.cjs <outdir> [samples=5] [width=1920] [workers=2]
// Needs: playwright-core, headless Chromium, ffmpeg, and a static server on :8765 serving a folder with stills.html (see below).
// Usage by stages:  node render.cjs audio <outdir>   |   node render.cjs frames <outdir> <from> <to> <samples> <width>   |   node render.cjs mux <outdir>
const { chromium } = require('playwright-core');
const fs = require('fs'), cp = require('child_process');
const [mode, out, a, b, n, w] = process.argv.slice(2);
const FPS = 30, DUR = 25;
const open = async () => {
  const br = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium', args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await br.newPage({ viewport: { width: 1300, height: 800 } });
  p.on('pageerror', (e) => console.log('[err]', e.message));
  await p.goto(`http://localhost:8765/stills.html?w=${w || 1920}&n=${n || 5}`);
  await p.waitForFunction('window.READY', null, { timeout: 300000 });
  return [br, p];
};
(async () => {
  fs.mkdirSync(out, { recursive: true });
  if (mode === 'audio') {
    const [br, p] = await open();
    const b64 = await p.evaluate(async () => {
      const r = await SOUND.renderOffline((k) => STYLES[0].sound(k), 25, 48000, { voiceover: false });
      const i16 = new Int16Array(r.inter.length); for (let i = 0; i < i16.length; i++) i16[i] = Math.max(-1, Math.min(1, r.inter[i])) * 32767;
      let s = ''; const u8 = new Uint8Array(i16.buffer); for (let i = 0; i < u8.length; i += 32768) s += String.fromCharCode.apply(null, u8.subarray(i, i + 32768)); return btoa(s);
    });
    fs.writeFileSync(`${out}/audio.raw`, Buffer.from(b64, 'base64')); await br.close(); console.log('audio ok');
  } else if (mode === 'frames') {
    const [br, p] = await open();
    for (let i = +a; i < +b; i++) {
      const f = `${out}/f${String(i).padStart(4, '0')}.jpg`; if (fs.existsSync(f)) continue;
      const d = await p.evaluate((t) => window.shot(t, 0.95), i / FPS);
      fs.writeFileSync(f, Buffer.from(d.split(',')[1], 'base64'));
      if (i % 10 === 0) console.log('frame', i);
    }
    await br.close();
  } else if (mode === 'mux') {
    cp.execSync(`ffmpeg -y -f s16le -ar 48000 -ac 2 -i ${out}/audio.raw -af loudnorm=I=-15:TP=-1.5:LRA=11 ${out}/audio.wav`, { stdio: 'inherit' });
    cp.execSync(`ffmpeg -y -framerate ${FPS} -i ${out}/f%04d.jpg -i ${out}/audio.wav -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart -shortest ${out}/ucime-se-hrou.mp4`, { stdio: 'inherit' });
  }
})();
