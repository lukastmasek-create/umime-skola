"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getEconomyText } from "@/i18n/economy";
import { notifyAccountChanged } from "@/lib/account-events";
import {
  ARB_FEE,
  ASSETS,
  ASSET_CATEGORIES,
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
  assetPrice,
  companyIncome,
  companyPrice,
  HUSTLE_RISK_DEFAULT,
  hustleOffer,
  hustleReady,
  isLocked,
  jobRank,
  type AssetCategoryId,
  type AssetId,
  type HustleId,
  type CityId,
  type CountryId,
  type EconomyState,
  type EraId,
  type FamilyId,
  type Rates,
} from "@/lib/idle/economy";
import type { Locale } from "@/i18n/config";

type Payload = {
  state: EconomyState;
  points: number;
  now: number;
  learning: number;
  rates: Rates;
  netWorth: number;
  arbitrage: { spread: number; limit: number };
  eduCost: number;
  gained?: { cash?: number; profit?: number } | null;
};
type View = { data: Payload; receivedAt: number };
type Load = "loading" | "login" | "unavailable" | "ready";
type Tab = "overview" | "work" | "companies" | "invest" | "hustle" | "board";
type Board = { top: { rank: number; name: string; country: string | null; best: number; runs: number; me: boolean }[]; me: { rank: number; best: number } | null };

const fill = (text: string, vars: Record<string, string | number>) => text.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));

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

const CAT_EMOJI: Record<AssetCategoryId, string> = {
  crypto: "🪙", realestate: "🏠", stocks: "📈", metals: "🥇", bonds: "📜", funds: "🧺", startups: "🚀",
};

// Štítek rizika podle výkyvu ceny (ASSETS.vol): nízké do 5 %, střední do 20 %, jinak vysoké.
const riskKey = (vol: number): "riskLow" | "riskMid" | "riskHigh" => (vol <= 0.05 ? "riskLow" : vol <= 0.2 ? "riskMid" : "riskHigh");

// Mini graf vývoje ceny za posledních 6 hodin (24 bodů po 15 minutách). Počítá se z čisté funkce ceny, takže sedí se serverem.
function priceSpark(id: AssetId, now: number): string {
  const pts = Array.from({ length: 24 }, (_, i) => assetPrice(id, now - (23 - i) * 15 * 60_000));
  const lo = Math.min(...pts);
  const hi = Math.max(...pts);
  const span = hi - lo || 1;
  return pts.map((p, i) => `${((i / 23) * 120).toFixed(1)},${(34 - ((p - lo) / span) * 30).toFixed(1)}`).join(" ");
}

const EMOJI: Record<string, string> = {
  warehouse: "📦", seller: "🛒", cook: "🍳", police: "👮", vet: "🐾", programmer: "💻", banker: "🏦",
  shoes: "👟", clothes: "👕", tech: "📱", delivery: "🛵", supermarket: "🏬", digi: "🎮", software: "🧩", hardware: "🖥️", factory: "🏭",
  reselling: "🔁", carflip: "🚗", houseflip: "🏚️", lemonade: "🍋", startup: "🚀",
};

function formatLeft(ms: number, t: ReturnType<typeof getEconomyText>): string {
  const m = Math.max(1, Math.ceil(ms / 60_000));
  if (m < 60) return fill(t.minutes, { n: m });
  return `${fill(t.hours, { n: Math.floor(m / 60) })} ${String(m % 60).padStart(2, "0")} min`;
}

