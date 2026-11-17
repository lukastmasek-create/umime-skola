import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Stage, EffectProps} from '../../core/Stage';
import {ConvexSolid, Plane3} from '../../geometry/ConvexSolid';
import {impactSeeds, uniformSeeds} from '../../geometry/voronoi';
import {makeGlass} from '../../materials/glass';
import {makeMaterial} from '../../materials/presets';
import {makeRng} from '../../core/DeterministicRandom';
import {camFrom, fadeIn, sweepEnv} from '../../core/kit';
import {easeInCubic, seg, smootherstep, springStep, lerp} from '../../core/Timeline';
import {buildShards, FragmentField, useCapMat} from './shatter';
import {makeShatter} from './makeShatter';

/* ───────── 07 Tempered Glass Explosion ───────── */
export const D07 = 14;
export const GlassExplosion = makeShatter({
  duration: D07, env: 'glassShowcase', floorY: -1.9,
  camera: [
    [0, [-3, 1.0, 9], [0, 0, 0]], [3.5, [-1.4, 0.7, 7.2], [0, 0, 0]], [5.0, [-0.6, 0.4, 6.0], [0, 0, 0]],
    [6.5, [0.8, 0.6, 7.5], [0, 0.1, 0]], [9.5, [1.8, 0.8, 5.0], [0, -0.2, 0]], [14, [-1.5, 0.9, 8.0], [0, -0.3, 0]],
  ],
  build: (q) => {
    const c = new THREE.Vector3(0, 0, 0);
    return {solid: ConvexSolid.roundedCube(1.1, 0.04, 3), seeds: impactSeeds(q === 'preview' ? 150 : q === 'high' ? 300 : 520, 1.1, c, 12, 0.9), impact: c, onSurface: (p) => Math.max(Math.abs(p.x), Math.abs(p.y), Math.abs(p.z)) > 1.07};
  },
  skin: () => makeGlass({tint: 0x2c7f74, opacity: 0.3, rim: [0.6, 1, 0.95]}),
  capTint: 0x3b9a8c,
  warp: [[0, 1], [4.95, 1], [5.4, 0.3], [8.5, 0.28], [10, 0.7], [11.5, 1], [14, 1]],
  t0: 5.0, crack: 0.35,
  burst: {speed: 4.2, jitter: 0.9, spin: 7, up: 0.8, gravity: 6.5, restitution: 0.3},
  shakes: [{t: 5.0, amp: 0.05, decay: 10}],
});

