// Craftování: materiály, recepty a celá herní logika bez databáze a Reactu (testy: src/lib/craft.test.ts).
//
// Materiály mají svět (obecné, vesmír, moře, les, hrad, kouzla) a vzácnost (běžný, neobvyklý, vzácný, epický).
// Recept vždycky odpovídá světu: vesmírný avatar se vyrábí z vesmírných materiálů, bonusy (nástroje pro učení)
// z obecných. Materiály se získávají:
//   - učením: každé XP z lekcí, testů, her a kvízů (kromě kola štěstí) dá materiál; větší výsledek = vzácnější,
//   - ve stálých hrách: vybraná odměna za úkol nebo úspěch dá materiály s lepší šancí na vzácné,
//   - nákupem za body: jen běžné a neobvyklé, s denním limitem, aby nenahradil učení,
//   - zušlechtěním: 3 kusy jedné vzácnosti = 1 kus další vzácnosti stejného světa.
// Světové materiály z učení padají do světa, který si hráč zvolí („sbírám pro svět…“).
//
// 3D modely doplňků (na avatara, pro mazlíčky, do pokoje) zatím nejsou, jen mají jména (CRAFT_ASSETS.md);
// takové recepty jsou vidět, ale vyrobit půjdou, až bude model (ready: true).

import type { Locale } from "@/i18n/config";

type Names = Record<Locale, string>;
const n = (cs: string, en: string, de: string, ru: string): Names => ({ cs, en, de, ru });

// --- světy a vzácnosti ---

export const WORLDS = ["obecne", "vesmir", "more", "les", "hrad", "kouzla"] as const;
export type World = (typeof WORLDS)[number];
/** Světy, do kterých se dá sbírat (obecné padají vždycky). */
export const THEMED_WORLDS = ["vesmir", "more", "les", "hrad", "kouzla"] as const;
export type ThemedWorld = (typeof THEMED_WORLDS)[number];
export const isWorld = (v: unknown): v is World => typeof v === "string" && (WORLDS as readonly string[]).includes(v);
export const isThemedWorld = (v: unknown): v is ThemedWorld => typeof v === "string" && (THEMED_WORLDS as readonly string[]).includes(v);

export const RARITIES = ["common", "uncommon", "rare", "epic"] as const;
export type Rarity = (typeof RARITIES)[number];

// --- materiály ---

export type MaterialDef = { id: string; world: World; rarity: Rarity; icon: string; names: Names };

const m = (id: string, world: World, rarity: Rarity, icon: string, names: Names): MaterialDef => ({ id, world, rarity, icon, names });

