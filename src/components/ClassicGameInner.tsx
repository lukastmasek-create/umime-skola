"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getClassicText } from "@/i18n/classic";
import type { Locale } from "@/i18n/config";
import type { GameQuestion } from "@/i18n/game";
import { gameMeta, getGamesUiText } from "@/i18n/games-meta";
import { readBest, type Best } from "@/lib/game-best";
import { GAMES, type ClassicSlug } from "@/lib/games";
import { ArenaBackdrop, type ArenaKey } from "@/components/arena/ArenaBackdrop";
import { Bingo } from "./classic/Bingo";
import { Blitz } from "./classic/Blitz";
import { Crossword } from "./classic/Crossword";
import { Fill } from "./classic/Fill";
import { Hangman } from "./classic/Hangman";
import { Matching } from "./classic/Matching";
import { Memory } from "./classic/Memory";
import { Millionaire } from "./classic/Millionaire";
import { Ordering } from "./classic/Ordering";
import { Scramble } from "./classic/Scramble";
import { Defense } from "./classic/Defense";
import { Sorting } from "./classic/Sorting";
import { TicTacToe } from "./classic/TicTacToe";
import { Treasure } from "./classic/Treasure";
import { TrueFalse } from "./classic/TrueFalse";
import { WordSearch } from "./classic/WordSearch";
import { ClassicSessionContext } from "./classic/shared";

// Každá hra má vlastní barvu pozadí (WebGL), podle pořadí v seznamu her.
const ARENA_KEYS: ArenaKey[] = ["quiz", "race", "gold", "streak", "survival", "teams"];
function arenaKey(game: ClassicSlug): ArenaKey {
  return ARENA_KEYS[Math.max(0, GAMES.findIndex((g) => g.slug === game)) % ARENA_KEYS.length];
}

// Klasické hry nad otázkami kurzu. Nejdřív jednotná úvodní obrazovka (jak hrát, rekord, start),
// pak samotná hra. Míchání je náhodné, proto se vykresluje jen v prohlížeči.
export function ClassicGameInner({
  locale,
  game,
  questions,
  difficulty,
  courseSlug,
  backHref,
}: {
  locale: Locale;
  game: ClassicSlug;
  questions: GameQuestion[];
  difficulty: number;
  courseSlug: string;
  backHref: string;
}) {
  const t = getClassicText(locale);
  const ui = getGamesUiText(locale);
  const meta = gameMeta(game, locale);
  const emoji = GAMES.find((g) => g.slug === game)?.emoji ?? "🎮";
  const steps = t.introSteps ?? getClassicText("en").introSteps ?? ["", ""];
  const [started, setStarted] = useState(false);
  const [best, setBest] = useState<Best | null>(null);

  useEffect(() => {
    setBest(readBest(game, courseSlug, difficulty)); // eslint-disable-line react-hooks/set-state-in-effect
  }, [game, courseSlug, difficulty]);

  useEffect(() => {
    if (started) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Enter" || e.repeat) return;
      e.preventDefault();
      setStarted(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started]);

  if (!started) {
    return (
      <div className="fs-classic arena-stage flex flex-col gap-4 p-5 sm:p-8">
        <ArenaBackdrop variant={arenaKey(game)} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href={backHref} className="text-sm font-medium text-[var(--faint)] hover:text-[var(--foreground)]">
            {t.back}
          </Link>
          {best && (
            <p className="pill bg-[var(--surface-muted)] px-3 py-1.5 text-sm font-semibold">
              🏆 {ui.bestSoFar}: {"⭐".repeat(best.stars) || "–"}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <span className="game-intro-emoji flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-[var(--surface-muted)] text-5xl" aria-hidden>
            {emoji}
          </span>
          <div className="min-w-[12rem] flex-1">
            <h1 className="text-2xl font-bold sm:text-3xl" style={{ fontFamily: "var(--font-heading)" }}>
              {meta.name}
            </h1>
            <p className="text-sm text-[var(--muted)]">{meta.tag}</p>
          </div>
          <button type="button" onClick={() => setStarted(true)} autoFocus className="arena-btn">
            ▶ {ui.start}
          </button>
        </div>
        <div className="gq-steps">
          {[
            { icon: "👀", title: "1", text: steps[0] },
            { icon: "👆", title: "2", text: t.controls[game] },
            { icon: "✅", title: "3", text: steps[1] },
          ].map((st) => (
            <div key={st.title} className="gq-step">
              <span className="gq-step-icon" aria-hidden>
                {st.icon}
              </span>
              <p>{st.text}</p>
            </div>
          ))}
        </div>
        <details className="arena-panel" style={{ padding: 14 }}>
          <summary className="cursor-pointer text-sm font-bold">{ui.howTo}</summary>
          <p className="mt-2 text-sm">{t.games[game].intro}</p>
        </details>
      </div>
    );
  }

  return (
    <ClassicSessionContext.Provider value={{ game, course: courseSlug, level: difficulty, newBestLabel: ui.newBest, bestLabel: ui.bestSoFar, controls: t.controls[game] }}>
      <div className="arena-stage arena-playing p-3 sm:p-6">
        <ArenaBackdrop variant={arenaKey(game)} />
        <ClassicGameBody t={t} game={game} questions={questions} difficulty={difficulty} backHref={backHref} />
      </div>
    </ClassicSessionContext.Provider>
  );
}

function ClassicGameBody({
  t,
  game,
  questions,
  difficulty,
  backHref,
}: {
  t: ReturnType<typeof getClassicText>;
  game: ClassicSlug;
  questions: GameQuestion[];
  difficulty: number;
  backHref: string;
}) {
  switch (game) {
    case "osmismerka":
      return <WordSearch t={t} questions={questions} difficulty={difficulty} backHref={backHref} />;
    case "spojovani":
      return <Matching t={t} questions={questions} backHref={backHref} />;
    case "pexeso":
      return <Memory t={t} questions={questions} difficulty={difficulty} backHref={backHref} />;
    case "sibenice":
      return <Hangman t={t} questions={questions} backHref={backHref} />;
    case "trideni":
      return <Sorting t={t} questions={questions} difficulty={difficulty} backHref={backHref} />;
    case "doplnovani":
      return <Fill t={t} questions={questions} difficulty={difficulty} backHref={backHref} />;
    case "milionar":
      return <Millionaire t={t} questions={questions} difficulty={difficulty} backHref={backHref} />;
    case "presmycky":
      return <Scramble t={t} questions={questions} backHref={backHref} />;
    case "blesk":
      return <Blitz t={t} questions={questions} difficulty={difficulty} backHref={backHref} />;
    case "poklad":
      return <Treasure t={t} questions={questions} difficulty={difficulty} backHref={backHref} />;
    case "obrana":
      return <Defense t={t} questions={questions} backHref={backHref} />;
    case "krizovka":
      return <Crossword t={t} questions={questions} difficulty={difficulty} backHref={backHref} />;
    case "pravda":
      return <TrueFalse t={t} questions={questions} difficulty={difficulty} backHref={backHref} />;
    case "piskvorky":
      return <TicTacToe t={t} questions={questions} difficulty={difficulty} backHref={backHref} />;
    case "bingo":
      return <Bingo t={t} questions={questions} difficulty={difficulty} backHref={backHref} />;
    case "razeni":
      return <Ordering t={t} questions={questions} backHref={backHref} />;
  }
}
