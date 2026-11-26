import Link from "next/link";
import { CATEGORIES, SUBJECTS } from "@/lib/taxonomy";
import { Icon } from "@/components/Icon";
import { HomeProgress } from "@/components/HomeProgress";
import { DailyQuizTeaser } from "@/components/DailyQuizTeaser";
import { TeacherCta } from "@/components/TeacherCta";
import { Wave } from "@/components/SpaceDecor";
import { PixelGround, PixelRise, PixelSeam, PixelSky } from "@/components/HomePixelScene";
import { Campfire, Critter, PixelIcon, ShootingStar, SkyBirds } from "@/components/HomePixelArt";
import "./home-pixel.css";
import { LazyOnView } from "@/components/LazyOnView";
import { LazySubjectGlobe, LazyTownLife } from "@/components/HomeLazy";
import { HeroPixel } from "@/components/HeroPixel";
import { HeroTitle } from "@/components/HeroTitle";
import { TearCard } from "@/components/TearCard";
import { PcardArt, PcardRing, PcardTape } from "@/components/PcardArt";
import { HangIcon } from "@/components/HangDecor";
import { HomeLobby } from "@/components/HomeLobby";
import { getHomeLobbyText } from "@/i18n/home-lobby";
import { ResultsPreview } from "@/components/ResultsPreview";
import { HeroShowcase } from "@/components/HeroShowcase";
import { HomeFx } from "@/components/HomeFx";
import { HomeMarquee } from "@/components/HomeMarquee";
import { getHomeHeroText } from "@/i18n/home-hero";
import { getHomeText } from "@/i18n/home";
import { getHomeAudienceText } from "@/i18n/home-teachers";
import { getAudiencePagesText } from "@/i18n/audience";
import { getSubjectText } from "@/i18n/subjects";
import { ProHomeStrip } from "@/components/pro/ProHomeStrip";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SITE_NAME, SITE_URL, pageMetadata } from "@/lib/seo";
import { CONTACT_EMAIL, INSTAGRAM_URL } from "@/i18n/legal";
import { locales } from "@/i18n/config";
import { getHomeExtraText } from "@/i18n/home-extra";
import { HomeSectionNav } from "@/components/HomeSectionNav";

