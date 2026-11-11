import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getTeamsText } from "@/i18n/teams";
import type { Locale } from "@/i18n/config";
import { TeamsHome } from "@/components/teams/TeamsHome";
import { EdxShell } from "@/components/teams/EdxShell";
import { staticPageMetadata } from "@/lib/seo";

export const generateMetadata = staticPageMetadata("/tymy");

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getTeamsText(locale as Locale);
  return (
    <EdxShell locale={locale as Locale} title={t.title} subtitle={t.subtitle}>
      <TeamsHome locale={locale as Locale} />
    </EdxShell>
  );
}
