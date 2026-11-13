// Model keyframe animátoru: objekty mají klíčové snímky v čase a mezi nimi se hodnoty plynule dopočítají.
// Bez Reactu a DOM, takže jde otestovat přes node --test.

export const ANIM_SHAPES = ["cat", "star", "heart", "sun", "ball"] as const;
export type ShapeId = (typeof ANIM_SHAPES)[number];

export const EASINGS = ["linear", "ease", "bounce"] as const;
export type Easing = (typeof EASINGS)[number];

export const ANIM_COLORS = ["#ff8a6b", "#ffc933", "#7ee0b0", "#8fd0ff", "#c9a8ff", "#ffb3d9"] as const;

export const MAX_OBJECTS = 12;
export const MAX_KEYS = 40;
export const MIN_DURATION = 1;
export const MAX_DURATION = 10;
export const KEY_EPS = 0.01;

export type Pose = { x: number; y: number; rot: number; scale: number; opacity: number };

// Klíčový snímek: poloha v čase t (s). Easing říká, jak se plynule dojede z tohoto snímku k dalšímu.
export type Key = Pose & { t: number; ease: Easing };

export type AnimObject = { id: string; name: string; shape: ShapeId; color: string; keys: Key[] };

export type Project = { duration: number; objects: AnimObject[] };

// Hranice, ve kterých se hodnoty drží, aby nic neodletělo z plátna.
export const LIMITS: Record<keyof Pose, [number, number]> = {
  x: [-220, 220],
  y: [-130, 130],
  rot: [-720, 720],
  scale: [0.1, 3],
  opacity: [0, 1],
};

export const REST_POSE: Pose = { x: 0, y: 0, rot: 0, scale: 1, opacity: 1 };

export function clampPose(p: Pose): Pose {
  const out = { ...p };
  for (const k of Object.keys(LIMITS) as (keyof Pose)[]) {
    const [lo, hi] = LIMITS[k];
    out[k] = Math.min(hi, Math.max(lo, Number.isFinite(p[k]) ? p[k] : REST_POSE[k]));
  }
  return out;
}

export function clampTime(t: number, duration: number): number {
  if (!Number.isFinite(t)) return 0;
  return Math.min(duration, Math.max(0, t));
}

// ---------- plynulost ----------

export function applyEasing(p: number, ease: Easing): number {
  const k = Math.min(1, Math.max(0, p));
  switch (ease) {
    case "linear":
      return k;
    case "ease":
      return k * k * (3 - 2 * k);
    case "bounce":
      return easeOutBounce(k);
  }
}

function easeOutBounce(x: number): number {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (x < 1 / d1) return n1 * x * x;
  if (x < 2 / d1) {
    const y = x - 1.5 / d1;
    return n1 * y * y + 0.75;
  }
  if (x < 2.5 / d1) {
    const y = x - 2.25 / d1;
    return n1 * y * y + 0.9375;
  }
  const y = x - 2.625 / d1;
  return n1 * y * y + 0.984375;
}

// ---------- klíčové snímky ----------

export function sortedKeys(keys: readonly Key[]): Key[] {
  return [...keys].sort((a, b) => a.t - b.t);
}

// Poloha objektu v čase t: před prvním snímkem drží první, po posledním drží poslední, mezi nimi interpoluje.
export function poseAt(keys: readonly Key[], t: number): Pose {
  if (keys.length === 0) return { ...REST_POSE };
  const ks = sortedKeys(keys);
  if (t <= ks[0].t) return pick(ks[0]);
  const last = ks[ks.length - 1];
  if (t >= last.t) return pick(last);
  for (let i = 0; i < ks.length - 1; i++) {
    const a = ks[i];
    const b = ks[i + 1];
    if (t >= a.t && t < b.t) {
      const span = b.t - a.t;
      const k = span > 0 ? applyEasing((t - a.t) / span, a.ease) : 1;
      return {
        x: lerp(a.x, b.x, k),
        y: lerp(a.y, b.y, k),
        rot: lerp(a.rot, b.rot, k),
        scale: lerp(a.scale, b.scale, k),
        opacity: lerp(a.opacity, b.opacity, k),
      };
    }
  }
  return pick(last);
}

