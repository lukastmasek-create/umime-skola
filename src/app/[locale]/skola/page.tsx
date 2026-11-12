import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getProTabsText } from "@/i18n/pro-tabs";
import { ProTabView } from "@/components/pro/ProTabView";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getProTabsText(locale);
  return { title: `${t.tabs.skola} · UčímePRO`, description: t.tabText.skola };
}

export default async function SchoolTabPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <ProTabView locale={locale as Locale} tab="skola" />;
}
