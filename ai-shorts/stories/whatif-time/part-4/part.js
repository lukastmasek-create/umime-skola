const { beat, hook, question, ctaShot, build, H, kit } = window; const { tx, fx, E, clamp, lerp, rc, ci, el, pg, ln } = kit;
const watch = (x, y) => `<g transform="translate(${x} ${y})">${rc(-12, -50, 24, 100, '#222', 4, 8)}${ci(0, 0, 36, '#ffd23f', 5)}${ci(0, 0, 28, '#fff', 3)}${ln(0, 0, 0, -22, 4)}${ln(0, 0, 14, 0, 4, '#e63946')}</g>`;
const q = question({ env: 'park', cam: [[1, 270, 480], [1.2, 270, 440]], q: ['WHY IS THE SECOND', 'HAND NOT', 'MOVING?'], short: 'WHY IS THE WATCH NOT TICKING?',
  cast: { ash: { k: [[0, { x: 170, mood: 'happy', hold: '' }], [.5, { mood: 'calm' }], [.75, { mood: 'shock', lean: -8 }, 'back']] }, bea: { k: [[0, { x: 380, fl: 'L', mood: 'happy', aR: 90, bR: 30 }], [.8, { mood: 'sly' }]] } }, over: (u, el) => watch(270, 330 + Math.sin(el * 2) * 5) });
build([
  hook({ env: 'vault', banner: 'NO GOLD. JUST THIS.', focus: [270, 440], z0: 2.2, word: '12:00', wordAt: [270, 300],
    cast: { ash: { k: [[0, { x: 270, mood: 'awe' }]] } }, over: (u, el) => H.clock(270, 300, 50, 0, 0) }),
  beat({ env: 'vault', sat: .2, cam: [[1, 270, 480], [1.14, 300, 450]],
    cast: { vex: { k: [[0, { x: 410, fl: 'L', mood: 'whisper', age: .7, aR: 90 }]] }, ash: { k: [[0, { x: 150, mood: 'awe' }], [.6, { mood: 'worried' }]] } },
    over: (u, el) => H.clock(270, 320, 40, 0, 0) + `<ellipse cx="270" cy="320" rx="${70 + Math.sin(el * 4) * 6}" ry="${70 + Math.sin(el * 4) * 6}" fill="rgba(255,220,120,.25)"/>` }),
  beat({ env: 'vault', sat: u => u > .6 ? .1 + (u - .6) * 2.2 : .2, cam: [[1, 270, 480], [1.2, 270, 440]],
    cast: { ash: { k: [[0, { x: 270, mood: 'sad', aR: 90, bR: 40 }], [.5, { mood: 'focus', aR: 120 }], [.6, { mood: 'focus', aR: 100, lean: 8 }, 'back'], [1, { mood: 'happy' }]] } },
    hits: [{ u: .6, word: 'PLAY!', at: [270, 300], flash: true, k: 'chime', sh: 9, burst: [270, 430] }], over: (u, el) => H.clock(270, 280, 36, u * 40, u > .6 ? 30 : 0) }),
  beat({ env: 'street', envO: { tod: 'day' }, cam: [[1, 270, 480], [1.14, 300, 460]],
    cast: { ash: { k: [[0, { x: 170, mood: 'happy' }]] }, bea: { k: [[0, { x: 380, fl: 'L', mood: 'happy', hold: 'bag', aR: 80, bR: 30 }]] }, vex: { k: [[0, { x: 480, fl: 'L', mood: 'sly', age: .7, a: 1 }], [.7, { a: 0 }, 'lin']] } }, over: (u, el) => H.motes(el, 12, '#fff') }),
  q, ctaShot(q, { pill: true, next: 0, last: true }),
]);
