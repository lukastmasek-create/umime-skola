// Sticker-2D shorts engine (new, original art). Browser-side, deterministic: renderAt(t) draws one frame.
(function (G) {
const W = 540, H = 960, GY = 650, INK = '#1b1b2f';
const FONT = "'Liberation Sans','DejaVu Sans',Arial,sans-serif";
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const E = {
  lin: x => x,
  io: x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2,
  out: x => 1 - Math.pow(1 - x, 3),
  in: x => x * x * x,
  expo: x => x >= 1 ? 1 : 1 - Math.pow(2, -10 * x),
  back: x => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
  hold: x => x < 1 ? 0 : 1,
};
const f2 = n => Math.round(n * 100) / 100;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const rnd = (i) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

// ---------- primitives ----------
const rc = (x, y, w, h, f, s, r) => `<rect x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h)}" fill="${f}"${s ? ` stroke="${INK}" stroke-width="${s}"` : ''}${r ? ` rx="${r}"` : ''}/>`;
const ci = (x, y, r, f, s) => `<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(Math.max(0, r))}" fill="${f}"${s ? ` stroke="${INK}" stroke-width="${s}"` : ''}/>`;
const el_ = (x, y, rx, ry, f, s) => `<ellipse cx="${f2(x)}" cy="${f2(y)}" rx="${f2(rx)}" ry="${f2(ry)}" fill="${f}"${s ? ` stroke="${INK}" stroke-width="${s}"` : ''}/>`;
const pg = (d, f, s, extra = '') => `<path d="${d}" fill="${f}"${s ? ` stroke="${INK}" stroke-width="${s}" stroke-linejoin="round" stroke-linecap="round"` : ''} ${extra}/>`;
const ln = (x1, y1, x2, y2, w = 5, c = INK) => `<line x1="${f2(x1)}" y1="${f2(y1)}" x2="${f2(x2)}" y2="${f2(y2)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
const grad = (id, a, b) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
const cap = (x1, y1, x2, y2, w, c) => ln(x1, y1, x2, y2, w + 6, INK) + ln(x1, y1, x2, y2, w, c);
const tx = (s, x, y, size = 40, o = {}) => {
  const fill = o.fill || '#fff', rot = o.rot || 0, op = o.op == null ? 1 : o.op, anc = o.anchor || 'middle', sc = o.sc == null ? 1 : o.sc;
  return `<text x="${f2(x)}" y="${f2(y)}" font-size="${size}" text-anchor="${anc}" fill="${fill}" stroke="${INK}" stroke-width="6" stroke-linejoin="round" paint-order="stroke" font-family="${FONT}" font-weight="900" opacity="${op}" transform="translate(${f2(x)} ${f2(y)}) rotate(${rot}) scale(${f2(sc)}) translate(${-f2(x)} ${-f2(y)})">${esc(s)}</text>`;
};

// ---------- keyframe tracks ----------
function track(kf, u) {
  const states = []; let st = {};
  for (const k of kf) { st = Object.assign({}, st, k[1]); states.push(st); }
  let idx = -1;
  for (let i = 0; i < kf.length; i++) if (kf[i][0] <= u) idx = i;
  if (idx < 0) return states[0];
  if (idx === kf.length - 1) return states[idx];
  const a = states[idx], b = states[idx + 1];
  const k = seg(u, kf[idx][0], kf[idx + 1][0]);
  const e = (E[kf[idx + 1][2] || 'io'] || E.io)(k);
  const out = {};
  for (const key in b) {
    const av = a[key], bv = b[key];
    out[key] = (typeof bv === 'number' && typeof av === 'number') ? lerp(av, bv, e) : (av === undefined ? bv : av);
  }
  for (const key in a) if (!(key in out)) out[key] = a[key];
  return out;
}

// ---------- characters ----------
const PRESETS = {
  nova: { skin: '#f2c9a5', hair: '#4b2f9a', hs: 'wild', top: '#3ec1d3', tn: 'hoodie', bot: '#2d3a5a', shoe: '#fff', acc: ['glasses'], ac: '#ffd23f' },
  mo:   { skin: '#8d5a3b', hair: '#1b1b2f', hs: 'curly', top: '#ff7a59', tn: 'tee', bot: '#4a4e69', shoe: '#222', acc: ['phones'], ac: '#ffd23f' },
  rue:  { skin: '#e8b894', hair: '#15151f', hs: 'bob', top: '#2b2b36', tn: 'suit', bot: '#2b2b36', shoe: '#111', acc: ['shades'], ac: '#e63946' },
  sol:  { skin: '#d9a066', hair: '#2b1d0e', hs: 'spiky', top: '#f1faee', tn: 'tee', bot: '#1d3557', shoe: '#e63946', acc: ['scarf'], ac: '#e63946', beard: 1 },
  lyra: { skin: '#f7d6bf', hair: '#e07a1f', hs: 'long', top: '#6a4c93', tn: 'dress', bot: '#6a4c93', shoe: '#ffd166', acc: [], ac: '#ffd166' },
  echo: { skin: '#c68642', hair: '#2b2b2b', hs: 'bun', top: '#2a9d8f', tn: 'coat', bot: '#264653', shoe: '#222', acc: ['glasses'], ac: '#e9c46a' },
  zed:  { skin: '#f0c8a0', hair: '#ff5d8f', hs: 'spiky', top: '#9b7bd6', tn: 'pj', bot: '#9b7bd6', shoe: '#fff', acc: [], ac: '#fff' },
  kit:  { skin: '#f3cfb3', hair: '#2a9d8f', hs: 'bun', top: '#ffd166', tn: 'tee', bot: '#355070', shoe: '#e56b6f', acc: [], ac: '#e56b6f' },
  trk:  { skin: '#d8a47f', hair: '#222', hs: 'cap', top: '#3a5a40', tn: 'vest', bot: '#344e41', shoe: '#111', acc: [], ac: '#dad7cd', beard: 1 },
  ash:  { skin: '#e9c4a0', hair: '#222', hs: 'bob', top: '#06d6a0', tn: 'hoodie', bot: '#22223b', shoe: '#fff', acc: ['watch'], ac: '#ffd23f' },
  bea:  { skin: '#a3704a', hair: '#ff9f1c', hs: 'curly', top: '#ef476f', tn: 'tee', bot: '#073b4c', shoe: '#fff', acc: [], ac: '#ffd23f' },
  vex:  { skin: '#e6c1a4', hair: '#111', hs: 'hood', top: '#7209b7', tn: 'coat', bot: '#240046', shoe: '#111', acc: ['shades'], ac: '#f72585' },
};
const MOOD = {
  calm: { eo: 1, iL: 0, iR: 0, bl: 0, m: 'smile' },
  happy: { eo: .9, iL: -3, iR: -3, bl: -3, m: 'grin', blush: 1 },
  laugh: { arc: 1, bl: -4, m: 'laugh', blush: 1 },
  shock: { eo: 1.35, ps: 3, bl: -9, iL: -2, iR: -2, m: 'o' },
  worried: { eo: 1.05, iL: -9, iR: -9, m: 'wavy', sweat: 1 },
  angry: { eo: .75, iL: 11, iR: 11, m: 'grit' },
  sly: { eo: .55, iL: 5, iR: -3, bl: -2, m: 'smirk' },
  whisper: { eo: 1, iL: -5, iR: -5, m: 'tiny' },
  sad: { eo: .85, iL: -10, iR: -10, m: 'frown' },
  focus: { eo: .8, iL: 7, iR: 7, m: 'flat' },
  smug: { eo: .65, iL: 3, iR: 3, m: 'smirk' },
  dizzy: { eo: 1, spiral: 1, m: 'wavy' },
  blank: { eo: 1, ps: 3, m: 'flat' },
  awe: { eo: 1.25, ps: 7, bl: -7, m: 'open' },
};
const DEF = { x: 270, y: 640, s: 1, sx: 1, sy: 1, fl: 'R', mood: 'calm', lean: 0, tilt: 0, aL: 6, aR: 6, bL: 0, bR: 0, lgL: 2, lgR: -2, run: 0, hold: '', look: 0, lookY: 0, age: 0, a: 1, rot: 0, hide: 0 };

function mixCol(a, b, k) {
  const p = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return '#' + A.map((v, i) => Math.round(lerp(v, B[i], k)).toString(16).padStart(2, '0')).join('');
}
function shade(c, k) { return mixCol(c, '#000000', k); }

function mouth(type, h = 8) {
  switch (type) {
    case 'smile': return pg(`M-16,22 Q0,${22 + h + 6} 16,22`, 'none', 5);
    case 'grin': return pg('M-20,18 Q0,52 20,18 Z', '#fff', 5) + ln(-17, 24, 17, 24, 2.5);
    case 'laugh': return pg('M-25,13 Q0,66 25,13 Z', '#7a2330', 5) + el_(0, 40, 11, 6, '#ff8fa3');
    case 'open': return el_(0, 28, 12, 15, '#7a2330', 5) + el_(0, 34, 7, 5, '#ff8fa3');
    case 'o': return el_(0, 30, 9, 12, '#7a2330', 5);
    case 'flat': return ln(-12, 28, 12, 28, 5);
    case 'frown': return pg('M-15,33 Q0,19 15,33', 'none', 5);
    case 'wavy': return pg('M-18,28 q4.5,-8 9,0 t9,0 t9,0', 'none', 5);
    case 'smirk': return pg('M-14,29 Q4,31 17,19', 'none', 5);
    case 'tiny': return el_(0, 29, 5, 4, '#7a2330', 4);
    case 'grit': return rc(-17, 22, 34, 14, '#fff', 4, 3) + ln(-6, 22, -6, 36, 2.5) + ln(5, 22, 5, 36, 2.5);
  }
  return '';
}

function hairBack(hs, c) {
  if (hs === 'long') return pg('M-62,-20 Q-70,50 -52,84 L52,84 Q70,50 62,-20 Z', c, 5);
  if (hs === 'hood') return pg('M-66,-10 Q-72,50 -54,74 L54,74 Q72,50 66,-10 Z', c, 5);
  if (hs === 'bun') return '';
  return '';
}
function hairFront(hs, c, age) {
  switch (hs) {
    case 'spiky': return pg('M-60,-6 L-66,-46 L-42,-32 L-36,-76 L-14,-46 L2,-84 L18,-46 L36,-76 L42,-32 L66,-46 L60,-6 Q0,-44 -60,-6 Z', c, 5);
    case 'wild': return pg('M-62,-4 L-76,-34 L-50,-30 L-62,-70 L-30,-52 L-26,-90 L0,-60 L22,-92 L34,-56 L64,-70 L54,-32 L78,-36 L62,-4 Q0,-48 -62,-4 Z', c, 5);
    case 'bob': return pg('M-63,26 Q-70,-62 0,-62 Q70,-62 63,26 L45,26 Q44,-22 0,-28 Q-44,-22 -45,26 Z', c, 5);
    case 'long': return pg('M-62,-4 Q-66,-62 0,-62 Q66,-62 62,-4 Q40,-26 0,-30 Q-40,-26 -62,-4 Z', c, 5);
    case 'bun': return pg('M-60,-6 Q-62,-60 0,-60 Q62,-60 60,-6 Q30,-30 0,-30 Q-30,-30 -60,-6 Z', c, 5) + ci(0, -70, 20, c, 5);
    case 'curly': { let s = ''; for (let i = 0; i < 7; i++) { const a = Math.PI + i * Math.PI / 6; s += ci(Math.cos(a) * 52, -4 + Math.sin(a) * 50, 19, c, 4); } return s + pg('M-56,-10 Q0,-48 56,-10 Q40,-30 0,-34 Q-40,-30 -56,-10 Z', c); }
    case 'cap': return pg('M-58,-8 Q-60,-62 0,-62 Q60,-62 58,-8 Z', '#d94f3d', 5) + pg('M-4,-12 Q40,-8 70,-4 Q70,6 40,4 Q10,2 -4,-4 Z', '#b73a2b', 5) + ci(0, -62, 6, '#fff', 3);
    case 'hood': return pg('M-66,10 Q-74,-70 0,-70 Q74,-70 66,10 L50,10 Q46,-26 0,-30 Q-46,-26 -50,10 Z', c, 5);
    case 'buzz': return pg('M-56,-10 Q-58,-56 0,-56 Q58,-56 56,-10 Q30,-34 0,-34 Q-30,-34 -56,-10 Z', c, 4);
  }
  return '';
}

function person(id, p, el) {
  const P = PRESETS[id];
  const age = clamp(p.age || 0);
  const hairC = mixCol(P.hair, '#e8e8ee', clamp(age * 1.4));
  const wl = p.run ? Math.sin(el * (p.run === 2 ? 14 : 8.5)) : 0;
  const bob = p.run ? Math.abs(Math.cos(el * (p.run === 2 ? 14 : 8.5))) * (p.run === 2 ? -9 : -4) : Math.sin(el * 2.1) * 1.2;
  const lgA = p.lgL + wl * (p.run === 2 ? 42 : 26), lgB = p.lgR - wl * (p.run === 2 ? 42 : 26);
  const aSwL = p.run ? -wl * (p.run === 2 ? 55 : 30) : Math.sin(el * 1.7) * 2;
  const aSwR = p.run ? wl * (p.run === 2 ? 55 : 30) : Math.sin(el * 1.7 + 1) * 2;
  const mo = MOOD[p.mood] || MOOD.calm;
  // blink
  const seed = id.charCodeAt(0) + id.length * 7;
  const bc = (el + seed * .37) % 3.4;
  const blink = (bc < .12 ? Math.sin(bc / .12 * Math.PI) : 0);
  const stoop = age * 14;
  const sway = Math.sin(el * 3 + seed) * 5;
  const top = P.top, topD = shade(top, .18);
  let s = '';
  // cape/back stuff
  if (P.acc.includes('cape')) s += pg(`M-30,-120 L${-50 + sway},-30 L${50 + sway},-30 L30,-120 Z`, '#d62839', 5);
  // legs
  const leg = (hx, a) => `<g transform="translate(${hx} -62) rotate(${f2(a)})">${cap(0, 0, 0, 52, 15, P.bot)}${el_(5, 58, 18, 9, P.shoe, 4)}</g>`;
  s += leg(-14, lgA) + leg(14, lgB);
  // upper body
  s += `<g transform="rotate(${f2(p.lean + stoop)} 0 -62)">`;
  // torso by type
  if (P.tn === 'dress') s += pg('M-32,-124 Q-34,-80 -48,-52 L48,-52 Q34,-80 32,-124 Z', top, 5);
  else if (P.tn === 'coat' || P.tn === 'suit') s += pg('M-36,-124 Q-40,-80 -42,-44 L42,-44 Q40,-80 36,-124 Q0,-132 -36,-124 Z', top, 5);
  else s += rc(-34, -126, 68, 72, top, 5, 22);
  if (P.tn === 'hoodie') s += pg('M-26,-124 Q0,-100 26,-124 Q0,-136 -26,-124 Z', topD, 4) + ln(-8, -112, -8, -88, 3, '#fff') + ln(8, -112, 8, -88, 3, '#fff') + rc(-20, -78, 40, 18, topD, 3, 6);
  if (P.tn === 'suit') s += pg('M0,-124 L-14,-90 L0,-60 L14,-90 Z', '#fff', 3) + pg('M0,-110 L-6,-96 L0,-70 L6,-96 Z', P.ac, 3);
  if (P.tn === 'vest') s += rc(-34, -126, 68, 72, top, 5, 22) + rc(-30, -100, 18, 14, topD, 3) + rc(12, -100, 18, 14, topD, 3) + ln(0, -124, 0, -56, 3);
  if (P.tn === 'pj') for (let i = -2; i <= 2; i++) s += ln(i * 14, -122, i * 14, -58, 4, '#cdb9f2');
  if (P.tn === 'tee') s += pg('M-12,-126 Q0,-112 12,-126', 'none', 4);
  if (P.tn === 'coat') s += ln(0, -124, 0, -46, 3) + ci(-8, -100, 3, P.ac) + ci(-8, -80, 3, P.ac);
  if (P.acc.includes('scarf')) s += pg(`M-34,-124 Q0,-108 34,-124 L36,-110 Q0,-94 -36,-110 Z`, P.ac, 5) + pg(`M24,-112 Q${50 + sway * 2},-96 ${40 + sway * 3},-64 L${28 + sway * 3},-66 Q${34 + sway},-92 18,-106 Z`, P.ac, 5);
  // arms
  const arm = (side, a, b, sw, holdTxt) => {
    const sgn = side === 'L' ? 1 : -1;
    const sx = side === 'L' ? -30 : 30;
    const sleeve = (P.tn === 'tee' || P.tn === 'dress' || P.tn === 'vest') ? P.skin : top;
    const up = (P.tn === 'tee' || P.tn === 'dress' || P.tn === 'vest') ? top : top;
    return `<g transform="translate(${sx} -116) rotate(${f2(sgn * (a + sw))})">${cap(0, 0, 0, 32, 14, up)}<g transform="translate(0 32) rotate(${f2(-sgn * b)})">${cap(0, 0, 0, 30, 12, sleeve)}${ci(0, 32, 10, P.skin, 4)}${side === 'R' ? holdTxt : ''}${side === 'L' && P.acc.includes('watch') ? pg('M-9,18 L9,18 L9,26 L-9,26 Z', '#ffd23f', 3) + ci(0, 22, 3, '#1b1b2f') : ''}</g></g>`;
  };
  s += arm('L', p.aL, p.bL, aSwL, '') + arm('R', p.aR, p.bR, aSwR, heldProp(p.hold));
  // head
  s += `<g transform="translate(0 -128) rotate(${f2(p.tilt)})"><g transform="translate(0 -62)">`;
  s += hairBack(P.hs, hairC);
  s += el_(-56, 4, 10, 13, P.skin, 4) + el_(56, 4, 10, 13, P.skin, 4);
  s += el_(0, 0, 57, 53, P.skin, 5);
  if (P.beard && age > .55) s += pg('M-52,8 Q-46,56 0,62 Q46,56 52,8 Q30,32 0,34 Q-30,32 -52,8 Z', '#eee', 4);
  // eyes
  const eo = clamp((mo.eo == null ? 1 : mo.eo) * (1 - blink), 0.08, 1.4);
  const eye = (cx, dir) => {
    if (mo.arc) return pg(`M${cx - 12},2 Q${cx},-14 ${cx + 12},2`, 'none', 5);
    const ps = mo.ps || 6;
    let e = el_(cx, -2, 12, 13 * eo, '#fff', 4);
    if (eo > .2) e += ci(cx + clamp(p.look, -1, 1) * 5, -2 + clamp(p.lookY, -1, 1) * 4, Math.min(ps, 6 * eo + 2), INK) + ci(cx + clamp(p.look, -1, 1) * 5 + 2, -4 + clamp(p.lookY, -1, 1) * 4, 1.8, '#fff');
    if (mo.spiral) e = ci(cx, -2, 12, '#fff', 4) + pg(`M${cx},-2 m-2,0 a2,2 0 1,1 4,0 a5,5 0 1,1 -9,0 a8,8 0 1,1 14,0`, 'none', 2.5, `transform="rotate(${f2(el * 300)} ${cx} -2)"`);
    return e;
  };
  s += eye(-21, -1) + eye(21, 1);
  if (mo.m === 'smirk' && mo.eo < .7) s += ln(-33, -8, -9, -8, 4) + ln(9, -8, 33, -8, 4);
  const bl = mo.bl || 0;
  s += ln(-33, -26 + bl, -11, -26 + bl + (mo.iL || 0), 6, hairC === '#111' ? INK : hairC) + ln(11, -26 + bl + (mo.iR || 0), 33, -26 + bl, 6, hairC);
  if (mo.blush) s += el_(-37, 14, 9, 5, '#ff7f9c').replace('/>', ' opacity=".5"/>') + el_(37, 14, 9, 5, '#ff7f9c').replace('/>', ' opacity=".5"/>');
  s += `<g>${mouth(mo.m, 8)}</g>`;
  if (age > .35) { const o = clamp((age - .35) * 2.2); s += `<g opacity="${f2(o)}">${ln(-30, -40, -10, -42, 2.5, '#7a5a40')}${ln(10, -42, 30, -40, 2.5, '#7a5a40')}${ln(-38, 4, -32, 10, 2.5, '#7a5a40')}${ln(38, 4, 32, 10, 2.5, '#7a5a40')}</g>`; }
  if (mo.sweat) s += pg(`M48,-34 q-8,14 0,18 q8,-4 0,-18 z`, '#8ecae6', 3, `transform="translate(0 ${f2(Math.sin(el * 4) * 3)})"`);
  s += hairFront(P.hs, hairC, age);
  if (P.acc.includes('glasses')) s += ci(-21, -2, 17, 'rgba(180,230,255,.35)', 4) + ci(21, -2, 17, 'rgba(180,230,255,.35)', 4) + ln(-4, -2, 4, -2, 4);
  if (P.acc.includes('shades')) s += rc(-40, -14, 80, 22, '#0b0b12', 4, 8) + ln(-40, -6, -57, -2, 4) + ln(40, -6, 57, -2, 4);
  if (P.acc.includes('phones')) s += pg('M-60,6 Q-66,-62 0,-62 Q66,-62 60,6', 'none', 6, 'stroke="#222"') + ci(-60, 8, 11, '#444', 4) + ci(60, 8, 11, '#444', 4);
  s += `</g></g></g>`;
  return `<g opacity="${f2(p.a)}" transform="translate(${f2(p.x)} ${f2(p.y + bob + p.hide * 400)}) rotate(${f2(p.rot)}) scale(${f2((p.fl === 'L' ? -1 : 1) * p.s * p.sx)} ${f2(p.s * p.sy * (1 + Math.sin(el * 2.1) * .008))})" filter="url(#stk)">${s}</g>`;
}
function heldProp(h) {
  switch (h) {
    case 'book': return `<g transform="translate(0 30) rotate(-20)">${rc(-4, -18, 34, 26, '#e63946', 4, 3)}${rc(0, -14, 26, 18, '#fff', 0)}</g>`;
    case 'phone': return `<g transform="translate(0 28) rotate(-10)">${rc(-5, -22, 16, 28, '#222', 3, 4)}${rc(-2, -19, 10, 20, '#79d6ff', 0)}</g>`;
    case 'pen': return `<g transform="translate(0 28) rotate(30)">${rc(-2, -26, 5, 34, '#ffd23f', 2.5)}</g>`;
    case 'tablet': return `<g transform="translate(0 28) rotate(-15)">${rc(-8, -34, 34, 44, '#333', 4, 5)}${rc(-4, -30, 26, 36, '#79d6ff', 0)}</g>`;
    case 'cup': return `<g transform="translate(0 28)">${rc(-8, -18, 18, 22, '#fff', 4, 3)}${pg('M10,-12 q10,2 0,10', 'none', 3)}</g>`;
    case 'bag': return `<g transform="translate(0 34)">${rc(-14, -4, 36, 32, '#e9c46a', 4, 6)}${pg('M-4,-4 q10,-14 20,0', 'none', 4)}</g>`;
    case 'remote': return `<g transform="translate(0 28) rotate(-10)">${rc(-5, -24, 14, 32, '#444', 3, 4)}${ci(2, -14, 4, '#e63946')}${ci(2, -4, 4, '#2dc653')}</g>`;
    case 'torch': return `<g transform="translate(0 28)">${rc(-4, -24, 10, 30, '#999', 3, 3)}${pg('M-8,-26 L12,-26 L22,-52 L-18,-52 Z', 'rgba(255,240,150,.55)', 0)}</g>`;
  }
  return '';
}

// ---------- fx ----------
const fx = {
  dust: (x, y, k) => { let s = ''; for (let i = 0; i < 7; i++) { const a = Math.PI + i * Math.PI / 6, r = 8 + k * 42; s += ci(x + Math.cos(a) * r * 1.3, y + Math.sin(a) * r * .5 - k * 8, 7 + 12 * k, 'rgba(255,255,255,' + f2((1 - k) * .85) + ')'); } return s; },
  burst: (x, y, k, c = '#fff', n = 10) => { let s = ''; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, r1 = 14 + k * 30, r2 = r1 + 18 * (1 - k); s += ln(x + Math.cos(a) * r1, y + Math.sin(a) * r1, x + Math.cos(a) * r2, y + Math.sin(a) * r2, 5, c); } return s; },
  speed: (t, c = 'rgba(255,255,255,.75)', n = 14, dir = 1) => { let s = ''; for (let i = 0; i < n; i++) { const y = rnd(i) * 800 + 40, x = ((rnd(i + 9) * 700 + t * 1800 * dir) % 900) - 160; s += ln(x, y, x - 90 * dir, y, 4, c); } return s; },
  sparkle: (x, y, r, k, c = '#ffd23f') => { const a = r * k; return pg(`M${x},${y - a} Q${x},${y} ${x + a},${y} Q${x},${y} ${x},${y + a} Q${x},${y} ${x - a},${y} Q${x},${y} ${x},${y - a} Z`, c, 2); },
  stars: (t, n = 30, c = '#fff') => { let s = ''; for (let i = 0; i < n; i++) { const tw = .5 + .5 * Math.sin(t * 3 + i * 2); s += ci(-300 + rnd(i) * 1140, rnd(i + 50) * 560 - 120, 1.5 + tw * 1.5, c); } return s; },
  cloud: (x, y, s = 1, c = '#fff') => `<g transform="translate(${f2(x)} ${f2(y)}) scale(${s})">${el_(0, 0, 50, 22, c)}${el_(-30, 6, 30, 16, c)}${el_(34, 8, 34, 16, c)}${el_(8, -14, 28, 18, c)}</g>`,
};

// ---------- scene ----------
const ENV = {};
G.ENV = ENV;
G.kit = { rc, ci, el: el_, pg, ln, grad, cap, tx, E, seg, lerp, clamp, rnd, f2, fx, track, mixCol, shade, W, H, GY, INK, person, PRESETS };

const FILTERS = `<defs><filter id="stk" x="-25%" y="-25%" width="150%" height="150%"><feMorphology in="SourceAlpha" operator="dilate" radius="3.5" result="d"/><feFlood flood-color="#fff"/><feComposite in2="d" operator="in" result="w"/><feMerge><feMergeNode in="w"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`;

function camAt(S, u) {
  const c = S.cam, e = E[c.e || 'io'];
  const k = e(clamp((u - (c.u0 || 0)) / ((c.u1 == null ? 1 : c.u1) - (c.u0 || 0))));
  return { z: lerp(c.a[0], c.b[0], k), x: lerp(c.a[1], c.b[1], k), y: lerp(c.a[2], c.b[2], k) };
}

function capsFor(t) {
  const L = G.MARKS.lines;
  let i = 0; for (let j = 0; j < L.length; j++) if (t >= L[j].start) i = j;
  const l = L[i]; if (!l || !l.words) return '';
  if (t < l.start || t > l.end + .35) return '';
  const words = l.words;
  let wi = 0; for (let j = 0; j < words.length; j++) if (t >= words[j].t) wi = j;
  // phrases of <=3 words
  const ph = []; let cur = [];
  words.forEach((w, j) => { cur.push(j); if (cur.length >= 3 || /[.,!?…]$/.test(w.w) || (cur.length >= 2 && cur.reduce((a, q) => a + words[q].w.length, 0) > 15)) { ph.push(cur); cur = []; } });
  if (cur.length) ph.push(cur);
  const phrase = ph.find(p => p.includes(wi)) || ph[0];
  let lines = [phrase];
  const chars = phrase.reduce((a, j) => a + words[j].w.length + 1, 0);
  if (chars > 14 && phrase.length > 1) { const mid = Math.ceil(phrase.length / 2); lines = [phrase.slice(0, mid), phrase.slice(mid)]; }
  const size = lines.length > 1 ? 36 : (chars > 11 ? 38 : 46);
  let s = `<rect x="34" y="778" width="472" height="132" rx="26" fill="rgba(14,14,28,.88)" stroke="${INK}" stroke-width="6"/>`;
  const y0 = lines.length > 1 ? 826 : 856;
  lines.forEach((ls, li) => {
    const spans = ls.map(j => `<tspan fill="${words[j].e ? '#ffd23f' : (j === wi ? '#fff' : '#e3e3f2')}">${esc(words[j].w.toUpperCase())}</tspan>`).join(' ');
    s += `<text x="270" y="${y0 + li * (size + 6)}" font-size="${size}" text-anchor="middle" stroke="${INK}" stroke-width="6" stroke-linejoin="round" paint-order="stroke" font-family="${FONT}" font-weight="900" xml:space="preserve">${spans}</text>`;
  });
  return s;
}

function badge(S) {
  if (!G.DEBUG_BADGE || !S.tag) return '';
  return tx(S.tag, 60, 40, 26, { fill: S.tag === 'HOOK' ? '#ff4d6d' : S.tag === 'QUESTION' ? '#ffd23f' : '#fff', anchor: 'start' });
}

function drawShot(S, u0, el0, cta) {
  // hit-stop time warp
  let el = el0;
  for (const h of S.hits) { const th = h.u * S.d; if (el0 > th) el -= Math.min(.09, el0 - th); }
  el = Math.max(0, el);
  const u = clamp(el / S.d);
  let cam = camAt(S, u);
  let shx = 0, shy = 0, flash = 0, fxs = '';
  for (const h of S.hits) {
    const th = h.u * S.d, dt = el0 - th;
    if (dt < 0) continue;
    cam.z += (h.punch == null ? .05 : h.punch) * Math.exp(-dt * 7);
    const a = (h.sh == null ? 7 : h.sh) * Math.exp(-dt * 6);
    shx += Math.sin(dt * 71) * a; shy += Math.cos(dt * 53) * a * .8;
    if (h.flash && dt < .07) flash = 1;
    if (h.dust && dt < 1) fxs += fx.dust(h.dust[0], h.dust[1], clamp(dt / .6));
    if (h.burst && dt < .6) fxs += fx.burst(h.burst[0], h.burst[1], clamp(dt / .45), h.c || '#ffd23f');
    if (h.word && dt < 1.1) { const k = E.back(clamp(dt / .25)); const wp = h.at || (h.dust ? [h.dust[0], h.dust[1] - 90] : [270, 380]); fxs += tx(h.word, wp[0], wp[1], 54, { fill: h.wc || '#ffd23f', sc: k, rot: h.rot == null ? -8 : h.rot, op: dt > .8 ? 1 - (dt - .8) / .3 : 1 }); }
  }
  const T = k => { const cx = W / 2 + (cam.x - W / 2) * k, cy = H / 2 + (cam.y - H / 2) * k; return `translate(${f2(W / 2 + shx)} ${f2(H / 2 + shy)}) scale(${f2(cam.z)}) translate(${f2(-cx)} ${f2(-cy)})`; };
  const envO = Object.assign({ t: el0, tt: S.t0 + el0 }, S.envO || {}, S.envF ? S.envF(u, el) : {});
  const L = ENV[typeof S.env === 'function' ? S.env(u) : S.env](envO);
  let chars = '';
  const order = Object.keys(S.cast);
  for (const id of order) {
    const c = S.cast[id];
    const st = Object.assign({}, DEF, track(c.k, u));
    if (st.a <= 0.01) continue;
    chars += person(c.p, st, el0);
  }
  const sat = S.sat == null ? 1 : (typeof S.sat === 'function' ? S.sat(u, el) : S.sat);
  const wrapA = sat < 1 ? ` style="filter:saturate(${f2(sat)})"` : '';
  const under = S.under ? S.under(u, el, cam) : '', over = S.over ? S.over(u, el, cam) : '';
  const hazeC = S.haze == null ? 1 : S.haze;
  let s = FILTERS + `<g${wrapA}><g transform="${T(.55)}">${L.bg}</g><g transform="${T(.85)}">${L.mid}</g>`;
  if (hazeC && L.haze) s += `<rect x="0" y="0" width="${W}" height="${H}" fill="${L.haze}"/>`;
  s += `<g transform="${T(1)}">${under}${chars}${fxs}${over}</g><g transform="${T(1.3)}">${L.fg}</g></g>`;
  if (S.tint) s += `<rect width="${W}" height="${H}" fill="${typeof S.tint === 'function' ? S.tint(u, el) : S.tint}"/>`;
  // overlays
  if (flash) s += `<rect width="${W}" height="${H}" fill="#fff"/>`;
  if (S.ui) s += S.ui(u, el, cta);
  if (!cta) s += capsFor(S.t0 + el0 + (S._ct || 0));
  s += badge(S);
  return s;
}

// ---------- shot builders ----------
const DEFCAM = [1, 270, 480];
function mk(o) {
  const cast = {};
  for (const id in (o.cast || {})) { const c = o.cast[id]; cast[id] = { p: c.p || id, k: c.k }; }
  return Object.assign({ tag: 'BEAT', env: 'bedroom', hits: [], cam: { a: DEFCAM, b: DEFCAM, e: 'io' } }, o, { cast });
}
function camSpec(c) {
  if (!c) return { a: DEFCAM, b: DEFCAM, e: 'io' };
  if (Array.isArray(c)) return { a: c[0], b: c[1] || c[0], e: c[2] || 'io' };
  return c;
}
function beat(o) { const s = mk(o); s.cam = camSpec(o.cam); return s; }
function hook(o) {
  const s = mk(o); s.tag = 'HOOK';
  const f = o.focus || [270, 445], z0 = o.z0 || 2.3, sn = o.snap || .36;
  s.cam = { a: [z0, f[0], f[1]], b: [1, 270, 480], e: 'expo', u0: sn, u1: sn + .22 };
  s.hits = [{ u: sn, sh: 9, punch: .08, flash: true, word: o.word, at: o.wordAt }].concat(o.hits || []);
  const ui = o.ui;
  s.ui = (u, el, cta) => (u < .9 ? tx(o.banner, 270, 150, 46, { fill: '#ffd23f', sc: E.back(clamp(u / .08)), op: u > .82 ? 1 - (u - .82) / .08 : 1 }) : '') + (ui ? ui(u, el, cta) : '');
  return s;
}
function question(o) {
  const s = mk(o); s.tag = 'QUESTION';
  s.cam = camSpec(o.cam);
  const qui = o.ui;
  s.draw = null;
  s.ui = (u, el, cta) => {
    let r = '';
    const k = E.back(seg(u, .12, .3));
    if (!cta) {
      const lines = o.q;
      r += `<g transform="translate(270 140) scale(${f2(k)}) translate(-270 -140)">${rc(26, 62, 488, 40 + lines.length * 56, 'rgba(14,14,28,.9)', 6, 28)}`;
      lines.forEach((l, i) => { r += tx(l, 270, 120 + i * 54, 40, { fill: i === lines.length - 1 ? '#ffd23f' : '#fff' }); });
      r += '</g>';
    } else {
      r += rc(40, 668, 460, 52, 'rgba(14,14,28,.9)', 5, 20) + tx(o.short, 270, 706, 28, { fill: '#ffd23f' });
    }
    return r + (qui ? qui(u, el, cta) : '');
  };
  return s;
}
function ctaPill(next, last) {
  const a = last ? 'FOLLOW FOR THE NEXT STORY' : 'FOLLOW + COMMENT';
  const b = last ? 'COMMENT WHAT IT SHOULD BE!' : 'FOR PART ' + next + '!';
  return rc(30, 760, 480, 150, '#e63946', 6, 40) + tx(a, 270, last ? 818 : 826, last ? 25 : 40, { fill: '#fff' }) + tx(b, 270, 880, last ? 25 : 46, { fill: '#ffe66d' });
}
function ctaShot(q, o) {
  const s = Object.assign({}, q, { tag: 'CTA', hits: [] });
  const pulse = 0;
  s.drawFn = (u, el) => drawShot(q, 1, q.d + el, true);
  s.cta = o;
  return s;
}

// ---------- timeline ----------
G.SHOTS = [];
G.build = function (PART) {
  const L = G.MARKS.lines, tot = G.MARKS.total;
  PART.forEach((S, i) => { S.t0 = L[i].start; S.d = (i + 1 < L.length ? L[i + 1].start : tot) - S.t0; if (i === 0) S.t0 = 0, S.d = (L[1] ? L[1].start : tot); });
  G.SHOTS = PART;
  const tags = PART.map(s => s.tag);
  if (!tags.includes('HOOK') || !tags.includes('QUESTION')) throw new Error('missing HOOK or QUESTION: ' + tags);
};
function shotAt(t) { let i = 0; for (let j = 0; j < G.SHOTS.length; j++) if (t >= G.SHOTS[j].t0) i = j; return G.SHOTS[i]; }
G.renderAt = function (t) {
  const S = shotAt(t), el = t - S.t0;
  let inner;
  if (S.drawFn) {
    const q = G.SHOTS[G.SHOTS.indexOf(S) - 1];
    inner = drawShot(q, 1, q.d + el, true).replace(/<\/?svgx>/g, '') + (S.cta.pill ? ctaPill(S.cta.next, S.cta.last) : '');
  } else inner = drawShot(S, 0, el, false);
  document.getElementById('v').innerHTML = inner;
};
G.sfxEvents = function () {
  const ev = [];
  G.SHOTS.forEach((S, i) => {
    if (i > 0 && S.tag !== 'CTA') ev.push({ t: S.t0 - .05, k: 'whoosh' });
    S.hits.forEach(h => ev.push({ t: S.t0 + h.u * S.d, k: h.k || (S.tag === 'HOOK' ? 'slam' : 'hit') }));
    (S.sfx || []).forEach(x => ev.push({ t: S.t0 + x[0] * S.d, k: x[1] }));
    if (S.tag === 'QUESTION') { ev.push({ t: S.t0 + S.d * .2, k: 'heart' }); ev.push({ t: S.t0 + S.d * .55, k: 'heart' }); }
    if (S.tag === 'CTA') { ev.push({ t: S.t0 + .15, k: 'ping' }); ev.push({ t: S.t0 + .45, k: 'ping2' }); }
  });
  return ev;
};
G.beat = beat; G.hook = hook; G.question = question; G.ctaShot = ctaShot;
G.DEF = DEF;
})(window);
