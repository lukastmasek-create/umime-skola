"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DailyChallenges } from "@/components/DailyChallenges";
import { Modal, type Snapshot } from "@/components/ShopView";
import { runPath, runPirate, runPortal, runSpace, type Geo, type Handle, type Pt } from "@/lib/market-cinema";
import { sfx, sfxEnabled, setSfxEnabled } from "@/lib/market-sfx";
import { COLLECT_ICON, COLLECT_COUNT, dailySpots, type CollectSpot } from "@/lib/town";
import { dayKey } from "@/lib/shop";
import { getMarketText } from "@/i18n/market";
import { getSkipText, getTownText } from "@/i18n/market-world";
import { getTownHubText } from "@/i18n/town";
import { notifyAccountChanged } from "@/lib/account-events";
import type { Locale } from "@/i18n/config";
import hubData from "./mesto-hub-kotvy.json";
import nastup from "./pristav-nastup.json";

// Městečko jako hub (stránka /mestecko): velké denní městečko z Blenderu (umime-art/blender/mestecko_hub.py) se čtyřmi řadami:
// louka s přístavem, lagunou a raketovou rampou, hlavní ulice, druhá řada s parkem a terasa s vchodem do lesa a do hradu.
// Názvy sekcí jsou cedule přímo na budovách, hrdina k nim dojde po cestách (graf z Blenderu). Filmové přechody do světů obchodu
// jsou v src/lib/market-cinema.ts. Každý den se v městečku schová osm pokladů (api/mestecko). Úvodní TownLife se nemění.

type HubPlace = { door: Pt; sign: Pt; w: number; lod?: Pt; raketa?: Pt; ponorka?: Pt };
type Hub = {
  w: number;
  h: number;
  places: Record<string, HubPlace>;
  graf: { nodes: Record<string, Pt>; edges: [string, string][]; world: Record<string, [number, number]> };
  lampy: Pt[];
  sber: Pt[];
  kominy: Pt[];
  npc: Record<string, Pt>;
  voda: { zatoka: number[]; reka: number[]; laguna: number[] };
  mlyn: Pt;
  mlyn_h?: Pt;
  hrdina: Pt;
};
const HUB = hubData as unknown as Hub;

const SKY = 160; // výška oblohy nad obrázkem městečka (v px obrázku)
const BOX_H = HUB.h + SKY;
const FIG = 0.06;
const Y = (y: number) => (SKY + y * HUB.h) / BOX_H;
const at = (p: Pt) => ({ left: `${p[0] * 100}%`, top: `${Y(p[1]) * 100}%` });
const toBox = (p: Pt): Pt => [p[0], Y(p[1])];

type WorldKey = "pirate" | "space" | "forest" | "castle" | "sea";
type PlaceDef = { id: string; icon: string; href?: string; world?: WorldKey };
const PLACES: PlaceDef[] = [
  { id: "kurzy", icon: "📚", href: "/kurzy" },
  { id: "hry", icon: "🎮", href: "/stale-hry" },
  { id: "zebricky", icon: "🏆", href: "/zebricky" },
  { id: "obchod", icon: "🛍️", href: "/obchod" },
  { id: "pokoj", icon: "🛋️", href: "/pokoj" },
  { id: "uceni", icon: "🔭", href: "/mapa" },
  { id: "profil", icon: "🌳", href: "/profil" },
  { id: "ukoly", icon: "📋" },
  { id: "pristav", icon: "⚓", world: "pirate" },
  { id: "stanice", icon: "🚀", world: "space" },
  { id: "les", icon: "🧚", world: "forest" },
  { id: "hrad", icon: "🏰", world: "castle" },
  { id: "more", icon: "🐠", world: "sea" },
];

