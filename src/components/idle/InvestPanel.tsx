"use client";

import { useState } from "react";
import {
  ARB_FEE,
  ASSETS,
  ASSET_CATEGORIES,
  assetPrice,
  isLocked,
  type AssetCategoryId,
  type AssetId,
  type EconomyState,
  type NewsItem,
  type Order,
  type Rates,
} from "@/lib/idle/economy";
import type { EconomyText } from "@/i18n/economy";
import { fill, formatLeft, type Payload } from "./CompanyPanel";
import { PriceChart, type ChartPoint } from "./PriceChart";

type Act = (body: Record<string, unknown>, okText?: (p: Payload) => string) => Promise<void>;
type OrderKind = "buyBelow" | "sellBelow" | "sellAbove" | "buyAbove";

type Props = {
  state: EconomyState;
  clock: number;
  liveCash: number;
  netWorth: number;
  rates: Rates;
  arbitrage: { spread: number; limit: number };
  assetEvent: { id: string; endsAt: number } | null;
  m: (n: number) => string;
  t: EconomyText;
  busy: boolean;
  act: Act;
};

const CAT_EMOJI: Record<AssetCategoryId, string> = {
  crypto: "🪙", realestate: "🏠", stocks: "📈", metals: "🥇", bonds: "📜", funds: "🧺", startups: "🚀",
};

// Štítek rizika podle výkyvu ceny (ASSETS.vol): nízké do 5 %, střední do 20 %, jinak vysoké.
const riskKey = (vol: number): "riskLow" | "riskMid" | "riskHigh" => (vol <= 0.05 ? "riskLow" : vol <= 0.2 ? "riskMid" : "riskHigh");

// Krátký zápis hodnoty pro osu grafu (plná částka je u kurzoru).
function axisValue(v: number): string {
  const a = Math.abs(v);
  if (a >= 1e6) return `${(v / 1e6).toFixed(1)} M`;
  if (a >= 1e4) return `${Math.round(v / 1e3)} k`;
  if (a >= 100) return String(Math.round(v));
  return v.toFixed(2);
}

// Podrobný graf ceny za posledních 6 hodin: bod každých 5 minut, poslední bod je živá cena.
const SPARK_SPAN = 6 * 60 * 60_000;
const SPARK_STEP = 5 * 60_000;
function priceHistory(id: AssetId, now: number, origin: number): ChartPoint[] {
  const n = SPARK_SPAN / SPARK_STEP;
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = now - (n - i) * SPARK_STEP;
    return { t, v: assetPrice(id, t, origin) };
  });
}

const ORDER_KINDS: OrderKind[] = ["buyBelow", "sellBelow", "sellAbove", "buyAbove"];
type KindKey = "kindBuyBelow" | "kindSellBelow" | "kindSellAbove" | "kindBuyAbove";
const KIND_KEY: Record<OrderKind, KindKey> = { buyBelow: "kindBuyBelow", sellBelow: "kindSellBelow", sellAbove: "kindSellAbove", buyAbove: "kindBuyAbove" };
const orderKindOf = (o: Pick<Order, "side" | "when">): OrderKind =>
  o.side === "buy" ? (o.when === "below" ? "buyBelow" : "buyAbove") : o.when === "below" ? "sellBelow" : "sellAbove";
const orderParams = (k: OrderKind) => ({ side: k.startsWith("buy") ? "buy" : "sell", when: k.endsWith("Below") ? "below" : "above" });

