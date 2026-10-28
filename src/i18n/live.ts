import type { Locale } from "./config";

type ModeText = { name: string; description: string };

export type LiveText = {
  nav: string;
  title: string;
  subtitle: string;
  join: {
    title: string;
    hint: string;
    pin: string;
    name: string;
    namePlaceholder: string;
    button: string;
    loggedInAs: string;
  };
  host: { title: string; hint: string; button: string };
  create: {
    title: string;
    subtitle: string;
    source: string;
    fromCourse: string;
    fromSet: string;
    course: string;
    search: string;
    difficulty: string;
    anyDifficulty: string;
    count: string;
    available: string;
    mode: string;
    modes: Record<"QUIZ" | "RACE" | "GOLD" | "STREAK" | "SURVIVAL" | "TEAMS", ModeText>;
    settings: string;
    seconds: string;
    raceTarget: string;
    lives: string;
    duration: string;
    minutes: string;
    submit: string;
    creating: string;
    loginForSets: string;
    noSets: string;
    manageSets: string;
    loading: string;
  };
  lobby: {
    share: string;
    waiting: string;
    players: string;
    start: string;
    needPlayers: string;
    waitingHost: string;
    youAre: string;
    copyLink: string;
    copied: string;
    questions: string;
  };
  play: {
    questionOf: string;
    answered: string;
    waitingOthers: string;
    correct: string;
    wrong: string;
    timeUp: string;
    points: string;
    rank: string;
    nextQuestion: string;
    showAnswer: string;
    finish: string;
    endGame: string;
    confirmEnd: string;
    answers: string;
    streak: string;
    race: string;
    gold: string;
    streakMode: string;
    survival: string;
    teamsMode: string;
    teamNames: [string, string];
    livesLeft: string;
    eliminated: string;
    spectating: string;
    youTeam: string;
    teamWins: string;
    streakHint: string;
    chestTitle: string;
    chestHint: string;
    youGot: string;
    stolen: string;
    lost: string;
    nobodyToSteal: string;
    yourAnswer: string;
    correctAnswer: string;
    toGoal: string;
    timeLeft: string;
  };
  end: {
    title: string;
    winner: string;
    yourPlace: string;
    playAgain: string;
    newGame: string;
    score: string;
    gold: string;
    progress: string;
    lives: string;
    reward: string;
  };
  sets: {
    title: string;
    subtitle: string;
    newSet: string;
    empty: string;
    questions: string;
    edit: string;
    remove: string;
    confirmRemove: string;
    setTitle: string;
    addQuestion: string;
    removeQuestion: string;
    prompt: string;
    option: string;
    correct: string;
    explanation: string;
    save: string;
    saved: string;
    cancel: string;
    loginRequired: string;
    invalid: string;
    back: string;
  };
  errors: Record<string, string>;
};

