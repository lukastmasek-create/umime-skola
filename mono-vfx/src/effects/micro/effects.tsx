import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Stage, EffectProps} from '../../core/Stage';
import {camFrom, fadeIn, sweepEnv} from '../../core/kit';
import {seg, smootherstep, springStep, easeInOutCubic, lerp, clamp, impulse, easeOutCubic} from '../../core/Timeline';
import {makeMaterial} from '../../materials/presets';
import {makeGlass} from '../../materials/glass';
import {makeRng} from '../../core/DeterministicRandom';
import {magnetic} from '../../core/magnet';

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const dark = (c = 0x1c1e23) => { const m = makeMaterial('brushedAluminum'); m.color = new THREE.Color(c); m.roughness = 0.2; return m; };
const gold = () => { const m = makeMaterial('chrome', {color: 0xe6b672}); m.roughness = 0.1; return m; };
const lathe = (pts: [number, number][], seg_ = 64) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg_);

/* ───────── 46 Magnetic Attraction ───────── */
export const D46 = 14;
export const MagneticAttraction: React.FC<EffectProps> = (props) => {
  // 1-D attraction ODE with contact + damped bounce, precomputed
  const track = useMemo(() => {
    const dt = 1 / 480, steps = D46 * 480, out: number[] = [];
    let r = 3.6, v = 0; const t0 = 3.2, gap = 0.56;
    for (let s = 0; s <= steps; s++) {
      const t = s / 480; out.push(r);
      if (t > t0) { const f = 9 / (r * r + 0.15); v -= f * dt; v *= 1 - 0.6 * dt; r += v * dt; if (r < gap) { r = gap; v = Math.abs(v) * 0.16; if (v < 0.04) v = 0; } }
    }
    return out;
  }, []);
  const R = (t: number) => track[Math.min(track.length - 1, Math.round(t * 480))];
  const body = useMemo(() => new THREE.CylinderGeometry(0.55, 0.55, 0.9, 64, 1), []);
  const band = useMemo(() => new THREE.CylinderGeometry(0.565, 0.565, 0.22, 64, 1), []);
  const chrome = useMemo(() => makeMaterial('chrome'), []), a = useMemo(() => { const m = dark(0x7a1c1c); m.metalness = 0.6; m.roughness = 0.28; return m; }, []), b = useMemo(() => { const m = dark(0x1c3a7a); m.metalness = 0.6; m.roughness = 0.28; return m; }, []);
  const glow = useMemo(() => new THREE.LineBasicMaterial({color: new THREE.Color(0.6, 1.1, 2.0), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false}), []);
  return (
    <Stage {...props} spec={{
      env: 'highContrastMetallic', floorY: -1.2, exposure: (t) => fadeIn(t), envRotation: (t) => sweepEnv(t, 0.3, 8, -0.9, 0.6, 0.2, D46), shakes: [{t: 6.6, amp: 0.012, decay: 12}],
      camera: camFrom([[0, [-1.5, 0.8, 8.6], [0, 0, 0]], [3.5, [-0.8, 0.5, 6.6], [0, 0, 0]], [6.2, [1.0, 0.3, 4.4], [0, 0, 0], 32, 1.5], [9, [2.2, 0.6, 3.6], [0, 0, 0], 32, 1.5], [14, [-1.0, 0.7, 7.0], [0, 0, 0]]], 1.9),
    }}
      render={(t) => {
        const r = R(t), u = clamp(1 - (r - 0.56) / 3.04), arc = Math.sin(Math.PI * u) * 0.34 * (t > 3.2 ? 1 : 0), tilt = (1 - smootherstep(seg(u, 0.4, 1))) * 0.55 * (t > 3.2 ? 1 : 0.0);
        const hum = t < 3.2 ? 0.04 * Math.sin(t * 5) * smootherstep(seg(t, 1.5, 3.2)) : 0;
        const vib = t > 6.55 ? 0.012 * Math.exp(-(t - 6.55) * 4) * Math.sin((t - 6.55) * 90) : 0;
        const mk = (sgn: number, mat: THREE.Material) => (
          <group position={[sgn * r / 2 * 1.0 + vib * sgn, arc * sgn * 0.0 + (sgn > 0 ? arc : -arc) * 0.6 + hum * sgn, 0]} rotation={[0, 0, Math.PI / 2 + tilt * sgn]}>
            <mesh geometry={body} material={chrome} />
            <mesh geometry={band} material={mat} position={[0, sgn * 0.34, 0]} />
          </group>
        );
        const lines: THREE.Line[] = [];
        for (let k = 0; k < 7 && u > 0.02; k++) { const pts: THREE.Vector3[] = [], h = (k - 3) * 0.16; for (let i = 0; i <= 30; i++) { const x = lerp(-r / 2, r / 2, i / 30); pts.push(V(x, h * Math.sin(Math.PI * i / 30) * 2.2 * (1 - u * 0.5), (k % 2 ? 1 : -1) * 0.12 * Math.sin(Math.PI * i / 30))); } const g = new THREE.BufferGeometry().setFromPoints(pts); lines.push(new THREE.Line(g, glow)); }
        glow.opacity = 0.5 * (1 - smootherstep(seg(u, 0.95, 1)));
        return (
          <group>
            {mk(-1, a)}{mk(1, b)}
            {lines.map((l, i) => <primitive key={i} object={l} />)}
          </group>
        );
      }} />
  );
};

