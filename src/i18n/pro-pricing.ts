import type { Locale } from "./config";

// Popisky přepínače cen UčímePRO. Čísla se počítají z cen, nic tu není vymyšlené.
export type PricingLabels = {
  monthly: string; yearly: string; best: string; perMonth: string; perYear: string;
  perMonthEq: string; saves: string; perMember: string; schoolPerYear: string;
};

const cs: PricingLabels = { monthly: "Měsíčně", yearly: "Ročně", best: "Nejvýhodnější na člena", perMonth: "měsíčně", perYear: "ročně", perMonthEq: "to je asi {n} měsíčně", saves: "ušetříš {n}", perMember: "při 5 členech {n} na člena", schoolPerYear: "ročně za školu" };
const en: PricingLabels = { monthly: "Monthly", yearly: "Yearly", best: "Best value per member", perMonth: "per month", perYear: "per year", perMonthEq: "about {n} a month", saves: "you save {n}", perMember: "with 5 members {n} each", schoolPerYear: "per year per school" };
const de: PricingLabels = { monthly: "Monatlich", yearly: "Jährlich", best: "Bester Preis pro Mitglied", perMonth: "pro Monat", perYear: "pro Jahr", perMonthEq: "etwa {n} im Monat", saves: "du sparst {n}", perMember: "bei 5 Mitgliedern {n} pro Person", schoolPerYear: "pro Jahr und Schule" };
const ru: PricingLabels = { monthly: "В месяц", yearly: "В год", best: "Выгоднее всего на человека", perMonth: "в месяц", perYear: "в год", perMonthEq: "примерно {n} в месяц", saves: "экономия {n}", perMember: "при 5 участниках {n} на человека", schoolPerYear: "в год за школу" };
const uk: PricingLabels = { monthly: "Щомісяця", yearly: "Щороку", best: "Найвигідніше на людину", perMonth: "на місяць", perYear: "на рік", perMonthEq: "приблизно {n} на місяць", saves: "економія {n}", perMember: "при 5 учасниках {n} на людину", schoolPerYear: "на рік за школу" };

const byLocale: Partial<Record<Locale, PricingLabels>> = { cs, en, de, ru, uk };
export function getPricingLabels(locale: Locale): PricingLabels {
  return byLocale[locale] ?? en;
}
