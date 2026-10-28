import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTopics } from "@/lib/materials";
import { getSubjectBySlug } from "@/lib/taxonomy";
import { getMaterialsText } from "@/i18n/materials";
import { getSubjectText } from "@/i18n/subjects";
import { isLocale, type Locale } from "@/i18n/config";

type Params = { locale: string; subject: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, subject: slug } = await params;
  const subject = getSubjectBySlug(slug);
  if (!isLocale(locale) || !subject) return {};
  return { title: `${getSubjectText(locale).labels[subject.value]} – ${getMaterialsText(locale).title}` };
}

export default async function MaterialsSubjectPage({ params }: { params: Promise<Params> }) {
  const { locale, subject: slug } = await params;
  if (!isLocale(locale)) notFound();
  const subject = getSubjectBySlug(slug);
  const topics = getTopics(slug);
  if (!subject || topics.length === 0) notFound();
  const t = getMaterialsText(locale as Locale);
  const label = getSubjectText(locale as Locale).labels[subject.value];
  const levels = ([1, 2, 3, 4] as const).filter((level) => topics.some((x) => x.level === level));

  return (
    <div data-world={subject.slug} className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <Link href={`/${locale}/materialy`} className="mb-4 inline-flex text-sm font-semibold text-[var(--brand-600)] hover:underline">
        ← {t.allSubjects}
      </Link>
      <h1 className="mb-2 flex items-center gap-3 text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
        <span
          aria-hidden
          className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-[var(--edge)] text-2xl"
          style={{ background: subject.color }}
        >
          {subject.emoji}
        </span>
        {label}
      </h1>
      <p className="mb-2 text-[var(--muted)]">{t.subtitle}</p>
      {t.czechOnlyNote && <p className="mb-6 text-sm font-semibold text-[var(--brand-600)]">{t.czechOnlyNote}</p>}

      <nav aria-label={t.contents} className="mb-10 mt-6 flex flex-wrap gap-2">
        {levels.map((level) => (
          <a key={level} href={`#uroven-${level}`} className="pill bg-[var(--surface-muted)] px-4 py-2 text-sm text-[var(--muted)] hover:bg-[var(--brand-50)]">
            {t.levels[level].title} · {t.levels[level].hint}
          </a>
        ))}
      </nav>

      <div className="flex flex-col gap-12">
        {levels.map((level) => (
          <section key={level} id={`uroven-${level}`} className="scroll-mt-28">
            <h2 className="mb-1 text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
              {t.levels[level].title}
            </h2>
            <p className="mb-5 text-sm font-semibold uppercase tracking-wide text-[var(--brand-600)]">{t.levels[level].hint}</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {topics
                .filter((x) => x.level === level)
                .map((topic) => (
                  <Link
                    key={topic.slug}
                    href={`/${locale}/materialy/${slug}/${topic.slug}`}
                    className="card card-hover flex flex-col gap-2 overflow-hidden p-5 pt-6"
                    style={{ borderTop: `8px solid ${subject.color}` }}
                  >
                    <h3 className="text-lg font-semibold">{topic.title}</h3>
                    <p className="text-sm text-[var(--muted)]">{topic.intro}</p>
                  </Link>
                ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
