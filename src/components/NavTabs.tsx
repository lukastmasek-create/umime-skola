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
import { getTeamsText } from "@/i18n/teams";
import { getSocialText } from "@/i18n/social";
import { getRoomText } from "@/i18n/room";
import { getReviewText } from "@/i18n/review";
import { getLiveText } from "@/i18n/live";
import { getDailyQuizText } from "@/i18n/daily-quiz";
import { getContactText } from "@/i18n/contact";
import { getProText } from "@/i18n/pro";
import { getProToolsText } from "@/i18n/pro-tools";
import { getProTabsText } from "@/i18n/pro-tabs";
import { getPlayerMarketText } from "@/i18n/player-market";
import { getAudiencePagesText } from "@/i18n/audience";
import { useAccount } from "@/lib/use-account";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { setLocaleCookie } from "@/lib/locale-cookie";
import { SketchIcon, type SketchIconKind } from "@/components/SketchIcons";

type Tab = { key: string; href: string; label: string; exact?: boolean; noActive?: boolean };
type Group = { key: string; label: string; items: Tab[] };

// Každá skupina v navigaci má ručně kreslenou SVG ikonu (src/components/SketchIcons.tsx).
export const GROUP_SVG_ICON: Record<string, SketchIconKind> = {
  town: "town",
  courses: "courses",
  settings: "gear",
  games: "gamepad",
  shop: "shop",
  study: "study",
  extras: "extras",
  together: "people",
  boards: "trophy",
  info: "info",
};

function GroupIcon({ id, size }: { id: string; size: number }) {
  const kind = GROUP_SVG_ICON[id];
  if (!kind) return null;
  return <SketchIcon kind={kind} size={size} className="nav-ico sketch-nav-ico shrink-0" />;
}

export function useGroups(locale: Locale, dict: Dictionary, loggedIn: boolean | null) {
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
    settings.push({ key: "prihlaseni", href: `/${locale}/prihlaseni`, label: dict.nav.login });
    settings.push({ key: "registrace", href: `/${locale}/registrace`, label: dict.nav.register });
  }
  settings.push({ key: "nastaveni", href: `/${locale}/nastaveni`, label: dict.nav.settings });
  settings.push({ key: "zaci", href: `/${locale}/zaci`, label: getAudiencePagesText(locale).students.nav });
  settings.push({ key: "ucitele", href: `/${locale}/ucitele`, label: getAudiencePagesText(locale).teachers.nav });
  settings.push({ key: "o-nas", href: `/${locale}#o-nas`, label: home.about.title, noActive: true });
  settings.push({ key: "kontakt", href: `/${locale}/kontakt`, label: getContactText(locale).nav });
  const groups: Group[] = [
    { key: "courses", label: home.groups.courses, items: courses },
    {
      key: "games",
      label: home.groups.games,
      items: [
        { key: "denni-kviz", href: `/${locale}/denni-kviz`, label: getDailyQuizText(locale).nav },
        { key: "stale-hry", href: `/${locale}/stale-hry`, label: getIdleText(locale).nav },
        { key: "unikovky", href: `/${locale}/unikovky`, label: getEscapeText(locale).nav },
        { key: "hrat-spolecne", href: `/${locale}/hrat-spolecne`, label: live.nav, exact: true },
      ],
    },
    {
      key: "shop",
      label: getProText(locale).nav,
      items: [
        { key: "pro", href: `/${locale}/pro`, label: getProText(locale).nav },
        { key: "rodina", href: `/${locale}/rodina`, label: getProTabsText(locale).tabs.rodina },
        { key: "skola", href: `/${locale}/skola`, label: getProTabsText(locale).tabs.skola },
      ],
    },
    {
      key: "study",
      label: home.groups.study,
      items: [
        { key: "mapa", href: `/${locale}/mapa`, label: review.mapNav },
        { key: "opakovani", href: `/${locale}/opakovani`, label: review.reviewNav },
        { key: "ai-doucovatel", href: `/${locale}/pro/doucovatel`, label: getProToolsText(locale).features.doucovatel.title },
        { key: "ai-fotka", href: `/${locale}/pro/fotka`, label: getProToolsText(locale).features.fotka.title },
        { key: "ai-poznamky", href: `/${locale}/pro/poznamky`, label: getProToolsText(locale).features.poznamky.title },
        { key: "materialy", href: `/${locale}/materialy`, label: getMaterialsText(locale).nav },
      ],
    },
    {
      key: "extras",
      label: home.groups.extras,
      items: [
        { key: "pokoj", href: `/${locale}/pokoj`, label: getRoomText(locale).nav },
        { key: "uzivatelsky-obchod", href: `/${locale}/uzivatelsky-obchod`, label: community.navMarketplace },
        { key: "trziste", href: `/${locale}/trziste`, label: getPlayerMarketText(locale).title },
        { key: "index", href: `/${locale}/pokoj?tab=cards`, label: home.index, noActive: true },
      ],
    },
    {
      key: "together",
      label: home.groups.together,
      items: [
        { key: "sady", href: `/${locale}/hrat-spolecne/sady`, label: live.sets.title },
        { key: "nova", href: `/${locale}/hrat-spolecne/nova`, label: live.host.title },
        { key: "tymy", href: `/${locale}/tymy`, label: getTeamsText(locale).title },
        { key: "liga", href: `/${locale}/parta`, label: getSocialText(locale).league },
        { key: "zebricky", href: `/${locale}/zebricky`, label: community.navLeaderboards },
      ],
    },
    { key: "settings", label: home.groups.settings, items: settings },
  ];
  return groups;
}

