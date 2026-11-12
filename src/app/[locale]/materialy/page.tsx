import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/Icon";
import type { Metadata } from "next";
import { getMaterialSubjects, getTopics, materialSubjectLabel } from "@/lib/materials";
import { getMaterialsText } from "@/i18n/materials";
import { isLocale, type Locale } from "@/i18n/config";
import { SpaceShell } from "@/components/SpaceShell";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getMaterialsText(locale).title };
}

export default async function MaterialsIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getMaterialsText(locale as Locale);

  return (
    <SpaceShell title={t.title} subtitle={t.subtitle} note={t.czechOnlyNote || undefined} wide>
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
                  <Icon name={subject.slug} size={36} />
                </span>
                <div>
                  <h2 className="text-lg font-semibold">{materialSubjectLabel(subject, locale as Locale)}</h2>
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
    </SpaceShell>
  );
}
