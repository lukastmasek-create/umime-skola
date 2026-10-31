import type { Locale } from "./config";

// Texty živého 3D městečka (/mestecko): názvy a popisy míst a ovládací prvky.
type PlaceText = { name: string; desc: string };
type UiText = {
  title: string;
  loading: string;
  noWebgl: string;
  hint: string;
  tabs: { places: string; quests: string; build: string; treasures: string };
  worlds: string;
  town: string;
  homes: string;
  plots: string;
  go: string;
  enter: string;
  soon: string;
  skip: string;
  day: string;
  night: string;
  buildMode: string;
  fullscreen: string;
  oldTown: string;
  questsEmpty: string;
  claim: string;
  claimed: string;
  level: string;
  upgrade: string;
  maxed: string;
  points: string;
  collected: string;
  setReward: string;
  claimSet: string;
  login: string;
  arrived: string;
  plotDesc: string;
  roadNames: Record<string, string>;
  buildRoad: string;
  roadFirst: string;
  chooseBuilding: string;
  buildHere: string;
  perDay: string; // {n}
  income: string;
  incomeClaim: string; // {n}
  incomeDone: string;
  notEnough: string;
  roadsAndPlots: string;
  plotBuildings: Record<string, { name: string; desc: string }>;
  buildBonus: Record<string, string>;
  quest: Record<string, string>;
};

const PLACES_CS: Record<string, PlaceText> = {
  namesti: { name: "Náměstí", desc: "Srdce městečka s fontánou. Odtud vedou ulice ke škole, do lesa, k hradu a přes mosty na jih." },
  skola: { name: "Škola", desc: "Kurzy a testy ze všech předmětů. Vylepšená škola dává víc XP za testy." },
  knihovna: { name: "Knihovna", desc: "Materiály k učení a minihra: srovnej knihy podle abecedy." },
  hvezdarna: { name: "Hvězdárna", desc: "Hvězdář zkouší z vesmíru a zeměpisu: planety a světadíly." },
  herna: { name: "Herna", desc: "Stálé hry a hraní s kamarády. Vylepšená herna dává víc XP ve hrách." },
  arena: { name: "Aréna", desc: "Žebříčky hráčů a škol, liga a souboje." },
  kvetinarstvi: { name: "Květinářství", desc: "Rozděl dodávku: ovoce, zelenina, květiny a stromy." },
  obchod: { name: "Obchod", desc: "Kolo štěstí a kosmetika. Vylepšený obchod vrací část bodů z nákupů." },
  pekarna: { name: "Pekárna", desc: "Pokladna: spočítej cenu a vrať drobné. A pekař ti ukáže recepty." },
  pokoj: { name: "Můj pokoj", desc: "Tvůj domek s pokojem, který si zařizuješ." },
  les: { name: "Kouzelný les", desc: "Obří strom s domečkem a obchod víl." },
  hrad: { name: "Hrad a tržiště", desc: "Rytíři, princezny a tržiště." },
  pristav: { name: "Pirátský přístav", desc: "Molo s pirátskou lodí a přístavní obchod." },
  more: { name: "Podmořské město", desc: "Skleněné kupole v laguně a obchod mořských bytostí." },
  stanice: { name: "Vesmírná stanice", desc: "Startovací rampa s raketou a vesmírný obchod." },
  babicka: { name: "Babička Věra", desc: "Vypráví o historii a ráda dostane květinu." },
  farmar: { name: "Farmář Jan", desc: "Stará se o pole a zvířata kolem městečka." },
  kluk: { name: "Kuba", desc: "Kamarád, který miluje hry." },
  rybar: { name: "Rybář Olda", desc: "Zná každou rybu v přístavu." },
  vedkyne: { name: "Vědkyně Ema", desc: "Zkoumá přírodu a hvězdy." },
  kapitan: { name: "Kapitánka Lucie", desc: "Velí lodi a miluje dobrodružství." },
  parcela1: { name: "Parcela u lesa", desc: "" },
  parcela2: { name: "Parcela u hradu", desc: "" },
  parcela3: { name: "Parcela na kopci", desc: "" },
  parcela4: { name: "Parcela u lip", desc: "" },
  parcela5: { name: "Parcela u moře", desc: "" },
};