type Spr = { f: string; n: number; o: number; tz: number; dur: number; dir?: string };
const SPR = {
  knihovnice: { f: "knihovnice", n: 24, o: 1.7, tz: 0.62, dur: 2.6 },
  pekar: { f: "pekar", n: 24, o: 1.9, tz: 0.62, dur: 2.0 },
  kluk: { f: "kluk", n: 24, o: 1.7, tz: 0.55, dur: 1.6 },
  kocka: { f: "kocka", n: 24, o: 1.2, tz: 0.27, dur: 6 },
  babicka: { f: "babicka", n: 16, o: 1.7, tz: 0.55, dur: 1.7 },
  ovce: { f: "ovce", n: 24, o: 1.4, tz: 0.33, dur: 6 },
  slepice: { f: "slepice", n: 16, o: 0.9, tz: 0.2, dur: 1.3 },
  farmar: { f: "farmar", n: 16, o: 1.9, tz: 0.62, dur: 1.6 },
  pes_sedi: { f: "pes-sedi", n: 24, o: 1.3, tz: 0.3, dur: 1.8 },
  pes_bezi: { f: "pes-bezi", n: 16, o: 1.3, tz: 0.28, dur: 0.6 },
  ptak: { f: "ptak", n: 12, o: 1.0, tz: 0.0, dur: 0.55 },
} satisfies Record<string, Spr>;
type SK = keyof typeof SPR;

const FOLK: { k: SK; key: string; flip?: boolean; talk?: string }[] = [
  { k: "knihovnice", key: "knihovnice", talk: "knihovnice" },
  { k: "pekar", key: "pekar", talk: "pekar" },
  { k: "kluk", key: "kluk", talk: "kluk" },
  { k: "kocka", key: "kocka", talk: "kocka" },
  { k: "babicka", key: "babicka", flip: true },
  { k: "ovce", key: "ovce", flip: true },
  { k: "slepice", key: "slepice" },
  { k: "farmar", key: "farmar" },
];

type Phase = { kind: "path" | "space" | "pirate" | "portal"; id: string; target?: PlaceDef } | null;
type Collect = { loggedIn: boolean; day: string; spots: CollectSpot[]; collected: number[]; bonus: boolean };

function Sprite({ k, p, flip = false, delay = 0, scale = 1, style, cls = "" }: { k: SK; p: Pt; flip?: boolean; delay?: number; scale?: number; style?: React.CSSProperties; cls?: string }) {
  const s = SPR[k];
  return (
    <div aria-hidden className={`pointer-events-none absolute ${cls}`} style={{ ...at(p), width: `${(s.o / 1.6) * FIG * 100 * scale}%`, aspectRatio: "1 / 1", transform: `translate(-50%, ${-(0.5 + s.tz / s.o) * 100}%) scaleX(${flip ? -1 : 1})`, ...style }}>
      <span className="town-sprite block h-full w-full" style={{ backgroundImage: `url(/home/mesto/${s.f}.webp)`, ["--n" as string]: s.n, animationDuration: `${s.dur}s`, animationDelay: `${-delay}s` }} />
    </div>
  );
}

// nejkratší cesta po grafu cest (Dijkstra podle vzdálenosti ve světových souřadnicích)
function route(from: string, to: string): string[] {
  const { nodes, edges, world } = HUB.graf;
  const adj: Record<string, { n: string; d: number }[]> = {};
  for (const n of Object.keys(nodes)) adj[n] = [];
  for (const [a, b] of edges) {
    const d = Math.hypot(world[a][0] - world[b][0], world[a][1] - world[b][1]);
    adj[a].push({ n: b, d });
    adj[b].push({ n: a, d });
  }
  const dist: Record<string, number> = { [from]: 0 };
  const prev: Record<string, string> = {};
  const todo = new Set(Object.keys(nodes));
  while (todo.size) {
    let u: string | null = null;
    for (const n of todo) if (dist[n] !== undefined && (u === null || dist[n] < dist[u])) u = n;
    if (u === null) break;
    todo.delete(u);
    if (u === to) break;
    for (const { n, d } of adj[u]) if (dist[n] === undefined || dist[u] + d < dist[n]) {
      dist[n] = dist[u] + d;
      prev[n] = u;
    }
  }
  const out = [to];
  while (out[0] !== from && prev[out[0]]) out.unshift(prev[out[0]]);
  return out;
}

