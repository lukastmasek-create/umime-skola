import type { Metadata } from "next";
import { defaultLocale, isLocale, locales, type Locale } from "@/i18n/config";
import { getHomeStartText } from "@/i18n/home-start";
import { getDictionary } from "@/i18n/dictionaries";
import { getCommunityText } from "@/i18n/community";
import { getIdleText } from "@/i18n/idle";
import { getScratchText } from "@/i18n/scratch";
import { getEscapeText } from "@/i18n/escape";
import { getTownHubText } from "@/i18n/town";
import { getTeamsText } from "@/i18n/teams";
import { getSocialText } from "@/i18n/social";
import { getRoomText } from "@/i18n/room";
import { getReviewText } from "@/i18n/review";
import { getLiveText } from "@/i18n/live";
import { getDailyQuizText } from "@/i18n/daily-quiz";
import { getPlayerMarketText } from "@/i18n/player-market";
import { getAudiencePagesText } from "@/i18n/audience";

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

// Plné kódy jazyka pro og:locale (Facebook a další očekávají jazyk_ZEMĚ).
export const OG_LOCALE: Record<Locale, string> = {
  cs: "cs_CZ", en: "en_US", de: "de_DE", ru: "ru_RU", uk: "uk_UA", ja: "ja_JP", es: "es_ES", fr: "fr_FR",
};

// Náhledový obrázek (src/app/[locale]/opengraph-image.png). Vlastní openGraph na stránce by ho jinak
// přepsal, proto se uvádí výslovně. Next ho servíruje pod zástupným segmentem „-“.
export const OG_IMAGE = { url: "/-/opengraph-image.png", width: 1200, height: 630, alt: SITE_NAME, type: "image/png" };
export const TWITTER_IMAGE = { url: "/-/twitter-image.png", width: 1200, height: 630, alt: SITE_NAME, type: "image/png" };

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
    openGraph: {
      title: full,
      description,
      siteName: SITE_NAME,
      type: "website",
      url: `/${locale}${path}`,
      locale: OG_LOCALE[locale],
      alternateLocale: locales.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
      images: [OG_IMAGE],
    },
    twitter: { card: "summary_large_image", title: full, description, images: [TWITTER_IMAGE] },
  };
}

type PageInfo = (locale: Locale) => { title: string; description?: string };

// Stránky, které mají vlastní titulek odvozený z textů v navigaci. Popisek: podtitul stránky, jinak popis webu.
const STATIC_PAGES = {
  "/o-nas": (l) => ({ title: getHomeStartText(l).story }),
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
  "/ucitele": (l) => ({ title: getAudiencePagesText(l).teachers.nav, description: getAudiencePagesText(l).teachers.subtitle }),
  "/scratch": (l) => ({ title: getScratchText(l).nav, description: getScratchText(l).subtitle }),
  "/zaci": (l) => ({ title: getAudiencePagesText(l).students.nav, description: getAudiencePagesText(l).students.subtitle }),
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
