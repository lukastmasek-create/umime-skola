"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES } from "@/lib/taxonomy";
import type { Dictionary } from "@/i18n/dictionaries";
import { getCommunityText } from "@/i18n/community";
import { getIdleText } from "@/i18n/idle";
import { getEscapeText } from "@/i18n/escape";
import { getHomeText } from "@/i18n/home";
import { getSocialText } from "@/i18n/social";
import { getRoomText } from "@/i18n/room";
import { useAccount } from "@/lib/use-account";
import type { Locale } from "@/i18n/config";

type Tab = { key: string; href: string; label: string; icon?: string };

function useTabs(locale: Locale, dict: Dictionary) {
  const community = getCommunityText(locale);
  const learn: Tab[] = CATEGORIES.map((cat) => ({
    key: cat.slug,
    href: `/${locale}/kurzy/${cat.slug}`,
    label: dict.categories[cat.slug].label,
  }));
  const play: Tab[] = [
    { key: "unikovky", href: `/${locale}/unikovky`, label: getEscapeText(locale).nav, icon: "🚪" },
    { key: "stale-hry", href: `/${locale}/stale-hry`, label: getIdleText(locale).nav, icon: "🐾" },
    { key: "parta", href: `/${locale}/parta`, label: getSocialText(locale).nav, icon: "👥" },
    { key: "pokoj", href: `/${locale}/pokoj`, label: getRoomText(locale).nav, icon: "🏠" },
    { key: "uzivatelsky-obchod", href: `/${locale}/uzivatelsky-obchod`, label: community.navMarketplace, icon: "🛒" },
    { key: "zebricky", href: `/${locale}/zebricky`, label: community.navLeaderboards, icon: "🏆" },
  ];
  return { learn, play };
}

function isActiveTab(pathname: string | null, href: string) {
  return !!pathname && (pathname === href || pathname.startsWith(`${href}/`));
}

// Řada záložek pod logem. Na širších obrazovkách se vejde celá, na užších ji
// nahrazuje MobileMenu.
export function NavTabs({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const pathname = usePathname();
  const { learn, play } = useTabs(locale, dict);

  const link = (tab: Tab) => {
    const active = isActiveTab(pathname, tab.href);
    return (
      <Link
        key={tab.key}
        href={tab.href}
        aria-current={active ? "page" : undefined}
        className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg border-2 px-3.5 py-1.5 text-sm font-semibold ${
          active
            ? "border-[var(--edge)] bg-[var(--accent-yellow)] text-[#16132b]"
            : "border-transparent text-[var(--muted)] hover:border-[var(--edge)] hover:text-[var(--foreground)]"
        }`}
      >
        {tab.icon && <span aria-hidden>{tab.icon}</span>}
        {tab.label}
      </Link>
    );
  };

  return (
    <nav aria-label="Hlavní navigace" className="hidden items-center gap-1.5 lg:flex">
      {learn.map(link)}
      <span aria-hidden className="mx-1 h-5 w-0.5 rounded bg-[var(--border-soft)]" />
      {play.map(link)}
    </nav>
  );
}

// Tlačítko Menu a rozbalovací panel pro telefony a menší okna.
export function MobileMenu({
  locale,
  dict,
  shopLabel,
  settingsLabel,
  loginLabel,
  registerLabel,
}: {
  locale: Locale;
  dict: Dictionary;
  shopLabel: string;
  settingsLabel: string;
  loginLabel: string;
  registerLabel: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [account] = useAccount();
  const { learn, play } = useTabs(locale, dict);
  const t = getHomeText(locale);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const item = (tab: Tab) => {
    const active = isActiveTab(pathname, tab.href);
    return (
      <Link
        key={tab.key}
        href={tab.href}
        onClick={() => setOpen(false)}
        aria-current={active ? "page" : undefined}
        className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-bold ${
          active
            ? "border-[var(--edge)] bg-[var(--accent-yellow)] text-[#16132b]"
            : "border-[var(--border-soft)] bg-[var(--surface-muted)]"
        }`}
      >
        {tab.icon && <span aria-hidden>{tab.icon}</span>}
        {tab.label}
      </Link>
    );
  };

  const heading = "mb-2 mt-4 text-xs font-bold uppercase tracking-wide text-[var(--muted)] first:mt-0";

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="btn-bouncy flex items-center gap-2 bg-[var(--surface)] px-3 py-1.5 text-sm font-bold"
      >
        <span aria-hidden>{open ? "✕" : "☰"}</span>
        {open ? t.closeMenu : t.menu}
      </button>

      {open && (
        <div
          id="mobile-menu"
          className="absolute inset-x-0 top-full z-40 max-h-[calc(100vh-4rem)] overflow-y-auto border-b-2 border-[var(--edge)] bg-[var(--surface)] px-4 pb-5 pt-4 shadow-[0_8px_0_var(--shadow-ink)]"
        >
          {account && !account.loggedIn && (
            <div className="mb-4 grid grid-cols-2 gap-2 sm:hidden">
              <Link
                href={`/${locale}/prihlaseni`}
                onClick={() => setOpen(false)}
                className="btn-bouncy bg-[var(--surface)] px-3 py-2.5 text-center text-sm font-bold"
              >
                {loginLabel}
              </Link>
              <Link
                href={`/${locale}/registrace`}
                onClick={() => setOpen(false)}
                className="btn-bouncy bg-[var(--brand-500)] px-3 py-2.5 text-center text-sm font-bold text-white"
              >
                {registerLabel}
              </Link>
            </div>
          )}
          <p className={heading}>{t.learn}</p>
          <div className="grid grid-cols-2 gap-2">{learn.map(item)}</div>
          <p className={heading}>{t.play}</p>
          <div className="grid grid-cols-2 gap-2">
            {play.map(item)}
            {item({ key: "obchod", href: `/${locale}/obchod`, label: shopLabel, icon: "🎡" })}
            {item({ key: "nastaveni", href: `/${locale}/nastaveni`, label: settingsLabel, icon: "⚙️" })}
          </div>
        </div>
      )}
    </div>
  );
}
