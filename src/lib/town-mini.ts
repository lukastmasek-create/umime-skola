// Minihry v městečku: rybaření v laguně, sklizeň na farmě, pekárna a naučné hry v budovách 3D městečka
// (pokladna v pekárně, knihovna, hvězdárna, květinářství). Sdílí server (api/mestecko/minihra) i prohlížeč.

export const MINI_IDS = ["fishing", "harvest", "bakery", "cashier", "library", "stars", "flowers"] as const;
// původní tři hry, které má i staré 2D městečko (a jeho příběh)
export const CLASSIC_MINI_IDS = ["fishing", "harvest", "bakery"] as const;
export type MiniId = (typeof MINI_IDS)[number];
export const isMiniId = (g: unknown): g is MiniId => typeof g === "string" && (MINI_IDS as readonly string[]).includes(g);

export const PLAYS_PER_DAY = 3;

// maxScore: strop, který server uzná (víc než hra dovolí, je podvod); points a xp: odměna za skóre.
export const MINI: Record<MiniId, { maxScore: number; points: (s: number) => number; xp: (s: number) => number; icon: string }> = {
  fishing: { maxScore: 45, points: (s) => Math.min(12, Math.floor(s / 3)), xp: (s) => Math.min(4, Math.floor(s / 10)), icon: "🎣" },
  harvest: { maxScore: 45, points: (s) => Math.min(10, Math.floor(s / 4)), xp: (s) => Math.min(4, Math.floor(s / 10)), icon: "🥕" },
  bakery: { maxScore: 12, points: (s) => Math.min(12, s), xp: (s) => Math.min(4, Math.floor(s / 3)), icon: "🥐" },
  cashier: { maxScore: 10, points: (s) => Math.min(12, s + Math.floor(s / 5)), xp: (s) => Math.min(4, Math.floor(s / 2.5)), icon: "🧮" },
  library: { maxScore: 6, points: (s) => Math.min(12, s * 2), xp: (s) => Math.min(4, Math.floor((s * 2) / 3)), icon: "📚" },
  stars: { maxScore: 10, points: (s) => Math.min(12, s + Math.floor(s / 5)), xp: (s) => Math.min(4, Math.floor(s / 2.5)), icon: "🔭" },
  flowers: { maxScore: 12, points: (s) => Math.min(12, s), xp: (s) => Math.min(4, Math.floor(s / 3)), icon: "🌷" },
};

export type MiniSnapshot = Record<MiniId, { left: number; best: number }>;
