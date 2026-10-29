"use client";

import { useEffect, useRef, useState } from "react";
import type { WorldId } from "@/lib/market-worlds";
import { getTownText, getSkipText } from "@/i18n/market-world";
import { getMarketText } from "@/i18n/market";
import { runPirate, runSpace, type Handle, type Pt } from "@/lib/market-cinema";
import { sfx, sfxEnabled, setSfxEnabled } from "@/lib/market-sfx";
import type { Locale } from "@/i18n/config";
import town from "./mesto-scena.json";
import nastup from "./pristav-nastup.json";

// Městečko jako vstupní brána obchodu: kulisy jsou z úvodní stránky (public/home/mesto). Klik na schody nebo raketu
// spustí filmový přechod (src/lib/market-cinema.ts): odlet rakety na vesmírnou stanici, nebo nástup na pirátskou loď.
// Úvodní TownLife se nemění.

const SCENE_W = 2000;
const SCENE_H = 900;
const SKY = 200;
const BOX_H = SCENE_H + SKY;
const FIG = 0.06;
type P = [number, number];
const Y = (y: number) => (SKY + y * SCENE_H) / BOX_H;
const at = (p: P) => ({ left: `${p[0] * 100}%`, top: `${Y(p[1]) * 100}%` });
const toBox = (p: Pt): Pt => [p[0], Y(p[1])];

type Spr = { f: string; n: number; o: number; tz: number; dur: number };
const SPR = {
  knihovnice: { f: "knihovnice", n: 24, o: 1.7, tz: 0.62, dur: 2.6 },
  pekar: { f: "pekar", n: 24, o: 1.9, tz: 0.62, dur: 2.0 },
  kluk: { f: "kluk", n: 24, o: 1.7, tz: 0.55, dur: 1.6 },
  kocka: { f: "kocka", n: 24, o: 1.2, tz: 0.27, dur: 6 },
} satisfies Record<string, Spr>;
type SK = keyof typeof SPR;

const FOLK: { k: SK; p: P }[] = [
  { k: "knihovnice", p: [0.24063, 0.66533] },
  { k: "pekar", p: [0.41563, 0.65924] },
  { k: "kluk", p: [0.27813, 0.74448] },
  { k: "kocka", p: [0.65, 0.82715] },
];
const START: P = [0.52812, 0.69];
const STAIRS: P = [0.07, 0.775];
const ROCKET: P = [0.575, 0.885];
const ROAD = town.road as P[];

function Sprite({ k, p, delay = 0 }: { k: SK; p: P; delay?: number }) {
  const s = SPR[k];
  return (
    <div aria-hidden className="pointer-events-none absolute" style={{ ...at(p), width: `${(s.o / 1.6) * FIG * 100}%`, aspectRatio: "1 / 1", transform: `translate(-50%, ${-(0.5 + s.tz / s.o) * 100}%)` }}>
      <span className="town-sprite block h-full w-full" style={{ backgroundImage: `url(/home/mesto/${s.f}.webp)`, ["--n" as string]: s.n, animationDuration: `${s.dur}s`, animationDelay: `${-delay}s` }} />
    </div>
  );
}

