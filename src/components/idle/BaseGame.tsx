"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { formatDuration, getBaseText, type BaseText } from "@/i18n/base";
import {
  BASE_CATS,
  BASE_SIZE,
  DESTINATIONS,
  MODULES,
  SHIPS,
  canPlace,
  footprint,
  getDest,
  getModule,
  getShip,
  isUnlocked,
  missionDurationMs,
  occupancy,
  type BaseCat,
  type BaseState,
  type Bonus,
  type DestDef,
  type ModuleDef,
  type Ship,
} from "@/lib/idle/base";
import { EventPill, type EventInfo } from "@/components/idle/EventPill";
import { cellAt, drawBase, moduleIcon, planetImage, shipIcon, CAT_COLORS } from "@/components/idle/base-render";
import { notifyAccountChanged } from "@/lib/account-events";
import type { Locale } from "@/i18n/config";

type Stats = {
  energyProduced: number;
  energyUsed: number;
  powerFactor: number;
  housing: number;
  crewNeeded: number;
  crewFactor: number;
  lifeCapacity: number;
  lifeFactor: number;
  efficiency: number;
  creditsPerHour: number;
  sciencePerHour: number;
  slots: number;
  shipyards: number;
  missionBonus: number;
  modules: number;
};

type Payload = {
  state: BaseState;
  points: number;
  level: number;
  bonus: Bonus;
  event?: EventInfo;
  now: number;
  stats: Stats;
  idle: number[];
  info?: Record<string, unknown>;
};

type Load = "loading" | "login" | "unavailable" | "ready";
type Tab = "build" | "fleet" | "map" | "codex";
type Tool = { kind: "none" } | { kind: "module"; id: string } | { kind: "demolish" };

const SYNC_EVERY_MS = 60_000;
const SHIP_ICONS = { probe: "🛰️", shuttle: "🚀", explorer: "🛸" } as const;

// 3D render z public/base (modul, loď); čistě ozdobný, název stojí vždy vedle.
function Art({ src, size }: { src: string; size: number }) {
  // Když obrázek chybí (nová věc bez ilustrace), ukáže se neutrální dlaždice místo rozbité ikony.
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span aria-hidden className="inline-flex shrink-0 items-center justify-center rounded-lg border-2 border-[var(--border-soft)] bg-[var(--surface-muted)] text-[var(--faint)]" style={{ width: size, height: size, fontSize: size * 0.5 }}>
        ◈
      </span>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" width={size} height={size} className="shrink-0" style={{ width: size, height: size }} onError={() => setFailed(true)} />;
}

const fmt = (n: number) => Math.round(n).toLocaleString("cs-CZ");
const pct = (n: number) => `${Math.round(n * 100)} %`;

function Meter({ label, value, note, ok }: { label: string; value: number; note: string; ok: boolean }) {
  return (
    <div className="min-w-[8.5rem] flex-1">
      <div className="flex items-baseline justify-between text-xs font-bold">
        <span>{label}</span>
        <span className="font-semibold text-[var(--muted)]">{note}</span>
      </div>
      <div className="mt-1 h-2.5 overflow-hidden rounded-full border-2 border-[var(--edge)] bg-[var(--surface-muted)]">
        <div className="h-full" style={{ width: `${Math.round(Math.min(1, value) * 100)}%`, background: ok ? "var(--accent-green, #3ddc97)" : "var(--danger)" }} />
      </div>
    </div>
  );
}

function LessonCard({ t, locale, id }: { t: BaseText; locale: Locale; id: string }) {
  const lesson = t.modules[id];
  const def = getModule(id);
  if (!lesson || !def) return null;
  const bits: string[] = [];
  if (def.energy) bits.push(`${def.energy > 0 ? "+" : ""}${def.energy} ⚡`);
  if (def.housing) bits.push(`+${def.housing} 🛏️`);
  if (def.crew) bits.push(`${def.crew} 👩‍🚀`);
  if (def.life) bits.push(`+${def.life} 🫁`);
  if (def.credits) bits.push(`${def.credits} 💰/${t.units.hours}`);
  if (def.science) bits.push(`${def.science} 🔬/${t.units.hours}`);
  if (def.slots) bits.push(`${def.slots} 🚀`);
  return (
    <div className="card p-4 text-sm">
      <p className="flex items-center gap-2 text-base font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>
        <Art src={moduleIcon(id)} size={40} />
        {def.names[locale]}
      </p>
      {bits.length > 0 && <p className="mt-1 text-xs font-semibold text-[var(--muted)]">{bits.join("  ·  ")}</p>}
      <p className="mt-3 text-xs font-bold uppercase tracking-wide text-[var(--accent-500)]">{t.build.howTitle}</p>
      <p className="mt-1">{lesson.how}</p>
      <p className="mt-3 text-xs font-bold uppercase tracking-wide text-[var(--accent-500)]">{t.build.factTitle}</p>
      <p className="mt-1 text-[var(--muted)]">{lesson.fact}</p>
    </div>
  );
}

