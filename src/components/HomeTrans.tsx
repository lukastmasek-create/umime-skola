"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Critter, type CritterKind } from "@/components/HomePixelArt";
import { Sprite } from "@/components/HomePixelScene";
import { HangIcon } from "@/components/HangDecor";
import { HomeCountUp } from "@/components/HomeCountUp";
import type { HomeTransText } from "@/i18n/home-trans";

// Herní přechod mezi sekcemi úvodní stránky („level“):
// level banner s ukazatelem postupu, brána, která se při doscrollování rozjede, paralaxní hory,
// dither nahoře i dole, ticker, tip dne, počítadlo, kulisy, postavičky s bublinou a mince ke sbírání.
// Při vstupu do pohledu se brána rozjede, přechod krátce poskočí a blikne (jen když je pohyb povolený).
// Mince a zvuk sdílí stav s HomeCoinHud přes localStorage a událost „hp-store“.

type Icon = "star" | "check" | "bulb" | "flag" | "bolt" | "search" | "pulse";
type Scenery = "lamp" | "chest" | "sign" | "crystal";
export type TransCritter = { kind: CritterKind; dur: number; delay: number; left?: boolean };

const COLORS = ["#ffc933", "#ff8a6b", "#8fd0ff", "#7ee0b0"];
const COIN = [".yyy.", "yyhyy", "yhyyy", "yyyyy", ".yyy."];
const SCENERY: Record<Scenery, { rows: string[]; pal: Record<string, string> }> = {
  lamp: { rows: [".yyy.", ".yyy.", "..p..", "..p..", "..p..", "..p..", ".ppp."], pal: { y: "#ffd86b", p: "#2a2a3a" } },
  chest: { rows: ["bbbbbbb", "bwwwwwb", "bbbybbb", "bwwywwb", "bwwwwwb", "bbbbbbb"], pal: { b: "#4a2f1a", w: "#a8693a", y: "#ffd86b" } },
  sign: { rows: ["wwwwwww", "wkkkkkw", "wwwwwww", "...p...", "...p...", "...p..."], pal: { w: "#c98a4b", k: "#6b4226", p: "#6b4226" } },
  crystal: { rows: ["..h..", ".hcc.", "hhccd", "hccdd", ".cdd."], pal: { h: "#c9f2ff", c: "#5ab8ff", d: "#2f6fbf" } },
};

function motionOff() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.getAttribute("data-motion") === "off";
}

// Sdílený stav mincí a zvuku v localStorage; změny hlásí událost „hp-store“.
function readNum(key: string) {
  try {
    return Number(localStorage.getItem(key)) || 0;
  } catch {
    return 0;
  }
}
function write(key: string, v: string) {
  try {
    localStorage.setItem(key, v);
  } catch {
    /* bez úložiště */
  }
  window.dispatchEvent(new Event("hp-store"));
}
function subscribe(cb: () => void) {
  window.addEventListener("hp-store", cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener("hp-store", cb);
    window.removeEventListener("storage", cb);
  };
}
const noop = () => () => {};
const today = () => Math.floor(Date.now() / 86_400_000);

export function soundEnabled() {
  try {
    return localStorage.getItem("hp-sound") === "1";
  } catch {
    return false;
  }
}

