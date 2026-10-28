// Centrální definice sekcí webu a jazyků/předmětů. Přidání nové položky
// (např. nový jazyk nebo sekci) stačí udělat na jednom místě zde
// (a v prisma/schema.prisma u odpovídajícího enumu).

export type CategorySlug = "zakladni" | "stredni" | "prijimacky" | "maturita";

export const CATEGORIES: {
  slug: CategorySlug;
  value: "ZAKLADNI" | "STREDNI" | "PRIJIMACKY" | "MATURITA";
  label: string;
  description: string;
}[] = [
  {
    slug: "zakladni",
    value: "ZAKLADNI",
    label: "Základní škola",
    description: "Kurzy a procvičování pro žáky základních škol.",
  },
  {
    slug: "stredni",
    value: "STREDNI",
    label: "Střední škola",
    description: "Látka a příprava pro studenty středních škol.",
  },
  {
    slug: "prijimacky",
    value: "PRIJIMACKY",
    label: "Přijímačky",
    description: "Příprava na přijímací zkoušky na střední školy.",
  },
  {
    slug: "maturita",
    value: "MATURITA",
    label: "Maturita",
    description: "Příprava na maturitní zkoušku ze všech předmětů.",
  },
];

export function getCategoryBySlug(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}

export type LanguageCode = "CJ" | "NJ" | "RS" | "AJ";

export const LANGUAGES: { value: LanguageCode; label: string }[] = [
  { value: "CJ", label: "ČJ" },
  { value: "NJ", label: "NJ" },
  { value: "RS", label: "RS" },
  { value: "AJ", label: "AJ" },
];

export type SubjectValue =
  | "CESTINA"
  | "LITERATURA"
  | "ANGLICTINA"
  | "NEMCINA"
  | "RUSTINA"
  | "MATEMATIKA"
  | "DEJEPIS"
  | "ZEMEPIS"
  | "PRIRODOPIS"
  | "FYZIKA";

export const SUBJECTS: { slug: string; value: SubjectValue; emoji: string; color: string }[] = [
  { slug: "cestina", value: "CESTINA", emoji: "📝", color: "#ffc933" },
  { slug: "literatura", value: "LITERATURA", emoji: "📚", color: "#ff9ec7" },
  { slug: "anglictina", value: "ANGLICTINA", emoji: "💬", color: "#8fd0ff" },
  { slug: "nemcina", value: "NEMCINA", emoji: "🥨", color: "#ffb26b" },
  { slug: "rustina", value: "RUSTINA", emoji: "🪆", color: "#ff8a6b" },
  { slug: "matematika", value: "MATEMATIKA", emoji: "➗", color: "#7ee0b0" },
  { slug: "dejepis", value: "DEJEPIS", emoji: "🏛️", color: "#c9b8ff" },
  { slug: "zemepis", value: "ZEMEPIS", emoji: "🌍", color: "#7fdbd8" },
  { slug: "prirodopis", value: "PRIRODOPIS", emoji: "🦎", color: "#b6e36a" },
  { slug: "fyzika", value: "FYZIKA", emoji: "⚛️", color: "#f58fa0" },
];

export function getSubjectBySlug(slug: string | undefined) {
  return SUBJECTS.find((s) => s.slug === slug);
}

// Třídy/ročníky dostupné v jednotlivých sekcích (přijímačky a maturita
// se podle tříd nedělí).
export const GRADES: Record<CategorySlug, number[]> = {
  zakladni: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  stredni: [1, 2, 3, 4],
  prijimacky: [],
  maturita: [],
};