const cs: LiveText = {
  nav: "Hrát společně",
  title: "Hrát společně",
  subtitle: "Zahraj si s třídou: jeden založí hru, ostatní se připojí kódem a soutěží v otázkách.",
  join: {
    title: "Připojit se ke hře",
    hint: "Zadej kód, který ukazuje učitel.",
    pin: "Kód hry",
    name: "Přezdívka",
    namePlaceholder: "Jak ti máme říkat?",
    button: "Připojit se",
    loggedInAs: "Hraješ jako {name}, body a XP se ti připíšou.",
  },
  host: {
    title: "Založit hru",
    hint: "Vyber otázky a herní režim. Kdo hru založí, ji řídí.",
    button: "Založit novou hru",
  },
  create: {
    title: "Nová hra",
    subtitle: "Vyber otázky, režim a nastavení. Žáci se pak připojí kódem.",
    source: "Odkud budou otázky",
    fromCourse: "Z kurzu",
    fromSet: "Moje sady",
    course: "Kurz",
    search: "Hledej kurz…",
    difficulty: "Obtížnost",
    anyDifficulty: "Všechny",
    count: "Počet otázek",
    available: "k dispozici: {n}",
    mode: "Herní režim",
    modes: {
      QUIZ: { name: "Klasický kvíz", description: "Všichni odpovídají na stejnou otázku proti času. Čím rychleji a správněji, tím víc bodů." },
      RACE: { name: "Závod", description: "Každý jede svým tempem. Za správné odpovědi postupuješ k cíli, kdo dojede první, vyhrává." },
      GOLD: { name: "Zlatá horečka", description: "Správná odpověď otevírá truhly: zlato, krádeže i pasti. Vyhrává, kdo má nakonec nejvíc zlata." },
      STREAK: { name: "Série", description: "Každá správná odpověď v řadě násobí body (až 5×), chyba sérii přeruší a bere body. Hraje se na čas, každý svým tempem." },
      SURVIVAL: { name: "Poslední přeživší", description: "Každý má pár životů. Kdo odpoví špatně nebo nestihne, jeden ztratí. Vyhrává poslední, kdo ve hře zůstane." },
      TEAMS: { name: "Týmy", description: "Žáci se rozdělí do dvou týmů a body se sčítají. Soutěží se jako v klasickém kvízu, vyhrává tým." },
    },
    settings: "Nastavení",
    seconds: "Čas na otázku",
    raceTarget: "Cíl závodu (správných odpovědí)",
    lives: "Počet životů",
    duration: "Délka hry",
    minutes: "min",
    submit: "Založit hru",
    creating: "Zakládám…",
    loginForSets: "Vlastní sady otázek jsou pro přihlášené.",
    noSets: "Zatím nemáš žádnou sadu.",
    manageSets: "Spravovat sady",
    loading: "Načítám…",
  },
  lobby: {
    share: "Připojte se na {site} s kódem",
    waiting: "Čekáme na hráče…",
    players: "Hráči",
    start: "Spustit hru",
    needPlayers: "Počkej, až se někdo připojí.",
    waitingHost: "Čekáme, až učitel spustí hru.",
    youAre: "Hraješ jako",
    copyLink: "Zkopírovat odkaz",
    copied: "Zkopírováno",
    questions: "{n} otázek",
  },
  play: {
    questionOf: "Otázka {n} z {total}",
    answered: "Odpovědělo {n} z {total}",
    waitingOthers: "Odpověď odeslána, čekáme na ostatní…",
    correct: "Správně!",
    wrong: "Špatně",
    timeUp: "Čas vypršel",
    points: "body",
    rank: "{n}. místo",
    nextQuestion: "Další otázka",
    showAnswer: "Ukázat odpověď",
    finish: "Ukončit hru",
    endGame: "Ukončit hru",
    confirmEnd: "Opravdu ukončit hru pro všechny?",
    answers: "Odpovědi",
    streak: "Série {n}",
    race: "Závod",
    streakMode: "Série",
    survival: "Poslední přeživší",
    teamsMode: "Týmy",
    teamNames: ["Červení", "Modří"],
    livesLeft: "Životy: {n}",
    eliminated: "Vypadl jsi z této hry",
    spectating: "Sleduj, jak to dopadne.",
    youTeam: "Tvůj tým",
    teamWins: "Vyhrál tým {name}",
    streakHint: "Čím delší série správných odpovědí, tím víc bodů. Chyba sérii přeruší.",
    gold: "Zlato",
    chestTitle: "Vyber si truhlu",
    chestHint: "Uvnitř je zlato, ale pozor na krádež i past.",
    youGot: "Získal jsi {n} zlata!",
    stolen: "Ukradl jsi {n} zlata hráči {name}!",
    lost: "Past! Přišel jsi o {n} zlata.",
    nobodyToSteal: "Nebylo koho okrást.",
    yourAnswer: "Tvoje odpověď",
    correctAnswer: "Správná odpověď",
    toGoal: "{n} z {total} k cíli",
    timeLeft: "Zbývá",
  },
  end: {
    title: "Konec hry",
    winner: "Vítěz",
    yourPlace: "Skončil jsi {n}.",
    playAgain: "Zahrát znovu",
    newGame: "Nová hra",
    score: "body",
    gold: "zlato",
    progress: "v cíli",
    lives: "životů",
    reward: "Odměna: +{xp} XP a +{points} bodů",
  },
  sets: {
    title: "Moje sady otázek",
    subtitle: "Vlastní otázky pro živé hry. Vidíš je jen ty.",
    newSet: "Nová sada",
    empty: "Zatím nemáš žádnou sadu.",
    questions: "{n} otázek",
    edit: "Upravit",
    remove: "Smazat",
    confirmRemove: "Opravdu smazat tuhle sadu?",
    setTitle: "Název sady",
    addQuestion: "Přidat otázku",
    removeQuestion: "Odebrat otázku",
    prompt: "Otázka",
    option: "Možnost {n}",
    correct: "Správně",
    explanation: "Vysvětlení (nepovinné)",
    save: "Uložit sadu",
    saved: "Uloženo",
    cancel: "Zrušit",
    loginRequired: "Sady otázek jsou pro přihlášené.",
    invalid: "Vyplň název a aspoň jednu otázku se čtyřmi možnostmi.",
    back: "Zpět",
  },
  errors: {
    eliminated: "Už jsi vyřazený, hru můžeš jen sledovat.",
    "game-started": "Tahle hra už běží, připojit se jde jen do čekárny.",
    "room-not-found": "Hra s tímto kódem neexistuje.",
    "room-ended": "Tahle hra už skončila.",
    "name-required": "Zadej přezdívku.",
    "name-taken": "Tuhle přezdívku už někdo má, zkus jinou.",
    "no-players": "Zatím se nikdo nepřipojil.",
    "no-questions": "V kurzu nejsou žádné otázky.",
    "not-open": "Na tuhle otázku už nejde odpovídat.",
    "already-answered": "Na tuhle otázku jsi už odpověděl.",
    "choose-chest": "Nejdřív otevři truhlu.",
    "login-required": "Pro tohle se musíš přihlásit.",
    "course-not-found": "Kurz se nenašel.",
    "set-not-found": "Sada se nenašla.",
    unauthorized: "Nemáš k tomu oprávnění. Připoj se znovu.",
    unavailable: "Hra je teď nedostupná, zkus to za chvíli.",
    default: "Něco se nepovedlo, zkus to znovu.",
  },
};

