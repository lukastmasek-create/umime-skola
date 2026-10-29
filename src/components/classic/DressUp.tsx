"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef, useState } from "react";
import type { ClassicText } from "@/i18n/classic";
import { formatTime, shuffle, shuffleQuestion } from "@/lib/classic-games";
import type { GameQuestion } from "@/i18n/game";
import { DOLLS, SLOTS, SLOT_COUNT, optionsFor, type Doll, type Pick, type Slot } from "@/lib/dress";
import { DollSvg, type Mood, type Worn } from "./DollSvg";
import type { DollEvent } from "./DollView3D";
import { FinishCard, GameFrame, useTimer, xpFor, type AnswerResult } from "./shared";
import { QuestionCard } from "./QuestionCard";

// three.js se stahuje až při hře; bez WebGL se panenka kreslí jako SVG.
const DollView3D = dynamic(() => import("./DollView3D"), { ssr: false });

function DollStage({ doll, worn, mood, event, label, className }: { doll: Doll; worn: Worn; mood: Mood; event: DollEvent | null; label: string; className: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <DollSvg doll={doll} worn={worn} mood={mood} className="mx-auto h-full w-auto" />;
  return (
    <div className={className}>
      <DollView3D dollId={doll.id} worn={worn} mood={mood} event={event} label={label} onError={() => setFailed(true)} />
    </div>
  );
}

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
  const [event, setEvent] = useState<DollEvent | null>(null);
  const [preview, setPreview] = useState(0);
  const [choosing, setChoosing] = useState<Slot | null>(null);
  const [hoverPick, setHoverPick] = useState<Pick | null>(null);
  const busy = useRef(false);
  const eventId = useRef(0);

  const doll: Doll | undefined = DOLLS.find((d) => d.id === dollId);
  const filled = SLOTS.filter((s) => worn[s] !== undefined).length;
  const nextSlot = choosing ?? SLOTS.find((s) => worn[s] === undefined);
  const shown: Worn = choosing && hoverPick ? { ...worn, [choosing]: hoverPick } : worn;
  const q = deck[turn];
  const over = !!doll && !choosing && (filled >= SLOT_COUNT || turn >= deck.length);
  const { seconds, reset } = useTimer(!!doll && !over);
  const d = t.dress;

  if (deck.length < SLOT_COUNT) return <p className="card p-6">{t.noData}</p>;

  function answer(i: number) {
    if (picked !== null || !q || !nextSlot || choosing || busy.current) return;
    busy.current = true;
    setPicked(i);
    const ok = i === q.correct;
    if (q.id) setResults((r) => [...r, { id: q.id as string, correct: ok }]);
    window.setTimeout(() => {
      setPicked(null);
      setTurn((n) => n + 1);
      if (ok) {
        // správná odpověď: hráč si vybere jednu ze čtyř variant kusu
        setChoosing(nextSlot);
        setHoverPick(null);
        setMood("happy");
        setEvent({ id: Date.now(), kind: "happy" });
        setMsg(`${d.yay} ${d.choose.replace("{slot}", d.slots[nextSlot].toLowerCase())}`);
      } else {
        setWrongs((n) => n + 1);
        setMood("sad");
        setEvent({ id: Date.now(), kind: "sad" });
        // špatná odpověď: něco z toho, co už má na sobě, se změní (jiná barva)
        setWorn((w) => {
          const have = SLOTS.filter((s) => w[s] !== undefined);
          if (have.length === 0) return w;
          const s = have[Math.floor(Math.random() * have.length)];
          const cur = w[s] ?? { v: 0, h: 0 };
          return { ...w, [s]: { ...cur, h: (cur.h + 0.31) % 1 } };
        });
        setMsg(`${d.oops} ${t.quiz.correctWas}: ${q.options[q.correct]}`);
      }
      busy.current = false;
    }, 1100);
  }

  function choose(pick: Pick) {
    if (!choosing) return;
    const slot = choosing;
    setWorn((w) => ({ ...w, [slot]: pick }));
    setChoosing(null);
    setHoverPick(null);
    setMood("happy");
    setEvent({ id: ++eventId.current, kind: "dress", slot });
    setMsg(`${ICON[slot]} ${d.yay}`);
  }

  function restart() {
    setChoosing(null);
    setHoverPick(null);
    setRound((n) => n + 1);
    setDollId(null);
    setEvent(null);
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
        <div className="card flex flex-col items-center gap-3 p-5">
          <p className="text-lg font-bold">{d.pick}</p>
          {(() => {
            const p = DOLLS[preview];
            const name = d.dolls[p.id as keyof typeof d.dolls];
            return (
              <>
                <div className="flex w-full max-w-md items-center gap-2">
                  <button type="button" aria-label="‹" onClick={() => setPreview((n) => (n + DOLLS.length - 1) % DOLLS.length)} className="btn-bouncy btn-secondary h-12 w-12 shrink-0 text-2xl">
                    ‹
                  </button>
                  <div className="h-[32rem] flex-1 rounded-2xl border-2 border-[var(--edge)]" style={{ background: `linear-gradient(180deg, ${p.bg[0]}, ${p.bg[1]})` }}>
                    <DollStage key={p.id} doll={p} worn={{}} mood="neutral" event={null} label={name} className="h-full w-full" />
                  </div>
                  <button type="button" aria-label="›" onClick={() => setPreview((n) => (n + 1) % DOLLS.length)} className="btn-bouncy btn-secondary h-12 w-12 shrink-0 text-2xl">
                    ›
                  </button>
                </div>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {DOLLS.map((x, i) => (
                    <button
                      key={x.id}
                      type="button"
                      onClick={() => setPreview(i)}
                      className="pill px-3 py-1 text-sm font-semibold"
                      style={{ background: i === preview ? "var(--accent-500)" : "var(--surface-muted)", color: i === preview ? "#fff" : undefined }}
                    >
                      {d.dolls[x.id as keyof typeof d.dolls]}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="btn-bouncy btn-primary btn-lg"
                  onClick={() => {
                    setDollId(p.id);
                    setMood("neutral");
                  }}
                >
                  {d.start}: {name}
                </button>
              </>
            );
          })()}
        </div>
      ) : over ? (
        <div className="flex flex-col gap-4">
          <div className="mx-auto w-full max-w-xs rounded-2xl border-2 border-[var(--edge)] p-3" style={{ background: `linear-gradient(180deg, ${doll.bg[0]}, ${doll.bg[1]})` }}>
            <DollStage doll={doll} worn={worn} mood={filled >= SLOT_COUNT ? "happy" : "neutral"} event={event} label={d.dressed} className="h-[32rem] w-full" />
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
        <div className="grid gap-5 md:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
          <div className="flex flex-col gap-2">
            <div className="rounded-2xl border-2 border-[var(--edge)] p-2" style={{ background: `linear-gradient(180deg, ${doll.bg[0]}, ${doll.bg[1]})` }}>
              <DollStage doll={doll} worn={shown} mood={mood} event={event} label={d.dressed} className="h-[30rem] w-full" />
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
            {choosing ? (
              <div className="flex flex-col gap-3">
                <p className="text-lg font-bold">{d.choose.replace("{slot}", d.slots[choosing].toLowerCase())}</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {optionsFor(doll, choosing).map((o, i) => {
                    const names = (d.shapes[doll.id] ?? null)?.[choosing];
                    const label = names ? names[i] : d.option.replace("{n}", String(i + 1));
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => choose(o.pick)}
                        onMouseEnter={() => setHoverPick(o.pick)}
                        onMouseLeave={() => setHoverPick(null)}
                        onFocus={() => setHoverPick(o.pick)}
                        onBlur={() => setHoverPick(null)}
                        className="card card-hover flex items-center gap-3 p-3 text-left text-sm font-bold"
                      >
                        <span aria-hidden className="h-8 w-8 shrink-0 rounded-full border-2 border-[var(--edge)]" style={{ background: o.swatch, filter: o.hue ? `hue-rotate(${o.hue}deg)` : undefined }} />
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              q && <QuestionCard q={q} picked={picked} onPick={answer} />
            )}
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
