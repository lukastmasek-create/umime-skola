import type { Locale } from "./config";
import type { BoostId, NeedId } from "@/lib/idle/economy";

// Texty záložky Potřeby (jídlo, pití, oblečení a další běžné věci, které se kupují v obchodě).
// Zástupné znaky {n}, {p} doplní UI.
export type NeedsText = {
  title: string;
  intro: string;
  dailyCost: string;
  emptyCount: string;
  allStocked: string;
  days: string;
  empty: string;
  full: string;
  buyDay: string;
  fill: string;
  bought: string;
  essential: string;
  common: string;
  perDay: string;
  items: Record<NeedId, { name: string; hint: string; effect: string }>;
  boostsTitle: string;
  boostsHint: string;
  boostLeft: string;
  boostNone: string;
  buyBoost: string;
  boosts: Record<BoostId, { name: string; effect: string }>;
};

const cs: NeedsText = {
  title: "Životní potřeby",
  intro: "Potřeby si kupuj v předstihu, na pár dní dopředu. Každý den zásoba ubývá. Když je zásoba prázdná, výdělek klesá.",
  dailyCost: "Denní náklady celkem: {p}",
  emptyCount: "Prázdné zásoby: {n}. Každá potřeba má jiný účinek, viz karty níž.",
  allStocked: "Všechno máš na skladě.",
  days: "{n} d.",
  empty: "Došlo",
  full: "Plná zásoba",
  buyDay: "+1 den",
  fill: "Doplnit na {n} d.",
  bought: "Nakoupeno.",
  essential: "Nezbytné",
  common: "Běžné",
  perDay: "{p} / den",
  items: {
    food: { name: "Jídlo", hint: "Snídaně, oběd, večeře.", effect: "Bez jídla se energie dobíjí jen napůl." },
    drink: { name: "Pití", hint: "Voda, káva, čaj.", effect: "Bez pití každou hodinu ubývá energie." },
    clothing: { name: "Oblečení", hint: "Prádlo, boty, něco do práce i ven.", effect: "Bez oblečení je výdělek o 15 % nižší." },
    housing: { name: "Bydlení a účty", hint: "Nájem, energie, voda, internet.", effect: "Bez zaplacení naskakují každý den pokuty v ceně nájmu." },
    transport: { name: "Doprava", hint: "MHD, benzín nebo údržba auta.", effect: "Bez dopravy jdeš na směnu pěšky, stojí to víc energie." },
    health: { name: "Hygiena a zdraví", hint: "Drogerie, léky, návštěva lékaře.", effect: "Bez péče o zdraví nejde energie nad 70 %." },
    leisure: { name: "Zábava a volný čas", hint: "Kino, kavárna, koníčky.", effect: "Bez zábavy se energie dobíjí o pětinu pomaleji." },
  },
  boostsTitle: "Spotřební zboží",
  boostsHint: "Jednorázový nákup s dočasným účinkem. Účinek se po čase sám vypne.",
  boostLeft: "Účinek ještě {t}",
  boostNone: "Teď žádný účinek.",
  buyBoost: "Koupit",
  boosts: {
    energy_drink: { name: "Energy drink", effect: "Dvojnásobné dobíjení energie na 30 min." },
    cinema: { name: "Kino", effect: "+10 % výdělku na 2 hodiny." },
  },
};

const en: NeedsText = {
  title: "Living needs",
  intro: "Buy your needs ahead, a few days at a time. Each day the stock runs down. When a stock is empty, your earnings drop.",
  dailyCost: "Total daily cost: {p}",
  emptyCount: "Empty stock: {n}. Each need has a different effect, see the cards below.",
  allStocked: "Everything is in stock.",
  days: "{n} d",
  empty: "Out",
  full: "Full stock",
  buyDay: "+1 day",
  fill: "Top up to {n} d",
  bought: "Bought.",
  essential: "Essential",
  common: "Common",
  perDay: "{p} / day",
  items: {
    food: { name: "Food", hint: "Breakfast, lunch, dinner.", effect: "Without food, energy recovers only half as fast." },
    drink: { name: "Drinks", hint: "Water, coffee, tea.", effect: "Without drinks, energy drains every hour." },
    clothing: { name: "Clothing", hint: "Underwear, shoes, something for work and outside.", effect: "Without clothing, earnings are 15 % lower." },
    housing: { name: "Housing and bills", hint: "Rent, power, water, internet.", effect: "Unpaid bills add a daily fine equal to the rent." },
    transport: { name: "Transport", hint: "Public transport, fuel or car upkeep.", effect: "Without transport you walk to your shift, which costs more energy." },
    health: { name: "Hygiene and health", hint: "Toiletries, medicine, a doctor's visit.", effect: "Without health care, energy cannot go above 70 %." },
    leisure: { name: "Leisure", hint: "Cinema, café, hobbies.", effect: "Without leisure, energy recovers a fifth slower." },
  },
  boostsTitle: "Consumables",
  boostsHint: "One-off purchases with a temporary effect. The effect wears off by itself.",
  boostLeft: "Effect left: {t}",
  boostNone: "No effect right now.",
  buyBoost: "Buy",
  boosts: {
    energy_drink: { name: "Energy drink", effect: "Double energy recovery for 30 min." },
    cinema: { name: "Cinema", effect: "+10 % earnings for 2 hours." },
  },
};