export function EconomyGame({ locale }: { locale: Locale }) {
  const t = getEconomyText(locale);
  const [load, setLoad] = useState<Load>("loading");
  const [view, setView] = useState<View | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [nowMs, setNowMs] = useState(0);
  // Rozkliknutá karta hustlu a zvolený vklad/riziko pro každou kartu zvlášť.
  const [hustleOpen, setHustleOpen] = useState<HustleId | null>(null);
  const [hustleCfg, setHustleCfg] = useState<Partial<Record<HustleId, { stake: number; risk: number }>>>({});
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);
  const [board, setBoard] = useState<Board | null>(null);
  // Které kategorie investic jsou rozbalené (výchozí: všechny sbalené).
  const [openCats, setOpenCats] = useState<Partial<Record<AssetCategoryId, boolean>>>({});
  const [form, setForm] = useState<{ name: string; country: CountryId; city: CityId; era: EraId; family: FamilyId }>({
    name: "",
    country: "cz",
    city: "town",
    era: "2025",
    family: "middle",
  });
  const busyRef = useRef(false);

  const errorText = useCallback((code?: string) => t.errors[code ?? "generic"] ?? t.errors.generic, [t]);
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
        if (body.action === "investEdu") notifyAccountChanged();
      } catch {
        say(t.errors.generic);
      } finally {
        busyRef.current = false;
        setBusy(false);
      }
    },
    [errorText, refresh, say, t.errors.generic],
  );

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
  const clock = data.now + Math.max(0, (nowMs || view.receivedAt) - view.receivedAt);
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
  const readyHustles = HUSTLES.filter((h) => hustleReady(state.hustle[h.id], h.id, clock)).length;

  const tabs: Tab[] = ["overview", "work", "companies", "invest", "hustle", "board"];

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
        <section className="grid gap-4 md:grid-cols-2">
          <div className="card flex flex-col gap-2 p-4">
            <h2 className="font-bold">{t.perHour.replace("{n}", "")}</h2>
            <Row label={`💼 ${t.salary}`} value={`+${m(r.salary * r.multiplier)}`} />
            <Row label={`🏭 ${t.businessIncome}`} value={`+${m(r.companies * r.multiplier)}`} />
            <Row label={`🏠 ${t.passiveIncome}`} value={`+${m(r.passive * r.multiplier)}`} />
            <Row label={`🍞 ${t.living}`} value={`−${m(r.living)}`} />
            <Row label={`✖️ ${t.multiplier}`} value={`×${r.multiplier.toFixed(2)}`} />
            {data.learning > 0 && <Row label={`📚 ${t.learning}`} value={`+${Math.round(data.learning * 100)} %`} />}
            <p className="mt-1 text-xs text-[var(--muted)]">{t.overviewHint}</p>
          </div>
          <div className="card flex flex-col gap-3 p-4">
            <h2 className="font-bold">🎓 {t.education}</h2>
            <p className="text-sm text-[var(--muted)]">{t.educationHint}</p>
            <div className="h-3 overflow-hidden rounded-full border-2 border-[var(--edge)] bg-[var(--surface-muted)]">
              <div className="h-full bg-[var(--accent-green)]" style={{ width: `${(state.edu / MAX_EDU) * 100}%` }} />
            </div>
            <button
              type="button"
              disabled={busy || state.edu >= MAX_EDU || data.points < data.eduCost}
              onClick={() => void act({ action: "investEdu" }, () => t.toast.edu)}
              className="btn-bouncy bg-[var(--accent-yellow)] px-4 py-2 text-sm font-bold text-[#16132b] disabled:opacity-45"
            >
              {state.edu >= MAX_EDU ? t.educationMax : fill(t.educationBuy, { n: state.edu + 1, p: data.eduCost })}
            </button>
          </div>
          <div className="card flex flex-col gap-2 p-4 md:col-span-2">
            <p className="text-sm">
              {t.best}: <b>{m(state.best)}</b> · {t.runs}: <b>{state.runs}</b>
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
        </section>
      )}

      {tab === "work" && (
        <section>
          <p className="mb-3 text-sm text-[var(--muted)]">{t.workHint}</p>
          <p className="mb-4 font-semibold">
            {t.currentJob}:{" "}
            {state.job
              ? `${EMOJI[state.job.id]} ${t.jobs[state.job.id]} · ${fill(t.rank, { n: jobRank(state.job.hours) })}${jobRank(state.job.hours) >= MAX_JOB_RANK ? " ★" : ""}`
              : t.noJob}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {JOBS.map((j) => {
              const current = state.job?.id === j.id;
              return (
                <article key={j.id} className={`card flex flex-col gap-2 p-4 ${current ? "border-[var(--accent-green)]" : ""}`}>
                  <h3 className="font-bold">
                    {EMOJI[j.id]} {t.jobs[j.id]}
                  </h3>
                  <p className="text-sm text-[var(--muted)]">
                    {m(j.salary * INCOME_SPEED * COUNTRY_DEF[ch.country].salary)} {t.perHourShort} · {j.fee > 0 ? fill(t.fee, { n: m(j.fee) }) : t.free}
                  </p>
                  {current ? (
                    <button type="button" disabled={busy} onClick={() => void act({ action: "quitJob" })} className="btn-bouncy mt-auto bg-[var(--surface)] px-3 py-2 text-sm font-bold">
                      {t.quit}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={busy || liveCash < j.fee}
                      onClick={() => void act({ action: "takeJob", id: j.id }, () => t.toast.job)}
                      className="btn-bouncy mt-auto bg-[var(--brand-500)] px-3 py-2 text-sm font-bold text-white disabled:opacity-45"
                    >
                      {t.take}
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}

      {tab === "companies" && (
        <section>
          <p className="mb-3 text-sm text-[var(--muted)]">{t.companiesHint}</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {COMPANIES.map((c) => {
              const owned = state.companies[c.id] ?? 0;
              const locked = isLocked(state, "company", c.id);
              const price = companyPrice(state, c.id);
              return (
                <article key={c.id} className={`card flex flex-col gap-2 p-4 ${locked ? "opacity-55" : ""}`}>
                  <h3 className="font-bold">
                    {EMOJI[c.id]} {t.companies[c.id]}
                  </h3>
                  <p className="text-sm text-[var(--muted)]">
                    {fill(t.owned, { n: owned })} · {fill(t.earns, { n: m(companyIncome(c.id) * INCOME_SPEED * r.multiplier) })}
                  </p>
                  <button
                    type="button"
                    disabled={busy || locked || liveCash < price}
                    onClick={() => void act({ action: "buyCompany", id: c.id }, () => t.toast.bought)}
                    className="btn-bouncy mt-auto bg-[var(--brand-500)] px-3 py-2 text-sm font-bold text-white disabled:opacity-45"
                  >
                    {locked ? `🔒 ${t.locked1990}` : fill(t.buy, { n: m(price) })}
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {tab === "invest" && (
        <section>
          <p className="mb-3 text-sm text-[var(--muted)]">{t.investHint}</p>
          {ASSET_CATEGORIES.map((cat) => {
            const open = !!openCats[cat];
            const held = ASSETS.filter((a) => a.cat === cat).reduce((sum, a) => sum + (state.holdings[a.id] ?? 0) * assetPrice(a.id, clock), 0);
            return (
            <div key={cat} className="mb-4">
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setOpenCats((o) => ({ ...o, [cat]: !o[cat] }))}
                className="mb-2 flex w-full items-center justify-between gap-3 rounded-lg bg-[var(--surface)] px-4 py-3 text-left font-bold"
              >
                <span>
                  {CAT_EMOJI[cat]} {t.assetCategories[cat]}
                </span>
                <span className="flex items-center gap-3 text-sm">
                  {held > 0 && <span className="text-[var(--muted)]">{m(held)}</span>}
                  <span aria-hidden="true">{open ? "▴" : "▾"}</span>
                </span>
              </button>
              {open && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ASSETS.filter((a) => a.cat === cat).map((a) => {
              const price = assetPrice(a.id, clock);
              const prev = assetPrice(a.id, clock - 3_600_000);
              const qty = state.holdings[a.id] ?? 0;
              const locked = isLocked(state, "asset", a.id);
              const value = qty * price;
              const pl = qty > 0 ? value - qty * (state.cost[a.id] ?? price) : 0;
              const chunk = Math.max(1, Math.floor(liveCash / 4));
              return (
                <article key={a.id} className={`card flex flex-col gap-2 p-4 ${locked ? "opacity-55" : ""}`}>
                  <h3 className="flex items-center justify-between font-bold">
                    <span>
                      {t.assets[a.id]}
                    </span>
                    <span className={`text-sm ${price >= prev ? "text-[var(--accent-green)]" : "text-[var(--danger)]"}`}>{price >= prev ? "▲" : "▼"}</span>
                  </h3>
                  <p className="text-sm">
                    {t.price}: <b>{m(price)}</b>
                  </p>
                  <svg viewBox="0 0 120 36" preserveAspectRatio="none" className="h-9 w-full" aria-label={t.trend6h}>
                    <polyline
                      points={priceSpark(a.id, clock)}
                      fill="none"
                      stroke={price >= prev ? "var(--accent-green)" : "var(--danger)"}
                      strokeWidth="2"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                  <p className="flex flex-wrap gap-x-3 text-xs text-[var(--muted)]">
                    <span>
                      {t.risk}: <b>{t[riskKey(a.vol)]}</b>
                    </span>
                    {a.yield > 0 && (
                      <span>
                        {fill(t.yieldPerHour, { v: `${(a.yield * 100).toFixed(2)} %` })}
                      </span>
                    )}
                  </p>
                  {qty > 0 && (
                    <p className="text-sm text-[var(--muted)]">
                      {fill(t.holding, { v: m(value) })} · {t.profit}: {pl >= 0 ? "+" : "−"}
                      {m(Math.abs(pl))}
                    </p>
                  )}
                  {locked ? (
                    <p className="text-sm font-semibold">🔒 {t.locked1990}</p>
                  ) : (
                    <div className="mt-auto flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busy || liveCash < 1}
                        onClick={() => void act({ action: "buyAsset", id: a.id, amount: chunk }, () => t.toast.bought)}
                        className="btn-bouncy flex-1 bg-[var(--brand-500)] px-3 py-2 text-sm font-bold text-white disabled:opacity-45"
                      >
                        {fill(t.invest, { n: m(chunk) })}
                      </button>
                      <button
                        type="button"
                        disabled={busy || qty <= 0}
                        onClick={() => void act({ action: "sellAsset", id: a.id as AssetId, share: 0.5 }, (p) => fill(t.toast.sold, { n: m(p.gained?.cash ?? 0) }))}
                        className="btn-bouncy bg-[var(--surface)] px-3 py-2 text-sm font-bold disabled:opacity-45"
                      >
                        {t.sell}
                      </button>
                      <button
                        type="button"
                        disabled={busy || qty <= 0}
                        onClick={() => void act({ action: "sellAsset", id: a.id as AssetId, share: 1 }, (p) => fill(t.toast.sold, { n: m(p.gained?.cash ?? 0) }))}
                        className="btn-bouncy bg-[var(--surface)] px-3 py-2 text-sm font-bold disabled:opacity-45"
                      >
                        {t.sellAll}
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
              </div>
              )}
            </div>
            );
          })}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <article className="card flex flex-col gap-2 p-4">
              <h3 className="font-bold">⚖️ {t.arbitrage}</h3>
              <p className="text-xs text-[var(--muted)]">{t.arbitrageHint}</p>
              <p className="text-sm font-semibold">
                {fill(t.spread, { n: (data.arbitrage.spread * 100).toFixed(2) })} <span className="text-[var(--muted)]">(−{(ARB_FEE * 100).toFixed(1)} %)</span>
              </p>
              <button
                type="button"
                disabled={busy || clock < state.arbReadyAt || liveCash < 1}
                onClick={() =>
                  void act({ action: "arbitrage", amount: Math.min(liveCash, data.arbitrage.limit) }, (p) => fill(t.toast.profit, { n: m(p.gained?.profit ?? 0) }))
                }
                className="btn-bouncy mt-auto bg-[var(--accent-yellow)] px-3 py-2 text-sm font-bold text-[#16132b] disabled:opacity-45"
              >
                {clock < state.arbReadyAt
                  ? fill(t.arbitrageWait, { t: formatLeft(state.arbReadyAt - clock, t) })
                  : fill(t.arbitrageGo, { n: m(Math.min(liveCash, data.arbitrage.limit)) })}
              </button>
            </article>
          </div>
        </section>
      )}

      {tab === "hustle" && (
        <section>
          <p className="mb-3 text-sm text-[var(--muted)]">{t.hustleHint}</p>
          <div className="card mb-5 flex flex-col gap-3 p-4">
            <h3 className="font-bold">{t.hustlePanel}</h3>
            {HUSTLES.some((h) => state.hustle[h.id] && !hustleReady(state.hustle[h.id], h.id, clock)) ? (
              HUSTLES.filter((h) => state.hustle[h.id] && !hustleReady(state.hustle[h.id], h.id, clock)).map((h) => {
                const slot = state.hustle[h.id]!;
                const total = h.minutes * 60_000;
                const elapsed = Math.min(total, clock - slot.startedAt);
                return (
                  <div key={h.id} className="flex flex-col gap-2 rounded-lg border border-[var(--border)] p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">
                        {EMOJI[h.id]} {t.hustles[h.id]}
                      </p>
                      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[var(--border)]">
                        <div className="h-full bg-[var(--brand-500)]" style={{ width: `${(elapsed / total) * 100}%` }} />
                      </div>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {fill(t.hustleRunning, { t: formatLeft(total - elapsed, t) })} · {fill(t.hustleOffer, { n: m(hustleOffer(slot, h.id, clock)) })}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void act({ action: "cashOutHustle", id: h.id })}
                      className="btn-bouncy px-3 py-2 text-sm font-bold text-white sm:shrink-0"
                    >
                      {t.hustleCashOut}
                    </button>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-[var(--muted)]">{t.hustleNone}</p>
            )}
          </div>
          <div className="grid items-start gap-4 sm:grid-cols-3">
            {HUSTLES.map((h) => {
              const slot = state.hustle[h.id];
              const ready = hustleReady(slot, h.id, clock);
              const open = hustleOpen === h.id;
              const cfg = hustleCfg[h.id] ?? { stake: h.cost, risk: HUSTLE_RISK_DEFAULT };
              const setCfg = (patch: Partial<{ stake: number; risk: number }>) =>
                setHustleCfg((prev) => ({ ...prev, [h.id]: { ...cfg, ...patch } }));
              const amount = cfg.stake;
              const canAfford = amount >= 1 && liveCash >= amount;
              return (
                <article key={h.id} className={`card flex flex-col gap-2 p-4 ${ready ? "border-[var(--accent-green)]" : ""}`}>
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setHustleOpen(open ? null : h.id)}
                    className="flex w-full items-start justify-between gap-2 text-left"
                  >
                    <span className="min-w-0">
                      <span className="block font-bold">
                        {EMOJI[h.id]} {t.hustles[h.id]}
                      </span>
                      <span className="block text-sm text-[var(--muted)]">
                        {m(h.cost)} · {h.minutes >= 60 ? fill(t.hours, { n: h.minutes / 60 }) : fill(t.minutes, { n: h.minutes })}
                      </span>
                    </span>
                    <span aria-hidden className="text-[var(--muted)]">{open ? "▲" : "▼"}</span>
                  </button>

                  {slot && !ready && (
                    <p className="text-sm font-semibold">⏳ {fill(t.hustleRunning, { t: formatLeft(h.minutes * 60_000 - (clock - slot.startedAt), t) })}</p>
                  )}
                  {ready && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        void act({ action: "collectHustle", id: h.id }, (p) => {
                          const profit = p.gained?.profit ?? 0;
                          return fill(profit >= 0 ? t.toast.profit : t.toast.loss, { n: m(Math.abs(profit)) });
                        })
                      }
                      className="btn-bouncy bg-[var(--accent-green)] px-3 py-2 text-sm font-bold text-[#16132b]"
                    >
                      ✓ {t.hustleReady} {t.hustleCollect}
                    </button>
                  )}

                  {open && !ready && (
                    <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-3">
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor={`stake-${h.id}`} className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
                          {t.hustleStake}
                        </label>
                        <div className="flex gap-1.5">
                          <input
                            id={`stake-${h.id}`}
                            type="number"
                            inputMode="numeric"
                            min={1}
                            step={1}
                            disabled={busy}
                            value={cfg.stake || ""}
                            onChange={(e) => setCfg({ stake: Math.max(0, Math.floor(Number(e.target.value)) || 0) })}
                            className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-transparent px-2.5 py-1.5 text-sm"
                          />
                          <button
                            type="button"
                            disabled={busy || liveCash < 1}
                            onClick={() => setCfg({ stake: Math.floor(liveCash) })}
                            className="rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs font-bold disabled:opacity-45"
                          >
                            {t.hustleAll}
                          </button>
                        </div>
                      </div>

                      {slot ? (
                        <>
                          <p className="text-sm text-[var(--muted)]">
                            {fill(t.hustleOffer, { n: m(hustleOffer(slot, h.id, clock)) })} · {t.hustleStake}: {m(slot.stake)}
                          </p>
                          <button
                            type="button"
                            disabled={busy || !canAfford}
                            onClick={() => void act({ action: "topUpHustle", id: h.id, stake: cfg.stake })}
                            className="btn-bouncy bg-[var(--brand-500)] px-3 py-2 text-sm font-bold text-white disabled:opacity-45"
                          >
                            {fill(t.hustleTopUp, { n: m(amount) })}
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void act({ action: "cashOutHustle", id: h.id })}
                            className="btn-bouncy px-3 py-2 text-sm font-bold text-[var(--accent-red,#c2410c)]"
                          >
                            {t.hustleCashOut}
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                              <label htmlFor={`risk-${h.id}`} className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
                                {t.hustleRisk}
                              </label>
                              <span className="text-sm font-bold">{cfg.risk} %</span>
                            </div>
                            <input
                              id={`risk-${h.id}`}
                              type="range"
                              min={1}
                              max={100}
                              step={1}
                              disabled={busy}
                              value={cfg.risk}
                              onChange={(e) => setCfg({ risk: Number(e.target.value) })}
                              className="w-full accent-[var(--brand-500)]"
                            />
                            <p className="text-xs text-[var(--muted)]">{t.riskHint}</p>
                          </div>
                          <button
                            type="button"
                            disabled={busy || !canAfford}
                            onClick={() => void act({ action: "startHustle", id: h.id, stake: cfg.stake, risk: cfg.risk })}
                            className="btn-bouncy bg-[var(--brand-500)] px-3 py-2 text-sm font-bold text-white disabled:opacity-45"
                          >
                            {fill(t.hustleStart, { n: m(amount) })}
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span>{label}</span>
      <b>{value}</b>
    </div>
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
