import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCategoryBySlug } from "@/lib/taxonomy";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import { getGameText } from "@/i18n/game";

export const revalidate = 0;

type CourseWithLevels = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  levels: { id: string; title: string; order: number; published: boolean }[];
};

// Dokud kurz nemá žádné skutečné levely v databázi, zobrazíme kostru
// placeholder levelů, aby bylo vidět, jak bude cesta kurzem vypadat, až se
// budou levely postupně přidávat.
const PLACEHOLDER_LEVEL_COUNT = 6;

export default async function CourseLevelsPage({
  params,
}: {
  params: Promise<{ locale: string; category: string; course: string }>;
}) {
  const { locale, category: categorySlug, course: courseSlug } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale as Locale);

  const category = getCategoryBySlug(categorySlug);
  if (!category) notFound();

  let course: CourseWithLevels | null = null;
  try {
    course = await prisma.course.findFirst({
      where: { slug: courseSlug, category: category.value, published: true },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        levels: { orderBy: { order: "asc" }, select: { id: true, title: true, order: true, published: true } },
      },
    });
  } catch {
    course = null;
  }

  if (!course) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <div className="card p-10">
          <p className="text-[var(--foreground)]/60">{dict.course.notFound}</p>
          <Link
            href={`/${locale}/kurzy/${category.slug}`}
            className="mt-4 inline-block text-sm font-semibold text-[var(--brand-600)] hover:underline"
          >
            ← {dict.course.backToCategory}
          </Link>
        </div>
      </div>
    );
  }

  const hasRealLevels = course.levels.length > 0;
  const levels = hasRealLevels
    ? course.levels
    : Array.from({ length: PLACEHOLDER_LEVEL_COUNT }, (_, i) => ({
        id: `placeholder-${i}`,
        title: `${dict.course.level} ${i + 1}`,
        order: i,
        published: false,
      }));

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <Link
        href={`/${locale}/kurzy/${category.slug}`}
        className="mb-4 inline-block text-sm font-medium text-[var(--foreground)]/50 hover:text-[var(--foreground)]"
      >
        ← {dict.course.backToCategory}
      </Link>
      <h1 className="mb-1 text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
        {course.title}
      </h1>
      {course.description && (
        <p className="mb-2 text-[var(--foreground)]/60">{course.description}</p>
      )}
      <p className="mb-6 text-sm text-[var(--foreground)]/50">{dict.course.levelsSubtitle}</p>

      <Link
        href={`/${locale}/kurzy/${category.slug}/${course.slug}/hra`}
        className="btn-bouncy mb-10 inline-flex items-center gap-2 rounded-full bg-[var(--accent-500)] px-6 py-3 text-sm font-bold text-white shadow-sm"
      >
        🚀 {getGameText(locale as Locale).play}: {getGameText(locale as Locale).title}
      </Link>

      <h2 className="mb-6 text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
        🧩 {dict.course.levelsTitle}
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {levels.map((level, i) => {
          const unlocked = hasRealLevels ? level.published : i === 0;
          return (
            <div
              key={level.id}
              className={`level-card card flex flex-col items-center gap-2 p-6 text-center ${
                unlocked ? "is-unlocked" : "is-locked"
              }`}
            >
              <span
                className={`pill h-12 w-12 items-center justify-center text-lg font-bold ${
                  unlocked
                    ? "bg-[var(--brand-500)] text-white"
                    : "bg-[var(--surface-muted)] text-[var(--foreground)]/40"
                }`}
              >
                {unlocked ? i + 1 : "🔒"}
              </span>
              <h3 className="font-semibold">{level.title}</h3>
              <p className="text-xs text-[var(--foreground)]/50">
                {unlocked && hasRealLevels ? "" : unlocked ? dict.course.comingSoon : dict.course.locked}
              </p>
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-center text-sm text-[var(--foreground)]/40">
        {dict.course.moreLevelsSoon}
      </p>
    </div>
  );
}
