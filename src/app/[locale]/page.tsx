import Link from "next/link";
import { CATEGORIES, SUBJECTS } from "@/lib/taxonomy";
import { HomeProgress } from "@/components/HomeProgress";
import { DailyQuizTeaser } from "@/components/DailyQuizTeaser";
import { ArcadeDemo } from "@/components/ArcadeDemo";
import { TeacherCta } from "@/components/TeacherCta";
import { Tilt } from "@/components/Tilt";
import { ALIEN_ROW, Circuit, HomeArt, SpriteFrame, Wave } from "@/components/SpaceDecor";
import { LazyPlanet, LazySubjectGlobe, LazyTownLife } from "@/components/HomeLazy";
import { GlobeSky } from "@/components/GlobeSky";
import { IslandHub } from "@/components/IslandHub";
import { HeroSky } from "@/components/HeroSky";
import { getHomeText } from "@/i18n/home";
import { getHomeAudienceText } from "@/i18n/home-teachers";
import { getSubjectText } from "@/i18n/subjects";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SITE_NAME, pageMetadata } from "@/lib/seo";

const TILE_COLORS = ["#ffc933", "#ff8a6b", "#8fd0ff", "#7ee0b0"];
const GALAXY_ICONS = ["sekce-zakladni", "sekce-stredni", "sekce-prijimacky", "sekce-maturita"];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata(locale, "", SITE_NAME, getDictionary(locale).home.subtitle, { absoluteTitle: true });
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
  const a = getHomeAudienceText(locale as Locale);
  const sample = [{ who: "A. K.", pct: 100 }, { who: "T. N.", pct: 100 }, { who: "E. P.", pct: 60 }, { who: "J. S.", pct: 20 }];
  const subjectText = getSubjectText(locale as Locale);
  const featureLinks = {
    courses: { href: `/${locale}/kurzy/zakladni`, icon: "funkce-kurzy", color: "#8fd0ff", kind: "book" },
    games: { href: `/${locale}/stale-hry`, icon: "funkce-hry", color: "#c9b8ff", kind: "joystick" },
    escape: { href: `/${locale}/unikovky`, icon: "funkce-unikovky", color: "#7ee0b0", kind: "door" },
    boards: { href: `/${locale}/zebricky`, icon: "funkce-zebricky", color: "#ffc933", kind: "trophy" },
  } as const satisfies Record<string, { href: string; icon: string; color: string; kind: string }>;
  const heading = { fontFamily: "var(--font-heading)" };

  return (
    <div className="space-page">
      {/* 1) Vesmír: hrdina a postup */}
      <div className="zone zone-space">
        <HeroSky />
        <section className="gradient-hero relative">
          <LazyPlanet
            className="absolute -right-20 top-16 -z-10 hidden opacity-95 lg:block"
            size={500}
            dir="/home/planet-hero"
            still="/home/planeta.webp"
            spinSeconds={64}
            glow="drop-shadow(0 0 40px rgba(180,120,255,0.35))"
          />
          <SpriteFrame
            sheet="aliens"
            col={0}
            row={ALIEN_ROW.krab}
            size={96}
            className="space-float absolute left-[46%] top-6 hidden lg:block"
          />
          <SpriteFrame
            sheet="aliens"
            col={1}
            row={ALIEN_ROW.ufo}
            size={110}
            className="space-float absolute right-[8%] top-10 hidden md:block"
            style={{ animationDelay: "-2s" }}
          />

          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-10 sm:px-6 sm:py-16 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
            <div className="flex flex-col items-start gap-6">
              <span style={{ ["--d" as string]: "0.05s" }} className="hero-in rounded-md border-2 border-[var(--edge)] bg-[var(--surface)]/80 px-2.5 py-1 text-xs font-bold uppercase tracking-widest shadow-[0_0_18px_rgba(124,108,255,0.45)]">
                {badge}
              </span>
              <h1
                className="hero-in text-3xl font-extrabold leading-[1.3] tracking-tight sm:text-4xl lg:text-5xl"
                style={{ ...heading, ["--d" as string]: "0.18s" }}
              >
                {dict.home.titleLine1}{" "}
                <span className="gradient-text">{dict.home.titleLine2}</span>
              </h1>
              <p className="hero-in max-w-xl text-lg leading-relaxed text-[var(--muted)]" style={{ ["--d" as string]: "0.32s" }}>{dict.home.subtitle}</p>
              <div className="hero-in flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4" style={{ ["--d" as string]: "0.46s" }}>
                <Link
                  href={`/${locale}/kurzy/zakladni`}
                  className="btn-bouncy btn-cta btn-primary btn-lg"
                >
                  {a.playCta}
                </Link>
                <TeacherCta locale={locale as Locale} className="btn-bouncy btn-secondary btn-lg">
                  {a.teacherCta}
                </TeacherCta>
              </div>
              <p className="hero-in text-sm text-[var(--muted)]" style={{ ["--d" as string]: "0.58s" }}>
                {a.teacherHint}{" "}
                <Link href={`/${locale}/registrace`} className="font-bold text-[var(--accent-green)] hover:underline">
                  {a.accountLink} →
                </Link>
              </p>
            </div>
            <div className="hero-in-right">
              <Tilt max={6}>
                <ArcadeDemo />
              </Tilt>
            </div>
          </div>
        </section>

        <section className="reveal relative mx-auto max-w-6xl px-4 pb-14 pt-4 sm:px-6">
          <HomeProgress locale={locale as Locale} registerLabel={dict.home.createAccount} />
          <div className="mt-4">
            <DailyQuizTeaser locale={locale as Locale} />
          </div>
        </section>
      </div>

      {/* 2) Příroda: předměty */}
      <section className="zone zone-space zone-globe">
        <Wave fill="#0c0a24" />
        <GlobeSky />
        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-24 sm:px-6">
          <div className="reveal mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" style={heading}>
                {h.subjectsTitle}
              </h2>
              <p className="mt-1 max-w-xl text-sm text-[var(--muted)]">{h.subjectsHint}</p>
            </div>
            <Link
              href={`/${locale}/kurzy/zakladni`}
              className="text-sm font-bold text-[var(--accent-green)] hover:underline"
            >
              {h.allCourses} →
            </Link>
          </div>
          <div className="relative">
          <LazySubjectGlobe
            locale={locale as Locale}
            subjects={SUBJECTS.map((subject) => ({
              slug: subject.slug,
              value: subject.value,
              label: subjectText.labels[subject.value],
              color: subject.color,
            }))}
          />
          </div>
        </div>
      </section>

      {/* 3) Technika: co tu najdeš */}
      <section className="zone zone-tech">
        <Wave fill="#0c0a24" />
        <Circuit className="right-0 top-20 hidden h-44 w-80 lg:block" />
        <Circuit className="bottom-6 left-0 hidden h-44 w-80 lg:block" flip />
        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-24 sm:px-6">
          <h2 className="reveal mb-2 text-2xl font-bold tracking-tight sm:text-3xl" style={heading}>
            {h.featuresTitle}
          </h2>
          <p className="mb-10 font-mono text-xs uppercase tracking-[0.3em] text-[#35d0ff]/80">
            <span className="tech-blink">●</span> 01 — 0{h.features.length}
          </p>
          <IslandHub
            features={h.features.map((feature) => ({
              key: feature.key,
              title: feature.title,
              text: feature.text,
              cta: feature.cta,
              href: featureLinks[feature.key].href,
              color: featureLinks[feature.key].color,
            }))}
          />
        </div>
      </section>

      {/* 4) Hory: jak to funguje */}
      <section className="zone zone-peak">
        <Wave fill="#071427" />
        <div className="relative z-10 pb-16 pt-16 sm:pb-32 sm:pt-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="reveal mb-6 text-2xl font-bold tracking-tight sm:mb-8 sm:text-3xl" style={heading}>
              {h.stepsTitle}
            </h2>
          </div>
          {/* scéna jde přes celou sekci (až 1680 px), na telefonu od kraje ke kraji */}
          <div className="mx-auto w-full max-w-[1680px] px-2 sm:px-4 lg:px-6">
            <LazyTownLife steps={h.steps} locale={locale} />
          </div>
        </div>
      </section>

      {/* 5) Zpět do vesmíru: kategorie */}
      <section className="zone zone-space">
        <Wave fill="#160a2c" />
        <LazyPlanet className="absolute -bottom-10 -left-12 -z-10 hidden lg:block" size={520} />
        <SpriteFrame
          sheet="aliens"
          col={1}
          row={ALIEN_ROW.kyklop}
          size={92}
          className="space-float absolute right-8 top-20 hidden sm:block"
          style={{ animationDelay: "-2.5s" }}
        />
        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-24 sm:px-6">
          <h2 className="reveal mb-8 text-2xl font-bold tracking-tight sm:text-3xl" style={heading}>
            {dict.home.pickSection}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((cat, i) => {
              const color = TILE_COLORS[i % TILE_COLORS.length];
              return (
                <Link
                  key={cat.slug}
                  href={`/${locale}/kurzy/${cat.slug}`}
                  className="reveal card card-hover relative flex min-h-36 flex-col justify-between gap-4 sm:min-h-44 sm:gap-6 overflow-hidden p-5 text-white"
                  style={{
                    background: `radial-gradient(circle at 85% 12%, ${color}66, transparent 55%), linear-gradient(160deg, #1d1848, #0d0a26)`,
                    borderColor: color,
                    ["--glow" as string]: `${color}55`,
                  }}
                >
                  <HomeArt name={GALAXY_ICONS[i % GALAXY_ICONS.length]} size={128} className="absolute -right-4 -top-5 opacity-95" />
                  <span className="text-4xl font-extrabold leading-none" style={{ ...heading, color }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="mb-1 text-lg font-bold">{dict.categories[cat.slug].label}</h3>
                    <p className="text-sm text-white/75">{dict.categories[cat.slug].description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6) Pro učitele */}
      <section id="pro-ucitele" className="zone zone-tech scroll-mt-24">
        <Wave fill="#160a2c" />
        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-24 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="reveal mb-2 text-xs font-bold uppercase tracking-widest text-[var(--accent-green)]">{a.teachers.eyebrow}</p>
              <h2 className="reveal mb-4 text-2xl font-bold tracking-tight sm:text-3xl" style={heading}>
                {a.teachers.title}
              </h2>
              <p className="reveal mb-8 max-w-xl text-lg leading-relaxed text-[var(--muted)]">{a.teachers.lead}</p>
              <ul className="grid gap-4 sm:grid-cols-2">
                {a.teachers.points.map((point) => (
                  <li key={point.title} className="reveal card p-4">
                    <h3 className="mb-1 font-bold">{point.title}</h3>
                    <p className="text-sm leading-relaxed text-[var(--muted)]">{point.text}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col items-start gap-2">
                <TeacherCta locale={locale as Locale} className="btn-bouncy btn-cta btn-primary btn-lg">
                  {a.teachers.cta}
                </TeacherCta>
                <p className="text-sm text-[var(--muted)]">{a.teachers.ctaHint}</p>
              </div>
            </div>
            {/* Ilustrační ukázka přehledu výsledků (není to živá data) */}
            <div aria-hidden className="reveal card p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold" style={heading}>{a.teachers.previewTitle}</p>
                  <p className="text-xs text-[var(--muted)]">{a.teachers.previewDue}</p>
                </div>
                <span className="rounded-md border-2 border-[var(--edge)] px-2 py-0.5 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
                  {a.teachers.previewSample}
                </span>
              </div>
              <ul className="space-y-3">
                {sample.map((row) => (
                  <li key={row.who} className="flex items-center gap-3">
                    <span className="w-10 shrink-0 text-sm font-semibold">{row.who}</span>
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
              <p className="mt-4 text-xs text-[var(--muted)]">2 / 4 {a.teachers.previewDone}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7) O nás */}
      <section id="o-nas" className="zone zone-tech scroll-mt-24">
        <Wave fill="#071427" />
        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-24 sm:px-6">
          <h2 className="reveal mb-4 text-2xl font-bold tracking-tight sm:text-3xl" style={heading}>
            {h.about.title}
          </h2>
          <p className="reveal mb-10 max-w-3xl text-lg leading-relaxed text-[var(--muted)]">{h.about.lead}</p>
          <div className="grid gap-5 md:grid-cols-3">
            {h.about.points.map((point) => (
              <article key={point.title} className="reveal card p-6">
                <h3 className="mb-2 text-lg font-bold">{point.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--muted)]">{point.text}</p>
              </article>
            ))}
          </div>
          <div className="reveal mt-12 grid gap-5 md:grid-cols-2">
            {[h.about.why, h.about.problem].map((block) => (
              <div key={block.title} className="card p-6">
                <h3 className="mb-2 text-lg font-bold">{block.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--muted)]">{block.text}</p>
              </div>
            ))}
          </div>
          <div className="reveal mt-12">
            <h3 className="mb-4 text-xl font-bold" style={heading}>
              {h.about.teamTitle}
            </h3>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {h.about.team.map((member) => (
                <li key={member.name} className="card flex items-start gap-4 p-4">
                  <span aria-hidden className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--surface-muted)] text-xl font-extrabold" style={heading}>
                    {member.name.charAt(0)}
                  </span>
                  <div>
                    <p className="font-bold">{member.name}</p>
                    <p className="text-sm font-semibold text-[var(--accent-green)]">{member.role}</p>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">{member.bio}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href={`/${locale}/kontakt`} className="btn-bouncy btn-secondary inline-flex">
              {h.about.contact} →
            </Link>
            <a href={`mailto:${h.about.email}`} className="font-semibold text-[var(--accent-green)] hover:underline">
              {h.about.email}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
