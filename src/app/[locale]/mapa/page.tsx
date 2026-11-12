import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SUBJECTS } from "@/lib/taxonomy";
import { getSubjectText } from "@/i18n/subjects";
import { getReviewText } from "@/i18n/review";
import { isLocale, type Locale } from "@/i18n/config";
import { CourseMap, type MapSubject } from "@/components/CourseMap";
import { staticPageMetadata } from "@/lib/seo";
import { SpaceShell } from "@/components/SpaceShell";

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
    subjects = SUBJECTS.map((s) => ({
      value: s.value,
      label: labels[s.value],
      slug: s.slug,
      color: s.color,
      courses: courses.filter((c) => c.subject === s.value).map(({ id, title, slug, grade }) => ({ id, title, slug, grade })),
    })).filter((s) => s.courses.length > 0);
  } catch (error) {
    console.error("[mapa] Načtení kurzů selhalo:", error);
    failed = true;
  }

  return (
    <SpaceShell title={t.mapTitle} subtitle={t.mapSubtitle}>
      {failed ? <p className="card p-6 text-[var(--muted)]">{t.noCourses}</p> : <CourseMap locale={locale as Locale} subjects={subjects} />}
    </SpaceShell>
  );
}
