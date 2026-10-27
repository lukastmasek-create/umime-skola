"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getFarmText } from "@/i18n/farm";
import { notifyAccountChanged } from "@/lib/account-events";
import {
  ANIMALS,
  ANIMAL_BATCH_CAP,
  CROPS,
  FERTILIZE_POINTS_COST,
  MAX_ANIMALS_PER_KIND,
  MAX_PLOTS,
  MAX_SILO_UPGRADES,
  PRODUCTS,
  SILO_STEP,
  animalIntervalMs,
  animalPrice,
  animalReady,
  buyPlot,
  collect,
  collectAll,
  cropDef,
  harvest,
  harvestAll,
  isCrop,
  isRipe,
  itemPrice,
  levelFromXp,
  plant,
  plantAll,
  plotCost,
  plotLevel,
  plotProgress,
  sell,
  siloCapacity,
  siloUpgradeCost,
  stockTotal,
  type ActionResult,
  type CropId,
  type FarmState,
  type ItemId,
  type Order,
} from "@/lib/idle/farm";
import type { Locale } from "@/i18n/config";

type Payload = {
  state: FarmState;
  points: number;
  learningBonus: number;
  now: number;
  level: { level: number; percent: number; intoLevel: number; needed: number; maxed: boolean };
  gained?: { coins?: number; xp?: number; items?: number } | null;
};
type View = { data: Payload; receivedAt: number };
type Load = "loading" | "login" | "unavailable" | "ready";
type Tab = "field" | "animals" | "silo" | "orders";
type Local = (state: FarmState, now: number, bonus: number) => ActionResult;

const EMOJI: Record<string, string> = {
  wheat: "🌾", corn: "🌽", carrot: "🥕", tomato: "🍅", strawberry: "🍓", pumpkin: "🎃", potato: "🥔", sunflower: "🌻", apple: "🍎", grapes: "🍇",
  egg: "🥚", duckegg: "🥚", milk: "🥛", wool: "🧶", cheese: "🧀", truffle: "🍄", honey: "🍯",
  chicken: "🐔", duck: "🦆", sheep: "🐑", goat: "🐐", cow: "🐄", pig: "🐖", bee: "🐝",
};

// Obrázek z Blenderu; když chybí, zobrazí se emoji.
function Sprite({ src, name, className = "" }: { src: string; name: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span aria-hidden className={`flex items-center justify-center text-4xl ${className}`}>
        {EMOJI[name] ?? "🌱"}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" aria-hidden draggable={false} onError={() => setFailed(true)} className={`pointer-events-none select-none object-contain ${className}`} />
  );
}

const fill = (text: string, vars: Record<string, string | number>) => text.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));

function formatLeft(ms: number, t: ReturnType<typeof getFarmText>): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  if (s < 60) return `${s} s`;
  const m = Math.ceil(s / 60);
  if (m < 60) return fill(t.minutes, { n: m });
  const h = Math.floor(m / 60);
  return `${fill(t.hours, { n: h })} ${String(m % 60).padStart(2, "0")} min`;
}

function stageOf(progress: number): 1 | 2 | 3 {
  return progress >= 1 ? 3 : progress >= 0.45 ? 2 : 1;
}