let audio: AudioContext | null = null;
export function blip(kind: "coin" | "hello" | "level") {
  if (!soundEnabled()) return;
  try {
    audio ??= new AudioContext();
    const notes = kind === "coin" ? [988, 1319] : kind === "hello" ? [523, 659] : [392, 523, 659, 784];
    notes.forEach((f, i) => {
      const o = audio!.createOscillator();
      const g = audio!.createGain();
      o.type = "square";
      o.frequency.value = f;
      const t = audio!.currentTime + i * 0.07;
      g.gain.setValueAtTime(0.05, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
      o.connect(g).connect(audio!.destination);
      o.start(t);
      o.stop(t + 0.13);
    });
  } catch {
    /* zvuk není k dispozici */
  }
}

function ridge(seed: number, base: number, amp: number) {
  let d = `M0 64V${base}`;
  let y = base;
  for (let x = 0; x < 480; x += 8) {
    y = base + Math.round(Math.sin(x * 0.03 + seed) * amp + Math.sin(x * 0.011 + seed * 2) * amp * 0.6);
    d += `H${x}V${y}`;
  }
  return `${d}H480V64Z`;
}

export function HomeTrans({
  level,
  total,
  fill,
  label,
  icons,
  critters,
  scenery,
  stat,
  ticker,
  t,
}: {
  level: number;
  total: number;
  fill: string;
  label: string;
  icons: Icon[];
  critters: TransCritter[];
  scenery: { kind: Scenery; x: number }[];
  stat: { n: number; label: string };
  ticker: string[];
  t: HomeTransText;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const day = useSyncExternalStore(noop, today, () => 0);
  const tip = t.tips[(day + level) % t.tips.length];
  const [taken, setTaken] = useState<boolean[]>([false, false, false]);

  // brána, otřes a paralaxa
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const still = motionOff();
    let hit = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        setOpen(true);
        if (still) return;
        blip("level");
        // Dopad: otřese se jen přechod, ne celá stránka (přilepená navigace zůstane v klidu).
        hit = window.setTimeout(() => {
          el.classList.remove("is-hit");
          void el.offsetWidth;
          el.classList.add("is-hit");
        }, 520);
      },
      { threshold: 0.5, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
        el.style.setProperty("--p", Math.max(-1, Math.min(1, p)).toFixed(3));
      });
    };
    if (!still) {
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
    return () => {
      io.disconnect();
      window.clearTimeout(hit);
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  function take(i: number) {
    if (taken[i]) return;
    setTaken((s) => s.map((v, j) => (j === i ? true : v)));
    blip("coin");
    write("hp-coins", String(readNum("hp-coins") + 1));
  }

  const coinX = [18 + level * 7, 48 + level * 3, 78 - level * 4];

  return (
    <div
      ref={ref}
      className={`hp-trans${open ? " is-open" : ""}`}
      style={{ ["--tf" as string]: fill }}
      onPointerEnter={() => blip("hello")}
    >
      <span className="hp-trans-dither hp-trans-dither-top" aria-hidden />

      <div className="hp-trans-top">
        <div className="hp-trans-banner">
          <span className="hp-trans-lv">
            {t.level} {level}
          </span>
          <span className="hp-trans-label">▸ {label}</span>
          <span className="hp-trans-bar" aria-hidden>
            {Array.from({ length: total }, (_, i) => (
              <span key={i} className={i < level ? "on" : undefined} style={{ ["--i" as string]: i }} />
            ))}
          </span>
        </div>
        <div className="hp-trans-icons" aria-hidden>
          {icons.map((k, i) => (
            <span key={i} className="hp-trans-chip" style={{ ["--ac" as string]: COLORS[i % COLORS.length], ["--i" as string]: i }}>
              <HangIcon kind={k} size={16} />
            </span>
          ))}
        </div>
        <div className="hp-trans-stat">
          <HomeCountUp value={stat.n} delay={450} className="hp-trans-stat-n" />
          <span className="hp-trans-stat-l">{stat.label}</span>
        </div>
      </div>

      <p className="hp-trans-tip">
        <span className="hp-trans-tip-ic" aria-hidden>
          <HangIcon kind="bulb" size={14} />
        </span>
        <b>{t.tip}:</b> {tip}
      </p>

      <div className="hp-trans-ticker" aria-hidden>
        <div className="hp-trans-ticker-in">
          {[...ticker, ...ticker].map((s, i) => (
            <span key={i}>
              {s}
              <i>✦</i>
            </span>
          ))}
        </div>
      </div>

      <div className="hp-trans-scene" aria-hidden>
        <svg className="hp-trans-far" viewBox="0 0 480 64" preserveAspectRatio="none" shapeRendering="crispEdges">
          <path d={ridge(level, 30, 8)} fill="rgba(255,255,255,0.06)" />
        </svg>
        <svg className="hp-trans-mid" viewBox="0 0 480 64" preserveAspectRatio="none" shapeRendering="crispEdges">
          <path d={ridge(level * 3 + 1, 42, 5)} fill="rgba(0,0,0,0.25)" />
        </svg>
        <svg className="hp-trans-life" viewBox="0 0 480 64" preserveAspectRatio="xMidYMax slice" shapeRendering="crispEdges">
          {scenery.map((s, i) => {
            const sp = SCENERY[s.kind];
            return (
              <g key={i} transform={`translate(${s.x} ${53 - sp.rows.length * 2}) scale(2)`} className={s.kind === "lamp" ? "hp-trans-glow" : undefined}>
                <Sprite rows={sp.rows} pal={sp.pal} x={0} y={0} />
              </g>
            );
          })}
          {critters.map((c, i) => (
            <Critter key={i} kind={c.kind} y={53} dur={c.dur} delay={c.delay} left={c.left} />
          ))}
          <rect x="0" y="53" width="480" height="11" fill="rgba(0,0,0,0.35)" />
        </svg>
        <span className="hp-trans-bubble">{t.hello}</span>
      </div>

      {coinX.map((x, i) => (
        <button
          key={i}
          type="button"
          className={`hp-coin${taken[i] ? " is-taken" : ""}`}
          style={{ left: `${x}%`, ["--i" as string]: i }}
          aria-label={t.coinPick}
          tabIndex={taken[i] ? -1 : 0}
          onClick={() => take(i)}
        >
          <svg viewBox="0 0 5 5" shapeRendering="crispEdges" aria-hidden>
            <Sprite rows={COIN} pal={{ y: "#ffc933", h: "#fff3b0" }} x={0} y={0} />
          </svg>
        </button>
      ))}

      <span className="hp-gate hp-gate-l" aria-hidden />
      <span className="hp-gate hp-gate-r" aria-hidden />
      <span className="hp-gate-plate" aria-hidden>
        {t.level} {level}
      </span>
      <span className="hp-trans-dither hp-trans-dither-bottom" aria-hidden />
    </div>
  );
}

// Počítadlo sebraných mincí a přepínač 8-bit zvuků (výchozí vypnuto). Drží se v rohu obrazovky.
export function HomeCoinHud({ t }: { t: HomeTransText }) {
  const coins = useSyncExternalStore(subscribe, () => readNum("hp-coins"), () => 0);
  const sound = useSyncExternalStore(subscribe, soundEnabled, () => false);

  function toggle() {
    write("hp-sound", sound ? "0" : "1");
    if (!sound) blip("coin");
  }

  return (
    <div className="hp-hud">
      <span key={coins} className="hp-hud-coins" aria-label={`${t.coins}: ${coins}`}>
        <svg viewBox="0 0 5 5" shapeRendering="crispEdges" aria-hidden>
          <Sprite rows={COIN} pal={{ y: "#ffc933", h: "#fff3b0" }} x={0} y={0} />
        </svg>
        <span>× {coins}</span>
      </span>
      <button type="button" className="hp-hud-sound" onClick={toggle} aria-pressed={sound} aria-label={sound ? t.soundOff : t.soundOn} title={sound ? t.soundOff : t.soundOn}>
        {sound ? "♪" : "×"}
      </button>
    </div>
  );
}
