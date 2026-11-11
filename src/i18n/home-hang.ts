import { withFallbacks } from "./config";
import type { Locale } from "./config";

// Panel se zavěšenými štítky na úvodní stránce (jen dekorativní text).
export type HomeHangText = { title: string; lead: string; tags: string[] };

const cs: HomeHangText = {
  title: "Chyby se dějí každý den",
  lead: "Chybovat je normální, ale s tím správným postupem chaos nevznikne.",
  tags: ["Důkaz, jinak to neplatí", "Skvělý rytmus", "Vše sedí", "Chyba opravena", "Splněno"],
};
const en: HomeHangText = {
  title: "Mistakes happen every day",
  lead: "Getting things wrong is normal, but with the right approach, chaos isn't.",
  tags: ["Proof or it's not real", "Perfect rhythm", "All systems stable", "Fix pushed", "Incidents resolved"],
};
const de: HomeHangText = {
  title: "Fehler passieren jeden Tag",
  lead: "Fehler sind normal, aber mit dem richtigen Vorgehen entsteht kein Chaos.",
  tags: ["Beweis oder es zählt nicht", "Perfekter Rhythmus", "Alles stabil", "Fehler behoben", "Erledigt"],
};
const ru: HomeHangText = {
  title: "Ошибки случаются каждый день",
  lead: "Ошибаться нормально, но при правильном подходе хаоса не будет.",
  tags: ["Докажи, иначе не считается", "Идеальный ритм", "Всё стабильно", "Ошибка исправлена", "Готово"],
};

const all = withFallbacks({ cs, en, de, ru });
export function getHomeHangText(locale: Locale): HomeHangText {
  return all[locale];
}
