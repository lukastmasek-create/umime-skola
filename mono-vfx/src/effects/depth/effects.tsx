import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Stage, EffectProps} from '../../core/Stage';
import {camFrom, fadeIn, sweepEnv} from '../../core/kit';
import {easeInOutCubic, seg, smootherstep, springStep, lerp, easeOutCubic} from '../../core/Timeline';
import {makeRng} from '../../core/DeterministicRandom';
import {makeMaterial} from '../../materials/presets';
import {makeGlass} from '../../materials/glass';
import {ConvexSolid, Plane3} from '../../geometry/ConvexSolid';
import {Instances} from '../../core/Instances';
import {Cut, makeGlowCap, slicePieces} from '../katana/slice';

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const Q0 = new THREE.Quaternion();

/* ───────── geometry helpers ───────── */
export const gearGeometry = (teeth: number, rOut: number, rIn: number, thick: number, hole: number) => {
  const s = new THREE.Shape();
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * Math.PI * 2, w = (Math.PI * 2) / teeth;
    const pts: [number, number][] = [[a, rIn], [a + w * 0.18, rIn], [a + w * 0.3, rOut], [a + w * 0.52, rOut], [a + w * 0.64, rIn]];
    pts.forEach(([ang, r], j) => { const x = Math.cos(ang) * r, y = Math.sin(ang) * r; i === 0 && j === 0 ? s.moveTo(x, y) : s.lineTo(x, y); });
  }
  s.closePath();
  const h = new THREE.Path(); h.absarc(0, 0, hole, 0, Math.PI * 2, true); s.holes.push(h);
  const g = new THREE.ExtrudeGeometry(s, {depth: thick, bevelEnabled: true, bevelThickness: thick * 0.08, bevelSize: thick * 0.06, bevelSegments: 2, curveSegments: 16});
  g.rotateX(-Math.PI / 2); g.translate(0, -thick / 2, 0);
  g.computeVertexNormals();
  return g;
};
const lathe = (pts: [number, number][], seg = 64) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);

