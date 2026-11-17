/** Time helpers. All animation is a pure function of time in seconds. */
export const clamp = (x: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smoothstep = (t: number) => {
  t = clamp(t);
  return t * t * (3 - 2 * t);
};
export const smootherstep = (t: number) => {
  t = clamp(t);
  return t * t * t * (t * (t * 6 - 15) + 10);
};
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
export const easeInOutCubic = (t: number) => {
  t = clamp(t);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
export const easeInCubic = (t: number) => Math.pow(clamp(t), 3);
/** progress of t within [a,b], clamped 0..1 */
export const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));

/**
 * Closed-form damped spring step response from 0 -> 1 starting at t=0.
 * omega: natural freq (rad/s), zeta: damping ratio (<1 under-damped overshoot).
 */
export const springStep = (t: number, omega: number, zeta: number) => {
  if (t <= 0) return 0;
  if (zeta >= 1) {
    return 1 - Math.exp(-omega * t) * (1 + omega * t);
  }
  const wd = omega * Math.sqrt(1 - zeta * zeta);
  const e = Math.exp(-zeta * omega * t);
  return 1 - e * (Math.cos(wd * t) + ((zeta * omega) / wd) * Math.sin(wd * t));
};

/** Decaying impulse: 1 at t=0, 0 later. Used for shake, flashes. */
export const impulse = (t: number, decay: number) => (t < 0 ? 0 : Math.exp(-t * decay));

/** Frame <-> seconds at a fixed 60fps timebase (animation never depends on render quality). */
export const FPS = 60;
export const sec = (s: number) => Math.round(s * FPS);
