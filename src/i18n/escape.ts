import type { Locale } from "./config";

export type EscapeText = {
  nav: string;
  list: {
    title: string;
    subtitle: string;
    play: string;
    soon: string;
    note: string;
    sortLabel: string;
    sort: { default: string; easiest: string; hardest: string; subject: string };
    subjectLabel: string;
    allSubjects: string;
    difficulty: string;
    // Názvy obtížností 1–5.
    levels: [string, string, string, string, string];
    // {n} = počet místností, {min} = minut na časomíře.
    roomsCount: string;
    minutes: string;
    best: string;
    shown: string;
    rooms: { id: string; name: string; subject: string; description: string; available: boolean }[];
  };
  ui: {
    start: string;
    modeTitle: string;
    timed: string;
    timedDesc: string;
    relaxed: string;
    relaxedDesc: string;
    time: string;
    elapsed: string;
    danger: string;
    inventory: string;
    inventoryEmpty: string;
    selected: string;
    combineHint: string;
    notes: string;
    close: string;
    check: string;
    hint: string;
    hintNext: string;
    noMoreHints: string;
    askAtom: string;
    atomLabel: string;
    atomDone: string;
    wrong: string;
    solved: string;
    cantCombine: string;
    nothingHere: string;
    reset: string;
    orderHint: string;
    matchHint: string;
    gotItems: string;
    winTitle: string;
    loseTime: string;
    loseDanger: string;
    loseText: string;
    stars: string;
    timeUsed: string;
    mistakes: string;
    hintsUsed: string;
    xp: string;
    unlocked: string;
    loginToSave: string;
    saveError: string;
    playAgain: string;
    backToRooms: string;
    // {n} = číslo místnosti, {total} = počet místností.
    roomProgress: string;
    roomDone: string;
    nextRoom: string;
    nextRoomNote: string;
    solvedCount: string;
  };
};

