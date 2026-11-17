import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Stage, EffectProps, orbitKeys} from '../../core/Stage';
import {QUALITY} from '../../core/QualityPresets';
import {makeRng} from '../../core/DeterministicRandom';
import {impulse, seg, smootherstep, smoothstep, springStep} from '../../core/Timeline';
import {CamKey} from '../../core/CameraRig';
import {ConvexSolid, Plane3} from '../../geometry/ConvexSolid';
import {makeMaterial} from '../../materials/presets';
import {Cut, cutFrom, makeGlowCap, SlicedObject, slicePieces, Streak} from './slice';

export const DURATION = 14;
const CUT = cutFrom(-22, 4.7, 0, 0.18);

/** Suspended machined bead: octagonal drum with chamfered rims. */
const drum = (): ConvexSolid => {
  const pl: Plane3[] = [];
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; pl.push({n: new THREE.Vector3(Math.cos(a), 0, Math.sin(a)), d: 1.0}); }
  for (const sy of [-1, 1]) {
    pl.push({n: new THREE.Vector3(0, sy, 0), d: 0.62});
    for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; pl.push({n: new THREE.Vector3(Math.cos(a) * 0.7, sy * 0.7, Math.sin(a) * 0.7).normalize(), d: 1.04}); }
  }
  return ConvexSolid.fromPlanes(pl);
};

const camera = (portrait: boolean): CamKey[] => {
  const c = portrait ? 2.4 : 1;
  const s = (p: [number, number, number]): [number, number, number] => [p[0] * c, p[1] * c, p[2] * c];
  return [
    {t: 0, pos: s([2.0, 0.7, 8.4]), target: [0, 0, 0], fov: 30},
    {t: 4.4, pos: s([0.6, 0.4, 5.6]), target: [0, 0, 0], fov: 30},
    {t: 6.4, pos: s([0.3, 0.7, 5.0]), target: [0, 0, 0], fov: 30},
    ...orbitKeys(7.5, 13, [0, 0, 0], () => (portrait ? 1.8 : 1) * 4.6, (u) => 0.5 + 0.7 * u, 0.1, -1.5, 6),
    {t: DURATION, pos: s([-1.8, 1.0, 6.0]), target: [0, 0, 0], fov: 30},
  ];
};

const Shockwave: React.FC<{t: number}> = ({t}) => {
  const tex = useMemo(() => {
    const c = document.createElement('canvas'); c.width = c.height = 512;
    const g = c.getContext('2d')!;
    const gr = g.createRadialGradient(256, 256, 0, 256, 256, 256);
    gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.82, 'rgba(255,255,255,0)'); gr.addColorStop(0.93, 'rgba(255,255,255,1)'); gr.addColorStop(0.97, 'rgba(255,255,255,0.15)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
    return new THREE.CanvasTexture(c);
  }, []);
  const u = (t - CUT.t - 0.05) / 2.4;
  if (u < 0 || u > 1) return null;
  const r = 0.8 + 5.5 * (1 - Math.pow(1 - u, 2.4));
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), CUT.n);
  return (
    <mesh quaternion={q} scale={[r * 2, r * 2, 1]} renderOrder={5}>
      <planeGeometry />
      <meshBasicMaterial map={tex} transparent opacity={0.55 * (1 - u) ** 1.5} blending={THREE.AdditiveBlending} depthWrite={false} depthTest={false} toneMapped={false} color={new THREE.Color(1.0, 1.15, 1.5)} side={THREE.DoubleSide} />
    </mesh>
  );
};

