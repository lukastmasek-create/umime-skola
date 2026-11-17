import type {CamKey} from './CameraRig';
import {seg, smootherstep} from './Timeline';

export type V3 = [number, number, number];
/** [time, position, target, fov?, portraitMultiplier?] – positions are for 16:9; portrait pushes the camera out radially. */
export type KeySpec = [number, V3, V3, number?, number?];
export const camFrom = (specs: KeySpec[], pm = 2.2) => (portrait: boolean): CamKey[] =>
  specs.map(([t, p, tg, fov, m]) => {
    const k = portrait ? (m ?? pm) : 1;
    return {t, pos: [tg[0] + (p[0] - tg[0]) * k, tg[1] + (p[1] - tg[1]) * k, tg[2] + (p[2] - tg[2]) * k] as V3, target: tg, fov: fov ?? 30};
  });
export const fadeIn = (t: number, dur = 2.4) => smootherstep(seg(t, 0, dur));
export const sweepEnv = (t: number, a: number, b: number, from = -0.9, to = 0.6, drift = 0.3, end = 16) => from + (to - from) * smootherstep(seg(t, a, b)) + drift * seg(t, b, end);

/** Piecewise-linear speed profile -> time warp (real t -> sim t). Slow motion without touching physics. */
export const makeWarp = (speeds: [number, number][]) => {
  const ts = speeds.map((s) => s[0]), vs = speeds.map((s) => s[1]);
  const cum = [0];
  for (let i = 1; i < ts.length; i++) cum.push(cum[i - 1] + ((vs[i - 1] + vs[i]) / 2) * (ts[i] - ts[i - 1]));
  return (t: number) => {
    if (t <= ts[0]) return t * vs[0];
    for (let i = 1; i < ts.length; i++) if (t <= ts[i]) {
      const u = t - ts[i - 1], dt = ts[i] - ts[i - 1], v0 = vs[i - 1], v1 = vs[i];
      return cum[i - 1] + v0 * u + ((v1 - v0) / (2 * dt)) * u * u;
    }
    return cum[cum.length - 1] + vs[vs.length - 1] * (t - ts[ts.length - 1]);
  };
};
