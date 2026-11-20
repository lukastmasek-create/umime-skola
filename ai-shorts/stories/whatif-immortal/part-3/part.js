const { beat, hook, question, ctaShot, build, H, kit } = window; const { tx, fx, E, clamp, lerp, rc, ci, el, pg, ln } = kit;
const q = question({ env: 'void', cam: [[1, 270, 480], [1.14, 300, 470]], q: ['WHAT IF THE CURE', 'NEEDS A', 'GOODBYE?'], short: 'WHO MUST YOU SAY GOODBYE TO?',
  cast: { sol: { k: [[0, { x: 170, mood: 'worried', age: 0 }], [.6, { mood: 'sad' }]] }, echo: { k: [[0, { x: 400, fl: 'L', mood: 'whisper', age: .9 }]] } }, over: (u, el) => H.motes(el, 18, '#7bdff2') });
build([
  hook({ env: 'graveyard', banner: 'SHE IS 800 YEARS OLD', focus: [400, 440], z0: 2.2, word: '800', wordAt: [270, 300],
    cast: { echo: { k: [[0, { x: 400, fl: 'L', mood: 'calm', age: .9 }], [.5, { mood: 'sly' }]] }, sol: { k: [[0, { x: 150, mood: 'shock' }]] } } }),
  beat({ env: 'era', envF: u => ({ era: u * 4.5 }), cam: [[1, 270, 480], [1.1, 270, 470]],
    cast: { echo: { k: [[0, { x: 380, fl: 'L', mood: 'calm', age: .9, aR: 90, bR: 20 }]] }, sol: { k: [[0, { x: 170, mood: 'awe', aR: 50 }], [1, { mood: 'awe' }]] } }, over: (u, el) => kit.fx.speed(el, 'rgba(255,255,255,.4)', 10, 1), hits: [{ u: .05, flash: true, sh: 5, k: 'portal' }] }),
  beat({ env: 'era', envF: u => ({ era: 4 + u * 2 }), cam: [[1, 270, 480], [1.12, 270, 460]],
    cast: { sol: { k: [[0, { x: 200, mood: 'awe' }], [.6, { mood: 'sad', tilt: 6 }]] }, echo: { k: [[0, { x: 380, fl: 'L', mood: 'calm', age: .9 }]] } }, over: (u, el) => H.motes(el, 20, '#b7e4c7') }),
  beat({ env: 'void', cam: [[1, 270, 480], [1.18, 270, 460]],
    cast: { echo: { k: [[0, { x: 390, fl: 'L', mood: 'whisper', age: .9, aR: 80, bR: 40 }], [.5, { aR: 110 }, 'back']] }, sol: { k: [[0, { x: 170, mood: 'worried' }], [.7, { mood: 'shock', lean: -8 }, 'back']] } },
    over: (u, el) => (u > .35 ? tx('TWO CHOOSE.', 270, 230, 54, { fill: '#7bdff2', sc: E.back(clamp((u - .35) / .1)) }) : ''), hits: [{ u: .35, burst: [270, 230], sh: 4 }] }),
  q, ctaShot(q, { pill: true, next: 4 }),
]);
