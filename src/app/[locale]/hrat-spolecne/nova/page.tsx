import { notFound } from "next/navigation";
import { CreateGame } from "@/components/live/CreateGame";
import { isLocale, type Locale } from "@/i18n/config";

export default async function NewLiveGamePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <div className="px-4 py-10 sm:px-6 sm:py-16">
      <CreateGame locale={locale as Locale} />
    </div>
  );
}
