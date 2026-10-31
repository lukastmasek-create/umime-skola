import type { Locale } from "./config";

// Texty a data pro naučné minihry městečka (pokladna v pekárně, knihovna, hvězdárna, květinářství).
export type TownMiniLearnText = {
  question: string; // {a} {b}
  right: string;
  wrong: string; // {x}
  next: string;
  finish: string;
  cashierBuy: string;
  cashierTotal: string;
  cashierChange: string; // {p}
  libraryHint: string;
  libraryRight: string;
  libraryWrong: string;
  starsBigger: string;
  starsCloser: string;
  starsContinent: string;
  starsOrder: string; // {a}
  planets: string[]; // od Slunce
  continents: string[]; // od největšího
  flowersAsk: string;
  categories: [string, string, string, string]; // ovoce, zelenina, květina, strom
  words: string[];
};

const cs: TownMiniLearnText = {
  question: "Otázka {a} / {b}",
  right: "Správně!",
  wrong: "Vedle, správně je {x}.",
  next: "Dál",
  finish: "Dokončit",
  cashierBuy: "Zákazník si bere:",
  cashierTotal: "Kolik to stojí dohromady?",
  cashierChange: "Platí {p} 🪙. Kolik mu vrátíš?",
  libraryHint: "Seřaď knihy podle abecedy: klikej od A do Z.",
  libraryRight: "Polička je srovnaná!",
  libraryWrong: "Tahle kniha ještě nepřišla na řadu. Správné pořadí:",
  starsBigger: "Která planeta je větší?",
  starsCloser: "Která planeta je blíž ke Slunci?",
  starsContinent: "Který světadíl je větší?",
  starsOrder: "Kolikátá planeta od Slunce je {a}?",
  planets: ["Merkur", "Venuše", "Země", "Mars", "Jupiter", "Saturn", "Uran", "Neptun"],
  continents: ["Asie", "Afrika", "Severní Amerika", "Jižní Amerika", "Antarktida", "Evropa", "Austrálie"],
  flowersAsk: "Kam to patří?",
  categories: ["ovoce", "zelenina", "květina", "strom"],
  words: ["auto", "banán", "citron", "čáp", "dům", "eskymák", "fotbal", "garáž", "hrad", "inkoust", "jablko", "kočka", "kolo", "kniha", "lev", "lampa", "les", "myš", "mrak", "mléko", "nos", "okno", "pes", "rak", "řeka", "slon", "škola", "tygr", "ucho", "vlak", "zebra", "želva"],
};

const en: TownMiniLearnText = {
  question: "Question {a} / {b}",
  right: "Correct!",
  wrong: "Not quite, the answer is {x}.",
  next: "Next",
  finish: "Finish",
  cashierBuy: "The customer takes:",
  cashierTotal: "How much is it altogether?",
  cashierChange: "They pay {p} 🪙. How much change do you give?",
  libraryHint: "Sort the books alphabetically: click from A to Z.",
  libraryRight: "The shelf is in order!",
  libraryWrong: "That book isn't next yet. The right order:",
  starsBigger: "Which planet is bigger?",
  starsCloser: "Which planet is closer to the Sun?",
  starsContinent: "Which continent is bigger?",
  starsOrder: "Counting from the Sun, which planet is {a}?",
  planets: ["Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"],
  continents: ["Asia", "Africa", "North America", "South America", "Antarctica", "Europe", "Australia"],
  flowersAsk: "Where does it belong?",
  categories: ["fruit", "vegetable", "flower", "tree"],
  words: ["apple", "banana", "bird", "book", "box", "cat", "dog", "egg", "fish", "goat", "house", "ice", "jam", "kite", "lion", "milk", "moon", "mouse", "nest", "owl", "pig", "queen", "rain", "sun", "tiger", "train", "tree", "umbrella", "van", "whale", "yak", "zoo"],
};

const de: TownMiniLearnText = {
  question: "Frage {a} / {b}",
  right: "Richtig!",
  wrong: "Leider nicht, richtig ist {x}.",
  next: "Weiter",
  finish: "Fertig",
  cashierBuy: "Der Kunde nimmt:",
  cashierTotal: "Wie viel kostet alles zusammen?",
  cashierChange: "Er zahlt {p} 🪙. Wie viel Wechselgeld gibst du zurück?",
  libraryHint: "Sortiere die Bücher nach dem Alphabet: klicke von A bis Z.",
  libraryRight: "Das Regal ist sortiert!",
  libraryWrong: "Dieses Buch ist noch nicht dran. Die richtige Reihenfolge:",
  starsBigger: "Welcher Planet ist größer?",
  starsCloser: "Welcher Planet ist näher an der Sonne?",
  starsContinent: "Welcher Kontinent ist größer?",
  starsOrder: "Der wievielte Planet von der Sonne ist {a}?",
  planets: ["Merkur", "Venus", "Erde", "Mars", "Jupiter", "Saturn", "Uranus", "Neptun"],
  continents: ["Asien", "Afrika", "Nordamerika", "Südamerika", "Antarktika", "Europa", "Australien"],
  flowersAsk: "Wohin gehört das?",
  categories: ["Obst", "Gemüse", "Blume", "Baum"],
  words: ["Apfel", "Ball", "Baum", "Buch", "Clown", "Dach", "Esel", "Fisch", "Garten", "Haus", "Igel", "Jacke", "Katze", "Kuh", "Löwe", "Maus", "Milch", "Mond", "Nase", "Obst", "Pferd", "Quelle", "Regen", "Schule", "Sonne", "Tiger", "Tür", "Uhr", "Vogel", "Wolke", "Zebra", "Zug"],
};

const ru: TownMiniLearnText = {
  question: "Вопрос {a} / {b}",
  right: "Верно!",
  wrong: "Не совсем, правильно: {x}.",
  next: "Дальше",
  finish: "Готово",
  cashierBuy: "Покупатель берёт:",
  cashierTotal: "Сколько стоит всё вместе?",
  cashierChange: "Он платит {p} 🪙. Сколько сдачи ты дашь?",
  libraryHint: "Расставь книги по алфавиту: нажимай от А до Я.",
  libraryRight: "Полка в порядке!",
  libraryWrong: "Эта книга ещё не на очереди. Правильный порядок:",
  starsBigger: "Какая планета больше?",
  starsCloser: "Какая планета ближе к Солнцу?",
  starsContinent: "Какой материк больше?",
  starsOrder: "Какая по счёту от Солнца планета {a}?",
  planets: ["Меркурий", "Венера", "Земля", "Марс", "Юпитер", "Сатурн", "Уран", "Нептун"],
  continents: ["Азия", "Африка", "Северная Америка", "Южная Америка", "Антарктида", "Европа", "Австралия"],
  flowersAsk: "Куда это относится?",
  categories: ["фрукт", "овощ", "цветок", "дерево"],
  words: ["арбуз", "банан", "волк", "гриб", "дом", "ёж", "жук", "замок", "игра", "книга", "кот", "лиса", "луна", "мама", "море", "мяч", "нос", "окно", "пирог", "рыба", "слон", "торт", "утка", "флаг", "хлеб", "цирк", "чай", "шар", "щука", "экран", "юла", "яблоко"],
};

const texts: Record<Locale, TownMiniLearnText> = { cs, en, de, ru };
export const getTownMiniLearnText = (locale: Locale) => texts[locale];
