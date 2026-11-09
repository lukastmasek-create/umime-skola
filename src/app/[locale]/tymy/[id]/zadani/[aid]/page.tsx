import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { AssignmentPage } from "@/components/teams/AssignmentPage";

export default async function Page({ params }: { params: Promise<{ locale: string; id: string; aid: string }> }) {
  const { locale, id, aid } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <AssignmentPage locale={locale as Locale} teamId={id} assignmentId={aid} />
    </div>
  );
}