/* ───────── 47 Precision Lock ───────── */
export const D47 = 16;
export const PrecisionLock: React.FC<EffectProps> = (props) => {
  const mats = useMemo(() => ({chrome: makeMaterial('chrome'), dark: dark(), alu: makeMaterial('brushedAluminum'), gold: gold()}), []);
  const ringG = useMemo(() => [lathe([[1.3, 0], [1.45, 0], [1.45, 0.22], [1.3, 0.22]], 96), lathe([[0.9, 0], [1.1, 0], [1.1, 0.2], [0.9, 0.2]], 96), lathe([[0.5, 0], [0.7, 0], [0.7, 0.2], [0.5, 0.2]], 96)], []);
  const base = useMemo(() => lathe([[0, 0], [1.9, 0], [2.0, 0.06], [2.0, 0.2], [1.7, 0.28], [0, 0.28]], 96), []);
  const pin = useMemo(() => new THREE.CylinderGeometry(0.17, 0.17, 1.4, 48), []);
  const slider = useMemo(() => new THREE.BoxGeometry(0.62, 0.16, 0.26), []);
  const tabs = useMemo(() => Array.from({length: 12}, (_, i) => { const g = new THREE.BoxGeometry(0.16, 0.12, 0.1); g.translate(0, 0.06, 0); return {g, a: (i / 12) * Math.PI * 2}; }), []);
  return (
    <Stage {...props} spec={{
      env: 'highContrastMetallic', floorY: -0.3, exposure: (t) => fadeIn(t), envRotation: (t) => sweepEnv(t, 0.3, 10, -0.9, 0.6, 0.3, D47),
      camera: camFrom([[0, [-2.4, 3.2, 7.4], [0, 0.2, 0]], [4, [-1.0, 2.6, 6.0], [0, 0.3, 0]], [8, [2.6, 2.4, 4.4], [0, 0.3, 0]], [11.5, [1.4, 1.4, 3.0], [0, 0.3, 0], 32, 1.5], [16, [-1.0, 3.4, 7.2], [0, 0.2, 0]]], 1.8),
    }}
      render={(t) => {
        const rings = [0, 1, 2].map((i) => { const u = seg(t, 1.2 + i * 1.1, 3.4 + i * 1.1), e = easeInOutCubic(u); return {y: lerp(2.6 + i * 0.9, 0.28 + i * 0.0 + (i === 1 ? 0.0 : 0), e), rot: (1 - e) * (i % 2 ? 2.4 : -2.8) + t * 0.0}; });
        const sl = [0, 1, 2, 3].map((i) => { const u = seg(t, 5.0 + i * 0.5, 6.4 + i * 0.5), e = easeOutCubic(u); return {r: lerp(2.6, 0.78, e) + 0.02 * (springStep(t - (6.4 + i * 0.5), 30, 0.3) - 1) * (u >= 1 ? 1 : 0), ang: (i / 4) * Math.PI * 2}; });
        const pu = easeInOutCubic(seg(t, 8.4, 10.4)), py = lerp(3.4, 0.58, pu) + (t > 10.4 ? 0.06 * (springStep(t - 10.4, 26, 0.25) - 1) : 0);
        const lockT = 10.4;
        const vib = (d: number) => (t < lockT + d * 0.35 ? 0 : 0.018 * Math.exp(-(t - lockT - d * 0.35) * 3.5) * Math.sin((t - lockT - d * 0.35) * 70));
        return (
          <group>
            <mesh geometry={base} material={mats.dark} position={[0, vib(2), 0]} />
            {rings.map((r, i) => (
              <group key={i} position={[0, r.y + 0.0 + vib(i * 0.6) * 0, 0]} rotation={[0, r.rot, 0]}>
                <mesh geometry={ringG[i]} material={i === 1 ? mats.chrome : mats.alu} position={[0, vib(1.2 - i * 0.4), 0]} />
                {i === 0 && tabs.map((tb, k) => <mesh key={k} geometry={tb.g} material={mats.gold} position={[Math.cos(tb.a) * 1.37, 0.22, Math.sin(tb.a) * 1.37]} rotation={[0, -tb.a, 0]} />)}
              </group>
            ))}
            {sl.map((s, i) => <mesh key={i} geometry={slider} material={mats.chrome} position={[Math.cos(s.ang) * s.r, 0.4 + vib(0.6), Math.sin(s.ang) * s.r]} rotation={[0, -s.ang, 0]} />)}
            <mesh geometry={pin} material={mats.gold} position={[0, py + 0.7, 0]} />
          </group>
        );
      }} />
  );
};

