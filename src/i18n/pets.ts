import type { Locale } from "./config";
import type { ErrorCode, SpeciesId, UpgradeId } from "@/lib/idle/pets";

export type PetText = {
  back: string;
  title: string;
  subtitle: string;
  loginRequired: string;
  login: string;
  unavailable: string;
  loading: string;
  chooseTitle: string;
  chooseHint: string;
  free: string;
  pointsCost: string; // {n}
  needPoints: string; // {n}
  adopt: string;
  species: Record<SpeciesId, string>;
  level: string;
  maxLevel: string;
  toNext: string; // {n}
  hunger: string;
  happy: string;
  coins: string;
  points: string;
  perHour: string; // {n}
  offlineNote: string; // {n}
  learningBonus: string; // {n}
  learningHint: string;
  mood: { happy: string; ok: string; sad: string; hungry: string };
  feed: string; // {n}
  play: string;
  playIn: string; // {n}
  treat: string; // {n}
  treatHint: string;
  upgradesTitle: string;
  upgrades: Record<UpgradeId, { name: string; effect: string }>;
  upgradeLevel: string;
  buy: string; // {n}
  maxed: string;
  rename: string;
  save: string;
  namePlaceholder: string;
  switchPet: string;
  errors: Record<ErrorCode | "conflict" | "generic", string>;
};

const cs: PetText = {
  back: "← Stálé hry",
  title: "Mazlíčci",
  subtitle: "Vyber si mazlíčka, krm ho a hraj si s ním. Roste, vydělává mince a vydělává i když jsi pryč. Učení mu pomáhá.",
  loginRequired: "Aby se ti mazlíček ukládal, musíš se přihlásit.",
  login: "Přihlásit se",
  unavailable: "Mazlíček se teď nenačetl. Zkus to za chvíli.",
  loading: "Načítám…",
  chooseTitle: "Vyber si mazlíčka",
  chooseHint: "Dalšího můžeš kdykoli přidat. Vzácnější se odemykají body z učení.",
  free: "Zdarma",
  pointsCost: "{n} bodů",
  needPoints: "Chybí ti body ({n})",
  adopt: "Vzít si ho",
  species: { cat: "Kotě", dog: "Štěně", bunny: "Králíček", fox: "Liška", dragon: "Dráček" },
  level: "Úroveň",
  maxLevel: "Největší úroveň",
  toNext: "Do další úrovně zbývá {n}",
  hunger: "Sytost",
  happy: "Nálada",
  coins: "Mince",
  points: "Body z učení",
  perHour: "{n} mincí za hodinu",
  offlineNote: "Vydělává i když jsi pryč, nejvýš {n} hodin.",
  learningBonus: "Bonus za učení +{n} %",
  learningHint: "Za každých 100 XP z posledních 24 hodin výdělek roste o 10 %, nejvýš o 50 %.",
  mood: {
    happy: "Je šťastný!",
    ok: "Je v pohodě.",
    sad: "Je smutný. Pohraj si s ním.",
    hungry: "Má hlad! Nakrm ho.",
  },
  feed: "Nakrmit ({n} mincí)",
  play: "Hrát si",
  playIn: "Za {n} s",
  treat: "Pamlsek ({n} bodů)",
  treatHint: "Pamlsek za body z učení: úplně zasytí, potěší a hodně pomůže růstu.",
  upgradesTitle: "Vylepšení",
  upgrades: {
    bowl: { name: "Miska", effect: "Hlad klesá pomaleji." },
    toys: { name: "Hračky", effect: "+15 % výdělku za úroveň." },
    bed: { name: "Pelíšek", effect: "Vydělává o 3 hodiny déle, i když jsi pryč." },
  },
  upgradeLevel: "úr.",
  buy: "Koupit · {n}",
  maxed: "Max",
  rename: "Jméno mazlíčka",
  save: "Uložit",
  namePlaceholder: "Jak se jmenuje?",
  switchPet: "Přepnout mazlíčka",
  errors: {
    "no-pet": "Nejdřív si vyber mazlíčka.",
    "not-enough-coins": "Nemáš dost mincí.",
    "not-enough-points": "Nemáš dost bodů z učení.",
    cooldown: "Ještě je unavený, zkus to za chvíli.",
    "max-level": "To už je na maximu.",
    "unknown-species": "Tenhle mazlíček neexistuje.",
    "unknown-upgrade": "Tohle vylepšení neexistuje.",
    "invalid-name": "Napiš nějaké jméno.",
    conflict: "Stav se mezitím změnil. Zkus to ještě jednou.",
    generic: "Něco se nepovedlo. Zkus to znovu.",
  },
};

