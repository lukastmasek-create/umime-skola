import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Stage, EffectProps, orbitKeys} from '../../core/Stage';
import {CamKey} from '../../core/CameraRig';
import {fadeIn, sweepEnv, camFrom} from '../../core/kit';
import {seg, smootherstep, smoothstep, easeInOutCubic, lerp} from '../../core/Timeline';
import {makeRng} from '../../core/DeterministicRandom';
import {makeMaterial} from '../../materials/presets';
import {makeGlass} from '../../materials/glass';
import {Instances} from '../../core/Instances';

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const Q = (x: number, y: number, z: number) => new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z));
const darkM = (c = 0x1b1d22) => { const m = makeMaterial('brushedAluminum'); m.color = new THREE.Color(c); m.roughness = 0.2; return m; };
interface Bar {p: THREE.Vector3; q: THREE.Quaternion; s: THREE.Vector3; glow?: boolean}
const polyFrame = (z: number, n: number, rad: number, rot: number, th: number, depth: number, out: Bar[], glow = false) => {
  for (let i = 0; i < n; i++) {
    const a0 = rot + (i / n) * Math.PI * 2, a1 = rot + ((i + 1) / n) * Math.PI * 2;
    const p0 = V(Math.cos(a0) * rad, Math.sin(a0) * rad, 0), p1 = V(Math.cos(a1) * rad, Math.sin(a1) * rad, 0);
    const mid = p0.clone().add(p1).multiplyScalar(0.5), len = p0.distanceTo(p1);
    const ang = Math.atan2(p1.y - p0.y, p1.x - p0.x);
    out.push({p: V(mid.x, mid.y, z), q: Q(0, 0, ang), s: V(len + th, th, depth), glow});
  }
};