/* ───────── 48 Spring Compression ───────── */
export const D48 = 16;
export const SpringCompression: React.FC<EffectProps> = (props) => {
  const sim = useMemo(() => {
    // plate (mass 1) on spring; compressed by a press until t=6.0, then released and it launches a ball resting on it
    const dt = 1 / 480, steps = D48 * 480, k = 120, c = 1.8, mp = 1.0, mb = 0.4, g = 9.8, L0 = 2.0;
    const plate: number[] = [], ball: number[] = [];
    let x = L0, v = 0, bx = L0 + 0.12, bv = 0, free = false, comp = L0;
    for (let s = 0; s <= steps; s++) {
      const t = s / 480;
      const press = t < 3.0 ? L0 : t < 5.6 ? lerp(L0, 0.75, easeInOutCubic(seg(t, 3.0, 5.6))) : t < 6.0 ? 0.75 : -1;
      if (press > 0) { x = press; v = 0; bx = x + 0.12; bv = 0; comp = press; }
      else {
        const a = (-k * (x - L0) - c * v) / mp - g;
        const floor = 0.0;
        v += a * dt; x += v * dt; if (x < 0.4) { x = 0.4; v = Math.abs(v) * 0.2; }
        if (!free) { bx = x + 0.12; bv = v; if (x > L0 * 0.96 && v > 0) free = true; }
        else { bv -= g * dt; bx += bv * dt; if (bx < x + 0.12) { bx = x + 0.12; bv = Math.max(v, Math.abs(bv) * 0.3); } if (bx < 0.5) { bx = 0.5; bv = Math.abs(bv) * 0.35; } }
      }
      void comp; void floor_;
      plate.push(x); ball.push(bx);
    }
    return {plate, ball};
  }, []);
  const at = (arr: number[], t: number) => arr[Math.min(arr.length - 1, Math.round(t * 480))];
  const mats = useMemo(() => ({chrome: makeMaterial('chrome'), dark: dark(), alu: makeMaterial('brushedAluminum'), gold: gold()}), []);
  const baseG = useMemo(() => lathe([[0, 0], [1.2, 0], [1.25, 0.04], [1.25, 0.2], [1.0, 0.3], [0, 0.3]], 96), []);
  const plateG = useMemo(() => lathe([[0, 0], [0.95, 0], [1.0, 0.03], [1.0, 0.12], [0, 0.12]], 96), []);
  const rod = useMemo(() => new THREE.CylinderGeometry(0.05, 0.05, 6.0, 24), []);
  return (
    <Stage {...props} spec={{
      env: 'highContrastMetallic', floorY: 0, exposure: (t) => fadeIn(t), envRotation: (t) => sweepEnv(t, 0.3, 9, -0.9, 0.5, 0.3, D48), shakes: [{t: 6.02, amp: 0.02, decay: 8}],
      camera: camFrom([[0, [-3.0, 2.0, 9.4], [0, 1.6, 0]], [4, [-1.6, 1.6, 7.0], [0, 1.4, 0]], [6, [1.4, 1.4, 6.4], [0, 1.6, 0]], [8.5, [2.6, 2.4, 8.2], [0, 2.4, 0]], [12, [-1.8, 2.0, 7.6], [0, 1.6, 0]], [16, [0.6, 2.2, 9.6], [0, 1.6, 0]]], 1.7),
    }}
      render={(t) => {
        const x = at(sim.plate, t), bx = at(sim.ball, t);
        const coils = 9, pts: THREE.Vector3[] = [];
        for (let i = 0; i <= coils * 28; i++) { const u = i / (coils * 28), a = u * coils * Math.PI * 2; pts.push(V(Math.cos(a) * 0.62, 0.3 + (x - 0.3) * u, Math.sin(a) * 0.62)); }
        const spring = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), coils * 36, 0.055, 12, false);
        const pressY = t < 6.0 ? x + 0.12 + 0.55 + (t < 3.0 ? 1.2 * (1 - smootherstep(seg(t, 1.5, 3.0))) : 0) : x + 3.5 + 6 * smootherstep(seg(t, 6.0, 7.0));
        return (
          <group>
            <mesh geometry={baseG} material={mats.dark} />
            <mesh geometry={spring} material={mats.chrome} />
            <mesh geometry={plateG} material={mats.alu} position={[0, x, 0]} />
            <mesh material={mats.gold} position={[0, bx + 0.2, 0]}><sphereGeometry args={[0.2, 64, 48]} /></mesh>
            <mesh geometry={plateG} material={mats.dark} position={[0, pressY, 0]} scale={[0.9, 1.4, 0.9]} />
            <mesh geometry={rod} material={mats.chrome} position={[1.1, 3.0, 0]} />
            <mesh geometry={rod} material={mats.chrome} position={[-1.1, 3.0, 0]} />
          </group>
        );
      }} />
  );
};
const floor_ = 0;

