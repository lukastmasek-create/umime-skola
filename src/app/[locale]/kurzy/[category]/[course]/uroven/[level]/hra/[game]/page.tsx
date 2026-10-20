import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCategoryBySlug } from "@/lib/taxonomy";
import { getGame } from "@/lib/games";
import { isLocale, type Locale } from "@/i18n/config";
import type { GameQuestion } from "@/i18n/game";
import { SpaceQuizGame } from "@/components/SpaceQuizGame";

export const revalidate = 0;

export default async function LevelGamePage({
  params,
}: {
  params: Promise<{
    locale: string;
    category: string;
    course: string;
    level: string;
    game: string;
  }>;
}) {
  const { locale, category: categorySlug, course: courseSlug, level: levelParam, game: gameSlug } =
    await params;
  if (!isLocale(locale)) notFound();
  const category = getCategoryBySlug(categorySlug);
  const game = getGame(gameSlug);
  const levelOrder = Number(levelParam);
  if (!category || !game || !game.available || !Number.isInteger(levelOrder)) notFound();

  let title: string | null = null;
  let questions: GameQuestion[] = [];
  try {
    const course = await prisma.course.findFirst({
      where: { slug: courseSlug, category: category.value, published: true },
      select: {
        title: true,
        levels: {
          where: { order: levelOrder, published: true },
          select: {
            title: true,
            questions: {
              orderBy: { order: "asc" },
              select: { prompt: true, options: true, correctIndex: true, explanation: true },
            },
          },
        },
      },
    });
    const level = course?.levels[0];
    if (course && level) {
      title = `${course.title} · ${level.title}`;
      questions = level.questions
        .filter((q) => q.options.length === 4 && q.correctIndex >= 0 && q.correctIndex < 4)
        .map((q) => ({
          prompt: q.prompt,
          options: q.options as GameQuestion["options"],
          correctIndex: q.correctIndex,
          explanation: q.explanation,
        }));
    }
  } catch {
    title = null;
  }
  if (!title) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <SpaceQuizGame
        locale={locale as Locale}
        courseSlug={courseSlug}
        courseTitle={title}
        backHref={`/${locale}/kurzy/${categorySlug}/${courseSlug}`}
        questions={questions}
      />
    </div>
  );
}
