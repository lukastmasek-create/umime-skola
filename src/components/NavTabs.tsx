"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES } from "@/lib/taxonomy";
import type { Dictionary } from "@/i18n/dictionaries";
import { getCommunityText } from "@/i18n/community";
import { getIdleText } from "@/i18n/idle";
import { getEscapeText } from "@/i18n/escape";
import { getMaterialsText } from "@/i18n/materials";
import { getHomeText } from "@/i18n/home";
import { getSocialText } from "@/i18n/social";
import { getRoomText } from "@/i18n/room";
import { getReviewText } from "@/i18n/review";
import { getLiveText } from "@/i18n/live";
import { useAccount } from "@/lib/use-account";
import { locales, localeFlags, localeNames, type Locale } from "@/i18n/config";
import { setLocaleCookie } from "@/lib/locale-cookie";

type Tab = { key: string; href: string; label: string; icon?: string; exact?: boolean; noActive?: boolean };
type Group = { key: string; label: string; icon: string; items: Tab[] };

function useGroups(locale: Locale, dict: Dictionary, loggedIn: boolean | null) {
  const community = getCommunityText(locale);
  const home = getHomeText(locale);
  const live = getLiveText(locale);
  const review = getReviewText(locale);
  const courses: Tab[] = CATEGORIES.map((cat) => ({
    key: cat.slug,
    href: `/${locale}/kurzy/${cat.slug}`,
    label: dict.categories[cat.slug].label,
  }));
  const settings: Tab[] = [];
  // Přihlášení a registrace jen hostům; než se stav účtu načte, nezobrazují se.
  if (loggedIn === false) {
    settings.push({ key: "prihlaseni", href: `/${locale}/prihlaseni`, label: dict.nav.login, icon: "🔑" });
    settings.push({ key: "registrace", href: `/${locale}/registrace`, label: dict.nav.register, icon: "✨" });
  }
  settings.push({ key: "nastaveni", href: `/${locale}/nastaveni`, label: dict.nav.settings, icon: "⚙️" });
  const groups: Group[] = [
    { key: "courses", label: home.groups.courses, icon: "🎓", items: courses },
    { key: "settings", label: home.groups.settings, icon: "⚙️", items: settings },
    {
      key: "games",
      label: home.groups.games,
      icon: "🎮",
      items: [
        { key: "stale-hry", href: `/${locale}/stale-hry`, label: getIdleText(locale).nav, icon: "🐾" },
        { key: "unikovky", href: `/${locale}/unikovky`, label: getEscapeText(locale).nav, icon: "🚪" },
        { key: "hrat-spolecne", href: `/${locale}/hrat-spolecne`, label: live.nav, icon: "🎓", exact: true },
      ],
    },
    {
      key: "shop",
      label: home.groups.shop,
      icon: "🛍️",
      items: [
        { key: "obchod", href: `/${locale}/obchod`, label: dict.nav.shop, icon: "🎡" },
        { key: "uzivatelsky-obchod", href: `/${locale}/uzivatelsky-obchod`, label: community.navMarketplace, icon: "🛒" },
      ],
    },
    {
      key: "study",
      label: home.groups.study,
      icon: "📚",
      items: [
        { key: "mapa", href: `/${locale}/mapa`, label: review.mapNav, icon: "🗺️" },
        { key: "opakovani", href: `/${locale}/opakovani`, label: review.reviewNav, icon: "🔁" },
        { key: "materialy", href: `/${locale}/materialy`, label: getMaterialsText(locale).nav, icon: "📘" },
      ],
    },
    {
      key: "extras",
      label: home.groups.extras,
      icon: "🎁",
      items: [
        { key: "pokoj", href: `/${locale}/pokoj`, label: getRoomText(locale).nav, icon: "🏠" },
        { key: "index", href: `/${locale}/pokoj?tab=cards`, label: home.index, icon: "🃏", noActive: true },
      ],
    },
    {
      key: "together",
      label: home.groups.together,
      icon: "👥",
      items: [
        { key: "sady", href: `/${locale}/hrat-spolecne/sady`, label: live.sets.title, icon: "✏️" },
        { key: "nova", href: `/${locale}/hrat-spolecne/nova`, label: live.host.title, icon: "🚀" },
        { key: "pripojit", href: `/${locale}/hrat-spolecne`, label: live.join.title, icon: "🔗", noActive: true },
      ],
    },
    {
      key: "boards",
      label: home.groups.boards,
      icon: "🏆",
      items: [
        { key: "liga", href: `/${locale}/parta`, label: getSocialText(locale).league, icon: "🥇" },
        { key: "zebricky", href: `/${locale}/zebricky`, label: community.navLeaderboards, icon: "🏆" },
      ],
    },
  ];
  return groups;
}

function isActiveTab(pathname: string | null, tab: Tab) {
  if (!pathname || tab.noActive) return false;
  const path = tab.href.split("?")[0];
  return pathname === path || (!tab.exact && pathname.startsWith(`${path}/`));
}

// Odkazy na jazyky: přepnou jazyk a zůstanou na stejné stránce.
function LanguageLinks({ locale, className, onPick }: { locale: Locale; className: (active: boolean) => string; onPick?: () => void }) {
  const pathname = usePathname();
  const rest = pathname?.replace(/^\/(cs|en|de|ru)/, "") || "";
  return (
    <>
      {locales.map((l) => (
        <Link
          key={l}
          href={`/${l}${rest}`}
          hrefLang={l}
          onClick={() => {
            setLocaleCookie(l);
            onPick?.();
          }}
          className={className(l === locale)}
        >
          <span aria-hidden>{localeFlags[l]}</span>
          {localeNames[l]}
        </Link>
      ))}
    </>
  );
}

