import type { Locale } from "./config";
import type { BoostId, NeedId } from "@/lib/idle/economy";

// Texty záložky Potřeby (jídlo, pití, oblečení a další běžné věci, které se kupují v obchodě).
// Zástupné znaky {n}, {p} doplní UI.
export type NeedsText = {
  title: string;
  intro: string;
  dailyCost: string;
  emptyCount: string;
  allStocked: string;
  days: string;
  empty: string;
  full: string;
  buyDay: string;
  fill: string;
  bought: string;
  essential: string;
  common: string;
  perDay: string;
  items: Record<NeedId, { name: string; hint: string; effect: string }>;
  boostsTitle: string;
  boostsHint: string;
  boostLeft: string;
  boostNone: string;
  buyBoost: string;
  boosts: Record<BoostId, { name: string; effect: string }>;
};

const cs: NeedsText = {
  title: "Životní potřeby",
  intro: "Potřeby si kupuj v předstihu, na pár dní dopředu. Každý den zásoba ubývá. Když je zásoba prázdná, výdělek klesá.",
  dailyCost: "Denní náklady celkem: {p}",
  emptyCount: "Prázdné zásoby: {n}. Každá potřeba má jiný účinek, viz karty níž.",
  allStocked: "Všechno máš na skladě.",
  days: "{n} d.",
  empty: "Došlo",
  full: "Plná zásoba",
  buyDay: "+1 den",
  fill: "Doplnit na {n} d.",
  bought: "Nakoupeno.",
  essential: "Nezbytné",
  common: "Běžné",
  perDay: "{p} / den",
  items: {
    food: { name: "Jídlo", hint: "Snídaně, oběd, večeře.", effect: "Bez jídla se energie dobíjí jen napůl." },
    drink: { name: "Pití", hint: "Voda, káva, čaj.", effect: "Bez pití každou hodinu ubývá energie." },
    clothing: { name: "Oblečení", hint: "Prádlo, boty, něco do práce i ven.", effect: "Bez oblečení je výdělek o 15 % nižší." },
    housing: { name: "Bydlení a účty", hint: "Nájem, energie, voda, internet.", effect: "Bez zaplacení naskakují každý den pokuty v ceně nájmu." },
    transport: { name: "Doprava", hint: "MHD, benzín nebo údržba auta.", effect: "Bez dopravy jdeš na směnu pěšky, stojí to víc energie." },
    health: { name: "Hygiena a zdraví", hint: "Drogerie, léky, návštěva lékaře.", effect: "Bez péče o zdraví nejde energie nad 70 %." },
    leisure: { name: "Zábava a volný čas", hint: "Kino, kavárna, koníčky.", effect: "Bez zábavy se energie dobíjí o pětinu pomaleji." },
  },
  boostsTitle: "Spotřební zboží",
  boostsHint: "Jednorázový nákup s dočasným účinkem. Účinek se po čase sám vypne.",
  boostLeft: "Účinek ještě {t}",
  boostNone: "Teď žádný účinek.",
  buyBoost: "Koupit",
  boosts: {
    energy_drink: { name: "Energy drink", effect: "Dvojnásobné dobíjení energie na 30 min." },
    cinema: { name: "Kino", effect: "+10 % výdělku na 2 hodiny." },
  },
};

