"use client";

import { useCallback, useEffect, useState } from "react";
import { Preview } from "@/components/ShopView";
import { getPlayerMarketText } from "@/i18n/player-market";
import { notifyAccountChanged } from "@/lib/account-events";
import { MARKET_FEE, MAX_LISTINGS, MIN_PRICE, maxPrice, sellerGets, tradable, type MarketOffer } from "@/lib/player-market";
import type { Locale } from "@/i18n/config";

// Trh mezi hráči (uvnitř okna obchodu): nabídky ostatních, vlastní nabídky a vystavení věci za body.
type Shop = { owned: string[]; equipped: { avatar: string | null; title: string | null; frame: string | null; banner: string | null }; points: number } | null;
type Tab = "offers" | "mine" | "sell";

export function PlayerMarket({ locale, onChange }: { locale: Locale; onChange?: () => void }) {
  const t = getPlayerMarketText(locale);
  const [tab, setTab] = useState<Tab>("offers");
  const [offers, setOffers] = useState<MarketOffer[]>([]);
  const [shop, setShop] = useState<Shop>(null);
  const [loggedIn, setLoggedIn] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [sell, setSell] = useState<{ itemId: string; price: number } | null>(null);

  const load = useCallback(async () => {
    const [o, s] = await Promise.all([
      fetch("/api/trh").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch("/api/shop").then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ]);
    if (o?.offers) setOffers(o.offers);
    if (s) {
      setLoggedIn(!!s.loggedIn);
      if (s.loggedIn) setShop({ owned: s.owned, equipped: s.equipped, points: s.points });
    }
  }, []);
  useEffect(() => {
    void load(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [load]);

  async function act(body: object, ok: string) {
    setBusy(true);
    const res = await fetch("/api/trh", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
    const data = res ? await res.json().catch(() => null) : null;
    setBusy(false);
    if (data?.ok) {
      setMsg(ok);
      setSell(null);
      notifyAccountChanged();
      onChange?.();
      await load();
    } else setMsg(t.errors[data?.error] ?? t.errors.x);
  }

  const mine = offers.filter((o) => o.mine);
  const others = offers.filter((o) => !o.mine);
  const worn = shop ? Object.values(shop.equipped) : [];
  const sellable = (shop?.owned ?? []).map((id) => tradable(id)).filter((i) => i && !worn.includes(i.ref)) as NonNullable<ReturnType<typeof tradable>>[];
  const avatar = shop?.equipped.avatar ?? null;

  const card = "flex flex-col gap-2 rounded-2xl border-2 border-[var(--edge)] bg-[var(--surface)] p-2";
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-[var(--muted)]">{t.intro}</p>
      <div className="flex gap-1">
        {(["offers", "mine", "sell"] as Tab[]).map((k) => (
          <button key={k} type="button" onClick={() => setTab(k)} className={`pill px-3 py-1.5 text-sm font-bold ${tab === k ? "bg-[var(--accent-yellow)] text-[#16132b]" : "bg-[var(--surface-muted)]"}`}>
            {t.tabs[k]}
            {k === "mine" && mine.length ? ` (${mine.length})` : ""}
          </button>
        ))}
      </div>
      {msg && <p className="text-sm font-bold">{msg}</p>}
      {!loggedIn && <p className="text-sm font-semibold">{t.login}</p>}

      {tab === "offers" &&
        (others.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">{t.empty}</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {others.map((o) => {
              const item = tradable(o.itemId)!;
              const have = shop?.owned.includes(item.id);
              return (
                <div key={o.id} className={card}>
                  <Preview item={item} locale={locale} avatar={avatar} />
                  <p className="truncate text-sm font-bold">{item.names[locale]}</p>
                  <p className="truncate text-xs text-[var(--muted)]">{t.seller.replace("{name}", o.seller)}</p>
                  <button
                    type="button"
                    disabled={busy || !loggedIn || have || (shop?.points ?? 0) < o.price}
                    onClick={() => act({ action: "buy", id: o.id, seller: o.sellerId }, t.done.buy)}
                    className="btn-bouncy btn-primary px-3 py-1.5 text-sm font-bold disabled:opacity-50"
                  >
                    {have ? t.owned : `${t.buy} · ${o.price} 🪙`}
                  </button>
                </div>
              );
            })}
          </div>
        ))}

      {tab === "mine" &&
        (mine.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">{t.mineEmpty}</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {mine.map((o) => {
              const item = tradable(o.itemId)!;
              return (
                <div key={o.id} className={card}>
                  <Preview item={item} locale={locale} avatar={avatar} />
                  <p className="truncate text-sm font-bold">
                    {item.names[locale]} · {o.price} 🪙
                  </p>
                  <button type="button" disabled={busy} onClick={() => act({ action: "cancel", id: o.id }, t.done.cancel)} className="btn-bouncy bg-[var(--surface-muted)] px-3 py-1.5 text-sm font-bold disabled:opacity-50">
                    {t.cancel}
                  </button>
                </div>
              );
            })}
          </div>
        ))}

      {tab === "sell" && (
        <>
          <p className="text-xs text-[var(--muted)]">
            {t.fee.replace("{p}", String(Math.round(MARKET_FEE * 100)))} {t.limit.replace("{n}", String(MAX_LISTINGS))}
          </p>
          {sellable.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">{t.sellEmpty}</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {sellable.map((item) => {
                const on = sell?.itemId === item.id;
                return (
                  <div key={item.id} className={card}>
                    <button type="button" onClick={() => setSell({ itemId: item.id, price: item.price })} className="text-left">
                      <Preview item={item} locale={locale} avatar={avatar} />
                      <p className="mt-1 truncate text-sm font-bold">{item.names[locale]}</p>
                    </button>
                    {on && sell && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold">
                          {t.price}: {sell.price} 🪙
                          <input type="range" min={MIN_PRICE} max={maxPrice(item)} step={5} value={sell.price} onChange={(e) => setSell({ itemId: item.id, price: Number(e.target.value) })} className="w-full" />
                        </label>
                        <p className="text-xs text-[var(--muted)]">{t.youGet.replace("{n}", String(sellerGets(sell.price)))}</p>
                        <button type="button" disabled={busy || mine.length >= MAX_LISTINGS} onClick={() => act({ action: "list", itemId: item.id, price: sell.price }, t.done.list)} className="btn-bouncy btn-primary px-3 py-1.5 text-sm font-bold disabled:opacity-50">
                          {t.list}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
