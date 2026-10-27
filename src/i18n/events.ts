import type { Locale } from "./config";

type L4 = Record<Locale, string>;
const n = (cs: string, en: string, de: string, ru: string): L4 => ({ cs, en, de, ru });

export const EVENT_NAMES: Record<string, L4> = {
  "spring-planting": n("Jarní setba", "Spring planting", "Frühjahrsaussaat", "Весенний сев"),
  meteors: n("Meteorický roj", "Meteor shower", "Meteorschauer", "Метеорный поток"),
  "back-to-school": n("Zpátky do školy", "Back to school", "Zurück zur Schule", "Снова в школу"),
  harvest: n("Dožínky", "Harvest festival", "Erntefest", "Праздник урожая"),
  "animal-day": n("Den zvířat", "Animal day", "Tag der Tiere", "День животных"),
  pumpkin: n("Dýňové slavnosti", "Pumpkin festival", "Kürbisfest", "Тыквенный фестиваль"),
  christmas: n("Vánoční trhy", "Christmas markets", "Weihnachtsmärkte", "Рождественские ярмарки"),
};

export const EVENT_TEXT = {
  focus: n("Hra týdne", "Game of the week", "Spiel der Woche", "Игра недели"),
  title: n("Události", "Events", "Ereignisse", "События"),
  none: n("Teď žádná událost neprobíhá.", "No event is running right now.", "Gerade läuft kein Ereignis.", "Сейчас нет событий."),
  hint: n(
    "Události a hra týdne zvyšují výdělek v jednotlivých hrách (dohromady nejvýš o 30 %).",
    "Events and the game of the week raise income in the games (up to 30 % in total).",
    "Ereignisse und das Spiel der Woche steigern den Ertrag in den Spielen (insgesamt höchstens 30 %).",
    "События и игра недели повышают доход в играх (всего не больше чем на 30 %).",
  ),
  pill: n("Událost +{n} %", "Event +{n} %", "Ereignis +{n} %", "Событие +{n} %"),
  games: {
    base: n("Základna", "Base", "Basis", "База"),
    city: n("Město", "City", "Stadt", "Город"),
    farm: n("Farma", "Farm", "Farm", "Ферма"),
    pets: n("Mazlíčci", "Pets", "Haustiere", "Питомцы"),
  } satisfies Record<string, L4>,
};

export function eventLabel(ids: string[], focus: boolean, locale: Locale): string {
  const names = ids.map((id) => (EVENT_NAMES[id] ?? n(id, id, id, id))[locale]);
  if (focus) names.push(EVENT_TEXT.focus[locale]);
  return names.join(" · ");
}
