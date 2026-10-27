import { notFound } from "next/navigation";
import { LiveHome } from "@/components/live/LiveHome";
import { isLocale, type Locale } from "@/i18n/config";

export default async function PlayTogetherPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <LiveHome locale={locale as Locale} />;
}
