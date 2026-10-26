import { notFound } from "next/navigation";
import { BaseGame } from "@/components/idle/BaseGame";
import { isLocale, type Locale } from "@/i18n/config";

export default async function BasePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <BaseGame locale={locale as Locale} />
    </div>
  );
}
