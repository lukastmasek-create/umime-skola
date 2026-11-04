"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getEconomyText } from "@/i18n/economy";
import { getEconomyWork } from "@/i18n/economy-work";
import { getEconomyNeeds } from "@/i18n/economy-needs";
import { getEconomyHustle } from "@/i18n/economy-hustle";
import { notifyAccountChanged } from "@/lib/account-events";
import { getCraftText } from "@/i18n/craft";
import { CASH_PRICE, MATERIALS, WORLDS, type World } from "@/lib/craft";
import {
  SPEEDS,
  ASSETS,
  BONUS_SHARE,
  LEAD_EXTRA_ENERGY,
  LEAD_MIN_RANK,
  WALK_EXTRA_ENERGY,
  PROMO_BASE,
  PROMO_MAX,
  PROMO_PER_PERF,
  RANK_POINTS,
  RAISE_BASE,
  RAISE_PER_PERF,
  RAISE_SENIOR_PENALTY,
  SHIFT_MIN_ENERGY,
  SITUATIONS,
  VACATION_MAX,
  VACATION_WINDOW_MS,
  CITIES,
  COMPANIES,
  COUNTRIES,
  COUNTRY_DEF,
  ERAS,
  ERA_DEF,
  FAMILIES,
  FAMILY_DEF,
  HUSTLES,
  INCOME_SPEED,
  JOBS,
  MAX_EDU,
  MAX_JOB_RANK,
  MAX_NEED_DAYS,
  NEED_DEF,
  NEEDS,
  needDaily,
  BOOSTS,
  boostPrice,
  type BoostId,
  assetPrice,
  companyIncome,
  hustleDue,
  isLocked,
  type AssetCategoryId,
  type CityId,
  type CountryId,
  type EraId,
  type FamilyId,
  type NeedId,
  POINT_BUY_CASH,
  POINT_SELL_CASH,
} from "@/lib/idle/economy";
import { CompanyTab, fill, formatLeft, type Payload } from "./CompanyPanel";
import { HustleTab } from "./HustleTab";
import { InvestPanel } from "./InvestPanel";
import type { Locale } from "@/i18n/config";

type View = { data: Payload; receivedAt: number };
type Load = "loading" | "login" | "unavailable" | "ready";
// Ikony potřeb v záložce Potřeby.
const NEED_EMOJI: Record<NeedId, string> = { food: "🍎", drink: "🥤", clothing: "👕", housing: "🏠", transport: "🚌", health: "🩺", leisure: "🎬" };

type Tab = "overview" | "work" | "needs" | "companies" | "invest" | "hustle" | "board";
type OvTab = "summary" | "earnings" | "assets" | "education" | "materials";
type Board = { top: { rank: number; name: string; country: string | null; best: number; runs: number; me: boolean }[]; me: { rank: number; best: number } | null };
// Výřez z /api/craft: materiály a denní limit nákupu.
type CraftView = { points?: number; buyLeft?: number; mats?: Record<string, number> };
const WORLD_ICON: Record<World, string> = { obecne: "🧰", vesmir: "🚀", more: "🌊", les: "🌲", hrad: "🏰", kouzla: "🪄" };


function money(n: number, currency: string, locale: Locale): string {
  const { numberLocale: loc, units } = getEconomyText(locale);
  const v = Math.round(n);
  const abs = Math.abs(v);
  const short = (x: number, unit: string) => `${x.toLocaleString(loc, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${unit} ${currency}`.trim();
  if (abs >= 1e12) return short(v / 1e12, units.trillion);
  if (abs >= 1e9) return short(v / 1e9, units.billion);
  if (abs >= 1e6) return short(v / 1e6, units.million);
  return `${v.toLocaleString(loc)} ${currency}`.trim();
}

const EMOJI: Record<string, string> = {
  warehouse: "📦", seller: "🛒", farmer: "🌾", cook: "🍳", firefighter: "🚒", police: "👮", teacher: "📚", journalist: "📰", vet: "🐾", architect: "📐", programmer: "💻", pilot: "✈️", doctor: "🩺", banker: "🏦",
  shoes: "👟", clothes: "👕", tech: "📱", delivery: "🛵", supermarket: "🏬", digi: "🎮", software: "🧩", hardware: "🖥️", factory: "🏭",
  reselling: "🔁", carflip: "🚗", houseflip: "🏚️", lemonade: "🍋", startup: "🚀",
};

type DonutPart = { label: string; value: number; color: string };

