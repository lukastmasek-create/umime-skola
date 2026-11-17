import React, {useMemo, useRef, useLayoutEffect} from 'react';
import {useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {rng, range, smooth, smoother, clamp} from '../animation/motion';
import {acrylic} from '../materials';

export const Z0 = -40, Z1 = -84, K = 5, M = 260;
export const axisX = (z: number) => 0.6 * Math.sin((z + 40) * 0.07) * smooth(range(-z, 40, 52));
export const axisY = (z: number) => 0.35 * Math.sin((z + 40) * 0.05 + 1) * smooth(range(-z, 40, 52));
export const axisAt = (z: number) => new THREE.Vector3(axisX(z), axisY(z), z);

const metal = (c = '#e9f1ee', r = 0.08) => new THREE.MeshPhysicalMaterial({color: c, metalness: 1, roughness: r, clearcoat: 0.6, clearcoatRoughness: 0.1, envMapIntensity: 1.8});

function ribbonPoint(u: number, k: number, f: number, side: number, out: THREE.Vector3) {
  const s = 1 - Math.pow(1 - u, 1.6);
  const z = Z0 + (Z1 - Z0) * s;
  const ring = smooth(range(u, 0.78, 1));
  const phi = (2 * Math.PI * k) / K + 2 * Math.PI * (2.0 * u + 2.2 * ring);
  const R = 2.2 + 0.32 * Math.sin(u * 16 - f * 0.07 + k) + 1.0 * ring;
  const alpha = 0.75 * Math.sin(u * 10 + f * 0.045 + k * 1.3) * (1 - 0.6 * ring);
  const w = 0.85 * (0.75 + 0.25 * Math.sin(u * 8 + k)) * smooth(range(u, 0, 0.05)) * (1 - 0.5 * smooth(range(u, 0.97, 1)));
  const cx = Math.cos(phi), sy = Math.sin(phi);
  const wx = Math.sin(alpha) * cx, wy = Math.sin(alpha) * sy, wz = Math.cos(alpha);
  const ax = axisX(z), ay = axisY(z);
  out.set(ax + R * cx + side * 0.5 * w * wx, ay + R * sy + side * 0.5 * w * wy, z + side * 0.5 * w * wz);
}

const Ribbon: React.FC<{k: number; f: number; color: string; opacity: number}> = ({k, f, color, opacity}) => {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array((M + 1) * 2 * 3), 3));
    const idx: number[] = [];
    for (let i = 0; i < M; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    g.setIndex(idx);
    return g;
  }, []);
  const mat = useMemo(() => acrylic(color, opacity), [color, opacity]);
  const p = useMemo(() => new THREE.Vector3(), []);
  useLayoutEffect(() => {
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i <= M; i++) {
      const u = i / M;
      ribbonPoint(u, k, f, -1, p); pos.setXYZ(i * 2, p.x, p.y, p.z);
      ribbonPoint(u, k, f, 1, p); pos.setXYZ(i * 2 + 1, p.x, p.y, p.z);
    }
    pos.needsUpdate = true; geo.computeVertexNormals(); geo.computeBoundingSphere();
  }, [f, k, geo, p]);
  return <mesh geometry={geo} material={mat} frustumCulled={false} renderOrder={3} />;
};

const hazeTex = (() => {
  let t: THREE.CanvasTexture | null = null;
  return () => {
    if (t) return t;
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d')!;
    const r = g.createRadialGradient(128, 128, 0, 128, 128, 128); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.5, 'rgba(255,255,255,.35)'); r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r; g.fillRect(0, 0, 256, 256); t = new THREE.CanvasTexture(c); return t;
  };
})();

