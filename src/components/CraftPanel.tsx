"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Avatar } from "@/components/Avatar";
import type { Locale } from "@/i18n/config";
import { getCraftText, type CraftTab } from "@/i18n/craft";
import { notifyAccountChanged } from "@/lib/account-events";
import { bannerCss } from "@/lib/cosmetics";
import {
  BUY_PRICE,
  MATERIALS,
  RARITIES,
  RECIPES,
  REFINE_COST,
  THEMED_WORLDS,
  WORLDS,
  materialDef,
  nextRarity,
  recipeDef,
  unlockKey,
  type Rarity,
  type Recipe,
  type RecipeCategory,
  type ThemedWorld,
} from "@/lib/craft";

type Snapshot = {
  loggedIn: true;
  now: number;
  points: number;
  focus: ThemedWorld;
  mats: Record<string, number>;
  inv: Record<string, number>;
  boosts: { kind: "xp" | "endless"; pct: number; until: number }[];
  xpTotal: number;
  endlessTotal: number;
  buyLeft: number;
  owned: string[];
  gained: Record<string, number>;
  done?: { kind: string; recipe?: string; n?: number; material?: string; world?: string };
};
type Load = { state: "loading" } | { state: "guest" } | { state: "error" } | { state: "ready"; data: Snapshot };

const TABS: CraftTab[] = ["bonuses", "avatars", "accessories", "materials"];
const TAB_ICON: Record<CraftTab, string> = { bonuses: "⚡", avatars: "🧑", accessories: "🎀", materials: "🧺" };
const ACCESSORY_SECTIONS: RecipeCategory[] = ["profile", "avatar-acc", "pet-acc", "room"];

const RARITY_COLOR: Record<Rarity, string> = { common: "var(--border-soft)", uncommon: "#3ddc97", rare: "#4da3ff", epic: "#b06bff" };
const WORLD_ICON: Record<string, string> = { obecne: "🧰", vesmir: "🚀", more: "🌊", les: "🌲", hrad: "🏰", kouzla: "🪄" };

const fmtTime = (ms: number, locale: Locale) => new Date(ms).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });

