"use client";

import { getClassicText } from "@/i18n/classic";
import type { Locale } from "@/i18n/config";
import type { GameQuestion } from "@/i18n/game";
import type { ClassicSlug } from "@/lib/games";
import { Blitz } from "./classic/Blitz";
import { Fill } from "./classic/Fill";
import { Hangman } from "./classic/Hangman";
import { Matching } from "./classic/Matching";
import { Memory } from "./classic/Memory";
import { Millionaire } from "./classic/Millionaire";
import { Scramble } from "./classic/Scramble";
import { Sorting } from "./classic/Sorting";
import { Treasure } from "./classic/Treasure";
import { WordSearch } from "./classic/WordSearch";

// Klasické hry (osmisměrka, spojování, pexeso, šibenice) nad otázkami kurzu. Míchání je náhodné, proto se vykresluje jen v prohlížeči.
export function ClassicGameInner({
  locale,
  game,
  questions,
  difficulty,
  backHref,
}: {
  locale: Locale;
  game: ClassicSlug;
  questions: GameQuestion[];
  difficulty: number;
  backHref: string;
}) {
  const t = getClassicText(locale);
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
  }
}
