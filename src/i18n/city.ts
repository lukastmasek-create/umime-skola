import type { Locale } from "./config";
import type { CityCat, CityError } from "@/lib/idle/city";

export type CityText = {
  back: string;
  title: string;
  subtitle: string;
  loginRequired: string;
  login: string;
  unavailable: string;
  loading: string;
  cats: Record<CityCat, string>;
  modePan: string;
  modeBuild: string;
  modeDemolish: string;
  rotate: string;
  recenter: string;
  zoomIn: string;
  zoomOut: string;
  coins: string;
  points: string;
  population: string; // použije se i s kapacitou
  jobs: string;
  happiness: string;
  income: string; // {n}
  buildings: string;
  level: string;
  learningBonus: string; // {n}
  learningHint: string;
  offlineNote: string; // {n}
  mood: { sad: string; ok: string; good: string; great: string };
  lockedLevel: string; // {n}
  pointsCost: string; // {n}
  hintStart: string;
  hintBuild: string;
  hintPan: string;
  hintDemolish: string;
  selected: string;
  residents: string;
  jobsHere: string;
  effect: string; // {n} {r}
  effectNegative: string; // {n} {r}
  education: string;
  working: string;
  notConnected: string;
  needsRail: string;
  demolish: string; // {n}
  close: string;
  size: string;
  errors: Record<CityError | "conflict" | "generic" | "unknown-action", string>;
};

const cs: CityText = {
  back: "← Stálé hry",
  title: "Město",
  subtitle: "Postav si vlastní město: domy, obchody, továrny, parky, koleje i památky. Lidé v něm pracují a vydělávají mince, i když jsi pryč. Učení odemyká nové budovy a zvyšuje výdělek.",
  loginRequired: "Aby se ti město ukládalo, musíš se přihlásit.",
  login: "Přihlásit se",
  unavailable: "Město se teď nenačetlo. Zkus to za chvíli.",
  loading: "Načítám město…",
  cats: {
    road: "Silnice",
    housing: "Bydlení",
    work: "Obchody a práce",
    service: "Služby",
    nature: "Příroda",
    decor: "Dekorace",
    transport: "Doprava",
  },
  modePan: "Posun",
  modeBuild: "Stavět",
  modeDemolish: "Zbourat",
  rotate: "Otočit",
  recenter: "Vycentrovat",
  zoomIn: "Přiblížit",
  zoomOut: "Oddálit",
  coins: "Mince",
  points: "Body z učení",
  population: "Obyvatelé",
  jobs: "Práce",
  happiness: "Spokojenost",
  income: "{n} mincí za hodinu",
  buildings: "Budovy",
  level: "Úroveň účtu",
  learningBonus: "Bonus za učení +{n} %",
  learningHint: "Každých 100 XP z posledních 24 hodin zvedne výdělek o 10 %, nejvýš o 50 %. Škola, knihovna a univerzita ten bonus zesílí.",
  offlineNote: "Město vydělává i když jsi pryč, nejvýš {n} hodin.",
  mood: { sad: "Nespokojení", ok: "Průměrná", good: "Spokojení", great: "Skvělá" },
  lockedLevel: "Úroveň {n}",
  pointsCost: "{n} bodů",
  hintStart: "Domy a obchody fungují jen vedle silnice, která vede až k okraji mapy. Začni stavbou domů a obchodů u hlavní silnice a pak přidej parky a lampy.",
  hintBuild: "Klepni na políčko a pusť. U silnic, plotů a stromů taž prstem nebo myší a postavíš jich víc najednou.",
  hintPan: "Taž pro posun mapy, kolečkem nebo dvěma prsty přibližuj. Klepnutím na budovu zobrazíš podrobnosti.",
  hintDemolish: "Klepni nebo táhni přes budovy, které chceš zbourat. Vrátí se polovina mincí.",
  selected: "Vybraná budova",
  residents: "Obyvatelé",
  jobsHere: "Pracovní místa",
  effect: "Spokojenost +{n} v okolí {r} polí",
  effectNegative: "Spokojenost {n} v okolí {r} polí",
  education: "Vzdělání",
  working: "Funguje",
  notConnected: "Nefunguje: postav vedle ní silnici napojenou na okraj mapy.",
  needsRail: "Nefunguje: potřebuje i koleje hned vedle sebe.",
  demolish: "Zbourat (+{n} mincí)",
  close: "Zavřít",
  size: "Velikost",
  errors: {
    "unknown-item": "Taková budova neexistuje.",
    "out-of-bounds": "Tady už je okraj mapy.",
    occupied: "Tohle místo je obsazené.",
    "not-enough-coins": "Nemáš dost mincí.",
    "not-enough-points": "Nemáš dost bodů z učení.",
    locked: "Tahle budova se odemkne s vyšší úrovní účtu. Učení ji přiblíží.",
    "nothing-there": "Tady nic není.",
    "too-many": "Najednou jde stavět nejvýš 80 kusů.",
    conflict: "Město se mezitím změnilo. Zkus to ještě jednou.",
    generic: "Něco se nepovedlo. Zkus to znovu.",
    "unknown-action": "Neznámá akce.",
  },
};

