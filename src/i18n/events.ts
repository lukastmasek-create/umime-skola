import { tr8 } from "./config";
import type { Locale } from "./config";

type L4 = Record<Locale, string>;
const n = (cs: string, en: string, de: string, ru: string, uk?: string, ja?: string, es?: string, fr?: string): L4 =>
  tr8(cs, en, de, ru, uk, ja, es, fr);

export const EVENT_NAMES: Record<string, L4> = {
  "spring-planting": n("Jarní setba", "Spring planting", "Frühjahrsaussaat", "Весенний сев", "Весняний сів", "春の種まき", "Siembra de primavera", "Semis de printemps"),
  meteors: n("Meteorický roj", "Meteor shower", "Meteorschauer", "Метеорный поток", "Метеорний потік", "流星群", "Lluvia de meteoros", "Pluie de météores"),
  "back-to-school": n("Zpátky do školy", "Back to school", "Zurück zur Schule", "Снова в школу", "Знову до школи", "新学期", "Vuelta al cole", "Rentrée des classes"),
  harvest: n("Dožínky", "Harvest festival", "Erntefest", "Праздник урожая", "Свято врожаю", "収穫祭", "Fiesta de la cosecha", "Fête des moissons"),
  "animal-day": n("Den zvířat", "Animal day", "Tag der Tiere", "День животных", "День тварин", "動物の日", "Día de los animales", "Journée des animaux"),
  pumpkin: n("Dýňové slavnosti", "Pumpkin festival", "Kürbisfest", "Тыквенный фестиваль", "Гарбузове свято", "パンプキン祭り", "Fiesta de la calabaza", "Fête de la citrouille"),
  christmas: n("Vánoční trhy", "Christmas markets", "Weihnachtsmärkte", "Рождественские ярмарки", "Різдвяні ярмарки", "クリスマスマーケット", "Mercadillos navideños", "Marchés de Noël"),
};

export const EVENT_TEXT = {
  focus: n("Hra týdne", "Game of the week", "Spiel der Woche", "Игра недели", "Гра тижня", "今週のゲーム", "Juego de la semana", "Jeu de la semaine"),
  title: n("Události", "Events", "Ereignisse", "События", "Події", "イベント", "Eventos", "Événements"),
  none: n("Teď žádná událost neprobíhá.", "No event is running right now.", "Gerade läuft kein Ereignis.", "Сейчас нет событий.", "Зараз жодна подія не триває.", "現在開催中のイベントはありません。", "Ahora mismo no hay ningún evento.", "Aucun événement n'est en cours pour le moment."),
  hint: n(
    "Události a hra týdne zvyšují výdělek v jednotlivých hrách (dohromady nejvýš o 30 %).",
    "Events and the game of the week raise income in the games (up to 30 % in total).",
    "Ereignisse und das Spiel der Woche steigern den Ertrag in den Spielen (insgesamt höchstens 30 %).",
    "События и игра недели повышают доход в играх (всего не больше чем на 30 %).",
    "Події та гра тижня підвищують заробіток в іграх (разом не більше ніж на 30 %).",
    "イベントと今週のゲームは、各ゲームの収入を上げます（合計で最大30％）。",
    "Los eventos y el juego de la semana aumentan los ingresos de los juegos (hasta un 30 % en total).",
    "Les événements et le jeu de la semaine augmentent les gains dans les jeux (30 % au maximum au total).",
  ),
  pill: n("Událost +{n} %", "Event +{n} %", "Ereignis +{n} %", "Событие +{n} %", "Подія +{n} %", "イベント +{n}%", "Evento +{n} %", "Événement +{n} %"),
  games: {
    base: n("Základna", "Base", "Basis", "База", "База", "基地", "Base", "Base"),
    city: n("Město", "City", "Stadt", "Город", "Місто", "都市", "Ciudad", "Ville"),
    farm: n("Farma", "Farm", "Farm", "Ферма", "Ферма", "農場", "Granja", "Ferme"),
    pets: n("Mazlíčci", "Pets", "Haustiere", "Питомцы", "Улюбленці", "ペット", "Mascotas", "Animaux"),
  } satisfies Record<string, L4>,
};

export function eventLabel(ids: string[], focus: boolean, locale: Locale): string {
  const names = ids.map((id) => (EVENT_NAMES[id] ?? n(id, id, id, id))[locale]);
  if (focus) names.push(EVENT_TEXT.focus[locale]);
  return names.join(" · ");
}
