import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Stage, EffectProps} from '../../core/Stage';
import {camFrom, fadeIn, sweepEnv} from '../../core/kit';
import {easeInOutCubic, lerp, seg, smootherstep, smoothstep, springStep, clamp} from '../../core/Timeline';
import {makeRng} from '../../core/DeterministicRandom';
import {makeMaterial} from '../../materials/presets';
import {mixSDF, sdBox, sdCapsule, sdSphere, sdTorusY, SDF, smin} from '../../geometry/sdfMesh';
import {LiquidMesh, resScale} from './liquid';

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const mercury = () => { const m = makeMaterial('mercury'); m.color = new THREE.Color(0xf2f4f8); return m; };

/* ───────── 11 Chrome Metamorphosis ───────── */
export const D11 = 18;
const knot = (u: number) => { const a = u * Math.PI * 2; return V((Math.sin(a) + 2 * Math.sin(2 * a)) * 0.42, (Math.cos(a) - 2 * Math.cos(2 * a)) * 0.42, -Math.sin(3 * a) * 0.55); };
const ribbon = (u: number, t: number) => V((u - 0.5) * 5.4, 0.9 * Math.sin(u * 9 + t * 2.2) + 0.2, 1.0 * Math.cos(u * 6.5 + t * 1.5));
export const ChromeMetamorphosis: React.FC<EffectProps> = (props) => {
  const mat = useMemo(mercury, []);
  const N = 40;
  return (
    <Stage {...props} spec={{
      env: 'highContrastMetallic', floorY: -2.4, exposure: (t) => fadeIn(t), envRotation: (t) => sweepEnv(t, 0.3, 4, -0.9, 0.6, 0.5, D11),
      camera: camFrom([[0, [-1.6, 0.6, 9], [0, 0, 0]], [4, [-0.4, 0.4, 6.4], [0, 0, 0]], [7.5, [2.0, 1.0, 7.0], [0, 0.2, 0]], [11, [-1.0, 0.5, 6.0], [0, 0, 0]], [14, [0.8, 0.5, 5.6], [0, 0, 0]], [18, [-1.5, 0.7, 6.6], [0, 0, 0]]], 2.0),
    }}
      render={(t, q) => {
        const wob = smootherstep(seg(t, 2.2, 4.6)), melt = smootherstep(seg(t, 4.4, 7.6)), conv = easeInOutCubic(seg(t, 8.2, 12.4)), solid = smootherstep(seg(t, 12.4, 14.4));
        const R = 1.15 * (1 - melt) * (1 - 0.0), amp = 0.16 * wob * (1 - melt * 0.5);
        const chainR = 0.05 + 0.2 * smootherstep(seg(t, 4.2, 7.6));
        const pts: THREE.Vector3[] = [];
        for (let i = 0; i <= N; i++) {
          const u = i / N;
          const spread = smootherstep(seg(t, 4.4, 8.0));
          const a = ribbon(u, t).multiplyScalar(spread), b = knot(u).multiplyScalar(1.0);
          const p = a.lerp(b, conv);
          if (!conv) p.y += 0; 
          pts.push(p);
        }
        const caps: SDF[] = [];
        for (let i = 0; i < N; i++) caps.push(sdCapsule(pts[i], pts[i + 1], chainR * (1 + 0.25 * Math.sin(i * 0.9 + t * 3) * (1 - solid))));
        const sph: SDF = (x, y, z) => {
          const r = Math.hypot(x, y, z) || 1e-6;
          const th = Math.acos(y / r), ph = Math.atan2(z, x);
          const w = amp * (Math.sin(3 * th + t * 2.1) * Math.cos(2 * ph + t * 1.7) + 0.5 * Math.sin(5 * ph - t * 2.6) * Math.sin(2 * th));
          return r - (R + w);
        };
        const field: SDF = (x, y, z) => {
          let d = R > 0.02 ? sph(x, y, z) : 9;
          for (const c of caps) d = smin(d, c(x, y, z), 0.28 * (1 - solid * 0.6));
          return d;
        };
        const res = resScale(props.quality, 64);
        return <LiquidMesh id="m11" t={t} field={field} res={res} min={V(-3.6, -2.4, -2.6)} max={V(3.6, 2.4, 2.6)} material={mat} />;
      }} />
  );
};

