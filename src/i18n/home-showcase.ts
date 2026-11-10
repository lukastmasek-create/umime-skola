import { withFallbacks } from "./config";
import type { Locale } from "./config";

// Texty pro sekci „Vyzkoušej si to“ na úvodní stránce (ukázky interakcí).
export type HomeShowcaseText = {
  title: string;
  lead: string;
  groups: { motion: string; effects: string; widgets: string };
  cards: {
    ripple: string;
    particles: string;
    particlesHint: string;
    typing: string;
    typingWords: string[];
    ticker: string;
    tickerAdd: string;
    tickerReset: string;
    fill: string;
    fillIdle: string;
    fillHover: string;
    lives: string;
    comboHint: string;
    right: string;
    wrong: string;
    addLife: string;
    gameOver: string;
    rewards: string;
    claimCoins: string;
    levelUp: string;
    levelDone: string;
    dock: string;
    dockItems: string[];
    island: string;
    islandModes: { idle: string; timer: string; score: string; full: string };
    islandTitles: { idle: string; timer: string; score: string; scoreSub: string; full: string; fullSub: string };
    shortcuts: string;
    shortcutsHint: string;
    shortcutItems: string[];
    folder: string;
    folderLabel: string;
    folderPapers: string[];
    lamp: string;
    lampTitle: string;
    replay: string;
    loader: string;
    loaderSteps: string[];
    loaderRestart: string;
    led: string;
    ledModes: { tournament: string; reward: string; time: string };
    ledTexts: { tournament: string; reward: string; time: string };
    history: string;
    historyFilters: { all: string; income: string; spend: string };
    historyAdd: string;
    historyItems: { label: string; amount: number }[];
    historyToday: string;
    heatmap: string;
    heatmapHint: string;
    heatmapLess: string;
    heatmapMore: string;
    heatmapTip: string;
    study: string;
    studyAdd: string;
    studySubjects: string[];
    dither: string;
    ditherHint: string;
  };
};

const cs: HomeShowcaseText = {
  title: "Vyzkoušej si to",
  lead: "Malé interakce, které z učení dělají hru. Najeď myší, klikej a sleduj, co se stane.",
  groups: { motion: "Pohyb a hra", effects: "Efekty", widgets: "Přehledy" },
  cards: {
    ripple: "Vlny",
    particles: "Částice",
    particlesHint: "Pohni myší nad polem.",
    typing: "Psaní s kurzorem",
    typingWords: ["Zlomky bez stresu", "Anglická slovíčka", "Přijímačky krok za krokem"],
    ticker: "Číselný automat",
    tickerAdd: "+ náhodné body",
    tickerReset: "Vynulovat",
    fill: "Tečka zaplaví tlačítko",
    fillIdle: "Najeď",
    fillHover: "Pokračovat",
    lives: "Životy a kombo",
    comboHint: "Odpovídej správně v řadě",
    right: "Správně",
    wrong: "Špatně",
    addLife: "+ život",
    gameOver: "Konec kola. Zkus to znovu.",
    rewards: "Odměny a oslavy",
    claimCoins: "Vyzvednout 12 mincí",
    levelUp: "Nový level",
    levelDone: "Level",
    dock: "Navigace s pohybem",
    dockItems: ["Domů", "Hry", "Žebříček", "Série", "Úkoly", "Oznámení", "Nastavení"],
    island: "Ostrůvek s proměnou",
    islandModes: { idle: "Klid", timer: "Časovač", score: "Výsledek", full: "Rozbalit" },
    islandTitles: { idle: "Umíme", timer: "Kvíz běží", score: "Skvělé kolo", scoreSub: "+240 bodů, 2. místo", full: "Turnaj týdne", fullSub: "142 hráčů" },
    shortcuts: "Navigace s klávesovými zkratkami",
    shortcutsHint: "Klikni do seznamu a stiskni G a pak písmeno.",
    shortcutItems: ["Domů", "Moje hry", "Žebříček", "Oznámení", "Nastavení"],
    folder: "Složka s úkoly",
    folderLabel: "Úkoly 5. A",
    folderPapers: ["Zlomky, str. 12", "Test z češtiny", "Úkol na pátek"],
    lamp: "Lampa nad nadpisem",
    lampTitle: "Vítej v Učíme se hrou",
    replay: "Přehrát znovu",
    loader: "Příprava kola",
    loaderSteps: ["Vybírám otázky", "Míchám odpovědi", "Chystám odměny", "Kolo je připravené"],
    loaderRestart: "Spustit znovu",
    led: "LED displej",
    ledModes: { tournament: "Turnaj", reward: "Odměna", time: "Čas" },
    ledTexts: { tournament: "TURNAJ ZA 02:14", reward: "+50 BODŮ", time: "ČAS 00:42" },
    history: "Historie bodů",
    historyFilters: { all: "Vše", income: "Příjmy", spend: "Výdaje" },
    historyAdd: "Přidat událost",
    historyItems: [
      { label: "Kolo štěstí", amount: 20 },
      { label: "Denní výzva", amount: 50 },
      { label: "Rámeček „Zlatá koruna“", amount: -250 },
      { label: "Odpověď v Blesku", amount: 10 },
    ],
    historyToday: "dnes",
    heatmap: "Mapa aktivity",
    heatmapHint: "Najeď na čtvereček.",
    heatmapLess: "Méně",
    heatmapMore: "Více",
    heatmapTip: "{n} cvičení",
    study: "Studijní čas po předmětech",
    studyAdd: "+10 min k předmětu",
    studySubjects: ["Matematika", "Čeština", "Angličtina"],
    dither: "Dither field",
    ditherHint: "Pohni myší nad polem.",
  },
};

