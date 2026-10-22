"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { PetArt } from "@/components/idle/PetArt";
import { BANNERS, isFrameId } from "@/lib/cosmetics";
import { SHOP_ITEMS, SHOP_KINDS, type ShopItem, type ShopKind } from "@/lib/shop";
import { getShopText } from "@/i18n/shop";
import { notifyAccountChanged } from "@/lib/account-events";
import type { Locale } from "@/i18n/config";

type Equipped = { avatar: string | null; title: string | null; frame: string | null; banner: string | null };
type Snapshot = { loggedIn: true; points: number; owned: string[]; equipped: Equipped };
type State = { status: "loading" } | { status: "unavailable" } | { status: "guest" } | { status: "ready"; data: Snapshot };

const CITY_PREVIEW: Record<string, { emoji: string; color: string }> = {
  christmas_tree: { emoji: "🎄", color: "#7ee0b0" },
  windmill: { emoji: "🌾", color: "#ffc933" },
  ferris_wheel: { emoji: "🎡", color: "#8fd0ff" },
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
      return <div className={box} style={{ background: BANNERS[item.ref] }} />;
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

  const errorText = (code: string | undefined) =>
    t.errors[(code as keyof typeof t.errors) ?? "generic"] ?? t.errors.generic;

  async function buy(item: ShopItem) {
    if (busy) return;
    setBusy(item.id);
    try {
      const res = await fetch("/api/shop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "buy", id: item.id }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast(errorText(json.error) + (json.detail ? ` (${json.detail})` : ""));
        if (json.error === "owned") void load();
        return;
      }
      setState({ status: "ready", data: json });
      notifyAccountChanged();
      toast(t.bought.replace("{name}", item.names[locale]), true);
    } catch {
      toast(t.errors.generic);
    } finally {
      setBusy(null);
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
  const points = ready?.points ?? 0;
  const items = SHOP_ITEMS.filter((i) => tab === "all" || i.kind === tab);

  const isEquipped = (item: ShopItem) => !!ready && ready.equipped[item.kind as keyof Equipped] === item.ref;

  return (
    <div>
      {header}

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => {
          const have = owned.has(item.id);
          const equippable = item.kind === "avatar" || item.kind === "title" || item.kind === "frame" || item.kind === "banner";
          const missing = item.price - points;
          return (
            <article key={item.id} className="card flex flex-col gap-3 p-4">
              <div className="relative">
                <Preview item={item} locale={locale} avatar={ready?.equipped.avatar ?? null} />
                {item.tag && (
                  <span className="pill absolute left-2 top-2 bg-[var(--accent-500)] px-2 py-0.5 text-[11px] text-white">
                    {item.tag === "new" ? t.tagNew : t.tagPopular}
                  </span>
                )}
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
                    {ready && missing > 0 ? t.needPoints.replace("{n}", String(missing)) : `⭐ ${item.price} · ${t.buy}`}
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
              </div>
            </article>
          );
        })}
      </div>

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
