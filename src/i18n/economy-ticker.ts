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

const uk: EconomyTickerText = {
  label: "Новини ринку",
  disclaimer: "вигаданий приклад для навчання",
  open: "Відкрити Економіку",
  dismiss: "Закрити смугу",
  items: [
    "Криза в інвестиціях: світові акції за тиждень упали на 12 %. Інвестори панікують і продають.",
    "Kalenda Motors оголосила рекордний прибуток, її акції зросли на 8 %.",
    "₿ Криптовалюти знову коливаються: головна монета за годину втратила 15 %. Обережно зі швидким заробітком.",
    "Центральний банк підвищив облікову ставку до 4 %. Іпотека дорожчає, вклади приносять більше.",
    "Супермаркет «Зелена галявина» знижує ціни, люди заощаджують. Інфляція сповільнюється.",
    "Стартап Solarnet знайшов інвестора за 30 % компанії. Новим фірмам потрібен капітал, але вони віддають частину часток.",
    "Порада: не клади всі яйця в один кошик. Розподіл інвестицій знижує ризик.",
  ],
};

const ja: EconomyTickerText = {
  label: "市場ニュース",
  disclaimer: "学習用の架空の例",
  open: "経済を開く",
  dismiss: "バーを閉じる",
  items: [
    "投資の危機: 世界の株価が今週12%下落しました。投資家はパニックになり売っています。",
    "Kalenda Motors が過去最高の利益を発表し、株価は8%上昇しました。",
    "₿ 暗号資産が再び乱高下: メインコインは1時間で15%失いました。すぐに儲かる話には注意しましょう。",
    "中央銀行が政策金利を4%に引き上げました。住宅ローンは高くなり、預金は利息が増えます。",
    "スーパー「グリーンメドウ」が値下げし、人々は節約しています。インフレは鈍化しています。",
    "スタートアップ Solarnet が会社の30%と引き換えに投資家を得ました。新しい会社は資金が必要ですが、株の一部を手放すことになります。",
    "ヒント: 卵をひとつのカゴに盛らないこと。投資を分散すると危険が減ります。",
  ],
};

const es: EconomyTickerText = {
  label: "Noticias del mercado",
  disclaimer: "ejemplo ficticio para aprender",
  open: "Abrir Economía",
  dismiss: "Cerrar la barra",
  items: [
    "Crisis de inversiones: las acciones mundiales cayeron un 12 % esta semana. Los inversores entran en pánico y venden.",
    "Kalenda Motors anunció beneficios récord y sus acciones subieron un 8 %.",
    "₿ Las criptomonedas vuelven a oscilar: la moneda principal perdió un 15 % en una hora. Cuidado con los planes de ganancias rápidas.",
    "El banco central subió el tipo de interés al 4 %. Las hipotecas se encarecen y las cuentas de ahorro dan más.",
    "El supermercado Prado Verde baja precios y la gente ahorra. La inflación se frena.",
    "La startup Solarnet consiguió un inversor a cambio del 30 % de la empresa. Las empresas nuevas necesitan capital, pero ceden parte de sus acciones.",
    "Consejo: no pongas todos los huevos en la misma cesta. Diversificar las inversiones reduce el riesgo.",
  ],
};

const fr: EconomyTickerText = {
  label: "Actualités du marché",
  disclaimer: "exemple fictif à des fins pédagogiques",
  open: "Ouvrir Économie",
  dismiss: "Fermer la barre",
  items: [
    "Crise des investissements : les actions mondiales ont chuté de 12 % cette semaine. Les investisseurs paniquent et vendent.",
    "Kalenda Motors annonce un bénéfice record, son action a bondi de 8 %.",
    "₿ Les cryptomonnaies repartent à la hausse et à la baisse : la pièce principale a perdu 15 % en une heure. Méfie-toi des promesses de gains rapides.",
    "La banque centrale a relevé son taux directeur à 4 %. Les crédits immobiliers deviennent plus chers, les livrets rapportent davantage.",
    "La supérette Prairie Verte baisse ses prix, les gens font des économies. L'inflation ralentit.",
    "La startup Solarnet a trouvé un investisseur contre 30 % de l'entreprise. Les jeunes entreprises ont besoin de capital, mais cèdent une part de leurs parts.",
    "Conseil : ne mets pas tous tes œufs dans le même panier. Répartir ses investissements réduit le risque.",
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
