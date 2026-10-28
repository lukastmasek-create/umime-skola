"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SpaceEngine, GAME_HEIGHT, GAME_WIDTH, type EngineConfig } from "@/lib/space-engine";
import { MarioEngine } from "@/lib/mario-engine";
import { PacmanEngine } from "@/lib/pacman-engine";
import { SnakeEngine } from "@/lib/snake-engine";
import { BreakoutEngine } from "@/lib/breakout-engine";
import { TetrisEngine } from "@/lib/tetris-engine";
import { KongEngine } from "@/lib/kong-engine";
import { CentipedeEngine } from "@/lib/centipede-engine";
import { FlappyEngine } from "@/lib/flappy-engine";
import { MoleEngine } from "@/lib/mole-engine";
import { NinjaEngine } from "@/lib/ninja-engine";
import type { HeldKey } from "@/lib/arcade-base";
import { GAMES, type GameSlug } from "@/lib/games";
import { getArcadeText, isArcadeSlug } from "@/i18n/arcade";
import { getGameText, type GameQuestion, type GameText } from "@/i18n/game";
import { DailyRecap } from "@/components/DailyChallenges";
import type { Locale } from "@/i18n/config";
import { isMuted, setMuted, sfx, unlockAudio } from "@/lib/game-fx";

type QuizEngine = {
  destroy(): void;
  setRunning(running: boolean): void;
  setInput(input: Partial<Record<HeldKey, boolean>>): void;
  loadQuestion(options: string[], correctIndex: number, config: EngineConfig, prompt?: string): void;
  popText(text: string, color?: string): void;
  // Vyřadí špatné odpovědi z hry (nápověda 50:50); hra je z plátna odstraní.
  setHint?(eliminated: number[]): void;
};

type Phase = "intro" | "playing" | "explain" | "result";
type UpgradeKey = "fire" | "life" | "slow";
type Upgrades = Record<UpgradeKey, number>;
type Resolved = { kind: "correct" | "wrong" | "missed"; pts?: number };

const QUESTIONS_PER_RUN = 8;
// Jak dlouho zůstane vysvětlení na obrazovce, než hra sama pokračuje.
const AUTO_CONTINUE_MS = { correct: 4500, other: 7000 };
const BASE_FIRE_COOLDOWN = 0.35;

// Obtížnost: snadná je výchozí. Zpomaluje hru, prodlužuje čas na otázku, přidává životy a nápovědy.
type Difficulty = "easy" | "normal" | "hard";
const DIFFICULTIES: Record<Difficulty, { speed: number; time: number; lives: number; hints: number; mult: number }> = {
  easy: { speed: 0.62, time: 1.7, lives: 5, hints: 3, mult: 1 },
  normal: { speed: 0.85, time: 1.25, lives: 4, hints: 2, mult: 1.5 },
  hard: { speed: 1.05, time: 1, lives: 3, hints: 1, mult: 2 },
};
const DIFFICULTY_KEY = "game:difficulty";
const MAX_UPGRADE_LEVEL = 3;
const COSTS: Record<UpgradeKey, number[]> = {
  fire: [50, 100, 200],
  life: [80, 160, 320],
  slow: [60, 120, 240],
};
const UPGRADE_ICONS: Record<UpgradeKey, string> = { fire: "⚡", life: "❤️", slow: "🐌" };
const EMPTY_UPGRADES: Upgrades = { fire: 0, life: 0, slow: 0 };

// Ovládací tlačítka na telefonu u retro her: které klávesy hra používá a jak se jmenují.
type PadSpec = { keys: HeldKey[]; up?: string; down?: string };
const PADS: Partial<Record<GameSlug, PadSpec>> = {
  "pac-man": { keys: ["left", "right", "up", "down"] },
  snake: { keys: ["left", "right", "up", "down"] },
  breakout: { keys: ["left", "right", "fire"] },
  tetris: { keys: ["left", "right", "up", "down", "fire"], up: "⟳", down: "▼" },
  kong: { keys: ["left", "right", "up", "down", "fire"] },
  stonozka: { keys: ["left", "right", "up", "down", "fire"] },
  flappy: { keys: ["fire"] },
  mole: { keys: ["left", "right", "fire"] },
  ninja: { keys: ["left", "right", "up", "down", "fire"] },
};

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function prepareRun(questions: GameQuestion[], count = QUESTIONS_PER_RUN): GameQuestion[] {
  return shuffle(questions)
    .slice(0, count)
    .map((q) => {
      const order = shuffle([0, 1, 2, 3]);
      return {
        ...q,
        options: order.map((i) => q.options[i]) as GameQuestion["options"],
        correctIndex: order.indexOf(q.correctIndex),
      };
    });
}

