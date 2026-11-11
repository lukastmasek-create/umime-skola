"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, Asterisk, Check, Eye, Flame, Heart, Receipt, Star, Zap } from "lucide-react";
import { ShopModel } from "@/components/ShopModel";
import { ShopHeroArt } from "@/components/ShopHeroArt";
import { Avatar } from "@/components/Avatar";
import { Modal, Preview, type Snapshot } from "@/components/ShopView";
import { MaterialShop, LimitedShop, ProCard } from "@/components/ShopSections";
import {
  DEAL_DISCOUNT,
  SHOP_ITEMS,
  SHOP_KINDS,
  dailyDealIds,
  dayKey,
  getShopItem,
  salePrice,
  type ShopItem,
  type ShopKind,
} from "@/lib/shop";
import { SHOP_BUNDLES } from "@/lib/shop";
import { VOUCHERS } from "@/lib/vouchers";
import { getShopText } from "@/i18n/shop";
import { getShopExtraText } from "@/i18n/shop-extra";
import { notifyAccountChanged } from "@/lib/account-events";
import type { Locale } from "@/i18n/config";

type More = "materialy" | "modely" | "kolo" | "pro";
const MORE_TABS: { id: More; label: string }[] = [
  { id: "materialy", label: "Materiály" },
  { id: "modely", label: "Limitované modely" },
  { id: "kolo", label: "Kolo štěstí" },
  { id: "pro", label: "Umíme PRO" },
];

const KIND_MODEL: Record<ShopKind, string> = { avatar: "cat-avatar", title: "cat-title", frame: "cat-frame", banner: "cat-banner", pet: "cat-pet", city: "cat-city" };
const MARQUEE = ["Body", "Voucher", "Dárek", "Kolo štěstí", "Materiály", "Limitky", "Avatary", "Sady"];

const WISHLIST_KEY = "shop-wishlist";
type Review = { average: number; count: number; mine: { stars: number; text: string | null } | null; latest: { stars: number; text: string | null; name: string }[] };
type HistoryRow = { id: string; amount: number; reason: string; createdAt: string };

