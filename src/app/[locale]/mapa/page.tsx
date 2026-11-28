import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SUBJECTS } from "@/lib/taxonomy";
import { getSubjectText } from "@/i18n/subjects";
import { getReviewText } from "@/i18n/review";
import { isLocale, tr8, type Locale } from "@/i18n/config";
import { CourseMap, type MapSubject } from "@/components/CourseMap";
import { staticPageMetadata } from "@/lib/seo";
import { SpaceShell } from "@/components/SpaceShell";

const retry = tr8("Načíst znovu", "Reload", "Neu laden", "Перезагрузить", "Завантажити знову", "再読み込み", "Volver a cargar", "Recharger");

export const revalidate = 0;

export const generateMetadata = staticPageMetadata("/mapa");

export default async function MapPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getReviewText(locale as Locale);
  const labels = getSubjectText(locale as Locale).labels;

  let subjects: MapSubject[] = [];
  let failed = false;
  try {
    const courses = await prisma.course.findMany({
      where: { published: true, category: "ZAKLADNI", subject: { not: null } },
      orderBy: [{ grade: "asc" }, { section: "asc" }, { title: "asc" }],
      select: { id: true, title: true, slug: true, grade: true, subject: true },
    });
    const coursesBySubject = new Map<string, MapSubject["courses"]>();
    for (const { subject, id, title, slug, grade } of courses) {
      if (!subject) continue;
      const list = coursesBySubject.get(subject) ?? [];
      list.push({ id, title, slug, grade });
      coursesBySubject.set(subject, list);
    }
    subjects = SUBJECTS.map((s) => ({
      value: s.value,
      label: labels[s.value],
      slug: s.slug,
      color: s.color,
      courses: coursesBySubject.get(s.value) ?? [],
    })).filter((s) => s.courses.length > 0);
  } catch (error) {
    console.error("[mapa] Načtení kurzů selhalo:", error);
    failed = true;
  }

  return (
    <SpaceShell title={t.mapTitle} subtitle={t.mapSubtitle}>
      {failed ? (
        <div className="card grid justify-items-start gap-3 p-6">
          <p role="alert">{t.noCourses}</p>
          <form method="get" action={`/${locale}/mapa`}>
            <button type="submit" className="btn-bouncy btn-secondary btn-lg">{retry[locale]}</button>
          </form>
        </div>
      ) : <CourseMap locale={locale} subjects={subjects} />}
    </SpaceShell>
  );
}
