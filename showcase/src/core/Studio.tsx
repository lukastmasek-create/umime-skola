import { useMemo } from 'react';
import * as THREE from 'three';
import { Environment, Lightformer } from '@react-three/drei';

const FLOOR_Y = -1.445;

const blobTexture = () => {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grd.addColorStop(0, 'rgba(0,0,0,0.85)'); grd.addColorStop(0.5, 'rgba(0,0,0,0.35)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd; g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
};
const discAlpha = () => {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grd.addColorStop(0, '#fff'); grd.addColorStop(0.35, '#999'); grd.addColorStop(1, '#000');
  g.fillStyle = grd; g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
};

export const Studio: React.FC<{ intensity?: number; rimBoost?: number; screenGlow?: number }> = ({ intensity = 1, rimBoost = 1, screenGlow = 1 }) => {
  const blob = useMemo(blobTexture, []);
  const alpha = useMemo(discAlpha, []);
  return (
    <>
      <Environment resolution={512} frames={1} background={false}>
        {/* large key softbox */}
        <Lightformer form="rect" intensity={14 * intensity} position={[-3, 3, 5]} rotation={[0, 0.8, 0]} scale={[5, 3, 1]} color="#eaf0ff" />
        {/* top strip */}
        <Lightformer form="rect" intensity={8 * intensity} position={[0, 5, 2]} rotation={[Math.PI / 2, 0, 0]} scale={[8, 2, 1]} color="#ffffff" />
        {/* rim lights */}
        <Lightformer form="rect" intensity={22 * rimBoost} position={[5, 1, -3]} rotation={[0, -2.2, 0]} scale={[0.5, 6, 1]} color="#9fb2ff" />
        <Lightformer form="rect" intensity={14 * rimBoost} position={[-5, 1, -3]} rotation={[0, 2.2, 0]} scale={[0.4, 6, 1]} color="#ffb59f" />
        {/* soft fill */}
        <Lightformer form="circle" intensity={0.8 * intensity} position={[3, -1, 5]} scale={4} color="#6a63ad" />
      </Environment>
      <ambientLight intensity={0.05} />
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y, 0]} receiveShadow>
        <circleGeometry args={[14, 64]} />
        <meshStandardMaterial color="#14141f" roughness={0.5} metalness={0.4} envMapIntensity={0.6} transparent alphaMap={alpha} depthWrite={false} />
      </mesh>
      {/* contact shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y + 0.002, -0.1]}>
        <planeGeometry args={[3.6, 2.4]} />
        <meshBasicMaterial map={blob} transparent depthWrite={false} />
      </mesh>
      {/* screen spill light on floor */}
      <pointLight position={[0, -0.9, 1.6]} intensity={0.15 * screenGlow} color="#6a63ff" distance={4} decay={2} />
    </>
  );
};
