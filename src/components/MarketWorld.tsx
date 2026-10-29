"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { Modal, Preview, type Snapshot } from "@/components/ShopView";
import { bannerCss, isFrameId } from "@/lib/cosmetics";
import { DEAL_DISCOUNT, SHOP_ITEMS, dailyDealIds, dayKey, salePrice, type ShopItem } from "@/lib/shop";
import { WORLDS, type SceneDef, type StallKey, type WorldId } from "@/lib/market-worlds";
import { getMarketText } from "@/i18n/market";
import { getShopText } from "@/i18n/shop";
import { getShopExtraText } from "@/i18n/shop-extra";
import { notifyAccountChanged } from "@/lib/account-events";
import type { Locale } from "@/i18n/config";
import pirateScene from "./pristav-kotvy.json";
import spaceScene from "./kosmicka-kotvy.json";
import { getWorldText, getUnlockText } from "@/i18n/market-world";
import { getTownHubText } from "@/i18n/town";
import { drawSea, wave } from "@/lib/market-scenery";

// Uživatelský obchod jako prostředí: pirátský přístav a vesmírná stanice z Blenderu (umime-art/blender/pristav*.py,
// kosmicka*.py). Vrstvy zespodu: moře nebo vesmír (canvas), hlavní předmět (loď, raketa), zadní vrstva (podlaha, stánky),
// obchodníci, přední vrstva (pulty), přední canvas (vlny, světla), ukazatele, koupené věci a neviditelná tlačítka stánků.
// Nákup i nošení věcí jde přes /api/shop a /api/profil, odemykání dalších světů přes akci unlockWorld.

type Anchor = { npc: number[]; pult: number[]; strecha: number[]; bublina: number[]; nazev: number[] };
type SceneData = { w: number; h: number; kotvy: Record<string, Anchor>; lod: number[]; lampy: number[][]; pena: number[][] } & Record<string, unknown>;
type Dot = { x: number; y: number; ph: number; layer: number; r: number };
const SCENES: Record<string, SceneData> = { pirate: pirateScene as unknown as SceneData, space: spaceScene as unknown as SceneData };

const W = 2000;
const H = 900;
const NPC_W = 11.9; // šířka sprite obchodníka v % šířky scény (256 px při 134,7 px/jednotku, scéna má 16 jednotek)
const NPC_FEET = 82.2; // kde mu leží chodidla ve sprite (% výšky)
const STALL_KEYS: StallKey[] = ["avatary", "tituly", "ramecky", "pozadi", "mazlicci"];

type State = { status: "loading" } | { status: "unavailable" } | { status: "guest" } | { status: "ready"; data: Snapshot };

const pt = (d: SceneData, key: string): number[] => (d[key] as number[] | undefined) ?? [0.5, 0.5];

function Sprite({ dir, file, n, dur, delay = 0, className, style }: { dir: string; file: string; n: number; dur: number; delay?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <span
      aria-hidden
      className={`town-sprite block ${className ?? ""}`}
      style={{ ["--n" as string]: n, backgroundImage: `url(${dir}/${file}.webp)`, animationDuration: `${dur}s`, animationDelay: `${delay}s`, ...style }}
    />
  );
}

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

// Hvězdy s třemi vrstvami pomalého driftu (blíž = rychleji a větší).
const STARS: Dot[] = Array.from({ length: 160 }, (_, i) => ({
  x: (Math.sin(i * 91.7) + 1) / 2,
  y: (Math.sin(i * 47.3 + 2) + 1) / 2,
  ph: i * 1.7,
  layer: i % 3,
  r: 0.7 + (i % 3) * 0.5,
}));

function drawSeaFront(fctx: CanvasRenderingContext2D, w: number, h: number, t: number, night: boolean, data: SceneData) {
  const [lx, ly] = data.lod;
  const baseY = ly * h;
  const x0 = lx * w - w * 0.15;
  const x1 = lx * w + w * 0.15;
  fctx.fillStyle = night ? "rgba(18,64,120,0.95)" : "rgba(34,150,215,0.92)";
  fctx.beginPath();
  fctx.moveTo(x0, baseY + h * 0.012);
  for (let x = x0; x <= x1; x += 8) fctx.lineTo(x, wave(x, baseY - 1, 2.2, t * 1.6, 0.05));
  fctx.lineTo(x1, baseY + h * 0.012);
  fctx.closePath();
  fctx.fill();
  fctx.strokeStyle = "rgba(255,255,255,0.85)";
  fctx.lineWidth = 2;
  fctx.beginPath();
  for (let x = x0; x <= x1; x += 8) {
    const yy = wave(x, baseY - 1, 2.2, t * 1.6, 0.05);
    if (x <= x0 + 1) fctx.moveTo(x, yy);
    else fctx.lineTo(x, yy);
  }
  fctx.stroke();
  for (const [px, py] of data.pena) {
    const k = (Math.sin(t * 1.6 + px * 30) + 1) / 2;
    fctx.strokeStyle = `rgba(255,255,255,${0.35 + k * 0.4})`;
    fctx.lineWidth = 2;
    fctx.beginPath();
    fctx.ellipse(px * w, py * h + h * 0.035, w * (0.012 + k * 0.006), h * 0.006, 0, 0, Math.PI * 2);
    fctx.stroke();
  }
  if (night) {
    glows(fctx, w, h, t, data.lampy, "255,205,110", 0.65);
    // paprsek majáku na obzoru
    const [mx, my] = pt(data, "majak");
    const bl = w * 0.22 * Math.max(0, Math.cos(t * 0.8));
    const gr = fctx.createLinearGradient(mx * w, my * h, mx * w - bl, my * h);
    gr.addColorStop(0, "rgba(255,246,190,0.55)");
    gr.addColorStop(1, "rgba(255,246,190,0)");
    fctx.globalCompositeOperation = "lighter";
    fctx.fillStyle = gr;
    fctx.beginPath();
    fctx.moveTo(mx * w, my * h);
    fctx.lineTo(mx * w - bl, my * h - h * 0.03);
    fctx.lineTo(mx * w - bl, my * h + h * 0.03);
    fctx.closePath();
    fctx.fill();
    fctx.globalCompositeOperation = "source-over";
  }
}

