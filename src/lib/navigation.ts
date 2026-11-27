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
import type { Locale } from "@/i18n/config";

export type Tab = { key: string; href: string; label: string; exact?: boolean; noActive?: boolean; guestOnly?: boolean };
export type Group = { key: string; label: string; items: Tab[] };

export function getNavigationGroups(locale: Locale, dict: Dictionary): Group[] {
  const community = getCommunityText(locale);
  const home = getHomeText(locale);
  const live = getLiveText(locale);
  const review = getReviewText(locale);
  const courses: Tab[] = CATEGORIES.map((cat) => ({
    key: cat.slug,
    href: `/${locale}/kurzy/${cat.slug}`,
    label: dict.categories[cat.slug].label,
  }));
  const settings: Tab[] = [
    { key: "prihlaseni", href: `/${locale}/prihlaseni`, label: dict.nav.login, guestOnly: true },
    { key: "registrace", href: `/${locale}/registrace`, label: dict.nav.register, guestOnly: true },
  ];
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
