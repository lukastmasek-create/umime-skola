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
  rarity: { common: "Обычная", rare: "Редкая", epic: "Эпическая" },
  notEnough: "Не хватает баллов.",
};

const texts: Record<Locale, RoomText> = { cs, en, de, ru };
export const getRoomText = (locale: Locale) => texts[locale];