// Koláč bez knihovny: kruhy s dashoffsetem. Barva patří položce, ne pořadí.
function Donut({ parts, centerLabel, centerValue, shareLabel }: { parts: DonutPart[]; centerLabel: string; centerValue: string; shareLabel: string }) {
  const shown = parts.filter((p) => p.value > 0);
  const total = shown.reduce((sum, p) => sum + p.value, 0);
  const R = 40;
  const C = 2 * Math.PI * R;
  const segments = shown.map((p, i) => {
    const len = total > 0 ? (p.value / total) * C : 0;
    const before = shown.slice(0, i).reduce((sum, q) => sum + (total > 0 ? (q.value / total) * C : 0), 0);
    return { p, len, offset: -before };
  });
  return (
    <div className="flex flex-wrap items-center gap-4">
      <svg viewBox="0 0 100 100" className="h-36 w-36 shrink-0" role="img" aria-label={centerLabel + ": " + centerValue}>
        <circle cx="50" cy="50" r={R} fill="none" stroke="var(--surface-muted)" strokeWidth="16" />
        {segments.map(({ p, len, offset }) => (
          <circle
            key={p.label}
            cx="50"
            cy="50"
            r={R}
            fill="none"
            strokeWidth="16"
            style={{ stroke: p.color }}
            strokeDasharray={len + " " + (C - len)}
            strokeDashoffset={offset}
            transform="rotate(-90 50 50)"
          />
        ))}
        <text x="50" y="46" textAnchor="middle" fill="var(--muted)" fontSize="7">
          {centerLabel}
        </text>
        <text x="50" y="58" textAnchor="middle" fill="var(--foreground)" fontSize="8" fontWeight="700">
          {centerValue}
        </text>
      </svg>
      <ul aria-label={shareLabel} className="flex min-w-0 flex-1 flex-col gap-1.5 text-sm">
        {parts.map((p) => (
          <li key={p.label} className="flex items-center justify-between gap-2">
            <span className="flex min-w-0 items-center gap-2">
              <i className="inline-block h-3 w-3 shrink-0 rounded-sm" style={{ background: p.color }} />
              <span className="truncate">{p.label}</span>
            </span>
            <b className="shrink-0">{total > 0 ? Math.round((p.value / total) * 100) : 0} %</b>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function EconomyGame({ locale }: { locale: Locale }) {
  const t = getEconomyText(locale);
  const ct = getCraftText(locale);
  const [load, setLoad] = useState<Load>("loading");
  const [view, setView] = useState<View | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [ov, setOv] = useState<OvTab>("summary");
  const [nowMs, setNowMs] = useState(0);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);
  const [board, setBoard] = useState<Board | null>(null);
  const [xAmount, setXAmount] = useState(10);
  const [craft, setCraft] = useState<CraftView | null>(null);
  const [craftBusy, setCraftBusy] = useState<string | null>(null);
  const [craftMsg, setCraftMsg] = useState<string | null>(null);
  const [form, setForm] = useState<{ name: string; country: CountryId; city: CityId; era: EraId; family: FamilyId }>({
    name: "",
    country: "cz",
    city: "town",
    era: "2025",
    family: "middle",
  });
  const busyRef = useRef(false);

  const errorText = useCallback(
    (code?: string) => getEconomyWork(locale).errors[code ?? ""] ?? t.errors[code ?? "generic"] ?? t.errors.generic,
    [t, locale],
  );
  const say = useCallback((text: string, ok = false) => {
    setToast({ text, ok });
    window.setTimeout(() => setToast((c) => (c?.text === text ? null : c)), 3200);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/stale-hry/ekonomika");
      if (res.status === 401) return setLoad("login");
      if (!res.ok) return setLoad((c) => (c === "ready" ? c : "unavailable"));
      setView({ data: (await res.json()) as Payload, receivedAt: Date.now() });
      setLoad("ready");
    } catch {
      setLoad((c) => (c === "ready" ? c : "unavailable"));
    }
  }, []);

  useEffect(() => {
    const first = window.setTimeout(() => void refresh(), 0);
    // Občas stav dotáhneme znovu: opraví drift hodin a změny z jiné záložky.
    const sync = window.setInterval(() => void refresh(), 120_000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(sync);
    };
  }, [refresh]);

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Žebříček se načítá na požádání (záložka) a po každé změně jmění, když je otevřený.
  const loadBoard = useCallback(async () => {
    try {
      const res = await fetch("/api/stale-hry/ekonomika/zebricek");
      if (res.ok) setBoard((await res.json()) as Board);
    } catch {
      /* žebříček je jen doplněk */
    }
  }, []);
  useEffect(() => {
    if (tab !== "board") return;
    const id = window.setTimeout(() => void loadBoard(), 0);
    return () => window.clearTimeout(id);
  }, [tab, loadBoard]);

  // Akce vždy potvrzuje server (náhodné výsledky, body, souběh záložek). Dokud běží jedna, další se nespustí.
  const act = useCallback(
    async (body: Record<string, unknown>, okText?: (p: Payload) => string) => {
      if (busyRef.current) return;
      busyRef.current = true;
      setBusy(true);
      try {
        const res = await fetch("/api/stale-hry/ekonomika", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          say(errorText((json as { error?: string }).error));
          if (res.status === 409) void refresh();
          return;
        }
        const data = json as Payload;
        setView({ data, receivedAt: Date.now() });
        setNowMs(Date.now());
        if (okText) say(okText(data), true);
        if (body.action === "investEdu" || body.action === "exchange") notifyAccountChanged();
      } catch {
        say(t.errors.generic);
      } finally {
        busyRef.current = false;
        setBusy(false);
      }
    },
    [errorText, refresh, say, t.errors.generic],
  );

  // Materiály: načtou se až při otevření záložky. Nákup za peníze řeší server (/api/craft, akce buyCash) v jedné transakci s Ekonomikou.
  useEffect(() => {
    if (tab !== "overview" || ov !== "materials") return;
    let cancelled = false;
    fetch("/api/craft")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d) setCraft(d as CraftView);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [tab, ov]);

  async function buyMaterial(id: string, name: string) {
    if (craftBusy || busy) return;
    setCraftBusy(id);
    setCraftMsg(null);
    try {
      const res = await fetch("/api/craft", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "buyCash", id, count: 1 }) });
      const json = (await res.json().catch(() => ({}))) as CraftView & { error?: string };
      if (!res.ok) {
        setCraftMsg(ct.errors[(json.error ?? "unavailable") as keyof typeof ct.errors] ?? ct.errors.unavailable);
        if (json.error === "conflict") void refresh();
        return;
      }
      setCraft(json);
      setCraftMsg(fill(t.materials.bought, { name }));
      // Peníze v Ekonomice se změnily na serveru, načteme stav znovu.
      void refresh();
      notifyAccountChanged();
    } catch {
      setCraftMsg(ct.errors.unavailable);
    } finally {
      setCraftBusy(null);
    }
  }

  if (load === "loading") return <p className="text-[var(--muted)]">{t.loading}</p>;
  if (load === "unavailable") return <p className="card p-6 text-center">{t.unavailable}</p>;
  if (load === "login" || !view) {
    return (
      <div className="card flex flex-col items-center gap-3 p-8 text-center">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          💰 {t.title}
        </h1>
        <p className="max-w-md text-[var(--muted)]">{t.loginHint}</p>
        <Link href={`/${locale}/prihlaseni`} className="btn-bouncy bg-[var(--brand-500)] px-5 py-2 font-bold text-white">
          {t.login}
        </Link>
      </div>
    );
  }

  const { data } = view;
  const state = data.state;
  // Čas serveru posunutý o to, co uplynulo od odpovědi; podle něj se počítají odpočty i ceny.
  // Herní čas plyne rychlostí hráče (state.speed); server posílá čas k okamžiku `now`.
  const clock = data.now + Math.max(0, (nowMs || view.receivedAt) - view.receivedAt) * state.speed;
  const ch = state.character;

  if (!ch) {
    const cur = COUNTRY_DEF[form.country].currency;
    const startCash = Math.round(FAMILY_DEF[form.family].start * ERA_DEF[form.era].start);
    return (
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          💰 {t.title}
        </h1>
        <p className="mb-5 max-w-2xl text-[var(--muted)]">{t.intro}</p>
        <section className="card flex max-w-2xl flex-col gap-4 p-5">
          <h2 className="text-lg font-bold">{t.create.title}</h2>
          <p className="text-sm text-[var(--muted)]">{t.create.hint}</p>
          <label className="flex flex-col gap-1 text-sm font-bold">
            {t.create.name}
            <input
              value={form.name}
              maxLength={20}
              placeholder={t.create.namePlaceholder}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="rounded-xl border-2 border-[var(--edge)] bg-[var(--surface)] px-3 py-2 font-normal"
            />
          </label>
          <Group label={t.create.country} values={COUNTRIES} value={form.country} names={t.countries} onPick={(v) => setForm((f) => ({ ...f, country: v }))} />
          <Group label={t.create.city} values={CITIES} value={form.city} names={t.cities} onPick={(v) => setForm((f) => ({ ...f, city: v }))} />
          <Group label={t.create.era} values={ERAS} value={form.era} names={t.eras} onPick={(v) => setForm((f) => ({ ...f, era: v }))} />
          <Group label={t.create.family} values={FAMILIES} value={form.family} names={t.families} onPick={(v) => setForm((f) => ({ ...f, family: v }))} />
          <button
            type="button"
            disabled={busy || !form.name.trim()}
            onClick={() => void act({ action: "create", ...form }, () => t.toast.created)}
            className="btn-bouncy bg-[var(--brand-500)] px-5 py-2.5 font-bold text-white disabled:opacity-45"
          >
            {t.create.start} · {fill(t.create.startMoney, { n: money(startCash, cur, locale) })}
          </button>
        </section>
        {state.best > 0 && (
          <p className="mt-3 text-sm text-[var(--muted)]">
            {t.best}: {money(state.best, cur, locale)} · {t.runs}: {state.runs}
          </p>
        )}
        {toast && <Toast toast={toast} />}
      </div>
    );
  }

  const cur = COUNTRY_DEF[ch.country].currency;
  const m = (n: number) => money(n, cur, locale);
  const r = data.rates;
  // Hotovost běží plynule: server poslal stav k okamžiku `now`, zbytek dopočítáme ze sazby.
  const liveCash = Math.max(0, state.cash + (r.net * (clock - data.now)) / 3_600_000);
  const worth = Math.max(data.netWorth, data.netWorth + (liveCash - state.cash));
  const readyHustles = HUSTLES.filter((h) => hustleDue(state.hustle[h.id], h.id, clock)).length;
  // Přehled: příjmy za hodinu (hrubé části + náklady) a majetek.
  const incomeParts = [
    { icon: "💼", label: t.salary, value: r.salary * r.multiplier, cost: false },
    { icon: "🏭", label: t.businessIncome, value: r.companies * r.multiplier, cost: false },
    { icon: "🏠", label: t.passiveIncome, value: r.passive * r.multiplier, cost: false },
    { icon: "🧾", label: t.detail.costs, value: r.companyCosts, cost: true },
  ];
  const incomeScale = Math.max(1, ...incomeParts.map((p) => p.value));
  const atPeak = worth >= state.peak;
  const playedMs = Math.max(0, clock - state.startedAt);
  const playedDays = Math.floor(playedMs / 86_400_000);
  const playedText = playedDays > 0 ? `${fill(t.days, { n: playedDays })} ${formatLeft(playedMs % 86_400_000, t)}` : formatLeft(playedMs, t);
  const companiesOwned = Object.values(state.companies).reduce((s, n) => s + (n ?? 0), 0);
  const runningHustles = HUSTLES.filter((h) => state.hustle[h.id]).length;
  const holdings = ASSETS.map((a) => ({ id: a.id, value: (state.holdings[a.id] ?? 0) * assetPrice(a.id, clock, state.startedAt) })).filter((h) => h.value > 0);
  const grossHour = r.salary * r.multiplier + r.companies * r.multiplier + r.passive * r.multiplier;
  const passiveShare = grossHour > 0 ? (r.passive * r.multiplier) / grossHour : 0;
  const companyRows = COMPANIES.map((c) => {
    const count = state.companies[c.id] ?? 0;
    return { id: c.id, count, perHour: count * companyIncome(c.id) * INCOME_SPEED * r.multiplier, value: count * c.cost * FAMILY_DEF[ch.family].company };
  })
    .filter((c) => c.count > 0)
    .sort((a, b) => b.perHour - a.perHour);
  const bestCo = companyRows[0] ?? null;
  const companyScale = Math.max(1, ...companyRows.map((c) => c.perHour));
  // Hodnota držby v dané kategorii investic (kategorie jsou z lib/idle/economy.ts).
  const catHeld = (cat: AssetCategoryId) => ASSETS.filter((a) => a.cat === cat).reduce((sum, a) => sum + (state.holdings[a.id] ?? 0) * assetPrice(a.id, clock, state.startedAt), 0);
  const assetParts = [
    { label: t.cash, value: liveCash, color: "var(--cat-1)" },
    { label: t.companiesOwned, value: companyRows.reduce((sum, c) => sum + c.value, 0), color: "var(--cat-2)" },
    { label: t.assetCategories.stocks, value: catHeld("stocks"), color: "var(--cat-3)" },
    { label: t.assetCategories.metals, value: catHeld("metals"), color: "var(--cat-4)" },
    { label: t.other, value: catHeld("crypto") + catHeld("bonds") + catHeld("realestate"), color: "var(--cat-5)" },
  ];

  const w = getEconomyWork(locale);
  const nd = getEconomyNeeds(locale);
  // Zásoby potřeb ubývají průběžně (stejně jako hotovost), od posledního přepočtu serverem se odečítají z času.
  const liveNeeds = Object.fromEntries(NEEDS.map((id) => [id, Math.max(0, state.needs[id] - (clock - data.now) / 86_400_000)])) as Record<NeedId, number>;
  const emptyNeedCount = NEEDS.filter((id) => liveNeeds[id] <= 0.001).length;
  const job = state.job;
  const shiftWait = Math.max(0, state.shiftReadyAt - clock);
  const restWait = Math.max(0, state.restReadyAt - clock);
  const raiseWait = Math.max(0, state.raiseReadyAt - clock);
  const promoWait = job ? Math.max(0, job.promoRetryAt - clock) : 0;
  const sick = state.sickUntil > clock;
  const onVacation = state.vacationUntil > clock;
  const needEnergy = SHIFT_MIN_ENERGY + (job?.lead ? LEAD_EXTRA_ENERGY : 0);
  // Bez dopravy (zásoba dopravy je prázdná) jde hráč na směnu pěšky, za víc energie.
  const noTransport = liveNeeds.transport <= 0.001;
  const walkEnergy = needEnergy + WALK_EXTRA_ENERGY;
  const vacLeft = Math.max(0, VACATION_MAX - state.vacations.filter((x) => clock - x < VACATION_WINDOW_MS).length);
  const perfAvg = job && job.perfs.length ? job.perfs.reduce((x, y) => x + y, 0) / job.perfs.length : 0;
  const promoPct = Math.min(PROMO_MAX, PROMO_BASE + PROMO_PER_PERF * perfAvg);
  const raisePct = Math.max(0, RAISE_BASE + RAISE_PER_PERF * perfAvg - (job && job.rank >= LEAD_MIN_RANK ? RAISE_SENIOR_PENALTY : 0));
  const nextPoints = job && job.rank < MAX_JOB_RANK ? RANK_POINTS[job.rank] : 0;
  const crisisText =
    state.crisis && job && state.crisis.job === job.id && clock < state.crisis.endAt
      ? clock < state.crisis.startAt
        ? fill(w.crisis, { t: formatLeft(state.crisis.startAt - clock, t) })
        : null
      : null;
  const eventText = (p: Payload) => (p.event ? fill(w.events[p.event], { n: m(p.gained?.cash ?? 0) }) : t.toast.bought);

  const tabs: Tab[] = ["overview", "work", "needs", "companies", "invest", "hustle", "board"];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
            💰 {t.title}
          </h1>
          <p className="text-sm text-[var(--muted)]">
            {ch.name} · {t.countries[ch.country]}, {t.cities[ch.city]} · {t.eras[ch.era]} · {t.families[ch.family]}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="pill bg-[var(--accent-yellow)] px-3 py-1.5 text-sm font-extrabold text-[#16132b]">
            💵 {m(liveCash)}
          </span>
          <span className="pill bg-[var(--surface)] px-3 py-1.5 text-sm font-bold">
            🏆 {t.netWorth}: {m(worth)}
          </span>
        </div>
      </div>
      <p className="mb-3 text-sm font-semibold text-[var(--muted)]">
        {fill(t.perHour, { n: `${r.net >= 0 ? "+" : ""}${m(r.net)}` })} · ⭐ {data.points}
      </p>

      <div className="mb-4 flex flex-wrap items-center gap-2" aria-label={t.timeSpeed}>
        <span className="text-sm font-bold">⏩ {t.timeSpeed}</span>
        {SPEEDS.map((sp) => (
          <button
            key={sp}
            type="button"
            aria-pressed={state.speed === sp}
            disabled={busy}
            onClick={() => void act({ action: "setSpeed", value: sp })}
            className={`btn-bouncy px-3 py-1.5 text-sm font-bold ${state.speed === sp ? "bg-[var(--accent-yellow)] text-[#16132b]" : "bg-[var(--surface)]"}`}
          >
            {sp}×
          </button>
        ))}
        <span className="text-xs text-[var(--muted)]">{t.timeSpeedHint}</span>
      </div>

      <div role="tablist" className="mb-5 flex flex-wrap gap-2">
        {tabs.map((id) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            type="button"
            onClick={() => setTab(id)}
            className={`btn-bouncy px-4 py-2 text-sm font-bold ${tab === id ? "bg-[var(--brand-500)] text-white" : "bg-[var(--surface)]"}`}
          >
            {t.tabs[id]}
            {id === "hustle" && readyHustles > 0 ? ` (${readyHustles})` : ""}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <section>
          <div role="tablist" className="mb-4 flex flex-wrap gap-2">
            {(["summary", "earnings", "assets", "education", "materials"] as OvTab[]).map((id) => (
              <button
                key={id}
                role="tab"
                aria-selected={ov === id}
                type="button"
                onClick={() => setOv(id)}
                className={`btn-bouncy px-3 py-1.5 text-sm font-bold ${ov === id ? "bg-[var(--accent-yellow)] text-[#16132b]" : "bg-[var(--surface)]"}`}
              >
                {id === "summary" ? t.ovSummary : id === "earnings" ? t.ovEarnings : id === "assets" ? t.ovAssets : id === "education" ? t.ovEducation : t.ovMaterials}
              </button>
            ))}
          </div>

          {ov === "summary" && (
            <div className="grid gap-4 md:grid-cols-2">
              {/* Hrdina: jmění, vývoj vůči vrcholu hry a hlavní statistiky */}
              <div className="card flex flex-col gap-4 p-5 md:col-span-2">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">🏆 {t.netWorth}</p>
                    <p className="text-4xl font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>
                      {m(worth)}
                    </p>
                  </div>
                  <span className={`pill px-3 py-1.5 text-sm font-bold ${atPeak ? "bg-[var(--accent-green)] text-[#16132b]" : "bg-[var(--surface)]"}`}>
                    {atPeak ? t.atPeak : `${m(worth - state.peak)} ${t.vsPeak}`}
                  </span>
                </div>
                <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { icon: "💵", label: t.cash, value: m(liveCash) },
                    { icon: "💰", label: t.totalEarned, value: m(state.totalEarned) },
                    { icon: "⏱️", label: t.timePlayed, value: playedText },
                    { icon: "⭐", label: t.best, value: m(state.best) },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl bg-[var(--surface-muted)] p-3">
                      <dt className="text-xs text-[var(--muted)]">
                        {s.icon} {s.label}
                      </dt>
                      <dd className="font-bold">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Nové statistiky */}
              <div className="card flex flex-col gap-3 p-5 md:col-span-2">
                <h2 className="font-bold">{t.ovSummary}</h2>
                <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {[
                    { icon: "🏠", label: t.passiveShare, value: `${Math.round(passiveShare * 100)} %` },
                    { icon: "🏭", label: t.bestCompany, value: bestCo ? `${t.companies[bestCo.id]} · ${m(bestCo.perHour)} ${t.perHourShort}` : t.noCompany },
                    { icon: "📅", label: t.avgDay, value: `${r.net >= 0 ? "+" : ""}${m(r.net * 24)}` },
                    { icon: "🍞", label: t.yearlyCost, value: `−${m(r.living * 24 * 365)}` },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl bg-[var(--surface-muted)] p-3">
                      <dt className="text-xs text-[var(--muted)]">
                        {s.icon} {s.label}
                      </dt>
                      <dd className="font-bold">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="card flex flex-col gap-2 p-4 md:col-span-2">
                <p className="text-sm">
                  {t.runs}: <b>{state.runs}</b>
                </p>
                <p className="text-xs text-[var(--muted)]">{t.restartHint} {t.saveNote}</p>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    if (window.confirm(t.restartConfirm)) void act({ action: "restart" }, () => t.toast.restarted);
                  }}
                  className="btn-bouncy w-fit bg-[var(--surface)] px-4 py-2 text-sm font-bold"
                >
                  🔄 {t.restart}
                </button>
              </div>
            </div>
          )}

          {ov === "earnings" && (
            <div className="grid gap-4 md:grid-cols-2">
              {/* Koláč zdrojů příjmu */}
              <div className="card flex flex-col gap-3 p-5">
                <h2 className="font-bold">{t.incomeTitle}</h2>
                <Donut
                  parts={[
                    { label: t.salary, value: r.salary * r.multiplier, color: "var(--cat-1)" },
                    { label: t.businessIncome, value: r.companies * r.multiplier, color: "var(--cat-2)" },
                    { label: t.passiveIncome, value: r.passive * r.multiplier, color: "var(--cat-3)" },
                  ]}
                  centerLabel={t.centerIncome}
                  centerValue={m(grossHour)}
                  shareLabel={t.shareLabel}
                />
              </div>

              {/* Pruhy příjmů a nákladů */}
              <div className="card flex flex-col gap-3 p-5">
                <h2 className="font-bold">{t.incomeTitle}</h2>
                {incomeParts.map((p) => (
                  <div key={p.label} className="flex flex-col gap-1">
                    <div className="flex justify-between text-sm">
                      <span>
                        {p.icon} {p.label}
                      </span>
                      <b className={p.cost ? "text-[var(--danger)]" : ""}>
                        {p.cost ? "−" : "+"}
                        {m(p.value)}
                      </b>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                      <div
                        className={`h-full rounded-full ${p.cost ? "bg-[var(--danger)]" : "bg-[var(--accent-green)]"}`}
                        style={{ width: `${(p.value / incomeScale) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
                <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t-2 border-dashed border-[var(--edge)] pt-3 text-sm">
                  <span>
                    ✖️ {t.multiplier}: <b>×{r.multiplier.toFixed(2)}</b>
                    {data.learning > 0 && (
                      <>
                        {" "}
                        · 📚 {t.learning}: <b>+{Math.round(data.learning * 100)} %</b>
                      </>
                    )}
                  </span>
                  <span className="font-extrabold">
                    = {r.net >= 0 ? "+" : ""}
                    {m(r.net)} {t.perHourShort}
                  </span>
                </div>
                <p className="text-xs text-[var(--muted)]">{t.overviewHint}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 md:col-span-2 lg:grid-cols-4">
                {[
                  { icon: "🏠", label: t.passiveShare, value: `${Math.round(passiveShare * 100)} %` },
                  { icon: "📅", label: t.avgDay, value: `${r.net >= 0 ? "+" : ""}${m(r.net * 24)}` },
                  { icon: "🍞", label: t.yearlyCost, value: `−${m(r.living * 24 * 365)}` },
                  { icon: "🏭", label: t.bestCompany, value: bestCo ? `${t.companies[bestCo.id]} · ${m(bestCo.perHour)} ${t.perHourShort}` : t.noCompany },
                ].map((s) => (
                  <div key={s.label} className="card p-4">
                    <p className="text-xs text-[var(--muted)]">
                      {s.icon} {s.label}
                    </p>
                    <p className="font-bold">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {ov === "assets" && (
            <div className="grid gap-4 md:grid-cols-2">
              {/* Koláč majetku */}
              <div className="card flex flex-col gap-3 p-5">
                <h2 className="font-bold">🧺 {t.assetsTitle}</h2>
                <Donut
                  parts={assetParts}
                  centerLabel={t.centerAssets}
                  centerValue={m(worth)}
                  shareLabel={t.shareLabel}
                />
              </div>

              {/* Sloupcový graf firem: výnos za hodinu */}
              <div className="card flex flex-col gap-3 p-5">
                <h2 className="font-bold">🏭 {t.companiesPerHour}</h2>
                {companyRows.length === 0 ? (
                  <p className="text-sm text-[var(--muted)]">{t.noCompany}</p>
                ) : (
                  companyRows.map((c) => (
                    <div key={c.id} className="flex flex-col gap-1">
                      <div className="flex justify-between text-sm">
                        <span>
                          {EMOJI[c.id]} {t.companies[c.id]} × {c.count}
                        </span>
                        <b>{m(c.perHour)} {t.perHourShort}</b>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                        <div className="h-full rounded-full bg-[var(--brand-500)]" style={{ width: `${(c.perHour / companyScale) * 100}%` }} />
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="card flex flex-col gap-3 p-5 md:col-span-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-[var(--surface-muted)] p-3">
                    <p className="text-xs text-[var(--muted)]">🏭 {t.companiesOwned}</p>
                    <p className="font-bold">{companiesOwned}</p>
                  </div>
                  <div className="rounded-xl bg-[var(--surface-muted)] p-3">
                    <p className="text-xs text-[var(--muted)]">🎯 {t.hustlesRunning}</p>
                    <p className="font-bold">{runningHustles}</p>
                  </div>
                </div>
                {holdings.length === 0 ? (
                  <p className="text-sm text-[var(--muted)]">
                    {t.assetsTitle}: {t.none}
                  </p>
                ) : (
                  <ul className="flex flex-col gap-1.5 text-sm">
                    {holdings.map((h) => (
                      <li key={h.id} className="flex justify-between">
                        <span>
                          {EMOJI[h.id]} {t.assets[h.id]}
                        </span>
                        <b>{m(h.value)}</b>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {ov === "education" && (
            <div className="card flex flex-col gap-3 p-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-bold">🎓 {t.education}</h2>
                <span className="text-sm font-bold">
                  {state.edu} / {MAX_EDU}
                </span>
              </div>
              <p className="text-sm text-[var(--muted)]">{t.educationHint}</p>
              <div className="h-3 overflow-hidden rounded-full border-2 border-[var(--edge)] bg-[var(--surface-muted)]">
                <div className="h-full bg-[var(--accent-green)]" style={{ width: `${(state.edu / MAX_EDU) * 100}%` }} />
              </div>
              <button
                type="button"
                disabled={busy || state.edu >= MAX_EDU || data.points < data.eduCost}
                onClick={() => void act({ action: "investEdu" }, () => t.toast.edu)}
                className="btn-bouncy w-fit bg-[var(--accent-yellow)] px-4 py-2 text-sm font-bold text-[#16132b] disabled:opacity-45"
              >
                {state.edu >= MAX_EDU ? t.educationMax : fill(t.educationBuy, { n: state.edu + 1, p: data.eduCost })}
              </button>

              <div className="mt-2 flex flex-col gap-3 border-t-2 border-[var(--border-soft)] pt-4">
                <h3 className="flex flex-wrap items-center gap-2 font-bold">
                  💱 {t.exchange.title}
                  <span className="text-sm font-bold text-[var(--muted)]">⭐ {data.points}</span>
                </h3>
                <p className="text-sm text-[var(--muted)]">{t.exchange.hint}</p>
                <label className="flex items-center gap-2 text-sm font-bold">
                  {t.exchange.amount}
                  <input
                    type="number"
                    min={1}
                    max={10000}
                    value={xAmount}
                    onChange={(e) => setXAmount(Number(e.target.value))}
                    className="w-28 rounded-md border-2 border-[var(--edge)] bg-[var(--surface)] px-2 py-1"
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busy || !(xAmount >= 1) || data.points < Math.floor(xAmount)}
                    onClick={() => {
                      const n = Math.floor(xAmount);
                      void act({ action: "exchange", direction: "sell", amount: n }, () => fill(t.exchange.sold, { n }));
                    }}
                    className="btn-bouncy bg-[var(--accent-green)] px-4 py-2 text-sm font-bold text-[#16132b] disabled:opacity-45"
                  >
                    {t.exchange.sell}
                  </button>
                  <button
                    type="button"
                    disabled={busy || !(xAmount >= 1) || state.cash < Math.floor(xAmount) * POINT_BUY_CASH}
                    onClick={() => {
                      const n = Math.floor(xAmount);
                      void act({ action: "exchange", direction: "buy", amount: n }, () => fill(t.exchange.bought, { n }));
                    }}
                    className="btn-bouncy bg-[var(--accent-yellow)] px-4 py-2 text-sm font-bold text-[#16132b] disabled:opacity-45"
                  >
                    {t.exchange.buy}
                  </button>
                </div>
                <p className="text-xs text-[var(--muted)]">
                  {fill(t.exchange.sellRate, { p: m(POINT_SELL_CASH) })} · {fill(t.exchange.buyRate, { p: m(POINT_BUY_CASH) })}
                </p>
              </div>
            </div>
          )}

          {ov === "materials" && (
            <div className="card flex flex-col gap-4 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-bold">🧱 {t.materials.title}</h2>
                {craft?.buyLeft !== undefined && <span className="text-sm font-bold">{fill(ct.buyLeft, { n: craft.buyLeft })}</span>}
              </div>
              <p className="text-sm text-[var(--muted)]">{t.materials.hint}</p>
              {craftMsg && <p className="text-sm font-bold">{craftMsg}</p>}
              {!craft ? (
                <p className="text-sm text-[var(--muted)]">{t.loading}</p>
              ) : (
                WORLDS.map((w) => {
                  const list = MATERIALS.filter((x) => x.world === w && CASH_PRICE[x.rarity] !== undefined);
                  if (list.length === 0) return null;
                  return (
                    <div key={w} className="flex flex-col gap-2">
                      <h3 className="text-sm font-bold">
                        {WORLD_ICON[w]} {ct.worlds[w]}
                      </h3>
                      <ul className="grid gap-2 sm:grid-cols-2">
                        {list.map((x) => {
                          const price = CASH_PRICE[x.rarity] ?? 0;
                          return (
                            <li key={x.id} className="flex items-center gap-2 rounded-md border-2 border-[var(--border-soft)] p-2">
                              <span className="text-xl" aria-hidden>
                                {x.icon}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-bold">{x.names[locale]}</span>
                                <span className="block text-[11px] text-[var(--muted)]">
                                  {ct.rarities[x.rarity]} · {fill(t.materials.owned, { n: craft.mats?.[x.id] ?? 0 })}
                                </span>
                              </span>
                              <button
                                type="button"
                                disabled={!!craftBusy || busy || (craft.buyLeft ?? 0) <= 0 || state.cash < price}
                                onClick={() => void buyMaterial(x.id, x.names[locale])}
                                className="btn-bouncy shrink-0 bg-[var(--accent-yellow)] px-2.5 py-1.5 text-xs font-bold text-[#16132b] disabled:opacity-45"
                              >
                                🛒 {m(price)}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </section>
      )}

      {tab === "needs" && (
        <section className="grid gap-4">
          <p className="text-sm text-[var(--muted)]">{nd.intro}</p>

          <div className="card flex flex-col gap-2 p-4 text-sm">
            <p className="font-semibold">{fill(nd.dailyCost, { p: m(r.living * 24) })}</p>
            <p className={emptyNeedCount > 0 ? "font-semibold text-[var(--danger)]" : "text-[var(--muted)]"}>
              {emptyNeedCount > 0 ? fill(nd.emptyCount, { n: emptyNeedCount }) : nd.allStocked}
            </p>
          </div>

          <div className="card flex flex-col gap-3 p-4">
            <h2 className="font-bold">{nd.boostsTitle}</h2>
            <p className="text-sm text-[var(--muted)]">{nd.boostsHint}</p>
            {BOOSTS.map((id: BoostId) => {
              const left = Math.max(0, ...state.boosts.filter((b) => b.id === id).map((b) => b.until - clock));
              const price = boostPrice(state, id);
              const def = nd.boosts[id];
              return (
                <div key={id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[var(--surface)] p-3">
                  <div>
                    <p className="font-semibold">{def.name}</p>
                    <p className="text-sm text-[var(--muted)]">{def.effect}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {left > 0 ? fill(nd.boostLeft, { t: formatLeft(left, t) }) : nd.boostNone}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={busy || state.cash < price}
                    onClick={() => void act({ action: "buyBoost", id }, () => nd.bought)}
                    className="btn-bouncy bg-[var(--brand-500)] px-4 py-2 text-sm font-bold text-white disabled:opacity-45"
                  >
                    {nd.buyBoost} · {m(price)}
                  </button>
                </div>
              );
            })}
          </div>

          {NEEDS.map((id) => {
            const def = nd.items[id];
            const days = liveNeeds[id];
            const empty = days <= 0.001;
            const daily = needDaily(state, id);
            const room = MAX_NEED_DAYS - state.needs[id];
            const full = room <= 0.001;
            return (
              <div key={id} className="card flex flex-col gap-3 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-bold">
                    {NEED_EMOJI[id]} {def.name}
                  </h2>
                  <span className="rounded-full border border-[var(--line)] px-2 py-0.5 text-xs">
                    {NEED_DEF[id].essential ? nd.essential : nd.common}
                  </span>
                </div>
                <p className="text-sm text-[var(--muted)]">{def.hint}</p>
                <p className={`rounded-lg px-3 py-2 text-sm ${empty ? "bg-[var(--surface)] font-semibold text-[var(--danger)]" : "bg-[var(--surface)] text-[var(--muted)]"}`}>
                  {empty ? "⚠ " : ""}
                  {def.effect}
                </p>
                <div>
                  <div className="mb-1 flex justify-between gap-2 text-sm">
                    <span className={empty ? "font-bold text-[var(--danger)]" : "font-semibold"}>
                      {empty ? nd.empty : fill(nd.days, { n: days.toLocaleString(locale, { maximumFractionDigits: 1 }) })}
                    </span>
                    <span className="text-[var(--muted)]">{fill(nd.perDay, { p: m(daily) })}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--surface)]">
                    <div className="h-full bg-[var(--accent-green)]" style={{ width: `${Math.min(100, (days / MAX_NEED_DAYS) * 100)}%` }} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busy || full || state.cash < daily * Math.min(1, room)}
                    onClick={() => void act({ action: "buyNeed", id, amount: 1 }, () => nd.bought)}
                    className="btn-bouncy bg-[var(--surface)] px-4 py-2 text-sm font-bold disabled:opacity-45"
                  >
                    {full ? nd.full : nd.buyDay}
                  </button>
                  {!full && (
                    <button
                      type="button"
                      disabled={busy || state.cash < daily * room}
                      onClick={() => void act({ action: "buyNeed", id, amount: Math.ceil(room) }, () => nd.bought)}
                      className="btn-bouncy bg-[var(--brand-500)] px-4 py-2 text-sm font-bold text-white disabled:opacity-45"
                    >
                      {fill(nd.fill, { n: MAX_NEED_DAYS })}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {tab === "work" && (
        <section className="grid gap-4">
          <p className="text-sm text-[var(--muted)]">{t.workHint}</p>

          <div className="card flex flex-col gap-3 p-4">
            <p className="font-semibold">
              {t.currentJob}: {job ? `${EMOJI[job.id]} ${t.jobs[job.id]}` : t.noJob}
            </p>
            {job && (
              <>
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="rounded-full border border-[var(--line)] px-2 py-0.5">
                    {fill(w.rank, { n: job.rank })}
                    {job.rank >= MAX_JOB_RANK ? " ★" : ""}
                  </span>
                  <span className="text-[var(--muted)]">
                    {w.passive}: {m(r.salary)} {t.perHourShort}
                  </span>
                  {job.lead && <span className="rounded-full border border-[var(--line)] px-2 py-0.5">{w.lead}</span>}
                </div>
                <div>
                  <div className="mb-1 text-sm text-[var(--muted)]">
                    {job.rank >= MAX_JOB_RANK ? w.topRank : fill(w.pointsTo, { n: job.points, max: nextPoints })}
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--surface)]">
                    <div className="h-full bg-[var(--accent-green)]" style={{ width: `${job.rank >= MAX_JOB_RANK ? 100 : Math.min(100, (job.points / nextPoints) * 100)}%` }} />
                  </div>
                </div>
                {sick && <p className="text-sm font-semibold">🤒 {fill(w.sick, { t: formatLeft(state.sickUntil - clock, t) })}</p>}
                {onVacation && <p className="text-sm font-semibold">🏖️ {formatLeft(state.vacationUntil - clock, t)}</p>}
                {crisisText && <p className="text-sm font-semibold">📉 {crisisText}</p>}
                {job.warned && <p className="text-sm font-semibold">⚠️ {w.warned}</p>}
              </>
            )}
          </div>

          <div className="card flex flex-col gap-3 p-4">
            <h2 className="font-bold">{w.shiftTitle}</h2>
            <p className="text-sm text-[var(--muted)]">{w.shiftIntro}</p>
            <div>
              <div className="mb-1 text-sm">{fill(w.energy, { n: Math.floor(state.energy) })}</div>
              <div className="h-2 overflow-hidden rounded-full bg-[var(--surface)]">
                <div className="h-full bg-[var(--brand-500)]" style={{ width: `${Math.min(100, state.energy)}%` }} />
              </div>
            </div>

            {state.shift && job ? (
              (() => {
                const sit = SITUATIONS[(state.shift.seed + state.shift.step * 2) % SITUATIONS.length];
                const text = w.situations[sit.id];
                return (
                  <div className="flex flex-col gap-3">
                    <p className="text-sm font-semibold">{fill(w.shiftStep, { n: state.shift.step + 1 })}</p>
                    <p>{text.text}</p>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {text.choices.map((label, i) => (
                        <button
                          key={label}
                          type="button"
                          disabled={busy}
                          onClick={() => void act({ action: "chooseShift", index: i }, eventText)}
                          className="btn-bouncy rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-left text-sm font-bold disabled:opacity-45"
                        >
                          {label}
                          <span className="block text-xs font-normal text-[var(--muted)]">{fill(w.shiftPerf, { n: sit.perf[i] })}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  disabled={busy || !job || sick || onVacation || shiftWait > 0 || noTransport || state.energy < needEnergy}
                  onClick={() => void act({ action: "startShift" }, eventText)}
                  className="btn-bouncy w-fit bg-[var(--brand-500)] px-4 py-2 text-sm font-bold text-white disabled:opacity-45"
                >
                  {w.shiftStart}
                </button>
                {noTransport && (
                  <button
                    type="button"
                    disabled={busy || !job || sick || onVacation || shiftWait > 0 || state.energy < walkEnergy}
                    onClick={() => void act({ action: "startShift", walk: true }, eventText)}
                    className="btn-bouncy w-fit border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-sm font-bold disabled:opacity-45"
                  >
                    {w.shiftWalk}
                  </button>
                )}
                {shiftWait > 0 && <p className="text-sm text-[var(--muted)]">{fill(w.shiftNext, { t: formatLeft(shiftWait, t) })}</p>}
                {noTransport && <p className="text-sm text-[var(--muted)]">{fill(w.walkNote, { n: walkEnergy })}</p>}
                {!noTransport && state.energy < needEnergy && <p className="text-sm text-[var(--muted)]">{fill(w.energyNeed, { n: needEnergy })}</p>}
              </div>
            )}
          </div>

          <div className="card flex flex-col gap-3 p-4">
            <h2 className="font-bold">{w.careerTitle}</h2>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <button
                type="button"
                disabled={busy || !job || !!state.shift || job.rank >= MAX_JOB_RANK || promoWait > 0 || job.points < nextPoints}
                onClick={() => void act({ action: "requestPromotion" }, eventText)}
                className="btn-bouncy rounded-lg bg-[var(--brand-500)] px-3 py-2 text-left text-sm font-bold text-white disabled:opacity-45"
              >
                {promoWait > 0 ? fill(w.wait, { t: formatLeft(promoWait, t) }) : w.promo}
                <span className="block text-xs font-normal opacity-80">{fill(w.promoChance, { n: Math.round(promoPct) })}</span>
              </button>
              <button
                type="button"
                disabled={busy || !job || !!state.shift || raiseWait > 0}
                onClick={() => void act({ action: "negotiateRaise" }, eventText)}
                className="btn-bouncy rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-left text-sm font-bold disabled:opacity-45"
              >
                {raiseWait > 0 ? fill(w.wait, { t: formatLeft(raiseWait, t) }) : w.raise}
                <span className="block text-xs font-normal text-[var(--muted)]">{fill(w.promoChance, { n: Math.round(raisePct) })}</span>
              </button>
              <button
                type="button"
                disabled={busy || !job || !!state.shift || (job?.rank ?? 0) < LEAD_MIN_RANK}
                onClick={() => void act({ action: "setLead", on: !job?.lead }, eventText)}
                className="btn-bouncy rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-left text-sm font-bold disabled:opacity-45"
              >
                {job && job.rank >= LEAD_MIN_RANK ? (job.lead ? w.leadOn : w.leadOff) : w.leadLocked}
                <span className="block text-xs font-normal text-[var(--muted)]">{w.leadNote}</span>
              </button>
              <button
                type="button"
                disabled={busy || !!state.shift || restWait > 0}
                onClick={() => void act({ action: "rest" }, eventText)}
                className="btn-bouncy rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-left text-sm font-bold disabled:opacity-45"
              >
                {restWait > 0 ? fill(w.wait, { t: formatLeft(restWait, t) }) : w.rest}
              </button>
              <button
                type="button"
                disabled={busy || !!state.shift || onVacation || sick || vacLeft <= 0}
                onClick={() => void act({ action: "startVacation" }, eventText)}
                className="btn-bouncy rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-left text-sm font-bold disabled:opacity-45"
              >
                {w.vacation}
                <span className="block text-xs font-normal text-[var(--muted)]">{fill(w.vacationLeft, { n: vacLeft })}</span>
              </button>
            </div>
            {state.dayPay > 0 && <p className="text-sm text-[var(--muted)]">{fill(w.bonus, { n: m(state.dayPay * BONUS_SHARE) })}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {JOBS.map((j) => {
              const current = job?.id === j.id;
              const locked = state.edu < j.edu;
              return (
                <article key={j.id} className={`card flex flex-col gap-2 p-4 ${current ? "border-[var(--accent-green)]" : ""} ${locked ? "opacity-70" : ""}`}>
                  <h3 className="font-bold">
                    {EMOJI[j.id]} {t.jobs[j.id]}
                  </h3>
                  <p className="text-sm text-[var(--muted)]">
                    {m(j.salary * INCOME_SPEED * COUNTRY_DEF[ch.country].salary)} {t.perHourShort} · {j.fee > 0 ? fill(t.fee, { n: m(j.fee) }) : t.free}
                  </p>
                  <p className="text-xs text-[var(--muted)]">{fill(w.eduReq, { n: j.edu })}</p>
                  {current ? (
                    <button type="button" disabled={busy || !!state.shift} onClick={() => void act({ action: "quitJob" })} className="btn-bouncy mt-auto bg-[var(--surface)] px-3 py-2 text-sm font-bold">
                      {t.quit}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={busy || !!state.shift || locked || liveCash < j.fee}
                      onClick={() => void act({ action: "takeJob", id: j.id }, () => t.toast.job)}
                      className="btn-bouncy mt-auto bg-[var(--brand-500)] px-3 py-2 text-sm font-bold text-white disabled:opacity-45"
                    >
                      {locked ? `🔒 ${fill(w.eduReq, { n: j.edu })}` : t.take}
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}

      {tab === "companies" && (
        <CompanyTab state={state} clock={clock} multiplier={r.multiplier} t={t} m={m} busy={busy} liveCash={liveCash} act={act} />
      )}

      {tab === "invest" && (
        <InvestPanel
          state={state}
          clock={clock}
          liveCash={liveCash}
          netWorth={worth}
          rates={r}
          arbitrage={data.arbitrage}
          assetEvent={data.assetEvent ?? null}
          m={m}
          t={t}
          busy={busy}
          act={act}
        />
      )}

      {tab === "hustle" && (
        <HustleTab
          state={state}
          clock={clock}
          liveCash={liveCash}
          busy={busy}
          t={getEconomyHustle(locale)}
          m={m}
          fill={fill}
          left={(ms) => formatLeft(ms, t)}
          x={(n) => n.toLocaleString(t.numberLocale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          act={act}
        />
      )}

      {tab === "board" && (
        <section>
          <p className="mb-3 text-sm text-[var(--muted)]">{t.boardHint}</p>
          {board?.me && <p className="mb-3 font-semibold">{fill(t.yourRank, { n: board.me.rank })}</p>}
          {!board || board.top.length === 0 ? (
            <p className="card p-6 text-center text-[var(--muted)]">{board ? t.boardEmpty : t.loading}</p>
          ) : (
            <ol className="card divide-y divide-[var(--edge)]/20 overflow-hidden">
              {board.top.map((row) => (
                <li key={row.rank} className={`flex items-center gap-3 px-4 py-2.5 ${row.me ? "bg-[var(--accent-yellow)]/25 font-bold" : ""}`}>
                  <span className="w-8 text-right text-[var(--muted)]">{row.rank}.</span>
                  <span className="min-w-0 flex-1 truncate">
                    {row.name} {row.me && `(${t.you})`}
                  </span>
                  <span className="text-xs text-[var(--muted)]">{row.runs + 1}×</span>
                  <span className="font-semibold">{money(row.best, row.country && row.country in COUNTRY_DEF ? COUNTRY_DEF[row.country as CountryId].currency : "", locale)}</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      )}

      {toast && <Toast toast={toast} />}
    </div>
  );
}

function Group<K extends string>({ label, values, value, names, onPick }: { label: string; values: readonly K[]; value: K; names: Record<K, string>; onPick: (v: K) => void }) {
  return (
  <fieldset>
    <legend className="mb-1 text-sm font-bold">{label}</legend>
    <div className="flex flex-wrap gap-2">
      {values.map((v) => (
        <button
          key={v}
          type="button"
          aria-pressed={value === v}
          onClick={() => onPick(v)}
          className={`btn-bouncy px-3 py-1.5 text-sm font-semibold ${value === v ? "bg-[var(--brand-500)] text-white" : "bg-[var(--surface)]"}`}
        >
          {names[v]}
        </button>
      ))}
    </div>
  </fieldset>
);
}


function Toast({ toast }: { toast: { text: string; ok: boolean } }) {
  return (
    <div
      role="status"
      className={`pill fixed inset-x-0 bottom-6 z-50 mx-auto w-fit px-4 py-2 text-sm shadow-lg ${toast.ok ? "bg-[var(--accent-green)] text-[#16132b]" : "bg-[var(--danger)] text-white"}`}
    >
      {toast.text}
    </div>
  );
}
