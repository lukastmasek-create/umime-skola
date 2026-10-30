import type { Locale } from "./config";
import type { GameSlug } from "@/lib/games";

// Názvy her a krátké popisky pro seznam her, úvodní obrazovku a osobní rekordy.
type Meta = { name: string; tag: string };

const META: Record<GameSlug, Record<Locale, Meta>> = {
  "space-invaders": {
    cs: { name: "Obrana galaxie", tag: "Sestřel vetřelce se správnou odpovědí" },
    en: { name: "Galaxy Defence", tag: "Blast the alien with the right answer" },
    de: { name: "Galaxie-Abwehr", tag: "Schieß das Alien mit der richtigen Antwort ab" },
    ru: { name: "Защита галактики", tag: "Сбей пришельца с правильным ответом" },
  },
  "pac-man": {
    cs: { name: "Labyrint duchů", tag: "Sněz správnou odpověď a uteč duchům" },
    en: { name: "Ghost Labyrinth", tag: "Eat the right answer and flee the ghosts" },
    de: { name: "Geisterlabyrinth", tag: "Friss die richtige Antwort, flieh vor den Geistern" },
    ru: { name: "Лабиринт призраков", tag: "Съешь правильный ответ и убеги от призраков" },
  },
  snake: {
    cs: { name: "Had z džungle", tag: "Nekonečná hra: roste se správnými odpověďmi" },
    en: { name: "Jungle Snake", tag: "Endless: grow with every right answer" },
    de: { name: "Dschungelschlange", tag: "Endlos: wachse mit jeder richtigen Antwort" },
    ru: { name: "Змея из джунглей", tag: "Бесконечная игра: расти с правильными ответами" },
  },
  breakout: {
    cs: { name: "Průlom hradeb", tag: "Míčkem prorazíš cihlu se správnou odpovědí" },
    en: { name: "Wall Breaker", tag: "Smash the brick with the right answer" },
    de: { name: "Mauerbrecher", tag: "Triff den Ziegel mit der richtigen Antwort" },
    ru: { name: "Пролом стены", tag: "Разбей кирпич с правильным ответом" },
  },
  tetris: {
    cs: { name: "Pád bloků", tag: "Shoď blok do sloupce se správnou odpovědí" },
    en: { name: "Falling Blocks", tag: "Drop the block onto the right answer" },
    de: { name: "Fallende Blöcke", tag: "Lass den Block auf die richtige Antwort fallen" },
    ru: { name: "Падающие блоки", tag: "Опусти блок на правильный ответ" },
  },
  kong: {
    cs: { name: "Výstup na sopku", tag: "Šplhej, uhýbej kamenům a seber správnou cedulku" },
    en: { name: "Volcano Climb", tag: "Climb, dodge rocks and grab the right sign" },
    de: { name: "Vulkanaufstieg", tag: "Klettere, weiche Steinen aus, schnapp dir das richtige Schild" },
    ru: { name: "Подъём на вулкан", tag: "Карабкайся, уворачивайся и хватай верную табличку" },
  },
  flappy: {
    cs: { name: "Let přes útesy", tag: "Proleť mezerou se správnou odpovědí" },
    en: { name: "Cliff Flight", tag: "Fly through the gap with the right answer" },
    de: { name: "Klippenflug", tag: "Flieg durch die Lücke mit der richtigen Antwort" },
    ru: { name: "Полёт над скалами", tag: "Пролети в проём с правильным ответом" },
  },
  mole: {
    cs: { name: "Lov krtků", tag: "Klepni kladivem krtka se správnou cedulkou" },
    en: { name: "Mole Hunt", tag: "Bonk the mole holding the right sign" },
    de: { name: "Maulwurfjagd", tag: "Hau auf den Maulwurf mit dem richtigen Schild" },
    ru: { name: "Охота на кротов", tag: "Стукни крота с правильной табличкой" },
  },
  ninja: {
    cs: { name: "Stínový bojovník", tag: "Rozsekni letící ovoce se správnou odpovědí" },
    en: { name: "Shadow Warrior", tag: "Slice the flying fruit with the right answer" },
    de: { name: "Schattenkrieger", tag: "Zerschneide die Frucht mit der richtigen Antwort" },
    ru: { name: "Теневой воин", tag: "Разруби летящий фрукт с правильным ответом" },
  },
  osmismerka: {
    cs: { name: "Osmisměrka", tag: "Najdi odpovědi schované v mřížce písmen" },
    en: { name: "Word Search", tag: "Find the answers hidden in the letter grid" },
    de: { name: "Wortsuche", tag: "Finde die Antworten im Buchstabengitter" },
    ru: { name: "Филворд", tag: "Найди ответы в сетке букв" },
  },
  spojovani: {
    cs: { name: "Spojování", tag: "Spoj otázky se správnými odpověďmi" },
    en: { name: "Matching", tag: "Match the questions with their answers" },
    de: { name: "Zuordnen", tag: "Ordne Fragen und Antworten zu" },
    ru: { name: "Соедини пары", tag: "Соедини вопросы с ответами" },
  },
  pexeso: {
    cs: { name: "Pexeso", tag: "Najdi dvojice otázka a odpověď" },
    en: { name: "Memory", tag: "Find the question and answer pairs" },
    de: { name: "Memory", tag: "Finde die Paare aus Frage und Antwort" },
    ru: { name: "Мемори", tag: "Найди пары «вопрос — ответ»" },
  },
  sibenice: {
    cs: { name: "Šibenice", tag: "Hádej odpověď písmeno po písmenu" },
    en: { name: "Hangman", tag: "Guess the answer letter by letter" },
    de: { name: "Galgenmännchen", tag: "Errate die Antwort Buchstabe für Buchstabe" },
    ru: { name: "Виселица", tag: "Угадай ответ по буквам" },
  },
  trideni: {
    cs: { name: "Třídění", tag: "Roztřiď tvrzení na správná a špatná" },
    en: { name: "Sorting", tag: "Sort the statements into right and wrong" },
    de: { name: "Sortieren", tag: "Sortiere die Aussagen in richtig und falsch" },
    ru: { name: "Сортировка", tag: "Раздели утверждения на верные и неверные" },
  },
  doplnovani: {
    cs: { name: "Doplňování", tag: "Doplň chybějící slova do vět" },
    en: { name: "Fill the Gaps", tag: "Fill the missing words into sentences" },
    de: { name: "Lückentext", tag: "Setze die fehlenden Wörter ein" },
    ru: { name: "Вставь слово", tag: "Вставь пропущенные слова" },
  },
  milionar: {
    cs: { name: "Výstup na vrchol", tag: "Stoupej po žebříčku otázek až na vrchol" },
    en: { name: "Summit Climb", tag: "Climb the question ladder to the summit" },
    de: { name: "Gipfelsturm", tag: "Steig die Fragenleiter bis zum Gipfel hinauf" },
    ru: { name: "Восхождение на вершину", tag: "Поднимайся по лестнице вопросов к вершине" },
  },
  presmycky: {
    cs: { name: "Přesmyčky", tag: "Poskládej odpověď ze zamíchaných písmen" },
    en: { name: "Anagrams", tag: "Unscramble the letters into the answer" },
    de: { name: "Buchstabensalat", tag: "Ordne die Buchstaben zur Antwort" },
    ru: { name: "Анаграммы", tag: "Собери ответ из перемешанных букв" },
  },
  blesk: {
    cs: { name: "Bleskový kvíz", tag: "Co nejvíc správných odpovědí za minutu" },
    en: { name: "Lightning Quiz", tag: "As many right answers as you can in a minute" },
    de: { name: "Blitz-Quiz", tag: "So viele richtige Antworten wie möglich in einer Minute" },
    ru: { name: "Блиц-викторина", tag: "Как можно больше верных ответов за минуту" },
  },
  poklad: {
    cs: { name: "Hon za pokladem", tag: "Odpovídej a odkopávej políčka s pokladem" },
    en: { name: "Treasure Hunt", tag: "Answer and dig up tiles hiding treasure" },
    de: { name: "Schatzsuche", tag: "Antworte und grab Felder mit Schätzen aus" },
    ru: { name: "Охота за сокровищами", tag: "Отвечай и раскапывай клетки с кладом" },
  },
  oblekani: {
    cs: { name: "Obleč panenku", tag: "Za každou správnou odpověď jeden kus oblečení" },
    en: { name: "Dress the Doll", tag: "One piece of clothing per right answer" },
    de: { name: "Puppe anziehen", tag: "Ein Kleidungsstück pro richtige Antwort" },
    ru: { name: "Наряди куклу", tag: "Одна вещь за каждый правильный ответ" },
  },
  obrana: {
    cs: { name: "Obrana města", tag: "Odpovídej a ubraň hrad před vlnami nepřátel" },
    en: { name: "Castle Defence", tag: "Answer to defend the castle from waves of foes" },
    de: { name: "Burgverteidigung", tag: "Antworte und verteidige die Burg gegen Wellen" },
    ru: { name: "Оборона замка", tag: "Отвечай и защищай замок от волн врагов" },
  },
  krizovka: {
    cs: { name: "Křížovka", tag: "Vyplň křížovku odpověďmi na otázky" },
    en: { name: "Crossword", tag: "Fill the crossword with the answers" },
    de: { name: "Kreuzworträtsel", tag: "Füll das Rätsel mit den Antworten aus" },
    ru: { name: "Кроссворд", tag: "Заполни кроссворд ответами" },
  },
  pravda: {
    cs: { name: "Pravda, nebo lež", tag: "Rychle rozhodni, jestli tvrzení platí" },
    en: { name: "True or False", tag: "Decide fast whether the statement is true" },
    de: { name: "Wahr oder falsch", tag: "Entscheide schnell, ob die Aussage stimmt" },
    ru: { name: "Правда или ложь", tag: "Быстро реши, верно ли утверждение" },
  },
  piskvorky: {
    cs: { name: "Kvízové piškvorky", tag: "Políčko získáš jen za správnou odpověď" },
    en: { name: "Quiz Tic-Tac-Toe", tag: "Win a square only with a right answer" },
    de: { name: "Quiz-Tic-Tac-Toe", tag: "Ein Feld gibt es nur für eine richtige Antwort" },
    ru: { name: "Крестики-нолики", tag: "Клетка твоя только за верный ответ" },
  },
  bingo: {
    cs: { name: "Bingo", tag: "Najdi odpověď na kartě a slož řadu" },
    en: { name: "Bingo", tag: "Find the answer on your card and complete a line" },
    de: { name: "Bingo", tag: "Finde die Antwort auf deiner Karte und vervollständige eine Reihe" },
    ru: { name: "Бинго", tag: "Найди ответ на карточке и собери ряд" },
  },
};