const en: NeedsText = {
  title: "Living needs",
  intro: "Buy your needs ahead, a few days at a time. Each day the stock runs down. When a stock is empty, your earnings drop.",
  dailyCost: "Total daily cost: {p}",
  emptyCount: "Empty stock: {n}. Each need has a different effect, see the cards below.",
  allStocked: "Everything is in stock.",
  days: "{n} d",
  empty: "Out",
  full: "Full stock",
  buyDay: "+1 day",
  fill: "Top up to {n} d",
  bought: "Bought.",
  essential: "Essential",
  common: "Common",
  perDay: "{p} / day",
  items: {
    food: { name: "Food", hint: "Breakfast, lunch, dinner.", effect: "Without food, energy recovers only half as fast." },
    drink: { name: "Drinks", hint: "Water, coffee, tea.", effect: "Without drinks, energy drains every hour." },
    clothing: { name: "Clothing", hint: "Underwear, shoes, something for work and outside.", effect: "Without clothing, earnings are 15 % lower." },
    housing: { name: "Housing and bills", hint: "Rent, power, water, internet.", effect: "Unpaid bills add a daily fine equal to the rent." },
    transport: { name: "Transport", hint: "Public transport, fuel or car upkeep.", effect: "Without transport you walk to your shift, which costs more energy." },
    health: { name: "Hygiene and health", hint: "Toiletries, medicine, a doctor's visit.", effect: "Without health care, energy cannot go above 70 %." },
    leisure: { name: "Leisure", hint: "Cinema, café, hobbies.", effect: "Without leisure, energy recovers a fifth slower." },
  },
  boostsTitle: "Consumables",
  boostsHint: "One-off purchases with a temporary effect. The effect wears off by itself.",
  boostLeft: "Effect left: {t}",
  boostNone: "No effect right now.",
  buyBoost: "Buy",
  boosts: {
    energy_drink: { name: "Energy drink", effect: "Double energy recovery for 30 min." },
    cinema: { name: "Cinema", effect: "+10 % earnings for 2 hours." },
  },
};

const de: NeedsText = {
  title: "Lebensbedarf",
  intro: "Kaufe den Bedarf im Voraus, für ein paar Tage. Jeden Tag sinkt der Vorrat. Ist ein Vorrat leer, sinkt dein Verdienst.",
  dailyCost: "Tägliche Gesamtkosten: {p}",
  emptyCount: "Leere Vorräte: {n}. Jeder Bedarf wirkt anders, siehe Karten unten.",
  allStocked: "Alles ist vorrätig.",
  days: "{n} T",
  empty: "Leer",
  full: "Voller Vorrat",
  buyDay: "+1 Tag",
  fill: "Auf {n} T auffüllen",
  bought: "Gekauft.",
  essential: "Unverzichtbar",
  common: "Üblich",
  perDay: "{p} / Tag",
  items: {
    food: { name: "Essen", hint: "Frühstück, Mittag, Abendessen.", effect: "Ohne Essen erholt sich die Energie nur halb so schnell." },
    drink: { name: "Getränke", hint: "Wasser, Kaffee, Tee.", effect: "Ohne Getränke sinkt die Energie jede Stunde." },
    clothing: { name: "Kleidung", hint: "Unterwäsche, Schuhe, etwas für die Arbeit und draußen.", effect: "Ohne Kleidung ist der Verdienst um 15 % niedriger." },
    housing: { name: "Wohnen und Rechnungen", hint: "Miete, Strom, Wasser, Internet.", effect: "Unbezahlte Rechnungen bringen täglich eine Strafe in Höhe der Miete." },
    transport: { name: "Verkehr", hint: "Öffentliche Verkehrsmittel, Sprit oder Auto-Unterhalt.", effect: "Ohne Verkehrsmittel gehst du zu Fuß zur Schicht, das kostet mehr Energie." },
    health: { name: "Hygiene und Gesundheit", hint: "Drogerie, Medikamente, Arztbesuch.", effect: "Ohne Gesundheitspflege steigt die Energie nicht über 70 %." },
    leisure: { name: "Freizeit", hint: "Kino, Café, Hobbys.", effect: "Ohne Freizeit erholt sich die Energie um ein Fünftel langsamer." },
  },
  boostsTitle: "Verbrauchsgüter",
  boostsHint: "Einmalkäufe mit vorübergehender Wirkung. Die Wirkung endet von selbst.",
  boostLeft: "Wirkung noch {t}",
  boostNone: "Gerade keine Wirkung.",
  buyBoost: "Kaufen",
  boosts: {
    energy_drink: { name: "Energy-Drink", effect: "Doppelte Energieerholung für 30 Min." },
    cinema: { name: "Kino", effect: "+10 % Verdienst für 2 Stunden." },
  },
};

