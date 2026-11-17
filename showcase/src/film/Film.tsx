import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import * as THREE from 'three';
import { Suspense } from 'react';
import { Monitor3D } from '../core/Monitor3D';
import { Studio } from '../core/Studio';
import { CameraRig, CamKey, frameScreen } from '../core/CameraRig';
import { Cursor, ImageLayer, PageLayer, Ring, Ripple, useTex } from '../core/ScreenContent';
import { easeInOut, ramp } from '../core/MotionSystem';
import type { SectionDef, Shot } from './types';
import { BRAND } from '../config/branding';

export const shotsToKeys = (shots: Shot[], aspect: number): CamKey[] =>
  shots.map((s) => {
    const vertical = aspect < 1;
    const o = vertical ? s.v ?? {} : {};
    return frameScreen(o.cx ?? s.cx, o.cy ?? s.cy, o.w ?? s.w, aspect, o.yaw ?? s.yaw ?? 0, o.pitch ?? s.pitch ?? 0, s.fov ?? (vertical ? 30 : 22), s.f, s.ease);
  });

const track = (keys: [number, number][], f: number, ease = easeInOut) => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [f0, v0] = keys[i], [f1, v1] = keys[i + 1];
    if (f <= f1) return v0 + (v1 - v0) * ease((f - f0) / Math.max(1, f1 - f0));
  }
  return keys[keys.length - 1][1];
};

const cursorAt = (def: SectionDef, f: number) => {
  const k = def.cursor; if (!k || !k.length) return null;
  if (f < k[0].f) return null;
  let x = k[k.length - 1].x, y = k[k.length - 1].y;
  for (let i = 0; i < k.length - 1; i++) if (f <= k[i + 1].f) {
    const t = easeInOut((f - k[i].f) / Math.max(1, k[i + 1].f - k[i].f));
    x = k[i].x + (k[i + 1].x - k[i].x) * t; y = k[i].y + (k[i + 1].y - k[i].y) * t; break;
  }
  return { x, y };
};

const FloaterPlane: React.FC<{ src: string; pos: [number, number, number]; ry: number; scale: number; opacity: number }> = ({ src, pos, ry, scale, opacity }) => {
  const tex = useTex(src);
  if (!tex || opacity <= 0.001) return null;
  return (
    <mesh position={pos} rotation={[0, ry, 0]} scale={scale}>
      <planeGeometry args={[1.76, 0.99]} />
      <meshBasicMaterial map={tex} toneMapped={false} transparent opacity={opacity} depthWrite={false} />
    </mesh>
  );
};

