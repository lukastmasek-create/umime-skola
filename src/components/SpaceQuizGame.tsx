"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SpaceEngine, GAME_HEIGHT, GAME_WIDTH } from "@/lib/space-engine";
import { getGameText, type GameQuestion, type GameText } from "@/i18n/game";
import type { Locale } from "@/i18n/config";

type Phase = "intro" | "playing" | "explain" | "result";
type UpgradeKey = "fire" | "life" | "slow";
type Upgrades = Record<UpgradeKey, number>;
type Resolved = { kind: "correct" | "wrong" | "missed"; pts?: number };

const QUESTIONS_PER_RUN = 5;
const BASE_LIVES = 3;
const MAX_UPGRADE_LEVEL = 3;
const COSTS: Record<UpgradeKey, number[]> = {
  fire: [50, 100, 200],
  life: [80, 160, 320],
  slow: [60, 120, 240],
};
const UPGRADE_ICONS: Record<UpgradeKey, string> = { fire: "⚡", life: "❤️", slow: "🐌" };
const EMPTY_UPGRADES: Upgrades = { fire: 0, life: 0, slow: 0 };

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function prepareRun(questions: GameQuestion[]): GameQuestion[] {
  return shuffle(questions)
    .slice(0, QUESTIONS_PER_RUN)
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
              <p className="mb-2 text-xs text-[var(--foreground)]/60">
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
}: {
  locale: Locale;
  courseSlug: string;
  courseTitle: string;
  backHref: string;
}) {
  const t = getGameText(locale);
  const storageKey = `game:${courseSlug}`;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<SpaceEngine | null>(null);
  const handlersRef = useRef<{ onHit: (c: boolean) => void; onMiss: () => void }>({
    onHit: () => {},
    onMiss: () => {},
  });

  const [run, setRun] = useState<GameQuestion[]>([]);
  const [phase, setPhase] = useState<Phase>("intro");
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(BASE_LIVES);
  const [combo, setCombo] = useState(0);
  const [coins, setCoins] = useState(0);
  const [upgrades, setUpgrades] = useState<Upgrades>(EMPTY_UPGRADES);
  const [resolved, setResolved] = useState<Resolved | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
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
    const engine = new SpaceEngine(canvas, {
      onHit: (_i, correct) => handlersRef.current.onHit(correct),
      onMiss: () => handlersRef.current.onMiss(),
    });
    engineRef.current = engine;
    engine.loadQuestion(["Ahoj", "Hello", "Hallo", "Привет"], 0, { fireCooldown: 0.6, alienSpeedFactor: 1 });
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  function persist(nextCoins: number, nextUpgrades: Upgrades) {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ coins: nextCoins, upgrades: nextUpgrades }));
    } catch {
      // ignore
    }
  }

  function loadQuestion(q: GameQuestion) {
    engineRef.current?.loadQuestion(q.options, q.correctIndex, {
      fireCooldown: 0.6 * (1 - 0.2 * upgrades.fire),
      alienSpeedFactor: 1 - 0.15 * upgrades.slow,
    });
  }

  function startRun() {
    const newRun = prepareRun(t.questions);
    setRun(newRun);
    setScore(0);
    setLives(BASE_LIVES + upgrades.life);
    setCombo(0);
    setQIndex(0);
    setResolved(null);
    setFlash(null);
    setCompleted(false);
    loadQuestion(newRun[0]);
    engineRef.current?.setRunning(true);
    setPhase("playing");
  }

  function finishRun(survived: boolean) {
    engineRef.current?.loadQuestion([], 0, { fireCooldown: 0.6, alienSpeedFactor: 1 });
    const nextCoins = coins + score;
    setCoins(nextCoins);
    persist(nextCoins, upgrades);
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
    loadQuestion(run[next]);
    engineRef.current?.setRunning(true);
    setPhase("playing");
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
    handlersRef.current = {
      onHit: (correct) => {
        if (correct) {
          const pts = 10 + Math.min(combo, 4) * 5;
          setScore((s) => s + pts);
          setCombo((c) => c + 1);
          setResolved({ kind: "correct", pts });
          setPhase("explain");
          return;
        }
        const remaining = lives - 1;
        setLives(remaining);
        setCombo(0);
        if (remaining <= 0) {
          engineRef.current?.setRunning(false);
          setResolved({ kind: "wrong" });
          setPhase("explain");
        } else {
          setFlash(t.wrongLostLife);
          window.setTimeout(() => setFlash(null), 1200);
        }
      },
      onMiss: () => {
        setLives(lives - 1);
        setCombo(0);
        setResolved({ kind: "missed" });
        setPhase("explain");
      },
    };
  });

  const question = run[qIndex];
  const showExplanation = phase === "explain" && question && resolved;
  const lastQuestion = qIndex + 1 >= run.length;

  function setHeld(key: "left" | "right" | "fire", down: boolean) {
    engineRef.current?.setInput({ [key]: down });
  }

  return (
    <div className="card flex flex-col gap-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
            🚀 {t.title}
          </h1>
          <p className="text-sm text-[var(--foreground)]/60">{courseTitle}</p>
        </div>
        {phase !== "intro" && (
          <div className="flex flex-wrap gap-2 text-sm font-semibold">
            <span className="pill bg-[var(--surface-muted)] px-3 py-1.5">
              {t.question} {Math.min(qIndex + 1, QUESTIONS_PER_RUN)}/{QUESTIONS_PER_RUN}
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
          </div>
        )}
      </div>

      {(phase === "playing" || phase === "explain") && question && (
        <p className="rounded-xl bg-[var(--brand-50)] px-4 py-3 text-lg font-bold text-[var(--brand-700)]">
          {question.prompt}
        </p>
      )}

      <div className="relative overflow-hidden rounded-2xl border-2 border-[var(--border-soft)]">
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className="block h-auto w-full"
          style={{ aspectRatio: `${GAME_WIDTH} / ${GAME_HEIGHT}`, touchAction: "none" }}
        />
        {flash && (
          <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center">
            <span className="pill bg-[var(--danger)] px-4 py-2 text-sm text-white">{flash}</span>
          </div>
        )}
      </div>

      {phase === "intro" && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-[var(--foreground)]/70">{t.intro}</p>
          <p className="text-xs text-[var(--foreground)]/50">⌨️ {t.controls}</p>
          <UpgradeShop t={t} coins={coins} upgrades={upgrades} onBuy={buy} />
          <button
            onClick={startRun}
            className="btn-bouncy self-start rounded-full bg-[var(--brand-500)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--brand-600)]"
          >
            {t.start}
          </button>
          <p className="text-xs text-[var(--foreground)]/40">{t.demoNote}</p>
        </div>
      )}

      {phase === "playing" && (
        <div className="flex items-center justify-center gap-3">
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
            🔫 {t.fire}
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
        <div className="flex flex-col gap-3">
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
            <p className="text-[var(--foreground)]/70">{question.explanation}</p>
          </div>
          <button
            onClick={nextStep}
            className="btn-bouncy self-start rounded-full bg-[var(--brand-500)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-600)]"
          >
            {lives <= 0 || lastQuestion ? t.finish : t.next}
          </button>
        </div>
      )}

      {phase === "result" && (
        <div className="flex flex-col gap-4">
          <p className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
            {completed ? t.runComplete : `${t.gameOver} 💥`}
          </p>
          <p className="text-sm">
            {t.earned}: <span className="font-bold text-[var(--brand-600)]">+{score}</span>
          </p>
          <UpgradeShop t={t} coins={coins} upgrades={upgrades} onBuy={buy} />
          <p className="text-xs text-[var(--foreground)]/50">🏆 {t.completionBonus}</p>
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={startRun}
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
