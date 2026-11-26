import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { checkoutSelection } from "@/lib/pro-checkout";
import { ProStorefront } from "@/components/pro/ProStorefront";

export const metadata: Metadata = { title: "Ukázka tarifů · UčímePRO", robots: { index: false, follow: true } };
export default async function PaymentPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ plan?: string | string[]; billing?: string | string[]; features?: string | string[] }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <ProStorefront locale={locale} initial={checkoutSelection(await searchParams)} />;
}
