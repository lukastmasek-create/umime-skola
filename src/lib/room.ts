import type { Locale } from "@/i18n/config";

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

export type RoomState = { owned: string[]; placed: (string | null)[] };

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
  return { owned, placed: placed.map((v) => (v && !seen.has(v) ? (seen.add(v), v) : null)) };
}
