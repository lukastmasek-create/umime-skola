import { withFallbacks } from "./config";
import type { Locale } from "./config";

// Panel se zavěšenými štítky na úvodní stránce (jen dekorativní text).
export type HomeHangText = { title: string; lead: string; tags: string[]; feed: string[] };

const cs: HomeHangText = {
  feed: [
    "Našel jsi chybu. Skvělé!",
    "Oprava hotová, jdeš dál",
    "Tentokrát to bylo o vlásek",
    "Série pokračuje: 5 správně v řadě",
    "Z chyby se učíš nejrychleji",
    "Nový pokus, nové štěstí",
    "Mozek právě o kousek povyrostl",
    "Teď už to znáš!",
  ],
  title: "Chyby se dějí každý den",
  lead: "Chybovat je normální, ale s tím správným postupem chaos nevznikne.",
  tags: ["Důkaz, jinak to neplatí", "Skvělý rytmus", "Vše sedí", "Chyba opravena", "Splněno"],
};
const en: HomeHangText = {
  feed: [
    "You spotted a mistake. Nice!",
    "Fixed, on to the next one",
    "That was close this time",
    "Streak continues: 5 right in a row",
    "Mistakes are the fastest teacher",
    "New try, fresh luck",
    "Your brain just grew a little",
    "Now you've got it!",
  ],
  title: "Mistakes happen every day",
  lead: "Getting things wrong is normal, but with the right approach, chaos isn't.",
  tags: ["Proof or it's not real", "Perfect rhythm", "All systems stable", "Fix pushed", "Incidents resolved"],
};
const de: HomeHangText = {
  feed: [
    "Fehler gefunden. Super!",
    "Behoben, weiter geht's",
    "Diesmal war es knapp",
    "Serie läuft: 5 richtig in Folge",
    "Aus Fehlern lernt man am schnellsten",
    "Neuer Versuch, neues Glück",
    "Dein Gehirn ist ein Stück gewachsen",
    "Jetzt sitzt es!",
  ],
  title: "Fehler passieren jeden Tag",
  lead: "Fehler sind normal, aber mit dem richtigen Vorgehen entsteht kein Chaos.",
  tags: ["Beweis oder es zählt nicht", "Perfekter Rhythmus", "Alles stabil", "Fehler behoben", "Erledigt"],
};
const ru: HomeHangText = {
  feed: [
    "Ты нашёл ошибку. Отлично!",
    "Исправлено, идём дальше",
    "В этот раз было близко",
    "Серия продолжается: 5 верно подряд",
    "На ошибках учатся быстрее всего",
    "Новая попытка, новая удача",
    "Мозг стал чуть сильнее",
    "Теперь ты это знаешь!",
  ],
  title: "Ошибки случаются каждый день",
  lead: "Ошибаться нормально, но при правильном подходе хаоса не будет.",
  tags: ["Докажи, иначе не считается", "Идеальный ритм", "Всё стабильно", "Ошибка исправлена", "Готово"],
};

const all = withFallbacks({ cs, en, de, ru });
export function getHomeHangText(locale: Locale): HomeHangText {
  return all[locale];
}
