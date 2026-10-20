import Link from "next/link";
import { CATEGORIES } from "@/lib/taxonomy";
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

  return (
    <div>
      <section className="gradient-hero border-b-2 border-[var(--edge)]">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
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

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2
          className="mb-8 text-2xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {dict.home.pickSection}
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((cat, i) => (
            <Link
              key={cat.slug}
              href={`/${locale}/kurzy/${cat.slug}`}
              className="card card-hover flex min-h-52 flex-col justify-between gap-6 p-5 text-[#1b1830]"
              style={{ background: TILE_COLORS[i % TILE_COLORS.length] }}
            >
              <span
                className="text-4xl font-extrabold leading-none"
                style={{ fontFamily: "var(--font-heading)" }}
              >
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

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="card flex flex-col items-start gap-4 p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
              {dict.home.pointsTitle}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">
              {dict.home.pointsDesc}
            </p>
          </div>
          <span className="points-badge pill shrink-0 px-4 py-2 text-sm">
            0 {dict.home.pointsBadge}
          </span>
        </div>
      </section>
    </div>
  );
}
