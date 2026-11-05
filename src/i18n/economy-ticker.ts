import type { Locale } from "./config";

// Lišta „Zprávy z trhu“ nahoře na všech stránkách. Zprávy jsou fiktivní (firmy, čísla i události), slouží k výuce
// finanční gramotnosti. Když přidáš nebo změníš zprávy, zvedni TICKER_VERSION, aby se lišta znovu ukázala i těm,
// kdo ji dřív zavřeli.
export const TICKER_VERSION = "v1";

export type EconomyTickerText = {
  label: string;
  disclaimer: string;
  open: string;
  dismiss: string;
  items: string[];
};

const cs: EconomyTickerText = {
  label: "Zprávy z trhu",
  disclaimer: "fiktivní ukázka pro výuku",
  open: "Otevřít Ekonomiku",
  dismiss: "Zavřít lištu",
  items: [
    "Krize v investicích: světové akcie za týden klesly o 12 %. Investoři panikaří a prodávají.",
    "Firma Kalenda Motors ohlásila rekordní zisk, její akcie vyskočily o 8 %.",
    "₿ Kryptoměny zase kolísají: Hlavní coin během hodiny ztratil 15 %. Pozor na hru s rychlými zisky.",
    "Centrální banka zvýšila úrokovou sazbu na 4 %. Hypotéky zdražují, spořicí účty přinášejí víc.",
    "Supermarket Zelená louka snižuje ceny, lidé šetří. Inflace se zpomaluje.",
    "Startup Solarnet získal investora za 30 % firmy. Nové firmy hledají kapitál, ale ztrácejí část podílu.",
    "Tip: nedávej všechna vejce do jednoho košíku. Rozložení investic snižuje riziko.",
  ],
};

const en: EconomyTickerText = {
  label: "Market news",
  disclaimer: "fictional example for learning",
  open: "Open Economy",
  dismiss: "Close the bar",
  items: [
    "Investment crisis: world stocks fell 12 % this week. Investors panic and sell.",
    "Kalenda Motors reported record profit, its shares jumped 8 %.",
    "₿ Crypto is swinging again: the Main coin lost 15 % in an hour. Beware of quick-profit schemes.",
    "The central bank raised its interest rate to 4 %. Mortgages get pricier, savings accounts pay more.",
    "The Green Meadow supermarket is cutting prices, people are saving. Inflation is slowing.",
    "Startup Solarnet got an investor for 30 % of the company. New firms need capital but give up a share.",
    "Tip: don't put all your eggs in one basket. Spreading investments lowers risk.",
  ],
};

const de: EconomyTickerText = {
  label: "Marktnachrichten",
  disclaimer: "fiktives Lernbeispiel",
  open: "Ökonomie öffnen",
  dismiss: "Leiste schließen",
  items: [
    "Investitionskrise: Weltweite Aktien sind diese Woche um 12 % gefallen. Anleger geraten in Panik und verkaufen.",
    "Kalenda Motors meldete Rekordgewinn, die Aktie sprang um 8 % nach oben.",
    "₿ Kryptowährungen schwanken wieder: Der Hauptcoin verlor in einer Stunde 15 %. Vorsicht vor schnellen Gewinnversprechen.",
    "Die Zentralbank hat den Leitzins auf 4 % erhöht. Hypotheken werden teurer, Sparkonten bringen mehr.",
    "Der Supermarkt Grüne Wiese senkt die Preise, die Menschen sparen. Die Inflation schwächt sich ab.",
    "Das Startup Solarnet hat einen Investor für 30 % der Firma gefunden. Neue Firmen brauchen Kapital, geben dafür aber Anteile ab.",
    "Tipp: Leg nicht alle Eier in einen Korb. Breit gestreute Investitionen senken das Risiko.",
  ],
};

const ru: EconomyTickerText = {
  label: "Новости рынка",
  disclaimer: "вымышленный пример для обучения",
  open: "Открыть Экономику",
  dismiss: "Закрыть полосу",
  items: [
    "Кризис в инвестициях: мировые акции за неделю упали на 12 %. Инвесторы паникуют и продают.",
    "Kalenda Motors объявила рекордную прибыль, её акции выросли на 8 %.",
    "₿ Криптовалюты снова колеблются: Главный coin за час потерял 15 %. Осторожно с быстрым заработком.",
    "Центральный банк повысил процентную ставку до 4 %. Ипотека дорожает, вклады приносят больше.",
    "Супермаркет «Зелёная поляна» снижает цены, люди экономят. Инфляция замедляется.",
    "Стартап Solarnet нашёл инвестора за 30 % компании. Новым фирмам нужен капитал, но они отдают часть долей.",
    "Совет: не клади все яйца в одну корзину. Распределение инвестиций снижает риск.",
  ],
};

export function getEconomyTickerText(locale: Locale): EconomyTickerText {
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
