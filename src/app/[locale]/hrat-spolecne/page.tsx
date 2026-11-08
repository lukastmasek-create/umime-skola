import { notFound } from "next/navigation";
import { LiveHome } from "@/components/live/LiveHome";
import { FullscreenFrame } from "@/components/FullscreenFrame";
import { isLocale, type Locale } from "@/i18n/config";
import { staticPageMetadata } from "@/lib/seo";

export const generateMetadata = staticPageMetadata("/hrat-spolecne");

export default async function PlayTogetherPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <FullscreenFrame locale={locale as Locale}>
      <LiveHome locale={locale as Locale} />
    </FullscreenFrame>
  );
}
