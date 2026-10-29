"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DailyChallenges } from "@/components/DailyChallenges";
import { Modal, type Snapshot } from "@/components/ShopView";
import { readCam, runPath, runPirate, runSpace, type Geo, type Handle, type Pt } from "@/lib/market-cinema";
import { runWorld } from "@/lib/market-cinema-worlds";
import { confettiBurst, createEventFx, createWeatherFx, dayPhaseOf, eventForDay, EVENT_SHOT, PHASE_TINT, runShots, weatherForDay, type Handle as ShotHandle, type Shot } from "@/lib/town-scenes";
import { TownNpcPanel } from "@/components/TownNpcPanel";
import { MiniGame } from "@/components/TownMini";
import { TownStory } from "@/components/TownStory";
import { getTownStoryText } from "@/i18n/town-story";
import { MINI_IDS, PLAYS_PER_DAY, type MiniId } from "@/lib/town-mini";
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
const MINI_ICON: Record<MiniId, string> = { fishing: "🎣", harvest: "🥕", bakery: "🥐" };

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
  farmar: { nodes: ["l3", "stanice"], speed: 0.018, walk: "farmar" },
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
  const storyText = getTownStoryText(locale);
  const [miniLeft, setMiniLeft] = useState<Record<MiniId, number>>({ fishing: PLAYS_PER_DAY, harvest: PLAYS_PER_DAY, bakery: PLAYS_PER_DAY });
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
  const [cine, setCine] = useState<"intro" | "event" | "reward" | "enter" | null>(null);
  const [caption, setCaption] = useState<string | null>(null);
  const [fade, setFade] = useState(false);
  const handle = useRef<Handle | null>(null);
  const shots = useRef<ShotHandle | null>(null);
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
  const npcEl = useRef<Record<string, HTMLDivElement | null>>({});
  const npcFig = useRef<Record<string, HTMLButtonElement | null>>({});
  const npcSpr = useRef<Record<string, HTMLSpanElement | null>>({});
  const fxCv = useRef<HTMLCanvasElement>(null);
  const confettiCv = useRef<HTMLCanvasElement>(null);
  const cineBars = useRef<HTMLDivElement>(null);
  const fxStrength = useRef(0);
  const openRef = useRef<NpcKey | null>(null);
  const started = useRef(false);
  const eventId = useMemo(() => eventForDay(dayKey()), []);
  const weather = useMemo(() => (eventForDay(dayKey()) === "rain" ? "rain" : weatherForDay(dayKey())), []);
  const wxCv = useRef<HTMLCanvasElement>(null);
  const phaseNow = dayPhaseOf(hour);
  const night = mode === "night" || (mode === "auto" && phaseNow === "night");
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
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
      el.style.zIndex = String(11 + Math.round(y * 10));
      const f = FOLK.find((c) => c.key === key);
      const s = SPR[f?.k ?? "kluk"];
      fig.style.transform = `translate(-50%, ${-(0.5 + s.tz / s.o) * 100}%) scaleX(${(flip ? -1 : 1) * (f?.flip ? -1 : 1)})`;
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
    const street = ["m1", "m2", "m3", "m4", "m5", "hub", "m7", "obchod", "m8", "m9"].map((n) => HUB.graf.nodes[n]);
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
      // obyvatelé
      for (const [key, w] of Object.entries(states)) {
        const cfg = WALKERS[key as NpcKey]!;
        const talking = openRef.current === key;
        if (talking) {
          setSprite(key, cfg.idle ?? cfg.walk, false);
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

  // obyvatelé občas něco prohodí (bublina nad hlavou)
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let t1 = 0;
    let t2 = 0;
    const schedule = () => {
      t1 = window.setTimeout(() => {
        if (!openRef.current && !document.hidden) {
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
    if (!canvas || !bx || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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
  // počasí dne (déšť, sníh, mlha) na samostatném plátně nad městečkem
  useEffect(() => {
    const canvas = wxCv.current;
    const bx = box.current;
    if (!canvas || !bx || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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
    const start = HUB.hrdina;
    const full = (r2: typeof r) => r2 as Parameters<typeof runSpace>[0];
    if (phase.kind === "path" && phase.target) {
      const place = phase.target;
      const nodes = route("hub", place.id).map((n) => HUB.graf.nodes[n]);
      const geo = geoFor(nodes.slice(1), start);
      handle.current = runPath(
        r as Parameters<typeof runPath>[0],
        geo,
        () => {
          enterDoor(() => {
            if (place.href) leave(`/${locale}${place.href}`);
            else {
              setPhase(null);
              setGen((g) => g + 1);
              setBoard(true);
            }
          });
        },
        false,
      );
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
      handle.current = runWorld(r as Parameters<typeof runWorld>[0], geoFor(nodes.slice(1), start, { door: HUB.places[phase.id]?.door }), world === "castle" ? "castle" : world === "sea" ? "sea" : "forest", () => leave(`/${locale}/uzivatelsky-obchod?svet=${world}&film=1`));
    }
    return () => handle.current?.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ------------------------------------------------------------------------------------------ cut scény
  const bars2 = useCallback((k: number) => {
    const el = cineBars.current;
    if (!el) return;
    const [top, bottom] = [el.children[0] as HTMLElement, el.children[1] as HTMLElement];
    top.style.height = `${k * 9}%`;
    bottom.style.height = `${k * 9}%`;
  }, []);
  const playShots = useCallback(
    (kind: "intro" | "event" | "reward", list: Shot[], after?: () => void) => {
      const b = box.current;
      const c = cam.current;
      if (!b || !c) return;
      shots.current?.stop();
      setCine(kind);
      shots.current = runShots({ box: b, cam: c }, list, { onCaption: (txt) => setCaption(txt), onBars: bars2, onEnd: () => {
        setCine(null);
        setCaption(null);
        shots.current = null;
        after?.();
      } });
    },
    [bars2, setCine, setCaption],
  );
  const placeShot = useCallback((id: string, dy = 0): Pt => {
    const pl = HUB.places[id];
    const d = pl ? pl.door : HUB.hrdina;
    return toBox([d[0], d[1] + dy]);
  }, []);
  const playEvent = useCallback(
    (after?: () => void) => {
      const e = EVENT_SHOT[eventId];
      fxStrength.current = 1;
      playShots("event", [{ to: e.to, zoom: e.zoom, dur: 2.4, hold: 3.6, caption: `${eventText.title} · ${eventText.caption}`, at: () => sfx.horn() }], () => {
        ls.set("town-event-day", dayKey());
        after?.();
      });
    },
    [eventId, eventText, playShots],
  );
  const playIntro = useCallback(
    (after?: () => void) => {
      const list: Shot[] = [
        { to: placeShot("pristav", -0.02), zoom: 2.1, dur: 2.6, hold: 2.0, caption: `${tl.intro[0]} ${tl.intro[1]}`, at: () => sfx.gull() },
        { to: placeShot("kurzy", -0.01), zoom: 2.2, dur: 2.4, hold: 1.8, caption: tl.intro[2] },
        { to: placeShot("zebricky", -0.01), zoom: 2.2, dur: 2.4, hold: 1.8, caption: tl.intro[3] },
        { to: placeShot("les", 0.02), zoom: 1.9, dur: 2.6, hold: 2.0, caption: tl.intro[4] },
        { to: toBox(HUB.hrdina), zoom: 1.7, dur: 2.4, hold: 2.2, caption: tl.intro[5] },
      ];
      playShots("intro", list, after);
    },
    [placeShot, playShots, tl],
  );
  const playReward = useCallback(() => {
    const c = confettiCv.current;
    const hs = heroSpr.current;
    const toRest = () => {
      if (hs) {
        hs.style.backgroundImage = `url(${heroSpriteUrl("stoji", getHeroLook())})`;
        hs.style.animationDuration = "3s";
      }
    };
    playShots("reward", [{ to: toBox(HUB.hrdina), zoom: 2.4, dur: 1.0, hold: 4.2, caption: `${tl.reward.title} ${tl.reward.caption}`, at: () => {
      sfx.horn();
      if (hs) {
        hs.style.backgroundImage = `url(${heroSpriteUrl("radost", getHeroLook())})`;
        hs.style.animationDuration = "1.1s";
      }
      if (c) {
        const b = box.current;
        if (b) {
          c.width = b.clientWidth;
          c.height = b.clientHeight;
        }
        confettiBurst(c, [HUB.hrdina[0], Y(HUB.hrdina[1]) - 0.1], 4);
      }
    } }], toRest);
  }, [playShots, tl]);
  const skipScene = () => shots.current?.skip();

  // první návštěva: projížďka městečkem; jinak jednou denně uvede dnešní událost
  const scenes = useRef({ playIntro, playEvent });
  useEffect(() => {
    scenes.current = { playIntro, playEvent };
  });
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setTimeout(() => {
      if (started.current) return;
      started.current = true;
      const first = ls.get("town-intro-seen") !== "1";
      const eventDue = ls.get("town-event-day") !== dayKey();
      if (first) {
        ls.set("town-intro-seen", "1");
        scenes.current.playIntro(() => eventDue && scenes.current.playEvent());
      } else if (eventDue) scenes.current.playEvent();
    }, 900);
    return () => window.clearTimeout(id);
  }, []);
  useEffect(() => () => shots.current?.stop(), []);

  function reduced() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  function visit(place: PlaceDef) {
    if (phase || cine) return;
    setOpenNpc(null);
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
  function openMini(id: MiniId) {
    if (phase || cine) return;
    setOpenNpc(null);
    setMiniOpen(id);
    fetch("/api/mestecko/minihra")
      .then((r) => r.json())
      .then((d) => {
        if (d.mini) setMiniLeft({ fishing: d.mini.fishing.left, harvest: d.mini.harvest.left, bakery: d.mini.bakery.left });
      })
      .catch(() => {});
  }
  function toggleNight() {
    const next = mode === "auto" ? "day" : mode === "day" ? "night" : "auto";
    setMode(next);
    ls.set("town-mode", next);
  }
  function talkTo(key: NpcKey) {
    if (phase || cine) return;
    setBubble(null);
    setOpenNpc(key);
    sfx.pop();
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

  const spotPos = useCallback((s: CollectSpot): Pt => HUB.sber[s.slot % Math.max(1, HUB.sber.length)] ?? HUB.hrdina, []);

  const labelCls = "absolute z-[4] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-md border-2 border-[#16132b] bg-[#3a2a1a] text-center font-extrabold leading-tight text-[#ffd76b] shadow-[0_2px_0_rgba(0,0,0,0.45)] transition-transform";
  const left = COLLECT_COUNT - col.collected.length;
  const dark = night;
  const busyScene = !!phase || !!cine;
  const hearts = (k: NpcKey) => npcSnap?.[k]?.hearts ?? 0;

  return (
    <div>
      <div className="overflow-x-auto overflow-y-hidden rounded-3xl border-2 border-[var(--edge)] shadow-[0_6px_0_var(--shadow-ink)]">
        <div ref={box} className="relative select-none overflow-hidden [container-type:inline-size]" style={{ aspectRatio: `${HUB.w} / ${BOX_H}`, minWidth: 880, background: "linear-gradient(180deg, #5cb4ff, #cfeaff)" }}>
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
            {/* obyvatelé a zvířata: chodí po cestách, kliknutím se otevře rozhovor */}
            {FOLK.map((f, i) => {
              const s = SPR[f.k];
              const h = hearts(f.key);
              return (
                <div key={f.key} ref={(el) => void (npcEl.current[f.key] = el)} className="absolute" style={{ ...at(HUB.npc[f.key]), width: 0, height: 0 }}>
                  <button
                    ref={(el) => void (npcFig.current[f.key] = el)}
                    type="button"
                    aria-label={tl.npc[f.key].name}
                    title={`${tl.npc[f.key].name} · ${tl.npc[f.key].role}`}
                    onClick={() => talkTo(f.key)}
                    className="market-hit absolute rounded-full"
                    style={{ left: 0, top: 0, width: `${(s.o / 1.6) * FIG * 100 * 0}cqw`, minWidth: 0, cursor: "pointer" }}
                  >
                    <span aria-hidden className="pointer-events-none block" style={{ width: `${(s.o / 1.6) * FIG * 100}cqw`, aspectRatio: "1 / 1" }}>
                      <span ref={(el) => void (npcSpr.current[f.key] = el)} className="town-sprite block h-full w-full" style={{ backgroundImage: `url(/home/mesto/${s.f}.webp)`, ["--n" as string]: s.n, animationDuration: `${s.dur}s`, animationDelay: `${-i * 0.7}s` }} />
                    </span>
                  </button>
                  {h > 0 && openNpc !== f.key && (
                    <span aria-hidden className="pointer-events-none absolute -translate-x-1/2 text-[clamp(8px,0.9cqw,13px)] leading-none" style={{ left: 0, top: `${-(0.5 + s.tz / s.o + 0.4) * ((s.o / 1.6) * FIG * 100)}cqw` }}>
                      {"❤️".repeat(Math.min(h, 3))}
                    </span>
                  )}
                  {bubble?.k === f.key && (
                    <div className="pointer-events-none absolute z-[2] max-w-[12rem] -translate-x-1/2 whitespace-normal rounded-2xl border-2 border-[var(--edge)] bg-[var(--surface)] px-3 py-1 text-center text-xs font-extrabold" style={{ left: 0, top: `${-(1.05 + s.tz / s.o) * ((s.o / 1.6) * FIG * 100)}cqw`, transform: "translate(-50%, -100%)", width: "max-content" }}>
                      {bubble.text}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={dog} aria-hidden className="pointer-events-none absolute" style={{ ...at(HUB.npc.pes ?? HUB.hrdina), width: `${(SPR.pes_bezi.o / 1.6) * FIG * 100}%`, aspectRatio: "1 / 1" }}>
              <span ref={dogSpr} className="town-sprite block h-full w-full" style={{ backgroundImage: "url(/home/mesto/pes-sedi.webp)", ["--n" as string]: 24, animationDuration: "1.8s" }} />
            </div>
            {/* hrdina */}
            <div ref={hero} className="pointer-events-none absolute z-[5]" style={{ ...at(HUB.hrdina), width: `${FIG * 100}%`, aspectRatio: "1 / 1", transform: `translate(-50%, ${-(0.5 + 0.55 / 1.6) * 100}%)` }}>
              <span ref={heroSpr} aria-hidden className="town-sprite block h-full w-full" style={{ ["--n" as string]: 24, backgroundImage: `url(${heroSpriteUrl("stoji", look)})`, animationDuration: "3s" }} />
            </div>
            {/* noc: světla lamp */}
            {lampsOn &&
              HUB.lampy.map((p, i) => (
                <i key={i} aria-hidden className="hub-lamp pointer-events-none absolute" style={{ ...at(p), animationDelay: `${-(i % 5) * 0.6}s` }} />
              ))}
            {/* denní událost a konfety */}
            <canvas ref={fxCv} aria-hidden className="pointer-events-none absolute inset-0 z-[6] h-full w-full" />
            <canvas ref={confettiCv} aria-hidden className="pointer-events-none absolute inset-0 z-[8] h-full w-full" />

            {/* minihry: rybaření v laguně, sklizeň na farmě, pekárna */}
            {MINI_IDS.map((id) => {
              const pos: Pt = id === "fishing" ? [HUB.voda.laguna[0], HUB.voda.laguna[1] - 0.004] : id === "harvest" ? [(HUB.npc.farmar?.[0] ?? 0.9) - 0.035, (HUB.npc.farmar?.[1] ?? 0.82) - 0.01] : [(HUB.npc.pekar?.[0] ?? 0.4) + 0.045, (HUB.npc.pekar?.[1] ?? 0.7) - 0.01];
              return (
                <button key={id} type="button" aria-label={miniText.names[id]} title={miniText.names[id]} onClick={() => openMini(id)} className="town-collect absolute z-[7] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--edge)] bg-[var(--surface)] px-1.5 py-0.5 leading-none shadow-[0_2px_0_var(--shadow-ink)]" style={{ ...at(pos), fontSize: "clamp(16px, 2.3cqw, 30px)" }}>
                  {id === "fishing" ? "🎣" : id === "harvest" ? "🥕" : "🥐"}
                </button>
              );
            })}
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
          </div>

          {dark && <div aria-hidden className="pointer-events-none absolute inset-0 bg-[#0b0925]/25" />}
          {tint && <div aria-hidden className="pointer-events-none absolute inset-0 z-[12]" style={{ background: tint, transition: "opacity 1s" }} />}
          <canvas ref={wxCv} aria-hidden className="pointer-events-none absolute inset-0 z-[13] h-full w-full" />
          <div className={`pointer-events-none absolute left-3 top-14 z-20 flex items-center gap-2 rounded-full border-2 border-[var(--edge)] bg-[var(--surface)] px-3 py-1 text-sm font-extrabold ${busyScene ? "hidden" : ""}`}>
            <span aria-hidden>{{ clear: "☀️", cloudy: "⛅", rain: "🌧️", fog: "🌫️", snow: "❄️" }[weather]}</span>
            {tt.weather[weather]} · {tt.phases[phaseNow]}
          </div>
          <div className="pointer-events-none absolute left-3 top-3 z-20 flex items-center gap-2 rounded-full border-2 border-[var(--edge)] bg-[var(--surface)] px-3 py-1 text-sm font-extrabold">
            🎁 {left > 0 ? tt.collect.left.replace("{n}", String(left)) : "✓"}
          </div>
          {note && <div role="status" className="absolute bottom-3 left-1/2 z-30 -translate-x-1/2 rounded-full border-2 border-[var(--edge)] bg-[var(--surface)] px-4 py-2 text-sm font-bold shadow-[0_3px_0_var(--shadow-ink)]">{note}</div>}

          {/* filmové pruhy, titulky a přeskočení cut scény */}
          <div ref={cineBars} aria-hidden className="pointer-events-none absolute inset-0 z-[24]">
            <div className="absolute left-0 right-0 top-0 bg-black" style={{ height: 0 }} />
            <div className="absolute bottom-0 left-0 right-0 bg-black" style={{ height: 0 }} />
          </div>
          {caption && (
            <div role="status" className="pointer-events-none absolute inset-x-0 bottom-[11%] z-[26] flex justify-center px-4">
              <p className="market-boom max-w-[44rem] rounded-2xl bg-black/70 px-4 py-2 text-center text-[clamp(13px,1.9cqw,26px)] font-extrabold leading-snug text-white">{caption}</p>
            </div>
          )}
          {cine && cine !== "enter" && (
            <button type="button" onClick={skipScene} className="btn-bouncy absolute bottom-3 right-3 z-30 bg-[var(--surface)] px-3 py-1.5 text-sm font-bold">
              ⏭ {st.skip}
            </button>
          )}
          <div aria-hidden className="pointer-events-none absolute inset-0 z-[27] bg-white transition-opacity duration-200" style={{ opacity: fade ? 1 : 0 }} />

          {phase && (
            <>
              <canvas ref={cv} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />
              <div aria-hidden className="market-vignette pointer-events-none absolute inset-0" />
              <div ref={bars} aria-hidden className="pointer-events-none absolute inset-0 z-20">
                <div className="absolute left-0 right-0 top-0 bg-black" style={{ height: 0 }} />
                <div className="absolute bottom-0 left-0 right-0 bg-black" style={{ height: 0 }} />
              </div>
              <div ref={count} aria-hidden className="market-count" />
              {phase.kind !== "path" && (
                <button type="button" onClick={() => handle.current?.skip()} className="btn-bouncy absolute bottom-3 right-3 z-30 bg-[var(--surface)] px-3 py-1.5 text-sm font-bold">
                  ⏭ {st.skip}
                </button>
              )}
            </>
          )}
          <div className="absolute right-3 top-3 z-30 flex gap-2">
            <button type="button" onClick={() => !busyScene && playIntro()} disabled={busyScene} title={tl.ui.replay} className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--edge)] bg-[var(--surface)] text-xl shadow-[0_3px_0_var(--shadow-ink)] transition-transform hover:scale-110 disabled:opacity-50">
              <span aria-hidden>🎬</span>
              <span className="sr-only">{tl.ui.replay}</span>
            </button>
            <button type="button" onClick={() => !busyScene && setStoryOpen(true)} disabled={busyScene} title={storyText.button} className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--edge)] bg-[var(--surface)] text-xl shadow-[0_3px_0_var(--shadow-ink)] transition-transform hover:scale-110 disabled:opacity-50">
              <span aria-hidden>📖</span>
              <span className="sr-only">{storyText.button}</span>
            </button>
            <button type="button" onClick={() => !busyScene && setPickHero(true)} disabled={busyScene} title={tt.hero.button} className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--edge)] bg-[var(--surface)] text-xl shadow-[0_3px_0_var(--shadow-ink)] transition-transform hover:scale-110 disabled:opacity-50">
              <span aria-hidden>🧑‍🎤</span>
              <span className="sr-only">{tt.hero.button}</span>
            </button>
            <button type="button" onClick={toggleNight} title={mode === "auto" ? tt.auto : mode === "day" ? tt.day : tt.night} className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--edge)] bg-[var(--surface)] text-xl shadow-[0_3px_0_var(--shadow-ink)] transition-transform hover:scale-110">
              <span aria-hidden>{mode === "auto" ? "🕒" : mode === "day" ? "☀️" : "🌙"}</span>
              <span className="sr-only">{mode === "auto" ? tt.auto : mode === "day" ? tt.day : tt.night}</span>
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
              art={{ f: SPR[FOLK.find((f) => f.key === openNpc)!.k].f, n: SPR[FOLK.find((f) => f.key === openNpc)!.k].n }}
              loggedIn={col.loggedIn}
              snap={npcSnap}
              points={npcPoints}
              onClose={() => setOpenNpc(null)}
              onUpdate={(snap, points) => {
                setNpcSnap(snap);
                setNpcPoints(points);
              }}
            />
          )}
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

      {storyOpen && (
        <Modal title={`📖 ${storyText.title}`} onClose={() => setStoryOpen(false)} closeLabel={m.close}>
          <TownStory locale={locale} onClose={() => setStoryOpen(false)} />
        </Modal>
      )}
      {miniOpen && (
        <Modal title={`${MINI_ICON[miniOpen]} ${miniText.names[miniOpen]}`} onClose={() => setMiniOpen(null)} closeLabel={m.close}>
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
