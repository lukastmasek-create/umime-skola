import * as THREE from 'three';
import {G} from '../film';
import {dampedSpring, easeInOutQuart, lerp, range, smooth, smoother, cinematic, stagger} from './motion';

export type CardState = {pos: THREE.Vector3; rotY: number; rotX: number; rotZ: number; scale: number; flip: number; opacity: number};
type V = [number, number, number];

// Album universe slots (shot 3)
export const ALBUM_SLOTS: {p: V; ry: number}[] = [
  {p: [-0.95, 0.05, -0.6], ry: 0.3},
  {p: [0.95, 0.38, -3.1], ry: -0.32},
  {p: [-0.95, -0.12, -5.7], ry: 0.32},
  {p: [0.95, 0.28, -8.3], ry: -0.3},
];
// Playlist quincunx (shot 4): TL, TR, BL, BR then centre
export const GRID_SLOTS: {p: V; ry: number}[] = [
  {p: [-0.62, 1.52, -0.35], ry: 0.0},
  {p: [0.62, 1.52, 0.15], ry: 0.0},
  {p: [-0.62, -1.52, 0.1], ry: 0.0},
  {p: [0.62, -1.52, -0.4], ry: 0.0},
  {p: [0, 0, 0.55], ry: 0.0},
];
export const PL_KEYS = ['top', 'rap', 'radar', 'mint', 'discover'];
export const ALBUM_KEYS = ['weeknd', 'daft', 'billie', 'travis'] as const;
export const PLAYER_SCALE = 1.5;

/** Choreography of the 5 gallery cards over shots 3–5 (frames 420…1140). */
export function cardState(i: number, f: number): CardState {
  const g = new THREE.Vector3(...G);
  const out: CardState = {pos: new THREE.Vector3(), rotY: 0, rotX: 0, rotZ: 0, scale: 1, flip: 0, opacity: 1};
  if (i < 4) {
    const a = ALBUM_SLOTS[i], t = GRID_SLOTS[i];
    // slow idle drift in the universe
    const drift = Math.sin((f + i * 40) / 95) * 0.035;
    const A = new THREE.Vector3(...a.p).add(new THREE.Vector3(0, drift, 0));
    // alignment into the grid: staggered, mechanical (cinematic ease, no overshoot) then a small settle
    const e = stagger(f, 592, 3 - i, 9, 84, cinematic);
    const T = new THREE.Vector3(...t.p).add(g);
    out.pos.copy(A).lerp(T, e);
    // arc a little outwards so cards never intersect on the way
    out.pos.x += Math.sin(e * Math.PI) * (i % 2 ? 0.5 : -0.5);
    const fl = stagger(f, 628, 3 - i, 9, 64, easeInOutQuart);     // flip album → playlist
    out.flip = fl;
    out.rotY = lerp(a.ry, 0, e) + Math.PI * fl;
    out.rotZ = Math.sin(e * Math.PI) * 0.04 * (i % 2 ? 1 : -1);
    out.scale = 1;
    // shot 5: recede while the centre card becomes the player
    const rec = smoother(range(f, 905, 985));
    const dir = new THREE.Vector3(t.p[0] > 0 ? 1 : -1, t.p[1] > 0 ? 1 : -1, 0);
    out.pos.add(new THREE.Vector3(dir.x * 1.4, dir.y * 2.6, -3.2).multiplyScalar(rec));
    out.opacity = 1 - smooth(range(f, 930, 985));
    out.rotY += rec * 0.5 * dir.x;
  } else {
    // centre playlist: slides up from below into the grid, then expands into the player
    const rise = easeInOutQuart(range(f, 622, 700));
    const T = new THREE.Vector3(...GRID_SLOTS[4].p).add(g);
    out.pos.copy(T).add(new THREE.Vector3(0, -1.2 * (1 - rise), -1.4 * (1 - rise)));
    out.rotY = Math.PI;  // playlist plate faces camera
    out.opacity = smooth(range(f, 622, 662));
    const grow = easeInOutQuart(range(f, 905, 1000));
    out.scale = lerp(1, PLAYER_SCALE, grow);
    out.pos.z += grow * 0.6;
    out.flip = 1;
  }
  return out;
}
export const morphToPlayer = (f: number) => smoother(range(f, 940, 996));
export const pressAmount = (f: number) => (f < 1004 ? 0 : f < 1016 ? smooth(range(f, 1004, 1016)) : 1 - dampedSpring(f - 1016, 2.2, 0.5));
