import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Stage, EffectProps, orbitKeys} from '../../core/Stage';
import {seg, smootherstep, springStep} from '../../core/Timeline';
import {CamKey} from '../../core/CameraRig';
import {ConvexSolid, Plane3} from '../../geometry/ConvexSolid';
import {makeMaterial} from '../../materials/presets';
import {Cut, makeGlowCap, SlicedObject, slicePieces} from './slice';

export const DURATION = 15;
const CUT_T = 4.8;               // invisible blade: no streak, a refractive front crosses the cut
const FRONT_T = 1.1;             // seconds for the cut to propagate
const CUT: Cut = {n: new THREE.Vector3(0.18, 1, 0.12).normalize(), d: 0.05, t: CUT_T, dir: new THREE.Vector3(1, -0.18, 0).normalize()};

/** Faceted crystal obelisk: 10-sided prism tapering to a pyramid tip, flat base bevel. */
const sculpt = (): ConvexSolid => {
  const planes: Plane3[] = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.15;
    planes.push({n: new THREE.Vector3(Math.cos(a), 0.0, Math.sin(a)), d: 0.95});
    const a2 = a + Math.PI / 10;                         // staggered upper facets -> twisted cut look
    planes.push({n: new THREE.Vector3(Math.cos(a2), 0.55, Math.sin(a2)).normalize(), d: 1.25});
  }
  planes.push({n: new THREE.Vector3(0, -1, 0), d: 1.15});
  planes.push({n: new THREE.Vector3(0, 1, 0), d: 1.5});
  planes.push({n: new THREE.Vector3(0.7, -0.7, 0).normalize(), d: 1.3}, {n: new THREE.Vector3(-0.7, -0.7, 0).normalize(), d: 1.3});
  return ConvexSolid.fromPlanes(planes);
};

const camera = (portrait: boolean): CamKey[] => {
  const c = portrait ? 2.3 : 1;
  const s = (p: [number, number, number]): [number, number, number] => [p[0] * c, p[1] * c, p[2] * c];
  const o = orbitKeys(6.6, 13.2, [0, 0, 0], (u) => (portrait ? 1.8 : 1) * (6.0 - 1.6 * Math.sin(u * Math.PI)), (u) => 0.3 + 0.8 * Math.sin(u * Math.PI), -0.4, 1.9, 8);
  return [
    {t: 0, pos: s([-2.5, 0.8, 8.5]), target: [0, 0, 0], fov: 30},
    {t: 4.0, pos: s([-1.2, 0.5, 6.6]), target: [0, 0, 0], fov: 30},
    {t: 5.8, pos: s([-0.3, 0.3, 5.6]), target: [0, 0.1, 0], fov: 30},
    ...o,
    {t: DURATION, pos: s([1.8, 0.6, 6.4]), target: [0, 0, 0], fov: 30},
  ];
};

export const GlassBlade: React.FC<EffectProps> = (props) => {
  const pieces = useMemo(() => slicePieces(sculpt(), [CUT], 30), []);
  // Transmission looked milky in the software GL path; use a controllable fresnel-glass look instead:
  // dark teal body, high env reflection, partial opacity, rendered back-faces first for correct depth.
  const glass = (opacity: number) => new THREE.MeshPhysicalMaterial({color: 0x2a6a60, metalness: 0, roughness: 0.015, ior: 1.55, specularIntensity: 1, envMapIntensity: 3.2, clearcoat: 1, clearcoatRoughness: 0.01, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide});
  const skin = useMemo(() => glass(0.32), []);
  const {mat: cap, uniforms} = useMemo(() => {
    const r = makeGlowCap({color: 0x2f7a6e, metalness: 0, roughness: 0.01, ember: [0.1, 0.7, 0.6], hot: [0.8, 1.0, 0.95]});
    Object.assign(r.mat, {transparent: true, opacity: 0.4, depthWrite: false, side: THREE.DoubleSide, bumpMap: null, map: null, envMapIntensity: 3.2});
    return r;
  }, []);
  return (
    <Stage {...props}
      spec={{
        env: 'glassShowcase', floorY: -1.9, camera, vignette: 0.7,
        exposure: (t) => smootherstep(seg(t, 0, 2.5)),
        envRotation: (t) => -0.6 + 1.1 * smootherstep(seg(t, 0.3, 5)) + 0.3 * seg(t, 5, DURATION),
      }}
      render={(t) => {
        const fr = seg(t, CUT_T, CUT_T + FRONT_T);
        uniforms.uFront.value = t < CUT_T || t > CUT_T + FRONT_T + 0.5 ? -9 : -0.2 + 1.4 * fr;
        uniforms.uGlow.value = t < CUT_T ? 0 : 0.5 * Math.exp(-(t - CUT_T) * 0.5);
        const R = 1 - smootherstep(seg(t, 12.6, 14.6));
        const sep = (_ci: number, tt: number) => (0.012 * seg(tt, CUT_T + FRONT_T, CUT_T + FRONT_T + 0.3) + 0.5 * springStep(tt - (CUT_T + FRONT_T + 0.5), 1.8, 0.9)) * (tt > 12 ? R : 1);
        return (
          <SlicedObject pieces={pieces} cuts={[CUT]} skin={skin} cap={cap} t={t} sep={sep}
            tumble={(pi, tt) => [0, 0, (pi === 0 ? -1 : 1) * 0.14 * springStep(tt - CUT_T - 1.6, 1.4, 0.7) * (tt > 12 ? R : 1)]}
            extra={(pi) => [0, Math.sin(t * 0.9 + pi) * 0.03, 0]} />
        );
      }}
    />
  );
};
