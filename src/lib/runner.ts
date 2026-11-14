import type { GameQuestion } from "@/i18n/game";
import { starsFor } from "./game-best";

// Matematický běh: 3 dráhy, na každé řadě tři brány s odpověďmi, na konci boss s otázkami.
// Čistá logika (bez prohlížeče), aby šla otestovat.

export const RUNNER_LANES = [-2.3, 0, 2.3] as const;
export const RUNNER_START_CREW = 5;
export const RUNNER_GATE_GAIN = 4; // správná brána přidá do party
export const RUNNER_GATE_LOSS = 3; // špatná brána ubere
export const RUNNER_BOSS_HITS = 3; // správné odpovědi, které bosse porazí
export const RUNNER_BOSS_LOSS = 4; // špatná odpověď na bosse ubere

export type RunnerGate = { label: string; correct: boolean };
export type RunnerRow = { id?: string; prompt: string; gates: [RunnerGate, RunnerGate, RunnerGate]; correctLabel: string; explanation: string };
export type RunnerBossQuestion = { id?: string; prompt: string; options: [string, string, string, string]; correctIndex: number; explanation: string };
export type RunnerPlan = { rows: RunnerRow[]; boss: RunnerBossQuestion[] };

type Rng = () => number;

function shuffleWith<T>(items: readonly T[], rng: Rng): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Hra je pro všechny předměty, ale jen pro nejnižší dvě obtížnosti.
// U těžších kurzů hráč nestíhá rozhodnout správnou odpověď, takže se nenabízí.
export function runnerAllowed(difficulty: number): boolean {
  return difficulty <= 2;
}

// Hra potřebuje aspoň pár otázek, jinak by se odpovědi opakovaly moc brzy.
export function runnerPlayable(questions: GameQuestion[]): boolean {
  return questions.filter((q) => q.options.length === 4 && q.correctIndex >= 0 && q.correctIndex < 4).length >= 6;
}

// Z otázek kurzu složí řady bran (správná odpověď + dvě chybné) a otázky na bosse.
export function buildRunnerPlan(questions: GameQuestion[], rowCount: number, rng: Rng = Math.random): RunnerPlan | null {
  const pool = shuffleWith(
    questions.filter((q) => q.options.length === 4 && q.correctIndex >= 0 && q.correctIndex < 4),
    rng,
  );
  if (pool.length === 0) return null;
  const pick = (i: number) => pool[i % pool.length];

  const rows: RunnerRow[] = [];
  for (let i = 0; i < rowCount; i++) {
    const q = pick(i);
    const correctLabel = q.options[q.correctIndex];
    const wrong = shuffleWith(
      q.options.filter((_, k) => k !== q.correctIndex),
      rng,
    ).slice(0, 2);
    const gates = shuffleWith(
      [{ label: correctLabel, correct: true }, ...wrong.map((label) => ({ label, correct: false }))],
      rng,
    ) as [RunnerGate, RunnerGate, RunnerGate];
    rows.push({ id: q.id, prompt: q.prompt, gates, correctLabel, explanation: q.explanation });
  }

  // Bosse dostane víc otázek, než je nutné, aby se při špatných odpovědích nedošlo na konec balíčku.
  const boss: RunnerBossQuestion[] = [];
  for (let k = 0; k < RUNNER_BOSS_HITS * 4; k++) {
    const q = pick(rowCount + k);
    const order = shuffleWith([0, 1, 2, 3], rng);
    boss.push({
      id: q.id,
      prompt: q.prompt,
      options: order.map((i) => q.options[i]) as [string, string, string, string],
      correctIndex: order.indexOf(q.correctIndex),
      explanation: q.explanation,
    });
  }
  return { rows, boss };
}

// Stav party po průchodu bránou.
export function gateOutcome(crew: number, correct: boolean): number {
  return correct ? crew + RUNNER_GATE_GAIN : Math.max(0, crew - RUNNER_GATE_LOSS);
}

// Stav party po odpovědi na bosse.
export function bossOutcome(crew: number, correct: boolean): number {
  return correct ? crew : Math.max(0, crew - RUNNER_BOSS_LOSS);
}

export function runnerStars(right: number, total: number): 0 | 1 | 2 | 3 {
  return starsFor(right, total);
}
