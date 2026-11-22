import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/Icon";
import { SpaceShell } from "@/components/SpaceShell";
import { isLocale, type Locale } from "@/i18n/config";
import { gameMeta } from "@/i18n/games-meta";
import { getSetsExtraText } from "@/i18n/sets-extra";
import { canPlay } from "@/lib/game-fit";
import { GAME_ICON, SET_ICON } from "@/lib/game-icons";
import { CLASSIC_SLUGS, GAMES } from "@/lib/games";
import { loadOwnSet, poolFor } from "@/lib/set-questions";

export const revalidate = 0;
const DIFFICULTY = 3;

// Výběr klasické hry pro vlastní sadu. Hry, které se z otázek sady nedají sestavit, jsou vidět, ale zašedlé.
export default async function PlaySetPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  const t = getSetsExtraText(locale as Locale);
  const set = await loadOwnSet(id);
  if (set === null) notFound();
  const back = `/${locale}/hrat-spolecne/sady`;
  if (set === "login") {
    return (
      <SpaceShell title={t.playTitle} subtitle={t.playLogin} back={{ href: back, label: t.backToSet }}>
        <div className="sets-tile mx-auto flex max-w-md flex-col items-center gap-4 text-center">
          <Link href={`/${locale}/prihlaseni`} className="lobby-cta">
            →
          </Link>
        </div>
      </SpaceShell>
    );
  }
  const games = CLASSIC_SLUGS.map((slug) => GAMES.find((g) => g.slug === slug)).filter((g) => g && g.available && !g.archived);
  return (
    <SpaceShell eyebrow={t.playTitle} title={set.title} subtitle={t.playSubtitle} note={t.needFour} back={{ href: back, label: t.backToSet }}>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((g) => {
          if (!g) return null;
          const meta = gameMeta(g.slug, locale as Locale);
          const ok = canPlay(g.slug, poolFor(g.slug, set.items), DIFFICULTY);
          const body = (
            <>
              <Icon name={GAME_ICON[g.slug] ?? SET_ICON} size={72} />
              <span className="block">
                <span className="block text-lg font-black leading-tight">{meta.name}</span>
                <span className="block text-xs" style={{ color: "#cfc8e4" }}>{ok ? meta.tag : t.playNeedMore}</span>
              </span>
            </>
          );
          return (
            <li key={g.slug}>
              {ok ? (
                <Link href={`/${locale}/hrat-spolecne/sady/${id}/hra/${g.slug}`} className="arena-mode">
                  {body}
                </Link>
              ) : (
                <div className="arena-mode opacity-45 grayscale" aria-disabled>
                  {body}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </SpaceShell>
  );
}
