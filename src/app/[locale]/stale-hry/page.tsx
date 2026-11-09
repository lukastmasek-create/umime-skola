import Link from "next/link";
import { notFound } from "next/navigation";
import { IdleHub } from "@/components/idle/IdleHub";
import { getIdleText } from "@/i18n/idle";
import { isLocale, type Locale } from "@/i18n/config";
import { staticPageMetadata } from "@/lib/seo";

const COLORS = ["#8fd0ff", "#ff8a6b", "#7ee0b0", "#ffc933", "#c9a7ff"];
// Hra na stejném pořadí jako v texty.games: Základna, Mazlíčci, Farma, Město. null = zatím se chystá.
const PATHS = ["zakladna", "mazlicci", "farma", "mesto", "ekonomika"] as const;

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
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <header className="mb-10 flex flex-col gap-3">
        <h1 className="text-3xl font-bold sm:text-4xl" style={{ fontFamily: "var(--font-heading)" }}>
          {t.title}
        </h1>
        <p className="max-w-2xl text-base text-[var(--muted)]">{t.subtitle}</p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {t.games.map((game, i) => {
          const path = PATHS[i];
          const href = path ? `/${locale}/stale-hry/${path}` : null;
          const body = (
            <>
              <div
                className="relative flex h-36 items-end justify-between overflow-hidden rounded-xl border-2 border-[var(--edge)] p-3"
                style={{ background: COLORS[i % COLORS.length] }}
              >
                {ART[i] ? (
                  <div
                    aria-hidden
                    className="globe-sprite pointer-events-none absolute bottom-0 left-1/2 h-36 w-36 -translate-x-1/2 drop-shadow-[0_6px_6px_rgba(0,0,0,0.35)]"
                    style={{ backgroundImage: `url(/home/hry/${ART[i]}.webp)` }}
                  />
                ) : (
                  <span aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center text-6xl">
                    💰
                  </span>
                )}
                <span
                  className="relative text-4xl font-extrabold leading-none text-[#16132b]"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={`pill relative px-2.5 py-1 ${href ? "bg-[var(--accent-500)] text-white" : "bg-[var(--surface)]"}`}
                >
                  {href ? t.play : t.soon}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <h2 className="text-lg font-bold leading-snug">{game.name}</h2>
                <p className="text-sm leading-relaxed text-[var(--muted)]">{game.description}</p>
              </div>
            </>
          );
          return href ? (
            <Link
              key={game.name}
              href={href}
              className="card card-hover focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[var(--brand-500)] flex flex-col gap-4 p-5"
            >
              {body}
            </Link>
          ) : (
            <div
              key={game.name}
              className="flex flex-col gap-4 rounded-[var(--radius-card)] border-2 border-dashed border-[var(--border-soft)] bg-[var(--surface-muted)] p-5 opacity-80"
            >
              {body}
            </div>
          );
        })}
      </div>

      <p className="mt-10 rounded-xl bg-[var(--surface-muted)] px-4 py-3 text-sm text-[var(--faint)]">{t.note}</p>

      <IdleHub locale={locale as Locale} />
    </div>
  );
}
