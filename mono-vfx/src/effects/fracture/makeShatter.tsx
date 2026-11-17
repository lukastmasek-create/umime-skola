import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Stage, EffectProps} from '../../core/Stage';
import {QualityName} from '../../core/QualityPresets';
import {StudioName} from '../../lighting/StudioEnvironment';
import {KeySpec, camFrom, fadeIn, makeWarp, sweepEnv} from '../../core/kit';
import {makeRng} from '../../core/DeterministicRandom';
import {ConvexSolid} from '../../geometry/ConvexSolid';
import {simulate} from '../../physics/RigidSim';
import {impulse, seg, smoothstep} from '../../core/Timeline';
import {buildShards, CrackLines, FragmentField, ShardSet, useCapMat} from './shatter';

export interface ShatterCfg {
  duration: number; env: StudioName; floorY: number; camera: KeySpec[]; pm?: number; fov?: number;
  build: (q: QualityName) => {solid: ConvexSolid; seeds: THREE.Vector3[]; impact: THREE.Vector3; onSurface: (p: THREE.Vector3) => boolean};
  skin: () => THREE.Material;
  capTint?: number;
  warp: [number, number][];
  t0: number; crack: number; crackLines?: boolean;
  burst: {speed: number; jitter: number; spin: number; up?: number; gravity: number; restitution?: number};
  extras?: (t: number, S: number, set: ShardSet) => React.ReactNode;
  exposure?: (t: number) => number; envRot?: (t: number) => number; shakes?: {t: number; amp: number; decay?: number}[];
  vignette?: number; lights?: (t: number) => React.ReactNode;
}

export const makeShatter = (cfg: ShatterCfg): React.FC<EffectProps> => {
  const warp = makeWarp(cfg.warp);
  const Smax = warp(cfg.duration);
  return (props) => {
    const data = useMemo(() => {
      const b = cfg.build(props.quality);
      const set = buildShards(b.solid, b.seeds, b.impact, b.onSurface);
      const r = makeRng(31);
      const rel = set.shards.map((s) => cfg.t0 + cfg.crack * (s.dist / set.maxDist) + r.range(0, 0.04));
      const inits = set.shards.map((s, i) => {
        const dir = s.centroid.clone().sub(b.impact);
        const L = Math.max(dir.length(), 1e-3); dir.divideScalar(L);
        const fall = 1 - 0.55 * (s.dist / set.maxDist);
        const v = dir.multiplyScalar(cfg.burst.speed * fall).add(new THREE.Vector3(r.range(-1, 1), r.range(-1, 1) + (cfg.burst.up ?? 0), r.range(-1, 1)).multiplyScalar(cfg.burst.jitter));
        return {pos: s.centroid.clone(), vel: v, angVel: new THREE.Vector3(r.range(-1, 1), r.range(-1, 1), r.range(-1, 1)).multiplyScalar(cfg.burst.spin), points: s.points, radius: s.radius, mass: 1 + s.radius * 4, releaseAt: rel[i]};
      });
      const sim = simulate(inits, {
        duration: Smax, gravity: () => new THREE.Vector3(0, -cfg.burst.gravity, 0), planes: [{n: new THREE.Vector3(0, 1, 0), d: cfg.floorY}],
        restitution: cfg.burst.restitution ?? 0.25, friction: 0.6, angDrag: 0.4, linDrag: 0.05, sub: 4,
      });
      return {set, sim, impact: b.impact, whole: b.solid.toGeometry(30)};
    }, [props.quality]);
    const skin = useMemo(() => cfg.skin(), []);
    const {mat: cap, uniforms} = useCapMat(cfg.capTint);
    return (
      <Stage {...props} spec={{
        env: cfg.env, floorY: cfg.floorY, camera: camFrom(cfg.camera, cfg.pm ?? 2.2), vignette: cfg.vignette ?? 0.72, shakes: cfg.shakes,
        exposure: cfg.exposure ?? ((t) => fadeIn(t)), envRotation: cfg.envRot ?? ((t) => sweepEnv(t, 0.3, cfg.t0 + 1, -0.8, 0.5, 0.3, cfg.duration)), lights: cfg.lights,
      }}
        render={(t) => {
          const S = warp(t);
          const front = S < cfg.t0 ? -1 : (S - cfg.t0) / cfg.crack * data.set.maxDist;
          uniforms.uGlow.value = S < cfg.t0 ? 0 : 0.9 * Math.exp(-(S - cfg.t0) * 0.7);
          const released = (i: number) => S >= cfg.t0 + cfg.crack * (data.set.shards[i].dist / data.set.maxDist);
          void released;
          return (
            <>
              {S < cfg.t0 && <mesh geometry={data.whole} material={[skin, cap]} />}
              {S >= cfg.t0 && <FragmentField set={data.set} skin={skin} cap={cap} t={S} xf={(i, s, p, q) => data.sim.sample(i, s, p, q)} />}
              {cfg.crackLines !== false && S > cfg.t0 - 0.01 && S < cfg.t0 + cfg.crack + 0.15 && (
                <CrackLines set={data.set} front={front * 1.02} alpha={1 - smoothstep(seg(S, cfg.t0 + cfg.crack * 0.75, cfg.t0 + cfg.crack + 0.12))} />
              )}
              {cfg.extras?.(t, S, data.set)}
            </>
          );
        }}
      />
    );
  };
};
export {impulse};