const Dust: React.FC<{t: number; count: number}> = ({t, count}) => {
  const data = useMemo(() => {
    const r = makeRng(77);
    const e1 = new THREE.Vector3().crossVectors(CUT.n, new THREE.Vector3(0, 0, 1)).normalize();
    const e2 = new THREE.Vector3().crossVectors(CUT.n, e1);
    return Array.from({length: count}, () => {
      const a = r.range(0, Math.PI * 2), rad = r.range(0.2, 1.0);
      const dir = e1.clone().multiplyScalar(Math.cos(a)).addScaledVector(e2, Math.sin(a));
      return {p0: dir.clone().multiplyScalar(rad), v: dir.multiplyScalar(r.range(1.2, 3.6)).addScaledVector(CUT.n, r.range(-0.3, 0.3)), life: r.range(1.2, 2.8), k: r.range(1.4, 2.6)};
    });
  }, [count]);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    return g;
  }, [count]);
  const pa = geo.getAttribute('position') as THREE.BufferAttribute, ca = geo.getAttribute('color') as THREE.BufferAttribute;
  data.forEach((d, i) => {
    const tau = Math.max(0, t - CUT.t - 0.06);
    const f = (1 - Math.exp(-d.k * tau)) / d.k, life = tau / d.life;
    pa.setXYZ(i, d.p0.x + d.v.x * f, d.p0.y + d.v.y * f, d.p0.z + d.v.z * f);
    const a = t < CUT.t + 0.06 || life > 1 ? 0 : (1 - life) ** 1.5;
    ca.setXYZ(i, 0.9 * a, 1.0 * a, 1.2 * a);
  });
  pa.needsUpdate = ca.needsUpdate = true;
  return <points geometry={geo} frustumCulled={false}><pointsMaterial size={0.02} sizeAttenuation vertexColors transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} /></points>;
};

export const KatanaShockwave: React.FC<EffectProps> = (props) => {
  const q = QUALITY[props.quality];
  const pieces = useMemo(() => slicePieces(drum(), [CUT], 32), []);
  const skin = useMemo(() => makeMaterial('brushedAluminum'), []);
  const {mat: cap, uniforms} = useMemo(() => makeGlowCap({color: 0xe8eaee, metalness: 1, roughness: 0.18, ember: [0.3, 0.6, 1.0], hot: [0.9, 0.96, 1]}), []);
  return (
    <Stage {...props}
      spec={{
        env: 'highContrastMetallic', floorY: -2.0, camera, vignette: 0.75,
        shakes: [{t: CUT.t + 0.02, amp: 0.05, decay: 12}],
        exposure: (t) => smootherstep(seg(t, 0, 2.4)) + 0.4 * (t >= CUT.t ? impulse(t - CUT.t, 24) : 0),
        envRotation: (t) => -0.8 + 1.4 * smootherstep(seg(t, 0.3, 4.6)) + 0.2 * seg(t, 4.6, DURATION),
      }}
      render={(t) => {
        uniforms.uGlow.value = t < CUT.t + 0.1 ? 0 : 1.0 * Math.exp(-(t - CUT.t - 0.1) * 0.9);
        const since = t - CUT.t;
        // surface vibration: decaying high-frequency oscillation travelling away from the cut
        const vib = since < 0 ? 0 : 0.012 * Math.exp(-since * 2.2) * Math.sin(since * 150);
        const R = 1 - smootherstep(seg(t, 11.8, 13.6)) * 0;       // pieces stay apart – clean final composition
        const sep = (_c: number, tt: number) => 0.012 * smoothstep(seg(tt, CUT.t + 0.1, CUT.t + 0.25)) + (0.55 * springStep(tt - CUT.t - 0.55, 2.2, 0.8) + vib) * R;
        return (
          <>
            <SlicedObject pieces={pieces} cuts={[CUT]} skin={skin} cap={cap} t={t} sep={sep}
              tumble={(pi, tt) => [0, 0, (pi === 0 ? -1 : 1) * 0.18 * springStep(tt - CUT.t - 0.6, 1.9, 0.55)]} />
            <Streak t={t} cut={CUT} tint={[0.9, 1.2, 1.7]} />
            <Shockwave t={t} />
            <Dust t={t} count={q.particles * 2} />
          </>
        );
      }}
    />
  );
};
