import type { Locale } from "./config";
import type { ErrorCode } from "@/lib/idle/farm";

export type FarmText = {
  back: string;
  title: string;
  subtitle: string;
  loginRequired: string;
  login: string;
  unavailable: string;
  loading: string;
  level: string; // {n}
  maxLevel: string;
  toNext: string; // {n}
  coins: string;
  points: string;
  learningBonus: string; // {n}
  learningHint: string;
  speedBonus: string; // {n}
  speedHint: string;
  bonusLearning: string; // {n}
  bonusPet: string; // {n}
  bonusCity: string; // {n}
  tabs: { field: string; animals: string; silo: string; orders: string };
  seedsTitle: string;
  seedHint: string;
  seedPick: string;
  minutes: string; // {n}
  hours: string; // {n}
  levelNeeded: string; // {n}
  plantAll: string;
  harvestAll: string;
  emptyPlot: string;
  ripe: string;
  growing: string; // {t}
  fertilize: string; // {n}
  fertilizeHint: string;
  buyPlot: string; // {n}
  animalsTitle: string;
  animalsHint: string;
  owned: string; // {n} {max}
  buyAnimal: string; // {n}
  maxAnimals: string;
  collect: string; // {n}
  collectAll: string;
  nothingYet: string;
  nextIn: string; // {t}
  makes: string; // {name} {t}
  siloTitle: string;
  siloUsed: string; // {a} {b}
  upgradeSilo: string; // {n} {cap}
  maxSilo: string;
  sell: string; // {n}
  sellAll: string; // {n}
  siloEmpty: string;
  each: string; // {n}
  ordersTitle: string;
  ordersHint: string;
  deliver: string;
  reward: string;
  ordersDone: string; // {n}
  have: string;
  toast: {
    harvested: string; // {n}
    planted: string;
    collected: string; // {n}
    sold: string; // {n}
    delivered: string; // {n}
    bought: string;
    fertilized: string;
    upgraded: string;
  };
  errors: Record<ErrorCode | "login-required" | "unavailable" | "conflict" | "generic", string>;
};

