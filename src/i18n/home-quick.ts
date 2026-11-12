import { withFallbacks } from "./config";
import type { Locale } from "./config";

// Texty mřížky „Rychlý start“ na úvodní stránce (ikonové dlaždice).
export type HomeQuickText = {
  title: string;
  miniTitle: string;
  items: Record<string, { name: string; tag: string }>;
};

const cs: HomeQuickText = {
  title: "Rychlý start",
  miniTitle: "Hry na procvičení",
  items: {
    courses: { name: "Kurzy", tag: "Procvič po tématech" },
    escape: { name: "Únikovky", tag: "Vyřeš úkoly a vyjdi ven" },
    pets: { name: "Mazlíčci", tag: "Starej se o parťáky" },
    prijimacky: { name: "Přijímačky", tag: "Připrav se na střední" },
    maturita: { name: "Maturita", tag: "Všechny předměty na jednom místě" },
    review: { name: "Opakování", tag: "Procvič, co ti nejde" },
  },
};

const en: HomeQuickText = {
  title: "Quick start",
  miniTitle: "Practice games",
  items: {
    courses: { name: "Courses", tag: "Practise by topic" },
    escape: { name: "Escape rooms", tag: "Solve tasks and get out" },
    pets: { name: "Pets", tag: "Look after your companions" },
    prijimacky: { name: "Entrance exams", tag: "Get ready for secondary school" },
    maturita: { name: "Final exams", tag: "All subjects in one place" },
    review: { name: "Review", tag: "Practise what is hard" },
  },
};

const all = withFallbacks({ cs, en, de: en, ru: en });
export function getHomeQuickText(locale: Locale): HomeQuickText {
  return all[locale];
}
