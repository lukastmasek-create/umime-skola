import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Stage, EffectProps} from '../../core/Stage';
import {camFrom, fadeIn, sweepEnv} from '../../core/kit';
import {seg, smootherstep, springStep, easeInOutCubic, clamp} from '../../core/Timeline';
import {makeRng} from '../../core/DeterministicRandom';
import {makeMaterial} from '../../materials/presets';
import {makeGlass} from '../../materials/glass';
import {Instances} from '../../core/Instances';
import {magnetic} from '../../core/magnet';
import {ConvexSolid} from '../../geometry/ConvexSolid';
import {impactSeeds} from '../../geometry/voronoi';
import {simulate} from '../../physics/RigidSim';
import {buildShards, FragmentField} from '../fracture/shatter';
import {makeGlowCap} from '../katana/slice';

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const Q0 = new THREE.Quaternion();
const darkMetal = (c = 0x3a3e46) => { const m = makeMaterial('brushedAluminum'); m.color = new THREE.Color(c); m.roughness = 0.2; return m; };

interface Part {target: THREE.Vector3; q: THREE.Quaternion; size: THREE.Vector3; start: THREE.Vector3; q0: THREE.Quaternion; delay: number; dur: number; col: number}
const scatter = (r: ReturnType<typeof makeRng>, target: THREE.Vector3, minR = 4, maxR = 9) => target.clone().add(V(r.range(-1, 1), r.range(-0.6, 1), r.range(-1, 1)).normalize().multiplyScalar(r.range(minR, maxR)));
const randQ = (r: ReturnType<typeof makeRng>) => new THREE.Quaternion().setFromEuler(new THREE.Euler(r.range(-3, 3), r.range(-3, 3), r.range(-3, 3)));

const partMatrix = (p: Part, t: number, m: THREE.Matrix4, turns = 0.6, snap = true) => {
  const u = seg(t, p.delay, p.delay + p.dur);
  const pos = magnetic(p.start, p.target, u, turns);
  const q = p.q0.clone().slerp(p.q, smootherstep(u));
  if (snap && u >= 1) { const k = springStep(t - p.delay - p.dur, 28, 0.3) - 1; pos.addScaledVector(p.target.clone().normalize(), -0.025 * k); }
  return m.compose(pos, q, p.size);
};

/* ───────── 26 Magnetic Cube ───────── */
export const D26 = 17;
export const MagneticCube: React.FC<EffectProps> = (props) => {
  const G = props.quality === 'preview' ? 12 : 16, S = 2.0 / G;
  const parts = useMemo<Part[]>(() => {
    const r = makeRng(26), L: Part[] = [];
    for (let i = 0; i < G; i++) for (let j = 0; j < G; j++) for (let k = 0; k < G; k++) {
      if (i > 0 && i < G - 1 && j > 0 && j < G - 1 && k > 0 && k < G - 1) continue;
      const target = V((i - (G - 1) / 2) * S, (j - (G - 1) / 2) * S, (k - (G - 1) / 2) * S);
      const lay = Math.max(Math.abs(i - (G - 1) / 2), Math.abs(j - (G - 1) / 2), Math.abs(k - (G - 1) / 2)) / (G / 2);
      L.push({target, q: Q0, size: V(S * 0.96, S * 0.96, S * 0.96), start: scatter(r, target, 5, 10), q0: randQ(r), delay: 1.2 + (1 - lay) * 0.0 + r.range(0, 5.5) , dur: r.range(3.0, 4.2), col: r.next()});
    }
    return L;
  }, [G, S]);
  const geo = useMemo(() => new THREE.BoxGeometry(1, 1, 1, 1, 1, 1), []);
  const mA = useMemo(() => makeMaterial('chrome'), []), mB = useMemo(() => darkMetal(), []);
  return (
    <Stage {...props} spec={{
      env: 'highContrastMetallic', floorY: -2.0, exposure: (t) => fadeIn(t), envRotation: (t) => sweepEnv(t, 0.3, 11, -0.9, 0.2, 0, D26) + 1.4 * smootherstep(seg(t, 13, 16)),
      camera: camFrom([[0, [-3.0, 1.4, 11], [0, 0, 0]], [5, [-2.0, 1.0, 8.6], [0, 0, 0]], [9, [2.6, 0.9, 7.6], [0, 0, 0]], [12.5, [1.6, 0.6, 5.8], [0, 0, 0]], [17, [-1.2, 0.6, 6.4], [0, 0, 0]]], 1.8),
    }}
      render={(t) => (
        <group>
          <Instances count={parts.length} geometry={geo} material={mA} t={t} fill={(i, tt, m) => (parts[i].col < 0.86 ? partMatrix(parts[i], tt, m) : false)} />
          <Instances count={parts.length} geometry={geo} material={mB} t={t} fill={(i, tt, m) => (parts[i].col >= 0.86 ? partMatrix(parts[i], tt, m) : false)} />
        </group>
      )} />
  );
};

