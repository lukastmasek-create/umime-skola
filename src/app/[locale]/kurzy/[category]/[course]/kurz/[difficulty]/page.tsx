import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCategoryBySlug } from "@/lib/taxonomy";
import { GAMES } from "@/lib/games";
import { getGameText } from "@/i18n/game";
import { getTestText } from "@/i18n/test";
import { isLocale, type Locale } from "@/i18n/config";

export const revalidate = 0;

export default async function CourseGamesPage({
  params,
}: {
  params: Promise<{ locale: string; category: string; course: string; difficulty: string }>;
}) {
  const { locale, category: categorySlug, course: courseSlug, difficulty: difficultyParam } =
    await params;
  if (!isLocale(locale)) notFound();
  const category = getCategoryBySlug(categorySlug);
  const difficulty = Number(difficultyParam);
  if (!category || !Number.isInteger(difficulty) || difficulty < 1 || difficulty > 5) notFound();

  const gameText = getGameText(locale as Locale);
  const testText = getTestText(locale as Locale);

  let courseTitle: string | null = null;
  let available = false;
  try {
    const course = await prisma.course.findFirst({
      where: { slug: courseSlug, category: category.value, published: true },
      select: {
        title: true,
        levels: { where: { order: difficulty, published: true }, select: { id: true } },
      },
    });
    courseTitle = course?.title ?? null;
    available = (course?.levels.length ?? 0) > 0;
  } catch {
    courseTitle = null;
  }
  if (!courseTitle || !available) notFound();

  const courseHref = `/${locale}/kurzy/${categorySlug}/${courseSlug}`;

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <Link
        href={courseHref}
        className="mb-4 inline-block text-sm font-medium text-[var(--faint)] hover:text-[var(--foreground)]"
      >
        ← {courseTitle}
      </Link>
      <h1 className="mb-1 text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
        {testText.difficulties[difficulty - 1]}
      </h1>
      <p className="mb-8 text-[var(--muted)]">{testText.coursesSubtitle}</p>

      <h2 className="mb-4 text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
        {gameText.games}
      </h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {GAMES.map((game) =>
          game.available ? (
            <Link
              key={game.slug}
              href={`${courseHref}/kurz/${difficulty}/hra/${game.slug}`}
              className="card card-hover flex flex-col items-center gap-2 p-6 text-center"
            >
              <span className="text-5xl">{game.emoji}</span>
              <span className="font-semibold">{game.name}</span>
              <span className="pill bg-[var(--accent-500)] px-3 py-1 text-white">{gameText.play}</span>
            </Link>
          ) : (
            <div
              key={game.slug}
              className="card flex flex-col items-center gap-2 p-6 text-center opacity-60"
            >
              <span className="text-5xl grayscale">{game.emoji}</span>
              <span className="font-semibold">{game.name}</span>
              <span className="pill bg-[var(--surface-muted)] px-3 py-1">{gameText.soon}</span>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
