import Link from "next/link";
import { notFound } from "next/navigation";
import { FEATURE_KEYS, getAudiencePagesText, type FeatureKey } from "@/i18n/audience";
import { isLocale, type Locale } from "@/i18n/config";
import { staticPageMetadata } from "@/lib/seo";

export const generateMetadata = staticPageMetadata("/zaci");

// Kam každá karta vede (cesta bez jazyka).
const FEATURE_PATH: Record<FeatureKey, string> = {
  courses: "/kurzy/zakladni",
  daily: "/denni-kviz",
  idle: "/stale-hry",
  escape: "/unikovky",
  together: "/hrat-spolecne",
  review: "/mapa",
  materials: "/materialy",
  profile: "/profil",
  boards: "/zebricky",
  shop: "/obchod",
  town: "/mestecko",
  team: "/tymy",
};

export default async function StudentsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getAudiencePagesText(locale as Locale).students;
  const heading = { fontFamily: "var(--font-heading)" };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[var(--accent-green)]">{t.nav}</p>
      <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl" style={heading}>
        {t.title}
      </h1>
      <p className="mb-10 max-w-2xl text-lg leading-relaxed text-[var(--muted)]">{t.subtitle}</p>

      <h2 className="mb-5 text-xl font-bold sm:text-2xl" style={heading}>
        {t.cardsTitle}
      </h2>
      <ul className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURE_KEYS.map((key) => {
          const feature = t.features[key];
          return (
            <li key={key}>
              <Link href={`/${locale}${FEATURE_PATH[key]}`} className="card card-hover flex h-full flex-col gap-2 p-5">
                <h3 className="text-lg font-bold" style={heading}>
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-[var(--muted)]">{feature.text}</p>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col items-start gap-2">
        <Link href={`/${locale}/kurzy/zakladni`} className="btn-bouncy btn-cta btn-primary btn-lg">
          {t.cta}
        </Link>
        <p className="text-sm text-[var(--muted)]">{t.ctaHint}</p>
      </div>

      <div className="mt-10">
        <Link href={`/${locale}/ucitele`} className="font-semibold text-[var(--accent-green)] hover:underline">
          {t.teachersLink}
        </Link>
      </div>
    </div>
  );
}
