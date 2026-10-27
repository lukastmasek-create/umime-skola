import Link from "next/link";
import { CATEGORIES, SUBJECTS } from "@/lib/taxonomy";
import { HomeProgress } from "@/components/HomeProgress";
import { DailyChallenges } from "@/components/DailyChallenges";
import { ArcadeDemo } from "@/components/ArcadeDemo";
import { ALIEN_ROW, Circuit, HomeArt, NatureDecor, Nebula, Planet, Rocket, SpriteFrame, TechBus, Wave } from "@/components/SpaceDecor";
import { CardIcon3D, GearHolo3D, TechBackdrop, type IconKind } from "@/components/TechScenes";
import { Liana, MountainScene } from "@/components/HomeAnim";
import { PlanetLive } from "@/components/PlanetLive";
import { getHomeText } from "@/i18n/home";
import { getSubjectText } from "@/i18n/subjects";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import { notFound } from "next/navigation";

const TILE_COLORS = ["#ffc933", "#ff8a6b", "#8fd0ff", "#7ee0b0"];
const GALAXY_ICONS = ["sekce-zakladni", "sekce-stredni", "sekce-prijimacky", "sekce-maturita"];

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
    courses: { href: `/${locale}/kurzy/zakladni`, icon: "funkce-kurzy", color: "#8fd0ff", kind: "book" },
    games: { href: `/${locale}/kurzy/zakladni`, icon: "funkce-hry", color: "#c9b8ff", kind: "joystick" },
    escape: { href: `/${locale}/unikovky`, icon: "funkce-unikovky", color: "#7ee0b0", kind: "door" },
    boards: { href: `/${locale}/zebricky`, icon: "funkce-zebricky", color: "#ffc933", kind: "trophy" },
  } as const satisfies Record<string, { href: string; icon: string; color: string; kind: IconKind }>;
  const heading = { fontFamily: "var(--font-heading)" };

  return (
    <div className="space-page">
      {/* 1) Vesmír: hrdina a postup */}
      <div className="zone zone-space">
        <Nebula className="absolute inset-0 -z-10 h-full" />
        <div aria-hidden className="hero-aurora">
          <span style={{ left: "-8%", top: "4%", width: 460, height: 460, background: "#7c6cff" }} />
          <span style={{ right: "6%", top: "28%", width: 380, height: 380, background: "#ff8fd0", animationDelay: "-6s" }} />
          <span style={{ left: "38%", top: "-6%", width: 320, height: 320, background: "#35d0ff", animationDelay: "-11s" }} />
        </div>
        <section className="gradient-hero relative">
          <Planet className="absolute -right-20 top-16 -z-10 hidden opacity-90 lg:block" size={470} />
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
          <Rocket className="bottom-16" />

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
                  🚀 {dict.home.browseCourses}
                </Link>
                <Link
                  href={`/${locale}/registrace`}
                  className="btn-bouncy btn-secondary btn-lg"
                >
                  {dict.home.createAccount}
                </Link>
              </div>
            </div>
            <div className="hero-in-right">
              <ArcadeDemo />
            </div>
          </div>
        </section>

        <section className="reveal relative mx-auto max-w-6xl px-4 pb-14 pt-4 sm:px-6">
          <HomeProgress locale={locale as Locale} registerLabel={dict.home.createAccount} />
          <div className="mt-4">
            <DailyChallenges locale={locale as Locale} />
          </div>
        </section>
      </div>

      {/* 2) Příroda: předměty */}
      <section className="zone zone-nature">
        <Wave fill="#0c0a24" />
        <NatureDecor />
        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-24 sm:px-6">
          <div className="reveal mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" style={heading}>
                🌳 {h.subjectsTitle}
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
            <Liana className="absolute -bottom-16 -left-40 z-20 hidden lg:block" />
            <Liana className="absolute -bottom-16 -right-40 z-20 hidden lg:block" flip />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">
            {SUBJECTS.map((subject) => (
              <Link
                key={subject.slug}
                href={`/${locale}/kurzy/zakladni?predmet=${subject.slug}`}
                className="reveal card card-hover group relative flex items-center gap-3 p-3 text-[#1b1830] last:col-span-2 sm:gap-4 sm:p-4 sm:last:col-span-1"
                style={{
                  background: subject.color,
                  borderColor: "#16132b",
                  ["--glow" as string]: "rgba(120,220,150,0.35)",
                }}
              >
                <span
                  aria-hidden
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-[#16132b] bg-white/60 text-2xl shadow-[inset_-4px_-4px_0_rgba(0,0,0,0.12)] sm:h-14 sm:w-14 sm:text-3xl"
                >
                  <HomeArt name={`predmet-${subject.slug}`} size={52} className="home-icon h-10 w-10 sm:h-12 sm:w-12" />
                </span>
                <span className="text-sm font-bold leading-tight sm:text-base">
                  {subjectText.labels[subject.value]}
                </span>
                <span aria-hidden className="bloom hidden sm:block" />
              </Link>
            ))}
          </div>
          </div>
        </div>
      </section>

      {/* 3) Technika: co tu najdeš */}
      <section className="zone zone-tech">
        <Wave fill="#0f3326" />
        <Circuit className="right-0 top-20 hidden h-44 w-80 lg:block" />
        <Circuit className="bottom-6 left-0 hidden h-44 w-80 lg:block" flip />
        <TechBackdrop />
        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-24 sm:px-6">
          <h2 className="reveal mb-2 text-2xl font-bold tracking-tight sm:text-3xl" style={heading}>
            <GearHolo3D /> {h.featuresTitle}
          </h2>
          <p className="mb-8 font-mono text-xs uppercase tracking-[0.3em] text-[#35d0ff]/80">
            <span className="tech-blink">●</span> 01 — 0{h.features.length}
          </p>
          <TechBus colors={h.features.map((feature) => featureLinks[feature.key].color)} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {h.features.map((feature, i) => {
              const f = featureLinks[feature.key];
              return (
                <Link
                  key={feature.key}
                  href={f.href}
                  className="reveal card card-hover tech-card flex flex-col gap-3 p-5"
                  style={{ borderColor: `${f.color}88`, ["--tc" as string]: f.color, ["--i" as string]: i, ["--glow" as string]: `${f.color}33` }}
                >
                  <span aria-hidden className="electric" />
                  <span className="font-mono text-[11px] tracking-[0.25em]" style={{ color: f.color }}>
                    {"// 0" + (i + 1)}
                  </span>
                  <span
                    aria-hidden
                    className="flex h-12 w-12 items-center justify-center rounded-md border-2 text-2xl"
                    style={{ borderColor: f.color, background: `${f.color}22`, boxShadow: `0 0 18px ${f.color}55` }}
                  >
                    <CardIcon3D kind={f.kind} fallback={f.icon} />
                  </span>
                  <h3 className="text-lg font-bold">{feature.title}</h3>
                  <p className="text-sm text-[var(--muted)]">{feature.text}</p>
                  <span className="mt-auto pt-1 font-mono text-sm font-bold" style={{ color: f.color }}>
                    {feature.cta} →
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4) Hory: jak to funguje */}
      <section className="zone zone-peak">
        <Wave fill="#071427" />
        <HomeArt name="oblak-1" size={120} className="space-float absolute right-[12%] top-20 z-0 hidden h-auto sm:block" />
        <HomeArt name="oblak-2" size={96} className="space-float absolute left-[2%] top-28 z-0 hidden h-auto sm:block" style={{ animationDelay: "-3s" }} />
        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-48 pt-24 sm:px-6 sm:pb-80">
          <h2 className="reveal mb-8 text-2xl font-bold tracking-tight sm:text-3xl" style={heading}>
            🏔️ {h.stepsTitle}
          </h2>
          <ol className="relative grid gap-8 md:grid-cols-3 md:gap-5">
            <span aria-hidden className="steps-line absolute left-6 right-6 top-6 hidden md:block" />
            <span aria-hidden className="steps-runner hidden md:block" />
            {h.steps.map((step, i) => (
              <li key={step.title} className="reveal relative flex gap-4 md:flex-col md:items-start">
                <span className="step-badge relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-[0_0_22px_rgba(255,210,77,0.6)]" style={{ ["--d" as string]: `${[-0.45, 1.6, 3.65][i]}s` }}>
                  <HomeArt name={`krok-${i + 1}`} size={56} className="h-14 w-14 max-w-none" />
                  <span className="sr-only">{i + 1}</span>
                </span>
                <div>
                  <h3 className="font-bold">{step.title}</h3>
                  <p className="mt-1 text-sm text-white/80">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <MountainScene />
      </section>

      {/* 5) Zpět do vesmíru: kategorie */}
      <section className="zone zone-space">
        <Wave fill="#160a2c" />
        <PlanetLive className="absolute -bottom-10 -left-12 -z-10 hidden lg:block" size={520} />
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
            🌌 {dict.home.pickSection}
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
    </div>
  );
}
