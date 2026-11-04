import { withFallbacks } from "@/i18n/config";
import type { Locale } from "@/i18n/config";
import layout from "./room-layout.json";

export type FurnitureDef = { id: string; icon: string; price: number; names: Record<Locale, string>; /** Jen z craftování: v obchodě se nekupuje, vlastní se po vyrobení (Unlock "room:<id>"). */ craft?: boolean };

const f = (id: string, icon: string, price: number, cs: string, en: string, de: string, ru: string, uk: string, ja: string, es: string, fr: string): FurnitureDef => ({
  id, icon, price, names: { ...withFallbacks({ cs, en, de, ru }), uk, ja, es, fr },
});

export const FURNITURE: FurnitureDef[] = [
  f("plant", "🪴", 30, "Květina", "Plant", "Pflanze", "Цветок", "Квітка", "お花", "Planta", "Plante"),
  f("sofa", "🛋️", 60, "Pohovka", "Sofa", "Sofa", "Диван", "Диван", "ソファ", "Sofá", "Canapé"),
  f("desk", "🖥️", 80, "Počítač", "Computer", "Computer", "Компьютер", "Комп'ютер", "パソコン", "Ordenador", "Ordinateur"),
  f("bookshelf", "📚", 90, "Knihovna", "Bookshelf", "Bücherregal", "Книжная полка", "Книжкова полиця", "本棚", "Estantería", "Bibliothèque"),
  f("globe", "🌐", 70, "Globus", "Globe", "Globus", "Глобус", "Глобус", "地球儀", "Globo terráqueo", "Globe"),
  f("guitar", "🎸", 120, "Kytara", "Guitar", "Gitarre", "Гитара", "Гітара", "ギター", "Guitarra", "Guitare"),
  f("aquarium", "🐠", 150, "Akvárium", "Aquarium", "Aquarium", "Аквариум", "Акваріум", "水槽", "Acuario", "Aquarium"),
  f("telescope", "🔭", 180, "Dalekohled", "Telescope", "Teleskop", "Телескоп", "Телескоп", "望遠鏡", "Telescopio", "Télescope"),
  f("trophy", "🏆", 220, "Vitrína s poháry", "Trophy case", "Pokalvitrine", "Витрина с кубками", "Вітрина з кубками", "トロフィー棚", "Vitrina de trofeos", "Vitrine à trophées"),
  f("arcade", "🕹️", 300, "Herní automat", "Arcade cabinet", "Spielautomat", "Игровой автомат", "Ігровий автомат", "ゲーム筐体", "Máquina recreativa", "Borne d'arcade"),
  f("piano", "🎹", 350, "Piano", "Piano", "Klavier", "Пианино", "Піаніно", "ピアノ", "Piano", "Piano"),
  f("rocketbed", "🚀", 450, "Postel-raketa", "Rocket bed", "Raketenbett", "Кровать-ракета", "Ліжко-ракета", "ロケットベッド", "Cama cohete", "Lit fusée"),
];

// Nábytek z craftování (profil → Craftování). Názvy jsou v receptech, tady jen id a ikona.
const c = (id: string, icon: string, cs: string, en: string, de: string, ru: string, uk: string, ja: string, es: string, fr: string): FurnitureDef => ({ ...f(id, icon, 0, cs, en, de, ru, uk, ja, es, fr), craft: true });
export const CRAFT_FURNITURE: FurnitureDef[] = [
  c("solar-system", "🪐", "Model sluneční soustavy", "Solar system model", "Sonnensystem-Modell", "Модель Солнечной системы", "Модель Сонячної системи", "太陽系の模型", "Modelo del sistema solar", "Maquette du système solaire"),
  c("ship-wheel", "☸️", "Lodní kormidlo", "Ship's wheel", "Steuerrad", "Штурвал", "Корабельне стерно", "船の舵輪", "Timón de barco", "Roue de bateau"),
  c("bonsai", "🪴", "Bonsaj", "Bonsai", "Bonsai", "Бонсай", "Бонсай", "盆栽", "Bonsái", "Bonsaï"),
  c("armor-stand", "🛡️", "Brnění na stojanu", "Armour stand", "Rüstungsständer", "Доспехи на подставке", "Обладунки на стійці", "鎧のスタンド", "Armadura en soporte", "Armure sur support"),
  c("cauldron", "🫕", "Kotlík s lektvarem", "Potion cauldron", "Zaubertrankkessel", "Котёл с зельем", "Казан із зіллям", "薬の大鍋", "Caldero de pociones", "Chaudron à potions"),
];
export const ALL_FURNITURE: FurnitureDef[] = [...FURNITURE, ...CRAFT_FURNITURE];

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

/** `craftOwned`: nábytek z craftování, který hráč vyrobil (z tabulky Unlock). Počítá se jako vlastněný. */
export function normalizeRoom(raw: unknown, craftOwned: string[] = []): RoomState {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const known = new Set(ALL_FURNITURE.map((x) => x.id));
  const stored = Array.isArray(r.owned) ? r.owned.filter((x): x is string => typeof x === "string" && known.has(x) && !CRAFT_FURNITURE.some((cf) => cf.id === x)) : [];
  const owned = [...new Set([...stored, ...craftOwned.filter((x) => CRAFT_FURNITURE.some((cf) => cf.id === x))])];
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
