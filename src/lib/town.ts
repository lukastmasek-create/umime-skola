// Městečko jako hub: denně se v něm objeví osm věcí ke sběru (hvězdy, mince, houby, květiny) za body.
// Polohu a druh určuje den (stejný výpočet na serveru i v prohlížeči), takže nejde sbírat mimo místo.

export type CollectKind = "star" | "coin" | "mushroom" | "flower";
export const COLLECT_VALUE: Record<CollectKind, number> = { star: 5, coin: 3, mushroom: 3, flower: 2 };
export const COLLECT_ICON: Record<CollectKind, string> = { star: "⭐", coin: "🪙", mushroom: "🍄", flower: "🌸" };
export const COLLECT_COUNT = 8;
export const COLLECT_BONUS = 10;

// Kandidátní místa (sloty) v městečku; kde přesně leží, určuje obrázek městečka (kotvy "sber" v mesto-hub-kotvy.json).
export const COLLECT_SLOTS = 18;
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

export type CollectSpot = { idx: number; slot: number; kind: CollectKind };

export function dailySpots(day: string): CollectSpot[] {
  const rnd = seeded("town:" + day);
  const pool = Array.from({ length: COLLECT_SLOTS }, (_, i) => ({ slot: i, k: rnd() + i * 1e-6 })).sort((a, b) => a.k - b.k).slice(0, COLLECT_COUNT);
  return pool.map((s, idx) => ({ idx, slot: s.slot, kind: idx === 0 ? "star" : KINDS[Math.floor(rnd() * KINDS.length)] }));
}

export const collectReason = (day: string, idx: number) => `Městečko: sběr ${day} #${idx}`;
export const bonusReason = (day: string) => `Městečko: všechno sebráno ${day}`;
