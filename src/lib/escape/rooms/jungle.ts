import { buildRoom, type RoomKit } from "./kit";

// Ztracená džungle (biologie). Kód ke dveřím: 6842. Texty hádanek jsou zatím jen česky.
export const JUNGLE_KIT: RoomKit = {
  id: "jungle",
  theme: { wall: "#cfe8b8", floor: "#6b8f4a", accent: "#8fbf6a", title: "Ztracená džungle" },
  intro:
    "Zabloudil/a jsi hluboko v džungli a cestu ti zavírá starobylá brána s kódem. Strážce džungle ti ji otevře, jen když dokážeš, že rozumíš přírodě. Prozkoumej palouk, vyřeš hádanky a najdi cestu ven před setměním!",
  winMessage: "Brána se rozevřela a před tebou je cesta domů. Strážce džungle se uklonil: „Opravdový přírodovědec!“",
  notes: [
    "První číslice kódu: kolik nohou má hmyz?",
    "Druhá číslice kódu: kolik nohou má pavouk?",
    "Třetí číslice kódu: kolik dutin (dvě síně a dvě komory) má srdce savce?",
    "Čtvrtá číslice kódu: kolik očí má většina savců?",
  ],
  things: {
    key: { name: "Klíček od schránky", symbol: "🗝", description: "Malý dřevěný klíček s lístkem." },
    partB: { name: "Liána", symbol: "🌿", description: "Dlouhá pevná liána." },
    partC: { name: "Klacek", symbol: "🪵", description: "Rovný pevný klacek." },
    tool: { name: "Liánový hák", symbol: "🪝", description: "Klacek s liánou. Dosáhne na vysoké větve." },
    card: { name: "Amulet", symbol: "🔮", description: "Zářící amulet, který poslouchá strážce džungle." },
  },
  recipeMessage: "Liánou jsi pevně obmotal/a klacek. Máš hák, kterým dosáhneš do koruny stromu!",
  places: {
    a: { label: "Lístek na kmeni", icon: "🍃" },
    b: { label: "Schránka z kořenů", icon: "🪺" },
    c: { label: "Kokon s housenkou", icon: "🦋" },
    d: { label: "Koruna stromu", icon: "🌳" },
    e: { label: "Strážce džungle", icon: "🦉" },
    door: { label: "Starobylá brána", icon: "🚪" },
    examine: { label: "Houba", icon: "🍄", message: "Obrovská červená houba. Jíst ji nedoporučuji, spíš se na ni jen dívej." },
    robot: "Průvodce Atom",
  },
  lockedB: "Schránka je zamčená. Potřebuješ klíček. Vyber ho v inventáři a klikni na schránku.",
  lockedD: "V koruně stromu se něco třpytí, ale je to vysoko. Potřebuješ něco dlouhého s hákem.",
  lockedE: "Strážce čeká na amulet. Vyber ho v inventáři a klikni na strážce.",
  lockedDoor: "Brána je zavřená. Nejdřív musíš odpovědět strážci džungle.",
  useMessage: "Hákem jsi shodil/a z koruny amulet a lístek s poznámkou.",
  a: {
    title: "Lístek na kmeni",
    prompt: "Na lístku stojí: „Rostliny vyrábějí cukr ze slunečního světla, vody a oxidu uhličitého. Tomuto procesu se říká …“",
    answers: ["fotosyntéza", "fotosyntéze", "fotosyntézy", "fotosyntézu"],
    placeholder: "název procesu",
    hints: ["Děje se hlavně v zelených listech.", "Název začíná slovem foto, jako světlo.", "Slovo má jedenáct písmen a končí na -syntéza."],
    rewardMessage: "Za lístkem je schovaný klíček a poznámka.",
  },
  b: {
    title: "Schránka z kořenů",
    prompt: "Zámek se odemkne, když přiřadíš ke každému živočichovi, do jaké skupiny patří.",
    pairs: [
      ["Lev", "savec"],
      ["Orel", "pták"],
      ["Žába", "obojživelník"],
      ["Had", "plaz"],
    ],
    hints: ["Savci kojí mláďata mlékem a mají srst.", "Žába žije ve vodě i na souši.", "Had má šupinatou kůži a je to plaz."],
    rewardMessage: "Schránka se otevřela. Uvnitř je liána a papírek s číslem.",
  },
  c: {
    title: "Kokon s housenkou",
    prompt: "Seřaď vývoj motýla od prvního stadia po poslední.",
    items: ["Vajíčko", "Housenka", "Kukla", "Dospělý motýl"],
    hints: ["Motýl se nejdřív vylíhne z vajíčka.", "Housenka hodně žere a roste.", "Z kukly se vyklube motýl, to je poslední krok."],
    rewardMessage: "Kokon se rozevřel a vedle něj leží pevný klacek a lístek.",
  },
  e: {
    title: "Strážce džungle",
    prompt: "Strážce se ptá: „Který orgán rostliny nasává vodu z půdy?“",
    options: ["List", "Kořen", "Květ", "Plod"],
    correct: 1,
    hints: ["Je pod zemí.", "Drží rostlinu v půdě a nasává vodu.", "Začíná na K a končí na N."],
    rewardMessage: "Strážce kývl a brána se odemkla. Zbývá zadat kód.",
  },
  door: {
    title: "Starobylá brána",
    prompt: "Na bráně svítí čtyřmístný kód. Přečti si všechny čtyři poznámky ve svém inventáři a odvoď z nich číslice.",
    answers: ["6842"],
    placeholder: "čtyři číslice",
    hints: ["Otevři inventář a přečti si všechny čtyři poznámky.", "Hmyz má šest nohou a pavouk osm.", "Srdce savce má čtyři dutiny a většina savců dvě oči. Kód je 6842."],
    rewardMessage: "Brána se rozevřela!",
  },
};

export const JUNGLE_ROOM = buildRoom(JUNGLE_KIT);
