import Link from "next/link";
import { CATEGORIES, SUBJECTS } from "@/lib/taxonomy";
import { Icon } from "@/components/Icon";
import { HomeProgress } from "@/components/HomeProgress";
import { DailyQuizTeaser } from "@/components/DailyQuizTeaser";
import { TeacherCta } from "@/components/TeacherCta";
import { ALIEN_ROW, SpriteFrame, Wave } from "@/components/SpaceDecor";
import { SectionWave } from "@/components/SectionWave";
import { LazyPlanet, LazySubjectGlobe, LazyTownLife } from "@/components/HomeLazy";
import { GlobeSky } from "@/components/GlobeSky";
import { HeroSky } from "@/components/HeroSky";
import { HeroTitle } from "@/components/HeroTitle";
import { TearCard } from "@/components/TearCard";
import { PcardArt, PcardRing, PcardTape } from "@/components/PcardArt";
import { HangTags } from "@/components/HangTags";
import { HangFeed } from "@/components/HangFeed";
import { HangPanel } from "@/components/HangPanel";
import { HangBadge, HangGround, HangIcon, HangSparks } from "@/components/HangDecor";
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
        <span className="px-stars" aria-hidden />
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
        <SectionWave fill="#0d1430" glow="#8ea2ff" />
      </div>

      {/* 1b) Lobby: co dnes zahrajeme */}
      <div className="zone zone-space pt-4">
        <span className="px-stars" aria-hidden />
        <HomeLobby locale={locale} t={getHomeLobbyText(locale as Locale)} />
        <SectionWave fill="#0d1430" glow="#ff8a6b" />
      </div>

      {/* 2) Příroda: předměty */}
      <section className="zone zone-space zone-globe">
        <span className="px-stars" aria-hidden />
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
        <SectionWave fill="#0c1537" glow="#5ab8ff" />
      </section>

      {/* 4) Hory: jak to funguje */}
      {SHOW_HOW_IT_WORKS && (
        <section className="zone zone-peak">
          <span className="px-stars" aria-hidden />
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
        <span className="px-stars" aria-hidden />
        <HangPanel>
          <HangSparks />
          <div className="hang-copy">
            <HangBadge />
            <h2 className="hang-title" style={heading}>{getHomeHangText(locale as Locale).title}</h2>
            <p className="hang-lead">{getHomeHangText(locale as Locale).lead}</p>
            <HangFeed messages={getHomeHangText(locale as Locale).feed} />
          </div>
          <HangTags tags={getHomeHangText(locale as Locale).tags} />
          <HangGround />
        </HangPanel>
        <SectionWave fill="#10183b" glow="#8ea2ff" />
      </section>

      {/* 5) Zpět do vesmíru: kategorie */}
      <section className="zone zone-space">
        <span className="px-stars" aria-hidden />
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
                  <PcardArt slug={cat.slug} />
                  <span className="pcard-num" aria-hidden>{String(i + 1).padStart(2, "0")}</span>
                  <span className="pcard-iconwrap">
                    <PcardRing />
                    <Icon name={cat.slug} size={92} className="pcard-icon" />
                  </span>
                  <h3 className="pcard-title">{dict.categories[cat.slug].label}</h3>
                  <p className="pcard-text">{dict.categories[cat.slug].description}</p>
                  <span className="pcard-go" aria-hidden>→</span>
                </span>
                <PcardTape />
              </TearCard>
            ))}
          </div>
        </div>
        <SectionWave fill="#0c122b" glow="#ff8a6b" />
      </section>

      {/* 6) Pro učitele */}
      <section id="pro-ucitele" className="zone zone-tech scroll-mt-24">
        <span className="px-stars" aria-hidden />
        <div className="lobby-panel relative z-10">
          <div className="grid gap-12">
            <div>
              <p className="reveal mb-2 text-xs font-bold uppercase tracking-widest text-[var(--accent-green)]">{a.teachers.eyebrow}</p>
              <h2 className="reveal mb-4 text-2xl font-bold tracking-tight sm:text-3xl" style={heading}>
                {a.teachers.title}
              </h2>
              <p className="reveal mb-8 max-w-xl text-lg leading-relaxed text-[var(--muted)]">{a.teachers.lead}</p>
              <ul className="gcard-cycle grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        <SectionWave fill="#0a1128" glow="#7ee0b0" />
      </section>

      {/* 7) O nás */}
      <section id="o-nas" className="zone zone-tech scroll-mt-24">
        <span className="px-stars" aria-hidden />
        <div className="lobby-panel relative z-10">
          <div className="about-top">
            <div className="reveal">
              <h2 className="about-title" style={heading}>{h.about.title}</h2>
              <p className="about-lead">{h.about.lead}</p>
            </div>
            <aside className="about-note reveal" style={{ ["--ac" as string]: TILE_COLORS[0] }}>
              <PcardTape />
              <span className="about-note-ic"><HangIcon kind="flag" size={22} /></span>
              <h3 style={heading}>{h.about.why.title}</h3>
              <p>{h.about.why.text}</p>
            </aside>
          </div>

          <ol className="about-points">
            {h.about.points.map((point, i) => (
              <li key={point.title} className="about-point reveal" style={{ ["--ac" as string]: TILE_COLORS[i % TILE_COLORS.length] }}>
                <span className="about-num" aria-hidden>{String(i + 1).padStart(2, "0")}</span>
                <span className="about-pic"><HangIcon kind={(["bulb", "bolt", "star"] as const)[i % 3]} size={22} /></span>
                <h3 style={heading}>{point.title}</h3>
                <p>{point.text}</p>
              </li>
            ))}
          </ol>

          <div className="about-problem reveal" style={{ ["--ac" as string]: TILE_COLORS[2] }}>
            <span className="about-pic"><HangIcon kind="search" size={22} /></span>
            <div>
              <h3 style={heading}>{h.about.problem.title}</h3>
              <p>{h.about.problem.text}</p>
            </div>
          </div>

          <h3 className="about-team-title reveal" style={heading}>{h.about.teamTitle}</h3>
          <ul className="about-team">
            {h.about.team.map((member, i) => (
              <li key={member.name} className="about-person reveal" style={{ ["--ac" as string]: TILE_COLORS[i % TILE_COLORS.length] }}>
                <span className="about-avatar" aria-hidden>
                  {member.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </span>
                <h4 style={heading}>{member.name}</h4>
                <span className="about-role">{member.role}</span>
                <p>{member.bio}</p>
              </li>
            ))}
          </ul>

          <div className="about-contact reveal">
            <span className="about-pic"><HangIcon kind="pulse" size={22} /></span>
            <div className="about-contact-txt">
              <a href={`mailto:${h.about.email}`}>{h.about.email}</a>
            </div>
            <Link href={`/${locale}/kontakt`} className="btn-bouncy btn-secondary btn-lg">
              {h.about.contact} →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
