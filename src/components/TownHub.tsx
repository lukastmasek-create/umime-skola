"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DailyChallenges } from "@/components/DailyChallenges";
import { Modal, type Snapshot } from "@/components/ShopView";
import { runPirate, runSpace, runWalk, type Handle, type Pt } from "@/lib/market-cinema";
import { sfx, sfxEnabled, setSfxEnabled } from "@/lib/market-sfx";
import { COLLECT_ICON, COLLECT_COUNT, dailySpots, type CollectSpot } from "@/lib/town";
import { dayKey } from "@/lib/shop";
import { getMarketText } from "@/i18n/market";
import { getSkipText } from "@/i18n/market-world";
import { getTownHubText } from "@/i18n/town";
import { notifyAccountChanged } from "@/lib/account-events";
import type { Locale } from "@/i18n/config";
import town from "./mesto-scena.json";
import nastup from "./pristav-nastup.json";

// Městečko jako hub: kulisy z úvodní stránky (public/home/mesto), budovy jsou vstupy do částí webu, stánek s raketou a schody
// vedou do světů uživatelského obchodu (filmové přechody v src/lib/market-cinema.ts). Každý den se v něm schová osm pokladů
// (api/mestecko) a nástěnka otevírá denní úkoly. Úvodní TownLife se nemění.

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

// budovy: kam hrdina dojde, kde visí cedule a kam se pak jde (href, nebo nástěnka)
type Place = { id: string; icon: string; door: P; sign: P; href?: string };
const PLACES: Place[] = [
  { id: "kurzy", icon: "📚", door: [0.169, 0.625], sign: [0.17, 0.52], href: "/kurzy" },
  { id: "hry", icon: "🎮", door: [0.528, 0.6], sign: [0.528, 0.505], href: "/stale-hry" },
  { id: "zebricky", icon: "🏆", door: [0.841, 0.625], sign: [0.841, 0.5], href: "/zebricky" },
  { id: "obchod", icon: "🛍️", door: [0.665, 0.665], sign: [0.665, 0.545], href: "/obchod" },
  { id: "pokoj", icon: "🛋️", door: [0.375, 0.605], sign: [0.375, 0.5], href: "/pokoj" },
  { id: "uceni", icon: "🗺️", door: [0.685, 0.56], sign: [0.685, 0.445], href: "/mapa" },
  { id: "profil", icon: "🌳", door: [0.955, 0.625], sign: [0.93, 0.4], href: "/profil" },
  { id: "ukoly", icon: "📋", door: [0.285, 0.655], sign: [0.285, 0.555] },
];

// pozemky pro speciální stavby z obchodu (id položky, sprite z městské hry, šířka v % scény, poloha paty)
const PLOTS: { item: string; sprite: string; w: number; p: P }[] = [
  { item: "city-christmas-tree", sprite: "christmas_tree", w: 6.5, p: [0.065, 0.985] },
  { item: "city-windmill", sprite: "windmill", w: 8, p: [0.17, 0.985] },
  { item: "city-carousel", sprite: "carousel", w: 8, p: [0.275, 0.985] },
  { item: "city-lighthouse", sprite: "lighthouse", w: 7, p: [0.375, 0.985] },
  { item: "city-ferris-wheel", sprite: "ferris_wheel", w: 11, p: [0.47, 0.99] },
  { item: "city-rocket-pad", sprite: "rocket_pad", w: 11, p: [0.2, 0.9] },
];

type Phase = { kind: "space" } | { kind: "pirate" } | { kind: "walk"; place: Place } | null;
type Collect = { loggedIn: boolean; day: string; spots: CollectSpot[]; collected: number[]; bonus: boolean };

function Sprite({ k, p, delay = 0 }: { k: SK; p: P; delay?: number }) {
  const s = SPR[k];
  return (
    <div aria-hidden className="pointer-events-none absolute" style={{ ...at(p), width: `${(s.o / 1.6) * FIG * 100}%`, aspectRatio: "1 / 1", transform: `translate(-50%, ${-(0.5 + s.tz / s.o) * 100}%)` }}>
      <span className="town-sprite block h-full w-full" style={{ backgroundImage: `url(/home/mesto/${s.f}.webp)`, ["--n" as string]: s.n, animationDuration: `${s.dur}s`, animationDelay: `${-delay}s` }} />
    </div>
  );
}

