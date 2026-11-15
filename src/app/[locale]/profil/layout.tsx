import type { Metadata } from "next";
import { getProfileText } from "@/i18n/profile";
import { isLocale } from "@/i18n/config";

// Osobní stránka bez významu pro vyhledávače.
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const robots = { index: false, follow: false };
  if (!isLocale(locale)) return { robots };
  return { title: getProfileText(locale).title, robots };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