const cs: EscapeText = {
  nav: "Únikovky",
  list: {
    title: "Únikovky",
    subtitle: "Zamčená místnost, hádanky z učiva a čas, který běží. Dostaň se ven dřív, než bude pozdě.",
    play: "Vstoupit",
    soon: "Brzy",
    note: "Na dalších místnostech pracujeme. Hádanky jsou přeložené do všech jazyků webu.",
    sortLabel: "Řadit",
    sort: { default: "Doporučené", easiest: "Od nejlehčí", hardest: "Od nejtěžší", subject: "Podle předmětu" },
    subjectLabel: "Předmět",
    allSubjects: "Všechny",
    difficulty: "Obtížnost",
    levels: ["Velmi lehká", "Lehká", "Střední", "Těžká", "Velmi těžká"],
    roomsCount: "{n} místnosti",
    minutes: "{min} min",
    best: "Tvůj rekord",
    shown: "Únikovek: {n}",
    rooms: [
      { id: "lab", name: "Laboratoř doktora Atoma", subject: "Chemie", description: "Reaktor se rozjíždí a dveře jsou zamčené. Najdi vodítka, namíchej správné látky a otevři kód.", available: true },
      { id: "museum", name: "Zamčené muzeum", subject: "Dějepis", description: "Vitríny, časová osa a hádanky o významných událostech.", available: true },
      { id: "expedition", name: "Expediční stan", subject: "Zeměpis", description: "Mapa světa, hlavní města a světové strany.", available: true },
      { id: "jungle", name: "Ztracená džungle", subject: "Biologie", description: "Rostliny, živočichové a jejich třídění.", available: true },
      { id: "pirate", name: "Pirátská loď", subject: "Angličtina", description: "Zamknutá kajuta, anglická slovíčka a tajná mapa pokladu.", available: true },
      { id: "kitchen", name: "Kuchyně šéfkuchaře", subject: "Matematika", description: "Recepty, váhy a čas. Spočítej správně, než koláč shoří.", available: true },
      { id: "library", name: "Tajná knihovna", subject: "Čeština", description: "Regály, autoři a příběhy. Najdi cestu ven dřív, než knihovník zhasne.", available: true },
      { id: "observatory", name: "Hvězdárna", subject: "Vesmír", description: "Planety, dalekohled a hvězdná mapa. Otevři kupoli a podívej se na oblohu.", available: true },
      { id: "castle", name: "Hrad na kopci", subject: "Dějepis", description: "Erby, rytíři a padací most. Vyřeš hádanky ze středověku.", available: true },
    ],
  },
  ui: {
    start: "Začít",
    modeTitle: "Vyber režim",
    timed: "S časomírou",
    timedDesc: "{min} minut na všechny místnosti a ukazatel nebezpečí. Víc hvězdiček.",
    relaxed: "Bez časomíry",
    relaxedDesc: "Žádný spěch a nebezpečí tě nevyřadí. Nejvýš 2 hvězdičky.",
    time: "Čas",
    elapsed: "Uplynulo",
    danger: "Nebezpečí",
    inventory: "Inventář",
    inventoryEmpty: "Zatím nic nemáš. Prohledej místnost.",
    selected: "Vybráno",
    combineHint: "Klikni na dva předměty a zkus je spojit, nebo vyber předmět a klikni na místo v místnosti.",
    notes: "Poznámky",
    close: "Zavřít",
    check: "Zkontrolovat",
    hint: "Nápověda",
    hintNext: "Další nápověda",
    noMoreHints: "Další nápověda už není.",
    askAtom: "Zeptat se robota Atoma",
    atomLabel: "Atom",
    atomDone: "Už ti nemám co poradit. Zkus dveře.",
    wrong: "To není správně. Nebezpečí roste!",
    solved: "Vyřešeno!",
    cantCombine: "Tyhle dvě věci se spolu nespojí.",
    nothingHere: "Tady ti to teď nepomůže.",
    reset: "Začít znovu",
    orderHint: "Klikej na kroky v pořadí, v jakém je chceš seřadit.",
    matchHint: "Vyber položku vlevo a pak její dvojici vpravo.",
    gotItems: "Získal/a jsi",
    winTitle: "Utekl/a jsi!",
    loseTime: "Čas vypršel",
    loseDanger: "Nebezpečí přerostlo přes hlavu",
    loseText: "Zkus to znovu, tentokrát ti to půjde líp.",
    stars: "Hodnocení",
    timeUsed: "Čas",
    mistakes: "Chyby",
    hintsUsed: "Nápovědy",
    xp: "XP",
    unlocked: "Odemčeno",
    loginToSave: "Přihlas se, ať se ti ukládají odměny a čas.",
    saveError: "Výsledek se nepodařilo uložit.",
    playAgain: "Hrát znovu",
    backToRooms: "Zpět na únikovky",
    roomProgress: "Místnost {n} z {total}",
    roomDone: "Místnost {n} je za tebou!",
    nextRoom: "Vstoupit do další místnosti",
    nextRoomNote: "Časomíra stojí, dokud nevstoupíš. Nebezpečí, chyby a nápovědy se počítají dál.",
    solvedCount: "Vyřešeno",
  },
};