export const MATERIALS: MaterialDef[] = [
  // Obecné: suroviny na nástroje a bonusy.
  m("wood", "obecne", "common", "🪵", n("Dřevo", "Wood", "Holz", "Дерево")),
  m("iron", "obecne", "uncommon", "🔩", n("Železo", "Iron", "Eisen", "Железо")),
  m("silver", "obecne", "rare", "🥈", n("Stříbro", "Silver", "Silber", "Серебро")),
  m("gold", "obecne", "epic", "🪙", n("Zlato", "Gold", "Gold", "Золото")),
  // Vesmír
  m("moon-dust", "vesmir", "common", "🌑", n("Měsíční prach", "Moon dust", "Mondstaub", "Лунная пыль")),
  m("meteorite", "vesmir", "uncommon", "☄️", n("Meteorit", "Meteorite", "Meteorit", "Метеорит")),
  m("star-crystal", "vesmir", "rare", "💠", n("Hvězdný krystal", "Star crystal", "Sternenkristall", "Звёздный кристалл")),
  m("comet-core", "vesmir", "epic", "🌠", n("Jádro komety", "Comet core", "Kometenkern", "Ядро кометы")),
  // Moře
  m("shell", "more", "common", "🐚", n("Mušle", "Seashell", "Muschel", "Ракушка")),
  m("coral", "more", "uncommon", "🪸", n("Korál", "Coral", "Koralle", "Коралл")),
  m("pearl", "more", "rare", "🦪", n("Perla", "Pearl", "Perle", "Жемчужина")),
  m("ocean-heart", "more", "epic", "🌊", n("Srdce oceánu", "Heart of the ocean", "Herz des Ozeans", "Сердце океана")),
  // Les
  m("acorn", "les", "common", "🌰", n("Žalud", "Acorn", "Eichel", "Жёлудь")),
  m("resin", "les", "uncommon", "🍯", n("Pryskyřice", "Resin", "Harz", "Смола")),
  m("amber", "les", "rare", "🔶", n("Jantar", "Amber", "Bernstein", "Янтарь")),
  m("golden-leaf", "les", "epic", "🍁", n("Zlatý list", "Golden leaf", "Goldenes Blatt", "Золотой лист")),
  // Hrad
  m("stone", "hrad", "common", "🪨", n("Kámen", "Stone", "Stein", "Камень")),
  m("steel", "hrad", "uncommon", "⚙️", n("Ocel", "Steel", "Stahl", "Сталь")),
  m("ruby", "hrad", "rare", "🔴", n("Rubín", "Ruby", "Rubin", "Рубин")),
  m("royal-seal", "hrad", "epic", "🏵️", n("Královská pečeť", "Royal seal", "Königliches Siegel", "Королевская печать")),
  // Kouzla
  m("herb", "kouzla", "common", "🌿", n("Bylina", "Herb", "Kraut", "Трава")),
  m("magic-dust", "kouzla", "uncommon", "✨", n("Kouzelný prach", "Magic dust", "Zauberstaub", "Волшебная пыль")),
  m("moonstone", "kouzla", "rare", "🔮", n("Měsíční kámen", "Moonstone", "Mondstein", "Лунный камень")),
  m("dragon-scale", "kouzla", "epic", "🐉", n("Dračí šupina", "Dragon scale", "Drachenschuppe", "Драконья чешуя")),
];

const MATERIAL_BY_ID = new Map(MATERIALS.map((x) => [x.id, x]));
export const materialDef = (id: string) => MATERIAL_BY_ID.get(id);
export const materialOf = (world: World, rarity: Rarity) => MATERIALS.find((x) => x.world === world && x.rarity === rarity)!;
export const nextRarity = (r: Rarity): Rarity | null => RARITIES[RARITIES.indexOf(r) + 1] ?? null;

// --- recepty ---

export type BonusEffect =
  | { kind: "xp"; pct: number; minutes: number }
  | { kind: "endless"; pct: number; minutes: number }
  | { kind: "points"; amount: number }
  | { kind: "wheel" }
  | { kind: "shield" };

export type RecipeCategory = "bonus" | "avatar" | "avatar-acc" | "pet-acc" | "profile" | "room";
export type OutputKind = "bonus" | "avatar" | "title" | "banner" | "named";

export type Recipe = {
  id: string;
  category: RecipeCategory;
  world: World;
  cost: Partial<Record<string, number>>;
  /** Co recept vyrobí: bonus do inventáře, nebo odemčení (avatar/titul/pozadí) či zatím jen pojmenovaný 3D doplněk. */
  output: OutputKind;
  /** Id věci v profilu (avatar, titul, pozadí); pro bonusy a doplňky stejné jako id receptu. */
  ref: string;
  icon: string;
  names: Names;
  effect?: BonusEffect;
  /** Název 3D modelu pro Blender tým (CRAFT_ASSETS.md). */
  asset3d?: string;
  /** false = model ještě není, recept se ukáže, ale nejde vyrobit. */
  ready: boolean;
};

const bonus = (id: string, icon: string, cost: Recipe["cost"], effect: BonusEffect, names: Names): Recipe => ({
  id,
  category: "bonus",
  world: "obecne",
  cost,
  output: "bonus",
  ref: id,
  icon,
  names,
  effect,
  ready: true,
});

const unlock = (id: string, category: RecipeCategory, world: ThemedWorld, output: "avatar" | "title" | "banner", ref: string, icon: string, cost: Recipe["cost"], names: Names, asset3d?: string): Recipe => ({
  id,
  category,
  world,
  cost,
  output,
  ref,
  icon,
  names,
  asset3d,
  ready: true,
});

const named = (id: string, category: RecipeCategory, world: ThemedWorld, icon: string, cost: Recipe["cost"], names: Names): Recipe => ({
  id,
  category,
  world,
  cost,
  output: "named",
  ref: id,
  icon,
  names,
  asset3d: `craft-${id}`,
  ready: false,
});

