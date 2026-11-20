const { beat, hook, question, ctaShot, build, H, kit } = window; const { tx, fx, E, clamp, lerp, rc, ci, el, pg, ln } = kit;
const freeze = (u) => u > .15 && u < .8;
const q = question({ env: 'street', envO: { tod: 'dusk', ct: 3 }, sat: .25, cam: [[1, 270, 480], [1.14, 330, 470]], q: ['WHO IS STILL MOVING', 'IN A FROZEN', 'WORLD?'], short: 'WHO IS STILL MOVING?',
  cast: { ash: { k: [[0, { x: 150, mood: 'smug' }], [.5, { mood: 'worried', look: 1 }], [.7, { mood: 'shock', lean: -8 }, 'back']] }, vex: { k: [[0, { x: 430, fl: 'L', mood: 'calm' }], [.6, { mood: 'sly' }]] } }, haze: 0, over: (u, el) => H.drops(0, 30, 1, '#bcd') });
build([
  hook({ env: 'cafe', banner: 'YOU CAN STOP TIME', focus: [270, 440], z0: 2.3, word: 'FREEZE!', wordAt: [270, 300],
    cast: { ash: { k: [[0, { x: 270, mood: 'shock', aR: 100, bR: 20, hold: '' }], [.5, { mood: 'smug' }]] } }, over: (u, el) => H.ring(270, 440, clamp((u - .3) * 1.5), '#fff') }),
  beat({ env: 'cafe', sat: u => u > .3 && u < .75 ? .15 : 1, cam: [[1, 270, 480], [1.14, 300, 450]],
    cast: { ash: { k: [[0, { x: 150, mood: 'calm' }], [.28, { x: 150, aR: 100, mood: 'shock' }], [.34, { x: 280, aR: 110, bR: 20, lean: 10, mood: 'sly' }, 'back'], [.75, { x: 280 }], [.82, { x: 200, aR: 30, lean: 0, mood: 'smug' }]] }, bea: { k: [[0, { x: 400, fl: 'L', mood: 'laugh' }], [.2, { mood: 'shock', lean: -10 }], [.78, { mood: 'shock' }], [.9, { mood: 'calm', lean: 0 }]] } },
    hits: [{ u: .3, word: 'PAUSE', at: [270, 300], flash: true, k: 'freeze', sh: 4 }, { u: .78, word: 'PLAY', at: [270, 300], k: 'chime', wc: '#fff' }],
    over: (u, el) => { const y = u < .2 ? lerp(520, 540, u / .2) : u < .78 ? 560 + 10 : 640; const x = u < .3 ? lerp(380, 330, u / .3) : u < .78 ? 320 : 290; const r = u < .3 ? u * 3 : 0; return `<g transform="translate(${x} ${u < .3 ? lerp(520, 600, E.in(u / .3)) : u < .78 ? 600 : 560}) rotate(${u < .3 ? r * 60 : 10})">${rc(-12, -16, 24, 30, '#fff', 4, 4)}${pg('M-8,-16 q8,-10 16,0', '#6f4e37', 3)}</g>`; } }),
  beat({ env: 'street', envO: { tod: 'day', ct: 2 }, sat: .3, cam: [[1, 270, 480], [1.1, 300, 470]],
    cast: { ash: { k: [[0, { x: 100, run: 2, mood: 'sly' }], [.5, { x: 330, run: 2 }], [.6, { run: 0, aR: 100, mood: 'smug', lean: 8 }, 'back'], [1, { aR: 30, lean: 0 }]] } },
    over: (u, el) => H.drops(0, 36, 1, '#bcd') + [0, 1].map(i => `<g transform="translate(${150 + i * 260} ${lerp(0, 1, 0) + 560 - clamp((u - .15 - i * .25) * 3) * 0})">${clamp((u - .1 - i * .3) * 4) > 0 ? pg('M-16,0 L0,-46 L16,0 Z', '#ff7a1a', 4) + rc(-20, -2, 40, 8, '#ff7a1a', 4) : ''}</g>`).join(''),
    hits: [{ u: .25, k: 'pop', burst: [150, 520] }, { u: .6, k: 'pop', burst: [410, 520] }] }),
  beat({ env: 'park', envO: {}, cam: [[1, 270, 480], [1.14, 270, 450]],
    cast: { ash: { k: [[0, { x: 200, mood: 'sly', aR: 100 }], [.5, { mood: 'laugh', aR: 130 }, 'back'], [.8, { mood: 'shock', lean: -8 }, 'back']] }, bea: { k: [[0, { x: 400, fl: 'L', mood: 'calm' }], [.8, { mood: 'shock' }]] } },
    over: (u, el) => [0, 1, 2].map(i => H.pigeon(80 + i * 190, lerp(560, 420 - i * 40, u > .75 ? E.out(clamp((u - .75) * 3)) : 0), el, u > .75 ? 1 : .3) + (u < .75 ? pg(`M${80 + i * 190 + 6},${560 - 24} l12,-34 l12,34 z`, ['#e63946', '#2dc653', '#3a86ff'][i], 3) : '')).join(''),
    hits: [{ u: .75, word: 'CHAOS!', at: [270, 300], flash: true, sh: 8, k: 'boom' }] }),
  q, ctaShot(q, { pill: true, next: 2 }),
]);
