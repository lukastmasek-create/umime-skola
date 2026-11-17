import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Stage, EffectProps} from '../../core/Stage';
import {CamKey} from '../../core/CameraRig';
import {camFrom, fadeIn, sweepEnv} from '../../core/kit';
import {seg, smootherstep, lerp, easeInOutCubic, smoothstep} from '../../core/Timeline';
import {makeRng} from '../../core/DeterministicRandom';
import {makeMaterial} from '../../materials/presets';
import {makeGlass} from '../../materials/glass';
import {simulate, BodyInit, SimResult} from '../../physics/RigidSim';

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const boxPts = (h: THREE.Vector3) => { const L: THREE.Vector3[] = []; for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) L.push(V(x * h.x, y * h.y, z * h.z)); return L; };
const gold = () => { const m = makeMaterial('chrome', {color: 0xe6b672}); m.roughness = 0.1; return m; };
const dark = (c = 0x1c1e23) => { const m = makeMaterial('brushedAluminum'); m.color = new THREE.Color(c); m.roughness = 0.2; return m; };

/* shared rigid-body prop set */
interface Prop {kind: 'sphere' | 'box' | 'torus'; size: number; mat: number; half?: THREE.Vector3}
const makeProps = (n: number, seed: number): Prop[] => {
  const r = makeRng(seed);
  return Array.from({length: n}, (_, i) => {
    const k = i % 3 === 0 ? 'box' : i % 3 === 1 ? 'sphere' : (r.next() < 0.5 ? 'box' : 'sphere');
    const size = r.range(0.28, 0.5);
    return {kind: k as Prop['kind'], size, mat: i % 4, half: k === 'box' ? V(size, size * r.range(0.7, 1.2), size * r.range(0.7, 1.2)) : undefined};
  });
};
const propInit = (p: Prop, pos: THREE.Vector3, vel: THREE.Vector3, w: THREE.Vector3): BodyInit => {
  const half = p.half ?? V(p.size, p.size, p.size);
  return {pos, vel, angVel: w, points: p.kind === 'box' ? boxPts(half) : [V(0, -p.size, 0), V(p.size, 0, 0), V(-p.size, 0, 0), V(0, 0, p.size), V(0, 0, -p.size), V(0, p.size, 0)], radius: p.kind === 'box' ? half.length() : p.size, mass: p.size ** 3 * 40, collideSpheres: true, half: p.kind === 'box' ? half : undefined};
};
const PropMesh: React.FC<{p: Prop; mats: THREE.Material[]; sim: SimResult; i: number; t: number}> = ({p, mats, sim, i, t}) => {
  const pos = new THREE.Vector3(), q = new THREE.Quaternion();
  sim.sample(i, t, pos, q);
  return (
    <mesh position={pos} quaternion={q} material={mats[p.mat % mats.length]}>
      {p.kind === 'box' ? <boxGeometry args={[p.half!.x * 2, p.half!.y * 2, p.half!.z * 2]} /> : <sphereGeometry args={[p.size, 64, 48]} />}
    </mesh>
  );
};
const scatterNonOverlap = (props: Prop[], seed: number, box: THREE.Vector3, center = V(0, 0, 0)) => {
  const r = makeRng(seed), pts: THREE.Vector3[] = [];
  props.forEach((p) => {
    for (let tries = 0; tries < 200; tries++) {
      const c = V(r.range(-box.x, box.x), r.range(-box.y, box.y), r.range(-box.z, box.z)).add(center);
      if (pts.every((o, j) => o.distanceTo(c) > p.size * 1.7 + props[j].size * 1.7)) { pts.push(c); return; }
    }
    pts.push(V(r.range(-box.x, box.x), r.range(-box.y, box.y), r.range(-box.z, box.z)).add(center));
  });
  return pts;
};

