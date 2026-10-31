import type { Locale } from "@/i18n/config";

export type EarsKind = "none" | "cat" | "bear" | "fox" | "antenna" | "horns" | "crown" | "band" | "hair";
export type EyesKind = "dots" | "big" | "visor" | "one" | "sleepy" | "goggles";
export type MouthKind = "smile" | "open" | "teeth" | "cat" | "flat";
export type HeadKind = "round" | "box" | "ghost";

export type AvatarDef = {
  id: string;
  bg: string;
  skin: string;
  head: HeadKind;
  ears: EarsKind;
  eyes: EyesKind;
  mouth: MouthKind;
  // Odemkne se na této úrovni, nebo speciální událostí (zatím nedostupné).
  unlock: { level: number } | { event: string };
  names: Record<Locale, string>;
};

export const AVATARS: AvatarDef[] = [
  { id: "robot", bg: "#8fd0ff", skin: "#d9e2ee", head: "box", ears: "antenna", eyes: "visor", mouth: "flat", unlock: { level: 1 }, names: { cs: "Robot", en: "Robot", de: "Roboter", ru: "Робот" } },
  { id: "cat", bg: "#ffc933", skin: "#ffb26b", head: "round", ears: "cat", eyes: "dots", mouth: "cat", unlock: { level: 1 }, names: { cs: "Kočka", en: "Cat", de: "Katze", ru: "Кошка" } },
  { id: "alien", bg: "#7ee0b0", skin: "#9be15d", head: "round", ears: "antenna", eyes: "big", mouth: "smile", unlock: { level: 2 }, names: { cs: "Vetřelec", en: "Alien", de: "Alien", ru: "Пришелец" } },
  { id: "ghost", bg: "#c9b8ff", skin: "#ffffff", head: "ghost", ears: "none", eyes: "dots", mouth: "open", unlock: { level: 3 }, names: { cs: "Duch", en: "Ghost", de: "Geist", ru: "Призрак" } },
  { id: "fox", bg: "#ff8a6b", skin: "#ff9d3d", head: "round", ears: "fox", eyes: "dots", mouth: "smile", unlock: { level: 5 }, names: { cs: "Liška", en: "Fox", de: "Fuchs", ru: "Лиса" } },
  { id: "owl", bg: "#f2d58a", skin: "#b98a5a", head: "round", ears: "horns", eyes: "big", mouth: "flat", unlock: { level: 7 }, names: { cs: "Sova", en: "Owl", de: "Eule", ru: "Сова" } },
  { id: "panda", bg: "#b8e3a6", skin: "#fbfbfb", head: "round", ears: "bear", eyes: "sleepy", mouth: "smile", unlock: { level: 10 }, names: { cs: "Panda", en: "Panda", de: "Panda", ru: "Панда" } },
  { id: "dragon", bg: "#ff6f91", skin: "#44c27a", head: "round", ears: "horns", eyes: "dots", mouth: "teeth", unlock: { level: 13 }, names: { cs: "Drak", en: "Dragon", de: "Drache", ru: "Дракон" } },
  { id: "ninja", bg: "#9aa4c4", skin: "#ffd5a8", head: "round", ears: "band", eyes: "sleepy", mouth: "flat", unlock: { level: 16 }, names: { cs: "Nindža", en: "Ninja", de: "Ninja", ru: "Ниндзя" } },
  { id: "king", bg: "#ffd24d", skin: "#ffd5a8", head: "round", ears: "crown", eyes: "dots", mouth: "smile", unlock: { level: 20 }, names: { cs: "Král", en: "King", de: "König", ru: "Король" } },
  { id: "founder", bg: "#5a6cff", skin: "#ffe3b0", head: "round", ears: "crown", eyes: "one", mouth: "open", unlock: { event: "founder" }, names: { cs: "Zakladatel", en: "Founder", de: "Gründer", ru: "Основатель" } },
  { id: "chemik", bg: "#7ee0b0", skin: "#ffd5a8", head: "round", ears: "hair", eyes: "goggles", mouth: "smile", unlock: { event: "escape-lab" }, names: { cs: "Chemik", en: "Chemist", de: "Chemiker", ru: "Химик" } },
  { id: "winter", bg: "#d6efff", skin: "#ffffff", head: "round", ears: "bear", eyes: "big", mouth: "teeth", unlock: { event: "winter" }, names: { cs: "Zimní", en: "Winter", de: "Winter", ru: "Зимний" } },
  { id: "astronaut", bg: "#243b7a", skin: "#eef1f7", head: "round", ears: "antenna", eyes: "visor", mouth: "smile", unlock: { event: "shop" }, names: { cs: "Astronaut", en: "Astronaut", de: "Astronaut", ru: "Астронавт" } },
  { id: "pirate", bg: "#7fd0e8", skin: "#ffd5a8", head: "round", ears: "band", eyes: "one", mouth: "teeth", unlock: { event: "shop" }, names: { cs: "Pirát", en: "Pirate", de: "Pirat", ru: "Пират" } },
  { id: "captain", bg: "#d6362b", skin: "#ffd5a8", head: "round", ears: "crown", eyes: "one", mouth: "teeth", unlock: { event: "shop" }, names: { cs: "Kapitán", en: "Captain", de: "Kapitän", ru: "Капитан" } },
  { id: "sea-wolf", bg: "#3b7be0", skin: "#e0b48a", head: "round", ears: "band", eyes: "goggles", mouth: "flat", unlock: { event: "shop" }, names: { cs: "Mořský vlk", en: "Sea wolf", de: "Seebär", ru: "Морской волк" } },
  { id: "mermaid", bg: "#7ee0d0", skin: "#ffd5a8", head: "round", ears: "hair", eyes: "big", mouth: "smile", unlock: { event: "shop" }, names: { cs: "Mořská panna", en: "Mermaid", de: "Meerjungfrau", ru: "Русалка" } },
  { id: "wizard", bg: "#7a5cff", skin: "#ffd5a8", head: "round", ears: "horns", eyes: "big", mouth: "open", unlock: { event: "shop" }, names: { cs: "Čaroděj", en: "Wizard", de: "Zauberer", ru: "Волшебник" } },
  { id: "fairy", bg: "#e6c8ff", skin: "#ffe0c8", head: "round", ears: "hair", eyes: "big", mouth: "smile", unlock: { event: "shop" }, names: { cs: "Víla", en: "Fairy", de: "Fee", ru: "Фея" } },
  { id: "ranger", bg: "#b8e3a6", skin: "#e8c8a0", head: "round", ears: "band", eyes: "dots", mouth: "smile", unlock: { event: "shop" }, names: { cs: "Hajný", en: "Ranger", de: "Förster", ru: "Лесник" } },
  { id: "knight", bg: "#c9ced8", skin: "#ffd5a8", head: "box", ears: "none", eyes: "visor", mouth: "flat", unlock: { event: "shop" }, names: { cs: "Rytíř", en: "Knight", de: "Ritter", ru: "Рыцарь" } },
  { id: "princess", bg: "#ffc2e0", skin: "#ffe0c8", head: "round", ears: "crown", eyes: "big", mouth: "smile", unlock: { event: "shop" }, names: { cs: "Princezna", en: "Princess", de: "Prinzessin", ru: "Принцесса" } },
  { id: "diver", bg: "#7fd0e8", skin: "#ffd5a8", head: "round", ears: "none", eyes: "goggles", mouth: "open", unlock: { event: "shop" }, names: { cs: "Potápěč", en: "Diver", de: "Taucher", ru: "Водолаз" } },
  { id: "octopus", bg: "#d6a8ff", skin: "#a86ad8", head: "ghost", ears: "none", eyes: "big", mouth: "open", unlock: { event: "shop" }, names: { cs: "Chobotnice", en: "Octopus", de: "Krake", ru: "Осьминог" } },
  { id: "pumpkin", bg: "#ffb259", skin: "#ff8a1f", head: "round", ears: "none", eyes: "dots", mouth: "teeth", unlock: { event: "shop" }, names: { cs: "Dýně", en: "Pumpkin", de: "Kürbis", ru: "Тыква" } },

  // --- zvířata ---
  { id: "frog", bg: "#c9f0a8", skin: "#6fcf5a", head: "round", ears: "none", eyes: "big", mouth: "smile", unlock: { level: 4 }, names: { cs: "Žabák", en: "Frog", de: "Frosch", ru: "Лягушонок" } },
  { id: "penguin", bg: "#bfe6ff", skin: "#2d3a5c", head: "round", ears: "none", eyes: "dots", mouth: "open", unlock: { level: 6 }, names: { cs: "Tučňák", en: "Penguin", de: "Pinguin", ru: "Пингвин" } },
  { id: "unicorn", bg: "#ffd0ec", skin: "#fff4fb", head: "round", ears: "horns", eyes: "sleepy", mouth: "smile", unlock: { level: 8 }, names: { cs: "Jednorožec", en: "Unicorn", de: "Einhorn", ru: "Единорог" } },
  { id: "koala", bg: "#d9e4ef", skin: "#b8bfc9", head: "round", ears: "bear", eyes: "dots", mouth: "flat", unlock: { level: 9 }, names: { cs: "Koala", en: "Koala", de: "Koala", ru: "Коала" } },
  { id: "llama", bg: "#ffe7b3", skin: "#f3dcc0", head: "round", ears: "cat", eyes: "sleepy", mouth: "cat", unlock: { level: 11 }, names: { cs: "Lama", en: "Llama", de: "Lama", ru: "Лама" } },
  { id: "octopus", bg: "#e3c8ff", skin: "#c06bd8", head: "ghost", ears: "none", eyes: "big", mouth: "open", unlock: { level: 12 }, names: { cs: "Chobotnice", en: "Octopus", de: "Krake", ru: "Осьминог" } },
  { id: "capybara", bg: "#f0dcb8", skin: "#b0804f", head: "box", ears: "bear", eyes: "sleepy", mouth: "flat", unlock: { level: 14 }, names: { cs: "Kapybara", en: "Capybara", de: "Wasserschwein", ru: "Капибара" } },
  { id: "yeti", bg: "#d8f0ff", skin: "#f4fbff", head: "round", ears: "bear", eyes: "one", mouth: "teeth", unlock: { level: 22 }, names: { cs: "Yetti", en: "Yeti", de: "Yeti", ru: "Йети" } },

  // --- povolání ---
  { id: "doctor", bg: "#c9f3ee", skin: "#ffd5a8", head: "round", ears: "band", eyes: "dots", mouth: "smile", unlock: { level: 15 }, names: { cs: "Doktor", en: "Doctor", de: "Arzt", ru: "Доктор" } },
  { id: "chef", bg: "#ffe0c2", skin: "#ffd5a8", head: "round", ears: "hair", eyes: "dots", mouth: "smile", unlock: { event: "escape-kitchen" }, names: { cs: "Kuchař", en: "Chef", de: "Koch", ru: "Повар" } },
  { id: "firefighter", bg: "#ff9b8a", skin: "#ffd5a8", head: "round", ears: "crown", eyes: "goggles", mouth: "flat", unlock: { level: 18 }, names: { cs: "Hasič", en: "Firefighter", de: "Feuerwehrmann", ru: "Пожарный" } },
  { id: "detective", bg: "#c4b8a2", skin: "#ffd5a8", head: "round", ears: "band", eyes: "goggles", mouth: "flat", unlock: { level: 24 }, names: { cs: "Detektiv", en: "Detective", de: "Detektiv", ru: "Детектив" } },
  { id: "pilot", bg: "#9fd2ff", skin: "#ffd5a8", head: "round", ears: "band", eyes: "visor", mouth: "smile", unlock: { level: 26 }, names: { cs: "Pilot", en: "Pilot", de: "Pilot", ru: "Пилот" } },
  { id: "inventor", bg: "#fff0a8", skin: "#ffd5a8", head: "round", ears: "hair", eyes: "goggles", mouth: "open", unlock: { level: 28 }, names: { cs: "Vynálezce", en: "Inventor", de: "Erfinder", ru: "Изобретатель" } },
  { id: "archaeologist", bg: "#e8cf9b", skin: "#e0b48a", head: "round", ears: "band", eyes: "dots", mouth: "smile", unlock: { event: "escape-museum" }, names: { cs: "Archeolog", en: "Archaeologist", de: "Archäologe", ru: "Археолог" } },
  { id: "sailor", bg: "#a8d8f0", skin: "#ffd5a8", head: "round", ears: "band", eyes: "dots", mouth: "teeth", unlock: { event: "escape-pirate" }, names: { cs: "Námořník", en: "Sailor", de: "Seemann", ru: "Моряк" } },
  { id: "explorer", bg: "#f2d9a0", skin: "#e0b48a", head: "round", ears: "band", eyes: "goggles", mouth: "smile", unlock: { event: "escape-expedition" }, names: { cs: "Cestovatel", en: "Explorer", de: "Entdecker", ru: "Путешественник" } },
  { id: "ranger", bg: "#b8e3a6", skin: "#ffd5a8", head: "round", ears: "hair", eyes: "dots", mouth: "smile", unlock: { event: "escape-jungle" }, names: { cs: "Hajný", en: "Ranger", de: "Förster", ru: "Лесник" } },
  { id: "knight", bg: "#c8cfe0", skin: "#dfe5f0", head: "box", ears: "crown", eyes: "visor", mouth: "flat", unlock: { level: 36 }, names: { cs: "Rytíř", en: "Knight", de: "Ritter", ru: "Рыцарь" } },

  // --- fantasy ---
  { id: "fairy", bg: "#ffd9f2", skin: "#ffe1d0", head: "round", ears: "antenna", eyes: "big", mouth: "smile", unlock: { level: 40 }, names: { cs: "Víla", en: "Fairy", de: "Fee", ru: "Фея" } },
  { id: "elf", bg: "#c8f2c0", skin: "#ffe6c8", head: "round", ears: "fox", eyes: "dots", mouth: "smile", unlock: { level: 44 }, names: { cs: "Elf", en: "Elf", de: "Elf", ru: "Эльф" } },
  { id: "dwarf", bg: "#e4c9a8", skin: "#f0b98a", head: "box", ears: "hair", eyes: "dots", mouth: "teeth", unlock: { level: 48 }, names: { cs: "Trpaslík", en: "Dwarf", de: "Zwerg", ru: "Гном" } },
  { id: "vampire", bg: "#c9a6d6", skin: "#f1e8f4", head: "round", ears: "fox", eyes: "sleepy", mouth: "teeth", unlock: { level: 52 }, names: { cs: "Upír", en: "Vampire", de: "Vampir", ru: "Вампир" } },
  { id: "mummy", bg: "#e8dcc0", skin: "#f0e6cc", head: "box", ears: "band", eyes: "one", mouth: "flat", unlock: { level: 56 }, names: { cs: "Mumie", en: "Mummy", de: "Mumie", ru: "Мумия" } },
  { id: "mermaid", bg: "#a8f0e6", skin: "#ffd9c4", head: "round", ears: "hair", eyes: "big", mouth: "smile", unlock: { level: 60 }, names: { cs: "Mořská panna", en: "Mermaid", de: "Meerjungfrau", ru: "Русалка" } },
  { id: "robot-dino", bg: "#b8f0d0", skin: "#58c48a", head: "box", ears: "horns", eyes: "visor", mouth: "teeth", unlock: { level: 66 }, names: { cs: "Robodinosaurus", en: "Robo-dino", de: "Robo-Dino", ru: "Робо-динозавр" } },
  { id: "phoenix", bg: "#ffc29a", skin: "#ff6a3d", head: "round", ears: "crown", eyes: "big", mouth: "open", unlock: { level: 75 }, names: { cs: "Fénix", en: "Phoenix", de: "Phönix", ru: "Феникс" } },
  { id: "cosmic", bg: "#3a2b7a", skin: "#a98bff", head: "ghost", ears: "antenna", eyes: "visor", mouth: "smile", unlock: { level: 90 }, names: { cs: "Kosmický", en: "Cosmic", de: "Kosmisch", ru: "Космический" } },
  // Jen z craftování (profil → Craftování), každý z materiálů svého světa. 3D model zatím není, kreslí se jako SVG.
  { id: "star-wanderer", bg: "#2b2d6e", skin: "#c9d6ff", head: "round", ears: "antenna", eyes: "big", mouth: "smile", unlock: { event: "craft" }, names: { cs: "Hvězdný poutník", en: "Star wanderer", de: "Sternenwanderer", ru: "Звёздный странник" } },
  { id: "coral-guardian", bg: "#3fc1ff", skin: "#ff8a7a", head: "round", ears: "horns", eyes: "goggles", mouth: "smile", unlock: { event: "craft" }, names: { cs: "Korálový strážce", en: "Coral guardian", de: "Korallenwächter", ru: "Коралловый страж" } },
  { id: "forest-spirit", bg: "#6ee7a8", skin: "#a7d36b", head: "ghost", ears: "none", eyes: "sleepy", mouth: "smile", unlock: { event: "craft" }, names: { cs: "Lesní duch", en: "Forest spirit", de: "Waldgeist", ru: "Лесной дух" } },
  { id: "blacksmith", bg: "#c9a27a", skin: "#ffd5a8", head: "box", ears: "band", eyes: "dots", mouth: "teeth", unlock: { event: "craft" }, names: { cs: "Hradní kovář", en: "Castle blacksmith", de: "Burgschmied", ru: "Замковый кузнец" } },
  { id: "moon-witch", bg: "#7c3aed", skin: "#e7dcff", head: "round", ears: "hair", eyes: "big", mouth: "cat", unlock: { event: "craft" }, names: { cs: "Měsíční čarodějka", en: "Moon witch", de: "Mondhexe", ru: "Лунная колдунья" } },
];

export const DEFAULT_AVATAR = "robot";

export function getAvatar(id: string | null | undefined) {
  return AVATARS.find((a) => a.id === id) ?? AVATARS[0];
}

// Událostní avatary se odemykají záznamem v tabulce Unlock (klíč "avatar:<id>").
export function isAvatarUnlocked(avatar: AvatarDef, level: number, unlocks: string[] = []): boolean {
  if ("level" in avatar.unlock) return level >= avatar.unlock.level;
  return unlocks.includes(`avatar:${avatar.id}`);
}
