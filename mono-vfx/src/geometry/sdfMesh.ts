import * as THREE from 'three';
import {edgeTable as _et, triTable as _tt} from 'three/examples/jsm/objects/MarchingCubes.js';
// @types declares these as Int32Array[]; at runtime they are flat Int32Arrays.
const edgeTable = _et as unknown as Int32Array, triTable = _tt as unknown as Int32Array;

/** Signed-distance primitives + smooth ops (negative inside). */
export type SDF = (x: number, y: number, z: number) => number;
export const sdSphere = (cx: number, cy: number, cz: number, r: number): SDF => (x, y, z) => Math.hypot(x - cx, y - cy, z - cz) - r;
export const sdBox = (cx: number, cy: number, cz: number, hx: number, hy: number, hz: number, round = 0): SDF => (x, y, z) => {
  const qx = Math.abs(x - cx) - hx + round, qy = Math.abs(y - cy) - hy + round, qz = Math.abs(z - cz) - hz + round;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qy, qz), 0) - round;
};
export const sdTorusY = (cx: number, cy: number, cz: number, R: number, r: number): SDF => (x, y, z) => Math.hypot(Math.hypot(x - cx, z - cz) - R, y - cy) - r;
export const sdCapsule = (a: THREE.Vector3, b: THREE.Vector3, r: number): SDF => {
  const ab = b.clone().sub(a), l2 = ab.lengthSq();
  return (x, y, z) => {
    const px = x - a.x, py = y - a.y, pz = z - a.z;
    const h = l2 < 1e-9 ? 0 : Math.min(1, Math.max(0, (px * ab.x + py * ab.y + pz * ab.z) / l2));
    return Math.hypot(px - ab.x * h, py - ab.y * h, pz - ab.z * h) - r;
  };
};
export const smin = (a: number, b: number, k: number) => {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
};
export const mixSDF = (a: SDF, b: SDF, u: number): SDF => (x, y, z) => a(x, y, z) * (1 - u) + b(x, y, z) * u;
export const unionSDF = (list: SDF[], k: number): SDF => (x, y, z) => {
  let d = list[0](x, y, z);
  for (let i = 1; i < list.length; i++) d = smin(d, list[i](x, y, z), k);
  return d;
};

const EDGE_V: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
const CORNER: [number, number, number][] = [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]];

/** Marching-cubes polygonizer for an SDF (iso = 0). Normals from the field gradient -> smooth chrome-ready surface. */
export function polygonize(field: SDF, resIn: number | [number, number, number], min: THREE.Vector3, max: THREE.Vector3): THREE.BufferGeometry {
  const [rx, ry, rz] = typeof resIn === 'number' ? [resIn, resIn, resIn] : resIn;
  const nx = rx + 1, ny = ry + 1, nz = rz + 1;
  const step = new THREE.Vector3((max.x - min.x) / rx, (max.y - min.y) / ry, (max.z - min.z) / rz);
  const vals = new Float32Array(nx * ny * nz);
  const id = (i: number, j: number, k: number) => i + nx * (j + ny * k);
  for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++)
    vals[id(i, j, k)] = field(min.x + i * step.x, min.y + j * step.y, min.z + k * step.z);
  const pos: number[] = [], nor: number[] = [];
  const e = Math.min(step.x, step.y, step.z) * 0.5;
  const grad = (x: number, y: number, z: number) => {
    const gx = field(x + e, y, z) - field(x - e, y, z), gy = field(x, y + e, z) - field(x, y - e, z), gz = field(x, y, z + e) - field(x, y, z - e);
    const l = Math.hypot(gx, gy, gz) || 1;
    return [gx / l, gy / l, gz / l];
  };
  const v = new Float32Array(8);
  const ep: number[][] = Array.from({length: 12}, () => [0, 0, 0]);
  for (let k = 0; k < rz; k++) for (let j = 0; j < ry; j++) for (let i = 0; i < rx; i++) {
    let ci = 0;
    for (let c = 0; c < 8; c++) {
      v[c] = vals[id(i + CORNER[c][0], j + CORNER[c][1], k + CORNER[c][2])];
      if (v[c] < 0) ci |= 1 << c;
    }
    const em = edgeTable[ci];
    if (!em) continue;
    for (let ed = 0; ed < 12; ed++) {
      if (!(em & (1 << ed))) continue;
      const [a, b] = EDGE_V[ed];
      const t = v[a] / (v[a] - v[b]);
      ep[ed][0] = min.x + (i + CORNER[a][0] + (CORNER[b][0] - CORNER[a][0]) * t) * step.x;
      ep[ed][1] = min.y + (j + CORNER[a][1] + (CORNER[b][1] - CORNER[a][1]) * t) * step.y;
      ep[ed][2] = min.z + (k + CORNER[a][2] + (CORNER[b][2] - CORNER[a][2]) * t) * step.z;
    }
    for (let t = ci * 16; triTable[t] !== -1 && t < ci * 16 + 16; t += 3) {
      for (let q = 2; q >= 0; q--) {            // reversed winding -> outward-facing
        const p = ep[triTable[t + q]];
        pos.push(p[0], p[1], p[2]);
        const g = grad(p[0], p[1], p[2]);
        nor.push(g[0], g[1], g[2]);
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  return g;
}

/** Keep the last few polygonized frames so the mirrored reflection pass does not pay twice. */
const CACHE = new Map<string, THREE.BufferGeometry>();
export function polygonizeCached(key: string, build: () => THREE.BufferGeometry) {
  let g = CACHE.get(key);
  if (!g) { g = build(); CACHE.set(key, g); if (CACHE.size > 3) { const k = CACHE.keys().next().value as string; CACHE.get(k)!.dispose(); CACHE.delete(k); } }
  return g;
}
export const resFor = (quality: string, lo = 44, hi = 72, ultra = 104) => (quality === 'preview' ? lo : quality === 'high' ? hi : ultra);
