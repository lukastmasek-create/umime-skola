import { Easing, interpolate } from 'remotion';
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const ramp = (f: number, a: number, b: number, e = easeInOut) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e });
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
