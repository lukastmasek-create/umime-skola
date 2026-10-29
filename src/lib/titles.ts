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
  { id: "scholar", unlock: { event: "shop" }, names: { cs: "Učenec", en: "Scholar", de: "Gelehrter", ru: "Учёный" } },
  { id: "bookworm", unlock: { event: "shop" }, names: { cs: "Knihomol", en: "Bookworm", de: "Bücherwurm", ru: "Книголюб" } },
  { id: "mathematician", unlock: { event: "shop" }, names: { cs: "Matematik", en: "Mathematician", de: "Mathematiker", ru: "Математик" } },
  { id: "builder", unlock: { event: "shop" }, names: { cs: "Stavitel", en: "Builder", de: "Baumeister", ru: "Строитель" } },
  { id: "pet-friend", unlock: { event: "shop" }, names: { cs: "Přítel zvířat", en: "Animal friend", de: "Tierfreund", ru: "Друг животных" } },
  { id: "legend", unlock: { event: "shop" }, names: { cs: "Legenda", en: "Legend", de: "Legende", ru: "Легенда" } },
  // Za úroveň.
  { id: "brainiac", unlock: { level: 18 }, names: { cs: "Mozek", en: "Brainiac", de: "Schlauberger", ru: "Умник" } },
  { id: "champion", unlock: { level: 30 }, names: { cs: "Šampion", en: "Champion", de: "Champion", ru: "Чемпион" } },
  { id: "sage", unlock: { level: 50 }, names: { cs: "Mudrc", en: "Sage", de: "Weiser", ru: "Мудрец" } },
  { id: "grandmaster", unlock: { level: 80 }, names: { cs: "Velmistr", en: "Grandmaster", de: "Großmeister", ru: "Гроссмейстер" } },
  // Za únikovky (odemknou se při prvním dokončení místnosti, "escape-master" po dokončení všech).
  { id: "librarian", unlock: { event: "escape-library" }, names: { cs: "Knihovník", en: "Librarian", de: "Bibliothekar", ru: "Библиотекарь" } },
  { id: "astronomer", unlock: { event: "escape-observatory" }, names: { cs: "Astronom", en: "Astronomer", de: "Astronom", ru: "Астроном" } },
  { id: "castellan", unlock: { event: "escape-castle" }, names: { cs: "Kastelán", en: "Castellan", de: "Burgvogt", ru: "Кастелян" } },
  { id: "escape-master", unlock: { event: "escape-all" }, names: { cs: "Mistr útěku", en: "Escape master", de: "Ausbruchsmeister", ru: "Мастер побега" } },
  // Z obchodu.
  { id: "dreamer", unlock: { event: "shop" }, names: { cs: "Snílek", en: "Dreamer", de: "Träumer", ru: "Мечтатель" } },
  { id: "adventurer", unlock: { event: "shop" }, names: { cs: "Dobrodruh", en: "Adventurer", de: "Abenteurer", ru: "Авантюрист" } },
  { id: "captain", unlock: { event: "shop" }, names: { cs: "Kapitán", en: "Captain", de: "Kapitän", ru: "Капитан" } },
  { id: "golden-hook", unlock: { event: "shop" }, names: { cs: "Zlatá ruka", en: "Golden hook", de: "Goldhaken", ru: "Золотой крюк" } },
  { id: "sea-wolf", unlock: { event: "shop" }, names: { cs: "Mořský vlk", en: "Sea wolf", de: "Seebär", ru: "Морской волк" } },
  { id: "treasure-keeper", unlock: { event: "shop" }, names: { cs: "Strážce pokladu", en: "Treasure keeper", de: "Schatzhüter", ru: "Хранитель сокровищ" } },
  { id: "navigator", unlock: { event: "shop" }, names: { cs: "Navigátor", en: "Navigator", de: "Navigator", ru: "Штурман" } },
  { id: "hero", unlock: { event: "shop" }, names: { cs: "Hrdina", en: "Hero", de: "Held", ru: "Герой" } },
];

export function getTitle(id: string | null | undefined) {
  return TITLES.find((t) => t.id === id) ?? null;
}

export function isTitleUnlocked(title: TitleDef, level: number, unlocks: string[]): boolean {
  if ("level" in title.unlock) return level >= title.unlock.level;
  return unlocks.includes(`title:${title.id}`);
}