const en: PetText = {
  back: "← Endless games",
  title: "Pets",
  subtitle: "Pick a pet, feed it and play with it. It grows, earns coins and keeps earning while you're away. Learning helps it.",
  loginRequired: "Log in so your pet can be saved.",
  login: "Log in",
  unavailable: "Your pet couldn't load right now. Try again in a moment.",
  loading: "Loading…",
  chooseTitle: "Choose a pet",
  chooseHint: "You can add more at any time. Rarer ones unlock with learning points.",
  free: "Free",
  pointsCost: "{n} points",
  needPoints: "Not enough points ({n})",
  adopt: "Take it",
  species: { cat: "Kitten", dog: "Puppy", bunny: "Bunny", fox: "Fox", dragon: "Dragon" },
  level: "Level",
  maxLevel: "Max level",
  toNext: "{n} to the next level",
  hunger: "Fullness",
  happy: "Mood",
  coins: "Coins",
  points: "Learning points",
  perHour: "{n} coins per hour",
  offlineNote: "Earns while you're away, up to {n} hours.",
  learningBonus: "Learning bonus +{n}%",
  learningHint: "Every 100 XP from the last 24 hours adds 10% to the income, up to 50%.",
  mood: {
    happy: "It's happy!",
    ok: "It's doing fine.",
    sad: "It's sad. Play with it.",
    hungry: "It's hungry! Feed it.",
  },
  feed: "Feed ({n} coins)",
  play: "Play",
  playIn: "In {n} s",
  treat: "Treat ({n} points)",
  treatHint: "A treat paid for with learning points: fills it up, cheers it up and helps it grow a lot.",
  upgradesTitle: "Upgrades",
  upgrades: {
    bowl: { name: "Bowl", effect: "Hunger drops more slowly." },
    toys: { name: "Toys", effect: "+15% income per level." },
    bed: { name: "Bed", effect: "Earns 3 hours longer while you're away." },
  },
  upgradeLevel: "lv.",
  buy: "Buy · {n}",
  maxed: "Max",
  rename: "Pet name",
  save: "Save",
  namePlaceholder: "What's its name?",
  switchPet: "Switch pet",
  errors: {
    "no-pet": "Choose a pet first.",
    "not-enough-coins": "Not enough coins.",
    "not-enough-points": "Not enough learning points.",
    cooldown: "It's still tired, try again in a moment.",
    "max-level": "That's already maxed out.",
    "unknown-species": "That pet doesn't exist.",
    "unknown-upgrade": "That upgrade doesn't exist.",
    "invalid-name": "Type a name.",
    conflict: "The state changed in the meantime. Try once more.",
    generic: "Something went wrong. Try again.",
  },
};

const de: PetText = {
  back: "← Endlosspiele",
  title: "Haustiere",
  subtitle: "Wähle ein Haustier, füttere es und spiel mit ihm. Es wächst, verdient Münzen und verdient auch, wenn du weg bist. Lernen hilft ihm.",
  loginRequired: "Melde dich an, damit dein Haustier gespeichert wird.",
  login: "Anmelden",
  unavailable: "Dein Haustier konnte gerade nicht geladen werden. Versuch es gleich noch einmal.",
  loading: "Lädt…",
  chooseTitle: "Wähle ein Haustier",
  chooseHint: "Du kannst jederzeit weitere hinzufügen. Seltenere schaltest du mit Lernpunkten frei.",
  free: "Kostenlos",
  pointsCost: "{n} Punkte",
  needPoints: "Zu wenige Punkte ({n})",
  adopt: "Nehmen",
  species: { cat: "Kätzchen", dog: "Welpe", bunny: "Häschen", fox: "Fuchs", dragon: "Drache" },
  level: "Level",
  maxLevel: "Höchstes Level",
  toNext: "Noch {n} bis zum nächsten Level",
  hunger: "Sattheit",
  happy: "Stimmung",
  coins: "Münzen",
  points: "Lernpunkte",
  perHour: "{n} Münzen pro Stunde",
  offlineNote: "Verdient auch, wenn du weg bist, höchstens {n} Stunden.",
  learningBonus: "Lernbonus +{n} %",
  learningHint: "Je 100 XP der letzten 24 Stunden steigt der Verdienst um 10 %, höchstens um 50 %.",
  mood: {
    happy: "Es ist glücklich!",
    ok: "Es geht ihm gut.",
    sad: "Es ist traurig. Spiel mit ihm.",
    hungry: "Es hat Hunger! Füttere es.",
  },
  feed: "Füttern ({n} Münzen)",
  play: "Spielen",
  playIn: "In {n} s",
  treat: "Leckerli ({n} Punkte)",
  treatHint: "Ein Leckerli, bezahlt mit Lernpunkten: macht satt, froh und hilft stark beim Wachsen.",
  upgradesTitle: "Verbesserungen",
  upgrades: {
    bowl: { name: "Napf", effect: "Der Hunger sinkt langsamer." },
    toys: { name: "Spielzeug", effect: "+15 % Verdienst pro Stufe." },
    bed: { name: "Körbchen", effect: "Verdient 3 Stunden länger, wenn du weg bist." },
  },
  upgradeLevel: "St.",
  buy: "Kaufen · {n}",
  maxed: "Max",
  rename: "Name des Haustiers",
  save: "Speichern",
  namePlaceholder: "Wie heißt es?",
  switchPet: "Haustier wechseln",
  errors: {
    "no-pet": "Wähle zuerst ein Haustier.",
    "not-enough-coins": "Nicht genug Münzen.",
    "not-enough-points": "Nicht genug Lernpunkte.",
    cooldown: "Es ist noch müde, versuch es gleich noch einmal.",
    "max-level": "Das ist schon am Maximum.",
    "unknown-species": "Dieses Haustier gibt es nicht.",
    "unknown-upgrade": "Diese Verbesserung gibt es nicht.",
    "invalid-name": "Gib einen Namen ein.",
    conflict: "Der Stand hat sich inzwischen geändert. Versuch es noch einmal.",
    generic: "Etwas ist schiefgegangen. Versuch es erneut.",
  },
};

