// Original, procedurally drawn stand-in artwork. NOT official covers: each carries a tiny
// "STAND-IN ARTWORK" label. Seeded → deterministic.
import {rng} from '../animation/motion';
import {FONT} from './fonts';
import {HEROES, PLAYLISTS} from './content';

type Ctx = CanvasRenderingContext2D;
const mk = (s: number) => { const c = document.createElement('canvas'); c.width = c.height = s; return c; };
const label = (g: Ctx, s: number, col = 'rgba(255,255,255,.45)') => {
  g.fillStyle = col; g.font = `600 ${s * 0.0165}px ${FONT}`; g.textBaseline = 'alphabetic';
  g.fillText('STAND-IN ARTWORK', s * 0.045, s * 0.965);
};
function grain(g: Ctx, s: number, seed: number, a: number, n = 40000) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) { const v = r() > 0.5 ? 255 : 0; g.fillStyle = `rgba(${v},${v},${v},${r() * a})`; g.fillRect(r() * s, r() * s, s / 700, s / 700); }
}

function weeknd(s: number) {
  const c = mk(s), g = c.getContext('2d')!;
  const bg = g.createLinearGradient(0, 0, 0, s); bg.addColorStop(0, '#12030a'); bg.addColorStop(0.55, '#5a0716'); bg.addColorStop(1, '#0a0205');
  g.fillStyle = bg; g.fillRect(0, 0, s, s);
  const rad = g.createRadialGradient(s * 0.5, s * 0.46, 0, s * 0.5, s * 0.46, s * 0.55);
  rad.addColorStop(0, 'rgba(255,60,70,.85)'); rad.addColorStop(0.35, 'rgba(210,16,42,.45)'); rad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = rad; g.fillRect(0, 0, s, s);
  // neon blinds: horizontal slats across a disc
  g.save(); g.beginPath(); g.arc(s * 0.5, s * 0.46, s * 0.27, 0, 7); g.clip();
  const d = g.createLinearGradient(0, s * 0.19, 0, s * 0.73); d.addColorStop(0, '#ff5a64'); d.addColorStop(1, '#b50d27'); g.fillStyle = d; g.fillRect(0, 0, s, s);
  g.fillStyle = '#12030a';
  for (let i = 0; i < 14; i++) { const y = s * 0.19 + i * s * 0.0395 + i * i * s * 0.0006; g.fillRect(0, y + s * 0.012, s, s * (0.006 + i * 0.0014)); }
  g.restore();
  // light streaks
  for (let i = 0; i < 5; i++) { g.fillStyle = `rgba(255,150,160,${0.35 - i * 0.05})`; g.fillRect(0, s * (0.80 + i * 0.022), s, s * 0.0035); }
  g.fillStyle = '#fff'; g.font = `800 ${s * 0.068}px ${FONT}`; g.fillText('AFTER HOURS', s * 0.045, s * 0.89);
  grain(g, s, 11, 0.08, 14000); label(g, s); return c;
}
function daft(s: number) {
  const c = mk(s), g = c.getContext('2d')!;
  g.fillStyle = '#070605'; g.fillRect(0, 0, s, s);
  // polished gold prism facets
  const facets: [number, number][][] = [[[0.5, 0.12], [0.86, 0.5], [0.5, 0.5]], [[0.5, 0.12], [0.5, 0.5], [0.14, 0.5]], [[0.14, 0.5], [0.5, 0.5], [0.5, 0.88]], [[0.86, 0.5], [0.5, 0.88], [0.5, 0.5]]];
  const cols = [['#fff0b8', '#c7902f'], ['#8a5a12', '#e9bb5a'], ['#f5cf7a', '#6b430c'], ['#c18a2b', '#fff3c4']];
  facets.forEach((f, i) => {
    const gr = g.createLinearGradient(f[0][0] * s, f[0][1] * s, f[2][0] * s, f[2][1] * s);
    gr.addColorStop(0, cols[i][0]); gr.addColorStop(1, cols[i][1]); g.fillStyle = gr;
    g.beginPath(); f.forEach((p, k) => (k ? g.lineTo(p[0] * s, p[1] * s) : g.moveTo(p[0] * s, p[1] * s))); g.closePath(); g.fill();
  });
  g.strokeStyle = 'rgba(0,0,0,.55)'; g.lineWidth = s * 0.004;
  g.beginPath(); g.moveTo(0.5 * s, 0.12 * s); g.lineTo(0.5 * s, 0.88 * s); g.moveTo(0.14 * s, 0.5 * s); g.lineTo(0.86 * s, 0.5 * s); g.stroke();
  // fine brushed lines
  const r = rng(5); for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(255,236,170,${r() * 0.07})`; g.fillRect(0, r() * s, s, s * 0.0016); }
  g.fillStyle = '#e9bb5a'; g.font = `800 ${s * 0.046}px ${FONT}`; g.fillText('RANDOM ACCESS MEMORIES', s * 0.045, s * 0.935); label(g, s, 'rgba(233,187,90,.6)');
  g.font = `800 ${s * 0.046}px ${FONT}`; return c;
}
function billie(s: number) {
  const c = mk(s), g = c.getContext('2d')!;
  const bg = g.createLinearGradient(0, 0, 0, s); bg.addColorStop(0, '#06122a'); bg.addColorStop(0.5, '#1f4fa6'); bg.addColorStop(1, '#8fb9ff');
  g.fillStyle = bg; g.fillRect(0, 0, s, s);
  const r = rng(9);
  for (let i = 0; i < 26; i++) {
    const x = r() * s, y = s * (0.3 + r() * 0.65), rr = s * (0.1 + r() * 0.22);
    const gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, `rgba(220,235,255,${0.20 + r() * 0.15})`); gr.addColorStop(1, 'rgba(220,235,255,0)');
    g.fillStyle = gr; g.fillRect(x - rr, y - rr, rr * 2, rr * 2);
  }
  // dark glass sphere
  const sx = s * 0.5, sy = s * 0.44, sr = s * 0.2;
  const sg = g.createRadialGradient(sx - sr * 0.35, sy - sr * 0.4, sr * 0.05, sx, sy, sr);
  sg.addColorStop(0, '#9fc3ff'); sg.addColorStop(0.18, '#1a3d86'); sg.addColorStop(1, '#030a1c');
  g.fillStyle = sg; g.beginPath(); g.arc(sx, sy, sr, 0, 7); g.fill();
  g.strokeStyle = 'rgba(190,215,255,.5)'; g.lineWidth = s * 0.004; g.beginPath(); g.arc(sx, sy, sr * 0.99, 3.6, 5.2); g.stroke();
  g.fillStyle = '#eaf2ff'; g.font = `800 ${s * 0.052}px ${FONT}`; g.fillText('HIT ME HARD AND SOFT', s * 0.045, s * 0.9);
  grain(g, s, 3, 0.05, 9000); label(g, s); return c;
}
function travis(s: number) {
  const c = mk(s), g = c.getContext('2d')!;
  const bg = g.createLinearGradient(0, 0, 0, s); bg.addColorStop(0, '#2a1d14'); bg.addColorStop(0.6, '#120c08'); bg.addColorStop(1, '#040302');
  g.fillStyle = bg; g.fillRect(0, 0, s, s);
  const rad = g.createRadialGradient(s * 0.5, s * 0.78, 0, s * 0.5, s * 0.78, s * 0.5);
  rad.addColorStop(0, 'rgba(235,150,80,.65)'); rad.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rad; g.fillRect(0, 0, s, s);
  // arch monolith
  g.fillStyle = '#050403'; g.beginPath(); g.moveTo(s * 0.3, s * 0.82); g.lineTo(s * 0.3, s * 0.4); g.arc(s * 0.5, s * 0.4, s * 0.2, Math.PI, 0); g.lineTo(s * 0.7, s * 0.82); g.closePath(); g.fill();
  const slit = g.createLinearGradient(0, s * 0.3, 0, s * 0.82); slit.addColorStop(0, 'rgba(255,196,120,0)'); slit.addColorStop(1, 'rgba(255,170,90,.95)');
  g.fillStyle = slit; g.fillRect(s * 0.488, s * 0.3, s * 0.024, s * 0.52);
  g.fillStyle = '#d7b79a'; g.font = `800 ${s * 0.07}px ${FONT}`; g.fillText('UTOPIA', s * 0.045, s * 0.92);
  grain(g, s, 21, 0.22, 70000); label(g, s); return c;
}

export const HERO_ART = {weeknd, daft, billie, travis};

function plBase(s: number, a: string, b: string, name: string) {
  const c = mk(s), g = c.getContext('2d')!;
  const gr = g.createLinearGradient(0, 0, s, s); gr.addColorStop(0, a); gr.addColorStop(1, b); g.fillStyle = gr; g.fillRect(0, 0, s, s);
  return {c, g};
}
function plTitle(g: Ctx, s: number, text: string, col = '#fff', size = 0.11, y = 0.9) {
  g.fillStyle = col; g.font = `800 ${s * size}px ${FONT}`; g.textBaseline = 'alphabetic';
  const words = text.split(' '); let line = ''; const lines: string[] = [];
  for (const w of words) { const t = line ? line + ' ' + w : w; if (g.measureText(t).width > s * 0.86 && line) { lines.push(line); line = w; } else line = t; }
  lines.push(line);
  lines.forEach((l, i) => g.fillText(l, s * 0.07, s * y - (lines.length - 1 - i) * s * size * 1.05));
}
export function playlistArt(key: string, s: number) {
  const pl = PLAYLISTS.find((p) => p.key === key)!;
  let c: HTMLCanvasElement, g: Ctx;
  if (key === 'top') {
    ({c, g} = plBase(s, '#ff7a45', '#c4153b', pl.name));
    g.fillStyle = 'rgba(255,255,255,.14)'; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(s * 0.72, s * 0.3, s * (0.12 + i * 0.1), 0, 7); g.lineWidth = s * 0.012; g.strokeStyle = 'rgba(255,255,255,.18)'; g.stroke(); }
    g.fillStyle = '#fff'; g.beginPath(); g.arc(s * 0.72, s * 0.3, s * 0.06, 0, 7); g.fill();
    plTitle(g, s, pl.name, '#fff', 0.125, 0.88);
  } else if (key === 'rap') {
    ({c, g} = plBase(s, '#0b0b0b', '#2a0a06', pl.name));
    const fl = g.createRadialGradient(s * 0.5, s * 0.9, 0, s * 0.5, s * 0.9, s * 0.7); fl.addColorStop(0, 'rgba(255,92,24,.9)'); fl.addColorStop(1, 'rgba(255,92,24,0)'); g.fillStyle = fl; g.fillRect(0, 0, s, s);
    g.fillStyle = '#ff5a1c'; g.fillRect(s * 0.07, s * 0.12, s * 0.12, s * 0.012);
    plTitle(g, s, 'RapCaviar', '#fff', 0.16, 0.88);
  } else if (key === 'discover') {
    ({c, g} = plBase(s, '#2d1b8a', '#5b8dff', pl.name));
    for (let i = 0; i < 7; i++) { g.strokeStyle = `rgba(255,255,255,${0.35 - i * 0.04})`; g.lineWidth = s * 0.008; g.beginPath(); g.arc(s * 0.2, s * 0.22, s * (0.1 + i * 0.11), 0, Math.PI / 2); g.stroke(); }
    plTitle(g, s, pl.name, '#fff', 0.125, 0.88);
  } else if (key === 'radar') {
    ({c, g} = plBase(s, '#1b0a33', '#d11e8a', pl.name));
    g.save(); g.translate(s * 0.62, s * 0.34); for (let i = 1; i < 5; i++) { g.strokeStyle = 'rgba(255,255,255,.28)'; g.lineWidth = s * 0.006; g.beginPath(); g.arc(0, 0, s * i * 0.07, 0, 7); g.stroke(); }
    const sw = g.createConicGradient(-1.2, 0, 0); sw.addColorStop(0, 'rgba(255,255,255,.55)'); sw.addColorStop(0.18, 'rgba(255,255,255,0)'); sw.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = sw; g.beginPath(); g.arc(0, 0, s * 0.28, 0, 7); g.fill(); g.restore();
    plTitle(g, s, pl.name, '#fff', 0.125, 0.88);
  } else {
    ({c, g} = plBase(s, '#b4ffe0', '#1db98a', pl.name));
    g.fillStyle = 'rgba(0,70,50,.12)'; for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(s * (0.15 + i * 0.14), s * 0.3, s * 0.09, s * 0.22, 0.6, 0, 7); g.fill(); }
    plTitle(g, s, 'mint', '#04301f', 0.22, 0.86);
  }
  g.fillStyle = 'rgba(255,255,255,.55)'; g.font = `600 ${s * 0.0165}px ${FONT}`; g.fillText('STAND-IN ARTWORK', s * 0.07, s * 0.965);
  return c;
}
export const heroArt = (k: keyof typeof HEROES, s = 1024) => HERO_ART[k](s);