const cs: FarmText = {
  back: "Stálé hry",
  title: "Farma",
  subtitle: "Pěstuj úrodu, chovej zvířata a plň zakázky. Čím víc se učíš, tím rychleji všechno roste.",
  loginRequired: "Farmu si můžeš založit po přihlášení.",
  login: "Přihlásit se",
  unavailable: "Farma se teď nenačetla. Zkus to za chvíli.",
  loading: "Načítám farmu…",
  level: "Úroveň {n}",
  maxLevel: "Nejvyšší úroveň",
  toNext: "{n} zkušeností do další úrovně",
  coins: "Mince",
  points: "Body",
  learningBonus: "Učení zrychluje farmu o {n} %",
  learningHint: "Každých 100 XP z posledních 24 hodin zrychlí růst i zvířata o 10 % (nejvíc o 50 %).",
  speedBonus: "Farma běží o {n} % rychleji",
  speedHint: "Zrychlení tvoří učení (nejvíc 50 %), aktivní mazlíček (nejvíc 10 %) a velikost města (nejvíc 10 %).",
  bonusLearning: "Učení {n} %",
  bonusPet: "Mazlíček {n} %",
  bonusCity: "Město {n} %",
  tabs: { field: "Pole", animals: "Zvířata", silo: "Sýpka", orders: "Zakázky" },
  seedsTitle: "Semínka",
  seedHint: "Vyber plodinu a klepni na prázdný záhon. Zralou úrodu sklidíš klepnutím.",
  seedPick: "Nejdřív vyber semínko.",
  minutes: "{n} min",
  hours: "{n} h",
  levelNeeded: "Úroveň {n}",
  plantAll: "Zasadit všude",
  harvestAll: "Sklidit vše",
  emptyPlot: "Prázdný záhon",
  ripe: "Zralé!",
  growing: "Dozraje za {t}",
  fertilize: "Hnojivo za {n} ⭐",
  fertilizeHint: "Hnojivo dozraje tuhle plodinu hned. Platí se body z učení.",
  buyPlot: "Nový záhon za {n}",
  animalsTitle: "Zvířata",
  animalsHint: "Zvířata sama vyrábějí suroviny. Dávky se hromadí, ale po čase se jich víc nevejde, tak je vyzvedávej.",
  owned: "{n} z {max}",
  buyAnimal: "Koupit za {n}",
  maxAnimals: "Víc se jich nevejde",
  collect: "Vyzvednout {n}",
  collectAll: "Vyzvednout vše",
  nothingYet: "Zatím nic",
  nextIn: "Další dávka za {t}",
  makes: "Dává: {name}, každých {t}",
  siloTitle: "Sýpka",
  siloUsed: "Sýpka {a} / {b}",
  upgradeSilo: "Zvětšit sýpku za {n} (+{cap})",
  maxSilo: "Sýpka je největší",
  sell: "Prodat za {n}",
  sellAll: "Prodat vše za {n}",
  siloEmpty: "Sýpka je prázdná. Sklidíš úrodu nebo vyzvedneš produkty od zvířat.",
  each: "{n} za kus",
  ordersTitle: "Zakázky",
  ordersHint: "Splň objednávku ze sýpky a dostaneš mnohem víc než za běžný prodej.",
  deliver: "Odevzdat",
  reward: "Odměna",
  ordersDone: "Splněné zakázky: {n}",
  have: "máš",
  toast: {
    harvested: "Sklizeno: {n}",
    planted: "Zasazeno",
    collected: "Vyzvednuto: {n}",
    sold: "Prodáno za {n} mincí",
    delivered: "Zakázka splněna! +{n} mincí",
    bought: "Koupeno",
    fertilized: "Hnojivo zabralo",
    upgraded: "Sýpka je větší",
  },
  errors: {
    "bad-request": "Tohle nejde.",
    "not-enough-coins": "Chybí ti mince.",
    "not-enough-points": "Nemáš dost bodů z učení.",
    "level-too-low": "Na tohle ještě nemáš úroveň.",
    "plot-occupied": "Záhon už je osázený.",
    "plot-empty": "Záhon je prázdný.",
    "not-ripe": "Ještě není zralé.",
    "silo-full": "Sýpka je plná. Něco prodej nebo ji zvětši.",
    "max-plots": "Máš všechny záhony.",
    "max-animals": "Víc zvířat tohoto druhu se nevejde.",
    "max-level": "Nejvyšší úroveň už máš.",
    "nothing-to-collect": "Zvířata ještě nic nevyrobila.",
    "nothing-to-sell": "Není co prodávat.",
    "order-missing-items": "Na zakázku ti ještě něco chybí.",
    "unknown-order": "Taková zakázka už není.",
    "login-required": "Přihlas se.",
    unavailable: "Farma teď není dostupná. Zkus to za chvíli.",
    conflict: "Farma se mezitím změnila v jiné záložce. Načítám znovu.",
    generic: "Něco se nepovedlo. Zkus to znovu.",
  },
};