export function CraftPanel({ locale, onUnlocked, onWardrobe }: { locale: Locale; onUnlocked?: () => void; onWardrobe?: () => void }) {
  const t = getCraftText(locale);
  const [load, setLoad] = useState<Load>({ state: "loading" });
  const [tab, setTab] = useState<CraftTab>("bonuses");
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/craft", { cache: "no-store" });
      if (res.status === 401) return setLoad({ state: "guest" });
      const data = await res.json();
      if (!res.ok) return setLoad({ state: "error" });
      setLoad({ state: "ready", data });
    } catch {
      setLoad({ state: "error" });
    }
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(id);
  }, [refresh]);

  const name = (id: string | undefined) => {
    if (!id) return "";
    return recipeDef(id)?.names[locale] ?? materialDef(id)?.names[locale] ?? id;
  };

  function doneText(d: NonNullable<Snapshot["done"]>): string {
    switch (d.kind) {
      case "crafted":
        return t.done.crafted.replace("{name}", name(d.recipe));
      case "unlocked":
        return t.done.unlocked.replace("{name}", name(d.recipe));
      case "xp":
        return t.done.xp.replace("{n}", String(d.n ?? 0));
      case "endless":
        return t.done.endless.replace("{n}", String(d.n ?? 0));
      case "points":
        return t.done.points.replace("{n}", String(d.n ?? 0));
      case "wheel":
        return t.done.wheel;
      case "shield":
        return t.done.shield;
      case "bought":
        return t.done.bought;
      case "refined":
        return t.done.refined.replace("{name}", name(d.material));
      case "focus":
        return t.done.focus.replace("{name}", t.worlds[(d.world as ThemedWorld) ?? "vesmir"]);
      default:
        return "";
    }
  }

  async function act(key: string, body: Record<string, unknown>) {
    if (busy) return;
    setBusy(key);
    setToast(null);
    try {
      const res = await fetch("/api/craft", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const data = (await res.json().catch(() => ({}))) as Snapshot & { error?: string };
      if (!res.ok) {
        const code = (data.error ?? "unavailable") as keyof typeof t.errors;
        setToast({ text: t.errors[code] ?? t.errors.unavailable, ok: false });
        if (data.error === "conflict") await refresh();
        return;
      }
      setLoad({ state: "ready", data });
      if (data.done) {
        setToast({ text: doneText(data.done), ok: true });
        if (data.done.kind === "unlocked") onUnlocked?.();
        if (data.done.kind === "points" || data.done.kind === "bought") notifyAccountChanged();
      }
    } catch {
      setToast({ text: t.errors.unavailable, ok: false });
    } finally {
      setBusy(null);
    }
  }

  if (load.state === "loading") return <p className="text-sm text-[var(--muted)]">…</p>;
  if (load.state === "error") return <p className="text-sm text-[var(--danger)]">{t.errors.unavailable}</p>;
  if (load.state === "guest") {
    return (
      <section className="card flex flex-col items-start gap-3 p-5">
        <h2 className="text-xl font-bold">{t.title}</h2>
        <p className="text-[var(--muted)]">{t.loginHint}</p>
        <Link href={`/${locale}/prihlaseni`} className="btn-bouncy btn-primary px-4 py-2 text-sm font-bold">
          {t.login}
        </Link>
      </section>
    );
  }

  const data = load.data;
  const have = (id: string) => data.mats[id] ?? 0;
  const gainedList = Object.entries(data.gained ?? {});

  function costChips(cost: Recipe["cost"]) {
    return (
      <ul className="flex flex-wrap gap-1.5" aria-label={t.needs}>
        {Object.entries(cost).map(([id, c]) => {
          const def = materialDef(id);
          if (!def || !c) return null;
          const ok = have(id) >= c;
          return (
            <li
              key={id}
              title={`${def.names[locale]} · ${t.rarities[def.rarity]} · ${t.have} ${have(id)}`}
              className="flex items-center gap-1 rounded-lg border-2 bg-[var(--surface-muted)] px-2 py-0.5 text-xs font-semibold"
              style={{ borderColor: RARITY_COLOR[def.rarity] }}
            >
              <span aria-hidden>{def.icon}</span>
              <span>{def.names[locale]}</span>
              <span className={`font-mono ${ok ? "text-[var(--accent-green)]" : "text-[var(--danger)]"}`}>
                {have(id)}/{c}
              </span>
            </li>
          );
        })}
      </ul>
    );
  }

  function recipeCard(r: Recipe) {
    const key = unlockKey(r);
    const owned = key ? data.owned.includes(key) : false;
    const affordable = Object.entries(r.cost).every(([id, c]) => have(id) >= (c ?? 0));
    const inv = data.inv[r.id] ?? 0;
    const preview =
      r.output === "avatar" ? (
        <Avatar id={r.ref} size={64} locked={!owned} />
      ) : r.output === "banner" ? (
        <span aria-hidden className="block h-14 w-24 rounded-lg border-2 border-[var(--edge)]" style={{ background: bannerCss(r.ref) }} />
      ) : (
        <span aria-hidden className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-[var(--border-soft)] bg-[var(--surface-muted)] text-3xl">
          {r.icon}
        </span>
      );
    return (
      <li key={r.id} className={`flex flex-col gap-3 rounded-xl border-2 bg-[var(--surface)] p-3 ${owned ? "border-[var(--accent-green)]" : "border-[var(--border-soft)]"}`}>
        <div className="flex items-start gap-3">
          {preview}
          <div className="min-w-0 flex-1">
            <p className="font-bold leading-tight">{r.names[locale]}</p>
            <p className="mt-0.5 text-xs text-[var(--muted)]">
              {WORLD_ICON[r.world]} {t.worlds[r.world]}
            </p>
            {!r.ready && <p className="mt-1 text-xs text-[var(--faint)]">{t.soonHint}</p>}
          </div>
        </div>
        {costChips(r.cost)}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {r.output === "bonus" ? (
            <>
              <span className="text-xs text-[var(--muted)]">{t.inInventory.replace("{n}", String(inv))}</span>
              <span className="flex gap-2">
                <button
                  type="button"
                  disabled={!!busy || inv <= 0}
                  onClick={() => act(`use:${r.id}`, { action: "use", id: r.id })}
                  className="btn-bouncy bg-[var(--accent-yellow)] px-3 py-1 text-xs font-bold text-[#16132b] disabled:opacity-40"
                >
                  {t.use}
                </button>
                <button
                  type="button"
                  disabled={!!busy || !affordable}
                  onClick={() => act(`craft:${r.id}`, { action: "craft", id: r.id })}
                  className="btn-bouncy bg-[var(--brand-500)] px-3 py-1 text-xs font-bold text-white disabled:opacity-40"
                >
                  {busy === `craft:${r.id}` ? t.crafting : t.craft}
                </button>
              </span>
            </>
          ) : owned ? (
            <>
              <span className="text-xs font-bold text-[var(--accent-green)]">✓ {t.owned}</span>
              {(r.output === "avatar" || r.output === "title" || r.output === "banner") && onWardrobe && (
                <button type="button" onClick={onWardrobe} className="text-xs font-bold text-[var(--brand-600)] hover:underline">
                  {t.equipHint} →
                </button>
              )}
            </>
          ) : !r.ready ? (
            <span className="pill bg-[var(--surface-muted)] px-2.5 py-1 text-xs">{t.soon}</span>
          ) : (
            <>
              <span className="text-xs text-[var(--muted)]">{affordable ? "" : t.missing}</span>
              <button
                type="button"
                disabled={!!busy || !affordable}
                onClick={() => act(`craft:${r.id}`, { action: "craft", id: r.id })}
                className="btn-bouncy bg-[var(--brand-500)] px-3 py-1 text-xs font-bold text-white disabled:opacity-40"
              >
                {busy === `craft:${r.id}` ? t.crafting : t.craft}
              </button>
            </>
          )}
        </div>
      </li>
    );
  }

  function section(category: RecipeCategory) {
    const list = RECIPES.filter((r) => r.category === category);
    return (
      <section key={category} className="flex flex-col gap-3" aria-labelledby={`craft-${category}`}>
        <div>
          <h3 id={`craft-${category}`} className="text-lg font-bold">
            {t.sections[category].title}
          </h3>
          <p className="text-sm text-[var(--muted)]">{t.sections[category].hint}</p>
        </div>
        <ul className="grid gap-3 md:grid-cols-2">
          {list.map((r) => recipeCard(r))}
        </ul>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="card flex flex-col gap-3 p-5">
        <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          ⚒️ {t.title}
        </h2>
        <p className="text-sm text-[var(--muted)]">{t.intro}</p>
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <span className="pill bg-[var(--surface-muted)] px-2.5 py-1">
            ⚡ XP +{data.xpTotal} %
          </span>
          <span className="pill bg-[var(--surface-muted)] px-2.5 py-1">
            ⏳ {t.endlessLabel} +{Math.round(data.endlessTotal * 100)} %
          </span>
          {data.boosts.length === 0 ? (
            <span className="text-[var(--faint)]">{t.activeNone}</span>
          ) : (
            data.boosts.map((b, i) => (
              <span key={i} className="pill bg-[var(--accent-green)] px-2.5 py-1 text-white">
                {t.active}: {b.kind === "xp" ? `XP +${b.pct} %` : `${t.endlessLabel} +${Math.round(b.pct * 100)} %`} · {t.until.replace("{time}", fmtTime(b.until, locale))}
              </span>
            ))
          )}
        </div>
        {gainedList.length > 0 && (
          <div className="rounded-xl bg-[var(--surface-muted)] px-3 py-2 text-sm">
            <span className="font-bold">{t.newMaterials}</span>{" "}
            {gainedList.map(([id, c]) => (
              <span key={id} className="mr-2 whitespace-nowrap">
                {materialDef(id)?.icon} {materialDef(id)?.names[locale]} ×{c}
              </span>
            ))}
          </div>
        )}
        {toast && (
          <p role="status" className={`pill self-start px-3 py-1 text-sm ${toast.ok ? "bg-[var(--accent-green)] text-white" : "bg-[var(--danger)] text-white"}`}>
            {toast.text}
          </p>
        )}
      </section>

      <nav className="flex flex-wrap gap-2" role="tablist" aria-label={t.title}>
        {TABS.map((x) => (
          <button
            key={x}
            type="button"
            role="tab"
            aria-selected={tab === x}
            onClick={() => setTab(x)}
            className={`btn-bouncy flex items-center gap-1.5 px-4 py-2 text-sm font-extrabold ${tab === x ? "bg-[var(--brand-500)] text-white" : "bg-[var(--surface)]"}`}
          >
            <span aria-hidden>{TAB_ICON[x]}</span> {t.tabs[x]}
          </button>
        ))}
      </nav>

      {tab === "bonuses" && section("bonus")}
      {tab === "avatars" && section("avatar")}
      {tab === "accessories" && (
        <div className="flex flex-col gap-8">
          {ACCESSORY_SECTIONS.map((c) => section(c))}
        </div>
      )}

      {tab === "materials" && (
        <div className="flex flex-col gap-6">
          <section className="card flex flex-col gap-3 p-5" aria-labelledby="craft-focus">
            <h3 id="craft-focus" className="text-lg font-bold">
              {t.focusTitle}
            </h3>
            <p className="text-sm text-[var(--muted)]">{t.focusHint}</p>
            <div className="flex flex-wrap gap-2">
              {THEMED_WORLDS.map((w) => (
                <button
                  key={w}
                  type="button"
                  aria-pressed={data.focus === w}
                  disabled={!!busy}
                  onClick={() => data.focus !== w && act(`focus:${w}`, { action: "focus", world: w })}
                  className={`btn-bouncy px-3 py-1.5 text-sm font-bold ${data.focus === w ? "bg-[var(--brand-500)] text-white" : "bg-[var(--surface)]"}`}
                >
                  {WORLD_ICON[w]} {t.worlds[w]}
                </button>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-3" aria-labelledby="craft-inventory">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 id="craft-inventory" className="text-lg font-bold">
                {t.inventory}
              </h3>
              <span className="text-xs text-[var(--muted)]">
                {t.buyLeft.replace("{n}", String(data.buyLeft))} · {data.points} {t.points}
              </span>
            </div>
            <p className="text-xs text-[var(--faint)]">
              {t.refineHint} {t.buyHint}
            </p>
            <div className="flex flex-col gap-3">
              {WORLDS.map((w) => (
                <div key={w} className="rounded-xl border-2 border-[var(--border-soft)] bg-[var(--surface)] p-3">
                  <p className="mb-2 text-sm font-bold">
                    {WORLD_ICON[w]} {t.worlds[w]}
                  </p>
                  <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {RARITIES.map((rar) => {
                      const def = MATERIALS.find((x) => x.world === w && x.rarity === rar)!;
                      const count = have(def.id);
                      const price = BUY_PRICE[rar];
                      const up = nextRarity(rar);
                      return (
                        <li key={def.id} className="flex flex-col gap-1.5 rounded-lg border-2 bg-[var(--surface-muted)] p-2" style={{ borderColor: RARITY_COLOR[rar] }}>
                          <div className="flex items-center gap-2">
                            <span aria-hidden className="text-2xl">
                              {def.icon}
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-bold">{def.names[locale]}</span>
                              <span className="block text-[11px] text-[var(--muted)]">{t.rarities[rar]}</span>
                            </span>
                            <span className="ml-auto font-mono text-sm font-bold">{count}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {up && (
                              <button
                                type="button"
                                title={`${t.refineTitle}: ${REFINE_COST} × ${def.names[locale]} → 1 × ${MATERIALS.find((x) => x.world === w && x.rarity === up)?.names[locale]}`}
                                disabled={!!busy || count < REFINE_COST}
                                onClick={() => act(`refine:${def.id}`, { action: "refine", id: def.id })}
                                className="rounded-md border-2 border-[var(--edge)] px-1.5 py-0.5 text-[11px] font-bold disabled:opacity-40"
                              >
                                ⬆ {t.refineAction}
                              </button>
                            )}
                            {price && (
                              <button
                                type="button"
                                disabled={!!busy || data.buyLeft <= 0 || data.points < price}
                                onClick={() => act(`buy:${def.id}`, { action: "buy", id: def.id, count: 1 })}
                                className="rounded-md border-2 border-[var(--edge)] px-1.5 py-0.5 text-[11px] font-bold disabled:opacity-40"
                              >
                                🛒 {t.buyFor.replace("{n}", String(price))}
                              </button>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section className="card flex flex-col gap-3 p-5" aria-labelledby="craft-how">
            <h3 id="craft-how" className="text-lg font-bold">
              {t.howTitle}
            </h3>
            <ul className="flex list-none flex-col gap-2 text-sm">
              <li>📚 {t.how.learn}</li>
              <li>🎮 {t.how.quests}</li>
              <li>🛒 {t.how.buy}</li>
              <li>⬆ {t.how.refine}</li>
            </ul>
            <div className="flex flex-wrap gap-2">
              <Link href={`/${locale}/kurzy`} className="btn-bouncy btn-primary px-4 py-2 text-sm font-bold">
                {t.goLearn}
              </Link>
              <Link href={`/${locale}/stale-hry`} className="btn-bouncy bg-[var(--surface)] px-4 py-2 text-sm font-bold">
                {t.goQuests}
              </Link>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