// Řada rozbalovacích skupin pod logem. Na širších obrazovkách se vejde celá,
// na užších ji nahrazuje MobileMenu.
export function NavTabs({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const pathname = usePathname();
  const [account] = useAccount();
  const groups = useGroups(locale, dict, account ? account.loggedIn : null);
  const t = getHomeText(locale);
  const [opened, setOpened] = useState<{ key: string; path: string | null } | null>(null);
  const rootRef = useRef<HTMLElement>(null);
  // Nabídka se zavře po přechodu na jinou stránku, kliknutí mimo i klávesou Escape.
  const openKey = opened && opened.path === pathname ? opened.key : null;
  const setOpenKey = (key: string | null) => setOpened(key ? { key, path: pathname } : null);

  useEffect(() => {
    if (!openKey) return;
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpened(null);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpened(null);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openKey]);

  const itemClass = (active: boolean) =>
    `flex items-center gap-2 whitespace-nowrap rounded-lg border-2 px-3 py-2 text-sm font-semibold ${
      active
        ? "border-[var(--edge)] bg-[var(--accent-yellow)] text-[#16132b]"
        : "border-transparent text-[var(--muted)] hover:border-[var(--edge)] hover:text-[var(--foreground)]"
    }`;

  return (
    <nav ref={rootRef} aria-label="Hlavní navigace" className="hidden flex-wrap items-center gap-1 xl:flex">
      {groups.map((group) => {
        const open = openKey === group.key;
        const active = group.items.some((tab) => isActiveTab(pathname, tab));
        return (
          <div key={group.key} className="relative">
            <button
              type="button"
              aria-expanded={open}
              aria-haspopup="true"
              onClick={() => setOpenKey(open ? null : group.key)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg border-2 px-2.5 py-1.5 text-sm font-semibold ${
                active || open
                  ? "border-[var(--edge)] bg-[var(--accent-yellow)] text-[#16132b]"
                  : "border-transparent text-[var(--muted)] hover:border-[var(--edge)] hover:text-[var(--foreground)]"
              }`}
            >
              <span aria-hidden>{group.icon}</span>
              {group.label}
              <span aria-hidden className="text-xs">▾</span>
            </button>
            {open && (
              <div className="absolute left-0 top-full z-50 mt-1 flex min-w-52 flex-col gap-1 rounded-xl border-2 border-[var(--edge)] bg-[var(--surface)] p-2 shadow-[0_6px_0_var(--shadow-ink)]">
                {group.items.map((tab) => (
                  <Link
                    key={tab.key}
                    href={tab.href}
                    aria-current={isActiveTab(pathname, tab) ? "page" : undefined}
                    className={itemClass(isActiveTab(pathname, tab))}
                  >
                    {tab.icon && <span aria-hidden>{tab.icon}</span>}
                    {tab.label}
                  </Link>
                ))}
                {group.key === "settings" && (
                  <>
                    <p className="mt-1 px-3 pt-1 text-xs font-bold uppercase tracking-wide text-[var(--muted)]">{t.languages}</p>
                    <LanguageLinks locale={locale} className={itemClass} />
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

// Tlačítko Menu a rozbalovací panel pro telefony a menší okna: skupiny se
// rozklikávají, otevřená je vždy jen jedna.
export function MobileMenu({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [account] = useAccount();
  const groups = useGroups(locale, dict, account ? account.loggedIn : null);
  const t = getHomeText(locale);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const itemClass = (active: boolean) =>
    `flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-bold ${
      active ? "border-[var(--edge)] bg-[var(--accent-yellow)] text-[#16132b]" : "border-[var(--border-soft)] bg-[var(--surface-muted)]"
    }`;

  return (
    <div className="xl:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="btn-bouncy flex min-h-11 items-center gap-2 bg-[var(--surface)] px-3 py-1.5 text-sm font-bold"
      >
        <span aria-hidden>{open ? "✕" : "☰"}</span>
        {open ? t.closeMenu : t.menu}
      </button>

      {open && (
        <div
          id="mobile-menu"
          className="absolute inset-x-0 top-full z-40 max-h-[calc(100vh-4rem)] overflow-y-auto border-b-2 border-[var(--edge)] bg-[var(--surface)] px-4 pb-5 pt-4 shadow-[0_8px_0_var(--shadow-ink)]"
        >
          <div className="flex flex-col gap-2">
            {groups.map((group) => {
              const expanded = openKey === group.key;
              const active = group.items.some((tab) => isActiveTab(pathname, tab));
              return (
                <div key={group.key}>
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => setOpenKey(expanded ? null : group.key)}
                    className={`flex w-full items-center justify-between gap-2 rounded-xl border-2 px-3 py-3 text-left text-sm font-bold ${
                      active ? "border-[var(--edge)] bg-[var(--accent-yellow)] text-[#16132b]" : "border-[var(--edge)] bg-[var(--surface)]"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span aria-hidden>{group.icon}</span>
                      {group.label}
                    </span>
                    <span aria-hidden>{expanded ? "▴" : "▾"}</span>
                  </button>
                  {expanded && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {group.items.map((tab) => (
                        <Link
                          key={tab.key}
                          href={tab.href}
                          onClick={() => setOpen(false)}
                          aria-current={isActiveTab(pathname, tab) ? "page" : undefined}
                          className={itemClass(isActiveTab(pathname, tab))}
                        >
                          {tab.icon && <span aria-hidden>{tab.icon}</span>}
                          {tab.label}
                        </Link>
                      ))}
                      {group.key === "settings" && (
                        <>
                          <p className="col-span-2 mt-1 text-xs font-bold uppercase tracking-wide text-[var(--muted)]">{t.languages}</p>
                          <LanguageLinks locale={locale} className={itemClass} onPick={() => setOpen(false)} />
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
