import { notFound } from "next/navigation";
import { MarketWorld } from "@/components/MarketWorld";
import { ShopView } from "@/components/ShopView";
import { isLocale, type Locale } from "@/i18n/config";

export default async function MarketplacePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ seznam?: string }>;
}) {
  const { locale } = await params;
  const { seznam } = await searchParams;
  if (!isLocale(locale)) notFound();

  // Hlavní je prostředí (přístav); klasický seznam zboží zůstává pod odkazem ?seznam=1 pro dárky a balíčky.
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      {seznam ? <ShopView locale={locale as Locale} /> : <MarketWorld locale={locale as Locale} />}
    </div>
  );
}
