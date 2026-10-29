// Městečko jako hub: denně se v něm objeví osm věcí ke sběru (hvězdy, mince, houby, květiny) za body.
// Polohu a druh určuje den (stejný výpočet na serveru i v prohlížeči), takže nejde sbírat mimo místo.

export type CollectKind = "star" | "coin" | "mushroom" | "flower";
export const COLLECT_VALUE: Record<CollectKind, number> = { star: 5, coin: 3, mushroom: 3, flower: 2 };
export const COLLECT_ICON: Record<CollectKind, string> = { star: "⭐", coin: "🪙", mushroom: "🍄", flower: "🌸" };
export const COLLECT_COUNT = 8;
export const COLLECT_BONUS = 10;

// Místa na cestě a louce v souřadnicích obrázku městečka (0..1).
const SPOTS: [number, number][] = [
  [0.12, 0.72], [0.2, 0.77], [0.31, 0.71], [0.36, 0.8], [0.46, 0.76], [0.58, 0.73], [0.68, 0.71], [0.76, 0.76],
  [0.88, 0.7], [0.08, 0.9], [0.2, 0.94], [0.4, 0.9], [0.5, 0.95], [0.7, 0.8], [0.94, 0.82], [0.03, 0.84],
];
const KINDS: CollectKind[] = ["star", "coin", "mushroom", "flower"];

function seeded(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

export type CollectSpot = { idx: number; x: number; y: number; kind: CollectKind };

export function dailySpots(day: string): CollectSpot[] {
  const rnd = seeded("town:" + day);
  const pool = SPOTS.map((p, i) => ({ p, k: rnd() + i * 1e-6 })).sort((a, b) => a.k - b.k).slice(0, COLLECT_COUNT);
  return pool.map((s, idx) => ({ idx, x: s.p[0], y: s.p[1], kind: idx === 0 ? "star" : KINDS[Math.floor(rnd() * KINDS.length)] }));
}

export const collectReason = (day: string, idx: number) => `Městečko: sběr ${day} #${idx}`;
export const bonusReason = (day: string) => `Městečko: všechno sebráno ${day}`;