const en: LiveText = {
  nav: "Play together",
  title: "Play together",
  subtitle: "Play with your class: one person creates a game, everyone else joins with a code and competes on questions.",
  join: {
    title: "Join a game",
    hint: "Enter the code your teacher is showing.",
    pin: "Game code",
    name: "Nickname",
    namePlaceholder: "What should we call you?",
    button: "Join",
    loggedInAs: "You play as {name}, your points and XP will be saved.",
  },
  host: {
    title: "Host a game",
    hint: "Pick the questions and a game mode. Whoever creates the game runs it.",
    button: "Create a new game",
  },
  create: {
    title: "New game",
    subtitle: "Pick the questions, mode and settings. Students then join with a code.",
    source: "Where the questions come from",
    fromCourse: "From a course",
    fromSet: "My sets",
    course: "Course",
    search: "Search courses…",
    difficulty: "Difficulty",
    anyDifficulty: "All",
    count: "Number of questions",
    available: "available: {n}",
    mode: "Game mode",
    modes: {
      QUIZ: { name: "Classic quiz", description: "Everyone answers the same question against the clock. The faster and more accurate, the more points." },
      RACE: { name: "Race", description: "Everyone goes at their own pace. Correct answers move you toward the finish, first to finish wins." },
      GOLD: { name: "Gold rush", description: "Correct answers open chests: gold, steals and traps. Whoever has the most gold at the end wins." },
      STREAK: { name: "Streak", description: "Every correct answer in a row multiplies your points (up to 5×); a mistake breaks the streak and costs points. Timed, everyone at their own pace." },
      SURVIVAL: { name: "Last one standing", description: "Everyone has a few lives. Answer wrong or run out of time and you lose one. The last player left wins." },
      TEAMS: { name: "Teams", description: "Players are split into two teams and their points add up. Played like the classic quiz; the best team wins." },
    },
    settings: "Settings",
    seconds: "Time per question",
    raceTarget: "Race goal (correct answers)",
    lives: "Number of lives",
    duration: "Game length",
    minutes: "min",
    submit: "Create game",
    creating: "Creating…",
    loginForSets: "Custom question sets are for signed-in users.",
    noSets: "You don't have any sets yet.",
    manageSets: "Manage sets",
    loading: "Loading…",
  },
  lobby: {
    share: "Join on {site} with the code",
    waiting: "Waiting for players…",
    players: "Players",
    start: "Start the game",
    needPlayers: "Wait until someone joins.",
    waitingHost: "Waiting for the host to start the game.",
    youAre: "You are playing as",
    copyLink: "Copy link",
    copied: "Copied",
    questions: "{n} questions",
  },
  play: {
    questionOf: "Question {n} of {total}",
    answered: "{n} of {total} answered",
    waitingOthers: "Answer sent, waiting for the others…",
    correct: "Correct!",
    wrong: "Wrong",
    timeUp: "Time's up",
    points: "points",
    rank: "#{n}",
    nextQuestion: "Next question",
    showAnswer: "Show answer",
    finish: "Finish game",
    endGame: "End game",
    confirmEnd: "End the game for everyone?",
    answers: "Answers",
    streak: "Streak {n}",
    race: "Race",
    streakMode: "Streak",
    survival: "Last one standing",
    teamsMode: "Teams",
    teamNames: ["Red", "Blue"],
    livesLeft: "Lives: {n}",
    eliminated: "You are out of this game",
    spectating: "Watch how it ends.",
    youTeam: "Your team",
    teamWins: "Team {name} wins",
    streakHint: "The longer your streak of correct answers, the more points. A mistake breaks it.",
    gold: "Gold",
    chestTitle: "Pick a chest",
    chestHint: "Inside is gold, but watch out for steals and traps.",
    youGot: "You got {n} gold!",
    stolen: "You stole {n} gold from {name}!",
    lost: "A trap! You lost {n} gold.",
    nobodyToSteal: "There was nobody to steal from.",
    yourAnswer: "Your answer",
    correctAnswer: "Correct answer",
    toGoal: "{n} of {total} to the finish",
    timeLeft: "Left",
  },
  end: {
    title: "Game over",
    winner: "Winner",
    yourPlace: "You finished #{n}.",
    playAgain: "Play again",
    newGame: "New game",
    score: "points",
    gold: "gold",
    progress: "to goal",
    lives: "lives",
    reward: "Reward: +{xp} XP and +{points} points",
  },
  sets: {
    title: "My question sets",
    subtitle: "Your own questions for live games. Only you can see them.",
    newSet: "New set",
    empty: "You don't have any sets yet.",
    questions: "{n} questions",
    edit: "Edit",
    remove: "Delete",
    confirmRemove: "Really delete this set?",
    setTitle: "Set name",
    addQuestion: "Add question",
    removeQuestion: "Remove question",
    prompt: "Question",
    option: "Option {n}",
    correct: "Correct",
    explanation: "Explanation (optional)",
    save: "Save set",
    saved: "Saved",
    cancel: "Cancel",
    loginRequired: "Question sets are for signed-in users.",
    invalid: "Fill in a name and at least one question with four options.",
    back: "Back",
  },
  errors: {
    eliminated: "You are out, you can only watch now.",
    "game-started": "This game has already started; you can only join in the lobby.",
    "room-not-found": "No game with this code exists.",
    "room-ended": "This game has already ended.",
    "name-required": "Enter a nickname.",
    "name-taken": "Someone already has this nickname, try another.",
    "no-players": "Nobody has joined yet.",
    "no-questions": "This course has no questions.",
    "not-open": "You can't answer this question anymore.",
    "already-answered": "You already answered this question.",
    "choose-chest": "Open a chest first.",
    "login-required": "You need to sign in for this.",
    "course-not-found": "Course not found.",
    "set-not-found": "Set not found.",
    unauthorized: "You don't have permission for that. Join again.",
    unavailable: "The game is unavailable right now, try again shortly.",
    default: "Something went wrong, try again.",
  },
};

