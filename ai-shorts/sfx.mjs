// synth sfx + bed, mix with voice -> mix.wav (24k mono)
import fs from 'fs';
const SR = 24000;
const nz = () => Math.random() * 2 - 1;
function env(n, a, d) { const e = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / SR; e[i] = Math.min(1, t / a) * Math.exp(-t / d); } return e; }
const K = {
  hit(){const n=SR*.25|0,e=env(n,.002,.06),o=new Float32Array(n);for(let i=0;i<n;i++){const t=i/SR;o[i]=(Math.sin(2*Math.PI*(150-100*t)*t)*.9+nz()*.35)*e[i]}return o},
  slam(){const n=SR*.7|0,e=env(n,.003,.16),o=new Float32Array(n);for(let i=0;i<n;i++){const t=i/SR;o[i]=(Math.sin(2*Math.PI*(110-70*t)*t)*1.1+nz()*.3*Math.exp(-t*20))*e[i]}return o},
  whoosh(){const n=SR*.4|0,o=new Float32Array(n);let lp=0;for(let i=0;i<n;i++){const t=i/n,a=Math.sin(Math.PI*t)**2;lp+= (nz()-lp)*(.05+.5*t);o[i]=lp*a*.9}return o},
  ping(){const n=SR*.5|0,e=env(n,.002,.12),o=new Float32Array(n);for(let i=0;i<n;i++){const t=i/SR;o[i]=(Math.sin(2*Math.PI*880*t)+Math.sin(2*Math.PI*1320*t)*.5)*e[i]*.5}return o},
  ping2(){const n=SR*.5|0,e=env(n,.002,.12),o=new Float32Array(n);for(let i=0;i<n;i++){const t=i/SR;o[i]=(Math.sin(2*Math.PI*1175*t)+Math.sin(2*Math.PI*1760*t)*.5)*e[i]*.5}return o},
  heart(){const n=SR*.6|0,o=new Float32Array(n);for(const s of[0,.22]){const e=env(n,.004,.07);for(let i=0;i<n-s*SR;i++){const t=i/SR;o[i+(s*SR|0)]+=Math.sin(2*Math.PI*60*t)*e[i]*1.1}}return o},
  tick(){const n=SR*.05|0,e=env(n,.001,.01),o=new Float32Array(n);for(let i=0;i<n;i++)o[i]=nz()*e[i]*.7;return o},
  zap(){const n=SR*.3|0,e=env(n,.002,.09),o=new Float32Array(n);for(let i=0;i<n;i++){const t=i/SR;o[i]=Math.sin(2*Math.PI*(1800-4500*t)*t)*e[i]*.6+nz()*e[i]*.2}return o},
  chime(){const n=SR*1.2|0,e=env(n,.003,.35),o=new Float32Array(n);for(let i=0;i<n;i++){const t=i/SR;o[i]=(Math.sin(2*Math.PI*660*t)+Math.sin(2*Math.PI*990*t)*.6+Math.sin(2*Math.PI*1320*t)*.3)*e[i]*.4}return o},
  swell(){const n=SR*1.2|0,o=new Float32Array(n);for(let i=0;i<n;i++){const t=i/n;o[i]=Math.sin(2*Math.PI*(200+700*t*t)*i/SR)*t*t*.5+nz()*t*t*.15}return o},
  boom(){const n=SR*1.1|0,e=env(n,.004,.3),o=new Float32Array(n);for(let i=0;i<n;i++){const t=i/SR;o[i]=(Math.sin(2*Math.PI*(70-30*t)*t)*1.2+nz()*.3*Math.exp(-t*8))*e[i]}return o},
  pop(){const n=SR*.12|0,e=env(n,.001,.025),o=new Float32Array(n);for(let i=0;i<n;i++){const t=i/SR;o[i]=Math.sin(2*Math.PI*(400+1400*t)*t)*e[i]*.8}return o},
  freeze(){const n=SR*.9|0,o=new Float32Array(n);for(let i=0;i<n;i++){const t=i/n;o[i]=(Math.sin(2*Math.PI*(900-780*t)*i/SR)*.5+nz()*.12)*Math.exp(-t*3)}return o},
  portal(){const n=SR*.8|0,o=new Float32Array(n);for(let i=0;i<n;i++){const t=i/n,a=Math.sin(Math.PI*t);o[i]=(Math.sin(2*Math.PI*(300+500*t)*i/SR)*.5+Math.sin(2*Math.PI*(310+520*t)*i/SR)*.5)*a*.5}return o},
};
export function mix(voice, events, bedNote, total) {
  const n = Math.round(total * SR) + SR; const out = new Float32Array(n);
  for (let i = 0; i < voice.length && i < n; i++) out[i] += voice[i];
  for (const ev of events) { const f = K[ev.k] || K.hit, s = f(), o = Math.max(0, Math.round(ev.t * SR)); const g = (ev.g == null ? .5 : ev.g); for (let i = 0; i < s.length && o + i < n; i++) out[o + i] += s[i] * g; }
  const f0 = 55 * Math.pow(2, (bedNote || 0) / 12);
  for (let i = 0; i < n; i++) { const t = i / SR; out[i] += (Math.sin(2 * Math.PI * f0 * t) + .6 * Math.sin(2 * Math.PI * f0 * 1.5 * t + Math.sin(t * .7)) + .4 * Math.sin(2 * Math.PI * f0 * 2 * t)) * .035 * (.7 + .3 * Math.sin(t * .9)); }
  let mx = 0; for (let i = 0; i < n; i++) mx = Math.max(mx, Math.abs(out[i])); const g = mx > .95 ? .95 / mx : 1;
  const b = Buffer.alloc(44 + n * 2); b.write('RIFF', 0); b.writeUInt32LE(36 + n * 2, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, out[i] * g)) * 32767), 44 + i * 2);
  return b;
}
export function readWav(file) { const b = fs.readFileSync(file); const n = (b.length - 44) / 2; const f = new Float32Array(n); for (let i = 0; i < n; i++) f[i] = b.readInt16LE(44 + i * 2) / 32767; return f; }
