export type LiveMode = "QUIZ" | "RACE" | "GOLD" | "STREAK" | "SURVIVAL" | "TEAMS";
export type StoredStatus = "LOBBY" | "QUESTION" | "ENDED";
// REVEAL se dopočítává z času (nebo když odpověděli všichni), do databáze se neukládá.
export type LiveStatus = StoredStatus | "REVEAL";

export type LiveQuestion = {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
};

/** Otázka ve vlastní sadě: navíc může mít obrázek (zmenšený JPEG/PNG/WebP jako data URL). Do živých her se obrázek nekopíruje. */
export type SetQuestion = LiveQuestion & { image?: string };

export type LiveSettings = {
  /** Čas na otázku v klasickém kvízu (sekundy). */
  seconds: number;
  /** Závod: kolik správných odpovědí vede do cíle. */
  raceTarget: number;
  /** Závod a Zlatá horečka: jak dlouho hra trvá (minuty). */
  durationMin: number;
  /** Poslední přeživší: kolik životů hráči na začátku mají. */
  lives: number;
};

export type ChestOutcome =
  | { kind: "gold"; amount: number }
  | { kind: "steal"; amount: number }
  | { kind: "lose"; amount: number };

/** `progress` je v módu Poslední přeživší počet ztracených životů; `team` je 0 nebo 1 jen v týmovém módu. */
export type PlayerRow = { id: string; name: string; avatar: string | null; score: number; gold: number; progress: number; team?: 0 | 1 };

/** Co vidí prohlížeč při pollingu. Správná odpověď je v `question` jen při odhalení (a vždy pro učitele). */
export type LiveView = {
  serverNow: number;
  pin: string;
  title: string;
  mode: LiveMode;
  status: LiveStatus;
  role: "host" | "player";
  settings: LiveSettings;
  total: number;
  endsAt: number | null;
  question: null | {
    index: number;
    prompt: string;
    options: string[];
    startedAt: number | null;
    seconds: number | null;
    correctIndex?: number;
    explanation?: string;
  };
  counts: { players: number; answered: number };
  /** Učitel v klasickém kvízu: kolik hráčů zvolilo kterou možnost. */
  distribution?: number[];
  leaderboard: PlayerRow[];
  /** Týmový mód: součet bodů a počet hráčů obou týmů. */
  teams?: { score: number; players: number }[];
  /** Přihlášený hráč po konci hry: co mu hra připsala. */
  reward?: { xp: number; points: number };
  me?: {
    id: string;
    name: string;
    rank: number;
    score: number;
    gold: number;
    progress: number;
    streak: number;
    answeredCurrent: boolean;
    choice: number | null;
    correct: boolean | null;
    lastPoints: number;
    /** Zlatá horečka: počet truhel k otevření (0 nebo 3). */
    chests: number;
    /** Týmový mód: do kterého týmu hráč patří. */
    team?: 0 | 1;
    /** Poslední přeživší: kolik životů mu zbývá. */
    lives?: number;
  };
};

export type AnswerResult = { ok: true; correct?: boolean; correctIndex?: number; explanation?: string; chests?: number; won?: boolean; points?: number };
export type ChestResult = { ok: true; outcome: ChestOutcome; gold: number; victim: string | null; all: ChestOutcome[] };