/* ───────── 49 Kinetic Switch ───────── */
export const D49 = 16;
export const KineticSwitch: React.FC<EffectProps> = (props) => {
  const mats = useMemo(() => ({chrome: makeMaterial('chrome'), dark: dark(), alu: makeMaterial('brushedAluminum'), gold: gold(), glass: makeGlass({tint: 0x203a48, opacity: 0.22, rim: [0.5, 0.8, 1.0], env: 2.4})}), []);
  const led = useMemo(() => new THREE.MeshBasicMaterial({color: new THREE.Color(0, 0, 0), toneMapped: false}), []);
  const housing = useMemo(() => { const g = new THREE.BoxGeometry(3.0, 1.3, 1.8, 1, 1, 1); return g; }, []);
  const cam = useMemo(() => new THREE.CylinderGeometry(0.45, 0.45, 0.3, 48).rotateX(Math.PI / 2), []);
  return (
    <Stage {...props} spec={{
      env: 'highContrastMetallic', floorY: -0.9, exposure: (t) => fadeIn(t), envRotation: (t) => sweepEnv(t, 0.3, 9, -0.9, 0.6, 0.3, D49),
      camera: camFrom([[0, [-2.4, 2.2, 8.0], [0, 0.4, 0]], [4, [-1.4, 1.8, 6.4], [0, 0.4, 0]], [7, [0.6, 1.2, 5.0], [0, 0.3, 0], 32, 1.4], [10, [2.4, 1.8, 4.2], [0.3, 0.2, 0], 32, 1.4], [13, [-0.6, 1.4, 3.6], [0.4, 0.2, 0], 34, 1.4], [16, [-1.6, 2.0, 7.4], [0, 0.4, 0]]], 1.8),
    }}
      render={(t) => {
        const push = easeInOutCubic(seg(t, 4.2, 6.4)), detent = springStep(t - 6.4, 22, 0.35) - 1;
        const ang = -0.72 * push - (t > 6.4 ? 0.05 * detent : 0) + 0.07 * (t > 2 && t < 4.2 ? Math.sin(t * 6) * smootherstep(seg(t, 2, 4.2)) : 0);
        const camA = ang * 3.2, bar = easeInOutCubic(seg(t, 5.0, 6.6));
        led.color.setRGB(0.1 * bar * 2, 1.6 * bar, 0.5 * bar * 2);
        return (
          <group>
            <mesh geometry={housing} material={mats.glass} position={[0, 0.65, 0]} />
            {/* internals */}
            <mesh material={mats.dark} position={[0, 0.06, 0]}><boxGeometry args={[3.0, 0.12, 1.8]} /></mesh>
            <mesh geometry={cam} material={mats.dark} position={[0, 0.7, 0]} rotation={[0, 0, camA]} />
            <mesh geometry={cam} material={mats.gold} position={[0, 0.7, -0.3]} rotation={[0, 0, camA * 0.6]} scale={0.62} />
            <mesh material={mats.chrome} position={[0.9, 0.18 + 0.28 * (1 - bar) + 0.0, 0]}><boxGeometry args={[0.8, 0.07, 0.5]} /></mesh>
            <mesh material={mats.gold} position={[0.6, 0.22, 0.5]}><boxGeometry args={[0.2, 0.18, 0.2]} /></mesh>
            <mesh material={mats.gold} position={[1.2, 0.22, 0.5]}><boxGeometry args={[0.2, 0.18, 0.2]} /></mesh>
            {Array.from({length: 7}, (_, i) => <mesh key={i} material={mats.chrome} position={[-0.9, 0.2 + i * 0.12 * (1 - 0.4 * push), 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.22, 0.025, 12, 32]} /></mesh>)}
            <mesh material={led} position={[1.3, 1.34, 0.7]}><sphereGeometry args={[0.09, 24, 16]} /></mesh>
            <pointLight position={[1.3, 1.6, 0.8]} color={0x40ff90} intensity={6 * bar} distance={4} />
            {/* lever */}
            <group position={[0, 1.3, 0]} rotation={[0, 0, ang]}>
              <mesh material={mats.chrome} position={[0, 0.8, 0]}><cylinderGeometry args={[0.07, 0.11, 1.6, 32]} /></mesh>
              <mesh material={mats.gold} position={[0, 1.65, 0]}><sphereGeometry args={[0.2, 48, 32]} /></mesh>
              <mesh material={mats.dark} position={[0, 0.0, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.3, 0.3, 0.5, 48]} /></mesh>
            </group>
            <mesh material={mats.dark} position={[0, 1.32, 0]}><cylinderGeometry args={[0.44, 0.5, 0.1, 48]} /></mesh>
          </group>
        );
      }} />
  );
};