function Stars({ value, size = "text-base" }: { value: number; size?: string }) {
  return (
    <span className={`${size} tracking-tight text-[var(--g-accent)]`} aria-label={`${value.toFixed(1)} z 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} aria-hidden className="inline h-[1em] w-[1em]" fill={n <= Math.round(value) ? "currentColor" : "none"} />
      ))}
    </span>
  );
}

// Hit týdne: stejná věc pro všechny, mění se každé pondělí.
function weeklyHit(): ShopItem {
  const week = Math.floor((Date.now() - 4 * 86400000) / (7 * 86400000));
  const pool = SHOP_ITEMS.filter((i) => i.tag === "popular");
  const list = pool.length ? pool : SHOP_ITEMS;
  return list[week % list.length];
}

const VOUCHER_ERRORS: Record<string, string> = {
  "unknown-code": "Tenhle kód neznáme.",
  used: "Tenhle kód už jsi uplatnil.",
  rate: "Moc pokusů, zkus to za chvíli.",
  parental: "Nákupy má zakázané rodičovská kontrola.",
  "login-required": "Nejdřív se přihlas.",
};

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function GammyShop({
  locale,
  loggedIn,
  players,
  topUp,
  wheel,
}: {
  locale: Locale;
  loggedIn: boolean;
  players: number | null;
  topUp: ReactNode;
  wheel: ReactNode;
}) {
  const t = getShopText(locale);
  const x = getShopExtraText(locale);
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [kind, setKind] = useState<ShopKind | "all">("all");
  const [query, setQuery] = useState("");
  const [more, setMore] = useState<More>("materialy");
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [giftId, setGiftId] = useState<string | null>(null);
  const [giftEmail, setGiftEmail] = useState("");
  const [code, setCode] = useState("");
  const [shown, setShown] = useState(15);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [onlyFav, setOnlyFav] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<HistoryRow[] | null>(null);
  const [review, setReview] = useState<Review | null>(null);
  const [myStars, setMyStars] = useState(0);
  const [myText, setMyText] = useState("");
  const [hit, setHit] = useState<ShopItem | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const raw = JSON.parse(window.localStorage.getItem(WISHLIST_KEY) ?? "[]");
        if (Array.isArray(raw)) setWishlist(raw.filter((v): v is string => typeof v === "string"));
      } catch {}
      setHit(weeklyHit());
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

  const loadReview = useCallback(async () => {
    try {
      const res = await fetch("/api/shop/hodnoceni");
      const json = await res.json().catch(() => null);
      if (res.ok && json) {
        setReview(json);
        if (json.mine) {
          setMyStars(json.mine.stars);
          setMyText(json.mine.text ?? "");
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    const id = window.setTimeout(loadReview, 0);
    return () => window.clearTimeout(id);
  }, [loadReview]);

  async function sendReview() {
    if (!myStars) return toast("Vyber počet hvězdiček.");
    try {
      const res = await fetch("/api/shop/hodnoceni", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stars: myStars, text: myText }) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) return toast(json.error === "login-required" ? "Nejdřív se přihlas." : json.error === "rate" ? "Moc pokusů, zkus to později." : "Hodnocení se nepovedlo uložit.");
      toast("Díky za hodnocení!", true);
      void loadReview();
    } catch {
      toast("Hodnocení se nepovedlo uložit.");
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

  useEffect(() => {
    if (!historyOpen) return;
    const id = window.setTimeout(() => void loadHistory(), 0);
    return () => window.clearTimeout(id);
  }, [historyOpen, loadHistory]);

  function historyLine(row: HistoryRow): string {
    const [, k, ref, who] = row.reason.split(":");
    if (k === "voucher") return `Voucher ${ref}`;
    if (k === "bundle") return x.historyBundle.replace("{name}", SHOP_BUNDLES.find((b) => b.id === ref)?.names[locale] ?? x.historyUnknown);
    const name = getShopItem(ref)?.names[locale] ?? x.historyUnknown;
    if (k === "gift") return x.historyGift.replace("{name}", name).replace("{who}", who ?? "?");
    if (k === "received") return x.historyReceived.replace("{name}", name);
    return x.historyBuy.replace("{name}", name);
  }

  const toast = useCallback((text: string, ok = false) => {
    setMsg({ text, ok });
    window.setTimeout(() => setMsg((m) => (m?.text === text ? null : m)), 3500);
  }, []);

  const load = useCallback(async () => {
    if (!loggedIn) return;
    try {
      const res = await fetch("/api/shop");
      const json = await res.json().catch(() => null);
      if (res.ok && json?.loggedIn) setSnap(json);
    } catch {}
  }, [loggedIn]);

  useEffect(() => {
    const id = window.setTimeout(load, 0);
    return () => window.clearTimeout(id);
  }, [load]);

  const errorText = (c: string | undefined) =>
    (x.errors as Record<string, string>)[c ?? "generic"] ?? (t.errors as Record<string, string>)[c ?? "generic"] ?? t.errors.generic;

  async function post(payload: Record<string, unknown>, okText: string, key: string): Promise<boolean> {
    if (busy) return false;
    setBusy(key);
    try {
      const res = await fetch("/api/shop", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast(errorText(json.error));
        if (json.error === "owned") void load();
        return false;
      }
      setSnap(json);
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

  async function equip(item: ShopItem, remove: boolean) {
    if (busy || !snap) return;
    const field = item.kind as "avatar" | "title" | "frame" | "banner";
    setBusy(item.id);
    try {
      const res = await fetch("/api/profil", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [field]: remove ? null : item.ref }) });
      if (!res.ok) return toast(t.errors.generic);
      const value = remove ? null : item.ref;
      setSnap({ ...snap, equipped: { ...snap.equipped, [field]: value } });
      notifyAccountChanged();
    } catch {
      toast(t.errors.generic);
    } finally {
      setBusy(null);
    }
  }

  async function redeem() {
    if (busy || !code.trim()) return;
    setBusy("voucher");
    try {
      const res = await fetch("/api/shop/voucher", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) return toast(VOUCHER_ERRORS[json.error] ?? "Uplatnění se nepovedlo.");
      setCode("");
      toast(`${json.label}: +${json.added} bodů`, true);
      setSnap((s) => (s ? { ...s, points: json.points } : s));
      notifyAccountChanged();
    } catch {
      toast("Uplatnění se nepovedlo.");
    } finally {
      setBusy(null);
    }
  }

  const day = snap?.day ?? dayKey();
  const owned = new Set(snap?.owned ?? []);
  const points = snap?.points ?? 0;
  const deals = new Set(dailyDealIds(day));
  const q = query.trim().toLowerCase();
  const items = SHOP_ITEMS.filter((i) => (kind === "all" || i.kind === kind) && (!onlyFav || wishlist.includes(i.id)) && (!q || i.names[locale].toLowerCase().includes(q)));
  const previewItem = previewId ? getShopItem(previewId) : undefined;
  const dealItems = [...deals].map((id) => getShopItem(id)).filter((i): i is ShopItem => !!i);
  const giftItem = giftId ? getShopItem(giftId) : undefined;
  const loginHref = `/${locale}/prihlaseni`;
  const heroAvatars = ["avatar-astronaut", "avatar-pirate", "avatar-wizard"].map((id) => getShopItem(id)?.ref).filter((v): v is string => !!v);

  const card = (item: ShopItem) => {
    const have = owned.has(item.id);
    const price = salePrice(item, day);
    const sale = deals.has(item.id);
    const missing = price - points;
    const equippable = ["avatar", "title", "frame", "banner"].includes(item.kind);
    const on = snap?.equipped[item.kind as keyof Snapshot["equipped"]] === item.ref;
    return (
      <article key={item.id} className="gammy-panel flex flex-col gap-3 p-3 transition-transform hover:-translate-y-1">
        <div className="relative">
          <Preview item={item} locale={locale} avatar={snap?.equipped.avatar ?? null} />
          <button
            type="button"
            onClick={() => toggleWish(item.id)}
            aria-pressed={wishlist.includes(item.id)}
            aria-label={wishlist.includes(item.id) ? x.unfav : x.fav}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border border-[var(--g-line)] bg-[var(--g-bg)] text-base leading-none transition-transform hover:scale-110"
          >
            <Heart aria-hidden className="h-4 w-4" fill={wishlist.includes(item.id) ? "currentColor" : "none"} style={{ color: "var(--g-accent)" }} />
          </button>
          {(sale || item.tag) && (
            <span className="absolute left-2 top-2 rounded-full bg-[var(--g-accent)] px-2 py-0.5 text-[11px] font-bold text-[var(--g-accent-ink)]">
              {sale ? `-${Math.round(DEAL_DISCOUNT * 100)} %` : item.tag === "new" ? t.tagNew : t.tagPopular}
            </span>
          )}
        </div>
        <div>
          <h3 className="text-sm font-bold leading-tight">{item.names[locale]}</h3>
          <p className="text-xs text-[var(--muted)]">{t.tabs[item.kind]}</p>
        </div>
        <div className="mt-auto flex flex-col gap-2">
          {have ? (
            equippable ? (
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => equip(item, on && (item.kind === "frame" || item.kind === "banner"))}
                className="rounded-full border border-[var(--g-accent)] px-3 py-2 text-sm font-bold text-[var(--g-accent)] disabled:opacity-50"
              >
                {on ? (item.kind === "frame" || item.kind === "banner" ? t.unequip : <><Check aria-hidden className="inline h-4 w-4" /> {t.equipped}</>) : t.equip}
              </button>
            ) : (
              <p className="text-center text-sm font-semibold text-[var(--g-accent)]"><Check aria-hidden className="inline h-4 w-4" /> {t.owned}</p>
            )
          ) : loggedIn ? (
            <button
              type="button"
              disabled={!snap || busy !== null || missing > 0}
              onClick={() => post({ action: "buy", id: item.id }, t.bought.replace("{name}", item.names[locale]), item.id)}
              className="rounded-full bg-[var(--g-accent)] px-3 py-2 text-sm font-bold text-[var(--g-accent-ink)] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {snap && missing > 0 ? t.needPoints.replace("{n}", String(missing)) : <>{sale && <s className="opacity-60">{item.price}</s>} {price} · {t.buy}</>}
            </button>
          ) : (
            <Link href={loginHref} className="rounded-full bg-[var(--g-accent)] px-3 py-2 text-center text-sm font-bold text-[var(--g-accent-ink)]">
              {price} · {t.buy}
            </Link>
          )}
          <div className="flex justify-center gap-4 text-xs font-semibold text-[var(--muted)]">
            <button type="button" onClick={() => setPreviewId(item.id)} className="hover:text-[var(--g-accent)]">
              <Eye aria-hidden className="mr-1 inline h-3.5 w-3.5" />{x.preview}
            </button>
            {loggedIn && !have && (
              <button
                type="button"
                onClick={() => {
                  setGiftEmail("");
                  setGiftId(item.id);
                }}
                className="hover:text-[var(--g-accent)]"
              >
                {x.gift}
              </button>
            )}
          </div>
        </div>
      </article>
    );
  };

  const heading = "text-2xl font-bold sm:text-3xl";
  const headingFont = { fontFamily: "var(--font-heading)" };

  return (
    <div className="gammy overflow-hidden">
      {/* Hero */}
      <section className="gs-hero px-5 pb-10 pt-8 sm:px-10 md:pt-28">
        <div className="gs-hero-card">
        <div className="gs-hero-text">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--g-line)] px-3 py-1 text-xs text-[var(--muted)]">
            <span className="h-2 w-2 rounded-full bg-[var(--g-accent)]" /> Uč se. Vydělávej. Užívej si.
          </p>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl" style={headingFont}>
            Obchod pro <span className="text-[var(--g-accent)]">hráče</span>, kteří se učí
          </h1>
          <p className="mt-4 max-w-md text-sm text-[var(--muted)]">
            Body z učení měň za avatary, rámečky, pozadí profilu, mazlíčky i budovy do města. Denně jsou jiné slevy a kamarádům můžeš koupit dárek.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => scrollTo("zbozi")} className="rounded-full bg-[var(--g-accent)] px-6 py-2.5 text-sm font-bold text-[var(--g-accent-ink)]">
              Nakupovat <ArrowUpRight aria-hidden className="inline h-4 w-4" />
            </button>
            <button type="button" onClick={() => scrollTo("proc")} className="text-sm font-semibold text-[var(--muted)] hover:text-[var(--g-accent)]">
              Jak to funguje?
            </button>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-5 text-sm">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {heroAvatars.map((a) => (
                  <Avatar key={a} id={a} size={34} />
                ))}
              </div>
              <span className="text-[var(--muted)]">{players ? `${players.toLocaleString("cs-CZ")} hráčů` : "Hráči"}</span>
            </div>
            <button type="button" onClick={() => scrollTo("hodnoceni")} className="flex items-center gap-2" aria-label="Hodnocení obchodu">
              <span className="text-2xl font-bold">{review && review.count ? review.average.toFixed(1).replace(".", ",") : "–"}</span>
              <span className="flex flex-col items-start leading-tight">
                <Stars value={review?.average ?? 0} size="text-sm" />
                <span className="text-[11px] text-[var(--faint)]">{review?.count ?? 0} hodnocení</span>
              </span>
            </button>
            <span className="text-[var(--muted)]">
              <b className="text-[var(--foreground)]">{SHOP_ITEMS.length}</b> věcí v nabídce
            </span>
            {loggedIn ? (
              <span className="rounded-full bg-[var(--g-panel-2)] px-3 py-1 font-bold text-[var(--g-accent)]">Tvoje body: {points}</span>
            ) : (
              <Link href={loginHref} className="rounded-full border border-[var(--g-accent)] px-3 py-1 font-bold text-[var(--g-accent)]">
                Přihlásit se
              </Link>
            )}
          </div>
        </div>
          <ShopHeroArt />
        </div>
      </section>

      {/* Běžící pás */}
      <div className="gammy-marquee py-2.5" aria-hidden>
        <div className="gammy-marquee-track">
          {[0, 1].map((n) => (
            <div key={n} className="flex shrink-0 items-center">
              {MARQUEE.map((w) => (
                <span key={w + n} className="flex items-center gap-6 px-6 text-sm font-extrabold">
                  {w} <Asterisk aria-hidden className="h-4 w-4" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Oblíbené kategorie */}
      <section className="px-5 py-10 sm:px-10">
        <div className="mb-5 flex items-center justify-between">
          <h2 className={heading} style={headingFont}>Oblíbené kategorie</h2>
          <button type="button" onClick={() => { setKind("all"); scrollTo("zbozi"); }} className="rounded-full bg-[var(--g-accent)] px-4 py-1.5 text-xs font-bold text-[var(--g-accent-ink)]">
            Zobrazit vše
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {SHOP_KINDS.map((k) => (
            <button key={k} type="button" onClick={() => { setKind(k); setShown(15); scrollTo("zbozi"); }} className="gammy-panel flex flex-col items-center gap-2 p-4 text-center transition-transform hover:-translate-y-1">
              <ShopModel id={KIND_MODEL[k]} size={72} />
              <span className="text-xs font-bold">{t.tabs[k]}</span>
              <span className="text-[11px] text-[var(--faint)]">{SHOP_ITEMS.filter((i) => i.kind === k).length} věcí</span>
            </button>
          ))}
          {MORE_TABS.slice(0, 2).map((m) => (
            <button key={m.id} type="button" onClick={() => { setMore(m.id); scrollTo("dalsi"); }} className="gammy-panel flex flex-col items-center gap-2 p-4 text-center transition-transform hover:-translate-y-1">
              <ShopModel id={m.id === "materialy" ? "cat-materials" : "cat-limited"} size={72} />
              <span className="text-xs font-bold">{m.label}</span>
              <span className="text-[11px] text-[var(--faint)]">za body</span>
            </button>
          ))}
        </div>
      </section>

      {/* Dobíjení bodů a vouchery */}
      <section id="body" className="scroll-mt-4 px-5 pb-10 sm:px-10">
        <h2 className={`${heading} mb-1`} style={headingFont}>Dobij si body</h2>
        <p className="mb-5 text-sm text-[var(--muted)]">Balíčky bodů a vouchery. Body získáš i učením, zdarma.</p>
        {topUp}
        <div className="gammy-panel mt-6 grid gap-5 p-5 md:grid-cols-[1fr_1.2fr]">
          <div>
            <h3 className="text-lg font-bold" style={headingFont}>Máš voucher?</h3>
            <p className="mt-1 text-sm text-[var(--muted)]">Zadej kód a body se ti hned připíšou. Každý kód jde použít jednou.</p>
            <form
              className="mt-4 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!loggedIn) return toast("Nejdřív se přihlas.");
                void redeem();
              }}
            >
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Např. UMIME50"
                maxLength={32}
                aria-label="Kód voucheru"
                className="min-w-0 flex-1 rounded-full border border-[var(--g-line)] bg-[var(--g-bg)] px-4 py-2 text-sm uppercase outline-none focus:border-[var(--g-accent)]"
              />
              <button type="submit" disabled={busy !== null} className="rounded-full bg-[var(--g-accent)] px-5 py-2 text-sm font-bold text-[var(--g-accent-ink)] disabled:opacity-50">
                Uplatnit
              </button>
            </form>
          </div>
          <div>
            <h3 className="text-lg font-bold" style={headingFont}>Dárek pro kamaráda</h3>
            <p className="mt-1 text-sm text-[var(--muted)]">
              U každé věci níže najdeš tlačítko „{x.gift}“. Zadáš e-mail kamaráda, který u nás má účet, a věc se mu odemkne.
            </p>
            <p className="mt-3 text-xs text-[var(--faint)]">Dostupné vouchery: {VOUCHERS.length} (kódy najdeš u nás na akcích a ve zprávách).</p>
          </div>
        </div>
      </section>

      {/* Proč u nás */}
      <section id="proc" className="scroll-mt-4 px-5 pb-10 sm:px-10">
        <div className="gammy-panel grid items-center gap-6 p-6 md:grid-cols-[auto_1fr]">
          <div className="hidden h-44 w-44 items-center justify-center rounded-3xl bg-[var(--g-accent)] md:flex">
            <ShopModel id="shop-bag" size={150} />
          </div>
          <div>
            <h2 className={heading} style={headingFont}>Proč nakupovat v Umíme?</h2>
            <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">Žádné skutečné peníze nejsou potřeba. Čím víc se učíš, tím víc si můžeš dovolit.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Body za učení", "Denní slevy", "Dárky kamarádům", "Rodičovská kontrola", "Limitované edice"].map((f) => (
                <span key={f} className="rounded-full border border-[var(--g-line)] bg-[var(--g-bg)] px-4 py-2 text-xs font-bold">
                  <Check aria-hidden className="mr-1 inline h-3.5 w-3.5 text-[var(--g-accent)]" /> {f}
                </span>
              ))}
            </div>
            <div className="mt-5 flex gap-3">
              <Link href={`/${locale}/kurzy`} className="rounded-full bg-[var(--g-accent)] px-5 py-2 text-xs font-bold text-[var(--g-accent-ink)]">Vydělat body <ArrowUpRight aria-hidden className="inline h-3.5 w-3.5" /></Link>
              <Link href={`/${locale}/trziste`} className="rounded-full border border-[var(--g-accent)] px-5 py-2 text-xs font-bold text-[var(--g-accent)]">Tržiště hráčů</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Zboží */}
      <section id="zbozi" className="scroll-mt-4 px-5 pb-10 sm:px-10">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className={heading} style={headingFont}>Zboží</h2>
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShown(15); }}
            placeholder="Hledat…"
            aria-label="Hledat zboží"
            className="w-44 rounded-full border border-[var(--g-line)] bg-[var(--g-bg)] px-4 py-1.5 text-sm outline-none focus:border-[var(--g-accent)]"
          />
        </div>
        {(hit || dealItems.length > 0) && (
          <div className="mb-6 grid gap-3 md:grid-cols-[1fr_2fr]">
            {hit && (
              <div className="gammy-panel flex flex-col gap-2 p-3">
                <p className="text-xs font-extrabold uppercase tracking-wide text-[var(--g-accent)]"><Flame aria-hidden className="mr-1 inline h-4 w-4" />Hit týdne</p>
                <Preview item={hit} locale={locale} avatar={snap?.equipped.avatar ?? null} />
                <p className="text-sm font-bold">{hit.names[locale]}</p>
                <button type="button" onClick={() => setPreviewId(hit.id)} className="rounded-full bg-[var(--g-accent)] px-3 py-1.5 text-xs font-bold text-[var(--g-accent-ink)]">
                  {salePrice(hit, day)} · {x.preview}
                </button>
              </div>
            )}
            {dealItems.length > 0 && (
              <div className="gammy-panel p-3">
                <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-[var(--g-accent)]"><Zap aria-hidden className="mr-1 inline h-4 w-4" />Denní slevy −{Math.round(DEAL_DISCOUNT * 100)} %</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {dealItems.map((i) => (
                    <button key={i.id} type="button" onClick={() => setPreviewId(i.id)} className="rounded-xl border border-[var(--g-line)] p-2 text-left text-xs hover:border-[var(--g-accent)]">
                      <span className="block font-bold leading-tight">{i.names[locale]}</span>
                      <span className="text-[var(--muted)]"><s>{i.price}</s> <b className="text-[var(--g-accent)]">{salePrice(i, day)}</b></span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        <div role="tablist" className="mb-5 flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={onlyFav}
            onClick={() => { setOnlyFav((v) => !v); setShown(15); }}
            className={`rounded-full px-4 py-1.5 text-xs font-bold ${onlyFav ? "bg-[var(--g-accent)] text-[var(--g-accent-ink)]" : "border border-[var(--g-line)] text-[var(--muted)]"}`}
          >
            <Heart aria-hidden className="mr-1 inline h-3.5 w-3.5" fill="currentColor" />Oblíbené ({wishlist.length})
          </button>
          {loggedIn && (
            <button type="button" onClick={() => setHistoryOpen(true)} className="rounded-full border border-[var(--g-line)] px-4 py-1.5 text-xs font-bold text-[var(--muted)] hover:text-[var(--g-accent)]">
              <Receipt aria-hidden className="mr-1 inline h-3.5 w-3.5" />Historie nákupů
            </button>
          )}
          {(["all", ...SHOP_KINDS] as const).map((k) => (
            <button
              key={k}
              role="tab"
              aria-selected={kind === k}
              onClick={() => { setKind(k); setShown(15); }}
              className={`rounded-full px-4 py-1.5 text-xs font-bold ${kind === k ? "bg-[var(--g-accent)] text-[var(--g-accent-ink)]" : "border border-[var(--g-line)] text-[var(--muted)] hover:text-[var(--g-accent)]"}`}
            >
              {k === "all" ? "Vše" : t.tabs[k]}
            </button>
          ))}
        </div>
        {items.length === 0 ? (
          <p className="gammy-panel p-6 text-sm text-[var(--muted)]">Nic jsme nenašli.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-6">{items.slice(0, shown).map(card)}</div>
            {items.length > shown && (
              <div className="mt-6 text-center">
                <button type="button" onClick={() => setShown((n) => n + 15)} className="rounded-full bg-[var(--g-accent)] px-6 py-2 text-sm font-bold text-[var(--g-accent-ink)]">
                  Zobrazit další ({items.length - shown})
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Další: materiály, limitky, kolo, PRO */}
      <section id="dalsi" className="scroll-mt-4 px-5 pb-12 sm:px-10">
        <h2 className={`${heading} mb-4`} style={headingFont}>Další nabídka</h2>
        <div role="tablist" className="mb-5 flex flex-wrap gap-2">
          {MORE_TABS.map((m) => (
            <button
              key={m.id}
              role="tab"
              aria-selected={more === m.id}
              onClick={() => setMore(m.id)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold ${more === m.id ? "bg-[var(--g-accent)] text-[var(--g-accent-ink)]" : "border border-[var(--g-line)] text-[var(--muted)] hover:text-[var(--g-accent)]"}`}
            >
              {m.label}
            </button>
          ))}
        </div>
        {more === "materialy" && <MaterialShop locale={locale} loggedIn={loggedIn} />}
        {more === "modely" && <LimitedShop locale={locale} loggedIn={loggedIn} />}
        {more === "kolo" && wheel}
        {more === "pro" && <ProCard />}
      </section>

      <section id="hodnoceni" className="scroll-mt-4 px-5 pb-12 sm:px-10">
        <h2 className={`${heading} mb-4`} style={headingFont}>Hodnocení obchodu</h2>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="gammy-panel p-5">
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold">{review && review.count ? review.average.toFixed(1).replace(".", ",") : "–"}</span>
              <div>
                <Stars value={review?.average ?? 0} size="text-xl" />
                <p className="text-xs text-[var(--faint)]">{review?.count ?? 0} hodnocení</p>
              </div>
            </div>
            {loggedIn ? (
              <form
                className="mt-4 flex flex-col gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  void sendReview();
                }}
              >
                <p className="text-sm font-semibold">{review?.mine ? "Tvoje hodnocení (můžeš ho změnit)" : "Ohodnoť obchod"}</p>
                <div role="radiogroup" aria-label="Počet hvězdiček" className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" role="radio" aria-checked={myStars === n} aria-label={`${n} z 5`} onClick={() => setMyStars(n)} className="text-[var(--g-accent)] transition-transform hover:scale-110">
                      <Star aria-hidden className="h-8 w-8" fill={n <= myStars ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={myText}
                  onChange={(e) => setMyText(e.target.value)}
                  maxLength={280}
                  rows={3}
                  placeholder="Napiš, co se ti líbí nebo co chybí (nepovinné)"
                  aria-label="Text hodnocení"
                  className="rounded-2xl border border-[var(--g-line)] bg-[var(--g-bg)] px-4 py-2 text-sm outline-none focus:border-[var(--g-accent)]"
                />
                <button type="submit" className="self-start rounded-full bg-[var(--g-accent)] px-6 py-2 text-sm font-bold text-[var(--g-accent-ink)]">Odeslat hodnocení</button>
              </form>
            ) : (
              <p className="mt-4 text-sm text-[var(--muted)]">
                Hodnotit můžeš po přihlášení. <Link href={loginHref} className="font-bold text-[var(--g-accent)] hover:underline">Přihlásit se</Link>
              </p>
            )}
          </div>
          <div className="gammy-panel p-5">
            <h3 className="mb-3 text-sm font-bold">Co říkají hráči</h3>
            {review && review.latest.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {review.latest.map((r, i) => (
                  <li key={i} className="border-b border-[var(--g-line)] pb-3 last:border-0">
                    <Stars value={r.stars} size="text-sm" /> <span className="text-xs font-bold">{r.name}</span>
                    <p className="text-sm text-[var(--muted)]">{r.text}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[var(--muted)]">Zatím tu nejsou žádné texty. Buď první!</p>
            )}
          </div>
        </div>
      </section>

      {msg && (
        <div role="status" className={`fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-2 text-sm font-bold shadow-lg ${msg.ok ? "bg-[var(--g-accent)] text-[var(--g-accent-ink)]" : "bg-[#3a1212] text-[#ffb4b4]"}`}>
          {msg.text}
        </div>
      )}

      {previewItem && (
        <Modal title={previewItem.names[locale]} onClose={() => setPreviewId(null)} closeLabel="×">
          <div className="scale-110 py-4">
            <Preview item={previewItem} locale={locale} avatar={snap?.equipped.avatar ?? null} />
          </div>
          <p className="mt-3 text-xs text-[var(--muted)]">{t.tabs[previewItem.kind]} · {salePrice(previewItem, day)} bodů</p>
          {x.previewHint && <p className="mt-1 text-xs text-[var(--faint)]">{x.previewHint}</p>}
        </Modal>
      )}

      {historyOpen && (
        <Modal title="Historie nákupů" onClose={() => setHistoryOpen(false)} closeLabel="×">
          {history === null ? (
            <p className="text-sm text-[var(--muted)]">Načítám…</p>
          ) : history.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">Zatím nic. První nákup tě čeká.</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {history.map((r) => (
                <li key={r.id} className="flex justify-between gap-3 border-b border-[var(--g-line)] pb-2">
                  <span>{historyLine(r)}</span>
                  <span className={r.amount > 0 ? "font-bold text-[var(--g-accent)]" : "text-[var(--muted)]"}>{r.amount > 0 ? "+" : ""}{r.amount}</span>
                </li>
              ))}
            </ul>
          )}
        </Modal>
      )}

      {giftItem && (
        <Modal title={`${x.gift}: ${giftItem.names[locale]}`} onClose={() => setGiftId(null)} closeLabel="×">
          <form
            className="flex flex-col gap-3"
            onSubmit={async (e) => {
              e.preventDefault();
              const ok = await post({ action: "gift", id: giftItem.id, email: giftEmail }, x.giftSent.replace("{name}", giftItem.names[locale]), `gift-${giftItem.id}`);
              if (ok) setGiftId(null);
            }}
          >
            <input
              type="email"
              required
              value={giftEmail}
              onChange={(e) => setGiftEmail(e.target.value)}
              placeholder="E-mail kamaráda"
              className="rounded-full border border-[var(--g-line)] bg-[var(--g-bg)] px-4 py-2 text-sm outline-none focus:border-[var(--g-accent)]"
            />
            <button type="submit" disabled={busy !== null} className="rounded-full bg-[var(--g-accent)] px-4 py-2 text-sm font-bold text-[var(--g-accent-ink)] disabled:opacity-50">
              {salePrice(giftItem, day)} · {x.gift}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