export function MarketTown({ locale, unlocked, onEnter }: { locale: Locale; unlocked: (id: WorldId) => boolean; onEnter: (id: WorldId, cinematic?: boolean) => void }) {
  const tt = getTownText(locale);
  const st = getSkipText(locale);
  const m = getMarketText(locale);
  const [phase, setPhase] = useState<"space" | "pirate" | null>(null);
  const [talk, setTalk] = useState<{ k: string; text: string } | null>(null);
  const [sound, setSound] = useState(true);
  const seq = useRef(0);
  const handle = useRef<Handle | null>(null);
  const enter = useRef(onEnter);
  const box = useRef<HTMLDivElement>(null);
  const cam = useRef<HTMLDivElement>(null);
  const sky = useRef<HTMLDivElement>(null);
  const bgDark = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const hero = useRef<HTMLDivElement>(null);
  const heroSpr = useRef<HTMLSpanElement>(null);
  const rocket = useRef<HTMLDivElement>(null);
  const bars = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLDivElement>(null);

  useEffect(() => {
    enter.current = onEnter;
  });
  useEffect(() => {
    const id = window.setTimeout(() => setSound(sfxEnabled()), 0);
    return () => window.clearTimeout(id);
  }, []);
  useEffect(() => {
    if (!phase) return;
    const r = { box: box.current, cam: cam.current, sky: sky.current, bgDark: bgDark.current, cv: cv.current, hero: hero.current, heroSpr: heroSpr.current, rocket: rocket.current, bars: bars.current, count: count.current };
    if (!r.box || !r.cam || !r.sky || !r.bgDark || !r.cv || !r.hero || !r.heroSpr || !r.rocket || !r.bars || !r.count) return;
    const refs = r as Parameters<typeof runSpace>[0];
    const geo = { toBox, rocket: ROCKET, start: START, road: ROAD, fig: FIG };
    const done = () => enter.current(phase === "space" ? "space" : "pirate", true);
    handle.current = phase === "space" ? runSpace(refs, geo, done) : runPirate(refs, geo, nastup as unknown as Parameters<typeof runPirate>[2], done);
    return () => handle.current?.stop();
  }, [phase]);

  function go(id: WorldId) {
    if (phase) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !unlocked(id) || (id !== "space" && id !== "pirate")) {
      onEnter(id);
      return;
    }
    setTalk(null);
    setPhase(id === "space" ? "space" : "pirate");
  }
  function chat(k: SK) {
    const lines = tt.talk[k].lines;
    setTalk({ k, text: lines[++seq.current % lines.length] });
    sfx.pop();
    window.setTimeout(() => setTalk((c) => (c?.k === k ? null : c)), 2800);
  }
  function toggleSound() {
    const next = !sound;
    setSound(next);
    setSfxEnabled(next);
  }

  const labelCls = "pointer-events-none absolute z-[3] -translate-x-1/2 whitespace-nowrap rounded-md border-2 border-[#16132b] bg-[#3a2a1a] px-2 py-0.5 text-[10px] font-extrabold text-[#ffd76b] shadow-[0_2px_0_rgba(0,0,0,0.4)] sm:text-xs";
  return (
    <div className="overflow-x-auto rounded-3xl border-2 border-[var(--edge)] shadow-[0_6px_0_var(--shadow-ink)]">
      <div ref={box} className="relative select-none overflow-hidden" style={{ aspectRatio: `${SCENE_W} / ${BOX_H}`, minWidth: 880, background: "linear-gradient(180deg, #5cb4ff, #cfeaff)" }}>
        {phase && <div ref={bgDark} aria-hidden className="absolute inset-0 opacity-0" style={{ background: "linear-gradient(180deg, #02030c 0%, #071040 55%, #1b3a8a 100%)" }} />}
        <div ref={cam} className={`town-day absolute inset-0 ${phase ? "pointer-events-none" : ""}`}>
          <div ref={sky} aria-hidden className="town-sky absolute inset-0" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/home/mesto/scena.webp" alt="" draggable={false} className="pointer-events-none absolute bottom-0 left-0 w-full" />
          {/* raketa na louce */}
          <div ref={rocket} aria-hidden className="pointer-events-none absolute" style={{ ...at(ROCKET), width: "15%", aspectRatio: "640 / 384", transform: "translate(-50%, -62%)" }}>
            <span className="town-sprite block h-full w-full" style={{ backgroundImage: "url(/home/kosmicka/raketa.webp)", ["--n" as string]: 12, animationDuration: "3s" }} />
          </div>
          {FOLK.map((f, i) => (
            <Sprite key={f.k} k={f.k} p={f.p} delay={i * 0.7} />
          ))}
          {/* hrdina */}
          <div ref={hero} className="pointer-events-none absolute" style={{ ...at(START), width: `${FIG * 100}%`, aspectRatio: "1 / 1", transform: `translate(-50%, ${-(0.5 + 0.55 / 1.6) * 100}%)` }}>
            <span ref={heroSpr} aria-hidden className="town-sprite block h-full w-full" style={{ ["--n" as string]: 24, backgroundImage: "url(/home/mesto/hrdina-stoji.webp)", animationDuration: "3s" }} />
          </div>
          {/* cedule míst */}
          <div className={labelCls} style={{ ...at([STAIRS[0] + 0.04, STAIRS[1] - 0.17]) }}>
            ⚓ {m.worlds.pirate}
          </div>
          <div className={labelCls} style={{ ...at([ROCKET[0], ROCKET[1] - 0.2]) }}>
            🚀 {m.worlds.space}
            {!unlocked("space") && <span className="ml-1 text-white/80">🔒</span>}
          </div>
          {talk && (() => {
            const f = FOLK.find((c) => c.k === talk.k);
            if (!f) return null;
            return (
              <div className="pointer-events-none absolute z-[7] max-w-[12rem] -translate-x-1/2 -translate-y-full rounded-2xl border-2 border-[var(--edge)] bg-[var(--surface)] px-3 py-1 text-center text-xs font-extrabold" style={{ ...at([f.p[0], f.p[1] - 0.14]) }}>
                {talk.text}
              </div>
            );
          })()}
          {/* klikací místa */}
          <button type="button" aria-label={m.worlds.pirate} title={m.worlds.pirate} onClick={() => go("pirate")} className="market-hit absolute z-10 rounded-2xl" style={{ left: "1.5%", top: `${Y(0.68) * 100}%`, width: "11%", height: "17%" }} />
          <button type="button" aria-label={tt.sheet} title={tt.sheet} onClick={() => go("space")} className="market-hit absolute z-10 rounded-2xl" style={{ left: `${ROCKET[0] * 100 - 7}%`, top: `${Y(ROCKET[1]) * 100 - 15}%`, width: "14%", height: "17%" }} />
          {FOLK.map((f) => (
            <button key={f.k} type="button" aria-label={tt.talk[f.k].label} title={tt.talk[f.k].label} onClick={() => chat(f.k)} className="market-hit absolute z-10 rounded-full" style={{ left: `${f.p[0] * 100 - 3}%`, top: `${Y(f.p[1]) * 100 - 9}%`, width: "6%", height: "10%" }} />
          ))}
        </div>

        {phase && (
          <>
            <canvas ref={cv} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />
            <div aria-hidden className="market-vignette pointer-events-none absolute inset-0" />
            <div ref={bars} aria-hidden className="pointer-events-none absolute inset-0 z-20">
              <div className="absolute left-0 right-0 top-0 bg-black" style={{ height: 0 }} />
              <div className="absolute bottom-0 left-0 right-0 bg-black" style={{ height: 0 }} />
            </div>
            <div ref={count} aria-hidden className="market-count" />
            <button type="button" onClick={() => handle.current?.skip()} className="btn-bouncy absolute bottom-3 right-3 z-30 bg-[var(--surface)] px-3 py-1.5 text-sm font-bold">
              ⏭ {st.skip}
            </button>
          </>
        )}
        <button type="button" onClick={toggleSound} aria-pressed={sound} title={sound ? st.soundOn : st.soundOff} className="absolute right-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--edge)] bg-[var(--surface)] text-xl shadow-[0_3px_0_var(--shadow-ink)] transition-transform hover:scale-110">
          <span aria-hidden>{sound ? "🔊" : "🔇"}</span>
          <span className="sr-only">{sound ? st.soundOn : st.soundOff}</span>
        </button>
      </div>
    </div>
  );
}