const ru: NeedsText = {
  title: "Жизненные нужды",
  intro: "Покупай нужды заранее, на несколько дней. Каждый день запас уменьшается. Когда запас пуст, заработок падает.",
  dailyCost: "Всего в день: {p}",
  emptyCount: "Пустых запасов: {n}. У каждой нужды свой эффект, см. карточки ниже.",
  allStocked: "Всё есть в запасе.",
  days: "{n} дн.",
  empty: "Нет",
  full: "Запас полный",
  buyDay: "+1 день",
  fill: "Пополнить до {n} дн.",
  bought: "Куплено.",
  essential: "Необходимо",
  common: "Обычное",
  perDay: "{p} / день",
  items: {
    food: { name: "Еда", hint: "Завтрак, обед, ужин.", effect: "Без еды энергия восстанавливается вдвое медленнее." },
    drink: { name: "Напитки", hint: "Вода, кофе, чай.", effect: "Без напитков энергия каждый час убывает." },
    clothing: { name: "Одежда", hint: "Бельё, обувь, что-нибудь для работы и улицы.", effect: "Без одежды заработок ниже на 15 %." },
    housing: { name: "Жильё и счета", hint: "Аренда, электричество, вода, интернет.", effect: "Неоплаченные счета каждый день добавляют штраф, равный аренде." },
    transport: { name: "Транспорт", hint: "Общественный транспорт, бензин или обслуживание машины.", effect: "Без транспорта идёшь на смену пешком, это стоит больше энергии." },
    health: { name: "Гигиена и здоровье", hint: "Средства гигиены, лекарства, визит к врачу.", effect: "Без заботы о здоровье энергия не поднимается выше 70 %." },
    leisure: { name: "Досуг", hint: "Кино, кафе, хобби.", effect: "Без досуга энергия восстанавливается на пятую часть медленнее." },
  },
  boostsTitle: "Расходники",
  boostsHint: "Разовые покупки с временным эффектом. Эффект проходит сам.",
  boostLeft: "Эффект ещё {t}",
  boostNone: "Сейчас эффекта нет.",
  buyBoost: "Купить",
  boosts: {
    energy_drink: { name: "Энергетик", effect: "Вдвое быстрее восстановление энергии на 30 мин." },
    cinema: { name: "Кино", effect: "+10 % заработка на 2 часа." },
  },
};

const uk: NeedsText = {
  title: "Життєві потреби",
  intro: "Купуй потреби наперед, на кілька днів. Щодня запас зменшується. Коли запас порожній, заробіток падає.",
  dailyCost: "Разом на день: {p}",
  emptyCount: "Порожні запаси: {n}. Кожна потреба має свій ефект, див. картки нижче.",
  allStocked: "Усе є в запасі.",
  days: "{n} д",
  empty: "Закінчилось",
  full: "Повний запас",
  buyDay: "+1 день",
  fill: "Поповнити до {n} д",
  bought: "Куплено.",
  essential: "Необхідне",
  common: "Звичайне",
  perDay: "{p} / день",
  items: {
    food: { name: "Їжа", hint: "Сніданок, обід, вечеря.", effect: "Без їжі енергія відновлюється вдвічі повільніше." },
    drink: { name: "Напої", hint: "Вода, кава, чай.", effect: "Без напоїв енергія щогодини зменшується." },
    clothing: { name: "Одяг", hint: "Білизна, взуття, щось для роботи й на вулицю.", effect: "Без одягу заробіток на 15 % нижчий." },
    housing: { name: "Житло і рахунки", hint: "Оренда, світло, вода, інтернет.", effect: "Несплачені рахунки щодня додають штраф, що дорівнює оренді." },
    transport: { name: "Транспорт", hint: "Громадський транспорт, пальне або обслуговування авто.", effect: "Без транспорту ти йдеш на зміну пішки, це коштує більше енергії." },
    health: { name: "Гігієна і здоров'я", hint: "Засоби гігієни, ліки, відвідування лікаря.", effect: "Без догляду за здоров'ям енергія не піднімається вище 70 %." },
    leisure: { name: "Дозвілля", hint: "Кіно, кафе, хобі.", effect: "Без дозвілля енергія відновлюється на п'яту частину повільніше." },
  },
  boostsTitle: "Витратні товари",
  boostsHint: "Разові покупки з тимчасовим ефектом. Ефект згасає сам.",
  boostLeft: "Ефект ще {t}",
  boostNone: "Зараз ефекту немає.",
  buyBoost: "Купити",
  boosts: {
    energy_drink: { name: "Енергетик", effect: "Подвійне відновлення енергії на 30 хв." },
    cinema: { name: "Кіно", effect: "+10 % заробітку на 2 години." },
  },
};

