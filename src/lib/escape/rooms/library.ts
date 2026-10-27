import { buildRoom, type RoomKit } from "./kit";

// Tajná knihovna (čeština a literatura). Kód ke dveřím: 3745. Texty hádanek jsou zatím jen česky.
export const LIBRARY_KIT: RoomKit = {
  id: "library",
  theme: { wall: "#f3e3c8", floor: "#9a7b5a", accent: "#7a4b2a", title: "Tajná knihovna" },
  intro:
    "Knihovník zhasl, zamkl a odešel domů, a ty jsi zůstal/a uvnitř mezi regály. Dveře se otevřou jen čtenáři, který zná slova, autory a příběhy. Vyřeš hádanky mezi knihami a vyjdi ven dřív, než vyprší čas!",
  winMessage: "Dveře knihovny cvakly a ty jsi vyšel/vyšla na ulici. Knihovník se usmál: „Takového čtenáře bych tu chtěl každý den!“",
  notes: [
    "První číslice kódu: kolik slabik má slovo „knihovna“?",
    "Druhá číslice kódu: kolik pádů má čeština?",
    "Třetí číslice kódu: kolik samohlásek je ve slově „abeceda“?",
    "Čtvrtá číslice kódu: kolik písmen má slovo „báseň“?",
  ],
  things: {
    key: { name: "Klíč od knižní skříně", symbol: "🗝", description: "Malý klíč s ouškem ve tvaru otevřené knihy." },
    partB: { name: "Spodní díl žebříku", symbol: "🪜", description: "Dřevěný žebřík bez horní části." },
    partC: { name: "Horní díl žebříku", symbol: "🪜", description: "Horní část žebříku s kolečky." },
    tool: { name: "Pojízdný žebřík", symbol: "🪜", description: "Složený žebřík, který dosáhne na nejvyšší polici." },
    card: { name: "Čtenářský průkaz", symbol: "🪪", description: "Průkaz, který zapne katalogový počítač." },
  },
  recipeMessage: "Oba díly zacvakly do sebe. Máš pojízdný žebřík, který dosáhne na nejvyšší polici!",
  places: {
    a: { label: "Regál s klasiky", icon: "📚" },
    b: { label: "Zamčená skříň", icon: "🗄️" },
    c: { label: "Čtenářský stůl", icon: "📖" },
    d: { label: "Nejvyšší police", icon: "📕" },
    e: { label: "Katalogový počítač", icon: "💻" },
    door: { label: "Dveře knihovny", icon: "🚪" },
    examine: { label: "Globus", icon: "🌍", message: "Globus se tiše otáčí. Je hezký, ale s útěkem ti nepomůže." },
    robot: "Knihomol Atom",
  },
  lockedB: "Skříň je zamčená. Potřebuješ klíč. Vyber ho v inventáři a klikni na skříň.",
  lockedD: "Na nejvyšší polici je něco užitečného, ale je moc vysoko. Potřebuješ žebřík.",
  lockedE: "Počítač chce čtenářský průkaz. Vyber ho v inventáři a klikni na počítač.",
  lockedDoor: "Dveře jsou zamčené. Nejdřív musíš vyřešit úlohu s katalogovým počítačem.",
  useMessage: "Po žebříku jsi vylezl/a nahoru a sundal/a čtenářský průkaz a lísteček s poznámkou.",
  a: {
    title: "Regál s klasiky",
    prompt: "Na štítku regálu stojí: „Karel Čapek vymyslel pro hru R.U.R. slovo, které dnes zná celý svět. Označuje stroj, který pracuje za člověka.“ Jaké je to slovo?",
    answers: ["robot", "roboti"],
    placeholder: "slovo",
    hints: ["Slovo má dvě slabiky: ro-bot.", "Je to pomocník z plechu, který umí chodit i počítat.", "Slovo je robot."],
    rewardMessage: "Z regálu vypadl klíč a lísteček s číslem.",
  },
  b: {
    title: "Zamčená skříň",
    prompt: "Zámek skříně se odemkne, když přiřadíš ke každému autorovi jeho dílo.",
    pairs: [
      ["Božena Němcová", "Babička"],
      ["Karel Jaromír Erben", "Kytice"],
      ["Jaroslav Foglar", "Rychlé šípy"],
      ["Jan Neruda", "Povídky malostranské"],
    ],
    hints: ["Babičku znáš ze školy, napsala ji Božena Němcová.", "Kytice je sbírka balad, například Svatební košile.", "Rychlé šípy jsou o klubu chlapců z Prahy."],
    rewardMessage: "Skříň se otevřela. Uvnitř je spodní díl žebříku a lístek s číslem.",
  },
  c: {
    title: "Čtenářský stůl",
    prompt: "Na stole leží rozstříhaný příběh. Seřaď jeho části tak, jak za sebou přirozeně následují.",
    items: ["Úvod: seznámíme se s postavami", "Zápletka: vznikne problém", "Vyvrcholení: napětí je největší", "Rozuzlení: problém se vyřeší", "Závěr: příběh končí"],
    hints: ["Na začátku musíme vědět, kdo je kdo.", "Nejdřív vznikne problém, potom roste napětí.", "Až po vyvrcholení se všechno vyřeší."],
    rewardMessage: "Příběh dává smysl. Pod ním je horní díl žebříku a lístek.",
  },
  e: {
    title: "Katalogový počítač",
    prompt: "Počítač se zeptá: „Které z těchto slov je přídavné jméno?“",
    options: ["běžet", "krásný", "knihovna", "rychle"],
    correct: 1,
    hints: ["Přídavné jméno odpovídá na otázku jaký.", "Můžeš říct „jaká kniha“: krásná kniha.", "Správně je krásný."],
    rewardMessage: "Počítač zazpíval, katalog se přepnul a zámek dveří se odblokoval. Zbývá zadat kód.",
  },
  door: {
    title: "Dveře knihovny",
    prompt: "Na dveřích svítí čtyřmístný kód. Přečti si všechny čtyři poznámky ve svém inventáři a odvoď z nich číslice.",
    answers: ["3745"],
    placeholder: "čtyři číslice",
    hints: ["Otevři inventář a přečti si všechny čtyři poznámky.", "Kni-hov-na má tři slabiky, pádů je sedm.", "V abecedě jsou 4 samohlásky (a, e, e, a), báseň má 5 písmen. Kód je 3745."],
    rewardMessage: "Zámek cvakl a dveře se otevřely!",
  },
};

export const LIBRARY_ROOM = buildRoom(LIBRARY_KIT);