function HoldButton({
  onHold,
  className,
  label,
  children,
}: {
  onHold: (down: boolean) => void;
  className: string;
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onPointerDown={() => onHold(true)}
      onPointerUp={() => onHold(false)}
      onPointerLeave={() => onHold(false)}
      onPointerCancel={() => onHold(false)}
      className={className}
      aria-label={label}
    >
      {children}
    </button>
  );
}

function DifficultyPicker({ t, value, onChange }: { t: GameText; value: Difficulty; onChange: (d: Difficulty) => void }) {
  const labels: Record<Difficulty, string> = { easy: t.easy, normal: t.normal, hard: t.hard };
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-semibold">{t.difficulty}</p>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t.difficulty}>
        {(Object.keys(labels) as Difficulty[]).map((d) => (
          <button
            key={d}
            type="button"
            role="radio"
            aria-checked={value === d}
            onClick={() => onChange(d)}
            className={`btn-bouncy rounded-full border-2 px-4 py-2 text-sm font-semibold ${
              value === d ? "border-[var(--brand-500)] bg-[var(--brand-50)]" : "border-[var(--border-soft)] bg-[var(--surface)]"
            }`}
          >
            {labels[d]}
          </button>
        ))}
      </div>
      <p className="text-xs text-[var(--muted)]">{t.difficultyHint[value]}</p>
    </div>
  );
}