export function TownHub({ locale }: { locale: Locale }) {
  const tt = getTownHubText(locale);
  const m = getMarketText(locale);
  const st = getSkipText(locale);
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>(null);
  const [gen, setGen] = useState(0);
  const [sound, setSound] = useState(true);
  const [board, setBoard] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const [shop, setShop] = useState<Snapshot | null>(null);
  const [col, setCol] = useState<Collect>({ loggedIn: false, day: dayKey(), spots: dailySpots(dayKey()), collected: [], bonus: false });
  const [pop, setPop] = useState<{ n: number; text: string; x: number; y: number } | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const handle = useRef<Handle | null>(null);
  const seq = useRef(0);
  const busy = useRef(false);
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
    const id = window.setTimeout(() => setSound(sfxEnabled()), 0);
    return () => window.clearTimeout(id);
  }, []);
  useEffect(() => {
    let off = false;
    fetch("/api/shop")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => !off && j?.loggedIn && setShop(j))
      .catch(() => {});
    fetch("/api/mestecko")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => !off && j && !j.error && setCol(j))
      .catch(() => {});
    return () => {
      off = true;
    };
  }, []);

  const spaceOpen = !!shop?.worlds?.includes("space");

  const leave = useCallback(
    (href: string) => {
      router.push(href);
    },
    [router],
  );

  useEffect(() => {
    if (!phase) return;
    const r = { box: box.current, cam: cam.current, sky: sky.current, bgDark: bgDark.current, cv: cv.current, hero: hero.current, heroSpr: heroSpr.current, rocket: rocket.current, bars: bars.current, count: count.current };
    if (!r.box || !r.cam || !r.cv || !r.hero || !r.heroSpr) return;
    const geo = { toBox, rocket: ROCKET, start: START, road: ROAD, fig: FIG };
    if (phase.kind === "walk") {
      const place = phase.place;
      handle.current = runWalk(r as Parameters<typeof runWalk>[0], geo, place.door, () => {
        if (place.href) leave(`/${locale}${place.href}`);
        else {
          setPhase(null);
          setGen((g) => g + 1);
          setBoard(true);
        }
      });
    } else if (phase.kind === "space") {
      if (!r.sky || !r.bgDark || !r.rocket || !r.bars || !r.count) return;
      handle.current = runSpace(r as Parameters<typeof runSpace>[0], geo, () => leave(`/${locale}/uzivatelsky-obchod?svet=space&film=1`));
    } else {
      if (!r.sky || !r.bgDark || !r.rocket || !r.bars || !r.count) return;
      handle.current = runPirate(r as Parameters<typeof runPirate>[0], geo, nastup as unknown as Parameters<typeof runPirate>[2], () => leave(`/${locale}/uzivatelsky-obchod?svet=pirate&film=1`));
    }
    return () => handle.current?.stop();
  }, [phase, leave, locale]);

  function reduced() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  function visit(place: Place) {
    if (phase) return;
    if (reduced()) {
      if (place.href) leave(`/${locale}${place.href}`);
      else setBoard(true);
      return;
    }
    setPhase({ kind: "walk", place });
  }
  function enterWorld(id: "pirate" | "space") {
    if (phase) return;
    if (reduced() || (id === "space" && !spaceOpen)) {
      leave(`/${locale}/uzivatelsky-obchod?svet=${id}`);
      return;
    }
    setPhase({ kind: id });
  }
  function toggleSound() {
    const next = !sound;
    setSound(next);
    setSfxEnabled(next);
  }
  async function collect(spot: CollectSpot) {
    if (busy.current || phase) return;
    if (!col.loggedIn) {
      setNote(tt.collect.login);
      window.setTimeout(() => setNote(null), 3000);
      return;
    }
    busy.current = true;
    try {
      const res = await fetch("/api/mestecko", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idx: spot.idx }) });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        sfx.pop();
        setCol(json);
        setPop({ n: ++seq.current, text: tt.collect.got.replace("{n}", String(json.gained)), x: spot.x, y: spot.y });
        window.setTimeout(() => setPop(null), 1600);
        if (json.bonus && json.collected.length >= COLLECT_COUNT) {
          setNote(tt.collect.all);
          window.setTimeout(() => setNote(null), 3500);
        }
        notifyAccountChanged();
      } else if (json.error === "owned") {
        setCol((c) => ({ ...c, collected: [...c.collected, spot.idx] }));
      }
    } finally {
      busy.current = false;
    }
  }

  const labelCls = "absolute z-[4] -translate-x-1/2 whitespace-nowrap rounded-md border-2 border-[#16132b] bg-[#3a2a1a] px-1.5 py-0.5 text-[9px] font-extrabold text-[#ffd76b] shadow-[0_2px_0_rgba(0,0,0,0.4)] transition-transform sm:text-xs";
  const left = COLLECT_COUNT - col.collected.length;

  return (
    <div>
      <div className="overflow-x-auto overflow-y-hidden rounded-3xl border-2 border-[var(--edge)] shadow-[0_6px_0_var(--shadow-ink)]">
        <div ref={box} className="relative select-none overflow-hidden" style={{ aspectRatio: `${SCENE_W} / ${BOX_H}`, minWidth: 880, background: "linear-gradient(180deg, #5cb4ff, #cfeaff)" }}>
          {phase && phase.kind !== "walk" && <div ref={bgDark} aria-hidden className="absolute inset-0 opacity-0" style={{ background: "linear-gradient(180deg, #02030c 0%, #071040 55%, #1b3a8a 100%)" }} />}
          <div key={gen} ref={cam} className={`town-day absolute inset-0 ${phase ? "pointer-events-none" : ""}`}>
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

            {/* moje městečko: koupené stavby na pozemcích */}
            {PLOTS.filter((pl) => shop?.owned.includes(pl.item)).map((pl) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={pl.item} src={`/city/sprites/${pl.sprite}.png`} alt="" draggable={false} className="pointer-events-none absolute z-[2]" style={{ ...at(pl.p), width: `${pl.w}%`, transform: "translate(-50%, -100%)", filter: "drop-shadow(0 4px 3px rgba(0,0,0,0.35))" }} />
            ))}

            {/* poklady dne */}
            {col.spots.filter((s) => !col.collected.includes(s.idx)).map((s) => (
              <button key={s.idx} type="button" aria-label={tt.collect.title} onClick={() => collect(s)} className="town-collect absolute z-[6] -translate-x-1/2 -translate-y-1/2 leading-none" style={{ ...at([s.x, s.y]), fontSize: "clamp(18px, 2.7vw, 34px)", animationDelay: `${(s.idx % 4) * -0.5}s` }}>
                {COLLECT_ICON[s.kind]}
              </button>
            ))}
            {pop && (
              <div key={pop.n} className="market-boom pointer-events-none absolute z-[9] -translate-x-1/2 text-lg font-black text-[#ffd76b] [text-shadow:0_2px_0_#16132b]" style={{ ...at([pop.x, pop.y - 0.05]) }}>
                {pop.text}
              </div>
            )}

            {/* cedule budov */}
            {PLACES.map((p) => (
              <div key={p.id} className={`${labelCls} pointer-events-none ${hover === p.id ? "scale-110" : ""}`} style={{ ...at(p.sign) }}>
                {p.icon} {tt.buildings[p.id].name}
              </div>
            ))}
            <div className={`${labelCls} pointer-events-none`} style={{ ...at([STAIRS[0] + 0.045, STAIRS[1] - 0.17]) }}>
              ⚓ {tt.buildings.pristav.name}
            </div>
            <div className={`${labelCls} pointer-events-none`} style={{ ...at([ROCKET[0], ROCKET[1] - 0.2]) }}>
              🚀 {tt.buildings.stanice.name}
              {!spaceOpen && <span className="ml-1 text-white/80">🔒</span>}
            </div>

            {/* klikací místa */}
            {PLACES.map((p) => (
              <button key={p.id} type="button" aria-label={tt.buildings[p.id].name} title={tt.buildings[p.id].hint} onClick={() => visit(p)} onMouseEnter={() => setHover(p.id)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(p.id)} onBlur={() => setHover(null)} className="market-hit absolute z-10 -translate-x-1/2 rounded-2xl" style={{ ...at([p.door[0], p.door[1] - 0.09]), width: "9%", height: "15%" }} />
            ))}
            <button type="button" aria-label={tt.buildings.pristav.name} title={tt.buildings.pristav.hint} onClick={() => enterWorld("pirate")} className="market-hit absolute z-10 rounded-2xl" style={{ left: "1.5%", top: `${Y(0.68) * 100}%`, width: "11%", height: "17%" }} />
            <button type="button" aria-label={tt.buildings.stanice.name} title={tt.buildings.stanice.hint} onClick={() => enterWorld("space")} className="market-hit absolute z-10 rounded-2xl" style={{ left: `${ROCKET[0] * 100 - 7}%`, top: `${Y(ROCKET[1]) * 100 - 15}%`, width: "14%", height: "17%" }} />
          </div>

          <div className="pointer-events-none absolute left-3 top-3 z-20 flex items-center gap-2 rounded-full border-2 border-[var(--edge)] bg-[var(--surface)] px-3 py-1 text-sm font-extrabold">
            🎁 {left > 0 ? tt.collect.left.replace("{n}", String(left)) : "✓"}
          </div>
          {note && <div role="status" className="absolute bottom-3 left-1/2 z-30 -translate-x-1/2 rounded-full border-2 border-[var(--edge)] bg-[var(--surface)] px-4 py-2 text-sm font-bold shadow-[0_3px_0_var(--shadow-ink)]">{note}</div>}

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

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <section className="card p-4">
          <h2 className="mb-1 text-lg font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>
            📋 {tt.quests.title}
          </h2>
          <p className="mb-3 text-sm text-[var(--muted)]">{tt.quests.text}</p>
          <button type="button" onClick={() => setBoard(true)} className="btn-bouncy bg-[var(--brand-500)] px-4 py-2 text-sm font-bold text-white">
            {tt.quests.open}
          </button>
        </section>
        <section className="card p-4">
          <h2 className="mb-1 text-lg font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>
            🎁 {tt.collect.title}
          </h2>
          <p className="mb-2 text-sm text-[var(--muted)]">{col.loggedIn ? tt.collect.text : tt.collect.login}</p>
          <p className="text-sm font-bold">
            {col.collected.length}/{COLLECT_COUNT} {col.bonus && "✓"}
          </p>
        </section>
      </div>
      <section className="card mt-4 p-4">
        <h2 className="mb-1 text-lg font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>
          🏡 {tt.mine.title}
        </h2>
        <p className="mb-3 text-sm text-[var(--muted)]">{shop && PLOTS.some((pl) => shop.owned.includes(pl.item)) ? tt.mine.text : tt.mine.empty}</p>
        <ul className="mb-3 flex flex-wrap gap-3">
          {PLOTS.map((pl) => {
            const have = !!shop?.owned.includes(pl.item);
            return (
              <li key={pl.item} className={`flex h-20 w-20 items-end justify-center rounded-2xl border-2 border-[var(--edge)] bg-[var(--surface-muted)] p-1 ${have ? "" : "opacity-40 grayscale"}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/city/sprites/${pl.sprite}.png`} alt="" draggable={false} className="max-h-full max-w-full object-contain" />
              </li>
            );
          })}
        </ul>
        <div className="flex flex-wrap gap-2">
          <Link href={`/${locale}/stale-hry/mesto`} className="btn-bouncy bg-[var(--brand-500)] px-4 py-2 text-sm font-bold text-white">
            {tt.mine.open}
          </Link>
          <Link href={`/${locale}/uzivatelsky-obchod`} className="btn-bouncy bg-[var(--surface)] px-4 py-2 text-sm font-bold">
            {m.title}
          </Link>
        </div>
      </section>
      {board && (
        <Modal title={`📋 ${tt.quests.title}`} onClose={() => setBoard(false)} closeLabel={m.close}>
          <DailyChallenges locale={locale} />
        </Modal>
      )}
    </div>
  );
}
