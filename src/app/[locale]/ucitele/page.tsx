import Link from "next/link";
import { notFound } from "next/navigation";
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

export default async function TeachersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getAudiencePagesText(locale as Locale).teachers;
  const heading = { fontFamily: "var(--font-heading)" };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[var(--accent-green)]">{t.nav}</p>
      <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl" style={heading}>
        {t.title}
      </h1>
      <p className="mb-6 max-w-2xl text-lg leading-relaxed text-[var(--muted)]">{t.subtitle}</p>

      <div className="mb-10 flex flex-col items-start gap-2">
        <TeacherCta locale={locale as Locale} className="btn-bouncy btn-cta btn-primary btn-lg">
          {t.cta}
        </TeacherCta>
        <p className="text-sm text-[var(--muted)]">{t.ctaHint}</p>
      </div>

      <ul className="mb-12 grid gap-4 sm:grid-cols-2">
        {t.points.map((point) => (
          <li key={point.title} className="card p-5">
            <h2 className="mb-1 text-lg font-bold" style={heading}>
              {point.title}
            </h2>
            <p className="text-sm leading-relaxed text-[var(--muted)]">{point.text}</p>
          </li>
        ))}
      </ul>

      {/* Ilustrační ukázka přehledu výsledků (není to živá data) */}
      <section className="mb-12">
        <div aria-hidden className="card p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="font-bold" style={heading}>
                {t.previewTitle}
              </p>
              <p className="text-xs text-[var(--muted)]">{t.previewDue}</p>
            </div>
            <span className="rounded-md border-2 border-[var(--edge)] px-2 py-0.5 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
              {t.previewBadge}
            </span>
          </div>
          <ul className="space-y-3">
            {sample.map((row) => (
              <li key={row.who} className="flex items-center gap-3">
                <span className="w-14 shrink-0 text-sm font-semibold">{row.who}</span>
                <span className="h-3 flex-1 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                  <span
                    className="block h-full rounded-full"
                    style={{ width: `${row.pct}%`, background: row.pct === 100 ? "var(--accent-green)" : "#ffc933" }}
                  />
                </span>
                <span className="w-9 shrink-0 text-right text-xs font-bold text-[var(--muted)]">{row.pct} %</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-2 text-xs text-[var(--muted)]">{t.previewCaption}</p>
      </section>

      <section className="mb-12">
        <h2 className="mb-5 text-xl font-bold sm:text-2xl" style={heading}>
          {t.stepsTitle}
        </h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {t.steps.map((step, i) => (
            <li key={step.title} className="card flex gap-4 p-5">
              <span aria-hidden className="text-3xl font-extrabold leading-none text-[var(--accent-green)]" style={heading}>
                {i + 1}
              </span>
              <div>
                <h3 className="mb-1 font-bold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--muted)]">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mb-12">
        <h2 className="mb-5 text-xl font-bold sm:text-2xl" style={heading}>
          {t.featuresTitle}
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {t.features.map((feature) => (
            <li key={feature.title} className="card p-5">
              <h3 className="mb-1 font-bold">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-[var(--muted)]">{feature.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="mb-5 text-xl font-bold sm:text-2xl" style={heading}>
          {t.faqTitle}
        </h2>
        <div className="grid gap-3">
          {t.faq.map((item) => (
            <details key={item.q} className="card group p-5">
              <summary className="cursor-pointer font-bold">{item.q}</summary>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <div className="flex flex-col items-start gap-2">
        <TeacherCta locale={locale as Locale} className="btn-bouncy btn-cta btn-primary btn-lg">
          {t.cta}
        </TeacherCta>
        <p className="text-sm text-[var(--muted)]">{t.ctaHint}</p>
      </div>

      <div className="mt-10">
        <Link href={`/${locale}/zaci`} className="font-semibold text-[var(--accent-green)] hover:underline">
          {t.studentsLink}
        </Link>
      </div>
    </div>
  );
}