const en: CityText = {
  back: "← Endless games",
  title: "City",
  subtitle: "Build your own city: houses, shops, factories, parks, railways and monuments. People work there and earn coins even when you're away. Learning unlocks new buildings and boosts income.",
  loginRequired: "Log in so your city can be saved.",
  login: "Log in",
  unavailable: "Your city couldn't load right now. Try again in a moment.",
  loading: "Loading your city…",
  cats: {
    road: "Roads",
    housing: "Housing",
    work: "Shops and work",
    service: "Services",
    nature: "Nature",
    decor: "Decorations",
    transport: "Transport",
  },
  modePan: "Move",
  modeBuild: "Build",
  modeDemolish: "Demolish",
  rotate: "Rotate",
  recenter: "Recenter",
  zoomIn: "Zoom in",
  zoomOut: "Zoom out",
  coins: "Coins",
  points: "Learning points",
  population: "Residents",
  jobs: "Jobs",
  happiness: "Happiness",
  income: "{n} coins per hour",
  buildings: "Buildings",
  level: "Account level",
  learningBonus: "Learning bonus +{n}%",
  learningHint: "Every 100 XP from the last 24 hours adds 10% income, up to 50%. Schools, libraries and universities make that bonus stronger.",
  offlineNote: "The city earns while you're away, up to {n} hours.",
  mood: { sad: "Unhappy", ok: "Average", good: "Happy", great: "Great" },
  lockedLevel: "Level {n}",
  pointsCost: "{n} points",
  hintStart: "Houses and shops only work next to a road that leads to the edge of the map. Start with houses and shops by the main road, then add parks and lamps.",
  hintBuild: "Tap a tile and release. For roads, railings and trees drag your finger or mouse to build several at once.",
  hintPan: "Drag to move the map, use the wheel or two fingers to zoom. Tap a building to see details.",
  hintDemolish: "Tap or drag over the buildings you want to demolish. Half of the coins come back.",
  selected: "Selected building",
  residents: "Residents",
  jobsHere: "Jobs",
  effect: "Happiness +{n} within {r} tiles",
  effectNegative: "Happiness {n} within {r} tiles",
  education: "Education",
  working: "Working",
  notConnected: "Not working: build a road next to it that connects to the map edge.",
  needsRail: "Not working: it also needs a railway right next to it.",
  demolish: "Demolish (+{n} coins)",
  close: "Close",
  size: "Size",
  errors: {
    "unknown-item": "That building doesn't exist.",
    "out-of-bounds": "That's the edge of the map.",
    occupied: "That spot is taken.",
    "not-enough-coins": "Not enough coins.",
    "not-enough-points": "Not enough learning points.",
    locked: "This building unlocks at a higher account level. Learning gets you there.",
    "nothing-there": "There's nothing here.",
    "too-many": "You can build at most 80 at once.",
    conflict: "The city changed in the meantime. Try once more.",
    generic: "Something went wrong. Try again.",
    "unknown-action": "Unknown action.",
  },
};

