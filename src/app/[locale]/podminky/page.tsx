import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPageView } from "@/components/LegalPageView";
import { getLegalPage } from "@/i18n/legal";
import { pageMetadata } from "@/lib/seo";
import { isLocale, type Locale } from "@/i18n/config";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const page = getLegalPage("terms", locale);
  return pageMetadata(locale, "/podminky", page.title, page.intro);
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <LegalPageView kind="terms" locale={locale as Locale} />;
}
