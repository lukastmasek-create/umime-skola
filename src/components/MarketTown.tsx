"use client";

import { useEffect, useRef, useState } from "react";
import type { WorldId } from "@/lib/market-worlds";
import { getTownText } from "@/i18n/market-world";
import { getMarketText } from "@/i18n/market";
import type { Locale } from "@/i18n/config";

// Městečko jako vstupní brána obchodu: kulisy jsou z úvodní stránky (public/home/mesto), hrdina dojde ke schodům do
// pirátského přístavu nebo k raketě na vesmírnou stanici a pak se otevře vybraný svět. Úvodní TownLife se nemění.

const SCENE_W = 2000;
const SCENE_H = 900;
const SKY = 200;
const BOX_H = SCENE_H + SKY;
const FIG = 0.06;
type P = [number, number];
const Y = (y: number) => (SKY + y * SCENE_H) / BOX_H;
const at = (p: P) => ({ left: `${p[0] * 100}%`, top: `${Y(p[1]) * 100}%` });

type Spr = { f: string; n: number; o: number; tz: number; dur: number };
const SPR = {
  hero_walk: { f: "hrdina-chuze", n: 16, o: 1.6, tz: 0.55, dur: 0.9 },
  hero_idle: { f: "hrdina-stoji", n: 24, o: 1.6, tz: 0.55, dur: 3 },
  knihovnice: { f: "knihovnice", n: 24, o: 1.7, tz: 0.62, dur: 2.6 },
  pekar: { f: "pekar", n: 24, o: 1.9, tz: 0.62, dur: 2.0 },
  kluk: { f: "kluk", n: 24, o: 1.7, tz: 0.55, dur: 1.6 },
  kocka: { f: "kocka", n: 24, o: 1.2, tz: 0.27, dur: 6 },
} satisfies Record<string, Spr>;
type SK = keyof typeof SPR;

const FOLK: { k: Exclude<SK, "hero_walk" | "hero_idle">; p: P }[] = [
  { k: "knihovnice", p: [0.24063, 0.66533] },
  { k: "pekar", p: [0.41563, 0.65924] },
  { k: "kluk", p: [0.27813, 0.74448] },
  { k: "kocka", p: [0.65, 0.82715] },
];
const START: P = [0.52812, 0.69];
const STAIRS: P = [0.07, 0.775];
const ROCKET: P = [0.575, 0.935];

function Sprite({ k, p, flip = false, delay = 0, scale = 1, style }: { k: SK; p: P; flip?: boolean; delay?: number; scale?: number; style?: React.CSSProperties }) {
  const s = SPR[k];
  return (
    <div aria-hidden className="pointer-events-none absolute" style={{ ...at(p), width: `${(s.o / 1.6) * FIG * 100 * scale}%`, aspectRatio: "1 / 1", transform: `translate(-50%, ${-(0.5 + s.tz / s.o) * 100}%) scaleX(${flip ? -1 : 1})`, ...style }}>
      <span className="town-sprite block h-full w-full" style={{ backgroundImage: `url(/home/mesto/${s.f}.webp)`, ["--n" as string]: s.n, animationDuration: `${s.dur}s`, animationDelay: `${-delay}s` }} />
    </div>
  );
}

