import { notFound } from "next/navigation";
import { loadGameQuestions } from "@/lib/game-questions";
import { getCategoryBySlug } from "@/lib/taxonomy";
import { getGame, isClassicSlug } from "@/lib/games";
import { isLocale, type Locale } from "@/i18n/config";
import type { GameQuestion } from "@/i18n/game";
import { getTestText } from "@/i18n/test";
import { SpaceQuizGame } from "@/components/SpaceQuizGame";
import { FullscreenFrame } from "@/components/FullscreenFrame";
import { ClassicGame } from "@/components/ClassicGame";

export const revalidate = 0;

// Akční hry: až 12 otázek na nejdelší kolo, k tomu rezerva na míchání.
const POOL_SIZE = 20;
// Klasické hry potřebují z kurzu víc otázek na výběr (slova do osmisměrky, dvojice).
const CLASSIC_POOL_SIZE = 40;

export default async function CourseGamePage({
  params,
}: {
  params: Promise<{
    locale: string;
    category: string;
    course: string;
    difficulty: string;
    game: string;
  }>;
}) {
  const {
    locale,
    category: categorySlug,
    course: courseSlug,
    difficulty: difficultyParam,
    game: gameSlug,
  } = await params;
  if (!isLocale(locale)) notFound();
  const category = getCategoryBySlug(categorySlug);
  const game = getGame(gameSlug);
  const difficulty = Number(difficultyParam);
  if (
    !category ||
    !game ||
    !game.available ||
    game.archived ||
    !Number.isInteger(difficulty) ||
    difficulty < 1 ||
    difficulty > 5
  ) {
    notFound();
  }

  let title: string | null = null;
  let questions: GameQuestion[] = [];
  try {
    const data = await loadGameQuestions(courseSlug, category.value, difficulty, isClassicSlug(game.slug) ? CLASSIC_POOL_SIZE : POOL_SIZE);
    if (data) {
      title = `${data.title} · ${getTestText(locale as Locale).difficulties[difficulty - 1]}`;
      questions = data.questions;
    }
  } catch {
    title = null;
  }
  if (!title) notFound();

  const backHref = `/${locale}/kurzy/${categorySlug}/${courseSlug}`;
  if (isClassicSlug(game.slug)) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <FullscreenFrame locale={locale as Locale} backHref={backHref}>
          <ClassicGame locale={locale as Locale} game={game.slug} questions={questions} difficulty={difficulty} courseSlug={courseSlug} backHref={backHref} />
        </FullscreenFrame>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <FullscreenFrame locale={locale as Locale} backHref={backHref}>
        <SpaceQuizGame
          locale={locale as Locale}
          courseSlug={courseSlug}
          courseTitle={title}
          backHref={backHref}
          questions={questions}
          game={game.slug}
          level={difficulty}
        />
      </FullscreenFrame>
    </div>
  );
}
