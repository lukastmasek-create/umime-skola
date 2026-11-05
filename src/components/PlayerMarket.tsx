"use client";

import { useCallback, useEffect, useState } from "react";
import { Preview } from "@/components/ShopView";
import { SHOP_ITEMS, type ShopItem } from "@/lib/shop";
import { getPlayerMarketText } from "@/i18n/player-market";
import { notifyAccountChanged } from "@/lib/account-events";
import { MARKET_FEE, MARKET_KINDS, MAX_LISTINGS, MIN_PRICE, maxPrice, sellerGets, tradable, type MarketOffer } from "@/lib/player-market";
import type { Locale } from "@/i18n/config";

// Trh mezi hráči: nabídky ostatních, vlastní nabídky, prodej / výměna věcí a historie. Vše dělené na kategorie.
type Shop = { owned: string[]; equipped: { avatar: string | null; title: string | null; frame: string | null; banner: string | null }; points: number } | null;
type Tab = "offers" | "mine" | "sell" | "history";
type Cat = "all" | (typeof MARKET_KINDS)[number];
type Row = { id: string; amount: number; reason: string; createdAt: string };
type Sort = "new" | "low" | "high";
type Draft = { itemId: string; price: number; want: string | null };

const CAT_ICON: Record<Cat, string> = { all: "", avatar: "", title: "", frame: "", banner: "" };
const CATS: Cat[] = ["all", ...MARKET_KINDS];

