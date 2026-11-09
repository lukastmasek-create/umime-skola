import Link from "next/link";
import { notFound } from "next/navigation";
import { TeacherCta } from "@/components/TeacherCta";
import { getAudiencePagesText } from "@/i18n/audience";
import { isLocale, type Locale } from "@/i18n/config";
import { staticPageMetadata } from "@/lib/seo";

export const generateMetadata = staticPageMetadata("/ucitele");

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
      <p className="mb-10 max-w-2xl text-lg leading-relaxed text-[var(--muted)]">{t.subtitle}</p>

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
