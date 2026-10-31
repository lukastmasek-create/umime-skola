import type { Locale } from "./config";

// Texty trhu mezi hráči (components/PlayerMarket).
export type PlayerMarketText = {
  open: string;
  title: string;
  tabs: { offers: string; mine: string; sell: string };
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
};

const cs: PlayerMarketText = {
  open: "🤝 Trh hráčů",
  title: "Trh hráčů",
  tabs: { offers: "Nabídky", mine: "Moje nabídky", sell: "Prodat" },
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
  errors: { parental: "Nákupy zakázal rodič v nastavení.", "not-enough-points": "Nemáš dost bodů.", owned: "Tuhle věc už máš.", gone: "Nabídka už není k mání.", equipped: "Nošenou věc nejde prodat.", "too-many": "Víc nabídek najednou mít nemůžeš.", "bad-price": "Takovou cenu nejde nastavit.", x: "Něco se nepovedlo, zkus to znovu." },
  done: { list: "Věc je ve výloze.", cancel: "Věc je zpátky u tebe.", buy: "Koupeno!" },
  limit: "Najednou můžeš mít nejvýš {n} nabídek.",
};
const en: PlayerMarketText = {
  open: "🤝 Player market",
  title: "Player market",
  tabs: { offers: "Offers", mine: "My offers", sell: "Sell" },
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
  errors: { parental: "A parent has blocked purchases in settings.", "not-enough-points": "Not enough points.", owned: "You already have this.", gone: "That offer is gone.", equipped: "You can't sell an item you're wearing.", "too-many": "You can't have more offers at once.", "bad-price": "That price isn't allowed.", x: "Something went wrong, try again." },
  done: { list: "Your item is in the window.", cancel: "The item is back with you.", buy: "Bought!" },
  limit: "You can have at most {n} offers at once.",
};
const de: PlayerMarketText = {
  open: "🤝 Spielermarkt",
  title: "Spielermarkt",
  tabs: { offers: "Angebote", mine: "Meine Angebote", sell: "Verkaufen" },
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
  errors: { parental: "Käufe wurden von den Eltern gesperrt.", "not-enough-points": "Nicht genug Punkte.", owned: "Das hast du schon.", gone: "Das Angebot ist weg.", equipped: "Getragene Dinge kann man nicht verkaufen.", "too-many": "Mehr Angebote gleichzeitig gehen nicht.", "bad-price": "Dieser Preis ist nicht erlaubt.", x: "Etwas ist schiefgegangen, versuch es nochmal." },
  done: { list: "Dein Gegenstand liegt im Schaufenster.", cancel: "Der Gegenstand ist wieder bei dir.", buy: "Gekauft!" },
  limit: "Du kannst höchstens {n} Angebote gleichzeitig haben.",
};
const ru: PlayerMarketText = {
  open: "🤝 Рынок игроков",
  title: "Рынок игроков",
  tabs: { offers: "Предложения", mine: "Мои предложения", sell: "Продать" },
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
  errors: { parental: "Покупки запрещены родителем.", "not-enough-points": "Не хватает баллов.", owned: "У тебя это уже есть.", gone: "Предложение уже недоступно.", equipped: "Надетую вещь продать нельзя.", "too-many": "Больше предложений одновременно нельзя.", "bad-price": "Такую цену поставить нельзя.", x: "Что-то пошло не так, попробуй ещё раз." },
  done: { list: "Вещь на витрине.", cancel: "Вещь снова у тебя.", buy: "Куплено!" },
  limit: "Одновременно можно иметь не больше {n} предложений.",
};
const texts: Record<Locale, PlayerMarketText> = { cs, en, de, ru };
export const getPlayerMarketText = (locale: Locale) => texts[locale];
