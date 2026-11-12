import type { Locale } from "./config";

// Texty herního lobby na úvodní stránce.
export type HomeLobbyText = {
  title: string;
  tabs: { play: string; challenge: string; together: string };
  promoTag: string;
  promoTitle: string;
  promoText: string;
  promoCta: string;
  endsIn: string;
  playBtn: string;
  quick: { label: string; key: string }[];
  games: Record<string, { name: string; tag: string }>;
};

const cs: HomeLobbyText = {
  title: "Co dnes zahrajeme?",
  tabs: { play: "Hry", challenge: "Výzvy", together: "Spolu" },
  promoTag: "Denní výzva",
  promoTitle: "Denní kvíz",
  promoText: "Každý den nové otázky. Za správné odpovědi dostaneš body navíc.",
  promoCta: "Spustit kvíz",
  endsIn: "Končí za",
  playBtn: "Hrát",
  quick: [
    { key: "daily", label: "Denní kvíz" },
    { key: "boards", label: "Žebříčky" },
    { key: "review", label: "Opakování" },
    { key: "shop", label: "Obchod" },
  ],
  games: {
    farm: { name: "Farma", tag: "Pěstuj a učení tě odmění" },
    city: { name: "Město", tag: "Stav a rozšiřuj" },
    economy: { name: "Ekonomika", tag: "Banka, trh a investice" },
    pets: { name: "Mazlíčci", tag: "Starej se o parťáky" },
    escape: { name: "Únikovky", tag: "Vyřeš úkoly a vyjdi ven" },
    daily: { name: "Denní kvíz", tag: "Nové otázky každý den" },
    review: { name: "Opakování", tag: "Procvič, co ti nejde" },
    boards: { name: "Žebříčky", tag: "Porovnej se s ostatními" },
    together: { name: "Hrát společně", tag: "Kvíz s kódem pro celou třídu" },
    shop: { name: "Obchod", tag: "Rámečky, vylepšení a odměny" },
  },
};

const en: HomeLobbyText = {
  title: "What shall we play today?",
  tabs: { play: "Games", challenge: "Challenges", together: "Together" },
  promoTag: "Daily challenge",
  promoTitle: "Daily quiz",
  promoText: "New questions every day. Correct answers earn bonus points.",
  promoCta: "Start the quiz",
  endsIn: "Ends in",
  playBtn: "Play",
  quick: [
    { key: "daily", label: "Daily quiz" },
    { key: "boards", label: "Leaderboards" },
    { key: "review", label: "Review" },
    { key: "shop", label: "Shop" },
  ],
  games: {
    farm: { name: "Farm", tag: "Grow it, learning pays off" },
    city: { name: "City", tag: "Build and expand" },
    economy: { name: "Economy", tag: "Bank, market and investing" },
    pets: { name: "Pets", tag: "Look after your companions" },
    escape: { name: "Escape rooms", tag: "Solve tasks and get out" },
    daily: { name: "Daily quiz", tag: "New questions every day" },
    review: { name: "Review", tag: "Practise what is hard" },
    boards: { name: "Leaderboards", tag: "Compare with others" },
    together: { name: "Play together", tag: "Quiz with a code for the class" },
    shop: { name: "Shop", tag: "Frames, upgrades and rewards" },
  },
};

const de: HomeLobbyText = {
  title: "Was spielen wir heute?",
  tabs: { play: "Spiele", challenge: "Herausforderungen", together: "Gemeinsam" },
  promoTag: "Tägliche Herausforderung",
  promoTitle: "Tagesquiz",
  promoText: "Jeden Tag neue Fragen. Richtige Antworten bringen Extrapunkte.",
  promoCta: "Quiz starten",
  endsIn: "Endet in",
  playBtn: "Spielen",
  quick: [
    { key: "daily", label: "Tagesquiz" },
    { key: "boards", label: "Ranglisten" },
    { key: "review", label: "Wiederholung" },
    { key: "shop", label: "Shop" },
  ],
  games: {
    farm: { name: "Farm", tag: "Pflanze an, Lernen zahlt sich aus" },
    city: { name: "Stadt", tag: "Bauen und ausbauen" },
    economy: { name: "Ökonomie", tag: "Bank, Markt und Investieren" },
    pets: { name: "Haustiere", tag: "Kümmere dich um deine Freunde" },
    escape: { name: "Escape-Räume", tag: "Löse Aufgaben und komm raus" },
    daily: { name: "Tagesquiz", tag: "Jeden Tag neue Fragen" },
    review: { name: "Wiederholung", tag: "Übe, was dir schwerfällt" },
    boards: { name: "Ranglisten", tag: "Vergleiche dich mit anderen" },
    together: { name: "Gemeinsam spielen", tag: "Quiz mit Code für die ganze Klasse" },
    shop: { name: "Shop", tag: "Rahmen, Upgrades und Belohnungen" },
  },
};