/* ───────── 27 Particle Sphere ───────── */
export const D27 = 15;
export const ParticleSphere: React.FC<EffectProps> = (props) => {
  const N = props.quality === 'preview' ? 1400 : 3200;
  const pts = useMemo(() => {
    const r = makeRng(27), ga = Math.PI * (3 - Math.sqrt(5));
    return Array.from({length: N}, (_, i) => {
      const y = 1 - (2 * (i + 0.5)) / N, rad = Math.sqrt(1 - y * y), a = ga * i;
      const target = V(Math.cos(a) * rad, y, Math.sin(a) * rad).multiplyScalar(1.3);
      const cloud = V(r.range(-1, 1), r.range(-1, 1), r.range(-1, 1)).normalize().multiplyScalar(Math.pow(r.next(), 0.5) * 4.0);
      return {target, cloud, sp: r.range(0.4, 1.2), org: r.range(0, 4.5), s: r.range(0.018, 0.04)};
    });
  }, [N]);
  const geo = useMemo(() => new THREE.IcosahedronGeometry(1, 1), []);
  const m = useMemo(() => makeMaterial('chrome'), []), solid = useMemo(() => makeMaterial('mercury'), []);
  return (
    <Stage {...props} spec={{
      env: 'highContrastMetallic', floorY: -2.0, exposure: (t) => fadeIn(t), envRotation: (t) => sweepEnv(t, 0.3, 9, -0.9, 0.5, 0.4, D27),
      camera: camFrom([[0, [-1.5, 0.8, 10], [0, 0, 0]], [5, [0.6, 0.6, 8], [0, 0, 0]], [9, [2.4, 0.7, 6.2], [0, 0, 0]], [12, [-1.6, 0.4, 5.2], [0, 0, 0]], [15, [0.6, 0.5, 6.0], [0, 0, 0]]], 1.8),
    }}
      render={(t) => {
        const org = easeInOutCubic(seg(t, 3.0, 9.0)), fuse = smootherstep(seg(t, 9.0, 11.2));
        return (
          <group rotation={[0, t * 0.18, 0]}>
            <Instances count={N} geometry={geo} material={m} t={t} fill={(i, tt, mm) => {
              const d = pts[i], k = clamp(org * 1.25 - d.org / 4.5 * 0.25, 0, 1), e = k * k * (3 - 2 * k);
              const ang = tt * d.sp * (1 - e) * 0.9;
              const c = d.cloud.clone().applyAxisAngle(V(0, 1, 0), ang);
              const p = c.lerp(d.target, e);
              if (fuse >= 1) return false;
              const sc = d.s * (1 + 0.4 * e) * (1 - fuse * 0.8);
              return mm.compose(p, Q0, V(sc, sc, sc));
            }} />
            {fuse > 0 && <mesh material={solid} scale={0.96 + 0.04 * fuse} visible={fuse > 0.02}><sphereGeometry args={[1.3, 128, 96]} /></mesh>}
          </group>
        );
      }} />
  );
};