const de: CityText = {
  back: "← Endlosspiele",
  title: "Stadt",
  subtitle: "Baue deine eigene Stadt: Häuser, Läden, Fabriken, Parks, Schienen und Denkmäler. Die Menschen arbeiten dort und verdienen Münzen, auch wenn du weg bist. Lernen schaltet neue Gebäude frei und erhöht den Verdienst.",
  loginRequired: "Melde dich an, damit deine Stadt gespeichert wird.",
  login: "Anmelden",
  unavailable: "Deine Stadt konnte gerade nicht geladen werden. Versuch es gleich noch einmal.",
  loading: "Stadt wird geladen…",
  cats: {
    road: "Straßen",
    housing: "Wohnen",
    work: "Läden und Arbeit",
    service: "Dienste",
    nature: "Natur",
    decor: "Dekoration",
    transport: "Verkehr",
  },
  modePan: "Bewegen",
  modeBuild: "Bauen",
  modeDemolish: "Abreißen",
  rotate: "Drehen",
  recenter: "Zentrieren",
  zoomIn: "Vergrößern",
  zoomOut: "Verkleinern",
  coins: "Münzen",
  points: "Lernpunkte",
  population: "Einwohner",
  jobs: "Arbeit",
  happiness: "Zufriedenheit",
  income: "{n} Münzen pro Stunde",
  buildings: "Gebäude",
  level: "Konto-Level",
  learningBonus: "Lernbonus +{n} %",
  learningHint: "Je 100 XP der letzten 24 Stunden steigt der Verdienst um 10 %, höchstens um 50 %. Schule, Bibliothek und Universität verstärken den Bonus.",
  offlineNote: "Die Stadt verdient auch, wenn du weg bist, höchstens {n} Stunden.",
  mood: { sad: "Unzufrieden", ok: "Durchschnitt", good: "Zufrieden", great: "Großartig" },
  lockedLevel: "Level {n}",
  pointsCost: "{n} Punkte",
  hintStart: "Häuser und Läden funktionieren nur neben einer Straße, die bis zum Kartenrand führt. Beginne mit Häusern und Läden an der Hauptstraße und füge dann Parks und Laternen hinzu.",
  hintBuild: "Tippe auf ein Feld und lass los. Bei Straßen, Geländern und Bäumen ziehst du mit dem Finger oder der Maus und baust mehrere auf einmal.",
  hintPan: "Ziehen verschiebt die Karte, mit dem Rad oder zwei Fingern zoomst du. Tippe ein Gebäude an, um Details zu sehen.",
  hintDemolish: "Tippe oder ziehe über die Gebäude, die du abreißen willst. Die Hälfte der Münzen kommt zurück.",
  selected: "Ausgewähltes Gebäude",
  residents: "Einwohner",
  jobsHere: "Arbeitsplätze",
  effect: "Zufriedenheit +{n} im Umkreis von {r} Feldern",
  effectNegative: "Zufriedenheit {n} im Umkreis von {r} Feldern",
  education: "Bildung",
  working: "Funktioniert",
  notConnected: "Funktioniert nicht: Baue daneben eine Straße, die an den Kartenrand anschließt.",
  needsRail: "Funktioniert nicht: Es braucht auch Schienen direkt daneben.",
  demolish: "Abreißen (+{n} Münzen)",
  close: "Schließen",
  size: "Größe",
  errors: {
    "unknown-item": "Dieses Gebäude gibt es nicht.",
    "out-of-bounds": "Hier ist der Kartenrand.",
    occupied: "Dieser Platz ist belegt.",
    "not-enough-coins": "Nicht genug Münzen.",
    "not-enough-points": "Nicht genug Lernpunkte.",
    locked: "Dieses Gebäude wird mit höherem Konto-Level frei. Lernen bringt dich hin.",
    "nothing-there": "Hier ist nichts.",
    "too-many": "Du kannst höchstens 80 auf einmal bauen.",
    conflict: "Die Stadt hat sich inzwischen geändert. Versuch es noch einmal.",
    generic: "Etwas ist schiefgegangen. Versuch es erneut.",
    "unknown-action": "Unbekannte Aktion.",
  },
};