/* ───────── 09 Fracture Propagation ───────── */
export const D09 = 17;
const SLAB_IMPACT = new THREE.Vector3(-0.35, -1.0, 0.18);
export const FracturePropagation = makeShatter({
  duration: D09, env: 'highContrastMetallic', floorY: -2.9, pm: 1.9,
  camera: [
    [0, [-1.8, 0.2, 9.5], [0, 0, 0], 30], [3.5, [-0.8, -0.3, 6.8], [-0.2, -0.6, 0]], [5.2, [-0.4, -0.8, 3.0], [-0.35, -1.0, 0.18], 34, 1.4],
    [7.0, [0.2, -0.2, 3.2], [-0.1, -0.2, 0.18], 34, 1.4], [8.8, [0.6, 0.6, 3.6], [0.1, 0.6, 0.18], 34, 1.4],
    [10.5, [0.0, 0.5, 8.0], [0, 0.2, 0], 30], [13, [2.8, 0.2, 8.5], [0, -0.8, 0]], [17, [-1.4, 0.4, 9.5], [0, -1.6, 0]],
  ],
  build: (q) => {
    const slab = ConvexSolid.roundedCube(1, 0.02, 3);
    // stretch box -> slab 1.6 x 2.6 x 0.36 via planes
    const solid = ConvexSolid.fromPlanes([
      {n: new THREE.Vector3(1, 0, 0), d: 0.85}, {n: new THREE.Vector3(-1, 0, 0), d: 0.85}, {n: new THREE.Vector3(0, 1, 0), d: 1.4}, {n: new THREE.Vector3(0, -1, 0), d: 1.4},
      {n: new THREE.Vector3(0, 0, 1), d: 0.18}, {n: new THREE.Vector3(0, 0, -1), d: 0.18},
      ...[[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([a, b]) => ({n: new THREE.Vector3(a, b, 0).normalize(), d: 1.58} as Plane3)),
    ]);
    void slab;
    return {solid, seeds: impactSeeds(q === 'preview' ? 9 : 13, 1.4, SLAB_IMPACT, 21, 1.0), impact: SLAB_IMPACT, onSurface: (p) => Math.abs(p.z) > 0.175};
  },
  skin: () => { const m = makeMaterial('stone', {color: 0x1b1d20}); m.roughness = 0.12; m.clearcoat = 1; m.envMapIntensity = 1.6; return m; },
  capTint: 0x9a8f80,
  warp: [[0, 1], [5.0, 1], [5.2, 0.7], [17, 0.7]],
  t0: 5.2, crack: 3.6, crackLines: true,
  burst: {speed: 0.35, jitter: 0.25, spin: 0.7, up: 0, gravity: 3.5, restitution: 0.15},
});

/* ───────── 10 Frozen Destruction ───────── */
export const D10 = 16;
const sculptPlanes = (): Plane3[] => {
  const pl: Plane3[] = [];
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    pl.push({n: new THREE.Vector3(Math.cos(a), 0.25, Math.sin(a)).normalize(), d: 0.9}, {n: new THREE.Vector3(Math.cos(a + 0.35), -0.35, Math.sin(a + 0.35)).normalize(), d: 0.95});
  }
  pl.push({n: new THREE.Vector3(0, 1, 0), d: 1.35}, {n: new THREE.Vector3(0, -1, 0), d: 1.35});
  return pl;
};
const CENTER = new THREE.Vector3(0.15, 0.2, 0.2);
export const FrozenDestruction = makeShatter({
  duration: D10, env: 'glassShowcase', floorY: -3.2,
  camera: [
    [0, [-2, 0.9, 9], [0, 0, 0]], [4.0, [-0.8, 0.5, 6.8], [0, 0, 0]], [5.6, [0.3, 0.4, 6.0], [0, 0, 0]],
    [7.0, [1.0, 0.5, 5.2], [0, 0.2, 0]],
    // time frozen (real 6.6 .. 11.4): fly through the suspended cloud
    [8.0, [0.4, 0.4, 2.2], [0, 0.1, -1.5], 38, 1.5], [9.4, [-0.3, 0.2, -0.6], [0, 0, -4], 40, 1.5], [10.8, [-0.2, 0.3, -2.0], [-0.5, 0.2, -5], 40, 1.5],
    [12.4, [-1.6, 0.6, -4.8], [0, -0.5, 0], 34, 1.6], [16, [1.2, 0.6, 7.5], [0, -1.4, 0]],
  ],
  build: (q) => ({solid: ConvexSolid.fromPlanes(sculptPlanes()), seeds: impactSeeds(q === 'preview' ? 120 : q === 'high' ? 240 : 420, 1.3, CENTER, 8, 1.2), impact: CENTER, onSurface: (p) => p.length() > 1.0}),
  skin: () => makeGlass({tint: 0x6a2a7a, opacity: 0.34, rim: [1.0, 0.55, 0.9]}),
  capTint: 0x8f3a9a,
  warp: [[0, 1], [4.95, 1], [5.2, 0.55], [6.2, 0.12], [6.7, 0.004], [11.3, 0.004], [12.0, 0.2], [13.2, 1], [16, 1]],
  t0: 5.0, crack: 0.3, crackLines: false,
  burst: {speed: 5.0, jitter: 1.1, spin: 5, up: 0.5, gravity: 5.5, restitution: 0.3},
  shakes: [{t: 5.0, amp: 0.05, decay: 10}],
});