const en: HomeShowcaseText = {
  title: "Try it out",
  lead: "Small interactions that turn learning into a game. Hover, click and see what happens.",
  groups: { motion: "Motion and play", effects: "Effects", widgets: "Dashboards" },
  cards: {
    ripple: "Ripples",
    particles: "Particles",
    particlesHint: "Move the mouse over the box.",
    typing: "Typewriter",
    typingWords: ["Fractions without stress", "English vocabulary", "Entrance exams step by step"],
    ticker: "Number ticker",
    tickerAdd: "+ random points",
    tickerReset: "Reset",
    fill: "Dot fills the button",
    fillIdle: "Hover",
    fillHover: "Continue",
    lives: "Lives and combo",
    comboHint: "Answer correctly in a row",
    right: "Correct",
    wrong: "Wrong",
    addLife: "+ life",
    gameOver: "Round over. Try again.",
    rewards: "Rewards and celebrations",
    claimCoins: "Claim 12 coins",
    levelUp: "Level up",
    levelDone: "Level",
    dock: "Navigation with motion",
    dockItems: ["Home", "Games", "Leaderboard", "Streak", "Tasks", "Notifications", "Settings"],
    island: "Morphing island",
    islandModes: { idle: "Idle", timer: "Timer", score: "Result", full: "Expand" },
    islandTitles: { idle: "Umíme", timer: "Quiz running", score: "Great round", scoreSub: "+240 points, 2nd place", full: "Tournament of the week", fullSub: "142 players" },
    shortcuts: "Navigation with keyboard shortcuts",
    shortcutsHint: "Click the list, press G and then a letter.",
    shortcutItems: ["Home", "My games", "Leaderboard", "Notifications", "Settings"],
    folder: "Folder of tasks",
    folderLabel: "Tasks 5.A",
    folderPapers: ["Fractions, p. 12", "Language test", "Friday task"],
    lamp: "Lamp over a heading",
    lampTitle: "Welcome to Learning by Playing",
    replay: "Replay",
    loader: "Getting the round ready",
    loaderSteps: ["Picking questions", "Shuffling answers", "Preparing rewards", "The round is ready"],
    loaderRestart: "Run again",
    led: "LED display",
    ledModes: { tournament: "Tournament", reward: "Reward", time: "Time" },
    ledTexts: { tournament: "TOURNAMENT IN 02:14", reward: "+50 POINTS", time: "TIME 00:42" },
    history: "Points history",
    historyFilters: { all: "All", income: "Earned", spend: "Spent" },
    historyAdd: "Add event",
    historyItems: [
      { label: "Wheel of fortune", amount: 20 },
      { label: "Daily challenge", amount: 50 },
      { label: "“Golden crown” frame", amount: -250 },
      { label: "Answer in Blitz", amount: 10 },
    ],
    historyToday: "today",
    heatmap: "Activity map",
    heatmapHint: "Hover over a square.",
    heatmapLess: "Less",
    heatmapMore: "More",
    heatmapTip: "{n} exercises",
    study: "Study time by subject",
    studyAdd: "+10 min to a subject",
    studySubjects: ["Maths", "Czech", "English"],
    dither: "Dither field",
    ditherHint: "Move the mouse over the box.",
  },
};

const all = withFallbacks({ cs, en, de: en, ru: en });

export function getHomeShowcaseText(locale: Locale): HomeShowcaseText {
  return all[locale];
}