export function gameMeta(slug: GameSlug, locale: Locale): Meta {
  return META[slug][locale];
}

// Popisky seznamu her, úvodní obrazovky klasických her a osobních rekordů.
export type GamesUiText = {
  action: string;
  actionHint: string;
  classic: string;
  classicHint: string;
  isNew: string;
  best: string;
  howTo: string;
  start: string;
  length: string;
  questions: string;
  newBest: string;
  bestSoFar: string;
  hidden: string;
};

const UI: Record<Locale, GamesUiText> = {
  cs: {
    action: "Akční hry",
    actionHint: "Pohyb, rychlost a postřeh: správnou odpověď musíš trefit, sebrat nebo chytit.",
    classic: "Klasické hry",
    classicHint: "V klidu a bez spěchu: kvízy, slovní hry a hádanky.",
    isNew: "Nové",
    best: "Rekord",
    howTo: "Jak hrát",
    start: "Spustit hru",
    length: "Délka kola",
    questions: "otázek",
    newBest: "Nový osobní rekord!",
    bestSoFar: "Tvůj rekord",
    hidden: "Některé hry tady chybí, protože se z odpovědí tohoto kurzu nedají sestavit (třeba osmisměrka z čísel).",
  },
  en: {
    action: "Action games",
    actionHint: "Movement, speed and reflexes: hit, grab or catch the right answer.",
    classic: "Classic games",
    classicHint: "Calm and unhurried: quizzes, word games and puzzles.",
    isNew: "New",
    best: "Best",
    howTo: "How to play",
    start: "Start game",
    length: "Round length",
    questions: "questions",
    newBest: "New personal best!",
    bestSoFar: "Your best",
    hidden: "Some games are missing here because they can't be built from this course's answers (e.g. a word search from numbers).",
  },
  de: {
    action: "Actionspiele",
    actionHint: "Bewegung, Tempo und Reaktion: triff, schnapp oder fang die richtige Antwort.",
    classic: "Klassische Spiele",
    classicHint: "In Ruhe und ohne Eile: Quizze, Wortspiele und Rätsel.",
    isNew: "Neu",
    best: "Rekord",
    howTo: "So wird gespielt",
    start: "Spiel starten",
    length: "Rundenlänge",
    questions: "Fragen",
    newBest: "Neuer persönlicher Rekord!",
    bestSoFar: "Dein Rekord",
    hidden: "Einige Spiele fehlen hier, weil sie sich aus den Antworten dieses Kurses nicht bauen lassen (z. B. Wortsuche aus Zahlen).",
  },
  ru: {
    action: "Активные игры",
    actionHint: "Движение, скорость и реакция: попади, схвати или поймай верный ответ.",
    classic: "Классические игры",
    classicHint: "Спокойно и без спешки: викторины, игры со словами и головоломки.",
    isNew: "Новое",
    best: "Рекорд",
    howTo: "Как играть",
    start: "Начать игру",
    length: "Длина раунда",
    questions: "вопросов",
    newBest: "Новый личный рекорд!",
    bestSoFar: "Твой рекорд",
    hidden: "Некоторых игр здесь нет: их нельзя собрать из ответов этого курса (например, филворд из чисел).",
  },
};

export function getGamesUiText(locale: Locale): GamesUiText {
  return UI[locale];
}
