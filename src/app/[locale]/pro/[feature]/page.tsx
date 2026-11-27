import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { proTiers } from "@/lib/pro-server";
import { isLocale, type Locale } from "@/i18n/config";
import { getProToolsText } from "@/i18n/pro-tools";
import { featureAvailableIn, featureTier, isProFeature } from "@/lib/pro-tools/features";
import { ProFeatureView } from "@/components/pro/ProFeatureView";
import { SpaceShell } from "@/components/SpaceShell";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; feature: string }> }): Promise<Metadata> {
  const { locale, feature } = await params;
  if (!isLocale(locale) || !isProFeature(feature)) return {};
  const f = getProToolsText(locale).features[feature];
  return { title: `${f.title} · UčímePRO`, description: f.text, robots: { index: false } };
}

export default async function ProToolPage({ params }: { params: Promise<{ locale: string; feature: string }> }) {
  const { locale: rawLocale, feature } = await params;
  if (!isLocale(rawLocale) || !isProFeature(feature)) notFound();
  const locale = rawLocale as Locale;
  if (!featureAvailableIn(feature, locale)) notFound();
  const t = getProToolsText(locale);
  const f = t.features[feature];

  let allowed = false;
  let loggedIn = false;
  try {
    const userId = (await auth())?.user?.id;
    loggedIn = !!userId;
    if (userId) {
      const tiers = await proTiers(userId);
      const need = featureTier(feature);
      // Stránka Rodina je otevřená každému přihlášenému, aby se pozvaný člen mohl připojit kódem.
      allowed = feature === "rodina" || (need ? tiers.has(need) : tiers.size > 0);
    }
  } catch {
    allowed = false;
  }

  return (
    <SpaceShell title={f.title} subtitle={f.text} back={{ href: `/${locale}/pro`, label: "UčímePRO" }} full={feature === "doucovatel" && allowed}>
      {allowed ? (
        <ProFeatureView feature={feature} locale={locale} />
      ) : (
        <div className="card p-6">
          <h2 className="mb-1 text-lg font-bold">{t.gateTitle}</h2>
          <p className="mb-4 text-sm text-[var(--muted)]">{featureTier(feature) === "FAMILY" ? t.gateFamily : featureTier(feature) === "SCHOOL" ? t.gateSchool : t.gateText}</p>
          <div className="flex flex-wrap gap-2">
            {!loggedIn && (
              <Link href={`/${locale}/prihlaseni`} className="btn-bouncy btn-secondary btn-lg">
                {t.gateLogin}
              </Link>
            )}
            <Link href={`/${locale}/pro`} className="btn-bouncy btn-lg bg-[var(--brand-500)] font-bold text-white">
              {t.gatePlans}
            </Link>
          </div>
        </div>
      )}
    </SpaceShell>
  );
}