/* ───────── 36 Gravity Flip ───────── */
export const D36 = 17;
export const GravityFlip: React.FC<EffectProps> = (props) => {
  const P = useMemo(() => makeProps(15, 36), []);
  const sim = useMemo(() => {
    const r = makeRng(360), pos = scatterNonOverlap(P, 361, V(2.3, 1.2, 0.8), V(0, 0.2, 0));
    const inits = P.map((p, i) => propInit(p, pos[i], V(r.range(-0.15, 0.15), r.range(-0.1, 0.1), 0), V(r.range(-0.4, 0.4), r.range(-0.4, 0.4), r.range(-0.4, 0.4))));
    return simulate(inits, {
      duration: D36, gravity: (t) => (t < 4.6 ? V(0, 0, 0) : t < 10.4 ? V(10, 0, 0) : V(0, -10, 0)),
      planes: [{n: V(0, 1, 0), d: -2.0}, {n: V(-1, 0, 0), d: -3.2}, {n: V(1, 0, 0), d: -3.6}, {n: V(0, 0, 1), d: -1.3}, {n: V(0, 0, -1), d: -1.3}], restitution: 0.35, friction: 0.5, angDrag: 0.15, sub: 6,
    });
  }, [P]);
  const mats = useMemo(() => [makeMaterial('chrome'), dark(), gold(), makeMaterial('mercury')], []);
  const wall = useMemo(() => dark(0x0d0e11), []);
  return (
    <Stage {...props} spec={{
      env: 'highContrastMetallic', floorY: -2.0, exposure: (t) => fadeIn(t), envRotation: (t) => sweepEnv(t, 0.3, 9, -0.9, 0.5, 0.3, D36),
      camera: (portrait) => {
        const f = camFrom([[0, [-1.5, 0.7, 11.0], [0, 0, 0]], [4.4, [-0.6, 0.5, 9.4], [0, 0, 0]], [6.0, [1.0, 0.7, 9.8], [0.6, -0.2, 0]], [10, [2.4, 0.4, 9.2], [1.0, -0.6, 0]], [13.5, [0.4, 0.9, 10.2], [0.4, -1.0, 0]], [17, [-1.6, 0.9, 11.4], [0, -0.8, 0]]], 2.0)(portrait);
        const roll = [0, 0, 0.28, 0.28, 0.0, 0.0] as number[];
        return f.map((k, i) => ({...k, roll: roll[i] ?? 0}) as CamKey);
      },
    }}
      render={(t) => (
        <group>
          {P.map((p, i) => <PropMesh key={i} p={p} i={i} t={t} sim={sim} mats={mats} />)}
          <mesh material={wall} position={[3.35, 0, 0]} visible={t > 3.9 && t < 10.6}><boxGeometry args={[0.1, 5, 3]} /></mesh>
        </group>
      )} />
  );
};