const ru: HomeLobbyText = {
  title: "Во что сегодня играем?",
  tabs: { play: "Игры", challenge: "Задания", together: "Вместе" },
  promoTag: "Задание дня",
  promoTitle: "Ежедневная викторина",
  promoText: "Каждый день новые вопросы. За правильные ответы — дополнительные очки.",
  promoCta: "Начать викторину",
  endsIn: "Закончится через",
  playBtn: "Играть",
  quick: [
    { key: "daily", label: "Викторина дня" },
    { key: "boards", label: "Рейтинги" },
    { key: "review", label: "Повторение" },
    { key: "shop", label: "Магазин" },
  ],
  games: {
    farm: { name: "Ферма", tag: "Выращивай, и учёба окупится" },
    city: { name: "Город", tag: "Строй и расширяй" },
    economy: { name: "Экономика", tag: "Банк, рынок и инвестиции" },
    pets: { name: "Питомцы", tag: "Заботься о друзьях" },
    escape: { name: "Квесты", tag: "Решай задачи и выбирайся" },
    daily: { name: "Викторина дня", tag: "Каждый день новые вопросы" },
    review: { name: "Повторение", tag: "Потренируй то, что не получается" },
    boards: { name: "Рейтинги", tag: "Сравни себя с другими" },
    together: { name: "Играть вместе", tag: "Викторина с кодом для всего класса" },
    shop: { name: "Магазин", tag: "Рамки, улучшения и награды" },
  },
};

const uk: HomeLobbyText = {
  title: "Що зіграємо сьогодні?",
  tabs: { play: "Ігри", challenge: "Виклики", together: "Разом" },
  promoTag: "Щоденний виклик",
  promoTitle: "Щоденна вікторина",
  promoText: "Щодня нові питання. За правильні відповіді — додаткові бали.",
  promoCta: "Почати вікторину",
  endsIn: "Закінчиться через",
  playBtn: "Грати",
  quick: [
    { key: "daily", label: "Щоденна вікторина" },
    { key: "boards", label: "Рейтинги" },
    { key: "review", label: "Повторення" },
    { key: "shop", label: "Магазин" },
  ],
  games: {
    farm: { name: "Ферма", tag: "Вирощуй, і навчання окупиться" },
    city: { name: "Місто", tag: "Будуй і розширюй" },
    economy: { name: "Економіка", tag: "Банк, ринок і інвестиції" },
    pets: { name: "Улюбленці", tag: "Піклуйся про своїх друзів" },
    escape: { name: "Квест-кімнати", tag: "Розв'язуй завдання і вибирайся" },
    daily: { name: "Щоденна вікторина", tag: "Щодня нові питання" },
    review: { name: "Повторення", tag: "Потренуй те, що не виходить" },
    boards: { name: "Рейтинги", tag: "Порівняй себе з іншими" },
    together: { name: "Грати разом", tag: "Вікторина з кодом для всього класу" },
    shop: { name: "Магазин", tag: "Рамки, покращення та нагороди" },
  },
};

