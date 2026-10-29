"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { Modal, Preview, type Snapshot } from "@/components/ShopView";
import { bannerCss, isFrameId } from "@/lib/cosmetics";
import { DEAL_DISCOUNT, SHOP_ITEMS, dailyDealIds, dayKey, salePrice, type ShopItem } from "@/lib/shop";
import { WORLDS, type StallKey, type WorldId } from "@/lib/market-worlds";
import { getMarketText } from "@/i18n/market";
import { getShopText } from "@/i18n/shop";
import { getShopExtraText } from "@/i18n/shop-extra";
import { notifyAccountChanged } from "@/lib/account-events";
import type { Locale } from "@/i18n/config";
import scene from "./pristav-kotvy.json";

// Uživatelský obchod jako prostředí: pirátský přístav z Blenderu (umime-art/blender/pristav*.py). Vrstvy zespodu:
// moře a nebe (canvas), loď, zadní vrstva mola a stánků, obchodníci, přední vrstva (pulty), vlny před lodí,
// ukazatele, koupené věci na pultech a neviditelná tlačítka stánků. Nákup i nošení věcí jde přes /api/shop a /api/profil.

const DIR = "/home/pristav";
const W = 2000;
const H = 900;
const NPC_W = 11.9; // šířka sprite obchodníka v % šířky scény (256 px při 134,7 px/jednotku, scéna má 125)
const NPC_FEET = 82.2; // kde mu leží chodidla ve sprite (% výšky)

type Anchor = { npc: number[]; pult: number[]; strecha: number[]; bublina: number[]; nazev: number[] };
const K = scene.kotvy as Record<string, Anchor>;
const STALL_KEYS: StallKey[] = ["avatary", "tituly", "ramecky", "pozadi", "mazlicci"];

type State = { status: "loading" } | { status: "unavailable" } | { status: "guest" } | { status: "ready"; data: Snapshot };

function Sprite({ file, n, dur, delay = 0, className, style }: { file: string; n: number; dur: number; delay?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <span
      aria-hidden
      className={`town-sprite block ${className ?? ""}`}
      style={{ ["--n" as string]: n, backgroundImage: `url(${DIR}/${file}.webp)`, animationDuration: `${dur}s`, animationDelay: `${delay}s`, ...style }}
    />
  );
}

