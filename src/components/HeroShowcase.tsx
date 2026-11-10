import { HeroProgressCard } from "@/components/HeroProgressCard";
import type { HomeHeroText } from "@/i18n/home-hero";
import type { Locale } from "@/i18n/config";

// Plovoucí karty kolem hero textu na úvodní stránce: postup, bezpečí, předměty,
// tok „hry → Umíme školu → třída“ a žebříček třídy. Je to jen ukázka, proto aria-hidden.
type Subject = { slug: string; label: string; color: string };

// Vykreslené 3D animace her z Blenderu (pás 24 snímků po 384 px) a statická únikovka.
const GAME_CHIPS = [
  { key: "farm", strip: "farma", frames: 24 },
  { key: "town", strip: "mesto", frames: 24 },
  { key: "escape", still: "funkce-unikovky" },
  { key: "pets", strip: "mazlicci", frames: 24 },
] as const;

const CHIP = 54;

const BOARD = [
  { avatar: "astronaut", name: "A. K.", pct: 100 },
  { avatar: "fox", name: "T. N.", pct: 80 },
  { avatar: "owl", name: "E. P.", pct: 60 },
];

const portrait = (slug: string) => `/avatars-3d/${slug}-portret.webp`;

export function HeroShowcase({ t, subjects, locale }: { t: HomeHeroText; subjects: Subject[]; locale: Locale }) {
  return (
    <div className="hs-stage" aria-hidden="true">
      <svg className="hs-guides" viewBox="0 0 1000 600" preserveAspectRatio="none">
        <path d="M70 0 V250 Q70 330 0 330" />
        <path d="M930 0 V250 Q930 330 1000 330" />
        <path d="M500 330 V600" />
      </svg>

      <HeroProgressCard t={t} locale={locale} />

      <div className="hs-card hs-safe space-float" style={{ animationDelay: "-2s" }}>
        <div className="hs-label hs-safe-head">
          <span className="hs-shield">✓</span> {t.safeTitle}
        </div>
        <div className="hs-safe-orb">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/rewards/odznak_diamant.webp" alt="" width={72} height={72} draggable={false} />
        </div>
        <div className="hs-label hs-center">{t.safeText}</div>
      </div>

      <div className="hs-flow">
        <div className="hs-card hs-subjects">
          <div className="hs-label hs-head">{t.subjectsTitle}</div>
          <div className="hs-subject-grid">
            {subjects.slice(0, 9).map((s, i) => (
              <div
                key={s.slug}
                className="hs-tile"
                data-active={i === 1 || i === 5 ? "true" : undefined}
                style={{ ["--c" as string]: s.color }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/home/predmet-${s.slug}.webp`} alt="" width={40} height={40} draggable={false} className="hs-tile-img" />
                <span className="hs-tile-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hs-pipe">
          <div className="hs-chips">
            {GAME_CHIPS.map((g) => (
              <span key={g.key} className="hs-chip" title={t.games[g.key]}>
                {"strip" in g ? (
                  <span
                    className="anim-strip hs-strip"
                    style={
                      {
                        width: CHIP,
                        height: CHIP,
                        backgroundImage: `url(/home/hry/${g.strip}.webp)`,
                        backgroundSize: `${CHIP * g.frames}px ${CHIP}px`,
                        "--fw": `${CHIP}px`,
                        "--n": g.frames,
                        animationTimingFunction: `steps(${g.frames})`,
                        animationDuration: "3s",
                      } as React.CSSProperties
                    }
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`/home/${g.still}.webp`} alt="" width={CHIP} height={CHIP} draggable={false} />
                )}
              </span>
            ))}
          </div>
          <svg className="hs-wires" viewBox="0 0 100 200" preserveAspectRatio="none">
            <path d="M0 24 C60 24 40 100 100 100" />
            <path d="M0 78 C60 78 40 100 100 100" />
            <path d="M0 132 C60 132 40 100 100 100" />
            <path d="M0 186 C60 186 40 100 100 100" />
          </svg>
          <span className="hs-pill">
            <span className="hs-pill-dot" /> {t.flowStart}
          </span>
          <span className="hs-out" />
        </div>

        <div className="hs-card hs-class">
          <div className="hs-teacher">
            <img src={portrait("wizard")} alt="" width={44} height={44} className="hs-avatar hs-avatar-lg" />
            <div>
              <div className="hs-label">{t.classTitle}</div>
              <div className="hs-sub">{t.teacher}</div>
            </div>
          </div>
          <ul className="hs-board">
            {BOARD.map((r, i) => (
              <li key={r.name}>
                <span className="hs-rank">{i + 1}</span>
                <img src={portrait(r.avatar)} alt="" width={28} height={28} className="hs-avatar" />
                <span className="hs-name">{r.name}</span>
                <span className="hs-meter"><span style={{ width: `${r.pct}%` }} /></span>
                <span className="hs-pct">{r.pct * 12} {t.points}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
