import type { Locale } from "./config";

export type ShopExtraText = {
  dealsTitle: string;
  dealsHint: string;
  resetsIn: string; // {t}
  search: string;
  sortDefault: string;
  sortAsc: string;
  sortDesc: string;
  onlyNew: string;
  onlyFav: string;
  fav: string;
  unfav: string;
  noResults: string;
  preview: string;
  previewHint: string;
  petPick: string;
  close: string;
  bundlesTitle: string;
  bundlesHint: string;
  bundleSave: string; // {n}
  bundleBuy: string;
  bundleOwned: string;
  bundleBought: string; // {name}
  gift: string;
  giftTitle: string; // {name}
  giftHint: string;
  giftEmail: string;
  giftSend: string; // {n}
  giftSent: string; // {name}
  cancel: string;
  historyTitle: string;
  historyHint: string;
  historyEmpty: string;
  historyBuy: string; // {name}
  historyBundle: string; // {name}
  historyGift: string; // {name} {who}
  historyReceived: string; // {name}
  historyUnknown: string;
  errors: Record<"recipient-unavailable" | "self-gift" | "bad-email", string>;
};

const cs: ShopExtraText = {
  dealsTitle: "Dnešní nabídka",
  dealsHint: "Každý den jiné zboží s 30% slevou.",
  resetsIn: "Končí za {t}",
  search: "Hledat v obchodě…",
  sortDefault: "Výchozí řazení",
  sortAsc: "Nejlevnější",
  sortDesc: "Nejdražší",
  onlyNew: "Jen co nemám",
  onlyFav: "Jen oblíbené",
  fav: "Přidat do oblíbených",
  unfav: "Odebrat z oblíbených",
  noResults: "Nic jsme nenašli. Zkus upravit hledání nebo filtry.",
  preview: "Náhled",
  previewHint: "Takto to bude vypadat u tebe.",
  petPick: "Mazlíček",
  close: "Zavřít",
  bundlesTitle: "Výhodné sady",
  bundlesHint: "Víc věcí najednou o čtvrtinu levněji. Co už máš, se nepočítá.",
  bundleSave: "Ušetříš {n} bodů",
  bundleBuy: "Koupit sadu",
  bundleOwned: "Celou sadu už máš",
  bundleBought: "Koupeno: {name}",
  gift: "Darovat",
  giftTitle: "Darovat: {name}",
  giftHint: "Zadej e-mail kamaráda, který tu má účet. Dárek se mu objeví v profilu a body zaplatíš ty.",
  giftEmail: "E-mail kamaráda",
  giftSend: "Darovat za {n} bodů",
  giftSent: "Dárek odeslán: {name}",
  cancel: "Zrušit",
  historyTitle: "Historie nákupů",
  historyHint: "Tvých posledních 100 nákupů a dárků.",
  historyEmpty: "Zatím jsi nic nekoupil/a. První nákup se tu objeví hned.",
  historyBuy: "Koupeno: {name}",
  historyBundle: "Sada: {name}",
  historyGift: "Dárek pro {who}: {name}",
  historyReceived: "Dostal/a jsi dárek: {name}",
  historyUnknown: "Starší zboží",
  errors: {
    "recipient-unavailable": "Tomuto účtu se dárek poslat nedá. Zkontroluj e-mail, nebo to zboží už možná má.",
    "self-gift": "Sám sobě darovat nemůžeš, kup si to rovnou.",
    "bad-email": "Zadej platný e-mail.",
  },
};

const en: ShopExtraText = {
  dealsTitle: "Today's deals",
  dealsHint: "Different items every day, 30% off.",
  resetsIn: "Ends in {t}",
  search: "Search the shop…",
  sortDefault: "Default order",
  sortAsc: "Cheapest first",
  sortDesc: "Most expensive first",
  onlyNew: "Only what I don't have",
  onlyFav: "Only favorites",
  fav: "Add to favorites",
  unfav: "Remove from favorites",
  noResults: "Nothing found. Try changing your search or filters.",
  preview: "Preview",
  previewHint: "This is how it will look for you.",
  petPick: "Pet",
  close: "Close",
  bundlesTitle: "Value sets",
  bundlesHint: "Several items at once, a quarter cheaper. What you already own is not counted.",
  bundleSave: "You save {n} points",
  bundleBuy: "Buy set",
  bundleOwned: "You already have the whole set",
  bundleBought: "Bought: {name}",
  gift: "Gift",
  giftTitle: "Gift: {name}",
  giftHint: "Enter the email of a friend with an account here. The gift appears in their profile and you pay the points.",
  giftEmail: "Friend's email",
  giftSend: "Gift for {n} points",
  giftSent: "Gift sent: {name}",
  cancel: "Cancel",
  historyTitle: "Purchase history",
  historyHint: "Your last 100 purchases and gifts.",
  historyEmpty: "You haven't bought anything yet. Your first purchase will show up here.",
  historyBuy: "Bought: {name}",
  historyBundle: "Set: {name}",
  historyGift: "Gift for {who}: {name}",
  historyReceived: "You received a gift: {name}",
  historyUnknown: "Older item",
  errors: {
    "recipient-unavailable": "This account can't receive the gift. Check the email, or they may already own the item.",
    "self-gift": "You can't gift to yourself, just buy it.",
    "bad-email": "Enter a valid email.",
  },
};

