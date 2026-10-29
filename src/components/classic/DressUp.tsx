"use client";

import { useMemo, useRef, useState } from "react";
import type { ClassicText } from "@/i18n/classic";
import { formatTime, shuffle, shuffleQuestion } from "@/lib/classic-games";
import type { GameQuestion } from "@/i18n/game";
import { DOLLS, SLOTS, SLOT_COUNT, type Doll, type Slot } from "@/lib/dress";
import { DollSvg, type Mood, type Worn } from "./DollSvg";
import { FinishCard, GameFrame, useTimer, xpFor, type AnswerResult } from "./shared";
import { QuestionCard } from "./QuestionCard";

const DECK = 16;
const ICON: Record<Slot, string> = { hair: "💇", outfit: "👗", shoes: "👠", makeup: "💄", accessory: "📿", topper: "👑" };

// Panenka ve spodním prádle: každá správná odpověď jí přidá jeden kus oblečení, špatná ji zarmoutí a změní něco z toho, co má na sobě.
export function DressUp({ t, questions, backHref }: { t: ClassicText; questions: GameQuestion[]; backHref: string }) {
  const [round, setRound] = useState(0);
  const deck = useMemo(() => shuffle(questions).slice(0, DECK).map(shuffleQuestion), [questions, round]); // eslint-disable-line react-hooks/exhaustive-deps
  const [dollId, setDollId] = useState<string | null>(null);
  const [worn, setWorn] = useState<Worn>({});
  const [turn, setTurn] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [mood, setMood] = useState<Mood>("neutral");
  const [msg, setMsg] = useState<string | null>(null);
  const [results, setResults] = useState<AnswerResult[]>([]);
  const [wrongs, setWrongs] = useState(0);
  const busy = useRef(false);

  const doll: Doll | undefined = DOLLS.find((d) => d.id === dollId);
  const filled = SLOTS.filter((s) => worn[s] !== undefined).length;
  const nextSlot = SLOTS.find((s) => worn[s] === undefined);
  const q = deck[turn];
  const over = !!doll && (filled >= SLOT_COUNT || turn >= deck.length);
  const { seconds, reset } = useTimer(!!doll && !over);
  const d = t.dress;

  if (deck.length < SLOT_COUNT) return <p className="card p-6">{t.noData}</p>;

  function answer(i: number) {
    if (picked !== null || !q || !nextSlot || busy.current) return;
    busy.current = true;
    setPicked(i);
    const ok = i === q.correct;
    if (q.id) setResults((r) => [...r, { id: q.id as string, correct: ok }]);
    window.setTimeout(() => {
      setPicked(null);
      setTurn((n) => n + 1);
      if (ok) {
        setWorn((w) => ({ ...w, [nextSlot]: 0 }));
        setMood("happy");
        setMsg(`${ICON[nextSlot]} ${d.yay}`);
      } else {
        setWrongs((n) => n + 1);
        setMood("sad");
        // špatná odpověď: něco z toho, co už má na sobě, se změní (jiná barva)
        setWorn((w) => {
          const have = SLOTS.filter((s) => w[s] !== undefined);
          if (have.length === 0) return w;
          const s = have[Math.floor(Math.random() * have.length)];
          const cur = w[s] ?? 0;
          return { ...w, [s]: cur === 1 ? 2 : 1 };
        });
        setMsg(`${d.oops} ${t.quiz.correctWas}: ${q.options[q.correct]}`);
      }
      busy.current = false;
    }, 1100);
  }

  function restart() {
    setRound((n) => n + 1);
    setDollId(null);
    setWorn({});
    setTurn(0);
    setPicked(null);
    setMood("neutral");
    setMsg(null);
    setResults([]);
    setWrongs(0);
    reset();
  }

  const meta = t.games.oblekani;
  const items = Math.max(1, results.length);

  return (
    <GameFrame
      title={meta.title}
      intro={meta.intro}
      backHref={backHref}
      backLabel={t.back}
      stats={
        doll
          ? [
              { label: t.time, value: formatTime(seconds) },
              { label: d.dressed, value: `${filled}/${SLOT_COUNT}` },
              { label: t.mistakes, value: String(wrongs) },
            ]
          : undefined
      }
    >
      {!doll ? (
        <div className="card flex flex-col gap-4 p-5">
          <p className="text-lg font-bold">{d.pick}</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {DOLLS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setDollId(p.id);
                  setMood("neutral");
                }}
                className="card card-hover flex flex-col items-center gap-1 p-3"
                style={{ background: `linear-gradient(180deg, ${p.bg[0]}, ${p.bg[1]})` }}
              >
                <DollSvg doll={p} worn={{}} mood="neutral" className="h-44 w-auto" />
                <span className="font-bold text-[#16132b]">{d.dolls[p.id as keyof typeof d.dolls]}</span>
              </button>
            ))}
          </div>
        </div>
      ) : over ? (
        <div className="flex flex-col gap-4">
          <div className="mx-auto w-full max-w-xs rounded-2xl border-2 border-[var(--edge)] p-3" style={{ background: `linear-gradient(180deg, ${doll.bg[0]}, ${doll.bg[1]})` }}>
            <DollSvg doll={doll} worn={worn} mood={filled >= SLOT_COUNT ? "happy" : "neutral"} className="mx-auto h-80 w-auto" />
          </div>
          <FinishCard
            t={t}
            xp={xpFor(10 + filled * 4, wrongs, items)}
            seconds={seconds}
            stats={[
              { label: d.dressed, value: `${filled}/${SLOT_COUNT}` },
              { label: t.mistakes, value: String(wrongs) },
            ]}
            results={results}
            onAgain={restart}
            backHref={backHref}
          />
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
          <div className="flex flex-col gap-2">
            <div className="rounded-2xl border-2 border-[var(--edge)] p-2" style={{ background: `linear-gradient(180deg, ${doll.bg[0]}, ${doll.bg[1]})` }}>
              <DollSvg key={mood === "sad" ? `sad${turn}` : "ok"} doll={doll} worn={worn} mood={mood} className="mx-auto h-72 w-auto" />
            </div>
            <ul className="flex flex-wrap justify-center gap-1.5" aria-label={d.dressed}>
              {SLOTS.map((s) => (
                <li
                  key={s}
                  title={d.slots[s]}
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 text-lg"
                  style={{
                    borderColor: s === nextSlot ? "var(--accent-500)" : "var(--edge)",
                    background: worn[s] !== undefined ? "rgba(126,224,176,0.4)" : "var(--surface-muted)",
                    opacity: worn[s] !== undefined || s === nextSlot ? 1 : 0.5,
                  }}
                >
                  {ICON[s]}
                </li>
              ))}
            </ul>
          </div>
          <div className="card flex flex-col gap-4 p-5">
            {nextSlot && (
              <p className="text-sm font-bold uppercase tracking-wide text-[var(--accent-500)]">
                {d.wearing}: {ICON[nextSlot]} {d.slots[nextSlot]}
              </p>
            )}
            {q && <QuestionCard q={q} picked={picked} onPick={answer} />}
            {msg && (
              <p className="text-sm font-semibold text-[var(--muted)]" aria-live="polite">
                {msg}
              </p>
            )}
          </div>
        </div>
      )}
    </GameFrame>
  );
}