// Ceny podle světa: [běžný, neobvyklý, vzácný, epický] materiál daného světa.
function worldCost(world: World, c: number, u = 0, r = 0, e = 0): Recipe["cost"] {
  const out: Recipe["cost"] = {};
  const counts = [c, u, r, e];
  RARITIES.forEach((rar, i) => {
    if (counts[i] > 0) out[materialOf(world, rar).id] = counts[i];
  });
  return out;
}

export const MAX_XP_BOOST = 50; // %
export const MAX_ENDLESS_BOOST = 0.5; // podíl (+50 %)

export const RECIPES: Recipe[] = [
  // --- Bonusy (z obecných materiálů) ---
  bonus("scroll", "📜", { wood: 4, iron: 1 }, { kind: "xp", pct: 20, minutes: 60 }, n("Svitek učence (+20 % XP na 1 h)", "Scholar's scroll (+20% XP for 1 h)", "Gelehrtenrolle (+20 % XP für 1 Std.)", "Свиток учёного (+20 % XP на 1 ч)")),
  bonus("great-scroll", "📖", { iron: 2, silver: 1 }, { kind: "xp", pct: 30, minutes: 90 }, n("Kniha mudrce (+30 % XP na 1,5 h)", "Sage's book (+30% XP for 1.5 h)", "Buch des Weisen (+30 % XP für 1,5 Std.)", "Книга мудреца (+30 % XP на 1,5 ч)")),
  bonus("pouch", "👛", { wood: 5, iron: 1 }, { kind: "points", amount: 40 }, n("Měšec bodů (+40 bodů)", "Pouch of points (+40 points)", "Punktebeutel (+40 Punkte)", "Мешочек очков (+40 очков)")),
  bonus("golden-pouch", "💰", { silver: 1, gold: 1 }, { kind: "points", amount: 150 }, n("Zlatý měšec (+150 bodů)", "Golden pouch (+150 points)", "Goldener Beutel (+150 Punkte)", "Золотой мешочек (+150 очков)")),
  bonus("hourglass", "⏳", { wood: 2, iron: 2 }, { kind: "endless", pct: 0.25, minutes: 120 }, n("Přesýpací hodiny (stálé hry +25 % na 2 h)", "Hourglass (endless games +25% for 2 h)", "Sanduhr (Endlosspiele +25 % für 2 Std.)", "Песочные часы (вечные игры +25 % на 2 ч)")),
  bonus("wheel-token", "🎡", { wood: 3, silver: 1 }, { kind: "wheel" }, n("Žeton na kolo (otočka navíc)", "Wheel token (extra spin)", "Rad-Chip (Extra-Dreh)", "Жетон колеса (лишний поворот)")),
  bonus("shield", "🛡️", { wood: 2, iron: 2 }, { kind: "shield" }, n("Štít série (kvízy ve stálých hrách)", "Streak shield (quizzes in endless games)", "Serienschild (Quiz in Endlosspielen)", "Щит серии (викторины в вечных играх)")),

  // --- Avatary (jen z craftění, z materiálů svého světa) ---
  unlock("avatar-star-wanderer", "avatar", "vesmir", "avatar", "star-wanderer", "🧑‍🚀", worldCost("vesmir", 6, 3, 1), n("Hvězdný poutník", "Star wanderer", "Sternenwanderer", "Звёздный странник"), "avatar-craft-star-wanderer"),
  unlock("avatar-coral-guardian", "avatar", "more", "avatar", "coral-guardian", "🧜", worldCost("more", 6, 3, 1), n("Korálový strážce", "Coral guardian", "Korallenwächter", "Коралловый страж"), "avatar-craft-coral-guardian"),
  unlock("avatar-forest-spirit", "avatar", "les", "avatar", "forest-spirit", "🌳", worldCost("les", 6, 3, 1), n("Lesní duch", "Forest spirit", "Waldgeist", "Лесной дух"), "avatar-craft-forest-spirit"),
  unlock("avatar-blacksmith", "avatar", "hrad", "avatar", "blacksmith", "⚒️", worldCost("hrad", 6, 3, 1), n("Hradní kovář", "Castle blacksmith", "Burgschmied", "Замковый кузнец"), "avatar-craft-blacksmith"),
  unlock("avatar-moon-witch", "avatar", "kouzla", "avatar", "moon-witch", "🧙", worldCost("kouzla", 6, 3, 1), n("Měsíční čarodějka", "Moon witch", "Mondhexe", "Лунная колдунья"), "avatar-craft-moon-witch"),

  // --- Ozdoby profilu (tituly a pozadí fungují hned) ---
  unlock("title-comet-maker", "profile", "vesmir", "title", "comet-maker", "🏷️", worldCost("vesmir", 3, 1), n("Titul: Strůjce komet", "Title: Comet maker", "Titel: Kometenschmied", "Титул: Творец комет")),
  unlock("title-tide-master", "profile", "more", "title", "tide-master", "🏷️", worldCost("more", 3, 1), n("Titul: Pán přílivu", "Title: Master of tides", "Titel: Herr der Gezeiten", "Титул: Повелитель приливов")),
  unlock("title-forest-voice", "profile", "les", "title", "forest-voice", "🏷️", worldCost("les", 3, 1), n("Titul: Hlas lesa", "Title: Voice of the forest", "Titel: Stimme des Waldes", "Титул: Голос леса")),
  unlock("title-master-smith", "profile", "hrad", "title", "master-smith", "🏷️", worldCost("hrad", 3, 1), n("Titul: Mistr kovář", "Title: Master smith", "Titel: Schmiedemeister", "Титул: Мастер-кузнец")),
  unlock("title-alchemist", "profile", "kouzla", "title", "alchemist", "🏷️", worldCost("kouzla", 3, 1), n("Titul: Alchymista", "Title: Alchemist", "Titel: Alchemist", "Титул: Алхимик")),
  unlock("banner-craft-nebula", "profile", "vesmir", "banner", "craft-nebula", "🖼️", worldCost("vesmir", 4, 2), n("Pozadí: Mlhovina", "Banner: Nebula", "Hintergrund: Nebel", "Фон: Туманность"), "banner-craft-nebula"),
  unlock("banner-craft-reef", "profile", "more", "banner", "craft-reef", "🖼️", worldCost("more", 4, 2), n("Pozadí: Korálový útes", "Banner: Coral reef", "Hintergrund: Korallenriff", "Фон: Коралловый риф"), "banner-craft-reef"),
  unlock("banner-craft-grove", "profile", "les", "banner", "craft-grove", "🖼️", worldCost("les", 4, 2), n("Pozadí: Prastarý háj", "Banner: Ancient grove", "Hintergrund: Uralter Hain", "Фон: Древняя роща"), "banner-craft-grove"),
  unlock("banner-craft-forge", "profile", "hrad", "banner", "craft-forge", "🖼️", worldCost("hrad", 4, 2), n("Pozadí: Kovárna", "Banner: Forge", "Hintergrund: Schmiede", "Фон: Кузница"), "banner-craft-forge"),
  unlock("banner-craft-moonlight", "profile", "kouzla", "banner", "craft-moonlight", "🖼️", worldCost("kouzla", 4, 2), n("Pozadí: Měsíční svit", "Banner: Moonlight", "Hintergrund: Mondschein", "Фон: Лунный свет"), "banner-craft-moonlight"),

  // --- Doplňky na avatara (zatím jen pojmenované, čekají na 3D model) ---
  named("antenna-helmet", "avatar-acc", "vesmir", "🪖", worldCost("vesmir", 4, 2, 1), n("Helma s anténkou", "Antenna helmet", "Antennenhelm", "Шлем с антенной")),
  named("pearl-necklace", "avatar-acc", "more", "📿", worldCost("more", 4, 2, 1), n("Perlový náhrdelník", "Pearl necklace", "Perlenkette", "Жемчужное ожерелье")),
  named("leaf-wreath", "avatar-acc", "les", "🌿", worldCost("les", 4, 2, 1), n("Věnec z listí", "Leaf wreath", "Blätterkranz", "Венок из листьев")),
  named("knight-helmet", "avatar-acc", "hrad", "⛑️", worldCost("hrad", 4, 2, 1), n("Rytířská přilba", "Knight's helmet", "Ritterhelm", "Рыцарский шлем")),
  named("witch-hat", "avatar-acc", "kouzla", "🎩", worldCost("kouzla", 4, 2, 1), n("Čarodějný klobouk", "Witch hat", "Hexenhut", "Колдовская шляпа")),
  named("cape-of-stars", "avatar-acc", "vesmir", "🦸", worldCost("vesmir", 0, 3, 1, 1), n("Hvězdný plášť", "Cape of stars", "Sternenumhang", "Звёздный плащ")),
  named("dragon-wings", "avatar-acc", "kouzla", "🪽", worldCost("kouzla", 0, 3, 1, 1), n("Dračí křídla", "Dragon wings", "Drachenflügel", "Драконьи крылья")),

  // --- Doplňky pro mazlíčky ---
  named("pet-spacesuit", "pet-acc", "vesmir", "👨‍🚀", worldCost("vesmir", 3, 2), n("Skafandr pro mazlíčka", "Pet spacesuit", "Raumanzug für Haustiere", "Скафандр для питомца")),
  named("pet-sailor-collar", "pet-acc", "more", "⚓", worldCost("more", 3, 2), n("Námořnický obojek", "Sailor collar", "Matrosenhalsband", "Матросский ошейник")),
  named("pet-acorn-cap", "pet-acc", "les", "🌰", worldCost("les", 3, 2), n("Žaludová čepička", "Acorn cap", "Eichelmütze", "Шапочка-жёлудь")),
  named("pet-knight-cape", "pet-acc", "hrad", "🛡️", worldCost("hrad", 3, 2), n("Rytířský plášť pro mazlíčka", "Pet knight cape", "Ritterumhang für Haustiere", "Рыцарский плащ для питомца")),
  named("pet-star-collar", "pet-acc", "kouzla", "⭐", worldCost("kouzla", 3, 2), n("Hvězdný obojek", "Star collar", "Sternenhalsband", "Звёздный ошейник")),

  // --- Do pokoje ---
  named("room-solar-system", "room", "vesmir", "🪐", worldCost("vesmir", 5, 3, 1), n("Model sluneční soustavy", "Solar system model", "Sonnensystem-Modell", "Модель Солнечной системы")),
  named("room-ship-wheel", "room", "more", "☸️", worldCost("more", 5, 3, 1), n("Lodní kormidlo", "Ship's wheel", "Steuerrad", "Штурвал")),
  named("room-bonsai", "room", "les", "🪴", worldCost("les", 5, 3, 1), n("Bonsaj", "Bonsai", "Bonsai", "Бонсай")),
  named("room-armor-stand", "room", "hrad", "🛡️", worldCost("hrad", 5, 3, 1), n("Brnění na stojanu", "Armour stand", "Rüstungsständer", "Доспехи на подставке")),
  named("room-cauldron", "room", "kouzla", "🫕", worldCost("kouzla", 5, 3, 1), n("Kotlík s lektvarem", "Potion cauldron", "Zaubertrankkessel", "Котёл с зельем")),
];