/* ───────── 31 Infinite Tunnel ───────── */
export const D31 = 20;
const TUN_LEN = 260;
const tunnelZ = (t: number) => { // distance travelled: slow -> extreme -> decel into hero
  const a = smootherstep(seg(t, 1.0, 11.0)), b = smootherstep(seg(t, 15.0, 19.0));
  return 3 * t + 170 * a * a - 0 * b + (TUN_LEN - 3 * 20 - 170 - 4) * 0 + 0 * t;
};
const camS = (t: number) => { const raw = tunnelZ(t); const end = TUN_LEN - 6; const k = smootherstep(seg(t, 12.5, 19.5)); return lerp(raw, Math.min(raw, end), 1) * (1 - 0) + 0 * k; };
export const InfiniteTunnel: React.FC<EffectProps> = (props) => {
  const {bars, glows} = useMemo(() => {
    const L: Bar[] = [], G: Bar[] = [];
    for (let z = 6; z < TUN_LEN; z += 4) {
      const f = z / TUN_LEN, sec_ = Math.floor(f * 5);
      const out = L, gl = G;
      if (sec_ === 0) { polyFrame(-z, 4, 2.4 * Math.SQRT1_2 * 1.0, Math.PI / 4, 0.16, 0.5, out); polyFrame(-z, 4, 2.15 * Math.SQRT1_2, Math.PI / 4, 0.04, 0.55, gl, true); }
      else if (sec_ === 1) { polyFrame(-z, 6, 2.5, z * 0.03, 0.16, 0.5, out); polyFrame(-z, 6, 2.22, z * 0.03, 0.04, 0.55, gl, true); }
      else if (sec_ === 2) { polyFrame(-z, 3, 2.6 - 0.6 * Math.sin(z * 0.2), z * 0.06, 0.16, 0.5, out); polyFrame(-z, 3, 1.4, -z * 0.09, 0.07, 0.4, out); polyFrame(-z, 3, 1.25, -z * 0.09, 0.03, 0.45, gl, true); }
      else if (sec_ === 3) { // narrow slit gates
        const rot = z * 0.05, w = 0.34;
        for (const sgn of [-1, 1]) out.push({p: V(Math.cos(rot) * sgn * (w + 1.6), Math.sin(rot) * sgn * (w + 1.6), -z), q: Q(0, 0, rot), s: V(0.5, 3.2, 0.5)});
        gl.push({p: V(0, 0, -z), q: Q(0, 0, rot), s: V(0.04, 6.0, 0.06), glow: true});
      } else { polyFrame(-z, 12, 2.5 - 0.9 * Math.abs(Math.sin(z * 0.07)), z * 0.1, 0.1, 0.35, out); polyFrame(-z, 12, 2.2, -z * 0.1, 0.035, 0.4, gl, true); }
    }
    return {bars: L, glows: G};
  }, []);
  const box = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const m1 = useMemo(() => darkM(), []), m2 = useMemo(() => makeMaterial('chrome'), []);
  const gm = useMemo(() => new THREE.MeshBasicMaterial({color: new THREE.Color(0.5, 1.2, 2.4), toneMapped: false}), []);
  const hero = useMemo(() => makeMaterial('chrome'), []);
  const keys = useMemo(() => { const k: CamKey[] = []; for (let i = 0; i <= 80; i++) { const t = (i / 80) * D31, s = camS(t), sw = Math.sin(s * 0.09) * 0.25 * smootherstep(seg(t, 2, 8)); k.push({t, pos: [sw, 0.05 * Math.sin(s * 0.13), -s], target: [Math.sin((s + 8) * 0.09) * 0.25 * smootherstep(seg(t, 2, 8)), 0, -s - 8], fov: 32 + 40 * smootherstep(seg(t, 3, 11)) - 36 * smootherstep(seg(t, 15, 19.5)), roll: 0.09 * Math.sin(s * 0.06) * smootherstep(seg(t, 4, 10))}); } return k; }, []);
  return (
    <Stage {...props} spec={{
      env: 'highContrastMetallic', floorY: null, exposure: (t) => fadeIn(t, 1.2), envRotation: (t) => sweepEnv(t, 0.3, 14, -0.5, 0.9, 0, D31), vignette: 0.8,
      camera: () => keys, blur: (t) => [10 * smootherstep(seg(t, 6, 11)) * (1 - smootherstep(seg(t, 14.5, 17))), 0],
    }}
      render={(t) => (
        <group>
          <Instances count={bars.length} geometry={box} material={m1} t={t} fill={(i, _t, m) => m.compose(bars[i].p, bars[i].q, bars[i].s)} />
          <Instances count={glows.length} geometry={box} material={gm} t={t} fill={(i, _t, m) => m.compose(glows[i].p, glows[i].q, glows[i].s)} />
          <group position={[0, -0.0, -(TUN_LEN + 5)]}>
            <mesh material={hero}><icosahedronGeometry args={[1.25, 4]} /></mesh>
            {[2.0, 2.7].map((r, i) => <mesh key={i} material={m2} rotation={[Math.PI / 2 + i * 0.5, t * 0.1 * (i ? -1 : 1), 0]}><torusGeometry args={[r, 0.05, 20, 128]} /></mesh>)}
            <pointLight position={[0, 3, 6]} intensity={80} color={0xffe0c0} distance={30} />
          </group>
        </group>
      )} />
  );
};