function pick(k: Key): Pose {
  return { x: k.x, y: k.y, rot: k.rot, scale: k.scale, opacity: k.opacity };
}

function lerp(a: number, b: number, k: number): number {
  return a + (b - a) * k;
}

// Přidá klíč, nebo přepíše existující na stejném čase (s tolerancí KEY_EPS).
export function upsertKey(keys: readonly Key[], key: Key): Key[] {
  const rest = keys.filter((k) => Math.abs(k.t - key.t) > KEY_EPS);
  if (rest.length >= MAX_KEYS && keys.length === rest.length) return [...keys];
  return sortedKeys([...rest, key]);
}

export function removeKeyAt(keys: readonly Key[], t: number): Key[] {
  return keys.filter((k) => Math.abs(k.t - t) > KEY_EPS);
}

export function keyAt(keys: readonly Key[], t: number): Key | null {
  return keys.find((k) => Math.abs(k.t - t) <= KEY_EPS) ?? null;
}

// ---------- projekt ----------

export function makeObject(id: string, name: string, shape: ShapeId, color: string): AnimObject {
  return { id, name, shape, color, keys: [{ t: 0, ...REST_POSE, ease: "ease" }] };
}

export function defaultProject(): Project {
  return {
    duration: 4,
    objects: [
      {
        id: "o1",
        name: "Kočka",
        shape: "cat",
        color: ANIM_COLORS[0],
        keys: [
          { t: 0, x: -140, y: -60, rot: 0, scale: 1, opacity: 1, ease: "ease" },
          { t: 2, x: 120, y: -60, rot: 0, scale: 1.3, opacity: 1, ease: "bounce" },
          { t: 4, x: -140, y: -60, rot: 0, scale: 1, opacity: 1, ease: "ease" },
        ],
      },
    ],
  };
}

// Ze surových dat (třeba z localStorage) udělá bezpečný projekt. Neznámé hodnoty se zahodí nebo nahradí.
export function sanitizeProject(raw: unknown): Project | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  const duration = typeof r.duration === "number" ? Math.min(MAX_DURATION, Math.max(MIN_DURATION, r.duration)) : 4;
  if (!Array.isArray(r.objects)) return null;
  const objects: AnimObject[] = [];
  for (const item of r.objects.slice(0, MAX_OBJECTS)) {
    if (typeof item !== "object" || item === null) continue;
    const o = item as Record<string, unknown>;
    const shape = (ANIM_SHAPES as readonly string[]).includes(o.shape as string) ? (o.shape as ShapeId) : "ball";
    const color = (ANIM_COLORS as readonly string[]).includes(o.color as string) ? (o.color as string) : ANIM_COLORS[0];
    const name = typeof o.name === "string" ? o.name.slice(0, 20) : "Objekt";
    const id = typeof o.id === "string" && /^[a-z0-9]{1,30}$/i.test(o.id) ? o.id : `o${objects.length + 1}`;
    const keys: Key[] = [];
    if (Array.isArray(o.keys)) {
      for (const kr of o.keys.slice(0, MAX_KEYS)) {
        if (typeof kr !== "object" || kr === null) continue;
        const k = kr as Record<string, unknown>;
        const t = typeof k.t === "number" ? clampTime(k.t, duration) : NaN;
        if (!Number.isFinite(t)) continue;
        const pose = clampPose({
          x: num(k.x, 0),
          y: num(k.y, 0),
          rot: num(k.rot, 0),
          scale: num(k.scale, 1),
          opacity: num(k.opacity, 1),
        });
        const ease = (EASINGS as readonly string[]).includes(k.ease as string) ? (k.ease as Easing) : "ease";
        keys.push({ t, ...pose, ease });
      }
    }
    objects.push({ id, name, shape, color, keys: keys.length > 0 ? sortedKeys(keys) : [{ t: 0, ...REST_POSE, ease: "ease" }] });
  }
  return { duration, objects };
}

function num(v: unknown, def: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : def;
}