/* ───────── 28 Reverse Explosion ───────── */
export const D28 = 17;
export const ReverseExplosion: React.FC<EffectProps> = (props) => {
  const SIM = 4.5;
  const data = useMemo(() => {
    const solid = ConvexSolid.roundedCube(1.1, 0.05, 3), imp = V(0, 0, 0);
    const set = buildShards(solid, impactSeeds(props.quality === 'preview' ? 130 : 260, 1.1, imp, 17, 1.0), imp, () => false);
    const r = makeRng(28);
    const inits = set.shards.map((s) => {
      const dir = s.centroid.clone().sub(imp).normalize();
      return {pos: s.centroid.clone(), vel: dir.multiplyScalar(r.range(3.0, 5.5)).add(V(r.range(-0.8, 0.8), r.range(0.6, 2.2), r.range(-0.8, 0.8))), angVel: V(r.range(-1, 1), r.range(-1, 1), r.range(-1, 1)).multiplyScalar(6), points: s.points, radius: s.radius, mass: 1 + s.radius * 4, releaseAt: 0.15};
    });
    const sim = simulate(inits, {duration: SIM, gravity: () => V(0, -8, 0), planes: [{n: V(0, 1, 0), d: -1.9}], restitution: 0.28, friction: 0.6, angDrag: 0.5, linDrag: 0.06, sub: 4});
    return {set, sim, whole: solid.toGeometry(30)};
  }, [props.quality]);
  const skin = useMemo(() => { const m = makeMaterial('ceramic', {color: 0xcfc8bb}); m.roughness = 0.18; return m; }, []);
  const {mat: cap} = useMemo(() => makeGlowCap({color: 0xd9a24a, metalness: 1, roughness: 0.25, ember: [1, 0.5, 0.1], hot: [1, 0.85, 0.5]}), []);
  const S = (t: number) => SIM * (1 - smootherstep(seg(t, 3.0, 12.4)) * 0.985 + 0.0) * (t < 3.0 ? 1 : 1);
  return (
    <Stage {...props} spec={{
      env: 'softProduct', floorY: -1.9, exposure: (t) => fadeIn(t, 1.5), envRotation: (t) => sweepEnv(t, 0.3, 13, -0.5, 0.4, 0, D28) + 1.2 * smootherstep(seg(t, 14, 16.4)), vignette: 0.6,
      camera: camFrom([[0, [-3, 4.6, 8], [0, -1.2, 0]], [4, [-1.4, 3.2, 8.4], [0, -1.0, 0]], [8, [2.8, 1.8, 6.8], [0, -0.4, 0]], [12, [1.4, 0.8, 7.4], [0, 0, 0]], [14, [-0.4, 0.6, 7.0], [0, 0, 0]], [17, [-1.2, 0.7, 6.6], [0, 0, 0]]], 1.6),
    }}
      render={(t) => {
        const s = S(t);
        const whole = s < 0.04;
        return whole ? <mesh geometry={data.whole} material={[skin, cap]} /> : <FragmentField set={data.set} skin={skin} cap={cap} t={s} xf={(i, tt, p, q) => data.sim.sample(i, tt, p, q)} />;
      }} />
  );
};

/* ───────── 29 Magnetic Sculpture ───────── */
export const D29 = 20;
export const MagneticSculpture: React.FC<EffectProps> = (props) => {
  const {rods, plates} = useMemo(() => {
    const r = makeRng(29), rods: Part[] = [], plates: Part[] = [];
    const strands = 5, levels = 34;
    for (let s = 0; s < strands; s++) for (let l = 0; l < levels; l++) {
      const y0 = (l / levels - 0.5) * 4.6, y1 = ((l + 1) / levels - 0.5) * 4.6;
      const rad = (y: number) => 1.1 + 0.55 * Math.sin((y + 2.3) * 0.9) + 0.25 * Math.cos(y * 2.2);
      const a0 = (s / strands) * Math.PI * 2 + y0 * 0.9, a1 = (s / strands) * Math.PI * 2 + y1 * 0.9;
      const p0 = V(Math.cos(a0) * rad(y0), y0, Math.sin(a0) * rad(y0)), p1 = V(Math.cos(a1) * rad(y1), y1, Math.sin(a1) * rad(y1));
      const mid = p0.clone().add(p1).multiplyScalar(0.5), dir = p1.clone().sub(p0), len = dir.length();
      const q = new THREE.Quaternion().setFromUnitVectors(V(0, 0, 1), dir.normalize());
      rods.push({target: mid, q, size: V(0.07, 0.07, len * 1.04), start: scatter(r, mid, 4, 9), q0: randQ(r), delay: 0.8 + (l / levels) * 5.5 + r.range(0, 2.2), dur: r.range(2.6, 3.6), col: r.next()});
    }
    for (let l = 0; l < levels; l += 3) {
      const y = (l / levels - 0.5) * 4.6, rad = 1.1 + 0.55 * Math.sin((y + 2.3) * 0.9) + 0.25 * Math.cos(y * 2.2);
      for (let s = 0; s < strands; s++) {
        const a = ((s + 0.5) / strands) * Math.PI * 2 + y * 0.9, c = V(Math.cos(a) * rad * 0.96, y, Math.sin(a) * rad * 0.96);
        const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -a + Math.PI / 2, 0.15));
        plates.push({target: c, q, size: V(0.5, 0.045, 0.34), start: scatter(r, c, 4, 9), q0: randQ(r), delay: 1.4 + (l / levels) * 6 + r.range(0, 2), dur: r.range(2.6, 3.6), col: r.next()});
      }
    }
    return {rods, plates};
  }, []);
  const box = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const m1 = useMemo(() => makeMaterial('chrome'), []), m2 = useMemo(() => darkMetal(0x23262c), []), m3 = useMemo(() => { const m = makeMaterial('chrome', {color: 0xe8b26c}); m.roughness = 0.1; return m; }, []);
  return (
    <Stage {...props} spec={{
      env: 'highContrastMetallic', floorY: -2.7, exposure: (t) => fadeIn(t), envRotation: (t) => sweepEnv(t, 0.3, 12, -0.9, 0.6, 0.5, D29),
      camera: camFrom([[0, [-4, 1.4, 12], [0, 0, 0]], [6, [-2.0, 1.0, 9.4], [0, 0, 0]], [10, [3.4, 0.8, 8.6], [0, 0, 0]], [14, [3.0, 1.8, 5.2], [0, 0.4, 0], 34, 1.5], [17, [-3.2, 0.4, 5.6], [0, -0.3, 0], 34, 1.5], [20, [-0.6, 1.0, 9.8], [0, 0, 0]]], 1.5),
    }}
      render={(t) => (
        <group rotation={[0, 0.2 * t * smootherstep(seg(t, 9, 12)), 0]}>
          <Instances count={rods.length} geometry={box} material={m1} t={t} fill={(i, tt, m) => (i % 3 ? partMatrix(rods[i], tt, m, 0.5, false) : false)} />
          <Instances count={rods.length} geometry={box} material={m3} t={t} fill={(i, tt, m) => (i % 3 === 0 ? partMatrix(rods[i], tt, m, 0.5, false) : false)} />
          <Instances count={plates.length} geometry={box} material={m2} t={t} fill={(i, tt, m) => partMatrix(plates[i], tt, m, 0.5, false)} />
        </group>
      )} />
  );
};

