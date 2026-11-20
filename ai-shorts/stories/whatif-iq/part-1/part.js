const { beat, hook, question, ctaShot, build, H, kit } = window; const { tx, fx, E, seg, clamp, lerp } = kit;
const q = question({ env: 'street', envO: { tod: 'dusk', cars: 0 }, cam: [[1, 270, 480], [1.12, 330, 470]],
  q: ['WHO IS WATCHING YOU', 'AND WRITING DOWN', 'EVERY ANSWER?'], short: 'WHO IS WRITING IT ALL DOWN?',
  cast: {
    nova: { k: [[0, { x: 150, mood: 'calm', hold: 'pen' }], [.35, { mood: 'worried', look: 1, lean: -6 }], [.7, { mood: 'shock', look: 1, aR: 20, tilt: -6 }, 'back'], [1, { mood: 'worried', look: 1 }]] },
    rue: { p: 'rue', k: [[0, { x: 410, fl: 'L', hold: 'tablet', aR: 55, bR: 70, mood: 'calm' }], [.5, { aR: 40 }], [1, { mood: 'smug' }]] } },
  over: (u, el) => H.car(440, 650, '#14141c', 1.5) });
build([
  hook({ env: 'bedroom', banner: '1000 IQ. TODAY.', word: 'WHOA!', wordAt: [270, 300], focus: [270, 440], z0: 2.3,
    cast: { nova: { k: [[0, { x: 270, mood: 'shock' }], [.4, { mood: 'awe', aR: 150, bR: 10 }, 'back'], [1, { mood: 'smug', aR: 30 }]] } },
    over: (u, el) => H.eqs(el, 12, 270, 380, 230) }),
  beat({ env: 'kitchen', cam: [[1, 250, 480], [1.15, 330, 470]],
    cast: { nova: { k: [[0, { x: 160, mood: 'focus', hold: 'book', aR: 60, bR: 80 }], [.3, { x: 160, tilt: -6 }], [.45, { x: 290, lean: -10, hold: 'pen', aR: 30 }, 'out'], [.55, { x: 310, lean: 14, aR: 95, bR: 20, mood: 'sly', sx: 1.05, sy: .94 }, 'back'], [.75, { lean: 0, aR: 25, sx: 1, sy: 1, mood: 'smug' }]] } },
    hits: [{ u: .56, word: 'PING!', dust: [400, 560], burst: [400, 520], sh: 6 }],
    over: (u, el) => H.eqs(el, 8, 300, 360, 200) }),
  beat({ env: 'classroom', cam: [[1, 250, 480], [1.1, 300, 470]],
    cast: { nova: { k: [[0, { x: 200, mood: 'focus', hold: 'pen', aR: 70, bR: 90 }], [.3, { aR: 60 }], [.38, { aR: 100, bR: 50 }], [.46, { aR: 60, bR: 90 }], [.5, { lean: -10 }], [.6, { x: 270, lean: 12, aR: 110, bR: 0, hold: '', mood: 'smug' }, 'back'], [.85, { lean: 0, aR: 20 }]] },
      mo: { k: [[0, { x: 400, fl: 'L', mood: 'calm' }], [.55, { mood: 'calm' }], [.62, { mood: 'shock', sy: 1.06, sx: .96, lean: -8 }, 'back'], [1, { mood: 'worried' }]] } },
    hits: [{ u: .6, word: 'SLAP!', dust: [270, 560], sh: 7 }],
    over: (u, el) => (u < .6 ? '' : kit.rc(250, 480, 40, 26, '#fff', 3)) }),
  beat({ env: 'street', cam: [[1, 270, 480], [1.15, 300, 450]],
    cast: { nova: { k: [[0, { x: 150, mood: 'smug', aR: 20 }], [.25, { aR: 160, bR: 0, mood: 'sly' }, 'back'], [.9, { aR: 160 }]] },
      mo: { k: [[0, { x: 360, fl: 'L', mood: 'calm' }], [.2, { mood: 'worried', look: -1, lookY: -1 }], [.7, { mood: 'worried' }], [.76, { mood: 'shock', sy: .92, sx: 1.06, tilt: 8 }, 'back'], [1, { mood: 'dizzy', tilt: 4 }]] } },
    hits: [{ u: .75, word: 'FLAP!', dust: [360, 400], burst: [360, 395], sh: 5 }],
    over: (u, el) => { const k = clamp((u - .3) / .45); const e = E.in(k); const y = lerp(-40, 392, e), x = lerp(520, 360, e); return u < .75 ? H.pigeon(x, y, el, 1) : H.pigeon(360, 392 + Math.sin(el * 6) * 2, el, .3); } }),
  q,
  ctaShot(q, { pill: true, next: 2 }),
]);
