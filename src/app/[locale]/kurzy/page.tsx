import Link from "next/link";
import { Icon } from "@/components/Icon";
import { TearCard } from "@/components/TearCard";
import { PcardArt, PcardRing, PcardTape } from "@/components/PcardArt";

const TILE_COLORS = ["#ffc933", "#ff8a6b", "#8fd0ff", "#7ee0b0"];
import { notFound } from "next/navigation";
import { CATEGORIES } from "@/lib/taxonomy";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale).kurzyPage;
  return pageMetadata(locale, "/kurzy", t.title, t.subtitle);
}

export default async function KurzyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale as Locale);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="mb-2 text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
        {dict.kurzyPage.title}
      </h1>
      <p className="mb-4 text-[var(--muted)]">{dict.kurzyPage.subtitle}</p>
      <Link
        href={`/${locale}/kurzy/sablony`}
        className="mb-8 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--brand-600)] hover:underline"
      >
        {dict.templates.title} →
      </Link>
      {/* Stejné ilustrované karty sekcí jako na úvodní stránce. */}
      <div className="pcard-pile">
        {CATEGORIES.map((cat, i) => (
          <TearCard key={cat.slug} href={`/${locale}/kurzy/${cat.slug}`} className="pcard" accent={TILE_COLORS[i % TILE_COLORS.length]}>
            <span className="pcard-in">
              <PcardArt slug={cat.slug} />
              <span className="pcard-num" aria-hidden>{String(i + 1).padStart(2, "0")}</span>
              <span className="pcard-iconwrap">
                <PcardRing />
                <Icon name={cat.slug} size={92} className="pcard-icon" />
              </span>
              <h2 className="pcard-title">{dict.categories[cat.slug].label}</h2>
              <p className="pcard-text">{dict.categories[cat.slug].description}</p>
              <span className="pcard-go" aria-hidden>→</span>
            </span>
            <PcardTape />
          </TearCard>
        ))}
      </div>
    </div>
  );
}