export function MarketTown({ locale, unlocked, onEnter }: { locale: Locale; unlocked: (id: WorldId) => boolean; onEnter: (id: WorldId) => void }) {
  const tt = getTownText(locale);
  const m = getMarketText(locale);
  const [hero, setHero] = useState<{ p: P; walking: boolean; flip: boolean }>({ p: START, walking: false, flip: false });
  const [talk, setTalk] = useState<{ k: string; text: string } | null>(null);
  const seq = useRef(0);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  function go(id: WorldId, target: P) {
    if (hero.walking) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lockedWorld = !unlocked(id);
    if (reduced || lockedWorld) {
      onEnter(id);
      return;
    }
    setTalk(null);
    setHero({ p: target, walking: true, flip: target[0] < hero.p[0] });
    timer.current = window.setTimeout(() => {
      onEnter(id);
      setHero({ p: START, walking: false, flip: false });
    }, 1500);
  }
  function chat(k: (typeof FOLK)[number]["k"]) {
    const lines = tt.talk[k].lines;
    setTalk({ k, text: lines[++seq.current % lines.length] });
    window.setTimeout(() => setTalk((c) => (c?.k === k ? null : c)), 2800);
  }

  const labelCls = "pointer-events-none absolute z-[3] -translate-x-1/2 whitespace-nowrap rounded-md border-2 border-[#16132b] bg-[#3a2a1a] px-2 py-0.5 text-[10px] font-extrabold text-[#ffd76b] shadow-[0_2px_0_rgba(0,0,0,0.4)] sm:text-xs";
  return (
    <div className="overflow-x-auto rounded-3xl border-2 border-[var(--edge)] shadow-[0_6px_0_var(--shadow-ink)]">
      <div className="town-day relative select-none overflow-hidden" style={{ aspectRatio: `${SCENE_W} / ${BOX_H}`, minWidth: 880 }}>
        <div aria-hidden className="town-sky absolute inset-0" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/home/mesto/scena.webp" alt="" draggable={false} className="pointer-events-none absolute bottom-0 left-0 w-full" />
        {/* raketa na louce */}
        <div aria-hidden className="pointer-events-none absolute" style={{ ...at(ROCKET), width: "15%", aspectRatio: "640 / 384", transform: "translate(-50%, -62%)" }}>
          <span className="town-sprite block h-full w-full" style={{ backgroundImage: "url(/home/kosmicka/raketa.webp)", ["--n" as string]: 12, animationDuration: "3s" }} />
        </div>
        {FOLK.map((f, i) => (
          <Sprite key={f.k} k={f.k} p={f.p} delay={i * 0.7} />
        ))}
        {/* hrdina */}
        <div className="pointer-events-none absolute" style={{ ...at(hero.p), width: `${FIG * 100}%`, aspectRatio: "1 / 1", transform: `translate(-50%, ${-(0.5 + 0.55 / 1.6) * 100}%) scaleX(${hero.flip ? -1 : 1})`, transition: hero.walking ? "left 1.4s linear, top 1.4s linear" : "none" }}>
          <span aria-hidden className="town-sprite block h-full w-full" style={{ ["--n" as string]: hero.walking ? 16 : 24, backgroundImage: `url(/home/mesto/${hero.walking ? "hrdina-chuze" : "hrdina-stoji"}.webp)`, animationDuration: hero.walking ? "0.9s" : "3s" }} />
        </div>
        {/* cedule míst */}
        <div className={labelCls} style={{ ...at([STAIRS[0] + 0.04, STAIRS[1] - 0.17]) }}>
          ⚓ {m.worlds.pirate}
        </div>
        <div className={labelCls} style={{ ...at([ROCKET[0], ROCKET[1] - 0.17]) }}>
          🚀 {m.worlds.space}
          {!unlocked("space") && <span className="ml-1 text-white/80">🔒</span>}
        </div>
        {hero.walking && <div className="pointer-events-none absolute left-1/2 top-3 z-[4] -translate-x-1/2 rounded-full border-2 border-[var(--edge)] bg-[var(--surface)] px-3 py-1 text-sm font-bold">{tt.walking}</div>}
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
        <button type="button" aria-label={m.worlds.pirate} title={m.worlds.pirate} onClick={() => go("pirate", [STAIRS[0] + 0.01, STAIRS[1] + 0.03])} className="market-hit absolute z-10 rounded-2xl" style={{ left: "1.5%", top: `${Y(0.68) * 100}%`, width: "11%", height: "17%" }} />
        <button type="button" aria-label={tt.sheet} title={tt.sheet} onClick={() => go("space", [ROCKET[0], ROCKET[1] + 0.02])} className="market-hit absolute z-10 rounded-2xl" style={{ left: `${ROCKET[0] * 100 - 7}%`, top: `${Y(ROCKET[1]) * 100 - 15}%`, width: "14%", height: "17%" }} />
        {FOLK.map((f) => (
          <button key={f.k} type="button" aria-label={tt.talk[f.k].label} title={tt.talk[f.k].label} onClick={() => chat(f.k)} className="market-hit absolute z-10 rounded-full" style={{ left: `${f.p[0] * 100 - 3}%`, top: `${Y(f.p[1]) * 100 - 9}%`, width: "6%", height: "10%" }} />
        ))}
      </div>
    </div>
  );
}
