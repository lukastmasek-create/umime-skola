import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCategoryBySlug } from "@/lib/taxonomy";
import { isLocale, type Locale } from "@/i18n/config";
import { SpaceQuizGame } from "@/components/SpaceQuizGame";

export const revalidate = 0;

export default async function CourseGamePage({
  params,
}: {
  params: Promise<{ locale: string; category: string; course: string }>;
}) {
  const { locale, category: categorySlug, course: courseSlug } = await params;
  if (!isLocale(locale)) notFound();
  const category = getCategoryBySlug(categorySlug);
  if (!category) notFound();

  let title: string | null = null;
  try {
    const course = await prisma.course.findFirst({
      where: { slug: courseSlug, category: category.value, published: true },
      select: { title: true },
    });
    title = course?.title ?? null;
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
      />
    </div>
  );
}
