import { notFound } from "next/navigation";
import { TownHub } from "@/components/TownHub";
import { isLocale, type Locale } from "@/i18n/config";
import { getTownHubText } from "@/i18n/town";

export default async function TownPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getTownHubText(locale as Locale);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <div className="mb-4">
        <h1 className="mb-1 text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          🏘️ {t.title}
        </h1>
        <p className="max-w-3xl text-[var(--muted)]">{t.subtitle}</p>
      </div>
      <TownHub locale={locale as Locale} />
    </div>
  );
}
