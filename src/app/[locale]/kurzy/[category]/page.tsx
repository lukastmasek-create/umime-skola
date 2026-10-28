import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  GRADES,
  SUBJECTS,
  getCategoryBySlug,
  getSubjectBySlug,
  type SubjectValue,
} from "@/lib/taxonomy";
import { getDictionary } from "@/i18n/dictionaries";
import { getSubjectText } from "@/i18n/subjects";
import { getAllGradesLabel, gradeLabel } from "@/i18n/grades";
import { isLocale, type Locale } from "@/i18n/config";

export const revalidate = 0;

type Course = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  subject: SubjectValue | null;
  section: string | null;
  grade: number | null;
};

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; category: string }>;
  searchParams: Promise<{ predmet?: string; trida?: string }>;
}) {
  const { locale, category: categorySlug } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale as Locale);
  const subjectText = getSubjectText(locale as Locale);
  const { predmet, trida } = await searchParams;

  const category = getCategoryBySlug(categorySlug);
  if (!category) notFound();

  // Hodnota z URL musí být platný předmět, ať do Prisma nikdy nepošleme
  // libovolný string z query parametru.
  const selectedSubject = getSubjectBySlug(predmet);
  const availableGrades = GRADES[category.slug];
  const gradeNumber = Number(trida);
  const selectedGrade = availableGrades.includes(gradeNumber) ? gradeNumber : undefined;

  const filterHref = (subjectSlug?: string, grade?: number) => {
    const query = new URLSearchParams();
    if (subjectSlug) query.set("predmet", subjectSlug);
    if (grade) query.set("trida", String(grade));
    const qs = query.toString();
    return `/${locale}/kurzy/${category.slug}${qs ? `?${qs}` : ""}`;
  };

  let courses: Course[] = [];
  let loadFailed = false;
  try {
    courses = await prisma.course.findMany({
      where: {
        published: true,
        category: category.value,
        ...(selectedSubject ? { subject: selectedSubject.value } : {}),
        ...(selectedGrade ? { grade: selectedGrade } : {}),
      },
      orderBy: [{ subject: "asc" }, { section: "asc" }, { title: "asc" }],
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        subject: true,
        section: true,
        grade: true,
      },
    });
  } catch (error) {
    // Databáze není dostupná (chybí DATABASE_URL, síť, výpadek). Chybu zalogujeme
    // a stránka řekne, že se nepodařilo načíst, ne že kurzy neexistují.
    console.error("[kurzy] Načtení kurzů selhalo:", error);
    courses = [];
    loadFailed = true;
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
        : "bg-[var(--surface-muted)] text-[var(--muted)] hover:bg-[var(--brand-50)]"
    }`;

  return (
    <div data-world={selectedSubject?.slug} className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="mb-1 text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
        {dict.categories[category.slug].label}
      </h1>
      <p className="mb-8 text-[var(--muted)]">
        {dict.categories[category.slug].description}
      </p>

      {availableGrades.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          <Link href={filterHref(selectedSubject?.slug)} className={chip(!selectedGrade)}>
            {getAllGradesLabel(locale as Locale)}
          </Link>
          {availableGrades.map((n) => (
            <Link
              key={n}
              href={filterHref(selectedSubject?.slug, n)}
              className={chip(selectedGrade === n)}
            >
              {gradeLabel(locale as Locale, category.slug, n)}
            </Link>
          ))}
        </div>
      )}

      <div className="mb-10 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-10">
        {[
          { key: "all", href: filterHref(undefined, selectedGrade), icon: "✨", label: subjectText.all, color: "var(--surface)", active: !selectedSubject },
          ...SUBJECTS.map((s) => ({
            key: s.value,
            href: filterHref(s.slug, selectedGrade),
            icon: s.emoji,
            label: subjectText.labels[s.value],
            color: s.color,
            active: selectedSubject?.value === s.value,
          })),
        ].map((tile) => (
          <Link
            key={tile.key}
            href={tile.href}
            aria-current={tile.active ? "true" : undefined}
            className={`flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-[var(--edge)] px-1 py-2.5 text-center text-xs font-bold leading-tight ${
              tile.active
                ? "-translate-y-0.5 shadow-[0_4px_0_var(--shadow-ink)] outline outline-2 outline-offset-2 outline-[var(--foreground)]"
                : "opacity-80 hover:-translate-y-0.5 hover:opacity-100"
            } ${tile.color === "var(--surface)" ? "" : "text-[#1b1830]"}`}
            style={{ background: tile.color }}
          >
            <span aria-hidden className="text-2xl">
              {tile.icon}
            </span>
            <span className="break-words">{tile.label}</span>
          </Link>
        ))}
      </div>

      {courses.length === 0 ? (
        <div className="card p-10 text-center text-[var(--muted)]" role={loadFailed ? "alert" : undefined}>
          {loadFailed
            ? dict.category.loadFailed
            : selectedSubject || selectedGrade
              ? dict.category.noCoursesFiltered
              : dict.category.noCourses}
        </div>
      ) : (
        <div className="flex flex-col gap-12">
          {[...groups.entries()].map(([subjectKey, sections]) => {
            const subject = SUBJECTS.find((s) => s.value === subjectKey);
            return (
              <section key={subjectKey}>
                <h2
                  className="mb-5 flex items-center gap-3 text-2xl font-bold"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  <span
                    aria-hidden
                    className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-[var(--edge)] text-2xl"
                    style={{ background: subject?.color ?? "var(--surface-muted)" }}
                  >
                    {subject?.emoji ?? "📖"}
                  </span>
                  {subject ? subjectText.labels[subject.value] : subjectText.other}
                  <span className="pill bg-[var(--surface-muted)] px-2.5 py-1 text-xs text-[var(--muted)]">
                    {[...sections.values()].reduce((sum, list) => sum + list.length, 0)}
                  </span>
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
                            className="card card-hover flex flex-col gap-2 overflow-hidden p-5 pt-6"
                            style={{ borderTop: `8px solid ${subject?.color ?? "var(--edge)"}` }}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-lg font-semibold">{course.title}</h4>
                              {course.grade && (
                                <span className="pill shrink-0 bg-[var(--brand-50)] px-2.5 py-1 text-xs text-[var(--brand-700)]">
                                  {gradeLabel(locale as Locale, category.slug, course.grade)}
                                </span>
                              )}
                            </div>
                            {course.description && (
                              <p className="text-sm text-[var(--muted)]">
                                {course.description}
                              </p>
                            )}
                            <span className="mt-auto pt-2 text-sm font-semibold text-[var(--brand-600)]">
                              {dict.category.viewLevels}
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
