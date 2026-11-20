const { beat, hook, question, ctaShot, build, H, kit } = window; const { tx, fx, E, clamp, lerp, rc, ci, el, pg, ln } = kit;
const q = question({ env: 'vault', cam: [[1, 270, 480], [1.14, 300, 470]], q: ['WHAT IS INSIDE', 'THAT IS WORTH', '30 YEARS ALONE?'], short: 'WHAT IS IN THE VAULT?',
  cast: { ash: { k: [[0, { x: 150, mood: 'worried' }], [.6, { mood: 'shock', look: 1 }, 'back']] }, vex: { k: [[0, { x: 410, fl: 'L', mood: 'sly', age: .7 }]] } } });
build([
  hook({ env: 'street', envO: { tod: 'night' }, banner: '30 YEARS FROZEN', focus: [410, 440], z0: 2.2, word: 'VEX', wordAt: [270, 300],
    cast: { vex: { k: [[0, { x: 410, fl: 'L', mood: 'sly', age: .7 }]] }, ash: { k: [[0, { x: 150, mood: 'shock' }]] } } }),
  beat({ env: 'street', envO: { tod: 'night', ct: 4 }, sat: u => u > .3 ? .2 : 1, cam: [[1, 270, 480], [1.16, 330, 460]],
    cast: { vex: { k: [[0, { x: 410, fl: 'L', mood: 'calm', age: .7, aR: 110, bR: 20 }], [.3, { aR: 140, mood: 'sly' }, 'back']] }, ash: { k: [[0, { x: 150, mood: 'worried' }], [.4, { mood: 'shock', lean: -8 }, 'back']] } },
    hits: [{ u: .3, word: 'SILENCE', at: [270, 300], flash: true, k: 'freeze', sh: 5 }], over: (u, el) => u > .3 ? H.drops(0, 30, 1, '#bcd') : H.drops(el, 30, 0, '#7799cc') }),
  beat({ env: 'vault', cam: [[1, 270, 480], [1.14, 270, 450]],
    cast: { vex: { k: [[0, { x: 410, fl: 'L', mood: 'sly', age: .7, aR: 90, bR: 30 }]] }, ash: { k: [[0, { x: 150, mood: 'worried' }], [.6, { mood: 'focus' }]] } },
    over: (u, el) => H.clock(270, 140, 46, 0, 1) + tx('MIDNIGHT', 270, 240, 40, { fill: '#ffd23f' }) }),
  beat({ env: 'vault', sat: .3, cam: [[1, 270, 480], [1.2, 300, 460]],
    cast: { vex: { k: [[0, { x: 410, fl: 'L', mood: 'smug', age: .7 }], [.5, { mood: 'laugh' }]] }, ash: { k: [[0, { x: 150, mood: 'worried' }], [.7, { mood: 'sad' }]] } },
    over: (u, el) => u > .3 ? H.bubble(410, 340, 260, "WE'LL BE RICH", '#fff') : '' }),
  q, ctaShot(q, { pill: true, next: 4 }),
]);
