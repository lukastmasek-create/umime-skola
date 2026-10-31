import Link from "next/link";
import { notFound } from "next/navigation";
import { FullscreenFrame } from "@/components/FullscreenFrame";
import { isLocale, type Locale } from "@/i18n/config";
import { gameMeta } from "@/i18n/games-meta";
import { getSetsExtraText } from "@/i18n/sets-extra";
import { canPlay } from "@/lib/game-fit";
import { CLASSIC_SLUGS, GAMES } from "@/lib/games";
import { loadOwnSet } from "@/lib/set-questions";

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
      <div className="px-4 py-10 sm:px-6 sm:py-16">
        <div className="card mx-auto flex max-w-md flex-col items-center gap-3 p-6 text-center">
          <p>{t.playLogin}</p>
          <Link href={`/${locale}/prihlaseni`} className="btn-bouncy btn-primary btn-lg">
            →
          </Link>
        </div>
      </div>
    );
  }
  const games = CLASSIC_SLUGS.map((slug) => GAMES.find((g) => g.slug === slug)).filter((g) => g && g.available && !g.archived);
  return (
    <div className="px-4 py-10 sm:px-6 sm:py-16">
      <FullscreenFrame locale={locale as Locale} backHref={back}>
        <div className="mx-auto flex max-w-4xl flex-col gap-5">
          <div>
            <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
              {t.playTitle}: {set.title}
            </h1>
            <p className="text-[var(--muted)]">{t.playSubtitle}</p>
            <p className="text-sm text-[var(--faint)]">{t.needFour}</p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((g) => {
              if (!g) return null;
              const meta = gameMeta(g.slug, locale as Locale);
              const ok = canPlay(g.slug, set.questions, DIFFICULTY);
              const body = (
                <>
                  <span className="text-3xl" aria-hidden>
                    {g.emoji}
                  </span>
                  <span className="flex flex-col">
                    <span className="font-bold">{meta.name}</span>
                    <span className="text-sm text-[var(--muted)]">{ok ? meta.tag : t.playNeedMore}</span>
                  </span>
                </>
              );
              return (
                <li key={g.slug}>
                  {ok ? (
                    <Link href={`/${locale}/hrat-spolecne/sady/${id}/hra/${g.slug}`} className="card flex items-center gap-3 p-4 transition hover:-translate-y-0.5">
                      {body}
                    </Link>
                  ) : (
                    <div className="card flex items-center gap-3 p-4 opacity-50" aria-disabled>
                      {body}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          <Link href={back} className="text-sm font-bold text-[var(--brand-600)] hover:underline">
            ← {t.backToSet}
          </Link>
        </div>
      </FullscreenFrame>
    </div>
  );
}
