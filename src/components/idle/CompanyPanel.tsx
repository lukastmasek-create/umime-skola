"use client";

import { useState } from "react";
import type { EconomyText } from "@/i18n/economy";
import {
  COMPANIES,
  type EconomyEvent,
  INCOME_SPEED,
  MAX_PHASE,
  MAX_STAFF_PER_UNIT,
  PHASE_RATES,
  SETTING_RANGE,
  campaignPrice,
  companyIncome,
  companyPrice,
  companyYield,
  contractActive,
  contractPrice,
  currentEvent,
  currentRival,
  eventAffects,
  fundPrice,
  hireCost,
  isSick,
  batchPrice,
  distressOf,
  WARN_MS,
  stockCapacity,
  INPUT_BATCH_HOURS,
  NO_STOCK_OUTPUT,
  UNION_MIN_STAFF,
  ROLE_MAX,
  ROLE_WAGE,
  STAFF_BASE_WAGE,
  STAFF_ROLES,
  rolesOf,
  isLocked,
  isNegativeEvent,
  MAX_RESEARCH,
  phaseCost,
  phaseRequirement,
  rates as companyRates,
  researchLevel,
  researchPrice,
  sellPrice,
  setupOf,
  upgradePrice,
  type CompanyId,
  type CompanySetup,
  type EconomyState,
  type Rates,
  type SettingKey,
} from "@/lib/idle/economy";

export type Payload = {
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
  assetEvent?: { id: string; endsAt: number } | null;
};

export type Act = (body: Record<string, unknown>, okText?: (p: Payload) => string) => Promise<void>;
type T = EconomyText;

export const fill = (text: string, vars: Record<string, string | number>) => text.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));

export function formatLeft(ms: number, t: T): string {
  const m = Math.max(1, Math.ceil(ms / 60_000));
  if (m < 60) return fill(t.minutes, { n: m });
  return `${fill(t.hours, { n: Math.floor(m / 60) })} ${String(m % 60).padStart(2, "0")} min`;
}

// Každý obor má vlastní barvu a ikonu, aby se firmy na první pohled odlišily.
export const COMPANY_STYLE: Record<CompanyId, { emoji: string; color: string }> = {
  shoes: { emoji: "👟", color: "#f97316" },
  clothes: { emoji: "👕", color: "#ec4899" },
  bakery: { emoji: "🥖", color: "#eab308" },
  tech: { emoji: "📱", color: "#3b82f6" },
  carwash: { emoji: "🚿", color: "#06b6d4" },
  delivery: { emoji: "🛵", color: "#22c55e" },
  eshop: { emoji: "🛍️", color: "#a855f7" },
  supermarket: { emoji: "🏬", color: "#84cc16" },
  printshop: { emoji: "🖨️", color: "#a8a29e" },
  digi: { emoji: "🎮", color: "#f43f5e" },
  software: { emoji: "🧩", color: "#6366f1" },
  streaming: { emoji: "📺", color: "#ef4444" },
  hardware: { emoji: "🖥️", color: "#94a3b8" },
  factory: { emoji: "🏭", color: "#b45309" },
};

// Čistý zisk firmy za hodinu v měně hry (včetně nastavení, událostí a provozu).
function netPerHour(state: EconomyState, id: CompanyId, clock: number, multiplier: number): number {
  const y = companyYield(state, id, clock);
  return y.gross * INCOME_SPEED * multiplier - y.costs * INCOME_SPEED;
}

type Common = {
  state: EconomyState;
  clock: number;
  multiplier: number;
  t: T;
  m: (n: number) => string;
  busy: boolean;
  liveCash: number;
  act: Act;
};