const de: ShopExtraText = {
  dealsTitle: "Angebote des Tages",
  dealsHint: "Jeden Tag andere Artikel mit 30 % Rabatt.",
  resetsIn: "Endet in {t}",
  search: "Im Shop suchen…",
  sortDefault: "Standardreihenfolge",
  sortAsc: "Günstigste zuerst",
  sortDesc: "Teuerste zuerst",
  onlyNew: "Nur was ich nicht habe",
  onlyFav: "Nur Favoriten",
  fav: "Zu Favoriten hinzufügen",
  unfav: "Aus Favoriten entfernen",
  noResults: "Nichts gefunden. Ändere die Suche oder die Filter.",
  preview: "Vorschau",
  previewHint: "So sieht es bei dir aus.",
  petPick: "Haustier",
  close: "Schließen",
  bundlesTitle: "Spar-Sets",
  bundlesHint: "Mehrere Artikel auf einmal, ein Viertel günstiger. Was du schon hast, zählt nicht.",
  bundleSave: "Du sparst {n} Punkte",
  bundleBuy: "Set kaufen",
  bundleOwned: "Du hast das ganze Set schon",
  bundleBought: "Gekauft: {name}",
  gift: "Verschenken",
  giftTitle: "Verschenken: {name}",
  giftHint: "Gib die E-Mail eines Freundes mit Konto ein. Das Geschenk erscheint in seinem Profil, du zahlst die Punkte.",
  giftEmail: "E-Mail des Freundes",
  giftSend: "Für {n} Punkte verschenken",
  giftSent: "Geschenk gesendet: {name}",
  cancel: "Abbrechen",
  historyTitle: "Kaufverlauf",
  historyHint: "Deine letzten 100 Käufe und Geschenke.",
  historyEmpty: "Du hast noch nichts gekauft. Dein erster Kauf erscheint hier.",
  historyBuy: "Gekauft: {name}",
  historyBundle: "Set: {name}",
  historyGift: "Geschenk für {who}: {name}",
  historyReceived: "Du hast ein Geschenk bekommen: {name}",
  historyUnknown: "Älterer Artikel",
  errors: {
    "recipient-unavailable": "Dieses Konto kann das Geschenk nicht erhalten. Prüfe die E-Mail, oder der Artikel ist schon vorhanden.",
    "self-gift": "Du kannst dir nichts selbst schenken, kauf es einfach.",
    "bad-email": "Gib eine gültige E-Mail ein.",
  },
};

const ru: ShopExtraText = {
  dealsTitle: "Предложения дня",
  dealsHint: "Каждый день другие товары со скидкой 30 %.",
  resetsIn: "Закончится через {t}",
  search: "Поиск в магазине…",
  sortDefault: "По умолчанию",
  sortAsc: "Сначала дешёвые",
  sortDesc: "Сначала дорогие",
  onlyNew: "Только чего нет",
  onlyFav: "Только избранное",
  fav: "В избранное",
  unfav: "Убрать из избранного",
  noResults: "Ничего не найдено. Измени поиск или фильтры.",
  preview: "Просмотр",
  previewHint: "Так это будет выглядеть у тебя.",
  petPick: "Питомец",
  close: "Закрыть",
  bundlesTitle: "Выгодные наборы",
  bundlesHint: "Несколько вещей сразу на четверть дешевле. То, что уже есть, не считается.",
  bundleSave: "Ты сэкономишь {n} очков",
  bundleBuy: "Купить набор",
  bundleOwned: "Весь набор уже у тебя",
  bundleBought: "Куплено: {name}",
  gift: "Подарить",
  giftTitle: "Подарить: {name}",
  giftHint: "Введи e-mail друга с аккаунтом. Подарок появится в его профиле, очки спишутся у тебя.",
  giftEmail: "E-mail друга",
  giftSend: "Подарить за {n} очков",
  giftSent: "Подарок отправлен: {name}",
  cancel: "Отмена",
  historyTitle: "История покупок",
  historyHint: "Твои последние 100 покупок и подарков.",
  historyEmpty: "Ты пока ничего не купил. Первая покупка появится здесь.",
  historyBuy: "Куплено: {name}",
  historyBundle: "Набор: {name}",
  historyGift: "Подарок для {who}: {name}",
  historyReceived: "Тебе подарили: {name}",
  historyUnknown: "Старый товар",
  errors: {
    "recipient-unavailable": "Этот аккаунт не может получить подарок. Проверь e-mail, возможно, вещь уже есть.",
    "self-gift": "Нельзя дарить себе, просто купи.",
    "bad-email": "Введи корректный e-mail.",
  },
};

const TEXTS: Record<Locale, ShopExtraText> = { cs, en, de, ru };

export function getShopExtraText(locale: Locale): ShopExtraText {
  return TEXTS[locale] ?? cs;
}