function UpgradeShop({
  t,
  coins,
  upgrades,
  onBuy,
}: {
  t: GameText;
  coins: number;
  upgrades: Upgrades;
  onBuy: (key: UpgradeKey) => void;
}) {
  const names: Record<UpgradeKey, string> = {
    fire: t.upgradeFire,
    life: t.upgradeLife,
    slow: t.upgradeSlow,
  };
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-semibold">
        🛠️ {t.upgrades} · {t.courseCoins}: <span className="text-[var(--brand-600)]">{coins}</span>
      </p>
      <div className="grid gap-2 sm:grid-cols-3">
        {(Object.keys(names) as UpgradeKey[]).map((key) => {
          const level = upgrades[key];
          const maxed = level >= MAX_UPGRADE_LEVEL;
          const cost = COSTS[key][level];
          const canBuy = !maxed && coins >= cost;
          return (
            <div key={key} className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-muted)] p-3 text-sm">
              <p className="font-semibold">
                {UPGRADE_ICONS[key]} {names[key]}
              </p>
              <p className="mb-2 text-xs text-[var(--muted)]">
                {t.level} {level}/{MAX_UPGRADE_LEVEL}
              </p>
              <button
                onClick={() => onBuy(key)}
                disabled={!canBuy}
                className="btn-bouncy w-full rounded-full bg-[var(--brand-500)] px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {maxed ? t.maxed : `${t.buy} · ${cost}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SpaceQuizGame({
  locale,
  courseSlug,
  courseTitle,
  backHref,
  questions,
  game = "space-invaders",
}: {
  locale: Locale;
  courseSlug: string;
  courseTitle: string;
  backHref: string;
  questions?: GameQuestion[];
  game?: GameSlug;
}) {
  const base = getGameText(locale);
  const mario = game === "super-mario";
  // Had je nekonečná hra: otázky se opakují, dokud hráč nepřijde o všechny životy.
  const endless = game === "snake";
  const arcade = isArcadeSlug(game) ? getArcadeText(game, locale) : null;
  const emoji = game === "space-invaders" ? "🚀" : (GAMES.find((g) => g.slug === game)?.emoji ?? "🎮");
  const pad = PADS[game];
  const t: GameText = mario
    ? {
        ...base,
        title: base.mario.title,
        intro: base.mario.intro,
        controls: base.mario.controls,
        fire: base.mario.jump,
        upgradeFire: base.mario.upgradeJump,
      }
    : arcade
      ? {
          ...base,
          title: arcade.title,
          intro: arcade.intro,
          controls: arcade.controls,
          fire: arcade.action,
          upgradeFire: arcade.upgradeAction,
        }
      : base;
  const storageKey = `game:${courseSlug}`;
  const hasCourseQuestions = !!questions && questions.length > 0;
  const source = hasCourseQuestions ? questions : t.questions;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const explainSinceRef = useRef(0);
  const nextStepRef = useRef<() => void>(() => {});
  const engineRef = useRef<QuizEngine | null>(null);
  const handlersRef = useRef<{ onHit: (c: boolean) => void; onMiss: () => void; onDamage: () => void }>({
    onHit: () => {},
    onMiss: () => {},
    onDamage: () => {},
  });

  const [difficulty, setDifficultyState] = useState<Difficulty>("easy");
  const [hintsLeft, setHintsLeft] = useState(0);
  const [hintOut, setHintOut] = useState<number[] | null>(null);
  const hintUsedRef = useRef(false);
  // Otázky, u kterých hráč chyboval: na konci se ukážou k zopakování a jde je procvičit.
  const [mistakes, setMistakes] = useState<GameQuestion[]>([]);
  const [asked, setAsked] = useState(0);
  const [run, setRun] = useState<GameQuestion[]>([]);
  const [phase, setPhase] = useState<Phase>("intro");
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(DIFFICULTIES.easy.lives);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const answersRef = useRef<{ id: string; correct: boolean }[]>([]);
  const [coins, setCoins] = useState(0);
  const [upgrades, setUpgrades] = useState<Upgrades>(EMPTY_UPGRADES);
  const [resolved, setResolved] = useState<Resolved | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [xpGained, setXpGained] = useState(0);
  const [muted, setMutedState] = useState(false);
  const [paused, setPaused] = useState(false);
  const [autoElapsed, setAutoElapsed] = useState(0);
  const autoElapsedRef = useRef(0);
  const pauseToggleRef = useRef<() => void>(() => {});
  const pausedRef = useRef(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setMutedState(isMuted());
    try {
      const d = localStorage.getItem(DIFFICULTY_KEY);
      if (d === "easy" || d === "normal" || d === "hard") setDifficultyState(d);
    } catch {
      // bez uložené obtížnosti zůstane snadná
    }
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw);
        if (typeof saved.coins === "number") setCoins(saved.coins);
        if (saved.upgrades) setUpgrades({ ...EMPTY_UPGRADES, ...saved.upgrades });
      }
    } catch {
      // localStorage unavailable or corrupted — start fresh.
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [storageKey]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const callbacks = {
      onHit: (_i: number, correct: boolean) => handlersRef.current.onHit(correct),
      onMiss: () => handlersRef.current.onMiss(),
      onDamage: () => handlersRef.current.onDamage(),
    };
    const engine: QuizEngine =
      game === "super-mario"
        ? new MarioEngine(canvas, callbacks)
        : game === "pac-man"
          ? new PacmanEngine(canvas, callbacks)
          : game === "snake"
            ? new SnakeEngine(canvas, callbacks)
            : game === "breakout"
              ? new BreakoutEngine(canvas, callbacks)
              : game === "tetris"
                ? new TetrisEngine(canvas, callbacks)
                : game === "kong"
                  ? new KongEngine(canvas, callbacks)
                  : game === "stonozka"
                    ? new CentipedeEngine(canvas, callbacks)
                    : game === "flappy"
                      ? new FlappyEngine(canvas, callbacks)
                      : game === "mole"
                        ? new MoleEngine(canvas, callbacks)
                        : game === "ninja"
                          ? new NinjaEngine(canvas, callbacks)
                          : new SpaceEngine(canvas, callbacks);
    engineRef.current = engine;
    // Testovací háček: automatické testy (umime-art/../tests) si přes něj vezmou engine.
    if ((window as unknown as { __QUIZ_TEST__?: boolean }).__QUIZ_TEST__) (window as unknown as { __quizEngine?: QuizEngine }).__quizEngine = engine;
    engine.loadQuestion(["Ahoj", "Hello", "Hallo", "Привет"], 0, { fireCooldown: BASE_FIRE_COOLDOWN, alienSpeedFactor: 1 });
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [game]);

  function persist(nextCoins: number, nextUpgrades: Upgrades) {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ coins: nextCoins, upgrades: nextUpgrades }));
    } catch {
      // ignore
    }
  }

  function setDifficulty(d: Difficulty) {
    setDifficultyState(d);
    try {
      localStorage.setItem(DIFFICULTY_KEY, d);
    } catch {
      // ignore
    }
  }

  function useHint() {
    const q = run[qIndex];
    if (phase !== "playing" || paused || !q || hintsLeft <= 0 || hintOut) return;
    const wrong = [0, 1, 2, 3].filter((i) => i !== q.correctIndex && i < q.options.length);
    const out = shuffle(wrong).slice(0, 2);
    hintUsedRef.current = true;
    setHintOut(out);
    setHintsLeft((n) => n - 1);
    engineRef.current?.setHint?.(out);
    sfx("pickup");
  }

  function loadQuestion(q: GameQuestion, index: number, total: number) {
    hintUsedRef.current = false;
    setHintOut(null);
    engineRef.current?.loadQuestion(
      q.options,
      q.correctIndex,
      {
        fireCooldown: BASE_FIRE_COOLDOWN * (1 - 0.2 * upgrades.fire),
        alienSpeedFactor: (1 - 0.15 * upgrades.slow) * DIFFICULTIES[difficulty].speed,
        timeFactor: DIFFICULTIES[difficulty].time,
        round: index,
        boss: total >= 4 && index === total - 1,
      },
      mario ? q.prompt : undefined,
    );
  }

  // Chybná otázka se na konci kola ještě jednou objeví (nejvýš dvakrát za kolo): opakování učí.
  const repeatsLeftRef = useRef(0);
  function noteMistake(q: GameQuestion | undefined) {
    if (!q || mistakes.some((m) => m.prompt === q.prompt)) return;
    setMistakes((list) => (list.some((m) => m.prompt === q.prompt) ? list : [...list, q]));
    if (!endless && repeatsLeftRef.current > 0) {
      repeatsLeftRef.current -= 1;
      const again = prepareRun([q], 1)[0];
      setRun((r) => [...r, again]);
      setToast(t.repeatLater);
      window.setTimeout(() => setToast((m) => (m === t.repeatLater ? null : m)), 3500);
    }
  }

  function startRun(only?: GameQuestion[]) {
    setToast(null);
    unlockAudio();
    const pool = only && only.length > 0 ? only : source;
    const newRun = endless
      ? Array.from({ length: 6 }, () => prepareRun(pool, pool.length)).flat()
      : prepareRun(pool, Math.min(QUESTIONS_PER_RUN, pool.length));
    setMistakes([]);
    setAsked(0);
    repeatsLeftRef.current = 2;
    setRun(newRun);
    setScore(0);
    setLives(DIFFICULTIES[difficulty].lives + upgrades.life);
    setHintsLeft(DIFFICULTIES[difficulty].hints);
    setCombo(0);
    setBestCombo(0);
    answersRef.current = [];
    setQIndex(0);
    setResolved(null);
    setFlash(null);
    setCompleted(false);
    setXpGained(0);
    loadQuestion(newRun[0], 0, newRun.length);
    engineRef.current?.setRunning(true);
    setPaused(false);
    setPhase("playing");
  }

  async function claimXp(amount: number) {
    if (amount <= 0) return;
    try {
      const res = await fetch("/api/xp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "game", amount }),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.gained > 0) setXpGained(data.gained);
    } catch {
      // not logged in or offline: XP is simply not awarded
    }
  }

  function recordAnswer(id: string | undefined, correct: boolean) {
    if (id) answersRef.current.push({ id, correct });
  }

  // Chyby z kola se zapíšou do opakování (hostům se nic neuloží).
  function reportAnswers() {
    if (answersRef.current.length === 0) return;
    fetch("/api/opakovani", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ results: answersRef.current }),
    }).catch(() => {});
    answersRef.current = [];
  }

  function finishRun(survived: boolean) {
    reportAnswers();
    engineRef.current?.loadQuestion([], 0, { fireCooldown: BASE_FIRE_COOLDOWN, alienSpeedFactor: 1 });
    sfx(survived ? "win" : "lose");
    const comboBonus = bestCombo > 1 ? bestCombo * 3 : 0;
    const nextCoins = coins + score + comboBonus;
    setCoins(nextCoins);
    persist(nextCoins, upgrades);
    claimXp(score + comboBonus);
    setCompleted(survived);
    setPhase("result");
  }

  function nextStep() {
    const last = qIndex + 1 >= run.length;
    if (lives <= 0 || last) {
      finishRun(lives > 0);
      return;
    }
    const next = qIndex + 1;
    setQIndex(next);
    setResolved(null);
    loadQuestion(run[next], next, run.length);
    engineRef.current?.setRunning(true);
    setPaused(false);
    setPhase("playing");
  }

  function enterExplain() {
    explainSinceRef.current = Date.now();
    autoElapsedRef.current = 0;
    setAutoElapsed(0);
    setPhase("explain");
  }

  function pauseGame() {
    if (phase === "playing") engineRef.current?.setRunning(false);
    setPaused(true);
  }

  function resumeGame() {
    if (phase === "playing") engineRef.current?.setRunning(true);
    setPaused(false);
  }

  function endRunEarly() {
    setPaused(false);
    finishRun(false);
  }

  function buy(key: UpgradeKey) {
    const level = upgrades[key];
    if (level >= MAX_UPGRADE_LEVEL) return;
    const cost = COSTS[key][level];
    if (coins < cost) return;
    const nextUpgrades = { ...upgrades, [key]: level + 1 };
    const nextCoins = coins - cost;
    setUpgrades(nextUpgrades);
    setCoins(nextCoins);
    persist(nextCoins, nextUpgrades);
  }

  useEffect(() => {
    nextStepRef.current = nextStep;
    pauseToggleRef.current = () => (paused ? resumeGame() : pauseGame());
    pausedRef.current = paused;
    handlersRef.current = {
      onHit: (correct) => {
        recordAnswer(run[qIndex]?.id, correct);
        const earn = () => Math.max(1, Math.round((10 + Math.min(combo, 4) * 5) * DIFFICULTIES[difficulty].mult * (hintUsedRef.current ? 0.5 : 1)));
        if (correct && endless) {
          // Nekonečná hra se nezastavuje: krátká zpráva s vysvětlením a hned další otázka.
          const pts = earn();
          setAsked((n) => n + 1);
          setScore((s) => s + pts);
          setCombo((c) => c + 1);
          setBestCombo((b) => Math.max(b, combo + 1));
          engineRef.current?.popText(combo > 0 ? `+${pts}  🔥×${combo + 1}` : `+${pts}`, "#7ee0b0");
          const q = run[qIndex];
          setToast(`${t.correct} +${pts} · ${q.options[q.correctIndex]} – ${q.explanation}`);
          window.setTimeout(() => setToast(null), 5000);
          window.setTimeout(() => nextStepRef.current(), 700);
          return;
        }
        if (correct) {
          const pts = earn();
          setAsked((n) => n + 1);
          setScore((s) => s + pts);
          setCombo((c) => c + 1);
          setBestCombo((b) => Math.max(b, combo + 1));
          setResolved({ kind: "correct", pts });
          engineRef.current?.popText(combo > 0 ? `+${pts}  🔥×${combo + 1}` : `+${pts}`, "#7ee0b0");
          enterExplain();
          return;
        }
        noteMistake(run[qIndex]);
        const remaining = lives - 1;
        setLives(remaining);
        setCombo(0);
        if (remaining <= 0) {
          engineRef.current?.setRunning(false);
          setAsked((n) => n + 1);
          setResolved({ kind: "wrong" });
          enterExplain();
        } else {
          setFlash(t.wrongLostLife);
          window.setTimeout(() => setFlash(null), 1200);
        }
      },
      onMiss: () => {
        recordAnswer(run[qIndex]?.id, false);
        noteMistake(run[qIndex]);
        setAsked((n) => n + 1);
        if (endless && lives - 1 > 0) {
          setLives(lives - 1);
          setCombo(0);
          const q = run[qIndex];
          setToast(`${t.missed} ${q.options[q.correctIndex]} – ${q.explanation}`);
          window.setTimeout(() => setToast(null), 5000);
          window.setTimeout(() => nextStepRef.current(), 400);
          return;
        }
        setLives(lives - 1);
        setCombo(0);
        setResolved({ kind: "missed" });
        enterExplain();
      },
      onDamage: () => {
        const remaining = lives - 1;
        setLives(remaining);
        setCombo(0);
        if (remaining <= 0) {
          engineRef.current?.setRunning(false);
          setResolved({ kind: "wrong" });
          enterExplain();
        } else {
          setFlash(t.damage);
          window.setTimeout(() => setFlash(null), 1200);
        }
      },
    };
  });

  useEffect(() => {
    if (phase !== "explain" || paused) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || (e.code !== "Space" && e.code !== "Enter")) return;
      if (Date.now() - explainSinceRef.current < 500) return;
      e.preventDefault();
      nextStepRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, paused]);

  // Space Invaders jede po sobě: po vysvětlení se sama načte další otázka,
  // dokud hráč hru nepozastaví. U posledního kola nebo po prohře se nepokračuje.
  useEffect(() => {
    if (mario || phase !== "explain" || paused || !resolved) return;
    if (lives <= 0 || qIndex + 1 >= run.length) return;
    const delay = resolved.kind === "correct" ? AUTO_CONTINUE_MS.correct : AUTO_CONTINUE_MS.other;
    const id = window.setInterval(() => {
      autoElapsedRef.current += 100;
      setAutoElapsed(autoElapsedRef.current);
      if (autoElapsedRef.current >= delay) {
        window.clearInterval(id);
        nextStepRef.current();
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [mario, phase, paused, resolved, lives, qIndex, run.length]);

  // Pauza klávesou P nebo Esc a automaticky, když hráč přepne na jinou záložku.
  useEffect(() => {
    if (phase !== "playing" && phase !== "explain") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || (e.code !== "KeyP" && e.code !== "Escape")) return;
      e.preventDefault();
      pauseToggleRef.current();
    };
    const onVisibility = () => {
      if (document.hidden && !pausedRef.current) pauseToggleRef.current();
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [phase]);

  const question = run[qIndex];
  const showExplanation = phase === "explain" && question && resolved;
  const lastQuestion = qIndex + 1 >= run.length;
  const autoContinuing = !mario && lives > 0 && !lastQuestion;
  const autoDelay = resolved?.kind === "correct" ? AUTO_CONTINUE_MS.correct : AUTO_CONTINUE_MS.other;

  function setHeld(key: HeldKey, down: boolean) {
    engineRef.current?.setInput({ [key]: down });
  }

  return (
    <div className="fs-game card flex flex-col gap-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="fs-title">
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
            {mario ? "🍄" : emoji} {t.title}
          </h1>
          <p className="text-sm text-[var(--muted)]">{courseTitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
          <button
            type="button"
            onClick={() => {
              const next = !muted;
              setMuted(next);
              setMutedState(next);
              unlockAudio();
            }}
            aria-pressed={!muted}
            aria-label={t.sound}
            title={t.sound}
            className="pill bg-[var(--surface-muted)] px-3 py-1.5"
          >
            {muted ? "🔇" : "🔊"}
          </button>
          {phase !== "intro" && (
            <>
            <span className="pill bg-[var(--surface-muted)] px-3 py-1.5">
              {t.question} {Math.min(qIndex + 1, run.length)}
              {endless ? "" : `/${run.length}`}
            </span>
            <span className="pill bg-[var(--surface-muted)] px-3 py-1.5">
              {t.lives}: {"❤️".repeat(Math.max(lives, 0)) || "💀"}
            </span>
            <span className="pill bg-[var(--surface-muted)] px-3 py-1.5">
              {t.score}: {score}
            </span>
            {combo > 1 && (
              <span className="pill bg-[var(--accent-yellow)] px-3 py-1.5 text-black">
                🔥 {t.combo} ×{combo}
              </span>
            )}
            {phase === "playing" && (
              <button
                type="button"
                onClick={useHint}
                disabled={hintsLeft <= 0 || !!hintOut || paused}
                title={t.hintUsed}
                className="btn-bouncy rounded-full border-2 border-[var(--border-soft)] bg-[var(--surface)] px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t.hint} · {hintsLeft}
              </button>
            )}
            </>
          )}
        </div>
      </div>

      {(phase === "playing" || phase === "explain") && question && !mario && (
        <p className="rounded-xl bg-[var(--brand-50)] px-4 py-3 text-lg font-bold text-[var(--brand-700)]">
          {question.prompt}
        </p>
      )}

      {phase === "playing" && qIndex === 0 && !paused && (
        <p className="fs-tip rounded-xl bg-[var(--surface-muted)] px-4 py-2 text-xs text-[var(--muted)]">⌨️ {t.controls}</p>
      )}

      {phase === "playing" && hintOut && question && (
        <p className="rounded-xl bg-[var(--accent-yellow)] px-4 py-2 text-sm font-semibold text-[#16132b]">
          💡 {t.hintText.replace("{a}", `„${question.options[hintOut[0]]}“`).replace("{b}", `„${question.options[hintOut[1]]}“`)}
        </p>
      )}

      <div className="fs-stage relative overflow-hidden rounded-2xl border-2 border-[var(--border-soft)]">
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className="block h-auto w-full"
          style={{ aspectRatio: `${GAME_WIDTH} / ${GAME_HEIGHT}`, touchAction: "none" }}
        />
        {toast && !flash && (
          <div className="pointer-events-none absolute inset-x-2 bottom-2 flex justify-center">
            <span className="rounded-xl bg-[color-mix(in_srgb,var(--accent-green)_85%,black)] px-3 py-2 text-center text-xs font-semibold text-white shadow-lg">
              {toast}
            </span>
          </div>
        )}
        {flash && (
          <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center">
            <span className="pill bg-[var(--danger)] px-4 py-2 text-sm text-white">{flash}</span>
          </div>
        )}
        {phase === "playing" && !paused && (
          <button
            type="button"
            onClick={pauseGame}
            aria-label={t.pause}
            title={`${t.pause} (P)`}
            className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white/30 bg-black/45 text-sm text-white hover:bg-black/65"
          >
            ⏸
          </button>
        )}
        {paused && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/65 backdrop-blur-sm">
            <p className="text-2xl font-extrabold text-white" style={{ fontFamily: "var(--font-heading)" }}>
              ⏸ {t.paused}
            </p>
            <button
              type="button"
              onClick={resumeGame}
              autoFocus
              className="btn-bouncy bg-[var(--brand-500)] px-6 py-2.5 text-sm font-bold text-white"
            >
              ▶ {t.resume}
            </button>
            <button
              type="button"
              onClick={endRunEarly}
              className="text-sm font-semibold text-white/80 underline hover:text-white"
            >
              {t.endRun}
            </button>
          </div>
        )}
      </div>

      {phase === "intro" && (
        <div className="fs-panel flex flex-col gap-4">
          <p className="text-sm text-[var(--muted)]">{t.intro}</p>
          <p className="text-xs text-[var(--faint)]">⌨️ {t.controls}</p>
          {game === "space-invaders" && <p className="text-xs text-[var(--faint)]">💡 {t.tipDodge}</p>}
          <DifficultyPicker t={t} value={difficulty} onChange={setDifficulty} />
          <UpgradeShop t={t} coins={coins} upgrades={upgrades} onBuy={buy} />
          <button
            onClick={() => startRun()}
            className="fs-start btn-bouncy self-start rounded-full bg-[var(--brand-500)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--brand-600)]"
          >
            {t.start}
          </button>
          {!hasCourseQuestions && <p className="text-xs text-[var(--faint)]">{t.demoNote}</p>}
        </div>
      )}

      {phase === "playing" && pad && (
        <div className="fs-pad flex items-center justify-center gap-3">
          {pad.keys.includes("left") && (
            <HoldButton
              onHold={(down) => setHeld("left", down)}
              label="←"
              className="btn-bouncy h-14 w-16 select-none rounded-2xl bg-[var(--surface-muted)] text-2xl"
            >
              ◀
            </HoldButton>
          )}
          {(pad.keys.includes("up") || pad.keys.includes("down")) && (
            <div className="flex flex-col gap-2">
              {pad.keys.includes("up") && (
                <HoldButton
                  onHold={(down) => setHeld("up", down)}
                  label="↑"
                  className="btn-bouncy h-12 w-16 select-none rounded-2xl bg-[var(--surface-muted)] text-xl"
                >
                  {pad.up ?? "▲"}
                </HoldButton>
              )}
              {pad.keys.includes("down") && (
                <HoldButton
                  onHold={(down) => setHeld("down", down)}
                  label="↓"
                  className="btn-bouncy h-12 w-16 select-none rounded-2xl bg-[var(--surface-muted)] text-xl"
                >
                  {pad.down ?? "▼"}
                </HoldButton>
              )}
            </div>
          )}
          {pad.keys.includes("right") && (
            <HoldButton
              onHold={(down) => setHeld("right", down)}
              label="→"
              className="btn-bouncy h-14 w-16 select-none rounded-2xl bg-[var(--surface-muted)] text-2xl"
            >
              ▶
            </HoldButton>
          )}
          {pad.keys.includes("fire") && (
            <HoldButton
              onHold={(down) => setHeld("fire", down)}
              className="btn-bouncy h-14 flex-1 select-none rounded-2xl bg-[var(--accent-500)] text-sm font-bold text-white sm:max-w-xs"
            >
              {emoji} {t.fire}
            </HoldButton>
          )}
        </div>
      )}

      {phase === "playing" && !pad && (
        <div className="fs-pad flex items-center justify-center gap-3">
          <HoldButton
            onHold={(down) => setHeld("left", down)}
            label="←"
            className="btn-bouncy h-14 w-20 select-none rounded-2xl bg-[var(--surface-muted)] text-2xl"
          >
            ◀
          </HoldButton>
          <HoldButton
            onHold={(down) => setHeld("fire", down)}
            className="btn-bouncy h-14 flex-1 select-none rounded-2xl bg-[var(--accent-500)] text-sm font-bold text-white sm:max-w-xs"
          >
            {mario ? "🦘" : "🔫"} {t.fire}
          </HoldButton>
          <HoldButton
            onHold={(down) => setHeld("right", down)}
            label="→"
            className="btn-bouncy h-14 w-20 select-none rounded-2xl bg-[var(--surface-muted)] text-2xl"
          >
            ▶
          </HoldButton>
        </div>
      )}

      {showExplanation && (
        <div className="fs-panel flex flex-col gap-3">
          <p
            className={`pill self-start px-3 py-1.5 text-sm font-semibold ${
              resolved.kind === "correct"
                ? "bg-[color-mix(in_srgb,var(--accent-green)_20%,var(--surface))] text-[var(--foreground)]"
                : "bg-[color-mix(in_srgb,var(--danger)_18%,var(--surface))] text-[var(--foreground)]"
            }`}
          >
            {resolved.kind === "correct"
              ? `${t.correct} +${resolved.pts}`
              : resolved.kind === "missed"
                ? t.missed
                : t.wrong}
          </p>
          <div className="rounded-xl bg-[var(--surface-muted)] p-4 text-sm">
            <p className="mb-1 font-semibold">
              💡 {t.whyCorrect}: <span className="text-[var(--brand-600)]">{question.options[question.correctIndex]}</span>
            </p>
            <p className="text-[var(--muted)]">{question.explanation}</p>
          </div>
          {autoContinuing && (
            <div
              className="h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(100 - (autoElapsed / autoDelay) * 100)}
            >
              <div
                className="h-full bg-[var(--brand-500)]"
                style={{ width: `${Math.max(0, 100 - (autoElapsed / autoDelay) * 100)}%`, transition: "width 0.1s linear" }}
              />
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={nextStep}
              className="btn-bouncy rounded-full bg-[var(--brand-500)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-600)]"
            >
              {lives <= 0 || lastQuestion ? t.finish : t.next}
            </button>
            {autoContinuing && (
              <button
                type="button"
                onClick={paused ? resumeGame : pauseGame}
                className="btn-bouncy bg-[var(--surface)] px-5 py-2.5 text-sm font-semibold"
              >
                {paused ? `▶ ${t.resume}` : `⏸ ${t.pause}`}
              </button>
            )}
          </div>
          <p className="text-xs text-[var(--faint)]">
            ⎵ {t.pressSpace}
            {autoContinuing ? ` · ${t.autoContinue}` : ""}
          </p>
        </div>
      )}

      {phase === "result" && (
        <div className="fs-panel flex flex-col gap-4">
          <p className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
            {completed ? t.runComplete : `${t.gameOver} 💥`}
          </p>
          <p className="text-sm">
            {t.earned}: <span className="font-bold text-[var(--brand-600)]">+{score}</span>
            {bestCombo > 1 && (
              <span className="ml-3 font-bold">
                🔥 {t.combo} ×{bestCombo} (+{bestCombo * 3})
              </span>
            )}
          </p>
          {xpGained > 0 && (
            <p className="pill self-start bg-[var(--accent-yellow)] px-3 py-1.5 text-sm text-[#16132b]">
              +{xpGained} XP
            </p>
          )}
          <DailyRecap locale={locale} refreshKey={xpGained} />
          {asked > 0 && (
            <p className="text-sm font-semibold">
              {t.summary.replace("{a}", String(Math.max(0, asked - mistakes.length))).replace("{b}", String(asked))}
              {mistakes.length === 0 && ` · ${t.noMistakes}`}
            </p>
          )}
          {mistakes.length > 0 && (
            <div className="flex flex-col gap-2 rounded-xl bg-[var(--surface-muted)] p-4 text-sm">
              <p className="font-semibold">📚 {t.reviewTitle}</p>
              <ul className="flex flex-col gap-2">
                {mistakes.map((m) => (
                  <li key={m.prompt} className="rounded-lg bg-[var(--surface)] p-3">
                    <p className="font-semibold">{m.prompt}</p>
                    <p className="text-[var(--brand-600)]">✓ {m.options[m.correctIndex]}</p>
                    <p className="text-xs text-[var(--muted)]">{m.explanation}</p>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => startRun(mistakes)}
                className="btn-bouncy self-start rounded-full bg-[var(--accent-500)] px-5 py-2 text-sm font-semibold text-white"
              >
                🔁 {t.practiceMistakes} ({mistakes.length})
              </button>
            </div>
          )}
          <DifficultyPicker t={t} value={difficulty} onChange={setDifficulty} />
          <UpgradeShop t={t} coins={coins} upgrades={upgrades} onBuy={buy} />
          <p className="text-xs text-[var(--faint)]">🏆 {t.completionBonus}</p>
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => startRun()}
              className="btn-bouncy rounded-full bg-[var(--brand-500)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--brand-600)]"
            >
              {t.again}
            </button>
            <Link href={backHref} className="text-sm font-semibold text-[var(--brand-600)] hover:underline">
              {t.backToCourse}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
