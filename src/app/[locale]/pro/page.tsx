import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { hasPro } from "@/lib/pro-server";
import { ProIcon } from "@/components/pro/ProIcon";
import { getProText } from "@/i18n/pro";
import { getProExtra } from "@/i18n/pro-extra";
import { getProToolsText } from "@/i18n/pro-tools";
import { featuresForTab } from "@/lib/pro-tools/features";
import { isLocale, type Locale } from "@/i18n/config";
import { SpaceShell } from "@/components/SpaceShell";
import { ProTabs } from "@/components/pro/ProTabs";
import { ProToolPile } from "@/components/pro/ProToolPile";

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

  return (
    <SpaceShell title={t.title} subtitle={t.subtitle} wide>
      <ProTabs locale={locale as Locale} active="pro" />

      <section className="mb-8">
        <h2 className="mb-4 text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          {t.tiersTitle}
        </h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {tiers.map((tier, i) => {
            const color = ["#35d0ff", "#ffd23f", "#7cf29a"][i];
            return (
              <article key={tier.title} className="card flex flex-col p-5" style={{ borderTop: `4px solid ${color}` }}>
                <h3 className="text-lg font-bold">{tier.title}</h3>
                <p className="mb-3 text-sm text-[var(--muted)]">{tier.text}</p>
                <p className="mb-1 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tabular-nums">{extra.plans[i].price}</span>
                  <span className="text-xs text-[var(--muted)]">{extra.plans[i].per}</span>
                </p>
                {extra.plans[i].yearly && <p className="text-xs font-semibold text-[var(--brand-600)]">{extra.plans[i].yearly}</p>}
                <ul className="mt-4 grid gap-2">
                  {extra.plans[i].perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2 border-t border-[var(--edge)] pt-2 text-sm">
                      <ProIcon name="check" className="mt-0.5 size-4 text-[var(--accent-green)]" />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
        <p className="mt-4 text-sm font-semibold">{extra.trial}</p>
        <p className="text-sm text-[var(--muted)]">{extra.note}</p>
        <p className="text-sm text-[var(--muted)]">{t.availability}</p>
      </section>

      <div className="card mb-8 flex flex-wrap items-center justify-between gap-3 p-5">
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
        <ProToolPile locale={locale as Locale} slugs={featuresForTab("pro")} />
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          {extra.benefitsTitle}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {extra.benefits.map((b) => (
            <div key={b.title} className="card p-5">
              <ProIcon name={b.icon} className="mb-2 size-8 text-[var(--brand-600)]" />
              <h3 className="mb-1 font-bold">{b.title}</h3>
              <p className="text-sm text-[var(--muted)]">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

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

      <div className="card flex flex-wrap items-center justify-between gap-3 p-5">
        <p className="text-sm">{t.ctaText}</p>
        <Link href={`/${locale}/kontakt`} className="btn-bouncy btn-secondary btn-lg">
          {t.cta}
        </Link>
      </div>
    </SpaceShell>
  );
}