/* ───────── 12 Liquid Crown ───────── */
export const D12 = 16;
const IMPACT_T = 3.6;
export const LiquidCrown: React.FC<EffectProps> = (props) => {
  const mat = useMemo(mercury, []);
  const drops = useMemo(() => {
    const r = makeRng(12);
    return Array.from({length: 22}, (_, i) => ({a: (i / 22) * Math.PI * 2 + r.range(-0.1, 0.1), v: r.range(1.4, 2.6), up: r.range(2.2, 4.2), r: r.range(0.05, 0.11), d: r.range(0, 0.1)}));
  }, []);
  return (
    <Stage {...props} spec={{
      env: 'highContrastMetallic', floorY: null, exposure: (t) => fadeIn(t), envRotation: (t) => sweepEnv(t, 0.3, 5, -0.9, 0.4, 0.4, D12),
      camera: camFrom([[0, [0, 2.0, 8.5], [0, 0.2, 0]], [3.0, [1.4, 1.2, 6.2], [0, 0.6, 0]], [3.9, [1.8, 0.9, 5.2], [0, 0.5, 0]], [7.0, [3.2, 0.8, 4.6], [0, 0.5, 0]], [10.5, [-1.4, 0.5, 5.2], [0, 0.45, 0]], [13, [-3.2, 1.0, 6.0], [0, 0.4, 0]], [16, [-1.0, 1.6, 7.0], [0, 0.3, 0]]], 1.8),
    }}
      render={(t) => {
        // sim-time slow-motion around the splash
        const tau = t < IMPACT_T - 0.4 ? t : IMPACT_T - 0.4 + (t - (IMPACT_T - 0.4)) * (t < 8 ? 0.28 : 0.28 + (1 - 0.28) * smoothstep(seg(t, 8, 12)));
        const s = tau - IMPACT_T;                                   // time since impact (slow-mo)
        const drop = tau < IMPACT_T ? V(0, 0.2 + 5.2 * Math.pow(1 - tau / IMPACT_T, 2) * 1.0, 0) : null;
        const R = Math.max(0, s) * 1.6 * Math.exp(-s * 0.35) + 0.0;  // crown ring radius
        const Hc = 1.15 * Math.sin(clamp(s / 1.6) * Math.PI * 0.92) * Math.exp(-Math.max(0, s - 1.2) * 0.5) * (s > 0 ? 1 : 0);
        const settle = Math.exp(-Math.max(0, s) * 0.45) * 0.07;
        const field: SDF = (x, y, z) => {
          const r = Math.hypot(x, z), th = Math.atan2(z, x);
          let h = -0.35 + settle * Math.sin(r * 7 - s * 5) * (s > 0 ? 1 : 0) * Math.exp(-r * 0.6);
          if (s > 0) {
            const rimR = 0.55 + R * 0.55;
            const spikes = 0.65 + 0.35 * Math.cos(thetaMod(th, 11));
            h += Hc * spikes * Math.exp(-Math.pow((r - rimR) / 0.2, 2)) - 0.55 * Math.exp(-Math.pow(r / (0.4 + 0.4 * R), 2)) * Math.exp(-s * 0.9) * (s > 0 ? 1 : 0);
          }
          let d = (y - h) * 0.7;
          { const q1 = r - 3.4 + 0.5, q2 = -0.9 - y + 0.5; const basin = Math.hypot(Math.max(q1, 0), Math.max(q2, 0)) + Math.min(Math.max(q1, q2), 0) - 0.5; d = Math.max(d, basin); }
          if (s < 0.12 && drop) d = smin(d, Math.hypot(x - drop.x, y - drop.y, z - drop.z) - 0.55, 0.3);
          if (s > 0) for (const dr of drops) {
            const ds = s - dr.d; if (ds < 0) continue;
            const rim = 0.55 + R * 0.55;
            const px = Math.cos(dr.a) * (rim + dr.v * ds * 0.5), pz = Math.sin(dr.a) * (rim + dr.v * ds * 0.5);
            const py = h0 + dr.up * ds - 1.6 * ds * ds;
            if (py < -0.3) continue;
            d = smin(d, Math.hypot(x - px, y - py, z - pz) - dr.r, 0.12);
          }
          return d;
        };
        const res: [number, number, number] = [resScale(props.quality, 90), resScale(props.quality, 58), resScale(props.quality, 90)];
        return (
          <>
            <LiquidMesh id="m12" t={t} field={field} res={res} min={V(-4.2, -1.0, -4.2)} max={V(4.2, 3.6, 4.2)} material={mat} />
            {drop && s < -0.001 && <mesh position={drop} material={mat}><sphereGeometry args={[0.55, 48, 32]} /></mesh>}
          </>
        );
      }} />
  );
};
const h0 = 0.45;
function thetaMod(th: number, n: number) { return th * n; }

