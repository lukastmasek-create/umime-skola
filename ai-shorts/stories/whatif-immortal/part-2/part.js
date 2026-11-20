const { beat, hook, question, ctaShot, build, H, kit } = window; const { tx, fx, E, clamp, lerp, rc, ci, el, pg, ln } = kit;
const q = question({ env: 'graveyard', cam: [[1, 270, 480], [1.14, 330, 470]], q: ['WHO HAS WAITED', '400 YEARS', 'FOR YOU?'], short: 'WHO HAS WAITED 400 YEARS?',
  cast: { sol: { k: [[0, { x: 160, mood: 'sad', age: 0 }], [.5, { mood: 'shock', lean: -8, look: 1 }, 'back']] }, echo: { k: [[0, { x: 410, fl: 'L', mood: 'calm', age: .9 }], [.6, { mood: 'whisper' }]] } } });
build([
  hook({ env: 'bedroom', banner: '40 YEARS LATER', focus: [380, 440], z0: 2.2, word: 'GREY', wordAt: [270, 300],
    cast: { lyra: { k: [[0, { x: 380, fl: 'L', mood: 'happy', age: .8 }]] }, sol: { k: [[0, { x: 160, mood: 'worried' }]] } } }),
  beat({ env: 'era', envF: u => ({ era: u * 4 }), cam: [[1, 270, 480], [1, 270, 480]],
    cast: { sol: { k: [[0, { x: 270, run: 1, mood: 'calm' }], [1, { run: 1, mood: 'sad' }]] } }, over: (u, el) => kit.fx.speed(el, 'rgba(255,255,255,.35)', 8, 1) }),
  beat({ env: 'park', cam: [[1, 270, 480], [1.14, 300, 470]],
    cast: { sol: { k: [[0, { x: 200, mood: 'happy' }], [.6, { mood: 'sad' }]] }, lyra: { k: [[0, { x: 380, fl: 'L', mood: 'happy', age: 1, lean: 10 }], [.55, { mood: 'calm' }]] } },
    over: (u, el) => u > .5 ? H.bubble(380, 330, 320, 'NOT TIRED?', '#fff') : '' }),
  beat({ env: 'graveyard', cam: [[1, 270, 480], [1.18, 270, 470]],
    cast: { sol: { k: [[0, { x: 270, mood: 'sad', lean: 6, tilt: 8 }], [1, { mood: 'sad', tilt: 10 }]] } },
    over: (u, el) => `<g transform="translate(140 600)">${pg('M-26,0 L-26,-70 Q0,-110 26,-70 L26,0 Z', '#9aa0b4', 5)}${tx('L', 0, -40, 34, { fill: '#6b7391' })}</g>` + fx.sparkle(160, 520 - u * 120, 20, 1, '#fff') , hits: [{ u: .5, word: '...', at: [270, 330], wc: '#fff', k: 'chime' }] }),
  q, ctaShot(q, { pill: true, next: 3 }),
]);