const en: EscapeText = {
  nav: "Escape rooms",
  list: {
    title: "Escape rooms",
    subtitle: "A locked room, puzzles from school subjects and a running clock. Get out before it's too late.",
    play: "Enter",
    soon: "Soon",
    note: "We're working on more rooms. The puzzles are translated into all languages of the site.",
    sortLabel: "Sort",
    sort: { default: "Recommended", easiest: "Easiest first", hardest: "Hardest first", subject: "By subject" },
    subjectLabel: "Subject",
    allSubjects: "All",
    difficulty: "Difficulty",
    levels: ["Very easy", "Easy", "Medium", "Hard", "Very hard"],
    roomsCount: "{n} rooms",
    minutes: "{min} min",
    best: "Your best",
    shown: "Escape rooms: {n}",
    rooms: [
      { id: "lab", name: "Doctor Atom's laboratory", subject: "Chemistry", description: "The reactor is spinning up and the door is locked. Find clues, mix the right substances and crack the code.", available: true },
      { id: "museum", name: "The locked museum", subject: "History", description: "Display cases, a timeline and puzzles about important events.", available: true },
      { id: "expedition", name: "Expedition tent", subject: "Geography", description: "A world map, capital cities and compass directions.", available: true },
      { id: "jungle", name: "The lost jungle", subject: "Biology", description: "Plants, animals and how to classify them.", available: true },
      { id: "pirate", name: "Pirate ship", subject: "English", description: "A locked cabin, English words and a secret treasure map.", available: true },
      { id: "kitchen", name: "The chef's kitchen", subject: "Maths", description: "Recipes, weights and time. Count right before the cake burns.", available: true },
      { id: "library", name: "The secret library", subject: "Czech language", description: "Shelves, authors and stories. Find the way out before the librarian turns off the lights.", available: true },
      { id: "observatory", name: "The observatory", subject: "Space", description: "Planets, a telescope and a star map. Open the dome and look at the sky.", available: true },
      { id: "castle", name: "The castle on the hill", subject: "History", description: "Coats of arms, knights and a drawbridge. Solve riddles from the Middle Ages.", available: true },
    ],
  },
  ui: {
    start: "Start",
    modeTitle: "Pick a mode",
    timed: "Timed",
    timedDesc: "{min} minutes for all the rooms and a danger meter. More stars.",
    relaxed: "No timer",
    relaxedDesc: "No rush and danger can't knock you out. Up to 2 stars.",
    time: "Time",
    elapsed: "Elapsed",
    danger: "Danger",
    inventory: "Inventory",
    inventoryEmpty: "Nothing yet. Search the room.",
    selected: "Selected",
    combineHint: "Click two items to try combining them, or select an item and click a spot in the room.",
    notes: "Notes",
    close: "Close",
    check: "Check",
    hint: "Hint",
    hintNext: "Next hint",
    noMoreHints: "No more hints.",
    askAtom: "Ask robot Atom",
    atomLabel: "Atom",
    atomDone: "I have no more advice. Try the door.",
    wrong: "That's not right. The danger is rising!",
    solved: "Solved!",
    cantCombine: "Those two don't combine.",
    nothingHere: "That won't help here right now.",
    reset: "Start over",
    orderHint: "Click the steps in the order you want to arrange them.",
    matchHint: "Pick an item on the left, then its partner on the right.",
    gotItems: "You got",
    winTitle: "You escaped!",
    loseTime: "Time's up",
    loseDanger: "The danger got too high",
    loseText: "Try again, you'll do better this time.",
    stars: "Rating",
    timeUsed: "Time",
    mistakes: "Mistakes",
    hintsUsed: "Hints",
    xp: "XP",
    unlocked: "Unlocked",
    loginToSave: "Log in to save your rewards and time.",
    saveError: "The result couldn't be saved.",
    playAgain: "Play again",
    backToRooms: "Back to escape rooms",
    roomProgress: "Room {n} of {total}",
    roomDone: "Room {n} complete!",
    nextRoom: "Enter the next room",
    nextRoomNote: "The clock is paused until you go in. Danger, mistakes and hints carry over.",
    solvedCount: "Solved",
  },
};

