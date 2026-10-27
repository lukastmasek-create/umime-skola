import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getMaterialSubjects, getTopics } from "@/lib/materials";
import { getMaterialsText } from "@/i18n/materials";
import { getSubjectText } from "@/i18n/subjects";
import { isLocale, type Locale } from "@/i18n/config";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getMaterialsText(locale).title };
}

export default async function MaterialsIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getMaterialsText(locale as Locale);
  const subjectText = getSubjectText(locale as Locale);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="mb-2 text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
        {t.title}
      </h1>
      <p className="mb-2 max-w-3xl text-[var(--muted)]">{t.subtitle}</p>
      {t.czechOnlyNote && <p className="mb-8 text-sm font-semibold text-[var(--brand-600)]">{t.czechOnlyNote}</p>}
      {!t.czechOnlyNote && <div className="mb-8" />}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {getMaterialSubjects().map((subject) => {
          const topics = getTopics(subject.slug);
          const levels = [...new Set(topics.map((x) => x.level))].sort();
          return (
            <Link
              key={subject.slug}
              href={`/${locale}/materialy/${subject.slug}`}
              className="card card-hover flex flex-col gap-3 overflow-hidden p-5 pt-6"
              style={{ borderTop: `8px solid ${subject.color}` }}
            >
              <div className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-[var(--edge)] text-2xl"
                  style={{ background: subject.color }}
                >
                  {subject.emoji}
                </span>
                <div>
                  <h2 className="text-lg font-semibold">{subjectText.labels[subject.value]}</h2>
                  <p className="text-sm text-[var(--muted)]">
                    {t.topics}: {topics.length}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {levels.map((level) => (
                  <span key={level} className="pill bg-[var(--brand-50)] px-2.5 py-1 text-xs text-[var(--brand-700)]">
                    {t.levels[level].title}
                  </span>
                ))}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
