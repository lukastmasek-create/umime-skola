const { beat, hook, question, ctaShot, build, H, kit } = window; const { tx, fx, E, clamp, lerp, rc, ci, el, pg, ln } = kit;
const ticket = (x, y, r) => `<g transform="translate(${x} ${y}) rotate(${r})">${rc(-50, -26, 100, 52, '#ffd23f', 5, 6)}${tx('1 WAY', 0, 10, 28, { fill: '#e63946' })}</g>`;
const q = question({ env: 'airport', cam: [[1, 270, 480], [1.14, 300, 460]], q: ['WHAT IF THE NEXT', 'JUMP HAS NO WAY', 'BACK?'], short: 'WHAT IF THERE IS NO WAY BACK?',
  cast: { zed: { k: [[0, { x: 160, mood: 'worried', hold: '' }], [.6, { mood: 'shock' }]] }, trk: { k: [[0, { x: 410, fl: 'L', mood: 'calm', hold: 'tablet', aR: 55, bR: 70 }]] } }, over: (u, el) => ticket(270, 340 + Math.sin(el * 3) * 6, -6) });
build([
  hook({ env: 'airport', banner: 'THE LANDING OFFICE', focus: [410, 440], z0: 2.2, word: 'TREK', wordAt: [270, 300],
    cast: { trk: { k: [[0, { x: 410, fl: 'L', mood: 'calm', hold: 'tablet', aR: 55, bR: 70 }], [.5, { mood: 'smug' }]] }, zed: { k: [[0, { x: 150, mood: 'shock' }]] } } }),
  beat({ env: 'airport', cam: [[1, 270, 480], [1.14, 300, 460]],
    cast: { trk: { k: [[0, { x: 410, fl: 'L', mood: 'focus', hold: 'book', aR: 80, bR: 50 }], [.5, { aR: 100 }, 'back']] }, zed: { k: [[0, { x: 160, mood: 'worried' }], [.6, { mood: 'shock', look: 1 }]] } },
    over: (u, el) => tx('YOUR NAME', 270, 250, 44, { fill: '#fff', op: clamp(u * 3) }) + tx('EVERY SOCK', 270, 310, 36, { fill: '#ffd23f', op: clamp((u - .4) * 3) }), hits: [{ u: .5, k: 'pop', burst: [300, 400] }] }),
  beat({ env: 'desert', cam: [[1, 270, 480], [1.16, 300, 450]],
    cast: { trk: { k: [[0, { x: 410, fl: 'L', mood: 'worried', hold: 'tablet', aR: 55, bR: 70 }]] }, zed: { k: [[0, { x: 160, mood: 'worried' }], [.7, { mood: 'shock', lean: -8 }, 'back']] } },
    over: (u, el) => { let s = ''; for (let i = 0; i < 5; i++) s += `<path d="M${60 + i * 90},650 q14,-30 28,0" stroke="rgba(120,60,200,.${3 + i % 3})" stroke-width="8" fill="none"/>`; return s + (u > .5 ? `<g opacity="${clamp((u - .5) * 3)}">${ci(470 + Math.sin(el * 4) * 4, 330, 24, '#7209b7', 4)}${ci(462, 324, 5, '#fff')}${ci(480, 324, 5, '#fff')}</g>` : ''); }, hits: [{ u: .5, word: '???', at: [470, 280], k: 'zap', sh: 5 }] }),
  beat({ env: 'airport', cam: [[1, 270, 480], [1.2, 270, 450]],
    cast: { trk: { k: [[0, { x: 410, fl: 'L', mood: 'calm', aR: 90, bR: 20 }]] }, zed: { k: [[0, { x: 150, mood: 'worried', aR: 90, bR: 20 }], [.6, { mood: 'shock', lean: -8 }, 'back']] } },
    over: (u, el) => ticket(lerp(410, 280, E.out(clamp(u * 2))), lerp(420, 380, E.out(clamp(u * 2))), lerp(10, -8, u)) }),
  q, ctaShot(q, { pill: true, next: 4 }),
]);
