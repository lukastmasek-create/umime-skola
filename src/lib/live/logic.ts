import type { ChestOutcome, LiveMode, LiveQuestion, SetQuestion, LiveSettings, LiveStatus, StoredStatus } from "./types";

export const MODES: LiveMode[] = ["QUIZ", "RACE", "GOLD", "STREAK", "SURVIVAL", "TEAMS"];

/** Režimy, kde hru řídí učitel otázku po otázce (všichni hrají tu samou naráz). */
export function isSyncMode(mode: LiveMode): boolean {
  return mode === "QUIZ" || mode === "SURVIVAL" || mode === "TEAMS";
}

export const DEFAULT_SETTINGS: LiveSettings = { seconds: 20, raceTarget: 10, durationMin: 5, lives: 3 };

export const LIMITS = {
  seconds: [5, 120],
  raceTarget: [3, 50],
  durationMin: [1, 30],
  lives: [1, 5],
  questions: [1, 100],
  name: 16,
  title: 80,
} as const;


export function clamp(n: number, [min, max]: readonly [number, number] | readonly number[]): number {
  return Math.max(min, Math.min(max, Math.round(n)));
}

export function cleanSettings(raw: unknown): LiveSettings {
  const r = (raw && typeof raw === "object" ? raw : {}) as Partial<Record<keyof LiveSettings, unknown>>;
  const num = (v: unknown, fallback: number) => (typeof v === "number" && Number.isFinite(v) ? v : fallback);
  return {
    seconds: clamp(num(r.seconds, DEFAULT_SETTINGS.seconds), LIMITS.seconds),
    raceTarget: clamp(num(r.raceTarget, DEFAULT_SETTINGS.raceTarget), LIMITS.raceTarget),
    durationMin: clamp(num(r.durationMin, DEFAULT_SETTINGS.durationMin), LIMITS.durationMin),
    lives: clamp(num(r.lives, DEFAULT_SETTINGS.lives), LIMITS.lives),
  };
}

export function cleanName(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw.replace(/\s+/g, " ").replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, LIMITS.name);
}

export function cleanQuestion(raw: unknown): LiveQuestion | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const prompt = typeof r.prompt === "string" ? r.prompt.trim().slice(0, 300) : "";
  const options = Array.isArray(r.options) ? r.options.map((o) => (typeof o === "string" ? o.trim().slice(0, 120) : "")) : [];
  const correctIndex = typeof r.correctIndex === "number" ? r.correctIndex : -1;
  if (!prompt || options.length < 2 || options.length > 4 || options.some((o) => !o)) return null;
  if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= options.length) return null;
  const explanation = typeof r.explanation === "string" && r.explanation.trim() ? r.explanation.trim().slice(0, 400) : undefined;
  return { prompt, options, correctIndex, ...(explanation ? { explanation } : {}) };
}

export function cleanQuestions(raw: unknown): LiveQuestion[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(cleanQuestion).filter((q): q is LiveQuestion => q !== null).slice(0, LIMITS.questions[1]);
}

/** Nejvíc znaků data URL jednoho obrázku (~150 kB po zmenšení v prohlížeči). */
export const MAX_IMAGE_CHARS = 200_000;
const IMAGE_RE = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/;

export function cleanImage(raw: unknown): string | undefined {
  return typeof raw === "string" && raw.length <= MAX_IMAGE_CHARS && IMAGE_RE.test(raw) ? raw : undefined;
}

/** Otázky vlastní sady: stejné jako `cleanQuestions`, ale zachová obrázek. */
export function cleanSetQuestions(raw: unknown): SetQuestion[] {
  if (!Array.isArray(raw)) return [];
  const out: SetQuestion[] = [];
  for (const item of raw) {
    const q = cleanQuestion(item);
    if (!q) continue;
    const image = cleanImage((item as Record<string, unknown>).image);
    out.push(image ? { ...q, image } : q);
    if (out.length >= LIMITS.questions[1]) break;
  }
  return out;
}

/** Součet všech obrázků sady (aby tělo požadavku zůstalo v rozumné velikosti). */
export const MAX_SET_IMAGE_CHARS = 3_000_000;
export function imagesFit(questions: SetQuestion[]): boolean {
  return questions.reduce((sum, q) => sum + (q.image?.length ?? 0), 0) <= MAX_SET_IMAGE_CHARS;
}

export function generatePin(rnd: () => number = Math.random): string {
  return String(100000 + Math.floor(rnd() * 900000));
}

