import React from 'react';
import * as THREE from 'three';
import {ConvexSolid} from '../../geometry/ConvexSolid';
import {impactSeeds} from '../../geometry/voronoi';
import {makeGlass} from '../../materials/glass';
import {makeMaterial} from '../../materials/presets';
import {easeInCubic, impulse, seg} from '../../core/Timeline';
import {makeShatter} from './makeShatter';

export const DURATION = 17;
const IMPACT = new THREE.Vector3(0.35, 0.45, 1.2).normalize().multiplyScalar(1.3);
const T0 = 5.0;
const pr = makeMaterial('chrome');
const Projectile: React.FC<{t: number; S: number}> = ({t, S}) => {
  const u = seg(t, 3.9, 4.98);   // real-time flight, strikes exactly at warp start
  if (S >= T0 + 0.02 || u <= 0) return null;
  const from = IMPACT.clone().add(new THREE.Vector3(1.6, 0.7, 5.5));
  const p = from.lerp(IMPACT, easeInCubic(u));
  return (
    <group position={p}>
      <mesh material={pr}><sphereGeometry args={[0.07, 24, 16]} /></mesh>
      <mesh position={[0.07, 0.03, 0.25]} rotation={[Math.PI / 2 - 0.2, 0, -0.27]}><cylinderGeometry args={[0.012, 0.0, 0.7, 6]} /><meshBasicMaterial color={new THREE.Color(1.6, 1.8, 2)} transparent opacity={0.6 * u} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} /></mesh>
    </group>
  );
};
const Flash: React.FC<{S: number}> = ({S}) => {
  const k = S < T0 ? 0 : impulse(S - T0, 6);
  if (k < 0.01) return null;
  return <pointLight position={IMPACT.clone().multiplyScalar(1.15)} intensity={40 * k} color={0xbfe6ff} distance={7} decay={1.6} />;
};

export const CrystalImpact = makeShatter({
  duration: DURATION, env: 'glassShowcase', floorY: -2.0,
  camera: [
    [0, [-1.5, 0.5, 9], [0, 0, 0]], [3.2, [-0.3, 0.4, 6.8], [0, 0, 0]], [4.9, [0.9, 0.7, 5.0], [0.2, 0.3, 0.6]],
    [6.4, [1.6, 0.8, 4.2], [0, 0, 0]], [9.0, [0.5, 0.3, 2.2], [0, -0.1, -0.5], 38, 1.5], [11.5, [-1.2, -0.2, 0.2], [0, -0.3, -2.5], 40, 1.5],
    [14, [-2.2, 0.4, 5.2], [0, -1.2, 0]], [17, [1.8, 0.9, 7.2], [0, -1.2, 0]],
  ],
  build: (q) => ({solid: ConvexSolid.sphere(1.3, q === 'preview' ? 260 : q === 'high' ? 520 : 1000), seeds: impactSeeds(q === 'preview' ? 120 : q === 'high' ? 210 : 340, 1.3, IMPACT, 5, 1.7), impact: IMPACT, onSurface: (p) => p.length() > 1.26}),
  skin: () => makeGlass({tint: 0x1a4a7a, opacity: 0.38, rim: [0.5, 0.8, 1.0]}),
  capTint: 0x2a5f9a,
  warp: [[0, 1], [4.8, 1], [5.0, 0.12], [9.5, 0.1], [11.5, 0.45], [13.5, 1], [17, 1]],
  t0: T0, crack: 0.5,
  burst: {speed: 2.4, jitter: 0.7, spin: 4, up: 0.5, gravity: 5.5, restitution: 0.28},
  extras: (t, S) => <><Projectile t={t} S={S} /><Flash S={S} /></>,
  shakes: [{t: 4.98, amp: 0.045, decay: 9}],
});