const RECIPE_BY_ID = new Map(RECIPES.map((r) => [r.id, r]));
export const recipeDef = (id: string) => RECIPE_BY_ID.get(id);

/** Klíč v tabulce Unlock pro vyrobenou věc (u bonusů žádný, ty jsou v inventáři). */
export function unlockKey(r: Recipe): string | null {
  switch (r.output) {
    case "avatar":
      return `avatar:${r.ref}`;
    case "title":
      return `title:${r.ref}`;
    case "banner":
      return `banner:${r.ref}`;
    case "named":
      return `craft:${r.ref}`;
    default:
      return null;
  }
}

// --- získávání materiálů ---

export const BUY_PRICE: Partial<Record<Rarity, number>> = { common: 15, uncommon: 40 };
export const BUY_PER_DAY = 10;
/** Kolik XP je potřeba na jeden materiál z učení. */
export const XP_PER_DROP = 10;
/** Kolik materiálů dá jedna vybraná odměna ze stálých her. */
export const QUEST_DROPS = 2;
/** Podíl světových materiálů z učení (zbytek jsou obecné). */
export const WORLD_SHARE = 0.6;
/** Kolik událostí se zpracuje najednou (zbytek při dalším otevření). */
export const PROCESS_BATCH = 200;

// Šance na vzácnost (součet 1). Lepší výsledek (víc XP najednou) a úkoly ze stálých her mají lepší šance.
export const ODDS: Record<"normal" | "good" | "quest", Record<Rarity, number>> = {
  normal: { common: 0.7, uncommon: 0.22, rare: 0.07, epic: 0.01 },
  good: { common: 0.55, uncommon: 0.3, rare: 0.12, epic: 0.03 },
  quest: { common: 0.35, uncommon: 0.4, rare: 0.2, epic: 0.05 },
};
export const GOOD_RESULT_XP = 30;

