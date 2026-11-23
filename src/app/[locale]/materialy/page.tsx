import { notFound } from "next/navigation";
import { Icon } from "@/components/Icon";
import type { Metadata } from "next";
import { getMaterialSubjects, getTopics, materialSubjectLabel } from "@/lib/materials";
import { getMaterialsText } from "@/i18n/materials";
import { isLocale, type Locale } from "@/i18n/config";
import { SpaceShell } from "@/components/SpaceShell";
import { PxCard } from "@/components/pixel/PixelKit";

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
    <SpaceShell title={t.title} subtitle={t.subtitle} note={t.czechOnlyNote || undefined} wide pixel>
      <div className="px-grid">
        {getMaterialSubjects().map((subject, i) => {
          const topics = getTopics(subject.slug);
          const levels = [...new Set(topics.map((x) => x.level))].sort();
          return (
            <PxCard
              key={subject.slug}
              href={`/${locale}/materialy/${subject.slug}`}
              accent={subject.color}
              num={i + 1}
              icon={<Icon name={subject.slug} size={92} />}
              title={materialSubjectLabel(subject, locale as Locale)}
              text={`${t.topics}: ${topics.length}`}
            >
              <span className="px-pills">
                {levels.map((level) => (
                  <span key={level} className="px-pill">
                    {t.levels[level].title}
                  </span>
                ))}
              </span>
            </PxCard>
          );
        })}
      </div>
    </SpaceShell>
  );
}