/** Circular waveform ring at the end of the sculpture – the portal. */
const PortalRing: React.FC<{f: number}> = ({f}) => {
  const bars = useRef<THREE.InstancedMesh>(null);
  const NB = 112;
  const c = axisAt(Z1);
  const barMat = useMemo(() => new THREE.MeshPhysicalMaterial({color: '#1DB954', emissive: '#0a8f3a', emissiveIntensity: 0.6, roughness: 0.2, clearcoat: 1, metalness: 0.2, envMapIntensity: 1.5}), []);
  const m = useMemo(() => new THREE.Matrix4(), []), q = useMemo(() => new THREE.Quaternion(), []), p = useMemo(() => new THREE.Vector3(), []), sc = useMemo(() => new THREE.Vector3(), []);
  useLayoutEffect(() => {
    const im = bars.current!;
    const assemble = smoother(range(f, 1290, 1400));
    for (let i = 0; i < NB; i++) {
      const th = (i / NB) * Math.PI * 2;
      const wv = 0.5 + 0.5 * Math.sin(th * 7 - f * 0.08) * Math.cos(th * 3 + f * 0.03);
      const h = (0.05 + 0.24 * wv) * assemble;
      const r = 3.05 - h / 2 - 0.05;
      p.set(c.x + Math.cos(th) * r, c.y + Math.sin(th) * r, c.z);
      q.setFromAxisAngle(new THREE.Vector3(0, 0, 1), th - Math.PI / 2);
      sc.set(0.05, Math.max(0.0001, h), 0.05);
      im.setMatrixAt(i, m.compose(p, q, sc));
    }
    im.instanceMatrix.needsUpdate = true;
  }, [f, c, m, q, p, sc]);
  const ringMat = useMemo(() => metal('#f2f6f4', 0.1), []);
  const glow = useMemo(() => new THREE.MeshBasicMaterial({map: hazeTex(), color: '#bfffd9', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false}), []);
  glow.opacity = 0.42 * smooth(range(f, 1330, 1420)) * (1 - smooth(range(f, 1440, 1475)));
  return (
    <group>
      <mesh position={c} material={ringMat}><torusGeometry args={[3.2, 0.055, 24, 160]} /></mesh>
      <mesh position={[c.x, c.y, c.z + 0.06]} material={ringMat}><torusGeometry args={[2.98, 0.018, 16, 160]} /></mesh>
      <instancedMesh ref={bars} args={[undefined as unknown as THREE.BufferGeometry, barMat, NB]} frustumCulled={false}><boxGeometry args={[1, 1, 1]} /></instancedMesh>
      <mesh position={[c.x, c.y, c.z - 0.6]} material={glow} renderOrder={1}><planeGeometry args={[7.4, 7.4]} /></mesh>
    </group>
  );
};

/** SHOT 06 — Inside the Sound. Deterministic mathematical deformation; ribbons coil into a ring. */
export const InsideTheSound: React.FC = () => {
  const f = useCurrentFrame();
  const els = useMemo(() => {
    const r = rng(2024);
    const spheres = Array.from({length: 24}, () => { const z = -44 - r() * 38, a = r() * 6.283, rad = 0.45 + r() * 1.25; return {z, a, rad, s: 0.07 + r() * 0.15, ph: r() * 6.28, gold: r() > 0.8}; });
    const rods = Array.from({length: 14}, () => { const z = -46 - r() * 36, a = r() * 6.283, rad = 0.7 + r() * 1.1; return {z, a, rad, len: 0.5 + r() * 1.1, ph: r() * 6.28}; });
    const rings = Array.from({length: 9}, (_, i) => ({z: -48 - i * 4.2, r: 1.25 + (i % 3) * 0.18}));
    const haze = Array.from({length: 11}, (_, i) => ({z: -38 - i * 5}));
    return {spheres, rods, rings, haze};
  }, []);
  const mats = useMemo(() => ({chrome: metal('#e9f1ee', 0.06), gold: metal('#e0b35a', 0.14), steel: metal('#aeb9b4', 0.2), haze: new THREE.MeshBasicMaterial({map: hazeTex(), color: '#1DB954', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.1, toneMapped: false})}), []);
  const colors = ['#1DB954', '#25d366', '#0f9d58', '#6bffb0', '#1DB954'];
  return (
    <group>
      {Array.from({length: K}, (_, k) => <Ribbon key={k} k={k} f={f} color={colors[k]} opacity={k % 2 ? 0.5 : 0.62} />)}
      {els.spheres.map((e, i) => { const a = axisAt(e.z); const o = Math.sin(f * 0.025 + e.ph) * 0.08; return <mesh key={i} position={[a.x + Math.cos(e.a) * e.rad, a.y + Math.sin(e.a) * e.rad + o, e.z]} material={e.gold ? mats.gold : mats.chrome}><sphereGeometry args={[e.s, 48, 32]} /></mesh>; })}
      {els.rods.map((e, i) => { const a = axisAt(e.z); return <mesh key={i} position={[a.x + Math.cos(e.a) * e.rad, a.y + Math.sin(e.a) * e.rad, e.z]} rotation={[Math.PI / 2, 0, 0]} material={mats.steel}><capsuleGeometry args={[0.02, e.len, 8, 24]} /></mesh>; })}
      {els.rings.map((e, i) => { const a = axisAt(e.z); return <mesh key={i} position={[a.x, a.y, e.z]} rotation={[0, 0, f * 0.004 * (i % 2 ? 1 : -1)]} material={mats.chrome}><torusGeometry args={[e.r * (1 + 0.05 * Math.sin(f * 0.06 + i)), 0.014, 12, 120]} /></mesh>; })}
      {els.haze.map((e, i) => { const a = axisAt(e.z); return <mesh key={i} position={[a.x, a.y, e.z]} material={mats.haze} renderOrder={1}><planeGeometry args={[11, 11]} /></mesh>; })}
      <PortalRing f={f} />
    </group>
  );
};
