const { beat, hook, question, ctaShot, build, H, kit } = window; const { tx, fx, E, clamp, lerp, rc, ci, el, pg, ln } = kit;
const q = question({ env: 'street', envO: { tod: 'dusk', cars: 0 }, cam: [[1, 270, 480], [1.12, 330, 470]], q: ['WHY IS ONE STRANGER', 'NOT AGING', 'EITHER?'], short: 'WHO IS THE AGELESS STRANGER?',
  cast: { sol: { k: [[0, { x: 150, mood: 'calm' }], [.5, { mood: 'worried', look: 1 }], [.7, { mood: 'shock', lean: -8 }, 'back']] }, echo: { k: [[0, { x: 440, fl: 'L', mood: 'calm' }], [1, { mood: 'sly' }]] } } });
build([
  hook({ env: 'rooftop', envO: { tod: 'dusk' }, banner: 'YOU CAN NEVER DIE', focus: [270, 440], z0: 2.3, word: 'UH-OH', wordAt: [270, 300],
    cast: { sol: { k: [[0, { x: 270, mood: 'shock' }], [.4, { mood: 'awe' }], [1, { mood: 'smug' }]] } } }),
  beat({ env: 'rooftop', envO: { tod: 'dusk' }, cam: [[1, 270, 480], [1.1, 270, 560]],
    cast: { sol: { k: [[0, { x: 270, y: 640, mood: 'worried', aL: 60, aR: 60 }], [.2, { y: 640, sy: .88, sx: 1.08 }], [.35, { y: 300, sy: 1.15, sx: .92, mood: 'shock', aL: 140, aR: 140 }, 'out'], [.55, { y: 1060, sy: 1.3, sx: .85 }, 'in'], [.62, { y: 640, sy: .8, sx: 1.18, aL: 30, aR: 30, mood: 'dizzy' }, 'lin'], [.8, { sy: 1, sx: 1, mood: 'smug', aL: 20, aR: 20 }, 'back']] } },
    hits: [{ u: .6, word: 'THUD!', dust: [270, 650], sh: 10, punch: .09 }] }),
  beat({ env: 'field', cam: [[1, 270, 480], [1.1, 300, 470]],
    cast: { sol: { k: [[0, { x: 150, mood: 'laugh', aL: 140, aR: 140 }], [.5, { mood: 'happy' }], [.7, { x: 150, mood: 'shock', lean: -10 }, 'back'], [1, { mood: 'laugh' }]] }, lyra: { k: [[0, { x: 380, fl: 'L', mood: 'shock', aL: 130, aR: 130 }], [.6, { mood: 'shock', sy: 1.06 }], [.8, { mood: 'laugh', lean: 6 }, 'back']] } },
    hits: [{ u: .7, word: 'HOT!', at: [150, 330], burst: [150, 410], wc: '#ff4d6d', sh: 6 }],
    over: (u, el) => u < .55 ? kit.fx.speed(el, 'rgba(255,255,255,.6)', 8, -1) : '' }),
  beat({ env: 'bedroom', cam: [[1, 270, 480], [1.12, 270, 460]],
    cast: { sol: { k: [[0, { x: 170, mood: 'calm' }], [1, { mood: 'sad' }]] }, lyra: { k: [[0, { x: 380, fl: 'L', mood: 'happy', age: 0 }], [1, { mood: 'happy', age: .75 }, 'lin']] } },
    over: (u, el) => H.cal(120, 230, 1 + Math.floor(u * 300) % 31) + tx(String(2000 + Math.floor(u * 45)), 120, 320, 38, { fill: '#ffd23f' }) }),
  q, ctaShot(q, { pill: true, next: 2 }),
]);
