import type { Locale } from "./config";
import type { NeedId } from "@/lib/idle/economy";

// Texty záložky Potřeby (jídlo, pití, oblečení a další běžné věci, které se kupují v obchodě).
// Zástupné znaky {n}, {p} doplní UI.
export type NeedsText = {
  title: string;
  intro: string;
  dailyCost: string;
  penalty: string;
  noPenalty: string;
  days: string;
  empty: string;
  full: string;
  buyDay: string;
  fill: string;
  bought: string;
  essential: string;
  common: string;
  hunger: string;
  perDay: string;
  items: Record<NeedId, { name: string; hint: string }>;
};

const cs: NeedsText = {
  title: "Životní potřeby",
  intro: "Potřeby si kupuj v předstihu, na pár dní dopředu. Každý den zásoba ubývá. Když je zásoba prázdná, výdělek klesá.",
  dailyCost: "Denní náklady celkem: {p}",
  penalty: "Kvůli prázdným zásobám je výdělek o {p} % nižší.",
  noPenalty: "Všechno máš na skladě, výdělek je plný.",
  days: "{n} d.",
  empty: "Došlo",
  full: "Plná zásoba",
  buyDay: "+1 den",
  fill: "Doplnit na {n} d.",
  bought: "Nakoupeno.",
  essential: "Nezbytné",
  common: "Běžné",
  hunger: "Bez jídla nebo pití se energie dobíjí jen napůl.",
  perDay: "{p} / den",
  items: {
    food: { name: "Jídlo", hint: "Snídaně, oběd, večeře. Bez něj klesá výdělek." },
    drink: { name: "Pití", hint: "Voda, káva, čaj. Bez něj klesá výdělek a energie." },
    clothing: { name: "Oblečení", hint: "Prádlo, boty, něco do práce i ven." },
    housing: { name: "Bydlení a účty", hint: "Nájem, energie, voda, internet." },
    transport: { name: "Doprava", hint: "MHD, benzín nebo údržba auta." },
    health: { name: "Hygiena a zdraví", hint: "Drogerie, léky, návštěva lékaře." },
    leisure: { name: "Zábava a volný čas", hint: "Kino, kavárna, koníčky." },
  },
};

const en: NeedsText = {
  title: "Living needs",
  intro: "Buy your needs ahead, a few days at a time. Each day the stock runs down. When a stock is empty, your earnings drop.",
  dailyCost: "Total daily cost: {p}",
  penalty: "Because of empty stock your earnings are {p} % lower.",
  noPenalty: "Everything is in stock, earnings are at full.",
  days: "{n} d",
  empty: "Out",
  full: "Full stock",
  buyDay: "+1 day",
  fill: "Top up to {n} d",
  bought: "Bought.",
  essential: "Essential",
  common: "Common",
  hunger: "Without food or drink, energy recovers only half as fast.",
  perDay: "{p} / day",
  items: {
    food: { name: "Food", hint: "Breakfast, lunch, dinner. Without it earnings drop." },
    drink: { name: "Drinks", hint: "Water, coffee, tea. Without it earnings and energy drop." },
    clothing: { name: "Clothing", hint: "Underwear, shoes, something for work and outside." },
    housing: { name: "Housing and bills", hint: "Rent, power, water, internet." },
    transport: { name: "Transport", hint: "Public transport, fuel or car upkeep." },
    health: { name: "Hygiene and health", hint: "Toiletries, medicine, a doctor's visit." },
    leisure: { name: "Leisure", hint: "Cinema, café, hobbies." },
  },
};

const de: NeedsText = {
  title: "Lebensbedarf",
  intro: "Kaufe den Bedarf im Voraus, für ein paar Tage. Jeden Tag sinkt der Vorrat. Ist ein Vorrat leer, sinkt dein Verdienst.",
  dailyCost: "Tägliche Gesamtkosten: {p}",
  penalty: "Wegen leerer Vorräte ist dein Verdienst um {p} % niedriger.",
  noPenalty: "Alles ist vorrätig, der Verdienst ist voll.",
  days: "{n} T",
  empty: "Leer",
  full: "Voller Vorrat",
  buyDay: "+1 Tag",
  fill: "Auf {n} T auffüllen",
  bought: "Gekauft.",
  essential: "Unverzichtbar",
  common: "Üblich",
  hunger: "Ohne Essen oder Trinken erholt sich die Energie nur halb so schnell.",
  perDay: "{p} / Tag",
  items: {
    food: { name: "Essen", hint: "Frühstück, Mittag, Abendessen. Ohne sinkt der Verdienst." },
    drink: { name: "Getränke", hint: "Wasser, Kaffee, Tee. Ohne sinken Verdienst und Energie." },
    clothing: { name: "Kleidung", hint: "Unterwäsche, Schuhe, etwas für die Arbeit und draußen." },
    housing: { name: "Wohnen und Rechnungen", hint: "Miete, Strom, Wasser, Internet." },
    transport: { name: "Verkehr", hint: "Öffentliche Verkehrsmittel, Sprit oder Auto-Unterhalt." },
    health: { name: "Hygiene und Gesundheit", hint: "Drogerie, Medikamente, Arztbesuch." },
    leisure: { name: "Freizeit", hint: "Kino, Café, Hobbys." },
  },
};

const ru: NeedsText = {
  title: "Жизненные нужды",
  intro: "Покупай нужды заранее, на несколько дней. Каждый день запас уменьшается. Когда запас пуст, заработок падает.",
  dailyCost: "Всего в день: {p}",
  penalty: "Из-за пустых запасов заработок ниже на {p} %.",
  noPenalty: "Всё есть в запасе, заработок полный.",
  days: "{n} дн.",
  empty: "Нет",
  full: "Запас полный",
  buyDay: "+1 день",
  fill: "Пополнить до {n} дн.",
  bought: "Куплено.",
  essential: "Необходимо",
  common: "Обычное",
  hunger: "Без еды или питья энергия восстанавливается вдвое медленнее.",
  perDay: "{p} / день",
  items: {
    food: { name: "Еда", hint: "Завтрак, обед, ужин. Без неё заработок падает." },
    drink: { name: "Напитки", hint: "Вода, кофе, чай. Без них падают заработок и энергия." },
    clothing: { name: "Одежда", hint: "Бельё, обувь, что-нибудь для работы и улицы." },
    housing: { name: "Жильё и счета", hint: "Аренда, электричество, вода, интернет." },
    transport: { name: "Транспорт", hint: "Общественный транспорт, бензин или обслуживание машины." },
    health: { name: "Гигиена и здоровье", hint: "Средства гигиены, лекарства, визит к врачу." },
    leisure: { name: "Досуг", hint: "Кино, кафе, хобби." },
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