const de: EscapeText = {
  nav: "Escape Rooms",
  list: {
    title: "Escape Rooms",
    subtitle: "Ein verschlossener Raum, Rätsel aus dem Schulstoff und eine laufende Uhr. Komm raus, bevor es zu spät ist.",
    play: "Betreten",
    soon: "Bald",
    note: "An weiteren Räumen wird gearbeitet. Die Rätsel sind in alle Sprachen der Seite übersetzt.",
    sortLabel: "Sortieren",
    sort: { default: "Empfohlen", easiest: "Leichteste zuerst", hardest: "Schwerste zuerst", subject: "Nach Fach" },
    subjectLabel: "Fach",
    allSubjects: "Alle",
    difficulty: "Schwierigkeit",
    levels: ["Sehr leicht", "Leicht", "Mittel", "Schwer", "Sehr schwer"],
    roomsCount: "{n} Räume",
    minutes: "{min} Min.",
    best: "Dein Rekord",
    shown: "Escape Rooms: {n}",
    rooms: [
      { id: "lab", name: "Labor von Doktor Atom", subject: "Chemie", description: "Der Reaktor fährt hoch und die Tür ist verschlossen. Finde Hinweise, mische die richtigen Stoffe und knacke den Code.", available: true },
      { id: "museum", name: "Das verschlossene Museum", subject: "Geschichte", description: "Vitrinen, ein Zeitstrahl und Rätsel zu wichtigen Ereignissen.", available: true },
      { id: "expedition", name: "Expeditionszelt", subject: "Geografie", description: "Weltkarte, Hauptstädte und Himmelsrichtungen.", available: true },
      { id: "jungle", name: "Der verlorene Dschungel", subject: "Biologie", description: "Pflanzen, Tiere und ihre Einteilung.", available: true },
      { id: "pirate", name: "Das Piratenschiff", subject: "Englisch", description: "Eine verschlossene Kajüte, englische Wörter und eine geheime Schatzkarte.", available: true },
      { id: "kitchen", name: "Die Küche des Chefkochs", subject: "Mathe", description: "Rezepte, Gewichte und Zeit. Rechne richtig, bevor der Kuchen verbrennt.", available: true },
      { id: "library", name: "Die geheime Bibliothek", subject: "Tschechisch", description: "Regale, Autoren und Geschichten. Finde den Ausgang, bevor der Bibliothekar das Licht löscht.", available: true },
      { id: "observatory", name: "Die Sternwarte", subject: "Weltall", description: "Planeten, ein Teleskop und eine Sternkarte. Öffne die Kuppel und schau zum Himmel.", available: true },
      { id: "castle", name: "Die Burg auf dem Hügel", subject: "Geschichte", description: "Wappen, Ritter und eine Zugbrücke. Löse Rätsel aus dem Mittelalter.", available: true },
    ],
  },
  ui: {
    start: "Starten",
    modeTitle: "Modus wählen",
    timed: "Mit Zeitlimit",
    timedDesc: "{min} Minuten für alle Räume und eine Gefahrenanzeige. Mehr Sterne.",
    relaxed: "Ohne Zeitlimit",
    relaxedDesc: "Keine Eile, und die Gefahr wirft dich nicht raus. Höchstens 2 Sterne.",
    time: "Zeit",
    elapsed: "Vergangen",
    danger: "Gefahr",
    inventory: "Inventar",
    inventoryEmpty: "Noch nichts. Durchsuche den Raum.",
    selected: "Ausgewählt",
    combineHint: "Klicke zwei Gegenstände an, um sie zu kombinieren, oder wähle einen aus und klicke auf eine Stelle im Raum.",
    notes: "Notizen",
    close: "Schließen",
    check: "Prüfen",
    hint: "Hinweis",
    hintNext: "Nächster Hinweis",
    noMoreHints: "Keine weiteren Hinweise.",
    askAtom: "Roboter Atom fragen",
    atomLabel: "Atom",
    atomDone: "Ich habe keinen Rat mehr. Versuch die Tür.",
    wrong: "Das stimmt nicht. Die Gefahr steigt!",
    solved: "Gelöst!",
    cantCombine: "Diese beiden passen nicht zusammen.",
    nothingHere: "Das hilft hier gerade nicht.",
    reset: "Neu beginnen",
    orderHint: "Klicke die Schritte in der Reihenfolge an, in der du sie ordnen willst.",
    matchHint: "Wähle links einen Eintrag und dann rechts den passenden.",
    gotItems: "Du hast erhalten",
    winTitle: "Du bist entkommen!",
    loseTime: "Die Zeit ist um",
    loseDanger: "Die Gefahr wurde zu groß",
    loseText: "Versuch es nochmal, diesmal klappt es besser.",
    stars: "Bewertung",
    timeUsed: "Zeit",
    mistakes: "Fehler",
    hintsUsed: "Hinweise",
    xp: "XP",
    unlocked: "Freigeschaltet",
    loginToSave: "Melde dich an, damit Belohnungen und Zeit gespeichert werden.",
    saveError: "Das Ergebnis konnte nicht gespeichert werden.",
    playAgain: "Nochmal spielen",
    backToRooms: "Zurück zu den Escape Rooms",
    roomProgress: "Raum {n} von {total}",
    roomDone: "Raum {n} geschafft!",
    nextRoom: "Den nächsten Raum betreten",
    nextRoomNote: "Die Uhr steht, bis du hineingehst. Gefahr, Fehler und Hinweise zählen weiter.",
    solvedCount: "Gelöst",
  },
};