/* ───────── 13 Mercury Cube ───────── */
export const D13 = 17;
export const MercuryCube: React.FC<EffectProps> = (props) => {
  const mat = useMemo(mercury, []);
  return (
    <Stage {...props} spec={{
      env: 'highContrastMetallic', floorY: -2.0, exposure: (t) => fadeIn(t), envRotation: (t) => sweepEnv(t, 0.3, 5, -0.9, 0.5, 0.4, D13),
      camera: camFrom([[0, [-1.8, 0.8, 8.6], [0, 0, 0]], [4, [-0.6, 0.5, 6.2], [0, 0, 0]], [8, [1.8, 0.7, 5.6], [0, -0.3, 0]], [12, [-1.2, 0.4, 5.6], [0, -0.2, 0]], [17, [0.8, 0.6, 6.4], [0, -0.2, 0]]], 2.0),
    }}
      render={(t) => {
        const a = smootherstep(seg(t, 4.2, 6.6)), sag = smootherstep(seg(t, 5.0, 7.4)), stretch = smootherstep(seg(t, 8.0, 10.0)), toTorus = smootherstep(seg(t, 10.0, 13.2));
        const settle = springStep(t - 7.0, 3.2, 0.35) - 1;
        const cube = (x: number, y: number, z: number) => sdBox(0, 0, 0, 0.95, 0.95 - 0.3 * sag, 0.95, 0.02 + 0.93 * a)(x, y, z);
        const cap: SDF = sdCapsule(V(-1.25, 0, 0), V(1.25, 0, 0), 0.5);
        const tor: SDF = sdTorusY(0, 0, 0, 1.05, 0.42);
        const field: SDF = (x, y, z) => {
          const wobble = 0.05 * a * (1 - toTorus) * Math.sin(x * 4 + t * 3) * Math.sin(z * 3 + t * 2.4) + 0.06 * settle * Math.sin(y * 5);
          const sphere = cube(x, y + 0.2 * sag, z);
          let d = sphere;
          d = lerp(d, cap(x, y, z), stretch);
          d = lerp(d, tor(x, y * 0.9 + 0.0, z), toTorus);
          return d + wobble;
        };
        const res = resScale(props.quality, 76);
        return <LiquidMesh id="m13" t={t} field={field} res={res} min={V(-2.2, -1.4, -2.2)} max={V(2.2, 1.4, 2.2)} material={mat} />;
      }} />
  );
};
void mixSDF;