const en: FarmText = {
  back: "Idle games",
  title: "Farm",
  subtitle: "Grow crops, raise animals and fill orders. The more you learn, the faster everything grows.",
  loginRequired: "You can start your farm after logging in.",
  login: "Log in",
  unavailable: "The farm couldn't load right now. Try again in a moment.",
  loading: "Loading the farm…",
  level: "Level {n}",
  maxLevel: "Top level",
  toNext: "{n} experience to the next level",
  coins: "Coins",
  points: "Points",
  learningBonus: "Learning speeds up your farm by {n} %",
  learningHint: "Every 100 XP from the last 24 hours speeds up crops and animals by 10 % (up to 50 %).",
  speedBonus: "The farm runs {n} % faster",
  speedHint: "The speed-up comes from learning (up to 50 %), your active pet (up to 10 %) and the size of your city (up to 10 %).",
  bonusLearning: "Learning {n} %",
  bonusPet: "Pet {n} %",
  bonusCity: "City {n} %",
  tabs: { field: "Field", animals: "Animals", silo: "Silo", orders: "Orders" },
  seedsTitle: "Seeds",
  seedHint: "Pick a crop and tap an empty plot. Tap ripe crops to harvest them.",
  seedPick: "Pick a seed first.",
  minutes: "{n} min",
  hours: "{n} h",
  levelNeeded: "Level {n}",
  plantAll: "Plant everywhere",
  harvestAll: "Harvest all",
  emptyPlot: "Empty plot",
  ripe: "Ripe!",
  growing: "Ripe in {t}",
  fertilize: "Fertilizer for {n} ⭐",
  fertilizeHint: "Fertilizer ripens this crop right away. It costs learning points.",
  buyPlot: "New plot for {n}",
  animalsTitle: "Animals",
  animalsHint: "Animals make goods on their own. Batches pile up, but only so many fit, so collect them.",
  owned: "{n} of {max}",
  buyAnimal: "Buy for {n}",
  maxAnimals: "No room for more",
  collect: "Collect {n}",
  collectAll: "Collect all",
  nothingYet: "Nothing yet",
  nextIn: "Next batch in {t}",
  makes: "Makes: {name}, every {t}",
  siloTitle: "Silo",
  siloUsed: "Silo {a} / {b}",
  upgradeSilo: "Enlarge silo for {n} (+{cap})",
  maxSilo: "The silo is at its largest",
  sell: "Sell for {n}",
  sellAll: "Sell all for {n}",
  siloEmpty: "The silo is empty. Harvest crops or collect goods from your animals.",
  each: "{n} each",
  ordersTitle: "Orders",
  ordersHint: "Fill an order from your silo and you get much more than from a normal sale.",
  deliver: "Deliver",
  reward: "Reward",
  ordersDone: "Orders completed: {n}",
  have: "you have",
  toast: {
    harvested: "Harvested: {n}",
    planted: "Planted",
    collected: "Collected: {n}",
    sold: "Sold for {n} coins",
    delivered: "Order complete! +{n} coins",
    bought: "Bought",
    fertilized: "The fertilizer worked",
    upgraded: "The silo is bigger",
  },
  errors: {
    "bad-request": "That doesn't work.",
    "not-enough-coins": "You're short on coins.",
    "not-enough-points": "Not enough learning points.",
    "level-too-low": "You haven't reached that level yet.",
    "plot-occupied": "That plot is already planted.",
    "plot-empty": "The plot is empty.",
    "not-ripe": "It isn't ripe yet.",
    "silo-full": "The silo is full. Sell something or enlarge it.",
    "max-plots": "You already have all the plots.",
    "max-animals": "No room for more animals of this kind.",
    "max-level": "Already at the top level.",
    "nothing-to-collect": "The animals haven't made anything yet.",
    "nothing-to-sell": "Nothing to sell.",
    "order-missing-items": "You're still missing something for this order.",
    "unknown-order": "That order is gone.",
    "login-required": "Log in first.",
    unavailable: "The farm isn't available right now. Try again in a moment.",
    conflict: "The farm changed in another tab. Reloading.",
    generic: "Something went wrong. Try again.",
  },
};

