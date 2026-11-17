import * as THREE from 'three';
import {ConvexSolid} from './ConvexSolid';
import {makeRng} from '../core/DeterministicRandom';

/** Voronoi fracture of a convex solid: each cell is the solid clipped by the bisector planes to every other seed. */
export function voronoiFracture(solid: ConvexSolid, seeds: THREE.Vector3[]): {solid: ConvexSolid; seed: THREE.Vector3}[] {
  const out: {solid: ConvexSolid; seed: THREE.Vector3}[] = [];
  for (let i = 0; i < seeds.length; i++) {
    let s = solid;
    const order = seeds.map((p, j) => ({j, d: p.distanceToSquared(seeds[i])})).sort((a, b) => a.d - b.d);
    for (const {j} of order) {
      if (j === i) continue;
      const n = seeds[j].clone().sub(seeds[i]);
      const m = seeds[j].clone().add(seeds[i]).multiplyScalar(0.5);
      const nn = n.clone().normalize();
      s = s.clip({n: nn, d: nn.dot(m)}, 2).inside;
      if (s.polys.length < 4) break;
    }
    if (s.polys.length >= 4) out.push({solid: s, seed: seeds[i]});
  }
  return out;
}

/** Seeds clustered around an impact point (dense near it, sparse far away) – looks like real fracture. */
export function impactSeeds(count: number, radius: number, impact: THREE.Vector3, seed = 5, bias = 1.9): THREE.Vector3[] {
  const r = makeRng(seed);
  return Array.from({length: count}, () => {
    const dir = new THREE.Vector3(r.range(-1, 1), r.range(-1, 1), r.range(-1, 1)).normalize();
    const rad = Math.pow(r.next(), bias) * radius * 1.6;
    return impact.clone().addScaledVector(dir, rad);
  });
}
export const uniformSeeds = (count: number, half: THREE.Vector3, seed = 9) => {
  const r = makeRng(seed);
  return Array.from({length: count}, () => new THREE.Vector3(r.range(-half.x, half.x), r.range(-half.y, half.y), r.range(-half.z, half.z)));
};
