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

const de: EconomyBankText = {
  tab: "🏦 Bank",
  nav: { overview: "Übersicht", work: "Arbeit", companies: "Firmen", invest: "Investitionen", board: "Rangliste" },
  income: "Einnahmen",
  expenses: "Ausgaben",
  perHour: "pro Stunde",
  perDay: "pro Tag",
  budget: "Budget pro Stunde",
  chartName: "Pro Stunde",
  sources: { salary: "Gehalt", companies: "Firmen", passive: "Passiv", living: "Leben", costs: "Betrieb" },
  balance: "Gesamtguthaben",
  goal: "Mein Ziel",
  goalOf: "von Rekord",
  net: "Pro Tag",
  quick: "Gehe zu",
  history: "Transaktionsverlauf",
  historyHint: "Dieser Besuch",
  filters: { all: "Alle", income: "Einnahmen", spend: "Ausgaben" },
  filterBtn: "Filter",
  empty: "Noch keine Transaktionen. Kaufe, verkaufe oder geh zur Schicht.",
  wealth: "VERMÖGEN",
  chips: { cash: "Bargeld", assets: "Vermögenswerte" },
  actions: {
    buyCompany: "Firma gekauft", sellCompany: "Firma verkauft", upgradeCompany: "Firmen-Upgrade", hireStaff: "Neuer Mitarbeiter", researchCompany: "Firmenforschung",
    runCampaign: "Kampagne", buyAsset: "Investition gekauft", sellAsset: "Investition verkauft", buyStock: "Aktien gekauft", buyNeed: "Vorräte gekauft",
    startShift: "Schicht", startVacation: "Urlaub", investEdu: "Bildung", exchange: "Punkte-Tausch", startHustle: "Nebenjob",
    topUpHustle: "Nebenjob", decideHustle: "Nebenjob", arbitrage: "Arbitrage", placeOrder: "Bestellung", signContract: "Vertrag", other: "Transaktion",
  },
};

const ru: EconomyBankText = {
  tab: "🏦 Банк",
  nav: { overview: "Обзор", work: "Работа", companies: "Компании", invest: "Инвестиции", board: "Рейтинг" },
  income: "Доходы",
  expenses: "Расходы",
  perHour: "в час",
  perDay: "в день",
  budget: "Бюджет в час",
  chartName: "В час",
  sources: { salary: "Зарплата", companies: "Компании", passive: "Пассивный", living: "Жизнь", costs: "Расходы" },
  balance: "Общий баланс",
  goal: "Моя цель",
  goalOf: "из рекорда",
  net: "В день",
  quick: "Перейти к",
  history: "История операций",
  historyHint: "Этот визит",
  filters: { all: "Все", income: "Доходы", spend: "Расходы" },
  filterBtn: "Фильтр",
  empty: "Операций пока нет. Купи, продай или выйди на смену.",
  wealth: "СОСТОЯНИЕ",
  chips: { cash: "Наличные", assets: "Активы" },
  actions: {
    buyCompany: "Покупка компании", sellCompany: "Продажа компании", upgradeCompany: "Улучшение компании", hireStaff: "Новый сотрудник", researchCompany: "Исследование компании",
    runCampaign: "Кампания", buyAsset: "Покупка инвестиции", sellAsset: "Продажа инвестиции", buyStock: "Покупка акций", buyNeed: "Покупка припасов",
    startShift: "Смена", startVacation: "Отпуск", investEdu: "Образование", exchange: "Обмен баллов", startHustle: "Подработка",
    topUpHustle: "Подработка", decideHustle: "Подработка", arbitrage: "Арбитраж", placeOrder: "Заказ", signContract: "Контракт", other: "Операция",
  },
};

const uk: EconomyBankText = {
  tab: "🏦 Банк",
  nav: { overview: "Огляд", work: "Робота", companies: "Компанії", invest: "Інвестиції", board: "Рейтинг" },
  income: "Доходи",
  expenses: "Витрати",
  perHour: "за годину",
  perDay: "за день",
  budget: "Бюджет за годину",
  chartName: "За годину",
  sources: { salary: "Зарплата", companies: "Компанії", passive: "Пасивний", living: "Життя", costs: "Експлуатація" },
  balance: "Загальний баланс",
  goal: "Моя мета",
  goalOf: "з рекорду",
  net: "За день",
  quick: "Перейти до",
  history: "Історія транзакцій",
  historyHint: "Цей візит",
  filters: { all: "Усі", income: "Доходи", spend: "Витрати" },
  filterBtn: "Фільтр",
  empty: "Транзакцій поки немає. Купи, продай або вийди на зміну.",
  wealth: "СТАН",
  chips: { cash: "Готівка", assets: "Активи" },
  actions: {
    buyCompany: "Купівля компанії", sellCompany: "Продаж компанії", upgradeCompany: "Покращення компанії", hireStaff: "Новий працівник", researchCompany: "Дослідження компанії",
    runCampaign: "Кампанія", buyAsset: "Купівля інвестиції", sellAsset: "Продаж інвестиції", buyStock: "Купівля акцій", buyNeed: "Купівля потреб",
    startShift: "Зміна", startVacation: "Відпустка", investEdu: "Навчання", exchange: "Обмін балів", startHustle: "Підробіток",
    topUpHustle: "Підробіток", decideHustle: "Підробіток", arbitrage: "Арбітраж", placeOrder: "Замовлення", signContract: "Контракт", other: "Транзакція",
  },
};

