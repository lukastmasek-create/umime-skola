import { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { cancelRender, continueRender, delayRender, staticFile } from 'remotion';
import { SCREEN_W, SCREEN_H } from './Monitor3D';

const cache = new Map<string, Promise<THREE.Texture>>();
export const loadTex = (src: string) => {
  let p = cache.get(src);
  if (!p) {
    p = new Promise((res, rej) => new THREE.TextureLoader().load(staticFile(src), (t) => {
      t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 16; t.generateMipmaps = true;
      t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; t.needsUpdate = true; res(t);
    }, undefined, rej));
    cache.set(src, p);
  }
  return p;
};
export const useTex = (src: string) => {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    const h = delayRender(`tex ${src}`, { timeoutInMilliseconds: 90000 });
    loadTex(src).then((t) => { setTex(t); continueRender(h); }, (e) => cancelRender(e));
  }, [src]);
  return tex;
};

export type PageMeta = { id: string; height: number; chunk: number; count: number };
export const PAGES: Record<string, PageMeta> = {};
export const registerPage = (m: PageMeta) => { PAGES[m.id] = m; };

const Strip: React.FC<{ src: string; y0: number; h: number; scrollY: number; opacity: number; bright: number; z: number }> = (p) => {
  const a = Math.max(p.y0, p.scrollY), b = Math.min(p.y0 + p.h, p.scrollY + 1080);
  if (b <= a || p.opacity <= 0.001) return null;
  return <StripInner {...p} a={a} b={b} />;
};
const StripInner: React.FC<{ src: string; y0: number; h: number; scrollY: number; opacity: number; bright: number; z: number; a: number; b: number }> = ({ src, y0, h, scrollY, opacity, bright, z, a, b }) => {
  const base = useTex(src);
  const tex = useMemo(() => (base ? base.clone() : null), [base]);
  if (!tex) return null;
  tex.offset.set(0, 1 - (b - y0) / h);
  tex.repeat.set(1, (b - a) / h);
  const hh = ((b - a) / 1080) * SCREEN_H;
  const cy = SCREEN_H / 2 - ((a + b) / 2 - scrollY) / 1080 * SCREEN_H;
  return (
    <mesh position={[0, cy, z]} renderOrder={2}>
      <planeGeometry args={[SCREEN_W, hh]} />
      <meshBasicMaterial map={tex} toneMapped={false} transparent opacity={opacity} color={new THREE.Color(bright, bright, bright)} depthWrite={false} />
    </mesh>
  );
};

/** A full web page (strips) shown in the screen at scroll offset (css px), optional zoom about screen centre. */
export const PageLayer: React.FC<{ page: string; scrollY?: number; opacity?: number; bright?: number; z?: number; dx?: number }> = ({ page, scrollY = 0, opacity = 1, bright = 1, z = 0, dx = 0 }) => {
  const m = PAGES[page];
  if (!m) return null;
  const strips = [];
  for (let i = 0; i < m.count; i++) {
    const y0 = i * m.chunk, h = Math.min(m.chunk, m.height - y0);
    strips.push(<Strip key={i} src={`strips/${page}-${i}.webp`} y0={y0} h={h} scrollY={scrollY} opacity={opacity} bright={bright} z={z} />);
  }
  return <group position={[dx, 0, 0]}>{strips}</group>;
};

/** Single static image (e.g. logo screen) */
export const ImageLayer: React.FC<{ src: string; opacity?: number; bright?: number; z?: number }> = (p) =>
  p.opacity !== undefined && p.opacity <= 0.001 ? null : <ImageInner {...p} />;
const ImageInner: React.FC<{ src: string; opacity?: number; bright?: number; z?: number }> = ({ src, opacity = 1, bright = 1, z = 0 }) => {
  const tex = useTex(src);
  if (!tex) return null;
  return (
    <mesh position={[0, 0, z]} renderOrder={2}>
      <planeGeometry args={[SCREEN_W, SCREEN_H]} />
      <meshBasicMaterial map={tex} toneMapped={false} transparent opacity={opacity} color={new THREE.Color(bright, bright, bright)} depthWrite={false} />
    </mesh>
  );
};

// ---------- overlays: cursor, click ripple, highlight ring ----------
const canvasTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
};
const W = (x: number) => (x / 1920) * SCREEN_W;
const WY = (y: number) => (0.5 - y / 1080) * SCREEN_H;
const WX = (x: number) => (x / 1920 - 0.5) * SCREEN_W;

export const Cursor: React.FC<{ x: number; y: number; opacity?: number; press?: number }> = ({ x, y, opacity = 1, press = 0 }) => {
  const tex = useMemo(() => canvasTex(256, 256, (g) => {
    g.translate(40, 24); g.scale(5.6, 5.6);
    g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 17); g.lineTo(4.2, 13.2); g.lineTo(7, 19.6); g.lineTo(9.6, 18.4); g.lineTo(6.9, 12.2); g.lineTo(12.4, 12); g.closePath();
    g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 14; g.fillStyle = '#fff'; g.fill(); g.shadowBlur = 0;
    g.lineWidth = 1.3; g.strokeStyle = '#0b0a1c'; g.stroke();
  }), []);
  const s = 90 * (1 - 0.1 * press);
  return (
    <mesh position={[WX(x) + W(s) * 0.5 - W(s) * 0.15, WY(y) - W(s) * 0.5 + W(s) * 0.09, 0.004]} renderOrder={5}>
      <planeGeometry args={[W(s), W(s)]} />
      <meshBasicMaterial map={tex} transparent opacity={opacity} toneMapped={false} depthWrite={false} />
    </mesh>
  );
};

export const Ripple: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => {
  const tex = useMemo(() => canvasTex(256, 256, (g) => { g.lineWidth = 10; g.strokeStyle = '#ffffff'; g.beginPath(); g.arc(128, 128, 100, 0, Math.PI * 2); g.stroke(); }), []);
  if (t <= 0 || t >= 1) return null;
  const s = 30 + 110 * (1 - Math.pow(1 - t, 3));
  return (
    <mesh position={[WX(x), WY(y), 0.0035]} renderOrder={4}>
      <planeGeometry args={[W(s), W(s)]} />
      <meshBasicMaterial map={tex} transparent opacity={0.8 * (1 - t)} toneMapped={false} depthWrite={false} />
    </mesh>
  );
};

export const Ring: React.FC<{ x: number; y: number; w: number; h: number; opacity: number; color?: string }> = ({ x, y, w, h, opacity, color = '#5a6cff' }) => {
  const tex = useMemo(() => canvasTex(1024, Math.max(64, Math.round(1024 * h / w)), (g) => {
    const cw = g.canvas.width, ch = g.canvas.height, r = 36, m = 8;
    g.strokeStyle = color; g.lineWidth = 8; g.shadowColor = color; g.shadowBlur = 22;
    g.beginPath(); g.roundRect(m + 12, m + 12, cw - 2 * m - 24, ch - 2 * m - 24, r); g.stroke();
  }), [w, h, color]);
  if (opacity <= 0.001) return null;
  const pad = 24;
  return (
    <mesh position={[WX(x + w / 2), WY(y + h / 2), 0.003]} renderOrder={4}>
      <planeGeometry args={[W(w + pad), (((h + pad) / 1080) * SCREEN_H)]} />
      <meshBasicMaterial map={tex} transparent opacity={opacity} toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  );
};
