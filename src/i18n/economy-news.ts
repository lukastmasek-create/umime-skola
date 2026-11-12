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

const uk: EconomyNewsText = {
  title: "Економіка: новини",
  empty: "Поки немає оголошень. Заснуй першу компанію!",
  founded: "{actor} заснував(ла) компанію {company}",
  overtook: "{actor} обійшов(ла) гравця {target} у рейтингу",
  overtookYou: "{actor} обійшов(ла) тебе в рейтингу Економіки!",
  open: "Відкрити Економіку",
  seen: "Зрозуміло",
};

const ja: EconomyNewsText = {
  title: "経済: ニュース",
  empty: "まだお知らせはありません。最初の会社を作りましょう！",
  founded: "{actor} が会社 {company} を設立しました",
  overtook: "{actor} がランキングで {target} を抜きました",
  overtookYou: "{actor} が経済ランキングであなたを抜きました！",
  open: "経済を開く",
  seen: "わかった",
};

const es: EconomyNewsText = {
  title: "Economía: novedades",
  empty: "Todavía no hay avisos. ¡Funda la primera empresa!",
  founded: "{actor} fundó la empresa {company}",
  overtook: "{actor} superó a {target} en la clasificación",
  overtookYou: "¡{actor} te superó en la clasificación de Economía!",
  open: "Abrir Economía",
  seen: "Entendido",
};

const fr: EconomyNewsText = {
  title: "Économie : actualités",
  empty: "Aucune annonce pour l'instant. Crée ta première entreprise !",
  founded: "{actor} a fondé l'entreprise {company}",
  overtook: "{actor} a dépassé {target} au classement",
  overtookYou: "{actor} t'a dépassé au classement Économie !",
  open: "Ouvrir Économie",
  seen: "Compris",
};

export function getEconomyNewsText(locale: Locale): EconomyNewsText {
  switch (locale) {
    case "cs":
      return cs;
    case "de":
      return de;
    case "ru":
      return ru;
    case "uk":
      return uk;
    case "ja":
      return ja;
    case "es":
      return es;
    case "fr":
      return fr;
    default:
      return en;
  }
}