/* ───────── 08 Reverse Shatter ───────── */
export const D08 = 15;
export const ReverseShatter: React.FC<EffectProps> = (props) => {
  const data = useMemo(() => {
    const solid = ConvexSolid.sphere(1.25, props.quality === 'preview' ? 260 : 520);
    const seeds = impactSeeds(props.quality === 'preview' ? 120 : 220, 1.25, new THREE.Vector3(0.3, 0.5, 1.2), 3, 1.3);
    const set = buildShards(solid, seeds, new THREE.Vector3(0.3, 0.5, 1.2), () => false);
    const r = makeRng(88);
    const info = set.shards.map((s) => {
      const dir = new THREE.Vector3(r.range(-1, 1), r.range(-1, 1), r.range(-1, 1)).normalize();
      const start = s.centroid.clone().multiplyScalar(1.0).addScaledVector(dir, r.range(2.0, 5.5)).add(new THREE.Vector3(0, 0.3, 0));
      const q0 = new THREE.Quaternion().setFromEuler(new THREE.Euler(r.range(-3, 3), r.range(-3, 3), r.range(-3, 3)));
      const swirl = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize().multiplyScalar(r.range(0.6, 1.4));
      const delay = 2.0 + (1 - s.centroid.y / 1.3) * 0.5 * 2 + r.range(0, 2.2);
      return {start, q0, swirl, delay, dur: r.range(2.6, 3.6)};
    });
    return {set, info, whole: solid.toGeometry(30), lock: Math.max(...info.map((f) => f.delay + f.dur)) + 0.4};
  }, [props.quality]);
  const skin = useMemo(() => makeGlass({tint: 0x2a6a60, opacity: 0.3, rim: [0.6, 1, 0.95]}), []);
  const {mat: cap} = useCapMat();
  return (
    <Stage {...props} spec={{
      env: 'glassShowcase', floorY: -2.2,
      camera: camFrom([[0, [-1.5, 0.8, 10], [0, 0, 0]], [4, [-2.6, 0.9, 8.5], [0, 0, 0]], [8, [1.2, 0.5, 7.0], [0, 0, 0]], [11.5, [1.6, 0.3, 5.6], [0, 0, 0]], [15, [0.4, 0.4, 6.4], [0, 0, 0]]], 2.0),
      exposure: (t) => fadeIn(t), envRotation: (t) => sweepEnv(t, 0.3, 11, -0.9, 0.2, 0, 15) + 1.6 * smootherstep(seg(t, 12.4, 14.4)),
    }}
      render={(t) => (
        <>
          {t > data.lock && <mesh geometry={data.whole} material={[skin, cap]} />}
          {t <= data.lock && <FragmentField set={data.set} skin={skin} cap={cap} t={t} xf={(i, tt, p, q) => {
            const f = data.info[i], s = data.set.shards[i];
            const u = seg(tt, f.delay, f.delay + f.dur), e = easeInCubic(u) * 0.55 + smootherstep(u) * 0.45;
            p.copy(f.start).lerp(s.centroid, e).addScaledVector(f.swirl, Math.sin(Math.PI * e) * 1.2 * (1 - u * 0.5));
            // final mechanical lock: tiny overshoot then settle
            const k = springStep(tt - (f.delay + f.dur), 22, 0.35) - 1;
            p.addScaledVector(s.centroid.clone().normalize(), -0.02 * k * (u >= 1 ? 1 : 0));
            q.copy(f.q0).slerp(new THREE.Quaternion(), smootherstep(u));
            if (u === 0) p.add(new THREE.Vector3(0, Math.sin(tt * 0.8 + i) * 0.05, 0));
          }} />}
        </>
      )} />
  );
};
void lerp; void uniformSeeds;
