// Obyvatelé městečka: přátelství (srdíčka), denní limity, dárky a otázky z kurzů. Sdílí server (api/mestecko/npc) i prohlížeč.

export const NPC_KEYS = ["knihovnice", "pekar", "kluk", "farmar", "babicka", "kocka", "ovce", "slepice"] as const;
export type NpcKey = (typeof NPC_KEYS)[number];

export type GiftId = "flower" | "book" | "cake";
export const GIFTS: Record<GiftId, { icon: string; cost: number }> = {
  flower: { icon: "🌸", cost: 3 },
  book: { icon: "📖", cost: 6 },
  cake: { icon: "🧁", cost: 10 },
};

// Kdo se dá vyzpovídat z učiva (předměty kurzů) a co mu udělá největší radost.
export const NPC_DEF: Record<NpcKey, { subjects: string[]; likes: GiftId; asks: boolean }> = {
  knihovnice: { subjects: ["CESTINA", "LITERATURA", "ANGLICTINA", "NEMCINA"], likes: "book", asks: true },
  pekar: { subjects: ["MATEMATIKA", "FYZIKA", "CHEMIE"], likes: "cake", asks: true },
  kluk: { subjects: [], likes: "cake", asks: true },
  farmar: { subjects: ["PRIRODOPIS", "ZEMEPIS"], likes: "flower", asks: true },
  babicka: { subjects: ["DEJEPIS", "OBCANKA", "HUDEBKA"], likes: "flower", asks: true },
  kocka: { subjects: [], likes: "cake", asks: false },
  ovce: { subjects: [], likes: "flower", asks: false },
  slepice: { subjects: [], likes: "flower", asks: false },
};

// Přátelské body potřebné pro 0 až 5 srdíček.
export const HEART_AT = [0, 3, 8, 15, 25, 40];
export const MAX_HEARTS = 5;
export const heartsFor = (fp: number) => HEART_AT.reduce((h, need, i) => (fp >= need ? i : h), 0);

export const ASKS_PER_DAY = 3;
export const REWARD = { talk: { fp: 1, points: 1 }, answer: { fp: 2, points: 4, xp: 3 }, giftLiked: { fp: 4 }, giftOther: { fp: 2 }, levelUp: (hearts: number) => 5 * hearts };

export type NpcState = { fp: number; talked?: string; gifted?: string; day?: string; asks?: number; pending?: { id: string; correct: number; options: string[]; prompt: string } | null };
export type NpcSnapshot = Record<NpcKey, { fp: number; hearts: number; talked: boolean; gifted: boolean; asksLeft: number }>;

export const isNpcKey = (k: unknown): k is NpcKey => typeof k === "string" && (NPC_KEYS as readonly string[]).includes(k);
export const isGiftId = (g: unknown): g is GiftId => typeof g === "string" && g in GIFTS;
