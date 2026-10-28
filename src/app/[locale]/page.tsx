import Link from "next/link";
import { CATEGORIES, SUBJECTS } from "@/lib/taxonomy";
import { HomeProgress } from "@/components/HomeProgress";
import { DailyChallenges } from "@/components/DailyChallenges";
import { ArcadeDemo } from "@/components/ArcadeDemo";
import { Tilt } from "@/components/Tilt";
import { ALIEN_ROW, HomeArt, SpriteFrame, Wave } from "@/components/SpaceDecor";
import { TownLife } from "@/components/TownLife";
import { PlanetLive } from "@/components/PlanetLive";
import { SubjectGlobe } from "@/components/SubjectGlobe";
import { GlobeSky } from "@/components/GlobeSky";
import { IslandHub } from "@/components/IslandHub";
import { HeroSky } from "@/components/HeroSky";
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
  } as const satisfies Record<string, { href: string; icon: string; color: string; kind: string }>;
  const heading = { fontFamily: "var(--font-heading)" };

  return (
    <div className="space-page">
      {/* 1) Vesmír: hrdina a postup */}
      <div className="zone zone-space">
        <HeroSky />
        <section className="gradient-hero relative">
          <PlanetLive
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
              <Tilt max={6}>
                <ArcadeDemo />
              </Tilt>
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
      <section className="zone zone-space zone-globe">
        <Wave fill="#0c0a24" />
        <GlobeSky />
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
          <SubjectGlobe
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
      <section className="zone zone-isles">
        <Wave fill="#0c0a24" />
        <HomeArt name="oblak-1" size={120} className="space-float absolute right-[8%] top-28 z-0 hidden h-auto opacity-70 sm:block" />
        <HomeArt name="oblak-2" size={96} className="space-float absolute left-[3%] bottom-24 z-0 hidden h-auto opacity-70 sm:block" style={{ animationDelay: "-3s" }} />
        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-24 sm:px-6">
          <h2 className="reveal mb-10 text-2xl font-bold tracking-tight sm:text-3xl" style={heading}>
            {h.featuresTitle}
          </h2>
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
        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-24 sm:px-6 sm:pb-32">
          <h2 className="reveal mb-8 text-2xl font-bold tracking-tight sm:text-3xl" style={heading}>
            🏔️ {h.stepsTitle}
          </h2>
          <TownLife steps={h.steps} locale={locale} />
        </div>
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
