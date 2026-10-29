"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ClassicText } from "@/i18n/classic";
import { shuffle, shuffleQuestion, type Shuffled } from "@/lib/classic-games";
import type { GameQuestion } from "@/i18n/game";
import { FinishCard, GameFrame, xpFor, type AnswerResult } from "./shared";
import { QuestionCard } from "./QuestionCard";

// Obrana města: nepřátelé jdou po cestě k hradu, nejbližší nese otázku. Správná odpověď ho sestřelí, chyba ho posune blíž.
// Pět vln, mezi vlnami se dá za zlato opravit hradba nebo zpomalit další vlnu.

const WAVES = [
  { count: 3, gap: 6200, speed: 0.040 },
  { count: 4, gap: 5600, speed: 0.045 },
  { count: 5, gap: 5000, speed: 0.050 },
  { count: 5, gap: 4600, speed: 0.056 },
  { count: 6, gap: 4200, speed: 0.062 },
] as const;
const MAX_HEARTS = 5;
const GATE = 0.07; // x, ve kterém nepřítel zasáhne hrad
const FOES = ["👾", "👹", "🧟", "🐲", "👻", "🦖"];
const HEAL_COST = 30;
const SLOW_COST = 25;

type Enemy = { id: number; x: number; kind: number; q: Shuffled; dying: number };
type Phase = "ready" | "play" | "between" | "won" | "lost";
type Game = {
  phase: Phase;
  wave: number;
  wt: number; // čas ve vlně (ms)
  spawned: number;
  enemies: Enemy[];
  nextId: number;
  qi: number;
  hearts: number;
  gold: number;
  kills: number;
  streak: number;
  best: number;
  slow: boolean;
  freeze: number; // ms zastavení po chybě
  reveal: { q: Shuffled; picked: number } | null;
  revealT: number;
  hit: number; // počet zásahů hradu (restartuje animaci)
  shot: { id: number; x: number } | null;
  results: AnswerResult[];
  missed: Shuffled[];
  time: number; // ms hraní
};

const initial = (): Game => ({
  phase: "ready", wave: 0, wt: 0, spawned: 0, enemies: [], nextId: 1, qi: 0, hearts: MAX_HEARTS, gold: 0, kills: 0, streak: 0, best: 0,
  slow: false, freeze: 0, reveal: null, revealT: 0, hit: 0, shot: null, results: [], missed: [], time: 0,
});

function activeOf(enemies: Enemy[]): Enemy | undefined {
  let best: Enemy | undefined;
  for (const e of enemies) if (!e.dying && (!best || e.x < best.x)) best = e;
  return best;
}