const ru: CityText = {
  back: "← Вечные игры",
  title: "Город",
  subtitle: "Построй свой город: дома, магазины, заводы, парки, железные дороги и памятники. Жители работают и зарабатывают монеты, даже когда тебя нет. Учёба открывает новые здания и повышает доход.",
  loginRequired: "Войди, чтобы город сохранялся.",
  login: "Войти",
  unavailable: "Город сейчас не загрузился. Попробуй чуть позже.",
  loading: "Загружаю город…",
  cats: {
    road: "Дороги",
    housing: "Жильё",
    work: "Магазины и работа",
    service: "Службы",
    nature: "Природа",
    decor: "Украшения",
    transport: "Транспорт",
  },
  modePan: "Двигать",
  modeBuild: "Строить",
  modeDemolish: "Снести",
  rotate: "Повернуть",
  recenter: "По центру",
  zoomIn: "Приблизить",
  zoomOut: "Отдалить",
  coins: "Монеты",
  points: "Баллы за учёбу",
  population: "Жители",
  jobs: "Работа",
  happiness: "Довольство",
  income: "{n} монет в час",
  buildings: "Здания",
  level: "Уровень аккаунта",
  learningBonus: "Бонус за учёбу +{n} %",
  learningHint: "За каждые 100 XP за последние 24 часа доход растёт на 10 %, не больше чем на 50 %. Школа, библиотека и университет усиливают бонус.",
  offlineNote: "Город зарабатывает, даже когда тебя нет, не дольше {n} часов.",
  mood: { sad: "Недовольны", ok: "Средне", good: "Довольны", great: "Отлично" },
  lockedLevel: "Уровень {n}",
  pointsCost: "{n} баллов",
  hintStart: "Дома и магазины работают только рядом с дорогой, которая ведёт к краю карты. Начни с домов и магазинов у главной дороги, потом добавь парки и фонари.",
  hintBuild: "Коснись клетки и отпусти. Для дорог, ограждений и деревьев води пальцем или мышью, чтобы построить сразу несколько.",
  hintPan: "Тяни, чтобы двигать карту, колесом или двумя пальцами меняй масштаб. Коснись здания, чтобы увидеть подробности.",
  hintDemolish: "Коснись или проведи по зданиям, которые хочешь снести. Половина монет вернётся.",
  selected: "Выбранное здание",
  residents: "Жители",
  jobsHere: "Рабочие места",
  effect: "Довольство +{n} в радиусе {r} клеток",
  effectNegative: "Довольство {n} в радиусе {r} клеток",
  education: "Образование",
  working: "Работает",
  notConnected: "Не работает: построй рядом дорогу, ведущую к краю карты.",
  needsRail: "Не работает: нужны ещё и рельсы рядом.",
  demolish: "Снести (+{n} монет)",
  close: "Закрыть",
  size: "Размер",
  errors: {
    "unknown-item": "Такого здания нет.",
    "out-of-bounds": "Здесь край карты.",
    occupied: "Это место занято.",
    "not-enough-coins": "Не хватает монет.",
    "not-enough-points": "Не хватает баллов за учёбу.",
    locked: "Это здание откроется на более высоком уровне. Учёба поможет.",
    "nothing-there": "Здесь ничего нет.",
    "too-many": "За раз можно построить не больше 80.",
    conflict: "Город тем временем изменился. Попробуй ещё раз.",
    generic: "Что-то пошло не так. Попробуй снова.",
    "unknown-action": "Неизвестное действие.",
  },
};

const texts: Record<Locale, CityText> = { cs, en, de, ru };

export function getCityText(locale: Locale): CityText {
  return texts[locale];
}

export function fillTokens(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));
}