const de: LiveText = {
  nav: "Gemeinsam spielen",
  title: "Gemeinsam spielen",
  subtitle: "Spiele mit deiner Klasse: Eine Person erstellt ein Spiel, alle anderen treten mit einem Code bei und treten bei Fragen gegeneinander an.",
  join: {
    title: "Einem Spiel beitreten",
    hint: "Gib den Code ein, den deine Lehrkraft zeigt.",
    pin: "Spielcode",
    name: "Spitzname",
    namePlaceholder: "Wie sollen wir dich nennen?",
    button: "Beitreten",
    loggedInAs: "Du spielst als {name}, deine Punkte und XP werden gespeichert.",
  },
  host: {
    title: "Spiel erstellen",
    hint: "Wähle die Fragen und einen Spielmodus. Wer das Spiel erstellt, leitet es.",
    button: "Neues Spiel erstellen",
  },
  create: {
    title: "Neues Spiel",
    subtitle: "Wähle Fragen, Modus und Einstellungen. Die Schüler treten dann mit einem Code bei.",
    source: "Woher die Fragen kommen",
    fromCourse: "Aus einem Kurs",
    fromSet: "Meine Sets",
    course: "Kurs",
    search: "Kurs suchen…",
    difficulty: "Schwierigkeit",
    anyDifficulty: "Alle",
    count: "Anzahl der Fragen",
    available: "verfügbar: {n}",
    mode: "Spielmodus",
    modes: {
      QUIZ: { name: "Klassisches Quiz", description: "Alle beantworten dieselbe Frage gegen die Uhr. Je schneller und richtiger, desto mehr Punkte." },
      RACE: { name: "Rennen", description: "Jeder in seinem Tempo. Richtige Antworten bringen dich näher ans Ziel, wer zuerst ankommt, gewinnt." },
      GOLD: { name: "Goldrausch", description: "Richtige Antworten öffnen Truhen: Gold, Diebstähle und Fallen. Wer am Ende das meiste Gold hat, gewinnt." },
      STREAK: { name: "Serie", description: "Jede richtige Antwort in Folge vervielfacht die Punkte (bis 5×); ein Fehler unterbricht die Serie und kostet Punkte. Auf Zeit, jeder in eigenem Tempo." },
      SURVIVAL: { name: "Letzter Überlebender", description: "Jeder hat ein paar Leben. Wer falsch antwortet oder zu langsam ist, verliert eines. Wer zuletzt übrig bleibt, gewinnt." },
      TEAMS: { name: "Teams", description: "Die Spieler werden in zwei Teams geteilt und die Punkte addieren sich. Gespielt wird wie im klassischen Quiz, das beste Team gewinnt." },
    },
    settings: "Einstellungen",
    seconds: "Zeit pro Frage",
    raceTarget: "Rennziel (richtige Antworten)",
    lives: "Anzahl der Leben",
    duration: "Spieldauer",
    minutes: "Min.",
    submit: "Spiel erstellen",
    creating: "Wird erstellt…",
    loginForSets: "Eigene Fragensets gibt es für angemeldete Nutzer.",
    noSets: "Du hast noch keine Sets.",
    manageSets: "Sets verwalten",
    loading: "Lädt…",
  },
  lobby: {
    share: "Tritt auf {site} mit dem Code bei",
    waiting: "Warten auf Spieler…",
    players: "Spieler",
    start: "Spiel starten",
    needPlayers: "Warte, bis jemand beitritt.",
    waitingHost: "Warten, bis die Lehrkraft das Spiel startet.",
    youAre: "Du spielst als",
    copyLink: "Link kopieren",
    copied: "Kopiert",
    questions: "{n} Fragen",
  },
  play: {
    questionOf: "Frage {n} von {total}",
    answered: "{n} von {total} haben geantwortet",
    waitingOthers: "Antwort gesendet, warten auf die anderen…",
    correct: "Richtig!",
    wrong: "Falsch",
    timeUp: "Zeit abgelaufen",
    points: "Punkte",
    rank: "Platz {n}",
    nextQuestion: "Nächste Frage",
    showAnswer: "Antwort zeigen",
    finish: "Spiel beenden",
    endGame: "Spiel beenden",
    confirmEnd: "Das Spiel für alle beenden?",
    answers: "Antworten",
    streak: "Serie {n}",
    race: "Rennen",
    streakMode: "Serie",
    survival: "Letzter Überlebender",
    teamsMode: "Teams",
    teamNames: ["Rot", "Blau"],
    livesLeft: "Leben: {n}",
    eliminated: "Du bist in diesem Spiel raus",
    spectating: "Sieh zu, wie es ausgeht.",
    youTeam: "Dein Team",
    teamWins: "Team {name} gewinnt",
    streakHint: "Je länger deine Serie richtiger Antworten, desto mehr Punkte. Ein Fehler unterbricht sie.",
    gold: "Gold",
    chestTitle: "Wähle eine Truhe",
    chestHint: "Drin ist Gold, aber Vorsicht vor Diebstahl und Fallen.",
    youGot: "Du hast {n} Gold bekommen!",
    stolen: "Du hast {n} Gold von {name} gestohlen!",
    lost: "Eine Falle! Du hast {n} Gold verloren.",
    nobodyToSteal: "Es gab niemanden zum Bestehlen.",
    yourAnswer: "Deine Antwort",
    correctAnswer: "Richtige Antwort",
    toGoal: "{n} von {total} bis zum Ziel",
    timeLeft: "Noch",
  },
  end: {
    title: "Spiel vorbei",
    winner: "Sieger",
    yourPlace: "Du bist Platz {n}.",
    playAgain: "Nochmal spielen",
    newGame: "Neues Spiel",
    score: "Punkte",
    gold: "Gold",
    progress: "im Ziel",
    lives: "Leben",
    reward: "Belohnung: +{xp} XP und +{points} Punkte",
  },
  sets: {
    title: "Meine Fragensets",
    subtitle: "Eigene Fragen für Live-Spiele. Nur du siehst sie.",
    newSet: "Neues Set",
    empty: "Du hast noch keine Sets.",
    questions: "{n} Fragen",
    edit: "Bearbeiten",
    remove: "Löschen",
    confirmRemove: "Dieses Set wirklich löschen?",
    setTitle: "Name des Sets",
    addQuestion: "Frage hinzufügen",
    removeQuestion: "Frage entfernen",
    prompt: "Frage",
    option: "Option {n}",
    correct: "Richtig",
    explanation: "Erklärung (optional)",
    save: "Set speichern",
    saved: "Gespeichert",
    cancel: "Abbrechen",
    loginRequired: "Fragensets gibt es für angemeldete Nutzer.",
    invalid: "Gib einen Namen und mindestens eine Frage mit vier Optionen ein.",
    back: "Zurück",
  },
  errors: {
    eliminated: "Du bist ausgeschieden und kannst nur noch zusehen.",
    "game-started": "Dieses Spiel läuft schon; man kann nur in der Lobby beitreten.",
    "room-not-found": "Ein Spiel mit diesem Code gibt es nicht.",
    "room-ended": "Dieses Spiel ist schon vorbei.",
    "name-required": "Gib einen Spitznamen ein.",
    "name-taken": "Diesen Spitznamen hat schon jemand, probiere einen anderen.",
    "no-players": "Noch ist niemand beigetreten.",
    "no-questions": "Dieser Kurs hat keine Fragen.",
    "not-open": "Diese Frage kann nicht mehr beantwortet werden.",
    "already-answered": "Du hast diese Frage schon beantwortet.",
    "choose-chest": "Öffne zuerst eine Truhe.",
    "login-required": "Dafür musst du dich anmelden.",
    "course-not-found": "Kurs nicht gefunden.",
    "set-not-found": "Set nicht gefunden.",
    unauthorized: "Dafür fehlt die Berechtigung. Tritt erneut bei.",
    unavailable: "Das Spiel ist gerade nicht verfügbar, versuche es gleich noch einmal.",
    default: "Etwas ist schiefgelaufen, versuche es noch einmal.",
  },
};

