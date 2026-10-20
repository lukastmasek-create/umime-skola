import type { Locale } from "@/i18n/config";

export type TitleDef = {
  id: string;
  unlock: { level: number } | { event: string };
  names: Record<Locale, string>;
};

export const TITLES: TitleDef[] = [
  { id: "rookie", unlock: { level: 1 }, names: { cs: "Nováček", en: "Rookie", de: "Neuling", ru: "Новичок" } },
  { id: "explorer", unlock: { level: 5 }, names: { cs: "Průzkumník", en: "Explorer", de: "Entdecker", ru: "Исследователь" } },
  { id: "expert", unlock: { level: 12 }, names: { cs: "Expert", en: "Expert", de: "Experte", ru: "Эксперт" } },
  // Odkaz na fyzika Wernera Heisenberga (princip neurčitosti), titul za Laboratoř.
  { id: "heisenberg", unlock: { event: "escape-lab" }, names: { cs: "Heisenberg", en: "Heisenberg", de: "Heisenberg", ru: "Гейзенберг" } },
];

export function getTitle(id: string | null | undefined) {
  return TITLES.find((t) => t.id === id) ?? null;
}

export function isTitleUnlocked(title: TitleDef, level: number, unlocks: string[]): boolean {
  if ("level" in title.unlock) return level >= title.unlock.level;
  return unlocks.includes(`title:${title.id}`);
}