/* ───────── 37 Domino Cascade ───────── */
export const D37 = 19;
export const DominoCascade: React.FC<EffectProps> = (props) => {
  const N = 110;
  const D = useMemo(() => {
    const L: {p: THREE.Vector3; yaw: number}[] = [];
    // expanding spiral + final straight run
    let s = 0, a = 0;
    const pt = (th: number) => { const r = 0.55 + th * 0.22; return V(Math.cos(th) * r, 0, Math.sin(th) * r); };
    let th = 0, last = pt(0);
    L.push({p: last, yaw: 0});
    while (L.length < N) {
      th += 0.01; const p = pt(th);
      if (p.distanceTo(last) >= 0.36) { L.push({p, yaw: 0}); last = p; }
      s += 1; a += 0;
    }
    L.forEach((d, i) => { const nx = L[Math.min(L.length - 1, i + 1)].p, pr = L[Math.max(0, i - 1)].p; const T = i < L.length - 1 ? nx.clone().sub(d.p) : d.p.clone().sub(pr); d.yaw = Math.atan2(-T.z, T.x); });
    return L;
  }, []);
  const H = 0.95, W = 0.34, TH = 0.16, END = THREE.MathUtils.degToRad(76), FALL = 0.62, contact = Math.pow(THREE.MathUtils.degToRad(17) / END, 1 / 1.7);
  const T0 = 5.0;
  const start = useMemo(() => { const L = [T0]; for (let i = 1; i < N; i++) L.push(L[i - 1] + FALL * contact * 0.78 + 0.01); return L; }, [contact]);
  const mA = useMemo(() => dark(0x23262c), []), mB = useMemo(() => { const m = makeMaterial('chrome'); m.roughness = 0.08; return m; }, []), mC = useMemo(() => gold(), []);
  const geo = useMemo(() => new THREE.BoxGeometry(TH, H, W, 1, 1, 1), []);
  const lead = (t: number) => { let i = 0; while (i < N - 1 && start[i + 1] < t) i++; return i + clamp01((t - start[i]) / (start[Math.min(N - 1, i + 1)] - start[i] || 1)); };
  const camKeys = useMemo(() => { const k: CamKey[] = []; for (let j = 0; j <= 100; j++) { const t = (j / 100) * D37; const li = Math.min(N - 1, Math.max(0, lead(Math.max(t, T0 - 0.5)))); const p = D[Math.floor(li)].p.clone().lerp(D[Math.min(N - 1, Math.floor(li) + 1)].p, li % 1); const wide = 1 - smootherstep(seg(t, 5, 8)) * 0.0; const a = 0.5 + t * 0.13; const rad = lerp(11, 7.4, smootherstep(seg(t, 3, 7))) * (t > 14 ? lerp(1, 1.7, smootherstep(seg(t, 14, 18.5))) : 1); const cen = t < 4.6 ? V(0, 0, 0) : p.clone().multiplyScalar(0.55); const base = t < 14 ? cen : cen.clone().lerp(V(0, 0, 0), smootherstep(seg(t, 14, 18))); k.push({t, pos: [base.x + Math.sin(a) * rad * wide, 1.7 + 0.8 * Math.sin(t * 0.3), base.z + Math.cos(a) * rad], target: [base.x, 0.25, base.z], fov: 30}); } return k; }, [D, start]);
  return (
    <Stage {...props} spec={{
      env: 'highContrastMetallic', floorY: 0, exposure: (t) => fadeIn(t), envRotation: (t) => sweepEnv(t, 0.3, 12, -0.9, 0.8, 0.3, D37),
      camera: () => camKeys,
    }}
      render={(t) => (
        <group>
          {D.map((d, i) => {
            const u = Math.min(1, Math.max(0, (t - start[i]) / FALL)), th = (i === N - 1 ? Math.PI / 2 : END) * Math.pow(u, 1.7);
            const q = new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), d.yaw);
            return (
              <group key={i} position={[d.p.x, 0, d.p.z]} quaternion={q}>
                <group position={[TH / 2, 0, 0]} rotation={[0, 0, -th]}>
                  <mesh geometry={geo} position={[-TH / 2, H / 2, 0]} material={i % 12 === 0 ? mC : i % 2 ? mA : mB} />
                </group>
              </group>
            );
          })}
        </group>
      )} />
  );
};
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/* ───────── 38 Zero Gravity ───────── */
export const D38 = 20;
export const ZeroGravity: React.FC<EffectProps> = (props) => {
  const P = useMemo(() => makeProps(12, 38).map((p, i) => ({...p, kind: (i % 4 === 3 ? 'box' : 'sphere') as Prop['kind'], half: i % 4 === 3 ? V(p.size, p.size, p.size) : undefined, mat: i % 5})), []);
  const targets = useMemo(() => P.map((_, i) => { const a = (i / P.length) * Math.PI * 1.6 - 0.8; return V(Math.sin(a) * 2.6, 0.3 + Math.cos(a * 2.2) * 0.8, Math.cos(a) * 0.6 - 0.3); }), [P]);
  const sim = useMemo(() => {
    const r = makeRng(381), pos = scatterNonOverlap(P, 382, V(2.3, 1.1, 1.0));
    const inits = P.map((p, i) => propInit(p, pos[i], V(r.range(-0.55, 0.55), r.range(-0.3, 0.3), r.range(-0.3, 0.3)), V(r.range(-0.7, 0.7), r.range(-0.7, 0.7), r.range(-0.7, 0.7))));
    return simulate(inits, {
      duration: D38, gravity: () => V(0, 0, 0), planes: [], restitution: 0.9, friction: 0, sub: 6, linDrag: 0.0,
      forces: (t, bodies, dt) => { const k = smootherstep(seg(t, 8.5, 16)); if (k <= 0) return; bodies.forEach((b, i) => { const d = targets[i].clone().sub(b.pos); b.v.addScaledVector(d, 1.6 * k * dt).multiplyScalar(1 - 1.3 * k * dt); b.w.multiplyScalar(1 - 0.8 * k * dt); }); },
    });
  }, [P, targets]);
  const mats = useMemo(() => [makeGlass({tint: 0x2a7a8a, opacity: 0.32}), makeMaterial('chrome'), gold(), makeGlass({tint: 0x6a3a8a, opacity: 0.32}), dark()], []);
  return (
    <Stage {...props} spec={{
      env: 'glassShowcase', floorY: null, exposure: (t) => fadeIn(t), envRotation: (t) => sweepEnv(t, 0.3, 14, -0.9, 0.7, 0.3, D38),
      camera: camFrom([[0, [-3.0, 0.8, 11], [0, 0, 0]], [5, [-1.0, 0.3, 7.6], [0, 0, 0]], [9, [1.6, 0.2, 4.8], [0.2, 0, 0], 34, 1.6], [13, [-1.4, 0.5, 5.6], [0, 0.2, 0], 34, 1.6], [17, [0.4, 0.6, 8.4], [0, 0.2, 0]], [20, [0.0, 0.5, 9.6], [0, 0.2, 0]]], 1.8),
    }}
      render={(t) => <group>{P.map((p, i) => <PropMesh key={i} p={p} i={i} t={t} sim={sim} mats={mats} />)}</group>} />
  );
};

