import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { hasPro } from "@/lib/pro-server";
import { PricingTab } from "@/components/UiDemoDashboard";
import { getProText } from "@/i18n/pro";
import { isLocale, type Locale } from "@/i18n/config";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getProText(locale);
  return { title: `${t.title} · Učíme se hrou`, description: t.subtitle };
}

export default async function ProPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getProText(locale as Locale);

  // Stav předplatného jen přihlášenému; bez databáze stránka funguje dál jako informace.
  let status: "guest" | "active" | "none" = "guest";
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (userId) status = (await hasPro(userId)) ? "active" : "none";
  } catch {
    status = "guest";
  }

  const tiers = [t.tiers.individual, t.tiers.family, t.tiers.school];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="mb-1 text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
        {t.title}
      </h1>
      <p className="mb-8 text-[var(--muted)]">{t.subtitle}</p>

      <div className="card mb-8 flex flex-wrap items-center justify-between gap-3 p-5">
        <p className="font-semibold">{t.status[status]}</p>
        {status === "guest" && (
          <Link href={`/${locale}/prihlaseni`} className="btn-bouncy btn-secondary inline-flex">
            {t.status.login}
          </Link>
        )}
      </div>

      <section className="card mb-8 p-6">
        <h2 className="mb-4 text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          {t.compareTitle}
        </h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-[var(--faint)]">
              <th className="py-1 font-medium" />
              <th className="py-1 font-medium">{t.compareFree}</th>
              <th className="py-1 font-medium text-[var(--brand-600)]">{t.comparePro}</th>
            </tr>
          </thead>
          <tbody>
            {t.rows.map((row) => (
              <tr key={row.what} className="border-t border-[var(--border,rgba(0,0,0,0.08))]">
                <td className="py-2 pr-2">{row.what}</td>
                <td className="py-2 pr-2 text-[var(--muted)]">{row.free}</td>
                <td className="py-2 font-semibold">{row.pro}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          {t.tiersTitle}
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {tiers.map((tier) => (
            <article key={tier.title} className="card p-5">
              <h3 className="mb-2 font-bold">{tier.title}</h3>
              <p className="text-sm text-[var(--muted)]">{tier.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <PricingTab />
      </section>

      <p className="mb-6 text-sm text-[var(--muted)]">{t.availability}</p>

      <div className="card flex flex-wrap items-center justify-between gap-3 p-5">
        <p className="text-sm">{t.ctaText}</p>
        <Link href={`/${locale}/kontakt`} className="btn-bouncy btn-secondary inline-flex">
          {t.cta}
        </Link>
      </div>
    </div>
  );
}