/* ───────── 16 Mechanical Exploded View ───────── */
export const D16 = 18;
interface Part {key: string; geo: THREE.BufferGeometry; mat: 'alu' | 'chrome' | 'dark' | 'brass'; y: number; ex: number; spin?: number; radial?: [number, number]; delay: number}
export const ExplodedView: React.FC<EffectProps> = (props) => {
  const mats = useMemo(() => ({alu: makeMaterial('brushedAluminum'), chrome: makeMaterial('chrome'), dark: (() => { const m = makeMaterial('brushedAluminum'); m.color = new THREE.Color(0x1a1c20); m.roughness = 0.28; return m; })(), brass: (() => { const m = makeMaterial('chrome', {color: 0xe0b46a}); m.roughness = 0.12; return m; })()}), []);
  const parts = useMemo<Part[]>(() => {
    const L: Part[] = [];
    L.push({key: 'base', geo: lathe([[0, 0], [1.9, 0], [2.0, 0.05], [2.0, 0.22], [1.8, 0.3], [0, 0.3]]), mat: 'dark', y: -1.5, ex: -1.5, delay: 0});
    L.push({key: 'shaft', geo: new THREE.CylinderGeometry(0.2, 0.2, 4.2, 48), mat: 'chrome', y: 0.5, ex: 0.0, delay: 0.1});
    L.push({key: 'gearA', geo: gearGeometry(24, 1.5, 1.28, 0.28, 0.24), mat: 'alu', y: -0.95, ex: -0.8, spin: 1, delay: 0.2});
    L.push({key: 'spacer1', geo: lathe([[0.26, 0], [0.5, 0], [0.5, 0.35], [0.26, 0.35]]), mat: 'brass', y: -0.62, ex: -0.28, delay: 0.3});
    L.push({key: 'gearB', geo: gearGeometry(16, 1.1, 0.92, 0.3, 0.24), mat: 'dark', y: -0.1, ex: 0.55, spin: -1.5, delay: 0.4});
    L.push({key: 'bearing', geo: new THREE.TorusGeometry(0.8, 0.1, 24, 64).rotateX(Math.PI / 2), mat: 'chrome', y: 0.45, ex: 1.3, delay: 0.5});
    L.push({key: 'gearC', geo: gearGeometry(32, 1.8, 1.6, 0.22, 0.24), mat: 'alu', y: 0.95, ex: 2.1, spin: 0.75, delay: 0.6});
    L.push({key: 'spacer2', geo: lathe([[0.26, 0], [0.45, 0], [0.45, 0.4], [0.26, 0.4]]), mat: 'brass', y: 1.4, ex: 2.9, delay: 0.7});
    L.push({key: 'cap', geo: lathe([[0, 0], [1.1, 0], [1.15, 0.08], [1.15, 0.26], [0.7, 0.42], [0, 0.46]]), mat: 'dark', y: 1.85, ex: 3.7, delay: 0.8});
    L.push({key: 'knob', geo: lathe([[0, 0], [0.3, 0], [0.32, 0.2], [0.2, 0.36], [0, 0.4]]), mat: 'chrome', y: 2.3, ex: 4.5, delay: 0.9});
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.2;
      const bolt = new THREE.CylinderGeometry(0.09, 0.09, 0.6, 6); bolt.translate(0, 0.3, 0);
      L.push({key: 'bolt' + i, geo: bolt, mat: 'chrome', y: 1.95, ex: 4.4, radial: [Math.cos(a) * 0.95, Math.sin(a) * 0.95], delay: 1.0 + i * 0.05});
    }
    return L;
  }, []);
  return (
    <Stage {...props} spec={{
      env: 'highContrastMetallic', floorY: -2.2, exposure: (t) => fadeIn(t), envRotation: (t) => sweepEnv(t, 0.3, 6, -0.9, 0.5, 0.3, D16),
      camera: camFrom([[0, [-3.0, 1.6, 10], [0, 0.4, 0]], [3.5, [-4.0, 1.8, 8.6], [0, 0.4, 0]], [6.5, [3.6, 1.2, 8.8], [0, 0.6, 0]], [9.2, [2.2, 0.4, 5.0], [0, 0.4, 0]], [11.5, [-2.8, 1.8, 5.4], [0, 1.2, 0]], [14, [-1.8, 3.2, 8.2], [0, 0.8, 0]], [18, [-2.6, 1.6, 10.5], [0, 0.5, 0]]], 1.55),
    }}
      render={(t) => {
        const open = easeInOutCubic(seg(t, 4.2, 8.2)), close = easeInOutCubic(seg(t, 13.2, 16.6));
        const k = open * (1 - close);
        return (
          <group position={[0, -0.3, 0]}>
            {parts.map((p, i) => {
              const kk = easeInOutCubic(seg(t, 4.2 + p.delay * 0.35, 8.0 + p.delay * 0.2)) * (1 - easeInOutCubic(seg(t, 13.2 + (1 - p.delay) * 0.4, 16.2 + (1 - p.delay) * 0.3)));
              void k;
              const yy = p.y + (p.ex - p.y) * kk * 0 + p.ex * kk * 0.0;
              const off = (p.key === 'shaft' ? 0 : p.ex * 1.0 * 0.6) * kk;
              const px = (p.radial?.[0] ?? 0) * (1 + 1.1 * kk), pz = (p.radial?.[1] ?? 0) * (1 + 1.1 * kk);
              const spin = (p.spin ?? 0) * (0.25 * t + 1.2 * kk);
              const lock = springStep(t - 16.3, 30, 0.3) - 1;
              return <mesh key={p.key} geometry={p.geo} material={mats[p.mat]} position={[px, p.y * 0 + yy * 0 + (p.key === 'shaft' ? 0.5 : p.y) + off + (p.key === 'shaft' ? 0 : 0) + 0.02 * lock * (t > 16.3 ? 1 : 0), pz]} rotation={[0, spin, 0]} />;
            })}
          </group>
        );
      }} />
  );
};

