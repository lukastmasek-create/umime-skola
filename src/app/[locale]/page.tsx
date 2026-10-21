import Link from "next/link";
import { CATEGORIES, SUBJECTS } from "@/lib/taxonomy";
import { HomeProgress } from "@/components/HomeProgress";
import { getHomeText } from "@/i18n/home";
import { getSubjectText } from "@/i18n/subjects";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import { notFound } from "next/navigation";

const TILE_COLORS = ["#ffc933", "#ff8a6b", "#8fd0ff", "#7ee0b0"];

const ALIENS = [
  { letter: "i", color: "#7c6cff" },
  { letter: "í", color: "#ff5d73" },
  { letter: "y", color: "#ffb020" },
  { letter: "ý", color: "#22c55e" },
];

function ArcadeScreen() {
  return (
    <div
      aria-hidden
      className="relative mx-auto w-full max-w-md select-none overflow-hidden rounded-2xl border-2 border-[var(--edge)] bg-[#0f0c24] p-4 shadow-[6px_6px_0_var(--shadow-ink)]"
    >
      <div className="mb-3 flex items-center justify-between font-mono text-xs text-white/60">
        <span>♥ ♥ ♥</span>
        <span>0120</span>
      </div>
      <div
        className="mb-6 rounded-lg bg-white/10 px-3 py-2 text-center text-sm font-bold text-white"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        ž ___ vot
      </div>
      <div className="grid grid-cols-4 gap-3">
        {ALIENS.map((alien) => (
          <div key={alien.letter} className="flex flex-col items-center gap-1.5">
            <div
              className="relative h-9 w-12 rounded-t-full"
              style={{ background: alien.color }}
            >
              <span className="absolute left-2.5 top-3 h-2 w-2 rounded-full bg-white" />
              <span className="absolute right-2.5 top-3 h-2 w-2 rounded-full bg-white" />
            </div>
            <div
              className="w-full rounded-md border-2 bg-[#0f0c24] py-0.5 text-center text-sm font-bold text-white"
              style={{ borderColor: alien.color }}
            >
              {alien.letter}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-col items-center gap-1">
        <span className="h-3 w-1 rounded-sm bg-[#ffe066]" />
        <span
          className="block h-0 w-0"
          style={{
            borderLeft: "14px solid transparent",
            borderRight: "14px solid transparent",
            borderBottom: "22px solid #22d3ee",
          }}
        />
      </div>
    </div>
  );
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale as Locale);
  const badge = dict.home.badge.replace(/^[^\p{L}\p{N}]+/u, "");
  const h = getHomeText(locale as Locale);
  const subjectText = getSubjectText(locale as Locale);
  const featureLinks = {
    courses: { href: `/${locale}/kurzy/zakladni`, icon: "📘", color: "#8fd0ff" },
    games: { href: `/${locale}/kurzy/zakladni`, icon: "👾", color: "#c9b8ff" },
    escape: { href: `/${locale}/unikovky`, icon: "🚪", color: "#7ee0b0" },
    boards: { href: `/${locale}/zebricky`, icon: "🏆", color: "#ffc933" },
  } as const;

  return (
    <div>
      <section className="gradient-hero border-b-2 border-[var(--edge)]">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-10 sm:px-6 sm:py-16 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
          <div className="flex flex-col items-start gap-6">
            <span className="rounded-md border-2 border-[var(--edge)] bg-[var(--surface)] px-2.5 py-1 text-xs font-bold uppercase tracking-widest">
              {badge}
            </span>
            <h1
              className="text-3xl font-extrabold leading-[1.4] tracking-tight sm:text-4xl lg:text-[2.6rem]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {dict.home.titleLine1}{" "}
              <span className="gradient-text">{dict.home.titleLine2}</span>
            </h1>
            <p className="max-w-xl text-lg text-[var(--muted)]">{dict.home.subtitle}</p>
            <div className="flex flex-wrap gap-4">
              <Link
                href={`/${locale}/kurzy/zakladni`}
                className="btn-bouncy bg-[var(--brand-500)] px-6 py-3 text-sm font-bold text-white"
              >
                {dict.home.browseCourses}
              </Link>
              <Link
                href={`/${locale}/registrace`}
                className="btn-bouncy bg-[var(--surface)] px-6 py-3 text-sm font-bold"
              >
                {dict.home.createAccount}
              </Link>
            </div>
          </div>
          <ArcadeScreen />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
        <HomeProgress locale={locale as Locale} registerLabel={dict.home.createAccount} />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
              {h.subjectsTitle}
            </h2>
            <p className="mt-1 max-w-xl text-sm text-[var(--muted)]">{h.subjectsHint}</p>
          </div>
          <Link
            href={`/${locale}/kurzy/zakladni`}
            className="text-sm font-bold text-[var(--brand-600)] hover:underline"
          >
            {h.allCourses} →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">
          {SUBJECTS.map((subject) => (
            <Link
              key={subject.slug}
              href={`/${locale}/kurzy/zakladni?predmet=${subject.slug}`}
              className="card card-hover flex items-center gap-3 p-3 text-[#1b1830] last:col-span-2 sm:gap-4 sm:p-4 sm:last:col-span-1"
              style={{ background: subject.color }}
            >
              <span
                aria-hidden
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-[#16132b] bg-white/60 text-2xl sm:h-14 sm:w-14 sm:text-3xl"
              >
                {subject.emoji}
              </span>
              <span className="text-sm font-bold leading-tight sm:text-base">
                {subjectText.labels[subject.value]}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y-2 border-[var(--edge)] bg-[var(--surface)]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="mb-8 text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
            {h.featuresTitle}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {h.features.map((feature) => {
              const f = featureLinks[feature.key];
              return (
                <Link
                  key={feature.key}
                  href={f.href}
                  className="card card-hover flex flex-col gap-3 p-5"
                >
                  <span
                    aria-hidden
                    className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-[#16132b] text-2xl"
                    style={{ background: f.color }}
                  >
                    {f.icon}
                  </span>
                  <h3 className="text-lg font-bold">{feature.title}</h3>
                  <p className="text-sm text-[var(--muted)]">{feature.text}</p>
                  <span className="mt-auto pt-1 text-sm font-bold text-[var(--brand-600)]">{feature.cta} →</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="mb-8 text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          {h.stepsTitle}
        </h2>
        <ol className="grid gap-5 md:grid-cols-3">
          {h.steps.map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-[var(--edge)] bg-[var(--accent-yellow)] text-xl font-extrabold text-[#16132b]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {i + 1}
              </span>
              <div>
                <h3 className="font-bold">{step.title}</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <h2 className="mb-8 text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          {dict.home.pickSection}
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((cat, i) => (
            <Link
              key={cat.slug}
              href={`/${locale}/kurzy/${cat.slug}`}
              className="card card-hover flex min-h-44 flex-col justify-between gap-6 p-5 text-[#1b1830]"
              style={{ background: TILE_COLORS[i % TILE_COLORS.length] }}
            >
              <span className="text-4xl font-extrabold leading-none" style={{ fontFamily: "var(--font-heading)" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="mb-1 text-lg font-bold">{dict.categories[cat.slug].label}</h3>
                <p className="text-sm opacity-80">{dict.categories[cat.slug].description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
