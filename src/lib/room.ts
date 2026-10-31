import type { Locale } from "@/i18n/config";
import layout from "./room-layout.json";

export type FurnitureDef = { id: string; icon: string; price: number; names: Record<Locale, string> };

const f = (id: string, icon: string, price: number, cs: string, en: string, de: string, ru: string): FurnitureDef => ({
  id, icon, price, names: { cs, en, de, ru },
});

export const FURNITURE: FurnitureDef[] = [
  f("plant", "🪴", 30, "Květina", "Plant", "Pflanze", "Цветок"),
  f("sofa", "🛋️", 60, "Pohovka", "Sofa", "Sofa", "Диван"),
  f("desk", "🖥️", 80, "Počítač", "Computer", "Computer", "Компьютер"),
  f("bookshelf", "📚", 90, "Knihovna", "Bookshelf", "Bücherregal", "Книжная полка"),
  f("globe", "🌐", 70, "Globus", "Globe", "Globus", "Глобус"),
  f("guitar", "🎸", 120, "Kytara", "Guitar", "Gitarre", "Гитара"),
  f("aquarium", "🐠", 150, "Akvárium", "Aquarium", "Aquarium", "Аквариум"),
  f("telescope", "🔭", 180, "Dalekohled", "Telescope", "Teleskop", "Телескоп"),
  f("trophy", "🏆", 220, "Vitrína s poháry", "Trophy case", "Pokalvitrine", "Витрина с кубками"),
  f("arcade", "🕹️", 300, "Herní automat", "Arcade cabinet", "Spielautomat", "Игровой автомат"),
  f("piano", "🎹", 350, "Piano", "Piano", "Klavier", "Пианино"),
  f("rocketbed", "🚀", 450, "Postel-raketa", "Rocket bed", "Raketenbett", "Кровать-ракета"),
];

export const ROOM_SLOTS = 12;

export type RoomState = { owned: string[]; placed: (string | null)[]; used: Record<string, string> };

// Co nábytek v pokoji dělá (počítá se jen postavený): XP navíc v testech a hrách (%), rychlejší nekonečné hry
// (podíl), denní body za interakci (nakrmit rybičky, zalít květinu…) a odkaz na část webu.
export type RoomPerk = { xpTest?: number; xpGame?: number; endless?: number; daily?: number; link?: string };
export const ROOM_PERKS: Record<string, RoomPerk> = {
  desk: { xpTest: 3, link: "/kurzy" },
  bookshelf: { xpGame: 2, link: "/materialy" },
  trophy: { xpTest: 1, xpGame: 1, link: "/zebricky" },
  arcade: { endless: 0.05, link: "/stale-hry" },
  globe: { link: "/mapa" },
  aquarium: { daily: 6 },
  plant: { daily: 3 },
  rocketbed: { daily: 5 },
  guitar: { daily: 3 },
  piano: { daily: 4 },
  telescope: { daily: 4 },
  sofa: { daily: 2 },
};
export const roomPlaced = (s: RoomState) => s.placed.filter((x): x is string => !!x);
export const roomXpBonus = (s: RoomState, source: "test" | "game" | string) =>
  roomPlaced(s).reduce((sum, id) => sum + ((source === "test" ? ROOM_PERKS[id]?.xpTest : source === "game" ? ROOM_PERKS[id]?.xpGame : 0) ?? 0), 0);
export const roomEndlessBonus = (s: RoomState) => roomPlaced(s).reduce((sum, id) => sum + (ROOM_PERKS[id]?.endless ?? 0), 0);

export function normalizeRoom(raw: unknown): RoomState {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const known = new Set(FURNITURE.map((x) => x.id));
  const owned = Array.isArray(r.owned) ? [...new Set(r.owned.filter((x): x is string => typeof x === "string" && known.has(x)))] : [];
  const placed: (string | null)[] = Array.from({ length: ROOM_SLOTS }, (_, i) => {
    const v = Array.isArray(r.placed) ? r.placed[i] : null;
    return typeof v === "string" && owned.includes(v) ? v : null;
  });
  // Každý kus nábytku stojí jen jednou.
  const seen = new Set<string>();
  const used: Record<string, string> = {};
  if (r.used && typeof r.used === "object") for (const [k, v] of Object.entries(r.used as Record<string, unknown>)) if (known.has(k) && typeof v === "string") used[k] = v;
  return { owned, placed: placed.map((v) => (v && !seen.has(v) ? (seen.add(v), v) : null)), used };
}

// Izometrický pokoj z Blenderu (umime-art/scripts/room_iso.py). Rozložení (polohy slotů, velikost a kotva
// každého sprajtu nábytku, okno, sluneční paprsek, lampa) je v room-layout.json; hodnoty jsou v procentech obrázku.
export const ROOM_LAYOUT = layout as unknown as {
  aspect: number;
  slots: [number, number][];
  furn: Record<string, { w: number; o: number }>;
  pane: [number, number][];
  beam: [number, number][];
  lamp: [number, number];
};
export const ROOM_SLOT_POS = ROOM_LAYOUT.slots;

// Sprite nábytku z Blenderu (public/room/furniture). Kotva (místo na podlaze) je v ROOM_LAYOUT.furn[id].o jako podíl výšky sprajtu.
export const furnitureSprite = (id: string) => `/room/furniture/${id}.webp`;