export function CompanyTab(props: Common) {
  const { state, clock, multiplier, t, m, busy, liveCash, act } = props;
  const [selected, setSelected] = useState<CompanyId | null>(null);
  const ev = currentEvent(clock);
  const phase = state.phase;
  const income = companyRates(state, clock).companies;
  const nextPhase = phase + 1;
  const nextNeed = phaseRequirement(nextPhase);
  const nextCost = phaseCost(nextPhase);
  const rate = PHASE_RATES[phase - 1];

  return (
    <section>
      <p className="mb-4 text-sm text-[var(--muted)]">{t.companiesHint}</p>
      {(() => {
        const d = distressOf(state, clock);
        const last = state.lastBankruptId;
        const recent = !!last && clock - state.lastBankruptAt < WARN_MS;
        return (
          <>
            {d.danger && (
              <div className="card mb-4 flex flex-col gap-1 border-2 border-[var(--danger)] p-4">
                <h3 className="font-bold">⚠️ {t.distress.title}</h3>
                <p className="text-sm">{t.distress.text}</p>
                <p className="text-sm font-bold">{fill(t.distress.left, { t: formatLeft(d.leftMs, t) })}</p>
              </div>
            )}
            {recent && last && (
              <div className="card mb-4 p-4 text-sm font-bold">💥 {fill(t.distress.bankrupt, { c: t.companies[last] })}</div>
            )}
          </>
        );
      })()}
      <div className="card mb-6 flex flex-col gap-3 p-4">
        <h3 className="font-bold">🏗️ {t.phase.title}</h3>
        <p className="text-sm">
          <b>{fill(t.phase.now, { n: phase, name: t.phase.names[phase - 1] })}</b>
        </p>
        <p className="text-xs text-[var(--muted)]">{fill(t.phase.rates, { r: Math.round(rate.rent * 100), t: Math.round(rate.tax * 100) })}</p>
        {phase >= MAX_PHASE ? (
          <p className="text-sm font-semibold">✓ {t.phase.max}</p>
        ) : (
          <>
            <p className="text-sm text-[var(--muted)]">{fill(t.phase.need, { v: m(nextNeed) })}</p>
            <button
              type="button"
              disabled={busy || income < nextNeed || liveCash < nextCost}
              onClick={() => void act({ action: "upgradePhase" }, () => t.phase.names[nextPhase - 1])}
              className="btn-bouncy w-fit bg-[var(--brand-500)] px-3 py-2 text-sm font-bold text-white disabled:opacity-45"
            >
              {income < nextNeed ? t.phase.locked : fill(t.phase.go, { c: m(nextCost) })} · {t.phase.names[nextPhase - 1]}
            </button>
          </>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {COMPANIES.map((c) => {
          const style = COMPANY_STYLE[c.id];
          const owned = state.companies[c.id] ?? 0;
          const locked = isLocked(state, "company", c.id);
          const price = companyPrice(state, c.id);
          const campaign = clock < setupOf(state, c.id).marketingUntil;
          const threatened = !!ev && isNegativeEvent(ev.def) && eventAffects(ev.def, c.id) && owned > 0;
          const rival = owned > 0 && currentRival(state, clock) === c.id;
          return (
            <article
              key={c.id}
              className={`card flex flex-col gap-3 p-4 ${locked ? "opacity-55" : ""}`}
              style={{ borderLeft: `6px solid ${style.color}` }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-3xl" aria-hidden>
                    {style.emoji}
                  </span>
                  <h3 className="font-bold leading-tight">{t.companies[c.id]}</h3>
                </div>
                {owned > 0 && (
                  <span className="pill shrink-0 px-2.5 py-1 text-sm font-extrabold text-[#16132b]" style={{ background: style.color }}>
                    {owned}×
                  </span>
                )}
              </div>
              <p className="text-sm text-[var(--muted)]">
                {owned > 0 ? (
                  <>
                    {t.detail.net}: <b>{m(netPerHour(state, c.id, clock, multiplier))}</b> / h
                  </>
                ) : (
                  <>
                    {t.earns.replace("{n}", m(companyIncome(c.id) * INCOME_SPEED * multiplier))}
                  </>
                )}
              </p>
              {(threatened || campaign || rival) && (
                <div className="flex flex-wrap gap-1.5 text-xs font-bold">
                  {threatened && <span className="pill bg-[var(--danger)] px-2 py-0.5 text-white">⚠️ {t.events[ev!.def.id].title}</span>}
                  {rival && <span className="pill bg-[var(--danger)] px-2 py-0.5 text-white">🎯 {t.detail.rivalTitle}</span>}
                  {campaign && <span className="pill bg-[var(--accent-yellow)] px-2 py-0.5 text-[#16132b]">📣 {t.detail.campaign}</span>}
                </div>
              )}
              <div className="mt-auto flex flex-wrap gap-2">
                {owned > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelected((cur) => (cur === c.id ? null : c.id))}
                    className="btn-bouncy flex-1 bg-[var(--surface)] px-3 py-2 text-sm font-bold"
                    aria-expanded={selected === c.id}
                  >
                    ⚙️ {selected === c.id ? t.detail.close : t.detail.open}
                  </button>
                )}
                <button
                  type="button"
                  disabled={busy || locked || liveCash < price}
                  onClick={() => void act({ action: "buyCompany", id: c.id }, () => t.toast.bought)}
                  className="btn-bouncy flex-1 px-3 py-2 text-sm font-bold text-white disabled:opacity-45"
                  style={{ background: style.color }}
                >
                  {locked ? `🔒 ${t.locked1990}` : fill(t.buy, { n: m(price) })}
                </button>
              </div>
            </article>
          );
        })}
      </div>
      {selected && (state.companies[selected] ?? 0) > 0 && (
        <CompanyDetail
          id={selected}
          state={state}
          clock={clock}
          multiplier={multiplier}
          t={t}
          m={m}
          busy={busy}
          liveCash={liveCash}
          act={act}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}

function Slider({
  label,
  hint,
  value,
  settingKey,
  id,
  busy,
  onCommit,
  display,
}: {
  label: string;
  hint?: string;
  value: number;
  settingKey: SettingKey;
  id: CompanyId;
  busy: boolean;
  onCommit: (key: SettingKey, v: number) => void;
  display: (v: number) => string;
}) {
  // Posuvník při tažení ukazuje rozdělanou hodnotu; na server se pošle až po puštění.
  const [draft, setDraft] = useState<number | null>(null);
  const range = SETTING_RANGE[settingKey];
  const shown = draft ?? value;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={`${id}-${settingKey}`} className="font-bold">
          {label}
        </label>
        <span className="font-extrabold tabular-nums">{display(shown)}</span>
      </div>
      <input
        id={`${id}-${settingKey}`}
        type="range"
        min={range.min}
        max={range.max}
        step={range.step}
        value={shown}
        disabled={busy}
        onChange={(e) => setDraft(Number(e.target.value))}
        onPointerUp={() => {
          if (draft !== null) onCommit(settingKey, draft);
          setDraft(null);
        }}
        onKeyUp={() => {
          if (draft !== null) onCommit(settingKey, draft);
          setDraft(null);
        }}
        className="w-full accent-[var(--brand-500)]"
      />
      {hint && <p className="text-xs text-[var(--muted)]">{hint}</p>}
    </div>
  );
}

function CompanyDetail({ id, state, clock, multiplier, t, m, busy, liveCash, act, onClose }: Common & { id: CompanyId; onClose: () => void }) {
  const owned = state.companies[id] ?? 0;
  const s: CompanySetup = setupOf(state, id);
  const style = COMPANY_STYLE[id];
  const y = companyYield(state, id, clock);
  const gross = y.gross * INCOME_SPEED * multiplier;
  const costs = y.costs * INCOME_SPEED;
  const net = gross - costs;
  const maxStaff = owned * MAX_STAFF_PER_UNIT;
  const roles = rolesOf(s);
  const stockCap = stockCapacity(owned, state.phase);
  const stockFree = Math.max(0, Math.floor(stockCap - s.stock));
  const batch = batchPrice(state, id, clock);
  const ev = currentEvent(clock);
  const affected = !!ev && eventAffects(ev.def, id);
  const funded = !!ev && state.responses[id] === ev.window;
  const campaignLeft = s.marketingUntil - clock;
  const fundCost = fundPrice(state, id);
  const eventCopy = ev ? t.events[ev.def.id] : null;
  const rivalHere = currentRival(state, clock) === id;
  const level = researchLevel(state, id);
  const contractLeft = (state.contracts[id] ?? 0) - clock;
  const contractOn = contractActive(state, id, clock);
  const sellFor = sellPrice(state, id);

  // Náhled: stejný výpočet jako na serveru, jen s jiným rizikem.
  const netWithRisk = (risk: number) => {
    const alt: EconomyState = { ...state, setup: { ...state.setup, [id]: { ...s, risk } } };
    return netPerHour(alt, id, clock, multiplier);
  };
  const netPerHourNow = netPerHour(state, id, clock, multiplier);

  const commit = (key: SettingKey, v: number) => void act({ action: "setCompanySetting", id, field: key, value: v }, () => t.toast.level);

  const tasks = [
    { done: net >= 1000, text: t.detail.tasks.profit },
    { done: s.risk > 0.8, text: t.detail.tasks.risk },
    { done: state.responses[id] !== undefined, text: t.detail.tasks.fund },
    { done: s.staff >= 1, text: t.detail.tasks.staff },
  ];

  return (
    <section className="card mt-6 flex flex-col gap-6 p-5" style={{ borderTop: `6px solid ${style.color}` }}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <span aria-hidden>{style.emoji}</span> {t.companies[id]} · {fill(t.owned, { n: owned })}
        </h2>
        <button type="button" onClick={onClose} className="btn-bouncy bg-[var(--surface)] px-3 py-1.5 text-sm font-bold">
          {t.detail.close}
        </button>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <Stat label={t.detail.income} value={`+${m(gross)}`} />
        <Stat label={t.detail.costs} value={`−${m(costs)}`} />
        <Stat label={t.detail.net} value={`${net >= 0 ? "+" : "−"}${m(Math.abs(net))}`} strong />
      </div>

      <div className="flex flex-col gap-3">
        <Slider
          label={t.detail.price}
          value={s.price}
          settingKey="price"
          id={id}
          busy={busy}
          onCommit={commit}
          display={(v) => `${Math.round(v * 100)} %`}
          hint={t.detail.priceHint}
        />
        <Slider
          label={t.detail.output}
          value={s.output}
          settingKey="output"
          id={id}
          busy={busy}
          onCommit={commit}
          display={(v) => `${Math.round(v * 100)} %`}
          hint={t.detail.outputHint}
        />
        <Slider
          label={t.detail.risk}
          value={s.risk}
          settingKey="risk"
          id={id}
          busy={busy}
          onCommit={commit}
          display={(v) => `${Math.round(v * 100)} %`}
          hint={t.detail.riskHint}
        />
        <div className="rounded-xl bg-[var(--surface-muted)] p-3">
          <p className="mb-2 text-sm font-bold">{t.detail.previewTitle}</p>
          <div className="grid gap-1 text-sm">
            <Row label={t.detail.previewSafe} value={`${m(netWithRisk(SETTING_RANGE.risk.min))} / h`} />
            <Row label={t.detail.previewNow} value={`${m(netPerHourNow)} / h`} strong />
            <Row label={t.detail.previewBold} value={`${m(netWithRisk(SETTING_RANGE.risk.max))} / h`} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-xl border-2 border-[var(--edge)] p-3">
        <h3 className="font-bold">⚠️ {t.detail.eventTitle}</h3>
        {!ev || !eventCopy ? (
          <p className="text-sm text-[var(--muted)]">{t.detail.eventNone}</p>
        ) : (
          <>
            <p className="text-sm">
              <b>{eventCopy.title}</b> · {eventCopy.text}
            </p>
            <p className="text-xs text-[var(--muted)]">{fill(t.detail.eventEnds, { t: formatLeft(ev.endsAt - clock, t) })}</p>
            {!affected ? (
              <p className="text-sm text-[var(--muted)]">{t.detail.eventNoAction}</p>
            ) : isNegativeEvent(ev.def) ? (
              funded ? (
                <p className="text-sm font-semibold">✓ {t.detail.eventFunded}</p>
              ) : (
                <button
                  type="button"
                  disabled={busy || liveCash < fundCost}
                  onClick={() => void act({ action: "fundResponse", id }, () => t.toast.funded)}
                  className="btn-bouncy w-fit bg-[var(--accent-yellow)] px-3 py-2 text-sm font-bold text-[#16132b] disabled:opacity-45"
                >
                  {fill(t.detail.eventFund, { n: m(fundCost) })}
                </button>
              )
            ) : null}
          </>
        )}
      </div>

      <div className="flex flex-col gap-2 rounded-xl border-2 border-[var(--edge)] p-3">
        <h3 className="font-bold">🎯 {t.detail.rivalTitle}</h3>
        <p className="text-sm">{rivalHere ? t.detail.rivalNow : t.detail.rivalNone}</p>
        {rivalHere && <p className="text-xs text-[var(--muted)]">{t.detail.rivalShield}</p>}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <h3 className="font-bold">🔬 {t.detail.researchTitle}</h3>
          <p className="text-xs text-[var(--muted)]">{t.detail.researchHint}</p>
          {level >= MAX_RESEARCH ? (
            <p className="text-sm font-semibold">✓ {t.detail.researchMax}</p>
          ) : (
            <button
              type="button"
              disabled={busy || liveCash < researchPrice(state, id)}
              onClick={() => void act({ action: "researchCompany", id }, () => t.toast.researched)}
              className="btn-bouncy w-fit bg-[var(--brand-500)] px-3 py-2 text-sm font-bold text-white disabled:opacity-45"
            >
              {fill(t.detail.researchLevel, { n: level, max: MAX_RESEARCH })} · {fill(t.detail.researchGo, { n: m(researchPrice(state, id)) })}
            </button>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="font-bold">📝 {t.detail.contractTitle}</h3>
          <p className="text-xs text-[var(--muted)]">{t.detail.contractHint}</p>
          {contractOn ? (
            <p className="text-sm font-semibold">{fill(t.detail.contractRunning, { t: formatLeft(contractLeft, t) })}</p>
          ) : (
            <button
              type="button"
              disabled={busy || liveCash < contractPrice(state, id)}
              onClick={() => void act({ action: "signContract", id }, () => t.toast.contract)}
              className="btn-bouncy w-fit bg-[var(--brand-500)] px-3 py-2 text-sm font-bold text-white disabled:opacity-45"
            >
              {fill(t.detail.contractGo, { n: m(contractPrice(state, id)) })}
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-bold">💱 {t.detail.sellTitle}</h3>
        <p className="text-xs text-[var(--muted)]">{t.detail.sellHint}</p>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            if (window.confirm(t.detail.sellConfirm)) void act({ action: "sellCompany", id }, () => t.toast.companySold);
          }}
          className="btn-bouncy w-fit bg-[var(--surface)] px-3 py-2 text-sm font-bold disabled:opacity-45"
        >
          {fill(t.detail.sellGo, { n: m(sellFor) })}
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-bold">🚀 {t.detail.upgrade}</h3>
        <p className="text-xs text-[var(--muted)]">{t.detail.upgradeHint}</p>
        {s.upgraded ? (
          <p className="text-sm font-semibold">✓ {t.detail.upgradeDone}</p>
        ) : (
          <button
            type="button"
            disabled={busy || liveCash < upgradePrice(state, id)}
            onClick={() => void act({ action: "upgradeCompany", id }, () => t.toast.upgraded)}
            className="btn-bouncy w-fit bg-[var(--brand-500)] px-3 py-2 text-sm font-bold text-white disabled:opacity-45"
          >
            {fill(t.detail.upgradeBuy, { n: m(upgradePrice(state, id)) })}
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-bold">
          👥 {t.detail.staff} · {s.staff}/{maxStaff}
        </h3>
        <p className="text-xs text-[var(--muted)]">{t.detail.staffHint}</p>
        {clock < s.rookieUntil && <p className="text-xs font-semibold">{fill(t.detail.rookie, { t: formatLeft(s.rookieUntil - clock, t) })}</p>}
        {isSick(id, clock) && roles.producer > 0 && <p className="text-xs font-semibold">🤒 {t.detail.sick}</p>}
        <p className="text-xs">
          {t.detail.moraleLabel}: <b>{Math.round(y.morale * 100)} %</b>
        </p>
        {y.strike && <p className="pill w-fit bg-[var(--danger)] px-2 py-0.5 text-xs font-bold text-white">✊ {t.detail.strikeNow}</p>}
        {s.staff >= UNION_MIN_STAFF && (
          <div className="flex flex-col gap-1 rounded-xl bg-[var(--surface-muted)] p-3">
            <p className="text-sm font-bold">🤝 {t.detail.unionTitle}</p>
            <p className="text-xs text-[var(--muted)]">{t.detail.unionHint}</p>
            {s.unionUntil > clock ? (
              <p className="text-sm font-semibold">{fill(t.detail.unionActive, { t: formatLeft(s.unionUntil - clock, t) })}</p>
            ) : (
              <button
                type="button"
                disabled={busy}
                onClick={() => void act({ action: "unionDeal", id }, () => t.toast.union)}
                className="btn-bouncy w-fit bg-[var(--surface)] px-3 py-2 text-sm font-bold disabled:opacity-45"
              >
                {t.detail.unionGo}
              </button>
            )}
          </div>
        )}
        <ul className="flex flex-col gap-2">
          {STAFF_ROLES.map((role) => {
            const cap = ROLE_MAX[role];
            const full = s.staff >= maxStaff || (cap !== null && roles[role] >= cap);
            const wage = Math.round(STAFF_BASE_WAGE * ROLE_WAGE[role]);
            return (
              <li key={role} className="flex flex-wrap items-center gap-2">
                <span className="min-w-[9rem] font-bold">
                  {t.detail.roles[role]} · {roles[role]}
                </span>
                <button
                  type="button"
                  disabled={busy || roles[role] <= 0}
                  onClick={() => void act({ action: "hireStaff", id, delta: -1, role }, () => t.toast.fired)}
                  className="btn-bouncy bg-[var(--surface)] px-3 py-1.5 text-sm font-bold disabled:opacity-45"
                >
                  − {t.detail.fire}
                </button>
                <button
                  type="button"
                  disabled={busy || full || liveCash < wage}
                  onClick={() => void act({ action: "hireStaff", id, delta: 1, role }, () => t.toast.hired)}
                  className="btn-bouncy bg-[var(--brand-500)] px-3 py-1.5 text-sm font-bold text-white disabled:opacity-45"
                >
                  {full ? (cap !== null && roles[role] >= cap ? t.detail.roleFull : t.detail.staffFull) : `+ ${fill(t.detail.hire, { n: m(wage) })}`}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-bold">📦 {t.detail.stockTitle}</h3>
        <p className="text-xs text-[var(--muted)]">{fill(t.detail.stockHint, { h: INPUT_BATCH_HOURS })}</p>
        <p className="text-sm">
          <b>{fill(t.detail.stockLevel, { s: Math.floor(s.stock), c: stockCap })}</b>
        </p>
        {s.stock <= 0 && <p className="pill w-fit bg-[var(--danger)] px-2 py-0.5 text-xs font-bold text-white">⚠️ {fill(t.detail.stockEmpty, { p: Math.round(NO_STOCK_OUTPUT * 100) })}</p>}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy || stockFree < 1 || liveCash < batch}
            onClick={() => void act({ action: "buyStock", id, amount: 1 }, () => t.toast.stock)}
            className="btn-bouncy bg-[var(--brand-500)] px-3 py-2 text-sm font-bold text-white disabled:opacity-45"
          >
            {stockFree < 1 ? t.detail.stockFull : fill(t.detail.stockBuy, { n: 1, p: m(batch) })}
          </button>
          <button
            type="button"
            disabled={busy || stockFree < 5 || liveCash < batch * 5}
            onClick={() => void act({ action: "buyStock", id, amount: 5 }, () => t.toast.stock)}
            className="btn-bouncy bg-[var(--surface)] px-3 py-2 text-sm font-bold disabled:opacity-45"
          >
            {fill(t.detail.stockBuy, { n: 5, p: m(batch * 5) })}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-bold">📣 {t.detail.campaign}</h3>
        <p className="text-xs text-[var(--muted)]">{t.detail.campaignHint}</p>
        <button
          type="button"
          disabled={busy || campaignLeft > 0 || liveCash < campaignPrice(state, id)}
          onClick={() => void act({ action: "runCampaign", id }, () => t.toast.campaign)}
          className="btn-bouncy w-fit bg-[var(--brand-500)] px-3 py-2 text-sm font-bold text-white disabled:opacity-45"
        >
          {campaignLeft > 0 ? fill(t.detail.campaignRunning, { t: formatLeft(campaignLeft, t) }) : fill(t.detail.campaignGo, { n: m(campaignPrice(state, id)) })}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <h3 className="font-bold">📖 {t.detail.lessonsTitle}</h3>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm">
            {t.detail.rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="font-bold">✅ {t.detail.tasksTitle}</h3>
          <ul className="flex flex-col gap-2 text-sm">
            {tasks.map((task) => (
              <li key={task.text} className="flex items-start gap-2">
                <span
                  className={`pill mt-0.5 shrink-0 px-2 py-0.5 text-xs font-bold ${task.done ? "bg-[var(--accent-green)] text-[#16132b]" : "bg-[var(--surface-muted)]"}`}
                >
                  {task.done ? t.detail.taskDone : t.detail.taskTodo}
                </span>
                <span>{task.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-xl bg-[var(--surface-muted)] p-3">
      <p className="text-xs text-[var(--muted)]">{label}</p>
      <p className={`tabular-nums ${strong ? "text-lg font-extrabold" : "font-bold"}`}>{value}</p>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-3 ${strong ? "font-bold" : ""}`}>
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