/* ───────── 39 Controlled Collapse ───────── */
export const D39 = 18;
export const ControlledCollapse: React.FC<EffectProps> = (props) => {
  const LAYERS = 13, PER = 3, BW = 0.44, BH = 0.3;
  const bricks = useMemo(() => {
    const L: {pos: THREE.Vector3; q: THREE.Quaternion; layer: number; idx: number}[] = [];
    for (let l = 0; l < LAYERS; l++) for (let i = 0; i < PER; i++) {
      const off = (i - 1) * (BW * 2 + 0.02), turn = l % 2;
      L.push({pos: turn ? V(0, BH + l * (BH * 2 + 0.004), off) : V(off, BH + l * (BH * 2 + 0.004), 0), q: new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), turn ? Math.PI / 2 : 0), layer: l, idx: i});
    }
    return L;
  }, []);
  const sim = useMemo(() => {
    const r = makeRng(39), half = V(BW, BH, BW * 3.1);
    const inits: BodyInit[] = bricks.map((b) => ({
      pos: b.pos.clone(), quat: b.q.clone(), points: boxPts(half), radius: half.length(), mass: 3, half: half.clone(),
      vel: b.layer < 2 ? V(r.range(-1, 1) * 0.3 + (b.idx - 1) * 0.9, 0, r.range(-1, 1) * 0.5) : V(r.range(-0.1, 0.1), 0, r.range(-0.1, 0.1)),
      angVel: V(r.range(-0.3, 0.3), r.range(-0.2, 0.2), r.range(-0.3, 0.3)), releaseAt: b.layer < 2 ? 5.0 + b.idx * 0.12 : 6.0 + b.layer * 0.26 + r.range(0, 0.15),
    }));
    return simulate(inits, {duration: D39, gravity: () => V(0, -9.8, 0), planes: [{n: V(0, 1, 0), d: 0}], restitution: 0.18, friction: 0.7, angDrag: 0.3, linDrag: 0.02, sub: 8});
  }, [bricks]);
  const mats = useMemo(() => [dark(0x2c2f36), makeMaterial('ceramic', {color: 0x8c8a84}), makeMaterial('brushedAluminum')], []);
  const geo = useMemo(() => new THREE.BoxGeometry(BW * 2, BH * 2, BW * 6.2), []);
  const p = new THREE.Vector3(), q = new THREE.Quaternion();
  return (
    <Stage {...props} spec={{
      env: 'highContrastMetallic', floorY: 0, exposure: (t) => fadeIn(t), envRotation: (t) => sweepEnv(t, 0.3, 10, -0.9, 0.6, 0.3, D39),
      camera: camFrom([[0, [-4, 2.6, 11], [0, 2.2, 0]], [4.5, [-2.4, 2.4, 9.0], [0, 2.4, 0]], [7.5, [3.6, 2.6, 8.4], [0, 1.8, 0]], [10, [3.2, 1.2, 5.6], [0, 0.6, 0]], [14, [-3.4, 2.4, 8.4], [0, 0.4, 0]], [18, [-1, 3.0, 11], [0, 0.4, 0]]], 1.7),
    }}
      render={(t) => (
        <group>
          {bricks.map((b, i) => { sim.sample(i, t, p, q); return <mesh key={i} geometry={geo} material={mats[(b.layer + b.idx) % 3]} position={p.clone()} quaternion={q.clone()} />; })}
        </group>
      )} />
  );
};

