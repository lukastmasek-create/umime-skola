// Locations (new). Each ENV[name](o) -> {bg, mid, fg, haze?}. Ground line is GY=650 in every location.
(function (G) {
const { rc, ci, el, pg, ln, grad, tx, GY, INK, fx, rnd, f2, mixCol, shade } = G.kit;
const ENV = G.ENV, X0 = -480, WW = 1500;
const floor = (c, l) => rc(X0, GY, WW, 700, c) + rc(X0, GY, WW, 7, l || shade(c, .3));
const wall = (c, h = GY) => rc(X0, -400, WW, h + 400, c);
const TOD = {
  day: { s1: '#6ec3f4', s2: '#dff3ff', win: '#bfe4ff', amb: 0, sun: '#fff3a0' },
  dusk: { s1: '#6a3d9a', s2: '#ff9e6b', win: '#ffd86b', amb: 0, sun: '#ffd166' },
  night: { s1: '#080c2c', s2: '#2a2f78', win: '#ffd86b', amb: 0, sun: '#f4f1de' },
};
const sky = (id, t) => grad(id, t.s1, t.s2) + `<rect x="${X0}" y="-400" width="${WW}" height="${GY + 400}" fill="url(#${id})"/>`;
function bld(x, w, h, col, win, seed, lit = 1) {
  let s = rc(x, GY - h, w, h, col);
  const cols = Math.max(1, Math.floor((w - 8) / 22)), rows = Math.floor((h - 20) / 32);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const on = rnd(seed * 31 + r * 7 + c * 3) > .4; s += rc(x + 8 + c * 22, GY - h + 14 + r * 32, 13, 19, on && lit ? win : shade(col, .25)); }
  return s;
}
function skyline(seed, y0, minH, maxH, col, win, lit = 1, step = 54) {
  let s = ''; for (let x = X0; x < X0 + WW; x += step) { const w = 46 + rnd(x + seed) * 30, h = minH + rnd(x * 3 + seed) * (maxH - minH); s += bld(x, w, h, col, win, x + seed, lit); } return s;
}
const clouds = (t, n = 4, c = '#fff', y = 90) => { let s = ''; for (let i = 0; i < n; i++) s += fx.cloud(((i * 330 + t * 8 + 200) % 1500) - 450, y + rnd(i) * 130, .8 + rnd(i + 3) * .8, c); return s; };
const pot = (x, y) => rc(x - 22, y - 36, 44, 36, '#c8553d', 4) + el(x, y - 56, 34, 30, '#2f9e5b', 4) + el(x - 14, y - 78, 16, 22, '#3fbf6d', 4) + el(x + 16, y - 74, 14, 24, '#3fbf6d', 4);
const lamp = (x, y, on, c = '#ffd86b') => rc(x - 3, y - 190, 6, 190, '#2b2b3a') + rc(x - 20, y - 202, 40, 16, '#2b2b3a', 0, 6) + (on ? pg(`M${x - 18},${y - 188} L${x + 18},${y - 188} L${x + 70},${y} L${x - 70},${y} Z`, 'rgba(255,230,140,.18)') + ci(x, y - 188, 10, c) : ci(x, y - 188, 10, '#999'));
const car = (x, y, col, sc = 1) => `<g transform="translate(${f2(x)} ${y}) scale(${sc})">${rc(-60, -34, 120, 30, col, 4, 10)}${pg('M-34,-34 L-22,-62 L26,-62 L40,-34 Z', col, 4)}${pg('M-26,-36 L-18,-56 L-2,-56 L-2,-36 Z', '#bfe4ff')}${pg('M4,-36 L4,-56 L22,-56 L32,-36 Z', '#bfe4ff')}${ci(-34, -4, 13, '#222', 3)}${ci(34, -4, 13, '#222', 3)}${ci(-34, -4, 5, '#aaa')}${ci(34, -4, 5, '#aaa')}</g>`;

ENV.bedroom = o => {
  const n = o.night, t = n ? TOD.night : TOD.day;
  const bgc = n ? '#27285c' : '#bfe3f5', fl = n ? '#4a3b32' : '#d9a066';
  let bg = wall(bgc) + rc(X0, 430, WW, 220, n ? '#2f3070' : '#a6d6ee');
  bg += rc(300, 160, 200, 190, '#fff', 6) + rc(308, 168, 184, 174, n ? '#0b0f3a' : '#8fd3ff') + (n ? fx.stars(o.t, 14) .replace(/cx="/g, 'cx="').replace(/<circle/g, '<circle transform="translate(300 160) scale(.2)"') + ci(450, 210, 26, '#f4f1de') + ci(462, 202, 22, '#0b0f3a') : fx.cloud(380 + Math.sin(o.t * .3) * 24, 230, .6) + ci(460, 210, 22, '#fff3a0')) + ln(400, 168, 400, 342, 5, '#fff') + ln(308, 255, 492, 255, 5, '#fff');
  bg += rc(40, 190, 90, 120, '#ffd166', 5) + tx('?', 85, 270, 70, { fill: '#e63946' }) + rc(150, 220, 70, 90, '#ef476f', 5);
  let mid = floor(fl) + rc(-20, 520, 250, 130, n ? '#5b4fb5' : '#e76f51', 5, 14) + rc(-20, 480, 80, 50, '#fff', 5, 14) + rc(-20, 640, 250, 10, '#3b2f2f');
  mid += rc(350, 500, 170, 14, '#8b5e3c', 5) + rc(360, 514, 10, 136, '#8b5e3c') + rc(500, 514, 10, 136, '#8b5e3c') + rc(395, 410, 90, 80, '#222', 5, 6) + rc(403, 418, 74, 62, n ? '#79d6ff' : '#4cc9f0') + rc(430, 490, 20, 10, '#555');
  mid += lamp(520, 500, n, '#ffe66d').replace(/190/g, '90').replace(/202/g, '102');
  const fg = pot(-10, 700) + (n ? '' : '');
  return { bg, mid, fg, haze: n ? 'rgba(10,10,50,.18)' : null };
};
ENV.kitchen = o => {
  let bg = wall('#ffe8c7') + rc(X0, 330, WW, 320, '#f4f1de');
  for (let x = X0; x < X0 + WW; x += 60) bg += ln(x, 330, x, GY, 3, '#e0dcc8'); for (let y = 330; y < GY; y += 60) bg += ln(X0, y, X0 + WW, y, 3, '#e0dcc8');
  bg += rc(330, 80, 170, 170, '#fff', 6) + rc(338, 88, 154, 154, '#8fd3ff') + fx.cloud(410 + Math.sin(o.t * .3) * 14, 150, .5) + ln(415, 88, 415, 242, 5, '#fff');
  bg += ci(110, 160, 44, '#fff', 6) + ln(110, 160, 110 + Math.cos(o.t * 2) * 0 + 0, 130, 5) + ln(110, 160, 132, 168, 5);
  let mid = floor('#8ecae6', '#6aa8c9') + rc(-20, 470, 160, 180, '#e63946', 5, 8) + rc(-14, 470, 148, 14, '#c0392b', 0) + ln(120, 490, 120, 520, 5, '#fff') + rc(150, 560, 400, 90, '#d9a066', 5) + rc(150, 548, 400, 14, '#6d4c41', 5);
  mid += `<g transform="translate(400 548)">${rc(0, -34, 54, 34, '#bbb', 4, 8)}${rc(10, -40, 12, 8, '#444', 2)}${rc(30, -40, 12, 8, '#444', 2)}</g>` + `<g transform="translate(490 548)">${rc(0, -60, 34, 60, '#ffd23f', 4, 4)}${tx('OATS', 17, -26, 11, { fill: '#e63946' })}</g>`;
  return { bg, mid, fg: rc(X0, 700, WW, 300, '#6aa8c9') + pot(540, 720) };
};
ENV.classroom = o => {
  let bg = wall('#e9d8a6') + rc(X0, 380, WW, 270, '#bb9457') + rc(60, 90, 420, 230, '#2d6a4f', 8) + rc(60, 316, 420, 10, '#8b5e3c', 4);
  const eq = ['E = mc²', '∫ x dx', 'a²+b²=c²', 'π ≈ 3.14'];
  eq.forEach((e, i) => bg += `<text x="${100 + (i % 2) * 190}" y="${150 + Math.floor(i / 2) * 70}" font-size="30" font-family="monospace" font-weight="900" fill="#e8f5e9">${e}</text>`);
  bg += ci(500, 70, 30, '#fff', 5) + ln(500, 70, 500, 50, 4) + ln(500, 70, 514 + Math.sin(o.t) * 0, 78, 4);
  bg += rc(520, 120, 80, 150, '#8fd3ff', 6) + rc(-100, 120, 90, 150, '#8fd3ff', 6);
  let mid = floor('#8d6e63', '#6d4c41');
  for (let i = 0; i < 3; i++) { const x = -30 + i * 200; mid += rc(x, 530, 150, 12, '#c9a26b', 4) + rc(x + 16, 542, 8, 100, '#555') + rc(x + 126, 542, 8, 100, '#555') + rc(x + 44, 470, 60, 60, '#d9a066', 4, 6); }
  return { bg, mid, fg: rc(X0, 690, WW, 300, '#6d4c41') + rc(-20, 640, 120, 14, '#c9a26b', 4) };
};
ENV.street = o => {
  const t = TOD[o.tod || 'day'], night = o.tod === 'night', ct = o.ct == null ? o.tt : o.ct;
  let bg = sky('sk' + (o.tod || 'd'), t) + (night ? fx.stars(o.t, 30) : clouds(o.t, 4, o.tod === 'dusk' ? '#ffb88c' : '#fff'));
  bg += skyline(1, 0, 180, 420, night ? '#1a1d4a' : o.tod === 'dusk' ? '#57356f' : '#9fb8d0', t.win, night || o.tod === 'dusk' ? 1 : 0);
  let mid = skyline(7, 0, 120, 250, night ? '#262a63' : o.tod === 'dusk' ? '#7a4a8a' : '#bcc6dc', t.win, night ? 1 : 0, 80);
  mid += floor('#555b6e', '#3f4454') + rc(X0, GY + 90, WW, 14, '#e8e8e8') + rc(X0, GY - 6, WW, 14, '#9aa0b4');
  for (let x = X0; x < X0 + WW; x += 110) mid += rc(x, GY + 40, 58, 10, 'rgba(255,255,255,.7)');
  mid += lamp(80, GY, night || o.tod === 'dusk') + lamp(470, GY, night || o.tod === 'dusk');
  if (o.cars !== 0) { const cx = ((ct * 120) % 1100) - 300; mid += car(cx, GY + 70, '#ef476f') + car(((ct * 80 + 600) % 1100) - 300, GY + 120, '#ffd166', 1.1); }
  if (o.bill) mid += rc(110, 150, 320, 150, '#fff', 6, 10) + tx(o.bill, 270, 240, 46, { fill: '#e63946' }) + rc(130, 300, 10, 100, '#555') + rc(400, 300, 10, 100, '#555');
  return { bg, mid, fg: rc(-60, 880, 80, 200, '#2b2b3a') + rc(540, 700, 40, 400, '#2b2b3a'), haze: night ? 'rgba(10,10,60,.2)' : null };
};
ENV.rooftop = o => {
  const t = TOD[o.tod || 'dusk'], night = o.tod === 'night';
  let bg = sky('rf' + (o.tod || 'd'), t) + (night || o.tod === 'dusk' ? fx.stars(o.t, 24) : '') + ci(400, 360, 56, t.sun) + (night ? '' : '');
  bg += skyline(3, 0, 200, 480, night ? '#10123a' : '#4b2a63', t.win, 1);
  let mid = skyline(9, 0, 100, 260, night ? '#1a1d4a' : '#6c3a73', t.win, 1, 90);
  mid += rc(X0, GY - 6, WW, 700, '#444a63') + rc(X0, GY - 20, WW, 18, '#6b7391', 4);
  mid += rc(380, GY - 220, 110, 120, '#8b5e3c', 5) + pg('M370,' + (GY - 220) + ' L435,' + (GY - 262) + ' L500,' + (GY - 220) + ' Z', '#6d4c41', 5) + rc(400, GY - 100, 8, 100, '#555') + rc(470, GY - 100, 8, 100, '#555');
  for (let i = 0; i < 9; i++) mid += ci(-20 + i * 70, GY - 70 + Math.sin(i * 1.3 + o.t * 2) * 4, 7, i % 2 ? '#ffd23f' : '#ff7aa2') + ln(-20 + i * 70, GY - 90, -20 + (i + 1) * 70, GY - 90, 2.5, '#222');
  return { bg, mid, fg: rc(X0, 700, WW, 300, '#303653'), haze: 'rgba(20,10,60,.08)' };
};
ENV.lab = o => {
  let bg = wall('#e8f1f8') + rc(X0, 360, WW, 290, '#d3e3ee') + rc(30, 80, 480, 250, '#10162b', 8);
  for (let i = 0; i < 18; i++) { const h = 20 + Math.abs(Math.sin(o.t * 2 + i * .7)) * 150; bg += rc(48 + i * 25, 310 - h, 18, h, i % 3 ? '#4cc9f0' : '#ff4d6d'); }
  let mid = floor('#b8c7d6', '#8fa5b8');
  for (let i = 0; i < 3; i++) { const x = -40 + i * 220; mid += rc(x, 520, 180, 14, '#fff', 5) + rc(x + 10, 534, 10, 116, '#8fa5b8') + rc(x + 160, 534, 10, 116, '#8fa5b8') + rc(x + 40, 450, 100, 70, '#10162b', 5, 6) + rc(x + 46, 456, 88, 58, (o.t * 3 + i) % 2 < 1.2 ? '#4cc9f0' : '#2dc653'); }
  mid += rc(500, 440, 46, 210, 'rgba(160,230,255,.5)', 5, 20) + ci(523, 560 - Math.sin(o.t * 2) * 12, 14, '#7cf7a6');
  return { bg, mid, fg: rc(-60, 820, 120, 200, '#8fa5b8') };
};
ENV.hall = o => {
  let bg = wall('#cdd7ea') + rc(X0, 400, WW, 250, '#aebbd8');
  for (let x = X0; x < X0 + WW; x += 76) bg += rc(x, 130, 70, 360, ['#3a86ff', '#3a86ff', '#ef476f'][(x / 76 | 0) % 3 < 0 ? 0 : Math.abs((x / 76) | 0) % 3], 5) + rc(x + 22, 190, 26, 8, '#fff') + ci(x + 55, 300, 4, '#ffd23f');
  return { bg, mid: floor('#e9ecef', '#c5cad3'), fg: rc(-60, 840, 120, 200, '#3a86ff') };
};
ENV.park = o => {
  let bg = sky('pk', TOD.day) + clouds(o.t, 4) + `<g>${[-300, -80, 150, 400, 700].map((x, i) => rc(x + 20, 360, 24, 290, '#8b5e3c', 4) + ci(x + 32, 330, 80 + rnd(i) * 20, ['#52b788', '#40916c', '#74c69d'][i % 3], 5)).join('')}</g>`;
  let mid = floor('#95d5b2', '#74c69d') + el(120, GY + 50, 130, 24, '#8ecae6', 4) + rc(340, 560, 180, 14, '#8b5e3c', 5) + rc(350, 574, 10, 76, '#5a3d2b') + rc(500, 574, 10, 76, '#5a3d2b') + rc(340, 510, 180, 12, '#8b5e3c', 5);
  return { bg, mid, fg: pot(-10, 740) };
};
ENV.cafe = o => {
  let bg = wall('#f6bd60') + rc(X0, 420, WW, 230, '#bc6c25') + rc(60, 90, 220, 170, '#2b2b3a', 6) + tx('MENU', 170, 150, 40, { fill: '#fff' }) + tx('$1', 170, 200, 40, { fill: '#ffd23f' });
  for (let i = 0; i < 3; i++) bg += ln(100 + i * 160 + 140, -100, 100 + i * 160 + 140, 160, 4, '#222') + pg(`M${60 + 140 + i * 160},160 L${140 + 140 + i * 160},160 L${120 + 140 + i * 160},200 L${80 + 140 + i * 160},200 Z`, '#e63946', 4);
  let mid = floor('#6f4e37', '#4b3426') + rc(-20, 500, 240, 150, '#e9c46a', 5) + rc(-20, 480, 240, 24, '#8b5e3c', 5) + ci(60, 450, 26, '#ccc', 4) + rc(380, 560, 100, 12, '#fff', 5) + rc(424, 572, 12, 78, '#444');
  return { bg, mid, fg: pot(550, 740) };
};
ENV.vault = o => {
  let bg = wall('#4a5568') + rc(X0, 420, WW, 230, '#2d3748');
  for (let i = 0; i < 10; i++) bg += rc(-300 + i * 110, 80, 92, 280, '#718096', 4) + ci(-254 + i * 110, 220, 10, '#ffd23f');
  let mid = floor('#2d3748', '#1a202c') + ci(270, 400, 170, '#a0aec0', 8) + ci(270, 400, 120, '#718096', 5) + ci(270, 400, 36, '#ffd23f', 5);
  for (let i = 0; i < 8; i++) mid += ln(270, 400, 270 + Math.cos(i * .785 + o.t * .5) * 112, 400 + Math.sin(i * .785 + o.t * .5) * 112, 8, '#cbd5e0');
  mid += [0, 1, 2].map(i => rc(-60 + i * 36, 620 - i * 0, 50, 30, '#ffd23f', 4)).join('') + rc(-24, 590, 50, 30, '#ffe066', 4);
  mid += ln(-100, 560 + Math.sin(o.t * 2) * 30, 640, 560 + Math.sin(o.t * 2) * 30, 4, 'rgba(255,60,60,.8)') + ln(-100, 600 + Math.sin(o.t * 2 + 2) * 30, 640, 600 - Math.sin(o.t * 2 + 2) * 30, 4, 'rgba(255,60,60,.8)');
  return { bg, mid, fg: rc(-60, 840, 120, 200, '#1a202c'), haze: 'rgba(0,0,30,.12)' };
};
ENV.airport = o => {
  let bg = wall('#dbe7f3') + rc(X0, 60, WW, 340, '#8fd3ff', 0) + fx.cloud(100 + (o.t * 6) % 500, 200, 1);
  bg += rc(40, 440, 460, 60, '#10162b', 6, 10) + tx('DEPARTURES', 270, 482, 30, { fill: '#ffd23f' });
  bg += `<g transform="translate(${(o.t * 20) % 700 - 200} 330)">${el(0, 0, 70, 14, '#fff', 4)}${pg('M-10,0 L-50,-40 L-30,-40 L20,0 Z', '#fff', 4)}${pg('M60,0 L90,-30 L76,-30 L40,0 Z', '#e63946', 3)}</g>`;
  let mid = floor('#c7d3e0', '#9aa9bb') + rc(380, 560, 180, 16, '#3a86ff', 5) + rc(390, 576, 10, 74, '#555') + rc(540, 576, 10, 74, '#555') + rc(-20, 580, 90, 70, '#e63946', 5, 8) + rc(-6, 560, 62, 24, '#c0392b', 4, 6);
  return { bg, mid, fg: rc(-60, 840, 120, 200, '#9aa9bb') };
};
ENV.desert = o => {
  let bg = sky('ds', { s1: '#ffb347', s2: '#ffe29a' }) + ci(130, 330, 90, '#fff3a0') + pg(`M${X0},450 Q-200,330 0,420 T300,410 T640,430 L640,${GY} L${X0},${GY} Z`, '#f4a261') + pg(`M${X0},520 Q-100,450 100,500 T420,480 T900,520 L900,${GY} L${X0},${GY} Z`, '#e9c46a');
  let mid = rc(X0, GY - 40, WW, 800, '#f4d58d') + pg(`M-100,${GY} Q100,${GY - 90} 300,${GY} Z`, '#e9c46a');
  mid += `<g transform="translate(440 ${GY})">${rc(-12, -120, 24, 120, '#2d9d5b', 4, 12)}${rc(-34, -90, 12, 40, '#2d9d5b', 4, 6)}${rc(22, -70, 12, 36, '#2d9d5b', 4, 6)}</g>`;
  return { bg, mid, fg: pg(`M-100,900 Q100,700 340,900 Z`, '#e9c46a'), haze: 'rgba(255,220,150,.08)' };
};
ENV.beach = o => {
  let bg = sky('bc', TOD.day) + clouds(o.t, 3) + ci(430, 160, 50, '#fff3a0') + rc(X0, 400, WW, 250, '#48cae4');
  for (let i = 0; i < 9; i++) bg += pg(`M${-300 + i * 130 + Math.sin(o.t * 2 + i) * 14},${420 + (i % 3) * 36} q20,-14 40,0 t40,0`, 'none', 4, 'stroke="#fff" opacity=".8"').replace(`stroke="${INK}"`, '');
  let mid = rc(X0, GY - 50, WW, 700, '#f6e3a1') + rc(X0, GY - 60, WW, 22 + Math.sin(o.t * 2) * 6, '#90e0ef') + `<g transform="translate(60 ${GY})">${pg('M-8,0 Q0,-160 22,-230', 'none', 12, 'stroke="#8b5e3c"')}${[-70, -30, 10, 50, 90].map((a, i) => pg(`M22,-230 Q${22 + a},${-270 + (i % 2) * 20} ${22 + a * 1.6},${-210}`, 'none', 10, 'stroke="#2d9d5b"')).join('')}</g>`;
  return { bg, mid, fg: pg('M400,900 Q460,780 620,900 Z', '#f0d98c') };
};
ENV.mountain = o => {
  let bg = sky('mt', { s1: '#5e60ce', s2: '#d0e8ff' }) + clouds(o.t, 3, '#fff', 120) + pg(`M${X0},500 L-120,230 L40,380 L170,170 L330,420 L430,300 L560,430 L760,260 L900,500 Z`, '#8d99ae') + pg('M-120,230 L-90,290 L-60,270 L-40,330 L-150,330 Z M170,170 L210,250 L180,240 L170,290 L140,250 Z', '#fff');
  let mid = rc(X0, GY - 30, WW, 700, '#f1f7ff') + pg(`M-100,${GY - 30} Q100,${GY - 110} 280,${GY - 30} T700,${GY - 30} Z`, '#fff') + `<g transform="translate(450 ${GY - 20})">${rc(-3, -150, 6, 150, '#555')}${pg('M3,-150 L60,-130 L3,-110 Z', '#e63946', 3)}</g>`;
  for (let i = 0; i < 24; i++) mid += ci(((i * 83 + o.t * 40) % 1100) - 280, ((i * 61 + o.t * 90) % 900) - 60, 2.5, '#fff');
  return { bg, mid, fg: pg('M-100,900 Q80,760 280,900 Z', '#fff') };
};
ENV.subway = o => {
  let bg = wall('#cbd5c0') + rc(X0, 300, WW, 350, '#9db4a0');
  for (let x = X0; x < X0 + WW; x += 90) bg += ln(x, 300, x, GY, 3, '#86a08a');
  bg += rc(60, 100, 420, 120, '#10162b', 6, 10) + tx('LINE 9', 270, 180, 54, { fill: '#2dc653' });
  let mid = floor('#6c7a7d', '#4a5558') + rc(X0, GY + 40, WW, 14, '#ffd23f') + rc(100, 420, 340, 190, '#e63946', 5, 14) + [0, 1, 2].map(i => rc(120 + i * 105, 440, 80, 70, '#bfe4ff', 4, 6)).join('') + rc(100, 560, 340, 14, '#222');
  return { bg, mid, fg: rc(-60, 820, 120, 200, '#4a5558'), haze: 'rgba(0,0,0,.05)' };
};
ENV.graveyard = o => {
  let bg = sky('gy', { s1: '#10122e', s2: '#4b2a63' }) + fx.stars(o.t, 28) + ci(120, 200, 52, '#f4f1de') + pg(`M${X0},470 Q0,360 280,450 T900,440 L900,${GY} L${X0},${GY} Z`, '#2b2a4c');
  bg += `<g transform="translate(450 ${GY - 40})">${pg('M0,0 Q-6,-160 10,-250', 'none', 14, 'stroke="#15122b"')}${pg('M6,-150 Q-60,-190 -90,-230 M8,-200 Q50,-240 90,-250', 'none', 8, 'stroke="#15122b"')}</g>`;
  let mid = rc(X0, GY - 30, WW, 700, '#3a3a5c') + [-250, -40, 120, 330, 500].map((x, i) => `<g transform="translate(${x} ${GY - 10})">${pg('M-26,0 L-26,-70 Q0,-110 26,-70 L26,0 Z', '#9aa0b4', 5)}${ln(-10, -60, 10, -60, 4, '#6b7391')}${ln(0, -72, 0, -48, 4, '#6b7391')}</g>`).join('');
  return { bg, mid, fg: pg('M-100,900 Q60,780 240,900 Z', '#2b2a4c'), haze: 'rgba(30,20,80,.15)' };
};
ENV.void = o => {
  let bg = rc(X0, -400, WW, 1400, '#05051a') + fx.stars(o.t, 70) + ci(120, 220, 70, '#ff9f68') + el(120, 220, 110, 20, 'none', 6).replace('stroke="#1b1b2f"', 'stroke="#ffd6a0"') + ci(420, 360, 34, '#7bdff2');
  let mid = el(270, GY + 20, 330, 40, '#2b2d5e', 5) + el(270, GY + 6, 300, 26, '#3b3f8c');
  return { bg, mid, fg: '' };
};
// eras: o.era 0..6 (fractional blends two)
function eraScene(k, t) {
  const gnd = (c) => rc(X0, GY, WW, 700, c) + rc(X0, GY, WW, 7, shade(c, .3));
  switch (k) {
    case 0: return { sky: ['#8ecae6', '#f1faee'], bg: pg(`M${X0},500 Q0,380 280,480 T900,470 L900,${GY} L${X0},${GY} Z`, '#7fb069'), mid: gnd('#a98467') + [60, 400].map((x, i) => `<g transform="translate(${x} ${GY})">${pg('M-50,0 L0,-90 L50,0 Z', '#c08457', 5)}${rc(-12, -34, 24, 34, '#3a2a1c')}</g>`).join('') + `<g transform="translate(250 ${GY})">${pg(`M-18,0 L0,-${30 + Math.sin(t * 9) * 6} L18,0 Z`, '#ff7b00', 3)}${ln(-22, 0, 22, -6, 7, '#6d4c41')}</g>` };
    case 1: return { sky: ['#9ad1ff', '#fff4d6'], bg: skyline(2, 0, 120, 260, '#b8a99a', '#ffd86b', 0), mid: gnd('#8d7b68') + [0, 1, 2].map(i => `<g transform="translate(${-30 + i * 220} ${GY})">${rc(-34, -190, 68, 190, '#c9b79c', 5)}${rc(-44, -210, 88, 26, '#9a8c7a', 5)}${[-30, -6, 18].map(x => rc(x, -226, 14, 20, '#9a8c7a', 4)).join('')}${pg('M-12,0 L-12,-44 Q0,-64 12,-44 L12,0 Z', '#3a2a1c')}${pg(`M34,-180 L${60 + Math.sin(t * 3 + i) * 5},-170 L34,-158 Z`, '#e63946', 3)}</g>`).join('') };
    case 2: return { sky: ['#a8a39d', '#e6dccf'], bg: skyline(5, 0, 120, 200, '#8a817c', '#ffd86b', 0), mid: gnd('#5f5a55') + [60, 260, 440].map((x, i) => `<g transform="translate(${x} ${GY})">${rc(-30, -240, 60, 240, '#a4533a', 5)}${rc(-40, -262, 80, 24, '#7a3b28', 5)}${[0, 1, 2].map(j => ci(-4 + j * 4, -290 - j * 40 - ((t * 20) % 30), 20 + j * 8, 'rgba(210,210,210,.6)')).join('')}</g>`).join('') };
    case 3: return { sky: ['#6ec3f4', '#dff3ff'], bg: skyline(1, 0, 180, 420, '#9fb8d0', '#bfe4ff', 0), mid: gnd('#555b6e') + skyline(7, 0, 120, 250, '#bcc6dc', '#bfe4ff', 0, 80) };
    case 4: return { sky: ['#1c0b3a', '#6a2fb5'], bg: skyline(4, 0, 300, 700, '#2a1a5e', '#00e5ff', 1, 60), mid: gnd('#25204f') + [80, 300, 480].map((x, i) => `<g transform="translate(${x} ${GY})">${pg('M-24,0 L-14,-400 L0,-470 L14,-400 L24,0 Z', '#4a2ea8', 5)}${ci(0, -300, 9, '#ff2fd6')}</g>`).join('') + [0, 1, 2].map(i => `<g transform="translate(${((t * 140 + i * 400) % 1300) - 400} ${250 + i * 70})">${rc(-36, -10, 72, 20, '#00e5ff', 4, 10)}${ci(-18, 10, 6, '#ff2fd6')}${ci(18, 10, 6, '#ff2fd6')}</g>`).join('') };
    case 5: return { sky: ['#6a8caf', '#d8e2dc'], bg: skyline(8, 0, 120, 380, '#7a8b8f', '#7a8b8f', 0), mid: gnd('#4f6f52') + [40, 280, 470].map((x, i) => `<g transform="translate(${x} ${GY})">${pg(`M-30,0 L-26,-${150 + i * 40} L-8,-${190 + i * 30} L10,-${120 + i * 30} L30,0 Z`, '#8d9a9b', 5)}${ci(-10, -40, 30, '#2d9d5b')}${ci(18, -70, 24, '#52b788')}</g>`).join('') };
    default: return { sky: ['#05051a', '#0e0e3a'], bg: fx.stars(t, 90), mid: el(270, GY + 20, 330, 40, '#16163f', 5) };
  }
}
ENV.era = o => {
  const e = Math.max(0, Math.min(6, o.era || 0)), a = Math.floor(e), b = Math.min(6, a + 1), k = e - a;
  const A = eraScene(a, o.t), B = eraScene(b, o.t);
  const lay = (S, id) => grad(id, S.sky[0], S.sky[1]) + rc(X0, -400, WW, GY + 400, `url(#${id})`);
  const bg = `<g>${lay(A, 'ea')}${A.bg}</g>` + (k > 0 ? `<g opacity="${f2(k)}">${lay(B, 'eb')}${B.bg}</g>` : '');
  const mid = `<g>${A.mid}</g>` + (k > 0 ? `<g opacity="${f2(k)}">${B.mid}</g>` : '');
  return { bg, mid, fg: '' };
};
ENV.field = o => {
  let bg = sky('fd', TOD.day) + clouds(o.t, 4) + pg(`M${X0},470 Q-100,380 140,450 T520,440 T900,450 L900,${GY} L${X0},${GY} Z`, '#74c69d');
  let mid = rc(X0, GY - 40, WW, 700, '#95d5b2');
  for (let i = 0; i < 40; i++) mid += ci(-300 + rnd(i) * 1100, GY - 20 + rnd(i + 4) * 60, 4, ['#ffd23f', '#ff7aa2', '#fff'][i % 3]);
  return { bg, mid, fg: '' };
};
})(window);
