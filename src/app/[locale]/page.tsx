import Link from "next/link";
import { CATEGORIES, SUBJECTS } from "@/lib/taxonomy";
import { HomeProgress } from "@/components/HomeProgress";
import { DailyQuizTeaser } from "@/components/DailyQuizTeaser";
import { TeacherCta } from "@/components/TeacherCta";
import { ALIEN_ROW, HomeArt, SpriteFrame, Wave } from "@/components/SpaceDecor";
import { LazyPlanet, LazySubjectGlobe, LazyTownLife } from "@/components/HomeLazy";
import { GlobeSky } from "@/components/GlobeSky";
import { HeroSky } from "@/components/HeroSky";
import { HeroTitle } from "@/components/HeroTitle";
import { ExpandCard } from "@/components/ExpandCard";
import { TearCard } from "@/components/TearCard";
import { HangTags } from "@/components/HangTags";
import { HomeLobby } from "@/components/HomeLobby";
import { getHomeLobbyText } from "@/i18n/home-lobby";
import { ResultsPreview } from "@/components/ResultsPreview";
import { HeroShowcase } from "@/components/HeroShowcase";
import { getHomeHeroText } from "@/i18n/home-hero";
import { getHomeHangText } from "@/i18n/home-hang";
import { getHomeText } from "@/i18n/home";
import { getHomeAudienceText } from "@/i18n/home-teachers";
import { getAudiencePagesText } from "@/i18n/audience";
import { getSubjectText } from "@/i18n/subjects";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SITE_NAME, pageMetadata } from "@/lib/seo";

