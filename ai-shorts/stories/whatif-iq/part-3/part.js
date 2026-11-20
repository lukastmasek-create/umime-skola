const { beat, hook, question, ctaShot, build, H, kit } = window; const { tx, fx, E, clamp, lerp, rc, ci, el } = kit;
const rock = (x, y, r, t) => `<g transform="translate(${x} ${y}) rotate(${t * 30})">${kit.pg('M-30,-10 L-14,-30 L14,-26 L32,-4 L20,24 L-12,28 L-32,12 Z', '#8d6e63', 5)}${ci(-8, -4, 6, '#6d4c41')}${ci(12, 8, 4, '#6d4c41')}</g>`;
const q = question({ env: 'lab', cam: [[1, 270, 480], [1.12, 300, 470]], q: ['CAN ONE FRIEND', 'CONVINCE THE', 'WHOLE WORLD?'], short: 'WHO CAN CONVINCE THE WORLD?',
  cast: { nova: { k: [[0, { x: 170, mood: 'sad' }], [.5, { mood: 'worried', look: 1 }], [1, { mood: 'sad', tilt: -6 }]] }, rue: { k: [[0, { x: 400, fl: 'L', mood: 'calm' }], [1, { mood: 'whisper' }]] } },
  over: (u, el) => H.motes(el, 16, '#7cf7ff') });
build([
  hook({ env: 'lab', banner: 'SAVE THE WORLD?', focus: [400, 430], z0: 2.2, word: 'GULP', wordAt: [270, 300],
    cast: { rue: { k: [[0, { x: 400, fl: 'L', mood: 'calm', aR: 90, bR: 20 }], [.5, { aR: 90 }], [1, { mood: 'smug' }]] }, nova: { k: [[0, { x: 150, mood: 'shock' }], [1, { mood: 'worried' }]] } } }),
  beat({ env: 'lab', cam: [[1, 270, 480], [1.15, 300, 450]],
    cast: { nova: { k: [[0, { x: 170, mood: 'focus', hold: 'pen', aR: 70, bR: 80 }], [.45, { aR: 100, bR: 40 }], [.5, { aR: 70, bR: 80 }], [.6, { aR: 130, bR: 10, mood: 'smug', lean: 8 }, 'back'], [1, { aR: 20, mood: 'smug' }]] }, rue: { k: [[0, { x: 400, fl: 'L', mood: 'calm' }], [.6, { mood: 'shock', lean: -8 }, 'back']] } },
    hits: [{ u: .6, word: 'SOLVED!', at: [270, 330], burst: [250, 440], flash: true, sh: 7 }],
    over: (u, el) => rock(lerp(470, 120, u), lerp(150, 250, u) , 30, el) + (u < .6 ? H.eqs(el, 10, 270, 350, 220) : '') }),
  beat({ env: 'lab', cam: [[1.1, 400, 460], [1.3, 400, 440]],
    cast: { rue: { k: [[0, { x: 400, fl: 'L', mood: 'shock' }], [.5, { mood: 'worried', tilt: -6 }], [1, { mood: 'worried' }]] }, nova: { k: [[0, { x: 160, mood: 'smug' }], [.5, { mood: 'focus' }], [1, { mood: 'worried' }]] } },
    over: (u, el) => u > .3 ? tx('ONE CATCH', 270, 250, 56, { fill: '#ff4d6d', sc: E.back(clamp((u - .3) / .12)) }) : '', hits: [{ u: .3, burst: [270, 250], sh: 4 }] }),
  beat({ env: 'lab', cam: [[1, 270, 480], [1.12, 270, 450]],
    cast: { nova: { k: [[0, { x: 170, mood: 'worried' }], [.4, { mood: 'dizzy', tilt: 8 }], [1, { mood: 'sad' }]] }, rue: { k: [[0, { x: 400, fl: 'L', mood: 'calm' }]] } },
    over: (u, el) => { let s = ''; for (let i = 0; i < 14; i++) { const k = clamp(u * 1.6 - i * .05); s += ci(120 + (i % 7) * 50, 200 + Math.floor(i / 7) * 70, 20 * E.back(k), i % 2 ? '#ff4d6d' : '#4cc9f0', 4); } return s + tx('BILLIONS SAY: ?', 270, 120, 40, { fill: '#fff' }); } }),
  q, ctaShot(q, { pill: true, next: 4 }),
]);