// Moře, nebe, mraky, racci a pěna kolem pilot; vše v jednom canvasu, pozastaví se mimo obrazovku.
function useSea(stage: React.RefObject<HTMLDivElement | null>, sea: React.RefObject<HTMLCanvasElement | null>, front: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const box = stage.current;
    const cv = sea.current;
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
    const clouds = [0.12, 0.38, 0.7, 0.9].map((x, i) => ({ x, y: 0.05 + (i % 2) * 0.07, s: 0.7 + (i % 3) * 0.25, v: 0.004 + i * 0.0015 }));
    const gulls = [0, 1, 2].map((i) => ({ x: 0.2 + i * 0.3, y: 0.14 + i * 0.05, v: 0.018 + i * 0.006, ph: i * 2 }));
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
    const wave = (x: number, y: number, a: number, t: number, f: number) => y + Math.sin(x * f + t) * a + Math.sin(x * f * 2.3 - t * 1.3) * a * 0.4;
    const frame = (now: number) => {
      raf = 0;
      if (disposed) return;
      const t = reduced ? 2 : (now - t0) / 1000;
      // nebe a moře
      const sky = ctx.createLinearGradient(0, 0, 0, h * 0.34);
      sky.addColorStop(0, "#6ec6ff");
      sky.addColorStop(1, "#d8f1ff");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);
      const horizon = h * 0.3;
      const sea = ctx.createLinearGradient(0, horizon, 0, h);
      sea.addColorStop(0, "#3fb8e8");
      sea.addColorStop(0.5, "#1f86cf");
      sea.addColorStop(1, "#14529c");
      ctx.fillStyle = sea;
      ctx.fillRect(0, horizon, w, h - horizon);
      // slunce
      ctx.fillStyle = "rgba(255,244,190,0.95)";
      ctx.beginPath();
      ctx.arc(w * 0.86, h * 0.1, h * 0.05, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,244,190,0.25)";
      ctx.beginPath();
      ctx.arc(w * 0.86, h * 0.1, h * 0.09, 0, Math.PI * 2);
      ctx.fill();
      // mraky
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      for (const c of clouds) {
        const x = (((c.x + t * c.v) % 1.2) - 0.1) * w;
        const y = c.y * h;
        const r = h * 0.03 * c.s;
        for (const [dx, dy, k] of [[0, 0, 1], [1.1, 0.2, 0.8], [-1.1, 0.25, 0.75], [0.4, -0.5, 0.8], [-0.5, -0.3, 0.7]] as const) {
          ctx.beginPath();
          ctx.arc(x + dx * r, y + dy * r, r * k, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // vlny: pásy čar se zpožděním podle hloubky
      for (let i = 0; i < 11; i++) {
        const y0 = horizon + ((i + 1) / 12) * (h - horizon);
        const a = 1.2 + i * 0.5;
        ctx.strokeStyle = `rgba(255,255,255,${0.1 + i * 0.012})`;
        ctx.lineWidth = 1 + i * 0.15;
        ctx.beginPath();
        for (let x = 0; x <= w; x += 12) {
          const yy = wave(x, y0, a, t * (0.8 + i * 0.05) + i, 0.012 - i * 0.0004);
          if (x === 0) ctx.moveTo(x, yy);
          else ctx.lineTo(x, yy);
        }
        ctx.stroke();
      }
      // třpyt slunce na vodě
      for (let i = 0; i < 26; i++) {
        const sx = w * (0.86 + Math.sin(i * 12.9) * 0.07);
        const sy = horizon + (i / 26) * h * 0.2;
        const on = (Math.sin(t * 2 + i * 1.7) + 1) / 2;
        ctx.fillStyle = `rgba(255,255,230,${0.2 + on * 0.5})`;
        ctx.fillRect(sx - 6 - on * 6, sy, 12 + on * 12, 1.6);
      }
      // racci
      ctx.strokeStyle = "rgba(255,255,255,0.95)";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      for (const g of gulls) {
        const x = (((g.x + t * g.v) % 1.1) - 0.05) * w;
        const y = g.y * h + Math.sin(t * 0.7 + g.ph) * h * 0.012;
        const flap = Math.sin(t * 6 + g.ph) * 6;
        ctx.beginPath();
        ctx.moveTo(x - 12, y + flap * 0.6);
        ctx.quadraticCurveTo(x - 5, y - 6 - flap, x, y);
        ctx.quadraticCurveTo(x + 5, y - 6 - flap, x + 12, y + flap * 0.6);
        ctx.stroke();
      }
      // přední vlny: lodní kýl a pěna u pilot mola
      fctx.clearRect(0, 0, w, h);
      const [lx, ly] = scene.lod as number[];
      const baseY = ly * h;
      fctx.fillStyle = "rgba(34,150,215,0.9)";
      fctx.beginPath();
      fctx.moveTo(lx * w - w * 0.2, baseY + h * 0.04);
      for (let x = lx * w - w * 0.2; x <= lx * w + w * 0.2; x += 8) fctx.lineTo(x, wave(x, baseY + 3, 3, t * 1.6, 0.05));
      fctx.lineTo(lx * w + w * 0.2, baseY + h * 0.04);
      fctx.closePath();
      fctx.fill();
      fctx.strokeStyle = "rgba(255,255,255,0.85)";
      fctx.lineWidth = 2;
      fctx.beginPath();
      for (let x = lx * w - w * 0.2; x <= lx * w + w * 0.2; x += 8) {
        const yy = wave(x, baseY + 3, 3, t * 1.6, 0.05);
        if (x <= lx * w - w * 0.2 + 1) fctx.moveTo(x, yy);
        else fctx.lineTo(x, yy);
      }
      fctx.stroke();
      for (const [px, py] of scene.pena as number[][]) {
        const k = (Math.sin(t * 1.6 + px * 30) + 1) / 2;
        fctx.strokeStyle = `rgba(255,255,255,${0.35 + k * 0.4})`;
        fctx.lineWidth = 2;
        fctx.beginPath();
        fctx.ellipse(px * w, py * h + h * 0.035, w * (0.012 + k * 0.006), h * 0.006, 0, 0, Math.PI * 2);
        fctx.stroke();
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
  }, [stage, sea, front]);
}

export function MarketWorld({ locale }: { locale: Locale }) {
  const t = getShopText(locale);
  const x = getShopExtraText(locale);
  const m = getMarketText(locale);
  const [state, setState] = useState<State>({ status: "loading" });
  const [worldId, setWorldId] = useState<WorldId>("pirate");
  const [open, setOpen] = useState<StallKey | null>(null);
  const [hover, setHover] = useState<StallKey | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);
  const [popped, setPopped] = useState<{ id: string; stall: StallKey; n: number } | null>(null);
  const [gift, setGift] = useState<{ id: string; email: string } | null>(null);
  const seq = useRef(0);
  const stage = useRef<HTMLDivElement>(null);
  const sea = useRef<HTMLCanvasElement>(null);
  const front = useRef<HTMLCanvasElement>(null);
  useSea(stage, sea, front);

  const world = WORLDS.find((w) => w.id === worldId) ?? WORLDS[0];

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
          🛍️ {m.worlds[worldId]}
        </h1>
        <p className="max-w-3xl text-[var(--muted)]">{m.subtitle}</p>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2" role="tablist" aria-label={m.title}>
        {WORLDS.map((w) => {
          const on = w.id === worldId;
          return (
            <button
              key={w.id}
              role="tab"
              aria-selected={on}
              disabled={!w.ready}
              title={w.ready ? undefined : `${m.soon} · ${m.worldHint.replace("{level}", String(w.unlock.level)).replace("{points}", String(w.unlock.points))}`}
              onClick={() => w.ready && setWorldId(w.id)}
              className={`btn-bouncy flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold ${on ? "bg-[var(--accent-yellow)] text-[#16132b]" : "bg-[var(--surface)]"} ${w.ready ? "" : "cursor-not-allowed opacity-55"}`}
            >
              <span aria-hidden>{w.ready ? w.icon : "🔒"}</span>
              {m.worlds[w.id]}
              {!w.ready && <span className="pill bg-[var(--surface-muted)] px-1.5 text-[10px]">{m.soon}</span>}
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

      <div className="overflow-x-auto rounded-3xl border-2 border-[var(--edge)] shadow-[0_6px_0_var(--shadow-ink)]">
        <div ref={stage} className="relative select-none overflow-hidden" style={{ aspectRatio: `${W} / ${H}`, minWidth: 880 }}>
          <canvas ref={sea} aria-hidden className="absolute inset-0 h-full w-full" />
          {/* loď */}
          <div aria-hidden className="pointer-events-none absolute" style={{ left: `${scene.lod[0] * 100}%`, top: `${scene.lod[1] * 100}%`, width: "32%", aspectRatio: "640 / 512", transform: "translate(-50%, -78.1%)" }}>
            <Sprite file="lod" n={12} dur={3.6} className="h-full w-full" />
          </div>
          {/* zadní vrstva mola a stánků */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${DIR}/zadni.webp`} alt="" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full" />
          <canvas ref={front} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />
          {/* obchodníci */}
          {world.stalls.filter((s) => s.npc).map((s, i) => {
            const a = K[s.key];
            return (
              <div key={s.key} aria-hidden className="pointer-events-none absolute" style={{ left: `${a.npc[0] * 100}%`, top: `${a.npc[1] * 100}%`, width: `${NPC_W}%`, aspectRatio: "1 / 1", transform: `translate(-50%, -${NPC_FEET}%)` }}>
                <Sprite file={s.npc} n={24} dur={3 + (i % 3) * 0.3} delay={-i * 0.7} className="h-full w-full" />
              </div>
            );
          })}
          {/* papoušek na bidýlku a krab na molu */}
          <div aria-hidden className="pointer-events-none absolute" style={{ left: `${scene.papousek[0] * 100}%`, top: `${scene.papousek[1] * 100}%`, width: "7.2%", aspectRatio: "1 / 1", transform: "translate(-50%, -63%)" }}>
            <Sprite file="papousek" n={24} dur={4} className="h-full w-full" />
          </div>
          <div aria-hidden className="pointer-events-none absolute" style={{ left: `${scene.krab[0] * 100}%`, top: `${scene.krab[1] * 100}%`, width: "5.6%", aspectRatio: "1 / 1", transform: "translate(-50%, -63%)" }}>
            <Sprite file="krab" n={24} dur={3.2} className="h-full w-full" />
          </div>
          {/* přední vrstva: pulty a sudy */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${DIR}/predni.webp`} alt="" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full" />

          {/* koupené věci na pultech */}
          {STALL_KEYS.map((key) => {
            const a = K[key];
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
            const a = K[key];
            const c = countOf(key);
            return (
              <div key={`s-${key}`} className="pointer-events-none absolute z-[3] -translate-x-1/2 whitespace-nowrap rounded-md border-2 border-[#16132b] bg-[#3a2a1a] px-2 py-0.5 text-center text-[10px] font-extrabold leading-tight text-[#ffd76b] shadow-[0_2px_0_rgba(0,0,0,0.4)] sm:text-xs" style={{ left: `${a.nazev[0] * 100}%`, top: `${a.nazev[1] * 100}%` }}>
                {m.stalls[key].name}
                <span className="block text-[9px] font-semibold text-white/80 sm:text-[10px]">{c.have}/{c.total}</span>
              </div>
            );
          })}
          <div className="pointer-events-none absolute z-[3] -translate-x-1/2 whitespace-nowrap rounded-md border-2 border-[#16132b] bg-[#3a2a1a] px-2 py-0.5 text-[10px] font-extrabold text-[#ffd76b] sm:text-xs" style={{ left: `${scene.lod[0] * 100}%`, top: `${scene.lod[1] * 100 - 4}%` }}>
            ⚓ {m.stalls.lod.name}
          </div>

          {/* bublina obchodníka */}
          {hover && hover !== "lod" && (
            <div className="pointer-events-none absolute z-[5] max-w-[16rem] -translate-x-1/2 -translate-y-full rounded-2xl border-2 border-[var(--edge)] bg-[var(--surface)] px-3 py-1.5 text-center text-xs font-bold shadow-[0_3px_0_var(--shadow-ink)] sm:text-sm" style={{ left: `${K[hover].bublina[0] * 100}%`, top: `${K[hover].bublina[1] * 100}%` }}>
              <span className="block text-[10px] font-extrabold text-[var(--brand-600)]">{m.stalls[hover].npc}</span>
              {m.stalls[hover].hello[0]}
            </div>
          )}

          {/* právě koupená věc dopadne na pult */}
          {popped && (() => {
            const item = SHOP_ITEMS.find((i) => i.id === popped.id);
            const a = K[popped.stall];
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

          {/* neviditelná tlačítka stánků a lodi */}
          {world.stalls.map((s) => {
            const a = s.key === "lod" ? null : K[s.key];
            const style = a
              ? { left: `${a.pult[0] * 100 - 6.9}%`, top: `${a.strecha[1] * 100 - 4}%`, width: "13.8%", height: `${(a.pult[1] - a.strecha[1]) * 100 + 14}%` }
              : { left: `${scene.lod[0] * 100 - 13}%`, top: `${scene.lod[1] * 100 - 26}%`, width: "26%", height: "28%" };
            return (
              <button
                key={s.key}
                type="button"
                aria-label={`${m.stalls[s.key].name}: ${m.open}`}
                onClick={() => setOpen(s.key)}
                onMouseEnter={() => setHover(s.key)}
                onMouseLeave={() => setHover((h) => (h === s.key ? null : h))}
                onFocus={() => setHover(s.key)}
                onBlur={() => setHover((h) => (h === s.key ? null : h))}
                className={`market-hit absolute z-10 rounded-2xl outline-none focus-visible:ring-4 focus-visible:ring-[var(--accent-yellow)] ${hover === s.key ? "market-hit-on" : ""}`}
                style={style}
              />
            );
          })}

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
            {m.stalls[s.key].name}
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
        <Modal title={`${m.stalls[open].name} · ${m.stalls[open].npc}`} onClose={() => setOpen(null)} closeLabel={m.close}>
          <p className="mb-3 rounded-xl bg-[var(--surface-muted)] px-3 py-2 text-sm font-semibold">„{m.stalls[open].hello[(open.length + openItems.length) % m.stalls[open].hello.length]}“</p>
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
