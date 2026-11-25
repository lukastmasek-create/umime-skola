import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getBuilderText } from "@/i18n/pro-builder";
import { HeroPixel } from "@/components/HeroPixel";
import { checkoutSelection } from "@/lib/pro-checkout";
import "../pro/pro-pixel.css";
import { PaymentDemo } from "@/components/pro/PaymentDemo";

export const metadata: Metadata = { title: "Platební portál · UčímePRO", robots: { index: false, follow: true } };
export default async function PaymentPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ plan?: string | string[]; billing?: string | string[]; features?: string | string[] }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const cs = locale === "cs";
  return <div className="space-page zone zone-space pro-pixel-page">
    <section className="gradient-hero relative overflow-hidden">
      <HeroPixel />
      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6">
        <Link href={`/${locale}/pro`} className="text-sm font-bold hover:underline">← {cs ? "Zpět na UčímePRO" : "Back to UčímePRO"}</Link>
        <header className="mx-auto mb-10 mt-8 max-w-2xl text-center">
          <span className="rounded-md border-2 border-[var(--edge)] bg-[var(--surface)] px-3 py-1 text-xs font-bold uppercase tracking-widest">{cs ? "Demo platebního portálu" : "Payment portal demo"}</span>
          <h1 className="neon-h1 mt-6 text-3xl sm:text-5xl">{cs ? "Tvoje učení. Tvoje PRO." : "Your learning. Your PRO."}</h1>
          <p className="mt-5 text-lg text-[var(--muted)]">{cs ? "Vyber si své superschopnosti. Cenu vidíš hned." : "Choose your superpowers. See your price instantly."}</p>
        </header>
        <PaymentDemo t={getBuilderText(locale)} cs={cs} initial={checkoutSelection(await searchParams)} />
      </div>
    </section>
  </div>;
}
