import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {CameraRig, CamKey, Shake} from '../../core/CameraRig';
import {FPS, clamp, easeOutCubic, impulse, seg, smoothstep, smootherstep, springStep} from '../../core/Timeline';
import {makeRng} from '../../core/DeterministicRandom';
import {QUALITY, QualityName} from '../../core/QualityPresets';
import {ConvexSolid} from '../../geometry/ConvexSolid';
import {makeMaterial, makeObsidianInterior} from '../../materials/presets';
import {buildStudioEnvironment} from '../../lighting/StudioEnvironment';

export interface ObsidianSlashProps {
  quality: QualityName;
  orientation: 'portrait' | 'landscape';
}

/* ───────────────────────── choreography (seconds) ───────────────────────── */
export const T = {
  duration: 14,
  emerge: 2.6,        // light rises out of darkness
  slash: 4.9,         // blade passes
  seam: 5.3,          // thin seam of light appears (≈0.4s of "nothing happens")
  separate: 5.75,     // halves begin to slide apart
};
const CUBE_HALF = 1;
const FLOOR_Y = -2.35;
const N_WORLD = new THREE.Vector3(0.52, 0.85, 0).normalize();           // cut-plane normal (world)
const D_WORLD = new THREE.Vector3(-N_WORLD.y, N_WORLD.x, 0).normalize(); // blade travel direction
D_WORLD.multiplyScalar(-1); // left→right, downward
const Q_CUBE = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.16, -0.62, 0.05));

const camKeys = (portrait: boolean): CamKey[] => {
  const s = portrait ? 2.7 : 1;
  const K = (t: number, p: [number, number, number], tg: [number, number, number], fov = 30, c = s): CamKey => ({
    t, pos: [tg[0] + (p[0] - tg[0]) * c, tg[1] + (p[1] - tg[1]) * c, tg[2] + (p[2] - tg[2]) * c], target: tg, fov,
  });
  return [
    K(0.0, [-1.6, 0.6, 9.6], [0, 0, 0]),
    K(3.2, [-0.5, 0.4, 7.2], [0, 0, 0]),
    K(4.8, [0.4, 0.3, 5.9], [0, 0, 0]),
    K(6.4, [1.5, 0.8, 5.0], [0.1, 0.0, 0]),
    K(9.0, [2.9, 1.2, 3.7], [0.15, -0.05, 0], 30, portrait ? 2.25 : 1),
    K(11.0, [3.4, 0.9, 3.4], [0.1, -0.1, 0], 30, portrait ? 2.25 : 1),
    K(14.0, [2.3, 0.8, 6.8], [0.0, -0.1, 0], 30, portrait ? 3.1 : 1),
  ];
};
const shakes: Shake[] = [{t: T.slash + 0.02, amp: 0.055, decay: 11}, {t: T.separate, amp: 0.012, decay: 6}];

/* ───────────────────────────── scene content ───────────────────────────── */
const buildHalves = (grid: number) => {
  const cube = ConvexSolid.roundedCube(CUBE_HALF, 0.075, grid);
  const nLocal = N_WORLD.clone().applyQuaternion(Q_CUBE.clone().invert());
  const {inside: lower, outside: upper} = cube.clip({n: nLocal, d: 0}, 1);
  const capPts = lower.cap()!.pts.map((p) => p.clone().applyQuaternion(Q_CUBE));
  return {upper: upper.toGeometry(), lower: lower.toGeometry(), capPts};
};

