"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getClassicText } from "@/i18n/classic";
import type { Locale } from "@/i18n/config";
import type { GameQuestion } from "@/i18n/game";
import { gameMeta, getGamesUiText } from "@/i18n/games-meta";
import { readBest, type Best } from "@/lib/game-best";
import { GAMES, type ClassicSlug } from "@/lib/games";
import { Bingo } from "./classic/Bingo";
import { Blitz } from "./classic/Blitz";
import { Crossword } from "./classic/Crossword";
import { DressUp } from "./classic/DressUp";
import { Fill } from "./classic/Fill";
import { Hangman } from "./classic/Hangman";
import { Matching } from "./classic/Matching";
import { Memory } from "./classic/Memory";
import { Millionaire } from "./classic/Millionaire";
import { Scramble } from "./classic/Scramble";
import { Defense } from "./classic/Defense";
import { Sorting } from "./classic/Sorting";
import { TicTacToe } from "./classic/TicTacToe";
import { Treasure } from "./classic/Treasure";
import { TrueFalse } from "./classic/TrueFalse";
import { WordSearch } from "./classic/WordSearch";
import { ClassicSessionContext } from "./classic/shared";

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
      <div className="fs-classic card flex flex-col gap-5 p-6">
        <Link href={backHref} className="text-sm font-medium text-[var(--faint)] hover:text-[var(--foreground)]">
          {t.back}
        </Link>
        <div className="flex items-center gap-4">
          <span className="game-intro-emoji flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-[var(--surface-muted)] text-5xl" aria-hidden>
            {emoji}
          </span>
          <div>
            <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
              {meta.name}
            </h1>
            <p className="mt-1 text-[var(--muted)]">{meta.tag}</p>
          </div>
        </div>
        <div className="rounded-2xl bg-[var(--surface-muted)] p-4">
          <h2 className="mb-1 text-sm font-bold uppercase tracking-wide text-[var(--faint)]">{ui.howTo}</h2>
          <p className="text-sm">{t.games[game].intro}</p>
        </div>
        {best && (
          <p className="pill self-start bg-[var(--surface-muted)] px-3 py-1.5 text-sm font-semibold">
            🏆 {ui.bestSoFar}: {"⭐".repeat(best.stars) || "–"}
          </p>
        )}
        <button type="button" onClick={() => setStarted(true)} autoFocus className="btn-bouncy btn-primary btn-lg self-start">
          ▶ {ui.start}
        </button>
      </div>
    );
  }

  return (
    <ClassicSessionContext.Provider value={{ game, course: courseSlug, level: difficulty, newBestLabel: ui.newBest, bestLabel: ui.bestSoFar }}>
      <ClassicGameBody t={t} game={game} questions={questions} difficulty={difficulty} backHref={backHref} />
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
    case "oblekani":
      return <DressUp t={t} questions={questions} backHref={backHref} />;
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
  }
}
