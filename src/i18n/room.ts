import { withFallbacks } from "./config";
import type { Locale } from "./config";

export type RoomText = {
  nav: string;
  title: string;
  subtitle: string;
  loginNeeded: string;
  login: string;
  loadError: string;
  actionError: string;
  roomTab: string;
  cardsTab: string;
  points: string; // {n}
  shop: string;
  buy: string; // {n} cena
  owned: string;
  place: string;
  remove: string;
  pickSlot: string;
  emptySlot: string;
  cardsHint: string;
  cardsProgress: string; // {n} = "a / b"
  cardsXpBonus: string; // {n} = procenta
  rarity: Record<"common" | "rare" | "epic", string>;
  notEnough: string;
};

const cs: RoomText = {
  nav: "Pokoj",
  title: "Můj pokoj a sbírka",
  subtitle: "Zařiď si pokoj nábytkem za body a sbírej karty za splněné výzvy.",
  loginNeeded: "Přihlas se a zařiď si vlastní pokoj.",
  login: "Přihlásit se",
  loadError: "Nepodařilo se načíst pokoj.",
  actionError: "Akce se nepovedla. Zkus to znovu.",
  roomTab: "Pokoj",
  cardsTab: "Sbírka karet",
  points: "Body: {n}",
  shop: "Nábytek",
  buy: "Koupit ({n} b.)",
  owned: "Máš",
  place: "Postavit",
  remove: "Sundat",
  pickSlot: "Klepni na místo v pokoji, kam nábytek postavit.",
  emptySlot: "Prázdné místo",
  cardsHint: "Karty padají za splněné denní a týdenní výzvy, milníky série a úspěchy. Vzácnější karty dostaneš za těžší výzvy.",
  cardsProgress: "Máš {n} karet",
  cardsXpBonus: "Sbírka zvyšuje XP z aktivit o {n} %",
  rarity: { common: "Běžná", rare: "Vzácná", epic: "Epická" },
  notEnough: "Nemáš dost bodů.",
};

const en: RoomText = {
  nav: "Room",
  title: "My room and collection",
  subtitle: "Furnish your room with points and collect cards for completed challenges.",
  loginNeeded: "Log in to furnish your own room.",
  login: "Log in",
  loadError: "Could not load your room.",
  actionError: "That did not work. Try again.",
  roomTab: "Room",
  cardsTab: "Card collection",
  points: "Points: {n}",
  shop: "Furniture",
  buy: "Buy ({n} pts)",
  owned: "Owned",
  place: "Place",
  remove: "Remove",
  pickSlot: "Tap a spot in the room to place the furniture.",
  emptySlot: "Empty spot",
  cardsHint: "Cards drop for completed daily and weekly challenges, streak milestones and achievements. Harder challenges give rarer cards.",
  cardsProgress: "You have {n} cards",
  cardsXpBonus: "The collection raises activity XP by {n}%",
  rarity: { common: "Common", rare: "Rare", epic: "Epic" },
  notEnough: "Not enough points.",
};

const de: RoomText = {
  nav: "Zimmer",
  title: "Mein Zimmer und Sammlung",
  subtitle: "Richte dein Zimmer mit Punkten ein und sammle Karten für erledigte Aufgaben.",
  loginNeeded: "Melde dich an, um dein eigenes Zimmer einzurichten.",
  login: "Anmelden",
  loadError: "Das Zimmer konnte nicht geladen werden.",
  actionError: "Das hat nicht geklappt. Versuch es noch einmal.",
  roomTab: "Zimmer",
  cardsTab: "Kartensammlung",
  points: "Punkte: {n}",
  shop: "Möbel",
  buy: "Kaufen ({n} P.)",
  owned: "Gekauft",
  place: "Aufstellen",
  remove: "Entfernen",
  pickSlot: "Tippe auf einen Platz im Zimmer, um das Möbelstück aufzustellen.",
  emptySlot: "Freier Platz",
  cardsHint: "Karten gibt es für erledigte tägliche und wöchentliche Aufgaben, Serien-Meilensteine und Erfolge. Schwerere Aufgaben bringen seltenere Karten.",
  cardsProgress: "Du hast {n} Karten",
  cardsXpBonus: "Die Sammlung erhöht die XP aus Aktivitäten um {n} %",
  rarity: { common: "Gewöhnlich", rare: "Selten", epic: "Episch" },
  notEnough: "Nicht genug Punkte.",
};

const ru: RoomText = {
  nav: "Комната",
  title: "Моя комната и коллекция",
  subtitle: "Обставь комнату за баллы и собирай карточки за выполненные задания.",
  loginNeeded: "Войди, чтобы обставить свою комнату.",
  login: "Войти",
  loadError: "Не удалось загрузить комнату.",
  actionError: "Не получилось. Попробуй ещё раз.",
  roomTab: "Комната",
  cardsTab: "Коллекция карточек",
  points: "Баллы: {n}",
  shop: "Мебель",
  buy: "Купить ({n} б.)",
  owned: "Есть",
  place: "Поставить",
  remove: "Убрать",
  pickSlot: "Нажми на место в комнате, чтобы поставить мебель.",
  emptySlot: "Свободное место",
  cardsHint: "Карточки выпадают за ежедневные и недельные задания, этапы серии и достижения. За трудные задания карточки реже.",
  cardsProgress: "У тебя карточек: {n}",
  cardsXpBonus: "Коллекция повышает XP за активности на {n} %",
  rarity: { common: "Обычная", rare: "Редкая", epic: "Эпическая" },
  notEnough: "Не хватает баллов.",
};

