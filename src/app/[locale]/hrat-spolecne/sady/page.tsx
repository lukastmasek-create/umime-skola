import { notFound } from "next/navigation";
import { SetsEditor } from "@/components/live/SetsEditor";
import { FullscreenFrame } from "@/components/FullscreenFrame";
import { isLocale, type Locale } from "@/i18n/config";

export default async function QuestionSetsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <div className="px-4 py-10 sm:px-6 sm:py-16">
      <FullscreenFrame locale={locale as Locale}>
        <SetsEditor locale={locale as Locale} />
      </FullscreenFrame>
    </div>
  );
}
