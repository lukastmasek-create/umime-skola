"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getEconomyText } from "@/i18n/economy";
import { getEconomyWork } from "@/i18n/economy-work";
import { notifyAccountChanged } from "@/lib/account-events";
import {
  ARB_FEE,
  ASSETS,
  BONUS_SHARE,
  COMPANY_STAFF_MAX,
  LEAD_EXTRA_ENERGY,
  LEAD_MIN_RANK,
  PROMO_BASE,
  PROMO_MAX,
  PROMO_PER_PERF,
  RANK_POINTS,
  RAISE_BASE,
  RAISE_PER_PERF,
  RAISE_SENIOR_PENALTY,
  SHIFT_MIN_ENERGY,
  SITUATIONS,
  STAFF_HIRE_HOURS,
  VACATION_MAX,
  VACATION_WINDOW_MS,
  type EconomyEvent,
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
  hustleReady,
  isLocked,
  type AssetId,
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
  event?: EconomyEvent | null;
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

const EMOJI: Record<string, string> = {
  warehouse: "📦", seller: "🛒", farmer: "🌾", cook: "🍳", firefighter: "🚒", police: "👮", teacher: "📚", journalist: "📰", vet: "🐾", architect: "📐", programmer: "💻", pilot: "✈️", doctor: "🩺", banker: "🏦",
  shoes: "👟", clothes: "👕", tech: "📱", delivery: "🛵", supermarket: "🏬", digi: "🎮", software: "🧩", hardware: "🖥️", factory: "🏭",
  bonds: "📜", metal: "🥇", stocks: "📈", realestate: "🏠", crypto: "🪙",
  reselling: "🔁", carflip: "🚗", houseflip: "🏚️",
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
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);
  const [board, setBoard] = useState<Board | null>(null);
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

  const w = getEconomyWork(locale);
  const job = state.job;
  const shiftWait = Math.max(0, state.shiftReadyAt - clock);
  const restWait = Math.max(0, state.restReadyAt - clock);
  const raiseWait = Math.max(0, state.raiseReadyAt - clock);
  const promoWait = job ? Math.max(0, job.promoRetryAt - clock) : 0;
  const sick = state.sickUntil > clock;
  const onVacation = state.vacationUntil > clock;
  const needEnergy = SHIFT_MIN_ENERGY + (job?.lead ? LEAD_EXTRA_ENERGY : 0);
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
                  disabled={busy || !job || sick || onVacation || shiftWait > 0 || state.energy < needEnergy}
                  onClick={() => void act({ action: "startShift" }, eventText)}
                  className="btn-bouncy w-fit bg-[var(--brand-500)] px-4 py-2 text-sm font-bold text-white disabled:opacity-45"
                >
                  {w.shiftStart}
                </button>
                {shiftWait > 0 && <p className="text-sm text-[var(--muted)]">{fill(w.shiftNext, { t: formatLeft(shiftWait, t) })}</p>}
                {state.energy < needEnergy && <p className="text-sm text-[var(--muted)]">{fill(w.energyNeed, { n: needEnergy })}</p>}
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
                  {owned > 0 && (
                    <div className="flex flex-col gap-2 border-t border-[var(--line)] pt-2 text-sm">
                      <p>
                        {w.staffTitle}: {fill(w.staffCount, { n: state.staff[c.id] ?? 0, max: COMPANY_STAFF_MAX })}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={busy || (state.staff[c.id] ?? 0) >= COMPANY_STAFF_MAX || liveCash < STAFF_HIRE_HOURS * owned * companyIncome(c.id) * INCOME_SPEED}
                          onClick={() => void act({ action: "hireStaff", id: c.id })}
                          className="btn-bouncy rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 font-bold disabled:opacity-45"
                        >
                          {w.hire} ({m(STAFF_HIRE_HOURS * owned * companyIncome(c.id) * INCOME_SPEED)})
                        </button>
                        <button
                          type="button"
                          disabled={busy || (state.staff[c.id] ?? 0) < 1}
                          onClick={() => void act({ action: "fireStaff", id: c.id })}
                          className="btn-bouncy rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 font-bold disabled:opacity-45"
                        >
                          {w.fire}
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}

      {tab === "invest" && (
        <section>
          <p className="mb-3 text-sm text-[var(--muted)]">{t.investHint}</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ASSETS.map((a) => {
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
                      {EMOJI[a.id]} {t.assets[a.id]}
                    </span>
                    <span className={`text-sm ${price >= prev ? "text-[var(--accent-green)]" : "text-[var(--danger)]"}`}>{price >= prev ? "▲" : "▼"}</span>
                  </h3>
                  <p className="text-sm">
                    {t.price}: <b>{m(price)}</b>
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
          <div className="grid gap-4 sm:grid-cols-3">
            {HUSTLES.map((h) => {
              const slot = state.hustle[h.id];
              const ready = hustleReady(slot, h.id, clock);
              return (
                <article key={h.id} className={`card flex flex-col gap-2 p-4 ${ready ? "border-[var(--accent-green)]" : ""}`}>
                  <h3 className="font-bold">
                    {EMOJI[h.id]} {t.hustles[h.id]}
                  </h3>
                  <p className="text-sm text-[var(--muted)]">
                    {m(h.cost)} · {h.minutes >= 60 ? fill(t.hours, { n: h.minutes / 60 }) : fill(t.minutes, { n: h.minutes })}
                  </p>
                  {slot ? (
                    ready ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void act({ action: "collectHustle", id: h.id }, (p) => {
                            const profit = p.gained?.profit ?? 0;
                            return fill(profit >= 0 ? t.toast.profit : t.toast.loss, { n: m(Math.abs(profit)) });
                          })
                        }
                        className="btn-bouncy mt-auto bg-[var(--accent-green)] px-3 py-2 text-sm font-bold text-[#16132b]"
                      >
                        ✓ {t.hustleReady} {t.hustleCollect}
                      </button>
                    ) : (
                      <p className="mt-auto text-sm font-semibold">⏳ {fill(t.hustleRunning, { t: formatLeft(h.minutes * 60_000 - (clock - slot.startedAt), t) })}</p>
                    )
                  ) : (
                    <button
                      type="button"
                      disabled={busy || liveCash < h.cost}
                      onClick={() => void act({ action: "startHustle", id: h.id })}
                      className="btn-bouncy mt-auto bg-[var(--brand-500)] px-3 py-2 text-sm font-bold text-white disabled:opacity-45"
                    >
                      {fill(t.hustleStart, { n: m(h.cost) })}
                    </button>
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
