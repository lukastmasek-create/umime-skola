// Seed-driven plan for the UčímePRO showcase. Writes plan.json (read by UcimePro.tsx), scenes.json (audio) and lint.json.
import fs from "node:fs";
const SEED = Number(process.env.SEED || 1794812860565 % 2 ** 31);
const mulberry32 = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const r = mulberry32(SEED);
const shuffle = (a, rr = r) => a.map((v) => [rr(), v]).sort((x, y) => x[0] - y[0]).map((x) => x[1]);
const FEATS = ["doucovatel", "fotka", "plan"];                     // real tools of the PRO tab: AI doučovač, Fotka úlohy, Osobní plán učení
const order = shuffle(FEATS);
const LENS = [60, 114, 114, 162];                                  // intro, feat, feat, feat+outro  = 450 frames = 15.0 s
const S = [0]; LENS.forEach((l) => S.push(S[S.length - 1] + l));
const POOL = ["n5", "n6", "n4", "star5", "spark", "n7", "circle"];
const morph = [shuffle(POOL)[0], ...shuffle(POOL).slice(1, 4), "sq"];  // object -> ... -> logo tile (>= 5 names)
const EFFECTS = ["magnetCursor", "ghostTrail", "pinDrop", "countdownDots", "lightSweep", "inkUnderline", "squash", "typedStepList", "filmLook", "endLoop"];
const rr2 = mulberry32(SEED + 7);
const must = ["magnetCursor", "ghostTrail", "pinDrop", "filmLook", "endLoop"];                 // tied to the scenes' core recipes
const extras = shuffle(EFFECTS.filter((e) => !must.includes(e)), rr2).slice(0, 2);
const effects = [...must, ...extras];
const cams = [0, 1, 2, 3].map((i) => { const rc = mulberry32(SEED + i * 101); const push = rc() < 0.5; return { s0: push ? 0.96 : 1.0, s1: push ? 1.0 : 0.96, r0: (rc() < 0.5 ? -1 : 1) * (0.8 + rc()) }; });
const colorOrder = shuffle([0, 1, 2, 3]);
const plan = { seed: SEED, order, lens: LENS, S, morph, effects, cams, colorOrder };
fs.writeFileSync(new URL("./plan.json", import.meta.url), JSON.stringify(plan, null, 1));
console.log(JSON.stringify(plan));
