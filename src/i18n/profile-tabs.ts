import { withFallbacks } from "./config";
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
  ...withFallbacks({
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
  }),
  uk: {
    tabs: { overview: "Огляд", collection: "Колекція", wardrobe: "Гардероб", tasks: "Завдання" },
    nextUnlocks: "Що відкриєш далі",
    nextUnlocksHint: "Набирай XP у тестах і іграх: кожен рівень відкриває нового персонажа або титул.",
    atLevel: "Рівень {n}",
    allUnlocked: "Усе за рівні вже відкрито. Чудово!",
    quick: "Вперед",
    quickLinks: { courses: "Тренуватися", review: "Повторення", shop: "Магазин", town: "Містечко" },
    collectionTitle: "Моя колекція",
    collectionHint: "Що в тебе вже є. Більше — у магазині, квестах і за рівні.",
    kinds: { avatars: "Персонажі", titles: "Титули", frames: "Рамки", banners: "Фони" },
    pickPart: "1. Обери частину",
    pickColor: "2. Обери колір",
    custom: "Свій колір",
    shades: { light: "Світлі", bright: "Яскраві", dark: "Темні" },
  },
  ja: {
    tabs: { overview: "概要", collection: "コレクション", wardrobe: "衣装", tasks: "クエスト" },
    nextUnlocks: "次に解放されるもの",
    nextUnlocksHint: "テストやゲームでXPをためると、レベルアップごとに新しいキャラクターや称号が手に入ります。",
    atLevel: "レベル {n}",
    allUnlocked: "レベルで解放できるものはすべて解放済みです。すごい！",
    quick: "すぐに始める",
    quickLinks: { courses: "練習する", review: "復習", shop: "ショップ", town: "まち" },
    collectionTitle: "マイコレクション",
    collectionHint: "今持っているもの。ほかのものはショップ、脱出ルーム、レベルアップで見つかります。",
    kinds: { avatars: "キャラクター", titles: "称号", frames: "枠", banners: "背景" },
    pickPart: "1. パーツを選ぶ",
    pickColor: "2. 色を選ぶ",
    custom: "好きな色",
    shades: { light: "明るい", bright: "鮮やか", dark: "暗い" },
  },
  es: {
    tabs: { overview: "Resumen", collection: "Colección", wardrobe: "Armario", tasks: "Tareas" },
    nextUnlocks: "Lo próximo que desbloqueas",
    nextUnlocksHint: "Gana XP en pruebas y juegos; cada nivel desbloquea un personaje nuevo o un título.",
    atLevel: "Nivel {n}",
    allUnlocked: "Ya tienes desbloqueado todo lo de los niveles. ¡Genial!",
    quick: "Empieza ya",
    quickLinks: { courses: "Practicar", review: "Repaso", shop: "Tienda", town: "Pueblo" },
    collectionTitle: "Mi colección",
    collectionHint: "Lo que ya tienes. Encontrarás más en la tienda, en los escape rooms y subiendo de nivel.",
    kinds: { avatars: "Personajes", titles: "Títulos", frames: "Marcos", banners: "Fondos" },
    pickPart: "1. Elige una parte",
    pickColor: "2. Elige un color",
    custom: "Color propio",
    shades: { light: "Claros", bright: "Vivos", dark: "Oscuros" },
  },
  fr: {
    tabs: { overview: "Aperçu", collection: "Collection", wardrobe: "Garde-robe", tasks: "Tâches" },
    nextUnlocks: "Ce que tu débloques ensuite",
    nextUnlocksHint: "Gagne de l'XP dans les tests et les jeux : chaque niveau débloque un nouveau personnage ou titre.",
    atLevel: "Niveau {n}",
    allUnlocked: "Tu as déjà débloqué tout ce qui est lié aux niveaux. Bravo !",
    quick: "Go !",
    quickLinks: { courses: "S'entraîner", review: "Révision", shop: "Boutique", town: "Village" },
    collectionTitle: "Ma collection",
    collectionHint: "Ce que tu as déjà. D'autres objets se trouvent dans la boutique, les escape rooms et en montant de niveau.",
    kinds: { avatars: "Personnages", titles: "Titres", frames: "Cadres", banners: "Fonds" },
    pickPart: "1. Choisis une partie",
    pickColor: "2. Choisis une couleur",
    custom: "Couleur personnalisée",
    shades: { light: "Clairs", bright: "Vifs", dark: "Foncés" },
  },
};

export function getProfileTabsText(locale: Locale): ProfileTabsText {
  return T[locale];
}