export function FarmGame({ locale }: { locale: Locale }) {
  const t = getFarmText(locale);
  const [load, setLoad] = useState<Load>("loading");
  const [view, setView] = useState<View | null>(null);
  const [tab, setTab] = useState<Tab>("field");
  const [seed, setSeed] = useState<CropId>("wheat");
  const [nowMs, setNowMs] = useState(0);
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const pending = useRef(0);
  const viewRef = useRef<View | null>(null);

  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  const say = useCallback((text: string, ok = false) => {
    setToast({ text, ok });
    window.setTimeout(() => setToast((c) => (c?.text === text ? null : c)), 3200);
  }, []);

  const errorText = useCallback((code?: string) => (t.errors as Record<string, string>)[code ?? "generic"] ?? t.errors.generic, [t]);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/stale-hry/farma");
      if (res.status === 401) {
        setLoad("login");
        return;
      }
      if (!res.ok) {
        setLoad((c) => (c === "ready" ? c : "unavailable"));
        return;
      }
      const data = (await res.json()) as Payload;
      setView({ data, receivedAt: Date.now() });
      setLoad("ready");
    } catch {
      setLoad((c) => (c === "ready" ? c : "unavailable"));
    }
  }, []);

  useEffect(() => {
    const first = window.setTimeout(() => void refresh(), 0);
    const tick = window.setInterval(() => setNowMs(Date.now()), 1000);
    const sync = window.setInterval(() => void refresh(), 60_000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(tick);
      window.clearInterval(sync);
    };
  }, [refresh]);

  const clock = view ? view.data.now + ((nowMs || view.receivedAt) - view.receivedAt) : 0;

  // Akce s okamžitou odezvou: stejnou čistou funkcí spočítáme výsledek hned a server ho potvrdí.
  // Požadavky jdou za sebou, ať se nepřetahují o zámek uložení.
  function act(body: Record<string, unknown>, local?: Local, okText?: (g: NonNullable<Payload["gained"]>) => string | null) {
    const current = viewRef.current;
    if (!current) return;
    const bonus = current.data.learningBonus;
    if (local) {
      const result = local(current.data.state, clock, bonus);
      if (!result.ok) {
        say(errorText(result.error));
        return;
      }
      const next: View = {
        receivedAt: current.receivedAt,
        data: { ...current.data, state: result.state, points: current.data.points - (result.pointsSpent ?? 0) },
      };
      viewRef.current = next;
      setView(next);
      const msg = okText?.(result.gained ?? {});
      if (msg) say(msg, true);
    }
    pending.current += 1;
    queue.current = queue.current.then(async () => {
      try {
        const res = await fetch("/api/stale-hry/farma", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          say(errorText(json.error));
          await refresh();
          return;
        }
        if (pending.current === 1 || !local) {
          const data = json as Payload;
          const next = { data, receivedAt: Date.now() };
          viewRef.current = next;
          setView(next);
          if (!local) {
            const msg = okText?.(data.gained ?? {});
            if (msg) say(msg, true);
          }
        }
        if (body.action === "fertilize") notifyAccountChanged();
      } catch {
        say(t.errors.generic);
        await refresh();
      } finally {
        pending.current -= 1;
      }
    });
  }

  const header = (
    <>
      <Link href={`/${locale}/stale-hry`} className="mb-3 inline-block text-sm font-medium text-[var(--faint)] hover:text-[var(--foreground)]">
        ← {t.back}
      </Link>
      <h1 className="mb-1 text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
        🌾 {t.title}
      </h1>
      <p className="mb-6 max-w-2xl text-[var(--muted)]">{t.subtitle}</p>
    </>
  );

  if (load === "loading") {
    return (
      <div>
        {header}
        <div className="card h-64 animate-pulse bg-[var(--surface-muted)]" aria-label={t.loading} />
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
  if (load === "unavailable" || !view) {
    return (
      <div>
        {header}
        <div className="card p-6 text-[var(--muted)]">{t.unavailable}</div>
      </div>
    );
  }

  const { state, points, learningBonus } = view.data;
  const level = levelFromXp(state.xp);
  const info = view.data.level;
  const capacity = siloCapacity(state);
  const used = stockTotal(state);
  const ripeCount = state.plots.filter((p) => isRipe(p, clock, learningBonus)).length;
  const readyAnimals = ANIMALS.reduce((s, a) => s + animalReady(a.id, state.animals[a.id], clock, learningBonus), 0);
  const itemName = (id: ItemId) => (isCrop(id) ? cropDef(id).names[locale] : PRODUCTS.find((p) => p.id === id)!.names[locale]);
  const canDeliver = (o: Order) => o.items.every((i) => (state.stock[i.item] ?? 0) >= i.qty);
  const deliverable = state.orders.filter(canDeliver).length;
  const stockEntries = (Object.entries(state.stock) as [ItemId, number][]).filter(([, q]) => q > 0);
  const stockValue = stockEntries.reduce((s, [id, q]) => s + itemPrice(id) * q, 0);

  const badge = (n: number) =>
    n > 0 ? <span className="ml-1.5 rounded-full bg-[var(--accent-500)] px-1.5 py-0.5 text-[11px] font-bold text-white">{n}</span> : null;

  const tabs: { id: Tab; label: string; n: number }[] = [
    { id: "field", label: t.tabs.field, n: ripeCount },
    { id: "animals", label: t.tabs.animals, n: readyAnimals },
    { id: "silo", label: t.tabs.silo, n: 0 },
    { id: "orders", label: t.tabs.orders, n: deliverable },
  ];

  return (
    <div>
      {header}

      <div className="relative mb-5 overflow-hidden rounded-2xl border-2 border-[var(--edge)] bg-[#9bd7ff]">
        <Sprite src="/farm/hero.webp" name="wheat" className="h-auto min-h-28 w-full" />
      </div>

      <div className="card mb-5 flex flex-wrap items-center gap-x-6 gap-y-3 p-4">
        <p className="text-lg font-extrabold">
          🪙 {state.coins.toLocaleString(locale)} <span className="text-sm font-semibold text-[var(--muted)]">{t.coins}</span>
        </p>
        <p className="text-lg font-extrabold">
          ⭐ {points.toLocaleString(locale)} <span className="text-sm font-semibold text-[var(--muted)]">{t.points}</span>
        </p>
        <div className="min-w-48 flex-1">
          <div className="mb-1 flex justify-between text-xs font-semibold text-[var(--muted)]">
            <span>{fill(t.level, { n: level })}</span>
            <span>{info.maxed ? t.maxLevel : fill(t.toNext, { n: info.needed - info.intoLevel })}</span>
          </div>
          <div
            className="h-3.5 overflow-hidden rounded-full border-2 border-[var(--edge)] bg-[var(--surface-muted)]"
            role="progressbar"
            aria-valuenow={info.percent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="h-full bg-[var(--accent-green)] transition-all" style={{ width: `${info.percent}%` }} />
          </div>
        </div>
        {learningBonus > 0 && (
          <span className="pill bg-[var(--accent-yellow)] px-3 py-1 text-sm text-[#16132b]" title={t.learningHint}>
            📚 {fill(t.learningBonus, { n: Math.round(learningBonus * 100) })}
          </span>
        )}
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5" role="tablist">
        {tabs.map((x) => (
          <button
            key={x.id}
            type="button"
            role="tab"
            aria-selected={tab === x.id}
            onClick={() => setTab(x.id)}
            className={`rounded-lg border-2 px-3.5 py-1.5 text-sm font-semibold ${
              tab === x.id ? "border-[var(--edge)] bg-[var(--accent-yellow)] text-[#16132b]" : "border-transparent text-[var(--muted)] hover:border-[var(--edge)]"
            }`}
          >
            {x.label}
            {badge(x.n)}
          </button>
        ))}
      </div>

      {tab === "field" && (
        <section>
          <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>
            {t.seedsTitle}
          </h2>
          <p className="mb-3 text-sm text-[var(--muted)]">{t.seedHint}</p>
          <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {CROPS.map((c) => {
              const locked = level < c.level;
              const active = seed === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  disabled={locked}
                  aria-pressed={active}
                  onClick={() => setSeed(c.id)}
                  className={`flex items-center gap-2 rounded-xl border-2 p-2 text-left text-xs ${
                    active ? "border-[var(--edge)] bg-[var(--accent-yellow)] text-[#16132b]" : "border-[var(--edge)]/40 bg-[var(--surface)]"
                  } ${locked ? "opacity-45" : "hover:border-[var(--edge)]"}`}
                >
                  <Sprite src={`/farm/icons/${c.id}.webp`} name={c.id} className="h-10 w-10 shrink-0" />
                  <span>
                    <span className="block font-bold">{c.names[locale]}</span>
                    <span className="block">
                      {locked ? `🔒 ${fill(t.levelNeeded, { n: c.level })}` : `🪙 ${c.seed} · ${c.minutes >= 60 ? fill(t.hours, { n: +(c.minutes / 60).toFixed(1) }) : fill(t.minutes, { n: c.minutes })}`}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mb-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={ripeCount === 0}
              onClick={() => act({ action: "harvestAll" }, (s, n, b) => harvestAll(s, n, b), (g) => fill(t.toast.harvested, { n: g.items ?? 0 }))}
              className="btn-bouncy bg-[var(--brand-500)] px-4 py-2 text-sm font-bold text-white disabled:opacity-45"
            >
              🧺 {t.harvestAll} {ripeCount > 0 && `(${ripeCount})`}
            </button>
            <button
              type="button"
              onClick={() => act({ action: "plantAll", crop: seed }, (s, n) => plantAll(s, seed, n), () => t.toast.planted)}
              className="btn-bouncy bg-[var(--surface)] px-4 py-2 text-sm font-bold"
            >
              🌱 {t.plantAll}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {state.plots.map((plot, i) => {
              const progress = plotProgress(plot, clock, learningBonus);
              const ripe = !!plot && progress >= 1;
              const left = plot ? Math.max(0, (1 - progress) * (cropDef(plot.crop).minutes * 60_000)) / (1 + learningBonus) : 0;
              const label = !plot ? t.emptyPlot : ripe ? `${cropDef(plot.crop).names[locale]}: ${t.ripe}` : `${cropDef(plot.crop).names[locale]}: ${fill(t.growing, { t: formatLeft(left, t) })}`;
              return (
                <div key={i} className="relative">
                  <button
                    type="button"
                    aria-label={label}
                    onClick={() => {
                      if (!plot) {
                        act({ action: "plant", plot: i, crop: seed }, (s, n) => plant(s, i, seed, n));
                      } else if (ripe) {
                        act({ action: "harvest", plot: i }, (s, n, b) => harvest(s, i, n, b), (g) => fill(t.toast.harvested, { n: g.items ?? 1 }));
                      }
                    }}
                    className={`group relative block aspect-square w-full overflow-hidden rounded-xl border-2 bg-[#cfe9b0] ${
                      ripe ? "border-[var(--accent-green)] shadow-[0_0_18px_rgba(120,220,150,0.7)]" : "border-[var(--edge)]/50"
                    } transition-transform hover:scale-[1.03]`}
                  >
                    <Sprite
                      src={plot ? `/farm/crops/${plot.crop}_${stageOf(progress)}.webp` : "/farm/soil.webp"}
                      name={plot ? plot.crop : "wheat"}
                      className={`h-full w-full ${ripe ? "farm-ripe" : ""}`}
                    />
                    <span className="absolute inset-x-0 bottom-0 bg-black/45 px-1 py-0.5 text-center text-[11px] font-bold text-white">
                      {!plot ? t.emptyPlot : ripe ? `✓ ${t.ripe}` : formatLeft(left, t)}
                    </span>
                  </button>
                  {plot && !ripe && points >= FERTILIZE_POINTS_COST && (
                    <button
                      type="button"
                      title={`${t.fertilize.replace("{n}", String(FERTILIZE_POINTS_COST))}. ${t.fertilizeHint}`}
                      aria-label={t.fertilize.replace("{n}", String(FERTILIZE_POINTS_COST))}
                      onClick={() => act({ action: "fertilize", plot: i }, undefined, () => t.toast.fertilized)}
                      className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--edge)] bg-[var(--accent-yellow)] text-sm leading-none hover:scale-110"
                    >
                      ⚡
                    </button>
                  )}
                </div>
              );
            })}
            {state.plots.length < MAX_PLOTS && (
              <button
                type="button"
                onClick={() => act({ action: "buyPlot" }, (s) => buyPlot(s), () => t.toast.bought)}
                disabled={level < plotLevel(state.plots.length)}
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-[var(--edge)]/60 p-2 text-center text-xs font-bold text-[var(--muted)] hover:border-[var(--edge)] disabled:opacity-50"
              >
                <span className="text-2xl">➕</span>
                {level < plotLevel(state.plots.length) ? `🔒 ${fill(t.levelNeeded, { n: plotLevel(state.plots.length) })}` : fill(t.buyPlot, { n: `🪙 ${plotCost(state.plots.length)}` })}
              </button>
            )}
          </div>
        </section>
      )}

      {tab === "animals" && (
        <section>
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                {t.animalsTitle}
              </h2>
              <p className="max-w-2xl text-sm text-[var(--muted)]">{t.animalsHint}</p>
            </div>
            <button
              type="button"
              disabled={readyAnimals === 0}
              onClick={() => act({ action: "collectAll" }, (s, n, b) => collectAll(s, n, b), (g) => fill(t.toast.collected, { n: g.items ?? 0 }))}
              className="btn-bouncy bg-[var(--brand-500)] px-4 py-2 text-sm font-bold text-white disabled:opacity-45"
            >
              🧺 {t.collectAll}
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ANIMALS.map((a) => {
              const stock = state.animals[a.id];
              const owned = stock?.count ?? 0;
              const locked = level < a.level;
              const ready = animalReady(a.id, stock, clock, learningBonus);
              const interval = animalIntervalMs(a.id, learningBonus);
              const full = owned > 0 && ready >= owned * ANIMAL_BATCH_CAP;
              const frac = stock && !full ? ((clock - stock.lastCollect) % interval) / interval : full ? 1 : 0;
              const price = animalPrice(a.id, owned);
              return (
                <article key={a.id} className={`card flex flex-col gap-3 p-4 ${locked ? "opacity-60" : ""}`}>
                  <div className="flex items-center gap-3">
                    <Sprite src={`/farm/animals/${a.id}.webp`} name={a.id} className="h-20 w-20 shrink-0" />
                    <div className="min-w-0">
                      <h3 className="font-bold leading-tight">{a.names[locale]}</h3>
                      <p className="text-xs text-[var(--muted)]">{fill(t.owned, { n: owned, max: MAX_ANIMALS_PER_KIND })}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-[var(--muted)]">
                        <Sprite src={`/farm/icons/${a.product}.webp`} name={a.product} className="h-5 w-5" />
                        {fill(t.makes, { name: PRODUCTS.find((p) => p.id === a.product)!.names[locale], t: formatLeft(interval, t) })}
                      </p>
                    </div>
                  </div>
                  {owned > 0 && (
                    <div>
                      <div className="h-3 overflow-hidden rounded-full border-2 border-[var(--edge)] bg-[var(--surface-muted)]">
                        <div className="h-full bg-[var(--accent-yellow)] transition-all" style={{ width: `${Math.round(frac * 100)}%` }} />
                      </div>
                      <p className="mt-1 text-xs text-[var(--muted)]">{ready > 0 ? `${ready}×` : t.nothingYet} · {full ? "" : fill(t.nextIn, { t: formatLeft((1 - frac) * interval, t) })}</p>
                    </div>
                  )}
                  <div className="mt-auto flex flex-wrap gap-2">
                    {ready > 0 && (
                      <button
                        type="button"
                        onClick={() => act({ action: "collect", animal: a.id }, (s, n, b) => collect(s, a.id, n, b), (g) => fill(t.toast.collected, { n: g.items ?? 0 }))}
                        className="btn-bouncy flex-1 bg-[var(--accent-yellow)] px-3 py-2 text-sm font-bold text-[#16132b]"
                      >
                        {fill(t.collect, { n: ready })}
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={locked || owned >= MAX_ANIMALS_PER_KIND || state.coins < price}
                      onClick={() => act({ action: "buyAnimal", animal: a.id }, undefined, () => t.toast.bought)}
                      className="btn-bouncy flex-1 bg-[var(--surface)] px-3 py-2 text-sm font-bold disabled:opacity-45"
                    >
                      {locked ? `🔒 ${fill(t.levelNeeded, { n: a.level })}` : owned >= MAX_ANIMALS_PER_KIND ? t.maxAnimals : fill(t.buyAnimal, { n: `🪙 ${price}` })}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {tab === "silo" && (
        <section>
          <div className="card mb-4 p-4">
            <div className="mb-1 flex justify-between text-sm font-semibold">
              <span>{fill(t.siloUsed, { a: used, b: capacity })}</span>
              <span className="text-[var(--muted)]">{state.siloUpgrades} / {MAX_SILO_UPGRADES}</span>
            </div>
            <div className="h-3.5 overflow-hidden rounded-full border-2 border-[var(--edge)] bg-[var(--surface-muted)]">
              <div className={`h-full transition-all ${used >= capacity ? "bg-[var(--danger)]" : "bg-[var(--accent-green)]"}`} style={{ width: `${Math.min(100, (used / capacity) * 100)}%` }} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={stockEntries.length === 0}
                onClick={() => act({ action: "sell", item: "all" }, (s) => sell(s, "all"), (g) => fill(t.toast.sold, { n: g.coins ?? 0 }))}
                className="btn-bouncy bg-[var(--brand-500)] px-4 py-2 text-sm font-bold text-white disabled:opacity-45"
              >
                💰 {fill(t.sellAll, { n: stockValue })}
              </button>
              <button
                type="button"
                disabled={state.siloUpgrades >= MAX_SILO_UPGRADES || state.coins < siloUpgradeCost(state.siloUpgrades)}
                onClick={() => act({ action: "upgradeSilo" }, undefined, () => t.toast.upgraded)}
                className="btn-bouncy bg-[var(--surface)] px-4 py-2 text-sm font-bold disabled:opacity-45"
              >
                {state.siloUpgrades >= MAX_SILO_UPGRADES ? t.maxSilo : `🏗️ ${fill(t.upgradeSilo, { n: `🪙 ${siloUpgradeCost(state.siloUpgrades)}`, cap: SILO_STEP })}`}
              </button>
            </div>
          </div>
          {stockEntries.length === 0 ? (
            <p className="card p-6 text-center text-[var(--muted)]">{t.siloEmpty}</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {stockEntries.map(([id, qty]) => (
                <div key={id} className="card flex items-center gap-3 p-3">
                  <Sprite src={`/farm/icons/${id}.webp`} name={id} className="h-14 w-14 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold leading-tight">
                      {itemName(id)} <span className="text-[var(--muted)]">×{qty}</span>
                    </p>
                    <p className="text-xs text-[var(--muted)]">{fill(t.each, { n: `🪙 ${itemPrice(id)}` })}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => act({ action: "sell", item: id }, (s) => sell(s, id), (g) => fill(t.toast.sold, { n: g.coins ?? 0 }))}
                    className="btn-bouncy shrink-0 bg-[var(--accent-yellow)] px-3 py-1.5 text-xs font-bold text-[#16132b]"
                  >
                    {fill(t.sell, { n: `🪙 ${itemPrice(id) * qty}` })}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {tab === "orders" && (
        <section>
          <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>
            {t.ordersTitle}
          </h2>
          <p className="mb-1 text-sm text-[var(--muted)]">{t.ordersHint}</p>
          <p className="mb-4 text-xs font-semibold text-[var(--muted)]">{fill(t.ordersDone, { n: state.ordersDone })}</p>
          <div className="grid gap-4 md:grid-cols-3">
            {state.orders.map((o) => {
              const ok = canDeliver(o);
              return (
                <article key={o.id} className={`card flex flex-col gap-3 p-4 ${ok ? "border-[var(--accent-green)]" : ""}`}>
                  <ul className="flex flex-col gap-2">
                    {o.items.map((i) => {
                      const have = state.stock[i.item] ?? 0;
                      return (
                        <li key={i.item} className="flex items-center gap-2">
                          <Sprite src={`/farm/icons/${i.item}.webp`} name={i.item} className="h-10 w-10 shrink-0" />
                          <span className="flex-1 font-semibold">{itemName(i.item)}</span>
                          <span className={`pill px-2 py-0.5 text-xs ${have >= i.qty ? "bg-[var(--accent-green)] text-[#16132b]" : "bg-[var(--surface-muted)]"}`}>
                            {have}/{i.qty}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                  <p className="text-sm font-semibold">
                    {t.reward}: 🪙 {o.coins} · ✨ {o.xp}
                  </p>
                  <button
                    type="button"
                    disabled={!ok}
                    onClick={() => act({ action: "deliver", order: o.id }, undefined, (g) => fill(t.toast.delivered, { n: g.coins ?? o.coins }))}
                    className="btn-bouncy mt-auto bg-[var(--brand-500)] px-4 py-2 text-sm font-bold text-white disabled:opacity-45"
                  >
                    📦 {t.deliver}
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {toast && (
        <div
          role="status"
          className={`pill fixed inset-x-0 bottom-6 z-50 mx-auto w-fit px-4 py-2 text-sm shadow-lg ${
            toast.ok ? "bg-[var(--accent-green)] text-[#16132b]" : "bg-[var(--danger)] text-white"
          }`}
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}
