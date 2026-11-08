import type { Metadata } from "next";
import { defaultLocale, isLocale, locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getCommunityText } from "@/i18n/community";
import { getIdleText } from "@/i18n/idle";
import { getEscapeText } from "@/i18n/escape";
import { getTownHubText } from "@/i18n/town";
import { getTeamsText } from "@/i18n/teams";
import { getSocialText } from "@/i18n/social";
import { getRoomText } from "@/i18n/room";
import { getReviewText } from "@/i18n/review";
import { getLiveText } from "@/i18n/live";
import { getDailyQuizText } from "@/i18n/daily-quiz";
import { getPlayerMarketText } from "@/i18n/player-market";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://ucimesehrou.org").replace(/\/$/, "");
export const SITE_NAME = "Učíme se hrou";

// Kanonická adresa a jazykové verze (hreflang) pro cestu bez jazyka, např. "/tymy" nebo "".
export function alternatesFor(locale: Locale, path: string): NonNullable<Metadata["alternates"]> {
  return {
    canonical: `/${locale}${path}`,
    languages: {
      ...Object.fromEntries(locales.map((l) => [l, `/${l}${path}`])),
      "x-default": `/${defaultLocale}${path}`,
    },
  };
}

export function pageMetadata(
  locale: Locale,
  path: string,
  title: string,
  description: string,
  opts: { absoluteTitle?: boolean } = {},
): Metadata {
  const full = opts.absoluteTitle ? title : `${title} · ${SITE_NAME}`;
  return {
    title: opts.absoluteTitle ? { absolute: title } : title, // šablona „%s · Učíme se hrou“ je v layoutu
    description,
    alternates: alternatesFor(locale, path),
    openGraph: { title: full, description, siteName: SITE_NAME, type: "website", url: `/${locale}${path}`, locale },
  };
}

type PageInfo = (locale: Locale) => { title: string; description?: string };

// Stránky, které mají vlastní titulek odvozený z textů v navigaci. Popisek: podtitul stránky, jinak popis webu.
const STATIC_PAGES = {
  "/tymy": (l) => ({ title: getTeamsText(l).title, description: getTeamsText(l).subtitle }),
  "/unikovky": (l) => ({ title: getEscapeText(l).nav }),
  "/zebricky": (l) => ({ title: getCommunityText(l).navLeaderboards }),
  "/denni-kviz": (l) => ({ title: getDailyQuizText(l).nav, description: getDailyQuizText(l).subtitle }),
  "/stale-hry": (l) => ({ title: getIdleText(l).nav, description: getIdleText(l).subtitle }),
  "/hrat-spolecne": (l) => ({ title: getLiveText(l).nav }),
  "/mapa": (l) => ({ title: getReviewText(l).mapNav }),
  "/opakovani": (l) => ({ title: getReviewText(l).reviewNav }),
  "/obchod": (l) => ({ title: getDictionary(l).nav.shop }),
  "/parta": (l) => ({ title: getSocialText(l).league }),
  "/trziste": (l) => ({ title: getPlayerMarketText(l).title }),
  "/uzivatelsky-obchod": (l) => ({ title: getCommunityText(l).navMarketplace }),
  "/pokoj": (l) => ({ title: getRoomText(l).nav }),
  "/mestecko": (l) => ({ title: getTownHubText(l).nav }),
} satisfies Record<string, PageInfo>;

export type StaticPagePath = keyof typeof STATIC_PAGES;
export const STATIC_PAGE_PATHS = Object.keys(STATIC_PAGES) as StaticPagePath[];

// Použití v page.tsx: export const generateMetadata = staticPageMetadata("/tymy");
export function staticPageMetadata(path: StaticPagePath) {
  return async ({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> => {
    const { locale } = await params;
    if (!isLocale(locale)) return {};
    const info: ReturnType<PageInfo> = STATIC_PAGES[path](locale);
    return pageMetadata(locale, path, info.title, info.description ?? getDictionary(locale).home.subtitle);
  };
}