/* ───────── 14 Liquid Ribbon (parametric surface) ───────── */
export const D14 = 18;
export const LiquidRibbon: React.FC<EffectProps> = (props) => {
  const mat = useMemo(() => { const m = makeMaterial('chrome'); m.side = THREE.DoubleSide; m.roughness = 0.03; return m; }, []);
  const seg_ = props.quality === 'preview' ? 160 : 360;
  return (
    <Stage {...props} spec={{
      env: 'highContrastMetallic', floorY: null, exposure: (t) => fadeIn(t), envRotation: (t) => sweepEnv(t, 0.3, 8, -1.0, 1.2, 0.5, D14),
      camera: camFrom([[0, [-2.5, 0.8, 9], [0, 0, 0]], [5, [0.5, 0.6, 7.4], [0, 0, 0]], [9, [3.0, 1.2, 5.8], [0, 0, 0]], [13, [-2.4, 0.4, 5.8], [0, 0, 0]], [18, [0.6, 0.8, 6.8], [0, 0, 0]]], 1.9),
    }}
      render={(t) => {
        const fold = easeInOutCubic(seg(t, 5.5, 12.5)), close = smootherstep(seg(t, 10.5, 14.5));
        const geo = (() => {
          const N = seg_, pos: number[] = [], nor: number[] = [], idx: number[] = [];
          const pathA = (u: number) => V((u - 0.5) * 7.0 + Math.sin(t * 0.7) * 0.2, 1.1 * Math.sin(u * 7.5 + t * 1.2), 1.4 * Math.sin(u * 5.0 + t * 0.9));
          const pathB = (u: number) => { const a = u * Math.PI * 2; return V(Math.sin(a) * 1.9, Math.sin(2 * a) * 0.9 + 0.1 * Math.sin(3 * a), Math.cos(a) * (1.3 + 0.35 * Math.cos(3 * a))); };
          const P = (u: number) => pathA(u).lerp(pathB(u), fold).lerp(pathB(u), 0);
          const W = (u: number) => 0.34 * (0.55 + 0.45 * Math.sin(u * Math.PI)) * (1 - 0.15 * close) + 0.12;
          for (let i = 0; i <= N; i++) {
            const u = i / N, c = P(u), c2 = P(Math.min(1, u + 1e-3)), c0 = P(Math.max(0, u - 1e-3));
            const T = c2.clone().sub(c0).normalize();
            const up = Math.abs(T.y) < 0.9 ? V(0, 1, 0) : V(1, 0, 0);
            const B0 = new THREE.Vector3().crossVectors(T, up).normalize(), N0 = new THREE.Vector3().crossVectors(T, B0);
            const tw = (u * 11 + t * 0.6) * (1 - 0.6 * fold) + fold * u * 6.0;
            const B = B0.clone().multiplyScalar(Math.cos(tw)).addScaledVector(N0, Math.sin(tw));
            const Nn = new THREE.Vector3().crossVectors(T, B).normalize();
            const w = W(u);
            for (const sgn of [-1, 1]) {
              const p = c.clone().addScaledVector(B, sgn * w);
              pos.push(p.x, p.y, p.z); nor.push(Nn.x, Nn.y, Nn.z);
            }
            if (i < N) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
          }
          const g = new THREE.BufferGeometry();
          g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
          g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
          g.setIndex(idx);
          return g;
        })();
        return <mesh geometry={geo} material={mat} frustumCulled={false} />;
      }} />
  );
};

