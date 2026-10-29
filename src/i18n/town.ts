import type { Locale } from "./config";

export type TownHubText = {
  nav: string;
  title: string;
  subtitle: string;
  buildings: Record<string, { name: string; hint: string }>;
  walking: string;
  skip: string;
  night: string;
  day: string;
  fullOn: string;
  fullOff: string;
  hero: { title: string; button: string; pick: string };
  auto: string;
  weather: Record<"clear" | "cloudy" | "rain" | "fog" | "snow", string>;
  phases: Record<"dawn" | "day" | "dusk" | "night", string>;
  quests: { title: string; open: string; text: string };
  collect: { title: string; text: string; got: string; all: string; login: string; left: string };
  mine: { title: string; text: string; empty: string; open: string };
};

const cs: TownHubText = {
  fullOn: "Celá obrazovka", fullOff: "Zpět do okna",
  hero: { title: "Vyber si hrdinu", button: "Převléct hrdinu", pick: "Vybrat" },
  auto: "Denní doba podle hodin",
  weather: { clear: "Jasno", cloudy: "Oblačno", rain: "Prší", fog: "Mlha", snow: "Sněží" },
  phases: { dawn: "Svítání", day: "Den", dusk: "Soumrak", night: "Noc" },
  nav: "Městečko",
  title: "Naše městečko",
  subtitle: "Prostředí, odkud se dostaneš všude: do školy na kurzy, do herny, na náměstí do obchodu, k věži s žebříčky i do přístavu a na vesmírnou stanici. Cestou sbírej poklady a plň denní úkoly.",
  buildings: {
    kurzy: { name: "Škola", hint: "Kurzy, kde získáš body" },
    hry: { name: "Herna", hint: "Stálé hry a únikovky" },
    zebricky: { name: "Věž slávy", hint: "Žebříčky a liga" },
    obchod: { name: "Náměstí", hint: "Obchod s odměnami" },
    pokoj: { name: "Můj pokoj", hint: "Pokoj a sbírka karet" },
    uceni: { name: "Studovna", hint: "Mapa, opakování, materiály" },
    profil: { name: "Domek na stromě", hint: "Můj profil" },
    ukoly: { name: "Nástěnka", hint: "Denní úkoly a odměny" },
    pristav: { name: "Přístav", hint: "Pirátský svět obchodu" },
    stanice: { name: "Raketa", hint: "Vesmírná stanice" },
    les: { name: "Pohádkový les", hint: "Víly, houby a světlušky" },
    hrad: { name: "Hrad a tržiště", hint: "Rytíři, kováři a králové" },
    more: { name: "Podmořské město", hint: "Potápění mezi korály" },
  },
  walking: "Jdeme…",
  skip: "Přeskočit",
  night: "Zapnout noc",
  day: "Zapnout den",
  quests: { title: "Denní úkoly", open: "Otevřít nástěnku", text: "Splň výzvy a vyzvedni si odměnu." },
  collect: { title: "Poklady dne", text: "V městečku se každý den schová osm pokladů. Najdeš je?", got: "+{n} bodů", all: "Všechno sebráno! Bonus za celý den.", login: "Poklady sbírají jen přihlášení hráči.", left: "Zbývá {n}" },
  mine: { title: "Moje městečko", text: "Zvláštní stavby z obchodu stojí na tvých pozemcích v městečku.", empty: "Zatím nemáš žádnou speciální stavbu. V obchodě je koupíš a postavíš.", open: "Stavět ve městě" },
};
const en: TownHubText = {
  fullOn: "Full screen", fullOff: "Back to window",
  hero: { title: "Choose your hero", button: "Change hero", pick: "Choose" },
  auto: "Time of day follows the clock",
  weather: { clear: "Clear", cloudy: "Cloudy", rain: "Rainy", fog: "Foggy", snow: "Snowy" },
  phases: { dawn: "Dawn", day: "Day", dusk: "Dusk", night: "Night" },
  nav: "Town",
  title: "Our town",
  subtitle: "A place that leads everywhere: to school for courses, to the arcade, the square with the shop, the tower with leaderboards, and to the harbour and space station. Collect treasures and finish daily tasks on the way.",
  buildings: {
    kurzy: { name: "School", hint: "Courses that earn points" },
    hry: { name: "Arcade", hint: "Idle games and escape rooms" },
    zebricky: { name: "Hall of fame", hint: "Leaderboards and league" },
    obchod: { name: "Square", hint: "The reward shop" },
    pokoj: { name: "My room", hint: "Room and card collection" },
    uceni: { name: "Study hall", hint: "Map, review, materials" },
    profil: { name: "Treehouse", hint: "My profile" },
    ukoly: { name: "Notice board", hint: "Daily tasks and rewards" },
    pristav: { name: "Harbour", hint: "The pirate world of the shop" },
    stanice: { name: "Rocket", hint: "The space station" },
    les: { name: "Fairy forest", hint: "Fairies, mushrooms and fireflies" },
    hrad: { name: "Castle and market", hint: "Knights, smiths and kings" },
    more: { name: "Underwater city", hint: "Diving among corals" },
  },
  walking: "On our way…",
  skip: "Skip",
  night: "Switch to night",
  day: "Switch to day",
  quests: { title: "Daily tasks", open: "Open the board", text: "Finish challenges and claim your reward." },
  collect: { title: "Treasures of the day", text: "Eight treasures hide in town every day. Can you find them?", got: "+{n} points", all: "All collected! Bonus for the whole day.", login: "Only logged-in players can collect treasures.", left: "{n} left" },
  mine: { title: "My town", text: "The special buildings from the shop stand on your plots in town.", empty: "You have no special building yet. Buy and build them in the shop.", open: "Build in the city" },
};
const de: TownHubText = {
  fullOn: "Vollbild", fullOff: "Zurück zum Fenster",
  hero: { title: "Wähle deinen Helden", button: "Held wechseln", pick: "Wählen" },
  auto: "Tageszeit nach der Uhr",
  weather: { clear: "Klar", cloudy: "Bewölkt", rain: "Regen", fog: "Nebel", snow: "Schnee" },
  phases: { dawn: "Morgendämmerung", day: "Tag", dusk: "Abenddämmerung", night: "Nacht" },
  nav: "Städtchen",
  title: "Unser Städtchen",
  subtitle: "Ein Ort, von dem man überallhin kommt: zur Schule für Kurse, in die Spielhalle, zum Marktplatz mit dem Shop, zum Turm mit den Ranglisten sowie zum Hafen und zur Raumstation. Sammle unterwegs Schätze und erledige Tagesaufgaben.",
  buildings: {
    kurzy: { name: "Schule", hint: "Kurse, die Punkte bringen" },
    hry: { name: "Spielhalle", hint: "Idle-Spiele und Escape-Rooms" },
    zebricky: { name: "Ruhmeshalle", hint: "Ranglisten und Liga" },
    obchod: { name: "Marktplatz", hint: "Der Belohnungs-Shop" },
    pokoj: { name: "Mein Zimmer", hint: "Zimmer und Kartensammlung" },
    uceni: { name: "Lernraum", hint: "Karte, Wiederholen, Materialien" },
    profil: { name: "Baumhaus", hint: "Mein Profil" },
    ukoly: { name: "Schwarzes Brett", hint: "Tagesaufgaben und Belohnungen" },
    pristav: { name: "Hafen", hint: "Die Piratenwelt des Shops" },
    stanice: { name: "Rakete", hint: "Die Raumstation" },
    les: { name: "Märchenwald", hint: "Feen, Pilze und Glühwürmchen" },
    hrad: { name: "Burg und Markt", hint: "Ritter, Schmiede und Könige" },
    more: { name: "Unterwasserstadt", hint: "Tauchen zwischen Korallen" },
  },
  walking: "Wir gehen…",
  skip: "Überspringen",
  night: "Nacht einschalten",
  day: "Tag einschalten",
  quests: { title: "Tagesaufgaben", open: "Brett öffnen", text: "Erfülle Herausforderungen und hole deine Belohnung." },
  collect: { title: "Schätze des Tages", text: "Jeden Tag verstecken sich acht Schätze im Städtchen. Findest du sie?", got: "+{n} Punkte", all: "Alles gesammelt! Bonus für den ganzen Tag.", login: "Nur angemeldete Spieler können Schätze sammeln.", left: "Noch {n}" },
  mine: { title: "Mein Städtchen", text: "Die Spezialgebäude aus dem Shop stehen auf deinen Grundstücken im Städtchen.", empty: "Du hast noch kein Spezialgebäude. Kaufe und baue sie im Shop.", open: "In der Stadt bauen" },
};
const ru: TownHubText = {
  fullOn: "На весь экран", fullOff: "Вернуть в окно",
  hero: { title: "Выбери героя", button: "Сменить героя", pick: "Выбрать" },
  auto: "Время суток по часам",
  weather: { clear: "Ясно", cloudy: "Облачно", rain: "Дождь", fog: "Туман", snow: "Снег" },
  phases: { dawn: "Рассвет", day: "День", dusk: "Сумерки", night: "Ночь" },
  nav: "Городок",
  title: "Наш городок",
  subtitle: "Место, откуда можно попасть куда угодно: в школу на курсы, в игровой зал, на площадь в магазин, к башне с рейтингами, в гавань и на космическую станцию. По пути собирай сокровища и выполняй задания дня.",
  buildings: {
    kurzy: { name: "Школа", hint: "Курсы, дающие баллы" },
    hry: { name: "Игровой зал", hint: "Бесконечные игры и квесты" },
    zebricky: { name: "Башня славы", hint: "Рейтинги и лига" },
    obchod: { name: "Площадь", hint: "Магазин наград" },
    pokoj: { name: "Моя комната", hint: "Комната и коллекция карт" },
    uceni: { name: "Читальня", hint: "Карта, повторение, материалы" },
    profil: { name: "Дом на дереве", hint: "Мой профиль" },
    ukoly: { name: "Доска", hint: "Задания дня и награды" },
    pristav: { name: "Гавань", hint: "Пиратский мир магазина" },
    stanice: { name: "Ракета", hint: "Космическая станция" },
    les: { name: "Сказочный лес", hint: "Феи, грибы и светлячки" },
    hrad: { name: "Замок и рынок", hint: "Рыцари, кузнецы и короли" },
    more: { name: "Подводный город", hint: "Погружение среди кораллов" },
  },
  walking: "Идём…",
  skip: "Пропустить",
  night: "Включить ночь",
  day: "Включить день",
  quests: { title: "Задания дня", open: "Открыть доску", text: "Выполняй задания и забирай награду." },
  collect: { title: "Сокровища дня", text: "Каждый день в городке прячутся восемь сокровищ. Найдёшь?", got: "+{n} баллов", all: "Всё собрано! Бонус за весь день.", login: "Сокровища собирают только вошедшие игроки.", left: "Осталось {n}" },
  mine: { title: "Мой городок", text: "Особые постройки из магазина стоят на твоих участках в городке.", empty: "Особых построек пока нет. Купи и построй их в магазине.", open: "Строить в городе" },
};
const T: Record<Locale, TownHubText> = { cs, en, de, ru };
export const getTownHubText = (locale: Locale): TownHubText => T[locale];
