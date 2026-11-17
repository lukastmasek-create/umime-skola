import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import * as THREE from 'three';
import { Suspense } from 'react';
import { Monitor3D } from '../core/Monitor3D';
import { Studio } from '../core/Studio';
import { CameraRig, CamKey } from '../core/CameraRig';

// Hero benchmark: static three-quarter product shot, framed independently per aspect.
const k = (pos: [number, number, number], target: [number, number, number], fov: number): CamKey[] => [{ f: 0, pos, target, fov }, { f: 1, pos, target, fov }];
const HERO_16x9 = k([2.35, 0.3, 7.0], [0, -0.28, 0], 21);
const HERO_9x16 = k([2.0, 0.3, 8.0], [0, -0.2, 0], 34);

export const HeroStill: React.FC<{ shot?: string }> = ({ shot = 'shots/home.png' }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 40%, #1a1838 0%, #0a0918 55%, #040409 100%)' }}>
    <ThreeCanvas width={width} height={height} dpr={1} gl={{ alpha: true, antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }} camera={{ fov: 30, near: 0.1, far: 60 }}>
      <Suspense fallback={null}>
        <CameraRig keys={vertical ? HERO_9x16 : HERO_16x9} frame={frame} />
        <Studio />
        <group rotation={[0, 0, 0]}>
          <Monitor3D layers={[{ src: shot, opacity: 1 }]} />
        </group>
      </Suspense>
    </ThreeCanvas>
    </AbsoluteFill>
  );
};
