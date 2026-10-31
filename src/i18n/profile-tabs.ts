import type { Locale } from "./config";

// Hlavní záložky profilu a texty přehledu, sbírky a nového výběru barev.
export type ProfileTabsText = {
  tabs: { overview: string; collection: string; wardrobe: string; tasks: string };
  nextUnlocks: string;
  nextUnlocksHint: string;
  atLevel: string;
  allUnlocked: string;
  quick: string;
  quickLinks: { courses: string; review: string; shop: string; town: string };
  collectionTitle: string;
  collectionHint: string;
  kinds: { avatars: string; titles: string; frames: string; banners: string };
  pickPart: string;
  pickColor: string;
  custom: string;
  shades: { light: string; bright: string; dark: string };
};

const T: Record<Locale, ProfileTabsText> = {
  cs: {
    tabs: { overview: "Přehled", collection: "Sbírka", wardrobe: "Šatník", tasks: "Úkoly" },
    nextUnlocks: "Co odemkneš dál",
    nextUnlocksHint: "Sbírej XP v testech a hrách a s každou úrovní získáš novou postavu nebo titul.",
    atLevel: "Úroveň {n}",
    allUnlocked: "Všechno za úrovně už máš odemčené. Paráda!",
    quick: "Rychle do akce",
    quickLinks: { courses: "Procvičovat", review: "Opakování", shop: "Obchod", town: "Městečko" },
    collectionTitle: "Moje sbírka",
    collectionHint: "Kolik toho už máš. Další věci najdeš v obchodě, v únikovkách a za úrovně.",
    kinds: { avatars: "Postavy", titles: "Tituly", frames: "Rámečky", banners: "Pozadí" },
    pickPart: "1. Vyber část postavy",
    pickColor: "2. Vyber barvu",
    custom: "Vlastní barva",
    shades: { light: "Světlé", bright: "Syté", dark: "Tmavé" },
  },
  en: {
    tabs: { overview: "Overview", collection: "Collection", wardrobe: "Wardrobe", tasks: "Tasks" },
    nextUnlocks: "Coming up next",
    nextUnlocksHint: "Earn XP in tests and games; every level unlocks a new character or title.",
    atLevel: "Level {n}",
    allUnlocked: "You've unlocked everything from levels. Awesome!",
    quick: "Jump in",
    quickLinks: { courses: "Practise", review: "Review", shop: "Shop", town: "Town" },
    collectionTitle: "My collection",
    collectionHint: "What you've got so far. Find more in the shop, escape rooms and by levelling up.",
    kinds: { avatars: "Characters", titles: "Titles", frames: "Frames", banners: "Backgrounds" },
    pickPart: "1. Pick a part",
    pickColor: "2. Pick a colour",
    custom: "Custom colour",
    shades: { light: "Light", bright: "Bright", dark: "Dark" },
  },
  de: {
    tabs: { overview: "Übersicht", collection: "Sammlung", wardrobe: "Kleiderschrank", tasks: "Aufgaben" },
    nextUnlocks: "Als Nächstes",
    nextUnlocksHint: "Sammle XP in Tests und Spielen; jede Stufe schaltet eine Figur oder einen Titel frei.",
    atLevel: "Stufe {n}",
    allUnlocked: "Du hast alles aus den Stufen freigeschaltet. Super!",
    quick: "Los geht's",
    quickLinks: { courses: "Üben", review: "Wiederholen", shop: "Shop", town: "Städtchen" },
    collectionTitle: "Meine Sammlung",
    collectionHint: "Was du schon hast. Mehr gibt es im Shop, in Escape-Rooms und für Stufen.",
    kinds: { avatars: "Figuren", titles: "Titel", frames: "Rahmen", banners: "Hintergründe" },
    pickPart: "1. Wähle einen Teil",
    pickColor: "2. Wähle eine Farbe",
    custom: "Eigene Farbe",
    shades: { light: "Hell", bright: "Kräftig", dark: "Dunkel" },
  },
  ru: {
    tabs: { overview: "Обзор", collection: "Коллекция", wardrobe: "Гардероб", tasks: "Задания" },
    nextUnlocks: "Что откроешь дальше",
    nextUnlocksHint: "Набирай XP в тестах и играх: каждый уровень открывает персонажа или титул.",
    atLevel: "Уровень {n}",
    allUnlocked: "Всё за уровни уже открыто. Отлично!",
    quick: "Вперёд",
    quickLinks: { courses: "Тренироваться", review: "Повторение", shop: "Магазин", town: "Городок" },
    collectionTitle: "Моя коллекция",
    collectionHint: "Что у тебя уже есть. Больше — в магазине, квестах и за уровни.",
    kinds: { avatars: "Персонажи", titles: "Титулы", frames: "Рамки", banners: "Фоны" },
    pickPart: "1. Выбери часть",
    pickColor: "2. Выбери цвет",
    custom: "Свой цвет",
    shades: { light: "Светлые", bright: "Яркие", dark: "Тёмные" },
  },
};

export function getProfileTabsText(locale: Locale): ProfileTabsText {
  return T[locale];
}
