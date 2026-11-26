import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale } from "@/i18n/config";
import { getHomeText } from "@/i18n/home";
import { getHomeExtraText } from "@/i18n/home-extra";
import { getHomeStartText } from "@/i18n/home-start";
import { SUBJECTS } from "@/lib/taxonomy";
import { locales } from "@/i18n/config";
import { pageMetadata } from "@/lib/seo";
import { PixelIcon } from "@/components/HomePixelArt";
import { HangIcon } from "@/components/HangDecor";
import { PcardTape } from "@/components/PcardArt";
import { HomeCountUp } from "@/components/HomeCountUp";
import "../home-pixel.css";
import "../home-start.css";
const TILE_COLORS = ["#ffc933", "#ff8a6b", "#8fd0ff", "#7ee0b0"];
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? pageMetadata(locale, "/o-nas", getHomeStartText(locale).story, getHomeText(locale).about.lead) : {};
}
export default async function About({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const h = getHomeText(locale);
  const x = getHomeExtraText(locale);
  const heading = { fontFamily: "var(--font-heading)" };
  const stats = [
    { n: SUBJECTS.length, label: x.stats.subjects, ac: TILE_COLORS[0] },
    { n: 5, label: x.stats.levels, ac: TILE_COLORS[1] },
    { n: locales.length, label: x.stats.languages, ac: TILE_COLORS[2] },
    { n: 0, label: x.stats.ads, ac: TILE_COLORS[3] },
  ];
  return <div className="space-page home-px home-start"><div className="home-start-section home-story">
          <div className="about-top">
            <div className="">
              <div className="hp-head about-head">
                <PixelIcon kind="heart" size={52} />
                <h1 className="about-title home-h2" style={heading}>{h.about.title}</h1>
              </div>
              <p className="about-lead">{h.about.lead}</p>
            </div>
            <aside className="about-note " style={{ ["--ac" as string]: TILE_COLORS[0] }}>
              <PcardTape />
              <span className="about-note-ic"><HangIcon kind="flag" size={22} /></span>
              <h3 style={heading}>{h.about.why.title}</h3>
              <p>{h.about.why.text}</p>
            </aside>
          </div>

          <ul className="home-stats ">
            {stats.map((st, i) => (
              <li key={st.label} className="home-stat" style={{ ["--ac" as string]: st.ac, ["--i" as string]: i }}>
                <HomeCountUp value={st.n} delay={i * 120} className="home-stat-n" />
                <span className="home-stat-l">{st.label}</span>
              </li>
            ))}
          </ul>

          <ol className="about-points">
            {h.about.points.map((point, i) => (
              <li key={point.title} className="about-point " style={{ ["--ac" as string]: TILE_COLORS[i % TILE_COLORS.length], ["--i" as string]: i }}>
                <span className="about-num" aria-hidden>{String(i + 1).padStart(2, "0")}</span>
                <span className="about-pic"><HangIcon kind={(["bulb", "bolt", "star"] as const)[i % 3]} size={22} /></span>
                <h3 style={heading}>{point.title}</h3>
                <p>{point.text}</p>
              </li>
            ))}
            <li className="about-point " style={{ ["--ac" as string]: TILE_COLORS[3], ["--i" as string]: 3 }}>
              <span className="about-num" aria-hidden>{String(h.about.points.length + 1).padStart(2, "0")}</span>
              <span className="about-pic"><HangIcon kind="search" size={22} /></span>
              <h3 style={heading}>{h.about.problem.title}</h3>
              <p>{h.about.problem.text}</p>
            </li>
          </ol>

          <h3 className="about-team-title " style={heading}>{h.about.teamTitle}</h3>
          <ul className="about-team">
            {h.about.team.map((member, i) => (
              <li key={member.name} className="about-person " style={{ ["--ac" as string]: TILE_COLORS[i % TILE_COLORS.length], ["--i" as string]: i % 4 }}>
                <span className="about-avatar" aria-hidden>
                  {member.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </span>
                <h4 style={heading}>{member.name}</h4>
                <span className="about-role">{member.role}</span>
                <p>{member.bio}</p>
              </li>
            ))}
          </ul>

          <div className="about-contact ">
            <span className="about-pic"><HangIcon kind="pulse" size={22} /></span>
            <div className="about-contact-txt">
              <a href={`mailto:${h.about.email}`}>{h.about.email}</a>
            </div>
            <Link href={`/${locale}/kontakt`} className="btn-bouncy btn-secondary btn-lg">
              {h.about.contact} →
            </Link>
          </div>
</div></div>;
}