/* ───────── 32 Macro-to-Universe ───────── */
export const D32 = 18;
export const MacroToUniverse: React.FC<EffectProps> = (props) => {
  const plate = useMemo(() => {
    const s = new THREE.Shape(); s.moveTo(-40, -40); s.lineTo(40, -40); s.lineTo(40, 40); s.lineTo(-40, 40); s.closePath();
    const h = new THREE.Path(); h.absarc(0, 0, 0.08, 0, Math.PI * 2, true); s.holes.push(h);
    const g = new THREE.ExtrudeGeometry(s, {depth: 0.05, bevelEnabled: false, curveSegments: 48}); g.translate(0, 0, -0.025); return g;
  }, []);
  const tex = useMemo(() => {
    const c = document.createElement('canvas'); c.width = c.height = 2048; const g = c.getContext('2d')!, r = makeRng(32);
    g.fillStyle = '#9a9ea6'; g.fillRect(0, 0, 2048, 2048);
    for (let i = 0; i < 5000; i++) { const y = r.range(0, 2048), l = r.range(100, 900), x = r.range(-100, 2048); g.strokeStyle = `rgba(${r.next() < 0.5 ? '255,255,255' : '40,42,48'},${r.range(0.03, 0.16)})`; g.lineWidth = r.range(0.5, 2); g.beginPath(); g.moveTo(x, y); g.lineTo(x + l, y + r.range(-1, 1)); g.stroke(); }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(8, 8); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
  }, []);
  const mat = useMemo(() => { const m = makeMaterial('brushedAluminum'); m.map = tex; m.bumpMap = tex; m.bumpScale = 0.4; m.roughness = 0.3; m.anisotropy = 0.9; return m; }, [tex]);
  const world = useMemo(() => {
    const r = makeRng(3232), L: {p: THREE.Vector3; q: THREE.Quaternion; s: number; kind: number}[] = [];
    for (let i = 0; i < 40; i++) L.push({p: V(r.range(-60, 60), r.range(-30, 30), -r.range(40, 380)), q: Q(r.range(0, 3), r.range(0, 3), 0), s: r.range(5, 22), kind: i % 3});
    return L;
  }, []);
  const chrome = useMemo(() => makeMaterial('chrome'), []), dark = useMemo(() => darkM(), []);
  const glow = useMemo(() => new THREE.MeshBasicMaterial({color: new THREE.Color(0.6, 1.4, 2.6), toneMapped: false}), []);
  const camZ = (t: number) => { const a = smootherstep(seg(t, 6.2, 9.2)), b = smootherstep(seg(t, 9.0, 16.0)); return 0.22 - 0.5 * a - 380 * b * b; };
  const keys = useMemo(() => { const k: CamKey[] = []; for (let i = 0; i <= 90; i++) { const t = (i / 90) * D32, z = camZ(t), slide = (1 - smootherstep(seg(t, 0, 6.2))) * (-0.7 + t * 0.12), aim = smootherstep(seg(t, 4.0, 6.5)); k.push({t, pos: [slide * (1 - aim) , 0.0, z] as [number, number, number], target: [lerp(slide + 0.3, 0, aim), lerp(0.0, 0, aim), z - lerp(0.05, 1, aim)] as [number, number, number], fov: 30 + 30 * smootherstep(seg(t, 9, 13))}); } return k; }, []);
  return (
    <Stage {...props} spec={{
      env: 'highContrastMetallic', floorY: null, exposure: (t) => fadeIn(t, 1.2), envRotation: (t) => sweepEnv(t, 0.3, 8, -0.7, 0.9, 0, D32), vignette: 0.7,
      camera: () => keys, blur: (t) => [0, 0].map(() => 0) as [number, number],
    }}
      render={(t) => (
        <group>
          <mesh geometry={plate} material={mat} rotation={[0, 0, 0]} />
          <pointLight position={[0.4, 0.3, 0.8]} intensity={4} distance={4} color={0xffe8d0} />
          {world.map((w, i) => (
            <mesh key={i} position={w.p} quaternion={w.q} material={w.kind === 0 ? chrome : w.kind === 1 ? dark : chrome}>
              {w.kind === 0 ? <torusGeometry args={[w.s, w.s * 0.03, 16, 128]} /> : w.kind === 1 ? <boxGeometry args={[w.s * 0.2, w.s * 2, w.s * 0.2]} /> : <icosahedronGeometry args={[w.s * 0.5, 3]} />}
            </mesh>
          ))}
          <mesh position={[0, 0, -250]} material={glow}><torusGeometry args={[60, 0.25, 12, 256]} /></mesh>
          <mesh position={[0, 0, -250]} rotation={[Math.PI / 2, 0, 0]} material={glow}><torusGeometry args={[90, 0.25, 12, 256]} /></mesh>
        </group>
      )} />
  );
};

