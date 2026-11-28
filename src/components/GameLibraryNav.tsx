import Link from "next/link";
import { getLiveText } from "@/i18n/live";
import { getIdleText } from "@/i18n/idle";
import { getEscapeText } from "@/i18n/escape";
import { tr8, type Locale } from "@/i18n/config";

const label = tr8("Knihovna her", "Game library", "Spielbibliothek", "Библиотека игр", "Бібліотека ігор", "ゲーム一覧", "Biblioteca de juegos", "Bibliothèque de jeux");
type Section = "hrat-spolecne" | "stale-hry" | "unikovky";

export function GameLibraryNav({ locale, current }: { locale: Locale; current: Section }) {
  const destinations = {
    "hrat-spolecne": getLiveText(locale).title,
    "stale-hry": getIdleText(locale).title,
    unikovky: getEscapeText(locale).list.title,
  } satisfies Record<Section, string>;

  return (
    <nav className="refresh-game-nav" aria-label={label[locale]}>
      {Object.entries(destinations).map(([path, name]) => (
        <Link key={path} href={`/${locale}/${path}`} aria-current={current === path ? "page" : undefined}>
          {name}
        </Link>
      ))}
    </nav>
  );
}
