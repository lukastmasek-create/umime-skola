import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCategoryBySlug } from "@/lib/taxonomy";
import { GAMES } from "@/lib/games";
import { getDictionary } from "@/i18n/dictionaries";
import { getGameText } from "@/i18n/game";
import { isLocale, type Locale } from "@/i18n/config";

export const revalidate = 0;

export default async function LevelGamesPage({
  params,
}: {
  params: Promise<{ locale: string; category: string; course: string; level: string }>;
}) {
  const { locale, category: categorySlug, course: courseSlug, level: levelParam } = await params;
  if (!isLocale(locale)) notFound();
  const category = getCategoryBySlug(categorySlug);
  const levelOrder = Number(levelParam);
  if (!category || !Number.isInteger(levelOrder)) notFound();

  const dict = getDictionary(locale as Locale);
  const gameText = getGameText(locale as Locale);

  let courseTitle: string | null = null;
  let levelTitle: string | null = null;
  try {
    const course = await prisma.course.findFirst({
      where: { slug: courseSlug, category: category.value, published: true },
      select: {
        title: true,
        levels: { where: { order: levelOrder, published: true }, select: { title: true } },
      },
    });
    courseTitle = course?.title ?? null;
    levelTitle = course?.levels[0]?.title ?? null;
  } catch {
    courseTitle = null;
  }
  if (!courseTitle || !levelTitle) notFound();

  const courseHref = `/${locale}/kurzy/${categorySlug}/${courseSlug}`;

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <Link
        href={courseHref}
        className="mb-4 inline-block text-sm font-medium text-[var(--foreground)]/50 hover:text-[var(--foreground)]"
      >
        ← {courseTitle}
      </Link>
      <h1 className="mb-1 text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
        {levelTitle}
      </h1>
      <p className="mb-8 text-[var(--foreground)]/60">{dict.course.levelsSubtitle}</p>

      <h2 className="mb-4 text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
        🎮 {gameText.games}
      </h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {GAMES.map((game) =>
          game.available ? (
            <Link
              key={game.slug}
              href={`${courseHref}/uroven/${levelOrder}/hra/${game.slug}`}
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