const ru: EscapeText = {
  nav: "Квесты",
  list: {
    title: "Квесты",
    subtitle: "Запертая комната, загадки из школьных предметов и бегущее время. Выберись, пока не поздно.",
    play: "Войти",
    soon: "Скоро",
    note: "Мы работаем над новыми комнатами. Загадки переведены на все языки сайта.",
    sortLabel: "Сортировать",
    sort: { default: "Рекомендуемые", easiest: "Сначала лёгкие", hardest: "Сначала сложные", subject: "По предмету" },
    subjectLabel: "Предмет",
    allSubjects: "Все",
    difficulty: "Сложность",
    levels: ["Очень лёгкая", "Лёгкая", "Средняя", "Сложная", "Очень сложная"],
    roomsCount: "{n} комнаты",
    minutes: "{min} мин",
    best: "Твой рекорд",
    shown: "Квестов: {n}",
    rooms: [
      { id: "lab", name: "Лаборатория доктора Атома", subject: "Химия", description: "Реактор разгоняется, а дверь заперта. Найди подсказки, смешай нужные вещества и подбери код.", available: true },
      { id: "museum", name: "Запертый музей", subject: "История", description: "Витрины, лента времени и загадки о важных событиях.", available: true },
      { id: "expedition", name: "Палатка экспедиции", subject: "География", description: "Карта мира, столицы и стороны света.", available: true },
      { id: "jungle", name: "Потерянные джунгли", subject: "Биология", description: "Растения, животные и их классификация.", available: true },
      { id: "pirate", name: "Пиратский корабль", subject: "Английский", description: "Запертая каюта, английские слова и тайная карта сокровищ.", available: true },
      { id: "kitchen", name: "Кухня шеф-повара", subject: "Математика", description: "Рецепты, вес и время. Посчитай верно, пока пирог не сгорел.", available: true },
      { id: "library", name: "Тайная библиотека", subject: "Чешский язык", description: "Полки, авторы и истории. Найди выход, пока библиотекарь не выключил свет.", available: true },
      { id: "observatory", name: "Обсерватория", subject: "Космос", description: "Планеты, телескоп и карта звёзд. Открой купол и посмотри на небо.", available: true },
      { id: "castle", name: "Замок на холме", subject: "История", description: "Гербы, рыцари и подъёмный мост. Реши загадки Средневековья.", available: true },
    ],
  },
  ui: {
    start: "Начать",
    modeTitle: "Выбери режим",
    timed: "С таймером",
    timedDesc: "{min} минут на все комнаты и шкала опасности. Больше звёзд.",
    relaxed: "Без таймера",
    relaxedDesc: "Не торопись, опасность не выбьет тебя из игры. Максимум 2 звезды.",
    time: "Время",
    elapsed: "Прошло",
    danger: "Опасность",
    inventory: "Инвентарь",
    inventoryEmpty: "Пока ничего нет. Осмотри комнату.",
    selected: "Выбрано",
    combineHint: "Нажми на два предмета, чтобы попробовать их соединить, или выбери предмет и нажми на место в комнате.",
    notes: "Записки",
    close: "Закрыть",
    check: "Проверить",
    hint: "Подсказка",
    hintNext: "Следующая подсказка",
    noMoreHints: "Подсказок больше нет.",
    askAtom: "Спросить робота Атома",
    atomLabel: "Атом",
    atomDone: "Больше советовать нечего. Попробуй дверь.",
    wrong: "Это неверно. Опасность растёт!",
    solved: "Решено!",
    cantCombine: "Эти два предмета не соединяются.",
    nothingHere: "Здесь это сейчас не поможет.",
    reset: "Начать заново",
    orderHint: "Нажимай на шаги в том порядке, в каком хочешь их расставить.",
    matchHint: "Выбери пункт слева, затем пару справа.",
    gotItems: "Ты получил(а)",
    winTitle: "Ты выбрался!",
    loseTime: "Время вышло",
    loseDanger: "Опасность стала слишком большой",
    loseText: "Попробуй ещё раз, в этот раз получится лучше.",
    stars: "Оценка",
    timeUsed: "Время",
    mistakes: "Ошибки",
    hintsUsed: "Подсказки",
    xp: "XP",
    unlocked: "Открыто",
    loginToSave: "Войди, чтобы сохранялись награды и время.",
    saveError: "Не удалось сохранить результат.",
    playAgain: "Играть снова",
    backToRooms: "Назад к квестам",
    roomProgress: "Комната {n} из {total}",
    roomDone: "Комната {n} пройдена!",
    nextRoom: "Войти в следующую комнату",
    nextRoomNote: "Время стоит, пока ты не войдёшь. Опасность, ошибки и подсказки сохраняются.",
    solvedCount: "Решено",
  },
};

const texts: Record<Locale, EscapeText> = { cs, en, de, ru };

export function getEscapeText(locale: Locale): EscapeText {
  return texts[locale];
}
