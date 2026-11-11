import Link from "next/link";
import { notFound } from "next/navigation";
import { ResultsPreview } from "@/components/ResultsPreview";
import { getHomeAudienceText } from "@/i18n/home-teachers";
import LiveCardItem from "@/components/LiveCardItem";
import { TeacherCta } from "@/components/TeacherCta";
import { getAudiencePagesText } from "@/i18n/audience";
import { isLocale, type Locale } from "@/i18n/config";
import { staticPageMetadata } from "@/lib/seo";

export const generateMetadata = staticPageMetadata("/ucitele");

// Ilustrační data pro ukázku přehledu (nejsou to živá data, jména jsou jen příklad).
const sample = [
  { who: "Adam", pct: 100 },
  { who: "Bára", pct: 80 },
  { who: "Cyril", pct: 45 },
  { who: "Dana", pct: 20 },
];

// Ikony pro tři kroky (stejné pořadí jako t.steps): skupina, úkol, výsledky.
const stepIcons = [
  <svg key="users" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="9" cy="7" r="4" />
    <path d="M2 21v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2" />
    <path d="M16 3.5a4 4 0 0 1 0 7M22 21v-2a5 5 0 0 0-3-4.6" />
  </svg>,
  <svg key="task" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="5" y="4" width="14" height="17" rx="2" />
    <path d="M9 2.5h6v3H9zM9 12l2 2 4-4M9 18h6" />
  </svg>,
  <svg key="chart" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M3 3v18h18" />
    <path d="M7 15l4-4 3 3 5-6" />
  </svg>,
];

export default async function TeachersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getAudiencePagesText(locale as Locale).teachers;
  const heading = { fontFamily: "var(--font-heading)" };

  return (
    <>
      {/* Hlavní blok stránky */}
      <section className="zone zone-tech">
        <div className="mx-auto max-w-4xl px-4 pb-20 pt-14 text-center sm:px-6 sm:pt-20">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[var(--accent-green)]">{t.nav}</p>
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl" style={heading}>
            {t.title}
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-[var(--muted)]">{t.subtitle}</p>
          <div className="flex flex-col items-center gap-2">
            <TeacherCta locale={locale as Locale} className="btn-bouncy btn-cta btn-primary btn-lg">
              {t.cta}
            </TeacherCta>
            <p className="text-sm text-[var(--muted)]">{t.ctaHint}</p>
          </div>
        </div>
      </section>

      <noscript>
        <style>{".gc-item{opacity:1!important;transform:none!important}"}</style>
      </noscript>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        {/* Tři kroky jako zvýrazněné karty; prostřední je vybraná */}
        <section className="mb-16">
          <p className="mb-2 text-center text-xs font-bold uppercase tracking-widest text-[var(--accent-green)]">{t.stepsTitle}</p>
          <ol className="gcard-cycle mt-8 grid gap-6 md:grid-cols-3">
            {t.steps.map((step, i) => {
              const featured = i === 1;
              return (
                <LiveCardItem
                  key={step.title}
                  index={i}
                  className={`relative flex h-full flex-col p-6 ${featured ? "gcard-on md:-translate-y-4" : ""}`}
                >
                  <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface-muted)] text-[var(--accent-green)]">
                    {stepIcons[i]}
                  </span>
                  <span aria-hidden className="gcard-num absolute right-5 top-4 text-5xl opacity-90">
                    {i + 1}
                  </span>
                  <h2 className="mb-2 text-xl font-bold" style={heading}>
                    {step.title}
                  </h2>
                  <p className="text-sm leading-relaxed text-[var(--muted)]">{step.text}</p>
                </LiveCardItem>
              );
            })}
          </ol>
        </section>

        <ul className="gcard-cycle mb-12 grid gap-4 sm:grid-cols-2">
          {t.points.map((point, i) => (
            <LiveCardItem key={point.title} index={i} className="h-full p-5">
              <h2 className="gcard-title mb-1 text-lg" style={heading}>
                {point.title}
              </h2>
              <p className="text-sm leading-relaxed text-[var(--muted)]">{point.text}</p>
            </LiveCardItem>
          ))}
        </ul>

        {/* Ilustrační ukázka přehledu výsledků (není to živá data) */}
        <section className="mb-12">
          <ResultsPreview title={t.previewTitle} due={t.previewDue} badge={t.previewBadge} doneLabel={getHomeAudienceText(locale as Locale).teachers.previewDone} rows={sample} />
          <p className="mt-2 text-xs text-[var(--muted)]">{t.previewCaption}</p>
        </section>

        <section className="mb-12">
          <h2 className="mb-5 text-xl font-bold sm:text-2xl" style={heading}>
            {t.featuresTitle}
          </h2>
          <ul className="gcard-cycle grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.features.map((feature, i) => (
              <LiveCardItem key={feature.title} index={i} className="h-full p-5">
                <h3 className="gcard-title mb-1">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--muted)]">{feature.text}</p>
              </LiveCardItem>
            ))}
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="mb-5 text-xl font-bold sm:text-2xl" style={heading}>
            {t.faqTitle}
          </h2>
          <div className="grid gap-3">
            {t.faq.map((item) => (
              <details key={item.q} className="gcard gcard-soft group p-5">
                <summary className="cursor-pointer font-bold">{item.q}</summary>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Závěrečný CTA pás */}
        <section className="gcard flex flex-col items-center gap-4 p-8 text-center" style={{ ["--gc" as string]: "#6ee7b7" }}>
          <p className="max-w-xl text-base text-[var(--muted)]">{t.ctaHint}</p>
          <TeacherCta locale={locale as Locale} className="btn-bouncy btn-cta btn-primary btn-lg">
            {t.cta}
          </TeacherCta>
        </section>

        <div className="mt-10">
          <Link href={`/${locale}/zaci`} className="font-semibold text-[var(--accent-green)] hover:underline">
            {t.studentsLink}
          </Link>
        </div>
      </div>
    </>
  );
}
