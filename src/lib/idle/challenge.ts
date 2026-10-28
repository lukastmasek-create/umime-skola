// Výzvy ve stálých hrách (Farma, Město, Základna): kvízová komba, bossové s příběhem, adaptivní obtížnost
// a soutěžení (týdenní turnaj, společná zakázka party, dárky). Čistý kód bez databáze a Reactu:
// route si jen načte otázky a stavy her a výsledek zapíše.
//
//  - Otázka z kurzů dá herní měnu. Série správných odpovědí zvyšuje násobič (až ×2), zrychlení hry a dává
//    štíty (odpustí chybu) a nápovědy 50:50.
//  - Boss na konci kapitoly: 5 otázek a 3 životy. Další kapitola se odemyká postupem v dané hře.
//  - Obtížnost i výběr otázek se přizpůsobují: podle poslední úspěšnosti a podle toho, co hráč dřív zkazil.
//  - Týdenní skóre odemyká odměny, porovnává se v partě a skládá se do společné zakázky party.

// Kopie dvou malých pomůcek z lib/gamify.ts, aby šel soubor spustit i v testech bez aliasu "@/".
const dayKey = (date: Date) => date.toISOString().slice(0, 10);
function startOfUtcWeek(now: number): Date {
  const d = new Date(now);
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d;
}

export const CHALLENGE_GAME = "vyzvy";
export const CH_GAMES = ["farm", "city", "base", "pets"] as const;
export type ChGame = (typeof CH_GAMES)[number];
export const isChGame = (v: unknown): v is ChGame => typeof v === "string" && (CH_GAMES as readonly string[]).includes(v);

export const CHAPTERS = 5;
export const BOSS_QUESTIONS = 5;
export const BOSS_LIVES = 3;
export const MAX_SHIELDS = 2;
export const MAX_HINTS = 3;
export const BOOST_MINUTES = 10;
export const MAX_BOOST = 0.5;
export const FAST_MS = 8_000;
export const RECENT_SIZE = 12;
export const SEEN_SIZE = 40;
export const MAX_INBOX = 20;
export const GIFTS_PER_DAY = 5;
export const WEAK_CHANCE = 0.4;

/** Co hra potřebuje, aby se boss kapitoly otevřel (úroveň farmy / počet budov města / počet modulů základny / úroveň nejlepšího mazlíčka). */
export const CHAPTER_REQUIREMENT: Record<ChGame, number[]> = {
  farm: [2, 5, 8, 12, 16],
  city: [4, 12, 25, 50, 90],
  base: [3, 8, 14, 22, 32],
  pets: [2, 4, 7, 10, 14],
};

export const GIFT_AMOUNTS = [100, 500, 2000];

export const WEEK_TIERS = [
  { id: "bronze", score: 25, points: 5, xp: 10 },
  { id: "silver", score: 60, points: 12, xp: 20 },
  { id: "gold", score: 120, points: 25, xp: 40 },
] as const;
export const RANK_BONUS = [10, 5, 3];
export const PARTY_ORDER_PER_MEMBER = 40;
export const PARTY_ORDER_MIN_MEMBERS = 2;
export const PARTY_ORDER_POINTS = 8;

export type Meta = {
  streak: number;
  best: number;
  shield: number;
  hints: number;
  boostUntil: number;
  chapter: number;
  bossWins: number;
  correct: number;
  total: number;
};

export type QuestionView = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  course: string;
  weak: boolean;
};

export type BossRun = { chapter: number; idx: number; right: number; lives: number };

export type Pending = {
  game: ChGame;
  issuedAt: number;
  q: QuestionView;
  hidden: number[];
  boss: BossRun | null;
};

export type Gift = { id: string; from: string; fromName: string; game: ChGame; amount: number; at: number };
export type WeekRecord = { key: string; score: number; claimed: boolean; party: string[] };

export type ChallengeState = {
  v: 1;
  games: Record<ChGame, Meta>;
  pending: Pending | null;
  recent: number[];
  seen: string[];
  week: WeekRecord;
  lastWeek: WeekRecord | null;
  inbox: Gift[];
  sent: { day: string; count: number };
  gifted: number;
};

export const emptyMeta = (): Meta => ({ streak: 0, best: 0, shield: 0, hints: 0, boostUntil: 0, chapter: 0, bossWins: 0, correct: 0, total: 0 });

export function weekKeyAt(now: number): string {
  return dayKey(startOfUtcWeek(now));
}

