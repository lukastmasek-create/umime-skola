import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCategoryBySlug } from "@/lib/taxonomy";
import { getGame, isClassicSlug } from "@/lib/games";
import { isLocale, type Locale } from "@/i18n/config";
import type { GameQuestion } from "@/i18n/game";
import { getTestText } from "@/i18n/test";
import { SpaceQuizGame } from "@/components/SpaceQuizGame";
import { ClassicGame } from "@/components/ClassicGame";

export const revalidate = 0;

const POOL_SIZE = 12;
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
    const course = await prisma.course.findFirst({
      where: { slug: courseSlug, category: category.value, published: true },
      select: {
        title: true,
        questions: {
          select: { id: true, prompt: true, options: true, correctIndex: true, explanation: true, difficulty: true },
        },
      },
    });
    if (course) {
      title = `${course.title} · ${getTestText(locale as Locale).difficulties[difficulty - 1]}`;
      // Na jednu úroveň připadá v kurzu jen pár otázek, takže kolo doplníme
      // z nejbližších obtížností (nejdřív stejná, pak sousední), ať je dost na výběr.
      questions = course.questions
        .filter((q) => q.options.length === 4 && q.correctIndex >= 0 && q.correctIndex < 4)
        .sort((a, b) => Math.abs(a.difficulty - difficulty) - Math.abs(b.difficulty - difficulty))
        .slice(0, isClassicSlug(game.slug) ? CLASSIC_POOL_SIZE : POOL_SIZE)
        .map((q) => ({
          id: q.id,
          prompt: q.prompt.replaceAll("___", "…"),
          options: q.options as GameQuestion["options"],
          correctIndex: q.correctIndex,
          explanation: q.explanation,
        }));
    }
  } catch {
    title = null;
  }
  if (!title) notFound();

  const backHref = `/${locale}/kurzy/${categorySlug}/${courseSlug}`;
  if (isClassicSlug(game.slug)) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <ClassicGame locale={locale as Locale} game={game.slug} questions={questions} difficulty={difficulty} backHref={backHref} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <SpaceQuizGame
        locale={locale as Locale}
        courseSlug={courseSlug}
        courseTitle={title}
        backHref={backHref}
        questions={questions}
        game={game.slug}
      />
    </div>
  );
}
