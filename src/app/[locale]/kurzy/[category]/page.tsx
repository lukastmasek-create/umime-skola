import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  CATEGORIES,
  SUBJECTS,
  getCategoryBySlug,
  getSubjectBySlug,
  type SubjectValue,
} from "@/lib/taxonomy";
import { getDictionary } from "@/i18n/dictionaries";
import { getGameText } from "@/i18n/game";
import { getSubjectText } from "@/i18n/subjects";
import { isLocale, type Locale } from "@/i18n/config";

export const revalidate = 0;

type Course = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  subject: SubjectValue | null;
  section: string | null;
};

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; category: string }>;
  searchParams: Promise<{ predmet?: string }>;
}) {
  const { locale, category: categorySlug } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale as Locale);
  const subjectText = getSubjectText(locale as Locale);
  const gameText = getGameText(locale as Locale);
  const { predmet } = await searchParams;

  const category = getCategoryBySlug(categorySlug);
  if (!category) notFound();

  // Hodnota z URL musí být platný předmět, ať do Prisma nikdy nepošleme
  // libovolný string z query parametru.
  const selectedSubject = getSubjectBySlug(predmet);

  let courses: Course[] = [];
  try {
    courses = await prisma.course.findMany({
      where: {
        published: true,
        category: category.value,
        ...(selectedSubject ? { subject: selectedSubject.value } : {}),
      },
      orderBy: [{ subject: "asc" }, { section: "asc" }, { title: "asc" }],
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        subject: true,
        section: true,
      },
    });
  } catch {
    // Databáze zatím není nastavená (např. lokální vývoj bez DATABASE_URL).
    courses = [];
  }

  // Seskupení: předmět -> kategorie (obor) -> kurzy.
  const groups = new Map<string, Map<string, Course[]>>();
  for (const course of courses) {
    const subjectKey = course.subject ?? "OTHER";
    const sectionKey = course.section ?? "";
    if (!groups.has(subjectKey)) groups.set(subjectKey, new Map());
    const sections = groups.get(subjectKey)!;
    if (!sections.has(sectionKey)) sections.set(sectionKey, []);
    sections.get(sectionKey)!.push(course);
  }

  const chip = (active: boolean) =>
    `pill px-4 py-2 text-sm ${
      active
        ? "bg-[var(--brand-500)] text-white"
        : "bg-[var(--surface-muted)] text-[var(--foreground)]/70 hover:bg-[var(--brand-50)]"
    }`;

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-2 flex flex-wrap gap-2 text-sm text-[var(--foreground)]/50">
        {CATEGORIES.map((c) => (
          <span key={c.slug}>
            {c.slug === category.slug ? (
              <span className="font-semibold text-[var(--brand-600)]">
                {dict.categories[c.slug].label}
              </span>
            ) : (
              <Link href={`/${locale}/kurzy/${c.slug}`} className="hover:underline">
                {dict.categories[c.slug].label}
              </Link>
            )}
            {c.slug !== CATEGORIES[CATEGORIES.length - 1].slug && (
              <span className="mx-2">·</span>
            )}
          </span>
        ))}
      </div>

      <h1 className="mb-1 text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
        {dict.categories[category.slug].label}
      </h1>
      <p className="mb-8 text-[var(--foreground)]/60">
        {dict.categories[category.slug].description}
      </p>

      <div className="mb-10 flex flex-wrap gap-2">
        <Link href={`/${locale}/kurzy/${category.slug}`} className={chip(!selectedSubject)}>
          {subjectText.all}
        </Link>
        {SUBJECTS.map((s) => (
          <Link
            key={s.value}
            href={`/${locale}/kurzy/${category.slug}?predmet=${s.slug}`}
            className={chip(selectedSubject?.value === s.value)}
          >
            {s.emoji} {subjectText.labels[s.value]}
          </Link>
        ))}
      </div>

      {courses.length === 0 ? (
        <div className="card p-10 text-center text-[var(--foreground)]/60">
          {selectedSubject ? dict.category.noCoursesFiltered : dict.category.noCourses}
        </div>
      ) : (
        <div className="flex flex-col gap-12">
          {[...groups.entries()].map(([subjectKey, sections]) => {
            const subject = SUBJECTS.find((s) => s.value === subjectKey);
            return (
              <section key={subjectKey}>
                <h2
                  className="mb-5 text-2xl font-bold"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {subject ? `${subject.emoji} ${subjectText.labels[subject.value]}` : subjectText.other}
                </h2>
                <div className="flex flex-col gap-8">
                  {[...sections.entries()].map(([sectionKey, items]) => (
                    <div key={sectionKey}>
                      {sectionKey && (
                        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--brand-600)]">
                          {sectionKey}
                        </h3>
                      )}
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {items.map((course) => (
                          <Link
                            key={course.id}
                            href={`/${locale}/kurzy/${category.slug}/${course.slug}`}
                            className="card card-hover flex flex-col gap-2 p-5"
                          >
                            <h4 className="text-lg font-semibold">{course.title}</h4>
                            {course.description && (
                              <p className="text-sm text-[var(--foreground)]/60">
                                {course.description}
                              </p>
                            )}
                            <span className="mt-auto pt-2 text-sm font-semibold text-[var(--brand-600)]">
                              🚀 {gameText.play} →
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
