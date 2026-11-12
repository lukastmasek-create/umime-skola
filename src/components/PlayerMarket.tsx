"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Preview } from "@/components/ShopView";
import { SHOP_BUNDLES, SHOP_ITEMS, bundlePrice, getShopItem, type ShopBundle, type ShopItem } from "@/lib/shop";
import { getPlayerMarketText } from "@/i18n/player-market";
import { getMarketCatalogText } from "@/i18n/market-catalog";
import { notifyAccountChanged } from "@/lib/account-events";
import { CATALOG_WORLDS, averagePrice, itemWorld, priceHistogram, type CatalogWorld } from "@/lib/market-catalog";
import { MARKET_FEE, MARKET_KINDS, MAX_LISTINGS, MIN_PRICE, maxPrice, sellerGets, tradable, type MarketOffer } from "@/lib/player-market";
import type { Locale } from "@/i18n/config";

// Trh hráčů ve vzhledu katalogu: nahoře hledání, záložky a zůstatek, pod nimi kategorie, vlevo filtry
// (cena, štítek, svět, vlastnictví) a vpravo mřížka nabídek. Balíčky jsou sady přímo od obchodu.
type Shop = { owned: string[]; equipped: { avatar: string | null; title: string | null; frame: string | null; banner: string | null }; points: number } | null;
type Tab = "offers" | "mine" | "sell" | "history";
type Cat = "all" | (typeof MARKET_KINDS)[number];
type CatOrBundles = Cat | "bundles";
type Row = { id: string; amount: number; reason: string; createdAt: string };
type Sort = "new" | "low" | "high";
type TagFilter = "all" | "new" | "popular";
type OwnFilter = "all" | "missing" | "have";
type Draft = { itemId: string; price: number; want: string | null };

const WISHLIST_KEY = "shop-wishlist"; // sdílené s klasickým seznamem zboží
const CATS: Cat[] = ["all", ...MARKET_KINDS];
const WORLD_COLOR: Record<CatalogWorld, string> = { pirate: "#2a78d6", space: "#6250d6", forest: "#1baf7a", castle: "#eda100", sea: "#29a3ff", other: "#8a849f" };
// Karty ve stylu herních dlaždic z homepage (lobby): barevný přechod podle světa předmětu, styl v globals.css (.market-card).
const WORLD_GRAD: Record<CatalogWorld, string> = {
  pirate: "from-[#2a78d6] to-[#0a2a5c]",
  space: "from-[#6250d6] to-[#1a0d4d]",
  forest: "from-[#1baf7a] to-[#0c3b2c]",
  castle: "from-[#eda100] to-[#7a4a0a]",
  sea: "from-[#29a3ff] to-[#0a2b4d]",
  other: "from-[#8a849f] to-[#2a2640]",
};
const gameCard = (world: CatalogWorld) => `market-card bg-gradient-to-br ${WORLD_GRAD[world]}`;

const ring = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-500)]";
const thumb =
  "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[var(--brand-500)] [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow " +
  "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[var(--brand-500)] [&::-moz-range-thumb]:bg-white";

function Icon({ d, className = "h-4 w-4" }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}
const ICON = {
  search: "M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm10 2-4.3-4.3",
  cart: "M6 6h15l-1.5 9h-12zM6 6 5 3H2m6 17a1 1 0 1 0 0-.01M18 20a1 1 0 1 0 0-.01",
  swap: "M7 7h13l-4-4m4 14H7l4 4",
  heart: "M12 21s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.7-8 11-8 11z",
};