const de: FarmText = {
  back: "Dauerspiele",
  title: "Farm",
  subtitle: "Baue Pflanzen an, halte Tiere und erfülle Aufträge. Je mehr du lernst, desto schneller wächst alles.",
  loginRequired: "Du kannst deine Farm nach dem Anmelden gründen.",
  login: "Anmelden",
  unavailable: "Die Farm konnte gerade nicht geladen werden. Versuche es gleich noch einmal.",
  loading: "Farm wird geladen…",
  level: "Level {n}",
  maxLevel: "Höchstes Level",
  toNext: "{n} Erfahrung bis zum nächsten Level",
  coins: "Münzen",
  points: "Punkte",
  learningBonus: "Lernen beschleunigt deine Farm um {n} %",
  learningHint: "Je 100 XP der letzten 24 Stunden beschleunigen Pflanzen und Tiere um 10 % (höchstens 50 %).",
  speedBonus: "Die Farm läuft {n} % schneller",
  speedHint: "Die Beschleunigung kommt vom Lernen (bis 50 %), dem aktiven Haustier (bis 10 %) und der Größe der Stadt (bis 10 %).",
  bonusLearning: "Lernen {n} %",
  bonusPet: "Haustier {n} %",
  bonusCity: "Stadt {n} %",
  tabs: { field: "Feld", animals: "Tiere", silo: "Silo", orders: "Aufträge" },
  seedsTitle: "Saatgut",
  seedHint: "Wähle eine Pflanze und tippe auf ein leeres Beet. Reife Ernte erntest du durch Antippen.",
  seedPick: "Wähle zuerst Saatgut.",
  minutes: "{n} Min.",
  hours: "{n} Std.",
  levelNeeded: "Level {n}",
  plantAll: "Überall pflanzen",
  harvestAll: "Alles ernten",
  emptyPlot: "Leeres Beet",
  ripe: "Reif!",
  growing: "Reif in {t}",
  fertilize: "Dünger für {n} ⭐",
  fertilizeHint: "Dünger lässt diese Pflanze sofort reifen. Er kostet Lernpunkte.",
  buyPlot: "Neues Beet für {n}",
  animalsTitle: "Tiere",
  animalsHint: "Tiere stellen von selbst Waren her. Die Portionen sammeln sich, aber es passen nur begrenzt viele, also hole sie ab.",
  owned: "{n} von {max}",
  buyAnimal: "Kaufen für {n}",
  maxAnimals: "Kein Platz für mehr",
  collect: "{n} abholen",
  collectAll: "Alles abholen",
  nothingYet: "Noch nichts",
  nextIn: "Nächste Portion in {t}",
  makes: "Liefert: {name}, alle {t}",
  siloTitle: "Silo",
  siloUsed: "Silo {a} / {b}",
  upgradeSilo: "Silo für {n} vergrößern (+{cap})",
  maxSilo: "Das Silo ist am größten",
  sell: "Verkaufen für {n}",
  sellAll: "Alles verkaufen für {n}",
  siloEmpty: "Das Silo ist leer. Ernte Pflanzen oder hole Waren von deinen Tieren ab.",
  each: "{n} pro Stück",
  ordersTitle: "Aufträge",
  ordersHint: "Erfülle einen Auftrag aus deinem Silo und du bekommst viel mehr als beim normalen Verkauf.",
  deliver: "Abgeben",
  reward: "Belohnung",
  ordersDone: "Erfüllte Aufträge: {n}",
  have: "du hast",
  toast: {
    harvested: "Geerntet: {n}",
    planted: "Gepflanzt",
    collected: "Abgeholt: {n}",
    sold: "Für {n} Münzen verkauft",
    delivered: "Auftrag erfüllt! +{n} Münzen",
    bought: "Gekauft",
    fertilized: "Der Dünger hat gewirkt",
    upgraded: "Das Silo ist größer",
  },
  errors: {
    "bad-request": "Das geht nicht.",
    "not-enough-coins": "Dir fehlen Münzen.",
    "not-enough-points": "Nicht genug Lernpunkte.",
    "level-too-low": "Dafür hast du das Level noch nicht.",
    "plot-occupied": "Das Beet ist schon bepflanzt.",
    "plot-empty": "Das Beet ist leer.",
    "not-ripe": "Es ist noch nicht reif.",
    "silo-full": "Das Silo ist voll. Verkaufe etwas oder vergrößere es.",
    "max-plots": "Du hast schon alle Beete.",
    "max-animals": "Kein Platz für mehr Tiere dieser Art.",
    "max-level": "Du hast schon das höchste Level.",
    "nothing-to-collect": "Die Tiere haben noch nichts hergestellt.",
    "nothing-to-sell": "Es gibt nichts zu verkaufen.",
    "order-missing-items": "Für diesen Auftrag fehlt dir noch etwas.",
    "unknown-order": "Diesen Auftrag gibt es nicht mehr.",
    "login-required": "Melde dich an.",
    unavailable: "Die Farm ist gerade nicht verfügbar. Versuche es gleich noch einmal.",
    conflict: "Die Farm hat sich in einem anderen Tab geändert. Wird neu geladen.",
    generic: "Etwas ist schiefgegangen. Versuche es noch einmal.",
  },
};

