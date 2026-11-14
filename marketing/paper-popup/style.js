(function () {
  // ---------------------------------------------------------------- content: "Učíme se hrou" in a pop-up book
  // fold 'v'     a V-fold glued across the gutter (z = where its crease meets the gutter, alpha = angle to the gutter)
  // fold 'box'   a cut-out standing `depth` in front of one wing, held by a paper strap at height `strap`
  // fold 'float' a piece on a small paper tab in front of a wing; `sway` lets it tremble when the page lands
  // slide        (on a 'v') the card comes up through a slit in the page, driven by the pull tab
  const C = { card: '#f5ecd9', cream: '#fbf3df', navy: '#22364e', coral: '#e2604a', pink: '#f3ab99', yellow: '#f5bd35', honey: '#eba020', amber: '#cf7d22', leaf: '#74a25e', sage: '#a6c787', deep: '#2f6753', sky: '#cfe5df', teal: '#8fc6d8', skin: '#f1c7a0' };
  const PAGE_W = 5.6, PAGE_D = 6.4;
  const TURN = 1.25, TURNS = [-1.03, 4.65, 10.1, 15.55, 21.25];   // the last page lands at 22.5 s and the motto holds for 2.5 s
  const PULL = [18.0, 19.1];                                        // the pull tab on spread 4 slides out and the chart fills
  const DURATION = 25;
  const pulled = (t) => K.seg(t, PULL[0], PULL[1], K.ease.inOut);

  const ruler2 = document.createElement('canvas').getContext('2d'); ruler2.font = '700 100px "Fraunces"';
  const tw = (s, size) => ruler2.measureText(s).width * size / 100;
  const fit = (a, str, cx, y, size, maxW, col, al = 'center') => a.text(str, cx, y, Math.min(size, size * maxW / tw(str, size)), col, al);
  // an icon written as SVG path data (24 x 24 box, y down), stroked with round ends
  const ico = (a, d, x, y, s, col, lw = 2) => { const c = a.ctx; c.save(); c.translate(x, y); c.scale(s / 24, -s / 24); c.translate(-12, -12); c.strokeStyle = col; c.lineWidth = lw; c.lineCap = c.lineJoin = 'round'; c.stroke(new Path2D(d)); c.restore(); return a; };
  const ICON = {
    zs: 'M8 7a4 4 0 0 1 8 0 M6 8h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2z M8 15h8 M8 21v-3h8v3',            // backpack
    ss: 'M3 21h18 M5 21V10l7-5 7 5v11 M10 21v-6h4v6 M12 5V2 M12 2h4v2h-4 M8 11h.01 M16 11h.01',                                        // school
    test: 'M6 3h9l4 4v14H6z M15 3v4h4 M9 12l1.6 1.6L13.5 10 M9 17h7',                                                                     // test sheet with a tick
    cap: 'M2 9l10-5 10 5-10 5z M6 11.5V16c0 1.6 2.7 3 6 3s6-1.4 6-3v-4.5 M22 9v6',                                                       // graduation cap
    again: 'M21 12a9 9 0 1 1-3-6.7 M21 3v6h-6',
  };
  const star = (a, x, y, r, col = C.yellow, inner = 0.46) => { a.path(col, (c) => { for (let k = 0; k < 10; k++) { const q = Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * inner : r; c.lineTo(x + rr * Math.cos(q), y + rr * Math.sin(q)); } }); return a; };
  const arm = (a, pts) => { a.line(C.cream, 0.13, (c) => { c.moveTo(pts[0], pts[1]); c.quadraticCurveTo(pts[2], pts[3], pts[4], pts[5]); }); a.line(C.navy, 0.045, (c) => { c.moveTo(pts[0], pts[1]); c.quadraticCurveTo(pts[2], pts[3], pts[4], pts[5]); }, [0.1, 0.12]); };
  const stepNo = (a, n) => { a.disc(C.coral, -3.5, -2.45, 0.46); a.disc(C.cream, -3.5, -2.45, 0.37); a.text(String(n), -3.5, -2.68, 0.66, C.navy); };
  const frame = (a, col) => a.box(col, -5.42, -3.02, 10.84, 6.04, 0.45);
  const clipPage = (a, fn) => a.clip((c) => c.roundRect(-5.42, -3.02, 10.84, 6.04, 0.45), fn);
  const globe = (a, cx) => {
    a.box(C.navy, cx - 0.6, -0.1, 1.2, 0.16, 0.06); a.line(C.navy, 0.1, (c) => { c.moveTo(cx, 0.3); c.lineTo(cx, 0.0); });
    a.line(C.navy, 0.1, (c) => c.arc(cx, 1.3, 1.0, Math.PI * 1.1, Math.PI * 1.9));
    a.disc(C.teal, cx, 1.3, 0.8);
    a.clip((c) => c.ellipse(cx, 1.3, 0.8, 0.8, 0, 0, 7), () => { a.disc(C.leaf, cx - 0.25, 1.55, 0.42, 0.3, 0.4); a.disc(C.leaf, cx + 0.3, 1.0, 0.3, 0.5, -0.3); a.disc(C.sage, cx - 0.35, 0.95, 0.2, 0.15, 0.2); });
    a.line(C.cream, 0.03, (c) => c.ellipse(cx, 1.3, 0.38, 0.8, 0, 0, 7)); a.line(C.cream, 0.03, (c) => { c.moveTo(cx - 0.8, 1.3); c.lineTo(cx + 0.8, 1.3); });
  };
  const person = (a, x, y, s, col, hair, label) => {
    a.box(col, x - 0.5 * s, y, 1.0 * s, 1.15 * s, [0.05, 0.05, 0.45 * s, 0.45 * s]);
    a.disc(hair, x, y + 1.15 * s + 0.4 * s, 0.4 * s, 0.38 * s); a.disc(C.skin, x, y + 1.15 * s + 0.34 * s, 0.35 * s, 0.34 * s);
    a.disc(C.navy, x - 0.13 * s, y + 1.15 * s + 0.4 * s, 0.045 * s); a.disc(C.navy, x + 0.13 * s, y + 1.15 * s + 0.4 * s, 0.045 * s);
    a.line(C.navy, 0.04 * s, (c) => c.arc(x, y + 1.15 * s + 0.36 * s, 0.14 * s, Math.PI * 1.15, Math.PI * 1.85));
    a.box(C.cream, x - 0.42 * s, y + 0.3 * s, 0.84 * s, 0.4 * s, 0.07); fit(a, label, x, y + 0.4 * s, 0.26, 0.76 * s, C.navy);
  };

  const SPREADS = [
    { // ------------------------------------------------------------ 1. choose a subject
      words: ['Vyber si', 'předmět.'], em: 0.76,
      floor(a) {
        frame(a, C.cream);
        clipPage(a, () => { for (let i = -11; i <= 11; i++) a.line('#c3dbe3', 0.022, (c) => { c.moveTo(i * 0.5, -3.1); c.lineTo(i * 0.5, 3.1); }); for (let j = -7; j <= 7; j++) a.line('#c3dbe3', 0.022, (c) => { c.moveTo(-5.5, j * 0.5); c.lineTo(5.5, j * 0.5); }); a.line(C.coral, 0.03, (c) => { c.moveTo(-5.5, 2.6); c.lineTo(5.5, 2.6); }); });
        stepNo(a, 1);
      },
      parts: [
        { id: 'shelf', fold: 'v', z: -1.0, alpha: 76, size: [9.8, 3.2], art(a) {
          a.box(C.sky, -4.9, -0.1, 9.8, 3.2, 0.12);
          const r = K.rng(21), cols = [C.coral, C.yellow, C.leaf, C.pink, C.navy, C.honey, C.deep, C.cream];
          [[0.06, 1.15], [1.5, 1.1]].forEach(([y0, hmax], row) => { for (let x = -4.8; x < 4.6;) { const w = r.range(0.22, 0.42), h = r.range(hmax * 0.68, hmax), col = r.pick(cols); a.box(col, x, y0, w - 0.03, h, 0.03); a.box(col === C.cream ? C.coral : C.cream, x + 0.03, y0 + h * 0.3, w - 0.09, 0.05); x += w; } });
          a.box(C.navy, -4.9, -0.1, 9.8, 0.18); a.box(C.navy, -4.9, 1.32, 9.8, 0.16); a.box(C.navy, -4.9, 2.76, 9.8, 0.16);
        } },
        { fold: 'box', on: 'shelf', span: [-4.6, -2.4], depth: 1.35, strap: 0.75, height: 2.1, art(a) {
          a.box(C.coral, -4.45, -0.1, 2.0, 0.6, 0.06); a.box(C.cream, -4.3, 0.12, 0.07, 0.3); a.box(C.cream, -2.8, 0.12, 0.07, 0.3);
          a.box(C.yellow, -4.25, 0.5, 1.75, 0.5, 0.06); a.box(C.cream, -4.1, 0.62, 0.07, 0.26); a.box(C.cream, -2.75, 0.62, 0.07, 0.26);
          a.box(C.leaf, -4.4, 0.98, 1.95, 0.46, 0.06); a.box(C.cream, -4.25, 1.09, 0.07, 0.24); a.box(C.cream, -2.8, 1.09, 0.07, 0.24);
          a.disc(C.coral, -3.4, 1.77, 0.36, 0.33); a.line(C.navy, 0.05, (c) => { c.moveTo(-3.4, 2.05); c.quadraticCurveTo(-3.38, 2.2, -3.28, 2.28); }); a.path(C.sage, (c) => { c.moveTo(-3.36, 2.1); c.quadraticCurveTo(-3.1, 2.3, -2.95, 2.1); c.quadraticCurveTo(-3.15, 1.98, -3.36, 2.1); });
        } },
        { fold: 'box', on: 'shelf', span: [2.5, 4.6], depth: 1.2, strap: 0.7, height: 2.1, art(a) { globe(a, 3.55); } },
        { id: 'menu', fold: 'v', z: 0.35, alpha: 58, size: [4.8, 2.95], art(a) {
          const subs = [['Matematika', C.coral], ['Čeština', C.yellow], ['Angličtina', C.leaf], ['Dějepis', C.pink], ['Zeměpis', C.teal], ['Fyzika', C.honey]];
          a.box(C.navy, -2.4, -0.1, 4.8, 3.0, 0.18);
          subs.forEach(([name, col], i) => { const x = i % 2 ? 0.1 : -2.3, y = 0.07 + Math.floor(i / 2) * 0.94; a.box(col, x, y, 2.2, 0.84, 0.12); a.box(C.cream, x + 0.14, y + 0.1, 0.07, 0.64, 0.03); fit(a, name, x + 1.17, y + 0.27, 0.42, 1.8, C.navy); });
        } },
        { fold: 'float', on: 'menu', side: 1, at: [2.0, 2.45], gap: 0.3, sway: 1, area: [0.9, 2.3, 3.0, 3.75], art(a) { arm(a, [2.0, 2.45, 2.35, 2.8, 1.95, 2.95]); star(a, 1.85, 3.1, 0.43); star(a, 1.85, 3.1, 0.21, C.honey); } },
      ],
    },
    { // ------------------------------------------------------------ 2. answer, points, explanation
      words: ['Odpovídej,', 'sbírej body.'], em: 0.56,
      floor(a) {
        frame(a, '#f9e9b8');
        clipPage(a, () => { for (let i = -11; i <= 11; i++) for (let j = -7; j <= 7; j++) a.disc('#f0d98f', i * 0.6 + (j & 1 ? 0.3 : 0), j * 0.52, 0.045); });
        stepNo(a, 2);
      },
      parts: [
        { id: 'stage', fold: 'v', z: -1.0, alpha: 76, size: [9.6, 3.2], art(a) {
          a.box(C.teal, -4.8, -0.1, 9.6, 3.2, 0.1);
          const Q = (u, k) => (1 - u) * (1 - u) * 2.8 + 2 * (1 - u) * u * 1.9 + u * u * 2.8;
          a.line(C.navy, 0.05, (c) => { c.moveTo(-4.7, 2.8); c.quadraticCurveTo(0, 1.0, 4.7, 2.8); });
          const cols = [C.coral, C.yellow, C.cream, C.leaf, C.pink];
          for (let i = 0; i < 17; i++) { const u = (i + 0.5) / 17, x = -4.7 + 9.4 * u, y = (1 - u) * (1 - u) * 2.8 + 2 * (1 - u) * u * 1.9 + u * u * 2.8; a.path(cols[i % 5], (c) => { c.moveTo(x - 0.24, y + 0.02); c.lineTo(x + 0.24, y + 0.02); c.lineTo(x, y - 0.52); }); }
          const r = K.rng(8); for (let i = 0; i < 16; i++) star(a, r.range(-4.5, 4.5), r.range(0.1, 1.0), r.range(0.07, 0.14), '#e9f3ef');
        } },
        { fold: 'box', on: 'stage', span: [-4.65, -2.4], depth: 1.4, strap: 0.6, height: 2.6, art(a) {
          a.box(C.navy, -4.6, -0.1, 2.2, 2.05, 0.14); a.box(C.cream, -4.52, -0.02, 2.04, 1.89, 0.1);
          fit(a, 'Vysvětlení', -3.5, 1.45, 0.36, 1.85, C.coral);
          fit(a, '5 × 8 = 40', -3.5, 0.95, 0.3, 1.8, C.navy); fit(a, '2 × 8 = 16', -3.5, 0.55, 0.3, 1.8, C.navy); a.line(C.coral, 0.04, (c) => { c.moveTo(-4.25, 0.4); c.lineTo(-2.75, 0.4); }); fit(a, '40 + 16 = 56', -3.5, 0.08, 0.3, 1.8, C.navy);
          a.box(C.navy, -3.66, 1.9, 0.32, 0.14, 0.04); a.disc(C.yellow, -3.5, 2.2, 0.34); for (const q of [0.5, 1.2, 1.94, 2.64]) a.line(C.yellow, 0.06, (c) => { c.moveTo(-3.5 + 0.46 * Math.cos(q), 2.2 + 0.46 * Math.sin(q)); c.lineTo(-3.5 + 0.6 * Math.cos(q), 2.2 + 0.6 * Math.sin(q)); });
        } },
        { fold: 'box', on: 'stage', span: [2.5, 4.6], depth: 1.2, strap: 0.6, height: 2.6, art(a) {
          a.box(C.navy, 2.45, -0.1, 2.2, 0.16, 0.05);
          [C.sage, C.leaf, C.yellow, C.honey, C.coral].forEach((col, k) => { const h = 0.6 + 0.32 * k; a.box(col, 2.52 + k * 0.4, 0, 0.4, h, 0.04); a.text(String(k + 1), 2.72 + k * 0.4, h - 0.4, 0.34, C.navy); });
          star(a, 4.52, 2.45, 0.34);
        } },
        { id: 'quiz', fold: 'v', z: 0.35, alpha: 58, size: [4.8, 2.95], art(a) {
          a.box(C.navy, -2.4, -0.1, 4.8, 3.0, 0.2); a.box(C.cream, -2.3, 0.0, 4.6, 2.8, 0.14);
          fit(a, '7 × 8 = ?', 0, 1.95, 0.95, 4.0, C.navy);
          [['54', -2.1, 1.0, 0], ['63', 0.2, 1.0, 0], ['48', -2.1, 0.2, 0], ['56', 0.2, 0.2, 1]].forEach(([n, x, y, ok]) => {
            if (ok) { a.box(C.leaf, x, y, 1.9, 0.66, 0.16); fit(a, n, x + 0.7, y + 0.15, 0.56, 1.2, C.cream); a.line(C.cream, 0.1, (c) => { c.moveTo(x + 1.3, y + 0.34); c.lineTo(x + 1.45, y + 0.2); c.lineTo(x + 1.72, y + 0.5); }); }
            else { a.box(C.sky, x, y, 1.9, 0.66, 0.16); fit(a, n, x + 0.95, y + 0.15, 0.56, 1.2, C.navy); }
          });
        } },
        { fold: 'float', on: 'quiz', side: -1, at: [-2.0, 2.45], gap: 0.3, sway: 1, area: [-3.1, 2.3, -0.9, 3.75], art(a) { arm(a, [-2.0, 2.45, -1.9, 2.8, -2.0, 2.95]); a.disc(C.honey, -2.0, 3.1, 0.44); a.disc(C.yellow, -2.0, 3.1, 0.34); star(a, -2.0, 3.1, 0.21, C.honey); } },
      ],
    },
    { // ------------------------------------------------------------ 3. games, escape room, daily quiz, revision
      words: ['Učení', 'je hra.'], em: 0.76,
      floor(a) {
        frame(a, '#f7d4cb');
        clipPage(a, () => { const r = K.rng(13), cols = [C.coral, C.yellow, C.leaf, C.cream, C.teal]; for (let i = 0; i < 70; i++) { const x = r.range(-5.2, 5.2), y = r.range(-2.8, 2.8), col = r.pick(cols), c = a.ctx; c.save(); c.translate(x, y); c.rotate(r.range(0, 6)); a.box(col, -0.12, -0.05, 0.24, 0.1, 0.03); c.restore(); } });
        stepNo(a, 3);
      },
      parts: [
        { id: 'arcade', fold: 'v', z: -1.0, alpha: 76, size: [9.6, 3.2], art(a) {
          a.box(C.pink, -4.8, -0.1, 9.6, 3.2, 0.1);
          for (let i = -9; i <= 9; i++) for (let j = 0; j < 5; j++) { const x = i * 0.55 + (j & 1 ? 0.275 : 0), y = 0.2 + j * 0.62; a.path(j % 2 ? '#f6c7ba' : '#f9d6cc', (c) => { c.moveTo(x, y - 0.24); c.lineTo(x + 0.2, y); c.lineTo(x, y + 0.24); c.lineTo(x - 0.2, y); }); }
          a.box(C.navy, -4.8, -0.1, 9.6, 0.18);
        } },
        { fold: 'box', on: 'arcade', span: [-4.65, -2.4], depth: 1.4, strap: 0.7, height: 2.5, art(a) {
          a.box(C.navy, -4.55, -0.1, 2.1, 2.1, 0.12); a.box(C.cream, -4.47, -0.02, 1.94, 1.94, 0.08); a.box(C.coral, -4.47, 1.38, 1.94, 0.54, [0.08, 0.08, 0.0, 0.0]);
          fit(a, 'Denní kvíz', -3.5, 1.52, 0.34, 1.75, C.cream);
          for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { const x = -4.4 + c * 0.48, y = 0.1 + r * 0.42, last = r === 2 && c === 3; a.box(last ? C.yellow : C.sky, x, y, 0.4, 0.34, 0.07); if (!last) a.line(C.navy, 0.05, (p) => { p.moveTo(x + 0.09, y + 0.17); p.lineTo(x + 0.18, y + 0.08); p.lineTo(x + 0.32, y + 0.26); }); }
          a.box(C.navy, -4.2, 1.9, 0.12, 0.4, 0.05); a.box(C.navy, -2.9, 1.9, 0.12, 0.4, 0.05);
        } },
        { fold: 'box', on: 'arcade', span: [2.5, 4.6], depth: 1.2, strap: 0.7, height: 2.5, art(a) {
          a.box(C.navy, 2.55, -0.1, 2.0, 2.1, 0.12); a.box(C.cream, 2.63, -0.02, 1.84, 1.94, 0.08);
          ico(a, ICON.again, 3.55, 1.25, 1.5, C.coral, 2.3); fit(a, 'Opakování', 3.55, 0.2, 0.34, 1.65, C.navy);
        } },
        { id: 'door', fold: 'v', z: 0.35, alpha: 58, size: [4.8, 2.95], art(a) {
          a.box(C.navy, -1.65, -0.1, 3.3, 2.75, [0.06, 0.06, 1.15, 1.15]); a.box(C.coral, -1.47, 0.0, 2.94, 2.55, [0.04, 0.04, 1.0, 1.0]);
          for (const x of [-0.75, 0, 0.75]) a.line('#c9503c', 0.045, (c) => { c.moveTo(x, 0.95); c.lineTo(x, 1.65); });
          a.disc(C.navy, 0, 1.95, 0.46); a.disc(C.yellow, 0, 1.95, 0.36); a.text('?', 0, 1.77, 0.55, C.navy);
          a.disc(C.cream, 0.98, 1.2, 0.3); a.disc(C.navy, 0.98, 1.27, 0.09); a.path(C.navy, (c) => { c.moveTo(0.93, 1.25); c.lineTo(1.03, 1.25); c.lineTo(1.07, 1.0); c.lineTo(0.89, 1.0); });
          a.box(C.navy, -1.2, 0.18, 2.4, 0.66, 0.1); a.box(C.cream, -1.13, 0.25, 2.26, 0.52, 0.07); fit(a, 'Únikovky', 0, 0.35, 0.44, 2.1, C.navy);
        } },
        { fold: 'float', on: 'door', side: 1, at: [1.4, 1.75], gap: 0.3, sway: 1, area: [0.95, 1.6, 3.4, 3.7], art(a) {
          arm(a, [1.4, 1.75, 1.35, 2.35, 1.8, 2.5]);
          const c = a.ctx; c.save(); c.translate(1.95, 2.65); c.rotate(0.45);
          a.disc(C.yellow, 0, 0, 0.33); a.disc(C.navy, 0, 0, 0.14); a.box(C.yellow, 0.2, -0.08, 1.05, 0.16, 0.04); a.box(C.yellow, 0.82, -0.36, 0.14, 0.3, 0.03); a.box(C.yellow, 1.06, -0.3, 0.14, 0.24, 0.03); c.restore();
        } },
      ],
    },
    { // ------------------------------------------------------------ 4. progress is visible to pupil, parent, teacher
      words: ['Pokrok', 'je vidět.'], em: 0.76,
      floor(a) {
        frame(a, '#d8ebee');
        clipPage(a, () => { for (let j = -6; j <= 6; j++) a.line('#bcd9de', 0.035, (c) => { c.moveTo(-5.5, j * 0.55); c.lineTo(5.5, j * 0.55); }); });
        stepNo(a, 4);
        a.box(C.navy, 0.9, -2.66, 3.1, 0.075, 0.035);                                   // the slot the pull tab runs in
      },
      parts: [
        { id: 'class', fold: 'v', z: -1.0, alpha: 76, size: [9.6, 3.3], art(a) {
          a.box('#f1e2bd', -4.8, -0.1, 9.6, 3.3, 0.1);
          a.box('#b9803f', -3.4, 0.85, 6.8, 2.3, 0.1); a.box(C.deep, -3.25, 1.0, 6.5, 2.0, 0.06);
          fit(a, 'a² + b² = c²', 0, 1.65, 0.62, 5.2, C.cream);
          a.line('#d6e4d6', 0.04, (c) => { c.moveTo(-2.9, 1.2); c.quadraticCurveTo(-1.5, 1.35, 0.2, 1.2); }, [0.12, 0.1]); a.box('#d6e4d6', 1.0, 1.0, 1.3, 0.09, 0.03);
          a.box(C.navy, -4.8, -0.1, 9.6, 0.18);
        } },
        { fold: 'box', on: 'class', span: [-4.65, -2.35], depth: 1.4, strap: 0.6, height: 2.75, art(a) {
          a.box(C.navy, -4.6, -0.1, 2.25, 0.16, 0.05);
          person(a, -4.0, 0.06, 1.0, C.coral, C.navy, 'Rodič'); person(a, -2.95, 0.06, 0.74, C.yellow, C.honey, 'Žák');
        } },
        { fold: 'box', on: 'class', span: [2.4, 4.65], depth: 1.25, strap: 0.6, height: 2.75, art(a) {
          a.box(C.navy, 2.4, -0.1, 2.25, 0.16, 0.05);
          person(a, 3.2, 0.06, 1.0, C.leaf, C.amber, 'Učitel'); a.line(C.navy, 0.07, (c) => { c.moveTo(3.7, 0.95); c.lineTo(4.45, 2.2); }); a.disc(C.coral, 4.47, 2.25, 0.1);
        } },
        { fold: 'v', z: 0.25, alpha: 58, size: [4.2, 2.5], art(a) { a.box('#fdf6e4', -1.9, -0.1, 3.8, 2.1, 0.35); for (const y of [0.55, 1.0, 1.45]) a.line('#e2d9bf', 0.03, (c) => { c.moveTo(-1.6, y); c.lineTo(1.6, y); }); } },
        { fold: 'v', z: 0.3, alpha: 58, size: [3.6, 2.3], slide: (t) => -2.3 * (1 - pulled(t)), art(a) {
          a.box(C.navy, -1.5, -0.1, 3.0, 0.18);
          [[-1.2, 0.45, C.coral], [-0.4, 0.8, C.yellow], [0.4, 1.15, C.leaf], [1.2, 1.5, C.honey]].forEach(([x, h, col]) => a.box(col, x - 0.3, 0, 0.6, h, 0.07));
          star(a, 1.2, 1.88, 0.3);
        } },
        { id: 'chart', fold: 'v', z: 0.35, alpha: 58, size: [4.2, 2.85], art(a) {
          a.line(C.cream, 0.2, (c) => c.roundRect(-1.9, 0.02, 3.8, 2.0, 0.35)); a.line('#b5d5cf', 0.045, (c) => c.roundRect(-1.9, 0.02, 3.8, 2.0, 0.35));
          a.box(C.navy, -1.5, 1.92, 3.0, 0.62, 0.14); a.box(C.coral, -1.44, 1.98, 2.88, 0.5, 0.1); fit(a, 'Body a úrovně', 0, 2.1, 0.34, 2.6, C.cream);
        } },
        { fold: 'float', on: 'chart', side: 1, at: [1.35, 2.3], gap: 0.3, sway: 1, area: [0.8, 2.1, 3.1, 3.6], art(a) { arm(a, [1.35, 2.3, 1.9, 2.35, 1.95, 2.6]); a.disc(C.coral, 1.95, 2.95, 0.42); a.disc(C.yellow, 1.95, 2.95, 0.32); ico(a, ICON.cap, 1.95, 2.95, 0.46, C.navy, 2); } },
      ],
    },
    { // ------------------------------------------------------------ 5. the motto and the four stages
      words: ['Objevuj svět,', 'kde učení baví.'], em: 0.46,
      floor(a) {
        frame(a, '#f9dc8a');
        clipPage(a, () => { for (let k = 0; k < 24; k++) { const q = k * Math.PI / 12; a.path(k % 2 ? '#fbe6a6' : '#f6d273', (c) => { c.moveTo(0, -3.2); c.lineTo(9 * Math.cos(q), -3.2 + 9 * Math.sin(q)); c.lineTo(9 * Math.cos(q + Math.PI / 12), -3.2 + 9 * Math.sin(q + Math.PI / 12)); }); } });
      },
      parts: [
        { id: 'world', fold: 'v', z: -1.0, alpha: 76, size: [9.6, 3.2], art(a) {
          a.box(C.sky, -4.8, -0.1, 9.6, 3.2, 0.1);
          a.disc(C.yellow, 0, 1.55, 1.25); a.disc('#f9d46c', 0, 1.55, 0.85);
          a.disc(C.cream, -3.4, 2.5, 0.5, 0.26); a.disc(C.cream, -2.95, 2.58, 0.4, 0.3); a.disc(C.cream, 3.3, 2.35, 0.55, 0.28); a.disc(C.cream, 3.85, 2.45, 0.38, 0.26);
          a.path(C.sage, (c) => { c.moveTo(-4.8, -0.1); c.lineTo(-4.8, 1.0); c.lineTo(-3.3, 2.0); c.lineTo(-2.2, 1.2); c.lineTo(-1.2, 1.7); c.lineTo(0.3, 0.9); c.lineTo(1.6, 1.8); c.lineTo(3.0, 1.0); c.lineTo(4.0, 1.5); c.lineTo(4.8, 0.9); c.lineTo(4.8, -0.1); });
          a.path(C.leaf, (c) => { c.moveTo(-4.8, -0.1); c.lineTo(-4.8, 0.45); c.lineTo(-3.6, 0.75); c.lineTo(-2.3, 0.4); c.lineTo(-0.8, 0.8); c.lineTo(0.8, 0.45); c.lineTo(2.6, 0.8); c.lineTo(4.0, 0.4); c.lineTo(4.8, 0.55); c.lineTo(4.8, -0.1); });
          a.box(C.navy, -2.55, 2.38, 5.1, 0.84, 0.16); a.box(C.cream, -2.47, 2.46, 4.94, 0.68, 0.11); fit(a, 'Učíme se hrou', 0, 2.62, 0.52, 4.6, C.coral);
        } },
        { fold: 'box', on: 'world', span: [-4.6, -2.4], depth: 1.35, strap: 0.7, height: 2.3, art(a) { globe(a, -3.5); } },
        { fold: 'box', on: 'world', span: [2.5, 4.6], depth: 1.2, strap: 0.7, height: 2.3, art(a) {
          a.box(C.navy, 2.95, -0.1, 1.2, 0.16, 0.06); a.line(C.navy, 0.1, (c) => { c.moveTo(3.2, 0.0); c.lineTo(3.55, 0.5); c.lineTo(3.9, 0.0); });
          a.disc(C.navy, 3.55, 1.4, 0.88); a.disc(C.cream, 3.55, 1.4, 0.75);
          for (let k = 0; k < 12; k++) { const q = k * Math.PI / 6; a.line(C.navy, k % 3 ? 0.03 : 0.06, (c) => { c.moveTo(3.55 + 0.6 * Math.cos(q), 1.4 + 0.6 * Math.sin(q)); c.lineTo(3.55 + 0.72 * Math.cos(q), 1.4 + 0.72 * Math.sin(q)); }); }
          const c = a.ctx; c.save(); c.translate(3.55, 1.4); c.rotate(0.6); a.path(C.coral, (p) => { p.moveTo(-0.14, 0); p.lineTo(0, 0.55); p.lineTo(0.14, 0); }); a.path(C.navy, (p) => { p.moveTo(-0.14, 0); p.lineTo(0, -0.55); p.lineTo(0.14, 0); }); a.disc(C.yellow, 0, 0, 0.07); c.restore();
        } },
        { id: 'stages', fold: 'v', z: 0.35, alpha: 58, size: [4.8, 2.8], art(a) {
          a.box(C.navy, -2.4, -0.1, 4.8, 2.8, 0.2); a.box(C.cream, -2.32, -0.02, 4.64, 2.64, 0.14);
          [['ZŠ', C.yellow, ICON.zs, -1.2, 2.3, 1.62], ['SŠ', C.leaf, ICON.ss, 1.2, 2.3, 1.62], ['Přijímačky', C.coral, ICON.test, -1.2, 1.15, 0.45], ['Maturita', C.navy, ICON.cap, 1.2, 1.15, 0.45]].forEach(([label, col, d, x, y, ly]) => {
            a.disc(col, x, y, 0.38); a.disc(C.cream, x, y, 0.3); ico(a, d, x, y, 0.5, C.navy, 2); fit(a, label, x, ly, 0.38, 2.0, C.navy);
          });
        } },
        { fold: 'float', on: 'stages', side: -1, at: [-1.9, 2.8], gap: 0.3, sway: 1, area: [-3.7, 2.6, -1.3, 3.8], art(a) {
          arm(a, [-1.9, 2.8, -1.95, 3.15, -2.35, 3.15]);
          const c = a.ctx; c.save(); c.translate(-2.75, 3.2); c.scale(1.15, 1.15); a.path(C.cream, (p) => { p.moveTo(-0.65, 0.2); p.lineTo(0.8, 0.52); p.lineTo(0.0, -0.18); }); a.path(C.teal, (p) => { p.moveTo(0.0, -0.18); p.lineTo(0.8, 0.52); p.lineTo(0.1, -0.5); }); c.restore();
        } },
      ],
    },
  ];

  // How far a leaf has turned at time t: 0 = lying on the right, PI = lying on the left.
  const flip = (t, t0) => { const u = (t - t0) / TURN; if (u <= 0) return 0; if (u < 1) return Math.PI * u * u * (2.2 - 1.2 * u); const v = t - t0 - TURN; return Math.PI - 0.034 * Math.abs(Math.sin(v * 11)) * Math.exp(-v * 6); };
  const landed = (s) => TURNS[s] + TURN;

  registerStyle({
    id: 'paper-pop-up',
    name: 'Paper Pop-Up',
    family: 'Material worlds',
    topic: 'Učíme se hrou: jak web pomáhá žákům se učit',
    duration: DURATION,
    fonts: ['700 100px "Fraunces"'],
    render: { samples: 56, shutter: 0.5, tone: 'neutral', exposure: 0.9, saturation: 1.1, bloom: 0.12, bloomThreshold: 1.1, vignette: 0.42, grain: 0.014, fov: 26, background: '#050403' },

    build(S) {
      const { THREE, K, scene, camera } = S;
      S.renderer.localClippingEnabled = true;
      const add = (a, b, s = 1) => [a[0] + b[0] * s, a[1] + b[1] * s, a[2] + b[2] * s], mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
      const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
      const unit = (a) => mul(a, 1 / Math.hypot(a[0], a[1], a[2])), rad = (d) => d * Math.PI / 180;

      // ------------------------------------------------------------ 1. paper
      const CARD_T = 0.03, LEAF_T = 0.045, PX = 150;
      const fibre = K.canvasTex(1024, 1024, (ctx, w, h) => {
        const n = K.noise(3), r = K.rng(8), im = ctx.createImageData(w, h);
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const v = 128 + 70 * n.fbm(x * 0.006, y * 0.006, 0, 2) + 34 * n.fbm(x * 0.05, y * 0.05, 3, 3) + 14 * (K.hash(x, y) - 0.5); im.data.set([v, v, v, 255], (y * w + x) * 4); }
        ctx.putImageData(im, 0, 0); ctx.lineCap = 'round';
        for (let i = 0; i < 5200; i++) { const x = r.range(0, w), y = r.range(0, h), q = r.range(0, 6.3), len = r.range(8, 34); ctx.strokeStyle = `rgba(255,255,255,${r.range(0.05, 0.3)})`; ctx.lineWidth = r.range(0.8, 1.8); ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + Math.cos(q + 0.6) * len * 0.5, y + Math.sin(q + 0.6) * len * 0.5, x + Math.cos(q) * len, y + Math.sin(q) * len); ctx.stroke(); }
      }, { data: true });
      fibre.wrapS = fibre.wrapT = THREE.RepeatWrapping;
      const bumpFor = (w, h) => { const b = fibre.clone(); b.repeat.set(w / 3.2, h / 3.2); b.needsUpdate = true; return b; };
      const speck = document.createElement('canvas'); speck.width = speck.height = 256;
      { const x = speck.getContext('2d'), im = x.createImageData(256, 256), r = K.rng(2); for (let i = 0; i < 65536; i++) { const v = 255 - 30 * Math.pow(r(), 3) - (r.chance(0.012) ? 60 : 0); im.data.set([v, v, v * 0.985, 255], i * 4); } x.putImageData(im, 0, 0); }
      const grain = (ctx, w, h) => { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = ctx.createPattern(speck, 'repeat'); ctx.fillRect(0, 0, w, h); ctx.globalCompositeOperation = 'source-over'; };
      const paper = (map, w, h) => new THREE.MeshStandardMaterial({ map, bumpMap: bumpFor(w, h), bumpScale: 0.45, roughness: 0.93, metalness: 0 });
      const core = new THREE.MeshStandardMaterial({ color: '#fbf5e6', roughness: 0.95 });

      const pen = (ctx, back) => {
        const a = {
          ctx, back,
          path(col, fn) { ctx.fillStyle = col; ctx.beginPath(); fn(ctx); ctx.fill(); return a; },
          disc(col, x, y, rx, ry = rx, rot = 0) { return a.path(col, (c) => c.ellipse(x, y, rx, ry, rot, 0, 7)); },
          box(col, x, y, w, h, r = 0) { return a.path(col, (c) => c.roundRect(x, y, w, h, r)); },
          line(col, w, fn, dash) { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = ctx.lineJoin = 'round'; ctx.setLineDash(dash || []); ctx.beginPath(); fn(ctx); ctx.stroke(); ctx.setLineDash([]); return a; },
          ridge(col, x0, x1, top, y0 = -0.1) { return a.path(col, (c) => { c.moveTo(x0, y0); for (let x = x0; x <= x1 + 1e-6; x += 0.1) c.lineTo(x, top(x)); c.lineTo(x1, y0); }); },
          clip(fn, inside) { ctx.save(); ctx.beginPath(); fn(ctx); ctx.clip(); inside(); ctx.restore(); return a; },
          text(str, x, y, size, col, align = 'center') { if (a.back) return a; ctx.save(); ctx.translate(x, y); ctx.scale(size / 100, -size / 100); ctx.font = '700 100px "Fraunces"'; ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = col; ctx.fillText(str, 0, 0); ctx.restore(); return a; },
        };
        return a;
      };
      const ruler = document.createElement('canvas').getContext('2d'); ruler.font = '700 100px "Fraunces"';
      const widthOf = (str, size) => ruler.measureText(str).width * size / 100;

      // ------------------------------------------------------------ 2. the die-cutter
      function trace(f, w, h, level, i0, i1) {
        const at = (i, j) => (i < i0 || i > i1 || j < 0 || j >= h ? 0 : f[j * w + i]), EW = w + 3;
        const id = (i, j, upright) => ((j + 1) * EW + i + 1) * 2 + upright, next = new Map(), where = new Map();
        const SEG = [[], [3, 2], [2, 1], [3, 1], [1, 0], [3, 2, 1, 0], [2, 0], [3, 0], [0, 3], [0, 2], [0, 3, 2, 1], [0, 1], [1, 3], [1, 2], [2, 3], []];
        for (let j = -1; j < h; j++) for (let i = Math.max(-1, i0 - 1); i <= Math.min(w - 1, i1); i++) {
          const a = at(i, j), b = at(i + 1, j), c = at(i + 1, j + 1), d = at(i, j + 1), seg = SEG[(a >= level ? 8 : 0) | (b >= level ? 4 : 0) | (c >= level ? 2 : 0) | (d >= level ? 1 : 0)];
          if (!seg.length) continue;
          const ids = [id(i, j, 0), id(i + 1, j, 1), id(i, j + 1, 0), id(i, j, 1)];
          const pts = [[i + (level - a) / (b - a), j], [i + 1, j + (level - b) / (c - b)], [i + (level - d) / (c - d), j + 1], [i, j + (level - a) / (d - a)]];
          for (let k = 0; k < seg.length; k += 2) { next.set(ids[seg[k]], ids[seg[k + 1]]); where.set(ids[seg[k]], pts[seg[k]]); where.set(ids[seg[k + 1]], pts[seg[k + 1]]); }
        }
        const loops = [];
        while (next.size) { const start = next.keys().next().value, loop = []; let k = start; do { loop.push(where.get(k)); const n = next.get(k); next.delete(k); k = n; } while (k !== start && k !== undefined); loops.push(loop); }
        return loops;
      }
      function simplify(pts, tol) {
        const n = pts.length; if (n < 8) return pts;
        let far = 0, fd = 0; for (let i = 1; i < n; i++) { const d = (pts[i][0] - pts[0][0]) ** 2 + (pts[i][1] - pts[0][1]) ** 2; if (d > fd) { fd = d; far = i; } }
        const keep = new Uint8Array(n + 1), P = (i) => pts[i % n], stack = [[0, far], [far, n]]; keep[0] = keep[far] = 1;
        while (stack.length) {
          const [i0, i1] = stack.pop(), a = P(i0), b = P(i1), dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1e-9; let m = -1, md = tol;
          for (let i = i0 + 1; i < i1; i++) { const p = P(i), d = Math.abs((p[0] - a[0]) * dy - (p[1] - a[1]) * dx) / len; if (d > md) { md = d; m = i; } }
          if (m > 0) { keep[m] = 1; stack.push([i0, m], [m, i1]); }
        }
        return pts.filter((_, i) => keep[i]);
      }
      const areaOf = (l) => { let s = 0; for (let i = 0; i < l.length; i++) { const p = l[i], q = l[(i + 1) % l.length]; s += p[0] * q[1] - q[0] * p[1]; } return s / 2; };
      const inside = (p, l) => { let c = false; for (let i = 0, j = l.length - 1; i < l.length; j = i++) if ((l[i][1] > p[1]) !== (l[j][1] > p[1]) && p[0] < (l[j][0] - l[i][0]) * (p[1] - l[i][1]) / (l[j][1] - l[i][1]) + l[i][0]) c = !c; return c; };

      const MARGIN = 0.045;
      function dieCut(x0, y0, w, h, draw) {
        const cw = Math.ceil(w * PX / 4) * 4, ch = Math.ceil(h * PX / 2) * 2, mw = cw / 2, mh = ch / 2; w = cw / PX; h = ch / PX;
        const art = document.createElement('canvas'); art.width = cw; art.height = ch;
        const ctx = art.getContext('2d'); ctx.setTransform(PX, 0, 0, -PX, -x0 * PX, (y0 + h) * PX); draw(pen(ctx));
        const soft = document.createElement('canvas'); soft.width = mw; soft.height = mh;
        const sx = soft.getContext('2d', { willReadFrequently: true }); sx.filter = `blur(${(MARGIN * PX / 2 / 0.84).toFixed(2)}px)`; sx.drawImage(art, 0, 0, mw, mh);
        const px = sx.getImageData(0, 0, mw, mh).data, f = new Float32Array(mw * mh); for (let i = 0; i < f.length; i++) f[i] = px[i * 4 + 3] / 255;
        const print = (back) => K.canvasTex(cw, ch, (c) => { c.fillStyle = C.card; c.fillRect(0, 0, cw, ch); if (back) { c.setTransform(PX, 0, 0, -PX, -x0 * PX, (y0 + h) * PX); draw(pen(c, true)); } else c.drawImage(art, 0, 0); grain(c, cw, ch); });
        const tex = print(false), rear = print(true);
        const mid = Math.round(-x0 * PX / 2);
        const outline = (side) => {
          const loops = trace(f, mw, mh, 0.2, side > 0 ? mid : 0, side < 0 ? mid - 1 : mw - 1)
            .map((l) => simplify(l.map(([i, j]) => { const x = x0 + (2 * i + 1) / PX; return [side && Math.abs(x) < 2.4 / PX ? 0 : x, y0 + h - (2 * j + 1) / PX]; }), 0.004))
            .filter((l) => l.length > 2 && Math.abs(areaOf(l)) > 0.004);
          const sign = Math.sign(areaOf(loops.reduce((a, b) => (Math.abs(areaOf(b)) > Math.abs(areaOf(a)) ? b : a), loops[0])));
          const solid = loops.filter((l) => Math.sign(areaOf(l)) === sign).map((l) => ({ l, shape: new THREE.Shape(l.map((p) => new THREE.Vector2(p[0], p[1]))) }));
          loops.filter((l) => Math.sign(areaOf(l)) !== sign).forEach((hole) => { const o = solid.find((s) => inside(hole[0], s.l)); if (o) o.shape.holes.push(new THREE.Path(hole.map((p) => new THREE.Vector2(p[0], p[1])))); });
          return solid.map((s) => s.shape);
        };
        return { tex, rear, outline, x0, y0, w, h };
      }
      let cards = 1;
      function card(cut, side, parent) {
        const g = new THREE.ExtrudeGeometry(cut.outline(side), { depth: CARD_T, bevelEnabled: false }); g.translate(0, 0, -CARD_T / 2);
        const p = g.attributes.position, uv = g.attributes.uv, nm = g.attributes.normal, r = K.rng(cards++), bx = r.range(-0.05, 0.05), by = r.range(0.03, 0.08) * r.sign();
        for (let i = 0; i < p.count; i++) {
          const x = p.getX(i), y = p.getY(i), z = nm.getZ(i); uv.setXY(i, (x - cut.x0) / cut.w, (y - cut.y0) / cut.h);
          if (Math.abs(z) > 0.9) { const k = 1 / Math.hypot(1, bx * x, by * (y - 1)); nm.setXYZ(i, -bx * x * k * z, -by * (y - 1) * k * z, z * k); }
        }
        const all = g.groups.slice(); g.clearGroups();
        all.forEach((q) => { if (q.materialIndex) g.addGroup(q.start, q.count, 1); else { g.addGroup(q.start, q.count / 2, 2); g.addGroup(q.start + q.count / 2, q.count / 2, 0); } });
        const m = new THREE.Mesh(g, [paper(cut.tex, cut.w, cut.h), core, paper(cut.rear, cut.w, cut.h)]); m.castShadow = m.receiveShadow = true; m.matrixAutoUpdate = false; m.frustumCulled = false; parent.add(m);
        return m;
      }
      const seat = (m, X, Y, O) => { const Z = cross(X, Y); m.matrix.set(X[0], Y[0], Z[0], O[0], X[1], Y[1], Z[1], O[1], X[2], Y[2], Z[2], O[2], 0, 0, 0, 1); m.matrixWorldNeedsUpdate = true; };

      // ------------------------------------------------------------ 3. the fold mechanisms
      function hinge(aL, aR) {
        const psi = (Math.PI - aL + aR) / 2, a = Math.min((aL + aR) / 2, Math.PI / 2 - 0.004), s = Math.sin(a), c = Math.cos(a);
        const b = [Math.cos(psi), Math.sin(psi), 0], x = [Math.sin(psi), -Math.cos(psi), 0];
        return { a, b, dL: add(mul(x, -c), b, s), dR: add(mul(x, c), b, s), nL: add(mul(x, s), b, c), nR: add(mul(x, -s), b, c) };
      }
      function solveV(h, alpha, beta, point) {
        const sa = Math.sin(alpha), ca = Math.cos(alpha), A = sa * Math.sin(h.a), g = Math.atan2(A, ca) + Math.acos(K.clamp(Math.cos(beta) / Math.hypot(A, ca), -1, 1));
        const c = [h.b[0] * Math.sin(g), h.b[1] * Math.sin(g), point * Math.cos(g)], out = (d) => { const gl = [d[0] * sa, d[1] * sa, point * ca]; return unit(add(gl, c, -dot(gl, c))); };
        return { c, uL: out(h.dL), uR: out(h.dR) };
      }
      const MAKE = {
        v(o, byId, group) {
          const cut = dieCut(-o.size[0] / 2, -0.1, o.size[0], o.size[1] + 0.25, o.art), L = card(cut, -1, group), R = card(cut, 1, group);
          const slit = o.slide ? [new THREE.Plane(), new THREE.Plane()] : null;
          if (slit) [L, R].forEach((m, i) => m.material.forEach((mt, k) => { if (k) m.material[k] = mt = mt.clone(); mt.clippingPlanes = [slit[i]]; mt.clipShadows = true; }));
          const part = { o, meshes: [L, R], pose(h, t) {
            const v = solveV(h, rad(o.alpha), rad(o.beta || 90), o.point === 'back' ? 1 : -1), up = o.slide ? o.slide(t) : 0, O = [v.c[0] * up, v.c[1] * up, o.z + v.c[2] * up];
            part.wing = { '-1': { X: mul(v.uL, -1), Y: v.c, O, n: h.nL }, 1: { X: v.uR, Y: v.c, O, n: h.nR } };
            seat(L, part.wing[-1].X, v.c, O); seat(R, v.uR, v.c, O);
            if (slit) { slit[0].normal.set(...h.nL); slit[1].normal.set(...h.nR); slit[0].constant = slit[1].constant = -LEAF_T / 2; }
          } };
          return part;
        },
        box(o, byId, group) {
          const side = o.span[0] < 0 ? -1 : 1, cut = dieCut(o.span[0], -0.1, o.span[1] - o.span[0], o.height + 0.25, o.art), front = card(cut, 0, group);
          const g = new THREE.BoxGeometry(0.5, o.depth, CARD_T); g.translate((o.span[0] + o.span[1]) / 2, o.depth / 2, 0);
          const strap = new THREE.Mesh(g, core); strap.castShadow = strap.receiveShadow = true; strap.matrixAutoUpdate = false; group.add(strap);
          return { o, meshes: [front, strap], pose() {
            const w = byId[o.on].wing[side], out = cross(w.X, w.n), O = add(w.O, out, o.depth);
            seat(front, w.X, w.Y, O); seat(strap, w.X, mul(out, -1), add(O, w.Y, o.strap));
          } };
        },
        float(o, byId, group, s) {
          const [x0, y0, x1, y1] = o.area, cut = dieCut(x0, y0, x1 - x0, y1 - y0, o.art), m = card(cut, 0, group);
          return { o, meshes: [m], pose(h, t) {
            const w = byId[o.on].wing[o.side], lift = o.gap * Math.max(0, dot(w.Y, w.n)) + CARD_T * K.clamp((Math.PI / 2 - h.a) * 8), dt = t - landed(s);
            const q = dt > 0 ? 0.085 * (o.sway || 0) * Math.sin(dt * 21) * Math.exp(-dt * 2.4) : 0, X = add(mul(w.X, Math.cos(q)), w.Y, Math.sin(q)), Y = add(mul(w.Y, Math.cos(q)), w.X, -Math.sin(q));
            let O = add(add(w.O, w.X, o.at[0]), w.Y, o.at[1]); O = add(add(O, X, -o.at[0]), Y, -o.at[1]);
            seat(m, X, Y, add(O, cross(w.X, w.Y), lift));
          } };
        },
      };
      const ribbon = ([left, right], em) => {
        const gap = 0.2, H = 1.0, xl = -(gap + widthOf(left, em) + 0.3), xr = gap + widthOf(right, em) + 0.3, tail = 0.42;
        S.ribbonWidths = (S.ribbonWidths || []).concat([[left + ' ' + right, +(2 * (Math.max(-xl, xr) + tail)).toFixed(2)]]);
        return { fold: 'v', z: 2.17, alpha: 78, size: [2 * (Math.max(-xl, xr) + tail) + 0.1, H], art(a) {
          a.path(C.cream, (c) => { c.moveTo(xl - tail, -0.1); c.lineTo(xl - tail + 0.26, H / 2 - 0.05); c.lineTo(xl - tail, H); c.lineTo(xr + tail, H); c.lineTo(xr + tail - 0.26, H / 2 - 0.05); c.lineTo(xr + tail, -0.1); });
          a.box(C.coral, xl - tail + 0.32, H - 0.15, xr - xl + 2 * tail - 0.64, 0.055); a.box(C.coral, xl - tail + 0.32, 0.06, xr - xl + 2 * tail - 0.64, 0.055);
          a.text(left, -gap, 0.27, em, C.navy, 'right'); a.text(right, gap, 0.27, em, C.navy, 'left');
        } };
      };
      const spreads = SPREADS.map((sp, s) => {
        const group = new THREE.Group(), byId = {}; scene.add(group);
        const parts = [...sp.parts, ribbon(sp.words, sp.em || 0.76)].map((o) => { const p = MAKE[o.fold](o, byId, group, s); if (o.id) byId[o.id] = p; return p; });
        return { group, parts };
      });
      const corner = new THREE.Vector3();
      spreads.forEach((sp, s) => {
        const h = hinge(0, Math.PI - 0.02); sp.parts.forEach((p) => p.pose(h, 99));
        sp.parts.forEach((p, i) => { let over = 0; p.meshes.forEach((m) => { const q = m.geometry.attributes.position; for (let k = 0; k < q.count; k += 3) { corner.fromBufferAttribute(q, k).applyMatrix4(m.matrix); over = Math.max(over, -corner.x - PAGE_W, Math.abs(corner.z) - PAGE_D / 2); } }); if (over > 0.02 && !p.o.slide) console.error(`pop-up: piece ${i} of spread ${s + 1} (${p.o.id || p.o.fold}) sticks ${over.toFixed(2)} out of the closed book`); });
      });

      // ------------------------------------------------------------ 4. the book
      const FPX = 128, book = new THREE.Group(); scene.add(book);
      const printed = (side, draw) => K.canvasTex(Math.round(PAGE_W * FPX), Math.round(PAGE_D * FPX), (ctx, w, h) => {
        ctx.fillStyle = C.card; ctx.fillRect(0, 0, w, h); ctx.setTransform(FPX, 0, 0, -FPX, side < 0 ? PAGE_W * FPX : 0, PAGE_D / 2 * FPX); draw(pen(ctx));
        ctx.setTransform(1, 0, 0, 1, 0, 0); const g = ctx.createLinearGradient(side < 0 ? w : 0, 0, side < 0 ? w - 60 : 60, 0); g.addColorStop(0, 'rgba(70,50,30,0.3)'); g.addColorStop(1, 'rgba(70,50,30,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
        grain(ctx, w, h);
      });
      // inside cover: an exercise-book pattern of small squares and pencils
      const endpaper = (a) => { a.box(C.teal, -5.7, -3.3, 11.4, 6.6); for (let i = -12; i <= 12; i++) for (let j = -7; j <= 7; j++) { const x = i * 0.7, y = j * 0.7; a.box((i + j) & 1 ? '#a9d3e1' : '#9fcbdb', x - 0.3, y - 0.3, 0.6, 0.6, 0.08); } };
      const face = (side, draw, back) => { const t = printed(side, draw); if (back) { t.center.set(0.5, 0.5); t.rotation = Math.PI; } return paper(t, PAGE_W, PAGE_D); };
      const leaves = TURNS.map((_, j) => {
        const g = new THREE.BoxGeometry(PAGE_W, LEAF_T, PAGE_D); g.translate(PAGE_W / 2, 0, 0);
        const m = new THREE.Mesh(g, [core, core, face(1, j ? SPREADS[j - 1].floor : endpaper), face(-1, SPREADS[j].floor, true), core, core]);
        m.castShadow = m.receiveShadow = true; book.add(m); return m;
      });
      const BLOCK_H = 0.3, TABLE_Y = -BLOCK_H - 0.06;
      const edges = new THREE.MeshStandardMaterial({ roughness: 0.95, map: K.canvasTex(32, 256, (ctx, w, h) => { ctx.fillStyle = '#f4ecda'; ctx.fillRect(0, 0, w, h); for (let k = 0; k < 7; k++) { ctx.fillStyle = k % 2 ? 'rgba(120,96,60,0.5)' : 'rgba(150,126,90,0.35)'; ctx.fillRect(0, (k + 0.5) * h / 7, w, 2.5); } }) });
      const block = (side, top) => { const g = new THREE.BoxGeometry(PAGE_W, BLOCK_H, PAGE_D); g.translate(side * PAGE_W / 2, -BLOCK_H / 2, 0); const m = new THREE.Mesh(g, [edges, edges, top, edges, edges, edges]); m.castShadow = m.receiveShadow = true; book.add(m); return m; };
      const blockL = block(-1, face(-1, endpaper)), blockR = block(1, face(1, SPREADS[SPREADS.length - 1].floor));
      const cloth = new THREE.MeshStandardMaterial({ color: '#1f4a4b', roughness: 0.82, bumpScale: 2.5, bumpMap: K.canvasTex(256, 256, (ctx) => { ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, 256, 256); for (let i = 0; i < 256; i += 4) { ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(i, 0, 2, 256); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(0, i, 256, 2); } }, { data: true, repeat: [14, 9] }) });
      for (const side of [-1, 1]) { const b = new THREE.Mesh(K.roundedBox(PAGE_W + 0.22, 0.07, PAGE_D + 0.44, 0.025, 3), cloth); b.position.set(side * (PAGE_W / 2 + 0.17), TABLE_Y + 0.035, 0); b.castShadow = b.receiveShadow = true; book.add(b); }
      const spine = new THREE.Mesh(K.roundedBox(0.5, 0.05, PAGE_D + 0.44, 0.02, 2), cloth); spine.position.set(0, TABLE_Y + 0.025, 0); spine.receiveShadow = true; book.add(spine);
      // the pull tab rides on the right page of spread 4, which is the front of leaf 4; it turns away with that leaf
      const TAB = { x: [1.4, 3.1], z: 2.62 }, grip = dieCut(-0.6, -0.32, 1.2, 0.64, (a) => { a.box(C.coral, -0.52, -0.25, 1.04, 0.5, 0.16); for (const x of [-0.24, 0.06]) a.line(C.cream, 0.09, (c) => { c.moveTo(x, 0.12); c.lineTo(x + 0.16, 0); c.lineTo(x, -0.12); }); });
      const tab = card(grip, 0, leaves[4]); tab.rotation.x = -Math.PI / 2; tab.matrixAutoUpdate = true;

      // ------------------------------------------------------------ 5. the table and the lamp
      const wood = K.canvasTex(1024, 1024, (ctx, w, h) => {
        const n = K.noise(12), r = K.rng(6), im = ctx.createImageData(w, h);
        for (let y = 0; y < h; y++) { const plank = Math.floor(y / 128), tone = 0.82 + 0.3 * K.hash(plank, 3); for (let x = 0; x < w; x++) { const v = K.clamp(0.5 + 1.25 * n.fbm(x * 0.0016 + plank * 9, y * 0.035, plank, 4) + 0.12 * n.n2(x * 0.02, y * 0.7)) * tone; im.data.set([40 + 78 * v, 23 + 46 * v, 12 + 24 * v, 255], (y * w + x) * 4); } }
        ctx.putImageData(im, 0, 0);
        for (let i = 0; i < 2200; i++) { ctx.fillStyle = `rgba(12,6,2,${r.range(0.1, 0.4)})`; ctx.fillRect(r.range(0, w), r.range(0, h), r.range(6, 40), 1); }
        for (let p = 0; p < 8; p++) { ctx.fillStyle = 'rgba(8,4,2,0.75)'; ctx.fillRect(0, p * 128, w, 2); }
      }, { repeat: [5, 5] });
      const table = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ map: wood, bumpMap: wood, bumpScale: 1.2, roughness: 0.58 }));
      table.rotation.x = -Math.PI / 2; table.position.y = TABLE_Y; table.receiveShadow = true; scene.add(table);
      const bits = K.rng(31), inks = [C.coral, C.yellow, C.leaf, C.cream, C.pink];
      [[-7.2, 2.6], [-6.7, 3.6], [6.9, 3.1], [7.5, 1.6], [6.6, -3.6], [-7.0, -2.9], [-3.2, 4.4], [2.2, 4.3], [-6.5, -4.6], [4.2, -4.7]].forEach(([x, z], i) => {
        const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(bits.range(0.5, 1.3), bits.range(-0.1, 0.2)); sh.lineTo(bits.range(0.2, 0.9), bits.range(0.35, 0.8)); if (i % 2) sh.lineTo(bits.range(-0.2, 0.1), bits.range(0.4, 0.7));
        const m = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: CARD_T, bevelEnabled: false }), [new THREE.MeshStandardMaterial({ color: inks[i % inks.length], roughness: 0.93 }), core]);
        m.rotation.set(-Math.PI / 2, 0, bits.range(0, 6.3)); m.position.set(x, TABLE_Y + 0.002, z); m.castShadow = m.receiveShadow = true; scene.add(m);
      });
      const glaze = new THREE.MeshStandardMaterial({ color: '#1d3a44', roughness: 0.3 }), mug = new THREE.Group(); mug.position.set(-6.9, TABLE_Y, -6.2); scene.add(mug);
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.85, 2.0, 40), glaze); cup.position.y = 1.0; const ear = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.13, 12, 32), glaze); ear.position.set(1.05, 1.0, 0.3); ear.rotation.y = -0.3; mug.add(cup, ear); mug.traverse((m) => { m.castShadow = m.receiveShadow = true; });
      const pencil = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 5.2, 6), new THREE.MeshStandardMaterial({ color: '#d99a1e', roughness: 0.45 })); pencil.rotation.set(Math.PI / 2, 0, 1.25); pencil.position.set(6.6, TABLE_Y + 0.1, -5.4); pencil.castShadow = pencil.receiveShadow = true; scene.add(pencil);

      K.env(S, { top: '#2a2119', horizon: '#3d3024', bottom: '#6b5740', intensity: 1.0, panels: [{ pos: [9, 11, 7], size: [7, 7], color: '#ffd9a6', power: 3 }, { pos: [-12, 6, -9], size: [6, 8], color: '#8fa8ff', power: 1.1 }] });
      K.spot(S, { pos: [4.5, 9.5, 11], target: [-0.2, 0.8, 0], color: '#ffe9d0', power: 1250, angle: 0.62, penumbra: 0.85, soft: 1.3, mapSize: 4096 });
      K.spot(S, { pos: [-8, 5.5, -10], target: [0, 1, 0], color: '#c2d0ff', power: 150, angle: 0.5, penumbra: 1, shadow: false });
      K.skyLight(S, { color: '#ffe8d2', power: 1.1, size: 9, center: [0, 0, 0] });

      // ------------------------------------------------------------ 6. camera: one slow drift across the five spreads, breathing out at each page turn, a gentle push at the end
      const camKeys = [[0, [-1.6, 6.0, 11.5]]];
      TURNS.slice(1).forEach((t0) => { const x = K.lerp(-1.6, 0.8, t0 / 22.5); camKeys.push([t0, [x - 0.05, 5.9, 11.3]], [t0 + 0.65, [x + 0.1, 6.4, 12.0]], [t0 + 1.5, [x + 0.35, 6.0, 11.4]]); });
      camKeys.push([DURATION, [1.15, 5.6, 11.05]]);
      const cam = { pos: K.path(camKeys), aim: K.path([[0, [-0.2, 1.35, 0.3]], [22.5, [0.2, 1.35, 0.35]], [DURATION, [0.2, 1.3, 0.4]]]) };

      const riseOf = (j, t) => K.seg(t, TURNS[j], TURNS[j] + TURN * 0.5, K.ease.inOut), sinkOf = (j, t) => K.seg(t, TURNS[j] + TURN * 0.6, TURNS[j] + TURN, K.ease.inOut);
      return {
        update(t) {
          const phi = TURNS.map((t0) => flip(t, t0));
          let onRight = 0, onLeft = 0;
          leaves.forEach((m, j) => { let below = 0; for (let i = 0; i < j; i++) below += 1 - riseOf(i, t); for (let i = j + 1; i < leaves.length; i++) below += sinkOf(i, t); m.rotation.z = phi[j]; m.position.y = -LEAF_T * below; onRight += 1 - riseOf(j, t); onLeft += sinkOf(j, t); });
          blockR.position.y = LEAF_T / 2 - LEAF_T * onRight; blockL.position.y = LEAF_T / 2 - LEAF_T * onLeft;
          tab.position.set(K.lerp(TAB.x[0], TAB.x[1], pulled(t)), LEAF_T / 2 + CARD_T / 2 + 0.004, TAB.z);
          spreads.forEach((sp, s) => {
            const aL = Math.PI - phi[s], aR = s + 1 < phi.length ? phi[s + 1] : 0;
            sp.group.visible = aL + aR < Math.PI - 0.02;
            if (sp.group.visible) { const h = hinge(aL, aR); sp.parts.forEach((p) => p.pose(h, t)); }
          });
          const p = cam.pos(t), a = cam.aim(t);
          K.look(camera, p, a); K.focus(camera, [0, 1.0, 1.0], 0.11);
        },
      };
    },

    // every sound hangs on the same schedule as the picture: the page turns, lands, the pieces rise, the labels land
    sound(k) {
      k.bed('room', 0, DURATION, { gain: 1.0 });
      k.music('pad', 0, DURATION, { bpm: 80, chords: [['F3', 'A3', 'C4', 'E4'], ['D3', 'F3', 'A3', 'C4'], ['Bb2', 'D3', 'F3', 'A3'], ['C3', 'E3', 'G3', 'B3']], gain: 0.5 });
      const dings = ['C5', 'E5', 'G5', 'A5', 'C6'];
      TURNS.forEach((t0, s) => {
        const hit = landed(s);
        if (t0 > 0) { k.play('paper', t0 + 0.02, { gain: 1.5, dur: 0.5, pan: 0.4 }); k.play('whoosh', t0 + 0.3, { gain: 0.6, dur: 0.8, top: 1500 }); k.play('paper', t0 + 0.5, { gain: 1.0, dur: 0.7 }); }
        k.withMinor(() => { for (let i = 0; i < 7; i++) if (hit - 0.62 + i * 0.085 > 0) k.play('tick', hit - 0.62 + i * 0.085, { gain: 0.45 + 0.06 * i, f: 1900 + i * 260, pan: -0.3 + i * 0.1 }); });
        k.play('slap', hit, { gain: 0.6, pan: -0.3 }); k.play('thud', hit, { gain: 0.55, f: 105, pan: -0.3 }); k.play('paper', hit + 0.04, { gain: 0.45, dur: 0.22 });
        k.play('ding', hit + 0.14, { gain: 0.34, f: dings[s] });
        k.withMinor(() => { for (let i = 0; i < 4; i++) k.play('tick', hit + 0.19 + i * 0.3, { gain: 0.16 - 0.03 * i, f: 5200, pan: 0.2 }); });
      });
      // spread 4: the pull tab slides out and the chart fills
      k.play('tape', PULL[0], { gain: 1.3, dur: PULL[1] - PULL[0], pan: 0.4 }); k.play('paper', PULL[0], { gain: 0.8, dur: 0.8, pan: 0.4 });
      k.tone(PULL[0] + 0.1, { f: [[0, 'F3'], [PULL[1] - PULL[0] - 0.1, 'F4']], type: 'triangle', dur: PULL[1] - PULL[0], gain: 0.1, a: 0.25, filter: 'lowpass', f2: 900 });
      k.play('tock', PULL[1], { gain: 0.6, f: 500, pan: 0.4 }); k.play('success', PULL[1] + 0.12, { gain: 0.6, f: 'C6' });
      // the motto page lands and the four stages sparkle
      k.play('sparkle', landed(4) + 0.05, { gain: 0.8, n: 8 });
    },
  });
})();
