import { notFound } from "next/navigation";
import { ClassicGame } from "@/components/ClassicGame";
import { FullscreenFrame } from "@/components/FullscreenFrame";
import { isLocale, type Locale } from "@/i18n/config";
import { canPlay } from "@/lib/game-fit";
import { getGame, isClassicSlug } from "@/lib/games";
import { loadOwnSet } from "@/lib/set-questions";

export const revalidate = 0;
const DIFFICULTY = 3;

// Klasická hra nad vlastní sadou otázek.
export default async function PlaySetGamePage({ params }: { params: Promise<{ locale: string; id: string; game: string }> }) {
  const { locale, id, game: gameSlug } = await params;
  if (!isLocale(locale)) notFound();
  const game = getGame(gameSlug);
  if (!game || !game.available || game.archived || !isClassicSlug(game.slug)) notFound();
  const set = await loadOwnSet(id);
  if (set === null || set === "login") notFound();
  if (!canPlay(game.slug, set.questions, DIFFICULTY)) notFound();
  const backHref = `/${locale}/hrat-spolecne/sady/${id}`;
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <FullscreenFrame locale={locale as Locale} backHref={backHref}>
        <ClassicGame locale={locale as Locale} game={game.slug} questions={set.questions} difficulty={DIFFICULTY} courseSlug={`set-${id}`} backHref={backHref} />
      </FullscreenFrame>
    </div>
  );
}
