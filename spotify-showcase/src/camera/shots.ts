import * as THREE from 'three';
import {CamChain, V3} from './rig';
import {P2, STUDIO} from '../film';
import {phoneQuat1} from '../scenes/FirstLight';
import {axisAt} from '../scenes/InsideTheSound';
import {WAVE_CURVE, headProgress} from '../components/Waveform3D';

const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
type E4 = [number, number, number, number];
const E_IO: E4 = [0.45, 0, 0.2, 1];
const E_SOFT: E4 = [0.35, 0, 0.3, 1];

// ---- SHOT 01: macro on the glass edge → pull back to reveal → push into the screen ----
const q0 = phoneQuat1(0);
const toW = (q: THREE.Quaternion, v: V3): V3 => { const r = new THREE.Vector3(...v).applyQuaternion(q); return [r.x, r.y, r.z]; };
const edge0 = toW(q0, [0.348, 0.52, 0.03]);
const camMacro = add(edge0, toW(q0, [-0.22, -0.04, 0.24]));
export const SCREEN_D = 2.59, SCREEN_FOV = 27;
const chain1: CamChain = {
  from: 0, to: 179, blur: 16, keys: [
    {f: 0, pos: camMacro, target: edge0, fov: 15},
    {f: 50, pos: [0.7, 0.35, 2.3], target: [0.05, 0.12, 0], fov: 18, ease: E_IO},
    {f: 104, pos: [0.9, 0.2, 5.3], target: [0, 0, 0], fov: 24, ease: E_IO},
    {f: 179, pos: [0, 0, SCREEN_D], target: [0, 0, 0], fov: SCREEN_FOV, ease: [0.5, 0, 0.3, 1]},
  ],
};

// ---- SHOT 02: layered interface, orbit ~25° ----
const rel = (p: V3): V3 => add(P2, p);
const chain2: CamChain = {
  from: 180, to: 419, blur: 12, keys: [
    {f: 180, pos: rel([0, 0, SCREEN_D]), target: rel([0, 0, 0]), fov: SCREEN_FOV},
    {f: 250, pos: rel([0.62, 0.10, 2.9]), target: rel([0, 0.12, 0.12]), fov: 27, ease: E_IO},
    {f: 340, pos: rel([-0.75, 0.16, 2.7]), target: rel([0, 0.12, 0.2]), fov: 27, ease: E_IO},
    {f: 419, pos: rel([-0.15, 0.08, 2.5]), target: rel([0, 0.1, 0.3]), fov: 27, ease: E_IO},
  ],
};

// ---- SHOTS 03–07: one continuous camera chain through the whole world ----
const ax = (z: number, dx = 0, dy = 0): V3 => { const a = axisAt(z); return [a.x + dx, a.y + dy, z]; };
const S: V3 = STUDIO;
// camera follows the head of the drawn-on waveform (derived from the curve itself)
const wp = (u: number): V3 => { const p = WAVE_CURVE.getPointAt(Math.min(1, Math.max(0, u))); return [p.x, p.y, p.z]; };
const WAVE_FOLLOW = [1090, 1130, 1170, 1210, 1240].map((f) => {
  const u = headProgress(f), zoff = 3.4 - 1.4 * Math.min(1, (f - 1090) / 150);
  return {f, pos: add(wp(Math.max(0.01, u - 0.05)), [1.3, 0.35, zoff]), target: wp(Math.max(0.01, u - 0.045)), fov: 32, ease: E_SOFT};
});
const chain3: CamChain = {
  from: 420, to: 1799, blur: 14, keys: [
    // Album universe (curved trajectory; look-ahead on each album)
    {f: 420, pos: [0.45, 0.08, 3.0], target: [-0.95, 0.05, -0.6], fov: 33},
    {f: 470, pos: [0.85, 0.14, 1.9], target: [-0.95, 0.05, -0.6], fov: 33, ease: E_SOFT},
    {f: 514, pos: [0.25, 0.26, -0.2], target: [0.95, 0.38, -3.1], fov: 34, ease: E_SOFT},
    {f: 562, pos: [-0.2, 0.1, -2.7], target: [-0.95, -0.12, -5.7], fov: 34, ease: E_SOFT},
    {f: 614, pos: [0.2, 0.2, -5.2], target: [0.95, 0.28, -8.3], fov: 34, ease: E_SOFT},
    // Playlist gallery — slow lateral dolly (parallax)
    {f: 666, pos: [0.75, 0.3, -3.4], target: [0, -0.45, -14], fov: 34, ease: E_IO},
    {f: 780, pos: [0.0, 0.3, -3.7], target: [0, -0.45, -14], fov: 34},
    {f: 880, pos: [-0.8, 0.3, -3.9], target: [0, -0.45, -14], fov: 34},
    // push into the centre playlist → player
    {f: 960, pos: [-0.15, 0.05, -6.2], target: [0, -0.2, -12.8], fov: 32, ease: E_IO},
    {f: 1008, pos: [0.0, 0.0, -6.0], target: [0, -0.1, -12.8], fov: 31, ease: E_SOFT},
    {f: 1052, pos: [0.55, -0.45, -8.0], target: [0.55, -0.7, -12.9], fov: 29, ease: E_SOFT},
    ...WAVE_FOLLOW,
    {f: 1262, pos: [0.2, 0.3, -35.5], target: [-0.3, 0.0, -45.0], fov: 32, ease: E_SOFT},
    // inside the sculpture
    {f: 1320, pos: ax(-52, 0.25, 0.15), target: ax(-62), fov: 34, ease: E_SOFT},
    {f: 1380, pos: ax(-68, -0.3, 0.1), target: ax(-80), fov: 34, ease: E_SOFT},
    {f: 1440, pos: ax(-86, 0, 0), target: ax(-98), fov: 32, ease: E_SOFT},
    // emerge into the studio
    {f: 1510, pos: [0.05, 0.25, S[2] + 24], target: [S[0], S[1] - 0.2, S[2]], fov: 30, ease: E_SOFT},
    {f: 1620, pos: [S[0] + 0.5, S[1] + 0.12, S[2] + 6.1], target: [S[0], S[1] - 0.36, S[2]], fov: 28, ease: [0.25, 0.1, 0.2, 1]},
    {f: 1799, pos: [S[0] + 0.45, S[1] + 0.1, S[2] + 5.85], target: [S[0], S[1] - 0.36, S[2]], fov: 28, ease: [0.3, 0.2, 0.7, 0.9]},
  ],
};
export const CHAINS: CamChain[] = [chain1, chain2, chain3];
