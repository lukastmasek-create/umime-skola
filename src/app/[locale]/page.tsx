import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CATEGORIES, SUBJECTS } from "@/lib/taxonomy";
import { Icon } from "@/components/Icon";
import { HomeProgress } from "@/components/HomeProgress";
import { HeroPixel } from "@/components/HeroPixel";
import { HomeSectionNav } from "@/components/HomeSectionNav";
import { HomeTryQuestion } from "@/components/HomeTryQuestion";
import { HomeLobby } from "@/components/HomeLobby";
import { LazySubjectGlobe } from "@/components/HomeLazy";
import { PixelGround } from "@/components/HomePixelScene";
import { TeacherCta } from "@/components/TeacherCta";
import { ProHomeStrip } from "@/components/pro/ProHomeStrip";
import { getHomeLobbyText } from "@/i18n/home-lobby";
import { getHomeText } from "@/i18n/home";
import { getHomeAudienceText } from "@/i18n/home-teachers";
import { getAudiencePagesText } from "@/i18n/audience";
import { getSubjectText } from "@/i18n/subjects";
import { getDictionary } from "@/i18n/dictionaries";
import { getHomeExtraText } from "@/i18n/home-extra";
import { getHomeStartText } from "@/i18n/home-start";
import { isLocale } from "@/i18n/config";
import { SITE_NAME, SITE_URL, pageMetadata } from "@/lib/seo";
import { CONTACT_EMAIL, INSTAGRAM_URL } from "@/i18n/legal";
import "./home-pixel.css";
import "./home-start.css";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const home = getDictionary(locale).home;
  // Titulek říká, co web je, ne jen jeho název.
  return pageMetadata(locale, "", `${SITE_NAME} · ${home.titleLine1} ${home.titleLine2}`, home.subtitle, { absoluteTitle: true });
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const h = getHomeText(locale);
  const a = getHomeAudienceText(locale);
  const audience = getAudiencePagesText(locale);
  const x = getHomeExtraText(locale);
  const c = getHomeStartText(locale);
  const subjectText = getSubjectText(locale);
  const navItems = [
    { id: "stupne", label: x.nav.sections },
    { id: "vyzkouset", label: c.tryTitle },
    { id: "predmety", label: x.nav.subjects },
    { id: "hrat", label: x.nav.play },
    { id: "pro-ucitele", label: x.nav.teachers },
    { id: "otazky", label: x.nav.faq },
  ];
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
    <div className="space-page home-px home-start">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <section className="gradient-hero home-start-hero relative isolate overflow-hidden">
        <HeroPixel />
        <div className="home-start-hero-content">
          <span className="home-eyebrow">{dict.home.badge}</span>
          <h1>{c.line1}<br /><span>{c.line2}</span></h1>
          <p>{dict.home.subtitle}</p>
          <div className="home-hero-actions">
            <Link href="#stupne" className="btn-primary btn-lg">{c.start} <span aria-hidden>→</span></Link>
            <Link href="#vyzkouset" className="btn-secondary btn-lg">{c.tryTitle}</Link>
          </div>
          <ul className="home-trust-list">{[x.badges[0], x.badges[2], x.badges[3]].map(b => <li key={b}><span aria-hidden>✓</span> {b}</li>)}</ul>
        </div>
        <PixelGround kind="mountains" seed={9} />
      </section>
      <HomeSectionNav label={x.nav.label} items={navItems} />
      <section id="stupne" className="home-anchor home-start-section" aria-labelledby="stage-title">
        <div className="home-section-heading"><h2 id="stage-title" className="home-h2">{dict.home.pickSection}</h2><p>{c.finishHint}</p></div>
        <div className="home-stage-grid">{CATEGORIES.map((cat, i) => (
          <Link key={cat.slug} href={`/${locale}/kurzy/${cat.slug}`} className="home-stage-card" style={{ ["--stage-accent" as string]: ["#ffc933", "#ff8a6b", "#8fd0ff", "#7ee0b0"][i] }}>
            <Icon name={cat.slug} size={56} />
            <span className="home-stage-number" aria-hidden>0{i + 1}</span>
            <h3>{dict.categories[cat.slug].label}</h3>
            <p>{dict.categories[cat.slug].description}</p>
            <span className="home-stage-arrow" aria-hidden>↗</span>
          </Link>
        ))}</div>
        <div className="mt-6"><HomeProgress locale={locale} registerLabel={dict.home.createAccount} /></div>
      </section>
      <HomeTryQuestion locale={locale} />
      <section id="predmety" className="home-anchor home-start-section" aria-labelledby="subjects-title">
        <div className="home-section-heading"><h2 id="subjects-title" className="home-h2">{h.subjectsTitle}</h2><p>{h.subjectsHint}</p></div>
        <LazySubjectGlobe locale={locale} subjects={SUBJECTS.map(s => ({ slug: s.slug, value: s.value, label: subjectText.labels[s.value], color: s.color }))} />
        <ProHomeStrip locale={locale} />
      </section>
      <div id="hrat" className="home-anchor home-start-lobby"><HomeLobby locale={locale} t={getHomeLobbyText(locale)} /></div>
      <section id="pro-ucitele" className="home-anchor home-start-section home-audiences" aria-label={x.nav.teachers}>
        <article className="card home-audience-card">
          <span className="home-eyebrow">{a.teachers.eyebrow}</span>
          <h2 className="home-h2">{a.teachers.title}</h2>
          <p>{a.teachers.lead}</p>
          <ul>{a.teachers.points.slice(0, 3).map(point => <li key={point.title}>✓ {point.title}</li>)}</ul>
          <TeacherCta locale={locale} className="btn-primary">{a.teachers.cta}</TeacherCta>
          <Link href={`/${locale}/ucitele`} className="home-text-link">{audience.teachers.homeLink}</Link>
        </article>
        <article className="card home-audience-card">
          <span className="home-eyebrow">{c.parents}</span>
          <h2 className="home-h2">{x.badges[1]}</h2>
          <p>{c.parentText}</p>
          <Link href={`/${locale}/nastaveni#parental`} className="btn-secondary">{c.parents} →</Link>
        </article>
      </section>
      <section id="o-nas" className="home-anchor home-start-section home-about-brief" aria-labelledby="about-title">
        <div><h2 id="about-title" className="home-h2">{h.about.title}</h2><p>{h.about.lead}</p></div>
        <Link href={`/${locale}/o-nas`} className="home-text-link">{c.story} →</Link>
      </section>
      <section id="otazky" className="home-anchor home-start-section" aria-labelledby="faq-title">
        <div className="home-section-heading"><h2 id="faq-title" className="home-h2">{x.faq.title}</h2></div>
        <div className="home-faq-list">{x.faq.items.map(item => <details key={item.q} className="home-faq-item"><summary><span>{item.q}</span><span className="home-faq-mark" aria-hidden /></summary><p>{item.a}</p></details>)}</div>
        <Link href={`/${locale}/ochrana-soukromi`} className="home-text-link">{x.faq.privacy} →</Link>
      </section>
      <section className="home-start-section home-final-cta" aria-labelledby="final-title">
        <span className="home-eyebrow">{SITE_NAME}</span>
        <h2 id="final-title" className="home-h2">{c.finish}</h2>
        <p>{c.finishHint}</p>
        <Link href="#stupne" className="btn-primary btn-lg">{c.choose} →</Link>
      </section>
    </div>
  );
}
