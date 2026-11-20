const { beat, hook, question, ctaShot, build, H, kit } = window; const { tx, fx, E, clamp, lerp, rc, ci, el, pg, ln } = kit;
const q = question({ env: 'kitchen', cam: [[1, 270, 480], [1.16, 300, 460]], q: ['WHY IS TREK', 'WEARING YOUR', 'PYJAMAS?'], short: 'WHY ARE THEY YOUR PYJAMAS?',
  cast: { zed: { k: [[0, { x: 140, mood: 'happy' }], [.6, { mood: 'shock', lean: -10 }, 'back']] }, kit: { k: [[0, { x: 270, mood: 'laugh' }], [.6, { mood: 'shock' }]] }, trk: { p: 'trk', k: [[0, { x: 430, fl: 'L', mood: 'calm' }], [.5, { mood: 'sly' }]] } },
  over: (u, el) => u > .3 ? `<g opacity="${clamp((u - .3) * 3)}">${rc(400, 540, 60, 30, '#9b7bd6', 3, 6)}${ln(410, 540, 450, 570, 4, '#cdb9f2')}</g>` : '' });
build([
  hook({ env: 'mountain', banner: 'KIT IS STUCK!', focus: [400, 430], z0: 2.2, word: 'HELP!', wordAt: [270, 300],
    cast: { kit: { k: [[0, { x: 400, fl: 'L', mood: 'worried', aL: 140, aR: 140 }]] }, zed: { k: [[0, { x: 140, mood: 'shock' }]] } } }),
  beat({ env: 'mountain', cam: [[1, 270, 480], [1.15, 300, 450]],
    cast: { zed: { k: [[0, { x: 130, mood: 'worried' }], [.6, { mood: 'focus', lean: 6 }]] }, kit: { k: [[0, { x: 410, fl: 'L', mood: 'worried' }]] } },
    over: (u, el) => `<g opacity="${clamp(u * 2)}">${ci(250 + Math.sin(el * 3) * 6, 540, 30, 'rgba(120,200,255,.6)', 4)}${ci(300, 560, 26, 'rgba(120,200,255,.6)', 4)}</g>` + tx('1 JUMP LEFT', 270, 240, 46, { fill: '#ffd23f' }) }),
  beat({ env: u => u < .4 ? 'mountain' : 'kitchen', cam: [[1, 270, 480], [1.1, 270, 470]],
    cast: { zed: { k: [[0, { x: 200, mood: 'worried', aR: 120, bR: 10 }], [.38, { mood: 'focus' }], [.42, { x: 230, a: 1, sy: .85, sx: 1.15, mood: 'dizzy' }], [.6, { sy: 1, sx: 1, mood: 'happy' }, 'back']] }, kit: { k: [[0, { x: 330, fl: 'L', mood: 'worried', aL: 120 }], [.42, { x: 340, mood: 'shock' }], [.6, { mood: 'laugh' }]] } },
    hits: [{ u: .4, word: 'JUMP!', at: [270, 330], flash: true, k: 'portal', sh: 9, burst: [270, 450] }] }),
  beat({ env: 'kitchen', cam: [[1, 270, 480], [1.14, 270, 460]],
    cast: { zed: { k: [[0, { x: 180, mood: 'laugh', lean: 6 }]] }, kit: { k: [[0, { x: 370, fl: 'L', mood: 'laugh' }]] } }, over: (u, el) => H.motes(el, 20, '#ffd23f') }),
  q, ctaShot(q, { pill: true, next: 0, last: true }),
]);
