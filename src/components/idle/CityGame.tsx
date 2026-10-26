"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { fillTokens, getCityText } from "@/i18n/city";
import {
  CITY_CATS,
  CITY_ITEMS,
  CITY_SIZE,
  OFFLINE_CAP_HOURS,
  buildMany,
  canPlace,
  computeCity,
  demolishAt,
  footprint,
  getItem,
  occupancy,
  settleCity,
  type CityCat,
  type CityState,
  type Placed,
} from "@/lib/idle/city";
import { notifyAccountChanged } from "@/lib/account-events";
import { SpriteStore, TH, TW, drawCity, screenToGrid, type Camera, type Ghost } from "@/components/idle/city-render";
import { createTraffic, updateTraffic } from "@/components/idle/city-traffic";
import type { Locale } from "@/i18n/config";

type Payload = {
  state: CityState;
  points: number;
  owned: string[];
  level: number;
  learningBonus: number;
  now: number;
};

type Load = "loading" | "login" | "unavailable" | "ready";
type Tool = "pan" | "demolish" | string;

const EMOJI: Record<string, string> = {
  road: "🛣️", rail: "🛤️", crossing: "🚦", bus_stop: "🚏", tram_stop: "🚊", train_station: "🚉",
  cottage: "🏠", house: "🏡", townhouse: "🏘️", apartments: "🏢", tower: "🏙️",
  stall: "🧺", shop: "🏪", bakery: "🥐", cafe: "☕", market: "🥕", supermarket: "🛒", workshop: "🔧",
  factory: "🏭", office: "🏬", hotel: "🏨", mall: "🛍️", skyscraper: "🌆",
  school: "🏫", library: "📚", fire_station: "🚒", police: "🚓", town_hall: "🏛️", hospital: "🏥", museum: "🖼️", university: "🎓",
  christmas_tree: "🎄", windmill: "🌬️", ferris_wheel: "🎡", carousel: "🎠", lighthouse: "🗼", rocket_pad: "🚀",
  gas_station: "⛽", parking: "🅿️", bus_station: "🚌", metro: "🚇", port: "⚓", airport: "✈️",
  restaurant: "🍽️", bank: "🏦", cinema: "🎬", theatre: "🎭", recycling: "♻️", solar_farm: "☀️", power_plant: "⚡",
  kindergarten: "🧸", post_office: "📬", church: "⛪", water_tower: "🚰", pool: "🏊", zoo: "🦁", observatory: "🔭",
  stadium: "🏟️", aquarium: "🐠", cathedral: "🕍", castle: "🏰",
  allotments: "🥕", forest: "🌲", lake: "🌊", mountain: "⛰️",
  pumpkin_patch: "🎃", christmas_market: "🎅", ice_rink: "⛸️", astronomical_clock: "🕰️",
  tree: "🌳", bush: "🌿", flowerbed: "🌷", park: "🏞️", playground: "🛝", pond: "🦆", fountain: "⛲",
  lamp: "💡", bench: "🪑", bin: "🗑️", fence: "🚧", mailbox: "📮", flag: "🚩", statue: "🗿", clock_tower: "🕰️", memorial: "🕊️", monument: "🗽",
};

const SYNC_EVERY_MS = 60_000;
const MIN_ZOOM = 0.35;
const MAX_ZOOM = 2.2;
const TAP_SLOP = 7;
const DAY_SECONDS = 240;

