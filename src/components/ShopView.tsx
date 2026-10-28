"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { MarketBanner } from "@/components/MarketBanner";
import { PetArt } from "@/components/idle/PetArt";
import { bannerAttrs, bannerCss, isFrameId } from "@/lib/cosmetics";
import {
  BUNDLE_DISCOUNT,
  DEAL_DISCOUNT,
  SHOP_BUNDLES,
  SHOP_ITEMS,
  SHOP_KINDS,
  bundlePrice,
  dailyDealIds,
  dayKey,
  getShopItem,
  salePrice,
  type ShopBundle,
  type ShopItem,
  type ShopKind,
} from "@/lib/shop";
import { SPECIES, type SpeciesId } from "@/lib/idle/pets";
import { getShopText } from "@/i18n/shop";
import { getShopExtraText } from "@/i18n/shop-extra";
import { notifyAccountChanged } from "@/lib/account-events";
import type { Locale } from "@/i18n/config";

type Equipped = { avatar: string | null; title: string | null; frame: string | null; banner: string | null };
type Snapshot = { loggedIn: true; points: number; owned: string[]; equipped: Equipped; day: string; resetAt: string };
type Sort = "default" | "asc" | "desc";

const WISHLIST_KEY = "shop-wishlist";

type HistoryRow = { id: string; amount: number; reason: string; createdAt: string };

function formatLeft(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  return h > 0 ? `${h} h ${String(m).padStart(2, "0")} min` : `${m} min ${String(total % 60).padStart(2, "0")} s`;
}

