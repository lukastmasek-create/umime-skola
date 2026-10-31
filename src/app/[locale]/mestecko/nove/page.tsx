import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { TownWorld } from "@/components/town3d/TownWorld";

// Nové živé 3D městečko (zatím vedle původního /mestecko).
export default async function NewTownPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <TownWorld locale={locale as Locale} />;
}
