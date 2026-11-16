// Pure planning helpers (no React, no DOM) for the "AI doučovač" showcase: seeded scene + effect picking. Runs in Node too.
export const mulberry32 = (a: number) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

export type SceneDef<T = unknown> = { id: string; fam: string; len: number; k: number; weight?: number; C: T };
export const secs = (a: { len: number; k: number }[]) => a.reduce((x, s) => x + (s.len * s.k) / 30, 0);

export const pickScenes = <T,>(kit: Record<string, SceneDef<T>>, features: SceneDef<T>[], extras: SceneDef<T>[], seed: number, budgetS = 15): SceneDef<T>[] => {
  const r = mulberry32(seed), shuffle = <U,>(a: U[]) => a.map(v => [r(), v] as const).sort((x, y) => x[0] - y[0]).map(x => x[1]);
  const head = [kit.logoMorph], tail = [kit.finale], pair = [kit.katanaCut, kit.sparkChat], mid: SceneDef<T>[] = [];
  const feats = features.map(f => [(f.weight ?? 1) * (0.7 + r() * 0.6), f] as const).sort((a, b) => b[0] - a[0]).map(x => x[1]);
  for (const s of feats) if (secs([...head, ...pair, ...mid, s, ...tail]) <= budgetS) mid.push(s);
  for (const s of shuffle(extras)) if (secs([...head, ...pair, ...mid, s, ...tail]) <= budgetS) mid.push(s);
  const m = shuffle(mid), at = Math.floor(r() * (m.length + 1));
  return [...head, ...m.slice(0, at), ...pair, ...m.slice(at), ...tail];
};

/** Fisher-Yates with the seeded rng: identical in every JS engine (a random-comparator sort is NOT) */
export const shuf = <U,>(a: U[], r: () => number) => { const o = [...a]; for (let i = o.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; } return o; };
export const EFFECTS = ["pixelMorph", "squash", "pageRead", "dollyZoom", "sparkChase", "filmLook", "endLoop"] as const;
export type Effect = (typeof EFFECTS)[number];
export const pickEffects = (seed: number): Set<Effect> => { const r = mulberry32(seed + 7), pool = shuf([...EFFECTS], r); return new Set(pool.slice(0, 3 + Math.floor(r() * 3))); };

/** all per-video random choices that do not need the DOM (derived only from the seed) */
export const details = (seed: number) => {
  const r = mulberry32(seed + 11), pick = <U,>(a: U[]) => a[Math.floor(r() * a.length)];
  const morphPool = ["circle", "spark", "star5", "n3", "n5", "n6", "n8", "n4"];
  const m = shuf(morphPool, r);
  const morphs = [pick(["circle", "n4", "n6"]), m[0], m[1], m[2], pick(["circle", "star5"]), "sq"];   // object -> ... -> blue tile (needs >= 5)
  const word = pick(["ÚKOL", "POMOC", "PROČ?", "ZLOMKY"]);
  const dir = r() < 0.5 ? 1 : -1, sl = 110 + r() * 80;
  const A: [number, number] = [70, 900 - dir * sl], B: [number, number] = [1010, 900 + dir * sl];
  const corner = Math.floor(r() * 4);                                   // preferred corner index for the chip (adjusted to the correct half in the scene)
  const logoOrder = shuf([0, 1, 2, 3], r);                 // order of the four logo colours in the hero accents
  const roll = r() < 0.5 ? 1 : -1;
  const first = pick(["photo", "steps"]);
  return { morphs, word, A, B, corner, logoOrder, roll, first };
};

// -------- timing of the moments the picture decides (local scene time t -> absolute seconds) --------
/** local time t of a scene starting at frame R (cumulative) with stretch k -> seconds. local t = 12 is the scene's first frame. */
export const toSec = (R: number, k: number, t: number) => (R + (t - 12) * k) / 30;

// -------- timeline constants shared by the picture (Tutor.tsx) and the sound plan (scenes.json) --------
export const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };   // same formula as fx2.rnd
export const T = { katanaCut: 38, spark0: 24, photoClick0: 30, photoClick1: 48, photoFly: 50, photoLand: 62, stepLand: [22, 34, 46], stepType: 58, stepOk: 70 };
export const sparkTime = (i: number) => { const a = T.spark0 + i * 1.2, dur = 24 + rnd(i + 40) * 6; return { a, dur, arrive: a + dur }; };
export const WORD_N: Record<string, number> = { "ÚKOL": 4, "POMOC": 5, "PROČ?": 5, "ZLOMKY": 6 };

export const metaFor = (fx: Set<Effect>) => {
  const loop = fx.has("endLoop");
  const mk = (id: string, fam: string, len: number, k = 1, weight = 1): SceneDef<null> => ({ id, fam, len, k, weight, C: null });
  return {
    kit: { logoMorph: mk("logoMorph", "kit", 82), katanaCut: mk("katanaCut", "kit", 68), sparkChat: mk("sparkChat", "kit", 112), finale: mk("finale", "kit", loop ? 100 : 84) } as Record<string, SceneDef<null>>,
    features: [mk("feature_photo", "feature", 86, 1, 1), mk("feature_steps", "feature", 86, 1, 1)],
  };
};
/** frame where each scene starts: same rounding as createFilm */
export const startFrames = (scs: { len: number; k: number }[]) => { let acc = 0; const R = [0]; scs.forEach(s => { acc += s.len * s.k; R.push(Math.floor(acc + 0.5)); }); return R; };
