"use client";

import { useEffect, useState } from "react";
import { readBest, type Best } from "@/lib/game-best";

// Osobní rekord na kartě hry (čte se z prohlížeče, proto až po načtení stránky).
export function GameBestBadge({ game, course, level, label }: { game: string; course: string; level: number; label: string }) {
  const [best, setBest] = useState<Best | null>(null);
  useEffect(() => {
    setBest(readBest(game, course, level)); // eslint-disable-line react-hooks/set-state-in-effect
  }, [game, course, level]);
  if (!best) return null;
  return (
    <span className="text-xs font-semibold text-[var(--brand-600)]">
      🏆 {label}: {best.stars > 0 ? "⭐".repeat(best.stars) : best.score}
    </span>
  );
}