// Malý deterministický generátor, aby každý hráč v závodě měl svoje stálé pořadí otázek.
export function seededRandom(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function questionOrder(count: number, seed: string): number[] {
  const order = Array.from({ length: count }, (_, i) => i);
  const rnd = seededRandom(seed);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

/** Index otázky, kterou má v závodě/horečce hráč zrovna před sebou. */
export function playerQuestionIndex(count: number, seed: string, answered: number): number {
  return questionOrder(count, seed)[answered % count];
}

/** Kahoot styl: 500–1000 bodů podle rychlosti + bonus za sérii správných odpovědí. */
export function quizPoints(correct: boolean, ms: number, seconds: number, streakBefore: number): number {
  if (!correct) return 0;
  const fraction = Math.max(0, Math.min(1, ms / (seconds * 1000)));
  return Math.round(1000 * (1 - fraction / 2)) + Math.min(streakBefore, 5) * 50;
}

/** Série: správná odpověď je za 100 × násobek série (nejvýš 5×), špatná sérii přeruší. */
export function streakPoints(streakBefore: number): number {
  return 100 * Math.min(streakBefore + 1, 5);
}

export const STREAK_PENALTY = 50;

/** Poslední přeživší: hráč je ve hře, dokud neztratil všechny životy. */
export function livesLeft(lives: number, lost: number): number {
  return Math.max(0, lives - lost);
}

/** Týmy se skládají střídavě podle pořadí připojení (první hráč do týmu 0, druhý do 1…), takže jsou vyrovnané. */
export function teamOf(joinIndex: number): 0 | 1 {
  return joinIndex % 2 === 0 ? 0 : 1;
}

export type StatusInput = {
  mode: LiveMode;
  status: StoredStatus;
  questionStartedAt: number | null;
  endsAt: number | null;
  settings: LiveSettings;
  now: number;
  /** Klasický kvíz: kolik hráčů už na aktuální otázku odpovědělo a kolik jich je. */
  answered: number;
  players: number;
};

export function effectiveStatus(i: StatusInput): LiveStatus {
  if (i.status !== "QUESTION") return i.status;
  if (isSyncMode(i.mode)) {
    if (i.questionStartedAt === null) return "QUESTION";
    const over = i.now >= i.questionStartedAt + i.settings.seconds * 1000;
    const everyone = i.players > 0 && i.answered >= i.players;
    return over || everyone ? "REVEAL" : "QUESTION";
  }
  return i.endsAt !== null && i.now >= i.endsAt ? "ENDED" : "QUESTION";
}

// --- Zlatá horečka ---

const CHEST_POOL: { outcome: ChestOutcome; weight: number }[] = [
  { outcome: { kind: "gold", amount: 15 }, weight: 3 },
  { outcome: { kind: "gold", amount: 30 }, weight: 3 },
  { outcome: { kind: "gold", amount: 60 }, weight: 2 },
  { outcome: { kind: "gold", amount: 120 }, weight: 1 },
  { outcome: { kind: "steal", amount: 40 }, weight: 2 },
  { outcome: { kind: "lose", amount: 25 }, weight: 1.5 },
];

export function chestOptions(rnd: () => number = Math.random): ChestOutcome[] {
  const total = CHEST_POOL.reduce((s, c) => s + c.weight, 0);
  return [0, 1, 2].map(() => {
    let r = rnd() * total;
    for (const c of CHEST_POOL) {
      r -= c.weight;
      if (r <= 0) return c.outcome;
    }
    return CHEST_POOL[0].outcome;
  });
}

/** Výsledek otevření truhly: změna zlata hráče a případně kolik zlata a komu se bere. */
export function applyChest(
  outcome: ChestOutcome,
  myGold: number,
  victimGold: number | null,
): { me: number; victim: number } {
  if (outcome.kind === "gold") return { me: outcome.amount, victim: 0 };
  if (outcome.kind === "lose") {
    const lost = Math.min(myGold, outcome.amount);
    return { me: lost === 0 ? 0 : -lost, victim: 0 };
  }
  const taken = victimGold === null ? 0 : Math.min(victimGold, outcome.amount);
  return { me: taken, victim: taken === 0 ? 0 : -taken };
}

export function isChestOutcome(v: unknown): v is ChestOutcome {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (o.kind === "gold" || o.kind === "steal" || o.kind === "lose") && typeof o.amount === "number";
}

export type Ranked = { id: string; score: number; gold: number; progress: number; joinedAt: number };

/** Pořadí podle režimu; při shodě rozhoduje dřívější připojení. */
export function rankPlayers<T extends Ranked>(mode: LiveMode, players: T[]): T[] {
  const key = (p: T) =>
    mode === "GOLD" ? [p.gold, p.score] : mode === "RACE" ? [p.progress, p.score] : mode === "SURVIVAL" ? [-p.progress, p.score] : [p.score, 0];
  return [...players].sort((a, b) => {
    const [a1, a2] = key(a);
    const [b1, b2] = key(b);
    return b1 - a1 || b2 - a2 || a.joinedAt - b.joinedAt;
  });
}
