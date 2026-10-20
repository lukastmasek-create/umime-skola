import type { Locale } from "./config";

export type CommunityText = {
  navMarketplace: string;
  navLeaderboards: string;
  marketplace: {
    title: string;
    subtitle: string;
    soon: string;
    emptyTitle: string;
    emptyText: string;
    addListing: string;
    sampleItems: [string, string, string];
  };
  leaderboards: {
    title: string;
    subtitle: string;
    rank: string;
    player: string;
    points: string;
    empty: string;
    unavailable: string;
    yourRank: string;
    anonymous: string;
    loginHint: string;
    tabPlayers: string;
    tabMySchool: string;
    tabSchools: string;
    noSchool: string;
    chooseSchool: string;
    mySchoolEmpty: string;
    schoolsEmpty: string;
    schoolsSubtitle: string;
    school: string;
    players: string;
    total: string;
    average: string;
    yourSchool: string;
    tabEscape: string;
    tabIdle: string;
    bestTime: string;
    noRuns: string;
    scopeAll: string;
    scopeSchool: string;
    escapeSubtitle: string;
    idleSubtitle: string;
    idleSoon: string;
    idleMetric: string;
    idleMetrics: [string, string, string, string];
  };
  school: {
    title: string;
    hint: string;
    current: string;
    none: string;
    nameLabel: string;
    cityLabel: string;
    save: string;
    saving: string;
    saved: string;
    leave: string;
    loginRequired: string;
    error: string;
    suggestions: string;
  };
};

const cs: CommunityText = {
  navMarketplace: "Uživatelský obchod",
  navLeaderboards: "Žebříčky",
  marketplace: {
    title: "Uživatelský obchod",
    subtitle: "Místo, kde si hráči mezi sebou nabízejí a kupují věci za body.",
    soon: "Brzy",
    emptyTitle: "Zatím tu nic není",
    emptyText: "Obchod se otevře, až se dodělá. Pak tu půjde vystavit vlastní nabídku a koupit si něco od ostatních.",
    addListing: "Přidat nabídku",
    sampleItems: ["Vzhled hrdiny", "Sada otázek", "Bonusové životy"],
  },
  leaderboards: {
    title: "Žebříčky",
    subtitle: "Nejlepší hráči podle získaných bodů.",
    rank: "Pořadí",
    player: "Hráč",
    points: "Body",
    empty: "Žebříček je zatím prázdný. Získej první body a objev se tu jako první.",
    unavailable: "Žebříček se teď nepodařilo načíst. Zkus to za chvíli.",
    yourRank: "Tvoje pozice",
    anonymous: "Anonym",
    loginHint: "Přihlas se, ať vidíš svou pozici.",
    tabPlayers: "Hráči",
    tabMySchool: "Moje škola",
    tabSchools: "Škola vs škola",
    noSchool: "Zatím nemáš vybranou školu.",
    chooseSchool: "Vyber školu v nastavení →",
    mySchoolEmpty: "Ve tvé škole zatím nikdo nemá body.",
    schoolsEmpty: "Zatím žádná škola nemá body.",
    schoolsSubtitle: "Součet bodů všech hráčů školy. Přepni na průměr, ať se férově srovnají velké a malé školy.",
    school: "Škola",
    players: "Hráčů",
    total: "Celkem",
    average: "Průměr",
    yourSchool: "Tvoje škola",
    tabEscape: "Únikovky",
    tabIdle: "Stálé hry",
    bestTime: "Nejlepší čas",
    noRuns: "Zatím nikdo místnost nedokončil. Buď první!",
    scopeAll: "Všichni",
    scopeSchool: "Moje škola",
    escapeSubtitle: "Nejrychlejší hráči v časovaném režimu. Čas z režimu bez časomíry se do žebříčku nepočítá.",
    idleSubtitle: "Žebříčky Stálých her se otevřou, až se hry dodělají.",
    idleSoon: "Brzy",
    idleMetric: "Bude se počítat",
    idleMetrics: ["úroveň základny","počet a zdraví mazlíčků","výnos farmy","počet obyvatel města"],
  },
  school: {
    title: "Moje škola",
    hint: "Škola se ti počítá do školních žebříčků. Najdi svou, nebo ji přidej.",
    current: "Tvoje škola",
    none: "Zatím žádná",
    nameLabel: "Název školy",
    cityLabel: "Město",
    save: "Uložit školu",
    saving: "Ukládám…",
    saved: "Uloženo",
    leave: "Odebrat školu",
    loginRequired: "Pro výběr školy se musíš přihlásit.",
    error: "Školu se nepodařilo uložit. Zkontroluj název (alespoň 3 znaky) a zkus to znovu.",
    suggestions: "Podobné školy",
  },
};

