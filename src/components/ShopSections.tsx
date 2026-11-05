"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { BUY_PER_DAY, BUY_PRICE, CASH_PRICE, MATERIALS } from "@/lib/craft";
import { LIMITED_ITEMS } from "@/lib/limited";
import { notifyAccountChanged } from "@/lib/account-events";
import type { Locale } from "@/i18n/config";

const TABS = [
  { id: "mince", label: "Mince" },
  { id: "materialy", label: "Materiály" },
  { id: "modely", label: "Modely" },
  { id: "kolo", label: "Kolo štěstí" },
] as const;
type TabId = (typeof TABS)[number]["id"];

// Záložky obchodu: obsah jednotlivých panelů dodává stránka, tady se jen přepíná.
export function ShopTabs({ panels }: { panels: Record<TabId, ReactNode> }) {
  const [tab, setTab] = useState<TabId>("mince");
  return (
    <div>
      <div role="tablist" className="mb-8 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
              tab === t.id ? "bg-[var(--brand-500)] text-white" : "bg-[var(--brand-50)] text-[var(--brand-700)] hover:bg-[var(--brand-100,var(--brand-50))]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {panels[tab]}
    </div>
  );
}

// Karta PRO verze. Samotné PRO řeší jiná session; tady je jen karta s porovnáním a odkazem, který se doplní.
export function ProCard() {
  const rows: [string, string, string][] = [
    ["Body za učení", "běžné", "násobek navíc"],
    ["Kolo štěstí", "1× denně", "víc točení"],
    ["Možnosti v obchodě a hrách", "základní", "víc možností"],
  ];
  return (
    <div className="card relative mb-10 p-6">
      <span className="pill absolute -top-3 left-6 bg-[var(--brand-500)] px-3 py-1 text-white">PRO</span>
      <h2 className="mb-1 text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
        Umíme PRO
      </h2>
      <p className="mb-4 text-sm text-[var(--muted)]">Víc bodů a víc možností. Zdarma zůstává všechno, co už máš.</p>
      <table className="mb-4 w-full text-left text-sm">
        <thead>
          <tr className="text-[var(--faint)]">
            <th className="py-1 font-medium" />
            <th className="py-1 font-medium">Zdarma</th>
            <th className="py-1 font-medium text-[var(--brand-600)]">PRO</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([what, free, pro]) => (
            <tr key={what} className="border-t border-[var(--border,rgba(0,0,0,0.08))]">
              <td className="py-2 pr-2">{what}</td>
              <td className="py-2 pr-2 text-[var(--muted)]">{free}</td>
              <td className="py-2 font-semibold">{pro}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button disabled className="w-full cursor-not-allowed rounded-full bg-[var(--brand-500)] px-4 py-2 text-sm font-semibold text-white opacity-60">
        Brzy dostupné
      </button>
    </div>
  );
}

type CraftView = { loggedIn?: boolean; points?: number; buyLeft?: number; mats?: Record<string, number> };

// Materiály na koupi: jen běžné a neobvyklé, denní limit hlídá server (/api/craft, akce buy).
export function MaterialShop({ locale, loggedIn }: { locale: Locale; loggedIn: boolean }) {
  const [view, setView] = useState<CraftView | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loggedIn) return;
    fetch("/api/craft")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setView(d))
      .catch(() => {});
  }, [loggedIn]);

  async function buy(id: string, cash = false) {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/craft", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: cash ? "buyCash" : "buy", id, count: 1 }) });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error === "points" ? "Nemáš dost bodů." : data.error === "not-enough-cash" ? "Nemáš dost peněz v Ekonomice." : data.error === "limit" ? "Dnešní limit nákupu je vyčerpaný." : "Nákup se nepovedl.");
      } else {
        setView(data);
        notifyAccountChanged();
      }
    } catch {
      setMsg("Nákup se nepovedl.");
    }
    setBusy(false);
  }

  const forSale = MATERIALS.filter((m) => BUY_PRICE[m.rarity]);
  return (
    <div>
      <p className="mb-1 text-sm text-[var(--muted)]">Běžné a neobvyklé materiály koupíš za body, nebo za peníze z Ekonomiky. Vzácnější se dají získat jen učením nebo zušlechtěním.</p>
      <p className="mb-5 text-xs text-[var(--faint)]">
        Denní limit: {BUY_PER_DAY} kusů{view?.buyLeft !== undefined ? ` (zbývá ${view.buyLeft})` : ""}
        {view?.points !== undefined ? ` · Tvoje body: ${view.points}` : ""}
      </p>
      {!loggedIn && (
        <p className="mb-4 text-sm text-[var(--muted)]">
          Nakupovat můžeš po přihlášení.{" "}
          <Link href={`/${locale}/prihlaseni`} className="font-semibold text-[var(--brand-600)] hover:underline">
            Přihlásit se
          </Link>
        </p>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {forSale.map((m) => (
          <div key={m.id} className="card flex flex-col items-center gap-1 p-4 text-center">
            <span className="text-3xl" aria-hidden>
              {m.icon}
            </span>
            <p className="text-sm font-semibold">{m.names[locale] ?? m.names.cs}</p>
            <p className="text-xs text-[var(--faint)]">{m.rarity === "common" ? "Běžný" : "Neobvyklý"}{view?.mats?.[m.id] ? ` · máš ${view.mats[m.id]}` : ""}</p>
            <button
              onClick={() => buy(m.id)}
              disabled={!loggedIn || busy || view?.buyLeft === 0}
              className="btn-bouncy mt-2 w-full rounded-full bg-[var(--brand-500)] px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Koupit za {BUY_PRICE[m.rarity]}
            </button>
            {CASH_PRICE[m.rarity] && (
              <button
                onClick={() => buy(m.id, true)}
                disabled={!loggedIn || busy || view?.buyLeft === 0}
                className="btn-bouncy w-full rounded-full border-2 border-[var(--brand-500)] px-3 py-1.5 text-xs font-semibold text-[var(--brand-600)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Koupit za {CASH_PRICE[m.rarity]} z Ekonomiky
              </button>
            )}
          </div>
        ))}
      </div>
      {msg && <p className="mt-4 text-sm text-[var(--danger)]">{msg}</p>}
    </div>
  );
}

type LimitedView = { loggedIn: boolean; points: number; items: { id: string; sold: number; serial: number | null }[] };
const KIND_LABEL = { avatar: "Avatar", frame: "Rámeček", banner: "Banner", title: "Titul" } as const;

// Limitované edice: omezený počet kusů, každý má sériové číslo.
export function LimitedShop({ locale, loggedIn }: { locale: Locale; loggedIn: boolean }) {
  const [view, setView] = useState<LimitedView | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/limitovane")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setView(d))
      .catch(() => {});
  }, []);

  async function buy(id: string) {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/limitovane", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      const data = await res.json();
      if (!res.ok) {
        const e: Record<string, string> = { "not-enough-points": "Nemáš dost bodů.", "sold-out": "Vyprodáno.", owned: "Tuhle edici už máš.", retry: "Zkus to prosím znovu.", parental: "Nákupy má zakázané rodičovská kontrola." };
        setMsg(e[data.error] ?? "Nákup se nepovedl.");
      } else {
        setView(data);
        notifyAccountChanged();
      }
    } catch {
      setMsg("Nákup se nepovedl.");
    }
    setBusy(false);
  }

  return (
    <div>
      <p className="mb-5 text-sm text-[var(--muted)]">Limitované avatary, rámečky, bannery a tituly. Každý kus má sériové číslo a po vyprodání už nepřibude.</p>
      {!loggedIn && (
        <p className="mb-4 text-sm text-[var(--muted)]">
          Nakupovat můžeš po přihlášení.{" "}
          <Link href={`/${locale}/prihlaseni`} className="font-semibold text-[var(--brand-600)] hover:underline">
            Přihlásit se
          </Link>
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {LIMITED_ITEMS.map((item) => {
          const st = view?.items.find((i) => i.id === item.id);
          const sold = st?.sold ?? 0;
          const soldOut = sold >= item.edition;
          return (
            <div key={item.id} className="card flex flex-col gap-1 p-5">
              <span className="pill w-fit bg-[var(--brand-50)] px-2 py-0.5 text-xs text-[var(--brand-700)]">{KIND_LABEL[item.kind]} · limitovaná edice</span>
              <p className="mt-1 font-bold">{item.name}</p>
              <p className="text-sm text-[var(--muted)]">Prodáno {sold} / {item.edition}</p>
              {st?.serial ? (
                <p className="mt-2 text-sm font-semibold text-[var(--brand-600)]">Vlastníš kus č. {st.serial}/{item.edition}</p>
              ) : (
                <button
                  onClick={() => buy(item.id)}
                  disabled={!loggedIn || busy || soldOut}
                  className="btn-bouncy mt-2 rounded-full bg-[var(--brand-500)] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {soldOut ? "Vyprodáno" : `Koupit za ${item.price} bodů`}
                </button>
              )}
            </div>
          );
        })}
      </div>
      {msg && <p className="mt-4 text-sm text-[var(--danger)]">{msg}</p>}
    </div>
  );
}
