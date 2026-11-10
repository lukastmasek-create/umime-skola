import { withFallbacks } from "./config";
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

const all = withFallbacks({ cs, en, de: en, ru: en });
export function getHomeLobbyText(locale: Locale): HomeLobbyText {
  return all[locale];
}