const en: CommunityText = {
  navMarketplace: "Marketplace",
  navLeaderboards: "Leaderboards",
  marketplace: {
    title: "Marketplace",
    subtitle: "A place where players offer and buy things from each other with points.",
    soon: "Soon",
    emptyTitle: "Nothing here yet",
    emptyText: "The marketplace opens once it's built. Then you'll be able to list your own offer and buy from others.",
    addListing: "Add a listing",
    sampleItems: ["Hero skin", "Question pack", "Bonus lives"],
  },
  leaderboards: {
    title: "Leaderboards",
    subtitle: "The top players by points earned.",
    rank: "Rank",
    player: "Player",
    points: "Points",
    empty: "The leaderboard is empty for now. Earn the first points and show up here first.",
    unavailable: "The leaderboard couldn't be loaded right now. Try again in a moment.",
    yourRank: "Your rank",
    anonymous: "Anonymous",
    loginHint: "Log in to see your rank.",
    tabPlayers: "Players",
    tabMySchool: "My school",
    tabSchools: "School vs school",
    noSchool: "You haven't picked a school yet.",
    chooseSchool: "Pick your school in settings →",
    mySchoolEmpty: "Nobody at your school has points yet.",
    schoolsEmpty: "No school has points yet.",
    schoolsSubtitle: "The sum of all players' points per school. Switch to average to compare big and small schools fairly.",
    school: "School",
    players: "Players",
    total: "Total",
    average: "Average",
    yourSchool: "Your school",
    tabEscape: "Escape rooms",
    tabIdle: "Endless games",
    bestTime: "Best time",
    noRuns: "Nobody has finished this room yet. Be the first!",
    scopeAll: "Everyone",
    scopeSchool: "My school",
    escapeSubtitle: "The fastest players in timed mode. Times from the no-timer mode do not count.",
    idleSubtitle: "The Endless games leaderboards open once the games are built.",
    idleSoon: "Soon",
    idleMetric: "It will count",
    idleMetrics: ["base level","number and health of pets","farm yield","city population"],
  },
  school: {
    title: "My school",
    hint: "Your school counts towards the school leaderboards. Find yours or add it.",
    current: "Your school",
    none: "None yet",
    nameLabel: "School name",
    cityLabel: "City",
    save: "Save school",
    saving: "Saving…",
    saved: "Saved",
    leave: "Remove school",
    loginRequired: "You need to log in to pick a school.",
    error: "Couldn't save the school. Check the name (at least 3 characters) and try again.",
    suggestions: "Similar schools",
  },
};

const de: CommunityText = {
  navMarketplace: "Nutzer-Shop",
  navLeaderboards: "Bestenlisten",
  marketplace: {
    title: "Nutzer-Shop",
    subtitle: "Ein Ort, an dem Spieler einander Dinge gegen Punkte anbieten und kaufen.",
    soon: "Bald",
    emptyTitle: "Hier ist noch nichts",
    emptyText: "Der Shop öffnet, sobald er fertig ist. Dann kannst du eigene Angebote einstellen und bei anderen kaufen.",
    addListing: "Angebot einstellen",
    sampleItems: ["Helden-Skin", "Fragenpaket", "Bonusleben"],
  },
  leaderboards: {
    title: "Bestenlisten",
    subtitle: "Die besten Spieler nach gesammelten Punkten.",
    rank: "Platz",
    player: "Spieler",
    points: "Punkte",
    empty: "Die Bestenliste ist noch leer. Hol die ersten Punkte und erscheine als Erster.",
    unavailable: "Die Bestenliste konnte gerade nicht geladen werden. Versuch es gleich noch einmal.",
    yourRank: "Dein Platz",
    anonymous: "Anonym",
    loginHint: "Melde dich an, um deinen Platz zu sehen.",
    tabPlayers: "Spieler",
    tabMySchool: "Meine Schule",
    tabSchools: "Schule gegen Schule",
    noSchool: "Du hast noch keine Schule gewählt.",
    chooseSchool: "Wähle deine Schule in den Einstellungen →",
    mySchoolEmpty: "An deiner Schule hat noch niemand Punkte.",
    schoolsEmpty: "Noch keine Schule hat Punkte.",
    schoolsSubtitle: "Die Summe der Punkte aller Spieler einer Schule. Wechsle zum Durchschnitt, um große und kleine Schulen fair zu vergleichen.",
    school: "Schule",
    players: "Spieler",
    total: "Gesamt",
    average: "Durchschnitt",
    yourSchool: "Deine Schule",
    tabEscape: "Escape Rooms",
    tabIdle: "Endlosspiele",
    bestTime: "Beste Zeit",
    noRuns: "Diesen Raum hat noch niemand geschafft. Sei der Erste!",
    scopeAll: "Alle",
    scopeSchool: "Meine Schule",
    escapeSubtitle: "Die schnellsten Spieler im Modus mit Zeitlimit. Zeiten aus dem Modus ohne Zeitlimit zählen nicht.",
    idleSubtitle: "Die Bestenlisten der Endlosspiele öffnen, sobald die Spiele fertig sind.",
    idleSoon: "Bald",
    idleMetric: "Gezählt wird",
    idleMetrics: ["Basis-Level","Anzahl und Gesundheit der Haustiere","Ertrag der Farm","Einwohnerzahl der Stadt"],
  },
  school: {
    title: "Meine Schule",
    hint: "Deine Schule zählt für die Schul-Bestenlisten. Finde deine oder füge sie hinzu.",
    current: "Deine Schule",
    none: "Noch keine",
    nameLabel: "Name der Schule",
    cityLabel: "Stadt",
    save: "Schule speichern",
    saving: "Speichern…",
    saved: "Gespeichert",
    leave: "Schule entfernen",
    loginRequired: "Zum Auswählen einer Schule musst du dich anmelden.",
    error: "Die Schule konnte nicht gespeichert werden. Prüfe den Namen (mindestens 3 Zeichen) und versuch es erneut.",
    suggestions: "Ähnliche Schulen",
  },
};

