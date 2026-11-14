import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/lib/taxonomy";
import { ACTIVE_GAMES, runLength, type GameInfo } from "@/lib/games";
import { canPlay } from "@/lib/game-fit";
import { runnerAllowed } from "@/lib/runner";
import { loadGameQuestions } from "@/lib/game-questions";
import { getGameText } from "@/i18n/game";
import { gameMeta, getGamesUiText } from "@/i18n/games-meta";
import { getTestText } from "@/i18n/test";
import { isLocale, type Locale } from "@/i18n/config";
import type { GameQuestion } from "@/i18n/game";
import { GameBestBadge } from "@/components/GameBestBadge";

export const revalidate = 0;

export default async function CourseGamesPage({
  params,
}: {
  params: Promise<{ locale: string; category: string; course: string; difficulty: string }>;
}) {
  const { locale, category: categorySlug, course: courseSlug, difficulty: difficultyParam } =
    await params;
  if (!isLocale(locale)) notFound();
  const category = getCategoryBySlug(categorySlug);
  const difficulty = Number(difficultyParam);
  if (!category || !Number.isInteger(difficulty) || difficulty < 1 || difficulty > 5) notFound();

  const gameText = getGameText(locale as Locale);
  const testText = getTestText(locale as Locale);
  const ui = getGamesUiText(locale as Locale);

  let courseTitle: string | null = null;
  let available = false;
  let questions: GameQuestion[] = [];
  try {
    const data = await loadGameQuestions(courseSlug, category.value, difficulty, 40);
    courseTitle = data?.title ?? null;
    available = data?.hasLevel ?? false;
    questions = data?.questions ?? [];
  } catch {
    courseTitle = null;
  }
  if (!courseTitle || !available) notFound();

  const courseHref = `/${locale}/kurzy/${categorySlug}/${courseSlug}`;
  // Hry, které se z odpovědí kurzu nedají sestavit (osmisměrka z čísel apod.), se nenabízejí.
  const playable = ACTIVE_GAMES.filter((g) => g.available && !g.setOnly && canPlay(g.slug, questions, difficulty) && (g.slug !== "runner" || runnerAllowed(category.value, difficulty)));
  const hiddenSome = playable.length < ACTIVE_GAMES.filter((g) => g.available).length;
  const sections: { kind: GameInfo["kind"]; title: string; hint: string; icon: string }[] = [
    { kind: "action", title: ui.action, hint: ui.actionHint, icon: "🕹️" },
    { kind: "classic", title: ui.classic, hint: ui.classicHint, icon: "🧠" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <Link
        href={courseHref}
        className="mb-4 inline-block text-sm font-medium text-[var(--faint)] hover:text-[var(--foreground)]"
      >
        ← {courseTitle}
      </Link>
      <h1 className="mb-1 text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
        {gameText.games} · {testText.difficulties[difficulty - 1]}
      </h1>
      <p className="mb-2 text-[var(--muted)]">{testText.coursesSubtitle}</p>
      <p className="mb-8 text-sm text-[var(--faint)]">
        {ui.length}: {runLength(difficulty)} {ui.questions}
      </p>

      {sections.map((sec) => {
        const list = playable.filter((g) => g.kind === sec.kind);
        if (list.length === 0) return null;
        const isAction = sec.kind === "action";
        return (
          <section key={sec.kind} className="mb-12 last:mb-0">
            <div className="mb-1 flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                <span aria-hidden>{sec.icon}</span> {sec.title}
              </h2>
              <span className="pill bg-[var(--surface-muted)] px-2.5 py-0.5 text-xs font-bold text-[var(--muted)]">{list.length}</span>
            </div>
            <p className="mb-5 max-w-2xl text-sm text-[var(--muted)]">{sec.hint}</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((game) => {
                const meta = gameMeta(game.slug, locale as Locale);
                return (
                  <Link
                    key={game.slug}
                    href={`${courseHref}/kurz/${difficulty}/hra/${game.slug}`}
                    className="game-tile card card-hover group relative flex items-center gap-4 p-4 pr-5 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[var(--brand-500)]"
                  >
                    {game.isNew && (
                      <span className="pill absolute right-3 top-3 bg-[var(--accent-yellow)] px-2 py-0.5 text-xs font-extrabold text-[#16132b]">
                        {ui.isNew}
                      </span>
                    )}
                    <span
                      className="game-tile-emoji flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-4xl transition-transform"
                      style={{ background: isAction ? "rgba(124,108,255,0.18)" : "rgba(34,197,94,0.16)" }}
                      aria-hidden
                    >
                      {game.emoji}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="pr-14 font-bold leading-tight">{meta.name}</span>
                      <span className="line-clamp-2 text-xs leading-snug text-[var(--muted)]">{meta.tag}</span>
                      <GameBestBadge game={game.slug} course={courseSlug} level={difficulty} label={ui.best} />
                    </span>
                    <span
                      aria-hidden
                      className="shrink-0 text-lg font-bold text-[var(--faint)] transition-transform group-hover:translate-x-1 group-hover:text-[var(--brand-600)]"
                    >
                      →
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
      {hiddenSome && <p className="text-xs text-[var(--faint)]">ℹ️ {ui.hidden}</p>}
    </div>
  );
}
