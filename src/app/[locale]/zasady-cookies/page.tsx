import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPageView } from "@/components/LegalPageView";
import { getLegalPage } from "@/i18n/legal";
import { pageMetadata } from "@/lib/seo";
import { isLocale, type Locale } from "@/i18n/config";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const page = getLegalPage("cookies", locale);
  return pageMetadata(locale, "/zasady-cookies", page.title, page.intro);
}

export default async function CookiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <LegalPageView kind="cookies" locale={locale as Locale} />;
}
