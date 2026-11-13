import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CodeExercises } from "@/components/CodeExercises";
import { CodeCurriculum } from "@/components/CodeCurriculum";
import { CodeLearn } from "@/components/CodeLearn";
import { HeroSky } from "@/components/HeroSky";
import { HeroTitle } from "@/components/HeroTitle";
import { SketchIcon } from "@/components/SketchIcons";
import { isLocale } from "@/i18n/config";

// Stránka je zatím jen česky, proto ostatní jazyky vrací 404.
export const metadata: Metadata = {
  title: "Kód na hraní",
  description: "Projdi si HTML, CSS a JavaScript řádek po řádku a u každého příkazu si přečti, co dělá.",
};

export default async function CodePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale) || locale !== "cs") notFound();

  return (
    <div className="space-page">
      {/* Hrdina ve stylu úvodní stránky: vesmír, neonový nadpis a odznak */}
      <div className="zone zone-space">
        <span className="px-stars" aria-hidden />
        <HeroSky comet={false} ship={false} />
        <section className="gradient-hero relative">
          <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 pb-10 pt-12 sm:px-6 sm:pt-16 lg:pb-14 lg:pt-20">
            <div className="flex max-w-3xl flex-col items-center gap-6 text-center">
              <span
                style={{ ["--d" as string]: "0.05s" }}
                className="hero-in inline-flex items-center gap-2 rounded-md border-2 border-[var(--edge)] bg-[var(--surface)]/80 px-2.5 py-1 text-xs font-bold uppercase tracking-widest shadow-[0_0_18px_rgba(124,108,255,0.45)]"
              >
                <SketchIcon kind="bolt" size={14} />
                HTML · CSS · JS
              </span>
              <h1
                className="hero-in neon-h1 text-4xl leading-[1.3] sm:text-5xl lg:text-[3.25rem]"
                style={{ ["--d" as string]: "0.18s" }}
              >
                <HeroTitle line1="Kód" line2="na hraní" />
              </h1>
              <p
                className="hero-in max-w-xl text-lg leading-relaxed text-[var(--muted)]"
                style={{ ["--d" as string]: "0.32s" }}
              >
                Tři malé soubory. Klikni na řádek s jiskrou a přečti si, co každý příkaz dělá. Nebo spusť přehrávání a sleduj to.
              </p>
              <div className="hero-in flex flex-col gap-3 sm:flex-row sm:gap-4" style={{ ["--d" as string]: "0.46s" }}>
                <a href="#editor" className="btn-bouncy btn-cta btn-primary btn-lg btn-dot">
                  ▶ Vyzkoušet editor
                </a>
                <a href="#ucivo" className="btn-bouncy btn-secondary btn-lg">
                  📖 Učivo a plán
                </a>
                <a href="#cviceni" className="btn-bouncy btn-secondary btn-lg">
                  ✎ Cvičení
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Editor v kartě ve stylu lobby z úvodní stránky */}
      <section id="editor" className="zone zone-space scroll-mt-24">
        <div className="relative mx-auto max-w-5xl px-4 pb-16 sm:px-6">
          <div className="lobby-shell">
            <CodeLearn />
          </div>
        </div>
      </section>

      {/* Učivo: učební plán a rozbalovací sekce s detailním vysvětlením */}
      <section id="ucivo" className="zone zone-space scroll-mt-24">
        <div className="relative mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <div className="lobby-shell">
            <div className="mb-6 flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border-2 border-[var(--sketch-ink)] bg-[#ffc933]">
                <SketchIcon kind="study" size={26} />
              </span>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl" style={{ fontFamily: "var(--font-heading)" }}>
                  Učivo
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-[#cfc8e4]">
                  Nejdřív plán, od čeho začít. Pak sekce s vysvětlením, tabulkami a příklady. Každá sekce na konci odkazuje na cvičení, kterými si to procvičíš.
                </p>
              </div>
            </div>
            <CodeCurriculum />
          </div>
        </div>
      </section>

      {/* Cvičení: každé má zadání, nápovědu, řešení a automatickou kontrolu */}
      <section id="cviceni" className="zone zone-space scroll-mt-24">
        <div className="relative mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <div className="lobby-shell">
            <div className="mb-6 flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border-2 border-[var(--sketch-ink)] bg-[#8fd0ff]">
                <SketchIcon kind="pencil" size={26} />
              </span>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl" style={{ fontFamily: "var(--font-heading)" }}>
                  Cvičení
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-[#cfc8e4]">
                  Vyber úkol, napiš kód do políčka a klikni na Zkontrolovat. Když to nesedí, dostaneš seznam, co chybí. Nápověda i řešení jsou hned vedle.
                </p>
              </div>
            </div>
            <CodeExercises />
          </div>
        </div>
      </section>
    </div>
  );
}
