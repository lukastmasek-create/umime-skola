const { beat, hook, question, ctaShot, build, H, kit } = window; const { tx, fx, E, clamp, lerp, rc, ci, el, pg, ln } = kit;
const ribbon = (x, y) => pg(`M${x},${y} l-20,-14 l0,28 z M${x},${y} l20,-14 l0,28 z`, '#ffd166', 4) + ci(x, y, 6, '#f4a261', 3);
const q = question({ env: 'park', cam: [[1, 270, 480], [1.16, 300, 460]], q: ['WHY IS ECHO WEARING', "LYRA'S RIBBON?"], short: "WHY LYRA'S RIBBON?",
  cast: { sol: { k: [[0, { x: 160, mood: 'happy', age: 1, lean: 8 }], [.6, { mood: 'shock', look: 1 }, 'back']] }, echo: { k: [[0, { x: 400, fl: 'L', mood: 'whisper', age: .9 }], [1, { mood: 'sly' }]] } },
  over: (u, el) => ribbon(400 + Math.sin(el * 3) * 2, 410) });
build([
  hook({ env: 'bedroom', banner: "LYRA'S LAST DAY", focus: [380, 440], z0: 2.2, word: '90', wordAt: [270, 300],
    cast: { lyra: { k: [[0, { x: 380, fl: 'L', mood: 'happy', age: 1, lean: 8 }]] }, sol: { k: [[0, { x: 160, mood: 'sad' }]] } } }),
  beat({ env: 'void', cam: [[1, 270, 480], [1.12, 300, 470]],
    cast: { echo: { k: [[0, { x: 400, fl: 'L', mood: 'whisper', age: .9 }], [.5, { aR: 90, bR: 20 }]] }, sol: { k: [[0, { x: 170, mood: 'worried' }], [.8, { mood: 'calm' }]] } } }),
  beat({ env: 'park', cam: [[1, 270, 480], [1.2, 270, 460]],
    cast: { sol: { k: [[0, { x: 200, mood: 'calm', age: 0, aR: 50 }], [1, { mood: 'happy', age: 1, lean: 8 }, 'lin']] }, lyra: { k: [[0, { x: 340, fl: 'L', mood: 'happy', age: 1, aL: 60 }]] } },
    over: (u, el) => `<ellipse cx="270" cy="560" rx="${80 + u * 160}" ry="${(80 + u * 160) * .5}" fill="rgba(255,220,120,.25)"/>` + H.motes(el, 26, '#ffd23f'), hits: [{ u: .2, word: 'GLOW', at: [270, 330], k: 'chime', wc: '#ffe066' }] }),
  beat({ env: 'field', cam: [[1, 270, 480], [1.1, 270, 470]],
    cast: { sol: { k: [[0, { x: 270, mood: 'happy', age: 1, lean: 10, aR: 100, bR: 20 }], [.6, { mood: 'laugh' }]] } },
    over: (u, el) => H.motes(el, 14, '#fff') }),
  q, ctaShot(q, { pill: true, next: 0, last: true }),
]);