const useGlowCap = () => useMemo(() => {
  const tex = makeObsidianInterior();
  const uniforms = {uGlow: {value: 0}};
  const m = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, map: tex, bumpMap: tex, bumpScale: 1.5, roughness: 0.2, metalness: 0,
    clearcoat: 0.9, clearcoatRoughness: 0.06, envMapIntensity: 1.3,
  });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uGlow = uniforms.uGlow;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float aEdge;\nvarying float vEdge;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvEdge = aEdge;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uGlow;\nvarying float vEdge;')
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        float rim = 1.0 - vEdge;
        float heat = pow(rim, 11.0) * 0.8 + pow(rim, 28.0) * 5.0;
        vec3 ember = mix(vec3(1.0, 0.22, 0.04), vec3(1.0, 0.78, 0.45), pow(rim, 20.0));
        totalEmissiveRadiance += ember * heat * uGlow;`);
  };
  return {mat: m, uniforms};
}, []);

const Obsidian: React.FC<{t: number; halves: ReturnType<typeof buildHalves>; skin: THREE.Material; cap: THREE.Material}> = ({t, halves, skin, cap}) => {
  // pre-slash: slow, decelerating yaw settles exactly onto Q_CUBE at the moment of the cut
  const pre = 1 - easeOutCubic(seg(t, 0, T.slash));
  const yaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0.95 * pre);
  const qCube = yaw.multiply(Q_CUBE.clone());
  const bob = Math.sin(t * 1.15) * 0.035;

  const gap = 0.014 * smoothstep(seg(t, T.seam, T.seam + 0.16));
  const dt = t - T.separate;
  const slide = 0.68 * springStep(dt, 2.7, 0.8);
  const shear = 0.42 * springStep(dt, 2.2, 0.85);
  const tipU = -0.34 * springStep(dt, 2.0, 0.5) + 0.02 * Math.sin(t * 0.9);
  const tipL = 0.075 * springStep(dt, 2.4, 0.6);
  const drift = 0.06 * smootherstep(seg(t, T.separate, T.duration));

  const upPos = N_WORLD.clone().multiplyScalar(gap / 2 + slide).addScaledVector(D_WORLD, shear).add(new THREE.Vector3(0, bob + drift, 0));
  const loPos = N_WORLD.clone().multiplyScalar(-(gap / 2 + slide * 0.34)).addScaledVector(D_WORLD, -shear * 0.22).add(new THREE.Vector3(0, bob - drift, 0));
  const upQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.05 * springStep(dt, 2, 0.5), 0, tipU));
  const loQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, tipL));
  const mats = [skin, cap];
  return (
    <group>
      <group position={upPos} quaternion={upQ}><mesh quaternion={qCube} geometry={halves.upper} material={mats} /></group>
      <group position={loPos} quaternion={loQ}><mesh quaternion={qCube} geometry={halves.lower} material={mats} /></group>
    </group>
  );
};

const Streak: React.FC<{t: number}> = ({t}) => {
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
  const u = (t - T.slash) / 0.07;           // 4 frames at 60fps
  if (u < 0 || u > 3.2) return null;
  const L = 8.5, tail = 3.4;
  const head = -L / 2 + L * easeOutCubic(clamp(u));
  const tl = Math.max(-L / 2, head - tail * (u < 1 ? clamp(u * 1.4) : 1));
  const len = Math.max(0.01, head - tl);
  const mid = (head + tl) / 2;
  const fade = 1 - smoothstep(seg(u, 1.0, 3.2));
  const ang = Math.atan2(D_WORLD.y, D_WORLD.x);
  const pos = D_WORLD.clone().multiplyScalar(mid);
  return (
    <group position={[pos.x, pos.y, 1.6]} rotation={[0, 0, ang]} renderOrder={20}>
      <mesh scale={[len, 0.022, 1]}><planeGeometry /><meshBasicMaterial map={tex} transparent opacity={fade} blending={THREE.AdditiveBlending} depthTest={false} depthWrite={false} toneMapped={false} color={new THREE.Color(3, 3, 3)} /></mesh>
      <mesh scale={[len, 0.16, 1]}><planeGeometry /><meshBasicMaterial map={tex} transparent opacity={0.22 * fade} blending={THREE.AdditiveBlending} depthTest={false} depthWrite={false} toneMapped={false} color={new THREE.Color(1.6, 1.2, 0.9)} /></mesh>
    </group>
  );
};

const Sparks: React.FC<{t: number; capPts: THREE.Vector3[]; count: number}> = ({t, capPts, count}) => {
  const data = useMemo(() => {
    const r = makeRng(404);
    return Array.from({length: count}, () => {
      const a = capPts[Math.floor(r.next() * capPts.length)], b = capPts[Math.floor(r.next() * capPts.length)];
      const p0 = a.clone().lerp(b, r.next());
      const v = new THREE.Vector3(r.range(-0.2, 0.2), r.range(0.1, 0.55), r.range(0.1, 0.9)).add(N_WORLD.clone().multiplyScalar(r.range(-0.2, 0.5)));
      return {p0, v, life: r.range(1.0, 2.6), t0: T.seam + r.range(0, 0.35), k: r.range(1.2, 2.4)};
    });
  }, [capPts, count]);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    return g;
  }, [count]);
  const pa = geo.getAttribute('position') as THREE.BufferAttribute, ca = geo.getAttribute('color') as THREE.BufferAttribute;
  data.forEach((d, i) => {
    const tau = t - d.t0;
    const life = tau / d.life;
    const k = d.k, f = (1 - Math.exp(-k * Math.max(tau, 0))) / k;
    pa.setXYZ(i, d.p0.x + d.v.x * f, d.p0.y + d.v.y * f - 0.05 * Math.max(tau, 0) ** 2, d.p0.z + d.v.z * f);
    const a = tau < 0 || life > 1 ? 0 : (1 - life) ** 2 * smoothstep(tau / 0.05);
    ca.setXYZ(i, 1.4 * a, 0.55 * a, 0.18 * a);
  });
  pa.needsUpdate = ca.needsUpdate = true;
  return <points geometry={geo} frustumCulled={false}><pointsMaterial size={0.018} sizeAttenuation vertexColors transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} /></points>;
};

const Scene: React.FC<{t: number; quality: QualityName; orientation: 'portrait' | 'landscape'}> = ({t, quality, orientation}) => {
  const q = QUALITY[quality];
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const env = useMemo(() => buildStudioEnvironment(gl, 'darkCinematic', q.envSize), [gl, q.envSize]);
  const halves = useMemo(() => buildHalves(q.roundingGrid), [q.roundingGrid]);
  const skin = useMemo(() => makeMaterial('obsidian'), []);
  const {mat: cap, uniforms} = useGlowCap();
  const floorAlpha = useMemo(() => {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const g = c.getContext('2d')!;
    const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    gr.addColorStop(0, 'rgb(0,150,0)'); gr.addColorStop(0.35, 'rgb(0,215,0)'); gr.addColorStop(0.8, 'rgb(0,255,0)'); gr.addColorStop(1, 'rgb(0,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }, []);

  // global per-frame state
  scene.environment = env;
  scene.environmentRotation.y = -1.1 + 1.9 * smootherstep(seg(t, 0.4, 4.6)) + 0.35 * seg(t, 4.6, T.duration);
  const flash = impulse(t - T.slash, 22) * (t >= T.slash ? 1 : 0);
  gl.toneMappingExposure = 1.0 * smootherstep(seg(t, 0.0, T.emerge)) + 0.5 * flash;
  uniforms.uGlow.value = t < T.seam ? 0 : 1.2 * Math.exp(-(t - T.seam) * 0.55);
  const seamLight = t < T.seam ? 0 : 26 * Math.exp(-(t - T.seam) * 1.6);

  const obj = <Obsidian t={t} halves={halves} skin={skin} cap={cap} />;
  return (
    <>
      <CameraRig keys={camKeys(orientation === 'portrait')} time={t} shakes={shakes} />
      <pointLight position={[0.2, 0.0, 0.4]} color={0xff6a28} intensity={seamLight} distance={7} decay={1.6} />
      {obj}
      {q.mirrorFloor && (
        <>
          <group position={[0, 2 * FLOOR_Y, 0]} scale={[1, -1, 1]}>{obj}</group>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y, 0]}>
            <circleGeometry args={[22, 96]} />
            <meshBasicMaterial color={0x000000} alphaMap={floorAlpha} transparent />
          </mesh>
        </>
      )}
      <Streak t={t} />
      <Sparks t={t} capPts={halves.capPts} count={q.particles} />
    </>
  );
};

export const ObsidianSlash: React.FC<ObsidianSlashProps> = ({quality, orientation}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const q = QUALITY[quality];
  const t = frame / FPS;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <ThreeCanvas
        width={width} height={height}
        camera={{fov: 30, near: 0.1, far: 80, position: [0, 0, 9]}}
        gl={{antialias: q.antialias, toneMapping: THREE.ACESFilmicToneMapping, powerPreference: 'high-performance'}}
      >
        <Scene t={t} quality={quality} orientation={orientation} />
      </ThreeCanvas>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 38%, rgba(0,0,0,0.72) 100%)', pointerEvents: 'none'}} />
      {q.grain && (
        <AbsoluteFill style={{mixBlendMode: 'overlay', opacity: 0.1, pointerEvents: 'none'}}>
          <svg width="100%" height="100%"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frame % 97} /><feColorMatrix type="saturate" values="0" /></filter><rect width="100%" height="100%" filter="url(#g)" /></svg>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
