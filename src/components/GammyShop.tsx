"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
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

const KIND_ICON: Record<ShopKind, string> = { avatar: "🧑‍🚀", title: "🏷️", frame: "🖼️", banner: "🌄", pet: "🐾", city: "🏙️" };
const MARQUEE = ["Body", "Voucher", "Dárek", "Kolo štěstí", "Materiály", "Limitky", "Avatary", "Sady"];

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
  const items = SHOP_ITEMS.filter((i) => (kind === "all" || i.kind === kind) && (!q || i.names[locale].toLowerCase().includes(q)));
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
                {on ? (item.kind === "frame" || item.kind === "banner" ? t.unequip : `✓ ${t.equipped}`) : t.equip}
              </button>
            ) : (
              <p className="text-center text-sm font-semibold text-[var(--g-accent)]">✓ {t.owned}</p>
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
          {loggedIn && !have && (
            <button
              type="button"
              onClick={() => {
                setGiftEmail("");
                setGiftId(item.id);
              }}
              className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--g-accent)]"
            >
              {x.gift}
            </button>
          )}
        </div>
      </article>
    );
  };

  const heading = "text-2xl font-bold sm:text-3xl";
  const headingFont = { fontFamily: "var(--font-heading)" };

  return (
    <div className="gammy overflow-hidden">
      {/* Hero */}
      <section className="grid items-center gap-8 px-5 py-10 sm:px-10 md:grid-cols-2">
        <div>
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
              Nakupovat ↗
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
        <div className="relative mx-auto flex h-64 w-full max-w-md items-end justify-center overflow-hidden rounded-3xl bg-[var(--g-accent)] sm:h-80">
          <span
            aria-hidden
            className="globe-sprite block h-64 w-64 drop-shadow-[0_8px_8px_rgba(0,0,0,0.35)] sm:h-80 sm:w-80"
            style={{ backgroundImage: "url(/home/obchod/stanek-poklad.webp)" }}
          />
        </div>
      </section>

      {/* Běžící pás */}
      <div className="gammy-marquee py-2.5" aria-hidden>
        <div className="gammy-marquee-track">
          {[0, 1].map((n) => (
            <div key={n} className="flex shrink-0 items-center">
              {MARQUEE.map((w) => (
                <span key={w + n} className="flex items-center gap-6 px-6 text-sm font-extrabold">
                  {w} <span>✳</span>
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
              <span className="text-4xl" aria-hidden>{KIND_ICON[k]}</span>
              <span className="text-xs font-bold">{t.tabs[k]}</span>
              <span className="text-[11px] text-[var(--faint)]">{SHOP_ITEMS.filter((i) => i.kind === k).length} věcí</span>
            </button>
          ))}
          {MORE_TABS.slice(0, 2).map((m) => (
            <button key={m.id} type="button" onClick={() => { setMore(m.id); scrollTo("dalsi"); }} className="gammy-panel flex flex-col items-center gap-2 p-4 text-center transition-transform hover:-translate-y-1">
              <span className="text-4xl" aria-hidden>{m.id === "materialy" ? "🧱" : "💎"}</span>
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
            <span className="text-7xl" aria-hidden>🛒</span>
          </div>
          <div>
            <h2 className={heading} style={headingFont}>Proč nakupovat v Umíme?</h2>
            <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">Žádné skutečné peníze nejsou potřeba. Čím víc se učíš, tím víc si můžeš dovolit.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Body za učení", "Denní slevy", "Dárky kamarádům", "Rodičovská kontrola", "Limitované edice"].map((f) => (
                <span key={f} className="rounded-full border border-[var(--g-line)] bg-[var(--g-bg)] px-4 py-2 text-xs font-bold">
                  <span className="text-[var(--g-accent)]">✓</span> {f}
                </span>
              ))}
            </div>
            <div className="mt-5 flex gap-3">
              <Link href={`/${locale}/kurzy`} className="rounded-full bg-[var(--g-accent)] px-5 py-2 text-xs font-bold text-[var(--g-accent-ink)]">Vydělat body ↗</Link>
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
        <div role="tablist" className="mb-5 flex flex-wrap gap-2">
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
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{items.slice(0, shown).map(card)}</div>
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

      {msg && (
        <div role="status" className={`fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-2 text-sm font-bold shadow-lg ${msg.ok ? "bg-[var(--g-accent)] text-[var(--g-accent-ink)]" : "bg-[#3a1212] text-[#ffb4b4]"}`}>
          {msg.text}
        </div>
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
