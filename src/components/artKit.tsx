import type { ReactNode } from "react";

// Sdílené stavební prvky SVG ilustrací (žáci i učitelé).
// Animace řídí třídy v globals.css: sv-pop (vjezd), sv-float / sv-spin (hover), sv-idle (vznášení).
export const A = "var(--ga)";
export const S = "rgba(246,241,228,0.55)"; // obrys
export const SOFT = "rgba(246,241,228,0.30)"; // jemné čáry
export const F = "rgba(255,255,255,0.12)"; // výplň
export const HI = "rgba(255,255,255,0.38)"; // odlesk
export const SH = "rgba(0,0,0,0.24)"; // stín
export const PAPER = "#f6f1e4";
export const INK = "#0b0b0f";

export function Pop({ d, float, spin, children }: { d: number; float?: boolean; spin?: boolean; children: ReactNode }) {
  return (
    <g className={`sv-pop${float ? " sv-float" : ""}${spin ? " sv-spin" : ""}`} style={{ ["--d" as string]: d }}>
      {children}
    </g>
  );
}

// Třpytky jsme z ilustrací vyřadili (působily strojově); komponenta zůstala, ať se nemusí měnit scény.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function Sparkle(_props: { x: number; y: number; s?: number; d: number }) {
  return null;
}

// Ruční vystřižený okraj: tvary se jemně rozvlní a dostanou tmavý obrys (stejně jako u karet kategorií).
export function ArtRough() {
  return (
    <filter id="sv-rough" x="-4%" y="-6%" width="108%" height="112%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="5" result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="2.4" xChannelSelector="R" yChannelSelector="G" result="d" />
      <feMorphology in="d" operator="dilate" radius="1.25" result="o" />
      <feFlood floodColor="#14132a" />
      <feComposite in2="o" operator="in" result="ink" />
      <feMerge>
        <feMergeNode in="ink" />
        <feMergeNode in="d" />
      </feMerge>
    </filter>
  );
}

// Stín pod předmětem
export function Ground({ cx = 150, cy = 130, rx = 70 }: { cx?: number; cy?: number; rx?: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry="5" fill={SH} />;
}

// Hlava s rameny (jednoduchý avatar)
export function Person({ x, y, r = 11, fill = A, ink = INK }: { x: number; y: number; r?: number; fill?: string; ink?: string }) {
  return (
    <>
      <circle cx={x} cy={y} r={r} fill={fill} />
      <path d={`M${x - r * 1.6} ${y + r * 2.4} a${r * 1.6} ${r * 1.3} 0 0 1 ${r * 3.2} 0z`} fill={fill} />
      <circle cx={x - r * 0.35} cy={y - r * 0.1} r={r * 0.1} fill={ink} />
      <circle cx={x + r * 0.35} cy={y - r * 0.1} r={r * 0.1} fill={ink} />
    </>
  );
}

