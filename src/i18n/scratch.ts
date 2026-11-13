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
  speedTitle: string;
  speedFastest: string;
  speedSlowest: string;
  // Stanice posuvníku rychlosti, od nejrychlejší po nejpomalejší.
  speedStations: string[];
  showCategory: string;
  showBlock: string;
  resetPrefs: string;
  challengesTitle: string;
  challengeHint: string;
  challengeDone: string;
  challengeRetry: string;
  challengeNone: string;
  tabStudio: string;
  tabLessons: string;
  docsTitle: string;
  docsIntro: string;
  docsExample: string;
  docsDefault: string;
  docsTry: string;
  // Dokumentace každého bloku: co dělá a jeden příklad.
  docs: Record<string, { what: string; example: string }>;
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
  tabStudio: "Studio",
  tabLessons: "Lekce",
  docsTitle: "Lekce: klíč ke všem blokům",
  docsIntro: "Tady najdeš, co dělá každý blok a jak se používá. Klikni na „Přidat do skriptu“ a blok se rovnou objeví ve studiu.",
  docsExample: "Příklad",
  docsDefault: "výchozí",
  docsTry: "Přidat do skriptu",
  docs: {
    start: { what: "Každý skript začíná tímhle blokem. Když klikneš na vlajku, všechny skripty pod ním se spustí naráz.", example: "Po kliknutí na vlajku → jdi o 10 kroků vpřed" },
    goto: { what: "Kočka okamžitě skočí na zadané souřadnice. Střed jeviště je x 0, y 0. X roste doprava, y nahoru.", example: "jdi na x: 100 y: 50" },
    random: { what: "Kočka skočí na náhodné místo na jevišti.", example: "jdi na náhodné místo" },
    step: { what: "Kočka jde o zadaný počet kroků směrem, kam kouká. Záporné číslo jde pozpátku.", example: "jdi o 20 kroků vpřed" },
    glide: { what: "Kočka plynule doklouže na cíl za zadaný počet sekund. Rozjede se i dojede jemně.", example: "klouzej do x: 0 y: 100 za 2 s" },
    "turn-right": { what: "Otočí kočku doprava o zadaný počet stupňů. 90° je čtvrt otočky.", example: "otoč se doprava o 90°" },
    "turn-left": { what: "Otočí kočku doleva o zadaný počet stupňů.", example: "otoč se doleva o 45°" },
    edge: { what: "Když je kočka u okraje, odrazí se zpátky. Hodí se hned za pohybem, aby neodešla z jeviště.", example: "jdi o 30 kroků vpřed, pak pokud jsi na okraji, odraz" },
    pen: { what: "Zapne nebo vypne pero. Když pero píše, kočka za sebou kreslí čáru.", example: "spusť pero, jdi o 50 kroků vpřed" },
    "pen-color": { what: "Změní barvu pera. Barvu vybíráš kolečkem z palety.", example: "barva pera (zelená)" },
    "pen-size": { what: "Nastaví tloušťku čáry od 1 do 30.", example: "tloušťka pera 6" },
    clear: { what: "Smaže všechny nakreslené čáry. Kočka zůstane, kde je.", example: "vymazat kreslení" },
    repeat: { what: "Opakuje bloky uvnitř zadaný počet krát. Bloky do něj vložíš tak, že je přetáhneš dovnitř.", example: "opakuj 4× (jdi o 50 kroků, otoč se doprava o 90°) = čtverec" },
    forever: { what: "Opakuje bloky uvnitř pořád dokola, dokud nestiskneš Zastavit nebo blok zastav vše.", example: "opakuj donekonečna (jdi o 5 kroků, odraz)" },
    wait: { what: "Počká zadaný počet sekund a pak pokračuje dál.", example: "počkej 1 s" },
    stop: { what: "Zastaví všechny skripty naráz.", example: "zastav vše" },
    say: { what: "Kočka řekne text v bublině. Text může mít nejvíc 60 znaků.", example: "řekni Ahoj!" },
    "set-var": { what: "Uloží hodnotu do proměnné. Později ji použiješ jako $jméno, třeba v pohybu.", example: "nastav body na 0, pak jdi o $body kroků" },
    define: { what: "Vytvoří vlastní blok s názvem a parametry. Bloky uvnitř se spustí, když ho zavoláš blokem „zavolej blok“.", example: "definuj blok ctverec s parametry velikost" },
    call: { what: "Zavolá tvůj vlastní blok a předá mu hodnoty oddělené čárkou. Uvnitř je hodnota dostupná jako $parametr.", example: "zavolej blok ctverec s hodnotami 40" },
  },
  speedTitle: "Rychlost",
  speedFastest: "nejrychleji",
  speedSlowest: "nejpomaleji",
  speedStations: ["Blesk", "Rychle", "Normálně", "Pomalu", "Hodně pomalu", "Šnek", "Krok po kroku"],
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
  tabStudio: "Studio",
  tabLessons: "Lessons",
  docsTitle: "Lessons: key to all blocks",
  docsIntro: "Here's what each block does and how to use it. Click \"Add to script\" and the block appears in the studio right away.",
  docsExample: "Example",
  docsDefault: "default",
  docsTry: "Add to script",
  docs: {
    start: { what: "Every script starts with this block. When you click the flag, all scripts under it run at once.", example: "When flag clicked → move 10 steps" },
    goto: { what: "The cat jumps straight to the given coordinates. The centre is x 0, y 0. X grows to the right, y upwards.", example: "go to x: 100 y: 50" },
    random: { what: "The cat jumps to a random spot on the stage.", example: "go to random position" },
    step: { what: "The cat moves the given number of steps in the direction it faces. A negative number goes backwards.", example: "move 20 steps" },
    glide: { what: "The cat slides smoothly to the target in the given seconds. It speeds up and slows down gently.", example: "glide to x: 0 y: 100 in 2 s" },
    "turn-right": { what: "Turns the cat right by the given number of degrees. 90° is a quarter turn.", example: "turn right 90°" },
    "turn-left": { what: "Turns the cat left by the given number of degrees.", example: "turn left 45°" },
    edge: { what: "If the cat is at the edge, it bounces back. Put it right after a move so it doesn't leave the stage.", example: "move 30 steps, then if on edge, bounce" },
    pen: { what: "Puts the pen down or lifts it. While the pen is down, the cat draws a line behind it.", example: "pen down, move 50 steps" },
    "pen-color": { what: "Changes the pen colour. Pick a colour from the palette dots.", example: "pen colour (green)" },
    "pen-size": { what: "Sets the line thickness from 1 to 30.", example: "pen size 6" },
    clear: { what: "Erases all drawn lines. The cat stays where it is.", example: "clear drawing" },
    repeat: { what: "Runs the blocks inside it the given number of times. Drag blocks inside to add them.", example: "repeat 4× (move 50 steps, turn right 90°) = square" },
    forever: { what: "Runs the blocks inside over and over until you press Stop or the stop-all block.", example: "forever (move 5 steps, bounce)" },
    wait: { what: "Waits the given number of seconds, then carries on.", example: "wait 1 s" },
    stop: { what: "Stops all scripts at once.", example: "stop all" },
    say: { what: "The cat says the text in a bubble. The text can be at most 60 characters.", example: "say Hi!" },
    "set-var": { what: "Stores a value in a variable. Use it later as $name, for example in a move.", example: "set score to 0, then move $score steps" },
    define: { what: "Creates your own block with a name and parameters. Its blocks run when you call it with the call block.", example: "define block square with parameter size" },
    call: { what: "Calls your own block and passes it comma-separated values. Inside, the value is available as $parameter.", example: "call block square with values 40" },
  },
  speedTitle: "Speed",
  speedFastest: "fastest",
  speedSlowest: "slowest",
  speedStations: ["Lightning", "Fast", "Normal", "Slow", "Very slow", "Snail", "Step by step"],
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
