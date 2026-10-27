"use client";

import { getClassicText } from "@/i18n/classic";
import type { Locale } from "@/i18n/config";
import type { GameQuestion } from "@/i18n/game";
import type { ClassicSlug } from "@/lib/games";
import { Hangman } from "./classic/Hangman";
import { Matching } from "./classic/Matching";
import { Memory } from "./classic/Memory";
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
  }
}
