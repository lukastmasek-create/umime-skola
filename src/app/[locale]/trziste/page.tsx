import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getPlayerMarketText } from "@/i18n/player-market";
import { PlayerMarket } from "@/components/PlayerMarket";

// Samostatné okno tržiště hráčů (prodej a nákup věcí mezi hráči).
export default async function TrzistePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getPlayerMarketText(locale as Locale);
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="mb-6 text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
        🤝 {t.title}
      </h1>
      <PlayerMarket locale={locale as Locale} />
    </div>
  );
}