const TILE_COLORS = ["#ffc933", "#ff8a6b", "#8fd0ff", "#7ee0b0"];
// Přechod mezi sekcemi: těžký schodovitý pás, animované ikony, štítek sekce a postavičky.
type TransCritter = { kind: "cat" | "chick" | "slime"; dur: number; delay: number; left?: boolean };
function HomeTrans({ fill, label, icons, critters = [] }: { fill: string; label: string; icons: Array<"star" | "check" | "bulb" | "flag" | "bolt" | "search" | "pulse">; critters?: TransCritter[] }) {
  return (
    <div aria-hidden className="hp-trans" style={{ ["--tf" as string]: fill }}>
      {critters.length > 0 && (
        <svg className="hp-trans-svg" viewBox="0 0 480 64" preserveAspectRatio="xMidYMax slice" shapeRendering="crispEdges">
          {critters.map((c, i) => (
            <Critter key={i} kind={c.kind} y={51} dur={c.dur} delay={c.delay} left={c.left} />
          ))}
        </svg>
      )}
      <div className="hp-trans-row">
        <span className="hp-trans-label">{label}</span>
        {icons.map((k, i) => (
          <span key={i} className="hp-trans-chip" style={{ ["--ac" as string]: TILE_COLORS[i % TILE_COLORS.length], ["--i" as string]: i }}>
            <HangIcon kind={k} size={16} />
          </span>
        ))}
      </div>
    </div>
  );
}
// Sekce „Jak to funguje“ je archivovaná (skrytá). Pro návrat stačí přepnout na true.
const SHOW_HOW_IT_WORKS = false;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const home = getDictionary(locale).home;
  // Titulek říká, co web je, ne jen jeho název.
  return pageMetadata(locale, "", `${SITE_NAME} · ${home.titleLine1} ${home.titleLine2}`, home.subtitle, { absoluteTitle: true });
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
  const x = getHomeExtraText(locale as Locale);
  const navItems = [
    { id: "hrat", label: x.nav.play },
    { id: "predmety", label: x.nav.subjects },
    { id: "stupne", label: x.nav.sections },
    { id: "pro-ucitele", label: x.nav.teachers },
    { id: "o-nas", label: x.nav.about },
    { id: "otazky", label: x.nav.faq },
  ];
  const stats = [
    { n: SUBJECTS.length, label: x.stats.subjects, ac: TILE_COLORS[0] },
    { n: 5, label: x.stats.levels, ac: TILE_COLORS[1] },
    { n: locales.length, label: x.stats.languages, ac: TILE_COLORS[2] },
    { n: 0, label: x.stats.ads, ac: TILE_COLORS[3] },
  ];
  const badgeIcons = ["star", "check", "bulb", "flag"] as const;

  // Strukturovaná data (schema.org): vyhledávače i AI modely z nich poznají, co web je a pro koho.
  // Znak „<“ se escapuje, aby JSON nemohl předčasně ukončit <script>.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/brand/icon-512.png`,
        sameAs: [INSTAGRAM_URL],
        email: CONTACT_EMAIL,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: SITE_NAME,
        url: SITE_URL,
        inLanguage: locale,
        description: h.about.lead,
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "WebApplication",
        name: SITE_NAME,
        url: `${SITE_URL}/${locale}`,
        applicationCategory: "EducationalApplication",
        operatingSystem: "Any",
        inLanguage: locale,
        description: h.about.lead,
        educationalLevel: "Grades 1–9, entrance exams, final exams",
        audience: [
          { "@type": "EducationalAudience", educationalRole: "student" },
          { "@type": "EducationalAudience", educationalRole: "parent" },
          { "@type": "EducationalAudience", educationalRole: "teacher" },
        ],
      },
    ],
  };

  return (
    <div className="space-page home-px">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <HomeFx />
      {/* 1) Vesmír: hrdina a postup */}
      <section className="gradient-hero relative isolate overflow-hidden">
          <HeroPixel />
          <span className="hero-halo" aria-hidden />
          <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 pb-10 pt-12 sm:px-6 sm:pt-16 lg:pb-16 lg:pt-20">
            <div className="flex max-w-3xl flex-col items-center gap-6 text-center lg:max-w-2xl">
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
                locale={locale}
                t={getHomeHeroText(locale as Locale)}
                subjects={SUBJECTS.map((sj) => ({ slug: sj.slug, color: sj.color, label: subjectText.labels[sj.value] }))}
              />
            </div>
          </div>
      </section>

      <HomeSectionNav label={x.nav.label} items={navItems} />

      <div id="hrat" className="zone hp-z1 home-anchor">
        <PixelSeam seed={3} />
        <PixelSky seed={11} moon="moon"><SkyBirds seed={11} /></PixelSky>
        <section className="reveal relative mx-auto max-w-6xl px-4 pb-8 pt-6 sm:px-6">
          <ul className="home-badges">
            {x.badges.map((b, i) => (
              <li key={b} className="home-badge" style={{ ["--ac" as string]: TILE_COLORS[i % TILE_COLORS.length] }}>
                <span className="home-badge-ic" aria-hidden><HangIcon kind={badgeIcons[i]} size={16} /></span>
                {b}
              </li>
            ))}
          </ul>
          <HomeProgress locale={locale as Locale} registerLabel={dict.home.createAccount} />
          <div className="mt-4">
            <DailyQuizTeaser locale={locale as Locale} />
          </div>
        </section>

        {/* 1b) Lobby: co dnes zahrajeme */}
        <HomeMarquee
          locale={locale}
          label={h.subjectsTitle}
          items={SUBJECTS.map((sj) => ({ slug: sj.slug, color: sj.color, label: subjectText.labels[sj.value] }))}
        />
        <LazyOnView placeholderHeight={520}>
          <HomeLobby locale={locale} t={getHomeLobbyText(locale as Locale)} />
        </LazyOnView>
        <PixelGround kind="forest" seed={5}>
          <Critter kind="cat" y={51} dur={48} delay={-12} />
          <Critter kind="chick" y={51} dur={62} delay={-40} left />
        </PixelGround>
        <PixelRise seed={61} color="#2a3c6e" />
      </div>

      <HomeTrans fill="#1b2558" label={x.nav.subjects} icons={["star", "bolt", "bulb", "check", "flag"]} critters={[{ kind: "cat", dur: 40, delay: -6 }, { kind: "chick", dur: 52, delay: -20, left: true }]} />

      {/* 2) Předměty: hory pod hvězdami */}
      <section id="predmety" className="zone zone-globe hp-z2 home-anchor">
        <PixelSeam seed={23} />
        <PixelSky seed={23} moon="planet"><ShootingStar seed={23} /></PixelSky>
        <div className="lobby-panel lobby-panel-wide relative z-10">
          <div className="reveal mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="hp-head">
                <PixelIcon kind="globe" />
                <h2 className="home-h2 text-2xl font-bold tracking-tight sm:text-3xl" style={heading}>
                  {h.subjectsTitle}
                </h2>
              </div>
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
          <ProHomeStrip locale={locale as Locale} />
        </div>
        <PixelGround kind="mountains" seed={9}>
          <Campfire x={318} y={51} />
          <Critter kind="slime" y={51} dur={70} delay={-25} />
        </PixelGround>
        <PixelRise seed={62} color="#3b2f6e" />
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

      <HomeTrans fill="#241f58" label={x.nav.sections} icons={["pulse", "star", "search", "bolt"]} critters={[{ kind: "slime", dur: 60, delay: -14 }]} />

      {/* 5) Zpět do vesmíru: kategorie */}
      <section id="stupne" className="zone hp-z3 home-anchor">
        <PixelSeam seed={37} />
        <PixelSky seed={37}><SkyBirds seed={37} /></PixelSky>
        <LazyOnView placeholderHeight={1100}>
        <div className="lobby-panel relative z-10">
          <div className="reveal hp-head hp-head-center mb-7">
            <PixelIcon kind="stairs" />
            <h2 className="home-h2 home-h2-center text-center text-3xl font-bold tracking-tight sm:text-4xl" style={heading}>
              {dict.home.pickSection}
            </h2>
            <PixelIcon kind="stairs" className="hp-ico-flip" />
          </div>
          <div className="pcard-pile pcard-row">
            {CATEGORIES.map((cat, i) => (
              <TearCard key={cat.slug} href={`/${locale}/kurzy/${cat.slug}`} className="reveal reveal-stagger pcard" stagger={i % 2} accent={TILE_COLORS[i % TILE_COLORS.length]}>
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
        </LazyOnView>
        <PixelGround kind="meadow" seed={14}>
          <Critter kind="chick" y={51} dur={55} delay={-8} />
          <Critter kind="slime" y={51} dur={66} delay={-38} left />
        </PixelGround>
        <PixelRise seed={63} color="#1d4a66" />
      </section>

      <HomeTrans fill="#11223f" label={x.nav.teachers} icons={["flag", "check", "pulse", "bulb"]} critters={[{ kind: "chick", dur: 46, delay: -30 }, { kind: "cat", dur: 58, delay: -4, left: true }]} />

      {/* 6) Pro učitele */}
      <section id="pro-ucitele" className="zone hp-z4 home-anchor">
        <PixelSeam seed={41} />
        <PixelSky seed={41} moon="moon"><ShootingStar seed={41} /></PixelSky>
        <LazyOnView placeholderHeight={900}>
        <div className="lobby-panel relative z-10">
          <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
            <div>
              <p className="reveal mb-2 text-xs font-bold uppercase tracking-widest text-[var(--accent-green)]">{a.teachers.eyebrow}</p>
              <div className="reveal hp-head mb-4">
                <PixelIcon kind="board" />
                <h2 className="home-h2 text-2xl font-bold tracking-tight sm:text-3xl" style={heading}>
                  {a.teachers.title}
                </h2>
              </div>
              <p className="reveal mb-5 max-w-xl text-lg leading-relaxed text-[var(--muted)]">{a.teachers.lead}</p>
              <ul className="gcard-cycle grid gap-3 sm:grid-cols-2">
                {a.teachers.points.map((point, i) => (
                  <li key={point.title} className="reveal reveal-stagger gcard gcard-hover home-tpoint p-4" style={{ ["--i" as string]: i % 2 }}>
                    <span className="home-tpoint-num" aria-hidden>{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="gcard-title mb-1">{point.title}</h3>
                    <p className="text-sm leading-relaxed text-[var(--muted)]">{point.text}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-col items-start gap-2">
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
        </LazyOnView>
        <PixelGround kind="castle" seed={21}>
          <Campfire x={150} y={51} />
          <Critter kind="cat" y={51} dur={52} delay={-30} left />
        </PixelGround>
        <PixelRise seed={64} color="#2b3572" />
      </section>

      <HomeTrans fill="#182046" label={x.nav.about} icons={["pulse", "star", "bolt", "check", "flag"]} critters={[{ kind: "slime", dur: 50, delay: -22, left: true }, { kind: "cat", dur: 66, delay: -41 }]} />

      {/* 7) O nás */}
      <section id="o-nas" className="zone hp-z5 home-anchor">
        <PixelSeam seed={53} />
        <PixelSky seed={53}><SkyBirds seed={53} /><ShootingStar seed={53} /></PixelSky>
        <LazyOnView placeholderHeight={1400}>
        <div className="lobby-panel relative z-10">
          <div className="about-top">
            <div className="reveal">
              <div className="hp-head about-head">
                <PixelIcon kind="heart" size={52} />
                <h2 className="about-title home-h2" style={heading}>{h.about.title}</h2>
              </div>
              <p className="about-lead">{h.about.lead}</p>
            </div>
            <aside className="about-note reveal" style={{ ["--ac" as string]: TILE_COLORS[0] }}>
              <PcardTape />
              <span className="about-note-ic"><HangIcon kind="flag" size={22} /></span>
              <h3 style={heading}>{h.about.why.title}</h3>
              <p>{h.about.why.text}</p>
            </aside>
          </div>

          <ul className="home-stats reveal">
            {stats.map((st) => (
              <li key={st.label} className="home-stat" style={{ ["--ac" as string]: st.ac }}>
                <span className="home-stat-n">{st.n}</span>
                <span className="home-stat-l">{st.label}</span>
              </li>
            ))}
          </ul>

          <ol className="about-points">
            {h.about.points.map((point, i) => (
              <li key={point.title} className="about-point reveal reveal-stagger" style={{ ["--ac" as string]: TILE_COLORS[i % TILE_COLORS.length], ["--i" as string]: i }}>
                <span className="about-num" aria-hidden>{String(i + 1).padStart(2, "0")}</span>
                <span className="about-pic"><HangIcon kind={(["bulb", "bolt", "star"] as const)[i % 3]} size={22} /></span>
                <h3 style={heading}>{point.title}</h3>
                <p>{point.text}</p>
              </li>
            ))}
            <li className="about-point reveal reveal-stagger" style={{ ["--ac" as string]: TILE_COLORS[3], ["--i" as string]: 3 }}>
              <span className="about-num" aria-hidden>{String(h.about.points.length + 1).padStart(2, "0")}</span>
              <span className="about-pic"><HangIcon kind="search" size={22} /></span>
              <h3 style={heading}>{h.about.problem.title}</h3>
              <p>{h.about.problem.text}</p>
            </li>
          </ol>

          <h3 className="about-team-title reveal" style={heading}>{h.about.teamTitle}</h3>
          <ul className="about-team">
            {h.about.team.map((member, i) => (
              <li key={member.name} className="about-person reveal reveal-stagger" style={{ ["--ac" as string]: TILE_COLORS[i % TILE_COLORS.length], ["--i" as string]: i % 4 }}>
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
        </LazyOnView>
        <div className="relative z-10">
        <div id="otazky" className="lobby-panel home-faq home-anchor">
          <div className="reveal hp-head mb-5">
            <PixelIcon kind="ask" />
            <h2 className="home-h2 text-2xl font-bold tracking-tight sm:text-3xl" style={heading}>{x.faq.title}</h2>
          </div>
          <div className="home-faq-list">
            {x.faq.items.map((item, i) => (
              <details key={item.q} className="home-faq-item reveal reveal-stagger" style={{ ["--ac" as string]: TILE_COLORS[i % TILE_COLORS.length], ["--i" as string]: i % 2 }}>
                <summary>
                  <span>{item.q}</span>
                  <span className="home-faq-mark" aria-hidden />
                </summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
          <Link href={`/${locale}/ochrana-soukromi`} className="mt-4 inline-block text-sm font-bold text-[var(--accent-green)] hover:underline">
            {x.faq.privacy} →
          </Link>
        </div>
        </div>
        <PixelGround kind="town" seed={31}>
          <Critter kind="cat" y={51} dur={58} delay={-5} />
          <Critter kind="chick" y={51} dur={64} delay={-33} />
          <Critter kind="slime" y={51} dur={74} delay={-50} left />
        </PixelGround>
      </section>
    </div>
  );
}