export function emptyChallenge(now: number): ChallengeState {
  return {
    v: 1,
    games: { farm: emptyMeta(), city: emptyMeta(), base: emptyMeta(), pets: emptyMeta() },
    pending: null,
    recent: [],
    seen: [],
    week: { key: weekKeyAt(now), score: 0, claimed: false, party: [] },
    lastWeek: null,
    inbox: [],
    sent: { day: dayKey(new Date(now)), count: 0 },
    gifted: 0,
  };
}

const obj = (v: unknown): Record<string, unknown> => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const int = (v: unknown, min: number, max: number, fallback = 0) => {
  const x = Math.floor(Number(v));
  return Number.isFinite(x) ? Math.min(max, Math.max(min, x)) : fallback;
};
const str = (v: unknown, max = 200) => (typeof v === "string" ? v.slice(0, max) : "");
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

function normalizeMeta(raw: unknown): Meta {
  const r = obj(raw);
  return {
    streak: int(r.streak, 0, 10_000),
    best: int(r.best, 0, 10_000),
    shield: int(r.shield, 0, MAX_SHIELDS),
    hints: int(r.hints, 0, MAX_HINTS),
    boostUntil: int(r.boostUntil, 0, Number.MAX_SAFE_INTEGER),
    chapter: int(r.chapter, 0, CHAPTERS),
    bossWins: int(r.bossWins, 0, 100_000),
    correct: int(r.correct, 0, 10_000_000),
    total: int(r.total, 0, 10_000_000),
  };
}

function normalizeQuestion(raw: unknown): QuestionView | null {
  const r = obj(raw);
  const options = Array.isArray(r.options) ? r.options.filter((o): o is string => typeof o === "string").slice(0, 6) : [];
  const correctIndex = int(r.correctIndex, 0, 5, -1);
  if (!str(r.id) || !str(r.prompt, 1000) || options.length < 2 || correctIndex < 0 || correctIndex >= options.length) return null;
  return {
    id: str(r.id),
    prompt: str(r.prompt, 1000),
    options: options.map((o) => o.slice(0, 300)),
    correctIndex,
    explanation: str(r.explanation, 1000),
    course: str(r.course, 120),
    weak: r.weak === true,
  };
}

function normalizePending(raw: unknown): Pending | null {
  const r = obj(raw);
  const q = normalizeQuestion(r.q);
  if (!q || !isChGame(r.game)) return null;
  const b = r.boss ? obj(r.boss) : null;
  return {
    game: r.game,
    issuedAt: int(r.issuedAt, 0, Number.MAX_SAFE_INTEGER),
    q,
    hidden: Array.isArray(r.hidden) ? r.hidden.map((h) => int(h, 0, 5, -1)).filter((h) => h >= 0 && h !== q.correctIndex).slice(0, 2) : [],
    boss: b
      ? { chapter: int(b.chapter, 1, CHAPTERS, 1), idx: int(b.idx, 0, BOSS_QUESTIONS), right: int(b.right, 0, BOSS_QUESTIONS), lives: int(b.lives, 0, BOSS_LIVES) }
      : null,
  };
}

function normalizeWeek(raw: unknown): WeekRecord | null {
  const r = obj(raw);
  const key = str(r.key, 10);
  if (!DAY_RE.test(key)) return null;
  return {
    key,
    score: int(r.score, 0, 10_000_000),
    claimed: r.claimed === true,
    party: Array.isArray(r.party) ? r.party.filter((p): p is string => typeof p === "string").slice(0, 10) : [],
  };
}

export function normalizeChallenge(raw: unknown, now: number): ChallengeState {
  const r = obj(raw);
  const fresh = emptyChallenge(now);
  const g = obj(r.games);
  const inbox: Gift[] = [];
  if (Array.isArray(r.inbox)) {
    for (const x of r.inbox) {
      const o = obj(x);
      if (!str(o.id) || !str(o.from) || !isChGame(o.game)) continue;
      inbox.push({ id: str(o.id), from: str(o.from), fromName: str(o.fromName, 60), game: o.game, amount: int(o.amount, 1, 1_000_000), at: int(o.at, 0, Number.MAX_SAFE_INTEGER) });
    }
  }
  const sent = obj(r.sent);
  return {
    v: 1,
    games: { farm: normalizeMeta(g.farm), city: normalizeMeta(g.city), base: normalizeMeta(g.base), pets: normalizeMeta(g.pets) },
    pending: normalizePending(r.pending),
    recent: Array.isArray(r.recent) ? r.recent.map((x) => (x ? 1 : 0)).slice(-RECENT_SIZE) : [],
    seen: Array.isArray(r.seen) ? r.seen.filter((s): s is string => typeof s === "string").slice(-SEEN_SIZE) : [],
    week: normalizeWeek(r.week) ?? fresh.week,
    lastWeek: normalizeWeek(r.lastWeek),
    inbox: inbox.slice(-MAX_INBOX),
    sent: DAY_RE.test(str(sent.day, 10)) ? { day: str(sent.day, 10), count: int(sent.count, 0, 1000) } : fresh.sent,
    gifted: int(r.gifted, 0, 1_000_000),
  };
}

