import { withFallbacks } from "./config";
import type { Locale } from "./config";

// Záložka Banka v Ekonomice: popisky a názvy akcí do historie transakcí.
export type EconomyBankText = {
  tab: string;
  nav: { overview: string; work: string; companies: string; invest: string; board: string };
  income: string;
  expenses: string;
  perHour: string;
  perDay: string;
  budget: string;
  chartName: string;
  sources: { salary: string; companies: string; passive: string; living: string; costs: string };
  balance: string;
  goal: string;
  goalOf: string;
  net: string;
  quick: string;
  history: string;
  historyHint: string;
  filters: { all: string; income: string; spend: string };
  filterBtn: string;
  empty: string;
  wealth: string;
  chips: { cash: string; assets: string };
  actions: Record<string, string>;
};

const cs: EconomyBankText = {
  tab: "🏦 Banka",
  nav: { overview: "Přehled", work: "Práce", companies: "Firmy", invest: "Investice", board: "Žebříček" },
  income: "Příjmy",
  expenses: "Výdaje",
  perHour: "za hodinu",
  perDay: "za den",
  budget: "Rozpočet za hodinu",
  chartName: "Za hodinu",
  sources: { salary: "Mzda", companies: "Firmy", passive: "Pasivní", living: "Život", costs: "Provoz" },
  balance: "Celkový zůstatek",
  goal: "Můj cíl",
  goalOf: "z rekordu",
  net: "Za den",
  quick: "Přejít na",
  history: "Historie transakcí",
  historyHint: "Tato návštěva",
  filters: { all: "Vše", income: "Příjmy", spend: "Výdaje" },
  filterBtn: "Filtr",
  empty: "Zatím žádné transakce. Nakup, prodej nebo jdi na směnu.",
  wealth: "JMĚNÍ",
  chips: { cash: "Hotovost", assets: "Majetek" },
  actions: {
    buyCompany: "Nákup firmy", sellCompany: "Prodej firmy", upgradeCompany: "Vylepšení firmy", hireStaff: "Nový zaměstnanec", researchCompany: "Výzkum firmy",
    runCampaign: "Kampaň", buyAsset: "Nákup investice", sellAsset: "Prodej investice", buyStock: "Nákup akcií", buyNeed: "Nákup potřeb",
    startShift: "Směna", startVacation: "Dovolená", investEdu: "Vzdělání", exchange: "Směna bodů", startHustle: "Vedlejší výdělek",
    topUpHustle: "Vedlejší výdělek", decideHustle: "Vedlejší výdělek", arbitrage: "Arbitráž", placeOrder: "Příkaz", signContract: "Smlouva", other: "Transakce",
  },
};

const en: EconomyBankText = {
  tab: "🏦 Bank",
  nav: { overview: "Overview", work: "Work", companies: "Companies", invest: "Investing", board: "Leaderboard" },
  income: "Income",
  expenses: "Expenses",
  perHour: "per hour",
  perDay: "per day",
  budget: "Budget per hour",
  chartName: "Per hour",
  sources: { salary: "Salary", companies: "Companies", passive: "Passive", living: "Living", costs: "Running" },
  balance: "Total balance",
  goal: "My goal",
  goalOf: "of record",
  net: "Per day",
  quick: "Go to",
  history: "Transaction history",
  historyHint: "This visit",
  filters: { all: "All", income: "Income", spend: "Spending" },
  filterBtn: "Filter",
  empty: "No transactions yet. Buy, sell or take a shift.",
  wealth: "NET WORTH",
  chips: { cash: "Cash", assets: "Assets" },
  actions: {
    buyCompany: "Bought a company", sellCompany: "Sold a company", upgradeCompany: "Company upgrade", hireStaff: "New employee", researchCompany: "Company research",
    runCampaign: "Campaign", buyAsset: "Bought an investment", sellAsset: "Sold an investment", buyStock: "Bought stocks", buyNeed: "Bought supplies",
    startShift: "Shift", startVacation: "Vacation", investEdu: "Education", exchange: "Points exchange", startHustle: "Side hustle",
    topUpHustle: "Side hustle", decideHustle: "Side hustle", arbitrage: "Arbitrage", placeOrder: "Order", signContract: "Contract", other: "Transaction",
  },
};

const all = withFallbacks({ cs, en, de: en, ru: en });

export function getEconomyBankText(locale: Locale): EconomyBankText {
  return all[locale];
}
