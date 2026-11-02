import { notFound } from "next/navigation";
import { EconomyGame } from "@/components/idle/EconomyGame";
import { FullscreenFrame } from "@/components/FullscreenFrame";
import { isLocale, type Locale } from "@/i18n/config";

export default async function EconomyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <FullscreenFrame locale={locale as Locale}>
        <EconomyGame locale={locale as Locale} />
      </FullscreenFrame>
    </div>
  );
}