// Zářící lampy (sčítací míchání), v moři jen v noci, ve vesmíru pořád.
function glows(fctx: CanvasRenderingContext2D, w: number, h: number, t: number, lamps: number[][], rgb: string, strength: number) {
  fctx.globalCompositeOperation = "lighter";
  for (const [lx, ly] of lamps) {
    const flick = 0.85 + 0.15 * Math.sin(t * 7 + lx * 40);
    const g = fctx.createRadialGradient(lx * w, ly * h, 0, lx * w, ly * h, w * 0.05);
    g.addColorStop(0, `rgba(${rgb},${strength * flick})`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    fctx.fillStyle = g;
    fctx.fillRect(lx * w - w * 0.05, ly * h - w * 0.05, w * 0.1, w * 0.1);
  }
  fctx.globalCompositeOperation = "source-over";
}

function blob(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rgb: string, a: number) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgb},${a})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

function drawSpace(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#05061a");
  bg.addColorStop(0.55, "#12123f");
  bg.addColorStop(1, "#2a1450");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  // mlhoviny
  blob(ctx, w * 0.3, h * 0.2, w * 0.28, "120,70,200", 0.28);
  blob(ctx, w * 0.62, h * 0.12, w * 0.22, "40,150,220", 0.22);
  blob(ctx, w * 0.8, h * 0.4, w * 0.2, "230,80,160", 0.18);
  // hvězdy
  const speed = [0.0025, 0.005, 0.009];
  for (const s of STARS) {
    const x = (((s.x + t * speed[s.layer]) % 1) * w);
    const y = s.y * h * 0.8;
    ctx.fillStyle = `rgba(255,255,255,${0.35 + 0.65 * Math.abs(Math.sin(t * (0.8 + s.layer * 0.4) + s.ph))})`;
    ctx.fillRect(x, y, s.r, s.r);
  }
  // planeta s prstencem
  const px = w * 0.86;
  const py = h * 0.2;
  const pr = h * 0.1;
  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(-0.35);
  ctx.strokeStyle = "rgba(255,214,150,0.55)";
  ctx.lineWidth = pr * 0.12;
  ctx.beginPath();
  ctx.ellipse(0, 0, pr * 1.9, pr * 0.5, 0, Math.PI, Math.PI * 2);
  ctx.stroke();
  const pg = ctx.createRadialGradient(-pr * 0.35, -pr * 0.35, pr * 0.1, 0, 0, pr);
  pg.addColorStop(0, "#ffd18a");
  pg.addColorStop(0.6, "#e8803c");
  pg.addColorStop(1, "#8a3a1c");
  ctx.fillStyle = pg;
  ctx.beginPath();
  ctx.arc(0, 0, pr, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,214,150,0.55)";
  ctx.beginPath();
  ctx.ellipse(0, 0, pr * 1.9, pr * 0.5, 0, 0, Math.PI);
  ctx.stroke();
  ctx.restore();
  // modrá planeta s mraky vlevo
  const bx = w * 0.07;
  const by = h * 0.3;
  const br = h * 0.075;
  const bgd = ctx.createRadialGradient(bx - br * 0.3, by - br * 0.3, br * 0.1, bx, by, br);
  bgd.addColorStop(0, "#9ad8ff");
  bgd.addColorStop(0.7, "#2a78d0");
  bgd.addColorStop(1, "#143a80");
  ctx.fillStyle = bgd;
  ctx.beginPath();
  ctx.arc(bx, by, br, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.beginPath();
  ctx.arc(bx, by, br, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  for (let i = 0; i < 4; i++) {
    const cx = bx + ((((i * 0.37 + t * 0.02) % 1.4) - 0.7) * br * 2.6);
    ctx.beginPath();
    ctx.ellipse(cx, by - br * 0.5 + i * br * 0.35, br * 0.55, br * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  // padající hvězda každých 9 s
  const p = (t % 9) / 1.1;
  if (p < 1) {
    const sx = lerp(w * 0.75, w * 0.35, p);
    const sy = lerp(h * 0.05, h * 0.3, p);
    const g = ctx.createLinearGradient(sx, sy, sx + w * 0.08, sy - h * 0.06);
    g.addColorStop(0, `rgba(255,255,255,${1 - p})`);
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.strokeStyle = g;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + w * 0.08, sy - h * 0.06);
    ctx.stroke();
  }
}

function drawSpaceFront(fctx: CanvasRenderingContext2D, w: number, h: number, t: number, data: SceneData) {
  glows(fctx, w, h, t, data.lampy, "90,220,255", 0.55);
}

// Pozadí scény (moře nebo vesmír) a přední canvas se světly; vše se kreslí v jednom rAF, mimo obrazovku se zastaví.
function useScenery(stage: React.RefObject<HTMLDivElement | null>, back: React.RefObject<HTMLCanvasElement | null>, front: React.RefObject<HTMLCanvasElement | null>, nightRef: React.RefObject<boolean>, def: SceneDef, data: SceneData) {
  useEffect(() => {
    const box = stage.current;
    const cv = back.current;
    const fv = front.current;
    if (!box || !cv || !fv) return;
    const ctx = cv.getContext("2d");
    const fctx = fv.getContext("2d");
    if (!ctx || !fctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = true;
    let disposed = false;
    const t0 = performance.now();
    const resize = () => {
      const r = box.getBoundingClientRect();
      w = r.width;
      h = r.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      for (const c of [cv, fv]) {
        c.width = Math.round(w * dpr);
        c.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const frame = (now: number) => {
      raf = 0;
      if (disposed) return;
      const t = reduced ? 2 : (now - t0) / 1000;
      const night = nightRef.current;
      fctx.clearRect(0, 0, w, h);
      if (def.scenery === "sea") {
        drawSea(ctx, w, h, t, night);
        drawSeaFront(fctx, w, h, t, night, data);
      } else {
        drawSpace(ctx, w, h, t);
        drawSpaceFront(fctx, w, h, t, data);
      }
      if (visible && !reduced) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf && visible && !disposed) raf = requestAnimationFrame(frame);
    };
    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) frame(performance.now());
      kick();
    });
    ro.observe(box);
    resize();
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      kick();
    });
    io.observe(box);
    kick();
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [stage, back, front, nightRef, def, data]);
}

export function MarketWorld({ locale, initialWorld, film = false }: { locale: Locale; initialWorld?: WorldId; film?: boolean }) {
  const t = getShopText(locale);
  const x = getShopExtraText(locale);
  const m = getMarketText(locale);
  const ut = getUnlockText(locale);
  const town = getTownHubText(locale);
  const [state, setState] = useState<State>({ status: "loading" });
  const wanted = initialWorld && WORLDS.some((w) => w.id === initialWorld && w.ready) ? initialWorld : undefined;
  const [worldId, setWorldId] = useState<WorldId>(wanted && wanted === "pirate" ? "pirate" : "pirate");
  // po filmovém přechodu z městečka obraz zalévá závoj v barvě konce a pomalu se rozplyne
  const [veil, setVeil] = useState<{ color: string; fade: boolean } | null>(film ? { color: wanted === "space" ? "#9be8ff" : "#cfe8ff", fade: false } : null);
  const wantedDone = useRef(false);
  const [unlockId, setUnlockId] = useState<WorldId | null>(null);
  const [open, setOpen] = useState<StallKey | null>(null);
  const [hover, setHover] = useState<StallKey | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);
  const [popped, setPopped] = useState<{ id: string; stall: StallKey; n: number } | null>(null);
  const [gift, setGift] = useState<{ id: string; email: string } | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const back = useRef<HTMLCanvasElement>(null);
  const front = useRef<HTMLCanvasElement>(null);
  const seq = useRef(0);
  const [night, setNight] = useState(false);
  const [shot, setShot] = useState<{ n: number; id: string } | null>(null);
  const [talk, setTalk] = useState<{ id: string; text: string } | null>(null);
  const nightRef = useRef(false);

  const world = WORLDS.find((w) => w.id === worldId) ?? WORLDS[0];
  const def = world.scene ?? WORLDS[0].scene!;
  const data = SCENES[world.id] ?? SCENES.pirate;
  const wt = getWorldText(locale, world.id);
  const dir = def.dir;
  const dark = night && def.night;

  useEffect(() => {
    nightRef.current = dark;
  }, [dark]);
  useEffect(() => {
    // hráč, který si noc jednou zapnul, ji najde zase zapnutou
    const id = window.setTimeout(() => {
      try {
        if (window.localStorage.getItem("market-night") === "1") setNight(true);
      } catch {}
    }, 0);
    return () => window.clearTimeout(id);
  }, []);
  function toggleNight() {
    setNight((v) => {
      try {
        window.localStorage.setItem("market-night", v ? "0" : "1");
      } catch {}
      return !v;
    });
  }
  function fire(id: string) {
    setShot({ n: ++seq.current, id });
    window.setTimeout(() => setShot(null), 1700);
  }
  function say2(id: string) {
    const lines = wt.talk[id]?.lines ?? [];
    if (!lines.length) return;
    setTalk({ id, text: lines[++seq.current % lines.length] });
    window.setTimeout(() => setTalk(null), 2800);
  }
  useScenery(stage, back, front, nightRef, def, data);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/shop");
      if (!res.ok) {
        setState((s) => (s.status === "ready" ? s : { status: "unavailable" }));
        return;
      }
      const json = await res.json();
      setState(json.loggedIn ? { status: "ready", data: json } : { status: "guest" });
    } catch {
      setState((s) => (s.status === "ready" ? s : { status: "unavailable" }));
    }
  }, []);
  useEffect(() => {
    const id = window.setTimeout(load, 0);
    return () => window.clearTimeout(id);
  }, [load]);

  const say = useCallback((text: string, ok = false) => {
    setToast({ text, ok });
    window.setTimeout(() => setToast((c) => (c?.text === text ? null : c)), 3500);
  }, []);
  const errorText = (code: string | undefined) => {
    const c = code ?? "generic";
    return (x.errors as Record<string, string>)[c] ?? (t.errors as Record<string, string>)[c] ?? t.errors.generic;
  };

  async function post(payload: Record<string, unknown>, okText: string, busyKey: string): Promise<boolean> {
    if (busy) return false;
    setBusy(busyKey);
    try {
      const res = await fetch("/api/shop", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        say(errorText(json.error) + (json.detail ? ` (${json.detail})` : ""));
        if (json.error === "owned") void load();
        return false;
      }
      setState({ status: "ready", data: json });
      notifyAccountChanged();
      say(okText, true);
      return true;
    } catch {
      say(t.errors.generic);
      return false;
    } finally {
      setBusy(null);
    }
  }

  const ready = state.status === "ready" ? state.data : null;
  const owned = useMemo(() => new Set(ready?.owned ?? []), [ready]);
  const day = ready?.day ?? dayKey();
  const dealIds = useMemo(() => new Set(dailyDealIds(day)), [day]);
  const points = ready?.points ?? 0;
  const stallItems = (key: StallKey) => {
    const def = world.stalls.find((s) => s.key === key);
    return def ? SHOP_ITEMS.filter((i) => def.kinds.includes(i.kind)) : [];
  };

  async function buy(item: ShopItem, stall: StallKey) {
    const ok = await post({ action: "buy", id: item.id }, t.bought.replace("{name}", item.names[locale]), item.id);
    if (ok) {
      setOpen(null);
      setPopped({ id: item.id, stall, n: ++seq.current });
      window.setTimeout(() => setPopped((p) => (p && p.id === item.id ? null : p)), 2600);
    }
  }
  async function equip(item: ShopItem, remove: boolean) {
    if (busy || !ready) return;
    const key = item.kind as "avatar" | "title" | "frame" | "banner";
    setBusy(item.id);
    try {
      const res = await fetch("/api/profil", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [key]: remove ? null : item.ref }) });
      if (!res.ok) {
        say(t.errors.generic);
        return;
      }
      const value = remove ? null : item.ref;
      setState((s) => (s.status === "ready" ? { status: "ready", data: { ...s.data, equipped: { ...s.data.equipped, [key]: value } } } : s));
      notifyAccountChanged();
    } catch {
      say(t.errors.generic);
    } finally {
      setBusy(null);
    }
  }
  async function sendGift(item: ShopItem, email: string) {
    const ok = await post({ action: "gift", id: item.id, email }, x.giftSent.replace("{name}", item.names[locale]), `gift-${item.id}`);
    if (ok) setGift(null);
  }
  const isEquipped = (item: ShopItem) => !!ready && ready.equipped[item.kind as keyof typeof ready.equipped] === item.ref;

  const countOf = (key: StallKey) => {
    const list = stallItems(key);
    return { have: list.filter((i) => owned.has(i.id)).length, total: list.length };
  };

  const unlocked = (id: WorldId) => id === "pirate" || !!ready?.worlds?.includes(id);
  function pickWorld(id: WorldId) {
    const w = WORLDS.find((c) => c.id === id);
    if (!w || !w.ready) return;
    setOpen(null);
    setHover(null);
    setTalk(null);
    setShot(null);
    if (unlocked(id)) {
      setWorldId(id);
    } else setUnlockId(id);
  }
  async function unlockWorld(id: WorldId) {
    const ok = await post({ action: "unlockWorld", id }, ut.done, `world-${id}`);
    if (ok) {
      setUnlockId(null);
      setWorldId(id);
    }
  }

  useEffect(() => {
    if (!film) return;
    const a = window.setTimeout(() => setVeil((v) => (v ? { ...v, fade: true } : v)), 80);
    const b = window.setTimeout(() => setVeil(null), 1200);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [film]);
  useEffect(() => {
    // svět z adresy (?svet=): odemčený se otevře hned, zamčený nabídne odemčení
    if (!wanted || wantedDone.current || state.status === "loading") return;
    wantedDone.current = true;
    const id = window.setTimeout(() => pickWorld(wanted), 0);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status, wanted]);

  const openDef = open ? world.stalls.find((s) => s.key === open) : null;
  const openItems = open ? stallItems(open) : [];

  // Mini náhledy koupených věcí na pultě stánku (nejvýš čtyři, nejdřív nošená).
  const counterMinis = (key: StallKey) => {
    const mine = stallItems(key).filter((i) => owned.has(i.id));
    mine.sort((a, b) => Number(isEquipped(b)) - Number(isEquipped(a)));
    return mine.slice(0, 4);
  };
  const mini = (item: ShopItem) => {
    switch (item.kind) {
      case "avatar":
        return <Avatar id={item.ref} size={36} />;
      case "frame":
        return <Avatar id={ready?.equipped.avatar ?? "robot"} size={32} frame={isFrameId(item.ref) ? item.ref : null} />;
      case "banner":
        return <span className="block h-7 w-10 rounded border-2 border-[#16132b]" style={{ background: bannerCss(item.ref) }} />;
      case "title":
        return <span className="pill whitespace-nowrap bg-[var(--accent-yellow)] px-1.5 py-0.5 text-[9px] text-[#16132b]">{item.names[locale]}</span>;
      case "pet":
        return <span className="text-xl">🎀</span>;
      default:
        return <span className="text-xl">🏠</span>;
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h1 className="mb-1 text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          🛍️ {wt.title}
        </h1>
        <p className="max-w-3xl text-[var(--muted)]">{wt.subtitle}</p>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2" role="tablist" aria-label={m.title}>
        <Link href={`/${locale}/mestecko`} className="btn-bouncy flex items-center gap-1.5 bg-[var(--surface)] px-3 py-1.5 text-sm font-bold">
          <span aria-hidden>🏘️</span>
          {town.nav}
        </Link>
        {WORLDS.map((w) => {
          const on = w.id === worldId;
          const lock = w.ready && !unlocked(w.id);
          return (
            <button
              key={w.id}
              role="tab"
              aria-selected={on}
              disabled={!w.ready}
              title={w.ready ? (lock ? m.worldHint.replace("{level}", String(w.unlock.level)).replace("{points}", String(w.unlock.points)) : undefined) : `${m.soon} · ${m.worldHint.replace("{level}", String(w.unlock.level)).replace("{points}", String(w.unlock.points))}`}
              onClick={() => pickWorld(w.id)}
              className={`btn-bouncy flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold ${on ? "bg-[var(--accent-yellow)] text-[#16132b]" : "bg-[var(--surface)]"} ${w.ready ? "" : "cursor-not-allowed opacity-55"}`}
            >
              <span aria-hidden>{w.ready && !lock ? w.icon : "🔒"}</span>
              {m.worlds[w.id]}
              {!w.ready && <span className="pill bg-[var(--surface-muted)] px-1.5 text-[10px]">{m.soon}</span>}
              {lock && <span className="pill bg-[var(--surface-muted)] px-1.5 text-[10px]">{ut.locked}</span>}
            </button>
          );
        })}
        <span className="ml-auto flex items-center gap-2 rounded-full border-2 border-[var(--edge)] bg-[var(--surface)] px-3 py-1 text-sm font-extrabold">
          ⭐ {points} <span className="hidden text-xs font-semibold text-[var(--muted)] sm:inline">{m.points}</span>
        </span>
      </div>

      {state.status === "guest" && (
        <p className="mb-3 rounded-xl border-2 border-[var(--edge)] bg-[var(--surface)] px-4 py-2 text-sm">
          {m.loginHint}{" "}
          <Link href={`/${locale}/prihlaseni`} className="font-bold text-[var(--brand-600)] underline">
            {m.login}
          </Link>
        </p>
      )}
      {state.status === "unavailable" && <p className="mb-3 rounded-xl border-2 border-[var(--edge)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--muted)]">{t.unavailable}</p>}

      {veil && <div aria-hidden className="pointer-events-none fixed inset-0 z-[60]" style={{ background: veil.color, opacity: veil.fade ? 0 : 1, transition: "opacity 0.9s ease-out" }} />}
      <div className="overflow-x-auto overflow-y-hidden rounded-3xl border-2 border-[var(--edge)] shadow-[0_6px_0_var(--shadow-ink)]">
        <div ref={stage} data-night={dark ? "" : undefined} data-world={world.id} className="market-stage relative select-none overflow-hidden" style={{ aspectRatio: `${W} / ${H}`, minWidth: 880 }}>
          <canvas ref={back} aria-hidden className="absolute inset-0 h-full w-full" />
          {/* hlavní předmět: loď nebo raketa */}
          <div aria-hidden className="market-lit pointer-events-none absolute" style={{ left: `${data.lod[0] * 100}%`, top: `${data.lod[1] * 100}%`, width: `${def.prop.width}%`, aspectRatio: def.prop.ratio, transform: `translate(${def.prop.translate[0]}%, ${def.prop.translate[1]}%)` }}>
            <Sprite dir={dir} file={def.prop.file} n={def.prop.n} dur={def.prop.dur} className="h-full w-full" />
          </div>
          {/* zadní vrstva podlahy a stánků */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${dir}/zadni.webp`} alt="" draggable={false} className="market-lit pointer-events-none absolute inset-0 h-full w-full" />
          <canvas ref={front} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />
          {/* obchodníci */}
          {world.stalls.filter((s) => s.npc).map((s, i) => {
            const a = data.kotvy[s.key];
            return (
              <div key={s.key} aria-hidden className="market-lit pointer-events-none absolute" style={{ left: `${a.npc[0] * 100}%`, top: `${a.npc[1] * 100}%`, width: `${NPC_W}%`, aspectRatio: "1 / 1", transform: `translate(-50%, -${NPC_FEET}%)` }}>
                <Sprite dir={dir} file={s.npc} n={24} dur={3 + (i % 3) * 0.3} delay={-i * 0.7} className="h-full w-full" />
              </div>
            );
          })}
          {/* postavičky a zvířátka ve scéně */}
          {def.extras.map((e, i) => {
            const [ex, ey] = pt(data, e.anchor);
            return (
              <div key={e.file} aria-hidden className="market-lit pointer-events-none absolute" style={{ left: `${ex * 100}%`, top: `${ey * 100}%`, width: `${e.width}%`, aspectRatio: "1 / 1", transform: `translate(-50%, -${e.feet}%)` }}>
                <Sprite dir={dir} file={e.file} n={e.n ?? 24} dur={e.dur} delay={-i * 0.9} className="h-full w-full" />
              </div>
            );
          })}
          {/* přední vrstva: pulty */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${dir}/predni.webp`} alt="" draggable={false} className="market-lit pointer-events-none absolute inset-0 h-full w-full" />

          {/* koupené věci na pultech */}
          {STALL_KEYS.map((key) => {
            const a = data.kotvy[key];
            const list = counterMinis(key);
            return (
              <div key={`m-${key}`} className="pointer-events-none absolute flex items-end justify-center gap-0.5" style={{ left: `${a.pult[0] * 100}%`, top: `${a.pult[1] * 100}%`, width: "11%", transform: "translate(-50%, -100%)" }}>
                {list.map((item) => (
                  <span key={item.id} className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]">
                    {mini(item)}
                  </span>
                ))}
              </div>
            );
          })}

          {/* cedule nad stánky */}
          {STALL_KEYS.map((key) => {
            const a = data.kotvy[key];
            const c = countOf(key);
            return (
              <div key={`s-${key}`} className="pointer-events-none absolute z-[3] -translate-x-1/2 whitespace-nowrap rounded-md border-2 border-[#16132b] bg-[#3a2a1a] px-2 py-0.5 text-center text-[10px] font-extrabold leading-tight text-[#ffd76b] shadow-[0_2px_0_rgba(0,0,0,0.4)] sm:text-xs" style={{ left: `${a.nazev[0] * 100}%`, top: `${a.nazev[1] * 100}%` }}>
                {wt.stalls[key].name}
                <span className="block text-[9px] font-semibold text-white/80 sm:text-[10px]">{c.have}/{c.total}</span>
              </div>
            );
          })}
          <div className="pointer-events-none absolute z-[3] -translate-x-1/2 whitespace-nowrap rounded-md border-2 border-[#16132b] bg-[#3a2a1a] px-2 py-0.5 text-[10px] font-extrabold text-[#ffd76b] sm:text-xs" style={{ left: `${data.lod[0] * 100}%`, top: `${data.lod[1] * 100 + def.prop.labelDy}%` }}>
            ⚓ {wt.stalls.lod.name}
          </div>

          {/* bublina obchodníka */}
          {hover && hover !== "lod" && (
            <div className="pointer-events-none absolute z-[5] max-w-[16rem] -translate-x-1/2 -translate-y-full rounded-2xl border-2 border-[var(--edge)] bg-[var(--surface)] px-3 py-1.5 text-center text-xs font-bold shadow-[0_3px_0_var(--shadow-ink)] sm:text-sm" style={{ left: `${data.kotvy[hover].bublina[0] * 100}%`, top: `${data.kotvy[hover].bublina[1] * 100}%` }}>
              <span className="block text-[10px] font-extrabold text-[var(--brand-600)]">{wt.stalls[hover].npc}</span>
              {wt.stalls[hover].hello[0]}
            </div>
          )}

          {/* právě koupená věc dopadne na pult */}
          {popped && (() => {
            const item = SHOP_ITEMS.find((i) => i.id === popped.id);
            const a = data.kotvy[popped.stall];
            if (!item || !a) return null;
            return (
              <div key={popped.n} className="market-drop pointer-events-none absolute z-[6] -translate-x-1/2" style={{ left: `${a.pult[0] * 100}%`, top: `${a.pult[1] * 100}%` }}>
                <span className="relative block scale-150">{mini(item)}</span>
                {Array.from({ length: 10 }, (_, i) => (
                  <i key={i} className="market-spark" style={{ ["--a" as string]: `${i * 36}deg` }} />
                ))}
              </div>
            );
          })()}

          {/* neviditelná tlačítka stánků a hlavního předmětu */}
          {[...world.stalls].sort((a, b) => Number(b.key === "lod") - Number(a.key === "lod")).map((s) => {
            const isProp = s.key === "lod";
            const a = isProp ? null : data.kotvy[s.key];
            const [hx, hy, hw, hh] = def.prop.hit;
            const style = a
              ? { left: `${a.pult[0] * 100 - 6.9}%`, top: `${a.strecha[1] * 100 - 4}%`, width: "13.8%", height: `${(a.pult[1] - a.strecha[1]) * 100 + 14}%` }
              : { left: `${data.lod[0] * 100 + hx}%`, top: `${data.lod[1] * 100 + hy}%`, width: `${hw}%`, height: `${hh}%` };
            return (
              <button
                key={s.key}
                type="button"
                aria-label={`${wt.stalls[s.key].name}: ${m.open}`}
                onClick={() => setOpen(s.key)}
                onMouseEnter={() => setHover(s.key)}
                onMouseLeave={() => setHover((h) => (h === s.key ? null : h))}
                onFocus={() => setHover(s.key)}
                onBlur={() => setHover((h) => (h === s.key ? null : h))}
                className={`market-hit absolute ${isProp ? "z-[9]" : "z-10"} rounded-2xl outline-none focus-visible:ring-4 focus-visible:ring-[var(--accent-yellow)] ${hover === s.key ? "market-hit-on" : ""}`}
                style={style}
              />
            );
          })}

          {def.night && (
            <button type="button" onClick={toggleNight} aria-pressed={night} title={night ? m.day : m.night} className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--edge)] bg-[var(--surface)] text-xl shadow-[0_3px_0_var(--shadow-ink)] transition-transform hover:scale-110">
              <span aria-hidden>{night ? "☀️" : "🌙"}</span>
              <span className="sr-only">{night ? m.day : m.night}</span>
            </button>
          )}
          {/* klikací věci: kanón či sonda vystřelí, postavy promluví */}
          {def.interactive.map((it) => {
            const [ix, iy] = pt(data, it.anchor);
            const label = it.kind === "fire" ? wt.fireLabel : wt.talk[it.id]?.label ?? it.id;
            return (
              <button key={it.id} type="button" aria-label={label} title={label} onClick={() => (it.kind === "fire" ? fire(it.id) : say2(it.id))} className="market-hit absolute z-10 rounded-full" style={{ left: `${ix * 100 + it.dx}%`, top: `${iy * 100 + it.dy}%`, width: `${it.w}%`, height: `${it.h}%` }} />
            );
          })}
          {shot && (() => {
            const it = def.interactive.find((c) => c.id === shot.id);
            if (!it) return null;
            const [sx, sy] = pt(data, it.anchor);
            const laser = def.scenery === "space";
            return (
              <div key={shot.n} className="pointer-events-none absolute z-[8]" style={{ left: `${sx * 100}%`, top: `${sy * 100}%`, ["--dx" as string]: it.dir ?? -1 }}>
                <i className="market-puff" />
                <i className={`market-ball ${laser ? "market-laser" : ""}`} />
                <span className="market-boom absolute -left-12 -top-10 text-2xl font-black text-[#ffd76b] [text-shadow:0_2px_0_#16132b]">{wt.boom}</span>
              </div>
            );
          })()}
          {talk && (() => {
            const it = def.interactive.find((c) => c.id === talk.id);
            if (!it) return null;
            const [tx, ty] = pt(data, it.anchor);
            return (
              <div className="pointer-events-none absolute z-[7] max-w-[12rem] -translate-x-1/2 -translate-y-full rounded-2xl border-2 border-[var(--edge)] bg-[var(--surface)] px-3 py-1 text-center text-xs font-extrabold" style={{ left: `${tx * 100}%`, top: `${ty * 100 + it.dy}%` }}>
                {talk.text}
              </div>
            );
          })()}
          {toast && (
            <div role="status" className={`absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-full border-2 border-[var(--edge)] px-4 py-2 text-sm font-bold shadow-[0_3px_0_var(--shadow-ink)] ${toast.ok ? "bg-[var(--accent-green)] text-[#16132b]" : "bg-[var(--danger)] text-white"}`}>
              {toast.text}
            </div>
          )}
        </div>
      </div>

      {/* rychlá volba stánků (hlavně pro telefony) */}
      <div className="mt-3 flex flex-wrap gap-2">
        {world.stalls.map((s) => (
          <button key={s.key} type="button" onClick={() => setOpen(s.key)} className="btn-bouncy bg-[var(--surface)] px-3 py-1.5 text-sm font-bold">
            {wt.stalls[s.key].name}
            <span className="ml-1 text-xs font-semibold text-[var(--muted)]">
              {countOf(s.key).have}/{countOf(s.key).total}
            </span>
          </button>
        ))}
        <Link href={`/${locale}/uzivatelsky-obchod?seznam=1`} className="ml-auto self-center text-sm font-semibold text-[var(--muted)] underline hover:text-[var(--foreground)]">
          {m.classic}
        </Link>
      </div>

      {open && openDef && (
        <Modal title={`${wt.stalls[open].name} · ${wt.stalls[open].npc}`} onClose={() => setOpen(null)} closeLabel={m.close}>
          <p className="mb-3 rounded-xl bg-[var(--surface-muted)] px-3 py-2 text-sm font-semibold">„{wt.stalls[open].hello[(open.length + openItems.length) % wt.stalls[open].hello.length]}“</p>
          <p className="mb-3 text-xs text-[var(--muted)]">{m.owned.replace("{n}", String(countOf(open).have)).replace("{total}", String(countOf(open).total))} · ⭐ {points}</p>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {openItems.map((item) => {
              const have = owned.has(item.id);
              const price = salePrice(item, day);
              const onSale = dealIds.has(item.id);
              const missing = price - points;
              const equippable = item.kind === "avatar" || item.kind === "title" || item.kind === "frame" || item.kind === "banner";
              return (
                <li key={item.id} className="card flex flex-col gap-2 p-3">
                  <div className="relative">
                    <Preview item={item} locale={locale} avatar={ready?.equipped.avatar ?? null} />
                    {onSale ? (
                      <span className="pill absolute left-2 top-2 bg-[var(--danger)] px-2 py-0.5 text-[11px] text-white">-{Math.round(DEAL_DISCOUNT * 100)} %</span>
                    ) : (
                      item.tag && <span className="pill absolute left-2 top-2 bg-[var(--accent-500)] px-2 py-0.5 text-[11px] text-white">{item.tag === "new" ? t.tagNew : t.tagPopular}</span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold leading-tight">{item.names[locale]}</h3>
                  {!have ? (
                    <button
                      type="button"
                      disabled={!ready || busy !== null || missing > 0}
                      onClick={() => buy(item, open)}
                      className="btn-bouncy bg-[var(--brand-500)] px-3 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      {ready && missing > 0 ? t.needPoints.replace("{n}", String(missing)) : (
                        <>
                          ⭐ {onSale && <s className="opacity-70">{item.price}</s>} {price} · {t.buy}
                        </>
                      )}
                    </button>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-[var(--accent-green)]">✓ {t.owned}</p>
                      {equippable && (
                        <button
                          type="button"
                          disabled={busy !== null}
                          onClick={() => equip(item, isEquipped(item) && (item.kind === "frame" || item.kind === "banner"))}
                          className={`btn-bouncy px-3 py-2 text-sm font-bold disabled:opacity-45 ${isEquipped(item) ? "bg-[var(--surface-muted)]" : "bg-[var(--accent-yellow)] text-[#16132b]"}`}
                        >
                          {isEquipped(item) ? (item.kind === "frame" || item.kind === "banner" ? t.unequip : `✓ ${t.equipped}`) : t.equip}
                        </button>
                      )}
                      {item.kind === "pet" && (
                        <Link href={`/${locale}/stale-hry/mazlicci`} className="text-sm font-semibold text-[var(--brand-600)] hover:underline">
                          {t.useInPets} →
                        </Link>
                      )}
                      {item.kind === "city" && (
                        <Link href={`/${locale}/stale-hry/mesto`} className="text-sm font-semibold text-[var(--brand-600)] hover:underline">
                          {t.useInCity} →
                        </Link>
                      )}
                    </>
                  )}
                  {ready && (
                    <button type="button" onClick={() => setGift({ id: item.id, email: "" })} className="btn-bouncy bg-[var(--surface)] px-2 py-1 text-xs font-bold">
                      🎁 {m.gift}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </Modal>
      )}

      {unlockId && (() => {
        const w = WORLDS.find((c) => c.id === unlockId);
        if (!w) return null;
        const lvl = ready?.level ?? 0;
        const needLevel = lvl < w.unlock.level;
        const missing = w.unlock.points - points;
        return (
          <Modal title={`${w.icon} ${ut.title}`} onClose={() => setUnlockId(null)} closeLabel={m.close}>
            <p className="mb-3 text-sm font-semibold">{ut.text.replace("{name}", m.worlds[w.id]).replace("{level}", String(w.unlock.level)).replace("{points}", String(w.unlock.points))}</p>
            {!ready && <p className="mb-3 text-sm text-[var(--muted)]">{m.loginHint}</p>}
            {ready && needLevel && <p className="mb-3 text-sm font-bold text-[var(--danger)]">{ut.needLevel.replace("{level}", String(w.unlock.level))}</p>}
            {ready && !needLevel && missing > 0 && <p className="mb-3 text-sm font-bold text-[var(--danger)]">{ut.needPoints.replace("{n}", String(missing))}</p>}
            <button type="button" disabled={!ready || busy !== null || needLevel || missing > 0} onClick={() => unlockWorld(w.id)} className="btn-bouncy bg-[var(--brand-500)] px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-45">
              {ut.button.replace("{points}", String(w.unlock.points))}
            </button>
          </Modal>
        );
      })()}

      {gift && (() => {
        const item = SHOP_ITEMS.find((i) => i.id === gift.id);
        if (!item) return null;
        return (
          <Modal title={`🎁 ${item.names[locale]}`} onClose={() => setGift(null)} closeLabel={m.close}>
            <label className="flex flex-col gap-1 text-sm font-medium">
              {m.giftEmail}
              <input type="email" value={gift.email} onChange={(e) => setGift({ id: gift.id, email: e.target.value })} className="rounded-lg border border-[var(--border-soft)] px-3 py-2 outline-none focus:border-[var(--brand-500)]" />
            </label>
            <div className="mt-3 flex gap-2">
              <button type="button" disabled={busy !== null || !gift.email.includes("@")} onClick={() => sendGift(item, gift.email)} className="btn-bouncy bg-[var(--brand-500)] px-4 py-2 text-sm font-bold text-white disabled:opacity-45">
                {m.giftSend}
              </button>
              <button type="button" onClick={() => setGift(null)} className="btn-bouncy bg-[var(--surface)] px-4 py-2 text-sm font-bold">
                {m.cancel}
              </button>
            </div>
          </Modal>
        );
      })()}
    </div>
  );
}