const ru: LiveText = {
  nav: "Играть вместе",
  title: "Играть вместе",
  subtitle: "Играйте всем классом: один создаёт игру, остальные заходят по коду и соревнуются в вопросах.",
  join: {
    title: "Присоединиться к игре",
    hint: "Введи код, который показывает учитель.",
    pin: "Код игры",
    name: "Никнейм",
    namePlaceholder: "Как тебя называть?",
    button: "Присоединиться",
    loggedInAs: "Ты играешь как {name}, очки и XP сохранятся.",
  },
  host: {
    title: "Создать игру",
    hint: "Выбери вопросы и режим. Кто создал игру, тот ею и управляет.",
    button: "Создать новую игру",
  },
  create: {
    title: "Новая игра",
    subtitle: "Выбери вопросы, режим и настройки. Ученики зайдут по коду.",
    source: "Откуда брать вопросы",
    fromCourse: "Из курса",
    fromSet: "Мои наборы",
    course: "Курс",
    search: "Найти курс…",
    difficulty: "Сложность",
    anyDifficulty: "Любая",
    count: "Количество вопросов",
    available: "доступно: {n}",
    mode: "Режим игры",
    modes: {
      QUIZ: { name: "Классическая викторина", description: "Все отвечают на один вопрос на время. Чем быстрее и точнее, тем больше очков." },
      RACE: { name: "Гонка", description: "Каждый в своём темпе. Правильные ответы приближают к финишу, побеждает тот, кто пришёл первым." },
      GOLD: { name: "Золотая лихорадка", description: "Правильные ответы открывают сундуки: золото, кражи и ловушки. Побеждает тот, у кого в конце больше всего золота." },
      STREAK: { name: "Серия", description: "Каждый правильный ответ подряд умножает очки (до 5×), ошибка прерывает серию и отнимает очки. На время, каждый в своём темпе." },
      SURVIVAL: { name: "Последний выживший", description: "У каждого несколько жизней. Ошибся или не успел, и одна жизнь потеряна. Побеждает тот, кто останется последним." },
      TEAMS: { name: "Команды", description: "Игроки делятся на две команды, очки суммируются. Играют как в обычной викторине, побеждает лучшая команда." },
    },
    settings: "Настройки",
    seconds: "Время на вопрос",
    raceTarget: "Цель гонки (правильных ответов)",
    lives: "Количество жизней",
    duration: "Длительность игры",
    minutes: "мин",
    submit: "Создать игру",
    creating: "Создаю…",
    loginForSets: "Свои наборы вопросов доступны после входа.",
    noSets: "У тебя пока нет наборов.",
    manageSets: "Управлять наборами",
    loading: "Загрузка…",
  },
  lobby: {
    share: "Заходи на {site} с кодом",
    waiting: "Ждём игроков…",
    players: "Игроки",
    start: "Начать игру",
    needPlayers: "Подожди, пока кто-нибудь зайдёт.",
    waitingHost: "Ждём, пока учитель начнёт игру.",
    youAre: "Ты играешь как",
    copyLink: "Скопировать ссылку",
    copied: "Скопировано",
    questions: "{n} вопросов",
  },
  play: {
    questionOf: "Вопрос {n} из {total}",
    answered: "Ответили {n} из {total}",
    waitingOthers: "Ответ отправлен, ждём остальных…",
    correct: "Верно!",
    wrong: "Неверно",
    timeUp: "Время вышло",
    points: "очков",
    rank: "{n} место",
    nextQuestion: "Следующий вопрос",
    showAnswer: "Показать ответ",
    finish: "Завершить игру",
    endGame: "Завершить игру",
    confirmEnd: "Завершить игру для всех?",
    answers: "Ответы",
    streak: "Серия {n}",
    race: "Гонка",
    streakMode: "Серия",
    survival: "Последний выживший",
    teamsMode: "Команды",
    teamNames: ["Красные", "Синие"],
    livesLeft: "Жизни: {n}",
    eliminated: "Ты выбыл из этой игры",
    spectating: "Следи, чем всё закончится.",
    youTeam: "Твоя команда",
    teamWins: "Побеждает команда {name}",
    streakHint: "Чем длиннее серия правильных ответов, тем больше очков. Ошибка её прерывает.",
    gold: "Золото",
    chestTitle: "Выбери сундук",
    chestHint: "Внутри золото, но берегись краж и ловушек.",
    youGot: "Ты получил {n} золота!",
    stolen: "Ты украл {n} золота у игрока {name}!",
    lost: "Ловушка! Ты потерял {n} золота.",
    nobodyToSteal: "Красть было не у кого.",
    yourAnswer: "Твой ответ",
    correctAnswer: "Правильный ответ",
    toGoal: "{n} из {total} до финиша",
    timeLeft: "Осталось",
  },
  end: {
    title: "Игра окончена",
    winner: "Победитель",
    yourPlace: "Ты занял {n} место.",
    playAgain: "Сыграть ещё",
    newGame: "Новая игра",
    score: "очков",
    gold: "золота",
    progress: "до цели",
    lives: "жизней",
    reward: "Награда: +{xp} XP и +{points} очков",
  },
  sets: {
    title: "Мои наборы вопросов",
    subtitle: "Свои вопросы для живых игр. Их видишь только ты.",
    newSet: "Новый набор",
    empty: "У тебя пока нет наборов.",
    questions: "{n} вопросов",
    edit: "Изменить",
    remove: "Удалить",
    confirmRemove: "Точно удалить этот набор?",
    setTitle: "Название набора",
    addQuestion: "Добавить вопрос",
    removeQuestion: "Убрать вопрос",
    prompt: "Вопрос",
    option: "Вариант {n}",
    correct: "Верный",
    explanation: "Пояснение (необязательно)",
    save: "Сохранить набор",
    saved: "Сохранено",
    cancel: "Отмена",
    loginRequired: "Наборы вопросов доступны после входа.",
    invalid: "Укажи название и хотя бы один вопрос с четырьмя вариантами.",
    back: "Назад",
  },
  errors: {
    eliminated: "Ты выбыл и можешь только наблюдать.",
    "game-started": "Игра уже идёт, присоединиться можно только в ожидании.",
    "room-not-found": "Игры с таким кодом нет.",
    "room-ended": "Эта игра уже закончилась.",
    "name-required": "Введи никнейм.",
    "name-taken": "Такой никнейм уже занят, попробуй другой.",
    "no-players": "Пока никто не зашёл.",
    "no-questions": "В курсе нет вопросов.",
    "not-open": "На этот вопрос уже нельзя ответить.",
    "already-answered": "Ты уже ответил на этот вопрос.",
    "choose-chest": "Сначала открой сундук.",
    "login-required": "Для этого нужно войти.",
    "course-not-found": "Курс не найден.",
    "set-not-found": "Набор не найден.",
    unauthorized: "Нет доступа. Зайди в игру заново.",
    unavailable: "Игра сейчас недоступна, попробуй чуть позже.",
    default: "Что-то пошло не так, попробуй ещё раз.",
  },
};

const texts: Record<Locale, LiveText> = { cs, en, de, ru };

export function getLiveText(locale: Locale): LiveText {
  return texts[locale] ?? cs;
}

/** Dosadí {klíče} do textu: fmt("Ahoj {name}", { name: "Anna" }). */
export function fmt(text: string, values: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (_, k: string) => String(values[k] ?? ""));
}