export const STARTER_PACK: Record<string, number> = { wood: 5, iron: 2 };
export const STARTER_WORLD = 4; // + 4 běžné materiály zvoleného světa

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // Promíchání (finalizér z murmur3): texty lišící se jen posledním znakem jinak dávají podobná čísla.
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}
/** Deterministické „náhodné“ číslo 0..1 z textu: stejná událost dá vždycky stejný materiál. */
const roll = (seed: string) => hash(seed) / 4294967296;

export function rollRarity(odds: Record<Rarity, number>, r: number): Rarity {
  let acc = 0;
  for (const rar of RARITIES) {
    acc += odds[rar];
    if (r < acc) return rar;
  }
  return "common";
}

/** Materiály za jednu XP událost (učení). */
export function dropsForXp(eventId: string, amount: number, focus: ThemedWorld): string[] {
  const count = Math.floor(Math.max(0, amount) / XP_PER_DROP) + (amount > 0 && amount % XP_PER_DROP >= XP_PER_DROP / 2 ? 1 : 0);
  const odds = amount >= GOOD_RESULT_XP ? ODDS.good : ODDS.normal;
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const world: World = roll(`${eventId}|w|${i}`) < WORLD_SHARE ? focus : "obecne";
    out.push(materialOf(world, rollRarity(odds, roll(`${eventId}|r|${i}`))).id);
  }
  return out;
}