const TILE_COLORS = ["#ffc933", "#ff8a6b", "#8fd0ff", "#7ee0b0"];
// Sekce „Jak to funguje“ je archivovaná (skrytá). Pro návrat stačí přepnout na true.
const SHOW_HOW_IT_WORKS = false;
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
  const audience = getAudiencePagesText(locale as Locale);
  const sample = [{ who: "A. K.", pct: 100 }, { who: "T. N.", pct: 100 }, { who: "E. P.", pct: 60 }, { who: "J. S.", pct: 20 }];
  const subjectText = getSubjectText(locale as Locale);
  const heading = { fontFamily: "var(--font-heading)" };

  return (
    <div className="space-page">
      {/* 1) Vesmír: hrdina a postup */}
      <div className="zone zone-space">
        <HeroSky />
        <section className="gradient-hero relative">
          <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 pb-10 pt-12 sm:px-6 sm:pt-16 lg:pb-16 lg:pt-20">
            <div className="flex max-w-3xl flex-col items-center gap-6 text-center">
              <span style={{ ["--d" as string]: "0.05s" }} className="hero-in rounded-md border-2 border-[var(--edge)] bg-[var(--surface)]/80 px-2.5 py-1 text-xs font-bold uppercase tracking-widest shadow-[0_0_18px_rgba(124,108,255,0.45)]">
                {badge}
              </span>
              <h1
                className="hero-in neon-h1 text-4xl leading-[1.3] sm:text-5xl lg:text-[3.25rem]"
                style={{ ["--d" as string]: "0.18s" }}
              >
                <HeroTitle line1={dict.home.titleLine1} line2={dict.home.titleLine2} />
              </h1>
              <p className="hero-in max-w-xl text-lg leading-relaxed text-[var(--muted)]" style={{ ["--d" as string]: "0.32s" }}>{dict.home.subtitle}</p>
              <div className="hero-in flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4" style={{ ["--d" as string]: "0.46s" }}>
                <Link
                  href={`/${locale}/kurzy/zakladni`}
                  className="btn-bouncy btn-cta btn-primary btn-lg btn-dot"
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
            <div className="hero-in-right w-full">
              <HeroShowcase
                t={getHomeHeroText(locale as Locale)}
                subjects={SUBJECTS.map((sj) => ({ slug: sj.slug, color: sj.color, label: subjectText.labels[sj.value] }))}
              />
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

      {/* 1b) Lobby: co dnes zahrajeme */}
      <div className="zone zone-space pt-4">
        <HomeLobby locale={locale} t={getHomeLobbyText(locale as Locale)} />
      </div>

      {/* 2) Příroda: předměty */}
      <section className="zone zone-space zone-globe">
        <Wave fill="#0c0a24" />
        <GlobeSky />
        <div className="lobby-panel lobby-panel-wide relative z-10">
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

      {/* 4) Hory: jak to funguje */}
      {SHOW_HOW_IT_WORKS && (
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
      )}

      {/* 4b) Panel se zavěšenými štítky */}
      <section className="zone zone-space">
        <div className="hang-panel reveal mx-auto max-w-5xl">
          <div className="hang-copy">
            <h2 className="hang-title" style={heading}>{getHomeHangText(locale as Locale).title}</h2>
            <p className="hang-lead">{getHomeHangText(locale as Locale).lead}</p>
          </div>
          <HangTags tags={getHomeHangText(locale as Locale).tags} />
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
        <div className="lobby-panel relative z-10">
          <h2 className="reveal mb-10 text-center text-3xl font-bold tracking-tight sm:text-4xl" style={heading}>
            {dict.home.pickSection}
          </h2>
          <div className="pcard-pile">
            {CATEGORIES.map((cat, i) => (
              <TearCard key={cat.slug} href={`/${locale}/kurzy/${cat.slug}`} className="reveal pcard" accent={TILE_COLORS[i % TILE_COLORS.length]}>
                <span className="pcard-in">
                  <span className="pcard-num" aria-hidden>{String(i + 1).padStart(2, "0")}</span>
                  <span className="pcard-iconwrap">
                    <HomeArt name={GALAXY_ICONS[i % GALAXY_ICONS.length]} size={92} className="pcard-icon" />
                  </span>
                  <h3 className="pcard-title">{dict.categories[cat.slug].label}</h3>
                  <p className="pcard-text">{dict.categories[cat.slug].description}</p>
                  <span className="pcard-go" aria-hidden>→</span>
                  <span className="pcard-glare" aria-hidden />
                </span>
              </TearCard>
            ))}
          </div>
        </div>
      </section>

      {/* 6) Pro učitele */}
      <section id="pro-ucitele" className="zone zone-tech scroll-mt-24">
        <Wave fill="#160a2c" />
        <div className="lobby-panel relative z-10">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="reveal mb-2 text-xs font-bold uppercase tracking-widest text-[var(--accent-green)]">{a.teachers.eyebrow}</p>
              <h2 className="reveal mb-4 text-2xl font-bold tracking-tight sm:text-3xl" style={heading}>
                {a.teachers.title}
              </h2>
              <p className="reveal mb-8 max-w-xl text-lg leading-relaxed text-[var(--muted)]">{a.teachers.lead}</p>
              <ul className="gcard-cycle grid gap-4 sm:grid-cols-2">
                {a.teachers.points.map((point) => (
                  <li key={point.title} className="reveal gcard gcard-hover p-4">
                    <h3 className="gcard-title mb-1">{point.title}</h3>
                    <p className="text-sm leading-relaxed text-[var(--muted)]">{point.text}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col items-start gap-2">
                <TeacherCta locale={locale as Locale} className="btn-bouncy btn-cta btn-primary btn-lg">
                  {a.teachers.cta}
                </TeacherCta>
                <p className="text-sm text-[var(--muted)]">{a.teachers.ctaHint}</p>
                <Link href={`/${locale}/ucitele`} className="text-sm font-bold text-[var(--accent-green)] hover:underline">
                  {audience.teachers.homeLink}
                </Link>
              </div>
            </div>
            {/* Ilustrační ukázka přehledu výsledků (není to živá data) */}
            <ResultsPreview
              className="reveal"
              title={a.teachers.previewTitle}
              due={a.teachers.previewDue}
              badge={a.teachers.previewSample}
              doneLabel={a.teachers.previewDone}
              rows={sample}
            />
          </div>
        </div>
      </section>

      {/* 7) O nás */}
      <section id="o-nas" className="zone zone-tech scroll-mt-24">
        <Wave fill="#071427" />
        <div className="lobby-panel relative z-10">
          <h2 className="reveal mb-4 text-2xl font-bold tracking-tight sm:text-3xl" style={heading}>
            {h.about.title}
          </h2>
          <p className="reveal mb-10 max-w-3xl text-lg leading-relaxed text-[var(--muted)]">{h.about.lead}</p>
          <div className="grid gap-5 md:grid-cols-3">
            {h.about.points.map((point, i) => (
              <ExpandCard
                key={point.title}
                className="reveal"
                index={String(i + 1).padStart(2, "0")}
                title={point.title}
                lead={point.text}
                color={TILE_COLORS[i % TILE_COLORS.length]}
              />
            ))}
          </div>
          <div className="reveal mt-12 grid gap-5 md:grid-cols-2">
            {[h.about.why, h.about.problem].map((block, i) => (
              <ExpandCard key={block.title} title={block.title} lead={block.text} color={TILE_COLORS[(i + 3) % TILE_COLORS.length]} />
            ))}
          </div>
          <div className="reveal mt-12">
            <h3 className="mb-4 text-xl font-bold" style={heading}>
              {h.about.teamTitle}
            </h3>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {h.about.team.map((member, i) => (
                <li key={member.name} className="contents">
                  <ExpandCard title={member.name} lead={member.role} color={TILE_COLORS[i % TILE_COLORS.length]}>
                    <p className="text-[var(--muted)]">{member.bio}</p>
                  </ExpandCard>
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
