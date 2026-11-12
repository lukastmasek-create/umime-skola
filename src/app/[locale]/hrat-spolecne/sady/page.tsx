import { notFound } from "next/navigation";
import { SetsEditor } from "@/components/live/SetsEditor";
import { SpaceShell } from "@/components/SpaceShell";
import { isLocale, type Locale } from "@/i18n/config";
import { getLiveText } from "@/i18n/live";

export default async function QuestionSetsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getLiveText(locale as Locale);
  return (
    <SpaceShell title={t.sets.title} subtitle={t.sets.subtitle} back={{ href: `/${locale}/hrat-spolecne/nova`, label: t.sets.back }}>
      <SetsEditor locale={locale as Locale} />
    </SpaceShell>
  );
}
