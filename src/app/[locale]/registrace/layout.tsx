import type { Metadata } from "next";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";

// Osobní stránka bez významu pro vyhledávače.
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const robots = { index: false, follow: false };
  if (!isLocale(locale)) return { robots };
  return { title: getDictionary(locale).auth.register.title, robots };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