/* ───────── 33 Speed Ramp Sculpture ───────── */
export const D33 = 17;
export const SpeedRampSculpture: React.FC<EffectProps> = (props) => {
  const chrome = useMemo(() => makeMaterial('chrome'), []), dark = useMemo(() => darkM(), []), gold = useMemo(() => { const m = makeMaterial('chrome', {color: 0xe0b070}); m.roughness = 0.1; return m; }, []);
  // orbit angle with speed ramp: slow -> violent -> slow
  const ang = (t: number) => { const a = smootherstep(seg(t, 4.0, 7.0)), b = smootherstep(seg(t, 9.0, 12.5)); return 0.12 * t + 9.0 * (a - b) * 0 + 7.5 * smootherstep(seg(t, 4.5, 11.0)) * 1.0; };
  const spd = (t: number) => { const h = 0.01; return Math.abs(ang(t + h) - ang(t - h)) / (2 * h); };
  const keys = useMemo(() => orbitKeys(0, D33, [0, 0, 0], (u) => 8.6 - 3.0 * smootherstep(seg(u, 0.55, 0.9)) - 0.0, (u) => 0.9 - 0.4 * smootherstep(seg(u, 0.3, 0.9)), 0, 1, 1).slice(0, 0), []);
  void keys;
  const cam = useMemo(() => { const k: CamKey[] = []; for (let i = 0; i <= 120; i++) { const t = (i / 120) * D33, a = ang(t) * 0.8 - 0.6, r = lerp(9.0, 5.2, smootherstep(seg(t, 2, 15))) , y = lerp(1.2, 0.5, smootherstep(seg(t, 10, 16))); k.push({t, pos: [Math.sin(a) * r, y, Math.cos(a) * r], target: [0, 0, 0], fov: 30 + 8 * smootherstep(seg(t, 5, 8)) * (1 - smootherstep(seg(t, 11, 13)))}); } return k; }, []);
  return (
    <Stage {...props} spec={{
      env: 'highContrastMetallic', floorY: -2.3, exposure: (t) => fadeIn(t), envRotation: (t) => sweepEnv(t, 0.3, 12, -0.9, 0.6, 0.3, D33),
      camera: () => cam, blur: (t) => [Math.min(26, spd(t) * 3.4), 0],
    }}
      render={(t) => (
        <group>
          <mesh material={chrome}><sphereGeometry args={[0.7, 96, 64]} /></mesh>
          {[1.2, 1.7, 2.2, 2.7].map((r, i) => <mesh key={i} material={i % 2 ? gold : chrome} rotation={[Math.PI / 2 + 0.45 * i, t * 0.15 * (i % 2 ? -1 : 1) + i, 0]}><torusGeometry args={[r, 0.045 + 0.01 * i, 24, 160]} /></mesh>)}
          {Array.from({length: 10}, (_, i) => <mesh key={i} material={dark} position={[Math.cos(i * 0.628) * 1.7, Math.sin(i * 1.3) * 0.5, Math.sin(i * 0.628) * 1.7]} rotation={[0, -i * 0.628, 0]}><boxGeometry args={[0.14, 1.2 + (i % 3) * 0.4, 0.5]} /></mesh>)}
        </group>
      )} />
  );
};

