const { beat, hook, question, ctaShot, build, H, kit } = window; const { tx, fx, E, clamp, lerp, rc, ci, el, pg, ln } = kit;
const q = question({ env: 'park', sat: .3, cam: [[1, 270, 480], [1.14, 270, 460]], q: ['HOW MANY DAYS', 'HAVE YOU SPENT', 'ALONE?'], short: 'HOW MANY DAYS WERE ALONE?',
  cast: { ash: { k: [[0, { x: 270, mood: 'sad', age: .5, tilt: 6 }], [.6, { mood: 'worried', age: .5 }]] } }, over: (u, el) => H.clock(130, 250, 50, el * 8, 4) });
build([
  hook({ env: 'classroom', banner: 'ONLY FOR YOU...', focus: [270, 440], z0: 2.3, word: 'TICK', wordAt: [270, 300],
    cast: { ash: { k: [[0, { x: 270, mood: 'blank' }], [.5, { mood: 'worried', age: .3 }]] } }, over: (u, el) => H.clock(100, 300, 40, el * 20, 20) }),
  beat({ env: 'classroom', sat: .35, cam: [[1, 270, 480], [1.16, 250, 450]],
    cast: { ash: { k: [[0, { x: 200, mood: 'focus', hold: 'pen', aR: 70, bR: 90, lean: 8 }], [.3, { aR: 100, bR: 40 }], [.4, { aR: 70, bR: 90 }], [.5, { aR: 100, bR: 40 }], [.6, { aR: 70, bR: 90 }], [1, { mood: 'sad', age: .2 }]] }, bea: { k: [[0, { x: 400, fl: 'L', mood: 'calm', rot: 0 }]] } },
    over: (u, el) => tx(`${Math.floor(u * 6)}h ${Math.floor((u * 360) % 60)}m`, 270, 220, 52, { fill: '#7cf7ff' }) + H.clock(480, 70, 30, el * 25, 25) }),
  beat({ env: 'bedroom', envO: { night: 1 }, cam: [[1.3, 270, 440], [1.7, 270, 430]],
    cast: { ash: { k: [[0, { x: 270, mood: 'calm', age: .1 }], [.5, { mood: 'shock', age: .55, tilt: 6 }, 'back'], [1, { mood: 'worried', age: .6 }]] } },
    over: (u, el) => u > .45 ? fx.sparkle(240, 360, 24, 1, '#fff') + fx.sparkle(300, 380, 14, 1, '#fff') : '', hits: [{ u: .45, word: 'GREY!', at: [270, 290], k: 'chime', wc: '#ddd' }] }),
  beat({ env: 'park', cam: [[1, 270, 480], [1.16, 300, 460]],
    cast: { bea: { k: [[0, { x: 250, mood: 'happy', aL: 100, aR: 100 }], [.5, { mood: 'worried' }]] }, ash: { k: [[0, { x: 330, fl: 'L', mood: 'laugh', age: .5 }], [.6, { mood: 'sad' }]] } },
    over: (u, el) => u > .4 ? H.bubble(250, 330, 260, 'YOU LOOK TIRED', '#fff') : '' }),
  q, ctaShot(q, { pill: true, next: 3 }),
]);
