import Link from "next/link";
import { Icon } from "@/components/Icon";
import { gameMeta } from "@/i18n/games-meta";
import type { Locale } from "@/i18n/config";
import type { GameSlug } from "@/lib/games";

// Řada menších her: ikona + název z metadat her. Hry se spouštějí z kurzů, proto odkaz vede na výběr kurzu.
const GAMES: GameSlug[] = ["pexeso", "krizovka", "osmismerka", "sibenice", "piskvorky", "bingo", "milionar", "spojovani"];

export function HomeMiniGames({ locale, title }: { locale: Locale; title: string }) {
  return (
    <section className="relative mx-auto max-w-6xl px-4 pb-16 sm:px-6" aria-labelledby="mini-title">
      <h2 id="mini-title" className="mb-5 text-xl font-bold tracking-tight sm:text-2xl" style={{ fontFamily: "var(--font-heading)" }}>
        {title}
      </h2>
      <ul className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8">
        {GAMES.map((slug) => {
          const meta = gameMeta(slug, locale);
          return (
            <li key={slug}>
              <Link
                href={`/${locale}/kurzy/zakladni`}
                title={meta.tag}
                className="card card-hover flex flex-col items-center gap-2 p-3 text-center"
              >
                <Icon name={slug} size={56} />
                <span className="text-xs font-bold leading-tight">{meta.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