export function TownHub({ locale }: { locale: Locale }) {
  const tt = getTownHubText(locale);
  const m = getMarketText(locale);
  const st = getSkipText(locale);
  const tw = getTownText(locale);
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>(null);
  const [gen, setGen] = useState(0);
  const [sound, setSound] = useState(true);
  const [night, setNight] = useState(false);
  const [board, setBoard] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const [shop, setShop] = useState<Snapshot | null>(null);
  const [col, setCol] = useState<Collect>({ loggedIn: false, day: dayKey(), spots: dailySpots(dayKey()), collected: [], bonus: false });
  const [pop, setPop] = useState<{ n: number; text: string; p: Pt } | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [talk, setTalk] = useState<{ k: string; text: string } | null>(null);
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
  const dog = useRef<HTMLDivElement>(null);
  const dogSpr = useRef<HTMLSpanElement>(null);
  const birds = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setSound(sfxEnabled());
      try {
        if (window.localStorage.getItem("town-night") === "1") setNight(true);
      } catch {}
    }, 0);
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

  const worldOpen = (id: WorldKey) => id === "pirate" || !!shop?.worlds?.includes(id === "sea" ? "sea" : id);

  // oživení: ptáci přelétají oblohu, pes pobíhá po hlavní ulici
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const street = ["m1", "m2", "m3", "m4", "m5", "hub", "m7", "obchod", "m8", "m9"].map((n) => HUB.graf.nodes[n]);
    const cum = [0];
    for (let i = 1; i < street.length; i++) cum.push(cum[i - 1] + Math.hypot(street[i][0] - street[i - 1][0], (street[i][1] - street[i - 1][1]) * (HUB.h / HUB.w)));
    const total = cum[cum.length - 1];
    let raf = 0;
    const t0 = performance.now();
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    if (box.current) io.observe(box.current);
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const t = (now - t0) / 1000;
      // pes: tam a zpět s pauzou
      const cyc = (t % 36) / 36;
      const run = cyc < 0.45 ? cyc / 0.45 : cyc < 0.5 ? 1 : cyc < 0.95 ? 1 - (cyc - 0.5) / 0.45 : 0;
      const dir = cyc < 0.45 ? 1 : cyc < 0.5 ? 0 : cyc < 0.95 ? -1 : 0;
      const d = Math.max(0, Math.min(1, run)) * total;
      let i = 1;
      while (i < cum.length - 1 && cum[i] < d) i++;
      const k = (d - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1]);
      const px = street[i - 1][0] + (street[i][0] - street[i - 1][0]) * Math.max(0, Math.min(1, k));
      const py = street[i - 1][1] + (street[i][1] - street[i - 1][1]) * Math.max(0, Math.min(1, k)) + 0.012;
      const el = dog.current;
      const sp = dogSpr.current;
      if (el && sp) {
        el.style.left = `${px * 100}%`;
        el.style.top = `${Y(py) * 100}%`;
        el.style.transform = `translate(-50%, ${-(0.5 + SPR.pes_bezi.tz / SPR.pes_bezi.o) * 100}%) scaleX(${dir < 0 ? -1 : 1})`;
        const running = dir !== 0;
        sp.style.animationPlayState = running ? "running" : "paused";
        sp.style.backgroundImage = `url(/home/mesto/${running ? "pes-bezi" : "pes-sedi"}.webp)`;
        sp.style.setProperty("--n", running ? "16" : "24");
        sp.style.animationDuration = running ? "0.6s" : "1.8s";
        sp.style.animationPlayState = "running";
      }
      birds.current.forEach((b, bi) => {
        if (!b) return;
        const p = ((t * (0.012 + bi * 0.004) + bi * 0.37) % 1.3) - 0.15;
        b.style.left = `${p * 100}%`;
        b.style.top = `${(0.01 + bi * 0.035 + Math.sin(t * 0.7 + bi) * 0.008) * 100}%`;
      });
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  const leave = useCallback(
    (href: string) => {
      router.push(href);
    },
    [router],
  );

  const geoFor = useCallback((walk: Pt[], start: Pt, extra?: Partial<Geo>): Geo => ({ toBox, rocket: HUB.places.stanice.raketa ?? HUB.places.stanice.door, start, walk, ...extra }), []);

  useEffect(() => {
    if (!phase) return;
    const r = { box: box.current, cam: cam.current, sky: sky.current, bgDark: bgDark.current, cv: cv.current, hero: hero.current, heroSpr: heroSpr.current, rocket: rocket.current, bars: bars.current, count: count.current };
    if (!r.box || !r.cam || !r.cv || !r.hero || !r.heroSpr) return;
    const start = HUB.hrdina;
    const full = (r2: typeof r) => r2 as Parameters<typeof runSpace>[0];
    if (phase.kind === "path" && phase.target) {
      const place = phase.target;
      const nodes = route("hub", place.id).map((n) => HUB.graf.nodes[n]);
      const geo = geoFor(nodes.slice(1), start);
      handle.current = runPath(r as Parameters<typeof runPath>[0], geo, () => {
        if (place.href) leave(`/${locale}${place.href}`);
        else {
          setPhase(null);
          setGen((g) => g + 1);
          setBoard(true);
        }
      });
    } else if (phase.kind === "space") {
      if (!r.sky || !r.bgDark || !r.rocket || !r.bars || !r.count) return;
      const nodes = route("hub", "stanice").map((n) => HUB.graf.nodes[n]);
      const pad = HUB.places.stanice.raketa ?? HUB.places.stanice.door;
      const walkEnd = nodes[nodes.length - 1];
      handle.current = runPath(r as Parameters<typeof runPath>[0], geoFor(nodes.slice(1), start, { rocketW: 0.22 }), () => {
        handle.current = runSpace(full(r), geoFor([], walkEnd, { rocket: pad, rocketW: 0.22 }), () => leave(`/${locale}/uzivatelsky-obchod?svet=space&film=1`));
      }, false);
    } else if (phase.kind === "pirate") {
      if (!r.sky || !r.bgDark || !r.rocket || !r.bars || !r.count) return;
      const nodes = route("hub", "pristav").map((n) => HUB.graf.nodes[n]);
      handle.current = runPirate(full(r), geoFor(nodes.slice(1), start), nastup as unknown as Parameters<typeof runPirate>[2], () => leave(`/${locale}/uzivatelsky-obchod?svet=pirate&film=1`));
    } else {
      const world = phase.target?.world ?? "forest";
      const nodes = route("hub", phase.id).map((n) => HUB.graf.nodes[n]);
      handle.current = runPortal(r as Parameters<typeof runPortal>[0], geoFor(nodes.slice(1), start), world === "castle" ? "castle" : world === "sea" ? "sea" : "forest", () => leave(`/${locale}/uzivatelsky-obchod?svet=${world}&film=1`));
    }
    return () => handle.current?.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function reduced() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  function visit(place: PlaceDef) {
    if (phase) return;
    setTalk(null);
    if (place.world) {
      const w = place.world;
      if (reduced() || !worldOpen(w)) {
        leave(`/${locale}/uzivatelsky-obchod?svet=${w}`);
        return;
      }
      setPhase({ kind: w === "space" ? "space" : w === "pirate" ? "pirate" : "portal", id: place.id, target: place });
      return;
    }
    if (reduced()) {
      if (place.href) leave(`/${locale}${place.href}`);
      else setBoard(true);
      return;
    }
    setPhase({ kind: "path", id: place.id, target: place });
  }
  function toggleSound() {
    const next = !sound;
    setSound(next);
    setSfxEnabled(next);
  }
  function toggleNight() {
    setNight((v) => {
      try {
        window.localStorage.setItem("town-night", v ? "0" : "1");
      } catch {}
      return !v;
    });
  }
  function chat(key: string, lines?: string[]) {
    if (!lines?.length) return;
    setTalk({ k: key, text: lines[++seq.current % lines.length] });
    sfx.pop();
    window.setTimeout(() => setTalk((c) => (c?.k === key ? null : c)), 2800);
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
        setPop({ n: ++seq.current, text: tt.collect.got.replace("{n}", String(json.gained)), p: spotPos(spot) });
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

    const spotPos = useCallback((s: CollectSpot): Pt => HUB.sber[s.slot % Math.max(1, HUB.sber.length)] ?? HUB.hrdina, []);

  const labelCls = "absolute z-[4] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-md border-2 border-[#16132b] bg-[#3a2a1a] text-center font-extrabold leading-tight text-[#ffd76b] shadow-[0_2px_0_rgba(0,0,0,0.45)] transition-transform";
  const left = COLLECT_COUNT - col.collected.length;
  const dark = night;
  const folk = useMemo(() => FOLK.filter((f) => HUB.npc[f.key]), []);

  return (
    <div>
      <div className="overflow-x-auto overflow-y-hidden rounded-3xl border-2 border-[var(--edge)] shadow-[0_6px_0_var(--shadow-ink)]">
        <div ref={box} className="relative select-none overflow-hidden [container-type:inline-size]" style={{ aspectRatio: `${HUB.w} / ${BOX_H}`, minWidth: 880, background: "linear-gradient(180deg, #5cb4ff, #cfeaff)" }}>
          {phase && phase.kind !== "path" && <div ref={bgDark} aria-hidden className="absolute inset-0 opacity-0" style={{ background: "linear-gradient(180deg, #02030c 0%, #071040 55%, #1b3a8a 100%)" }} />}
          <div key={gen} ref={cam} className={`${dark ? "" : "town-day"} absolute inset-0 ${phase ? "pointer-events-none" : ""}`}>
            <div ref={sky} aria-hidden className="town-sky absolute inset-0" />
            {dark && <div aria-hidden className="town-stars absolute inset-x-0 top-0 h-[40%]" />}
            {/* oblaka a ptáci */}
            {!dark &&
              [0, 1, 2, 3].map((i) => (
                <div key={i} aria-hidden className="hub-cloud pointer-events-none absolute" style={{ top: `${1 + i * 2.6}%`, width: `${14 + (i % 3) * 5}%`, animationDuration: `${120 + i * 38}s`, animationDelay: `${-i * 31}s` }} />
              ))}
            {[0, 1].map((i) => (
              <div key={i} ref={(el) => void (birds.current[i] = el)} aria-hidden className="pointer-events-none absolute z-[3]" style={{ width: `${(SPR.ptak.o / 1.6) * FIG * 100 * 0.9}%`, aspectRatio: "1 / 1" }}>
                <span className="town-sprite block h-full w-full" style={{ backgroundImage: "url(/home/mesto/ptak.webp)", ["--n" as string]: 12, animationDuration: "0.55s", animationDelay: `${-i * 0.2}s` }} />
              </div>
            ))}
            {/* voda: zátoka, řeka a laguna se třpytí pod obrázkem městečka */}
            <HubWater />
            {/* přístavní loď a ponorka v lagunně (pod/nad obrázkem podle polohy) */}
            {HUB.places.pristav.lod && (
              <div aria-hidden className="pointer-events-none absolute" style={{ ...at(HUB.places.pristav.lod), width: "26%", aspectRatio: "640 / 512", transform: "translate(-50%, -78.1%)" }}>
                <span className="town-sprite block h-full w-full" style={{ backgroundImage: "url(/home/pristav/lod.webp)", ["--n" as string]: 12, animationDuration: "3.6s" }} />
              </div>
            )}
            {HUB.places.more.ponorka && (
              <div aria-hidden className="pointer-events-none absolute" style={{ ...at(HUB.places.more.ponorka), width: "16%", aspectRatio: "640 / 384", transform: "translate(-50%, -50%)" }}>
                <span className="town-sprite block h-full w-full" style={{ backgroundImage: "url(/home/more/ponorka.webp)", ["--n" as string]: 12, animationDuration: "3.2s" }} />
              </div>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/home/mesto/hub.webp" alt="" draggable={false} className="town-hub-img pointer-events-none absolute bottom-0 left-0 w-full" style={{ filter: dark ? "brightness(0.55) saturate(1.1) hue-rotate(-12deg)" : undefined, transition: "filter 0.8s" }} />
            {/* větrný mlýn a komíny */}
            <div aria-hidden className="town-mill pointer-events-none absolute" style={{ ...at(HUB.mlyn), width: "6.2%", aspectRatio: "1 / 1", transform: "translate(-50%,-50%)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/home/mesto/mlyn.webp" alt="" draggable={false} className="town-mill-blades block h-full w-full" />
            </div>
            {HUB.kominy.map((p, i) => (
              <div key={i} aria-hidden className="pointer-events-none absolute" style={{ ...at(p), width: "1.4%", aspectRatio: "1 / 1" }}>
                {[0, 1, 2].map((j) => (
                  <i key={j} className="hub-smoke" style={{ animationDelay: `${-(j * 1.6 + i * 0.7)}s` }} />
                ))}
              </div>
            ))}
            {/* raketa na rampě */}
            {HUB.places.stanice.raketa && (
              <div ref={rocket} aria-hidden className="pointer-events-none absolute" style={{ ...at(HUB.places.stanice.raketa), width: "22%", aspectRatio: "640 / 384", transform: "translate(-50%, -62%)" }}>
                <span className="town-sprite block h-full w-full" style={{ backgroundImage: "url(/home/kosmicka/raketa.webp)", ["--n" as string]: 12, animationDuration: "3s" }} />
              </div>
            )}
            {/* obyvatelé a zvířata */}
            {folk.map((f, i) => (
              <Sprite key={f.key} k={f.k} p={HUB.npc[f.key]} flip={f.flip} delay={i * 0.7} />
            ))}
            <div ref={dog} aria-hidden className="pointer-events-none absolute" style={{ ...at(HUB.npc.pes ?? HUB.hrdina), width: `${(SPR.pes_bezi.o / 1.6) * FIG * 100}%`, aspectRatio: "1 / 1" }}>
              <span ref={dogSpr} className="town-sprite block h-full w-full" style={{ backgroundImage: "url(/home/mesto/pes-sedi.webp)", ["--n" as string]: 24, animationDuration: "1.8s" }} />
            </div>
            {/* hrdina */}
            <div ref={hero} className="pointer-events-none absolute z-[5]" style={{ ...at(HUB.hrdina), width: `${FIG * 100}%`, aspectRatio: "1 / 1", transform: `translate(-50%, ${-(0.5 + 0.55 / 1.6) * 100}%)` }}>
              <span ref={heroSpr} aria-hidden className="town-sprite block h-full w-full" style={{ ["--n" as string]: 24, backgroundImage: "url(/home/mesto/hrdina-stoji.webp)", animationDuration: "3s" }} />
            </div>
            {/* noc: světla lamp */}
            {dark &&
              HUB.lampy.map((p, i) => (
                <i key={i} aria-hidden className="hub-lamp pointer-events-none absolute" style={{ ...at(p), animationDelay: `${-(i % 5) * 0.6}s` }} />
              ))}

            {/* poklady dne */}
            {col.spots.filter((s) => !col.collected.includes(s.idx)).map((s) => (
              <button key={s.idx} type="button" aria-label={tt.collect.title} onClick={() => collect(s)} className="town-collect absolute z-[7] -translate-x-1/2 -translate-y-1/2 leading-none" style={{ ...at(spotPos(s)), fontSize: "clamp(18px, 2.6cqw, 34px)", animationDelay: `${(s.idx % 4) * -0.5}s` }}>
                {COLLECT_ICON[s.kind]}
              </button>
            ))}
            {pop && (
              <div key={pop.n} className="market-boom pointer-events-none absolute z-[9] -translate-x-1/2 text-lg font-black text-[#ffd76b] [text-shadow:0_2px_0_#16132b]" style={{ ...at([pop.p[0], pop.p[1] - 0.03]) }}>
                {pop.text}
              </div>
            )}
            {talk && (() => {
              const f = FOLK.find((c) => c.key === talk.k);
              const p = f ? HUB.npc[f.key] : null;
              if (!p) return null;
              return (
                <div className="pointer-events-none absolute z-[8] max-w-[12rem] -translate-x-1/2 -translate-y-full rounded-2xl border-2 border-[var(--edge)] bg-[var(--surface)] px-3 py-1 text-center text-xs font-extrabold" style={{ ...at([p[0], p[1] - 0.05]) }}>
                  {talk.text}
                </div>
              );
            })()}

            {/* cedule přímo na budovách */}
            {PLACES.map((p) => {
              const pl = HUB.places[p.id];
              if (!pl) return null;
              const locked = p.world && !worldOpen(p.world) && p.world !== "pirate";
              return (
                <div key={p.id} className={`${labelCls} pointer-events-none ${hover === p.id ? "scale-110" : ""}`} style={{ ...at(pl.sign), width: `${(pl.w / 16) * 100}%`, padding: "0.15cqw 0.2cqw", fontSize: "clamp(8px, 0.95cqw, 15px)" }}>
                  {p.icon} {tt.buildings[p.id].name}
                  {locked && <span className="ml-1 opacity-80">🔒</span>}
                </div>
              );
            })}

            {/* klikací místa */}
            {PLACES.map((p) => {
              const pl = HUB.places[p.id];
              if (!pl) return null;
              const hw = pl.w / 16 + 0.04;
              const top = Math.min(pl.sign[1], pl.door[1]) - 0.012;
              const hh = Math.abs(pl.door[1] - pl.sign[1]) + 0.045;
              return (
                <button key={p.id} type="button" aria-label={tt.buildings[p.id].name} title={tt.buildings[p.id].hint} onClick={() => visit(p)} onMouseEnter={() => setHover(p.id)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(p.id)} onBlur={() => setHover(null)} className="market-hit absolute z-10 -translate-x-1/2 rounded-2xl" style={{ left: `${pl.sign[0] * 100}%`, top: `${Y(top) * 100}%`, width: `${hw * 100}%`, height: `${(Y(top + hh) - Y(top)) * 100}%` }} />
              );
            })}
            {folk.filter((f) => f.talk).map((f) => {
              const p = HUB.npc[f.key];
              const lines = (tw.talk as Record<string, { label: string; lines: string[] }>)[f.talk as string];
              return <button key={`t-${f.key}`} type="button" aria-label={lines?.label ?? f.key} title={lines?.label} onClick={() => chat(f.key, lines?.lines)} className="market-hit absolute z-[9] -translate-x-1/2 rounded-full" style={{ left: `${p[0] * 100}%`, top: `${Y(p[1] - 0.05) * 100}%`, width: "4%", height: `${(Y(p[1] + 0.01) - Y(p[1] - 0.05)) * 100}%` }} />;
            })}
          </div>

          {dark && <div aria-hidden className="pointer-events-none absolute inset-0 bg-[#0b0925]/25" />}
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
          <div className="absolute right-3 top-3 z-30 flex gap-2">
            <button type="button" onClick={toggleNight} aria-pressed={night} title={night ? tt.day : tt.night} className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--edge)] bg-[var(--surface)] text-xl shadow-[0_3px_0_var(--shadow-ink)] transition-transform hover:scale-110">
              <span aria-hidden>{night ? "☀️" : "🌙"}</span>
              <span className="sr-only">{night ? tt.day : tt.night}</span>
            </button>
            <button type="button" onClick={toggleSound} aria-pressed={sound} title={sound ? st.soundOn : st.soundOff} className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--edge)] bg-[var(--surface)] text-xl shadow-[0_3px_0_var(--shadow-ink)] transition-transform hover:scale-110">
              <span aria-hidden>{sound ? "🔊" : "🔇"}</span>
              <span className="sr-only">{sound ? st.soundOn : st.soundOff}</span>
            </button>
          </div>
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
        <p className="mb-3 text-sm text-[var(--muted)]">{tt.mine.text}</p>
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

// Třpyt vody pod městečkem: tři pásy s posouvajícím se světlem (zátoka, řeka a laguna).
function HubWater() {
  const v = HUB.voda;
  const rect = (r: number[]) => ({ left: `${r[0] * 100}%`, top: `${Y(r[1]) * 100}%`, width: `${(r[2] - r[0]) * 100}%`, height: `${(Y(r[3]) - Y(r[1])) * 100}%` });
  return (
    <>
      <div aria-hidden className="hub-water pointer-events-none absolute" style={rect(v.zatoka)} />
      <div aria-hidden className="hub-water pointer-events-none absolute" style={rect(v.reka)} />
      <div aria-hidden className="hub-water pointer-events-none absolute rounded-[50%]" style={{ left: `${(v.laguna[0] - v.laguna[2]) * 100}%`, top: `${Y(v.laguna[1] - v.laguna[3]) * 100}%`, width: `${v.laguna[2] * 200}%`, height: `${(Y(v.laguna[1] + v.laguna[3]) - Y(v.laguna[1] - v.laguna[3])) * 100}%` }} />
    </>
  );
}