export function InvestPanel({ state, clock, liveCash, netWorth, rates, arbitrage, assetEvent, m, t, busy, act }: Props) {
  const ti = t.inv;
  const [cat, setCat] = useState<AssetCategoryId | "all">("all");
  const [orderFor, setOrderFor] = useState<AssetId | null>(null);
  const [orderKind, setOrderKind] = useState<OrderKind>("buyBelow");
  const [orderPrice, setOrderPrice] = useState("");
  const [orderAmount, setOrderAmount] = useState("");
  const [orderShare, setOrderShare] = useState(1);

  const priceOf = (id: AssetId) => assetPrice(id, clock, state.startedAt);
  const value = ASSETS.reduce((sum, a) => sum + (state.holdings[a.id] ?? 0) * priceOf(a.id), 0);
  const invested = ASSETS.reduce((sum, a) => sum + (state.holdings[a.id] ?? 0) * (state.cost[a.id] ?? priceOf(a.id)), 0);
  const pl = value - invested;
  const chart = [...state.history.map((h) => ({ t: h.t, v: h.w })), { t: clock, v: netWorth }].filter((p) => p.t <= clock);

  const openOrder = (id: AssetId) => {
    const held = (state.holdings[id] ?? 0) > 0;
    const kind: OrderKind = held ? "sellBelow" : "buyBelow";
    setOrderFor(id);
    setOrderKind(kind);
    setOrderPrice((priceOf(id) * (kind.endsWith("Below") ? 0.95 : 1.05)).toFixed(2));
    setOrderAmount(String(Math.max(1, Math.floor(liveCash / 4))));
    setOrderShare(1);
  };
  const pickKind = (id: AssetId, kind: OrderKind) => {
    setOrderKind(kind);
    setOrderPrice((priceOf(id) * (kind.endsWith("Below") ? 0.95 : 1.05)).toFixed(2));
  };
  const placeOrder = (id: AssetId) => {
    const p = orderParams(orderKind);
    void act(
      {
        action: "placeOrder",
        id,
        side: p.side,
        when: p.when,
        price: Number(orderPrice),
        amount: Number(orderAmount),
        share: orderShare,
      },
      () => ti.orderDone,
    );
    setOrderFor(null);
  };

  const shownAssets = ASSETS.filter((a) => cat === "all" || a.cat === cat);
  const newsLine = (n: NewsItem) =>
    `${fill(ti.newsKinds[n.kind] ?? "", { a: t.assets[n.asset], n: m(n.amount) })} · ${fill(ti.ago, { t: formatLeft(Math.max(0, clock - n.t), t) })}`;

  return (
    <section className="flex flex-col gap-5">
      <p className="text-sm text-[var(--muted)]">{t.investHint}</p>

      {assetEvent && (
        <p className="card flex flex-wrap items-center justify-between gap-2 p-3 text-sm font-semibold">
          <span>📰 {fill(ti.eventNow, { name: ti.events[assetEvent.id] ?? assetEvent.id })}</span>
          <span className="text-[var(--muted)]">{fill(ti.eventEnds, { t: formatLeft(Math.max(0, assetEvent.endsAt - clock), t) })}</span>
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-xs text-[var(--muted)]">{ti.portfolio}</p>
          <p className="text-xl font-bold">{m(value)}</p>
          <p className="text-xs text-[var(--muted)]">
            {ti.invested}: {m(invested)}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-[var(--muted)]">{ti.profit}</p>
          <p className={`text-xl font-bold ${pl >= 0 ? "text-[var(--accent-green)]" : "text-[var(--danger)]"}`}>
            {pl >= 0 ? "+" : "−"}
            {m(Math.abs(pl))}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-[var(--muted)]">{ti.dividends}</p>
          <p className="text-xl font-bold">{m(rates.dividends)}</p>
        </div>
      </div>

      <article className="card p-4">
        <h3 className="mb-2 font-bold">📈 {ti.chart}</h3>
        {chart.length < 2 ? (
          <p className="text-sm text-[var(--muted)]">{ti.chartEmpty}</p>
        ) : (
          <PriceChart
            points={chart}
            from={chart[0].t}
            to={clock}
            label={ti.chart}
            format={m}
            axisFormat={axisValue}
            timeLabel={(tt) => (clock - tt < 60_000 ? ti.chartNow : fill(ti.chartFrom, { t: formatLeft(clock - tt, t) }))}
            leftLabel={fill(ti.chartFrom, { t: formatLeft(clock - chart[0].t, t) })}
            rightLabel={ti.chartNow}
          />
        )}
      </article>

      <div role="group" aria-label={ti.all} className="flex flex-wrap gap-2">
        {(["all", ...ASSET_CATEGORIES] as const).map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={cat === id}
            onClick={() => setCat(id)}
            className={`btn-bouncy px-3 py-1.5 text-sm font-bold ${cat === id ? "bg-[var(--brand-500)] text-white" : "bg-[var(--surface)]"}`}
          >
            {id === "all" ? ti.all : `${CAT_EMOJI[id]} ${t.assetCategories[id]}`}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shownAssets.map((a) => {
          const price = priceOf(a.id);
          const prev = assetPrice(a.id, clock - 3_600_000, state.startedAt);
          const hist = priceHistory(a.id, clock, state.startedAt);
          const cost = state.cost[a.id];
          const qty = state.holdings[a.id] ?? 0;
          const locked = isLocked(state, "asset", a.id);
          const value = qty * price;
          const pl = qty > 0 ? value - qty * (state.cost[a.id] ?? price) : 0;
          const chunk = Math.max(1, Math.floor(liveCash / 4));
          const formOpen = orderFor === a.id;
          return (
            <article key={a.id} className={`card flex flex-col gap-2 p-4 ${locked ? "opacity-55" : ""}`}>
              <h3 className="flex items-center justify-between font-bold">
                <span>{t.assets[a.id]}</span>
                <span className={`text-sm ${price >= prev ? "text-[var(--accent-green)]" : "text-[var(--danger)]"}`}>{price >= prev ? "▲" : "▼"}</span>
              </h3>
              <p className="text-sm">
                {t.price}: <b>{m(price)}</b>
              </p>
              <PriceChart
                points={hist}
                from={clock - SPARK_SPAN}
                to={clock}
                label={t.trend6h}
                format={m}
                axisFormat={axisValue}
                timeLabel={(tt) => (clock - tt < 60_000 ? ti.chartNow : fill(ti.chartFrom, { t: formatLeft(clock - tt, t) }))}
                leftLabel={fill(ti.chartFrom, { t: formatLeft(SPARK_SPAN, t) })}
                rightLabel={ti.chartNow}
                reference={qty > 0 && cost ? { v: cost, label: ti.chartCost } : undefined}
              />
              <p className="flex flex-wrap gap-x-3 text-xs text-[var(--muted)]">
                <span>
                  {t.risk}: <b>{t[riskKey(a.vol)]}</b>
                </span>
                {a.yield > 0 && <span>{fill(t.yieldPerHour, { v: `${(a.yield * 100).toFixed(2)} %` })}</span>}
              </p>
              {qty > 0 && (
                <p className="text-sm text-[var(--muted)]">
                  {fill(t.holding, { v: m(value) })} · {ti.profit}: {pl >= 0 ? "+" : "−"}
                  {m(Math.abs(pl))}
                </p>
              )}
              {locked ? (
                <p className="text-sm font-semibold">🔒 {t.locked1990}</p>
              ) : (
                <>
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
                      onClick={() => void act({ action: "sellAsset", id: a.id, share: 0.5 }, (p) => fill(t.toast.sold, { n: m(p.gained?.cash ?? 0) }))}
                      className="btn-bouncy bg-[var(--surface)] px-3 py-2 text-sm font-bold disabled:opacity-45"
                    >
                      {t.sell}
                    </button>
                    <button
                      type="button"
                      disabled={busy || qty <= 0}
                      onClick={() => void act({ action: "sellAsset", id: a.id, share: 1 }, (p) => fill(t.toast.sold, { n: m(p.gained?.cash ?? 0) }))}
                      className="btn-bouncy bg-[var(--surface)] px-3 py-2 text-sm font-bold disabled:opacity-45"
                    >
                      {t.sellAll}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      aria-expanded={formOpen}
                      onClick={() => (formOpen ? setOrderFor(null) : openOrder(a.id))}
                      className="btn-bouncy bg-[var(--accent-yellow)] px-3 py-2 text-sm font-bold text-[#16132b] disabled:opacity-45"
                    >
                      {ti.orderButton}
                    </button>
                  </div>
                  {formOpen && (
                    <div className="flex flex-col gap-2 rounded-lg bg-[var(--surface-muted)] p-3 text-sm">
                      <div className="flex flex-wrap gap-1.5">
                        {ORDER_KINDS.map((k) => {
                          const isSell = k.startsWith("sell");
                          const disabled = isSell && qty <= 0;
                          return (
                            <button
                              key={k}
                              type="button"
                              disabled={disabled}
                              aria-pressed={orderKind === k}
                              onClick={() => pickKind(a.id, k)}
                              className={`rounded-full px-2.5 py-1 text-xs font-bold disabled:opacity-40 ${orderKind === k ? "bg-[var(--brand-500)] text-white" : "bg-[var(--surface)]"}`}
                            >
                              {ti[KIND_KEY[k]]}
                            </button>
                          );
                        })}
                      </div>
                      <label className="flex flex-col gap-1 font-bold">
                        {ti.orderPrice}
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={orderPrice}
                          onChange={(e) => setOrderPrice(e.target.value)}
                          className="rounded-lg border-2 border-[var(--edge)] bg-[var(--surface)] px-2 py-1.5 font-normal"
                        />
                      </label>
                      {orderKind.startsWith("buy") ? (
                        <label className="flex flex-col gap-1 font-bold">
                          {ti.orderAmount}
                          <input
                            type="number"
                            min="1"
                            step="any"
                            value={orderAmount}
                            onChange={(e) => setOrderAmount(e.target.value)}
                            className="rounded-lg border-2 border-[var(--edge)] bg-[var(--surface)] px-2 py-1.5 font-normal"
                          />
                        </label>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <span className="font-bold">{ti.orderShare}</span>
                          <div className="flex gap-1.5">
                            {[
                              [1, ti.orderShareAll],
                              [0.5, ti.orderShareHalf],
                            ].map(([v, label]) => (
                              <button
                                key={String(v)}
                                type="button"
                                aria-pressed={orderShare === v}
                                onClick={() => setOrderShare(v as number)}
                                className={`rounded-full px-2.5 py-1 text-xs font-bold ${orderShare === v ? "bg-[var(--brand-500)] text-white" : "bg-[var(--surface)]"}`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      <button
                        type="button"
                        disabled={busy || !(Number(orderPrice) > 0)}
                        onClick={() => placeOrder(a.id)}
                        className="btn-bouncy bg-[var(--brand-500)] px-3 py-2 font-bold text-white disabled:opacity-45"
                      >
                        {ti.orderPlace}
                      </button>
                    </div>
                  )}
                </>
              )}
            </article>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="card flex flex-col gap-3 p-4">
          <h3 className="font-bold">🎯 {ti.orders}</h3>
          <p className="text-xs text-[var(--muted)]">{ti.ordersHint}</p>
          {state.orders.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">{ti.ordersEmpty}</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {state.orders.map((o) => (
                <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[var(--surface-muted)] p-2.5 text-sm">
                  <span className="min-w-0">
                    <b>{t.assets[o.asset]}</b>
                    <span className="block text-xs text-[var(--muted)]">
                      {fill(ti.orderLine, { k: ti[KIND_KEY[orderKindOf(o)]], p: m(o.price) })}
                      {" · "}
                      {o.side === "buy" ? m(o.amount) : `${Math.round(o.share * 100)} %`}
                    </span>
                  </span>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void act({ action: "cancelOrder", id: o.id })}
                    className="btn-bouncy bg-[var(--surface)] px-3 py-1.5 text-xs font-bold disabled:opacity-45"
                  >
                    {ti.cancel}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="card flex flex-col gap-3 p-4">
          <h3 className="font-bold">🗞️ {ti.news}</h3>
          {state.news.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">{ti.newsEmpty}</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {[...state.news].reverse().slice(0, 8).map((n, i) => (
                <li key={`${n.t}-${n.asset}-${i}`} className="rounded-lg bg-[var(--surface-muted)] p-2.5">
                  {newsLine(n)}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-auto text-xs text-[var(--muted)]">{ti.startupRound}</p>
        </article>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article className="card flex flex-col gap-2 p-4">
          <h3 className="font-bold">⚖️ {t.arbitrage}</h3>
          <p className="text-xs text-[var(--muted)]">{t.arbitrageHint}</p>
          <p className="text-sm font-semibold">
            {fill(t.spread, { n: (arbitrage.spread * 100).toFixed(2) })} <span className="text-[var(--muted)]">(−{(ARB_FEE * 100).toFixed(1)} %)</span>
          </p>
          <button
            type="button"
            disabled={busy || clock < state.arbReadyAt || liveCash < 1}
            onClick={() => void act({ action: "arbitrage", amount: Math.min(liveCash, arbitrage.limit) }, (p) => fill(t.toast.profit, { n: m(p.gained?.profit ?? 0) }))}
            className="btn-bouncy mt-auto bg-[var(--accent-yellow)] px-3 py-2 text-sm font-bold text-[#16132b] disabled:opacity-45"
          >
            {clock < state.arbReadyAt
              ? fill(t.arbitrageWait, { t: formatLeft(state.arbReadyAt - clock, t) })
              : fill(t.arbitrageGo, { n: m(Math.min(liveCash, arbitrage.limit)) })}
          </button>
        </article>
      </div>
    </section>
  );
}