const ru: PetText = {
  back: "← Вечные игры",
  title: "Питомцы",
  subtitle: "Выбери питомца, корми его и играй с ним. Он растёт, зарабатывает монеты и зарабатывает, даже когда тебя нет. Учёба ему помогает.",
  loginRequired: "Войди, чтобы питомец сохранялся.",
  login: "Войти",
  unavailable: "Питомец сейчас не загрузился. Попробуй чуть позже.",
  loading: "Загрузка…",
  chooseTitle: "Выбери питомца",
  chooseHint: "Других можно добавить в любой момент. Более редких открывают баллы за учёбу.",
  free: "Бесплатно",
  pointsCost: "{n} баллов",
  needPoints: "Не хватает баллов ({n})",
  adopt: "Взять",
  species: { cat: "Котёнок", dog: "Щенок", bunny: "Зайчонок", fox: "Лиса", dragon: "Дракончик" },
  level: "Уровень",
  maxLevel: "Максимальный уровень",
  toNext: "До следующего уровня {n}",
  hunger: "Сытость",
  happy: "Настроение",
  coins: "Монеты",
  points: "Баллы за учёбу",
  perHour: "{n} монет в час",
  offlineNote: "Зарабатывает, даже когда тебя нет, не дольше {n} часов.",
  learningBonus: "Бонус за учёбу +{n} %",
  learningHint: "За каждые 100 XP за последние 24 часа доход растёт на 10 %, не больше чем на 50 %.",
  mood: {
    happy: "Он счастлив!",
    ok: "У него всё нормально.",
    sad: "Ему грустно. Поиграй с ним.",
    hungry: "Он голоден! Покорми его.",
  },
  feed: "Покормить ({n} монет)",
  play: "Играть",
  playIn: "Через {n} с",
  treat: "Лакомство ({n} баллов)",
  treatHint: "Лакомство за баллы за учёбу: полностью насыщает, радует и сильно помогает расти.",
  upgradesTitle: "Улучшения",
  upgrades: {
    bowl: { name: "Миска", effect: "Голод растёт медленнее." },
    toys: { name: "Игрушки", effect: "+15 % дохода за уровень." },
    bed: { name: "Лежанка", effect: "Зарабатывает на 3 часа дольше, пока тебя нет." },
  },
  upgradeLevel: "ур.",
  buy: "Купить · {n}",
  maxed: "Макс",
  rename: "Имя питомца",
  save: "Сохранить",
  namePlaceholder: "Как его зовут?",
  switchPet: "Сменить питомца",
  errors: {
    "no-pet": "Сначала выбери питомца.",
    "not-enough-coins": "Не хватает монет.",
    "not-enough-points": "Не хватает баллов за учёбу.",
    cooldown: "Он ещё устал, попробуй чуть позже.",
    "max-level": "Это уже максимум.",
    "unknown-species": "Такого питомца нет.",
    "unknown-upgrade": "Такого улучшения нет.",
    "invalid-name": "Напиши имя.",
    conflict: "Состояние изменилось. Попробуй ещё раз.",
    generic: "Что-то пошло не так. Попробуй снова.",
  },
};

const texts: Record<Locale, PetText> = { cs, en, de, ru };

export function getPetText(locale: Locale): PetText {
  return texts[locale];
}

export function fillN(template: string, n: number | string): string {
  return template.replace("{n}", String(n));
}