/* ───────── 34 Hyperspace Corridor ───────── */
export const D34 = 16;
export const HyperspaceCorridor: React.FC<EffectProps> = (props) => {
  const items = useMemo(() => {
    const r = makeRng(34), L: {p: THREE.Vector3; kind: number; s: number; rot: THREE.Euler}[] = [];
    for (let i = 0; i < 90; i++) for (const side of [-1, 1]) L.push({p: V(side * r.range(2.0, 3.4), r.range(-1.0, 1.2), -(8 + i * 5 + r.range(-1, 1))), kind: Math.floor(r.range(0, 3.99)), s: r.range(0.4, 0.9), rot: new THREE.Euler(r.range(0, 3), r.range(0, 3), r.range(0, 3))});
    return L;
  }, []);
  const chrome = useMemo(() => makeMaterial('chrome'), []), dark = useMemo(() => darkM(), []), gm = useMemo(() => new THREE.MeshBasicMaterial({color: new THREE.Color(1.6, 1.3, 1.0), toneMapped: false}), []);
  const dist = (t: number) => 2 + 6 * t + 120 * Math.pow(smootherstep(seg(t, 1.5, 10)), 2) + 0 * t;
  const keys = useMemo(() => { const k: CamKey[] = []; for (let i = 0; i <= 80; i++) { const t = (i / 80) * D34, s = Math.min(dist(t), 420 - 8 + 8), sw = Math.sin(s * 0.05) * 0.4; k.push({t, pos: [sw, 0.0, -s], target: [Math.sin((s + 8) * 0.05) * 0.4, 0, -s - 8], fov: 34 + 34 * smootherstep(seg(t, 3, 10)) - 24 * smootherstep(seg(t, 12.5, 16)), roll: 0.05 * Math.sin(s * 0.04)}); } return k; }, []);
  const g = useMemo(() => [new THREE.SphereGeometry(1, 48, 32), new THREE.BoxGeometry(1.6, 1.6, 1.6), new THREE.OctahedronGeometry(1.2, 0), new THREE.TorusGeometry(0.9, 0.22, 24, 48)], []);
  return (
    <Stage {...props} spec={{
      env: 'highContrastMetallic', floorY: -1.6, exposure: (t) => fadeIn(t, 1.2), envRotation: (t) => sweepEnv(t, 0.3, 10, -0.6, 0.8, 0, D34), vignette: 0.8,
      camera: () => keys, blur: (t) => [14 * smootherstep(seg(t, 4, 9)) * (1 - smootherstep(seg(t, 12.5, 15))), 0],
    }}
      render={(t) => (
        <group>
          {[0, 1, 2, 3].map((k) => {
            const list = items.filter((x) => x.kind === k);
            return <Instances key={k} count={list.length} geometry={g[k]} material={k % 2 ? dark : chrome} t={t} fill={(i, _t, m) => m.compose(list[i].p, new THREE.Quaternion().setFromEuler(new THREE.Euler(list[i].rot.x + t * 0.3, list[i].rot.y, list[i].rot.z)), V(list[i].s, list[i].s, list[i].s))} />;
          })}
          {[-1, 1].map((s) => <mesh key={s} position={[s * 4.4, 1.5, -230]} material={gm}><boxGeometry args={[0.06, 0.06, 460]} /></mesh>)}
          {[-1, 1].map((s) => <mesh key={'f' + s} position={[s * 1.6, -1.55, -230]} material={gm}><boxGeometry args={[0.04, 0.04, 460]} /></mesh>)}
        </group>
      )} />
  );
};

