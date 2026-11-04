import { withFallbacks } from "./config";
import type { Locale } from "./config";

export type ProText = {
  nav: string;
  title: string;
  subtitle: string;
  status: {
    guest: string;
    active: string;
    none: string;
    login: string;
  };
  compareTitle: string;
  compareFree: string;
  comparePro: string;
  rows: { what: string; free: string; pro: string }[];
  tiersTitle: string;
  tiers: { individual: TierText; family: TierText; school: TierText };
  availability: string;
  cta: string;
  ctaText: string;
};

type TierText = { title: string; text: string };

const cs: ProText = {
  nav: "Umíme PRO",
  title: "Umíme PRO",
  subtitle: "Předplatné, které přidá víc bodů a víc možností. Zdarma zůstává všechno, co už máš.",
  status: {
    guest: "Pro zobrazení stavu předplatného se přihlas.",
    active: "Máš aktivní předplatné PRO.",
    none: "Zatím nemáš aktivní předplatné PRO.",
    login: "Přihlásit se",
  },
  compareTitle: "Zdarma a PRO",
  compareFree: "Zdarma",
  comparePro: "PRO",
  rows: [
    { what: "Body za učení", free: "běžné", pro: "násobek navíc" },
    { what: "Kolo štěstí", free: "1× denně", pro: "víc točení" },
    { what: "Možnosti v obchodě a hrách", free: "základní", pro: "víc možností" },
  ],
  tiersTitle: "Tarify",
  tiers: {
    individual: { title: "Jednotlivec", text: "Předplatné pro jeden účet. Platí jen pro tebe." },
    family: { title: "Rodina", text: "Jeden tarif pro více členů rodiny. Plátce ho spravuje a přidává členy." },
    school: { title: "Škola", text: "Tarif pro žáky vybrané školy. Platí, když je škola uvedena ve tvém účtu." },
  },
  availability: "Předplatné se připravuje a zatím ho nelze koupit. Ceny a podmínky tarifů doplníme, až bude možné platit.",
  cta: "Napsat nám",
  ctaText: "Máš otázku nebo zájem o tarif pro školu či rodinu? Ozvi se.",
};

const en: ProText = {
  nav: "Umíme PRO",
  title: "Umíme PRO",
  subtitle: "A subscription that adds more points and more options. Everything you already have stays free.",
  status: {
    guest: "Log in to see your subscription status.",
    active: "You have an active PRO subscription.",
    none: "You don't have an active PRO subscription yet.",
    login: "Log in",
  },
  compareTitle: "Free and PRO",
  compareFree: "Free",
  comparePro: "PRO",
  rows: [
    { what: "Points for learning", free: "standard", pro: "extra multiplier" },
    { what: "Wheel of fortune", free: "1× a day", pro: "more spins" },
    { what: "Options in the shop and games", free: "basic", pro: "more options" },
  ],
  tiersTitle: "Plans",
  tiers: {
    individual: { title: "Individual", text: "A subscription for one account. It applies only to you." },
    family: { title: "Family", text: "One plan for several family members. The payer manages it and adds members." },
    school: { title: "School", text: "A plan for pupils of the selected school. It applies when your school is set in your account." },
  },
  availability: "The subscription is being prepared and cannot be purchased yet. Prices and plan terms will be added once payments are possible.",
  cta: "Contact us",
  ctaText: "Have a question or interest in a plan for a school or family? Get in touch.",
};

const de: ProText = {
  nav: "Umíme PRO",
  title: "Umíme PRO",
  subtitle: "Ein Abo, das mehr Punkte und mehr Möglichkeiten bringt. Alles, was du schon hast, bleibt kostenlos.",
  status: {
    guest: "Melde dich an, um den Status deines Abos zu sehen.",
    active: "Du hast ein aktives PRO-Abo.",
    none: "Du hast noch kein aktives PRO-Abo.",
    login: "Anmelden",
  },
  compareTitle: "Kostenlos und PRO",
  compareFree: "Kostenlos",
  comparePro: "PRO",
  rows: [
    { what: "Punkte fürs Lernen", free: "normal", pro: "zusätzlicher Multiplikator" },
    { what: "Glücksrad", free: "1× täglich", pro: "mehr Drehungen" },
    { what: "Möglichkeiten im Shop und in Spielen", free: "grundlegend", pro: "mehr Möglichkeiten" },
  ],
  tiersTitle: "Tarife",
  tiers: {
    individual: { title: "Einzelperson", text: "Ein Abo für ein Konto. Es gilt nur für dich." },
    family: { title: "Familie", text: "Ein Tarif für mehrere Familienmitglieder. Der Zahler verwaltet ihn und fügt Mitglieder hinzu." },
    school: { title: "Schule", text: "Ein Tarif für Schülerinnen und Schüler der gewählten Schule. Er gilt, wenn die Schule in deinem Konto eingetragen ist." },
  },
  availability: "Das Abo wird gerade vorbereitet und kann noch nicht gekauft werden. Preise und Tarifbedingungen ergänzen wir, sobald Zahlungen möglich sind.",
  cta: "Schreib uns",
  ctaText: "Hast du eine Frage oder Interesse an einem Tarif für Schule oder Familie? Melde dich.",
};

const ru: ProText = {
  nav: "Umíme PRO",
  title: "Umíme PRO",
  subtitle: "Подписка, которая добавляет больше баллов и больше возможностей. Всё, что у тебя уже есть, остаётся бесплатным.",
  status: {
    guest: "Войди, чтобы увидеть статус подписки.",
    active: "У тебя активна подписка PRO.",
    none: "Подписки PRO пока нет.",
    login: "Войти",
  },
  compareTitle: "Бесплатно и PRO",
  compareFree: "Бесплатно",
  comparePro: "PRO",
  rows: [
    { what: "Баллы за учёбу", free: "обычные", pro: "дополнительный множитель" },
    { what: "Колесо удачи", free: "1× в день", pro: "больше вращений" },
    { what: "Возможности в магазине и играх", free: "базовые", pro: "больше возможностей" },
  ],
  tiersTitle: "Тарифы",
  tiers: {
    individual: { title: "Для одного", text: "Подписка на один аккаунт. Действует только для тебя." },
    family: { title: "Семья", text: "Один тариф для нескольких членов семьи. Плательщик им управляет и добавляет участников." },
    school: { title: "Школа", text: "Тариф для учеников выбранной школы. Действует, когда школа указана в твоём аккаунте." },
  },
  availability: "Подписка сейчас готовится и пока не продаётся. Цены и условия тарифов добавим, когда будет возможна оплата.",
  cta: "Написать нам",
  ctaText: "Есть вопрос или интерес к тарифу для школы или семьи? Напиши нам.",
};

const texts: Record<Locale, ProText> = withFallbacks({ cs, en, de, ru });

export function getProText(locale: Locale): ProText {
  return texts[locale] ?? cs;
}
