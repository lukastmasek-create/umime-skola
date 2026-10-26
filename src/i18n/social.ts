import type { Locale } from "./config";

export type SocialText = {
  nav: string;
  title: string;
  subtitle: string;
  loginNeeded: string;
  login: string;
  loadError: string;
  actionError: string;
  groups: string;
  groupsHint: string;
  groupNamePlaceholder: string;
  create: string;
  codePlaceholder: string;
  join: string;
  code: string;
  leave: string;
  teamGoal: string; // {n} = "a / b"
  goalDone: string;
  challenge: string;
  duels: string;
  duelsHint: string;
  noDuels: string;
  incoming: string; // {n} jméno
  sent: string;
  accept: string;
  decline: string;
  endsOn: string; // {n} datum
  you: string;
  won: string;
  lost: string;
  tie: string;
  running: string;
  claim: string;
  claimed: string;
  league: string;
  leagueHint: string;
  tiers: string[];
  place: string; // {n} = "3 / 30"
  promoteZone: string;
  demoteZone: string;
  leagueEnds: string; // {n} datum
  movedUp: string;
  movedDown: string;
  noName: string;
};

const cs: SocialText = {
  nav: "Parta",
  title: "Parta, souboje a liga",
  subtitle: "Uč se s kamarády nebo spolužáky. Společně plňte týdenní cíl, vyzvěte se na souboj a stoupejte v lize.",
  loginNeeded: "Přihlas se, ať můžeš vytvořit partu, soubojovat se a hrát ligu.",
  login: "Přihlásit se",
  loadError: "Nepodařilo se načíst data.",
  actionError: "Akce se nepovedla. Zkus to znovu.",
  groups: "Moje party",
  groupsHint: "Vytvoř partu a pošli kamarádům kód, nebo zadej kód od někoho jiného.",
  groupNamePlaceholder: "Název party (třeba 5. B)",
  create: "Vytvořit",
  codePlaceholder: "Kód party",
  join: "Připojit se",
  code: "Kód",
  leave: "Odejít",
  teamGoal: "Týdenní cíl party: {n} XP",
  goalDone: "Cíl splněn, výborně!",
  challenge: "Vyzvat",
  duels: "Souboje",
  duelsHint: "Týden, kdo získá víc XP za učení a hry, vyhrává. Vítěz dostane odměnu.",
  noDuels: "Zatím žádný souboj. Vyzvi někoho z party.",
  incoming: "{n} tě vyzývá",
  sent: "Čeká na odpověď",
  accept: "Přijmout",
  decline: "Odmítnout",
  endsOn: "Končí {n}",
  you: "Ty",
  won: "Vyhrál/a jsi!",
  lost: "Tentokrát to nevyšlo",
  tie: "Remíza",
  running: "Běží",
  claim: "Vyzvednout +{n} XP",
  claimed: "Vyzvednuto",
  league: "Týdenní liga",
  leagueHint: "Soutěžíš s 30 hráči stejné úrovně. Nejlepší postoupí výš, poslední sestoupí.",
  tiers: ["Bronzová", "Stříbrná", "Zlatá", "Platinová", "Diamantová"],
  place: "{n}. místo",
  promoteZone: "Postup",
  demoteZone: "Sestup",
  leagueEnds: "Týden končí {n}",
  movedUp: "Minulý týden jsi postoupil/a!",
  movedDown: "Minulý týden jsi sestoupil/a. Tento týden to otoč!",
  noName: "Hráč",
};

const en: SocialText = {
  nav: "Crew",
  title: "Crew, duels and league",
  subtitle: "Learn with friends or classmates. Reach a weekly goal together, challenge each other and climb the league.",
  loginNeeded: "Log in to create a crew, duel friends and play the league.",
  login: "Log in",
  loadError: "Could not load the data.",
  actionError: "That did not work. Try again.",
  groups: "My crews",
  groupsHint: "Create a crew and send friends the code, or enter someone else's code.",
  groupNamePlaceholder: "Crew name (e.g. Class 5B)",
  create: "Create",
  codePlaceholder: "Crew code",
  join: "Join",
  code: "Code",
  leave: "Leave",
  teamGoal: "Weekly crew goal: {n} XP",
  goalDone: "Goal reached, great job!",
  challenge: "Challenge",
  duels: "Duels",
  duelsHint: "For one week, whoever earns more XP from learning and games wins. The winner gets a reward.",
  noDuels: "No duels yet. Challenge someone from your crew.",
  incoming: "{n} challenges you",
  sent: "Waiting for an answer",
  accept: "Accept",
  decline: "Decline",
  endsOn: "Ends {n}",
  you: "You",
  won: "You won!",
  lost: "Not this time",
  tie: "Draw",
  running: "Running",
  claim: "Claim +{n} XP",
  claimed: "Claimed",
  league: "Weekly league",
  leagueHint: "You compete with 30 players of a similar level. The best move up, the last move down.",
  tiers: ["Bronze", "Silver", "Gold", "Platinum", "Diamond"],
  place: "Place {n}",
  promoteZone: "Promotion",
  demoteZone: "Relegation",
  leagueEnds: "Week ends {n}",
  movedUp: "You moved up last week!",
  movedDown: "You dropped down last week. Turn it around this week!",
  noName: "Player",
};

