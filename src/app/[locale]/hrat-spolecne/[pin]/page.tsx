import { notFound } from "next/navigation";
import { LiveRoom } from "@/components/live/LiveRoom";
import { isLocale, type Locale } from "@/i18n/config";

export default async function LiveRoomPage({ params }: { params: Promise<{ locale: string; pin: string }> }) {
  const { locale, pin } = await params;
  if (!isLocale(locale) || !/^\d{6}$/.test(pin)) notFound();
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <LiveRoom locale={locale as Locale} pin={pin} />
    </div>
  );
}
