import { notFound } from "next/navigation";
import { FarmGame } from "@/components/idle/FarmGame";
import { FullscreenFrame } from "@/components/FullscreenFrame";
import { isLocale, type Locale } from "@/i18n/config";

export default async function FarmPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <FullscreenFrame locale={locale as Locale}>
        <FarmGame locale={locale as Locale} />
      </FullscreenFrame>
    </div>
  );
}
