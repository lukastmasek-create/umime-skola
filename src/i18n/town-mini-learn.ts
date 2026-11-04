import { withFallbacks } from "./config";
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

const texts: Record<Locale, TownMiniLearnText> = {
  ...withFallbacks({ cs, en, de, ru }),
  uk: {
    question: "Питання {a} / {b}",
    right: "Правильно!",
    wrong: "Не зовсім, правильно: {x}.",
    next: "Далі",
    finish: "Завершити",
    cashierBuy: "Клієнт бере:",
    cashierTotal: "Скільки це коштує разом?",
    cashierChange: "Він платить {p} 🪙. Скільки здачі ти даси?",
    libraryHint: "Розстав книжки за абеткою: клацай від А до Я.",
    libraryRight: "Полиця впорядкована!",
    libraryWrong: "Ця книжка ще не в черзі. Правильний порядок:",
    starsBigger: "Яка планета більша?",
    starsCloser: "Яка планета ближча до Сонця?",
    starsContinent: "Який материк більший?",
    starsOrder: "Яка за рахунком від Сонця планета {a}?",
    planets: ["Меркурій", "Венера", "Земля", "Марс", "Юпітер", "Сатурн", "Уран", "Нептун"],
    continents: ["Азія", "Африка", "Північна Америка", "Південна Америка", "Антарктида", "Європа", "Австралія"],
    flowersAsk: "Куди це належить?",
    categories: ["фрукт", "овоч", "квітка", "дерево"],
    words: ["абрикос", "банан", "вода", "гриб", "дім", "єнот", "жук", "заєць", "іграшка", "їжак", "кіт", "лев", "море", "ніс", "озеро", "пиріг", "риба", "сонце", "тигр", "удав", "фламінго", "хмара", "цибуля", "черепаха", "шапка", "щука", "юнак", "яблуко"],
  },
  ja: {
    question: "問題 {a} / {b}",
    right: "正解です！",
    wrong: "残念、正解は{x}です。",
    next: "次へ",
    finish: "終了",
    cashierBuy: "お客さんが選んだのは：",
    cashierTotal: "全部でいくらになりますか？",
    cashierChange: "{p} 🪙 払いました。おつりはいくらですか？",
    libraryHint: "本をアルファベット順に並べましょう。AからZまで順にクリックしてください。",
    libraryRight: "本棚がきれいに並びました！",
    libraryWrong: "この本はまだ順番ではありません。正しい順番は：",
    starsBigger: "どちらの惑星が大きいですか？",
    starsCloser: "どちらの惑星が太陽に近いですか？",
    starsContinent: "どちらの大陸が大きいですか？",
    starsOrder: "太陽から数えて{a}番目の惑星はどれですか？",
    planets: ["水星", "金星", "地球", "火星", "木星", "土星", "天王星", "海王星"],
    continents: ["アジア", "アフリカ", "北アメリカ", "南アメリカ", "南極大陸", "ヨーロッパ", "オーストラリア"],
    flowersAsk: "どれに入るでしょう？",
    categories: ["果物", "野菜", "花", "木"],
    words: ["あひる", "いぬ", "うさぎ", "えんぴつ", "おにぎり", "かさ", "きつね", "くま", "けむり", "こま", "さかな", "しまうま", "すいか", "せみ", "そら", "たぬき", "ちず", "つき", "てがみ", "とけい", "なし", "にわとり", "ぬいぐるみ", "ねこ", "のり", "はし", "ひまわり", "ふね", "へび", "ほし", "まど", "みかん", "むし", "めがね", "もも", "やま", "ゆき", "よる", "らくだ", "りんご", "ろうそく", "わに"],
  },
  es: {
    question: "Pregunta {a} / {b}",
    right: "¡Correcto!",
    wrong: "No exactamente, la respuesta es {x}.",
    next: "Siguiente",
    finish: "Terminar",
    cashierBuy: "El cliente se lleva:",
    cashierTotal: "¿Cuánto cuesta todo junto?",
    cashierChange: "Paga {p} 🪙. ¿Cuánto cambio le das?",
    libraryHint: "Ordena los libros alfabéticamente: haz clic de la A a la Z.",
    libraryRight: "¡La estantería está ordenada!",
    libraryWrong: "Ese libro todavía no toca. El orden correcto es:",
    starsBigger: "¿Qué planeta es más grande?",
    starsCloser: "¿Qué planeta está más cerca del Sol?",
    starsContinent: "¿Qué continente es más grande?",
    starsOrder: "¿Qué planeta es el {a}.º desde el Sol?",
    planets: ["Mercurio", "Venus", "Tierra", "Marte", "Júpiter", "Saturno", "Urano", "Neptuno"],
    continents: ["Asia", "África", "América del Norte", "América del Sur", "Antártida", "Europa", "Australia"],
    flowersAsk: "¿A qué grupo pertenece?",
    categories: ["fruta", "verdura", "flor", "árbol"],
    words: ["abeja", "avión", "balón", "bicicleta", "caballo", "casa", "dado", "elefante", "escuela", "flor", "gato", "globo", "helado", "iglú", "jirafa", "lápiz", "libro", "luna", "manzana", "mariposa", "nube", "oso", "pájaro", "pelota", "queso", "ratón", "sol", "tigre", "uva", "vaca", "zapato"],
  },
  fr: {
    question: "Question {a} / {b}",
    right: "Bravo !",
    wrong: "Pas tout à fait, la bonne réponse est {x}.",
    next: "Suivant",
    finish: "Terminer",
    cashierBuy: "Le client prend :",
    cashierTotal: "Combien cela coûte-t-il au total ?",
    cashierChange: "Il paie {p} 🪙. Combien de monnaie rends-tu ?",
    libraryHint: "Range les livres par ordre alphabétique : clique de A à Z.",
    libraryRight: "L'étagère est bien rangée !",
    libraryWrong: "Ce livre n'est pas encore le bon. Le bon ordre :",
    starsBigger: "Quelle planète est la plus grosse ?",
    starsCloser: "Quelle planète est la plus proche du Soleil ?",
    starsContinent: "Quel continent est le plus grand ?",
    starsOrder: "Quelle est la {a}e planète en partant du Soleil ?",
    planets: ["Mercure", "Vénus", "Terre", "Mars", "Jupiter", "Saturne", "Uranus", "Neptune"],
    continents: ["Asie", "Afrique", "Amérique du Nord", "Amérique du Sud", "Antarctique", "Europe", "Australie"],
    flowersAsk: "Où cela va-t-il ?",
    categories: ["fruit", "légume", "fleur", "arbre"],
    words: ["abeille", "arbre", "ballon", "bateau", "chat", "cheval", "dinosaure", "éléphant", "fleur", "fromage", "girafe", "glace", "hibou", "île", "jardin", "lapin", "livre", "lune", "maison", "nuage", "oiseau", "poisson", "pomme", "rivière", "soleil", "tigre", "voiture", "zèbre"],
  },
};
export const getTownMiniLearnText = (locale: Locale) => texts[locale];