/** Materiály za vybranou odměnu ve stálých hrách: jeden světový a jeden obecný, lepší šance. */
export function dropsForQuest(eventId: string, focus: ThemedWorld): string[] {
  return Array.from({ length: QUEST_DROPS }, (_, i) => materialOf(i === 0 ? focus : "obecne", rollRarity(ODDS.quest, roll(`${eventId}|q|${i}`))).id);
}

// --- stav ---

export type ActiveBoost = { kind: "xp" | "endless"; pct: number; until: number };

export type CraftState = {
  v: 1;
  focus: ThemedWorld;
  mats: Record<string, number>;
  inv: Record<string, number>;
  boosts: ActiveBoost[];
  /** Čas (ms) poslední zpracované XP události / odměny ze stálých her. */
  xpCursor: number;
  questCursor: number;
  bought: { day: string; count: number };
  /** Materiály získané od posledního otevření (pro oznámení „Nové materiály“). */
  lastGain: Record<string, number>;
};

export const CRAFT_GAME = "craft";
export const MAX_STACK = 9999;

const int = (v: unknown, max = MAX_STACK) => (typeof v === "number" && Number.isFinite(v) ? Math.max(0, Math.min(max, Math.floor(v))) : 0);
const obj = (v: unknown) => (v && typeof v === "object" ? (v as Record<string, unknown>) : {});
const dayKey = (now: number) => new Date(now).toISOString().slice(0, 10);

export function emptyCraft(now: number, focus: ThemedWorld = "vesmir"): CraftState {
  const mats: Record<string, number> = { ...STARTER_PACK };
  const c = materialOf(focus, "common").id;
  mats[c] = (mats[c] ?? 0) + STARTER_WORLD;
  return { v: 1, focus, mats, inv: {}, boosts: [], xpCursor: now, questCursor: now, bought: { day: dayKey(now), count: 0 }, lastGain: {} };
}

