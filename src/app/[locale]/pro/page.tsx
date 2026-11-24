import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { hasPro } from "@/lib/pro-server";
import { ProIcon } from "@/components/pro/ProIcon";
import { getProText } from "@/i18n/pro";
import { getProExtra } from "@/i18n/pro-extra";
import { getProToolsText } from "@/i18n/pro-tools";
import { featureAvailableIn, featuresForTab } from "@/lib/pro-tools/features";
import { isLocale, type Locale } from "@/i18n/config";
import { SpaceShell } from "@/components/SpaceShell";
import { ProTabs } from "@/components/pro/ProTabs";
import { ProToolPile } from "@/components/pro/ProToolPile";
import { PlanBuilder } from "@/components/pro/PlanBuilder";
import { getBuilderText } from "@/i18n/pro-builder";
import { PricingPlans } from "@/components/pro/PricingPlans";
import { getPricingLabels } from "@/i18n/pro-pricing";

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
  const extra = getProExtra(locale as Locale);
  const tools = getProToolsText(locale as Locale);
  const pl = getPricingLabels(locale as Locale);

  return (
    <SpaceShell title={t.title} subtitle={t.subtitle} wide>
      <ProTabs locale={locale as Locale} active="pro" />

      <section className="mb-8">
        <h2 className="mb-4 text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          {t.tiersTitle}
        </h2>
        <PricingPlans
          locale={locale}
          labels={pl}
          plans={tiers.map((tier, i) => ({
            title: tier.title,
            text: tier.text,
            color: ["#35d0ff", "#ffd23f", "#7cf29a"][i],
            perks: extra.plans[i].perks,
            monthly: [100, 250, null][i],
            yearly: [1000, 2500, 12000][i],
            best: i === 1,
            members: i === 1 ? 5 : undefined,
          }))}
        />
        <p className="text-sm text-[var(--muted)]">{extra.note}</p>
        <p className="text-sm text-[var(--muted)]">{t.availability}</p>
      </section>

      <PlanBuilder t={getBuilderText(locale as Locale)} />

      <div className="card mb-8 flex flex-wrap items-center justify-between gap-3 px-7 py-6">
        <p className="font-semibold">{t.status[status]}</p>
        {status === "guest" && (
          <Link href={`/${locale}/prihlaseni`} className="btn-bouncy btn-secondary btn-lg">
            {t.status.login}
          </Link>
        )}
      </div>

      <section className="mb-8">
        <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          {tools.toolsTitle}
        </h2>
        <p className="mb-4 text-sm text-[var(--muted)]">{tools.toolsHint}</p>
        <ProToolPile locale={locale as Locale} slugs={featuresForTab("pro").filter((f) => featureAvailableIn(f.slug, locale))} />
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          {extra.benefitsTitle}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {extra.benefits.map((b) => (
            <div key={b.title} className="card px-7 py-6">
              <ProIcon name={b.icon} className="mb-2 size-8 text-[var(--brand-600)]" />
              <h3 className="mb-1 font-bold">{b.title}</h3>
              <p className="text-sm text-[var(--muted)]">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card mb-8 px-7 py-7">
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

      <div className="card flex flex-wrap items-center justify-between gap-3 px-7 py-6">
        <p className="text-sm">{t.ctaText}</p>
        <Link href={`/${locale}/kontakt`} className="btn-bouncy btn-secondary btn-lg">
          {t.cta}
        </Link>
      </div>
    </SpaceShell>
  );
}
