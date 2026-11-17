import React, {useMemo} from 'react';
import * as THREE from 'three';
import {ConvexSolid} from '../../geometry/ConvexSolid';
import {clamp, easeOutCubic, seg, smoothstep} from '../../core/Timeline';
import {makeObsidianInterior} from '../../materials/presets';

/** A cut plane in object space. n·p = d. Blade travels along `dir` (lies in the plane). */
export interface Cut {
  n: THREE.Vector3;
  d: number;
  t: number;            // slash time (s)
  dir: THREE.Vector3;   // blade direction (unit, ⟂ n)
}
export interface Piece {
  geo: THREE.BufferGeometry;
  signs: number[];                 // +1 / -1 per cut
  centroid: THREE.Vector3;
}

/** Recursively slice a convex solid with all cuts. Exact geometry; every piece is closed with cap faces. */
export function slicePieces(solid: ConvexSolid, cuts: Cut[], smooth = 38): Piece[] {
  let parts: {s: ConvexSolid; signs: number[]}[] = [{s: solid, signs: []}];
  cuts.forEach((c, i) => {
    const next: typeof parts = [];
    for (const p of parts) {
      const {inside, outside} = p.s.clip({n: c.n, d: c.d}, i + 1);
      // outside of clip(inside n·p<=d) is the +n side
      if (outside.polys.length >= 4 && outside.cap()) next.push({s: outside, signs: [...p.signs, +1]});
      if (inside.polys.length >= 4 && inside.cap()) next.push({s: inside, signs: [...p.signs, -1]});
    }
    parts = next;
  });
  return parts.map((p) => {
    const c = new THREE.Vector3(); let w = 0;
    for (const poly of p.s.polys) for (const q of poly.pts) { c.add(q); w++; }
    return {geo: p.s.toGeometry(smooth), signs: p.signs, centroid: c.multiplyScalar(1 / w)};
  });
}

