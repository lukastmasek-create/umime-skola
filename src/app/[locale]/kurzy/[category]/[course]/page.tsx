import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCategoryBySlug } from "@/lib/taxonomy";
import { getDictionary } from "@/i18n/dictionaries";
import { getTestText } from "@/i18n/test";
import { isLocale, type Locale } from "@/i18n/config";

export const revalidate = 0;

const DIFFICULTIES = [1, 2, 3, 4, 5];

export default async function CoursePage({
  params,
}: {
  params: Promise<{ locale: string; category: string; course: string }>;
}) {
  const { locale, category: categorySlug, course: courseSlug } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale as Locale);
  const t = getTestText(locale as Locale);

  const category = getCategoryBySlug(categorySlug);
  if (!category) notFound();

  let course: {
    title: string;
    slug: string;
    description: string | null;
    levels: { order: number; published: boolean }[];
  } | null = null;
  try {
    course = await prisma.course.findFirst({
      where: { slug: courseSlug, category: category.value, published: true },
      select: {
        title: true,
        slug: true,
        description: true,
        levels: { select: { order: true, published: true } },
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

  const base = `/${locale}/kurzy/${category.slug}/${course.slug}`;
  const isAvailable = (n: number) => course.levels.some((l) => l.order === n && l.published);

  const grid = (kind: "kurz" | "test") => (
    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {DIFFICULTIES.map((n) => {
        const available = isAvailable(n);
        const className = `level-card card flex flex-col items-center gap-2 p-4 text-center ${
          available ? "is-unlocked" : "is-locked"
        }`;
        const content = (
          <>
            <span
              className={`pill h-10 w-10 items-center justify-center text-base font-bold ${
                available
                  ? "bg-[var(--brand-500)] text-white"
                  : "bg-[var(--surface-muted)] text-[var(--foreground)]/40"
              }`}
            >
              {available ? n : "🔒"}
            </span>
            <h3 className="text-sm font-semibold">{t.difficulties[n - 1]}</h3>
            <p className="text-xs text-[var(--foreground)]/50">
              {available ? (kind === "kurz" ? `🎮 ${t.openCourse}` : `📝 ${t.openTest}`) : t.locked}
            </p>
          </>
        );
        return available ? (
          <Link key={n} href={`${base}/${kind}/${n}`} className={className}>
            {content}
          </Link>
        ) : (
          <div key={n} className={className}>
            {content}
          </div>
        );
      })}
    </div>
  );

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
        <p className="mb-8 text-[var(--foreground)]/60">{course.description}</p>
      )}

      <h2 className="mb-1 text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
        🎮 {t.coursesTitle}
      </h2>
      <p className="mb-4 text-sm text-[var(--foreground)]/50">{t.coursesSubtitle}</p>
      {grid("kurz")}

      <h2 className="mb-1 mt-12 text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
        📝 {t.testsTitle}
      </h2>
      <p className="mb-4 text-sm text-[var(--foreground)]/50">{t.testsSubtitle}</p>
      {grid("test")}
    </div>
  );
}
