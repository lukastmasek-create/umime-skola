import { notFound } from "next/navigation";
import { getIdleText } from "@/i18n/idle";
import { isLocale, type Locale } from "@/i18n/config";

const COLORS = ["#8fd0ff", "#ff8a6b", "#7ee0b0", "#ffc933"];

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
      <h1 className="mb-1 text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
        {t.title}
      </h1>
      <p className="mb-8 max-w-2xl text-[var(--muted)]">{t.subtitle}</p>

      <div className="grid gap-5 sm:grid-cols-2">
        {t.games.map((game, i) => (
          <div key={game.name} className="card flex flex-col gap-4 p-5">
            <div
              className="flex h-28 items-end justify-between rounded-xl border-2 border-[var(--edge)] p-3"
              style={{ background: COLORS[i % COLORS.length] }}
            >
              <span
                className="text-4xl font-extrabold leading-none text-[#16132b]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="pill bg-[var(--surface)] px-2.5 py-1">{t.soon}</span>
            </div>
            <div>
              <h2 className="mb-1 text-lg font-bold">{game.name}</h2>
              <p className="text-sm text-[var(--muted)]">{game.description}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-8 text-sm text-[var(--faint)]">{t.note}</p>
    </div>
  );
}
