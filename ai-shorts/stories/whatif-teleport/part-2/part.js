const { beat, hook, question, ctaShot, build, H, kit } = window; const { tx, fx, E, clamp, lerp, rc, ci, el, pg, ln } = kit;
const q = question({ env: 'bedroom', envO: { night: 1 }, cam: [[1, 270, 480], [1.14, 270, 460]], q: ['WHAT DID YOUR', 'LAST JUMP', 'TAKE?'], short: 'WHAT DID THE LAST JUMP TAKE?',
  cast: { zed: { k: [[0, { x: 270, mood: 'blank' }], [.5, { mood: 'worried', look: 1 }], [.75, { mood: 'shock', lean: -8 }, 'back'], [1, { mood: 'sad' }]] } }, over: (u, el) => u > .5 ? tx('?', 270, 360, 80, { fill: '#ffd23f', sc: E.back(clamp((u - .5) / .15)) }) : '' });
build([
  hook({ env: 'bedroom', banner: 'EVERY JUMP COSTS', focus: [270, 440], z0: 2.3, word: 'GONE', wordAt: [270, 300],
    cast: { zed: { k: [[0, { x: 270, mood: 'worried' }], [.4, { mood: 'shock' }], [1, { mood: 'worried' }]] } } }),
  beat({ env: 'field', cam: [[1, 270, 480], [1.2, 270, 560]],
    cast: { zed: { k: [[0, { x: 270, mood: 'worried', lgL: 2 }], [.3, { mood: 'shock', sy: 1.1 }, 'back'], [.6, { mood: 'sad' }], [1, { mood: 'worried' }]] } },
    over: (u, el) => (u < .3 ? el_sock(200, 640 - u * 0) : '') + tx(u < .33 ? 'SOCK' : u < .66 ? 'SLIPPER' : 'SHADOW', 270, 260, 52, { fill: '#ff4d6d' }), hits: [{ u: .02, k: 'pop', burst: [270, 600] }, { u: .35, k: 'pop', burst: [270, 600] }, { u: .68, k: 'zap', burst: [270, 640], flash: true }] }),
  beat({ env: 'kitchen', cam: [[1, 270, 480], [1.15, 300, 450]],
    cast: { zed: { k: [[0, { x: 160, mood: 'calm' }], [.3, { mood: 'worried', aR: 60 }], [.7, { mood: 'shock', lean: -10 }, 'back']] }, kit: { k: [[0, { x: 400, fl: 'L', mood: 'sad' }], [.6, { mood: 'worried' }]] } },
    over: (u, el) => u > .25 ? H.bubble(160, 330, 240, '...UM... YOU?', '#fff') : '' }),
  beat({ env: 'kitchen', cam: [[1, 270, 480], [1.2, 330, 440]],
    cast: { kit: { k: [[0, { x: 380, fl: 'L', mood: 'sad', aR: 120, bR: 40, hold: 'phone' }], [.6, { mood: 'angry' }]] }, zed: { k: [[0, { x: 160, mood: 'sad', tilt: 6 }]] } },
    over: (u, el) => H.bubble(380, 330, 200, "IT'S KIT.", '#fff3a0') }),
  q, ctaShot(q, { pill: true, next: 3 }),
]);
function el_sock(x, y) { return `<g transform="translate(${x} ${y})">${kit.pg('M-8,-20 L8,-20 L8,0 L22,6 L20,14 L-8,12 Z', '#fff', 4)}</g>`; }