export function normalizeCraft(raw: unknown, now: number): CraftState | null {
  const r = obj(raw);
  if (r.v !== 1) return null;
  const mats: Record<string, number> = {};
  for (const [k, v] of Object.entries(obj(r.mats))) if (MATERIAL_BY_ID.has(k) && int(v) > 0) mats[k] = int(v);
  const inv: Record<string, number> = {};
  for (const [k, v] of Object.entries(obj(r.inv))) if (RECIPE_BY_ID.get(k)?.output === "bonus" && int(v) > 0) inv[k] = int(v);
  const lastGain: Record<string, number> = {};
  for (const [k, v] of Object.entries(obj(r.lastGain))) if (MATERIAL_BY_ID.has(k) && int(v) > 0) lastGain[k] = int(v);
  const boosts: ActiveBoost[] = Array.isArray(r.boosts)
    ? r.boosts
        .map(obj)
        .filter((b) => (b.kind === "xp" || b.kind === "endless") && typeof b.pct === "number" && typeof b.until === "number" && b.until > now)
        .map((b) => ({ kind: b.kind as "xp" | "endless", pct: Math.max(0, Number(b.pct)), until: Number(b.until) }))
    : [];
  const bought = obj(r.bought);
  return {
    v: 1,
    focus: isThemedWorld(r.focus) ? r.focus : "vesmir",
    mats,
    inv,
    boosts,
    xpCursor: int(r.xpCursor, Number.MAX_SAFE_INTEGER),
    questCursor: int(r.questCursor, Number.MAX_SAFE_INTEGER),
    bought: typeof bought.day === "string" && bought.day === dayKey(now) ? { day: bought.day, count: int(bought.count, 1000) } : { day: dayKey(now), count: 0 },
    lastGain,
  };
}

export function addMaterials(state: CraftState, ids: string[]): CraftState {
  if (ids.length === 0) return state;
  const mats = { ...state.mats };
  const lastGain = { ...state.lastGain };
  for (const id of ids) {
    if (!MATERIAL_BY_ID.has(id)) continue;
    mats[id] = Math.min(MAX_STACK, (mats[id] ?? 0) + 1);
    lastGain[id] = (lastGain[id] ?? 0) + 1;
  }
  return { ...state, mats, lastGain };
}

export type XpEventLite = { id: string; amount: number; at: number };

/** Připíše materiály za nové XP události a odměny ze stálých her (seřazené podle času) a posune ukazatele. */
export function applyEvents(state: CraftState, xp: XpEventLite[], quests: XpEventLite[]): CraftState {
  let next = state;
  let xpCursor = state.xpCursor;
  for (const e of xp) {
    if (e.at <= state.xpCursor) continue;
    next = addMaterials(next, dropsForXp(e.id, e.amount, state.focus));
    xpCursor = Math.max(xpCursor, e.at);
  }
  let questCursor = state.questCursor;
  for (const e of quests) {
    if (e.at <= state.questCursor) continue;
    next = addMaterials(next, dropsForQuest(e.id, state.focus));
    questCursor = Math.max(questCursor, e.at);
  }
  return xpCursor === state.xpCursor && questCursor === state.questCursor ? next : { ...next, xpCursor, questCursor };
}

// --- akce ---

export type CraftError = "unknown" | "not-ready" | "missing" | "owned" | "limit" | "cap" | "none" | "points";
export type ActionResult<T = object> = ({ ok: true; state: CraftState } & T) | { ok: false; error: CraftError };

export const canAfford = (state: CraftState, cost: Recipe["cost"]) => Object.entries(cost).every(([id, c]) => (state.mats[id] ?? 0) >= (c ?? 0));

function pay(state: CraftState, cost: Recipe["cost"]): CraftState {
  const mats = { ...state.mats };
  for (const [id, c] of Object.entries(cost)) {
    mats[id] = (mats[id] ?? 0) - (c ?? 0);
    if (mats[id] <= 0) delete mats[id];
  }
  return { ...state, mats };
}

/** Vyrobí recept. Odemčení (avatar, titul, pozadí, doplněk) zapíše server do tabulky Unlock podle `unlock`. */
export function craft(state: CraftState, recipeId: string, owned: string[]): ActionResult<{ recipe: Recipe; unlock: string | null }> {
  const recipe = recipeDef(recipeId);
  if (!recipe) return { ok: false, error: "unknown" };
  if (!recipe.ready) return { ok: false, error: "not-ready" };
  const key = unlockKey(recipe);
  if (key && owned.includes(key)) return { ok: false, error: "owned" };
  if (!canAfford(state, recipe.cost)) return { ok: false, error: "missing" };
  let next = pay(state, recipe.cost);
  if (recipe.output === "bonus") next = { ...next, inv: { ...next.inv, [recipe.id]: Math.min(MAX_STACK, (next.inv[recipe.id] ?? 0) + 1) } };
  return { ok: true, state: next, recipe, unlock: key };
}

