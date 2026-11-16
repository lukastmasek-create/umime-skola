// @ts-nocheck
// node --experimental-strip-types 2d/src/tutorPlanCli.ts <seed> <name>  -> prints scenes.json (order + exact moments for the sound track)
import { pickScenes, pickEffects, metaFor, startFrames, toSec, sparkTime, T, WORD_N, details } from "./tutorPlan.ts";
const seed = Number(process.argv[2]), name = process.argv[3] || "ai-doucovac";
const fx = pickEffects(seed), M = metaFor(fx), d = details(seed);
const feats = [...M.features].sort(a => (a.id.endsWith(d.first) ? -1 : 1)).map((f, i) => ({ ...f, weight: i === 0 ? 3 : 1 }));
const order = pickScenes(M.kit, feats, [], seed, 15);
const R = startFrames(order), frames = R[order.length];
const out = order.map((s, i) => {
  const ex: Record<string, number> = {}, k = s.k, r = R[i];
  if (s.id === "katanaCut") ex.cut = toSec(r, k, T.katanaCut);
  if (s.id === "sparkChat") for (let j = 0; j < 3; j++) ex["arrive" + j] = toSec(r, k, sparkTime(j).arrive);
  if (s.id === "feature_photo") { ex.click0 = toSec(r, k, T.photoClick0); ex.click1 = toSec(r, k, T.photoClick1); ex.fly = toSec(r, k, T.photoFly); ex.land = toSec(r, k, T.photoLand); }
  if (s.id === "feature_steps") { T.stepLand.forEach((t, j) => (ex["land" + j] = toSec(r, k, t + 14))); ex.type = toSec(r, k, T.stepType); ex.ok = toSec(r, k, T.stepOk); }
  return { id: s.id, start: +(r / 30).toFixed(3), dur: +((s.len * s.k) / 30).toFixed(3), ...(Object.keys(ex).length ? { extra: Object.fromEntries(Object.entries(ex).map(([a, b]) => [a, +b.toFixed(3)])) } : {}) };
});
console.log(JSON.stringify({ seed, fps: 30, frames, effects: [...fx], word: d.word, wordLetters: WORD_N[d.word], order: out }, null, 1));
