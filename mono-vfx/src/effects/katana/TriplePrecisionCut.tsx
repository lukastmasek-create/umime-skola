import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Stage, EffectProps, orbitKeys} from '../../core/Stage';
import {QUALITY} from '../../core/QualityPresets';
import {makeRng} from '../../core/DeterministicRandom';
import {impulse, seg, smootherstep, springStep, clamp} from '../../core/Timeline';
import {CamKey} from '../../core/CameraRig';
import {ConvexSolid} from '../../geometry/ConvexSolid';
import {makeMaterial} from '../../materials/presets';
import {Cut, cutFrom, makeGlowCap, SlicedObject, slicePieces, Streak} from './slice';

export const DURATION = 16;
const CUTS: Cut[] = [cutFrom(28, 4.6, 0.0, 0.0), cutFrom(-38, 5.1, 0.18, 0.45), cutFrom(84, 5.6, -0.12, -0.4)];

const camera = (portrait: boolean): CamKey[] => {
  const c = portrait ? 2.6 : 1;
  const sc = (p: [number, number, number]): [number, number, number] => [p[0] * c, 0.4 + (p[1] - 0.4) * c, p[2] * c];
  const intro: CamKey[] = [
    {t: 0, pos: sc([-1.5, 0.5, 9]), target: [0, 0, 0], fov: 30},
    {t: 3.0, pos: sc([-0.6, 0.4, 7.2]), target: [0, 0, 0], fov: 30},
    {t: 4.7, pos: sc([0.3, 0.3, 6.0]), target: [0, 0, 0], fov: 30},
  ];
  const orbit = orbitKeys(6.2, 12.4, [0, 0, 0], (u) => (portrait ? 1.7 : 1) * (6.4 - 1.9 * Math.sin(u * Math.PI)), (u) => 0.35 + 0.9 * Math.sin(u * Math.PI), 0.15, 2.9, 10);
  const outro: CamKey[] = [{t: DURATION, pos: sc([-1.2, 0.5, 6.6]), target: [0, 0, 0], fov: 30}];
  return [...intro, ...orbit.slice(0), ...outro];
};

export const TriplePrecisionCut: React.FC<EffectProps> = (props) => {
  const q = QUALITY[props.quality];
  const sphereCount = props.quality === 'preview' ? 220 : props.quality === 'high' ? 600 : 1400;
  const data = useMemo(() => {
    const pieces = slicePieces(ConvexSolid.sphere(1.15, sphereCount), CUTS, 40);
    const rng = makeRng(2024);
    const tum = pieces.map(() => [rng.range(-0.5, 0.5), rng.range(-0.5, 0.5), rng.range(-0.5, 0.5)]);
    return {pieces, tum};
  }, [sphereCount]);
  const skin = useMemo(() => makeMaterial('chrome'), []);
  const {mat: cap, uniforms} = useMemo(() => makeGlowCap({color: 0xd6d9de, metalness: 1, roughness: 0.28, ember: [0.25, 0.5, 1.0], hot: [0.85, 0.95, 1.0]}), []);
  void q;
  return (
    <Stage {...props}
      spec={{
        env: 'highContrastMetallic', floorY: -2.2, camera,
        shakes: CUTS.map((c) => ({t: c.t + 0.02, amp: 0.03, decay: 12})),
        exposure: (t) => smootherstep(seg(t, 0, 2.4)) + 0.3 * CUTS.reduce((m, c) => Math.max(m, t >= c.t ? impulse(t - c.t, 24) : 0), 0),
        envRotation: (t) => -0.9 + 1.5 * smootherstep(seg(t, 0.3, 4.6)) + 0.25 * seg(t, 4.6, DURATION),
        vignette: 0.75,
      }}
      render={(t) => {
        uniforms.uGlow.value = CUTS.reduce((m, c) => Math.max(m, t < c.t + 0.3 ? 0 : 1.1 * Math.exp(-(t - c.t - 0.3) * 0.8)), 0);
        const R = 1 - smootherstep(seg(t, 10.6, 13.4));          // reverse assembly
        const sep = (ci: number, tt: number) => (0.32 + 0.1 * ci) * springStep(tt - (CUTS[ci].t + 0.55 + ci * 0.12), 2.4, 0.82) * R + 0.012 * clamp((tt - CUTS[ci].t - 0.3) * 6);
        return (
          <>
            <SlicedObject pieces={data.pieces} cuts={CUTS} skin={skin} cap={cap} t={t} sep={sep}
              tumble={(pi, tt) => { const k = springStep(tt - 6.1, 1.6, 0.6) * R; const a = data.tum[pi]; return [a[0] * k, a[1] * k, a[2] * k]; }}
              extra={() => [0, Math.sin(t * 1.1) * 0.03, 0]} />
            {CUTS.map((c, i) => <Streak key={i} t={t} cut={c} tint={[0.9, 1.2, 1.7]} />)}
          </>
        );
      }}
    />
  );
};
