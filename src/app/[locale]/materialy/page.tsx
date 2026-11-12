import { notFound } from "next/navigation";
import { Icon } from "@/components/Icon";
import type { Metadata } from "next";
import { getMaterialSubjects, getTopics, materialSubjectLabel } from "@/lib/materials";
import { getMaterialsText } from "@/i18n/materials";
import { isLocale, type Locale } from "@/i18n/config";
import { SpaceShell } from "@/components/SpaceShell";
import { PaperCard } from "@/components/PaperCard";

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
      <div className="pcard-pile pcard-pile-wide">
        {getMaterialSubjects().map((subject, i) => {
          const topics = getTopics(subject.slug);
          const levels = [...new Set(topics.map((x) => x.level))].sort();
          return (
            <PaperCard
              key={subject.slug}
              href={`/${locale}/materialy/${subject.slug}`}
              accent={subject.color}
              num={i + 1}
              icon={<Icon name={subject.slug} size={92} className="pcard-icon" />}
              title={materialSubjectLabel(subject, locale as Locale)}
              text={`${t.topics}: ${topics.length}`}
            >
              <span className="pcard-pills">
                {levels.map((level) => (
                  <span key={level} className="pill text-xs">
                    {t.levels[level].title}
                  </span>
                ))}
              </span>
            </PaperCard>
          );
        })}
      </div>
    </SpaceShell>
  );
}