export function BaseGame({ locale }: { locale: Locale }) {
  const t = getBaseText(locale);
  const [load, setLoad] = useState<Load>("loading");
  const [data, setData] = useState<Payload | null>(null);
  const [offset, setOffset] = useState(0);
  const [nowMs, setNowMs] = useState(0);
  const [tab, setTab] = useState<Tab>("build");
  const [tool, setTool] = useState<Tool>({ kind: "none" });
  const [rot, setRot] = useState<0 | 1>(0);
  const [cat, setCat] = useState<BaseCat>("energy");
  const [lessonId, setLessonId] = useState<string>("core");
  const [selected, setSelected] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [destPick, setDestPick] = useState<string>("moon");
  const [shipPick, setShipPick] = useState<Record<string, string>>({});
  const [quiz, setQuiz] = useState<{ correct: boolean; correctIndex: number; dest: string; science: number } | null>(null);

  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sizeRef = useRef({ px: 520, dpr: 1 });
  const hoverRef = useRef<{ x: number; y: number } | null>(null);
  const pendingRef = useRef(0);
  const queueRef = useRef<Promise<void>>(Promise.resolve());

  const state = data?.state ?? null;
  const occ = useMemo(() => (state ? occupancy(state.items) : new Map<number, number>()), [state]);
  const idleSet = useMemo(() => new Set(data?.idle ?? []), [data]);
  const now = nowMs + offset;

  const latest = useRef({ state, tool, rot, selected, idleSet, data });
  useEffect(() => {
    latest.current = { state, tool, rot, selected, idleSet, data };
  });

  const apply = useCallback((payload: Payload) => {
    setData(payload);
    setOffset(payload.now - Date.now());
    setNowMs(Date.now());
    setLoad("ready");
  }, []);

  const sync = useCallback(async () => {
    if (pendingRef.current > 0) return;
    try {
      const res = await fetch("/api/stale-hry/zakladna");
      if (res.status === 401) {
        setLoad("login");
        return;
      }
      if (!res.ok) {
        setLoad((c) => (c === "ready" ? c : "unavailable"));
        return;
      }
      apply(await res.json());
    } catch {
      setLoad((c) => (c === "ready" ? c : "unavailable"));
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
    window.setTimeout(() => setMessage((m) => (m === text ? null : m)), 4000);
  }, []);

  const errorText = useCallback((code: string | undefined) => t.errors[(code as keyof typeof t.errors) ?? "unavailable"] ?? t.errors.unavailable, [t]);

  const act = useCallback(
    (body: Record<string, unknown>, after?: (p: Payload) => void) => {
      pendingRef.current++;
      queueRef.current = queueRef.current.then(async () => {
        try {
          const res = await fetch("/api/stale-hry/zakladna", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          const json = await res.json().catch(() => ({}));
          if (!res.ok) {
            toast(errorText(json?.error));
            if (res.status === 409 || res.status === 503) {
              pendingRef.current = Math.max(0, pendingRef.current - 1);
              await sync();
              pendingRef.current++;
            }
            return;
          }
          apply(json);
          if (body.action === "build" || body.action === "buildShip") notifyAccountChanged();
          after?.(json);
        } catch {
          toast(errorText("unavailable"));
        } finally {
          pendingRef.current = Math.max(0, pendingRef.current - 1);
        }
      });
    },
    [apply, errorText, sync, toast],
  );

  // --- plátno ---

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || load !== "ready" || tab !== "build") return;
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const px = Math.max(280, Math.min(640, Math.floor(wrap.clientWidth)));
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      sizeRef.current = { px, dpr };
      canvas.width = Math.round(px * dpr);
      canvas.height = Math.round(px * dpr);
      canvas.style.width = `${px}px`;
      canvas.style.height = `${px}px`;
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(wrap);
    let raf = 0;
    const start = performance.now();
    const loop = () => {
      const canvas = canvasRef.current;
      const l = latest.current;
      if (canvas && l.state) {
        const { px, dpr } = sizeRef.current;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          let ghost = null;
          const hover = hoverRef.current;
          if (l.tool.kind === "module" && hover && l.data) {
            const def = getModule(l.tool.id);
            if (def) {
              const [w, h] = footprint(def, l.rot);
              const gx = Math.max(0, Math.min(BASE_SIZE - w, hover.x - Math.floor(w / 2)));
              const gy = Math.max(0, Math.min(BASE_SIZE - h, hover.y - Math.floor(h / 2)));
              ghost = { id: def.id, x: gx, y: gy, rot: l.rot, valid: canPlace(l.state, def.id, gx, gy, l.rot, { level: l.data.level, points: l.data.points }).ok };
            }
          }
          drawBase(ctx, px, dpr, {
            items: l.state.items,
            idle: l.idleSet,
            ghost,
            hover: l.tool.kind === "module" ? null : hover,
            selected: l.selected,
            demolish: l.tool.kind === "demolish",
            docked: l.state.ships.filter((s) => !s.mission).length,
            time: (performance.now() - start) / 1000,
          });
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [load, tab]);

  const pointerCell = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return cellAt(rect.width, e.clientX - rect.left, e.clientY - rect.top);
  };

  const onCanvasMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    hoverRef.current = pointerCell(e);
  };

  const onCanvasLeave = () => {
    hoverRef.current = null;
  };

  const onCanvasClick = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const cell = pointerCell(e);
    hoverRef.current = cell;
    if (!cell || !state) return;
    if (tool.kind === "module") {
      const def = getModule(tool.id);
      if (!def) return;
      const [w, h] = footprint(def, rot);
      const x = Math.max(0, Math.min(BASE_SIZE - w, cell.x - Math.floor(w / 2)));
      const y = Math.max(0, Math.min(BASE_SIZE - h, cell.y - Math.floor(h / 2)));
      act({ action: "build", items: [{ id: def.id, x, y, rot }] }, (p) => {
        if (!p.state.codex.includes(def.id)) return;
        setLessonId(def.id);
      });
    } else if (tool.kind === "demolish") {
      act({ action: "demolish", tiles: [cell] });
    } else {
      const index = occ.get(cell.y * BASE_SIZE + cell.x);
      setSelected(index ?? null);
      if (index !== undefined) setLessonId(state.items[index][0]);
    }
  };

  // klávesa R otáčí vybraný modul
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "r" || e.key === "R") setRot((r) => (r === 0 ? 1 : 0));
      if (e.key === "Escape") setTool({ kind: "none" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (load === "loading") return <p className="text-[var(--muted)]">{t.loading}</p>;
  if (load === "login") {
    return (
      <div className="card flex flex-wrap items-center justify-between gap-4 p-6">
        <p>{t.loginPrompt}</p>
        <Link href={`/${locale}/prihlaseni`} className="btn-bouncy bg-[var(--brand-500)] px-4 py-2 font-bold text-white">
          {t.login}
        </Link>
      </div>
    );
  }
  if (load === "unavailable" || !data || !state) return <div className="card p-6 text-center text-[var(--muted)]">{t.unavailable}</div>;

  const { stats, bonus } = data;
  const debrief = state.debriefs[0] ?? null;
  const arrived = state.ships.filter((s) => s.mission && s.mission.endsAt <= now).length;
  const docked = state.ships.filter((s) => !s.mission);
  const moduleName = (def: ModuleDef) => def.names[locale];

  const tabBtn = (id: Tab, label: string, badge?: number) => (
    <button
      key={id}
      type="button"
      onClick={() => setTab(id)}
      aria-pressed={tab === id}
      className={`pill px-4 py-2 text-sm font-bold ${tab === id ? "bg-[var(--brand-500)] text-white" : "bg-[var(--surface-muted)] text-[var(--muted)] hover:bg-[var(--brand-50)]"}`}
    >
      {label}
      {badge ? <span className="ml-1.5 rounded-full bg-[var(--accent-yellow)] px-1.5 text-[11px] text-[#16132b]">{badge}</span> : null}
    </button>
  );

  const paletteModules = MODULES.filter((m) => m.cat === cat && m.id !== "core");

  const sendShip = (ship: Ship, destId: string) => act({ action: "launch", ship: ship.id, dest: destId });

  const destChoices = (ship: Ship): DestDef[] => {
    const def = getShip(ship.type)!;
    return DESTINATIONS.filter((d) => d.tier <= def.tier && isUnlocked(state, d));
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          {t.title}
        </h1>
        <p className="mt-1 max-w-2xl text-[var(--muted)]">{t.intro}</p>
      </div>

      {/* zdroje */}
      <div className="card flex flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-bold">
          <span>💰 {fmt(state.credits)} <span className="text-xs font-semibold text-[var(--muted)]">{t.stats.credits} (+{fmt(stats.creditsPerHour)} {t.stats.perHour})</span></span>
          <span>🔬 {fmt(state.science)} <span className="text-xs font-semibold text-[var(--muted)]">{t.stats.science} (+{stats.sciencePerHour.toFixed(1)} {t.stats.perHour})</span></span>
          <span>⭐ {fmt(data.points)} <span className="text-xs font-semibold text-[var(--muted)]">{t.stats.points}</span></span>
          <span className="text-xs font-semibold text-[var(--muted)]">
            {t.stats.bonuses}: {t.stats.learning} {pct(bonus.learning)} · {t.stats.pet} {pct(bonus.pet)} · {t.stats.city} {pct(bonus.city)}
          </span>
          <EventPill event={data.event} locale={locale} />
        </div>
        <div className="flex flex-wrap gap-4">
          <Meter label={`⚡ ${t.stats.energy}`} value={stats.powerFactor} note={`${stats.energyProduced} / ${stats.energyUsed}`} ok={stats.powerFactor >= 1} />
          <Meter label={`👩‍🚀 ${t.stats.crew}`} value={stats.crewFactor} note={`${stats.housing} / ${stats.crewNeeded}`} ok={stats.crewFactor >= 1} />
          <Meter label={`🫁 ${t.stats.life}`} value={stats.lifeFactor} note={`${stats.lifeCapacity}`} ok={stats.lifeFactor >= 1} />
          <Meter label={t.stats.efficiency} value={stats.efficiency} note={pct(stats.efficiency)} ok={stats.efficiency >= 0.99} />
        </div>
        {stats.powerFactor < 1 && <p className="text-xs font-semibold text-[var(--danger)]">{t.build.lowPower}</p>}
        {stats.crewFactor < 1 && <p className="text-xs font-semibold text-[var(--danger)]">{t.build.lowCrew}</p>}
        {stats.lifeFactor < 1 && <p className="text-xs font-semibold text-[var(--danger)]">{t.build.lowLife}</p>}
      </div>

      <div className="flex flex-wrap gap-2">
        {tabBtn("build", t.tabs.build)}
        {tabBtn("fleet", t.tabs.fleet, arrived)}
        {tabBtn("map", t.tabs.map)}
        {tabBtn("codex", t.tabs.codex)}
      </div>

      {message && (
        <div role="status" className="rounded-xl border-2 border-[var(--edge)] bg-[var(--accent-yellow)] px-4 py-2 text-sm font-bold text-[#16132b]">
          {message}
        </div>
      )}

      {tab === "build" && (
        <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
          <div ref={wrapRef} className="flex flex-col items-center gap-3">
            <canvas
              ref={canvasRef}
              onPointerMove={onCanvasMove}
              onPointerLeave={onCanvasLeave}
              onPointerDown={onCanvasClick}
              className="touch-manipulation rounded-2xl border-2 border-[var(--edge)] shadow-[0_4px_0_var(--shadow-ink)]"
              style={{ cursor: tool.kind === "demolish" ? "not-allowed" : tool.kind === "module" ? "copy" : "pointer" }}
              aria-label={t.title}
            />
            <p className="max-w-xl text-center text-xs text-[var(--muted)]">{t.build.hint}</p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-1.5">
              {BASE_CATS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCat(c)}
                  aria-pressed={cat === c}
                  className={`pill px-3 py-1.5 text-xs font-bold ${cat === c ? "text-[#16132b]" : "bg-[var(--surface-muted)] text-[var(--muted)]"}`}
                  style={cat === c ? { background: CAT_COLORS[c] } : undefined}
                >
                  {t.cats[c]}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {paletteModules.map((m) => {
                const locked = m.level > data.level;
                const active = tool.kind === "module" && tool.id === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setTool({ kind: "module", id: m.id });
                      setLessonId(m.id);
                    }}
                    aria-pressed={active}
                    className={`flex flex-col gap-0.5 rounded-xl border-2 border-[var(--edge)] p-2 text-left text-xs shadow-[0_3px_0_var(--shadow-ink)] ${active ? "bg-[var(--accent-yellow)] text-[#16132b]" : "bg-[var(--surface)] hover:bg-[var(--surface-muted)]"} ${locked ? "opacity-55" : ""}`}
                  >
                    <Art src={moduleIcon(m.id)} size={40} />
                    <span className="font-bold">{moduleName(m)}</span>
                    <span className="text-[11px] opacity-80">
                      {locked ? `${t.build.needLevel} ${m.level}` : `💰 ${fmt(m.cost)}${m.pointsCost ? ` · ⭐ ${m.pointsCost}` : ""}`}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setTool({ kind: "demolish" })} aria-pressed={tool.kind === "demolish"} className={`btn-bouncy px-3 py-1.5 text-xs font-bold ${tool.kind === "demolish" ? "bg-[var(--danger)] text-white" : "bg-[var(--surface)]"}`}>
                🗑 {t.build.demolish}
              </button>
              <button type="button" onClick={() => setRot((r) => (r === 0 ? 1 : 0))} className="btn-bouncy bg-[var(--surface)] px-3 py-1.5 text-xs font-bold">
                ⟳ {t.build.rotate} (R)
              </button>
              {tool.kind !== "none" && (
                <button type="button" onClick={() => setTool({ kind: "none" })} className="btn-bouncy bg-[var(--surface)] px-3 py-1.5 text-xs font-bold">
                  ✕ {t.build.cancel}
                </button>
              )}
            </div>

            <LessonCard t={t} locale={locale} id={lessonId} />
            {selected !== null && idleSet.has(selected) && <p className="text-xs font-semibold text-[var(--danger)]">{t.build.disconnected}</p>}
          </div>
        </div>
      )}

      {tab === "fleet" && (
        <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-bold">
              {t.fleet.title} <span className="text-sm font-semibold text-[var(--muted)]">· {t.fleet.slots}: {state.ships.length}/{stats.slots}</span>
            </h2>
            {state.ships.length === 0 && <div className="card p-5 text-sm text-[var(--muted)]">{t.fleet.empty}</div>}
            {state.ships.map((ship) => {
              const def = getShip(ship.type)!;
              const building = ship.readyAt > now;
              const mission = ship.mission;
              const done = mission && mission.endsAt <= now;
              const dest = mission ? getDest(mission.dest) : null;
              const total = mission ? mission.endsAt - mission.startedAt : 0;
              const progress = mission ? Math.min(1, Math.max(0, (now - mission.startedAt) / Math.max(1, total))) : 0;
              const choices = destChoices(ship);
              const picked = shipPick[ship.id] && choices.some((c) => c.id === shipPick[ship.id]) ? shipPick[ship.id] : choices[choices.length - 1]?.id;
              return (
                <div key={ship.id} className="card flex flex-col gap-2 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="flex items-center gap-2 font-bold">
                      <Art src={shipIcon(ship.type)} size={44} />
                      {def.names[locale]}
                    </p>
                    <span className="pill bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-bold">
                      {building ? `${t.fleet.building} · ${formatDuration(ship.readyAt - now, t.units)}` : done ? t.fleet.arrived : mission ? t.fleet.onMission : t.fleet.docked}
                    </span>
                  </div>
                  {mission && dest && (
                    <>
                      <p className="text-sm text-[var(--muted)]">→ {dest.names[locale]}{!done && ` · ${t.fleet.returnsIn} ${formatDuration(mission.endsAt - now, t.units)}`}</p>
                      <div className="h-2.5 overflow-hidden rounded-full border-2 border-[var(--edge)] bg-[var(--surface-muted)]">
                        <div className="h-full bg-[var(--accent-500)]" style={{ width: `${Math.round(progress * 100)}%` }} />
                      </div>
                    </>
                  )}
                  {!building && !mission && choices.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        aria-label={t.fleet.chooseDest}
                        value={picked}
                        onChange={(e) => setShipPick((p) => ({ ...p, [ship.id]: e.target.value }))}
                        className="rounded-xl border-2 border-[var(--edge)] bg-[var(--surface)] px-3 py-1.5 text-sm font-semibold"
                      >
                        {choices.map((d) => (
                          <option key={d.id} value={d.id}>{d.names[locale]} · {formatDuration(missionDurationMs(d, def), t.units)}</option>
                        ))}
                      </select>
                      <button type="button" onClick={() => picked && sendShip(ship, picked)} className="btn-bouncy bg-[var(--brand-500)] px-4 py-1.5 text-sm font-bold text-white">
                        {t.fleet.send}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            {arrived > 0 && (
              <button type="button" onClick={() => act({ action: "collect" })} className="btn-bouncy self-start bg-[var(--accent-yellow)] px-5 py-2 font-bold text-[#16132b]">
                🎁 {t.fleet.collect} ({arrived})
              </button>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-bold">{t.fleet.buildShip}</h2>
            {stats.shipyards < 1 && <p className="text-xs font-semibold text-[var(--danger)]">{t.fleet.needShipyard}</p>}
            {SHIPS.map((s) => {
              const locked = s.level > data.level;
              return (
                <div key={s.id} className={`card flex flex-col gap-1 p-3 text-sm ${locked ? "opacity-55" : ""}`}>
                  <p className="flex items-center gap-2 font-bold">
                    <Art src={shipIcon(s.id)} size={36} />
                    {s.names[locale]}
                    <span className="text-xs font-semibold text-[var(--muted)]">{t.fleet.tier} {s.tier} · {t.fleet.speed} ×{s.speed}</span>
                  </p>
                  <p className="text-xs text-[var(--muted)]">{t.ships[s.id].desc}</p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold">
                      💰 {fmt(s.cost)}{s.pointsCost ? ` · ⭐ ${s.pointsCost}` : ""} · {t.fleet.buildTime} {s.buildMinutes} {t.units.minutes}
                    </span>
                    <button
                      type="button"
                      disabled={locked || stats.shipyards < 1}
                      onClick={() => act({ action: "buildShip", type: s.id })}
                      className="btn-bouncy bg-[var(--brand-500)] px-3 py-1 text-xs font-bold text-white disabled:opacity-50"
                    >
                      {locked ? `${t.build.needLevel} ${s.level}` : t.fleet.buildShip}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "map" && (
        <SpaceMap
          t={t}
          locale={locale}
          state={state}
          now={now}
          destPick={destPick}
          onPick={setDestPick}
          docked={docked}
          onResearch={(id) => act({ action: "research", dest: id })}
          onSend={(shipId, destId) => act({ action: "launch", ship: shipId, dest: destId })}
        />
      )}

      {tab === "codex" && (
        <div className="flex flex-col gap-4">
          <p className="max-w-2xl text-sm text-[var(--muted)]">{t.codex.intro}</p>
          <h2 className="text-lg font-bold">{t.codex.modules}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {MODULES.map((m) => {
              const known = state.codex.includes(m.id);
              return (
                <div key={m.id} className={`card p-3 text-sm ${known ? "" : "opacity-50"}`}>
                  <p className="flex items-center gap-2 font-bold">{known ? <><Art src={moduleIcon(m.id)} size={32} /> {moduleName(m)}</> : `? ${t.codex.unknown}`}</p>
                  {known && (
                    <>
                      <p className="mt-1">{t.modules[m.id].how}</p>
                      <p className="mt-2 text-xs text-[var(--muted)]">💡 {t.modules[m.id].fact}</p>
                    </>
                  )}
                </div>
              );
            })}
          </div>
          <h2 className="text-lg font-bold">{t.codex.worlds}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DESTINATIONS.map((d) => {
              const known = state.codex.includes(d.id);
              return (
                <div key={d.id} className={`card p-3 text-sm ${known ? "" : "opacity-50"}`}>
                  <p className="flex items-center gap-2 font-bold">
                    <span className="inline-block h-4 w-4 rounded-full" style={{ background: known ? d.color : "#555" }} aria-hidden />
                    {known ? d.names[locale] : `? ${t.codex.unknown}`}
                  </p>
                  {known && (
                    <>
                      <p className="mt-1">{t.dests[d.id].blurb}</p>
                      <p className="mt-2 text-xs text-[var(--muted)]">💡 {t.dests[d.id].fact}</p>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {debrief && (
        <DebriefModal
          t={t}
          destId={debrief.dest}
          result={quiz && quiz.dest === debrief.dest ? quiz : null}
          bonus={debrief.science}
          onAnswer={(i) => act({ action: "answer", choice: i }, (p) => setQuiz({ dest: String(p.info?.dest), correct: !!p.info?.correct, correctIndex: Number(p.info?.correctIndex ?? 0), science: Number(p.info?.science ?? 0) }))}
          onClose={() => setQuiz(null)}
        />
      )}
      {!debrief && quiz && (
        <DebriefModal t={t} destId={quiz.dest} result={quiz} bonus={quiz.science} onAnswer={() => {}} onClose={() => setQuiz(null)} />
      )}
    </div>
  );
}

function DebriefModal({
  t,
  destId,
  result,
  bonus,
  onAnswer,
  onClose,
}: {
  t: BaseText;
  destId: string;
  result: { correct: boolean; correctIndex: number; science: number } | null;
  bonus: number;
  onAnswer: (index: number) => void;
  onClose: () => void;
}) {
  const text = t.dests[destId];
  if (!text) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label={t.debrief.title} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="card max-h-[90vh] w-full max-w-lg overflow-y-auto p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--accent-500)]">{t.debrief.title}</p>
        <p className="mt-1 text-lg font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>{text.question}</p>
        <div className="mt-4 flex flex-col gap-2">
          {text.options.map((option, i) => {
            const isCorrect = result ? i === result.correctIndex : false;
            return (
              <button
                key={option}
                type="button"
                disabled={!!result}
                onClick={() => onAnswer(i)}
                className={`rounded-xl border-2 border-[var(--edge)] px-3 py-2 text-left text-sm font-semibold ${result ? (isCorrect ? "bg-[#3ddc97] text-[#16132b]" : "bg-[var(--surface-muted)] opacity-70") : "bg-[var(--surface)] hover:bg-[var(--surface-muted)]"}`}
              >
                {option}
              </button>
            );
          })}
        </div>
        {result ? (
          <div className="mt-4 text-sm">
            <p className="font-bold">
              {result.correct ? `${t.debrief.correct} +${result.science} ${t.debrief.science}` : t.debrief.wrong}
            </p>
            <p className="mt-1 text-[var(--muted)]">{text.explanation}</p>
            <button type="button" onClick={onClose} className="btn-bouncy mt-4 bg-[var(--brand-500)] px-4 py-2 font-bold text-white">
              {t.debrief.next}
            </button>
          </div>
        ) : (
          <p className="mt-3 text-xs text-[var(--muted)]">{t.debrief.bonus}: +{bonus} {t.debrief.science}</p>
        )}
      </div>
    </div>
  );
}

function SpaceMap({
  t,
  locale,
  state,
  now,
  destPick,
  onPick,
  docked,
  onResearch,
  onSend,
}: {
  t: BaseText;
  locale: Locale;
  state: BaseState;
  now: number;
  destPick: string;
  onPick: (id: string) => void;
  docked: Ship[];
  onResearch: (id: string) => void;
  onSend: (shipId: string, destId: string) => void;
}) {
  const [shipId, setShipId] = useState<string>("");
  const dest = getDest(destPick) ?? DESTINATIONS[0];
  const text = t.dests[dest.id];
  const unlocked = isUnlocked(state, dest);
  const ready = docked.filter((s) => s.readyAt <= now && getShip(s.type)!.tier >= dest.tier);
  const chosen = ready.find((s) => s.id === shipId) ?? ready[0];
  const earth = { x: 130, y: 180 };
  const sun = { x: 58, y: 180 };

  const position = (d: DestDef, index: number) => {
    const r = 64 + d.orbit * 470;
    const angle = (index % 2 === 0 ? -1 : 1) * (0.18 + (index % 3) * 0.1);
    return { x: sun.x + r * Math.cos(angle), y: sun.y + r * Math.sin(angle) * 0.55, r };
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <div className="card overflow-hidden p-0">
        <svg viewBox="0 0 640 360" className="block h-auto w-full bg-[#07061c]" role="img" aria-label={t.map.title}>
          {Array.from({ length: 50 }, (_, i) => (
            <circle key={i} cx={(i * 97) % 640} cy={(i * 53 + 20) % 360} r={0.6 + ((i * 7) % 3) * 0.4} fill="#fff" opacity={0.25 + ((i * 13) % 5) / 10} />
          ))}
          {DESTINATIONS.map((d, i) => {
            const p = position(d, i);
            return <ellipse key={d.id} cx={sun.x} cy={sun.y} rx={p.r} ry={p.r * 0.55} fill="none" stroke="rgba(160,170,255,0.18)" strokeDasharray="3 5" />;
          })}
          <circle cx={sun.x} cy={sun.y} r="42" fill="#ffc933" opacity="0.16" />
          <image href={planetImage("sun")} x={sun.x - 36} y={sun.y - 36} width="72" height="72" />
          <text x={sun.x + 8} y={sun.y + 58} fontSize="11" fill="#cfd4ff" textAnchor="middle">{t.map.sun}</text>

          <image href={planetImage("earth")} x={earth.x - 13} y={earth.y - 13} width="26" height="26" />
          <text x={earth.x} y={earth.y + 24} fontSize="11" fill="#cfd4ff" textAnchor="middle">{t.map.earth}</text>

          {DESTINATIONS.map((d, i) => {
            const p = position(d, i);
            const active = d.id === dest.id;
            const open = isUnlocked(state, d);
            return (
              <g key={d.id} role="button" tabIndex={0} aria-label={d.names[locale]} onClick={() => onPick(d.id)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onPick(d.id)} className="cursor-pointer outline-none">
                {active && <circle cx={p.x} cy={p.y} r="21" fill="rgba(255,255,255,0.12)" stroke="#fff" strokeWidth="2.5" />}
                <image
                  href={planetImage(d.id)}
                  x={p.x - (active ? 20 : 16)}
                  y={p.y - (active ? 20 : 16)}
                  width={active ? 40 : 32}
                  height={active ? 40 : 32}
                  opacity={open ? 1 : 0.45}
                />
                <text x={p.x} y={p.y + 30} fontSize="11" fill={open ? "#fff" : "#9a98b8"} textAnchor="middle">{d.names[locale]}</text>
                {!open && <text x={p.x} y={p.y + 4} fontSize="12" fill="#fff" textAnchor="middle">🔒</text>}
              </g>
            );
          })}

          {state.ships.map((s) => {
            if (!s.mission) return null;
            const idx = DESTINATIONS.findIndex((d) => d.id === s.mission!.dest);
            if (idx < 0) return null;
            const to = position(DESTINATIONS[idx], idx);
            const total = Math.max(1, s.mission.endsAt - s.mission.startedAt);
            const f = Math.min(1, Math.max(0, (now - s.mission.startedAt) / total));
            const x = earth.x + (to.x - earth.x) * f;
            const y = earth.y + (to.y - earth.y) * f;
            return (
              <g key={s.id}>
                <line x1={earth.x} y1={earth.y} x2={to.x} y2={to.y} stroke="rgba(255,255,255,0.25)" strokeDasharray="4 4" />
                <image href={shipIcon(s.type)} x={x - 13} y={y - 13} width="26" height="26" />
              </g>
            );
          })}
        </svg>
        <p className="px-4 py-2 text-xs text-[var(--muted)]">{t.map.hint}</p>
      </div>

      <div className="card flex flex-col gap-2 p-4 text-sm">
        <p className="flex items-center gap-2 text-lg font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>
          <span className="inline-block h-5 w-5 rounded-full" style={{ background: dest.color }} aria-hidden />
          {dest.names[locale]}
        </p>
        <p>{text.blurb}</p>
        <p className="text-xs text-[var(--muted)]">💡 {text.fact}</p>
        <p className="text-xs font-semibold">
          {t.map.reward}: 💰 {fmt(dest.credits)} · 🔬 {dest.science} · {t.map.travel}: {formatDuration(dest.baseMinutes * 60_000, t.units)} ({t.fleet.tier} {dest.tier}+)
        </p>
        {!unlocked && (
          <button
            type="button"
            disabled={state.science < dest.researchCost}
            onClick={() => onResearch(dest.id)}
            className="btn-bouncy bg-[var(--accent-500)] px-4 py-2 font-bold text-white disabled:opacity-50"
          >
            🔬 {t.map.research} ({dest.researchCost})
            {state.science < dest.researchCost ? ` · ${t.map.needScience}` : ""}
          </button>
        )}
        {unlocked && (
          <>
            <span className="pill self-start bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-bold">{t.map.researched}</span>
            {ready.length === 0 ? (
              <p className="text-xs text-[var(--muted)]">{docked.length === 0 ? t.map.noShip : t.map.tooWeak}</p>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <select aria-label={t.map.chooseShip} value={chosen?.id} onChange={(e) => setShipId(e.target.value)} className="rounded-xl border-2 border-[var(--edge)] bg-[var(--surface)] px-3 py-1.5 text-sm font-semibold">
                  {ready.map((s) => (
                    <option key={s.id} value={s.id}>{SHIP_ICONS[s.type]} {getShip(s.type)!.names[locale]}</option>
                  ))}
                </select>
                <button type="button" onClick={() => chosen && onSend(chosen.id, dest.id)} className="btn-bouncy bg-[var(--brand-500)] px-4 py-1.5 font-bold text-white">
                  {t.fleet.send}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
