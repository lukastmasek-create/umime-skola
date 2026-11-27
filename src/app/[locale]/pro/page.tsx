import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { hasPro } from "@/lib/pro-server";
import { ProPixelIcon } from "@/components/pro/ProPixelIcon";
import { getProText } from "@/i18n/pro";
import { getProExtra } from "@/i18n/pro-extra";
import { getProToolsText } from "@/i18n/pro-tools";
import { featureAvailableIn, featuresForTab } from "@/lib/pro-tools/features";
import { isLocale, type Locale } from "@/i18n/config";
import "./pro-pixel.css";
import { ProStorefront } from "@/components/pro/ProStorefront";
import { ProTabs } from "@/components/pro/ProTabs";

const comparisonIcons = ["kurzy", "plan", "zkouska", "offline"];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getProText(locale);
  return { title: t.title, description: t.subtitle };
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

  const extra = getProExtra(locale as Locale);
  const tools = getProToolsText(locale as Locale);

  return (
    <div className="space-page pro-pixel-page">
      <ProStorefront locale={locale as Locale} />
      <div className="pro-details mx-auto max-w-6xl px-4 sm:px-6">
        <ProTabs locale={locale as Locale} active="pro" />

        <div className="ps-frame pro-frame">
          <div className="pro-frame-inner pro-frame-line">
            <p>{t.status[status]}</p>
            {status === "guest" && (
              <Link href={`/${locale}/prihlaseni`} className="btn-bouncy btn-secondary btn-lg">
                {t.status.login}
              </Link>
            )}
          </div>
        </div>

        <section aria-labelledby="pro-tools-title">
          <h2 id="pro-tools-title">{tools.toolsTitle}</h2>
          <p className="pro-section-intro">{tools.toolsHint}</p>
          <div className="pro-card-grid">
            {featuresForTab("pro").filter((f) => featureAvailableIn(f.slug, locale)).map(({ slug }) => (
              <Link key={slug} href={`/${locale}/pro/${slug}`} className="ps-frame pro-frame pro-tool">
                <div className="pro-frame-inner">
                  <div className="pro-card-top">
                    <ProPixelIcon name={slug} />
                    <span aria-hidden="true">↗</span>
                  </div>
                  <h3>{tools.features[slug].title}</h3>
                  <p>{tools.features[slug].text}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section aria-labelledby="pro-benefits-title">
          <h2 id="pro-benefits-title">{extra.benefitsTitle}</h2>
          <div className="pro-card-grid">
            {extra.benefits.map((benefit) => (
              <article key={benefit.title} className="ps-frame pro-frame">
                <div className="pro-frame-inner">
                  <ProPixelIcon name={benefit.icon} />
                  <h3>{benefit.title}</h3>
                  <p>{benefit.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="pro-compare-title">
          <h2 id="pro-compare-title">{t.compareTitle}</h2>
          <div className="pro-card-grid pro-compare-grid">
            {t.rows.map((row, index) => (
              <article key={row.what} className="ps-frame pro-frame">
                <div className="pro-frame-inner">
                  <ProPixelIcon name={comparisonIcons[index] ?? "kurzy"} />
                  <h3>{row.what}</h3>
                  <dl className="pro-compare-options">
                    <div>
                      <dt>{t.compareFree}</dt>
                      <dd>{row.free}</dd>
                    </div>
                    <div>
                      <dt>{t.comparePro}</dt>
                      <dd>{row.pro}</dd>
                    </div>
                  </dl>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="ps-frame pro-frame">
          <div className="pro-frame-inner pro-frame-line">
            <p>{t.ctaText}</p>
            <Link href={`/${locale}/kontakt`} className="btn-bouncy btn-secondary btn-lg">
              {t.cta}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