const PLACES_EN: Record<string, PlaceText> = {
  namesti: { name: "Town square", desc: "The heart of town with a fountain. Streets lead to the school, the forest, the castle and over the bridges south." },
  skola: { name: "School", desc: "Courses and tests in every subject. An upgraded school gives more XP for tests." },
  knihovna: { name: "Library", desc: "Study materials and a minigame: put the books in ABC order." },
  hvezdarna: { name: "Observatory", desc: "The astronomer quizzes you on space and geography: planets and continents." },
  herna: { name: "Game hall", desc: "Idle games and playing with friends. An upgraded hall gives more XP in games." },
  arena: { name: "Arena", desc: "Player and school leaderboards, league and duels." },
  kvetinarstvi: { name: "Florist", desc: "Sort the delivery: fruit, vegetables, flowers and trees." },
  obchod: { name: "Shop", desc: "Wheel of fortune and cosmetics. An upgraded shop gives back part of your points." },
  pekarna: { name: "Bakery", desc: "The till: add up prices and give change. The baker also shares recipes." },
  pokoj: { name: "My room", desc: "Your little house with a room to decorate." },
  les: { name: "Magic forest", desc: "A giant tree house and the fairies' shop." },
  hrad: { name: "Castle and market", desc: "Knights, princesses and a market." },
  pristav: { name: "Pirate harbour", desc: "A pier with a pirate ship and the harbour shop." },
  more: { name: "Underwater city", desc: "Glass domes in the lagoon and the sea folk's shop." },
  stanice: { name: "Space station", desc: "A launch pad with a rocket and the space shop." },
  babicka: { name: "Granny Vera", desc: "Tells stories about history and loves flowers." },
  farmar: { name: "Farmer Jan", desc: "Looks after the fields and animals around town." },
  kluk: { name: "Kuba", desc: "A friend who loves games." },
  rybar: { name: "Fisherman Olda", desc: "Knows every fish in the harbour." },
  vedkyne: { name: "Scientist Ema", desc: "Studies nature and the stars." },
  kapitan: { name: "Captain Lucie", desc: "Commands the ship and loves adventure." },
  parcela1: { name: "Plot by the forest", desc: "" },
  parcela2: { name: "Plot by the castle", desc: "" },
  parcela3: { name: "Hill plot", desc: "" },
  parcela4: { name: "Plot by the lime trees", desc: "" },
  parcela5: { name: "Seaside plot", desc: "" },
};

const PLACES_DE: Record<string, PlaceText> = {
  namesti: { name: "Marktplatz", desc: "Das Herz des Städtchens mit Brunnen. Straßen führen zur Schule, in den Wald, zur Burg und über die Brücken nach Süden." },
  skola: { name: "Schule", desc: "Kurse und Tests in allen Fächern. Eine ausgebaute Schule gibt mehr XP für Tests." },
  knihovna: { name: "Bibliothek", desc: "Lernmaterialien und ein Minispiel: Bücher nach dem ABC ordnen." },
  hvezdarna: { name: "Sternwarte", desc: "Die Astronomin fragt nach Weltall und Erdkunde: Planeten und Kontinente." },
  herna: { name: "Spielhalle", desc: "Dauerspiele und Spielen mit Freunden. Eine ausgebaute Halle gibt mehr XP in Spielen." },
  arena: { name: "Arena", desc: "Bestenlisten der Spieler und Schulen, Liga und Duelle." },
  kvetinarstvi: { name: "Blumenladen", desc: "Sortiere die Lieferung: Obst, Gemüse, Blumen und Bäume." },
  obchod: { name: "Laden", desc: "Glücksrad und Kosmetik. Ein ausgebauter Laden gibt Punkte zurück." },
  pekarna: { name: "Bäckerei", desc: "Die Kasse: Preise rechnen und Wechselgeld geben. Der Bäcker zeigt dir auch Rezepte." },
  pokoj: { name: "Mein Zimmer", desc: "Dein Häuschen mit Zimmer zum Einrichten." },
  les: { name: "Zauberwald", desc: "Ein riesiges Baumhaus und der Feenladen." },
  hrad: { name: "Burg und Markt", desc: "Ritter, Prinzessinnen und ein Markt." },
  pristav: { name: "Piratenhafen", desc: "Ein Steg mit Piratenschiff und der Hafenladen." },
  more: { name: "Unterwasserstadt", desc: "Glaskuppeln in der Lagune und der Laden der Meeresbewohner." },
  stanice: { name: "Raumstation", desc: "Startrampe mit Rakete und der Weltraumladen." },
  babicka: { name: "Oma Vera", desc: "Erzählt von Geschichte und freut sich über Blumen." },
  farmar: { name: "Bauer Jan", desc: "Kümmert sich um Felder und Tiere." },
  kluk: { name: "Kuba", desc: "Ein Freund, der Spiele liebt." },
  rybar: { name: "Fischer Olda", desc: "Kennt jeden Fisch im Hafen." },
  vedkyne: { name: "Forscherin Ema", desc: "Erforscht Natur und Sterne." },
  kapitan: { name: "Kapitänin Lucie", desc: "Führt das Schiff und liebt Abenteuer." },
  parcela1: { name: "Grundstück am Wald", desc: "" },
  parcela2: { name: "Grundstück an der Burg", desc: "" },
  parcela3: { name: "Grundstück am Hügel", desc: "" },
  parcela4: { name: "Grundstück an den Linden", desc: "" },
  parcela5: { name: "Grundstück am Meer", desc: "" },
};