/* ───────── 35 One-Shot Transformation ───────── */
export const D35 = 24;
export const OneShotTransformation: React.FC<EffectProps> = (props) => {
  const chrome = useMemo(() => makeMaterial('chrome'), []), dark = useMemo(() => darkM(), []), glass = useMemo(() => makeGlass({tint: 0x2a6a80, opacity: 0.32}), []);
  const gold = useMemo(() => { const m = makeMaterial('chrome', {color: 0xe9b774}); m.roughness = 0.1; return m; }, []);
  const gm = useMemo(() => new THREE.MeshBasicMaterial({color: new THREE.Color(0.5, 1.2, 2.4), toneMapped: false}), []);
  const frames = useMemo(() => { const L: Bar[] = []; for (let z = 14; z < 46; z += 2.6) polyFrame(-z, 6, 1.9, z * 0.12, 0.12, 0.4, L); return L; }, []);
  const spheres = useMemo(() => { const r = makeRng(35); return Array.from({length: 18}, () => ({p: V(r.range(-6, 6), r.range(-3, 3), -r.range(54, 92)), s: r.range(0.4, 1.3), sp: r.range(0.3, 1)})); }, []);
  const box = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const path = (t: number) => { const u = smootherstep(seg(t, 1.5, 22.5)); return 8 - 100 * u; };
  const keys = useMemo(() => { const k: CamKey[] = []; for (let i = 0; i <= 120; i++) { const t = (i / 120) * D35, z = path(t), sw = Math.sin(z * 0.06) * 0.5, up = z < -86 ? 0 : 0; k.push({t, pos: [sw, 0.3 + up, z], target: [Math.sin((z - 8) * 0.06) * 0.5, 0.2, z - 8], fov: 32 + 12 * Math.sin(smootherstep(seg(t, 3, 21)) * Math.PI), roll: 0.06 * Math.sin(t * 0.4)}); } return k; }, []);
  return (
    <Stage {...props} spec={{
      env: 'highContrastMetallic', floorY: null, exposure: (t) => fadeIn(t, 1.6), envRotation: (t) => sweepEnv(t, 0.3, 20, -0.9, 1.4, 0, D35), vignette: 0.75,
      camera: () => keys, blur: (t) => [5 * Math.sin(smootherstep(seg(t, 5, 19)) * Math.PI), 0],
    }}
      render={(t) => (
        <group>
          {/* A: studio sphere + ring (z ≈ 0) */}
          <group position={[0, 0, -2]}><mesh material={chrome}><sphereGeometry args={[0.9, 64, 48]} /></mesh>
            <mesh material={gold} rotation={[0, t * 0.3, 0]} position={[0, 0, -4]}><torusGeometry args={[2.2, 0.12, 24, 128]} /></mesh></group>
          {/* B: tunnel of hex frames */}
          <Instances count={frames.length} geometry={box} material={dark} t={t} fill={(i, _t, m) => m.compose(frames[i].p, frames[i].q, frames[i].s)} />
          <mesh position={[0, 0, -30]} material={gm}><boxGeometry args={[0.05, 0.05, 36]} /></mesh>
          {/* C: glass chamber with drifting spheres */}
          {spheres.map((s, i) => <mesh key={i} position={[s.p.x, s.p.y + Math.sin(t * s.sp + i) * 0.4, s.p.z]} material={i % 3 ? chrome : glass}><sphereGeometry args={[s.s, 48, 32]} /></mesh>)}
          {[0, 1, 2, 3, 4, 5].map((i) => <mesh key={i} position={[0, 0, -52 - i * 0.7]} material={glass} rotation={[0, 0, i * 0.2 + t * 0.05]}><boxGeometry args={[7, 0.05, 0.05]} /></mesh>)}
          {/* D: narrow slit then hero */}
          {[-1, 1].map((s) => <mesh key={s} material={dark} position={[s * 1.0, 0, -98]}><boxGeometry args={[1.2, 8, 0.6]} /></mesh>)}
          <group position={[0, -0.2, -112]}><mesh material={gold}><icosahedronGeometry args={[1.3, 4]} /></mesh>
            {[1.9, 2.5].map((r, i) => <mesh key={i} material={chrome} rotation={[Math.PI / 2 + 0.5 * i, t * 0.12, 0]}><torusGeometry args={[r, 0.05, 20, 128]} /></mesh>)}
            <pointLight position={[0, 3, 5]} intensity={70} color={0xffe0c0} distance={30} /></group>
          <pointLight position={[0, 1, -45]} intensity={30} color={0x88ccff} distance={24} />
          <pointLight position={[0, 2, -70]} intensity={40} color={0xffffff} distance={30} />
        </group>
      )} />
  );
};
void camFrom; void easeInOutCubic; void smoothstep;