const ja: NeedsText = {
  title: "生活必需品",
  intro: "必需品は数日分まとめて前もって買いましょう。毎日ストックは減ります。ストックが空になると収入が下がります。",
  dailyCost: "1日の合計コスト: {p}",
  emptyCount: "空のストック: {n}。必需品ごとに効果が違うので、下のカードを見てください。",
  allStocked: "すべて在庫があります。",
  days: "{n} 日分",
  empty: "切れ",
  full: "満タン",
  buyDay: "+1 日",
  fill: "{n} 日分まで補充",
  bought: "購入しました。",
  essential: "必須",
  common: "一般",
  perDay: "{p} / 日",
  items: {
    food: { name: "食事", hint: "朝食、昼食、夕食。", effect: "食事がないと、エネルギーの回復が半分になります。" },
    drink: { name: "飲み物", hint: "水、コーヒー、お茶。", effect: "飲み物がないと、毎時間エネルギーが減ります。" },
    clothing: { name: "衣類", hint: "下着、靴、仕事用と外出用の服。", effect: "衣類がないと、収入が15%下がります。" },
    housing: { name: "住居と光熱費", hint: "家賃、電気、水道、インターネット。", effect: "支払わないと、家賃と同額の罰金が毎日加算されます。" },
    transport: { name: "交通", hint: "公共交通機関、ガソリン、車の維持費。", effect: "交通手段がないと徒歩でシフトに行くため、より多くのエネルギーを使います。" },
    health: { name: "衛生と健康", hint: "日用品、薬、病院の受診。", effect: "健康管理をしないと、エネルギーは70%までしか上がりません。" },
    leisure: { name: "娯楽", hint: "映画、カフェ、趣味。", effect: "娯楽がないと、エネルギーの回復が5分の1遅くなります。" },
  },
  boostsTitle: "消耗品",
  boostsHint: "一時的な効果がある使い切りの商品です。効果は時間が経つと自然に切れます。",
  boostLeft: "効果の残り {t}",
  boostNone: "今は効果がありません。",
  buyBoost: "購入",
  boosts: {
    energy_drink: { name: "エナジードリンク", effect: "30分間、エネルギーの回復が2倍になります。" },
    cinema: { name: "映画", effect: "2時間、収入が+10%になります。" },
  },
};