// Na širokých obrazovkách zůstávají v liště jen tyto skupiny, ostatní jsou v tlačítku Menu.
const PRIMARY_GROUPS = new Set(["courses", "games", "study"]);

export function isActiveTab(pathname: string | null, tab: Tab) {
  if (!pathname || tab.noActive) return false;
  const path = tab.href.split("?")[0];
  return pathname === path || (!tab.exact && pathname.startsWith(`${path}/`));
}

// Odkazy na jazyky: přepnou jazyk a zůstanou na stejné stránce.
function LanguageLinks({ locale, className, onPick }: { locale: Locale; className: (active: boolean) => string; onPick?: () => void }) {
  const pathname = usePathname();
  const rest = pathname?.replace(/^\/(cs|en|de|ru|uk|ja|es|fr)/, "") || "";
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
          {localeNames[l]}
        </Link>
      ))}
    </>
  );
}

// Řada hlavních rozbalovacích skupin pod logem (jen na širokých obrazovkách);
// ostatní skupiny a celou navigaci na užších obrazovkách nabízí MobileMenu.
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
    <nav ref={rootRef} aria-label="Hlavní navigace" className="hidden min-w-0 flex-nowrap items-center min-[1180px]:flex max-[1149px]:[&_.nav-ico]:hidden max-[1149px]:[&_.nav-group]:px-1.5">
      {groups.filter((group) => PRIMARY_GROUPS.has(group.key)).map((group) => {
        const open = openKey === group.key;
        const active = group.items.some((tab) => isActiveTab(pathname, tab));
        return (
          <div key={group.key} className="relative">
            <button
              type="button"
              aria-expanded={open}
              aria-haspopup="true"
              onClick={() => setOpenKey(open ? null : group.key)}
              className={`nav-group flex items-center gap-1 whitespace-nowrap rounded-lg border-2 px-2 py-1.5 text-sm font-semibold ${
                active || open
                  ? "border-[var(--edge)] bg-[var(--accent-yellow)] text-[#16132b]"
                  : "border-transparent text-[var(--muted)] hover:border-[var(--edge)] hover:text-[var(--foreground)]"
              }`}
            >
              <GroupIcon id={group.key} size={18} />
              {group.label}
              <span aria-hidden className={`nav-caret ${open ? "nav-caret-open" : ""}`}><SketchIcon kind="chevron" size={14} /></span>
            </button>
            {open && (
              <div className="nav-panel absolute left-0 top-full z-50 mt-1 flex min-w-60 flex-col gap-1 rounded-2xl border-2 border-[var(--edge)] bg-[var(--surface)] p-2 shadow-[0_6px_0_var(--shadow-ink)]">
                <div className="mb-1 flex items-center gap-3 rounded-xl bg-[var(--surface-muted)] px-3 py-2">
                  <GroupIcon id={group.key} size={44} />
                  <span className="text-base font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>
                    {group.label}
                  </span>
                </div>
                {group.items.map((tab, i) => (
                  <Link
                    key={tab.key}
                    href={tab.href}
                    aria-current={isActiveTab(pathname, tab) ? "page" : undefined}
                    className={`nav-item ${itemClass(isActiveTab(pathname, tab))}`}
                    style={{ ["--d" as string]: `${i * 45}ms` }}
                  >
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
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [account] = useAccount();
  const groups = useGroups(locale, dict, account ? account.loggedIn : null);
  const t = getHomeText(locale);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") { setOpen(false); triggerRef.current?.focus(); }
    }
    function onOutside(e: PointerEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onOutside);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onOutside);
    };
  }, [open]);

  const itemClass = (active: boolean) =>
    `flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-bold ${
      active ? "border-[var(--edge)] bg-[var(--accent-yellow)] text-[#16132b]" : "border-[var(--border-soft)] bg-[var(--surface-muted)]"
    }`;

  return (
    <div ref={menuRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => { setOpen((v) => !v); setOpenKey(null); }}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? t.closeMenu : t.menu}
        className="btn-bouncy flex min-h-11 items-center gap-1.5 bg-[var(--surface)] px-2.5 py-1.5 text-sm font-bold sm:gap-2 sm:px-3"
      >
        <span aria-hidden><SketchIcon kind={open ? "close" : "menu"} size={20} /></span>
        <span className="hidden min-[400px]:inline">{open ? t.closeMenu : t.menu}</span>
      </button>

      {open && (
        <div
          id="mobile-menu"
          className="site-menu absolute inset-x-0 top-full z-40 max-h-[calc(100dvh-5rem)] overflow-y-auto border-b-2 border-[var(--edge)] bg-[var(--surface)] px-4 pb-5 pt-4"
        >
          <div className="mx-auto grid max-w-6xl items-start gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => {
              const expanded = openKey === group.key;
              const active = group.items.some((tab) => isActiveTab(pathname, tab));
              return (
                <div key={group.key} className={PRIMARY_GROUPS.has(group.key) ? "min-[1180px]:hidden" : undefined}>
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={`menu-group-${group.key}`}
                    onClick={() => setOpenKey(expanded ? null : group.key)}
                    className={`flex w-full items-center justify-between gap-2 rounded-xl border-2 px-3 py-3 text-left text-sm font-bold ${
                      active ? "border-[var(--edge)] bg-[var(--accent-yellow)] text-[#16132b]" : "border-[var(--edge)] bg-[var(--surface)]"
                    }`}
                  >
                    <span className="nav-group flex items-center gap-2">
                      <GroupIcon id={group.key} size={28} />
                      {group.label}
                    </span>
                    <span aria-hidden><SketchIcon kind={expanded ? "chevronUp" : "chevron"} size={16} /></span>
                  </button>
                  {expanded && (
                    <div id={`menu-group-${group.key}`} className="menu-items mt-2 grid grid-cols-1 gap-1">
                      {group.items.map((tab) => (
                        <Link
                          key={tab.key}
                          href={tab.href}
                          onClick={() => setOpen(false)}
                          aria-current={isActiveTab(pathname, tab) ? "page" : undefined}
                          className={itemClass(isActiveTab(pathname, tab))}
                        >
                          {tab.label}
                        </Link>
                      ))}
                      {group.key === "settings" && (
                        <>
                          <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[var(--muted)]">{t.languages}</p>
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

export function HeaderShop({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname();
  const href = `/${locale}/pro`;
  return (
    <Link href={href} aria-label={label} aria-current={pathname === href ? "page" : undefined} className="header-shop inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 px-2 sm:px-3">
      <GroupIcon id="shop" size={20} />
      <span className="hidden min-[360px]:inline">{label}</span>
    </Link>
  );
}
