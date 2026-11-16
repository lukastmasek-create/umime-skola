// plan.json + items.json -> scenes.json (sound moments, seconds) + lint.json (text items per scene)
import fs from "node:fs";
const P = JSON.parse(fs.readFileSync(new URL("./plan.json", import.meta.url))), I = JSON.parse(fs.readFileSync(new URL("./items.json", import.meta.url)));
const FW = { h: 0.82, b: 0.58, p: 0.47, chip: 0.82 };
const ab = (i, local) => Math.max(0, (P.S[i] + local - 12) / 30);                       // local scene frame -> seconds
const EV = {   // [local frame, kind, gain, pan]
  plan: [[22, "cloth", 0.4, -0.2], [34, "tok", 0.25, 0.2], [48, "tok", 0.25, 0.2], [54, "whoosh", 0.5, 0], [66, "impact", 1.0, 0], [70, "cloth", 0.3, 0.2]],
  fotka: [[14, "cloth", 0.35, -0.2], [40, "click", 0.5, 0], [43, "cloth", 0.4, 0.3], [54, "tok", 0.45, 0], [57, "tok", 0.3, -0.3], [61, "tok", 0.3, 0.3], [65, "tok", 0.3, -0.1], [76, "cloth", 0.3, 0.2]],
  doucovatel: [[14, "cloth", 0.35, 0], [24, "tok", 0.45, 0.3], [58, "tok", 0.45, -0.3], [72, "tok", 0.25, -0.2], [79, "tok", 0.25, -0.2], [86, "tok", 0.3, -0.2], [82, "cloth", 0.3, 0.2], [120, "tok", 0.4, 0], [124, "cloth", 0.3, 0]],
};
const order = [{ id: "logoMorph", i: 0, ev: [[10, "cloth", 0.4, 0], [44, "tok", 0.4, 0.1]] }, ...P.order.map((f, j) => ({ id: "feature_" + f, i: j + 1, ev: EV[f] }))];
const events = [];
for (const o of order) for (const [l, k, g, p] of o.ev) events.push({ t: +ab(o.i, l).toFixed(3), kind: k, gain: g, pan: p, scene: o.id });
for (let i = 1; i < 4; i++) events.push({ t: +((P.S[i] - 14) / 30).toFixed(3), kind: "whoosh", gain: 0.3, pan: i % 2 ? 0.4 : -0.4, scene: "flight" });
events.sort((a, b) => a.t - b.t);
fs.writeFileSync(new URL("./scenes.json", import.meta.url), JSON.stringify({ seed: P.seed, fps: 30, frames: 450, order: order.map((o) => ({ id: o.id, start: P.S[o.i] / 30, dur: P.lens[o.i] / 30 })), events, typedChars: 0, effects: P.effects, morph: P.morph }, null, 1));
// lint
const lint = {}; let fail = 0;
const scenes = [["intro", 0], ...P.order.map((f, j) => [f, j + 1])];
for (const [name, i] of scenes) {
  const last = i === 3, tLeave = last ? 106 : P.lens[i] - 2;
  const own = I[name].concat(last ? [] : []);
  const rows = I[name].map((it) => {
    const n = it.text.length, s = it.size, w = it.f === "tag" ? n * s * 0.64 + n * s * 0.12 + s * 1.6 : n * s * FW[it.f] * (it.f === "p" ? 1 : 1);
    const bw = Math.min(w, it.maxW || 940), tComplete = it.mode === "tag" || it.mode === "chip" || it.mode === "photo" ? it.a + it.dur : it.a + Math.max(0, n - 1) * it.st + 15;
    const bbox = [Math.round(it.x - bw / 2), Math.round(it.y - s * 1.0), Math.round(bw), Math.round(s * 1.25)];
    const need = it.kind === "headline" ? 36 : 42, vis = tLeave - tComplete;
    const ok = vis >= need && s >= 44 && bbox[0] >= 60 && bbox[0] + bbox[2] <= 1020 && bbox[1] >= 160 && bbox[1] + bbox[3] <= 1540;
    if (!ok) fail++;
    return { id: it.id, text: it.text, sizePx: s, bbox, tComplete, tLeave, visibleS: +(vis / 30).toFixed(2), ok };
  });
  lint[name] = rows;
  if (last) { const u = I.outro[0], n = u.text.length; lint.outro = [{ id: "url", sizePx: 52, tComplete: 7, tLeave: 164, visibleS: +((164 - 7) / 30).toFixed(2), note: "outro t = local-114; tComplete 114+7" }]; }
}
const sceneSecs = P.lens.map((l) => l / 30), total = sceneSecs.reduce((a, b) => a + b, 0);
const ss = { total_s: total, intro_s: sceneSecs[0], features_s: (P.lens[1] + P.lens[2] + P.lens[3] - 60) / 30, outro_s: 2.0, flights: 3 };
fs.writeFileSync(new URL("./lint.json", import.meta.url), JSON.stringify({ summary: ss, failures: fail, scenes: lint }, null, 1));
console.log("lint failures:", fail, JSON.stringify(ss));
for (const [k, v] of Object.entries(lint)) for (const r of v) if (r.ok === false) console.log("FAIL", k, r.id, r.visibleS, r.bbox);