export function Defense({ t, questions, backHref }: { t: ClassicText; questions: GameQuestion[]; backHref: string }) {
  const [round, setRound] = useState(0);
  const deck = useMemo<Shuffled[]>(() => {
    const once = () => shuffle(questions).map(shuffleQuestion);
    return [...once(), ...once(), ...once()];
  }, [questions, round]); // eslint-disable-line react-hooks/exhaustive-deps
  const [g, setG] = useState<Game>(initial);
  const deckRef = useRef(deck);
  useEffect(() => {
    deckRef.current = deck;
  });

  // herní smyčka
  useEffect(() => {
    if (g.phase !== "play") return;
    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(60, now - last);
      last = now;
      setG((s) => step(s, dt, deckRef.current));
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [g.phase]);

  const active = activeOf(g.enemies);
  const shown = g.reveal?.q ?? active?.q ?? null;

  function pick(i: number) {
    setG((s) => {
      if (s.phase !== "play" || s.reveal) return s;
      const e = activeOf(s.enemies);
      if (!e) return s;
      const ok = i === e.q.correct;
      const results = e.q.id ? [...s.results, { id: e.q.id, correct: ok }] : s.results;
      if (ok) {
        const streak = s.streak + 1;
        return {
          ...s,
          enemies: s.enemies.map((x) => (x.id === e.id ? { ...x, dying: 1 } : x)),
          kills: s.kills + 1,
          gold: s.gold + 10 + Math.min(streak - 1, 5) * 2,
          streak,
          best: Math.max(s.best, streak),
          reveal: { q: e.q, picked: i },
          revealT: 380,
          shot: { id: s.nextId, x: e.x },
          nextId: s.nextId + 1,
          results,
        };
      }
      const missed = s.missed.some((m) => m.prompt === e.q.prompt) ? s.missed : [...s.missed, e.q];
      return {
        ...s,
        enemies: s.enemies.map((x) => (x.id === e.id ? { ...x, x: Math.min(1, x.x + 0.1), q: deckRef.current[s.qi % deckRef.current.length] } : x)),
        qi: s.qi + 1,
        streak: 0,
        reveal: { q: e.q, picked: i },
        revealT: 1300,
        freeze: 1300,
        results,
        missed,
      };
    });
  }
  const pickRef = useRef(pick);
  useEffect(() => {
    pickRef.current = pick;
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= 4) pickRef.current(n - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (deck.length < 12) return <p className="card p-6">{t.noData}</p>;

  const d = t.defense;
  const meta = t.games.obrana;
  const finished = g.phase === "won" || g.phase === "lost";
  const waveNo = Math.min(g.wave + 1, WAVES.length);
  const seconds = Math.round(g.time / 1000);

  function start() {
    setG({ ...initial(), phase: "play" });
  }
  function nextWave() {
    setG((s) => ({ ...s, phase: "play", wave: s.wave + 1, wt: 0, spawned: 0, enemies: [], reveal: null, revealT: 0 }));
  }
  function restart() {
    setRound((n) => n + 1);
    setG(initial());
  }

  return (
    <GameFrame
      title={meta.title}
      intro={meta.intro}
      backHref={backHref}
      backLabel={t.back}
      stats={g.phase === "ready" ? undefined : [{ label: d.wave, value: `${waveNo}/${WAVES.length}` }, { label: d.hearts, value: "❤️".repeat(Math.max(0, g.hearts)) || "💔" }, { label: d.gold, value: `🪙 ${g.gold}` }, { label: t.quiz.streak, value: String(g.streak) }]}
    >
      {finished ? (
        <FinishCard
          t={t}
          xp={xpFor(Math.min(40, 6 + g.kills * 2 + (g.phase === "won" ? 8 : 0)), g.missed.length, Math.max(1, g.results.length))}
          seconds={seconds}
          stats={[
            { label: d.kills, value: String(g.kills) },
            { label: d.wave, value: `${waveNo}/${WAVES.length}` },
            { label: d.gold, value: String(g.gold) },
          ]}
          results={g.results}
          questions={questions}
          onAgain={restart}
          backHref={backHref}
        >
          <p className="text-lg font-bold">{g.phase === "won" ? d.win : d.lose}</p>
        </FinishCard>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="def-scene" aria-hidden>
            <div className="def-hills" />
            <div className="def-ground" />
            <div key={g.hit} className={`def-castle ${g.hit ? "def-castle-hit" : ""}`}>
              🏰
            </div>
            <div className="def-hearts">{Array.from({ length: MAX_HEARTS }, (_, i) => (i < g.hearts ? "❤️" : "🖤")).join("")}</div>
            {g.enemies.map((e) => (
              <div key={e.id} className={`def-foe ${e.dying ? "def-foe-dying" : ""} ${active?.id === e.id ? "def-foe-active" : ""}`} style={{ left: `${8 + e.x * 84}%` }}>
                {e.dying ? "💥" : FOES[e.kind % FOES.length]}
                {active?.id === e.id && !e.dying && <span className="def-mark">▼</span>}
              </div>
            ))}
            {g.shot && <div key={g.shot.id} className="def-shot" style={{ ["--tx" as string]: `${8 + g.shot.x * 84}%` }}>☄️</div>}
            {g.phase === "ready" && <div className="def-banner">{d.ready}</div>}
            {g.phase === "between" && <div className="def-banner">{d.waveClear.replace("{n}", String(g.wave + 1))}</div>}
          </div>

          {g.phase === "ready" && (
            <button type="button" onClick={start} className="btn-bouncy btn-primary btn-lg self-start">
              {t.quiz.start}
            </button>
          )}
          {g.phase === "between" && (
            <div className="card flex flex-col gap-3 p-4">
              <p className="font-bold">{d.shop}</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={g.gold < HEAL_COST || g.hearts >= MAX_HEARTS}
                  onClick={() => setG((s) => ({ ...s, gold: s.gold - HEAL_COST, hearts: Math.min(MAX_HEARTS, s.hearts + 1) }))}
                  className="btn-bouncy bg-[var(--surface-muted)] px-4 py-2 text-sm font-bold disabled:opacity-40"
                >
                  ❤️ {d.heal} · 🪙 {HEAL_COST}
                </button>
                <button type="button" disabled={g.gold < SLOW_COST || g.slow} onClick={() => setG((s) => ({ ...s, gold: s.gold - SLOW_COST, slow: true }))} className="btn-bouncy bg-[var(--surface-muted)] px-4 py-2 text-sm font-bold disabled:opacity-40">
                  🧊 {d.slow} · 🪙 {SLOW_COST} {g.slow ? "✓" : ""}
                </button>
              </div>
              <button type="button" onClick={nextWave} className="btn-bouncy btn-primary btn-lg self-start">
                {d.next}
              </button>
            </div>
          )}
          {g.phase === "play" && shown && (
            <div className="card p-4">
              <QuestionCard q={shown} picked={g.reveal ? g.reveal.picked : null} onPick={pick} disabled={!!g.reveal} />
              {g.reveal && g.reveal.picked !== g.reveal.q.correct && g.reveal.q.explanation && <p className="mt-2 text-sm text-[var(--muted)]">{g.reveal.q.explanation}</p>}
            </div>
          )}
          {g.phase === "play" && !shown && <p className="text-sm font-semibold text-[var(--muted)]">{d.waiting}</p>}
        </div>
      )}
    </GameFrame>
  );
}

// Posun hry o `dt` ms: spawn nepřátel, chůze, zásahy hradu, konec vlny.
function step(s: Game, dt: number, deck: Shuffled[]): Game {
  if (s.phase !== "play") return s;
  let { revealT, reveal } = s;
  const time = s.time + dt;
  if (revealT > 0) {
    revealT -= dt;
    if (revealT <= 0) {
      revealT = 0;
      reveal = null;
    }
  }
  if (s.freeze > 0) return { ...s, freeze: Math.max(0, s.freeze - dt), revealT, reveal, time };

  const W = WAVES[s.wave];
  const speed = W.speed * (s.slow ? 0.7 : 1);
  const wt = s.wt + dt;
  let { spawned, nextId, qi, hearts, streak, hit } = s;
  let enemies = s.enemies;
  let { results, missed } = s;

  while (spawned < W.count && wt >= 700 + spawned * W.gap) {
    enemies = [...enemies, { id: nextId, x: 1, kind: (s.wave * 3 + spawned) % FOES.length, q: deck[qi % deck.length], dying: 0 }];
    nextId++;
    qi++;
    spawned++;
  }
  const next: Enemy[] = [];
  for (const e of enemies) {
    if (e.dying) {
      if (e.dying + dt < 420) next.push({ ...e, dying: e.dying + dt });
      continue;
    }
    const x = e.x - (speed * dt) / 1000;
    if (x <= GATE) {
      hearts--;
      streak = 0;
      hit++;
      if (e.q.id) results = [...results, { id: e.q.id, correct: false }];
      if (!missed.some((m) => m.prompt === e.q.prompt)) missed = [...missed, e.q];
      continue;
    }
    next.push({ ...e, x });
  }
  let phase: Phase = s.phase;
  let wave = s.wave;
  if (hearts <= 0) phase = "lost";
  else if (spawned >= W.count && next.length === 0) {
    phase = s.wave >= WAVES.length - 1 ? "won" : "between";
    if (phase === "between") wave = s.wave;
  }
  const slow = phase === "between" ? false : s.slow;
  return { ...s, phase, wave, wt, spawned, enemies: next, nextId, qi, hearts, streak, hit, results, missed, revealT, reveal, slow, time, shot: reveal ? s.shot : null };
}
