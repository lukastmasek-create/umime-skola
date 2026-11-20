const { beat, hook, question, ctaShot, build, H, kit } = window; const { tx, fx, E, clamp, lerp, rc, ci, el } = kit;
const book = (x, y, r = 0) => `<g transform="translate(${x} ${y}) rotate(${r})">${rc(-30, -22, 60, 44, '#e63946', 5, 4)}${rc(-24, -17, 48, 34, '#fff')}${[0, 1, 2].map(i => kit.ln(-18, -8 + i * 9, 18, -8 + i * 9, 2.5, '#888')).join('')}</g>`;
const q = question({ env: 'bedroom', cam: [[1, 270, 480], [1.14, 250, 470]], q: ['WHY IS THE LAST PAGE', "IN MO'S", 'HANDWRITING?'], short: "WHY IS IT MO'S HANDWRITING?",
  cast: { nova: { k: [[0, { x: 270, mood: 'happy', hold: 'book', aR: 60, bR: 70 }], [.4, { mood: 'calm', tilt: -4 }], [.7, { mood: 'shock', sy: 1.05, lean: -6 }, 'back'], [1, { mood: 'worried' }]] } }, over: (u, el) => u > .6 ? H.motes(el, 14, '#ffd23f') : '' });
build([
  hook({ env: 'rooftop', envO: { tod: 'night' }, banner: 'MIDNIGHT. IQ DROPPING.', focus: [270, 440], z0: 2.3, word: '1000...', wordAt: [270, 300],
    cast: { nova: { k: [[0, { x: 270, mood: 'shock' }], [.5, { mood: 'worried', tilt: 6 }], [1, { mood: 'dizzy' }]] } },
    over: (u, el) => H.clock(100, 250, 44, el * 40, 20) }),
  beat({ env: 'rooftop', envO: { tod: 'night' }, cam: [[1, 270, 480], [1.18, 220, 450]],
    cast: { nova: { k: [[0, { x: 220, mood: 'focus', hold: 'pen', aR: 70, bR: 90, run: 2 }], [.2, { x: 280, run: 2 }], [.3, { run: 0, aR: 70, bR: 90, lean: 8 }], [.4, { aR: 100, bR: 40 }], [.5, { aR: 70, bR: 90 }], [.6, { aR: 100, bR: 40 }], [.7, { aR: 70, bR: 90 }], [1, { mood: 'worried', aR: 100 }]] } },
    over: (u, el) => H.eqs(el * 2, 10 - Math.floor(u * 6), 270, 330, 220) + tx(String(Math.max(100, Math.round(1000 - u * 900))), 270, 200, 64, { fill: '#ff4d6d' }) }),
  beat({ env: 'rooftop', envO: { tod: 'night' }, cam: [[1, 270, 480], [1.2, 270, 450]],
    cast: { nova: { k: [[0, { x: 150, mood: 'sad', hold: 'book', aR: 60, bR: 70 }], [.5, { x: 200, aR: 100, bR: 10 }, 'back'], [1, { mood: 'happy', aR: 100 }]] },
      mo: { k: [[0, { x: 640, fl: 'L', run: 2, mood: 'worried' }], [.4, { x: 400, run: 2 }, 'out'], [.45, { run: 0, mood: 'worried' }], [.7, { aR: 80, bR: 20, mood: 'happy', hold: 'book' }], [1, { mood: 'happy' }]] } },
    hits: [{ u: .5, word: 'SORRY', at: [270, 330], wc: '#fff', sh: 3 }] }),
  beat({ env: 'bedroom', cam: [[1, 270, 480], [1.1, 270, 470]],
    cast: { nova: { k: [[0, { x: 270, mood: 'blank' }], [.3, { mood: 'calm' }], [.5, { mood: 'happy', aR: 120, bR: 0 }, 'back'], [1, { mood: 'laugh', aR: 30 }]] } },
    over: (u, el) => H.bubble(370, 270, 250, 'ASTEROID: GONE', '#fff3a0') }),
  q, ctaShot(q, { pill: true, next: 0, last: true }),
]);
