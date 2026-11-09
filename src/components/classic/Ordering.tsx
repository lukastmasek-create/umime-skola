"use client";

import { useEffect, useMemo, useState } from "react";
import type { ClassicText } from "@/i18n/classic";
import type { GameQuestion } from "@/i18n/game";
import { formatTime, shuffle } from "@/lib/classic-games";
import { FinishCard, GameFrame, useTimer, xpFor } from "./shared";

const ROUNDS = 5;

// Položka kola: `id` je správná pozice (0 = první), `text` je to, co hráč vidí.
type Tile = { id: number; text: string };

// Zamíchá položky tak, aby nebyly ve správném pořadí (u dvou a víc položek).
function mixTiles(answer: readonly string[]): Tile[] {
  const tiles = answer.map((text, id) => ({ id, text }));
  const mixed = shuffle(tiles);
  return mixed.every((tile, i) => tile.id === i) ? [...mixed].reverse() : mixed;
}

// Seřaď: v každém kole se položky ukážou zamíchané a hráč na ně klepá od první po poslední.
// Správný klik položku zařadí, špatný se počítá jako chyba. Klávesy 1–4 vybírají položky podle pozice.
export function Ordering({ t, questions, backHref }: { t: ClassicText; questions: GameQuestion[]; backHref: string }) {
  const [deck, setDeck] = useState<GameQuestion[]>(() => shuffle(questions).slice(0, ROUNDS));
  const [index, setIndex] = useState(0);
  const [placed, setPlaced] = useState<number[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [wrong, setWrong] = useState<number | null>(null);

  const finished = deck.length > 0 && index >= deck.length;
  const current = deck[index];
  const tiles = useMemo(() => (current ? mixTiles(current.options) : []), [current]);
  const roundDone = !!current && placed.length === current.options.length;
  const { seconds, reset } = useTimer(!finished && deck.length > 0);

  function pick(tile: Tile) {
    if (!current || roundDone || placed.includes(tile.id)) return;
    if (tile.id === placed.length) {
      setPlaced((p) => [...p, tile.id]);
      return;
    }
    setMistakes((m) => m + 1);
    setWrong(tile.id);
    window.setTimeout(() => setWrong(null), 600);
  }

  function nextRound() {
    setIndex((i) => i + 1);
    setPlaced([]);
    setWrong(null);
  }

  function restart() {
    setDeck(shuffle(questions).slice(0, ROUNDS));
    setIndex(0);
    setPlaced([]);
    setMistakes(0);
    setWrong(null);
    reset();
  }

  useEffect(() => {
    if (finished) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (roundDone && e.code === "Enter") {
        e.preventDefault();
        nextRound();
        return;
      }
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= tiles.length) {
        const tile = tiles[n - 1];
        if (tile) pick(tile);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished, roundDone, tiles, placed, current]);

  const meta = t.games.razeni;
  const stats = [
    { label: t.time, value: formatTime(seconds) },
    { label: t.ordering.round, value: `${Math.min(index + 1, deck.length)}/${deck.length}` },
    { label: t.mistakes, value: String(mistakes) },
  ];

  return (
    <GameFrame title={meta.title} intro={meta.intro} backHref={backHref} backLabel={t.back} stats={stats}>
      {finished ? (
        <FinishCard t={t} xp={xpFor(20, mistakes, deck.length)} seconds={seconds} stats={[{ label: t.mistakes, value: String(mistakes) }]} results={[]} onAgain={restart} backHref={backHref} />
      ) : current ? (
        <div className="flex flex-col gap-5">
          <p className="text-sm text-[var(--muted)]">{t.ordering.hint}</p>
          <p className="card p-4 text-lg font-bold">{current.prompt}</p>
          <ol className="flex flex-col gap-2">
            {current.options.map((_, pos) => {
              const tile = tiles.find((x) => x.id === placed[pos]);
              return (
                <li key={pos} className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-[var(--border)] px-3 py-2 text-sm font-semibold" style={tile ? { borderStyle: "solid", borderColor: "#2ea36b", background: "rgba(126, 224, 176, 0.3)" } : undefined}>
                  <span className="pill bg-[var(--surface-muted)] px-2.5 py-0.5 text-xs font-bold">{pos + 1}</span>
                  <span>{tile ? tile.text : ""}</span>
                </li>
              );
            })}
          </ol>
          {roundDone ? (
            <div className="flex flex-col items-start gap-3">
              <p className="font-bold text-[var(--accent-green)]">{t.ordering.done}</p>
              <button type="button" onClick={nextRound} autoFocus className="btn-bouncy btn-primary px-5 py-2 font-bold">
                {index + 1 < deck.length ? t.ordering.next : t.finish}
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tiles
                .filter((tile) => !placed.includes(tile.id))
                .map((tile) => (
                  <button
                    key={tile.id}
                    type="button"
                    onClick={() => pick(tile)}
                    className="card min-h-12 px-4 py-3 text-left text-sm font-semibold transition hover:-translate-y-0.5"
                    style={wrong === tile.id ? { borderColor: "#ff5d73", background: "rgba(255, 93, 115, 0.18)" } : undefined}
                  >
                    <span className="mr-2 text-xs text-[var(--faint)]">{tiles.indexOf(tile) + 1}</span>
                    {tile.text}
                  </button>
                ))}
            </div>
          )}
          {wrong !== null && <p className="text-sm font-semibold text-[var(--danger)]">{t.ordering.wrong}</p>}
        </div>
      ) : null}
    </GameFrame>
  );
}