export const Film: React.FC<{ def: SectionDef }> = ({ def }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const aspect = width / height;
  const keys = shotsToKeys(def.shots, aspect);

  const layers = def.layers.map((l, i) => {
    const fi = l.fadeIn ?? 0, fo = l.fadeOut ?? 0;
    let op = 1;
    if (f < l.in) op = 0; else if (fi > 0) op = Math.min(op, ramp(f, l.in, l.in + fi));
    if (l.out !== undefined) { if (f > l.out) op = 0; else if (fo > 0) op = Math.min(op, 1 - ramp(f, l.out - fo, l.out)); }
    const scrollY = l.scroll ? track(l.scroll, f) : 0;
    const bright = l.bright ? track(l.bright, f) : 1;
    const dx = l.slide && fi > 0 ? (1 - ramp(f, l.in, l.in + fi, (t) => 1 - Math.pow(1 - t, 3))) * (l.slide / 1920) * 3.2 : 0;
    const z = i * 0.0004;
    return l.page.startsWith('img:')
      ? <ImageLayer key={i} src={l.page.slice(4)} opacity={op} bright={bright} z={z} />
      : <PageLayer key={i} page={l.page} scrollY={scrollY} opacity={op} bright={bright} z={z} dx={dx} />;
  });

  const cur = cursorAt(def, f);
  const lastClick = [...(def.clicks ?? [])].reverse().find((c) => f >= c.f - 6);
  const press = lastClick ? Math.max(0, 1 - Math.abs(f - lastClick.f) / 5) : 0;
  const curOp = cur ? ramp(f, def.cursor![0].f, def.cursor![0].f + 10) * (def.cursor!.length > 1 && f > def.cursor![def.cursor!.length - 1].f + 30 ? 1 - ramp(f, def.cursor![def.cursor!.length - 1].f + 30, def.cursor![def.cursor!.length - 1].f + 50) : 1) : 0;

  // intro: exposure / sweep light
  const dark = def.intro ? 1 - ramp(f, 0, 50) : 0;
  const fadeOutEnd = def.finale ? ramp(f, def.frames - 90, def.frames - 6) : 0;
  const sweepX = interpolate(f, [10, 120], [-2.2, 2.4], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeInOut });
  const sweepOn = def.intro ? interpolate(f, [0, 20, 100, 150], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 0;

  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 40%, #1a1838 0%, #0a0918 55%, #040409 100%)' }}>
      <ThreeCanvas width={width} height={height} dpr={1} gl={{ alpha: true, antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }} camera={{ fov: 22, near: 0.05, far: 80 }}>
        <Suspense fallback={null}>
          <CameraRig keys={keys} frame={f} />
          <Studio intensity={def.intro ? 0.35 + 0.65 * ramp(f, 40, 200) : 1} rimBoost={def.intro ? 0.6 + 0.4 * ramp(f, 30, 160) : 1} />
          <Monitor3D sweep={sweepOn > 0 ? <pointLight position={[sweepX, 0.9, 0.35]} intensity={6 * sweepOn} distance={2.2} decay={2} color="#cfe0ff" /> : null}>
            {layers}
            {def.highlights?.map((h, i) => <Ring key={i} x={h.x} y={h.y} w={h.w} h={h.h} color={h.color ?? BRAND.brand500} opacity={ramp(f, h.f0, h.f0 + 14) * (1 - ramp(f, h.f1 - 14, h.f1))} />)}
            {def.clicks?.map((c, i) => <Ripple key={i} x={c.x} y={c.y} t={(f - c.f) / 22} />)}
            {cur && <Cursor x={cur.x} y={cur.y} opacity={curOp} press={press} />}
          </Monitor3D>
          {def.floaters?.map((fl, i) => {
            const appear = ramp(f, fl.f0, fl.f0 + 50, (t) => 1 - Math.pow(1 - t, 3));
            const conv = ramp(f, fl.fConverge, fl.fEnd);
            const drift = Math.sin((f + i * 37) / 70) * 0.04;
            const pos: [number, number, number] = [
              fl.from[0] * (1 - conv) * (0.7 + 0.3 * appear),
              fl.from[1] * (1 - conv) + drift,
              0.15 + (fl.from[2] - 0.15) * (1 - conv) * appear,
            ];
            return <FloaterPlane key={i} src={fl.src} pos={pos} ry={fl.ry * (1 - conv)} scale={1 - 0.5 * conv} opacity={appear * (1 - ramp(f, fl.fConverge + (fl.fEnd - fl.fConverge) * 0.6, fl.fEnd))} />;
          })}
        </Suspense>
      </ThreeCanvas>
      {def.caption?.map((c, i) => {
        const o = ramp(f, c.f0, c.f0 + 14) * (1 - ramp(f, c.f1 - 14, c.f1));
        return o > 0 ? (
          <div key={i} style={{ position: 'absolute', left: 0, right: 0, bottom: aspect < 1 ? 160 : 70, textAlign: 'center', opacity: o, transform: `translateY(${(1 - o) * 14}px)`, fontFamily: 'Onest, system-ui, sans-serif', color: BRAND.fg }}>
            <div style={{ fontSize: aspect < 1 ? 64 : 54, fontWeight: 700, letterSpacing: '-0.01em', textShadow: '0 4px 30px rgba(0,0,0,.6)' }}>{c.text}</div>
            {c.sub && <div style={{ fontSize: aspect < 1 ? 34 : 28, opacity: 0.75, marginTop: 8 }}>{c.sub}</div>}
          </div>
        ) : null;
      })}
      {(dark > 0 || fadeOutEnd > 0) && <AbsoluteFill style={{ background: '#000', opacity: Math.max(dark, fadeOutEnd) }} />}
    </AbsoluteFill>
  );
};
