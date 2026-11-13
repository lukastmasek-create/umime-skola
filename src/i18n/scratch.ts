import { withFallbacks } from "./config";
import type { Locale } from "./config";

export type ScratchText = {
  nav: string;
  title: string;
  subtitle: string;
  run: string;
  stop: string;
  clearAll: string;
  clearConfirm: string;
  palette: string;
  workspace: string;
  stage: string;
  stageHint: string;
  noHat: string;
  loginHint: string;
  loginLink: string;
  saving: string;
  saved: string;
  saveFailed: string;
  limit: string;
  addHint: string;
  removeBlock: string;
  dragBlock: string;
  error: string;
  argsHint: string;
  categories: Record<"events" | "motion" | "pen" | "control" | "looks" | "custom", string>;
  // Text bloku s místy pro vstupy ve složených závorkách, např. "jdi na x: {x} y: {y}".
  blocks: Record<string, string>;
  fieldNames: Record<string, string>;
  options: Record<string, string>;
  customize: string;
  customizeTitle: string;
  menuSize: string;
  stageSize: string;
  sizeS: string;
  sizeM: string;
  sizeL: string;
  hiddenBlocks: string;
  showCategory: string;
  showBlock: string;
  resetPrefs: string;
  challengesTitle: string;
  challengeHint: string;
  challengeDone: string;
  challengeRetry: string;
  challengeNone: string;
  challenges: Record<string, { title: string; goal: string }>;
};

const CS: ScratchText = {
  nav: "Scratch",
  title: "Scratch",
  subtitle: "Skládej bloky, programuj postavičku a kresli. Stačí tahat bloky do pracovní plochy a stisknout vlajku.",
  run: "Spustit",
  stop: "Zastavit",
  clearAll: "Smazat vše",
  clearConfirm: "Opravdu smazat všechny bloky?",
  palette: "Bloky",
  workspace: "Tvoje skripty",
  stage: "Jeviště",
  stageHint: "Začni blokem „Po kliknutí na vlajku“, pak přidej další bloky pod něj.",
  noHat: "Nejdřív přidej blok „Po kliknutí na vlajku“, ten spustí skript.",
  loginHint: "Přihlas se, aby se tvoje skripty uložily do účtu.",
  loginLink: "Přihlásit se",
  saving: "Ukládám…",
  saved: "Uloženo",
  saveFailed: "Nepodařilo se uložit, zkus to znovu.",
  limit: "Dosáhl/a jsi limitu bloků.",
  addHint: "Klikni na blok a přidá se dolů, nebo ho přetáhni na místo.",
  removeBlock: "Odstranit blok",
  dragBlock: "Přesunout blok",
  error: "Něco se pokazilo",
  argsHint: "Hodnoty odděl čárkou. Místo čísla můžeš použít $jmeno parametru.",
  categories: {
    events: "Události",
    motion: "Pohyb",
    pen: "Malování",
    control: "Opakování",
    looks: "Vzhled a data",
    custom: "Vlastní bloky",
  },
  blocks: {
    start: "Po kliknutí na vlajku",
    goto: "jdi na x: {x} y: {y}",
    random: "jdi na náhodné místo",
    step: "jdi o {steps} kroků vpřed",
    glide: "klouzej do x: {x} y: {y} za {secs} s",
    "turn-right": "otoč se doprava o {deg}°",
    "turn-left": "otoč se doleva o {deg}°",
    edge: "pokud jsi na okraji, odraz",
    pen: "{mode} pero",
    "pen-color": "barva pera {color}",
    "pen-size": "tloušťka pera {size}",
    clear: "vymazat kreslení",
    repeat: "opakuj {times}×",
    forever: "opakuj donekonečna",
    wait: "počkej {secs} s",
    stop: "zastav vše",
    say: "řekni {text}",
    "set-var": "nastav {name} na {value}",
    define: "definuj blok {name} s parametry {params}",
    call: "zavolej blok {name} s hodnotami {args}",
  },
  fieldNames: {
    x: "x souřadnice",
    y: "y souřadnice",
    steps: "počet kroků",
    secs: "sekund",
    deg: "stupňů",
    mode: "režim",
    color: "barva",
    size: "tloušťka",
    times: "počet opakování",
    text: "text",
    name: "název",
    value: "hodnota",
    params: "parametry",
    args: "hodnoty",
  },
  options: {
    down: "spusť",
    up: "zvedni",
  },
  customize: "Přizpůsobit",
  customizeTitle: "Jak chceš mít studio?",
  menuSize: "Velikost menu",
  stageSize: "Velikost jeviště",
  sizeS: "Malé",
  sizeM: "Střední",
  sizeL: "Velké",
  hiddenBlocks: "Schovat bloky, které nepoužíváš",
  showCategory: "Ukázat celou kategorii",
  showBlock: "Ukázat blok",
  resetPrefs: "Vrátit výchozí",
  challengesTitle: "Výzvy",
  challengeHint: "Vyber výzvu, sestav skript a stiskni vlajku.",
  challengeDone: "Splněno, paráda!",
  challengeRetry: "Ještě to nevyšlo, zkus to znovu.",
  challengeNone: "Bez výzvy",
  challenges: {
    square: { title: "Nakresli čtverec", goal: "Kočka musí nakreslit uzavřený tvar, třeba čtverec." },
    edge: { title: "Dojdi na okraj", goal: "Dojdi kočkou až k pravému okraji jeviště." },
    lines: { title: "Čárový maraton", goal: "Nakresli aspoň 12 čar." },
  },
};

