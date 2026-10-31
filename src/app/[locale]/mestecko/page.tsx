import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { TownWorld } from "@/components/town3d/TownWorld";

// Městečko: živé 3D městečko (lib/town3d). Původní kreslené městečko je na /mestecko/puvodni.
export default async function TownPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <TownWorld locale={locale as Locale} />;
}