/* ───────── 17 Layered Glass Sculpture ───────── */
export const D17 = 17;
const LAY = 22;
const sculpt = (): ConvexSolid => {
  const pl: Plane3[] = [];
  for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2 + 0.2; pl.push({n: V(Math.cos(a), 0.18, Math.sin(a)).normalize(), d: 1.0}, {n: V(Math.cos(a + 0.31), -0.22, Math.sin(a + 0.31)).normalize(), d: 1.05}); }
  pl.push({n: V(0, 1, 0), d: 1.5}, {n: V(0, -1, 0), d: 1.5});
  return ConvexSolid.fromPlanes(pl);
};
export const LayeredGlass: React.FC<EffectProps> = (props) => {
  const H = 1.5, span = (H * 2) / LAY;
  const cuts: Cut[] = useMemo(() => Array.from({length: LAY - 1}, (_, i) => ({n: V(0, 1, 0), d: -H + span * (i + 1), t: 0, dir: V(1, 0, 0)})), []);
  const pieces = useMemo(() => slicePieces(sculpt(), cuts, 30).map((p) => ({...p, layer: p.signs.reduce((a, s) => a + (s > 0 ? 1 : 0), 0)})), [cuts]);
  const skins = useMemo(() => Array.from({length: LAY}, (_, i) => makeGlass({tint: new THREE.Color().setHSL(0.5 + 0.22 * (i / LAY), 0.55, 0.28).getHex(), opacity: 0.3, rim: [0.6 + 0.4 * (i / LAY), 0.9 - 0.3 * (i / LAY), 1.0], env: 3.2})), []);
  const {mat: cap} = useMemo(() => { const r = makeGlowCap({color: 0x9fe0d8, metalness: 0, roughness: 0.02}); Object.assign(r.mat, {transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide, bumpMap: null, map: null, envMapIntensity: 3}); return r; }, []);
  return (
    <Stage {...props} spec={{
      env: 'glassShowcase', floorY: -2.4, exposure: (t) => fadeIn(t), envRotation: (t) => sweepEnv(t, 0.3, 6, -0.9, 0.5, 0.4, D17),
      camera: camFrom([[0, [-2.2, 0.8, 9], [0, 0, 0]], [4, [-1.0, 0.6, 6.8], [0, 0, 0]], [6.5, [2.0, 0.5, 6.4], [0, 0, 0]], [9, [3.4, 0.2, 3.8], [0, -0.2, 0], 38, 1.5], [11.2, [0.4, 0.1, 2.9], [-0.4, 0.4, 0], 42, 1.5], [13.4, [-2.2, 1.0, 5.0], [0, 0.3, 0], 34, 1.6], [17, [-1.6, 1.2, 8.4], [0, 0, 0]]], 1.8),
    }}
      render={(t) => (
        <group>
          {pieces.map((p, pi) => {
            const L = (p as any).layer as number, c = L - (LAY - 1) / 2;
            const open = smootherstep(seg(t, 5.2 + (L / LAY) * 1.4, 8.0 + (L / LAY) * 1.4));
            const close = easeInOutCubic(seg(t, 13.8 + (1 - L / LAY) * 1.2, 16.2 + (1 - L / LAY) * 1.2));
            const y = c * 0.2 * open * (1 - close);
            const rot = 0.5 * Math.sin(L * 0.7) * open * (1 - close) + 0.12 * Math.sin(t * 0.4 + L) * open * (1 - close);
            return <group key={pi} position={[0, y, 0]} rotation={[0, rot, 0]}><mesh geometry={p.geo} material={[skins[L], cap]} /></group>;
          })}
        </group>
      )} />
  );
};

