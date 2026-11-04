import type { Locale } from "./config";

// Texty oznámení Ekonomiky na úvodní stránce. Zástupné znaky: {actor} hráč, {company} firma, {target} předehnaný hráč.
export type EconomyNewsText = {
  title: string;
  empty: string;
  founded: string;
  overtook: string;
  overtookYou: string;
  open: string;
  seen: string;
};

const cs: EconomyNewsText = {
  title: "Ekonomika: novinky",
  empty: "Zatím žádná oznámení. Založ první firmu!",
  founded: "{actor} založil(a) firmu {company}",
  overtook: "{actor} předehnal(a) hráče {target} v žebříčku",
  overtookYou: "{actor} tě předehnal(a) v žebříčku Ekonomiky!",
  open: "Otevřít Ekonomiku",
  seen: "Rozumím",
};

const en: EconomyNewsText = {
  title: "Economy: news",
  empty: "No announcements yet. Found the first company!",
  founded: "{actor} founded the company {company}",
  overtook: "{actor} overtook {target} on the leaderboard",
  overtookYou: "{actor} overtook you on the Economy leaderboard!",
  open: "Open Economy",
  seen: "Got it",
};

const de: EconomyNewsText = {
  title: "Ökonomie: Neuigkeiten",
  empty: "Noch keine Meldungen. Gründe die erste Firma!",
  founded: "{actor} hat die Firma {company} gegründet",
  overtook: "{actor} hat {target} in der Rangliste überholt",
  overtookYou: "{actor} hat dich in der Ökonomie-Rangliste überholt!",
  open: "Ökonomie öffnen",
  seen: "Verstanden",
};

const ru: EconomyNewsText = {
  title: "Экономика: новости",
  empty: "Пока нет объявлений. Основай первую компанию!",
  founded: "{actor} основал(а) компанию {company}",
  overtook: "{actor} обогнал(а) игрока {target} в рейтинге",
  overtookYou: "{actor} обогнал(а) тебя в рейтинге Экономики!",
  open: "Открыть Экономику",
  seen: "Понятно",
};

export function getEconomyNewsText(locale: Locale): EconomyNewsText {
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
