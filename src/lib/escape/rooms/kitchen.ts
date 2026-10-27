import { buildRoom, type RoomKit } from "./kit";

// Kuchyně šéfkuchaře (matematika). Kód ke dveřím: 7943. Texty hádanek jsou zatím jen česky.
export const KITCHEN_KIT: RoomKit = {
  id: "kitchen",
  theme: { wall: "#fff0d6", floor: "#c9b49a", accent: "#e8a24f", title: "Kuchyně šéfkuchaře" },
  intro:
    "Zůstal/a jsi zavřený/á v kuchyni slavného šéfkuchaře. Dveře se otevřou jen tomu, kdo ovládne počítání jako pravý kuchař. Vyřeš hádanky s recepty, vahou a časem a vyjdi dřív, než koláč v troubě shoří!",
  winMessage: "Dveře kuchyně se otevřely a ty jsi vyběhl/a ven. Šéfkuchař zatleskal: „Bravo, tohle bylo přesné jako recept!“",
  notes: [
    "První číslice kódu: polovina z čísla 14.",
    "Druhá číslice kódu: třetina z čísla 27.",
    "Třetí číslice kódu: 5² − 21.",
    "Čtvrtá číslice kódu: kolik vrcholů má trojúhelník?",
  ],
  things: {
    key: { name: "Klíč od spižírny", symbol: "🗝", description: "Malý klíč s kuchařskou čepicí na ouzku." },
    partB: { name: "Vařečka", symbol: "🥄", description: "Dlouhá dřevěná vařečka." },
    partC: { name: "Vidlička", symbol: "🍴", description: "Velká kuchyňská vidlice." },
    tool: { name: "Chňapka", symbol: "🥢", description: "Vařečka s vidličkou. Dosáhne na horní polici." },
    card: { name: "Karta šéfkuchaře", symbol: "🪪", description: "Karta, která zapne digitální troubu." },
  },
  recipeMessage: "Vařečku jsi připevnil/a na vidličku. Máš pomůcku, která dosáhne na horní polici!",
  places: {
    a: { label: "Recept na zdi", icon: "📋" },
    b: { label: "Spižírna", icon: "🫙" },
    c: { label: "Pracovní deska", icon: "🥣" },
    d: { label: "Horní police", icon: "🍯" },
    e: { label: "Digitální trouba", icon: "🔥" },
    door: { label: "Dveře kuchyně", icon: "🚪" },
    examine: { label: "Kastrol", icon: "🍲", message: "V kastrolu se něco vaří. Voní to skvěle, ale na to teď není čas." },
    robot: "Pomocník Atom",
  },
  lockedB: "Spižírna je zamčená. Potřebuješ klíč. Vyber ho v inventáři a klikni na spižírnu.",
  lockedD: "Na horní polici je něco užitečného, ale je vysoko. Potřebuješ něco dlouhého.",
  lockedE: "Trouba chce kartu šéfkuchaře. Vyber ji v inventáři a klikni na troubu.",
  lockedDoor: "Dveře jsou zamčené. Nejdřív musíš vyřešit úlohu s troubou.",
  useMessage: "Chňapkou jsi z horní police stáhl/a kartu šéfkuchaře a lísteček s poznámkou.",
  a: {
    title: "Recept na zdi",
    prompt: "Na receptu stojí: „250 g mouky je polovina dávky.“ Kolik gramů mouky potřebuješ na celou dávku?",
    answers: ["500", "500g"],
    placeholder: "počet gramů",
    hints: ["Polovina dávky je 250 g.", "Celá dávka je dvakrát tolik.", "250 + 250 = 500."],
    rewardMessage: "Za receptem je přilepený klíč a lísteček s číslem.",
  },
  b: {
    title: "Spižírna",
    prompt: "Zámek spižírny se odemkne, když přiřadíš k sobě stejné množství, jen zapsané jinak.",
    pairs: [
      ["1 kg", "1000 g"],
      ["1 l", "1000 ml"],
      ["½ hodiny", "30 minut"],
      ["¼ kg", "250 g"],
    ],
    hints: ["V jednom kilogramu je tisíc gramů.", "Půl hodiny je polovina z 60 minut.", "Čtvrtina z 1000 g je 250 g."],
    rewardMessage: "Spižírna se otevřela. Uvnitř je dřevěná vařečka a lístek s číslem.",
  },
  c: {
    title: "Pracovní deska",
    prompt: "Kroky receptu na koláč jsou promíchané. Seřaď je od prvního po poslední.",
    items: ["Odvaž suroviny", "Smíchej těsto", "Dej těsto do formy", "Peč 30 minut", "Nech koláč vychladnout"],
    hints: ["Nejdřív musíš mít suroviny.", "Těsto se míchá před pečením.", "Vychladnutí je až úplně na konci."],
    rewardMessage: "Recept sedí. Pod ním je velká vidlice a lístek.",
  },
  e: {
    title: "Digitální trouba",
    prompt: "Trouba se zeptá: „Kolik minut je tři čtvrtě hodiny?“",
    options: ["30", "40", "45", "50"],
    correct: 2,
    hints: ["Hodina má 60 minut.", "Čtvrt hodiny je 15 minut.", "3 × 15 = 45."],
    rewardMessage: "Trouba pípla, koláč je hotový a zámek dveří se odblokoval. Zbývá zadat kód.",
  },
  door: {
    title: "Dveře kuchyně",
    prompt: "Na dveřích svítí čtyřmístný kód. Přečti si všechny čtyři poznámky ve svém inventáři a odvoď z nich číslice.",
    answers: ["7943"],
    placeholder: "čtyři číslice",
    hints: ["Otevři inventář a přečti si všechny čtyři poznámky.", "Polovina ze 14 je 7, třetina z 27 je 9 a 25 − 21 = 4.", "Trojúhelník má tři vrcholy. Kód je 7943."],
    rewardMessage: "Zámek cvakl a dveře se otevřely!",
  },
};

export const KITCHEN_ROOM = buildRoom(KITCHEN_KIT);
