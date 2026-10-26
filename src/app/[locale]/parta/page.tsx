import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getSocialText } from "@/i18n/social";
import { SocialView } from "@/components/SocialView";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getSocialText(locale as Locale);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="mb-1 text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
        {t.title}
      </h1>
      <p className="mb-8 max-w-2xl text-[var(--muted)]">{t.subtitle}</p>
      <SocialView locale={locale as Locale} />
    </div>
  );
}
