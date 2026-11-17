import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Stage, EffectProps} from '../../core/Stage';
import {seg, smootherstep, easeInOutCubic, springStep} from '../../core/Timeline';
import {CamKey} from '../../core/CameraRig';
import {ConvexSolid} from '../../geometry/ConvexSolid';
import {makeMaterial} from '../../materials/presets';
import {Cut, makeGlowCap, SlicedObject, slicePieces} from './slice';

export const DURATION = 18;
const LAYERS = 30;
const H = 1.15;                         // half height of the cube
const SPAN = (H * 2) / LAYERS;
const CUT_T0 = 4.6, CUT_DT = 0.045;     // staggered blade passes, top -> bottom
const Y = new THREE.Vector3(0, 1, 0);
const CUTS: Cut[] = Array.from({length: LAYERS - 1}, (_, i) => ({n: Y.clone(), d: -H + SPAN * (i + 1), t: CUT_T0 + i * CUT_DT, dir: new THREE.Vector3(1, 0, 0)}));

const camera = (portrait: boolean): CamKey[] => {
  const c = portrait ? 2.2 : 1;
  const s = (p: [number, number, number]): [number, number, number] => [p[0] * c, p[1], p[2] * c];
  return [
    {t: 0, pos: s([-2.0, 0.9, 9.0]), target: [0, 0, 0], fov: 30},
    {t: 4.4, pos: s([-1.2, 0.5, 6.6]), target: [0, 0, 0], fov: 30},
    {t: 7.5, pos: s([1.6, 0.4, 6.2]), target: [0, 0, 0], fov: 30},
    // travel *between* the layers: low, grazing, pushing through the spread stack
    {t: 9.8, pos: [portrait ? 2.6 : 1.8, -0.35, portrait ? 3.6 : 2.6], target: [0, -0.3, 0], fov: 38},
    {t: 11.4, pos: [0.4, 0.2, portrait ? 2.4 : 1.6], target: [-0.6, 0.35, 0], fov: 42},
    {t: 13.2, pos: [-2.0, 0.9, portrait ? 4.6 : 3.4], target: [0, 0.3, 0], fov: 34},
    {t: DURATION, pos: s([-1.6, 1.6, 7.4]), target: [0, 0, 0], fov: 30},
  ];
};

export const InfiniteSlice: React.FC<EffectProps> = (props) => {
  const pieces = useMemo(() => slicePieces(ConvexSolid.roundedCube(H, 0.06, 3), CUTS, 40).map((p) => ({...p, layer: p.signs.reduce((a, s) => a + (s > 0 ? 1 : 0), 0)})), []);
  // wait: layer index = number of cuts whose +side the piece lies on (cuts ordered bottom->top)
  const skin = useMemo(() => makeMaterial('brushedAluminum'), []);
  const {mat: cap, uniforms} = useMemo(() => makeGlowCap({color: 0x20242a, metalness: 1, roughness: 0.22, ember: [0.2, 0.55, 1.0], hot: [0.85, 0.95, 1.0]}), []);
  return (
    <Stage {...props}
      spec={{
        env: 'highContrastMetallic', floorY: -2.4, camera, vignette: 0.72,
        exposure: (t) => smootherstep(seg(t, 0, 2.4)),
        envRotation: (t) => -0.8 + 1.4 * smootherstep(seg(t, 0.3, 4.6)) + 0.45 * seg(t, 4.6, DURATION),
      }}
      render={(t) => {
        uniforms.uGlow.value = t < CUT_T0 ? 0 : 0.9 * Math.exp(-(t - CUT_T0 - 1) * 0.6);
        // layer index L (0 = bottom): sep position = centered stack spread with staggered, wave-like timing
        const spread = (L: number) => {
          const centered = L - (LAYERS - 1) / 2;
          const start = 6.2 + (L / LAYERS) * 1.2;           // top layers lift first
          const open = springStep(t - start, 2.0, 0.85);
          const close = easeInOutCubic(seg(t, 13.8 + (1 - L / LAYERS) * 1.2, 16.2 + (1 - L / LAYERS) * 1.2));
          return centered * 0.22 * open * (1 - close * 0.0) * (1 - close) + centered * 0 ;
        };
        const twist = (L: number) => easeInOutCubic(seg(t, 13.8 + (1 - L / LAYERS) * 1.2, 16.4 + (1 - L / LAYERS) * 1.2)) * (L - (LAYERS - 1) / 2) * 0.085;
        return (
          <group>
            {pieces.map((p, pi) => {
              const L = (p as any).layer as number;
              const y = spread(L);
              const w = Math.sin(t * 1.3 + L * 0.35) * 0.012 * seg(t, 7, 9);
              return (
                <group key={pi} position={[0, y + w, 0]} rotation={[0, twist(L), 0]}>
                  <mesh geometry={p.geo} material={[skin, cap]} />
                </group>
              );
            })}
          </group>
        );
      }}
    />
  );
};