export function PlayerMarket({ locale, onChange }: { locale: Locale; onChange?: () => void }) {
  const t = getPlayerMarketText(locale);
  const c = getMarketCatalogText(locale);
  const [tab, setTab] = useState<Tab>("offers");
  const [catPick, setCat] = useState<CatOrBundles>("all");
  const [sort, setSort] = useState<Sort>("new");
  const [offers, setOffers] = useState<MarketOffer[]>([]);
  const [shop, setShop] = useState<Shop>(null);
  const [loaded, setLoaded] = useState(false);
  const [loggedIn, setLoggedIn] = useState(true);
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [sell, setSell] = useState<Draft | null>(null);
  const [query, setQuery] = useState("");
  const [range, setRange] = useState<[number, number] | null>(null);
  const [tag, setTag] = useState<TagFilter>("all");
  const [worlds, setWorlds] = useState<CatalogWorld[]>(CATALOG_WORLDS);
  const [own, setOwn] = useState<OwnFilter>("all");
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [onlyFav, setOnlyFav] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const draftRef = useRef<HTMLDivElement>(null);

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
  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const raw = JSON.parse(window.localStorage.getItem(WISHLIST_KEY) ?? "[]");
        if (Array.isArray(raw)) setWishlist(raw.filter((v): v is string => typeof v === "string"));
      } catch {}
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  function toggleWish(id: string) {
    setWishlist((list) => {
      const next = list.includes(id) ? list.filter((v) => v !== id) : [...list, id];
      try {
        window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  async function post(url: string, body: object, ok: string) {
    setBusy(true);
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
    const data = res ? await res.json().catch(() => null) : null;
    setBusy(false);
    if (res?.ok && (url === "/api/shop" || data?.ok)) {
      setMsg({ text: ok, ok: true });
      setSell(null);
      notifyAccountChanged();
      onChange?.();
      await load();
    } else setMsg({ text: t.errors[data?.error] ?? t.errors.x, ok: false });
  }
  const act = (body: object, ok: string) => post("/api/trh", body, ok);

  const mine = offers.filter((o) => o.mine);
  const worn = shop ? Object.values(shop.equipped) : [];
  const sellable = (shop?.owned ?? []).map((id) => tradable(id)).filter((i) => i && !worn.includes(i.ref)) as ShopItem[];
  const avatar = shop?.equipped.avatar ?? null;
  const catalog = SHOP_ITEMS.filter((i) => (MARKET_KINDS as readonly string[]).includes(i.kind));
  const ownedIds = new Set(shop?.owned ?? []);
  // věci, které mohu nabídnout při výměně: vlastním a nenosím
  const canGive = new Set(sellable.map((i) => i.id));

  // Balíčky jsou jen v nabídkách; jinde se bere kategorie „vše“.
  const cat: CatOrBundles = catPick === "bundles" && tab !== "offers" ? "all" : catPick;
  const itemCat: Cat = cat === "bundles" ? "all" : cat;
  const inCat = (itemId: string) => itemCat === "all" || tradable(itemId)?.kind === itemCat;
  const q = query.trim().toLowerCase();
  const matches = (itemId: string, seller = "") => {
    const item = tradable(itemId);
    return !q || !!item && (item.names[locale].toLowerCase().includes(q) || seller.toLowerCase().includes(q));
  };

  // Nabídky ostatních; z nich plyne rozsah cen i počty u filtrů.
  const others = offers.filter((o) => !o.mine);
  const pointPrices = others.filter((o) => !o.wantId).map((o) => o.price);
  const minP = pointPrices.length ? Math.min(...pointPrices) : 0;
  const maxP = pointPrices.length ? Math.max(...pointPrices) : 0;
  const lo = Math.min(Math.max(range?.[0] ?? minP, minP), maxP);
  const hi = Math.max(Math.min(range?.[1] ?? maxP, maxP), lo);
  const bars = priceHistogram(pointPrices, minP, maxP);
  const barMax = Math.max(1, ...bars);
  const worldCount = (w: CatalogWorld) => others.filter((o) => itemWorld(o.itemId) === w).length;

  const shownOffers = others
    .filter((o) => {
      const item = tradable(o.itemId)!;
      return (
        inCat(o.itemId) &&
        matches(o.itemId, o.seller) &&
        (o.wantId || (o.price >= lo && o.price <= hi)) &&
        (tag === "all" || item.tag === tag) &&
        worlds.includes(itemWorld(o.itemId)) &&
        (own === "all" || (own === "have") === ownedIds.has(item.id)) &&
        (!onlyFav || wishlist.includes(item.id))
      );
    })
    .sort((a, b) => (sort === "low" ? a.price - b.price : sort === "high" ? b.price - a.price : b.at.localeCompare(a.at)));
  const mineShown = mine.filter((o) => inCat(o.itemId) && matches(o.itemId));
  const sellShown = sellable.filter((i) => (itemCat === "all" || i.kind === itemCat) && matches(i.id));
  const bundlesShown = SHOP_BUNDLES.filter((b) => !q || b.names[locale].toLowerCase().includes(q));
  const draftItem = sell ? tradable(sell.itemId) : null;

  // Počty u kategorií podle toho, co se v záložce zrovna zobrazuje.
  const pool: string[] = tab === "offers" ? others.map((o) => o.itemId) : tab === "mine" ? mine.map((o) => o.itemId) : sellable.map((i) => i.id);
  const countIn = (k: Cat) => pool.filter((id) => k === "all" || tradable(id)?.kind === k).length;
  const filtersActive = !!range || tag !== "all" || worlds.length !== CATALOG_WORLDS.length || own !== "all";
  const resetFilters = () => {
    setRange(null);
    setTag("all");
    setWorlds(CATALOG_WORLDS);
    setOwn("all");
  };

  const grid = "grid grid-cols-2 gap-3 md:grid-cols-3";
  const panel = "rounded-2xl border-2 border-[var(--edge)] bg-[var(--surface)] p-4";
  const heading = "text-sm font-extrabold";
  const pillBtn = `inline-flex items-center justify-center gap-1.5 rounded-full border-2 border-[var(--brand-500)] bg-[var(--surface)] px-3 py-1 text-sm font-extrabold text-[var(--brand-600)] transition-colors hover:bg-[var(--brand-500)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[var(--surface)] disabled:hover:text-[var(--brand-600)] ${ring}`;
  const empty = (text: string) => (
    <div className="rounded-2xl border-2 border-dashed border-[var(--edge)] px-4 py-10 text-center text-sm text-[var(--muted)]">{text}</div>
  );
  const catLabel = (k: CatOrBundles) => (k === "bundles" ? c.bundles : t.cats[k]);
  const price = (n: number) => (
    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-yellow)] px-2.5 py-0.5 text-sm font-extrabold text-[#16132b]">{n}</span>
  );
  const sectionTitle = (text: string, action?: ReactNode) => (
    <div className="mb-2 flex items-center justify-between gap-2">
      <h3 className={heading}>{text}</h3>
      {action}
    </div>
  );
  const resetLink = (onClick: () => void, show: boolean) =>
    show ? (
      <button type="button" onClick={onClick} className={`rounded text-xs font-semibold text-[var(--muted)] underline-offset-2 hover:underline ${ring}`}>
        {c.reset}
      </button>
    ) : null;

  const heart = (item: ShopItem) => {
    const on = wishlist.includes(item.id);
    return (
      <button
        type="button"
        aria-pressed={on}
        aria-label={`${on ? c.favRemove : c.favAdd}: ${item.names[locale]}`}
        onClick={() => toggleWish(item.id)}
        className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--surface)] shadow-sm transition-colors ${on ? "text-[var(--brand-500)]" : "text-[var(--muted)] hover:text-[var(--brand-500)]"} ${ring}`}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden>
          <path d={ICON.heart} />
        </svg>
      </button>
    );
  };
  const topBadge = (item: ShopItem) =>
    item.tag === "popular" ? (
      <span className="absolute left-3 top-3 rounded-md bg-[var(--accent-yellow)] px-2 py-0.5 text-[11px] font-extrabold text-[#16132b]">{c.topItem}</span>
    ) : item.tag === "new" ? (
      <span className="absolute left-3 top-3 rounded-md bg-[var(--brand-500)] px-2 py-0.5 text-[11px] font-extrabold text-white">{c.tags.new}</span>
    ) : null;

  const tabNames: Tab[] = ["offers", "mine", "sell", "history"];

  return (
    <div className="flex flex-col gap-3 rounded-3xl border-2 border-[var(--edge)] bg-[var(--surface-muted)] p-3 shadow-[0_4px_0_var(--shadow-ink)] sm:p-4">
      {/* horní lišta */}
      <div className="flex flex-col gap-3 rounded-2xl border-2 border-[var(--edge)] bg-[var(--surface)] p-3 lg:flex-row lg:items-center">
        <label className="relative block lg:w-72">
          <span className="sr-only">{c.search}</span>
          <Icon d={ICON.search} className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={c.search}
            className={`w-full rounded-full bg-[var(--surface-muted)] py-2 pl-9 pr-3 text-sm ${ring}`}
          />
        </label>
        <div role="tablist" className="flex flex-1 flex-wrap gap-1 lg:justify-end">
          {tabNames.map((k) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={tab === k}
              onClick={() => {
                setTab(k);
                setMsg(null);
              }}
              className={`rounded-full px-3 py-1.5 text-sm font-bold transition-colors ${tab === k ? "bg-[var(--brand-500)] text-white" : "text-[var(--muted)] hover:text-[var(--foreground)]"} ${ring}`}
            >
              {t.tabs[k]}
              {k === "mine" && mine.length > 0 && <span className="ml-1.5 rounded-full bg-[var(--accent-yellow)] px-1.5 py-0.5 text-[11px] text-[#16132b]">{mine.length}</span>}
            </button>
          ))}
          <button
            type="button"
            aria-pressed={onlyFav}
            onClick={() => {
              setOnlyFav((v) => !v);
              setTab("offers");
            }}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold transition-colors ${onlyFav ? "bg-[var(--brand-100)] text-[var(--brand-700)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"} ${ring}`}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill={onlyFav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden>
              <path d={ICON.heart} />
            </svg>
            {c.favorites}
            {wishlist.length > 0 && <span className="text-xs opacity-70">{wishlist.length}</span>}
          </button>
        </div>
        {shop && (
          <span className="inline-flex items-center gap-1.5 self-start rounded-full border-2 border-[var(--edge)] bg-[var(--accent-yellow)] px-3 py-1 text-sm font-extrabold text-[#16132b] lg:self-auto">
            {t.hist.balance.replace("{n}", String(shop.points))}
          </span>
        )}
      </div>

      {msg && (
        <p role="status" className={`rounded-xl px-3 py-2 text-sm font-bold ${msg.ok ? "bg-emerald-100 text-emerald-900" : "bg-rose-100 text-rose-900"}`}>
          {msg.text}
        </p>
      )}
      {!loggedIn && <p className="rounded-xl bg-[var(--surface)] px-3 py-2 text-sm font-semibold">{t.login}</p>}

      {/* kategorie */}
      {tab !== "history" && (
        <div className="flex flex-wrap gap-2" role="group">
          {([...CATS, ...(tab === "offers" ? (["bundles"] as const) : [])] as CatOrBundles[]).map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={cat === k}
              onClick={() => setCat(k)}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${cat === k ? "bg-[var(--brand-500)] text-white" : "bg-[var(--surface)] hover:bg-[var(--brand-100)]"} ${ring}`}
            >
              {catLabel(k)}
              {k !== "bundles" && <span className="text-xs opacity-70">{countIn(k)}</span>}
            </button>
          ))}
        </div>
      )}

      {tab === "offers" && (
        <div className="grid gap-3 lg:grid-cols-[17rem_1fr] lg:items-start">
          {cat !== "bundles" && (
            <aside className="flex flex-col gap-3">
              <button
                type="button"
                aria-expanded={filtersOpen}
                onClick={() => setFiltersOpen((v) => !v)}
                className={`rounded-xl bg-[var(--surface)] px-3 py-2 text-sm font-bold lg:hidden ${ring}`}
              >
                {c.filters}
                {filtersActive ? " •" : ""}
              </button>
              <div className={`${filtersOpen ? "flex" : "hidden"} flex-col gap-3 lg:flex`}>
                {/* cenové rozpětí */}
                {pointPrices.length > 0 && (
                  <section className={panel} aria-label={c.priceRange}>
                    {sectionTitle(c.priceRange, resetLink(() => setRange(null), !!range))}
                    <p className="mb-2 text-xs text-[var(--muted)]">{c.priceAvg.replace("{n}", String(averagePrice(pointPrices)))}</p>
                    <div className="flex h-14 items-end gap-px" aria-hidden>
                      {bars.map((n, i) => {
                        const from = minP + ((maxP - minP) / bars.length) * i;
                        const to = minP + ((maxP - minP) / bars.length) * (i + 1);
                        const inside = to > lo && from <= hi;
                        return <span key={i} className="flex-1 rounded-t-sm" style={{ height: `${Math.max(n ? 12 : 4, (n / barMax) * 100)}%`, background: inside ? "var(--brand-500)" : "var(--border-soft)", opacity: inside ? 0.55 : 1 }} />;
                      })}
                    </div>
                    <div className="relative mt-1 h-5">
                      <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[color-mix(in_srgb,var(--foreground)_22%,transparent)]" />
                      <div
                        className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-[var(--brand-500)]"
                        style={{ left: `${maxP > minP ? ((lo - minP) / (maxP - minP)) * 100 : 0}%`, right: `${maxP > minP ? 100 - ((hi - minP) / (maxP - minP)) * 100 : 0}%` }}
                      />
                      {([0, 1] as const).map((side) => (
                        <input
                          key={side}
                          type="range"
                          min={minP}
                          max={maxP}
                          step={1}
                          value={side === 0 ? lo : hi}
                          aria-label={`${c.priceRange} ${side === 0 ? "min" : "max"}`}
                          disabled={maxP === minP}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            setRange(side === 0 ? [Math.min(v, hi), hi] : [lo, Math.max(v, lo)]);
                          }}
                          className={`pointer-events-none absolute inset-0 h-5 w-full appearance-none bg-transparent! ${thumb}`}
                        />
                      ))}
                    </div>
                    <div className="mt-2 flex justify-between text-xs font-extrabold">
                      <span className="rounded-full bg-[var(--foreground)] px-2 py-0.5 text-[var(--background)]">{lo}</span>
                      <span className="rounded-full bg-[var(--foreground)] px-2 py-0.5 text-[var(--background)]">{hi}</span>
                    </div>
                  </section>
                )}

                {/* štítek */}
                <section className={panel}>
                  {sectionTitle(c.tag)}
                  <div className="flex flex-wrap gap-1.5">
                    {(["all", "new", "popular"] as TagFilter[]).map((k) => (
                      <button
                        key={k}
                        type="button"
                        aria-pressed={tag === k}
                        onClick={() => setTag(k)}
                        className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${tag === k ? "bg-[var(--brand-500)] text-white" : "bg-[var(--surface-muted)] hover:bg-[var(--brand-100)]"} ${ring}`}
                      >
                        {c.tags[k]}
                      </button>
                    ))}
                  </div>
                </section>

                {/* svět */}
                <section className={panel}>
                  {sectionTitle(c.world, resetLink(() => setWorlds(CATALOG_WORLDS), worlds.length !== CATALOG_WORLDS.length))}
                  <ul className="flex flex-col gap-2">
                    {CATALOG_WORLDS.map((w) => {
                      const on = worlds.includes(w);
                      const n = worldCount(w);
                      return (
                        <li key={w}>
                          <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
                            <input
                              type="checkbox"
                              checked={on}
                              onChange={() => setWorlds((cur) => (cur.includes(w) ? cur.filter((x) => x !== w) : [...cur, w]))}
                              className="peer sr-only"
                            />
                            <span aria-hidden className="h-3 w-3 rounded-full" style={{ background: WORLD_COLOR[w] }} />
                            <span className={`flex-1 ${n === 0 ? "text-[var(--muted)]" : ""}`}>{c.worlds[w]}</span>
                            <span className="text-xs text-[var(--muted)]">{n}</span>
                            <span
                              aria-hidden
                              className={`flex h-5 w-5 items-center justify-center rounded-md border-2 text-xs font-extrabold text-white peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--brand-500)] ${on ? "border-[var(--brand-500)] bg-[var(--brand-500)]" : "border-[var(--field-border)] bg-[var(--surface)]"}`}
                            >
                              {on ? "✓" : ""}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </section>

                {/* vlastnictví */}
                {loggedIn && (
                  <section className={panel}>
                    {sectionTitle(c.ownership)}
                    <div className="flex gap-1 rounded-full bg-[var(--surface-muted)] p-1">
                      {(["all", "missing", "have"] as OwnFilter[]).map((k) => (
                        <button
                          key={k}
                          type="button"
                          aria-pressed={own === k}
                          onClick={() => setOwn(k)}
                          className={`flex-1 rounded-full px-2 py-1.5 text-xs font-bold transition-colors ${own === k ? "bg-[var(--brand-500)] text-white" : "text-[var(--muted)] hover:text-[var(--foreground)]"} ${ring}`}
                        >
                          {c.own[k]}
                        </button>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </aside>
          )}

          <div className={`flex flex-col gap-3 ${cat === "bundles" ? "lg:col-span-2" : ""}`}>
            {cat === "bundles" ? (
              <>
                <p className="text-sm text-[var(--muted)]">{c.bundlesHint}</p>
                {bundlesShown.length === 0 ? (
                  empty(c.noResults)
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {bundlesShown.map((b) => {
                      const { price: p, full, missing } = bundlePrice(b, ownedIds);
                      const done = missing.length === 0;
                      return (
                        <BundleCard
                          key={b.id}
                          bundle={b}
                          locale={locale}
                          owned={ownedIds}
                          done={done}
                          saved={full - p}
                          price={p}
                          disabled={busy || !loggedIn || done || (shop?.points ?? 0) < p}
                          onBuy={() => post("/api/shop", { action: "buyBundle", id: b.id }, c.bundleDone)}
                          text={c}
                          pillBtn={pillBtn}
                        />
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-[var(--muted)]">{c.results.replace("{n}", String(shownOffers.length))}</span>
                  <select aria-label="sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={`rounded-full border-2 border-[var(--edge)] bg-[var(--surface)] px-3 py-1 text-sm font-semibold ${ring}`}>
                    <option value="new">{t.more.sortNew}</option>
                    <option value="low">{t.more.sortLow}</option>
                    <option value="high">{t.more.sortHigh}</option>
                  </select>
                </div>
                {!loaded ? (
                  <div className={grid} aria-busy>
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-60 animate-pulse rounded-2xl bg-[var(--surface)]" />
                    ))}
                  </div>
                ) : shownOffers.length === 0 ? (
                  <div className="flex flex-col items-center gap-3">
                    {empty(others.length === 0 ? t.empty : c.noResults)}
                    {others.length > 0 && (filtersActive || onlyFav || q) && (
                      <button
                        type="button"
                        onClick={() => {
                          resetFilters();
                          setOnlyFav(false);
                          setQuery("");
                          setCat("all");
                        }}
                        className={`${pillBtn}`}
                      >
                        {c.reset}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className={grid}>
                    {shownOffers.map((o) => {
                      const item = tradable(o.itemId)!;
                      const have = ownedIds.has(item.id);
                      const want = o.wantId ? tradable(o.wantId) : null;
                      const blocked = busy || !loggedIn || have || (want ? !canGive.has(want.id) : (shop?.points ?? 0) < o.price);
                      return (
                        <article key={o.id} className={gameCard(itemWorld(item.id))}>
                          <div className="relative">
                            <Preview item={item} locale={locale} avatar={avatar} heightClass="h-36" plain />
                            {topBadge(item)}
                            {heart(item)}
                          </div>
                          <div className="mt-auto flex flex-col gap-1 pt-3">
                            <h3 className="truncate text-lg font-bold leading-tight">{item.names[locale]}</h3>
                            <p className="flex max-w-full items-center gap-1.5 text-xs text-white/75">
                              <span aria-hidden className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/25 text-[10px] font-bold text-white">
                                {o.seller.slice(0, 1).toUpperCase()}
                              </span>
                              <span className="truncate">{t.seller.replace("{name}", o.seller)}</span>
                            </p>
                            {want && <p className="truncate text-xs font-bold text-white/90">{c.wants.replace("{name}", want.names[locale])}</p>}
                            <button
                              type="button"
                              disabled={blocked}
                              aria-label={`${have ? t.owned : want ? t.swap.button : t.buy}: ${item.names[locale]}${want ? "" : ` (${o.price})`}`}
                              onClick={() => act({ action: "buy", id: o.id, seller: o.sellerId }, want ? t.swap.done : t.done.buy)}
                              className="market-btn mt-2 self-start"
                            >
                              {have ? (
                                t.owned
                              ) : want ? (
                                <>
                                  <Icon d={ICON.swap} />
                                  {t.swap.button}
                                </>
                              ) : (
                                <>
                                  <Icon d={ICON.cart} />
                                  {o.price}
                                </>
                              )}
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {tab === "mine" &&
        (mineShown.length === 0 ? (
          empty(mine.length === 0 ? t.mineEmpty : t.more.emptyCat)
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {mineShown.map((o) => {
              const item = tradable(o.itemId)!;
              const want = o.wantId ? tradable(o.wantId) : null;
              return (
                <article key={o.id} className={gameCard(itemWorld(item.id))}>
                  <div>
                    <Preview item={item} locale={locale} avatar={avatar} heightClass="h-36" plain />
                  </div>
                  <div className="mt-auto flex flex-col gap-1 pt-3">
                    <h3 className="truncate text-lg font-bold leading-tight">{item.names[locale]}</h3>
                    {want ? <span className="truncate text-xs font-bold text-white/90">{c.wants.replace("{name}", want.names[locale])}</span> : <span>{price(o.price)}</span>}
                    <button type="button" disabled={busy} onClick={() => act({ action: "cancel", id: o.id }, t.done.cancel)} className="market-btn market-btn-alt mt-2 self-start">
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
          <div className={panel}>
            <p className="text-sm text-[var(--muted)]">{t.hist.empty}</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {rows.map((x) => {
              const [, kind, a, b] = x.reason.split(":");
              const name = (id?: string) => (id ? (tradable(id)?.names[locale] ?? getShopItem(id)?.names[locale] ?? id) : "?");
              const text =
                kind === "market-buy" ? t.hist.bought.replace("{name}", name(a))
                : kind === "market-sell" ? t.hist.sold.replace("{name}", name(a))
                : kind === "market-swap" ? t.hist.swapped.replace("{got}", name(a)).replace("{gave}", name(b))
                : t.hist.fee.replace("{name}", name(a));
              return (
                <li key={x.id} className="flex items-center justify-between gap-2 rounded-xl bg-[var(--surface)] px-3 py-2 text-sm">
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
          {draftItem && sell ? (
            <div ref={draftRef} className="flex scroll-mt-4 flex-col gap-3 rounded-2xl border-2 border-[var(--edge)] bg-[var(--surface)] p-3 shadow-[0_3px_0_var(--shadow-ink)] sm:flex-row">
              <div className="sm:w-44 sm:shrink-0">
                <Preview item={draftItem} locale={locale} avatar={avatar} />
              </div>
              <div className="flex flex-1 flex-col gap-2.5">
                <h3 className="text-base font-extrabold">{draftItem.names[locale]}</h3>
                <div className="flex gap-1 rounded-full bg-[var(--surface-muted)] p-1">
                  {([false, true] as const).map((isSwap) => (
                    <button
                      key={String(isSwap)}
                      type="button"
                      onClick={() => setSell({ ...sell, want: isSwap ? (catalog.find((i) => i.id !== draftItem.id)?.id ?? null) : null })}
                      className={`flex-1 rounded-full px-2 py-1.5 text-sm font-bold ${!!sell.want === isSwap ? "bg-[var(--brand-500)] text-white" : "text-[var(--muted)]"} ${ring}`}
                    >
                      {isSwap ? t.swap.swap : t.swap.sell}
                    </button>
                  ))}
                </div>
                {sell.want ? (
                  <>
                    <label className="text-xs font-semibold">
                      {t.swap.want}
                      <select value={sell.want} onChange={(e) => setSell({ ...sell, want: e.target.value })} className="mt-1 w-full rounded-xl border-2 border-[var(--edge)] bg-[var(--surface)] px-2 py-1.5 text-sm">
                        {CATS.filter((k) => k !== "all").map((k) => (
                          <optgroup key={k} label={t.cats[k]}>
                            {catalog
                              .filter((i) => i.kind === k && i.id !== draftItem.id)
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
                      <input type="range" min={MIN_PRICE} max={maxPrice(draftItem)} step={5} value={sell.price} onChange={(e) => setSell({ ...sell, price: Number(e.target.value) })} className="mt-2 w-full accent-[var(--brand-500)]" />
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
          {sellable.length === 0 ? (
            empty(t.sellEmpty)
          ) : sellShown.length === 0 ? (
            empty(t.more.emptyCat)
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {sellShown.map((item) => {
                const on = sell?.itemId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => {
                      setSell({ itemId: item.id, price: item.price, want: null });
                      window.setTimeout(() => draftRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 0);
                    }}
                    className={`${gameCard(itemWorld(item.id))} text-left ${on ? "ring-4 ring-[var(--accent-yellow)] ring-offset-2 ring-offset-[var(--surface-muted)]" : ""} ${ring}`}
                  >
                    <div>
                      <Preview item={item} locale={locale} avatar={avatar} heightClass="h-32" plain />
                    </div>
                    <span className="mt-auto truncate pt-3 text-base font-bold leading-tight">{item.names[locale]}</span>
                  </button>
                );
              })}
            </div>
          )}

        </>
      )}
    </div>
  );
}

// Sada od obchodu: barevná hlavička se seznamem věcí a tlačítko s cenou za to, co ještě nemáš.
function BundleCard({
  bundle,
  locale,
  owned,
  done,
  saved,
  price,
  disabled,
  onBuy,
  text,
  pillBtn,
}: {
  bundle: ShopBundle;
  locale: Locale;
  owned: ReadonlySet<string>;
  done: boolean;
  saved: number;
  price: number;
  disabled: boolean;
  onBuy: () => void;
  text: ReturnType<typeof getMarketCatalogText>;
  pillBtn: string;
}) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border-2 border-[var(--edge)] bg-[var(--surface)] shadow-[0_3px_0_var(--shadow-ink)]">
      <div className="p-2">
        <div className="flex h-28 items-center justify-center rounded-xl border-2 border-[var(--edge)] px-3 text-center text-lg font-extrabold text-[#16132b]" style={{ background: bundle.color }}>
          {bundle.names[locale]}
        </div>
      </div>
      <div className="flex flex-1 flex-col items-center gap-2 px-3 pb-3">
        <ul className="flex flex-wrap justify-center gap-1.5 text-xs">
          {bundle.itemIds.map((id) => (
            <li key={id} className={`rounded-lg border-2 px-2 py-0.5 ${owned.has(id) ? "border-[var(--accent-green)] text-[var(--accent-green)]" : "border-[var(--edge)]"}`}>
              {owned.has(id) ? "✓ " : ""}
              {getShopItem(id)?.names[locale] ?? id}
            </li>
          ))}
        </ul>
        {!done && saved > 0 && <p className="text-xs text-[var(--muted)]">{text.bundleSave.replace("{n}", String(saved))}</p>}
        <button type="button" disabled={disabled} onClick={onBuy} className={`${pillBtn} mt-auto`}>
          {done ? text.bundleOwned : `${text.bundleBuy} · ${price}`}
        </button>
      </div>
    </article>
  );
}
