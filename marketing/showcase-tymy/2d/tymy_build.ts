// @ts-nocheck
// Validates the /tymy plans (lint), then writes 2d/tymy-0N/{composition,scenes,lint}.json. Run: node 2d/tymy_build.mjs   (bundles this file with esbuild first)
import fs from "node:fs";
import {createRequire} from "node:module";
import {PARTS, FPS, MAX_FRAMES, SAFE, WORLD_X, readFrames, graphemes, blurFor, type PartPlan, type Item} from "./src/tymyPlan";
import {createCameraTrack} from "./src/studioMotion";

const require_ = createRequire(import.meta.url);
const FS = "/home/user/work/shorts/node_modules/@fontsource/";
const FAMC: Record<string, string> = {p: "Pangolin", b: "Onest", h: "Unbounded"};

async function measure(items: Item[]): Promise<Record<string, number>> {
  const {chromium} = require_("/opt/node-tools/node_modules/playwright");
  const css = ["pangolin/400.css", "onest/600.css", "onest/800.css"].map((q) => fs.readFileSync(FS + q, "utf8").replace(/url\(\.\/files/g, `url(file://${FS}${q.split("/")[0]}/files`)).join("\n");
  const html = "/tmp/tymy_measure.html"; fs.writeFileSync(html, `<style>${css}</style><body></body>`);
  const b = await chromium.launch(), pg = await b.newPage(); await pg.goto("file://" + html);
  const out = await pg.evaluate(async (list: [string, string, number, number, string, number][]) => {
    await Promise.all(["400 40px Pangolin", "600 40px Onest", "800 40px Onest"].map((f) => document.fonts.load(f, "Kód ČÍŘŠŽěščřžýáíé")));
    const c = document.createElement("canvas").getContext("2d")!; const r: Record<string, number> = {};
    for (const [id, text, size, wt, fam, sp] of list) { c.font = `${wt} ${size}px ${fam}`; r[id] = c.measureText(text).width + sp * (Array.from(text).length - 1); }
    return r;
  }, items.map((i) => [i.id, i.text, i.size, i.wt, FAMC[i.fam], i.sp ?? 0] as [string, string, number, number, string, number]));
  await b.close(); return out;
}

// contrast: WCAG ratio
const lum = (hex: string) => { const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const mixHex = (a: string, b: string, t: number) => "#" + [1, 3, 5].map((i) => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - t) + parseInt(b.slice(i, i + 2), 16) * t).toString(16).padStart(2, "0")).join("");

const wordCount = (s: string) => s.trim().split(/\s+/).length;
let allPass = true;
const summary: any[] = [];

const widthsAll = await measure(PARTS.flatMap((p) => p.items));

