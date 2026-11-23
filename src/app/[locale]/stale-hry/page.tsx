import Link from "next/link";
import { notFound } from "next/navigation";
import { PxHeader, PxIcon, PxStage, type PxIconName } from "@/components/pixel/PixelKit";
import { PxScene } from "@/components/pixel/PixelScene";
import { IdleHub } from "@/components/idle/IdleHub";
import { getIdleText } from "@/i18n/idle";
import { isLocale, type Locale } from "@/i18n/config";
import { staticPageMetadata } from "@/lib/seo";

const COLORS = ["#8fd0ff", "#ff8a6b", "#7ee0b0", "#ffc933", "#c9a7ff"];
// Hra na stejném pořadí jako v texty.games: Základna, Mazlíčci, Farma, Město. null = zatím se chystá.
const PATHS = ["zakladna", "mazlicci", "farma", "mesto", "ekonomika"] as const;

const HOT_ICON: PxIconName[] = ["door", "heart", "star", "chest", "star"];

// Vyrenderovaná diorámata (pás 24 snímků) ve stejném pořadí jako hry.
const ART = ["zakladna", "mazlicci", "farma", "mesto", "ekonomika"] as const;

export const generateMetadata = staticPageMetadata("/stale-hry");

export default async function IdleGamesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getIdleText(locale as Locale);

  return (
    <PxStage>
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <PxHeader title={t.title} subtitle={t.subtitle} />

        {/* Hotbar: rychlý skok na hru; zamčené sloty jsou bez odkazu. */}
        <ul className="px-hotbar" aria-label={t.title}>
          {t.games.map((game, i) => {
            const path = PATHS[i];
            const inner = (
              <>
                <span className="px-hot-n" aria-hidden>
                  {i + 1}
                </span>
                <PxIcon name={path ? HOT_ICON[i] : "lock"} scale={4} className={path ? "text-[var(--px-gold)]" : "opacity-50"} />
              </>
            );
            return (
              <li key={game.name}>
                {path ? (
                  <Link href={`/${locale}/stale-hry/${path}`} aria-label={game.name} title={game.name}>
                    {inner}
                  </Link>
                ) : (
                  <span className="px-hot" title={`${game.name}: ${t.soon}`} role="img" aria-label={`${game.name}: ${t.soon}`}>
                    {inner}
                  </span>
                )}
              </li>
            );
          })}
        </ul>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {t.games.map((game, i) => {
            const path = PATHS[i];
            const href = path ? `/${locale}/stale-hry/${path}` : null;
            const body = (
              <>
                <div className="relative flex h-40 items-start justify-between overflow-hidden p-3" style={{ background: COLORS[i % COLORS.length] }}>
                  <span aria-hidden className="absolute inset-x-0 bottom-0 h-3" style={{ background: "linear-gradient(#4cc16b 0 6px, #8a5a2b 6px)" }} />
                  {ART[i] ? (
                    <PxScene id={ART[i]} className="absolute bottom-0 left-1/2 h-[8rem] w-[12rem] -translate-x-1/2" />
                  ) : (
                    <span aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center text-[#14112f]">
                      <PxIcon name="chest" scale={8} />
                    </span>
                  )}
                  <span className="px-title relative text-4xl text-[#14112f]" style={{ textShadow: "2px 2px 0 rgba(255,255,255,0.45)" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="px-pill relative">
                    {!href && <PxIcon name="lock" scale={2} />}
                    {href ? t.play : t.soon}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <h2 className="px-card-title !p-0 !text-left !text-xl">{game.name}</h2>
                  <p className="text-sm leading-relaxed text-[var(--px-dim)]">{game.description}</p>
                </div>
                <span className={`px-btn ${href ? "px-btn-green" : ""} self-start`} aria-hidden>
                  {href ? `▶ ${t.play}` : t.soon}
                </span>
              </>
            );
            return href ? (
              <Link key={game.name} href={href} className="px-box px-box-hover focus-visible:outline-none">
                {body}
              </Link>
            ) : (
              <div key={game.name} className="px-box px-hatch opacity-80">
                {body}
              </div>
            );
          })}
        </div>

        <p className="px-box mt-10 px-4 py-3 text-sm text-[var(--px-dim)]">{t.note}</p>

        <div className="px-paper mt-8">
          <IdleHub locale={locale as Locale} />
        </div>
      </div>
    </PxStage>
  );
}
