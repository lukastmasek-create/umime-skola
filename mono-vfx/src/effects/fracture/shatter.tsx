import React, {useMemo} from 'react';
import * as THREE from 'three';
import {ConvexSolid} from '../../geometry/ConvexSolid';
import {voronoiFracture} from '../../geometry/voronoi';
import {makeGlowCap} from '../katana/slice';

export interface Shard {
  geo: THREE.BufferGeometry; centroid: THREE.Vector3; radius: number; points: THREE.Vector3[]; dist: number;
}
export interface ShardSet { shards: Shard[]; maxDist: number; crackPos: Float32Array; crackD: Float32Array; }

export function buildShards(solid: ConvexSolid, seeds: THREE.Vector3[], impact: THREE.Vector3, onSurface: (p: THREE.Vector3) => boolean, smooth = 30): ShardSet {
  const cells = voronoiFracture(solid, seeds);
  const crackPos: number[] = [], crackD: number[] = [];
  let maxDist = 0.001;
  const shards = cells.map(({solid: s}) => {
    const c = new THREE.Vector3(); let w = 0;
    const pts: THREE.Vector3[] = [];
    for (const poly of s.polys) for (const p of poly.pts) { c.add(p); w++; pts.push(p); }
    c.multiplyScalar(1 / w);
    let rad = 0;
    for (const p of pts) rad = Math.max(rad, p.distanceTo(c));
    const dist = c.distanceTo(impact);
    maxDist = Math.max(maxDist, dist);
    for (const poly of s.polys) if (poly.tag !== 0) {
      const n = poly.pts.length;
      for (let i = 0; i < n; i++) {
        const a = poly.pts[i], b = poly.pts[(i + 1) % n];
        if (onSurface(a) && onSurface(b)) { crackPos.push(a.x, a.y, a.z, b.x, b.y, b.z); crackD.push(a.distanceTo(impact), b.distanceTo(impact)); }
      }
    }
    // unique hull points for collision (subsample)
    const uniq: THREE.Vector3[] = [];
    for (const p of pts) if (!uniq.some((q) => q.distanceToSquared(p) < 1e-6)) uniq.push(p.clone().sub(c));
    const step = Math.max(1, Math.floor(uniq.length / 10));
    return {geo: s.toGeometry(smooth), centroid: c, radius: rad, points: uniq.filter((_, i) => i % step === 0), dist};
  });
  return {shards, maxDist, crackPos: new Float32Array(crackPos), crackD: new Float32Array(crackD)};
}

/** Renders shards at positions/orientations given by xf(). `p` = world position of the shard's centroid. */
export const FragmentField: React.FC<{
  set: ShardSet; skin: THREE.Material; cap: THREE.Material; t: number;
  xf: (i: number, t: number, p: THREE.Vector3, q: THREE.Quaternion) => void;
  visible?: (i: number) => boolean;
}> = ({set, skin, cap, t, xf, visible}) => {
  const p = new THREE.Vector3(), q = new THREE.Quaternion();
  const mats = [skin, cap];
  return (
    <group>
      {set.shards.map((s, i) => {
        if (visible && !visible(i)) return null;
        xf(i, t, p, q);
        return (
          <group key={i} position={[p.x, p.y, p.z]} quaternion={q.clone()}>
            <mesh position={[-s.centroid.x, -s.centroid.y, -s.centroid.z]} geometry={s.geo} material={mats} />
          </group>
        );
      })}
    </group>
  );
};

/** Hairline cracks spreading from the impact: lit where distance < front. */
export const CrackLines: React.FC<{set: ShardSet; front: number; alpha: number; color?: [number, number, number]}> = ({set, front, alpha, color = [1.2, 1.5, 1.8]}) => {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(set.crackPos, 3));
    g.setAttribute('aD', new THREE.BufferAttribute(set.crackD, 1));
    return g;
  }, [set]);
  const mat = useMemo(() => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
    uniforms: {uFront: {value: 0}, uAlpha: {value: 1}, uColor: {value: new THREE.Vector3()}},
    vertexShader: 'attribute float aD; varying float vD; void main(){ vD=aD; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} ',
    fragmentShader: 'uniform float uFront; uniform float uAlpha; uniform vec3 uColor; varying float vD; void main(){ float a = smoothstep(uFront, uFront-0.12, vD) * uAlpha; if(a<0.01) discard; gl_FragColor = vec4(uColor*a, a);} ',
  }), []);
  mat.uniforms.uFront.value = front; mat.uniforms.uAlpha.value = alpha; (mat.uniforms.uColor.value as THREE.Vector3).set(...color);
  return <lineSegments geometry={geo} material={mat} frustumCulled={false} />;
};

export const useCapMat = (tint = 0x2f7a6e, ember: [number, number, number] = [0.2, 0.8, 0.7], hot: [number, number, number] = [0.85, 1, 0.95]) =>
  useMemo(() => {
    const r = makeGlowCap({color: tint, metalness: 0, roughness: 0.01, ember, hot});
    Object.assign(r.mat, {transparent: true, opacity: 0.5, depthWrite: false, side: THREE.DoubleSide, bumpMap: null, map: null, envMapIntensity: 3});
    return r;
  }, [tint]);