export function activeTotal(state: CraftState, kind: "xp" | "endless", now: number): number {
  const sum = state.boosts.filter((b) => b.kind === kind && b.until > now).reduce((s, b) => s + b.pct, 0);
  return Math.min(kind === "xp" ? MAX_XP_BOOST : MAX_ENDLESS_BOOST, sum);
}

/**
 * Použije bonus z inventáře. Časové bonusy se sčítají až do stropu (MAX_XP_BOOST / MAX_ENDLESS_BOOST); když je strop
 * plný, bonus se nepoužije (aby se neplýtvalo). Body, otočku kola a štít provede server podle `effect`.
 */
export function activate(state: CraftState, recipeId: string, now: number): ActionResult<{ effect: BonusEffect }> {
  const recipe = recipeDef(recipeId);
  if (!recipe || recipe.output !== "bonus" || !recipe.effect) return { ok: false, error: "unknown" };
  if ((state.inv[recipeId] ?? 0) <= 0) return { ok: false, error: "none" };
  const effect = recipe.effect;
  const inv = { ...state.inv, [recipeId]: state.inv[recipeId] - 1 };
  if (inv[recipeId] <= 0) delete inv[recipeId];
  let boosts = state.boosts.filter((b) => b.until > now);
  if (effect.kind === "xp" || effect.kind === "endless") {
    const cap = effect.kind === "xp" ? MAX_XP_BOOST : MAX_ENDLESS_BOOST;
    if (activeTotal(state, effect.kind, now) >= cap) return { ok: false, error: "cap" };
    boosts = [...boosts, { kind: effect.kind, pct: effect.pct, until: now + effect.minutes * 60_000 }];
  }
  return { ok: true, state: { ...state, inv, boosts }, effect };
}

/** 3 kusy materiálu = 1 kus další vzácnosti stejného světa. */
export const REFINE_COST = 3;
export function refine(state: CraftState, materialId: string, times = 1): ActionResult<{ made: string }> {
  const def = materialDef(materialId);
  if (!def) return { ok: false, error: "unknown" };
  const up = nextRarity(def.rarity);
  if (!up) return { ok: false, error: "unknown" };
  const t = Math.max(1, Math.min(100, Math.floor(times)));
  if ((state.mats[materialId] ?? 0) < REFINE_COST * t) return { ok: false, error: "missing" };
  const made = materialOf(def.world, up).id;
  const mats = { ...state.mats, [materialId]: state.mats[materialId] - REFINE_COST * t, [made]: Math.min(MAX_STACK, (state.mats[made] ?? 0) + t) };
  if (mats[materialId] <= 0) delete mats[materialId];
  return { ok: true, state: { ...state, mats }, made };
}

/** Nákup za body: jen běžné a neobvyklé materiály, nejvýš BUY_PER_DAY kusů denně. Body odečte server. */
export function buy(state: CraftState, materialId: string, count: number, points: number, now: number): ActionResult<{ price: number }> {
  const def = materialDef(materialId);
  const unit = def ? BUY_PRICE[def.rarity] : undefined;
  if (!def || !unit) return { ok: false, error: "unknown" };
  const c = Math.max(1, Math.min(BUY_PER_DAY, Math.floor(count)));
  const bought = state.bought.day === dayKey(now) ? state.bought : { day: dayKey(now), count: 0 };
  if (bought.count + c > BUY_PER_DAY) return { ok: false, error: "limit" };
  const price = unit * c;
  if (points < price) return { ok: false, error: "points" };
  const mats = { ...state.mats, [materialId]: Math.min(MAX_STACK, (state.mats[materialId] ?? 0) + c) };
  return { ok: true, state: { ...state, mats, bought: { day: bought.day, count: bought.count + c } }, price };
}

export function setFocus(state: CraftState, world: unknown): ActionResult {
  if (!isThemedWorld(world)) return { ok: false, error: "unknown" };
  return { ok: true, state: { ...state, focus: world } };
}