const de: NeedsText = {
  title: "Lebensbedarf",
  intro: "Kaufe den Bedarf im Voraus, für ein paar Tage. Jeden Tag sinkt der Vorrat. Ist ein Vorrat leer, sinkt dein Verdienst.",
  dailyCost: "Tägliche Gesamtkosten: {p}",
  emptyCount: "Leere Vorräte: {n}. Jeder Bedarf wirkt anders, siehe Karten unten.",
  allStocked: "Alles ist vorrätig.",
  days: "{n} T",
  empty: "Leer",
  full: "Voller Vorrat",
  buyDay: "+1 Tag",
  fill: "Auf {n} T auffüllen",
  bought: "Gekauft.",
  essential: "Unverzichtbar",
  common: "Üblich",
  perDay: "{p} / Tag",
  items: {
    food: { name: "Essen", hint: "Frühstück, Mittag, Abendessen.", effect: "Ohne Essen erholt sich die Energie nur halb so schnell." },
    drink: { name: "Getränke", hint: "Wasser, Kaffee, Tee.", effect: "Ohne Getränke sinkt die Energie jede Stunde." },
    clothing: { name: "Kleidung", hint: "Unterwäsche, Schuhe, etwas für die Arbeit und draußen.", effect: "Ohne Kleidung ist der Verdienst um 15 % niedriger." },
    housing: { name: "Wohnen und Rechnungen", hint: "Miete, Strom, Wasser, Internet.", effect: "Unbezahlte Rechnungen bringen täglich eine Strafe in Höhe der Miete." },
    transport: { name: "Verkehr", hint: "Öffentliche Verkehrsmittel, Sprit oder Auto-Unterhalt.", effect: "Ohne Verkehrsmittel gehst du zu Fuß zur Schicht, das kostet mehr Energie." },
    health: { name: "Hygiene und Gesundheit", hint: "Drogerie, Medikamente, Arztbesuch.", effect: "Ohne Gesundheitspflege steigt die Energie nicht über 70 %." },
    leisure: { name: "Freizeit", hint: "Kino, Café, Hobbys.", effect: "Ohne Freizeit erholt sich die Energie um ein Fünftel langsamer." },
  },
  boostsTitle: "Verbrauchsgüter",
  boostsHint: "Einmalkäufe mit vorübergehender Wirkung. Die Wirkung endet von selbst.",
  boostLeft: "Wirkung noch {t}",
  boostNone: "Gerade keine Wirkung.",
  buyBoost: "Kaufen",
  boosts: {
    energy_drink: { name: "Energy-Drink", effect: "Doppelte Energieerholung für 30 Min." },
    cinema: { name: "Kino", effect: "+10 % Verdienst für 2 Stunden." },
  },
};

const ru: NeedsText = {
  title: "Жизненные нужды",
  intro: "Покупай нужды заранее, на несколько дней. Каждый день запас уменьшается. Когда запас пуст, заработок падает.",
  dailyCost: "Всего в день: {p}",
  emptyCount: "Пустых запасов: {n}. У каждой нужды свой эффект, см. карточки ниже.",
  allStocked: "Всё есть в запасе.",
  days: "{n} дн.",
  empty: "Нет",
  full: "Запас полный",
  buyDay: "+1 день",
  fill: "Пополнить до {n} дн.",
  bought: "Куплено.",
  essential: "Необходимо",
  common: "Обычное",
  perDay: "{p} / день",
  items: {
    food: { name: "Еда", hint: "Завтрак, обед, ужин.", effect: "Без еды энергия восстанавливается вдвое медленнее." },
    drink: { name: "Напитки", hint: "Вода, кофе, чай.", effect: "Без напитков энергия каждый час убывает." },
    clothing: { name: "Одежда", hint: "Бельё, обувь, что-нибудь для работы и улицы.", effect: "Без одежды заработок ниже на 15 %." },
    housing: { name: "Жильё и счета", hint: "Аренда, электричество, вода, интернет.", effect: "Неоплаченные счета каждый день добавляют штраф, равный аренде." },
    transport: { name: "Транспорт", hint: "Общественный транспорт, бензин или обслуживание машины.", effect: "Без транспорта идёшь на смену пешком, это стоит больше энергии." },
    health: { name: "Гигиена и здоровье", hint: "Средства гигиены, лекарства, визит к врачу.", effect: "Без заботы о здоровье энергия не поднимается выше 70 %." },
    leisure: { name: "Досуг", hint: "Кино, кафе, хобби.", effect: "Без досуга энергия восстанавливается на пятую часть медленнее." },
  },
  boostsTitle: "Расходники",
  boostsHint: "Разовые покупки с временным эффектом. Эффект проходит сам.",
  boostLeft: "Эффект ещё {t}",
  boostNone: "Сейчас эффекта нет.",
  buyBoost: "Купить",
  boosts: {
    energy_drink: { name: "Энергетик", effect: "Вдвое быстрее восстановление энергии на 30 мин." },
    cinema: { name: "Кино", effect: "+10 % заработка на 2 часа." },
  },
};

export function getEconomyNeeds(locale: Locale): NeedsText {
  switch (locale) {
    case "cs":
      return cs;
    case "de":
      return de;
    case "ru":
      return ru;
    default:
      return en;
  }
}
