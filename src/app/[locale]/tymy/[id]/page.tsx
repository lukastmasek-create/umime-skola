import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { TeamView } from "@/components/teams/TeamView";

export default async function Page({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <TeamView locale={locale as Locale} teamId={id} />
    </div>
  );
}