for (const p of PARTS) {
  const checks: {name: string; pass: boolean; detail: string}[] = [];
  const chk = (name: string, pass: boolean, detail: string) => { checks.push({name, pass, detail}); if (!pass) allPass = false; };
  const track = createCameraTrack(p.camera);
  const home = track(p.flights[0].end + 1);
  // ---- frame plan
  chk("total frames <= 450", p.frames <= MAX_FRAMES, `${p.frames} frames = ${(p.frames / FPS).toFixed(2)} s`);
  chk("scene count", p.scenes.length === 3, p.scenes.map((s) => `${s.id}:${s.start}-${s.end}`).join(" "));
  const feat = p.scenes[1];
  chk("feature frames", feat.end - feat.start >= 120, `${feat.end - feat.start} frames`);
  const resultHold = p.result.hold.end - p.result.hold.start;
  chk("result hold >= 36", resultHold >= 36, `${resultHold} frames`);
  if (p.typing) {
    const need = Math.ceil(graphemes(p.typing.text) * 30 / 14), have = p.typing.span.end - p.typing.span.start;
    chk("typing budget", have >= need, `${graphemes(p.typing.text)} graphemes need ${need} have ${have}`);
    chk("keys = graphemes", p.typing.keyFrames.length === graphemes(p.typing.text), `${p.typing.keyFrames.length}`);
    const first = Math.min(...p.camera.filter((k) => k.frame >= p.flights[0].end).map((k) => k.frame));
    chk("typing starts after camera settles", p.typing.span.start >= p.flights[0].end && first >= p.flights[0].end, `settle ${p.flights[0].end}, typing ${p.typing.span.start}`);
  }
  // ---- flights
  chk("fast flights <= 3", p.flights.length <= 3, `${p.flights.length}`);
  const strongFrames = p.flights.map((fl) => { let n = 0; for (let f = fl.start; f <= fl.end; f++) if (blurFor(Math.abs(track(f).x - track(f - 1).x)) >= 5) n++; return n; });
  chk("strong blur frames <= 12 per flight", strongFrames.every((n) => n <= 12), strongFrames.join(","));
  p.flights.forEach((fl, i) => {
    const mid = Math.round((fl.start + fl.end) / 2), cx = track(mid).x;
    const destX = 960 + WORLD_X[i === 0 ? "feature" : "outro"] ;
    chk(`flight ${i + 1} midpoint shows destination`, Math.abs(cx - destX) < 1920 && Math.abs(cx - destX) > 0, `camera x ${cx.toFixed(0)} mid ${mid}`);
  });
  // camera static through every reading hold
  // ---- text lint
  const scenesLint: any[] = [];
  for (const sc of p.scenes) {
    const its = p.items.filter((i) => i.scene === sc.id);
    const sizes = new Set(its.map((i) => i.size));
    chk(`scene ${sc.id}: <= 2 text sizes`, sizes.size <= 2, [...sizes].join("/"));
    const lint = its.map((it) => {
      const w = widthsAll[it.id];
      const x0 = it.anchor === "middle" ? it.x - w / 2 : it.anchor === "end" ? it.x - w : it.x;
      const bbox = [Math.round(x0), Math.round(it.y - it.size * 0.95), Math.round(x0 + w), Math.round(it.y + it.size * 0.27)];
      const min = it.role === "headline" ? 36 : 42;
      const need = it.role === "headline" ? min : readFrames(it.text, min);
      const hold = it.leave - it.complete;
      // camera must be at rest with zoom 1 for the hold
      let still = true; for (let f = it.complete; f < it.leave; f++) { const v = track(f); if (Math.abs(v.zoom - 1) > 1e-6 || (f > it.complete && Math.abs(v.x - track(f - 1).x) > 1e-6)) { still = false; break; } }
      const inSafe = bbox[0] >= SAFE.x0 && bbox[2] <= SAFE.x1 && bbox[1] >= SAFE.y0 && bbox[3] <= SAFE.y1;
      const ok = hold >= need && it.size >= 44 && inSafe && still;
      chk(`${sc.id}/${it.id} [${it.role}]`, ok, `hold ${hold}/${need} size ${it.size} bbox ${bbox.join(",")} safe ${inSafe} still ${still}`);
      if (it.role === "headline" && sc.id !== "intro") chk(`${it.id}: <= 4 words`, wordCount(it.text) <= 4, it.text);
      if (it.role === "headline") chk(`${it.id}: promo <= 7 words`, wordCount(it.text) <= 7, it.text);
      return {id: it.id, role: it.role, sizePx: it.size, bbox, completeFrame: it.complete, leaveFrame: it.leave, holdFrames: hold, neededFrames: need, text: it.text};
    });
    scenesLint.push({scene: sc.id, items: lint});
  }
  chk("hero lines <= 2", p.hero.lines.length <= 2, p.hero.lines.join(" / "));
  // contrast (brightest point behind text): cream on charcoal highlight with the glow tint, ink on cream, cream on card navy, yellow on charcoal
  // backdrop colour at the point of a headline bbox nearest to the light-pool centre (722,306; radii 1428 x 800) = brightest point behind that text
  const poolBg = (bb: number[]) => { const px = Math.min(Math.max(722, bb[0]), bb[2]), py = Math.min(Math.max(306, bb[1]), bb[3]);
    const a = Math.max(0, 1 - Math.hypot((px - 722) / 1428, (py - 306) / 800)); return mixHex("#22262E", "#3B414B", a); };
  for (const sc of scenesLint) for (const it of sc.items.filter((i: any) => i.role === "headline")) {
    const bg = poolBg(it.bbox), glowBg = mixHex(bg, "#6ee7ff", 0.12);
    chk(`contrast ${it.id}: cream on backdrop+glow >= 7`, ratio("#F6F1E4", glowBg) >= 7, `${ratio("#F6F1E4", glowBg).toFixed(2)} on ${glowBg}`);
    if (it.id === "hero-2" || it.id === "intro-hero") chk(`contrast ${it.id}: yellow accent on backdrop >= 7`, ratio("#FFC933", bg) >= 7, `${ratio("#FFC933", bg).toFixed(2)} on ${bg}`);
  }
  chk("contrast cream/navy card >= 7", ratio("#F6F1E4", "#292541") >= 7, ratio("#F6F1E4", "#292541").toFixed(2));
  chk("contrast ink/cream >= 7", ratio("#191D2E", "#F6F1E4") >= 7, ratio("#191D2E", "#F6F1E4").toFixed(2));
  chk("contrast ink/row (#e9e4f4) >= 7", ratio("#191D2E", "#e9e4f4") >= 7, ratio("#191D2E", "#e9e4f4").toFixed(2));
  chk("contrast muted ink/row >= 7", ratio("#46415f", "#e9e4f4") >= 7, ratio("#46415f", "#e9e4f4").toFixed(2));
  chk("contrast white/blue button >= 4.5 (control)", ratio("#ffffff", "#3248f0") >= 4.5, ratio("#ffffff", "#3248f0").toFixed(2));

  // ---- sound cue plan (frames -> seconds), one coordinate space with the picture
  const t = (f: number) => +(f / FPS).toFixed(4);
  const cues: {kind: string; t: number; gain: number; pan: number; note: string}[] = [];
  const add = (kind: string, f: number, gain: number, pan: number, note: string) => cues.push({kind, t: t(f), gain, pan, note});
  const [fl1, fl2] = p.flights, tr = p.transfers[0];
  add("whoosh", 2, 0.55, -0.3, "logo blob morph");
  add("tok", 46, 0.5, 0.1, "logo tile lands in the logo");
  add("whoosh", Math.round((fl1.start + fl1.end) / 2) - 12, 0.6, 0.2, "camera flight 1 (centred on peak travel speed)");
  add("cloth", p.card.arrival.start + 2, 0.5, 0.1, "card slides in");
  if (p.typing) p.typing.keyFrames.forEach((k, i) => add("key", k, 0.5, (i % 3 - 1) * 0.08, `typed char ${i + 1}`));
  p.cursor.clicks.forEach((c) => add("click", c.frame, 0.6, 0.05, `click ${c.id}`));
  add("cloth", tr.start, 0.45, 0.2, "card slides to the result");
  add("impact", tr.end, 1.0, 0, "HERO HIT: result lands");
  if (p.bubbles) { add("tok", p.bubbles.user.start, 0.6, 0.3, "user bubble"); add("tok", p.bubbles.reply.start, 0.6, -0.3, "answer bubble"); }
  add("tok", p.result.check.start + 8, 0.4, 0.0, "result check drawn");
  add("whoosh", Math.round((fl2.start + fl2.end) / 2) - 12, 0.6, -0.2, "camera flight 2");
  add("cloth", p.card.exit.start + 2, 0.4, -0.2, "card leaves");
  add("tok", p.logo.outroPop + 34, 0.5, 0, "end-card logo settles");
  add("tok", p.texts.outro.end, 0.4, 0.1, "url lands");
  cues.sort((a, b) => a.t - b.t);

  const scenes = {
    seed: p.seed, fps: FPS, frames: p.frames,
    order: p.scenes.map((s) => ({id: s.id === "intro" ? "logoMorph" : s.id === "feature" ? "feature_" + p.id : "finale", start: t(s.start), dur: t(s.end - s.start),
      extra: {frameStart: s.start, frameEnd: s.end,
        ...(s.id === "feature" ? {click: p.cursor.clicks.map((c) => t(c.frame)), keys: p.typing ? p.typing.keyFrames.map(t) : [], resultLand: t(tr.end), transferStart: t(tr.start), cues: cues.filter((c) => c.t >= t(p.flights[0].start) - 0.01 && c.t < t(p.flights[1].start) - 0.4)} : {}),
        ...(s.id === "intro" ? {cues: cues.filter((c) => c.t < t(p.flights[0].start) - 0.4)} : {}),
        ...(s.id === "outro" ? {cues: cues.filter((c) => c.t >= t(p.flights[1].start) - 0.4)} : {})}})),
    hero: {id: "result_lands", frame: tr.end}, notes: p.notes,
  };
  const composition = {id: p.comp, width: 1920, height: 1080, fps: FPS, frames: p.frames, seed: p.seed, title: p.title, camera: p.camera, flights: p.flights, strongBlurFrames: strongFrames,
    stages: p.stages, transfers: p.transfers, cardArrival: p.card.arrival, cardExit: p.card.exit, typing: p.typing ?? null, cursor: p.cursor, result: p.result, texts: p.texts, fadeOut: p.fadeOut,
    effects: [
      {entry: "Morph + LOGO_PARTS (IntroScene logic, landscape)", span: p.logo.morph, refs: "blob -> tile -> real logo"},
      {entry: "createCameraTrack/stageTransform flight 1 (+ blur/CA by speed)", span: fl1, refs: "intro world -> feature world"},
      {entry: "cardArrival + StudioCard", span: p.card.arrival, refs: "form card"},
      ...(p.typing ? [{entry: "typeState (key per grapheme)", span: p.typing.span, refs: "input field"}] : []),
      {entry: "clickMotion + magnetPose + Ripple", span: {start: p.cursor.clicks[0].approach, end: p.cursor.clicks.at(-1)!.frame + 9}, refs: p.cursor.clicks.map((c) => c.id).join(",")},
      {entry: "sharedCardPose chain (one StudioCard from setup to result, tone navy->cream)", span: tr, refs: p.stages.map((s) => s.id).join("->")},
      {entry: "ResultMark + resultLap", span: p.result.lap, refs: "result card"},
      ...(p.bubbles ? [{entry: "bubblePose + dotPose", span: {start: p.bubbles.user.start, end: p.bubbles.reply.end}, refs: "chat"}] : []),
      {entry: "cardExit + textExitPose", span: p.card.exit, refs: "handoff"},
      {entry: "createCameraTrack flight 2", span: fl2, refs: "feature world -> outro world"},
      {entry: "textPose + LOGO_PARTS end card", span: p.texts.outro, refs: "logo + url"},
    ],
  };
  fs.mkdirSync(`2d/${p.id}`, {recursive: true});
  fs.writeFileSync(`2d/${p.id}/scenes.json`, JSON.stringify(scenes, null, 1));
  fs.writeFileSync(`2d/${p.id}/composition.json`, JSON.stringify(composition, null, 1));
  const failed = checks.filter((c) => !c.pass);
  fs.writeFileSync(`2d/${p.id}/lint.json`, JSON.stringify({part: p.id, pass: failed.length === 0, scenes: scenesLint, checks}, null, 1));
  summary.push({part: p.id, frames: p.frames, seconds: +(p.frames / FPS).toFixed(2), checks: checks.length, failed: failed.map((c) => `${c.name}: ${c.detail}`)});
}
console.log(JSON.stringify(summary, null, 1));
if (!allPass) { console.error("LINT FAIL"); process.exit(1); }
console.log("LINT PASS");
