import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getReviewText } from "@/i18n/review";
import { ReviewRunner } from "@/components/ReviewRunner";

export default async function ReviewPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getReviewText(locale as Locale);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="mb-1 text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
        {t.reviewTitle}
      </h1>
      <p className="mb-8 max-w-2xl text-[var(--muted)]">{t.reviewSubtitle}</p>
      <ReviewRunner locale={locale as Locale} />
    </div>
  );
}
