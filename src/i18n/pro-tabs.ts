import type { Locale } from "./config";

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

const uk: ProTabsText = {
  tabs: { pro: "Pro", rodina: "Родина", skola: "Школа" },
  tabText: {
    rodina: "Один тариф для кількох членів родини. Платник керує ним і додає учасників.",
    skola: "Тариф для учнів обраної школи. Діє, коли школу вказано у твоєму обліковому записі.",
  },
  homeTitle: "Інструменти UčímePRO",
  homeHint: "Для себе, родини чи школи. Обери те, що тобі потрібно.",
  plansLink: "Тарифи та ціни",
};

const ja: ProTabsText = {
  tabs: { pro: "Pro", rodina: "ファミリー", skola: "学校" },
  tabText: {
    rodina: "複数の家族で使える1つのプラン。支払い者が管理し、メンバーを追加します。",
    skola: "選んだ学校の生徒向けのプラン。アカウントに学校が設定されていると適用されます。",
  },
  homeTitle: "UčímePRO のツール",
  homeHint: "個人、家族、学校向けです。必要なものを選んでください。",
  plansLink: "プランと料金",
};

const es: ProTabsText = {
  tabs: { pro: "Pro", rodina: "Familia", skola: "Colegio" },
  tabText: {
    rodina: "Un solo plan para varios miembros de la familia. Quien paga lo gestiona y añade a los miembros.",
    skola: "Un plan para los alumnos del colegio seleccionado. Se aplica cuando el colegio está indicado en tu cuenta.",
  },
  homeTitle: "Herramientas de UčímePRO",
  homeHint: "Para particulares, familias o colegios. Elige lo que necesitas.",
  plansLink: "Tarifas y precios",
};

const fr: ProTabsText = {
  tabs: { pro: "Pro", rodina: "Famille", skola: "École" },
  tabText: {
    rodina: "Une seule formule pour plusieurs membres de la famille. Le payeur la gère et ajoute les membres.",
    skola: "Une formule pour les élèves de l'école choisie. Elle s'applique lorsque ton école est indiquée sur ton compte.",
  },
  homeTitle: "Outils UčímePRO",
  homeHint: "Pour les particuliers, les familles ou les écoles. Choisis ce dont tu as besoin.",
  plansLink: "Formules et tarifs",
};

const texts: Record<Locale, ProTabsText> = { cs, en, de, ru, uk, ja, es, fr };

export function getProTabsText(locale: Locale): ProTabsText {
  return texts[locale] ?? cs;
}