const texts: Record<Locale, RoomText> = {
  ...withFallbacks({ cs, en, de, ru }),
  uk: {
    nav: "Кімната",
    title: "Моя кімната й колекція",
    subtitle: "Облаштуй кімнату меблями за бали й збирай картки за виконані виклики.",
    loginNeeded: "Увійди, щоб облаштувати власну кімнату.",
    login: "Увійти",
    loadError: "Не вдалося завантажити кімнату.",
    actionError: "Не вийшло. Спробуй ще раз.",
    roomTab: "Кімната",
    cardsTab: "Колекція карток",
    points: "Бали: {n}",
    shop: "Меблі",
    buy: "Купити ({n} б.)",
    owned: "Є",
    place: "Поставити",
    remove: "Прибрати",
    pickSlot: "Торкнися місця в кімнаті, куди поставити меблі.",
    emptySlot: "Вільне місце",
    cardsHint: "Картки випадають за виконані щоденні та тижневі виклики, етапи серії й досягнення. За складніші виклики — рідкісніші картки.",
    cardsProgress: "У тебе {n} карток",
    cardsXpBonus: "Колекція підвищує XP за активності на {n} %",
    rarity: { common: "Звичайна", rare: "Рідкісна", epic: "Епічна" },
    notEnough: "Не вистачає балів.",
  },
  ja: {
    nav: "へや",
    title: "わたしのへやとコレクション",
    subtitle: "ポイントで家具をそろえて、クリアしたチャレンジでカードを集めよう。",
    loginNeeded: "ログインすると、自分のへやを飾れます。",
    login: "ログイン",
    loadError: "へやを読み込めませんでした。",
    actionError: "うまくいきませんでした。もう一度お試しください。",
    roomTab: "へや",
    cardsTab: "カードコレクション",
    points: "ポイント: {n}",
    shop: "家具",
    buy: "購入 ({n} ポイント)",
    owned: "持っています",
    place: "置く",
    remove: "しまう",
    pickSlot: "へやの場所をタップして、家具を置きましょう。",
    emptySlot: "空きスペース",
    cardsHint: "カードは、毎日・毎週のチャレンジ、連続記録の節目、実績で手に入ります。難しいチャレンジほど、レアなカードが出やすくなります。",
    cardsProgress: "カードを{n}枚持っています",
    cardsXpBonus: "コレクションで、活動のXPが{n}%アップします",
    rarity: { common: "ふつう", rare: "レア", epic: "エピック" },
    notEnough: "ポイントが足りません。",
  },
  es: {
    nav: "Habitación",
    title: "Mi habitación y colección",
    subtitle: "Decora tu habitación con puntos y colecciona cartas por los retos completados.",
    loginNeeded: "Inicia sesión para decorar tu propia habitación.",
    login: "Iniciar sesión",
    loadError: "No se pudo cargar tu habitación.",
    actionError: "La acción no ha funcionado. Inténtalo de nuevo.",
    roomTab: "Habitación",
    cardsTab: "Colección de cartas",
    points: "Puntos: {n}",
    shop: "Muebles",
    buy: "Comprar ({n} p.)",
    owned: "Tienes",
    place: "Colocar",
    remove: "Quitar",
    pickSlot: "Toca un sitio de la habitación para colocar el mueble.",
    emptySlot: "Sitio vacío",
    cardsHint: "Las cartas salen al completar los retos diarios y semanales, los hitos de racha y los logros. Los retos más difíciles dan cartas más raras.",
    cardsProgress: "Tienes {n} cartas",
    cardsXpBonus: "La colección aumenta el XP de las actividades un {n} %",
    rarity: { common: "Común", rare: "Rara", epic: "Épica" },
    notEnough: "No tienes suficientes puntos.",
  },
  fr: {
    nav: "Chambre",
    title: "Ma chambre et ma collection",
    subtitle: "Aménage ta chambre avec des points et collecte des cartes pour les défis réussis.",
    loginNeeded: "Connecte-toi pour aménager ta propre chambre.",
    login: "Se connecter",
    loadError: "Impossible de charger ta chambre.",
    actionError: "Ça n'a pas marché. Réessaie.",
    roomTab: "Chambre",
    cardsTab: "Collection de cartes",
    points: "Points : {n}",
    shop: "Meubles",
    buy: "Acheter ({n} pts)",
    owned: "Possédé",
    place: "Placer",
    remove: "Retirer",
    pickSlot: "Touche un endroit de la chambre pour y placer le meuble.",
    emptySlot: "Emplacement libre",
    cardsHint: "Les cartes tombent après les défis quotidiens et hebdomadaires, les paliers de série et les succès. Les défis plus difficiles donnent des cartes plus rares.",
    cardsProgress: "Tu as {n} cartes",
    cardsXpBonus: "La collection augmente l'XP des activités de {n} %",
    rarity: { common: "Commune", rare: "Rare", epic: "Épique" },
    notEnough: "Tu n'as pas assez de points.",
  },
};
export const getRoomText = (locale: Locale) => texts[locale];