const ja: HomeLobbyText = {
  title: "今日は何をプレイする？",
  tabs: { play: "ゲーム", challenge: "チャレンジ", together: "みんなで" },
  promoTag: "デイリーチャレンジ",
  promoTitle: "デイリークイズ",
  promoText: "毎日新しい問題が出ます。正解するとボーナスポイントがもらえます。",
  promoCta: "クイズを始める",
  endsIn: "終了まで",
  playBtn: "プレイ",
  quick: [
    { key: "daily", label: "デイリークイズ" },
    { key: "boards", label: "ランキング" },
    { key: "review", label: "復習" },
    { key: "shop", label: "ショップ" },
  ],
  games: {
    farm: { name: "ファーム", tag: "育てれば、学びが実を結ぶ" },
    city: { name: "まち", tag: "建てて、広げよう" },
    economy: { name: "経済", tag: "銀行、市場、投資" },
    pets: { name: "ペット", tag: "仲間のお世話をしよう" },
    escape: { name: "脱出ゲーム", tag: "課題を解いて外へ出よう" },
    daily: { name: "デイリークイズ", tag: "毎日新しい問題" },
    review: { name: "復習", tag: "苦手なところを練習" },
    boards: { name: "ランキング", tag: "ほかの人と比べよう" },
    together: { name: "みんなで遊ぶ", tag: "クラス全員で使えるコード付きクイズ" },
    shop: { name: "ショップ", tag: "フレーム、アップグレード、ごほうび" },
  },
};

const es: HomeLobbyText = {
  title: "¿A qué jugamos hoy?",
  tabs: { play: "Juegos", challenge: "Retos", together: "Juntos" },
  promoTag: "Reto diario",
  promoTitle: "Test diario",
  promoText: "Preguntas nuevas cada día. Las respuestas correctas dan puntos extra.",
  promoCta: "Empezar el test",
  endsIn: "Termina en",
  playBtn: "Jugar",
  quick: [
    { key: "daily", label: "Test diario" },
    { key: "boards", label: "Clasificaciones" },
    { key: "review", label: "Repaso" },
    { key: "shop", label: "Tienda" },
  ],
  games: {
    farm: { name: "Granja", tag: "Cultiva y aprender tiene recompensa" },
    city: { name: "Pueblo", tag: "Construye y amplía" },
    economy: { name: "Economía", tag: "Banco, mercado e inversiones" },
    pets: { name: "Mascotas", tag: "Cuida a tus compañeros" },
    escape: { name: "Escape", tag: "Resuelve tareas y sal de ahí" },
    daily: { name: "Test diario", tag: "Preguntas nuevas cada día" },
    review: { name: "Repaso", tag: "Practica lo que más te cuesta" },
    boards: { name: "Clasificaciones", tag: "Compárate con los demás" },
    together: { name: "Jugar juntos", tag: "Test con código para toda la clase" },
    shop: { name: "Tienda", tag: "Marcos, mejoras y recompensas" },
  },
};

const fr: HomeLobbyText = {
  title: "À quoi on joue aujourd'hui ?",
  tabs: { play: "Jeux", challenge: "Défis", together: "Ensemble" },
  promoTag: "Défi du jour",
  promoTitle: "Quiz du jour",
  promoText: "De nouvelles questions chaque jour. Les bonnes réponses rapportent des points bonus.",
  promoCta: "Lancer le quiz",
  endsIn: "Se termine dans",
  playBtn: "Jouer",
  quick: [
    { key: "daily", label: "Quiz du jour" },
    { key: "boards", label: "Classements" },
    { key: "review", label: "Révision" },
    { key: "shop", label: "Boutique" },
  ],
  games: {
    farm: { name: "Ferme", tag: "Cultive, et l'apprentissage paie" },
    city: { name: "Ville", tag: "Construis et agrandis" },
    economy: { name: "Économie", tag: "Banque, marché et investissements" },
    pets: { name: "Animaux", tag: "Prends soin de tes compagnons" },
    escape: { name: "Évasion", tag: "Résous les défis et sors" },
    daily: { name: "Quiz du jour", tag: "De nouvelles questions chaque jour" },
    review: { name: "Révision", tag: "Entraîne ce qui te pose problème" },
    boards: { name: "Classements", tag: "Compare-toi aux autres" },
    together: { name: "Jouer ensemble", tag: "Quiz avec un code pour toute la classe" },
    shop: { name: "Boutique", tag: "Cadres, améliorations et récompenses" },
  },
};

const all: Record<Locale, HomeLobbyText> = { cs, en, de, ru, uk, ja, es, fr };
export function getHomeLobbyText(locale: Locale): HomeLobbyText {
  return all[locale];
}
