import { notFound } from "next/navigation";
import { CreateGame } from "@/components/live/CreateGame";
import { FullscreenFrame } from "@/components/FullscreenFrame";
import { MODES } from "@/lib/live/logic";
import { isLocale, type Locale } from "@/i18n/config";

export default async function NewLiveGamePage({ params, searchParams }: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ mode?: string | string[] }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { mode } = await searchParams;
  const initialMode = MODES.find((option) => option === mode);
  return (
    <div className="px-4 py-10 sm:px-6 sm:py-16">
      <FullscreenFrame locale={locale as Locale}>
        <CreateGame locale={locale} initialMode={initialMode} />
      </FullscreenFrame>
    </div>
  );
}
