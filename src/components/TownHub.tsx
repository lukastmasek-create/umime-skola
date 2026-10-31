"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DailyChallenges } from "@/components/DailyChallenges";
import { Modal, type Snapshot } from "@/components/ShopView";
import { readCam, runPath, type Geo, type Handle, type Pt } from "@/lib/market-cinema";
import { runEnter, type DoorKind } from "@/lib/market-cinema-doors";
import { camTransform, confettiBurst, createEventFx, createWeatherFx, dayPhaseOf, eventForDay, EVENT_SHOT, PHASE_TINT, resetCam, tweenCam, weatherForDay } from "@/lib/town-scenes";
import { TownNpcPanel } from "@/components/TownNpcPanel";
import { TownNarrator, type Art } from "@/components/TownNarrator";
import { MiniGame } from "@/components/TownMini";
import { TownStory } from "@/components/TownStory";
import { getTownStoryText } from "@/i18n/town-story";
import { CLASSIC_MINI_IDS, MINI, MINI_IDS, PLAYS_PER_DAY, type MiniId } from "@/lib/town-mini";
import { getTownMiniText } from "@/i18n/town-mini";
import { getTownLifeText } from "@/i18n/town-life";
import { type NpcKey, type NpcSnapshot } from "@/lib/town-npc";
import { sfx, sfxEnabled, setSfxEnabled } from "@/lib/market-sfx";
import { HERO_LOOKS, getHeroLook, heroSpriteUrl, setHeroLook } from "@/lib/hero";
import { COLLECT_ICON, COLLECT_COUNT, dailySpots, type CollectSpot } from "@/lib/town";
import { dayKey } from "@/lib/shop";
import { getMarketText } from "@/i18n/market";
import { getSkipText } from "@/i18n/market-world";
import { getTownHubText } from "@/i18n/town";
import { notifyAccountChanged } from "@/lib/account-events";
import type { Locale } from "@/i18n/config";
import hubData from "./mesto-hub-kotvy.json";
import { prefersReducedMotion } from "@/lib/motion";

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
const K = 16 / ((HUB as unknown as { units?: number }).units ?? 16); // záběr kamery je širší než 16 jednotek
const FIG = 0.06 * K;
const Y = (y: number) => (SKY + y * HUB.h) / BOX_H;
const at = (p: Pt) => ({ left: `${p[0] * 100}%`, top: `${Y(p[1]) * 100}%` });
const toBox = (p: Pt): Pt => [p[0], Y(p[1])];
const fromBoxY = (f: number) => (f * BOX_H - SKY) / HUB.h; // zlomek výšky rámečku → svislá poloha v obrázku městečka
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const wait = (ms: number, signal: AbortSignal) =>
  new Promise<void>((res, rej) => {
    if (signal.aborted) return rej(new DOMException("skip", "AbortError"));
    const id = window.setTimeout(res, ms);
    signal.addEventListener("abort", () => {
      window.clearTimeout(id);
      rej(new DOMException("skip", "AbortError"));
    }, { once: true });
  });
// Cedule a klikací plocha: raketa má ceduli mimo obrázek, proto stojí nad rampou; ostatní cedule se drží uvnitř rámečku.
const signOf = (id: string): Pt => {
  const pl = HUB.places[id];
  if (id === "stanice" && pl.raketa) return [pl.raketa[0], pl.raketa[1] - 0.05];
  return [clamp(pl.sign[0], 0.06, 0.94), pl.sign[1]];
};
// Hloubka hrdiny podle svislé polohy v obrázku: svět y = 3,3 (za první řadou domů) a 9 (za druhou řadou). Přímka z uzlů cest.
const DEPTH_V = (() => {
  const a = HUB.graf.nodes.m1[1];
  const b = HUB.graf.nodes.u1[1];
  const ya = HUB.graf.world.m1[1];
  const yb = HUB.graf.world.u1[1];
  const k = (b - a) / (yb - ya);
  return (wy: number) => a + k * (wy - ya);
})();
const V_FRONT = DEPTH_V(3.3);
const V_BACK = DEPTH_V(9.0);

const nearestNode = (p: Pt): string => {
  let best = "hub";
  let bd = Infinity;
  for (const [k, q] of Object.entries(HUB.graf.nodes)) {
    const d = Math.hypot((q[0] - p[0]) * HUB.w, (q[1] - p[1]) * HUB.h);
    if (d < bd) {
      bd = d;
      best = k;
    }
  }
  return best;
};

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
  knihovnice_w: { f: "knihovnice-chuze", n: 16, o: 1.7, tz: 0.62, dur: 0.9 },
  pekar_w: { f: "pekar-chuze", n: 16, o: 1.9, tz: 0.62, dur: 0.9 },
  kluk_w: { f: "kluk-chuze", n: 16, o: 1.7, tz: 0.55, dur: 0.7 },
} satisfies Record<string, Spr>;
type SK = keyof typeof SPR;

const FOLK: { k: SK; key: NpcKey; flip?: boolean }[] = [
  { k: "knihovnice", key: "knihovnice" },
  { k: "pekar", key: "pekar" },
  { k: "kluk", key: "kluk" },
  { k: "kocka", key: "kocka" },
  { k: "babicka", key: "babicka", flip: true },
  { k: "ovce", key: "ovce", flip: true },
  { k: "slepice", key: "slepice" },
  { k: "farmar", key: "farmar" },
];

// Kdo se po městečku prochází: trasa po uzlech grafu cest, rychlost (šířky obrázku za sekundu) a sprity pro chůzi a stání.
const WALKERS: Partial<Record<NpcKey, { nodes: string[]; speed: number; walk: SK; idle?: SK }>> = {
  knihovnice: { nodes: ["m2", "m3", "m4"], speed: 0.022, walk: "knihovnice_w", idle: "knihovnice" },
  pekar: { nodes: ["m5", "hub", "m7"], speed: 0.024, walk: "pekar_w", idle: "pekar" },
  kluk: { nodes: ["m4", "m5", "hub", "most", "l1"], speed: 0.034, walk: "kluk_w", idle: "kluk" },
  babicka: { nodes: ["most_z", "m1", "m2", "kurzy"], speed: 0.016, walk: "babicka" },
  farmar: { nodes: ["l1", "l3"], speed: 0.018, walk: "farmar" }, // jen po dolní cestě, ne přes raketovou rampu
};
type WalkerState = { pts: Pt[]; cum: number[]; total: number; dist: number; dir: 1 | -1; wait: number; moving: boolean; mode: string };

type Phase = { kind: "path" | "space" | "pirate" | "portal"; id: string; target?: PlaceDef } | null;
type Collect = { loggedIn: boolean; day: string; spots: CollectSpot[]; collected: number[]; bonus: boolean };

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

