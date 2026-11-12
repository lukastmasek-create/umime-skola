import { withFallbacks, type Locale } from "./config";

// Texty záložek UčímePRO (Pro / Rodina / Škola) a jejich odkazů na homepage.
export type ProTabsText = {
  tabs: { pro: string; rodina: string; skola: string };
  tabText: { rodina: string; skola: string };
  homeTitle: string;
  homeHint: string;
  plansLink: string;
};

const cs: ProTabsText = {
  tabs: { pro: "Pro", rodina: "Rodina", skola: "Škola" },
  tabText: {
    rodina: "Jeden tarif pro více členů rodiny. Plátce ho spravuje a přidává členy.",
    skola: "Tarif pro žáky vybrané školy. Platí, když je škola uvedena ve tvém účtu.",
  },
  homeTitle: "Nástroje UčímePRO",
  homeHint: "Pro jednotlivce, rodinu nebo školu. Vyber si, co potřebuješ.",
  plansLink: "Tarify a ceny",
};

const en: ProTabsText = {
  tabs: { pro: "Pro", rodina: "Family", skola: "School" },
  tabText: {
    rodina: "One plan for several family members. The payer manages it and adds members.",
    skola: "A plan for pupils of the selected school. It applies when your school is set in your account.",
  },
  homeTitle: "UčímePRO tools",
  homeHint: "For individuals, families or schools. Pick what you need.",
  plansLink: "Plans and prices",
};

const de: ProTabsText = {
  tabs: { pro: "Pro", rodina: "Familie", skola: "Schule" },
  tabText: {
    rodina: "Ein Tarif für mehrere Familienmitglieder. Der Zahler verwaltet ihn und fügt Mitglieder hinzu.",
    skola: "Ein Tarif für Schüler der ausgewählten Schule. Er gilt, wenn die Schule in deinem Konto eingetragen ist.",
  },
  homeTitle: "UčímePRO-Werkzeuge",
  homeHint: "Für Einzelpersonen, Familien oder Schulen. Wähle, was du brauchst.",
  plansLink: "Tarife und Preise",
};

const ru: ProTabsText = {
  tabs: { pro: "Pro", rodina: "Семья", skola: "Школа" },
  tabText: {
    rodina: "Один тариф для нескольких членов семьи. Плательщик управляет им и добавляет участников.",
    skola: "Тариф для учеников выбранной школы. Действует, когда школа указана в твоём аккаунте.",
  },
  homeTitle: "Инструменты UčímePRO",
  homeHint: "Для себя, семьи или школы. Выбери, что нужно.",
  plansLink: "Тарифы и цены",
};

const texts = withFallbacks({ cs, en, de, ru });

export function getProTabsText(locale: Locale): ProTabsText {
  return texts[locale] ?? cs;
}
