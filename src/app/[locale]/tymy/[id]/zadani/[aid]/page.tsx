import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { EdxShell } from "@/components/teams/EdxShell";
import { getTeamsText } from "@/i18n/teams";
import { AssignmentPage } from "@/components/teams/AssignmentPage";

export default async function Page({ params }: { params: Promise<{ locale: string; id: string; aid: string }> }) {
  const { locale, id, aid } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <EdxShell locale={locale as Locale} title={getTeamsText(locale as Locale).title}>
      <AssignmentPage locale={locale as Locale} teamId={id} assignmentId={aid} />
    </EdxShell>
  );
}
