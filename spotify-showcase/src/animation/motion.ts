// Deterministic motion library. Everything is a pure function of frame / time.
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const range = (f: number, a: number, b: number) => clamp((f - a) / (b - a));

// --- easing curves ---
export const smooth = (t: number) => t * t * (3 - 2 * t);
export const smoother = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
export const cinematic = (t: number) => bezier(0.65, 0, 0.25, 1)(t); // slow in / slow out
export const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInCubic = (t: number) => t * t * t;
export const easeInOutQuart = (t: number) => (t < 0.5 ? 8 * t ** 4 : 1 - Math.pow(-2 * t + 2, 4) / 2);

/** cubic-bezier easing (CSS style), Newton + bisection solve */
export function bezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const X = (t: number) => ((ax * t + bx) * t + cx) * t;
  const Y = (t: number) => ((ay * t + by) * t + cy) * t;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let lo = 0, hi = 1, t = x;
    for (let i = 0; i < 24; i++) {
      const v = X(t);
      if (Math.abs(v - x) < 1e-6) break;
      if (v < x) lo = t; else hi = t;
      t = (lo + hi) / 2;
    }
    return Y(t);
  };
}

/** Analytic damped spring (deterministic, no integration state).
 * Returns 0→1 with overshoot controlled by damping ratio zeta (<1 = overshoot).
 * f = frames since trigger, fps = 60, freq in Hz. Heavier object = lower freq. */
export function dampedSpring(f: number, freq = 1.6, zeta = 0.78, fps = 60) {
  if (f <= 0) return 0;
  const t = f / fps;
  const w = 2 * Math.PI * freq;
  if (zeta < 1) {
    const wd = w * Math.sqrt(1 - zeta * zeta);
    return 1 - Math.exp(-zeta * w * t) * (Math.cos(wd * t) + ((zeta * w) / wd) * Math.sin(wd * t));
  }
  return 1 - Math.exp(-w * t) * (1 + w * t);
}

/** Staggered progress: item i of n, start offset per item, duration d. */
export const stagger = (f: number, start: number, i: number, step: number, d: number, ease = smoother) =>
  ease(range(f, start + i * step, start + i * step + d));

/** Fade window with in / out. */
export const window4 = (f: number, a: number, b: number, c: number, d: number) =>
  smooth(range(f, a, b)) * (1 - smooth(range(f, c, d)));

/** Light sweep position 0..1 across [a,b] */
export const sweep = (f: number, a: number, b: number) => cinematic(range(f, a, b));

/** Secondary motion: child layer lags behind parent by `lag` frames, then settles. */
export const settleLag = (f: number, start: number, lag: number, freq = 1.2, zeta = 0.7) =>
  dampedSpring(f - start - lag, freq, zeta);

/** Rotation settling: decaying oscillation around final angle */
export const rotSettle = (f: number, start: number, amp: number, freq = 0.9, zeta = 0.55) =>
  amp * (1 - dampedSpring(f - start, freq, zeta));

/** Parallax offset for depth z (camera x travel dx). */
export const parallax = (dx: number, z: number, focus = 0) => -dx * (z - focus) * 0.08;

/** deterministic PRNG (mulberry32) – stable seeds */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
