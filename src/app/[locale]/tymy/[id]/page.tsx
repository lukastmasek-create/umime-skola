import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { EdxShell } from "@/components/teams/EdxShell";
import { getTeamsText } from "@/i18n/teams";
import { TeamView } from "@/components/teams/TeamView";

export default async function Page({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <EdxShell locale={locale as Locale} title={getTeamsText(locale as Locale).title}>
      <TeamView locale={locale as Locale} teamId={id} />
    </EdxShell>
  );
}