/* ───────── 15 Chrome Portal ───────── */
export const D15 = 16;
const Beyond: React.FC<{t: number}> = ({t}) => {
  const rings = useMemo(() => Array.from({length: 7}, (_, i) => i), []);
  const m = useMemo(() => makeMaterial('chrome', {color: 0xe8d4ff}), []);
  const sky = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 4; c.height = 256;
    const g = c.getContext('2d')!; const gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, '#05061a'); gr.addColorStop(0.45, '#2a1458'); gr.addColorStop(0.72, '#b2406e'); gr.addColorStop(0.86, '#ff9a5a'); gr.addColorStop(1, '#1a0b22');
    g.fillStyle = gr; g.fillRect(0, 0, 4, 256);
    const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; return tx;
  }, []);
  return (
    <group position={[0, 0, -16]}>
      <mesh position={[0, 0, -9]}><planeGeometry args={[70, 36]} /><meshBasicMaterial map={sky} toneMapped={false} /></mesh>
      <mesh position={[0, -6, -2]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[70, 40]} /><meshBasicMaterial toneMapped={false} color={new THREE.Color(0.05, 0.03, 0.08)} /></mesh>
      {rings.map((i) => <mesh key={i} material={m} position={[Math.sin(i * 1.9) * 2.2, Math.cos(i * 2.3) * 1.2, -i * 1.1]} rotation={[t * 0.2 + i, t * 0.15, 0]}><torusGeometry args={[0.9 + i * 0.12, 0.07, 24, 96]} /></mesh>)}
      {rings.map((i) => <mesh key={'s' + i} material={m} position={[Math.cos(i * 1.7) * 3.0, Math.sin(i * 1.3) * 1.6, -i * 0.9 - 1]}><sphereGeometry args={[0.28 + 0.05 * (i % 3), 32, 24]} /></mesh>)}
      <pointLight position={[0, 2, 4]} intensity={40} color={0xff9a70} distance={22} />
    </group>
  );
};
export const ChromePortal: React.FC<EffectProps> = (props) => {
  const mat = useMemo(mercury, []);
  return (
    <Stage {...props} spec={{
      env: 'highContrastMetallic', floorY: null, exposure: (t) => fadeIn(t), envRotation: (t) => sweepEnv(t, 0.3, 6, -0.9, 0.5, 0.2, D15),
      camera: camFrom([[0, [-2.0, 0.6, 8.5], [0, 0, 0]], [4, [-1.0, 0.4, 6.6], [0, 0, 0]], [8, [0.6, 0.3, 5.0], [0, 0, 0]], [10.5, [0.0, 0.0, 2.6], [0, 0, -3]], [12.2, [0, 0, -2.5], [0, 0, -9], 34], [14, [0, 0.1, -9], [0, 0, -16], 34], [16, [0.3, 0.2, -11], [0, 0, -16], 34]], 1.7),
    }}
      render={(t) => {
        const rise = smootherstep(seg(t, 1.2, 4.0)), stand = smootherstep(seg(t, 2.2, 4.8)), open = smootherstep(seg(t, 5.0, 8.0));
        const ripple = (x: number, y: number) => 0.035 * Math.sin(Math.hypot(x, y) * 11 - t * 4.5) * (1 - open * 0.5);
        const field: SDF = (x, y, z) => {
          // vertical liquid disc (axis z) -> ring: hole radius grows with `open`
          const r = Math.hypot(x, y - 0.0);
          const Rout = 1.75 * (0.25 + 0.75 * rise);
          const hole = 1.12 * open;
          const th = 0.2 + 0.1 * (1 - open) + ripple(x, y);
          const dr = Math.max(r - Rout, hole - r, 0) + Math.max(Math.abs(z) - th, 0);
          const body = Math.hypot(Math.max(r - Rout, hole - r, -9), Math.max(Math.abs(z) - th, -9));
          void dr;
          const d2 = Math.max(Math.max(r - Rout, hole - r), Math.abs(z) - th);
          // blend toward a torus once open for a rounded liquid ring
          const tor = Math.hypot(r - (Rout + hole) / 2, z) - (Rout - hole) / 2 * 0.62;
          const f = lerp(d2, tor, smootherstep(seg(open, 0.3, 1)));
          void body;
          return f + (1 - stand) * 0.0;
        };
        const res: [number, number, number] = [resScale(props.quality, 80), resScale(props.quality, 80), resScale(props.quality, 30)];
        return (
          <>
            <LiquidMesh id="m15" t={t} field={field} res={res} min={V(-2.2, -2.2, -0.8)} max={V(2.2, 2.2, 0.8)} material={mat} />
            <Beyond t={t} />
          </>
        );
      }} />
  );
};