// Okno nad obsahem stránky: Esc nebo klik mimo ho zavře.
function Modal({ title, onClose, closeLabel, children }: { title: string; onClose: () => void; closeLabel: string; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()} className="card relative max-h-[90vh] w-full max-w-md overflow-y-auto p-5">
        <button type="button" onClick={onClose} aria-label={closeLabel} className="absolute right-3 top-3 rounded-lg px-2 py-1 text-lg font-bold text-[var(--muted)] hover:bg-[var(--surface-muted)]">
          ✕
        </button>
        <h2 className="mb-3 pr-8 text-lg font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
type State = { status: "loading" } | { status: "unavailable" } | { status: "guest" } | { status: "ready"; data: Snapshot };

const CITY_PREVIEW: Record<string, { emoji: string; color: string }> = {
  christmas_tree: { emoji: "🎄", color: "#7ee0b0" },
  windmill: { emoji: "🌾", color: "#ffc933" },
  ferris_wheel: { emoji: "🎡", color: "#8fd0ff" },
  carousel: { emoji: "🎠", color: "#ffd0ec" },
  lighthouse: { emoji: "🗼", color: "#bfe6ff" },
  rocket_pad: { emoji: "🚀", color: "#e3c8ff" },
};

function Preview({ item, locale, avatar }: { item: ShopItem; locale: Locale; avatar: string | null }) {
  const box = "flex h-28 items-center justify-center rounded-xl border-2 border-[var(--edge)]";
  switch (item.kind) {
    case "avatar":
      return (
        <div className={`${box} bg-[var(--surface-muted)]`}>
          <Avatar id={item.ref} size={84} />
        </div>
      );
    case "frame":
      return (
        <div className={`${box} bg-[var(--surface-muted)]`}>
          <Avatar id={avatar ?? "robot"} size={72} frame={isFrameId(item.ref) ? item.ref : null} />
        </div>
      );
    case "title":
      return (
        <div className={`${box} bg-[var(--surface-muted)]`}>
          <span className="pill bg-[var(--accent-yellow)] px-4 py-1.5 text-base text-[#16132b]">{item.names[locale]}</span>
        </div>
      );
    case "banner":
      return <div {...bannerAttrs(item.ref)} className={`${box} banner-anim`} style={{ background: bannerCss(item.ref) }} />;
    case "pet":
      return (
        <div className={`${box} bg-[var(--surface-muted)]`}>
          <PetArt species="cat" stage={2} mood="happy" size={104} accessory={item.ref} />
        </div>
      );
    case "city": {
      const p = CITY_PREVIEW[item.ref] ?? { emoji: "🏛️", color: "#c9b8ff" };
      return (
        <div className={box} style={{ background: p.color }}>
          <span className="text-5xl" aria-hidden>
            {p.emoji}
          </span>
        </div>
      );
    }
  }
}

export function ShopView({ locale }: { locale: Locale }) {
  const t = getShopText(locale);
  const [state, setState] = useState<State>({ status: "loading" });
  const [tab, setTab] = useState<ShopKind | "all">("all");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const x = getShopExtraText(locale);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("default");
  const [onlyNew, setOnlyNew] = useState(false);
  const [onlyFav, setOnlyFav] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [petPick, setPetPick] = useState<SpeciesId>("cat");
  const [giftId, setGiftId] = useState<string | null>(null);
  const [giftEmail, setGiftEmail] = useState("");
  const [nowMs, setNowMs] = useState(0);
  const [history, setHistory] = useState<HistoryRow[] | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const raw = JSON.parse(window.localStorage.getItem(WISHLIST_KEY) ?? "[]");
        if (Array.isArray(raw)) setWishlist(raw.filter((v): v is string => typeof v === "string"));
      } catch {}
      setNowMs(Date.now());
    }, 0);
    const tick = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => {
      window.clearTimeout(id);
      window.clearInterval(tick);
    };
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

  const toast = useCallback((text: string, ok = false) => {
    setMessage({ text, ok });
    window.setTimeout(() => setMessage((m) => (m?.text === text ? null : m)), 3500);
  }, []);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/shop");
      if (!res.ok) {
        setState((s) => (s.status === "ready" ? s : { status: "unavailable" }));
        return;
      }
      const json = await res.json();
      setState(json.loggedIn ? { status: "ready", data: json } : { status: "guest" });
    } catch {
      setState((s) => (s.status === "ready" ? s : { status: "unavailable" }));
    }
  }, []);

  useEffect(() => {
    const id = window.setTimeout(load, 0);
    return () => window.clearTimeout(id);
  }, [load]);

  const errorText = (code: string | undefined) => {
    const c = code ?? "generic";
    return (x.errors as Record<string, string>)[c] ?? (t.errors as Record<string, string>)[c] ?? t.errors.generic;
  };

  async function post(payload: Record<string, unknown>, okText: string, busyKey: string): Promise<boolean> {
    if (busy) return false;
    setBusy(busyKey);
    try {
      const res = await fetch("/api/shop", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast(errorText(json.error) + (json.detail ? ` (${json.detail})` : ""));
        if (json.error === "owned") void load();
        return false;
      }
      setState({ status: "ready", data: json });
      notifyAccountChanged();
      toast(okText, true);
      return true;
    } catch {
      toast(t.errors.generic);
      return false;
    } finally {
      setBusy(null);
    }
  }

  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/shop?history=1");
      const json = await res.json().catch(() => ({}));
      setHistory(res.ok && Array.isArray(json.history) ? json.history : []);
    } catch {
      setHistory([]);
    }
  }, []);

  // Při otevření historie a po každém nákupu (změní se počet bodů) se načte znovu.
  const points = state.status === "ready" ? state.data.points : 0;
  useEffect(() => {
    if (!historyOpen) return;
    const id = window.setTimeout(() => void loadHistory(), 0);
    return () => window.clearTimeout(id);
  }, [historyOpen, points, loadHistory]);

  function historyLine(row: HistoryRow): string {
    const [, kind, ref, who] = row.reason.split(":");
    if (kind === "bundle") {
      const bundle = SHOP_BUNDLES.find((b) => b.id === ref);
      return x.historyBundle.replace("{name}", bundle?.names[locale] ?? x.historyUnknown);
    }
    const name = getShopItem(ref)?.names[locale] ?? x.historyUnknown;
    if (kind === "gift") return x.historyGift.replace("{name}", name).replace("{who}", who ?? "?");
    if (kind === "received") return x.historyReceived.replace("{name}", name);
    return x.historyBuy.replace("{name}", name);
  }

  const buy = (item: ShopItem) =>
    post({ action: "buy", id: item.id }, t.bought.replace("{name}", item.names[locale]), item.id);
  const buyBundle = (bundle: ShopBundle) =>
    post({ action: "buyBundle", id: bundle.id }, x.bundleBought.replace("{name}", bundle.names[locale]), `bundle-${bundle.id}`);
  async function sendGift(item: ShopItem) {
    const ok = await post({ action: "gift", id: item.id, email: giftEmail }, x.giftSent.replace("{name}", item.names[locale]), `gift-${item.id}`);
    if (ok) {
      setGiftId(null);
      setGiftEmail("");
    }
  }

  async function equip(item: ShopItem, remove: boolean) {
    if (busy || state.status !== "ready") return;
    const key = item.kind as "avatar" | "title" | "frame" | "banner";
    setBusy(item.id);
    try {
      const res = await fetch("/api/profil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: remove ? null : item.ref }),
      });
      if (!res.ok) {
        toast(t.errors.generic);
        return;
      }
      const value = remove ? null : item.ref;
      setState((s) => (s.status === "ready" ? { status: "ready", data: { ...s.data, equipped: { ...s.data.equipped, [key]: value } } } : s));
      notifyAccountChanged();
    } catch {
      toast(t.errors.generic);
    } finally {
      setBusy(null);
    }
  }

  const header = (
    <div className="mb-6">
      <h1 className="mb-1 text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
        🛍️ {t.title}
      </h1>
      <p className="max-w-3xl text-[var(--muted)]">{t.subtitle}</p>
    </div>
  );

  if (state.status === "loading") {
    return (
      <div>
        {header}
        <div className="card h-64 animate-pulse bg-[var(--surface-muted)]" aria-label={t.loading} />
      </div>
    );
  }
  if (state.status === "unavailable") {
    return (
      <div>
        {header}
        <div className="card p-6 text-[var(--muted)]">{t.unavailable}</div>
      </div>
    );
  }

  const ready = state.status === "ready" ? state.data : null;
  const owned = new Set(ready?.owned ?? []);
  const day = ready?.day ?? dayKey();
  const dealIds = new Set(dailyDealIds(day));
  const priceOf = (item: ShopItem) => salePrice(item, day);
  const q = query.trim().toLowerCase();
  let items = SHOP_ITEMS.filter(
    (i) =>
      (tab === "all" || i.kind === tab) &&
      (!q || i.names[locale].toLowerCase().includes(q) || t.tabs[i.kind].toLowerCase().includes(q)) &&
      (!onlyNew || !owned.has(i.id)) &&
      (!onlyFav || wishlist.includes(i.id)),
  );
  if (sort !== "default") items = [...items].sort((a, b) => (sort === "asc" ? priceOf(a) - priceOf(b) : priceOf(b) - priceOf(a)));
  const dealItems = [...dealIds].map((id) => getShopItem(id)).filter((i): i is ShopItem => !!i);
  const msLeft = ready && nowMs ? new Date(ready.resetAt).getTime() - nowMs : null;
  const previewItem = previewId ? getShopItem(previewId) : undefined;
  const giftItem = giftId ? getShopItem(giftId) : undefined;

  const isEquipped = (item: ShopItem) => !!ready && ready.equipped[item.kind as keyof Equipped] === item.ref;


  const renderCard = (item: ShopItem) => {
    const have = owned.has(item.id);
    const equippable = item.kind === "avatar" || item.kind === "title" || item.kind === "frame" || item.kind === "banner";
    const price = priceOf(item);
    const onSale = dealIds.has(item.id);
    const missing = price - points;
    const wished = wishlist.includes(item.id);
    return (
      <article key={item.id} className="card flex flex-col gap-3 p-4">
        <div className="relative">
          <Preview item={item} locale={locale} avatar={ready?.equipped.avatar ?? null} />
          {onSale ? (
            <span className="pill absolute left-2 top-2 bg-[var(--danger)] px-2 py-0.5 text-[11px] text-white">-{Math.round(DEAL_DISCOUNT * 100)} %</span>
          ) : (
            item.tag && (
              <span className="pill absolute left-2 top-2 bg-[var(--accent-500)] px-2 py-0.5 text-[11px] text-white">
                {item.tag === "new" ? t.tagNew : t.tagPopular}
              </span>
            )
          )}
          <button
            type="button"
            onClick={() => toggleWish(item.id)}
            aria-pressed={wished}
            aria-label={wished ? x.unfav : x.fav}
            title={wished ? x.unfav : x.fav}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--edge)] bg-[var(--surface)] text-base leading-none transition-transform hover:scale-110"
          >
            {wished ? "❤️" : "🤍"}
          </button>
        </div>
        <div>
          <h2 className="font-bold leading-tight">{item.names[locale]}</h2>
          <p className="text-xs text-[var(--muted)]">{t.tabs[item.kind]}</p>
        </div>
        <div className="mt-auto flex flex-col gap-2">
          {!have ? (
            <button
              type="button"
              disabled={!ready || busy !== null || missing > 0}
              onClick={() => buy(item)}
              className="btn-bouncy bg-[var(--brand-500)] px-3 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-45"
            >
              {ready && missing > 0 ? (
                t.needPoints.replace("{n}", String(missing))
              ) : (
                <>
                  ⭐ {onSale && <s className="opacity-70">{item.price}</s>} {price} · {t.buy}
                </>
              )}
            </button>
          ) : (
            <>
              <p className="text-sm font-semibold text-[var(--accent-green)]">✓ {t.owned}</p>
              {equippable && (
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() => equip(item, isEquipped(item) && (item.kind === "frame" || item.kind === "banner"))}
                  className={`btn-bouncy px-3 py-2 text-sm font-bold disabled:opacity-45 ${
                    isEquipped(item) ? "bg-[var(--surface-muted)]" : "bg-[var(--accent-yellow)] text-[#16132b]"
                  }`}
                >
                  {isEquipped(item) ? (item.kind === "frame" || item.kind === "banner" ? `${t.unequip}` : `✓ ${t.equipped}`) : t.equip}
                </button>
              )}
              {item.kind === "pet" && (
                <Link href={`/${locale}/stale-hry/mazlicci`} className="text-sm font-semibold text-[var(--brand-600)] hover:underline">
                  {t.useInPets} →
                </Link>
              )}
              {item.kind === "city" && (
                <Link href={`/${locale}/stale-hry/mesto`} className="text-sm font-semibold text-[var(--brand-600)] hover:underline">
                  {t.useInCity} →
                </Link>
              )}
            </>
          )}
          <div className="flex gap-2">
            <button type="button" onClick={() => setPreviewId(item.id)} className="btn-bouncy flex-1 bg-[var(--surface)] px-2 py-1.5 text-xs font-bold">
              👁 {x.preview}
            </button>
            {ready && (
              <button
                type="button"
                onClick={() => {
                  setGiftEmail("");
                  setGiftId(item.id);
                }}
                className="btn-bouncy flex-1 bg-[var(--surface)] px-2 py-1.5 text-xs font-bold"
              >
                🎁 {x.gift}
              </button>
            )}
          </div>
        </div>
      </article>
    );
  };

  const profileCard = (over: { avatar?: string; frame?: string | null; banner?: string | null; title?: string | null }) => {
    const banner = over.banner !== undefined ? over.banner : ready?.equipped.banner ?? null;
    const frame = over.frame !== undefined ? over.frame : ready?.equipped.frame ?? null;
    return (
      <div
        {...(banner ? bannerAttrs(banner) : {})}
        className={`flex items-center gap-4 rounded-xl border-2 border-[var(--edge)] p-5 ${banner ? "banner-anim" : "bg-[var(--surface-muted)]"}`}
        style={banner ? { background: bannerCss(banner) } : undefined}
      >
        <Avatar id={over.avatar ?? ready?.equipped.avatar ?? "robot"} size={88} frame={frame && isFrameId(frame) ? frame : null} />
        <div className="rounded-lg bg-black/35 px-3 py-2 text-white">
          <p className="font-extrabold">{locale === "cs" ? "Ty" : locale === "ru" ? "Ты" : locale === "de" ? "Du" : "You"}</p>
          {over.title && <span className="pill mt-1 bg-[var(--accent-yellow)] px-3 py-0.5 text-xs text-[#16132b]">{over.title}</span>}
        </div>
      </div>
    );
  };

  const previewBody = (item: ShopItem) => {
    switch (item.kind) {
      case "avatar":
        return profileCard({ avatar: item.ref });
      case "frame":
        return profileCard({ frame: item.ref });
      case "banner":
        return profileCard({ banner: item.ref });
      case "title":
        return profileCard({ title: item.names[locale] });
      case "pet":
        return (
          <div>
            <div className="mb-2 flex flex-wrap gap-1.5">
              {SPECIES.map((sp) => (
                <button
                  key={sp.id}
                  type="button"
                  onClick={() => setPetPick(sp.id)}
                  aria-pressed={petPick === sp.id}
                  className={`rounded-lg border-2 px-2 py-1 ${petPick === sp.id ? "border-[var(--edge)] bg-[var(--accent-yellow)]" : "border-transparent hover:border-[var(--edge)]"}`}
                  title={x.petPick}
                >
                  <PetArt species={sp.id} stage={2} mood="happy" size={34} />
                </button>
              ))}
            </div>
            <div className="flex justify-center rounded-xl border-2 border-[var(--edge)] bg-[var(--surface-muted)] py-3">
              <PetArt species={petPick} stage={3} mood="happy" size={220} accessory={item.ref} />
            </div>
          </div>
        );
      case "city":
        return <Preview item={item} locale={locale} avatar={null} />;
    }
  };

  return (
    <div>
      {header}
      <MarketBanner />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-[var(--edge)] bg-[var(--surface)] p-4 shadow-[0_4px_0_var(--shadow-ink)]">
        {ready ? (
          <p className="text-lg font-extrabold">
            ⭐ {t.yourPoints}: <span className="text-[var(--brand-600)]">{points.toLocaleString(locale)}</span>
          </p>
        ) : (
          <p className="text-sm text-[var(--muted)]">{t.loginRequired}</p>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-[var(--muted)]">{t.howToEarn}</span>
          {ready ? (
            <Link href={`/${locale}/kurzy/zakladni`} className="btn-bouncy bg-[var(--brand-500)] px-4 py-2 text-sm font-bold text-white">
              {t.learn}
            </Link>
          ) : (
            <Link href={`/${locale}/prihlaseni`} className="btn-bouncy bg-[var(--brand-500)] px-4 py-2 text-sm font-bold text-white">
              {t.login}
            </Link>
          )}
        </div>
      </div>

      <section className="mb-8">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-xl font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>
              🔥 {x.dealsTitle}
            </h2>
            <p className="text-sm text-[var(--muted)]">{x.dealsHint}</p>
          </div>
          {msLeft !== null && <span className="pill bg-[var(--surface)] px-3 py-1 text-sm">⏳ {x.resetsIn.replace("{t}", formatLeft(msLeft))}</span>}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{dealItems.map((item) => renderCard(item))}</div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>
          🎒 {x.bundlesTitle}
        </h2>
        <p className="mb-3 text-sm text-[var(--muted)]">{x.bundlesHint}</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {SHOP_BUNDLES.map((bundle) => {
            const { price, full, missing } = bundlePrice(bundle, owned);
            const all = bundle.itemIds.map((id) => getShopItem(id)).filter((i): i is ShopItem => !!i);
            const done = missing.length === 0;
            return (
              <article key={bundle.id} className="card flex flex-col gap-3 p-4" style={{ borderColor: bundle.color }}>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold">{bundle.names[locale]}</h3>
                  <span className="pill bg-[var(--accent-yellow)] px-2 py-0.5 text-[11px] text-[#16132b]">-{Math.round(BUNDLE_DISCOUNT * 100)} %</span>
                </div>
                <ul className="flex flex-wrap gap-1.5 text-xs">
                  {all.map((i) => (
                    <li
                      key={i.id}
                      className={`rounded-lg border-2 px-2 py-1 ${owned.has(i.id) ? "border-[var(--accent-green)] text-[var(--accent-green)]" : "border-[var(--edge)]"}`}
                    >
                      {owned.has(i.id) ? "✓ " : ""}
                      {i.names[locale]}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  disabled={!ready || done || busy !== null || points < price}
                  onClick={() => buyBundle(bundle)}
                  className="btn-bouncy mt-auto bg-[var(--brand-500)] px-3 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {done ? (
                    x.bundleOwned
                  ) : (
                    <>
                      ⭐ <s className="opacity-70">{full}</s> {price} · {x.bundleBuy}
                    </>
                  )}
                </button>
                {!done && <p className="text-xs text-[var(--muted)]">{x.bundleSave.replace("{n}", String(full - price))}</p>}
              </article>
            );
          })}
        </div>
      </section>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={x.search}
          aria-label={x.search}
          className="min-w-48 flex-1 rounded-lg border-2 border-[var(--edge)] bg-[var(--surface)] px-3 py-2 text-sm"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          aria-label={x.sortDefault}
          className="rounded-lg border-2 border-[var(--edge)] bg-[var(--surface)] px-3 py-2 text-sm"
        >
          <option value="default">{x.sortDefault}</option>
          <option value="asc">{x.sortAsc}</option>
          <option value="desc">{x.sortDesc}</option>
        </select>
        {ready && (
          <label className="flex items-center gap-1.5 text-sm font-semibold">
            <input type="checkbox" checked={onlyNew} onChange={(e) => setOnlyNew(e.target.checked)} /> {x.onlyNew}
          </label>
        )}
        <label className="flex items-center gap-1.5 text-sm font-semibold">
          <input type="checkbox" checked={onlyFav} onChange={(e) => setOnlyFav(e.target.checked)} /> ❤️ {x.onlyFav}
        </label>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5" role="tablist">
        {(["all", ...SHOP_KINDS] as const).map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={`rounded-lg border-2 px-3 py-1.5 text-sm font-semibold ${
              tab === k ? "border-[var(--edge)] bg-[var(--accent-yellow)] text-[#16132b]" : "border-transparent text-[var(--muted)] hover:border-[var(--edge)]"
            }`}
          >
            {k === "all" ? t.tabAll : t.tabs[k]}
          </button>
        ))}
      </div>
      {tab !== "all" && <p className="mb-4 text-sm text-[var(--muted)]">{t.hints[tab]}</p>}

      {items.length === 0 ? (
        <p className="card p-6 text-center text-[var(--muted)]">{x.noResults}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{items.map((item) => renderCard(item))}</div>
      )}


      {previewItem && (
        <Modal title={`${x.preview}: ${previewItem.names[locale]}`} onClose={() => setPreviewId(null)} closeLabel={x.close}>
          {previewBody(previewItem)}
          <p className="mt-3 text-sm text-[var(--muted)]">{x.previewHint}</p>
          {ready && !owned.has(previewItem.id) && (
            <button
              type="button"
              disabled={busy !== null || priceOf(previewItem) > points}
              onClick={async () => {
                if (await buy(previewItem)) setPreviewId(null);
              }}
              className="btn-bouncy mt-4 w-full bg-[var(--brand-500)] px-3 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-45"
            >
              {priceOf(previewItem) > points ? t.needPoints.replace("{n}", String(priceOf(previewItem) - points)) : `⭐ ${priceOf(previewItem)} · ${t.buy}`}
            </button>
          )}
        </Modal>
      )}

      {giftItem && ready && (
        <Modal title={x.giftTitle.replace("{name}", giftItem.names[locale])} onClose={() => setGiftId(null)} closeLabel={x.close}>
          <p className="mb-3 text-sm text-[var(--muted)]">{x.giftHint}</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void sendGift(giftItem);
            }}
          >
            <input
              type="email"
              required
              autoFocus
              value={giftEmail}
              onChange={(e) => setGiftEmail(e.target.value)}
              placeholder={x.giftEmail}
              aria-label={x.giftEmail}
              className="mb-4 w-full rounded-lg border-2 border-[var(--edge)] bg-[var(--surface)] px-3 py-2 text-sm"
            />
            <div className="flex gap-2">
              <button type="button" onClick={() => setGiftId(null)} className="btn-bouncy flex-1 bg-[var(--surface)] px-3 py-2 text-sm font-bold">
                {x.cancel}
              </button>
              <button
                type="submit"
                disabled={busy !== null || priceOf(giftItem) > points}
                className="btn-bouncy flex-[2] bg-[var(--brand-500)] px-3 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-45"
              >
                🎁 {x.giftSend.replace("{n}", String(priceOf(giftItem)))}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {ready && (
        <section className="mt-10">
          <button
            type="button"
            onClick={() => setHistoryOpen((o) => !o)}
            aria-expanded={historyOpen}
            className="btn-bouncy bg-[var(--surface)] px-4 py-2 text-sm font-bold"
          >
            📜 {x.historyTitle} {historyOpen ? "▲" : "▼"}
          </button>
          {historyOpen && (
            <div className="card mt-3 p-4">
              <p className="mb-3 text-sm text-[var(--muted)]">{x.historyHint}</p>
              {history === null ? (
                <div className="h-24 animate-pulse rounded-lg bg-[var(--surface-muted)]" aria-label={t.loading} />
              ) : history.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">{x.historyEmpty}</p>
              ) : (
                <ul className="divide-y divide-[var(--edge)]/30">
                  {history.map((row) => (
                    <li key={row.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                      <span>
                        <span className="font-semibold">{historyLine(row)}</span>
                        <span className="block text-xs text-[var(--muted)]">{new Date(row.createdAt).toLocaleString(locale)}</span>
                      </span>
                      <span className={`shrink-0 font-extrabold ${row.amount < 0 ? "text-[var(--danger)]" : "text-[var(--accent-green)]"}`}>
                        {row.amount === 0 ? "🎁" : `${row.amount > 0 ? "+" : ""}${row.amount} ⭐`}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>
      )}

      {message && (
        <div
          role="status"
          className={`pill fixed inset-x-0 bottom-6 z-50 mx-auto w-fit px-4 py-2 text-sm text-white shadow-lg ${
            message.ok ? "bg-[var(--accent-green)] !text-[#16132b]" : "bg-[var(--danger)]"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