const PLACES_RU: Record<string, PlaceText> = {
  namesti: { name: "Площадь", desc: "Сердце городка с фонтаном. Отсюда улицы ведут к школе, в лес, к замку и по мостам на юг." },
  skola: { name: "Школа", desc: "Курсы и тесты по всем предметам. Улучшенная школа даёт больше XP за тесты." },
  knihovna: { name: "Библиотека", desc: "Учебные материалы и мини-игра: расставь книги по алфавиту." },
  hvezdarna: { name: "Обсерватория", desc: "Астроном спрашивает о космосе и географии: планеты и материки." },
  herna: { name: "Игровой зал", desc: "Постоянные игры и игры с друзьями. Улучшенный зал даёт больше XP в играх." },
  arena: { name: "Арена", desc: "Рейтинги игроков и школ, лига и дуэли." },
  kvetinarstvi: { name: "Цветочный", desc: "Разбери поставку: фрукты, овощи, цветы и деревья." },
  obchod: { name: "Магазин", desc: "Колесо удачи и косметика. Улучшенный магазин возвращает часть баллов." },
  pekarna: { name: "Пекарня", desc: "Касса: посчитай цену и дай сдачу. А пекарь покажет рецепты." },
  pokoj: { name: "Моя комната", desc: "Твой домик с комнатой, которую ты обставляешь." },
  les: { name: "Волшебный лес", desc: "Огромный дом на дереве и магазин фей." },
  hrad: { name: "Замок и рынок", desc: "Рыцари, принцессы и рынок." },
  pristav: { name: "Пиратская гавань", desc: "Причал с пиратским кораблём и магазин гавани." },
  more: { name: "Подводный город", desc: "Стеклянные купола в лагуне и магазин морских жителей." },
  stanice: { name: "Космическая станция", desc: "Стартовая площадка с ракетой и космический магазин." },
  babicka: { name: "Бабушка Вера", desc: "Рассказывает об истории и любит цветы." },
  farmar: { name: "Фермер Ян", desc: "Заботится о полях и животных." },
  kluk: { name: "Куба", desc: "Друг, который обожает игры." },
  rybar: { name: "Рыбак Олда", desc: "Знает каждую рыбу в гавани." },
  vedkyne: { name: "Учёная Эма", desc: "Изучает природу и звёзды." },
  kapitan: { name: "Капитан Люси", desc: "Командует кораблём и любит приключения." },
  parcela1: { name: "Участок у леса", desc: "" },
  parcela2: { name: "Участок у замка", desc: "" },
  parcela3: { name: "Участок на холме", desc: "" },
  parcela4: { name: "Участок у лип", desc: "" },
  parcela5: { name: "Участок у моря", desc: "" },
};

