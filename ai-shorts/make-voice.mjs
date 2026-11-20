// node make-voice.mjs stories/<story>/part-N ...   -> voice.wav + marks.js (line starts, word times)
import { KokoroTTS } from 'kokoro-js';
import fs from 'fs'; import path from 'path';
const SR = 24000;
const tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', { dtype: 'q8', device: 'cpu' });
function trim(a) { let s = 0, e = a.length - 1; while (s < e && Math.abs(a[s]) < .004) s++; while (e > s && Math.abs(a[e]) < .004) e--; return a.slice(Math.max(0, s - 240), Math.min(a.length, e + 480)); }
function wav(f32, file) {
  const b = Buffer.alloc(44 + f32.length * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + f32.length * 2, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(f32.length * 2, 40);
  for (let i = 0; i < f32.length; i++) b.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(f32[i] * 32767))), 44 + i * 2);
  fs.writeFileSync(file, b);
}
for (const dir of process.argv.slice(2)) {
  const sc = JSON.parse(fs.readFileSync(path.join(dir, 'script.json'), 'utf8'));
  const chunks = [], lines = []; let pos = Math.round(.25 * SR); chunks.push(new Float32Array(pos));
  for (const [text, speed, pause] of sc.lines) {
    const plain = text.replace(/\*/g, '');
    const r = await tts.generate(plain, { voice: sc.voice || 'af_heart', speed: speed || 1 });
    const a = trim(r.audio); chunks.push(a);
    const start = pos / SR, dur = a.length / SR; pos += a.length;
    const sil = new Float32Array(Math.round((pause == null ? .35 : pause) * SR)); chunks.push(sil); pos += sil.length;
    const ws = text.split(/\s+/).filter(Boolean).map(w => ({ raw: w, e: w.startsWith('*') || w.endsWith('*'), w: w.replace(/\*/g, '') }));
    const wt = ws.map(w => w.w.length + 1 + (/[,]$/.test(w.w) ? 3 : /[.!?…]$/.test(w.w) ? 5 : 0)); const tot = wt.reduce((x, y) => x + y, 0);
    let c = 0; const words = ws.map((w, i) => { const o = { w: w.w, e: w.e, t: start + dur * c / tot }; c += wt[i]; return o; });
    lines.push({ text: plain, start, end: start + dur, dur, words });
    console.log(path.basename(dir), start.toFixed(2), dur.toFixed(2), plain.slice(0, 40));
  }
  const total = pos / SR;
  const all = new Float32Array(pos); let o = 0; for (const c of chunks) { all.set(c, o); o += c.length; }
  wav(all, path.join(dir, 'voice.wav'));
  fs.writeFileSync(path.join(dir, 'marks.js'), 'window.MARKS=' + JSON.stringify({ total, lines }) + ';');
  console.log(dir, 'total', total.toFixed(1));
}