export function PlayerMarket({ locale, onChange }: { locale: Locale; onChange?: () => void }) {
  const t = getPlayerMarketText(locale);
  const [tab, setTab] = useState<Tab>("offers");
  const [cat, setCat] = useState<Cat>("all");
  const [sort, setSort] = useState<Sort>("new");
  const [offers, setOffers] = useState<MarketOffer[]>([]);
  const [shop, setShop] = useState<Shop>(null);
  const [loaded, setLoaded] = useState(false);
  const [loggedIn, setLoggedIn] = useState(true);
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [sell, setSell] = useState<Draft | null>(null);

  const load = useCallback(async () => {
    const [o, s, h] = await Promise.all([
      fetch("/api/trh").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch("/api/shop").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch("/api/shop?history=1").then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ]);
    if (o?.offers) setOffers(o.offers);
    if (h?.history) setRows((h.history as Row[]).filter((x) => x.reason.startsWith("shop:market-")));
    if (s) {
      setLoggedIn(!!s.loggedIn);
      if (s.loggedIn) setShop({ owned: s.owned, equipped: s.equipped, points: s.points });
    }
    setLoaded(true);
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
      setMsg({ text: ok, ok: true });
      setSell(null);
      notifyAccountChanged();
      onChange?.();
      await load();
    } else setMsg({ text: t.errors[data?.error] ?? t.errors.x, ok: false });
  }

  const mine = offers.filter((o) => o.mine);
  const worn = shop ? Object.values(shop.equipped) : [];
  const sellable = (shop?.owned ?? []).map((id) => tradable(id)).filter((i) => i && !worn.includes(i.ref)) as ShopItem[];
  const avatar = shop?.equipped.avatar ?? null;
  const catalog = SHOP_ITEMS.filter((i) => (MARKET_KINDS as readonly string[]).includes(i.kind));
  // věci, které mohu nabídnout při výměně: vlastním a nenosím
  const canGive = new Set(sellable.map((i) => i.id));

  // Kategorie: filtr i počty podle toho, co se v záložce zrovna zobrazuje.
  const inCat = (itemId: string) => cat === "all" || tradable(itemId)?.kind === cat;
  const pool: string[] = tab === "offers" ? offers.filter((o) => !o.mine).map((o) => o.itemId) : tab === "mine" ? mine.map((o) => o.itemId) : sellable.map((i) => i.id);
  const countIn = (c: Cat) => pool.filter((id) => c === "all" || tradable(id)?.kind === c).length;
  const others = offers
    .filter((o) => !o.mine && inCat(o.itemId))
    .sort((a, b) => (sort === "low" ? a.price - b.price : sort === "high" ? b.price - a.price : b.at.localeCompare(a.at)));
  const mineShown = mine.filter((o) => inCat(o.itemId));
  const sellShown = sellable.filter((i) => cat === "all" || i.kind === cat);
  const draftItem = sell ? tradable(sell.itemId) : null;

  const card = "flex flex-col overflow-hidden rounded-2xl border-2 border-[var(--edge)] bg-[var(--surface)] shadow-[0_3px_0_var(--shadow-ink)] transition-transform hover:-translate-y-0.5";
  const grid = "grid grid-cols-2 gap-3 sm:grid-cols-3";
  const badge = "inline-flex items-center rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-[11px] font-bold text-[var(--muted)]";
  const price = (n: number) => (
    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-yellow)] px-2.5 py-0.5 text-sm font-extrabold text-[#16132b]">{n}</span>
  );
  const empty = (text: string) => (
    <div className="rounded-2xl border-2 border-dashed border-[var(--edge)] px-4 py-10 text-center text-sm text-[var(--muted)]">{text}</div>
  );
  const catLabel = (c: Cat) => t.cats[c];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-sm text-[var(--muted)]">{t.intro}</p>
        {shop && <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-[var(--edge)] bg-[var(--surface)] px-3 py-1.5 text-sm font-extrabold">{t.hist.balance.replace("{n}", String(shop.points))}</span>}
      </div>

      <div role="tablist" className="flex gap-1 rounded-2xl bg-[var(--surface-muted)] p-1">
        {(["offers", "mine", "sell", "history"] as Tab[]).map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={tab === k}
            onClick={() => {
              setTab(k);
              setMsg(null);
            }}
            className={`flex-1 rounded-xl px-2 py-2 text-sm font-bold transition-colors sm:px-4 ${tab === k ? "bg-[var(--surface)] shadow-sm ring-2 ring-[var(--edge)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
          >
            {t.tabs[k]}
            {k === "mine" && mine.length > 0 && <span className="ml-1.5 rounded-full bg-[var(--brand-500)] px-1.5 py-0.5 text-[11px] text-white">{mine.length}</span>}
          </button>
        ))}
      </div>

      {msg && (
        <p role="status" className={`rounded-xl px-3 py-2 text-sm font-bold ${msg.ok ? "bg-emerald-100 text-emerald-900" : "bg-rose-100 text-rose-900"}`}>
          {msg.ok ? "" : ""}
          {msg.text}
        </p>
      )}
      {!loggedIn && <p className="rounded-xl bg-[var(--surface-muted)] px-3 py-2 text-sm font-semibold">{t.login}</p>}

      {tab !== "history" && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-1 flex-wrap gap-1.5" role="group">
            {CATS.map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={cat === c}
                onClick={() => setCat(c)}
                className={`inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1 text-sm font-bold transition-colors ${cat === c ? "border-[var(--edge)] bg-[var(--accent-yellow)] text-[#16132b]" : "border-transparent bg-[var(--surface-muted)] hover:border-[var(--edge)]"}`}
              >
                <span aria-hidden>{CAT_ICON[c]}</span>
                {catLabel(c)}
                <span className="text-xs opacity-70">{countIn(c)}</span>
              </button>
            ))}
          </div>
          {tab === "offers" && (
            <select aria-label="sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="rounded-xl border-2 border-[var(--edge)] bg-[var(--surface)] px-2 py-1.5 text-sm font-semibold">
              <option value="new">{t.more.sortNew}</option>
              <option value="low">{t.more.sortLow}</option>
              <option value="high">{t.more.sortHigh}</option>
            </select>
          )}
        </div>
      )}

      {tab === "offers" &&
        (!loaded ? (
          <div className={grid} aria-busy>
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-52 animate-pulse rounded-2xl bg-[var(--surface-muted)]" />
            ))}
          </div>
        ) : others.length === 0 ? (
          empty(offers.some((o) => !o.mine) ? t.more.emptyCat : t.empty)
        ) : (
          <div className={grid}>
            {others.map((o) => {
              const item = tradable(o.itemId)!;
              const have = shop?.owned.includes(item.id);
              const want = o.wantId ? tradable(o.wantId) : null;
              return (
                <article key={o.id} className={card}>
                  <Preview item={item} locale={locale} avatar={avatar} />
                  <div className="flex flex-1 flex-col gap-1.5 p-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="truncate text-sm font-extrabold">{item.names[locale]}</h3>
                      <span className={badge}>{CAT_ICON[item.kind as Cat]}</span>
                    </div>
                    <p className="flex items-center gap-1.5 truncate text-xs text-[var(--muted)]">
                      <span aria-hidden className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[var(--brand-500)] text-[10px] font-bold text-white">
                        {o.seller.slice(0, 1).toUpperCase()}
                      </span>
                      <span className="truncate">{t.seller.replace("{name}", o.seller)}</span>
                    </p>
                    <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                      {want ? <span className="truncate text-xs font-bold">{want.names[locale]}</span> : price(o.price)}
                    </div>
                    <button
                      type="button"
                      disabled={busy || !loggedIn || have || (want ? !canGive.has(want.id) : (shop?.points ?? 0) < o.price)}
                      onClick={() => act({ action: "buy", id: o.id, seller: o.sellerId }, want ? t.swap.done : t.done.buy)}
                      className="btn-bouncy btn-primary px-3 py-1.5 text-sm font-bold disabled:opacity-50"
                    >
                      {have ? t.owned : want ? `${t.swap.button}` : t.buy}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ))}

      {tab === "mine" &&
        (mineShown.length === 0 ? (
          empty(mine.length === 0 ? t.mineEmpty : t.more.emptyCat)
        ) : (
          <div className={grid}>
            {mineShown.map((o) => {
              const item = tradable(o.itemId)!;
              const want = o.wantId ? tradable(o.wantId) : null;
              return (
                <article key={o.id} className={card}>
                  <Preview item={item} locale={locale} avatar={avatar} />
                  <div className="flex flex-1 flex-col gap-1.5 p-2.5">
                    <h3 className="truncate text-sm font-extrabold">{item.names[locale]}</h3>
                    <div className="mt-auto pt-1">{want ? <span className="text-xs font-bold">{want.names[locale]}</span> : price(o.price)}</div>
                    <button type="button" disabled={busy} onClick={() => act({ action: "cancel", id: o.id }, t.done.cancel)} className="btn-bouncy bg-[var(--surface-muted)] px-3 py-1.5 text-sm font-bold disabled:opacity-50">
                      {t.cancel}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ))}

      {tab === "history" &&
        (rows.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">{t.hist.empty}</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {rows.map((x) => {
              const [, kind, a, b] = x.reason.split(":");
              const name = (id?: string) => (id ? (tradable(id)?.names[locale] ?? id) : "?");
              const text =
                kind === "market-buy" ? t.hist.bought.replace("{name}", name(a))
                : kind === "market-sell" ? t.hist.sold.replace("{name}", name(a))
                : kind === "market-swap" ? t.hist.swapped.replace("{got}", name(a)).replace("{gave}", name(b))
                : t.hist.fee.replace("{name}", name(a));
              return (
                <li key={x.id} className="flex items-center justify-between gap-2 rounded-xl bg-[var(--surface-muted)] px-3 py-1.5 text-sm">
                  <span className="truncate font-semibold">{text}</span>
                  <span className="shrink-0 text-xs text-[var(--muted)]">
                    {x.amount !== 0 && `${x.amount > 0 ? "+" : ""}${x.amount} · `}
                    {new Date(x.createdAt).toLocaleDateString(locale)}
                  </span>
                </li>
              );
            })}
          </ul>
        ))}

      {tab === "sell" && (
        <>
          <p className="text-xs text-[var(--muted)]">
            {t.fee.replace("{p}", String(Math.round(MARKET_FEE * 100)))} {t.limit.replace("{n}", String(MAX_LISTINGS))} {mine.length}/{MAX_LISTINGS}
          </p>
          {sellable.length === 0 ? (
            empty(t.sellEmpty)
          ) : sellShown.length === 0 ? (
            empty(t.more.emptyCat)
          ) : (
            <div className={grid}>
              {sellShown.map((item) => {
                const on = sell?.itemId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setSell({ itemId: item.id, price: item.price, want: null })}
                    className={`${card} text-left ${on ? "ring-4 ring-[var(--accent-yellow)]" : ""}`}
                  >
                    <Preview item={item} locale={locale} avatar={avatar} />
                    <div className="flex items-center justify-between gap-2 p-2.5">
                      <span className="truncate text-sm font-extrabold">{item.names[locale]}</span>
                      <span className={badge}>{CAT_ICON[item.kind as Cat]}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {draftItem && sell ? (
            <div className="flex flex-col gap-3 rounded-2xl border-2 border-[var(--edge)] bg-[var(--surface)] p-3 shadow-[0_3px_0_var(--shadow-ink)] sm:flex-row">
              <div className="sm:w-44 sm:shrink-0">
                <Preview item={draftItem} locale={locale} avatar={avatar} />
              </div>
              <div className="flex flex-1 flex-col gap-2.5">
                <h3 className="text-base font-extrabold">{draftItem.names[locale]}</h3>
                <div className="flex gap-1 rounded-xl bg-[var(--surface-muted)] p-1">
                  {([false, true] as const).map((isSwap) => (
                    <button
                      key={String(isSwap)}
                      type="button"
                      onClick={() => setSell({ ...sell, want: isSwap ? (catalog.find((c) => c.id !== draftItem.id)?.id ?? null) : null })}
                      className={`flex-1 rounded-lg px-2 py-1.5 text-sm font-bold ${!!sell.want === isSwap ? "bg-[var(--surface)] ring-2 ring-[var(--edge)]" : "text-[var(--muted)]"}`}
                    >
                      {isSwap ? `${t.swap.swap}` : `${t.swap.sell}`}
                    </button>
                  ))}
                </div>
                {sell.want ? (
                  <>
                    <label className="text-xs font-semibold">
                      {t.swap.want}
                      <select value={sell.want} onChange={(e) => setSell({ ...sell, want: e.target.value })} className="mt-1 w-full rounded-xl border-2 border-[var(--edge)] bg-[var(--surface)] px-2 py-1.5 text-sm">
                        {CATS.filter((c) => c !== "all").map((c) => (
                          <optgroup key={c} label={catLabel(c)}>
                            {catalog
                              .filter((i) => i.kind === c && i.id !== draftItem.id)
                              .map((i) => (
                                <option key={i.id} value={i.id}>
                                  {i.names[locale]}
                                </option>
                              ))}
                          </optgroup>
                        ))}
                      </select>
                    </label>
                    <p className="text-xs text-[var(--muted)]">{t.swap.free}</p>
                  </>
                ) : (
                  <>
                    <label className="text-xs font-semibold">
                      <span className="flex items-center justify-between">
                        {t.price}
                        {price(sell.price)}
                      </span>
                      <input type="range" min={MIN_PRICE} max={maxPrice(draftItem)} step={5} value={sell.price} onChange={(e) => setSell({ ...sell, price: Number(e.target.value) })} className="mt-2 w-full" />
                    </label>
                    <p className="text-xs text-[var(--muted)]">{t.youGet.replace("{n}", String(sellerGets(sell.price)))}</p>
                  </>
                )}
                <button
                  type="button"
                  disabled={busy || mine.length >= MAX_LISTINGS}
                  onClick={() => act({ action: "list", itemId: draftItem.id, ...(sell.want ? { wantId: sell.want } : { price: sell.price }) }, t.done.list)}
                  className="btn-bouncy btn-primary mt-auto px-4 py-2 text-sm font-bold disabled:opacity-50"
                >
                  {t.list}
                </button>
              </div>
            </div>
          ) : (
            sellShown.length > 0 && <p className="text-center text-xs text-[var(--muted)]">{t.more.pick}</p>
          )}
        </>
      )}

    </div>
  );
}