const ru: CommunityText = {
  navMarketplace: "Магазин игроков",
  navLeaderboards: "Рейтинги",
  marketplace: {
    title: "Магазин игроков",
    subtitle: "Место, где игроки предлагают друг другу вещи и покупают их за баллы.",
    soon: "Скоро",
    emptyTitle: "Пока здесь пусто",
    emptyText: "Магазин откроется, когда будет готов. Тогда можно будет выставить своё предложение и купить у других.",
    addListing: "Добавить предложение",
    sampleItems: ["Облик героя", "Набор вопросов", "Бонусные жизни"],
  },
  leaderboards: {
    title: "Рейтинги",
    subtitle: "Лучшие игроки по набранным баллам.",
    rank: "Место",
    player: "Игрок",
    points: "Баллы",
    empty: "Рейтинг пока пуст. Набери первые баллы и появись здесь первым.",
    unavailable: "Не удалось загрузить рейтинг. Попробуй чуть позже.",
    yourRank: "Твоё место",
    anonymous: "Аноним",
    loginHint: "Войди, чтобы увидеть своё место.",
    tabPlayers: "Игроки",
    tabMySchool: "Моя школа",
    tabSchools: "Школа против школы",
    noSchool: "Ты ещё не выбрал школу.",
    chooseSchool: "Выбери школу в настройках →",
    mySchoolEmpty: "В твоей школе пока ни у кого нет баллов.",
    schoolsEmpty: "Ни у одной школы пока нет баллов.",
    schoolsSubtitle: "Сумма баллов всех игроков школы. Переключись на среднее, чтобы честно сравнить большие и маленькие школы.",
    school: "Школа",
    players: "Игроков",
    total: "Всего",
    average: "Среднее",
    yourSchool: "Твоя школа",
    tabEscape: "Квесты",
    tabIdle: "Вечные игры",
    bestTime: "Лучшее время",
    noRuns: "Эту комнату пока никто не прошёл. Будь первым!",
    scopeAll: "Все",
    scopeSchool: "Моя школа",
    escapeSubtitle: "Самые быстрые игроки в режиме с таймером. Время из режима без таймера не учитывается.",
    idleSubtitle: "Рейтинги вечных игр откроются, когда игры будут готовы.",
    idleSoon: "Скоро",
    idleMetric: "Будет учитываться",
    idleMetrics: ["уровень базы","количество и здоровье питомцев","доход фермы","население города"],
  },
  school: {
    title: "Моя школа",
    hint: "Твоя школа учитывается в школьных рейтингах. Найди свою или добавь её.",
    current: "Твоя школа",
    none: "Пока нет",
    nameLabel: "Название школы",
    cityLabel: "Город",
    save: "Сохранить школу",
    saving: "Сохранение…",
    saved: "Сохранено",
    leave: "Убрать школу",
    loginRequired: "Чтобы выбрать школу, нужно войти.",
    error: "Не удалось сохранить школу. Проверь название (минимум 3 символа) и попробуй ещё раз.",
    suggestions: "Похожие школы",
  },
};

const texts: Record<Locale, CommunityText> = { cs, en, de, ru };

export function getCommunityText(locale: Locale): CommunityText {
  return texts[locale];
}
