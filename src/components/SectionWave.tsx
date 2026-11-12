"use client";

import { useEffect, useState } from "react";

// Přechod mezi sekcemi úvodní stránky. Vrstvy zespodu nahoru (vše leží POD obsahem sekce, z-index: -1):
// 1) barevné prolnutí: spodní část sekce se plynule mění na barvu další sekce,
// 2) tři vlny různé rychlosti a výšky; tvar se morfuje (SMIL animace d), přední je vyplněná barvou další sekce,
// 3) světelný paprsek přejíždí přes hranu,
// 4) SVG jiskry a hvězdičky plující přes hranu.
// Morfování se vypne při reduced-motion nebo přepínači Animace (data-motion="off").

const W = 2880;
const H = 160;
const STEP = 24;

// Periody 720 a 360 dělí polovinu šířky (1440), proto smyčka posunu navazuje bez skoku.
function buildPaths(base: number, amp: number, amp2: number, phase: number) {
  const pts: string[] = [];
  for (let x = 0; x <= W; x += STEP) {
    const y = base + amp * Math.sin((x / 720) * 2 * Math.PI + phase) + amp2 * Math.sin((x / 360) * 2 * Math.PI + phase * 0.6 + 1);
    pts.push(`${x === 0 ? "M" : "L"}${x} ${y.toFixed(1)}`);
  }
  const line = pts.join(" ");
  return { line, fill: `${line} L${W} ${H} L0 ${H} Z` };
}

// Dva tvary se stejným počtem bodů: SMIL animace d mezi nimi dává plynulé morfování.
const BACK_A = buildPaths(80, 36, 12, 2.4);
const BACK_B = buildPaths(90, 26, 16, 4.1);
const MID_A = buildPaths(96, 30, 10, 1.3);
const MID_B = buildPaths(88, 22, 14, 3.6);
const FRONT_A = buildPaths(104, 26, 9, 0);
const FRONT_B = buildPaths(98, 30, 7, 2.2);

const SPARKS = [
  { left: "8%", top: "14%", size: 22, d: "17s", delay: "-3s", c: "glow" },
  { left: "27%", top: "34%", size: 12, d: "23s", delay: "-11s", c: "white" },
  { left: "44%", top: "8%", size: 18, d: "14s", delay: "-6s", c: "white" },
  { left: "61%", top: "30%", size: 28, d: "19s", delay: "-7s", c: "glow" },
  { left: "79%", top: "12%", size: 14, d: "21s", delay: "-14s", c: "white" },
  { left: "92%", top: "40%", size: 20, d: "27s", delay: "-15s", c: "glow" },
] as const;

function Spark({ size, color }: { size: number; color: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" fill={color} />
    </svg>
  );
}

function useMorph(): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const check = () => setOn(!mq.matches && document.documentElement.getAttribute("data-motion") !== "off");
    check();
    mq.addEventListener("change", check);
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-motion"] });
    return () => {
      mq.removeEventListener("change", check);
      obs.disconnect();
    };
  }, []);
  return on;
}

function Morph({ on, a, b, dur, begin = "0s" }: { on: boolean; a: string; b: string; dur: string; begin?: string }) {
  if (!on) return null;
  return <animate attributeName="d" values={`${a};${b};${a}`} dur={dur} begin={begin} repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1 0.45 0 0.55 1" />;
}

export function SectionWave({ fill, glow = "#8ea2ff", className = "" }: { fill: string; glow?: string; className?: string }) {
  const morph = useMorph();
  return (
    <div aria-hidden className={`section-blend ${className}`} style={{ ["--sb-fill" as string]: fill, ["--sb-glow" as string]: glow }}>
      <div className="section-wave">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="section-wave-drift section-wave-back">
          <path d={BACK_A.fill} fill={glow} fillOpacity={0.08}>
            <Morph on={morph} a={BACK_A.fill} b={BACK_B.fill} dur="13s" />
          </path>
          <path d={BACK_A.line} fill="none" stroke={glow} strokeOpacity={0.55} strokeWidth={2} vectorEffect="non-scaling-stroke" className="section-wave-line">
            <Morph on={morph} a={BACK_A.line} b={BACK_B.line} dur="13s" />
          </path>
        </svg>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="section-wave-drift section-wave-mid">
          <path d={MID_A.fill} fill={glow} fillOpacity={0.14}>
            <Morph on={morph} a={MID_A.fill} b={MID_B.fill} dur="9s" begin="-3s" />
          </path>
          <path d={MID_A.line} fill="none" stroke={glow} strokeOpacity={0.7} strokeWidth={1.5} vectorEffect="non-scaling-stroke" className="section-wave-line">
            <Morph on={morph} a={MID_A.line} b={MID_B.line} dur="9s" begin="-3s" />
          </path>
        </svg>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="section-wave-drift section-wave-front">
          <path d={FRONT_A.fill} fill={fill}>
            <Morph on={morph} a={FRONT_A.fill} b={FRONT_B.fill} dur="7s" />
          </path>
          <path d={FRONT_A.line} fill="none" stroke={glow} strokeWidth={2.5} vectorEffect="non-scaling-stroke" className="section-wave-line">
            <Morph on={morph} a={FRONT_A.line} b={FRONT_B.line} dur="7s" />
          </path>
        </svg>
      </div>
      <span className="section-sweep" />
      {SPARKS.map((s, i) => (
        <span key={i} className="section-spark" style={{ left: s.left, top: s.top, ["--sd" as string]: s.d, ["--sdl" as string]: s.delay }}>
          <Spark size={s.size} color={s.c === "glow" ? glow : "#ffffff"} />
        </span>
      ))}
    </div>
  );
}