/* ───────── 18 Geometric Deconstruction ───────── */
export const D18 = 18;
export const GeometricDeconstruction: React.FC<EffectProps> = (props) => {
  const data = useMemo(() => {
    const ico = new THREE.IcosahedronGeometry(1.5, props.quality === 'preview' ? 2 : 3).toNonIndexed();
    const pos = ico.getAttribute('position'), faces: {c: THREE.Vector3; n: THREE.Vector3; e: number; ring: number}[] = [];
    for (let i = 0; i < pos.count; i += 3) {
      const a = new THREE.Vector3().fromBufferAttribute(pos, i), b = new THREE.Vector3().fromBufferAttribute(pos, i + 1), c = new THREE.Vector3().fromBufferAttribute(pos, i + 2);
      const cen = a.clone().add(b).add(c).divideScalar(3);
      faces.push({c: cen, n: cen.clone().normalize(), e: a.distanceTo(b), ring: Math.abs(cen.y / 1.5)});
    }
    return faces;
  }, [props.quality]);
  const prism = useMemo(() => {
    const s = new THREE.Shape(); const r = 0.577;
    for (let i = 0; i < 3; i++) { const a = Math.PI / 2 + (i * Math.PI * 2) / 3; i ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
    const g = new THREE.ExtrudeGeometry(s, {depth: 0.16, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 2});
    g.translate(0, 0, -0.08); g.computeVertexNormals(); return g;
  }, []);
  const matA = useMemo(() => makeMaterial('chrome'), []), matB = useMemo(() => { const m = makeMaterial('brushedAluminum'); m.color = new THREE.Color(0x15171b); return m; }, []);
  const core = useMemo(() => makeMaterial('chrome', {color: 0xffc070}), []);
  const nA = data.filter((_, i) => i % 3 !== 0), nB = data.filter((_, i) => i % 3 === 0);
  const fill = (list: typeof data) => (i: number, t: number, m: THREE.Matrix4) => {
    const f = list[i];
    const out = easeInOutCubic(seg(t, 4.4 + f.ring * 1.8, 8.6 + f.ring * 1.2)) * (1 - easeInOutCubic(seg(t, 13.0 + (1 - f.ring) * 1.6, 16.4 + (1 - f.ring) * 1.2)));
    const wave = 0.5 + 0.5 * Math.sin(f.c.x * 2.2 + f.c.z * 1.8);
    const dist = 1.5 + out * (1.5 + 1.0 * wave + 1.3 * f.ring);
    const p = f.n.clone().multiplyScalar(dist);
    const q = new THREE.Quaternion().setFromUnitVectors(V(0, 0, 1), f.n).multiply(new THREE.Quaternion().setFromAxisAngle(V(0, 0, 1), out * 0.8 * (wave - 0.5)));
    const k = f.e * (1 - 0.12 + 0.12 * (1 - out)) * 1.02;
    return m.compose(p, q, V(k, k, 1 + out * 1.6));
  };
  return (
    <Stage {...props} spec={{
      env: 'highContrastMetallic', floorY: null, exposure: (t) => fadeIn(t), envRotation: (t) => sweepEnv(t, 0.3, 7, -0.9, 0.8, 0.4, D18),
      camera: camFrom([[0, [-2.4, 1.0, 11], [0, 0, 0]], [4, [-1.2, 0.6, 8.6], [0, 0, 0]], [7.5, [3.2, 1.0, 7.8], [0, 0, 0]], [10.5, [0.6, 0.3, 4.2], [0, 0, 0], 38, 1.5], [12.5, [-0.4, 0.0, 1.0], [0.4, 0, -1.5], 48, 1.5], [14.5, [-3.0, 1.4, 8.0], [0, 0, 0]], [18, [-2.4, 1.2, 11], [0, 0, 0]]], 1.5),
    }}
      render={(t) => {
        const coreOut = easeInOutCubic(seg(t, 5.5, 9.5)) * (1 - easeInOutCubic(seg(t, 13.5, 16.0)));
        return (
          <group rotation={[0.2, t * 0.12, 0]}>
            <Instances count={nA.length} geometry={prism} material={matA} t={t} fill={fill(nA)} />
            <Instances count={nB.length} geometry={prism} material={matB} t={t} fill={fill(nB)} />
            <mesh material={core} scale={0.55 + 0.1 * coreOut}><icosahedronGeometry args={[1, 2]} /></mesh>
            <mesh material={matA} scale={0.95}><icosahedronGeometry args={[1, 1]} /></mesh>
            <mesh material={matB} rotation={[0.6, 0.4, 0]}><torusGeometry args={[1.1, 0.04, 16, 96]} /></mesh>
          </group>
        );
      }} />
  );
};

/* ───────── 19 Floating Architecture ───────── */
export const D19 = 20;
interface El {kind: 0 | 1 | 2; pos: THREE.Vector3; size: THREE.Vector3; start: THREE.Vector3; q0: THREE.Quaternion; t0: number; d: number}
export const FloatingArchitecture: React.FC<EffectProps> = (props) => {
  const els = useMemo(() => {
    const r = makeRng(1919), L: El[] = [];
    const add = (kind: 0 | 1 | 2, pos: THREE.Vector3, size: THREE.Vector3) => {
      const dir = V(r.range(-1, 1), r.range(-0.3, 1), r.range(-1, 1)).normalize();
      L.push({kind, pos, size, start: pos.clone().addScaledVector(dir, r.range(5, 11)), q0: new THREE.Quaternion().setFromEuler(new THREE.Euler(r.range(-2, 2), r.range(-2, 2), r.range(-2, 2))), t0: 1.5 + (pos.y + 2) * 0.9 + r.range(0, 1.6), d: r.range(2.2, 3.2)});
    };
    const floors = [[-1.6, 3.4, 2.6, 0], [-0.2, 2.8, 3.0, 0.5], [1.2, 3.2, 2.4, -0.6], [2.6, 2.2, 2.0, 0.3]];
    floors.forEach(([y, w, d, ox], fi) => {
      add(0, V(ox, y, 0), V(w, 0.16, d));
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(1, V(ox + sx * (w / 2 - 0.15), y + 0.7, sz * (d / 2 - 0.15)), V(0.12, 1.28, 0.12));
      add(0, V(ox, y + 1.4, 0), V(w * 0.8, 0.08, 0.1));
      add(2, V(ox, y + 0.75, d / 2 - 0.05), V(w * 0.9, 1.1, 0.04));
      add(2, V(ox + (w / 2 - 0.05), y + 0.75, 0), V(0.04, 1.1, d * 0.9));
      if (fi % 2 === 0) add(0, V(ox + w / 2 + 0.9, y + 0.1, 0.4), V(1.8, 0.1, 1.2));
    });
    return L;
  }, []);
  const matA = useMemo(() => makeMaterial('ceramic', {color: 0xeceae4}), []), matB = useMemo(() => { const m = makeMaterial('brushedAluminum'); m.color = new THREE.Color(0x2a2d33); return m; }, []);
  const matG = useMemo(() => makeGlass({tint: 0x3a6a7a, opacity: 0.3}), []);
  const box = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const mk = (k: number) => els.filter((e) => e.kind === k);
  const fill = (list: El[]) => (i: number, t: number, m: THREE.Matrix4) => {
    const e = list[i], u = seg(t, e.t0, e.t0 + e.d), ease = u * u * (3 - 2 * u), a = easeOutCubic(u) * 0.35 + ease * 0.65;
    const p = e.start.clone().lerp(e.pos, a), q = e.q0.clone().slerp(Q0, smootherstep(u));
    const lock = u >= 1 ? 0.012 * Math.exp(-(t - e.t0 - e.d) * 8) * Math.sin((t - e.t0 - e.d) * 60) : 0;
    p.y += lock + (u < 1 ? Math.sin(t * 0.9 + i) * 0.04 * (1 - u) : 0);
    return m.compose(p, q, e.size);
  };
  return (
    <Stage {...props} spec={{
      env: 'softProduct', floorY: -2.2, exposure: (t) => fadeIn(t, 2.0), envRotation: (t) => sweepEnv(t, 0.3, 10, -0.5, 0.4, 0.2, D19), vignette: 0.6,
      camera: camFrom([[0, [-6, 2.8, 13], [0, 0.4, 0]], [5, [-4, 2.2, 10.5], [0, 0.5, 0]], [9, [3.4, 1.8, 7.5], [0, 0.6, 0]], [12, [1.0, 1.2, 5.2], [0.2, 0.6, -0.5], 36, 1.5], [15, [-3.4, 2.0, 6.2], [0.4, 0.8, 0], 34, 1.5], [20, [3.4, 1.6, 9.8], [0.2, 0.6, 0]]], 1.5),
    }}
      render={(t) => (
        <group>
          <Instances count={mk(0).length} geometry={box} material={matA} t={t} fill={fill(mk(0))} />
          <Instances count={mk(1).length} geometry={box} material={matB} t={t} fill={fill(mk(1))} />
          <Instances count={mk(2).length} geometry={box} material={matG} t={t} fill={fill(mk(2))} />
        </group>
      )} />
  );
};

/* ───────── 20 Impossible Depth ───────── */
export const D20 = 18;
export const ImpossibleDepth: React.FC<EffectProps> = (props) => {
  const N = 16;
  const bar = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const m1 = useMemo(() => { const m = makeMaterial('brushedAluminum'); m.color = new THREE.Color(0x202328); return m; }, []);
  const lightM = useMemo(() => new THREE.MeshBasicMaterial({color: new THREE.Color(2.6, 2.1, 1.6), toneMapped: false}), []);
  const shell = useMemo(() => makeMaterial('chrome'), []);
  return (
    <Stage {...props} spec={{
      env: 'highContrastMetallic', floorY: null, exposure: (t) => fadeIn(t), envRotation: (t) => sweepEnv(t, 0.3, 6, -0.9, 0.5, 0.3, D20),
      camera: camFrom([[0, [-3.0, 1.4, 9.5], [0, 0, 0]], [4, [-1.6, 1.0, 7.4], [0, 0, 0]], [7, [0.3, 0.2, 5.0], [0, 0, -0.5]], [9.5, [0, 0, 1.4], [0, 0, -8], 40, 1.4], [12, [0, 0, -8], [0, 0, -22], 44, 1.4], [14, [0, 0, -10], [0, 0, -2], 40, 1.4], [16, [-2.0, 1.2, 7.4], [0, 0, 0]], [18, [-2.6, 1.3, 9.5], [0, 0, 0]]], 1.7),
    }}
      render={(t) => {
        const unfold = easeInOutCubic(seg(t, 5.2, 9.6)) * (1 - easeInOutCubic(seg(t, 13.4, 16.6)));
        const flap = easeInOutCubic(seg(t, 5.0, 7.0)) * (1 - easeInOutCubic(seg(t, 14.6, 16.4)));
        const frameZ = (i: number) => lerp(-0.9 + (i / N) * 1.8, -i * 1.55, unfold);
        const frameS = (i: number) => lerp(1.0 - (i / N) * 0.16, 1.0 + 0.9 * Math.sin((i / N) * Math.PI) * 0.5 + 0.1 * (i % 2), unfold);
        const barCount = N * 4;
        const fill = (b: number, _t: number, m: THREE.Matrix4) => {
          const i = Math.floor(b / 4), side = b % 4, s = frameS(i), z = frameZ(i), w = 0.14, h = 0.14;
          const vertical = side < 2, sgn = side % 2 ? 1 : -1;
          const p = vertical ? V(sgn * s, 0, z) : V(0, sgn * s, z), sc = vertical ? V(w, 2 * s + w, h) : V(2 * s + w, w, h);
          return m.compose(p, Q0, sc);
        };
        const fillL = (b: number, _t: number, m: THREE.Matrix4) => {
          const i = Math.floor(b / 4), side = b % 4, s = frameS(i) - 0.1, z = frameZ(i) + 0.05;
          const vertical = side < 2, sgn = side % 2 ? 1 : -1;
          const p = vertical ? V(sgn * s, 0, z) : V(0, sgn * s, z), sc = vertical ? V(0.03, 2 * s, 0.03) : V(2 * s, 0.03, 0.03);
          return m.compose(p, Q0, sc);
        };
        return (
          <group>
            <Instances count={barCount} geometry={bar} material={m1} t={t} fill={fill} />
            <Instances count={barCount} geometry={bar} material={lightM} t={t} fill={fillL} />
            {/* outer cube shell: 6 plates, front plate hinges open */}
            {[[0, 0, -1, 0, 0], [0, 1, 0, -Math.PI / 2, 0], [0, -1, 0, Math.PI / 2, 0], [1, 0, 0, 0, Math.PI / 2], [-1, 0, 0, 0, -Math.PI / 2]].map(([x, y, z, rx, ry], i) => (
              <mesh key={i} material={shell} position={[x, y, z]} rotation={[rx, ry, 0]} scale={[2, 2, 0.04]}><boxGeometry /></mesh>
            ))}
            <group position={[0, 1, 1]} rotation={[-flap * 2.2 * 0 + 0, 0, 0]}>
              <group rotation={[-flap * 1.9, 0, 0]}><mesh material={shell} position={[0, -1, 0]} scale={[2, 2, 0.04]}><boxGeometry /></mesh></group>
            </group>
          </group>
        );
      }} />
  );
};