/** Nový týden uzavře ten minulý (čeká na vyzvednutí odměny) a začne od nuly; nový den vynuluje počet dárků. */
export function rollChallenge(state: ChallengeState, now: number): ChallengeState {
  const key = weekKeyAt(now);
  const day = dayKey(new Date(now));
  let next = state;
  if (next.week.key < key) {
    next = { ...next, lastWeek: next.week, week: { key, score: 0, claimed: false, party: [] } };
  }
  if (next.sent.day !== day) next = { ...next, sent: { day, count: 0 } };
  return next;
}

/** Násobič odměny ze série: ×1,0 až ×2,0. */
export function comboMultiplier(streak: number): number {
  return 1 + Math.min(10, Math.max(0, streak)) * 0.1;
}

/** Zrychlení hry, dokud boost běží (přičítá se k ostatním bonusům hry). */
export function boostBonus(meta: Meta, now: number): number {
  return meta.boostUntil > now ? Math.min(MAX_BOOST, meta.streak * 0.05) : 0;
}

export function accuracy(recent: number[]): number {
  return recent.length === 0 ? 0.6 : recent.reduce((a, b) => a + b, 0) / recent.length;
}

/** Cílová obtížnost otázky (1–5): lepší úspěšnost = těžší otázky; boss vyšších kapitol je o stupeň těžší. */
export function targetDifficulty(recent: number[], bossChapter: number | null): number {
  const acc = accuracy(recent);
  let d = acc >= 0.85 ? 4 : acc >= 0.7 ? 3 : acc >= 0.45 ? 2 : 1;
  if (bossChapter && bossChapter >= 3) d += 1;
  return Math.min(5, Math.max(1, d));
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Základ odměny roste s tím, kolik už hráč ve hře vydělal, ať nezastará. */
export function quickBase(earned: number): number {
  return Math.round(clamp(earned * 0.004, 25, 5000));
}
export function bossBase(earned: number, chapter: number): number {
  return Math.round(clamp(earned * 0.04, 300, 80_000) * (0.6 + chapter * 0.4));
}

export type Reward = { coins: number; xp: number; points: number };
const NO_REWARD: Reward = { coins: 0, xp: 0, points: 0 };

export function quickReward(earned: number, streakAfter: number, fast: boolean, weak: boolean): Reward {
  const mult = comboMultiplier(streakAfter) * (fast ? 1.25 : 1) * (weak ? 1.2 : 1);
  return {
    coins: Math.round(quickBase(earned) * mult),
    xp: 2 + (fast ? 1 : 0) + (weak ? 1 : 0),
    points: streakAfter > 0 && streakAfter % 5 === 0 ? 2 : 0,
  };
}

export function bossReward(earned: number, chapter: number, livesLeft: number): Reward {
  const flawless = livesLeft >= BOSS_LIVES;
  return {
    coins: Math.round(bossBase(earned, chapter) * (flawless ? 1.25 : 1)),
    xp: 20 + chapter * 6,
    points: 10 + chapter * 5 + (flawless ? 5 : 0),
  };
}

export function chapterRequirement(game: ChGame, chapter: number): number {
  return CHAPTER_REQUIREMENT[game][chapter - 1] ?? Number.MAX_SAFE_INTEGER;
}

export type BossOutcome = { done: boolean; won: boolean; chapter: number; idx: number; right: number; lives: number };

export type AnswerOutcome = {
  state: ChallengeState;
  correct: boolean;
  fast: boolean;
  shielded: boolean;
  streak: number;
  reward: Reward;
  boss: BossOutcome | null;
  gained: { shield: boolean; hint: boolean };
  correctIndex: number;
  explanation: string;
};

/** Vyhodnotí odpověď na rozpracovanou otázku. Další otázku bossu doplní route (potřebuje databázi). */
export function applyAnswer(state: ChallengeState, choice: number, earned: number, now: number): AnswerOutcome | null {
  const p = state.pending;
  if (!p) return null;
  const meta = state.games[p.game];
  const correct = choice === p.q.correctIndex;
  const fast = correct && now - p.issuedAt <= FAST_MS;
  let streak = meta.streak;
  let shield = meta.shield;
  let hints = meta.hints;
  let shielded = false;
  const gained = { shield: false, hint: false };

  if (correct) {
    streak += 1;
    if (streak % 4 === 0 && hints < MAX_HINTS) {
      hints += 1;
      gained.hint = true;
    }
    if (streak % 6 === 0 && shield < MAX_SHIELDS) {
      shield += 1;
      gained.shield = true;
    }
  } else if (shield > 0) {
    // Štít odpustí chybu: série zůstane a v bossovi se nepřijde o život.
    shield -= 1;
    shielded = true;
  } else {
    streak = 0;
  }

  let boss: BossOutcome | null = null;
  let reward: Reward = NO_REWARD;
  let pending: Pending | null = null;
  let score = correct ? 1 + (fast ? 1 : 0) : 0;

  if (p.boss) {
    const right = p.boss.right + (correct ? 1 : 0);
    const lives = p.boss.lives - (correct || shielded ? 0 : 1);
    const idx = p.boss.idx + 1;
    const lost = lives <= 0;
    const won = !lost && idx >= BOSS_QUESTIONS;
    boss = { done: won || lost, won, chapter: p.boss.chapter, idx, right, lives };
    if (won) {
      reward = bossReward(earned, p.boss.chapter, lives);
      score += 10 * p.boss.chapter;
    } else if (!lost) {
      pending = { ...p, boss: { chapter: p.boss.chapter, idx, right, lives } };
    }
  } else if (correct) {
    reward = quickReward(earned, streak, fast, p.q.weak);
  }

  const next: ChallengeState = {
    ...state,
    games: {
      ...state.games,
      [p.game]: {
        ...meta,
        streak,
        best: Math.max(meta.best, streak),
        shield,
        hints,
        correct: meta.correct + (correct ? 1 : 0),
        total: meta.total + 1,
        boostUntil: correct && !p.boss ? now + BOOST_MINUTES * 60_000 : meta.boostUntil,
        chapter: boss?.won ? Math.max(meta.chapter, boss.chapter) : meta.chapter,
        bossWins: meta.bossWins + (boss?.won ? 1 : 0),
      },
    },
    pending,
    recent: [...state.recent, correct ? 1 : 0].slice(-RECENT_SIZE),
    seen: [...state.seen, p.q.id].slice(-SEEN_SIZE),
    week: { ...state.week, score: state.week.score + score },
  };
  return { state: next, correct, fast, shielded, streak, reward, boss, gained, correctIndex: p.q.correctIndex, explanation: p.q.explanation };
}

/** Nápověda 50:50: schová dvě špatné možnosti. Jde použít jednou na otázku. */
export function applyHint(state: ChallengeState): ChallengeState | null {
  const p = state.pending;
  if (!p || p.hidden.length > 0) return null;
  const meta = state.games[p.game];
  if (meta.hints < 1) return null;
  const wrong = p.q.options.map((_, i) => i).filter((i) => i !== p.q.correctIndex);
  const seed = [...p.q.id].reduce((a, c) => a + c.charCodeAt(0), 0);
  const first = wrong[seed % wrong.length];
  const rest = wrong.filter((i) => i !== first);
  const second = rest[(seed >> 3) % rest.length];
  return {
    ...state,
    games: { ...state.games, [p.game]: { ...meta, hints: meta.hints - 1 } },
    pending: { ...p, hidden: [first, second] },
  };
}

/** Kolik týdenních odměn hráč dosáhl (0 = žádná, 3 = zlatá). */
export function weekTier(score: number): number {
  return WEEK_TIERS.filter((t) => score >= t.score).length;
}

export type PartyRow = { userId: string; name: string; score: number };

/** Pořadí v partě podle skóre za daný týden (s nulovým skóre se pořadí nepočítá). */
export function rankInParty(rows: PartyRow[], userId: string): number {
  const mine = rows.find((r) => r.userId === userId)?.score ?? 0;
  if (mine <= 0) return 0;
  return 1 + rows.filter((r) => r.score > mine).length;
}

export function weekReward(score: number, rank: number): Reward {
  const tier = weekTier(score);
  if (tier === 0) return NO_REWARD;
  const t = WEEK_TIERS[tier - 1];
  const rankPoints = rank > 0 && rank <= RANK_BONUS.length ? RANK_BONUS[rank - 1] : 0;
  return { coins: 0, xp: t.xp, points: t.points + rankPoints };
}

export function partyOrderTarget(memberCount: number): number {
  return Math.max(PARTY_ORDER_MIN_MEMBERS, memberCount) * PARTY_ORDER_PER_MEMBER;
}
