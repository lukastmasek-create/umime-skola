import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { UiDemo } from "@/components/UiDemo";

// Interní ukázka nových UI knihoven: neindexovat.
export const metadata: Metadata = {
  title: "Ukázka UI",
  robots: { index: false, follow: false },
};

export default async function UiDemoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <UiDemo />;
}
