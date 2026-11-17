import { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { cancelRender, continueRender, delayRender, staticFile } from 'remotion';

export const SCREEN_W = 3.2;
export const SCREEN_H = 1.8;
const BEZEL = 0.045;
const OUT_W = SCREEN_W + BEZEL * 2;
const OUT_H = SCREEN_H + BEZEL * 2;
const DEPTH = 0.075;

const rrect = (w: number, h: number, r: number) => {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
};

export type ScreenLayer = { src: string; opacity: number; brightness?: number };

const ScreenPlane: React.FC<{ src: string; z: number; opacity: number; brightness: number }> = ({ src, z, opacity, brightness }) => {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    const h = delayRender(`tex ${src}`, { timeoutInMilliseconds: 60000 });
    new THREE.TextureLoader().load(staticFile(src), (t) => { setTex(t); continueRender(h); }, undefined, (e) => cancelRender(e));
    return () => { try { continueRender(h); } catch {} };
  }, [src]);
  useMemo(() => {
    if (!tex) return;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 16;
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
  }, [tex]);
  if (!tex) return null;
  return (
    <mesh position={[0, 0, z]} renderOrder={2}>
      <planeGeometry args={[SCREEN_W, SCREEN_H]} />
      <meshBasicMaterial map={tex} toneMapped={false} transparent opacity={opacity} color={new THREE.Color(brightness, brightness, brightness)} depthWrite={false} />
    </mesh>
  );
};

export const Monitor3D: React.FC<{ layers: ScreenLayer[]; glass?: number }> = ({ layers, glass = 0.1 }) => {
  const body = useMemo(() => new THREE.ExtrudeGeometry(rrect(OUT_W, OUT_H, 0.05), { depth: DEPTH, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 8, curveSegments: 24 }), []);
  const front = useMemo(() => new THREE.ShapeGeometry(rrect(OUT_W - 0.026, OUT_H - 0.026, 0.038), 24), []);
  const rear = useMemo(() => new THREE.ExtrudeGeometry(rrect(OUT_W * 0.9, OUT_H * 0.86, 0.12), { depth: 0.07, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 10, curveSegments: 24 }), []);
  const base = useMemo(() => new THREE.ExtrudeGeometry(rrect(1.15, 0.7, 0.3), { depth: 0.035, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 6, curveSegments: 32 }), []);
  const neck = useMemo(() => new THREE.ExtrudeGeometry(rrect(0.22, 0.7, 0.06), { depth: 0.08, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 6, curveSegments: 16 }), []);
  const alu = <meshPhysicalMaterial color="#c8cbd1" metalness={1} roughness={0.28} clearcoat={0.2} envMapIntensity={2.2} />;
  const aluDark = <meshPhysicalMaterial color="#c0c3c9" metalness={1} roughness={0.3} envMapIntensity={3.2} />;
  const z0 = DEPTH + 0.012;
  return (
    <group>
      {/* aluminum body (front face at z = z0) */}
      <mesh geometry={body} position={[0, 0, 0]} castShadow>{alu}</mesh>
      {/* rear shell */}
      <mesh geometry={rear} position={[0, 0.02, -0.13]}>{aluDark}</mesh>
      {/* black front glass incl. bezel */}
      <mesh geometry={front} position={[0, 0, z0 + 0.0005]}>
        <meshPhysicalMaterial color="#020203" roughness={0.12} metalness={0} clearcoat={1} clearcoatRoughness={0.04} envMapIntensity={0.6} />
      </mesh>
      {/* screen content */}
      <group position={[0, 0, z0 + 0.0015]}>
        {layers.map((l, i) => <ScreenPlane key={l.src} src={l.src} z={i * 0.0003} opacity={l.opacity} brightness={l.brightness ?? 1} />)}
      </group>
      {/* glass sheen over everything */}
      <mesh geometry={front} position={[0, 0, z0 + 0.004]} renderOrder={3}>
        <meshPhysicalMaterial color="#000000" transparent opacity={glass} roughness={0.02} metalness={0} clearcoat={1} clearcoatRoughness={0.02} envMapIntensity={1.6} depthWrite={false} />
      </mesh>
      {/* stand */}
      <mesh geometry={neck} position={[0, -1.12, -0.23]} rotation={[0, 0, 0]}>{aluDark}</mesh>
      <mesh geometry={base} position={[0, -1.43, -0.25]} rotation={[-Math.PI / 2, 0, 0]}>{alu}</mesh>
    </group>
  );
};
