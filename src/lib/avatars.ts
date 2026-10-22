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
  { id: "wizard", bg: "#7a5cff", skin: "#ffd5a8", head: "round", ears: "horns", eyes: "big", mouth: "open", unlock: { event: "shop" }, names: { cs: "Čaroděj", en: "Wizard", de: "Zauberer", ru: "Волшебник" } },
  { id: "pumpkin", bg: "#ffb259", skin: "#ff8a1f", head: "round", ears: "none", eyes: "dots", mouth: "teeth", unlock: { event: "shop" }, names: { cs: "Dýně", en: "Pumpkin", de: "Kürbis", ru: "Тыква" } },
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
