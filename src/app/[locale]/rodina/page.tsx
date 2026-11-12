import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getProTabsText } from "@/i18n/pro-tabs";
import { ProTabView } from "@/components/pro/ProTabView";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getProTabsText(locale);
  return { title: `${t.tabs.rodina} · UčímePRO`, description: t.tabText.rodina };
}

export default async function FamilyTabPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <ProTabView locale={locale as Locale} tab="rodina" />;
}