/* ───────── 50 Mechanical Chain Reaction ───────── */
export const D50 = 22;
export const MechanicalChainReaction: React.FC<EffectProps> = (props) => {
  const mats = useMemo(() => ({chrome: makeMaterial('chrome'), dark: dark(), alu: makeMaterial('brushedAluminum'), gold: gold()}), []);
  const T = {ball: 2.0, lever: 5.0, dom: 5.6, seesaw: 9.6, assemble: 11.0};
  const dominos = 7;
  const parts = useMemo(() => { const r = makeRng(50); return Array.from({length: 14}, (_, i) => { const a = (i / 14) * Math.PI * 2; const target = V(7.4 + Math.cos(a) * 0.9, 0.55 + 0.35 * Math.sin(i * 1.7) + 0.35 * (i % 3), Math.sin(a) * 0.9); return {target, start: target.clone().add(V(r.range(-1, 1), r.range(2, 5), r.range(-3, 3))), q0: new THREE.Quaternion().setFromEuler(new THREE.Euler(r.range(-3, 3), r.range(-3, 3), 0)), delay: T.assemble + 0.3 + i * 0.18, a}; }); }, []);
  return (
    <Stage {...props} spec={{
      env: 'highContrastMetallic', floorY: 0, exposure: (t) => fadeIn(t), envRotation: (t) => sweepEnv(t, 0.3, 14, -0.9, 0.8, 0.3, D50), shakes: [{t: 5.0, amp: 0.01, decay: 8}, {t: 10.1, amp: 0.012, decay: 8}],
      camera: camFrom([[0, [-4.2, 2.8, 8.4], [-3.4, 0.8, 0]], [3.5, [-3.6, 1.8, 5.4], [-3.0, 0.6, 0]], [6, [-0.6, 1.6, 5.6], [-0.2, 0.5, 0]], [9, [2.4, 1.6, 6.0], [2.4, 0.4, 0]], [11, [5.0, 2.0, 6.2], [5.6, 0.6, 0]], [14, [8.0, 2.6, 5.4], [7.4, 0.9, 0]], [18, [6.0, 3.6, 8.2], [7.0, 0.8, 0]], [22, [3.4, 3.0, 11.0], [3.4, 0.8, 0]]], 1.8),
    }}
      render={(t) => {
        // ball on ramp (-5.5,1.7)->(-3.2,0.5) then flat to lever at x=-1.6
        const rampA = 2.0, L = 2.6, tb = Math.max(0, t - T.ball), sRamp = Math.min(L, 0.5 * rampA * tb * tb), vEnd = Math.sqrt(2 * rampA * L);
        const tFlat = Math.max(0, tb - Math.sqrt(2 * L / rampA)), sFlat = vEnd * tFlat * 0.8;
        const hitX = -1.7, onFlat = sRamp >= L;
        let bx = -5.5 + sRamp * Math.cos(0.38) + (onFlat ? sFlat : 0), by = 1.7 - sRamp * Math.sin(0.38) + (onFlat ? 0 : 0);
        if (onFlat) by = 1.7 - L * Math.sin(0.38);
        const ballStop = Math.min(bx, hitX), ballX = t < T.ball ? -5.5 : ballStop;
        const lever = easeOutCubic(seg(t, T.lever - 0.05, T.lever + 0.5)) * 0.9;
        const leverSettle = springStep(t - T.lever - 0.5, 18, 0.4) - 1;
        const lAng = lever + 0.04 * leverSettle * (t > T.lever + 0.5 ? 1 : 0);
        // dominoes
        const dStart = (i: number) => T.dom + i * 0.42, dAng = (i: number) => Math.min(1, Math.max(0, (t - dStart(i)) / 0.55)) ** 1.7 * (i === dominos - 1 ? 1.3 : 1.25);
        // seesaw
        const see = easeInOutCubic(seg(t, T.seesaw, T.seesaw + 0.7)) * -0.32 + 0.0;
        const lift = seg(t, T.seesaw + 0.3, T.seesaw + 1.8), ballB = V(lerp(4.0, 6.4, easeOutCubic(lift)), 0.62 + 2.4 * Math.sin(Math.PI * lift) * (lift < 1 ? 1 : 0), 0);
        return (
          <group>
            {/* ramp + track */}
            <mesh material={mats.dark} position={[-4.35, 1.05, 0]} rotation={[0, 0, -0.38]}><boxGeometry args={[2.8, 0.1, 0.7]} /></mesh>
            <mesh material={mats.dark} position={[-2.2, 0.55, 0]}><boxGeometry args={[2.4, 0.1, 0.7]} /></mesh>
            <mesh material={mats.chrome} position={[ballX, (t < T.ball ? 1.78 : by) + 0.07 - (onFlat ? 0 : 0.0) + (t >= T.ball && !onFlat ? 0 : 0), 0]}><sphereGeometry args={[0.18, 48, 32]} /></mesh>
            {/* lever */}
            <group position={[-1.6, 0.6, 0]} rotation={[0, 0, -lAng]}><mesh material={mats.gold} position={[0, 0.5, 0]}><boxGeometry args={[0.12, 1.0, 0.5]} /></mesh></group>
            <mesh material={mats.dark} position={[-1.6, 0.35, 0]}><boxGeometry args={[0.3, 0.5, 0.7]} /></mesh>
            {/* dominoes */}
            {Array.from({length: dominos}, (_, i) => (
              <group key={i} position={[-0.7 + i * 0.62 + 0.07, 0.6, 0]}><group rotation={[0, 0, -dAng(i)]}><mesh material={i % 2 ? mats.alu : mats.chrome} position={[-0.07, 0.35, 0]}><boxGeometry args={[0.14, 0.7, 0.45]} /></mesh></group></group>
            ))}
            <mesh material={mats.dark} position={[1.9, 0.55, 0]}><boxGeometry args={[4.6, 0.1, 0.7]} /></mesh>
            {/* seesaw */}
            <mesh material={mats.dark} position={[3.9, 0.35, 0]}><cylinderGeometry args={[0.0, 0.3, 0.6, 4]} /></mesh>
            <group position={[3.9, 0.7, 0]} rotation={[0, 0, see]}><mesh material={mats.alu}><boxGeometry args={[2.0, 0.08, 0.5]} /></mesh></group>
            <mesh material={mats.gold} position={ballB.toArray() as [number, number, number]}><sphereGeometry args={[0.16, 48, 32]} /></mesh>
            {/* final platform + assembly */}
            <mesh material={mats.dark} position={[7.4, 0.2, 0]}><cylinderGeometry args={[1.6, 1.7, 0.4, 64]} /></mesh>
            {parts.map((p, i) => {
              const u = seg(t, p.delay, p.delay + 2.2), pos = magnetic(p.start, p.target, u, 0.4), q = p.q0.clone().slerp(new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), p.a), smootherstep(u));
              return <mesh key={i} material={i % 3 === 0 ? mats.gold : mats.chrome} position={pos} quaternion={q}><boxGeometry args={[0.5, i % 2 ? 0.1 : 0.4, 0.14]} /></mesh>;
            })}
            <mesh material={mats.chrome} position={[7.4, 1.35, 0]} scale={smootherstep(seg(t, T.assemble + 3.4, T.assemble + 5.2))}><icosahedronGeometry args={[0.5, 4]} /></mesh>
          </group>
        );
      }} />
  );
};
void impulse;