const ja: EconomyBankText = {
  tab: "🏦 銀行",
  nav: { overview: "概要", work: "仕事", companies: "会社", invest: "投資", board: "ランキング" },
  income: "収入",
  expenses: "支出",
  perHour: "1時間あたり",
  perDay: "1日あたり",
  budget: "1時間あたりの予算",
  chartName: "1時間あたり",
  sources: { salary: "給料", companies: "会社", passive: "不労所得", living: "生活", costs: "運営費" },
  balance: "総残高",
  goal: "目標",
  goalOf: "記録の",
  net: "1日あたり",
  quick: "移動先",
  history: "取引履歴",
  historyHint: "今回の訪問",
  filters: { all: "すべて", income: "収入", spend: "支出" },
  filterBtn: "フィルター",
  empty: "まだ取引はありません。購入、売却、シフトに入ってみましょう。",
  wealth: "純資産",
  chips: { cash: "現金", assets: "資産" },
  actions: {
    buyCompany: "会社を購入", sellCompany: "会社を売却", upgradeCompany: "会社のアップグレード", hireStaff: "新しい従業員", researchCompany: "会社の研究",
    runCampaign: "キャンペーン", buyAsset: "投資を購入", sellAsset: "投資を売却", buyStock: "株を購入", buyNeed: "必需品を購入",
    startShift: "シフト", startVacation: "休暇", investEdu: "教育", exchange: "ポイント交換", startHustle: "副業",
    topUpHustle: "副業", decideHustle: "副業", arbitrage: "裁定取引", placeOrder: "注文", signContract: "契約", other: "取引",
  },
};

const es: EconomyBankText = {
  tab: "🏦 Banco",
  nav: { overview: "Resumen", work: "Trabajo", companies: "Empresas", invest: "Inversiones", board: "Clasificación" },
  income: "Ingresos",
  expenses: "Gastos",
  perHour: "por hora",
  perDay: "por día",
  budget: "Presupuesto por hora",
  chartName: "Por hora",
  sources: { salary: "Sueldo", companies: "Empresas", passive: "Pasivo", living: "Vida", costs: "Gastos fijos" },
  balance: "Saldo total",
  goal: "Mi objetivo",
  goalOf: "del récord",
  net: "Por día",
  quick: "Ir a",
  history: "Historial de transacciones",
  historyHint: "Esta visita",
  filters: { all: "Todo", income: "Ingresos", spend: "Gastos" },
  filterBtn: "Filtro",
  empty: "Todavía no hay transacciones. Compra, vende o ve a un turno.",
  wealth: "PATRIMONIO",
  chips: { cash: "Efectivo", assets: "Activos" },
  actions: {
    buyCompany: "Compra de empresa", sellCompany: "Venta de empresa", upgradeCompany: "Mejora de empresa", hireStaff: "Nuevo empleado", researchCompany: "Investigación de empresa",
    runCampaign: "Campaña", buyAsset: "Compra de inversión", sellAsset: "Venta de inversión", buyStock: "Compra de acciones", buyNeed: "Compra de suministros",
    startShift: "Turno", startVacation: "Vacaciones", investEdu: "Formación", exchange: "Canje de puntos", startHustle: "Trabajo extra",
    topUpHustle: "Trabajo extra", decideHustle: "Trabajo extra", arbitrage: "Arbitraje", placeOrder: "Pedido", signContract: "Contrato", other: "Transacción",
  },
};

const fr: EconomyBankText = {
  tab: "🏦 Banque",
  nav: { overview: "Aperçu", work: "Travail", companies: "Entreprises", invest: "Investissements", board: "Classement" },
  income: "Revenus",
  expenses: "Dépenses",
  perHour: "par heure",
  perDay: "par jour",
  budget: "Budget par heure",
  chartName: "Par heure",
  sources: { salary: "Salaire", companies: "Entreprises", passive: "Passif", living: "Vie", costs: "Charges" },
  balance: "Solde total",
  goal: "Mon objectif",
  goalOf: "du record",
  net: "Par jour",
  quick: "Aller à",
  history: "Historique des transactions",
  historyHint: "Cette visite",
  filters: { all: "Tout", income: "Revenus", spend: "Dépenses" },
  filterBtn: "Filtre",
  empty: "Aucune transaction pour l'instant. Achète, vends ou prends un service.",
  wealth: "PATRIMOINE",
  chips: { cash: "Liquidités", assets: "Actifs" },
  actions: {
    buyCompany: "Achat d'entreprise", sellCompany: "Vente d'entreprise", upgradeCompany: "Amélioration d'entreprise", hireStaff: "Nouvel employé", researchCompany: "Recherche d'entreprise",
    runCampaign: "Campagne", buyAsset: "Achat d'investissement", sellAsset: "Vente d'investissement", buyStock: "Achat d'actions", buyNeed: "Achat de fournitures",
    startShift: "Service", startVacation: "Vacances", investEdu: "Formation", exchange: "Échange de points", startHustle: "Petit boulot",
    topUpHustle: "Petit boulot", decideHustle: "Petit boulot", arbitrage: "Arbitrage", placeOrder: "Commande", signContract: "Contrat", other: "Transaction",
  },
};

const all: Record<Locale, EconomyBankText> = { cs, en, de, ru, uk, ja, es, fr };

export function getEconomyBankText(locale: Locale): EconomyBankText {
  return all[locale];
}
