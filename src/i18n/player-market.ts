import type { Locale } from "./config";

// Texty trhu mezi hráči (components/PlayerMarket).
export type PlayerMarketText = {
  open: string;
  title: string;
  tabs: { offers: string; mine: string; sell: string; history: string };
  intro: string;
  empty: string;
  mineEmpty: string;
  sellEmpty: string;
  seller: string; // {name}
  buy: string;
  cancel: string;
  list: string;
  price: string;
  youGet: string; // {n}
  fee: string; // {p}
  owned: string;
  login: string;
  errors: Record<string, string>;
  done: { list: string; cancel: string; buy: string };
  limit: string; // {n}
  hist: { empty: string; balance: string; bought: string; sold: string; swapped: string; fee: string }; // {n}, {name}, {got}, {gave}
  cats: { all: string; avatar: string; title: string; frame: string; banner: string };
  more: { sortNew: string; sortLow: string; sortHigh: string; emptyCat: string; pick: string; seller: string };
  swap: { sell: string; swap: string; want: string; wants: string; button: string; done: string; free: string }; // wants: {name}
};

const cs: PlayerMarketText = {
  open: "🤝 Trh hráčů",
  title: "Trh hráčů",
  tabs: { offers: "Nabídky", mine: "Moje nabídky", sell: "Prodat", history: "Historie" },
  intro: "Prodávej věci, které nenosíš, a kupuj od ostatních. Vystavená věc je ve výloze, dokud ji někdo nekoupí nebo ji nestáhneš.",
  empty: "Zatím tu nikdo nic neprodává.",
  mineEmpty: "Nic neprodáváš.",
  sellEmpty: "Nemáš žádnou věc, kterou by šlo prodat (nošené věci prodat nejde).",
  seller: "Prodává {name}",
  buy: "Koupit",
  cancel: "Stáhnout",
  list: "Vystavit",
  price: "Cena",
  youGet: "Dostaneš {n} 🪙",
  fee: "Trh si bere {p} %.",
  owned: "Už máš",
  login: "Pro trh se přihlas.",
  errors: { "not-owned": "Nemáš věc, kterou prodávající chce.", "seller-owns": "Prodávající už tuhle věc má.", parental: "Nákupy zakázal rodič v nastavení.", "not-enough-points": "Nemáš dost bodů.", owned: "Tuhle věc už máš.", gone: "Nabídka už není k mání.", equipped: "Nošenou věc nejde prodat.", "too-many": "Víc nabídek najednou mít nemůžeš.", "bad-price": "Takovou cenu nejde nastavit.", x: "Něco se nepovedlo, zkus to znovu." },
  done: { list: "Věc je ve výloze.", cancel: "Věc je zpátky u tebe.", buy: "Koupeno!" },
  limit: "Najednou můžeš mít nejvýš {n} nabídek.",
  hist: { empty: "Zatím žádné obchody.", balance: "Máš {n} 🪙", bought: "Koupeno: {name}", sold: "Prodáno: {name}", swapped: "Výměna: {got} za {gave}", fee: "Poplatek z prodeje: {name}" },
  cats: { all: "Vše", avatar: "Avatary", title: "Tituly", frame: "Rámečky", banner: "Pozadí" },
  more: { sortNew: "Nejnovější", sortLow: "Nejlevnější", sortHigh: "Nejdražší", emptyCat: "V této kategorii nic není.", pick: "Vyber věc, kterou chceš prodat nebo vyměnit.", seller: "Prodejce" },
  swap: { sell: "Za body", swap: "Výměna", want: "Chci výměnou za", wants: "Chce: {name}", button: "Vyměnit", done: "Vyměněno!", free: "Výměna je bez poplatku." },
};
const en: PlayerMarketText = {
  open: "🤝 Player market",
  title: "Player market",
  tabs: { offers: "Offers", mine: "My offers", sell: "Sell", history: "History" },
  intro: "Sell things you don't wear and buy from others. A listed item stays in the shop window until someone buys it or you take it back.",
  empty: "Nobody is selling anything yet.",
  mineEmpty: "You're not selling anything.",
  sellEmpty: "You have nothing you can sell (items you wear can't be sold).",
  seller: "Sold by {name}",
  buy: "Buy",
  cancel: "Take back",
  list: "List",
  price: "Price",
  youGet: "You get {n} 🪙",
  fee: "The market keeps {p}%.",
  owned: "Owned",
  login: "Log in to use the market.",
  errors: { "not-owned": "You don't have the item the seller wants.", "seller-owns": "The seller already has that item.", parental: "A parent has blocked purchases in settings.", "not-enough-points": "Not enough points.", owned: "You already have this.", gone: "That offer is gone.", equipped: "You can't sell an item you're wearing.", "too-many": "You can't have more offers at once.", "bad-price": "That price isn't allowed.", x: "Something went wrong, try again." },
  done: { list: "Your item is in the window.", cancel: "The item is back with you.", buy: "Bought!" },
  limit: "You can have at most {n} offers at once.",
  hist: { empty: "No trades yet.", balance: "You have {n} 🪙", bought: "Bought: {name}", sold: "Sold: {name}", swapped: "Swap: {got} for {gave}", fee: "Sale fee: {name}" },
  cats: { all: "All", avatar: "Avatars", title: "Titles", frame: "Frames", banner: "Banners" },
  more: { sortNew: "Newest", sortLow: "Cheapest", sortHigh: "Most expensive", emptyCat: "Nothing in this category.", pick: "Pick an item to sell or swap.", seller: "Seller" },
  swap: { sell: "For points", swap: "Swap", want: "I want in return", wants: "Wants: {name}", button: "Swap", done: "Swapped!", free: "Swaps have no fee." },
};
const de: PlayerMarketText = {
  open: "🤝 Spielermarkt",
  title: "Spielermarkt",
  tabs: { offers: "Angebote", mine: "Meine Angebote", sell: "Verkaufen", history: "Verlauf" },
  intro: "Verkaufe Dinge, die du nicht trägst, und kaufe von anderen. Ein angebotener Gegenstand liegt im Schaufenster, bis ihn jemand kauft oder du ihn zurücknimmst.",
  empty: "Noch verkauft niemand etwas.",
  mineEmpty: "Du verkaufst nichts.",
  sellEmpty: "Du hast nichts, was du verkaufen kannst (getragene Dinge gehen nicht).",
  seller: "Verkauft von {name}",
  buy: "Kaufen",
  cancel: "Zurücknehmen",
  list: "Anbieten",
  price: "Preis",
  youGet: "Du bekommst {n} 🪙",
  fee: "Der Markt behält {p} %.",
  owned: "Schon da",
  login: "Melde dich für den Markt an.",
  errors: { "not-owned": "Du hast den Gegenstand nicht, den der Verkäufer will.", "seller-owns": "Der Verkäufer hat das schon.", parental: "Käufe wurden von den Eltern gesperrt.", "not-enough-points": "Nicht genug Punkte.", owned: "Das hast du schon.", gone: "Das Angebot ist weg.", equipped: "Getragene Dinge kann man nicht verkaufen.", "too-many": "Mehr Angebote gleichzeitig gehen nicht.", "bad-price": "Dieser Preis ist nicht erlaubt.", x: "Etwas ist schiefgegangen, versuch es nochmal." },
  done: { list: "Dein Gegenstand liegt im Schaufenster.", cancel: "Der Gegenstand ist wieder bei dir.", buy: "Gekauft!" },
  limit: "Du kannst höchstens {n} Angebote gleichzeitig haben.",
  hist: { empty: "Noch keine Geschäfte.", balance: "Du hast {n} 🪙", bought: "Gekauft: {name}", sold: "Verkauft: {name}", swapped: "Tausch: {got} gegen {gave}", fee: "Verkaufsgebühr: {name}" },
  cats: { all: "Alle", avatar: "Avatare", title: "Titel", frame: "Rahmen", banner: "Hintergründe" },
  more: { sortNew: "Neueste", sortLow: "Günstigste", sortHigh: "Teuerste", emptyCat: "Nichts in dieser Kategorie.", pick: "Wähle einen Gegenstand zum Verkaufen oder Tauschen.", seller: "Verkäufer" },
  swap: { sell: "Für Punkte", swap: "Tausch", want: "Ich möchte dafür", wants: "Möchte: {name}", button: "Tauschen", done: "Getauscht!", free: "Tauschen kostet keine Gebühr." },
};
const ru: PlayerMarketText = {
  open: "🤝 Рынок игроков",
  title: "Рынок игроков",
  tabs: { offers: "Предложения", mine: "Мои предложения", sell: "Продать", history: "История" },
  intro: "Продавай то, что не носишь, и покупай у других. Выставленная вещь лежит на витрине, пока её не купят или ты её не снимешь.",
  empty: "Пока никто ничего не продаёт.",
  mineEmpty: "Ты ничего не продаёшь.",
  sellEmpty: "Тебе нечего продать (то, что надето, продать нельзя).",
  seller: "Продаёт {name}",
  buy: "Купить",
  cancel: "Снять",
  list: "Выставить",
  price: "Цена",
  youGet: "Ты получишь {n} 🪙",
  fee: "Рынок берёт {p} %.",
  owned: "Уже есть",
  login: "Войди, чтобы пользоваться рынком.",
  errors: { "not-owned": "У тебя нет вещи, которую хочет продавец.", "seller-owns": "У продавца это уже есть.", parental: "Покупки запрещены родителем.", "not-enough-points": "Не хватает баллов.", owned: "У тебя это уже есть.", gone: "Предложение уже недоступно.", equipped: "Надетую вещь продать нельзя.", "too-many": "Больше предложений одновременно нельзя.", "bad-price": "Такую цену поставить нельзя.", x: "Что-то пошло не так, попробуй ещё раз." },
  done: { list: "Вещь на витрине.", cancel: "Вещь снова у тебя.", buy: "Куплено!" },
  limit: "Одновременно можно иметь не больше {n} предложений.",
  hist: { empty: "Сделок пока нет.", balance: "У тебя {n} 🪙", bought: "Куплено: {name}", sold: "Продано: {name}", swapped: "Обмен: {got} на {gave}", fee: "Комиссия с продажи: {name}" },
  cats: { all: "Все", avatar: "Аватары", title: "Титулы", frame: "Рамки", banner: "Фоны" },
  more: { sortNew: "Новые", sortLow: "Дешёвые", sortHigh: "Дорогие", emptyCat: "В этой категории пусто.", pick: "Выбери вещь, чтобы продать или обменять.", seller: "Продавец" },
  swap: { sell: "За баллы", swap: "Обмен", want: "Хочу взамен", wants: "Хочет: {name}", button: "Обменять", done: "Обменено!", free: "Обмен без комиссии." },
};
const texts: Record<Locale, PlayerMarketText> = { cs, en, de, ru };
export const getPlayerMarketText = (locale: Locale) => texts[locale];