const de: SocialText = {
  nav: "Team",
  title: "Team, Duelle und Liga",
  subtitle: "Lerne mit Freunden oder Klassenkameraden. Erreicht gemeinsam ein Wochenziel, fordert euch heraus und steigt in der Liga auf.",
  loginNeeded: "Melde dich an, um ein Team zu gründen, Duelle zu spielen und die Liga zu erleben.",
  login: "Anmelden",
  loadError: "Die Daten konnten nicht geladen werden.",
  actionError: "Das hat nicht geklappt. Versuch es noch einmal.",
  groups: "Meine Teams",
  groupsHint: "Gründe ein Team und schicke Freunden den Code oder gib einen fremden Code ein.",
  groupNamePlaceholder: "Teamname (z. B. Klasse 5B)",
  create: "Erstellen",
  codePlaceholder: "Team-Code",
  join: "Beitreten",
  code: "Code",
  leave: "Verlassen",
  teamGoal: "Wochenziel des Teams: {n} XP",
  goalDone: "Ziel erreicht, super!",
  challenge: "Herausfordern",
  duels: "Duelle",
  duelsHint: "Eine Woche lang gewinnt, wer mehr XP durch Lernen und Spiele sammelt. Der Sieger bekommt eine Belohnung.",
  noDuels: "Noch kein Duell. Fordere jemanden aus deinem Team heraus.",
  incoming: "{n} fordert dich heraus",
  sent: "Wartet auf Antwort",
  accept: "Annehmen",
  decline: "Ablehnen",
  endsOn: "Endet {n}",
  you: "Du",
  won: "Du hast gewonnen!",
  lost: "Diesmal nicht",
  tie: "Unentschieden",
  running: "Läuft",
  claim: "+{n} XP abholen",
  claimed: "Abgeholt",
  league: "Wochenliga",
  leagueHint: "Du trittst gegen 30 Spieler ähnlichen Niveaus an. Die Besten steigen auf, die Letzten ab.",
  tiers: ["Bronze", "Silber", "Gold", "Platin", "Diamant"],
  place: "Platz {n}",
  promoteZone: "Aufstieg",
  demoteZone: "Abstieg",
  leagueEnds: "Woche endet {n}",
  movedUp: "Du bist letzte Woche aufgestiegen!",
  movedDown: "Du bist letzte Woche abgestiegen. Dreh es diese Woche um!",
  noName: "Spieler",
};

const ru: SocialText = {
  nav: "Команда",
  title: "Команда, дуэли и лига",
  subtitle: "Учись с друзьями или одноклассниками. Выполняйте недельную цель вместе, вызывайте друг друга и поднимайтесь в лиге.",
  loginNeeded: "Войди, чтобы создать команду, устраивать дуэли и играть в лиге.",
  login: "Войти",
  loadError: "Не удалось загрузить данные.",
  actionError: "Не получилось. Попробуй ещё раз.",
  groups: "Мои команды",
  groupsHint: "Создай команду и отправь друзьям код или введи чужой код.",
  groupNamePlaceholder: "Название команды (например, 5 Б)",
  create: "Создать",
  codePlaceholder: "Код команды",
  join: "Вступить",
  code: "Код",
  leave: "Выйти",
  teamGoal: "Недельная цель команды: {n} XP",
  goalDone: "Цель выполнена, отлично!",
  challenge: "Вызвать",
  duels: "Дуэли",
  duelsHint: "Неделю побеждает тот, кто наберёт больше XP за учёбу и игры. Победитель получает награду.",
  noDuels: "Дуэлей пока нет. Вызови кого-нибудь из команды.",
  incoming: "{n} вызывает тебя",
  sent: "Ждёт ответа",
  accept: "Принять",
  decline: "Отклонить",
  endsOn: "Закончится {n}",
  you: "Ты",
  won: "Ты победил!",
  lost: "В этот раз не вышло",
  tie: "Ничья",
  running: "Идёт",
  claim: "Забрать +{n} XP",
  claimed: "Получено",
  league: "Недельная лига",
  leagueHint: "Ты соревнуешься с 30 игроками схожего уровня. Лучшие поднимаются, последние опускаются.",
  tiers: ["Бронзовая", "Серебряная", "Золотая", "Платиновая", "Алмазная"],
  place: "{n} место",
  promoteZone: "Повышение",
  demoteZone: "Понижение",
  leagueEnds: "Неделя закончится {n}",
  movedUp: "На прошлой неделе ты поднялся!",
  movedDown: "На прошлой неделе ты опустился. Исправь это на этой неделе!",
  noName: "Игрок",
};

const texts: Record<Locale, SocialText> = { cs, en, de, ru };
export const getSocialText = (locale: Locale) => texts[locale];