const EN: ScratchText = {
  nav: "Scratch",
  title: "Scratch",
  subtitle: "Snap blocks together, program a sprite and draw. Drag blocks into the workspace and press the flag.",
  run: "Run",
  stop: "Stop",
  clearAll: "Clear all",
  clearConfirm: "Really delete all blocks?",
  palette: "Blocks",
  workspace: "Your scripts",
  stage: "Stage",
  stageHint: "Start with the “When flag clicked” block, then add more blocks under it.",
  noHat: "First add a “When flag clicked” block. That is what starts a script.",
  loginHint: "Log in to save your scripts to your account.",
  loginLink: "Log in",
  saving: "Saving…",
  saved: "Saved",
  saveFailed: "Could not save, please try again.",
  limit: "You have reached the block limit.",
  addHint: "Click a block to add it at the bottom, or drag it to a place.",
  removeBlock: "Remove block",
  dragBlock: "Move block",
  error: "Something went wrong",
  argsHint: "Separate values with commas. You can use $name for a parameter instead of a number.",
  categories: {
    events: "Events",
    motion: "Motion",
    pen: "Pen",
    control: "Repeat",
    looks: "Looks & data",
    custom: "My blocks",
  },
  blocks: {
    start: "When flag clicked",
    goto: "go to x: {x} y: {y}",
    random: "go to random place",
    step: "move {steps} steps forward",
    glide: "glide to x: {x} y: {y} in {secs} s",
    "turn-right": "turn right {deg}°",
    "turn-left": "turn left {deg}°",
    edge: "if on edge, bounce",
    pen: "{mode} pen",
    "pen-color": "pen color {color}",
    "pen-size": "pen size {size}",
    clear: "clear drawing",
    repeat: "repeat {times}×",
    forever: "forever",
    wait: "wait {secs} s",
    stop: "stop all",
    say: "say {text}",
    "set-var": "set {name} to {value}",
    define: "define block {name} with parameters {params}",
    call: "call block {name} with values {args}",
  },
  fieldNames: {
    x: "x position",
    y: "y position",
    steps: "number of steps",
    secs: "seconds",
    deg: "degrees",
    mode: "mode",
    color: "color",
    size: "size",
    times: "number of repeats",
    text: "text",
    name: "name",
    value: "value",
    params: "parameters",
    args: "values",
  },
  options: {
    down: "down",
    up: "up",
  },
  customize: "Customize",
  customizeTitle: "How do you want your studio?",
  menuSize: "Menu size",
  stageSize: "Stage size",
  sizeS: "Small",
  sizeM: "Medium",
  sizeL: "Large",
  hiddenBlocks: "Hide blocks you don't use",
  showCategory: "Show whole category",
  showBlock: "Show block",
  resetPrefs: "Reset to default",
  challengesTitle: "Challenges",
  challengeHint: "Pick a challenge, build a script and press the flag.",
  challengeDone: "Done, nice one!",
  challengeRetry: "Not quite yet, try again.",
  challengeNone: "No challenge",
  challenges: {
    square: { title: "Draw a square", goal: "Make the cat draw a closed shape, for example a square." },
    edge: { title: "Reach the edge", goal: "Walk the cat all the way to the right edge of the stage." },
    lines: { title: "Line marathon", goal: "Draw at least 12 lines." },
  },
};

const TEXT = withFallbacks({ cs: CS, en: EN, de: EN, ru: EN });

export function getScratchText(locale: Locale): ScratchText {
  return TEXT[locale];
}