/** Cap material with cooling heat glow concentrated on cut rims. `uGlow` shared uniform. */
export const makeGlowCap = (opts: {color?: number; map?: THREE.Texture | null; metalness?: number; roughness?: number; ember?: [number, number, number]; hot?: [number, number, number]; front?: boolean} = {}) => {
  const uniforms = {uGlow: {value: 0}, uFront: {value: -9}};
  const ember = opts.ember ?? [1.0, 0.22, 0.04], hot = opts.hot ?? [1.0, 0.78, 0.45];
  const m = new THREE.MeshPhysicalMaterial({
    color: opts.color ?? 0xffffff, map: opts.map ?? null, bumpMap: opts.map ?? null, bumpScale: 1.2,
    roughness: opts.roughness ?? 0.2, metalness: opts.metalness ?? 0, clearcoat: opts.metalness ? 0 : 0.9, clearcoatRoughness: 0.06, envMapIntensity: 1.3,
  });
  const v3 = (a: number[]) => `vec3(${a.map((x) => x.toFixed(3)).join(',')})`;
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uGlow = uniforms.uGlow; sh.uniforms.uFront = uniforms.uFront;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float aEdge;\nvarying float vEdge;\nvarying float vCapU;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvEdge = aEdge; vCapU = uv.x;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uGlow;\nuniform float uFront;\nvarying float vEdge;\nvarying float vCapU;')
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        float rim = 1.0 - vEdge;
        float heat = pow(rim, 11.0) * 0.8 + pow(rim, 28.0) * 5.0;
        vec3 ember = mix(${v3(ember)}, ${v3(hot)}, pow(rim, 20.0));
        float fr = exp(-pow((vCapU - uFront) * 14.0, 2.0)) * 2.2;
        totalEmissiveRadiance += ember * heat * uGlow + ${v3(hot)} * fr * step(-5.0, uFront);`);
  };
  return {mat: m, uniforms};
};

export const useInterior = (seed = 11) => useMemo(() => makeObsidianInterior(seed), [seed]);

/** Thin additive blade-streak along the cut. Pass-through lasts ~4 frames. */
export const Streak: React.FC<{t: number; cut: Cut; z?: number; length?: number; tail?: number; origin?: THREE.Vector3; tint?: [number, number, number]}> = ({t, cut, z = 1.8, length = 9, tail = 3.4, origin, tint = [1.6, 1.2, 0.9]}) => {
  const tex = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 512; c.height = 16;
    const g = c.getContext('2d')!;
    const gr = g.createLinearGradient(0, 0, 512, 0);
    gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.75, 'rgba(255,240,225,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,1)');
    g.fillStyle = gr; g.fillRect(0, 0, 512, 16);
    const vg = g.createLinearGradient(0, 0, 0, 16);
    vg.addColorStop(0, 'rgba(0,0,0,1)'); vg.addColorStop(0.5, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,1)');
    g.globalCompositeOperation = 'destination-out'; g.fillStyle = vg; g.fillRect(0, 0, 512, 16);
    return new THREE.CanvasTexture(c);
  }, []);
  const u = (t - cut.t) / 0.07;
  if (u < 0 || u > 3.2) return null;
  const head = -length / 2 + length * easeOutCubic(clamp(u));
  const tl = Math.max(-length / 2, head - tail * (u < 1 ? clamp(u * 1.4) : 1));
  const len = Math.max(0.01, head - tl), mid = (head + tl) / 2;
  const fade = 1 - smoothstep(seg(u, 1.0, 3.2));
  // streak lies in the view plane (xy) projected from the cut's in-plane direction
  const dir = new THREE.Vector2(cut.dir.x, cut.dir.y).normalize();
  const ang = Math.atan2(dir.y, dir.x);
  const o = origin ?? cut.n.clone().multiplyScalar(cut.d);
  return (
    <group position={[o.x + dir.x * mid, o.y + dir.y * mid, z]} rotation={[0, 0, ang]} renderOrder={20}>
      <mesh scale={[len, 0.022, 1]}><planeGeometry /><meshBasicMaterial map={tex} transparent opacity={fade} blending={THREE.AdditiveBlending} depthTest={false} depthWrite={false} toneMapped={false} color={new THREE.Color(3, 3, 3)} /></mesh>
      <mesh scale={[len, 0.16, 1]}><planeGeometry /><meshBasicMaterial map={tex} transparent opacity={0.22 * fade} blending={THREE.AdditiveBlending} depthTest={false} depthWrite={false} toneMapped={false} color={new THREE.Color(...tint)} /></mesh>
    </group>
  );
};

export const cutFrom = (angleDeg: number, t: number, offset = 0, tiltZ = 0): Cut => {
  // plane contains world z (blade depth); angle = direction of blade in xy plane
  const a = THREE.MathUtils.degToRad(angleDeg);
  const dir = new THREE.Vector3(Math.cos(a), Math.sin(a), 0);
  const n = new THREE.Vector3(-Math.sin(a), Math.cos(a), 0);
  if (tiltZ) { n.z = tiltZ; n.normalize(); dir.sub(n.clone().multiplyScalar(dir.dot(n))).normalize(); }
  return {n, d: offset, t, dir};
};

/** Renders sliced pieces. Each piece moves along ±n of every cut it lies on, scaled by sep(cutIndex,t). */
export const SlicedObject: React.FC<{
  pieces: Piece[]; cuts: Cut[]; skin: THREE.Material; cap: THREE.Material; t: number;
  sep: (ci: number, t: number) => number;
  tumble?: (pi: number, t: number) => [number, number, number];
  extra?: (pi: number, t: number) => [number, number, number];
}> = ({pieces, cuts, skin, cap, t, sep, tumble, extra}) => (
  <group>
    {pieces.map((p, pi) => {
      const pos = new THREE.Vector3();
      p.signs.forEach((s, ci) => pos.addScaledVector(cuts[ci].n, s * sep(ci, t)));
      if (extra) pos.add(new THREE.Vector3(...extra(pi, t)));
      const e = tumble ? tumble(pi, t) : [0, 0, 0];
      return (
        <group key={pi} position={[pos.x + p.centroid.x, pos.y + p.centroid.y, pos.z + p.centroid.z]} rotation={new THREE.Euler(e[0], e[1], e[2])}>
          <mesh position={[-p.centroid.x, -p.centroid.y, -p.centroid.z]} geometry={p.geo} material={[skin, cap]} />
        </group>
      );
    })}
  </group>
);
