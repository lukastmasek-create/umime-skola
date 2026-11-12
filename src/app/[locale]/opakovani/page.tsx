import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getReviewText } from "@/i18n/review";
import { ReviewRunner } from "@/components/ReviewRunner";
import { WeakSpots } from "@/components/WeakSpots";
import { SpaceShell } from "@/components/SpaceShell";
import { staticPageMetadata } from "@/lib/seo";

export const generateMetadata = staticPageMetadata("/opakovani");

export default async function ReviewPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ kurz?: string }> }) {
  const { locale } = await params;
  const { kurz } = await searchParams;
  if (!isLocale(locale)) notFound();
  const t = getReviewText(locale as Locale);

  return (
    <SpaceShell title={t.reviewTitle} subtitle={t.reviewSubtitle}>
      {!kurz && <WeakSpots locale={locale as Locale} />}
      <ReviewRunner locale={locale as Locale} courseId={kurz} />
    </SpaceShell>
  );
}
