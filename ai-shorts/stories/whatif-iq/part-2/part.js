const { beat, hook, question, ctaShot, build, H, kit } = window; const { tx, fx, E, clamp, lerp, rc } = kit;
const door = (u) => rc(430, 400, 100, 250, '#6d4c41', 6, 6) + kit.ci(445, 530, 7, '#ffd23f', 3);
const q = question({ env: 'bedroom', envO: { night: 1 }, cam: [[1, 270, 480], [1.12, 330, 470]], q: ['WHO IS KNOCKING', 'ON YOUR DOOR', 'AT 3 A.M.?'], short: 'WHO IS AT THE DOOR?',
  cast: { nova: { k: [[0, { x: 200, mood: 'blank' }], [.35, { mood: 'worried', look: 1 }], [.6, { mood: 'shock', lean: -10, sy: 1.05 }, 'back'], [1, { mood: 'worried', look: 1 }]] } },
  hits: [{ u: .3, word: 'KNOCK', at: [420, 380], sh: 4, k: 'hit' }, { u: .5, word: 'KNOCK', at: [420, 380], sh: 4 }, { u: .7, word: 'KNOCK', at: [420, 380], sh: 6 }], over: (u, el) => door(u) });
build([
  hook({ env: 'bedroom', envO: { night: 1 }, banner: "CAN'T SWITCH IT OFF", focus: [270, 440], z0: 2.3, word: 'ZZZ?', wordAt: [270, 300],
    cast: { nova: { k: [[0, { x: 270, mood: 'blank' }], [.4, { mood: 'dizzy' }], [1, { mood: 'worried' }]] } }, over: (u, el) => H.eqs(el * 2, 14, 270, 380, 240) }),
  beat({ env: 'cafe', cam: [[1, 270, 480], [1.12, 270, 470]],
    cast: { nova: { k: [[0, { x: 170, mood: 'smug', aR: 70, bR: 80 }], [.3, { aR: 110, mood: 'sly' }, 'back'], [.5, { aR: 70 }], [.7, { aR: 120, mood: 'smug' }, 'back'], [1, { aR: 30, mood: 'worried' }]] },
      mo: { k: [[0, { x: 370, fl: 'L', mood: 'calm', tilt: 4 }], [.35, { mood: 'worried' }], [.65, { mood: 'sad', lean: 6 }], [.85, { fl: 'R', mood: 'sad', x: 410, run: 1, hide: 0 }, 'in'], [1, { x: 560, fl: 'R', run: 1 }, 'in']] } },
    hits: [{ u: .32, word: 'BLAH', at: [200, 320], wc: '#fff' }, { u: .7, word: 'BLAH', at: [200, 320], wc: '#fff' }] }),
  beat({ env: 'bedroom', envO: { night: 1 }, cam: [[1, 270, 480], [1.18, 250, 440]],
    cast: { nova: { k: [[0, { x: 220, mood: 'blank' }], [.3, { mood: 'dizzy', tilt: 8 }], [.7, { mood: 'worried', tilt: -8 }], [1, { mood: 'worried' }]] } },
    over: (u, el) => H.clock(130, 300, 40, el * 14, 30) + H.eqs(el * 3, 16, 270, 330, 230, '#ffb3c1') }),
  beat({ env: 'park', envO: {}, cam: [[1, 270, 480], [1.15, 270, 450]],
    cast: { nova: { k: [[0, { x: 170, mood: 'calm' }], [.5, { mood: 'worried' }], [.8, { mood: 'sad', tilt: 8 }]] },
      mo: { k: [[0, { x: 370, fl: 'L', mood: 'sad', look: -1, lookY: .6 }], [.5, { mood: 'worried' }]] } },
    over: (u, el) => u > .55 ? H.bubble(370, 340, 330, "YOU'RE SCARING ME") : '' , hits: [{ u: .6, word: 'THUMP', at: [370, 440], k: 'heart', sh: 3 }] }),
  q, ctaShot(q, { pill: true, next: 3 }),
]);