/* ───────── 30 Particle to Solid ───────── */
export const D30 = 16;
const KNOT = (u: number) => { const a = u * Math.PI * 2, p = 2, q = 5, r = 1.0 + 0.45 * Math.cos(q * a); return V(r * Math.cos(p * a), 0.45 * Math.sin(q * a) * 1.4, r * Math.sin(p * a)); };
export const ParticleToSolid: React.FC<EffectProps> = (props) => {
  const N = props.quality === 'preview' ? 1800 : 4200;
  const tube = useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(Array.from({length: 160}, (_, i) => KNOT(i / 160)), true), props.quality === 'preview' ? 300 : 700, 0.22, 36, true), [props.quality]);
  const pts = useMemo(() => {
    const r = makeRng(30);
    return Array.from({length: N}, () => {
      const u = r.next(), c = KNOT(u), c2 = KNOT(u + 0.001), T = c2.clone().sub(c).normalize();
      const Nn = new THREE.Vector3().crossVectors(T, V(0, 1, 0)).normalize(), B = new THREE.Vector3().crossVectors(T, Nn), v = r.range(0, Math.PI * 2);
      return {target: c.addScaledVector(Nn, Math.cos(v) * 0.22).addScaledVector(B, Math.sin(v) * 0.22), cloud: V(r.range(-1, 1), r.range(-1, 1), r.range(-1, 1)).multiplyScalar(r.range(1.5, 4.5)), org: r.range(0, 1), s: r.range(0.014, 0.03), sp: r.range(0.3, 1.1)};
    });
  }, [N]);
  const geo = useMemo(() => new THREE.IcosahedronGeometry(1, 0), []);
  const m = useMemo(() => makeMaterial('chrome'), []), solid = useMemo(() => makeMaterial('mercury'), []);
  return (
    <Stage {...props} spec={{
      env: 'highContrastMetallic', floorY: -2.2, exposure: (t) => fadeIn(t), envRotation: (t) => sweepEnv(t, 0.3, 9, -0.9, 0.6, 0.4, D30),
      camera: camFrom([[0, [-2.4, 1.0, 9.6], [0, 0, 0]], [4, [-0.8, 0.8, 8.0], [0, 0, 0]], [8, [2.6, 0.9, 6.6], [0, 0, 0]], [12, [1.0, 0.6, 5.0], [0, 0, 0]], [16, [-1.4, 0.7, 6.4], [0, 0, 0]]], 1.8),
    }}
      render={(t) => {
        const conv = easeInOutCubic(seg(t, 2.0, 8.0)), mesh = smootherstep(seg(t, 8.2, 10.4));
        return (
          <group rotation={[0.25, t * 0.2, 0]}>
            <Instances count={N} geometry={geo} material={m} t={t} fill={(i, tt, mm) => {
              const d = pts[i], k = clamp(conv * 1.3 - d.org * 0.3, 0, 1), e = k * k * (3 - 2 * k);
              const c = d.cloud.clone().applyAxisAngle(V(0, 1, 0), tt * d.sp * (1 - e));
              if (mesh >= 1) return false;
              const sc = d.s * (1 - mesh);
              return mm.compose(c.lerp(d.target, e), Q0, V(sc, sc, sc));
            }} />
            <mesh geometry={tube} material={solid} visible={mesh > 0.01} scale={0.93 + 0.07 * mesh} />
          </group>
        );
      }} />
  );
};
void makeGlass;