const es: NeedsText = {
  title: "Necesidades de la vida",
  intro: "Compra tus necesidades con antelación, para unos días. Cada día el stock baja. Cuando un stock se vacía, tus ingresos caen.",
  dailyCost: "Coste diario total: {p}",
  emptyCount: "Stock vacío: {n}. Cada necesidad tiene un efecto distinto, mira las tarjetas de abajo.",
  allStocked: "Tienes de todo en stock.",
  days: "{n} d",
  empty: "Agotado",
  full: "Stock lleno",
  buyDay: "+1 día",
  fill: "Completar hasta {n} d",
  bought: "Comprado.",
  essential: "Imprescindible",
  common: "Normal",
  perDay: "{p} / día",
  items: {
    food: { name: "Comida", hint: "Desayuno, almuerzo, cena.", effect: "Sin comida, la energía se recupera solo a la mitad de velocidad." },
    drink: { name: "Bebidas", hint: "Agua, café, té.", effect: "Sin bebidas, la energía baja cada hora." },
    clothing: { name: "Ropa", hint: "Ropa interior, zapatos, algo para el trabajo y para salir.", effect: "Sin ropa, los ingresos son un 15 % menores." },
    housing: { name: "Vivienda y facturas", hint: "Alquiler, luz, agua, internet.", effect: "Las facturas sin pagar suman cada día una multa igual al alquiler." },
    transport: { name: "Transporte", hint: "Transporte público, gasolina o mantenimiento del coche.", effect: "Sin transporte vas a pie al turno, lo que gasta más energía." },
    health: { name: "Higiene y salud", hint: "Productos de higiene, medicinas, visita al médico.", effect: "Sin cuidado de la salud, la energía no puede pasar del 70 %." },
    leisure: { name: "Ocio", hint: "Cine, cafetería, aficiones.", effect: "Sin ocio, la energía se recupera una quinta parte más despacio." },
  },
  boostsTitle: "Productos de consumo",
  boostsHint: "Compras únicas con efecto temporal. El efecto se acaba solo.",
  boostLeft: "Efecto restante: {t}",
  boostNone: "Ahora mismo no hay ningún efecto.",
  buyBoost: "Comprar",
  boosts: {
    energy_drink: { name: "Bebida energética", effect: "Recuperación de energía doble durante 30 min." },
    cinema: { name: "Cine", effect: "+10 % de ingresos durante 2 horas." },
  },
};

const fr: NeedsText = {
  title: "Besoins de la vie",
  intro: "Achète tes besoins à l'avance, pour quelques jours. Chaque jour le stock diminue. Quand un stock est vide, tes revenus baissent.",
  dailyCost: "Coût quotidien total : {p}",
  emptyCount: "Stocks vides : {n}. Chaque besoin a un effet différent, voir les cartes ci-dessous.",
  allStocked: "Tout est en stock.",
  days: "{n} j",
  empty: "Épuisé",
  full: "Stock plein",
  buyDay: "+1 jour",
  fill: "Compléter à {n} j",
  bought: "Acheté.",
  essential: "Indispensable",
  common: "Courant",
  perDay: "{p} / jour",
  items: {
    food: { name: "Nourriture", hint: "Petit-déjeuner, déjeuner, dîner.", effect: "Sans nourriture, l'énergie ne se recharge qu'à moitié." },
    drink: { name: "Boissons", hint: "Eau, café, thé.", effect: "Sans boissons, l'énergie baisse chaque heure." },
    clothing: { name: "Vêtements", hint: "Sous-vêtements, chaussures, de quoi aller au travail et sortir.", effect: "Sans vêtements, les revenus sont inférieurs de 15 %." },
    housing: { name: "Logement et factures", hint: "Loyer, électricité, eau, internet.", effect: "Les factures impayées ajoutent chaque jour une amende égale au loyer." },
    transport: { name: "Transports", hint: "Transports en commun, carburant ou entretien de la voiture.", effect: "Sans transport, tu vas à pied au service, ce qui coûte plus d'énergie." },
    health: { name: "Hygiène et santé", hint: "Produits d'hygiène, médicaments, visite chez le médecin.", effect: "Sans soins, l'énergie ne peut pas dépasser 70 %." },
    leisure: { name: "Loisirs", hint: "Cinéma, café, passe-temps.", effect: "Sans loisirs, l'énergie se recharge un cinquième plus lentement." },
  },
  boostsTitle: "Consommables",
  boostsHint: "Achats ponctuels à effet temporaire. L'effet s'estompe tout seul.",
  boostLeft: "Effet restant : {t}",
  boostNone: "Aucun effet pour le moment.",
  buyBoost: "Acheter",
  boosts: {
    energy_drink: { name: "Boisson énergisante", effect: "Recharge d'énergie doublée pendant 30 min." },
    cinema: { name: "Cinéma", effect: "+10 % de revenus pendant 2 heures." },
  },
};

export function getEconomyNeeds(locale: Locale): NeedsText {
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