/* ───────── 40 Orbital Mechanics ───────── */
export const D40 = 20;
export const OrbitalMechanics: React.FC<EffectProps> = (props) => {
  const NB = 5;
  const track = useMemo(() => {
    const G = 9.0, cm = 6.0, dt = 1 / 240, steps = D40 * 240;
    const r = makeRng(40);
    const pos: THREE.Vector3[] = [], vel: THREE.Vector3[] = [], mass: number[] = [], rad: number[] = [];
    for (let i = 0; i < NB; i++) {
      const R = 1.9 + i * 0.85, a = (i / NB) * Math.PI * 2 * 2.4 + r.range(0, 1), tilt = r.range(-0.25, 0.25);
      pos.push(V(Math.cos(a) * R, tilt * R * 0.6, Math.sin(a) * R)); const v = Math.sqrt((G * cm) / R) * (i % 2 ? 1 : 0.97);
      vel.push(V(-Math.sin(a) * v, 0.05 * r.range(-1, 1), Math.cos(a) * v)); mass.push(0.12 + i * 0.05); rad.push(0.16 + i * 0.045);
    }
    const hist: Float32Array[] = pos.map(() => new Float32Array(steps / 4 * 3 + 3));
    const acc = (p: THREE.Vector3[]) => p.map((pi, i) => { const a = V(0, 0, 0), d0 = pi.clone().multiplyScalar(-1), l0 = Math.pow(d0.lengthSq() + 0.05, 1.5); a.addScaledVector(d0, (G * cm) / l0); p.forEach((pj, j) => { if (j === i) return; const d = pj.clone().sub(pi), l = Math.pow(d.lengthSq() + 0.35, 1.5); a.addScaledVector(d, (G * 0.55 * mass[j]) / l); }); return a; });
    let a = acc(pos);
    for (let s = 0; s <= steps; s++) {
      if (s % 4 === 0) pos.forEach((p, i) => { const k = (s / 4) * 3; hist[i][k] = p.x; hist[i][k + 1] = p.y; hist[i][k + 2] = p.z; });
      vel.forEach((v, i) => v.addScaledVector(a[i], dt / 2)); pos.forEach((p, i) => p.addScaledVector(vel[i], dt)); a = acc(pos); vel.forEach((v, i) => v.addScaledVector(a[i], dt / 2));
    }
    return {hist, rad};
  }, []);
  const at = (i: number, t: number) => { const f = t * 60, a = Math.min(Math.floor(f), D40 * 60 - 1), u = f - a, h = track.hist[i]; return V(lerp(h[a * 3], h[a * 3 + 3], u), lerp(h[a * 3 + 1], h[a * 3 + 4], u), lerp(h[a * 3 + 2], h[a * 3 + 5], u)); };
  const mats = useMemo(() => [makeMaterial('chrome'), gold(), makeMaterial('mercury'), dark(0x2a2d33), makeMaterial('chrome', {color: 0xbfd4ff})], []);
  const center = useMemo(() => makeMaterial('chrome', {color: 0xf2f2f4}), []);
  const stars = useMemo(() => { const r = makeRng(400), a = new Float32Array(900 * 3); for (let i = 0; i < 900; i++) { const v = V(r.range(-1, 1), r.range(-1, 1), r.range(-1, 1)).normalize().multiplyScalar(r.range(40, 80)); a.set([v.x, v.y, v.z], i * 3); } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(a, 3)); return g; }, []);
  const camera = useMemo(() => { const k: CamKey[] = []; for (let j = 0; j <= 100; j++) { const t = (j / 100) * D40, lead = at(2, t), ang = 0.4 + t * 0.12, R = lerp(11, 7.5, smootherstep(seg(t, 0, 10))), foc = lead.clone().multiplyScalar(0.35); k.push({t, pos: [foc.x + Math.sin(ang) * R, 4.0 - 2.0 * smootherstep(seg(t, 0, 14)), foc.z + Math.cos(ang) * R], target: [foc.x, 0, foc.z], fov: 32}); } return k; }, [track]);
  return (
    <Stage {...props} spec={{
      env: 'highContrastMetallic', floorY: null, exposure: (t) => fadeIn(t), envRotation: (t) => sweepEnv(t, 0.3, 12, -0.9, 0.7, 0.3, D40), camera: () => camera,
    }}
      render={(t) => (
        <group>
          <mesh material={center}><icosahedronGeometry args={[0.8, 5]} /></mesh>
          <mesh rotation={[Math.PI / 2 + 0.3, 0, t * 0.2]} material={mats[1]}><torusGeometry args={[1.15, 0.03, 16, 128]} /></mesh>
          {Array.from({length: NB}, (_, i) => {
            const p = at(i, t), trail: number[] = [];
            for (let k = 0; k < 90; k++) { const q = at(i, Math.max(0, t - k * 0.05)); trail.push(q.x, q.y, q.z); }
            const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(trail, 3));
            const col = new Float32Array(90 * 3); for (let k = 0; k < 90; k++) { const f = Math.pow(1 - k / 90, 2.2); col.set([0.7 * f, 0.9 * f, 1.3 * f], k * 3); } g.setAttribute('color', new THREE.BufferAttribute(col, 3));
            return (
              <group key={i}>
                <mesh position={p} material={mats[i % mats.length]}><sphereGeometry args={[track.rad[i], 64, 48]} /></mesh>
                <primitive object={new THREE.Line(g, new THREE.LineBasicMaterial({vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false}))} />
              </group>
            );
          })}
          <points geometry={stars}><pointsMaterial size={0.12} sizeAttenuation color={0xaab8ff} toneMapped={false} /></points>
        </group>
      )} />
  );
};
void easeInOutCubic; void smoothstep;
