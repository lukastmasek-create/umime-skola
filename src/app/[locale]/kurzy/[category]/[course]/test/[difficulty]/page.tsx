import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCategoryBySlug } from "@/lib/taxonomy";
import { getTestText } from "@/i18n/test";
import { isLocale, type Locale } from "@/i18n/config";
import { TestRunner, type TestQuestion } from "@/components/TestRunner";

export const revalidate = 0;

const QUESTIONS_PER_TEST = 10;

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Banka má u většiny kurzů jen 3 až 8 otázek na obtížnost, takže test jen z jedné obtížnosti
// by vracel pořád stejné otázky. Nejdřív se berou otázky zvolené obtížnosti, pak sousední
// (±1, ±2, …), uvnitř každé vzdálenosti náhodně. Obtížnost tak zůstává hlavním zdrojem.
function buildTestQuestions<T extends { difficulty: number }>(pool: T[], target: number, size: number): T[] {
  const bands = new Map<number, T[]>();
  for (const q of pool) {
    const distance = Math.abs(q.difficulty - target);
    bands.set(distance, [...(bands.get(distance) ?? []), q]);
  }
  const picked: T[] = [];
  for (const distance of [...bands.keys()].sort((a, b) => a - b)) {
    picked.push(...shuffle(bands.get(distance) ?? []));
    if (picked.length >= size) break;
  }
  return picked.slice(0, size);
}

export default async function CourseTestPage({
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

  const t = getTestText(locale as Locale);

  let courseTitle: string | null = null;
  let courseId: string | undefined;
  let pool: (TestQuestion & { difficulty: number })[] = [];
  try {
    const course = await prisma.course.findFirst({
      where: { slug: courseSlug, category: category.value, published: true },
      select: {
        id: true,
        title: true,
        questions: {
          select: {
            id: true,
            prompt: true,
            answers: true,
            options: true,
            correctIndex: true,
            explanation: true,
            difficulty: true,
          },
        },
      },
    });
    courseTitle = course?.title ?? null;
    courseId = course?.id;
    pool = (course?.questions ?? []).filter((q) => {
      const gaps = q.prompt.split("___").length - 1;
      return q.answers.length > 0
        ? gaps === q.answers.length
        : q.options.length === 4 && q.correctIndex >= 0 && q.correctIndex < 4;
    });
  } catch {
    courseTitle = null;
  }
  if (!courseTitle) notFound();

  const questions: TestQuestion[] = buildTestQuestions(pool, difficulty, QUESTIONS_PER_TEST).map(
    ({ difficulty: _difficulty, ...q }) => q,
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <TestRunner
        locale={locale as Locale}
        courseId={courseId}
        title={`${courseTitle} · ${t.difficulties[difficulty - 1]}`}
        t={t}
        questions={questions}
        backHref={`/${locale}/kurzy/${categorySlug}/${courseSlug}`}
      />
    </div>
  );
}
