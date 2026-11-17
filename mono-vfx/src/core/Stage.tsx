import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {CameraRig, CamKey, Shake} from './CameraRig';
import {FPS} from './Timeline';
import {QUALITY, Quality, QualityName} from './QualityPresets';
import {buildStudioEnvironment, StudioName} from '../lighting/StudioEnvironment';

export type Orientation = 'portrait' | 'landscape';
export interface EffectProps { quality: QualityName; orientation: Orientation; }

export interface StageSpec {
  env: StudioName;
  floorY?: number | null;                       // null = no floor
  camera: (portrait: boolean) => CamKey[];
  shakes?: Shake[];
  exposure?: (t: number) => number;
  envRotation?: (t: number) => number;
  lights?: (t: number) => React.ReactNode;
  vignette?: number;
  /** horizontal/vertical gaussian blur (px) approximating motion blur; deterministic */
  blur?: (t: number) => [number, number];
}

const Inner: React.FC<{t: number; q: Quality; spec: StageSpec; portrait: boolean; render: (t: number, q: Quality) => React.ReactNode}> = ({t, q, spec, portrait, render}) => {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const env = useMemo(() => buildStudioEnvironment(gl, spec.env, q.envSize), [gl, q.envSize]);
  const floorAlpha = useMemo(() => {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const g = c.getContext('2d')!;
    const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    gr.addColorStop(0, 'rgb(0,150,0)'); gr.addColorStop(0.35, 'rgb(0,215,0)'); gr.addColorStop(0.8, 'rgb(0,255,0)'); gr.addColorStop(1, 'rgb(0,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }, []);
  scene.environment = env;
  scene.environmentRotation.y = spec.envRotation ? spec.envRotation(t) : 0;
  gl.toneMappingExposure = spec.exposure ? spec.exposure(t) : 1;
  const fy = spec.floorY ?? null;
  const content = render(t, q);
  return (
    <>
      <CameraRig keys={spec.camera(portrait)} time={t} shakes={spec.shakes} />
      {spec.lights?.(t)}
      {content}
      {fy !== null && q.mirrorFloor && (
        <>
          <group position={[0, 2 * fy, 0]} scale={[1, -1, 1]}>{content}</group>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, fy, 0]}>
            <circleGeometry args={[26, 96]} />
            <meshBasicMaterial color={0x000000} alphaMap={floorAlpha} transparent />
          </mesh>
        </>
      )}
    </>
  );
};

/** Shared canvas + grade for every MONO effect. `render(t)` returns the scene content for time t (seconds). */
export const Stage: React.FC<EffectProps & {spec: StageSpec; render: (t: number, q: Quality) => React.ReactNode}> = ({quality, orientation, spec, render}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const q = QUALITY[quality];
  const t = frame / FPS;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {spec.blur && (() => { const [bx, by] = spec.blur!(t); return <svg width="0" height="0" style={{position: 'absolute'}}><filter id="mb" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation={`${bx.toFixed(2)} ${by.toFixed(2)}`} /></filter></svg>; })()}
      <AbsoluteFill style={spec.blur && (spec.blur(t)[0] > 0.2 || spec.blur(t)[1] > 0.2) ? {filter: 'url(#mb)'} : undefined}>
      <ThreeCanvas width={width} height={height} camera={{fov: 30, near: 0.05, far: 160, position: [0, 0, 9]}}
        gl={{antialias: q.antialias, toneMapping: THREE.ACESFilmicToneMapping, powerPreference: 'high-performance'}}>
        <Inner t={t} q={q} spec={spec} portrait={orientation === 'portrait'} render={render} />
      </ThreeCanvas>
      </AbsoluteFill>
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 38%, rgba(0,0,0,${spec.vignette ?? 0.7}) 100%)`, pointerEvents: 'none'}} />
      {q.grain && (
        <AbsoluteFill style={{mixBlendMode: 'overlay', opacity: 0.1, pointerEvents: 'none'}}>
          <svg width="100%" height="100%"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frame % 97} /><feColorMatrix type="saturate" values="0" /></filter><rect width="100%" height="100%" filter="url(#g)" /></svg>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/** Orbit keys: smooth circular path sampled into Hermite keys. */
export const orbitKeys = (t0: number, t1: number, target: [number, number, number], radius: (u: number) => number, height: (u: number) => number, a0: number, a1: number, steps = 8, fov = 30): CamKey[] =>
  Array.from({length: steps + 1}, (_, i) => {
    const u = i / steps, a = a0 + (a1 - a0) * u, r = radius(u);
    return {t: t0 + (t1 - t0) * u, pos: [target[0] + Math.sin(a) * r, target[1] + height(u), target[2] + Math.cos(a) * r] as [number, number, number], target, fov};
  });
