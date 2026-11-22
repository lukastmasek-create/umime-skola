import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { CSSProperties, ReactNode } from "react";
import { BODY, HAND, HEADING } from "./fonts";
import { C } from "./theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ease = Easing.bezier(0.16, 1, 0.3, 1);

// Rozložení pro 16:9 i svislé 9:16 (Reels).
export const useLayout = () => {
  const { width, height } = useVideoConfig();
  const v = height > width;
  return { w: width, h: height, v, panel: v ? 940 : 1000, title: v ? 96 : 110, gap: v ? 56 : 44 };
};

// Společný rámec scény: nadpis nahoře, obsah uprostřed.
export const Stage = ({ title, children }: { title: ReactNode; children: ReactNode }) => {
  const { v, gap, w } = useLayout();
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap, padding: v ? "0 50px" : 0, boxSizing: "border-box" }}>
      <div style={{ maxWidth: w - 100 }}>{title}</div>
      {children}
    </AbsoluteFill>
  );
};

// Pozadí: temná záře + pulzující kruhy + jiskry (inspirace pokoj_final.mp4).
export const Bg = () => {
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const big = Math.max(W, H) / 1920;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill
        style={{ background: "radial-gradient(ellipse at 50% 45%, #272158 0%, #12102a 60%, #0b0a1c 100%)" }}
      />
      {[0, 1, 2, 3].map((i) => {
        const t = ((f + i * 45) % 180) / 180;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: "46%",
              width: (500 + t * 1500) * big,
              height: (500 + t * 1500) * big,
              marginLeft: -(250 + t * 750) * big,
              marginTop: -(250 + t * 750) * big,
              borderRadius: "50%",
              border: `2px solid rgba(120,140,255,${0.16 * (1 - t)})`,
            }}
          />
        );
      })}
      {Array.from({ length: 28 }).map((_, i) => {
        const x = (i * 677) % W;
        const y = ((i * 331 + f * (0.3 + (i % 5) * 0.12)) % (H + 120)) - 60;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: H - (y % H),
              width: 4 + (i % 3) * 2,
              height: 4 + (i % 3) * 2,
              borderRadius: "50%",
              background: i % 2 ? C.yellow : C.blue,
              opacity: 0.25,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Neonový nadpis.
export const Neon = ({
  children,
  color = "#bfe4ff",
  glow = C.blue,
  size = 120,
  delay = 0,
  style,
}: {
  children: ReactNode;
  color?: string;
  glow?: string;
  size?: number;
  delay?: number;
  style?: CSSProperties;
}) => {
  const f = useCurrentFrame() - delay;
  const t = interpolate(f, [0, 22], [0, 1], { easing: ease, ...clamp });
  return (
    <div
      style={{
        fontFamily: HAND,
        fontSize: size,
        color,
        textAlign: "center",
        lineHeight: 1.05,
        opacity: t,
        transform: `translateY(${(1 - t) * 50}px) scale(${0.9 + 0.1 * t})`,
        filter: `blur(${(1 - t) * 14}px)`,
        textShadow: `0 0 8px ${glow}, 0 0 28px ${glow}, 0 0 60px ${glow}88`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Skleněný panel s tečkami okna a běžící zelenou hranou.
export const Glass = ({
  children,
  width,
  height,
  style,
}: {
  children: ReactNode;
  width: number;
  height: number;
  style?: CSSProperties;
}) => {
  const f = useCurrentFrame();
  const sweep = (f * 9) % 400 - 100;
  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        borderRadius: 30,
        background: "linear-gradient(160deg, rgba(60,56,110,0.75), rgba(26,24,60,0.85))",
        border: "2px solid rgba(110,130,255,0.35)",
        boxShadow: "0 40px 90px rgba(0,0,0,0.55), 0 0 60px rgba(60,90,255,0.18)",
        overflow: "hidden",
        ...style,
      }}
    >
      <div style={{ position: "absolute", left: 26, top: 20, display: "flex", gap: 9 }}>
        {[C.coral, C.yellow, C.green].map((c) => (
          <div key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c }} />
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          left: `${sweep}%`,
          top: 0,
          width: "30%",
          height: 4,
          background: `linear-gradient(90deg, transparent, ${C.green}, transparent)`,
          boxShadow: `0 0 18px ${C.green}`,
        }}
      />
      {children}
    </div>
  );
};

// Světlá „toast“ karta s fajfkou.
export const Toast = ({ title, sub, delay = 0 }: { title: string; sub: string; delay?: number }) => {
  const f = useCurrentFrame() - delay;
  const t = interpolate(f, [0, 20], [0, 1], { easing: Easing.out(Easing.back(1.8)), ...clamp });
  const check = interpolate(f, [10, 24], [0, 1], clamp);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 40,
        maxWidth: 940,
        padding: "26px 36px",
        borderRadius: 22,
        background: C.paper,
        color: C.ink,
        fontFamily: BODY,
        boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        opacity: t,
        transform: `translateY(${(1 - t) * 90}px) scale(${0.92 + 0.08 * t})`,
      }}
    >
      <div>
        <div style={{ fontWeight: 700, fontSize: 40 }}>{title}</div>
        <div style={{ fontWeight: 700, fontSize: 30, color: C.green }}>{sub}</div>
      </div>
      <svg width="70" height="70" viewBox="0 0 70 70" style={{ transform: `scale(${check})` }}>
        <circle cx="35" cy="35" r="33" fill={C.green} />
        <path d="M19 36l11 11 22-24" stroke="#fff" strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

// Přechod scén: vlet a odlet s náklonem a rozmazáním.
export const Fly = ({ dur, children, tilt = true, last = false }: { dur: number; children: ReactNode; tilt?: boolean; last?: boolean }) => {
  const f = useCurrentFrame();
  const inn = interpolate(f, [0, 16], [0, 1], { easing: ease, ...clamp });
  const out = last ? 0 : interpolate(f, [dur - 14, dur], [0, 1], { easing: Easing.in(Easing.cubic), ...clamp });
  const a = 1 - inn + out;
  return (
    <AbsoluteFill
      style={{
        opacity: 1 - a * 0.9,
        filter: `blur(${a * 22}px)`,
        transform: tilt
          ? `perspective(1800px) translateY(${(1 - inn) * 120 - out * 160}px) rotateX(${(1 - inn) * 18 + out * -14}deg) rotateY(${(1 - inn) * -10 + out * 10}deg) scale(${1 - a * 0.1})`
          : `scale(${1 + out * 0.15})`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export { HEADING };