const AMBIENT_FX: Record<string, number> = { festival: 0.55, fireworks: 0, rain: 0.45, balloons: 0.55, market: 0.7 };
const ls = {
  get(k: string) {
    try {
      return window.localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set(k: string, v: string) {
    try {
      window.localStorage.setItem(k, v);
    } catch {}
  },
};

export function TownHub({ locale }: { locale: Locale }) {
  const tt = getTownHubText(locale);
  const m = getMarketText(locale);
  const st = getSkipText(locale);
  const tl = getTownLifeText(locale);
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>(null);
  const [gen, setGen] = useState(0);
  const [sound, setSound] = useState(true);
  const [mode, setMode] = useState<"auto" | "day" | "night">("auto");
  const [hour, setHour] = useState(12);
  const [look, setLook] = useState(0);
  const [pickHero, setPickHero] = useState(false);
  const [miniOpen, setMiniOpen] = useState<MiniId | null>(null);
  const [storyOpen, setStoryOpen] = useState(false);
  const [full, setFull] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const fullRef = useRef(false);
  const panSnap = useRef(true); // po přepnutí celé obrazovky skočí kamera rovnou na hrdinu
  useEffect(() => {
    fullRef.current = full;
    panSnap.current = true;
    // v režimu přes celé okno se schová hlavička a patička stránky (viz .town-full v globals.css)
    document.documentElement.classList.toggle("town-full", full);
    return () => document.documentElement.classList.remove("town-full");
  }, [full]);
  const subRef = useRef<HTMLDivElement>(null);
  const storyText = getTownStoryText(locale);
  const [miniLeft, setMiniLeft] = useState<Record<MiniId, number>>(() => Object.fromEntries(MINI_IDS.map((id) => [id, PLAYS_PER_DAY])) as Record<MiniId, number>);
  const miniText = getTownMiniText(locale);
  const [board, setBoard] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const [shop, setShop] = useState<Snapshot | null>(null);
  const [col, setCol] = useState<Collect>({ loggedIn: false, day: dayKey(), spots: dailySpots(dayKey()), collected: [], bonus: false });
  const [pop, setPop] = useState<{ n: number; text: string; p: Pt } | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [bubble, setBubble] = useState<{ k: string; text: string } | null>(null);
  const [openNpc, setOpenNpc] = useState<NpcKey | null>(null);
  const [npcSnap, setNpcSnap] = useState<NpcSnapshot | null>(null);
  const [npcPoints, setNpcPoints] = useState(0);
  const [cine, setCine] = useState<"intro" | "event" | "reward" | "enter" | "talk" | "locked" | null>(null);
  // vypravěč cut scény (portrét, jméno a postupně vypisovaný text); narrNext posune scénu dál
  const [narr, setNarr] = useState<{ who: NpcKey; text: string; title?: string; n: number } | null>(null);
  const narrNext = useRef<(() => void) | null>(null);
  const [heroSay, setHeroSay] = useState<string | null>(null);
  const [talking, setTalking] = useState(false);
  const [barsOn, setBarsOn] = useState(false);
  const [fade, setFade] = useState(false);
  const handle = useRef<Handle | null>(null);
  const scene = useRef<AbortController | null>(null);
  const camNow = useRef<{ p: Pt; z: number } | null>(null); // kamera cut scény nebo rozhovoru (null = volná hra)
  const focus = useRef<(() => Pt | null) | null>(null); // co má být uprostřed obrazovky (px v rámečku), jinak hrdina
  const focusY = useRef(0.55);
  const view = useRef<HTMLDivElement>(null);
  const space3d = useRef<HTMLDivElement>(null);
  const heroBubble = useRef<HTMLDivElement>(null);
  const talkRef = useRef<NpcKey | null>(null); // s kým hrdina mluví nebo ke komu jde (ten stojí a dívá se na něj)
  const face = useRef<Partial<Record<NpcKey, boolean>>>({});
  const closeNpcRef = useRef<() => void>(() => {});
  const seq = useRef(0);
  const busy = useRef(false);
  const box = useRef<HTMLDivElement>(null);
  const cam = useRef<HTMLDivElement>(null);
  const sky = useRef<HTMLDivElement>(null);
  const bgDark = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const hero = useRef<HTMLDivElement>(null);
  const heroSpr = useRef<HTMLSpanElement>(null);
  const heroP = useRef<Pt>(HUB.hrdina);
  const visitRef = useRef<(p: PlaceDef) => void>(() => {});
  const [near, setNear] = useState<string | null>(null);
  const rocket = useRef<HTMLDivElement>(null);
  const bars = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLDivElement>(null);
  const dog = useRef<HTMLDivElement>(null);
  const dogSpr = useRef<HTMLSpanElement>(null);
  const birds = useRef<(HTMLDivElement | null)[]>([]);
  const npcEl = useRef<Record<string, HTMLDivElement | null>>({});
  const npcFig = useRef<Record<string, HTMLButtonElement | null>>({});
  const npcSpr = useRef<Record<string, HTMLSpanElement | null>>({});
  const fxCv = useRef<HTMLCanvasElement>(null);
  const confettiCv = useRef<HTMLCanvasElement>(null);
  const fxStrength = useRef(0);
  const openRef = useRef<NpcKey | null>(null);
  const started = useRef(false);
  const eventId = useMemo(() => eventForDay(dayKey()), []);
  const weather = useMemo(() => (eventForDay(dayKey()) === "rain" ? "rain" : weatherForDay(dayKey())), []);
  const wxCv = useRef<HTMLCanvasElement>(null);
  const phaseNow = dayPhaseOf(hour);
  const night = mode === "night" || (mode === "auto" && phaseNow === "night");
  const nightRef = useRef(night);
  useEffect(() => {
    nightRef.current = night;
  }, [night]);
  const tint = mode === "auto" ? PHASE_TINT[phaseNow] : null;
  const lampsOn = night || (mode === "auto" && phaseNow === "dusk");
  const eventText = tl.events.find((e) => e.id === eventId) ?? tl.events[0];

  useEffect(() => {
    openRef.current = openNpc;
  }, [openNpc]);
  useEffect(() => {
    const id = window.setTimeout(() => {
      setSound(sfxEnabled());
      const m = ls.get("town-mode");
      if (m === "day" || m === "night" || m === "auto") setMode(m);
      else if (ls.get("town-night") === "1") setMode("night");
      // městečko se vždy ukáže celé (výchozí režim přes celé okno), vypnout lze tlačítkem
      if (ls.get("town-full") !== "0") setFull(true);
      const d = new Date();
      setHour(d.getHours() + d.getMinutes() / 60);
      setLook(getHeroLook());
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
    fetch("/api/mestecko/npc")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (off || !j || j.error) return;
        setNpcSnap(j.npc);
        setNpcPoints(j.points ?? 0);
      })
      .catch(() => {});
    return () => {
      off = true;
    };
  }, []);

  const worldOpen = (id: WorldKey) => id === "pirate" || !!shop?.worlds?.includes(id === "sea" ? "sea" : id);

  // obyvatelé: po cestách chodí knihovnice, pekař, kluk, babička a farmář; s kým si hráč povídá, ten stojí
  useEffect(() => {
    const reduced = prefersReducedMotion();
    const ratio = HUB.h / HUB.w;
    const states: Record<string, WalkerState> = {};
    const poly = (nodes: string[]) => {
      const out: Pt[] = [];
      for (let i = 0; i < nodes.length - 1; i++) {
        const seg = route(nodes[i], nodes[i + 1]).map((n) => HUB.graf.nodes[n]);
        out.push(...(i === 0 ? seg : seg.slice(1)));
      }
      return out;
    };
    for (const [key, cfg] of Object.entries(WALKERS)) {
      const pts = poly(cfg.nodes);
      const cum = [0];
      for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], (pts[i][1] - pts[i - 1][1]) * ratio));
      states[key] = { pts, cum, total: cum[cum.length - 1], dist: Math.random() * cum[cum.length - 1], dir: Math.random() < 0.5 ? 1 : -1, wait: Math.random() * 5, moving: false, mode: "" };
    }
    const home: Record<string, Pt> = HUB.npc as Record<string, Pt>;
    let raf = 0;
    let last = performance.now();
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    if (box.current) io.observe(box.current);
    const place = (key: string, x: number, y: number, flip: boolean) => {
      const el = npcEl.current[key];
      const fig = npcFig.current[key];
      if (!el || !fig) return;
      el.style.left = `${x * 100}%`;
      el.style.top = `${Y(y) * 100}%`;
      el.style.zIndex = String((y > V_FRONT ? 40 : y > V_BACK ? 25 : 10) + Math.round(y * 4)); // za budovami skryje vrstva hub-a/hub-b
      orient(key, flip);
    };
    // otočení figurky; při rozhovoru se obyvatel dívá na hrdinu
    const orient = (key: string, flip: boolean) => {
      const fig = npcFig.current[key];
      if (!fig) return;
      const f = FOLK.find((c) => c.key === key);
      const s = SPR[f?.k ?? "kluk"];
      const fc = face.current[key as NpcKey];
      const fl = (fc === undefined ? (flip ? -1 : 1) : fc ? -1 : 1) * (f?.flip ? -1 : 1);
      fig.style.transform = `translate(-50%, ${-(0.5 + s.tz / s.o) * 100}%) scaleX(${fl})`;
    };
    const setSprite = (key: string, sk: SK, moving: boolean) => {
      const sp = npcSpr.current[key];
      if (!sp) return;
      const spr = SPR[sk];
      const mode = `${sk}:${moving}`;
      if (sp.dataset.mode !== mode) {
        sp.dataset.mode = mode;
        sp.style.backgroundImage = `url(/home/mesto/${spr.f}.webp)`;
        sp.style.setProperty("--n", String(spr.n));
        sp.style.animationDuration = `${spr.dur}s`;
      }
      sp.style.animationPlayState = moving || WALKERS[key as NpcKey]?.idle || !WALKERS[key as NpcKey] ? "running" : "paused";
    };
    // výchozí polohy (než se rozjede animace, nebo při omezeném pohybu)
    for (const f of FOLK) place(f.key, home[f.key][0], home[f.key][1], false);
    if (reduced) {
      return () => io.disconnect();
    }
    const street = poly(["m1", "m2", "m3", "m4", "m5", "hub", "m7", "obchod", "m8", "m9"]); // pes běhá po hlavní ulici přesně po cestě
    const cumS = [0];
    for (let i = 1; i < street.length; i++) cumS.push(cumS[i - 1] + Math.hypot(street[i][0] - street[i - 1][0], (street[i][1] - street[i - 1][1]) * ratio));
    const totalS = cumS[cumS.length - 1];
    const t0 = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = (now - t0) / 1000;
      // pes: tam a zpět s pauzou
      const cyc = (t % 36) / 36;
      const run = cyc < 0.45 ? cyc / 0.45 : cyc < 0.5 ? 1 : cyc < 0.95 ? 1 - (cyc - 0.5) / 0.45 : 0;
      const dir = cyc < 0.45 ? 1 : cyc < 0.5 ? 0 : cyc < 0.95 ? -1 : 0;
      const d = Math.max(0, Math.min(1, run)) * totalS;
      let i = 1;
      while (i < cumS.length - 1 && cumS[i] < d) i++;
      const k = (d - cumS[i - 1]) / Math.max(1e-6, cumS[i] - cumS[i - 1]);
      const px = street[i - 1][0] + (street[i][0] - street[i - 1][0]) * Math.max(0, Math.min(1, k));
      const py = street[i - 1][1] + (street[i][1] - street[i - 1][1]) * Math.max(0, Math.min(1, k)) + 0.012;
      const el = dog.current;
      const sp = dogSpr.current;
      if (el && sp) {
        el.style.left = `${px * 100}%`;
        el.style.top = `${Y(py) * 100}%`;
        el.style.transform = `translate(-50%, ${-(0.5 + SPR.pes_bezi.tz / SPR.pes_bezi.o) * 100}%) scaleX(${dir < 0 ? -1 : 1})`;
        const running = dir !== 0;
        sp.style.animationPlayState = "running";
        sp.style.backgroundImage = `url(/home/mesto/${running ? "pes-bezi" : "pes-sedi"}.webp)`;
        sp.style.setProperty("--n", running ? "16" : "24");
        sp.style.animationDuration = running ? "0.6s" : "1.8s";
      }
      birds.current.forEach((b, bi) => {
        if (!b) return;
        const p = ((t * (0.012 + bi * 0.004) + bi * 0.37) % 1.3) - 0.15;
        b.style.left = `${p * 100}%`;
        b.style.top = `${(0.01 + bi * 0.035 + Math.sin(t * 0.7 + bi) * 0.008) * 100}%`;
      });
      // obyvatelé (kdo právě mluví s hrdinou, stojí a dívá se na něj)
      const tk = talkRef.current;
      if (tk && !WALKERS[tk]) orient(tk, false);
      for (const [key, w] of Object.entries(states)) {
        const cfg = WALKERS[key as NpcKey]!;
        if (tk === key) {
          setSprite(key, cfg.idle ?? cfg.walk, false);
          orient(key, false);
          continue;
        }
        if (w.wait > 0) {
          w.wait -= dt;
          w.moving = false;
          if (w.wait <= 0) w.moving = true;
        } else {
          w.moving = true;
          w.dist += w.dir * cfg.speed * dt;
          if (w.dist >= w.total || w.dist <= 0) {
            w.dist = Math.max(0, Math.min(w.total, w.dist));
            w.dir = w.dir === 1 ? -1 : 1;
            w.wait = 4 + Math.random() * 6;
            w.moving = false;
          }
        }
        let j = 1;
        while (j < w.cum.length - 1 && w.cum[j] < w.dist) j++;
        const kk = (w.dist - w.cum[j - 1]) / Math.max(1e-6, w.cum[j] - w.cum[j - 1]);
        const q = Math.max(0, Math.min(1, kk));
        const x = w.pts[j - 1][0] + (w.pts[j][0] - w.pts[j - 1][0]) * q;
        const y = w.pts[j - 1][1] + (w.pts[j][1] - w.pts[j - 1][1]) * q + 0.01;
        const faceRight = w.pts[j][0] - w.pts[j - 1][0] >= 0 ? w.dir === 1 : w.dir !== 1;
        place(key, x, y, !faceRight);
        setSprite(key, w.moving ? cfg.walk : (cfg.idle ?? cfg.walk), w.moving);
      }
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  // 3D postavy: do obyvatel, psa i hrdiny se místo pásů snímků kreslí jejich 3D modely z Blenderu (three.js se načte až teď)
  useEffect(() => {
    let off = false;
    let h: { stop: () => void } | null = null;
    const id = window.setTimeout(() => {
      void import("@/lib/town3d/folk").then(({ startFolk3D }) => {
        if (off) return;
        h = startFolk3D(
          () => [
            ...FOLK.map((f) => npcSpr.current[f.key]),
            dogSpr.current,
            heroSpr.current,
          ],
          { night: () => nightRef.current },
        );
      });
    }, 300);
    return () => {
      off = true;
      window.clearTimeout(id);
      h?.stop();
    };
  }, []);

  // obyvatelé občas něco prohodí (bublina nad hlavou)
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let t1 = 0;
    let t2 = 0;
    const schedule = () => {
      t1 = window.setTimeout(() => {
        if (!openRef.current && !talkRef.current && !scene.current && !document.hidden) {
          const f = FOLK[Math.floor(Math.random() * FOLK.length)];
          const lines = Math.random() < 0.5 ? tl.ambient : tl.npc[f.key].chat;
          setBubble({ k: f.key, text: lines[Math.floor(Math.random() * lines.length)] });
          t2 = window.setTimeout(() => setBubble((c) => (c?.k === f.key ? null : c)), 3200);
        }
        schedule();
      }, 14000 + Math.random() * 12000);
    };
    schedule();
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [tl]);

  // efekty denní události na plátně přes celé městečko
  useEffect(() => {
    const canvas = fxCv.current;
    const bx = box.current;
    if (!canvas || !bx || prefersReducedMotion()) return;
    const fx = createEventFx(canvas, eventId);
    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(bx.clientWidth * dpr);
      canvas.height = Math.round(bx.clientHeight * dpr);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(bx);
    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(bx);
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (visible) fx.draw(now, fxStrength.current);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [eventId, gen]);
  // během rozhovoru šipky / WASD rozhovor zavřou a hrdina může hned jít dál
  useEffect(() => {
    if (!openNpc) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (/^(arrow(up|down|left|right)|[wasd])$/.test(e.key.toLowerCase()) && !(e.target instanceof HTMLInputElement)) closeNpcRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openNpc]);
  // ovládání z klávesnice: WASD nebo šipky vedou hrdinu po cestách, E / Enter / mezerník vstoupí do budovy u dveří.
  // Když cesta zvoleným směrem z místa nevede, hrdina dojde po ulici k nejbližší odbočce tím směrem (nezasekne se).
  const free = !phase && !cine && !board && !openNpc && !miniOpen && !storyOpen && !pickHero;
  useEffect(() => {
    const h = hero.current;
    const spr = heroSpr.current;
    if (!free || !h || !spr) return;
    const nodes = HUB.graf.nodes;
    const nb: Record<string, string[]> = {};
    for (const n of Object.keys(nodes)) nb[n] = [];
    for (const [x, y] of HUB.graf.edges) {
      nb[x].push(y);
      nb[y].push(x);
    }
    const dirOf = (a: Pt, b: Pt): [number, number, number] => {
      const dx = (b[0] - a[0]) * HUB.w;
      const dy = (b[1] - a[1]) * HUB.h;
      const L = Math.hypot(dx, dy) || 1;
      return [dx / L, dy / L, L / HUB.w];
    };
    const dist = (a: Pt, b: Pt) => Math.hypot((a[0] - b[0]) * HUB.w, (a[1] - b[1]) * HUB.h);
    // úsek, po kterém hrdina jde: z bodu A (uzel nebo místo, kde stál u obyvatele) do uzlu `to`
    let seg: { A: Pt; from: string | null; to: string; t: number; steer?: boolean } | null = null;
    let steering = false; // jde se k odbočce: neotáčet se zpět, odkud jsme přišli
    let node: string | null = null;
    let prev: string | null = null;
    {
      const n = nearestNode(heroP.current);
      if (dist(nodes[n], heroP.current) < 8) {
        node = n;
        heroP.current = nodes[n];
      } else seg = { A: heroP.current, from: null, to: n, t: 0 };
    }
    let flip = h.style.transform.includes("scaleX(-1)") || h.style.transform.includes("scale(-") ? -1 : 1;
    let walking = false;
    let nearId: string | null = null;
    const apply = () => {
      h.style.left = `${heroP.current[0] * 100}%`;
      h.style.top = `${Y(heroP.current[1]) * 100}%`;
      h.style.opacity = "1";
      h.style.transformOrigin = "";
      h.style.transform = `translate(-50%, ${-(0.5 + 0.55 / 1.6) * 100}%) scaleX(${flip})`;
    };
    const setWalk = (on: boolean) => {
      if (on === walking) return;
      walking = on;
      spr.style.setProperty("--n", on ? "16" : "24");
      spr.style.backgroundImage = `url(${heroSpriteUrl(on ? "chuze" : "stoji", getHeroLook())})`;
      spr.style.animationDuration = on ? "0.7s" : "3s";
    };
    // první krok z uzlu `from` směrem (ux, uy): přímá cesta, nebo cesta k nejbližší odbočce, která tím směrem vede
    const pickStep = (from: string, ux: number, uy: number): { to: string; steer: boolean } | null => {
      let best: string | null = null;
      let bs = 0.3;
      for (const m of nb[from]) {
        if (steering && m === prev) continue;
        const [ex, ey] = dirOf(nodes[from], nodes[m]);
        const sc = ex * ux + ey * uy;
        if (sc > bs) {
          bs = sc;
          best = m;
        }
      }
      if (best) return { to: best, steer: false };
      const score = (u: string, m: string) => {
        const [ex, ey] = dirOf(nodes[u], nodes[m]);
        return ex * ux + ey * uy;
      };
      if (nb[from].length < 2 && score(from, nb[from][0]) < -0.5) return null; // u dveří na konci cesty: směrem do budovy se nejde
      const d: Record<string, number> = { [from]: 0 };
      const par: Record<string, string> = {};
      const done = new Set<string>();
      const todo = [from];
      let goal: string | null = null;
      while (todo.length) {
        todo.sort((x, y) => d[x] - d[y]);
        const u = todo.shift()!;
        if (done.has(u)) continue;
        done.add(u);
        if (d[u] > 0.45) break;
        if (u !== from && nb[u].some((m) => m !== par[u] && score(u, m) > 0.6)) {
          goal = u;
          break;
        }
        for (const m of nb[u]) {
          if (steering && u === from && m === prev) continue; // necouvat, odkud jsme přišli
          const nd = d[u] + dirOf(nodes[u], nodes[m])[2];
          if (d[m] === undefined || nd < d[m]) {
            d[m] = nd;
            par[m] = u;
            todo.push(m);
          }
        }
      }
      if (!goal) return null;
      let g = goal;
      while (par[g] !== from) g = par[g];
      return { to: g, steer: true };
    };
    const keys = new Set<string>();
    const MAP: Record<string, string> = { w: "u", arrowup: "u", s: "d", arrowdown: "d", a: "l", arrowleft: "l", d: "r", arrowright: "r" };
    const CODE: Record<string, string> = { KeyW: "u", KeyS: "d", KeyA: "l", KeyD: "r" };
    const typing = (t: EventTarget | null) => t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
    const keyOf = (e: KeyboardEvent) => MAP[e.key.toLowerCase()] ?? CODE[e.code];
    const onDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || typing(e.target)) return;
      const k = e.key.toLowerCase();
      const dir = keyOf(e);
      if (dir) {
        keys.add(dir);
        e.preventDefault();
        if (e.target instanceof HTMLElement && e.target !== document.body) e.target.blur(); // šipky nemají posouvat fokus
      } else if ((k === "e" || e.code === "KeyE" || k === "enter" || k === " ") && nearId && !(e.target instanceof HTMLButtonElement)) {
        const pl = PLACES.find((q) => q.id === nearId);
        if (pl) {
          e.preventDefault();
          keys.clear();
          visitRef.current(pl);
        }
      }
    };
    const onUp = (e: KeyboardEvent) => {
      const k = keyOf(e);
      if (k) keys.delete(k);
    };
    const onBlur = () => keys.clear();
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", onBlur);
    let raf = 0;
    let last = performance.now();
    const SPEED = 0.085; // šířky obrázku za sekundu
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const dx = (keys.has("r") ? 1 : 0) - (keys.has("l") ? 1 : 0);
      const dy = (keys.has("d") ? 1 : 0) - (keys.has("u") ? 1 : 0);
      let moved = false;
      if (dx || dy) {
        const dl = Math.hypot(dx, dy);
        const ux = dx / dl;
        const uy = dy / dl;
        // krok za snímek se rozloží do více krátkých úseků (graf je hustý, uzly leží kousek od sebe)
        let budget = SPEED * dt;
        for (let guard = 0; budget > 1e-6 && guard < 40; guard++) {
          if (!seg && node) {
            const step = pickStep(node, ux, uy);
            if (step) seg = { A: nodes[node], from: node, to: step.to, t: 0, steer: step.steer };
            steering = !!step?.steer;
          }
          if (!seg) break;
          const B = nodes[seg.to];
          const [ex, ey, L] = dirOf(seg.A, B);
          const sc = ex * ux + ey * uy;
          // proti směru úseku: otočit se (zpět k výchozímu uzlu); kolmo: pokračovat k odbočce
          if (sc < -0.3 && seg.from && !seg.steer) seg = { A: B, from: seg.to, to: seg.from, t: 1 - seg.t };
          const [fx] = dirOf(seg.A, nodes[seg.to]);
          const len = Math.max(1e-4, L);
          seg.t += budget / len;
          moved = true;
          if (Math.abs(fx) > 0.2) flip = fx < 0 ? -1 : 1;
          if (seg.t >= 1) {
            budget = (seg.t - 1) * len;
            prev = seg.from;
            node = seg.to;
            heroP.current = nodes[node];
            seg = null;
            if (PLACES.some((p2) => p2.id === node)) break; // u dveří se zastaví
          } else {
            budget = 0;
            const A = seg.A;
            const C = nodes[seg.to];
            heroP.current = [A[0] + (C[0] - A[0]) * seg.t, A[1] + (C[1] - A[1]) * seg.t];
            node = null;
          }
        }
        apply();
      } else steering = false;
      setWalk(moved);
      // stojí u dveří?
      let id: string | null = null;
      if (!seg && node && PLACES.some((p2) => p2.id === node)) id = node;
      if (id !== nearId) {
        nearId = id;
        setNear(id);
      }
    };
    apply();
    spr.style.setProperty("--n", "24");
    spr.style.backgroundImage = `url(${heroSpriteUrl("stoji", getHeroLook())})`;
    spr.style.animationDuration = "3s";
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", onBlur);
      setNear(null);
    };
  }, [free, gen]);
  // hloubka: hrdina je před budovami, mezi řadami domů, nebo za nimi (vrstvy hub-b a hub-a se kreslí nad ním)
  useEffect(() => {
    let raf = 0;
    let zone = -1;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const h = hero.current;
      const b = box.current;
      if (!h || !b) return;
      const t = h.style.top;
      const f = t.endsWith("%") ? parseFloat(t) / 100 : parseFloat(t) / Math.max(1, b.clientHeight);
      if (!Number.isFinite(f)) return;
      const v = (f * BOX_H - SKY) / HUB.h; // svislá poloha v obrázku městečka (0 až 1)
      const z = v > V_FRONT ? 2 : v > V_BACK ? 1 : 0;
      if (z !== zone) {
        zone = z;
        h.style.zIndex = String(z === 2 ? 40 : z === 1 ? 25 : 10);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [gen]);
  // městečko vyplní okno (na celé obrazovce i v rámečku na stránce) a kamera plynule sleduje hrdinu, v cut scéně bod, na který se díváme.
  // Bublina hrdiny se přilepí nad jeho hlavu (hrdina je zrcadlený, proto bublina není uvnitř něj).
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let x = 0;
    let y = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const b = box.current;
      const v = view.current;
      const h = hero.current;
      if (!b || !v) return;
      const br = b.getBoundingClientRect();
      const hr = h?.getBoundingClientRect();
      const heroAt: Pt | null = hr && hr.width ? [hr.left + hr.width / 2 - br.left, hr.top + hr.height * 0.62 - br.top] : null;
      const bub = heroBubble.current;
      if (bub && hr) {
        bub.style.left = `${hr.left + hr.width / 2 - br.left}px`;
        bub.style.top = `${hr.top + hr.height * 0.2 - br.top}px`;
      }
      const f = focus.current?.() ?? heroAt;
      if (!f) return;
      const vw = v.clientWidth;
      const vh = v.clientHeight;
      const tx = clamp(vw / 2 - f[0], Math.min(0, vw - b.offsetWidth), 0);
      const ty = clamp(vh * focusY.current - f[1], Math.min(0, vh - b.offsetHeight), 0);
      const k = panSnap.current ? 1 : 1 - Math.exp(-5 * dt);
      panSnap.current = false;
      x += (tx - x) * k;
      y += (ty - y) * k;
      b.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  // počasí dne (déšť, sníh, mlha) na samostatném plátně nad městečkem
  useEffect(() => {
    const canvas = wxCv.current;
    const bx = box.current;
    if (!canvas || !bx || prefersReducedMotion()) return;
    const fx = createWeatherFx(canvas, weather);
    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(bx.clientWidth * dpr);
      canvas.height = Math.round(bx.clientHeight * dpr);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(bx);
    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(bx);
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (visible) fx.draw(now, 0.85);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [weather, gen]);
  useEffect(() => {
    const base = eventId === "fireworks" ? (night ? 0.7 : 0) : (AMBIENT_FX[eventId] ?? 0);
    if (!cine) fxStrength.current = base;
  }, [eventId, night, cine]);

  // budovy a obchod se načtou dopředu, ať po vstupu dveřmi nečeká prázdná obrazovka
  useEffect(() => {
    for (const p of PLACES) if (p.href) router.prefetch(`/${locale}${p.href}`);
    router.prefetch(`/${locale}/uzivatelsky-obchod`);
  }, [router, locale]);
  const leave = useCallback(
    (href: string) => {
      router.push(href);
    },
    [router],
  );

  const geoFor = useCallback((walk: Pt[], start: Pt, extra?: Partial<Geo>): Geo => ({ toBox, rocket: HUB.places.stanice.raketa ?? HUB.places.stanice.door, start, walk, ...extra }), []);

  // vstup do budovy: kamera najede na dveře, hrdina se zmenší a zmizí uvnitř
  const enterDoor = useCallback((onEnd: () => void) => {
    const c = cam.current;
    const b = box.current;
    const h = hero.current;
    if (!c || !b || !h) return onEnd();
    setCine("enter");
    const cw = b.clientWidth;
    const chh = b.clientHeight;
    const hx = parseFloat(h.style.left) || cw / 2;
    const hy = parseFloat(h.style.top) || chh / 2;
    const flipped = h.style.transform.includes("scale(-");
    const z0 = readCam(c).s;
    sfx.creak();
    const t0 = performance.now();
    let raf = 0;
    const frame = (now: number) => {
      const k = Math.min(1, (now - t0) / 780);
      const e = k * k * (3 - 2 * k);
      const z = z0 + 1.0 * e;
      const tx = Math.min(0, Math.max(cw - cw * z, cw / 2 - z * hx));
      const ty = Math.min(0, Math.max(chh - chh * z, chh * 0.55 - z * hy));
      c.style.transform = `translate(${tx}px, ${ty}px) scale(${z})`;
      h.style.opacity = String(1 - e);
      h.style.transform = `translate(-50%, -84.4%) scale(${(flipped ? -1 : 1) * (1 - 0.45 * e)}, ${1 - 0.45 * e})`;
      if (k < 1) raf = requestAnimationFrame(frame);
      else {
        setFade(true);
        window.setTimeout(() => {
          setCine(null);
          setFade(false);
          onEnd();
        }, 230);
      }
    };
    raf = requestAnimationFrame(frame);
    handle.current = { stop: () => cancelAnimationFrame(raf), skip: () => cancelAnimationFrame(raf) } as Handle;
  }, []);

  useEffect(() => {
    if (!phase) return;
    const r = { box: box.current, cam: cam.current, sky: sky.current, bgDark: bgDark.current, cv: cv.current, hero: hero.current, heroSpr: heroSpr.current, rocket: rocket.current, bars: bars.current, count: count.current };
    if (!r.box || !r.cam || !r.cv || !r.hero || !r.heroSpr) return;
    const start = heroP.current;
    const from = nearestNode(start);
    const onNode = Math.hypot((HUB.graf.nodes[from][0] - start[0]) * HUB.w, (HUB.graf.nodes[from][1] - start[1]) * HUB.h) < 6;
    const rt = (to: string) => {
      const ids = route(from, to);
      const pts = ids.map((n) => HUB.graf.nodes[n]);
      return onNode ? pts.slice(1) : pts;
    };
    if (phase.kind === "path" && phase.target) {
      const place = phase.target;
      const walk = rt(place.id);
      const geo = geoFor(walk, start);
      handle.current = runPath(
        r as Parameters<typeof runPath>[0],
        geo,
        () => {
          const door = HUB.places[place.id]?.door;
          heroP.current = HUB.graf.nodes[place.id] ?? start;
          const done = () => {
            if (place.href) leave(`/${locale}${place.href}`);
            else {
              setPhase(null);
              setGen((g) => g + 1);
              setBoard(true);
            }
          };
          if (door) handle.current = runEnter(r as Parameters<typeof runEnter>[0], toBox(door), place.id as DoorKind, done);
          else enterDoor(done);
        },
        false,
      );
    } else if (phase.kind === "space") {
      // hrdina dojde k rampě, pak se obraz prolne do 3D letu na stanici (three.js se načítá už během chůze)
      let alive = true;
      const mod = import("@/lib/town3d/space");
      handle.current = runPath(r as Parameters<typeof runPath>[0], geoFor(rt("stanice"), start), () => {
        void mod.then(({ runSpace3D }) => {
          const el = space3d.current;
          if (!alive || !el) return;
          handle.current = runSpace3D(el, { look: getHeroLook(), onEnd: () => leave(`/${locale}/uzivatelsky-obchod?svet=space&film=1`) });
        });
      }, false);
      return () => {
        alive = false;
        handle.current?.stop();
      };
    } else if (phase.kind === "pirate") {
      // hrdina dojde k přístavu, pak se obraz prolne do 3D vyplutí galéry (three.js se načítá už během chůze)
      let alive = true;
      const mod = import("@/lib/town3d/pirate");
      handle.current = runPath(r as Parameters<typeof runPath>[0], geoFor(rt("pristav"), start), () => {
        void mod.then(({ runPirate3D }) => {
          const el = space3d.current;
          if (!alive || !el) return;
          handle.current = runPirate3D(el, { look: getHeroLook(), onEnd: () => leave(`/${locale}/uzivatelsky-obchod?svet=pirate&film=1`) });
        });
      }, false);
      return () => {
        alive = false;
        handle.current?.stop();
      };
    } else {
      // les, hrad a moře: hrdina dojde k místu, pak 3D cut scéna z town3d/films (three.js se načítá už během chůze)
      const world = phase.target?.world ?? "forest";
      let alive = true;
      const mod = import("@/lib/town3d/films");
      handle.current = runPath(r as Parameters<typeof runPath>[0], geoFor(rt(phase.id), start), () => {
        void mod.then((films) => {
          const el = space3d.current;
          if (!alive || !el) return;
          const run = world === "castle" ? films.runCastle3D : world === "sea" ? films.runSea3D : films.runForest3D;
          handle.current = run(el, { look: getHeroLook(), onEnd: () => leave(`/${locale}/uzivatelsky-obchod?svet=${world}&film=1`) });
        });
      }, false);
      return () => {
        alive = false;
        handle.current?.stop();
      };
    }
    return () => handle.current?.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ------------------------------------------------------------------------------------------ cut scény
  // Scéna je asynchronní skript z kroků: kamera, chůze hrdiny, vypravěč s portrétem a bubliny nad postavami.
  // Přeskočení zruší signál; úklid vrátí kameru, hrdinu i obyvatele do volné hry.
  const artOf = (k: NpcKey): Art => {
    const sp = SPR[FOLK.find((f) => f.key === k)!.k];
    return { f: sp.f, n: sp.n, dur: sp.dur };
  };
  const setCamera = (p: Pt, z: number) => {
    const b = box.current;
    const c = cam.current;
    if (!b || !c) return;
    c.style.transformOrigin = "0 0";
    c.style.transform = camTransform(b, p, z).css;
    camNow.current = { p, z };
    // na celé obrazovce se okno posune tak, aby byl bod kamery uprostřed
    focus.current = () => {
      const bb = box.current;
      const cn = camNow.current;
      if (!bb || !cn) return null;
      const t = camTransform(bb, cn.p, cn.z);
      return [t.tx + cn.p[0] * bb.clientWidth * t.z, t.ty + cn.p[1] * bb.clientHeight * t.z];
    };
  };
  const camTo = (p: Pt, z: number, dur: number, signal?: AbortSignal) => tweenCam(camNow.current ?? { p: toBox(heroP.current), z: 1 }, { p, z }, dur, setCamera, signal);
  const releaseCam = async (dur: number) => {
      if (camNow.current) await camTo(camNow.current.p, 1, dur);
      camNow.current = null;
      focus.current = null;
      focusY.current = 0.55;
      resetCam(cam.current);
    };
  const heroPose = (kind: "stoji" | "chuze" | "radost") => {
    const s = heroSpr.current;
    if (!s) return;
    s.style.setProperty("--n", kind === "chuze" ? "16" : "24");
    s.style.backgroundImage = `url(${heroSpriteUrl(kind, getHeroLook())})`;
    s.style.animationDuration = kind === "chuze" ? "0.7s" : kind === "radost" ? "1.1s" : "3s";
  };
  const heroFace = (flip: number) => {
    const h = hero.current;
    if (!h) return;
    h.style.transformOrigin = "";
    h.style.transform = `translate(-50%, ${-(0.5 + 0.55 / 1.6) * 100}%) scaleX(${flip})`;
  };
  // hrdina dojde po bodech (souřadnice obrázku městečka); `zoom` = kamera jde s ním
  const walkHero = (pts: Pt[], signal: AbortSignal, zoom?: number, speed = 0.1) =>
      new Promise<void>((resolve, reject) => {
        const h = hero.current;
        if (!h) return resolve();
        const path: Pt[] = [heroP.current, ...pts];
        const ratio = HUB.h / HUB.w;
        const cum = [0];
        for (let i = 1; i < path.length; i++) cum.push(cum[i - 1] + Math.hypot(path[i][0] - path[i - 1][0], (path[i][1] - path[i - 1][1]) * ratio));
        const total = cum[cum.length - 1];
        if (total < 1e-4) return resolve();
        let d = 0;
        let last = performance.now();
        let stepAcc = 0;
        let flip = 1;
        heroPose("chuze");
        let raf = 0;
        const onAbort = () => {
          cancelAnimationFrame(raf);
          heroPose("stoji");
          reject(new DOMException("skip", "AbortError"));
        };
        if (signal.aborted) return onAbort();
        signal.addEventListener("abort", onAbort, { once: true });
        const frame = (now: number) => {
          const dt = Math.min(0.05, (now - last) / 1000);
          last = now;
          d = Math.min(total, d + speed * dt);
          let i = 1;
          while (i < cum.length - 1 && cum[i] < d) i++;
          const k = clamp((d - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1]), 0, 1);
          const A = path[i - 1];
          const B = path[i];
          const p: Pt = [A[0] + (B[0] - A[0]) * k, A[1] + (B[1] - A[1]) * k];
          heroP.current = p;
          if (Math.abs(B[0] - A[0]) > 1e-4) flip = B[0] < A[0] ? -1 : 1;
          h.style.left = `${p[0] * 100}%`;
          h.style.top = `${Y(p[1]) * 100}%`;
          h.style.opacity = "1";
          heroFace(flip);
          stepAcc += dt;
          if (stepAcc > 0.3) {
            stepAcc = 0;
            sfx.step();
          }
          if (zoom) setCamera(toBox(p), zoom);
          if (d >= total) {
            signal.removeEventListener("abort", onAbort);
            heroPose("stoji");
            resolve();
          } else raf = requestAnimationFrame(frame);
        };
        raf = requestAnimationFrame(frame);
      });
  const say = (who: NpcKey, text: string, signal: AbortSignal, title?: string) =>
      new Promise<void>((resolve, reject) => {
        if (signal.aborted) return reject(new DOMException("skip", "AbortError"));
        const onAbort = () => {
          narrNext.current = null;
          reject(new DOMException("skip", "AbortError"));
        };
        signal.addEventListener("abort", onAbort, { once: true });
        narrNext.current = () => {
          narrNext.current = null;
          signal.removeEventListener("abort", onAbort);
          resolve();
        };
        setNarr({ who, text, title, n: ++seq.current });
      });
  const heroLine = (text: string, ms: number) => {
    setHeroSay(text);
    window.setTimeout(() => setHeroSay((c) => (c === text ? null : c)), ms);
  };
  const npcLine = (k: NpcKey, text: string, ms: number) => {
    setBubble({ k, text });
    window.setTimeout(() => setBubble((c) => (c?.k === k && c.text === text ? null : c)), ms);
  };
  // kde právě stojí obyvatel (souřadnice obrázku městečka)
  const npcPos = (k: NpcKey): Pt => {
    const el = npcEl.current[k];
    const x = el ? parseFloat(el.style.left) / 100 : NaN;
    const yb = el ? parseFloat(el.style.top) / 100 : NaN;
    return Number.isFinite(x) && Number.isFinite(yb) ? [x, fromBoxY(yb)] : HUB.npc[k];
  };
  // hrdina dojde k obyvateli, ten se zastaví a oba se na sebe otočí; kamera se přiblíží na oba
  const approach = async (k: NpcKey, signal: AbortSignal, zoom = 1.5) => {
      talkRef.current = k;
      const np = npcPos(k);
      const nodes = HUB.graf.nodes;
      const pts = route(nearestNode(heroP.current), nearestNode(np)).map((n) => nodes[n]);
      const proj = (P: Pt, A: Pt, B: Pt) => {
        const ax = (B[0] - A[0]) * HUB.w;
        const ay = (B[1] - A[1]) * HUB.h;
        return (((P[0] - A[0]) * HUB.w) * ax + ((P[1] - A[1]) * HUB.h) * ay) / Math.max(1e-6, ax * ax + ay * ay);
      };
      // nechodit zbytečně k uzlu za hrdinou ani za obyvatelem
      if (pts.length >= 2 && proj(heroP.current, pts[0], pts[1]) > 0) pts.shift();
      if (pts.length >= 2 && clamp(proj(np, pts[pts.length - 2], pts[pts.length - 1]), 0, 1) < 1) pts.pop();
      const fromPt = pts.length ? pts[pts.length - 1] : heroP.current;
      const side = fromPt[0] <= np[0] ? -1 : 1;
      const spot: Pt = [np[0] + side * 0.042, np[1]];
      face.current[k] = side < 0; // obyvatel se otočí k hrdinovi
      await walkHero([...pts, spot], signal, zoom, 0.14);
      heroFace(side < 0 ? 1 : -1);
      await camTo(toBox([(spot[0] + np[0]) / 2, np[1] - 0.01]), zoom, 0.5, signal);
    };
  const runScene = async (kind: "intro" | "event" | "reward" | "talk" | "locked", script: (signal: AbortSignal) => Promise<void>, opt: { bars?: boolean; keepCam?: boolean } = {}) => {
      scene.current?.abort();
      const ac = new AbortController();
      scene.current = ac;
      setCine(kind);
      setOpenNpc(null);
      if (opt.bars !== false) setBarsOn(true);
      let ok = true;
      try {
        await script(ac.signal);
      } catch (e) {
        ok = false;
        if (!(e instanceof DOMException && e.name === "AbortError")) console.error(e);
      }
      if (scene.current !== ac) return false; // mezitím začala jiná scéna, ta si uklidí sama
      scene.current = null;
      setNarr(null);
      narrNext.current = null;
      setBarsOn(false);
      setHeroSay(null);
      heroPose("stoji");
      if (!ok || !opt.keepCam) {
        talkRef.current = null;
        face.current = {};
        await releaseCam(ok ? 0.8 : 0.35);
      }
      setCine(null);
      return ok;
    };
  const placeShot = (id: string, dy = 0): Pt => {
    const pl = HUB.places[id];
    const d = pl ? pl.door : HUB.hrdina;
    return toBox([d[0], d[1] + dy]);
  };
  const cheer = (ms: number) => {
      heroPose("radost");
      window.setTimeout(() => heroPose("stoji"), ms);
    };
  const playEvent = () => {
    const e = EVENT_SHOT[eventId];
    ls.set("town-event-day", dayKey());
    return runScene("event", async (sig) => {
      fxStrength.current = 1;
      sfx.horn();
      await camTo(toBox(e.to), e.zoom, 2.2, sig);
      npcLine(e.host, eventText.title + "!", 2500);
      await say(e.host, eventText.caption, sig, eventText.title);
    });
  };
  // úvodní prohlídka: knihovnice provede hrdinu městečkem, hrdina dojde za pekařem a ke škole
  const playIntro = () => {
    const T = tl.tour;
    const guide: NpcKey = "knihovnice";
    const nodes = HUB.graf.nodes;
    return runScene("intro", async (sig) => {
      setCamera(placeShot("les", 0.04), 1.15);
      await wait(400, sig);
      await say(guide, T.hello, sig);
      const pan = camTo(placeShot("hrad", 0.04), 1.15, 3.2, sig);
      await say(guide, T.top, sig);
      await pan;
      await camTo(toBox([heroP.current[0], heroP.current[1] - 0.01]), 1.5, 2.2, sig);
      cheer(1500);
      await say(guide, T.you, sig);
      await approach("pekar", sig, 1.5);
      heroLine(T.heroHi, 1600);
      sfx.pop();
      await wait(700, sig);
      npcLine("pekar", tl.npc.pekar.greet[0], 2800);
      await wait(900, sig);
      await say(guide, T.npcs, sig);
      talkRef.current = null;
      face.current = {};
      await walkHero(route(nearestNode(heroP.current), "kurzy").map((n) => nodes[n]), sig, 1.4);
      await say(guide, T.school, sig);
      sfx.gull();
      await camTo(placeShot("pristav", -0.03), 1.35, 2.4, sig);
      await say(guide, T.harbor, sig);
      await camTo(toBox(HUB.places.stanice.raketa ?? HUB.places.stanice.door), 1.35, 2.0, sig);
      await say(guide, T.rocket, sig);
      await camTo(toBox(heroP.current), 1.2, 2.0, sig);
      cheer(1600);
      await say(guide, T.controls, sig);
    });
  };
  const playReward = () => {
    return runScene("reward", async (sig) => {
      await camTo(toBox([heroP.current[0], heroP.current[1] - 0.01]), 1.7, 1.0, sig);
      sfx.horn();
      cheer(4200);
      const c = confettiCv.current;
      const b = box.current;
      if (c && b) {
        c.width = b.clientWidth;
        c.height = b.clientHeight;
        const hp = toBox(heroP.current);
        confettiBurst(c, [hp[0], hp[1] - 0.06], 4);
      }
      await say("babicka", tl.reward.caption, sig, tl.reward.title);
    });
  };
  const skipScene = () => scene.current?.abort();

  // první návštěva: prohlídka městečka; jinak jednou denně uvede dnešní událost
  const scenes = useRef({ playIntro, playEvent });
  useEffect(() => {
    scenes.current = { playIntro, playEvent };
  });
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = window.setTimeout(async () => {
      if (started.current) return;
      started.current = true;
      const first = ls.get("town-intro-seen") !== "1";
      const eventDue = ls.get("town-event-day") !== dayKey();
      if (first) {
        ls.set("town-intro-seen", "1");
        const ok = await scenes.current.playIntro();
        if (ok && eventDue) void scenes.current.playEvent();
      } else if (eventDue) void scenes.current.playEvent();
    }, 900);
    return () => window.clearTimeout(id);
  }, []);
  useEffect(() => () => scene.current?.abort(), []);
  useEffect(() => {
    // první dotek nebo klik v režimu přes celé okno zapne i skutečnou celou obrazovku (prohlížeč to dovolí jen z gesta)
    const onFirst = () => {
      const el = wrap.current;
      if (fullRef.current && el && document.fullscreenEnabled && !document.fullscreenElement) void el.requestFullscreen().catch(() => {});
    };
    window.addEventListener("pointerdown", onFirst, { once: true });
    const onChange = () => {
      if (!document.fullscreenElement && fullRef.current && ls.get("town-full") === "0") setFull(false);
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => {
      window.removeEventListener("pointerdown", onFirst);
      document.removeEventListener("fullscreenchange", onChange);
    };
  }, []);

  function reduced() {
    return prefersReducedMotion();
  }
  function visit(place: PlaceDef) {
    if (phase || (cine && cine !== "talk") || scene.current) return;
    if (openNpc || talkRef.current) closeNpc(0);
    if (place.world) {
      const w = place.world;
      if (reduced()) {
        leave(`/${locale}/uzivatelsky-obchod?svet=${w}`);
        return;
      }
      // zamčený svět: hrdina dojde k bráně a vypravěčka vysvětlí, kde se odemyká
      if (!worldOpen(w)) {
        void runScene("locked", async (sig) => {
          await walkHero(route(nearestNode(heroP.current), place.id).map((n) => HUB.graf.nodes[n]), sig, 1.5);
          await say("knihovnice", tl.locked.replace("{name}", tt.buildings[place.id].name), sig);
        }).then((ok) => ok && leave(`/${locale}/uzivatelsky-obchod?svet=${w}`));
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
  function openMini(id: MiniId) {
    if (phase || cine || scene.current) return;
    if (openNpc || talkRef.current) closeNpc(0);
    setMiniOpen(id);
    fetch("/api/mestecko/minihra")
      .then((r) => r.json())
      .then((d) => {
        if (d.mini) setMiniLeft(Object.fromEntries(MINI_IDS.map((id) => [id, d.mini[id]?.left ?? PLAYS_PER_DAY])) as Record<MiniId, number>);
      })
      .catch(() => {});
  }
  // celá obrazovka: Fullscreen API, jinde překryv přes celé okno; městečko se vždy vejde celé
  function toggleFull() {
    if (full) {
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
      setFull(false);
      ls.set("town-full", "0");
      return;
    }
    ls.set("town-full", "1");
    setFull(true);
    const el = wrap.current;
    if (el && document.fullscreenEnabled) void el.requestFullscreen().catch(() => {});
  }
  function toggleNight() {
    const next = mode === "auto" ? "day" : mode === "day" ? "night" : "auto";
    setMode(next);
    ls.set("town-mode", next);
  }
  // klik na obyvatele: hrdina k němu dojde, pozdraví a otevře se rozhovor (kamera zůstane přiblížená na oba)
  function talkTo(key: NpcKey) {
    if (phase || scene.current || (cine && cine !== "talk")) return;
    if (openNpc === key) return;
    setBubble(null);
    if (reduced()) {
      talkRef.current = key;
      setOpenNpc(key);
      sfx.pop();
      return;
    }
    setOpenNpc(null);
    void runScene(
      "talk",
      async (sig) => {
        await approach(key, sig);
        heroLine(tl.tour.heroHi, 1300);
        sfx.pop();
        await wait(500, sig);
      },
      { bars: false, keepCam: true },
    ).then((ok) => {
      if (!ok) return;
      focusY.current = 0.36; // postavy nad panelem rozhovoru
      setOpenNpc(key);
    });
  }
  function closeNpc(dur = 0.6) {
    setOpenNpc(null);
    setTalking(false);
    talkRef.current = null;
    face.current = {};
    if (camNow.current) void releaseCam(dur);
  }
  async function collect(spot: CollectSpot) {
    if (busy.current || phase || cine) return;
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
          if (!reduced() && ls.get(`town-reward-${json.day ?? dayKey()}`) !== "1") {
            ls.set(`town-reward-${json.day ?? dayKey()}`, "1");
            window.setTimeout(playReward, 900);
          }
        }
        notifyAccountChanged();
      } else if (json.error === "owned") {
        setCol((c) => ({ ...c, collected: [...c.collected, spot.idx] }));
      }
    } finally {
      busy.current = false;
    }
  }
  // po zavření nástěnky: když jsou všechny denní úkoly splněné, přijde oslava
  async function closeBoard() {
    setBoard(false);
    if (reduced() || ls.get(`town-reward-q-${dayKey()}`) === "1") return;
    try {
      const j = await fetch("/api/denni-vyzvy").then((r) => (r.ok ? r.json() : null));
      if (j?.quests?.length && j.quests.every((q: { done: boolean }) => q.done)) {
        ls.set(`town-reward-q-${dayKey()}`, "1");
        window.setTimeout(playReward, 500);
      }
    } catch {}
  }

  useEffect(() => {
    visitRef.current = visit;
    closeNpcRef.current = closeNpc;
  });

  const spotPos = useCallback((s: CollectSpot): Pt => HUB.sber[s.slot % Math.max(1, HUB.sber.length)] ?? HUB.hrdina, []);

  const labelCls = "absolute z-[50] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-md border-2 border-[#16132b] bg-[#3a2a1a] text-center font-extrabold leading-tight text-[#ffd76b] shadow-[0_2px_0_rgba(0,0,0,0.45)] transition-transform";
  const left = COLLECT_COUNT - col.collected.length;
  const dark = night;
  const busyScene = !!phase || !!cine;
  const hearts = (k: NpcKey) => npcSnap?.[k]?.hearts ?? 0;

  return (
    <div>
      <div ref={wrap} className={full ? "fixed inset-0 z-[200] bg-[#58b24a]" : ""}>
      {/* okno do městečka: na celé obrazovce ho městečko celé vyplní a kamera jde za hrdinou; ovládání leží nad ním */}
      <div className={`relative w-full overflow-hidden [container-type:inline-size] ${full ? "h-full" : "rounded-3xl border-2 border-[var(--edge)] shadow-[0_6px_0_var(--shadow-ink)]"}`} style={full ? undefined : { aspectRatio: `${HUB.w} / ${BOX_H}`, maxHeight: "78dvh", minHeight: 420 }}>
      <div ref={view} className="absolute inset-0 overflow-hidden">
        <div ref={box} className="absolute left-0 top-0 select-none overflow-hidden will-change-transform [container-type:inline-size]" style={{ aspectRatio: `${HUB.w} / ${BOX_H}`, width: full ? `max(100%, calc(100dvh * ${HUB.w / BOX_H}))` : "max(100%, 880px)", background: "linear-gradient(180deg, #5cb4ff, #cfeaff)" }}>
          {phase && phase.kind !== "path" && <div ref={bgDark} aria-hidden className="absolute inset-0 opacity-0" style={{ background: "linear-gradient(180deg, #02030c 0%, #071040 55%, #1b3a8a 100%)" }} />}
          <div key={gen} ref={cam} className={`${dark ? "" : "town-day"} absolute inset-0 ${busyScene ? "pointer-events-none" : ""}`}>
            <div ref={sky} aria-hidden className="town-sky absolute inset-0" />
            {dark && <div aria-hidden className="town-stars absolute inset-x-0 top-0 h-[40%]" />}
            {/* oblaka a ptáci */}
            {!dark &&
              [0, 1, 2, 3].map((i) => (
                <div key={i} aria-hidden className="hub-cloud pointer-events-none absolute" style={{ top: `${1 + i * 2.6}%`, width: `${14 + (i % 3) * 5}%`, animationDuration: `${120 + i * 38}s`, animationDelay: `${-i * 31}s` }} />
              ))}
            {[0, 1].map((i) => (
              <div key={i} ref={(el) => void (birds.current[i] = el)} aria-hidden className="pointer-events-none absolute z-[45]" style={{ width: `${(SPR.ptak.o / 1.6) * FIG * 100 * 0.9}%`, aspectRatio: "1 / 1" }}>
                <span className="town-sprite block h-full w-full" style={{ backgroundImage: "url(/home/mesto/ptak.webp)", ["--n" as string]: 12, animationDuration: "0.55s", animationDelay: `${-i * 0.2}s` }} />
              </div>
            ))}
            {/* voda: zátoka, řeka a laguna se třpytí pod obrázkem městečka */}
            <HubWater />
            {/* přístavní loď a ponorka v lagunně (pod/nad obrázkem podle polohy) */}
            {HUB.places.pristav.lod && (
              <div aria-hidden className="pointer-events-none absolute" style={{ ...at(HUB.places.pristav.lod), width: `${26 * K}%`, aspectRatio: "640 / 512", transform: "translate(-50%, -78.1%)" }}>
                <span className="town-sprite block h-full w-full" style={{ backgroundImage: "url(/home/pristav/lod.webp)", ["--n" as string]: 12, animationDuration: "3.6s" }} />
              </div>
            )}
            {HUB.places.more.ponorka && (
              <div ref={subRef} aria-hidden className="pointer-events-none absolute" style={{ ...at(HUB.places.more.ponorka), width: `${16 * K}%`, aspectRatio: "640 / 384", transform: "translate(-50%, -50%)" }}>
                <span className="town-sprite block h-full w-full" style={{ backgroundImage: "url(/home/more/ponorka.webp)", ["--n" as string]: 12, animationDuration: "3.2s" }} />
              </div>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/home/mesto/hub.webp" alt="" draggable={false} className="town-hub-img pointer-events-none absolute bottom-0 left-0 w-full" style={{ filter: dark ? "brightness(0.55) saturate(1.1) hue-rotate(-12deg)" : undefined, transition: "filter 0.8s" }} />
            {/* budovy druhé a přední řady znovu nad hrdinou, když je za nimi (hloubka podle polohy hrdiny) */}
            {["b", "a"].map((k) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={k} src={`/home/mesto/hub-${k}.webp`} alt="" draggable={false} onError={(e) => (e.currentTarget.style.display = "none")} className="town-hub-img pointer-events-none absolute bottom-0 left-0 w-full" style={{ zIndex: k === "b" ? 20 : 30, filter: dark ? "brightness(0.55) saturate(1.1) hue-rotate(-12deg)" : undefined, transition: "filter 0.8s" }} />
            ))}
            {/* větrný mlýn a komíny */}
            <div aria-hidden className="town-mill pointer-events-none absolute" style={{ zIndex: 45, ...at(HUB.mlyn), width: `${6.2 * K}%`, aspectRatio: "1 / 1", transform: "translate(-50%,-50%)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/home/mesto/mlyn.webp" alt="" draggable={false} className="town-mill-blades block h-full w-full" />
            </div>
            {HUB.kominy.map((p, i) => (
              <div key={i} aria-hidden className="pointer-events-none absolute" style={{ zIndex: 45, ...at(p), width: `${1.4 * K}%`, aspectRatio: "1 / 1" }}>
                {[0, 1, 2].map((j) => (
                  <i key={j} className="hub-smoke" style={{ animationDelay: `${-(j * 1.6 + i * 0.7)}s` }} />
                ))}
              </div>
            ))}
            {/* raketa na rampě */}
            {HUB.places.stanice.raketa && (
              <div ref={rocket} aria-hidden className="pointer-events-none absolute" style={{ zIndex: 40, ...at(HUB.places.stanice.raketa), width: `${22 * K}%`, aspectRatio: "640 / 384", transform: "translate(-50%, -62%)" }}>
                <span className="town-sprite block h-full w-full" style={{ backgroundImage: "url(/home/kosmicka/raketa.webp)", ["--n" as string]: 12, animationDuration: "3s" }} />
              </div>
            )}
            {/* obyvatelé a zvířata: chodí po cestách, kliknutím se otevře rozhovor */}
            {FOLK.map((f, i) => {
              const s = SPR[f.k];
              const h = hearts(f.key);
              return (
                <div key={f.key} ref={(el) => void (npcEl.current[f.key] = el)} className="absolute" style={{ zIndex: 40, ...at(HUB.npc[f.key]), width: 0, height: 0 }}>
                  <button
                    ref={(el) => void (npcFig.current[f.key] = el)}
                    type="button"
                    aria-label={tl.npc[f.key].name}
                    title={`${tl.npc[f.key].name} · ${tl.npc[f.key].role}`}
                    onClick={() => talkTo(f.key)}
                    className="market-hit absolute rounded-full"
                    style={{ left: 0, top: 0, width: `${(s.o / 1.6) * FIG * 100}cqw`, minWidth: 0, cursor: "pointer" }}
                  >
                    <span aria-hidden className={`pointer-events-none block ${talking && openNpc === f.key ? "town-talk" : ""}`} style={{ width: `${(s.o / 1.6) * FIG * 100}cqw`, aspectRatio: "1 / 1" }}>
                      <span ref={(el) => void (npcSpr.current[f.key] = el)} className="town-sprite block h-full w-full" style={{ backgroundImage: `url(/home/mesto/${s.f}.webp)`, ["--n" as string]: s.n, animationDuration: `${s.dur}s`, animationDelay: `${-i * 0.7}s` }} />
                    </span>
                  </button>
                  {h > 0 && openNpc !== f.key && (
                    <span aria-hidden className="pointer-events-none absolute -translate-x-1/2 text-[clamp(8px,0.9cqw,13px)] leading-none" style={{ left: 0, top: `${-(0.5 + s.tz / s.o + 0.4) * ((s.o / 1.6) * FIG * 100)}cqw` }}>
                      {"❤️".repeat(Math.min(h, 3))}
                    </span>
                  )}
                  {bubble?.k === f.key && (
                    <div key={bubble.text} className="town-say pointer-events-none absolute z-[55] max-w-[12rem] whitespace-normal rounded-2xl border-2 border-[var(--edge)] bg-[var(--surface)] px-3 py-1 text-center text-xs font-extrabold shadow-[0_3px_0_var(--shadow-ink)]" style={{ left: 0, top: `${-(1.05 + s.tz / s.o) * ((s.o / 1.6) * FIG * 100)}cqw`, transform: "translate(-50%, -100%)", width: "max-content" }}>
                      {bubble.text}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={dog} aria-hidden className="pointer-events-none absolute" style={{ zIndex: 40, ...at(HUB.npc.pes ?? HUB.hrdina), width: `${(SPR.pes_bezi.o / 1.6) * FIG * 100}%`, aspectRatio: "1 / 1" }}>
              <span ref={dogSpr} className="town-sprite block h-full w-full" style={{ backgroundImage: "url(/home/mesto/pes-sedi.webp)", ["--n" as string]: 24, animationDuration: "1.8s" }} />
            </div>
            {/* hrdina */}
            <div ref={hero} className="pointer-events-none absolute" style={{ zIndex: 40, ...at(HUB.hrdina), width: `${FIG * 100}%`, aspectRatio: "1 / 1", transform: `translate(-50%, ${-(0.5 + 0.55 / 1.6) * 100}%)` }}>
              <span ref={heroSpr} aria-hidden className="town-sprite block h-full w-full" style={{ ["--n" as string]: 24, backgroundImage: `url(${heroSpriteUrl("stoji", look)})`, animationDuration: "3s" }} />
            </div>
            {/* noc: světla lamp */}
            {lampsOn &&
              HUB.lampy.map((p, i) => (
                <i key={i} aria-hidden className="hub-lamp pointer-events-none absolute z-[45]" style={{ ...at(p), animationDelay: `${-(i % 5) * 0.6}s` }} />
              ))}
            {/* denní událost a konfety */}
            <canvas ref={fxCv} aria-hidden className="pointer-events-none absolute inset-0 z-[60] h-full w-full" />
            <canvas ref={confettiCv} aria-hidden className="pointer-events-none absolute inset-0 z-[61] h-full w-full" />

            {/* minihry: rybaření v laguně, sklizeň na farmě, pekárna */}
            {CLASSIC_MINI_IDS.map((id) => {
              const pos: Pt = id === "fishing" ? [HUB.voda.laguna[0], HUB.voda.laguna[1] - 0.004] : id === "harvest" ? [(HUB.npc.farmar?.[0] ?? 0.9) - 0.035, (HUB.npc.farmar?.[1] ?? 0.82) - 0.01] : [(HUB.npc.pekar?.[0] ?? 0.4) + 0.045, (HUB.npc.pekar?.[1] ?? 0.7) - 0.01];
              return (
                <button key={id} type="button" aria-label={miniText.names[id]} title={miniText.names[id]} onClick={() => openMini(id)} className="town-collect absolute z-[52] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--edge)] bg-[var(--surface)] px-1.5 py-0.5 leading-none shadow-[0_2px_0_var(--shadow-ink)]" style={{ ...at(pos), fontSize: "clamp(16px, 2.3cqw, 30px)" }}>
                  {id === "fishing" ? "🎣" : id === "harvest" ? "🥕" : "🥐"}
                </button>
              );
            })}
            {/* poklady dne */}
            {col.spots.filter((s) => !col.collected.includes(s.idx)).map((s) => (
              <button key={s.idx} type="button" aria-label={tt.collect.title} onClick={() => collect(s)} className="town-collect absolute z-[52] -translate-x-1/2 -translate-y-1/2 leading-none" style={{ ...at(spotPos(s)), fontSize: "clamp(18px, 2.6cqw, 34px)", animationDelay: `${(s.idx % 4) * -0.5}s` }}>
                {COLLECT_ICON[s.kind]}
              </button>
            ))}
            {pop && (
              <div key={pop.n} className="market-boom pointer-events-none absolute z-[62] -translate-x-1/2 text-lg font-black text-[#ffd76b] [text-shadow:0_2px_0_#16132b]" style={{ ...at([pop.p[0], pop.p[1] - 0.03]) }}>
                {pop.text}
              </div>
            )}

            {/* cedule přímo na budovách */}
            {PLACES.map((p) => {
              const pl = HUB.places[p.id];
              if (!pl) return null;
              const locked = p.world && !worldOpen(p.world) && p.world !== "pirate";
              return (
                <div key={p.id} className={`${labelCls} pointer-events-none ${hover === p.id || near === p.id ? "scale-110" : ""}`} style={{ ...at(signOf(p.id)), minWidth: `${(pl.w * K / 16) * 100}%`, padding: "0.15cqw 0.5cqw", fontSize: "clamp(9px, 0.95cqw, 15px)" }}>
                  {p.icon} {tt.buildings[p.id].name}
                  {locked && <span className="ml-1 opacity-80">🔒</span>}
                </div>
              );
            })}

            {/* klikací místa */}
            {PLACES.map((p) => {
              const pl = HUB.places[p.id];
              if (!pl) return null;
              // klikací plocha od cedule po dveře (u rakety celá raketa na rampě); pod obyvateli, ať jdou oslovit i před budovou
              const sg = signOf(p.id);
              const bottom = p.id === "stanice" && pl.raketa ? pl.raketa[1] + 0.03 : pl.door[1];
              const hw = p.id === "stanice" ? 0.2 * K : pl.w * K / 16 + 0.04;
              const top = Math.min(sg[1], bottom) - 0.012;
              const hh = Math.abs(bottom - sg[1]) + 0.045;
              return (
                <button key={p.id} type="button" aria-label={tt.buildings[p.id].name} title={tt.buildings[p.id].hint} onClick={() => visit(p)} onMouseEnter={() => setHover(p.id)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(p.id)} onBlur={() => setHover(null)} className="market-hit absolute z-[35] -translate-x-1/2 rounded-2xl" style={{ left: `${sg[0] * 100}%`, top: `${Y(top) * 100}%`, width: `${hw * 100}%`, height: `${(Y(top + hh) - Y(top)) * 100}%` }} />
              );
            })}
          </div>

          {dark && <div aria-hidden className="pointer-events-none absolute inset-0 bg-[#0b0925]/25" />}
          {tint && <div aria-hidden className="pointer-events-none absolute inset-0 z-[12]" style={{ background: tint, transition: "opacity 1s" }} />}
          <canvas ref={wxCv} aria-hidden className={`pointer-events-none absolute inset-0 z-[13] h-full w-full ${phase ? "hidden" : ""}`} />
          {phase && <canvas ref={cv} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />}
          {/* bublina hrdiny (poloha se nastavuje každý snímek podle hrdiny) */}
          <div ref={heroBubble} aria-hidden={!heroSay} className="pointer-events-none absolute z-[56]" style={{ left: 0, top: 0 }}>
            {heroSay && (
              <div key={heroSay} className="town-say absolute left-0 top-0 w-max max-w-[12rem] rounded-2xl border-2 border-[var(--edge)] bg-[var(--surface)] px-3 py-1 text-center text-sm font-extrabold shadow-[0_3px_0_var(--shadow-ink)]" style={{ transform: "translate(-50%, -100%)" }}>
                {heroSay}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ovládání nad městečkem (drží se okna, ne obrázku) */}
      <div className="pointer-events-none absolute inset-0 z-[70]">
        <div className={`absolute left-3 top-3 flex flex-col items-start gap-2 transition-opacity ${busyScene ? "opacity-0" : ""}`}>
          <div className="flex items-center gap-2 rounded-full border-2 border-[var(--edge)] bg-[var(--surface)] px-3 py-1 text-sm font-extrabold shadow-[0_2px_0_var(--shadow-ink)]">
            🎁 {left > 0 ? tt.collect.left.replace("{n}", String(left)) : "✓"}
          </div>
          <div className="flex items-center gap-2 rounded-full border-2 border-[var(--edge)] bg-[var(--surface)] px-3 py-1 text-sm font-extrabold shadow-[0_2px_0_var(--shadow-ink)]">
            <span aria-hidden>{{ clear: "☀️", cloudy: "⛅", rain: "🌧️", fog: "🌫️", snow: "❄️" }[weather]}</span>
            {tt.weather[weather]} · {tt.phases[phaseNow]}
          </div>
          <div aria-hidden className={`hidden items-center gap-1 rounded-full border-2 border-[var(--edge)] bg-[var(--surface)] px-3 py-1 text-xs font-extrabold opacity-80 ${free ? "md:flex" : ""}`}>⌨ WASD / ←↑↓→ · E</div>
        </div>
        {near && free && (
          <div role="status" className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full border-2 border-[var(--edge)] bg-[var(--surface)] px-4 py-2 text-sm font-extrabold shadow-[0_3px_0_var(--shadow-ink)]">
            <kbd className="rounded-md border-2 border-[var(--edge)] px-1.5">E</kbd> {tt.buildings[near]?.name ?? near}
          </div>
        )}
        {note && <div role="status" className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full border-2 border-[var(--edge)] bg-[var(--surface)] px-4 py-2 text-sm font-bold shadow-[0_3px_0_var(--shadow-ink)]">{note}</div>}

        {/* filmové pruhy, vypravěč a přeskočení cut scény */}
        <div aria-hidden className="town-cine-bar absolute left-0 right-0 top-0 bg-black" style={{ height: barsOn ? "9%" : 0 }} />
        <div aria-hidden className="town-cine-bar absolute bottom-0 left-0 right-0 bg-black" style={{ height: barsOn ? "9%" : 0 }} />
        {narr && (
          <TownNarrator
            key={narr.n}
            name={tl.npc[narr.who].name}
            art={artOf(narr.who)}
            title={narr.title}
            text={narr.text}
            next={tl.next}
            skip={st.skip}
            onNext={() => narrNext.current?.()}
            onSkip={skipScene}
          />
        )}
        {cine && cine !== "enter" && !narr && (
          <button type="button" onClick={skipScene} className="btn-bouncy pointer-events-auto absolute bottom-3 right-3 bg-[var(--surface)] px-3 py-1.5 text-sm font-bold">
            ⏭ {st.skip}
          </button>
        )}
        <div aria-hidden className="absolute inset-0 bg-white transition-opacity duration-200" style={{ opacity: fade ? 1 : 0 }} />

        {phase && (
          <>
            <div aria-hidden className="market-vignette absolute inset-0" />
            <div ref={bars} aria-hidden className="absolute inset-0">
              <div className="absolute left-0 right-0 top-0 bg-black" style={{ height: 0 }} />
              <div className="absolute bottom-0 left-0 right-0 bg-black" style={{ height: 0 }} />
            </div>
            <div ref={count} aria-hidden className="market-count" />
            {(phase.kind === "space" || phase.kind === "pirate" || phase.kind === "portal") && <div ref={space3d} className="absolute inset-0" />}
            {phase.kind !== "path" && (
              <button type="button" onClick={() => handle.current?.skip()} className="btn-bouncy pointer-events-auto absolute bottom-3 right-3 bg-[var(--surface)] px-3 py-1.5 text-sm font-bold">
                ⏭ {st.skip}
              </button>
            )}
          </>
        )}
        <div className="pointer-events-auto absolute right-3 top-3 flex max-w-[calc(100%-11rem)] flex-wrap justify-end gap-2">
          {!busyScene && (
            <>
              <button type="button" onClick={() => playIntro()} title={tl.ui.replay} className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--edge)] bg-[var(--surface)] text-xl shadow-[0_3px_0_var(--shadow-ink)] transition-transform hover:scale-110">
                <span aria-hidden>🎬</span>
                <span className="sr-only">{tl.ui.replay}</span>
              </button>
              <button type="button" onClick={() => setStoryOpen(true)} title={storyText.button} className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--edge)] bg-[var(--surface)] text-xl shadow-[0_3px_0_var(--shadow-ink)] transition-transform hover:scale-110">
                <span aria-hidden>📖</span>
                <span className="sr-only">{storyText.button}</span>
              </button>
              <button type="button" onClick={() => setPickHero(true)} title={tt.hero.button} className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--edge)] bg-[var(--surface)] text-xl shadow-[0_3px_0_var(--shadow-ink)] transition-transform hover:scale-110">
                <span aria-hidden>🧑‍🎤</span>
                <span className="sr-only">{tt.hero.button}</span>
              </button>
              <button type="button" onClick={toggleNight} title={mode === "auto" ? tt.auto : mode === "day" ? tt.day : tt.night} className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--edge)] bg-[var(--surface)] text-xl shadow-[0_3px_0_var(--shadow-ink)] transition-transform hover:scale-110">
                <span aria-hidden>{mode === "auto" ? "🕒" : mode === "day" ? "☀️" : "🌙"}</span>
                <span className="sr-only">{mode === "auto" ? tt.auto : mode === "day" ? tt.day : tt.night}</span>
              </button>
            </>
          )}
          <button type="button" onClick={toggleFull} aria-pressed={full} title={full ? tt.fullOff : tt.fullOn} className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--edge)] bg-[var(--surface)] text-xl shadow-[0_3px_0_var(--shadow-ink)] transition-transform hover:scale-110">
            <span aria-hidden>{full ? "🗗" : "⛶"}</span>
            <span className="sr-only">{full ? tt.fullOff : tt.fullOn}</span>
          </button>
          <button type="button" onClick={toggleSound} aria-pressed={sound} title={sound ? st.soundOn : st.soundOff} className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--edge)] bg-[var(--surface)] text-xl shadow-[0_3px_0_var(--shadow-ink)] transition-transform hover:scale-110">
            <span aria-hidden>{sound ? "🔊" : "🔇"}</span>
            <span className="sr-only">{sound ? st.soundOn : st.soundOff}</span>
          </button>
        </div>
        {openNpc && !busyScene && (
          <TownNpcPanel
            key={openNpc}
            locale={locale}
            npc={openNpc}
            art={artOf(openNpc)}
            loggedIn={col.loggedIn}
            snap={npcSnap}
            points={npcPoints}
            onClose={() => closeNpc()}
            onTalking={setTalking}
            onUpdate={(snap, points) => {
              setNpcSnap(snap);
              setNpcPoints(points);
            }}
          />
        )}
      </div>
      </div>
      {storyOpen && (
        <Modal title={`📖 ${storyText.title}`} onClose={() => setStoryOpen(false)} closeLabel={m.close}>
          <TownStory locale={locale} onClose={() => setStoryOpen(false)} />
        </Modal>
      )}
      {miniOpen && (
        <Modal title={`${MINI[miniOpen].icon} ${miniText.names[miniOpen]}`} onClose={() => setMiniOpen(null)} closeLabel={m.close}>
          <MiniGame key={miniOpen} locale={locale} game={miniOpen} left={miniLeft[miniOpen]} onClose={() => setMiniOpen(null)} onReward={() => {}} />
        </Modal>
      )}
      {pickHero && (
        <Modal title={`🧑‍🎤 ${tt.hero.title}`} onClose={() => setPickHero(false)} closeLabel={m.close}>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: HERO_LOOKS }, (_, k) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  setLook(k);
                  setHeroLook(k);
                  setPickHero(false);
                  const hs = heroSpr.current;
                  if (hs) hs.style.backgroundImage = `url(${heroSpriteUrl("stoji", k)})`;
                }}
                aria-pressed={look === k}
                className="card card-hover flex flex-col items-center gap-1 p-2 text-xs font-bold"
                style={look === k ? { borderColor: "var(--brand-500)", background: "var(--surface-muted)" } : undefined}
              >
                <span aria-hidden className="town-sprite block h-20 w-20" style={{ ["--n" as string]: 24, backgroundImage: `url(${heroSpriteUrl("stoji", k)})`, animationDuration: "3s" }} />
                {tt.hero.pick}
              </button>
            ))}
          </div>
        </Modal>
      )}
      {board && (
        <Modal title={`📋 ${tt.quests.title}`} onClose={closeBoard} closeLabel={m.close}>
          <DailyChallenges locale={locale} />
        </Modal>
      )}
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