const UI: Record<Locale, UiText> = {
  cs: {
    title: "Městečko",
    loading: "Stavím městečko…",
    noWebgl: "Tvůj prohlížeč neumí 3D grafiku. Zkus jiný prohlížeč, nebo otevři původní městečko.",
    hint: "Klikni na místo a hrdina tam dojde · WASD chůze · táhni pro otočení · kolečko přiblíží",
    tabs: { places: "Místa", quests: "Úkoly", build: "Stavby", treasures: "Poklady" },
    worlds: "Světy",
    town: "Ve městě",
    homes: "Obyvatelé",
    plots: "Volné parcely",
    go: "Jít tam",
    enter: "Vstoupit",
    soon: "Brzy",
    skip: "Přeskočit",
    day: "Den",
    night: "Noc",
    buildMode: "Stavění",
    fullscreen: "Celá obrazovka",
    oldTown: "Původní městečko",
    questsEmpty: "Přihlas se a obyvatelé ti dají úkoly.",
    claim: "Vyzvednout",
    claimed: "Hotovo",
    level: "Úroveň",
    upgrade: "Vylepšit",
    maxed: "Nejvyšší úroveň",
    points: "bodů",
    collected: "Dnes sebráno",
    setReward: "Celá sada: {n} bodů",
    claimSet: "Vyzvednout odměnu",
    login: "Přihlas se, ať se ti postup ukládá.",
    arrived: "Jsi u místa",
    plotDesc: "Volná parcela pro vlastní stavbu. Nejdřív sem za body dostav cestu, pak si vyber budovu: každá vydělává body každý den a její obyvatel ti dá úkol navíc.",
    roadNames: { zapad: "Západní ulice", vychod: "Východní ulice", severozapad: "Pobřežní ulice" },
    buildRoad: "Postavit cestu",
    roadFirst: "Nejdřív sem postav cestu.",
    chooseBuilding: "Co tu postavíš?",
    buildHere: "Postavit",
    perDay: "+{n} 🪙 denně",
    income: "Příjem z vlastních budov",
    incomeClaim: "Vybrat +{n} 🪙",
    incomeDone: "Dnešní příjem vybrán, zítra zase.",
    notEnough: "Na to nemáš dost bodů.",
    roadsAndPlots: "Cesty a parcely",
    plotBuildings: { kavarna: { name: "Kavárna", desc: "Terasa se slunečníky. Kavárnice ti každý den zadá minihry." }, dilna: { name: "Truhlářská dílna", desc: "Ponk, koza a hromady prken. Truhlář chce, abys hrál/a hry v kurzech." }, sklenik: { name: "Skleník", desc: "Rostliny pod sklem a záhonky. Zahradnice tě pošle sbírat věci po městě." }, mlyn: { name: "Větrný mlýn", desc: "Lopatky se točí a mlýn mele. Mlynář chce, abys sbíral/a XP." }, muzeum: { name: "Muzeum", desc: "Sloupy, kupole a glóbus. Kurátor ti dá test z kurzů." } },
    buildBonus: { skola: "+5 % XP za testy / úroveň", herna: "+5 % XP ve hrách / úroveň", obchod: "3 % bodů zpět z nákupů / úroveň", namesti: "+1 bod za sebranou věc / úroveň", pekarna: "+1 kolo minihry / úroveň", knihovna: "+1 kolo minihry / úroveň", hvezdarna: "+1 kolo minihry / úroveň", kvetinarstvi: "+1 kolo minihry / úroveň" },
    quest: { xp: "Získej {n} XP v testech a hrách", games: "Zahraj si {n}× hru v kurzech", test: "Dokonči test", collect: "Seber {n} věcí po městě", mini: "Zahraj si {n}× minihru v městečku", npc: "Odpověz obyvateli na otázku", escape: "Vyřeš únikovku" },
  },
  en: {
    title: "Town",
    loading: "Building the town…",
    noWebgl: "Your browser can't show 3D graphics. Try another browser or open the original town.",
    hint: "Click a place and the hero walks there · WASD to walk · drag to rotate · wheel to zoom",
    tabs: { places: "Places", quests: "Quests", build: "Build", treasures: "Treasures" },
    worlds: "Worlds",
    town: "In town",
    homes: "Residents",
    plots: "Free plots",
    go: "Go there",
    enter: "Enter",
    soon: "Soon",
    skip: "Skip",
    day: "Day",
    night: "Night",
    buildMode: "Building",
    fullscreen: "Full screen",
    oldTown: "Original town",
    questsEmpty: "Log in and the residents will give you quests.",
    claim: "Claim",
    claimed: "Done",
    level: "Level",
    upgrade: "Upgrade",
    maxed: "Max level",
    points: "points",
    collected: "Collected today",
    setReward: "Full set: {n} points",
    claimSet: "Claim reward",
    login: "Log in to save your progress.",
    arrived: "You're here",
    plotDesc: "A free plot for your own building. First pay to finish the road, then pick a building: each one earns points every day and its resident gives you an extra quest.",
    roadNames: { zapad: "West Street", vychod: "East Street", severozapad: "Seaside Street" },
    buildRoad: "Build the road",
    roadFirst: "Build a road here first.",
    chooseBuilding: "What will you build?",
    buildHere: "Build",
    perDay: "+{n} 🪙 a day",
    income: "Income from your buildings",
    incomeClaim: "Collect +{n} 🪙",
    incomeDone: "Today's income collected, come back tomorrow.",
    notEnough: "You don't have enough points.",
    roadsAndPlots: "Roads and plots",
    plotBuildings: { kavarna: { name: "Café", desc: "A terrace with parasols. The café owner gives you minigames every day." }, dilna: { name: "Carpenter's workshop", desc: "A workbench, a sawhorse and stacks of planks. The carpenter wants you to play course games." }, sklenik: { name: "Greenhouse", desc: "Plants under glass and garden beds. The gardener sends you collecting around town." }, mlyn: { name: "Windmill", desc: "The sails turn and the mill grinds. The miller wants you to earn XP." }, muzeum: { name: "Museum", desc: "Columns, a dome and a globe. The curator gives you a course test." } },
    buildBonus: { skola: "+5% XP for tests / level", herna: "+5% XP in games / level", obchod: "3% of points back / level", namesti: "+1 point per item / level", pekarna: "+1 minigame round / level", knihovna: "+1 minigame round / level", hvezdarna: "+1 minigame round / level", kvetinarstvi: "+1 minigame round / level" },
    quest: { xp: "Earn {n} XP in tests and games", games: "Play {n} course games", test: "Finish a test", collect: "Collect {n} items in town", mini: "Play {n} town minigames", npc: "Answer a resident's question", escape: "Solve an escape room" },
  },
  de: {
    title: "Städtchen",
    loading: "Das Städtchen wird gebaut…",
    noWebgl: "Dein Browser kann keine 3D-Grafik. Probier einen anderen Browser oder öffne das alte Städtchen.",
    hint: "Klick auf einen Ort, der Held geht hin · WASD laufen · ziehen zum Drehen · Mausrad zoomt",
    tabs: { places: "Orte", quests: "Aufgaben", build: "Bauen", treasures: "Schätze" },
    worlds: "Welten",
    town: "In der Stadt",
    homes: "Bewohner",
    plots: "Freie Grundstücke",
    go: "Hingehen",
    enter: "Betreten",
    soon: "Bald",
    skip: "Überspringen",
    day: "Tag",
    night: "Nacht",
    buildMode: "Bauen",
    fullscreen: "Vollbild",
    oldTown: "Altes Städtchen",
    questsEmpty: "Melde dich an, dann bekommst du Aufgaben.",
    claim: "Abholen",
    claimed: "Erledigt",
    level: "Stufe",
    upgrade: "Ausbauen",
    maxed: "Höchste Stufe",
    points: "Punkte",
    collected: "Heute gesammelt",
    setReward: "Ganzes Set: {n} Punkte",
    claimSet: "Belohnung abholen",
    login: "Melde dich an, damit dein Fortschritt gespeichert wird.",
    arrived: "Du bist da",
    plotDesc: "Ein freies Grundstück für dein eigenes Gebäude. Bezahle zuerst die Straße, dann wähle ein Gebäude: Jedes bringt täglich Punkte und sein Bewohner gibt dir eine Extra-Aufgabe.",
    roadNames: { zapad: "Weststraße", vychod: "Oststraße", severozapad: "Küstenstraße" },
    buildRoad: "Straße bauen",
    roadFirst: "Bau zuerst eine Straße hierher.",
    chooseBuilding: "Was baust du hier?",
    buildHere: "Bauen",
    perDay: "+{n} 🪙 pro Tag",
    income: "Einnahmen deiner Gebäude",
    incomeClaim: "+{n} 🪙 abholen",
    incomeDone: "Heutige Einnahmen abgeholt, morgen wieder.",
    notEnough: "Dafür hast du nicht genug Punkte.",
    roadsAndPlots: "Straßen und Grundstücke",
    plotBuildings: { kavarna: { name: "Café", desc: "Eine Terrasse mit Sonnenschirmen. Die Cafébesitzerin gibt dir täglich Minispiele." }, dilna: { name: "Tischlerei", desc: "Hobelbank, Sägebock und Bretterstapel. Der Tischler will, dass du Kursspiele spielst." }, sklenik: { name: "Gewächshaus", desc: "Pflanzen unter Glas und Beete. Die Gärtnerin schickt dich zum Sammeln durchs Städtchen." }, mlyn: { name: "Windmühle", desc: "Die Flügel drehen sich und die Mühle mahlt. Der Müller will, dass du XP sammelst." }, muzeum: { name: "Museum", desc: "Säulen, Kuppel und Globus. Der Kurator gibt dir einen Kurstest." } },
    buildBonus: { skola: "+5 % XP für Tests / Stufe", herna: "+5 % XP in Spielen / Stufe", obchod: "3 % Punkte zurück / Stufe", namesti: "+1 Punkt pro Fund / Stufe", pekarna: "+1 Runde Minispiel / Stufe", knihovna: "+1 Runde Minispiel / Stufe", hvezdarna: "+1 Runde Minispiel / Stufe", kvetinarstvi: "+1 Runde Minispiel / Stufe" },
    quest: { xp: "Sammle {n} XP in Tests und Spielen", games: "Spiel {n} Kursspiele", test: "Schließ einen Test ab", collect: "Sammle {n} Dinge im Städtchen", mini: "Spiel {n} Minispiele im Städtchen", npc: "Beantworte eine Frage eines Bewohners", escape: "Löse einen Escape-Room" },
  },
  ru: {
    title: "Городок",
    loading: "Строю городок…",
    noWebgl: "Твой браузер не умеет 3D-графику. Попробуй другой браузер или открой старый городок.",
    hint: "Нажми на место, и герой туда дойдёт · WASD ходьба · тяни для поворота · колесо приближает",
    tabs: { places: "Места", quests: "Задания", build: "Стройка", treasures: "Клады" },
    worlds: "Миры",
    town: "В городе",
    homes: "Жители",
    plots: "Свободные участки",
    go: "Пойти",
    enter: "Войти",
    soon: "Скоро",
    skip: "Пропустить",
    day: "День",
    night: "Ночь",
    buildMode: "Стройка",
    fullscreen: "На весь экран",
    oldTown: "Старый городок",
    questsEmpty: "Войди, и жители дадут тебе задания.",
    claim: "Забрать",
    claimed: "Готово",
    level: "Уровень",
    upgrade: "Улучшить",
    maxed: "Макс. уровень",
    points: "баллов",
    collected: "Собрано сегодня",
    setReward: "Весь набор: {n} баллов",
    claimSet: "Забрать награду",
    login: "Войди, чтобы прогресс сохранялся.",
    arrived: "Ты на месте",
    plotDesc: "Свободный участок для своей постройки. Сначала дострой за баллы дорогу, потом выбери здание: каждое приносит баллы каждый день, а его житель даёт дополнительное задание.",
    roadNames: { zapad: "Западная улица", vychod: "Восточная улица", severozapad: "Береговая улица" },
    buildRoad: "Построить дорогу",
    roadFirst: "Сначала построй сюда дорогу.",
    chooseBuilding: "Что ты здесь построишь?",
    buildHere: "Построить",
    perDay: "+{n} 🪙 в день",
    income: "Доход от твоих зданий",
    incomeClaim: "Забрать +{n} 🪙",
    incomeDone: "Доход за сегодня получен, приходи завтра.",
    notEnough: "Тебе не хватает баллов.",
    roadsAndPlots: "Дороги и участки",
    plotBuildings: { kavarna: { name: "Кафе", desc: "Терраса с зонтиками. Хозяйка кафе каждый день даёт мини-игры." }, dilna: { name: "Столярная мастерская", desc: "Верстак, козлы и штабеля досок. Столяр хочет, чтобы ты играл в игры курсов." }, sklenik: { name: "Теплица", desc: "Растения под стеклом и грядки. Садовница отправит тебя собирать вещи по городку." }, mlyn: { name: "Ветряная мельница", desc: "Крылья крутятся, мельница мелет. Мельник хочет, чтобы ты набирал XP." }, muzeum: { name: "Музей", desc: "Колонны, купол и глобус. Хранитель даст тебе тест из курсов." } },
    buildBonus: { skola: "+5 % XP за тесты / уровень", herna: "+5 % XP в играх / уровень", obchod: "3 % баллов назад / уровень", namesti: "+1 балл за находку / уровень", pekarna: "+1 раунд мини-игры / уровень", knihovna: "+1 раунд мини-игры / уровень", hvezdarna: "+1 раунд мини-игры / уровень", kvetinarstvi: "+1 раунд мини-игры / уровень" },
    quest: { xp: "Набери {n} XP в тестах и играх", games: "Сыграй {n} игр в курсах", test: "Пройди тест", collect: "Собери {n} предметов в городке", mini: "Сыграй {n} мини-игр в городке", npc: "Ответь жителю на вопрос", escape: "Пройди квест-комнату" },
  },
};

const PLACES: Record<Locale, Record<string, PlaceText>> = { cs: PLACES_CS, en: PLACES_EN, de: PLACES_DE, ru: PLACES_RU };

export function getTown3dText(locale: Locale) {
  return { ui: UI[locale], places: PLACES[locale] };
}
