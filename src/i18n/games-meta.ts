import { withFallbacks } from "./config";
import type { Locale } from "./config";
import type { GameSlug } from "@/lib/games";

// Názvy her a krátké popisky pro seznam her, úvodní obrazovku a osobní rekordy.
type Meta = { name: string; tag: string };

const META: Record<GameSlug, Record<Locale, Meta>> = {
  "space-invaders": {
    ...withFallbacks({
      cs: { name: "Obrana galaxie", tag: "Sestřel vetřelce se správnou odpovědí" },
      en: { name: "Galaxy Defence", tag: "Blast the alien with the right answer" },
      de: { name: "Galaxie-Abwehr", tag: "Schieß das Alien mit der richtigen Antwort ab" },
      ru: { name: "Защита галактики", tag: "Сбей пришельца с правильным ответом" },
    }),
    uk: { name: "Оборона галактики", tag: "Збий прибульця правильною відповіддю" },
    ja: { name: "銀河防衛", tag: "正しい答えでエイリアンを撃ち落とそう" },
    es: { name: "Defensa galáctica", tag: "Derriba al alienígena con la respuesta correcta" },
    fr: { name: "Défense galactique", tag: "Abats l'alien avec la bonne réponse" },
  },
  "pac-man": {
    ...withFallbacks({
      cs: { name: "Labyrint duchů", tag: "Sněz správnou odpověď a uteč duchům" },
      en: { name: "Ghost Labyrinth", tag: "Eat the right answer and flee the ghosts" },
      de: { name: "Geisterlabyrinth", tag: "Friss die richtige Antwort, flieh vor den Geistern" },
      ru: { name: "Лабиринт призраков", tag: "Съешь правильный ответ и убеги от призраков" },
    }),
    uk: { name: "Лабіринт привидів", tag: "З'їж правильну відповідь і втікай від привидів" },
    ja: { name: "おばけのめいろ", tag: "正しい答えを食べて、おばけから逃げよう" },
    es: { name: "Laberinto de fantasmas", tag: "Come la respuesta correcta y huye de los fantasmas" },
    fr: { name: "Labyrinthe des fantômes", tag: "Mange la bonne réponse et fuis les fantômes" },
  },
  snake: {
    ...withFallbacks({
      cs: { name: "Had z džungle", tag: "Nekonečná hra: roste se správnými odpověďmi" },
      en: { name: "Jungle Snake", tag: "Endless: grow with every right answer" },
      de: { name: "Dschungelschlange", tag: "Endlos: wachse mit jeder richtigen Antwort" },
      ru: { name: "Змея из джунглей", tag: "Бесконечная игра: расти с правильными ответами" },
    }),
    uk: { name: "Змія з джунглів", tag: "Нескінченна гра: росте з кожною правильною відповіддю" },
    ja: { name: "ジャングルのヘビ", tag: "むげんモード: 正しい答えでどんどん長くなろう" },
    es: { name: "Serpiente de la selva", tag: "Sin fin: crece con cada respuesta correcta" },
    fr: { name: "Serpent de la jungle", tag: "Sans fin : grandis avec chaque bonne réponse" },
  },
  breakout: {
    ...withFallbacks({
      cs: { name: "Průlom hradeb", tag: "Míčkem prorazíš cihlu se správnou odpovědí" },
      en: { name: "Wall Breaker", tag: "Smash the brick with the right answer" },
      de: { name: "Mauerbrecher", tag: "Triff den Ziegel mit der richtigen Antwort" },
      ru: { name: "Пролом стены", tag: "Разбей кирпич с правильным ответом" },
    }),
    uk: { name: "Пролом стіни", tag: "М'ячиком розбий цеглину з правильною відповіддю" },
    ja: { name: "かべこわし", tag: "ボールで正しい答えのブロックをこわそう" },
    es: { name: "Rompemuros", tag: "Rompe el ladrillo con la respuesta correcta usando la pelota" },
    fr: { name: "Casse-murs", tag: "Brise la brique portant la bonne réponse avec la balle" },
  },
  tetris: {
    ...withFallbacks({
      cs: { name: "Pád bloků", tag: "Shoď blok do sloupce se správnou odpovědí" },
      en: { name: "Falling Blocks", tag: "Drop the block onto the right answer" },
      de: { name: "Fallende Blöcke", tag: "Lass den Block auf die richtige Antwort fallen" },
      ru: { name: "Падающие блоки", tag: "Опусти блок на правильный ответ" },
    }),
    uk: { name: "Падіння блоків", tag: "Скинь блок у стовпець з правильною відповіддю" },
    ja: { name: "ブロックおとし", tag: "正しい答えの列にブロックを落とそう" },
    es: { name: "Caída de bloques", tag: "Deja caer el bloque en la columna con la respuesta correcta" },
    fr: { name: "Chute de blocs", tag: "Fais tomber le bloc sur la bonne réponse" },
  },
  mole: {
    ...withFallbacks({
      cs: { name: "Lov krtků", tag: "Klepni kladivem krtka se správnou cedulkou" },
      en: { name: "Mole Hunt", tag: "Bonk the mole holding the right sign" },
      de: { name: "Maulwurfjagd", tag: "Hau auf den Maulwurf mit dem richtigen Schild" },
      ru: { name: "Охота на кротов", tag: "Стукни крота с правильной табличкой" },
    }),
    uk: { name: "Полювання на кротів", tag: "Вдар молотком по кроту з правильною табличкою" },
    ja: { name: "モグラたたき", tag: "正しい看板をもつモグラをハンマーでたたこう" },
    es: { name: "Caza de topos", tag: "Golpea al topo que sostiene el cartel correcto" },
    fr: { name: "Chasse aux taupes", tag: "Tape la taupe qui tient le bon panneau" },
  },
  minesweeper: {
    ...withFallbacks({
      cs: { name: "Hledání min", tag: "Odkryj políčko správnou odpovědí a vyhni se minám" },
      en: { name: "Mine Finder", tag: "Reveal tiles with right answers and avoid the mines" },
      de: { name: "Minensucher", tag: "Decke Felder mit richtigen Antworten auf und meide die Minen" },
      ru: { name: "Сапёр", tag: "Открывай клетки верными ответами и обходи мины" },
    }),
    uk: { name: "Сапер", tag: "Відкривай клітинки правильними відповідями і оминай міни" },
    ja: { name: "マインスイーパー", tag: "正しい答えでマスを開いて、地雷をさけよう" },
    es: { name: "Buscaminas", tag: "Descubre casillas con respuestas correctas y evita las minas" },
    fr: { name: "Démineur", tag: "Révèle les cases avec les bonnes réponses et évite les mines" },
  },
  ninja: {
    ...withFallbacks({
      cs: { name: "Stínový bojovník", tag: "Rozsekni letící ovoce se správnou odpovědí" },
      en: { name: "Shadow Warrior", tag: "Slice the flying fruit with the right answer" },
      de: { name: "Schattenkrieger", tag: "Zerschneide die Frucht mit der richtigen Antwort" },
      ru: { name: "Теневой воин", tag: "Разруби летящий фрукт с правильным ответом" },
    }),
    uk: { name: "Тіньовий воїн", tag: "Розрізай фрукти, що летять, з правильною відповіддю" },
    ja: { name: "かげのたたかい", tag: "飛んでくるフルーツを、正しい答えで切ろう" },
    es: { name: "Guerrero de las sombras", tag: "Corta la fruta voladora con la respuesta correcta" },
    fr: { name: "Guerrier de l'ombre", tag: "Tranche le fruit volant avec la bonne réponse" },
  },
  osmismerka: {
    ...withFallbacks({
      cs: { name: "Osmisměrka", tag: "Najdi odpovědi schované v mřížce písmen" },
      en: { name: "Word Search", tag: "Find the answers hidden in the letter grid" },
      de: { name: "Wortsuche", tag: "Finde die Antworten im Buchstabengitter" },
      ru: { name: "Филворд", tag: "Найди ответы в сетке букв" },
    }),
    uk: { name: "Пошуковий кросворд", tag: "Знайди відповіді, заховані в сітці літер" },
    ja: { name: "ワードサーチ", tag: "文字の表の中に隠れた答えを探そう" },
    es: { name: "Sopa de letras", tag: "Encuentra las respuestas escondidas en la cuadrícula de letras" },
    fr: { name: "Mots mêlés", tag: "Trouve les réponses cachées dans la grille de lettres" },
  },
  spojovani: {
    ...withFallbacks({
      cs: { name: "Spojování", tag: "Spoj otázky se správnými odpověďmi" },
      en: { name: "Matching", tag: "Match the questions with their answers" },
      de: { name: "Zuordnen", tag: "Ordne Fragen und Antworten zu" },
      ru: { name: "Соедини пары", tag: "Соедини вопросы с ответами" },
    }),
    uk: { name: "Поєднання", tag: "Поєднай питання з правильними відповідями" },
    ja: { name: "マッチング", tag: "問題と正しい答えを線でつなごう" },
    es: { name: "Emparejar", tag: "Une las preguntas con sus respuestas correctas" },
    fr: { name: "Association", tag: "Associe les questions à leurs réponses" },
  },
  pexeso: {
    ...withFallbacks({
      cs: { name: "Pexeso", tag: "Najdi dvojice otázka a odpověď" },
      en: { name: "Memory", tag: "Find the question and answer pairs" },
      de: { name: "Memory", tag: "Finde die Paare aus Frage und Antwort" },
      ru: { name: "Мемори", tag: "Найди пары «вопрос — ответ»" },
    }),
    uk: { name: "Пексесо", tag: "Знайди пари «питання — відповідь»" },
    ja: { name: "神経衰弱", tag: "質問と答えのペアを見つけよう" },
    es: { name: "Memoria", tag: "Encuentra las parejas de pregunta y respuesta" },
    fr: { name: "Mémory", tag: "Trouve les paires question-réponse" },
  },
  sibenice: {
    ...withFallbacks({
      cs: { name: "Šibenice", tag: "Hádej odpověď písmeno po písmenu" },
      en: { name: "Hangman", tag: "Guess the answer letter by letter" },
      de: { name: "Galgenmännchen", tag: "Errate die Antwort Buchstabe für Buchstabe" },
      ru: { name: "Виселица", tag: "Угадай ответ по буквам" },
    }),
    uk: { name: "Шибениця", tag: "Відгадай відповідь літера за літерою" },
    ja: { name: "ハングマン", tag: "答えを一文字ずつ当てよう" },
    es: { name: "Ahorcado", tag: "Adivina la respuesta letra a letra" },
    fr: { name: "Pendu", tag: "Devine la réponse lettre par lettre" },
  },
  trideni: {
    ...withFallbacks({
      cs: { name: "Třídění", tag: "Roztřiď tvrzení na správná a špatná" },
      en: { name: "Sorting", tag: "Sort the statements into right and wrong" },
      de: { name: "Sortieren", tag: "Sortiere die Aussagen in richtig und falsch" },
      ru: { name: "Сортировка", tag: "Раздели утверждения на верные и неверные" },
    }),
    uk: { name: "Сортування", tag: "Розклади твердження на правильні та неправильні" },
    ja: { name: "ぶんるい", tag: "文を正しいものと間違っているものに分けよう" },
    es: { name: "Clasificación", tag: "Clasifica las afirmaciones en correctas e incorrectas" },
    fr: { name: "Tri", tag: "Classe les affirmations en vraies et fausses" },
  },
  doplnovani: {
    ...withFallbacks({
      cs: { name: "Doplňování", tag: "Doplň chybějící slova do vět" },
      en: { name: "Fill the Gaps", tag: "Fill the missing words into sentences" },
      de: { name: "Lückentext", tag: "Setze die fehlenden Wörter ein" },
      ru: { name: "Вставь слово", tag: "Вставь пропущенные слова" },
    }),
    uk: { name: "Вставте слово", tag: "Встав пропущені слова в речення" },
    ja: { name: "穴埋め", tag: "文の空らんに正しい言葉を入れよう" },
    es: { name: "Rellenar huecos", tag: "Completa las frases con las palabras que faltan" },
    fr: { name: "Texte à trous", tag: "Insère les mots manquants dans les phrases" },
  },
  milionar: {
    ...withFallbacks({
      cs: { name: "Výstup na vrchol", tag: "Stoupej po žebříčku otázek až na vrchol" },
      en: { name: "Summit Climb", tag: "Climb the question ladder to the summit" },
      de: { name: "Gipfelsturm", tag: "Steig die Fragenleiter bis zum Gipfel hinauf" },
      ru: { name: "Восхождение на вершину", tag: "Поднимайся по лестнице вопросов к вершине" },
    }),
    uk: { name: "Підйом на вершину", tag: "Піднімайся сходинками питань до вершини" },
    ja: { name: "頂上への道", tag: "問題のはしごをのぼって頂上を目指そう" },
    es: { name: "Ascenso a la cima", tag: "Sube la escalera de preguntas hasta la cumbre" },
    fr: { name: "Ascension au sommet", tag: "Gravis l'échelle des questions jusqu'au sommet" },
  },
  presmycky: {
    ...withFallbacks({
      cs: { name: "Přesmyčky", tag: "Poskládej odpověď ze zamíchaných písmen" },
      en: { name: "Anagrams", tag: "Unscramble the letters into the answer" },
      de: { name: "Buchstabensalat", tag: "Ordne die Buchstaben zur Antwort" },
      ru: { name: "Анаграммы", tag: "Собери ответ из перемешанных букв" },
    }),
    uk: { name: "Анаграми", tag: "Склади відповідь із перемішаних літер" },
    ja: { name: "アナグラム", tag: "バラバラの文字を並べ替えて答えを作ろう" },
    es: { name: "Anagramas", tag: "Ordena las letras revueltas para formar la respuesta" },
    fr: { name: "Anagrammes", tag: "Remets les lettres mélangées dans l'ordre pour trouver la réponse" },
  },
  blesk: {
    ...withFallbacks({
      cs: { name: "Bleskový kvíz", tag: "Co nejvíc správných odpovědí za minutu" },
      en: { name: "Lightning Quiz", tag: "As many right answers as you can in a minute" },
      de: { name: "Blitz-Quiz", tag: "So viele richtige Antworten wie möglich in einer Minute" },
      ru: { name: "Блиц-викторина", tag: "Как можно больше верных ответов за минуту" },
    }),
    uk: { name: "Блискавична вікторина", tag: "Якомога більше правильних відповідей за хвилину" },
    ja: { name: "ひらめきクイズ", tag: "1分間にできるだけ多くの正解を出そう" },
    es: { name: "Quiz relámpago", tag: "Consigue cuantas respuestas correctas puedas en un minuto" },
    fr: { name: "Quiz éclair", tag: "Le plus de bonnes réponses possible en une minute" },
  },
  poklad: {
    ...withFallbacks({
      cs: { name: "Hon za pokladem", tag: "Odpovídej a odkopávej políčka s pokladem" },
      en: { name: "Treasure Hunt", tag: "Answer and dig up tiles hiding treasure" },
      de: { name: "Schatzsuche", tag: "Antworte und grab Felder mit Schätzen aus" },
      ru: { name: "Охота за сокровищами", tag: "Отвечай и раскапывай клетки с кладом" },
    }),
    uk: { name: "Полювання за скарбом", tag: "Відповідай і розкопуй клітинки зі скарбом" },
    ja: { name: "たからさがし", tag: "答えて、たからのマスを掘り当てよう" },
    es: { name: "Búsqueda del tesoro", tag: "Responde y excava las casillas que esconden el tesoro" },
    fr: { name: "Chasse au trésor", tag: "Réponds et déterre les cases qui cachent le trésor" },
  },
  oblekani: {
    ...withFallbacks({
      cs: { name: "Obleč panenku", tag: "Za každou správnou odpověď jeden kus oblečení" },
      en: { name: "Dress the Doll", tag: "One piece of clothing per right answer" },
      de: { name: "Puppe anziehen", tag: "Ein Kleidungsstück pro richtige Antwort" },
      ru: { name: "Наряди куклу", tag: "Одна вещь за каждый правильный ответ" },
    }),
    uk: { name: "Одягни ляльку", tag: "За кожну правильну відповідь один предмет одягу" },
    ja: { name: "おにんぎょうのおきがえ", tag: "正しい答え1つにつき、服を1枚着せよう" },
    es: { name: "Viste a la muñeca", tag: "Una prenda de ropa por cada respuesta correcta" },
    fr: { name: "Habille la poupée", tag: "Un vêtement par bonne réponse" },
  },
  obrana: {
    ...withFallbacks({
      cs: { name: "Obrana města", tag: "Odpovídej a ubraň hrad před vlnami nepřátel" },
      en: { name: "Castle Defence", tag: "Answer to defend the castle from waves of foes" },
      de: { name: "Burgverteidigung", tag: "Antworte und verteidige die Burg gegen Wellen" },
      ru: { name: "Оборона замка", tag: "Отвечай и защищай замок от волн врагов" },
    }),
    uk: { name: "Оборона міста", tag: "Відповідай і захищай замок від хвиль ворогів" },
    ja: { name: "まちの防衛", tag: "答えて、おしよせる敵の波からお城を守ろう" },
    es: { name: "Defensa de la ciudad", tag: "Responde para defender el castillo de las oleadas enemigas" },
    fr: { name: "Défense de la ville", tag: "Réponds pour défendre le château contre les vagues d'ennemis" },
  },
  krizovka: {
    ...withFallbacks({
      cs: { name: "Křížovka", tag: "Vyplň křížovku odpověďmi na otázky" },
      en: { name: "Crossword", tag: "Fill the crossword with the answers" },
      de: { name: "Kreuzworträtsel", tag: "Füll das Rätsel mit den Antworten aus" },
      ru: { name: "Кроссворд", tag: "Заполни кроссворд ответами" },
    }),
    uk: { name: "Кросворд", tag: "Заповни кросворд відповідями на питання" },
    ja: { name: "クロスワード", tag: "問題の答えでクロスワードを埋めよう" },
    es: { name: "Crucigrama", tag: "Rellena el crucigrama con las respuestas" },
    fr: { name: "Mots croisés", tag: "Remplis la grille avec les réponses" },
  },
  pravda: {
    ...withFallbacks({
      cs: { name: "Pravda, nebo lež", tag: "Rychle rozhodni, jestli tvrzení platí" },
      en: { name: "True or False", tag: "Decide fast whether the statement is true" },
      de: { name: "Wahr oder falsch", tag: "Entscheide schnell, ob die Aussage stimmt" },
      ru: { name: "Правда или ложь", tag: "Быстро реши, верно ли утверждение" },
    }),
    uk: { name: "Правда чи брехня", tag: "Швидко вирішь, правдиве твердження чи ні" },
    ja: { name: "ほんとうかうそか", tag: "文が正しいかどうか、すばやく判断しよう" },
    es: { name: "Verdadero o falso", tag: "Decide rápido si la afirmación es verdadera" },
    fr: { name: "Vrai ou faux", tag: "Décide vite si l'affirmation est vraie" },
  },
  piskvorky: {
    ...withFallbacks({
      cs: { name: "Kvízové piškvorky", tag: "Políčko získáš jen za správnou odpověď" },
      en: { name: "Quiz Tic-Tac-Toe", tag: "Win a square only with a right answer" },
      de: { name: "Quiz-Tic-Tac-Toe", tag: "Ein Feld gibt es nur für eine richtige Antwort" },
      ru: { name: "Крестики-нолики", tag: "Клетка твоя только за верный ответ" },
    }),
    uk: { name: "Квізові хрестики-нолики", tag: "Клітинку отримаєш лише за правильну відповідь" },
    ja: { name: "クイズ三目並べ", tag: "正しい答えだけでマスを取れます" },
    es: { name: "Tres en raya de preguntas", tag: "Solo consigues una casilla con una respuesta correcta" },
    fr: { name: "Morpion quiz", tag: "Tu ne gagnes une case qu'avec une bonne réponse" },
  },
  bingo: {
    ...withFallbacks({
      cs: { name: "Bingo", tag: "Najdi odpověď na kartě a slož řadu" },
      en: { name: "Bingo", tag: "Find the answer on your card and complete a line" },
      de: { name: "Bingo", tag: "Finde die Antwort auf deiner Karte und vervollständige eine Reihe" },
      ru: { name: "Бинго", tag: "Найди ответ на карточке и собери ряд" },
    }),
    uk: { name: "Бінго", tag: "Знайди відповідь на своїй картці і збери ряд" },
    ja: { name: "ビンゴ", tag: "カードの中から答えを見つけて、一列そろえよう" },
    es: { name: "Bingo", tag: "Encuentra la respuesta en tu cartón y completa una línea" },
    fr: { name: "Bingo", tag: "Trouve la réponse sur ta carte et complète une ligne" },
  },
  razeni: {
    cs: { name: "Seřaď", tag: "Seřaď položky do správného pořadí" },
    en: { name: "Put in Order", tag: "Arrange the items in the right order" },
    de: { name: "Reihenfolge", tag: "Bring die Elemente in die richtige Reihenfolge" },
    ru: { name: "Порядок", tag: "Расставь элементы в правильном порядке" },
    uk: { name: "Порядок", tag: "Розстав елементи в правильному порядку" },
    ja: { name: "ならべかえ", tag: "正しい順番に並べよう" },
    es: { name: "Ordenar", tag: "Pon los elementos en el orden correcto" },
    fr: { name: "Remettre en ordre", tag: "Remets les éléments dans le bon ordre" },
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
  ...withFallbacks({
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
  }),
  uk: {
    action: "Активні ігри",
    actionHint: "Рух, швидкість і реакція: влучай, хапай або лови правильну відповідь.",
    classic: "Класичні ігри",
    classicHint: "Спокійно і без поспіху: вікторини, словесні ігри та головоломки.",
    isNew: "Нове",
    best: "Рекорд",
    howTo: "Як грати",
    start: "Почати гру",
    length: "Тривалість раунду",
    questions: "питань",
    newBest: "Новий особистий рекорд!",
    bestSoFar: "Твій рекорд",
    hidden: "Деяких ігор тут немає, бо їх не можна створити з відповідей цього курсу (наприклад, пошуковий кросворд із чисел).",
  },
  ja: {
    action: "アクションゲーム",
    actionHint: "動きとスピードと反射神経で勝負！ 正しい答えを当てたり、つかんだり、キャッチしたりしよう。",
    classic: "クラシックゲーム",
    classicHint: "ゆったり楽しむゲーム: クイズ、ことば遊び、パズル。",
    isNew: "新作",
    best: "ベスト",
    howTo: "あそび方",
    start: "ゲームをはじめる",
    length: "ラウンドの長さ",
    questions: "問",
    newBest: "自己ベスト更新！",
    bestSoFar: "あなたのベスト",
    hidden: "このコースの答えからは作れないため、一部のゲームはここにありません（例: 数字でつくるワードサーチ）。",
  },
  es: {
    action: "Juegos de acción",
    actionHint: "Movimiento, velocidad y reflejos: acierta, atrapa o coge la respuesta correcta.",
    classic: "Juegos clásicos",
    classicHint: "Tranquilos y sin prisas: quizzes, juegos de palabras y acertijos.",
    isNew: "Nuevo",
    best: "Récord",
    howTo: "Cómo se juega",
    start: "Empezar juego",
    length: "Duración de la ronda",
    questions: "preguntas",
    newBest: "¡Nuevo récord personal!",
    bestSoFar: "Tu récord",
    hidden: "Algunos juegos no aparecen aquí porque no se pueden crear con las respuestas de este curso (por ejemplo, una sopa de letras con números).",
  },
  fr: {
    action: "Jeux d'action",
    actionHint: "Mouvement, vitesse et réflexes : touche, attrape ou saisis la bonne réponse.",
    classic: "Jeux classiques",
    classicHint: "Calmes et sans précipitation : quiz, jeux de mots et énigmes.",
    isNew: "Nouveau",
    best: "Record",
    howTo: "Comment jouer",
    start: "Lancer le jeu",
    length: "Durée de la manche",
    questions: "questions",
    newBest: "Nouveau record personnel !",
    bestSoFar: "Ton record",
    hidden: "Certains jeux manquent ici, car ils ne peuvent pas être créés à partir des réponses de ce cours (par ex. des mots mêlés avec des chiffres).",
  },
};

export function getGamesUiText(locale: Locale): GamesUiText {
  return UI[locale];
}

const CALM_NOTE: Partial<Record<Locale, string>> & { en: string } = {
  cs: "U složitých úkolů nabízíme jen klidné hry bez tlaku na čas a bez rychlých akcí, ať máš prostor přemýšlet.",
  en: "Complex tasks only offer calm games with no time pressure or fast action, so you have room to think.",
  de: "Bei schwierigen Aufgaben gibt es nur ruhige Spiele ohne Zeitdruck und ohne schnelle Action, damit du in Ruhe nachdenken kannst.",
  ru: "В сложных заданиях доступны только спокойные игры без спешки и быстрых действий, чтобы можно было подумать.",
};

export function getCalmNote(locale: Locale): string {
  return CALM_NOTE[locale] ?? CALM_NOTE.en;
}