function nightAt(seconds: number): number {
  const x = 0.5 - 0.5 * Math.cos(((seconds % DAY_SECONDS) / DAY_SECONDS) * Math.PI * 2);
  return Math.max(0, Math.min(1, (x - 0.55) / 0.3));
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

type Gesture =
  | { kind: "none" }
  | { kind: "pan"; sx: number; sy: number; cx: number; cy: number; moved: boolean; tap: boolean }
  | { kind: "paint"; tiles: Map<number, { x: number; y: number }>; last: { x: number; y: number } | null; anchor: { gx: number; gy: number } }
  | { kind: "pinch"; dist: number; zoom: number };

function ToolButton({ label, icon, active = false, onClick }: { label: string; icon: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={label}
      aria-label={label}
      className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[var(--edge)] text-lg shadow-[0_3px_0_var(--shadow-ink)] ${
        active ? "bg-[var(--accent-yellow)] text-[#16132b]" : "bg-[var(--surface)] hover:bg-[var(--surface-muted)]"
      }`}
    >
      {icon}
    </button>
  );
}

export function CityGame({ locale }: { locale: Locale }) {
  const t = getCityText(locale);
  const [load, setLoad] = useState<Load>("loading");
  const [city, setCity] = useState<CityState | null>(null);
  const [points, setPoints] = useState(0);
  const [owned, setOwned] = useState<string[]>([]);
  const [level, setLevel] = useState(1);
  const [bonus, setBonus] = useState(0);
  const [offset, setOffset] = useState(0);
  const [nowMs, setNowMs] = useState(0);
  const [tool, setTool] = useState<Tool>("pan");
  const [rot, setRot] = useState<0 | 1>(0);
  const [cat, setCat] = useState<CityCat>("housing");
  const [selected, setSelected] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef<Camera>({ x: 0, y: (CITY_SIZE * TH) / 2, zoom: 0.6 });
  const sizeRef = useRef({ w: 800, h: 520, dpr: 1 });
  const gestureRef = useRef<Gesture>({ kind: "none" });
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const ghostsRef = useRef<Ghost[]>([]);
  const hoverRef = useRef<{ x: number; y: number } | null>(null);
  const trafficRef = useRef(createTraffic());
  const spritesRef = useRef<SpriteStore | null>(null);
  const cameraReadyRef = useRef(false);
  const pendingRef = useRef(0);
  const queueRef = useRef<Promise<void>>(Promise.resolve());

  const stats = useMemo(() => (city ? computeCity(city, bonus) : null), [city, bonus]);
  const occ = useMemo(() => (city ? occupancy(city.items) : new Map<number, number>()), [city]);
  const notWorking = useMemo(() => {
    const set = new Set<number>();
    stats?.working.forEach((ok, i) => {
      if (!ok) set.add(i);
    });
    return set;
  }, [stats]);

  // Poslední hodnoty pro kreslicí smyčku a pointer události (bez nového vykreslování).
  const latest = useRef({ city, level, points, owned, tool, rot, selected, notWorking, occ, offset });
  useEffect(() => {
    latest.current = { city, level, points, owned, tool, rot, selected, notWorking, occ, offset };
  });

  const apply = useCallback((data: Payload) => {
    setCity(data.state);
    setPoints(data.points);
    setOwned(data.owned ?? []);
    setLevel(data.level);
    setBonus(data.learningBonus);
    setOffset(data.now - Date.now());
    setNowMs(Date.now());
    setLoad("ready");
  }, []);

  const sync = useCallback(async () => {
    if (pendingRef.current > 0) return;
    try {
      const res = await fetch("/api/stale-hry/mesto");
      if (res.status === 401) {
        setLoad("login");
        return;
      }
      if (!res.ok) {
        setLoad((current) => (current === "ready" ? current : "unavailable"));
        return;
      }
      apply(await res.json());
    } catch {
      setLoad((current) => (current === "ready" ? current : "unavailable"));
    }
  }, [apply]);

  useEffect(() => {
    const first = window.setTimeout(sync, 0);
    const id = window.setInterval(sync, SYNC_EVERY_MS);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, [sync]);

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const toast = useCallback((text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage((m) => (m === text ? null : m)), 3500);
  }, []);

  const errorText = useCallback(
    (code: string | undefined) => t.errors[(code as keyof typeof t.errors) ?? "generic"] ?? t.errors.generic,
    [t],
  );

  const enqueue = useCallback(
    (body: Record<string, unknown>) => {
      pendingRef.current++;
      queueRef.current = queueRef.current.then(async () => {
        try {
          const res = await fetch("/api/stale-hry/mesto", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          const json = await res.json().catch(() => ({}));
          if (!res.ok) {
            toast(errorText(json.error) + (json.detail ? ` (${json.detail})` : ""));
            pendingRef.current--;
            await sync();
            return;
          }
          // Přijmeme stav ze serveru až po poslední čekající akci, ať město neposkakuje.
          if (pendingRef.current === 1) apply(json);
        } catch {
          toast(t.errors.generic);
        } finally {
          if (pendingRef.current > 0) pendingRef.current--;
        }
      });
    },
    [apply, errorText, sync, t.errors.generic, toast],
  );

  // --- stavění a bourání (okamžitě u sebe, na server se pošle po frontě) ---

  const commitBuild = useCallback(
    (requests: { id: string; x: number; y: number; rot: 0 | 1 }[]) => {
      const d = latest.current;
      if (!d.city || requests.length === 0) return;
      const settled = settleCity(d.city, Date.now() + d.offset, bonus);
      const res = buildMany(settled, requests, { level: d.level, points: d.points, owned: d.owned });
      if (!res.ok) {
        toast(errorText(res.error));
        return;
      }
      setCity(res.state);
      setPoints((p) => p - res.pointsSpent);
      if (res.pointsSpent > 0) notifyAccountChanged();
      if (res.failed > 0 && res.firstError) toast(errorText(res.firstError));
      enqueue({ action: "build", items: requests });
    },
    [bonus, enqueue, errorText, toast],
  );

  const commitDemolish = useCallback(
    (tiles: { x: number; y: number }[]) => {
      const d = latest.current;
      if (!d.city || tiles.length === 0) return;
      const settled = settleCity(d.city, Date.now() + d.offset, bonus);
      const res = demolishAt(settled, tiles);
      if (!res.ok) return;
      setCity(res.state);
      setSelected(null);
      enqueue({ action: "demolish", tiles });
    },
    [bonus, enqueue],
  );

  // --- kamera ---

  const clampCamera = useCallback(() => {
    const cam = cameraRef.current;
    cam.zoom = clamp(cam.zoom, MIN_ZOOM, MAX_ZOOM);
    cam.x = clamp(cam.x, -(CITY_SIZE * TW) / 2 - 160, (CITY_SIZE * TW) / 2 + 160);
    cam.y = clamp(cam.y, -120, CITY_SIZE * TH + 160);
  }, []);

  const zoomBy = useCallback(
    (factor: number, sx?: number, sy?: number) => {
      const cam = cameraRef.current;
      const { w, h } = sizeRef.current;
      const px = sx ?? w / 2;
      const py = sy ?? h / 2;
      const wx = (px - w / 2) / cam.zoom + cam.x;
      const wy = (py - h / 2) / cam.zoom + cam.y;
      cam.zoom = clamp(cam.zoom * factor, MIN_ZOOM, MAX_ZOOM);
      cam.x = wx - (px - w / 2) / cam.zoom;
      cam.y = wy - (py - h / 2) / cam.zoom;
      clampCamera();
    },
    [clampCamera],
  );

  const recenter = useCallback(() => {
    const { w } = sizeRef.current;
    const cam = cameraRef.current;
    cam.zoom = clamp(w / (CITY_SIZE * TW * 0.62), 0.4, 1);
    cam.x = 0;
    cam.y = (CITY_SIZE * TH) / 2;
  }, []);

  // --- velikost plátna a kreslicí smyčka ---

  useEffect(() => {
    if (load !== "ready") return;
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const spriteStore = new SpriteStore();
    spritesRef.current = spriteStore;
    void spriteStore.init();

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      sizeRef.current = { w: rect.width, h: rect.height, dpr };
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      if (!cameraReadyRef.current && rect.width > 0) {
        cameraReadyRef.current = true;
        recenter();
      }
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(wrap);

    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const d = latest.current;
      if (d.city) {
        updateTraffic(trafficRef.current, d.city.items, dt);
        const { w, h, dpr } = sizeRef.current;
        drawCity(ctx, w, h, dpr, cameraRef.current, {
          items: d.city.items,
          notWorking: d.notWorking,
          ghosts: ghostsRef.current,
          hover: hoverRef.current,
          selected: d.selected,
          night: nightAt(now / 1000),
          time: now / 1000,
          traffic: trafficRef.current,
          sprites: spritesRef.current,
        });
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      zoomBy(e.deltaY < 0 ? 1.12 : 1 / 1.12, e.clientX - rect.left, e.clientY - rect.top);
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      canvas.removeEventListener("wheel", onWheel);
    };
  }, [load, recenter, zoomBy]);

  // --- ovládání myší a prstem ---

  const gridAt = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return screenToGrid(cameraRef.current, rect.width, rect.height, clientX - rect.left, clientY - rect.top);
  };

  const buildTool = () => {
    const tl = latest.current.tool;
    return tl !== "pan" && tl !== "demolish" ? getItem(tl) : undefined;
  };

  const ghostFor = (id: string, x: number, y: number, rotation: 0 | 1, coinsLeft: number): Ghost => {
    const d = latest.current;
    const state = d.city ? { ...d.city, coins: coinsLeft } : null;
    const valid = state ? canPlace(state, id, x, y, rotation, { level: d.level, points: d.points, owned: d.owned }, d.occ).ok : false;
    return { id, x, y, rot: rotation, valid };
  };

  const updatePaintGhosts = (g: Extract<Gesture, { kind: "paint" }>) => {
    const d = latest.current;
    const def = buildTool();
    if (!def || !d.city) {
      ghostsRef.current = [];
      return;
    }
    const [w, h] = footprint(def, d.rot);
    if (w * h > 1) {
      const x = Math.floor(g.anchor.gx - w / 2 + 0.5);
      const y = Math.floor(g.anchor.gy - h / 2 + 0.5);
      ghostsRef.current = [ghostFor(def.id, x, y, d.rot, d.city.coins)];
      return;
    }
    let coins = d.city.coins;
    ghostsRef.current = [...g.tiles.values()].map((tile) => {
      const ghost = ghostFor(def.id, tile.x, tile.y, d.rot, coins);
      if (ghost.valid) coins -= def.cost;
      return ghost;
    });
  };

  const addPaintTile = (g: Extract<Gesture, { kind: "paint" }>, x: number, y: number) => {
    const from = g.last;
    g.last = { x, y };
    const points: { x: number; y: number }[] = [];
    if (from && (from.x !== x || from.y !== y)) {
      // lineární interpolace, aby při rychlém tažení nevznikly mezery
      const steps = Math.max(Math.abs(x - from.x), Math.abs(y - from.y));
      for (let i = 1; i <= steps; i++) {
        points.push({ x: Math.round(from.x + ((x - from.x) * i) / steps), y: Math.round(from.y + ((y - from.y) * i) / steps) });
      }
    } else {
      points.push({ x, y });
    }
    for (const p of points) {
      if (p.x < 0 || p.y < 0 || p.x >= CITY_SIZE || p.y >= CITY_SIZE) continue;
      if (g.tiles.size >= 80) return;
      g.tiles.set(p.y * CITY_SIZE + p.x, p);
    }
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    canvas.setPointerCapture(e.pointerId);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size === 2) {
      const [a, b] = [...pointersRef.current.values()];
      gestureRef.current = { kind: "pinch", dist: Math.hypot(a.x - b.x, a.y - b.y), zoom: cameraRef.current.zoom };
      ghostsRef.current = [];
      return;
    }

    const d = latest.current;
    const panDrag = e.button === 1 || e.button === 2 || d.tool === "pan";
    if (panDrag) {
      gestureRef.current = { kind: "pan", sx: e.clientX, sy: e.clientY, cx: cameraRef.current.x, cy: cameraRef.current.y, moved: false, tap: e.button === 0 };
      return;
    }

    const g = gridAt(e.clientX, e.clientY);
    const paint: Extract<Gesture, { kind: "paint" }> = { kind: "paint", tiles: new Map(), last: null, anchor: { gx: g.gx, gy: g.gy } };
    addPaintTile(paint, Math.floor(g.gx), Math.floor(g.gy));
    gestureRef.current = paint;
    if (d.tool === "demolish") {
      ghostsRef.current = [];
    } else {
      updatePaintGhosts(paint);
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const prev = pointersRef.current.get(e.pointerId);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gestureRef.current;
    const cam = cameraRef.current;

    if (g.kind === "pinch" && pointersRef.current.size >= 2) {
      const [a, b] = [...pointersRef.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (g.dist > 0) {
        const rect = e.currentTarget.getBoundingClientRect();
        const target = clamp(g.zoom * (dist / g.dist), MIN_ZOOM, MAX_ZOOM);
        zoomBy(target / cam.zoom, (a.x + b.x) / 2 - rect.left, (a.y + b.y) / 2 - rect.top);
      }
      return;
    }

    const grid = gridAt(e.clientX, e.clientY);
    const tile = { x: Math.floor(grid.gx), y: Math.floor(grid.gy) };
    hoverRef.current = tile.x >= 0 && tile.y >= 0 && tile.x < CITY_SIZE && tile.y < CITY_SIZE ? tile : null;

    if (g.kind === "pan") {
      const dx = e.clientX - g.sx;
      const dy = e.clientY - g.sy;
      if (Math.hypot(dx, dy) > TAP_SLOP) {
        g.moved = true;
        g.tap = false;
      }
      cam.x = g.cx - dx / cam.zoom;
      cam.y = g.cy - dy / cam.zoom;
      clampCamera();
      return;
    }
    if (g.kind === "paint") {
      g.anchor = { gx: grid.gx, gy: grid.gy };
      addPaintTile(g, tile.x, tile.y);
      if (latest.current.tool !== "demolish") updatePaintGhosts(g);
      return;
    }

    // jen pohyb myši: ukaž náhled
    const def = buildTool();
    if (def && prev === undefined && e.pointerType === "mouse" && latest.current.city) {
      const rotation = latest.current.rot;
      const [w, h] = footprint(def, rotation);
      ghostsRef.current = [
        ghostFor(def.id, Math.floor(grid.gx - w / 2 + 0.5), Math.floor(grid.gy - h / 2 + 0.5), rotation, latest.current.city.coins),
      ];
    }
  };

  const finishPointer = (e: React.PointerEvent<HTMLCanvasElement>, cancelled: boolean) => {
    pointersRef.current.delete(e.pointerId);
    const g = gestureRef.current;
    if (g.kind === "pinch") {
      if (pointersRef.current.size < 2) gestureRef.current = { kind: "none" };
      return;
    }
    gestureRef.current = { kind: "none" };
    if (cancelled) {
      ghostsRef.current = [];
      return;
    }

    if (g.kind === "pan" && g.tap && !g.moved) {
      const grid = gridAt(e.clientX, e.clientY);
      const index = latest.current.occ.get(Math.floor(grid.gy) * CITY_SIZE + Math.floor(grid.gx));
      const entry = index !== undefined ? latest.current.city?.items[index] : undefined;
      // silnice a koleje se nevybírají, jen se přes ně dá posouvat
      setSelected(index !== undefined && entry && entry[0] !== "road" && entry[0] !== "rail" ? index : null);
      return;
    }

    if (g.kind === "paint") {
      const d = latest.current;
      if (d.tool === "demolish") {
        commitDemolish([...g.tiles.values()]);
        ghostsRef.current = [];
        return;
      }
      const def = buildTool();
      if (!def) return;
      const [w, h] = footprint(def, d.rot);
      if (w * h > 1) {
        const x = Math.floor(g.anchor.gx - w / 2 + 0.5);
        const y = Math.floor(g.anchor.gy - h / 2 + 0.5);
        commitBuild([{ id: def.id, x, y, rot: d.rot }]);
      } else {
        commitBuild([...g.tiles.values()].map((tile) => ({ id: def.id, x: tile.x, y: tile.y, rot: d.rot })));
      }
      ghostsRef.current = [];
    }
  };

  // klávesy: R otočí, Esc zruší nástroj
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) return;
      if (e.key === "r" || e.key === "R") setRot((r) => (r === 0 ? 1 : 0));
      if (e.key === "Escape") {
        setTool("pan");
        setSelected(null);
        ghostsRef.current = [];
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const chooseTool = (next: Tool) => {
    setTool((current) => (current === next ? "pan" : next));
    setSelected(null);
    ghostsRef.current = [];
  };

  // --- vykreslení rozhraní ---

  const header = (
    <>
      <Link href={`/${locale}/stale-hry`} className="mb-4 inline-block text-sm font-semibold text-[var(--faint)] hover:text-[var(--foreground)]">
        {t.back}
      </Link>
      <h1 className="mb-1 text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
        🏙️ {t.title}
      </h1>
      <p className="mb-6 max-w-3xl text-[var(--muted)]">{t.subtitle}</p>
    </>
  );

  if (load === "loading") {
    return (
      <div>
        {header}
        <div className="card h-96 animate-pulse bg-[var(--surface-muted)]" aria-label={t.loading} />
      </div>
    );
  }
  if (load === "login") {
    return (
      <div>
        {header}
        <div className="card flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[var(--muted)]">{t.loginRequired}</p>
          <Link href={`/${locale}/prihlaseni`} className="btn-bouncy bg-[var(--brand-500)] px-5 py-2.5 text-sm font-bold text-white">
            {t.login}
          </Link>
        </div>
      </div>
    );
  }
  if (load === "unavailable" || !city || !stats) {
    return (
      <div>
        {header}
        <div className="card p-6 text-[var(--muted)]">{t.unavailable}</div>
      </div>
    );
  }

  const serverNow = nowMs + offset;
  const accrued = Math.floor(
    stats.incomePerHour * Math.min(OFFLINE_CAP_HOURS, Math.max(0, (serverNow - city.lastSeen) / 3_600_000)),
  );
  const liveCoins = city.coins + accrued;
  const mood = stats.happiness < 30 ? "😟" : stats.happiness < 55 ? "😐" : stats.happiness < 80 ? "🙂" : "😄";
  const moodText = stats.happiness < 30 ? t.mood.sad : stats.happiness < 55 ? t.mood.ok : stats.happiness < 80 ? t.mood.good : t.mood.great;
  const bonusPercent = Math.round(bonus * 100);
  const activeItem = tool !== "pan" && tool !== "demolish" ? getItem(tool) : undefined;
  const items = CITY_ITEMS.filter((i) => i.cat === cat);
  const hint = city.items.length <= CITY_SIZE + 2 && !activeItem && tool !== "demolish" ? t.hintStart : tool === "demolish" ? t.hintDemolish : activeItem ? t.hintBuild : t.hintPan;

  const selectedEntry: Placed | undefined = selected !== null ? city.items[selected] : undefined;
  const selectedDef = selectedEntry ? getItem(selectedEntry[0]) : undefined;

  const statBox = (label: string, value: string, sub?: string) => (
    <div className="rounded-xl border-2 border-[var(--edge)] bg-[var(--surface)] px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">{label}</p>
      <p className="text-lg font-extrabold leading-tight">{value}</p>
      {sub && <p className="text-[11px] text-[var(--muted)]">{sub}</p>}
    </div>
  );

  return (
    <div>
      {header}

      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {statBox(t.coins, `🪙 ${liveCoins.toLocaleString(locale)}`, fillTokens(t.income, { n: Math.round(stats.incomePerHour).toLocaleString(locale) }))}
        {statBox(t.points, `⭐ ${points.toLocaleString(locale)}`, `${t.level} ${level}`)}
        {statBox(t.population, `${stats.population.toLocaleString(locale)} / ${stats.capacity.toLocaleString(locale)}`)}
        {statBox(t.jobs, `${stats.employed.toLocaleString(locale)} / ${stats.jobs.toLocaleString(locale)}`, stats.unemployed > 0 ? `−${stats.unemployed}` : undefined)}
        {statBox(t.happiness, `${mood} ${Math.round(stats.happiness)} %`, moodText)}
        {statBox(t.buildings, String(stats.buildings), bonusPercent > 0 ? fillTokens(t.learningBonus, { n: bonusPercent }) : undefined)}
      </div>

      <div ref={wrapRef} className="relative h-[62vh] min-h-[380px] overflow-hidden rounded-2xl border-2 border-[var(--edge)] bg-[#0f1d2e] shadow-[0_4px_0_var(--shadow-ink)]">
        <canvas
          ref={canvasRef}
          className="block h-full w-full"
          style={{ touchAction: "none", cursor: tool === "pan" ? "grab" : "crosshair" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={(e) => finishPointer(e, false)}
          onPointerCancel={(e) => finishPointer(e, true)}
          onPointerLeave={() => {
            hoverRef.current = null;
            if (gestureRef.current.kind === "none") ghostsRef.current = [];
          }}
          onContextMenu={(e) => e.preventDefault()}
        />

        <div className="absolute left-2 top-2 flex flex-col gap-2">
          <ToolButton label={t.modePan} icon="✋" active={tool === "pan"} onClick={() => chooseTool("pan")} />
          <ToolButton label={t.modeDemolish} icon="🧹" active={tool === "demolish"} onClick={() => chooseTool("demolish")} />
          {activeItem && activeItem.size[0] !== activeItem.size[1] && (
            <ToolButton label={`${t.rotate} (R)`} icon="🔄" onClick={() => setRot((r) => (r === 0 ? 1 : 0))} />
          )}
        </div>
        <div className="absolute right-2 top-2 flex flex-col gap-2">
          <ToolButton label={t.zoomIn} icon="➕" onClick={() => zoomBy(1.25)} />
          <ToolButton label={t.zoomOut} icon="➖" onClick={() => zoomBy(1 / 1.25)} />
          <ToolButton label={t.recenter} icon="🎯" onClick={recenter} />
        </div>

        {selectedDef && selectedEntry && selected !== null && (
          <div className="absolute bottom-2 left-2 right-2 z-10 max-w-sm rounded-2xl border-2 border-[var(--edge)] bg-[var(--surface)] p-3 shadow-[0_4px_0_var(--shadow-ink)] sm:left-auto sm:right-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">{t.selected}</p>
                <p className="text-lg font-extrabold">
                  {EMOJI[selectedDef.id]} {selectedDef.names[locale]}
                </p>
              </div>
              <button type="button" onClick={() => setSelected(null)} aria-label={t.close} className="rounded-lg px-2 py-1 text-sm font-bold hover:bg-[var(--surface-muted)]">
                ✕
              </button>
            </div>
            <ul className="mt-1 space-y-0.5 text-sm text-[var(--muted)]">
              <li>
                {t.size}: {footprint(selectedDef, selectedEntry[3]).join(" × ")}
              </li>
              {selectedDef.housing ? (
                <li>
                  {t.residents}: {selectedDef.housing}
                  {stats.houseHappiness[selected] !== undefined ? ` · ${t.happiness}: ${Math.round(stats.houseHappiness[selected]!)} %` : ""}
                </li>
              ) : null}
              {selectedDef.jobs ? (
                <li>
                  {t.jobsHere}: {selectedDef.jobs}
                </li>
              ) : null}
              {selectedDef.edu ? (
                <li>
                  {t.education}: +{selectedDef.edu}
                </li>
              ) : null}
              {selectedDef.happy ? (
                <li>
                  {fillTokens(selectedDef.happy > 0 ? t.effect : t.effectNegative, {
                    n: selectedDef.happy > 0 ? `+${selectedDef.happy * 3}` : `${selectedDef.happy * 3}`,
                    r: selectedDef.radius ?? 0,
                  }).replace("++", "+")}
                </li>
              ) : null}
              <li className={notWorking.has(selected) ? "font-semibold text-[var(--danger)]" : "font-semibold text-[var(--accent-green)]"}>
                {notWorking.has(selected) ? (selectedDef.needsRail ? `${t.notConnected} ${t.needsRail}` : t.notConnected) : `✓ ${t.working}`}
              </li>
            </ul>
            <button
              type="button"
              onClick={() => commitDemolish([{ x: selectedEntry[1], y: selectedEntry[2] }])}
              className="btn-bouncy mt-2 w-full bg-[var(--surface)] px-3 py-1.5 text-sm font-bold text-[var(--danger)]"
            >
              🧹 {fillTokens(t.demolish, { n: Math.floor(selectedDef.cost * 0.5) })}
            </button>
          </div>
        )}
      </div>

      <p className="mt-2 text-sm text-[var(--muted)]">{hint}</p>

      <section className="card mt-4 p-4">
        <div className="mb-3 flex flex-wrap gap-1.5" role="tablist">
          {CITY_CATS.map((c) => (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={cat === c}
              onClick={() => setCat(c)}
              className={`rounded-lg border-2 px-3 py-1.5 text-sm font-semibold ${
                cat === c ? "border-[var(--edge)] bg-[var(--accent-yellow)] text-[#16132b]" : "border-transparent text-[var(--muted)] hover:border-[var(--edge)]"
              }`}
            >
              {t.cats[c]}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((def) => {
            const needsShop = !!def.shop && !owned.includes(def.id);
            const locked = def.level > level || needsShop;
            const active = tool === def.id;
            const poor = !locked && (city.coins + accrued < def.cost || (def.pointsCost ?? 0) > points);
            return (
              <button
                key={def.id}
                type="button"
                disabled={locked}
                onClick={() => chooseTool(def.id)}
                aria-pressed={active}
                className={`flex flex-col items-start gap-0.5 rounded-xl border-2 p-2.5 text-left ${
                  active ? "border-[var(--accent-500)] bg-[var(--surface-muted)]" : "border-[var(--border-soft)] hover:border-[var(--edge)]"
                } ${locked ? "cursor-not-allowed opacity-45" : ""}`}
              >
                <span className="flex w-full items-center justify-between">
                  <span className="text-2xl" aria-hidden>
                    {EMOJI[def.id]}
                  </span>
                  <span className="text-[11px] font-semibold text-[var(--muted)]">
                    {def.size[0]}×{def.size[1]}
                  </span>
                </span>
                <span className="text-sm font-bold leading-tight">{def.names[locale]}</span>
                <span className={`text-xs font-semibold ${poor ? "text-[var(--danger)]" : "text-[var(--muted)]"}`}>
                  {locked
                    ? `🔒 ${needsShop ? t.lockedShop : fillTokens(t.lockedLevel, { n: def.level })}`
                    : [def.cost > 0 ? `🪙 ${def.cost.toLocaleString(locale)}` : "", def.pointsCost ? `⭐ ${fillTokens(t.pointsCost, { n: def.pointsCost })}` : ""].filter(Boolean).join(" · ")}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <p className="mt-3 text-xs text-[var(--faint)]">
        {fillTokens(t.offlineNote, { n: OFFLINE_CAP_HOURS })} {t.learningHint}
      </p>

      {message && (
        <div role="status" className="pill fixed inset-x-0 bottom-6 z-50 mx-auto w-fit bg-[var(--danger)] px-4 py-2 text-sm text-white shadow-lg">
          {message}
        </div>
      )}
    </div>
  );
}
