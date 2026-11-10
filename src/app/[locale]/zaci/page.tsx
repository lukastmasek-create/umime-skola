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

// Barevná plocha nahoře na kartě. Různé výšky dávají masonry rytmus (jako na obrázku).
const COVER: Record<FeatureKey, { color: string; height: number }> = {
  courses: { color: "var(--cat-1)", height: 150 },
  daily: { color: "var(--cat-4)", height: 96 },
  idle: { color: "var(--cat-3)", height: 176 },
  escape: { color: "var(--cat-5)", height: 124 },
  together: { color: "var(--cat-2)", height: 108 },
  review: { color: "var(--cat-1)", height: 164 },
  materials: { color: "var(--cat-3)", height: 116 },
  profile: { color: "var(--cat-5)", height: 142 },
  boards: { color: "var(--cat-4)", height: 98 },
  shop: { color: "var(--cat-2)", height: 170 },
  town: { color: "var(--cat-3)", height: 128 },
  team: { color: "var(--cat-1)", height: 156 },
};

// Ozdobné sloupečky v kartě (stejné při každém renderu, odvozené z klíče)
function barHeights(key: string): number[] {
  let seed = 0;
  for (const ch of key) seed = (seed * 31 + ch.charCodeAt(0)) % 9973;
  return Array.from({ length: 7 }, (_, n) => 28 + ((seed * (n + 3) * 17) % 62));
}

export default async function StudentsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getAudiencePagesText(locale as Locale).students;
  const heading = { fontFamily: "var(--font-heading)" };

  return (
    <div className="relative isolate overflow-hidden">
      {/* Měkké barevné pozadí za stránkou */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-24 -z-10 h-[620px] opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(40% 50% at 15% 30%, var(--cat-1), transparent 70%), radial-gradient(35% 45% at 85% 20%, var(--cat-5), transparent 70%), radial-gradient(45% 55% at 60% 80%, var(--cat-4), transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <header className="mb-12 max-w-2xl">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[var(--accent-green)]">{t.nav}</p>
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl" style={heading}>
            {t.title}
          </h1>
          <p className="text-lg leading-relaxed text-[var(--muted)]">{t.subtitle}</p>
        </header>

        <h2 className="mb-6 text-xl font-bold sm:text-2xl" style={heading}>
          {t.cardsTitle}
        </h2>

        {/* Masonry: karty se skládají do sloupců a mají různé výšky */}
        <ul className="mb-14 columns-1 gap-6 sm:columns-2 lg:columns-3">
          {FEATURE_KEYS.filter((key) => key !== "town").map((key) => {
            const feature = t.features[key];
            const cover = COVER[key];
            return (
              <li key={key} className="mb-6 break-inside-avoid">
                <Link
                  href={`/${locale}${FEATURE_PATH[key]}`}
                  className="gcard group block"
                  style={{ ["--gc" as string]: cover.color }}
                >
                  <div className="gcard-bars px-5 pt-5" style={{ height: cover.height }} aria-hidden="true">
                    {barHeights(key).map((h, n, arr) => (
                      <i key={n} className={n === arr.length - 1 - (key.length % 3) ? "is-hi" : ""} style={{ height: `${h}%` }} />
                    ))}
                  </div>
                  <div className="flex items-end justify-between gap-3 p-5">
                    <div className="flex flex-col gap-2">
                      <h3 className="gcard-title text-lg leading-snug" style={heading}>
                        {feature.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-[var(--muted)]">{feature.text}</p>
                    </div>
                    <span aria-hidden="true" className="gcard-chip">→</span>
                  </div>
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
    </div>
  );
}
