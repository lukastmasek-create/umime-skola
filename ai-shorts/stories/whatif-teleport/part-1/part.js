const { beat, hook, question, ctaShot, build, H, kit } = window; const { tx, fx, E, clamp, lerp, rc, ci, el, pg, ln } = kit;
const clip = (x, y) => `<g transform="translate(${x} ${y})">${rc(-10, -14, 20, 28, '#8b5e3c', 3, 2)}${rc(-7, -10, 14, 20, '#fff')}</g>`;
const q = question({ env: 'mountain', cam: [[1, 270, 480], [1.12, 300, 470]], q: ['WHY IS A MAN WITH', 'A CLIPBOARD AT', 'EVERY LANDING?'], short: 'WHO IS THE CLIPBOARD MAN?',
  cast: { zed: { k: [[0, { x: 150, mood: 'happy', run: 0 }], [.5, { mood: 'worried', look: 1 }], [.7, { mood: 'shock', lean: -8 }, 'back']] }, trk: { k: [[0, { x: 420, fl: 'L', mood: 'calm', hold: 'tablet', aR: 55, bR: 70 }], [1, { mood: 'smug' }]] } }, over: (u, el) => H.motes(el, 20, '#fff') });
build([
  hook({ env: 'bedroom', banner: 'YOU CAN TELEPORT', focus: [270, 440], z0: 2.3, word: 'POOF!', wordAt: [270, 300],
    cast: { zed: { k: [[0, { x: 270, mood: 'shock' }], [.4, { mood: 'awe' }], [1, { mood: 'happy' }]] } } }),
  beat({ env: u => u < .35 ? 'bedroom' : 'kitchen', cam: [[1, 270, 480], [1.1, 270, 470]],
    cast: { zed: { k: [[0, { x: 150, mood: 'calm', tilt: -8 }], [.2, { mood: 'worried', tilt: 10, lean: -12 }], [.28, { mood: 'shock', lean: 14, tilt: -10 }, 'back'], [.34, { x: 150, a: 0 }], [.36, { x: 330, a: 1, sy: 1.2, sx: .85 }], [.5, { sy: .8, sx: 1.2, mood: 'dizzy' }, 'back'], [.7, { sy: 1, sx: 1, mood: 'worried' }]] }, kit: { k: [[0, { x: 420, a: 0 }], [.34, { a: 1, x: 430, fl: 'L', mood: 'calm', hold: 'cup', aR: 60, bR: 80 }], [.5, { mood: 'shock', lean: -10, sy: 1.06 }, 'back']] } },
    hits: [{ u: .27, word: 'ACHOO!', at: [270, 330], k: 'pop', sh: 5 }, { u: .36, word: 'POOF!', dust: [330, 650], burst: [330, 520], flash: true, sh: 8, k: 'portal' }],
    over: (u, el) => u > .3 && u < .44 ? H.portal(330, 520, 90 * (1 - Math.abs(u - .37) / .1), el) : '' }),
  beat({ env: u => u < .3 ? 'street' : 'classroom', envO: { tod: 'day' }, cam: [[1, 270, 480], [1.12, 280, 470]],
    cast: { zed: { k: [[0, { x: 150, run: 2, mood: 'worried' }], [.28, { x: 260, run: 2 }], [.3, { a: 0 }], [.34, { a: 1, x: 250, y: 380, sy: 1.1 }], [.48, { y: 640, sy: .85, sx: 1.12 }, 'in'], [.62, { sy: 1, sx: 1, run: 0, mood: 'worried' }, 'back'], [1, { mood: 'sad' }]] }, kit: { k: [[0, { x: 400, a: 0 }]] } },
    hits: [{ u: .34, word: 'POOF!', dust: [250, 650], burst: [250, 420], flash: true, sh: 7, k: 'portal' }, { u: .5, word: 'THUD!', dust: [250, 650], sh: 8 }],
    over: (u, el) => u > .6 ? H.bubble(400, 340, 300, 'PYJAMAS?!', '#fff') : '' }),
  beat({ env: u => ['beach', 'mountain', 'desert'][Math.min(2, Math.floor(u * 3))], cam: [[1, 270, 480], [1, 270, 480]],
    cast: { zed: { k: [[0, { x: 270, mood: 'happy', aL: 140, aR: 140 }], [.32, { mood: 'laugh' }], [.34, { mood: 'shock', aL: 110, aR: 110 }], [.66, { mood: 'happy', aL: 140 }], [.68, { mood: 'sad', lean: 8 }], [1, { mood: 'sad', lean: 12, tilt: 12 }]] } },
    hits: [{ u: .005, burst: [270, 450], k: 'portal' }, { u: .34, burst: [270, 450], flash: true, k: 'portal' }, { u: .67, burst: [270, 450], flash: true, k: 'portal', word: 'ZZZ', at: [270, 330] }] }),
  q, ctaShot(q, { pill: true, next: 2 }),
]);