const ru: FarmText = {
  back: "Постоянные игры",
  title: "Ферма",
  subtitle: "Выращивай урожай, разводи животных и выполняй заказы. Чем больше ты учишься, тем быстрее всё растёт.",
  loginRequired: "Завести ферму можно после входа.",
  login: "Войти",
  unavailable: "Ферма сейчас не загрузилась. Попробуй чуть позже.",
  loading: "Загружаю ферму…",
  level: "Уровень {n}",
  maxLevel: "Высший уровень",
  toNext: "{n} опыта до следующего уровня",
  coins: "Монеты",
  points: "Очки",
  learningBonus: "Учёба ускоряет ферму на {n} %",
  learningHint: "Каждые 100 XP за последние 24 часа ускоряют рост и животных на 10 % (максимум 50 %).",
  speedBonus: "Ферма работает на {n} % быстрее",
  speedHint: "Ускорение дают учёба (до 50 %), активный питомец (до 10 %) и размер города (до 10 %).",
  bonusLearning: "Учёба {n} %",
  bonusPet: "Питомец {n} %",
  bonusCity: "Город {n} %",
  tabs: { field: "Поле", animals: "Животные", silo: "Амбар", orders: "Заказы" },
  seedsTitle: "Семена",
  seedHint: "Выбери культуру и нажми на пустую грядку. Спелый урожай собирается нажатием.",
  seedPick: "Сначала выбери семена.",
  minutes: "{n} мин",
  hours: "{n} ч",
  levelNeeded: "Уровень {n}",
  plantAll: "Посадить везде",
  harvestAll: "Собрать всё",
  emptyPlot: "Пустая грядка",
  ripe: "Созрело!",
  growing: "Созреет через {t}",
  fertilize: "Удобрение за {n} ⭐",
  fertilizeHint: "Удобрение сразу вырастит эту культуру. Оно стоит очки за учёбу.",
  buyPlot: "Новая грядка за {n}",
  animalsTitle: "Животные",
  animalsHint: "Животные сами производят товары. Порции копятся, но помещается ограниченное количество, так что забирай их.",
  owned: "{n} из {max}",
  buyAnimal: "Купить за {n}",
  maxAnimals: "Больше не помещается",
  collect: "Забрать {n}",
  collectAll: "Забрать всё",
  nothingYet: "Пока ничего",
  nextIn: "Следующая порция через {t}",
  makes: "Даёт: {name}, каждые {t}",
  siloTitle: "Амбар",
  siloUsed: "Амбар {a} / {b}",
  upgradeSilo: "Расширить амбар за {n} (+{cap})",
  maxSilo: "Амбар самый большой",
  sell: "Продать за {n}",
  sellAll: "Продать всё за {n}",
  siloEmpty: "Амбар пуст. Собери урожай или забери товары у животных.",
  each: "{n} за штуку",
  ordersTitle: "Заказы",
  ordersHint: "Выполни заказ из амбара и получишь гораздо больше, чем за обычную продажу.",
  deliver: "Сдать",
  reward: "Награда",
  ordersDone: "Выполнено заказов: {n}",
  have: "у тебя",
  toast: {
    harvested: "Собрано: {n}",
    planted: "Посажено",
    collected: "Забрано: {n}",
    sold: "Продано за {n} монет",
    delivered: "Заказ выполнен! +{n} монет",
    bought: "Куплено",
    fertilized: "Удобрение подействовало",
    upgraded: "Амбар стал больше",
  },
  errors: {
    "bad-request": "Так нельзя.",
    "not-enough-coins": "Не хватает монет.",
    "not-enough-points": "Недостаточно очков за учёбу.",
    "level-too-low": "Для этого у тебя ещё не хватает уровня.",
    "plot-occupied": "Грядка уже засажена.",
    "plot-empty": "Грядка пуста.",
    "not-ripe": "Ещё не созрело.",
    "silo-full": "Амбар полон. Что-нибудь продай или расширь его.",
    "max-plots": "У тебя уже все грядки.",
    "max-animals": "Больше животных этого вида не поместится.",
    "max-level": "Уровень уже самый высокий.",
    "nothing-to-collect": "Животные пока ничего не произвели.",
    "nothing-to-sell": "Нечего продавать.",
    "order-missing-items": "Для этого заказа тебе ещё чего-то не хватает.",
    "unknown-order": "Такого заказа уже нет.",
    "login-required": "Войди в аккаунт.",
    unavailable: "Ферма сейчас недоступна. Попробуй чуть позже.",
    conflict: "Ферма изменилась в другой вкладке. Загружаю заново.",
    generic: "Что-то пошло не так. Попробуй ещё раз.",
  },
};

const TEXTS: Record<Locale, FarmText> = { cs, en, de, ru };

export function getFarmText(locale: Locale): FarmText {
  return TEXTS[locale] ?? cs;
}
