import { buildRoom, type RoomKit } from "./kit";

// Hrad na kopci (dějepis). Kód ke dveřím: 5472. Texty hádanek jsou zatím jen česky.
export const CASTLE_KIT: RoomKit = {
  id: "castle",
  theme: { wall: "#cfc7b8", floor: "#8a8579", accent: "#b3402e", title: "Hrad na kopci" },
  intro:
    "Při prohlídce hradu jsi zůstal/a pozadu a stráže zavřely bránu. V hradní síni visí erby a stojí brnění a jen ten, kdo zná dějiny, najde cestu ven. Vyřeš hádanky ze středověku a otevři bránu dřív, než vyprší čas!",
  winMessage: "Padací most se spustil a brána se otevřela. Hradní pán zvolal: „Hodný rytíř a ještě lepší znalec dějin!“",
  notes: [
    "První číslice kódu: kolik let má jedno století děleno dvaceti?",
    "Druhá číslice kódu: kolik rohů má čtvercová věž?",
    "Třetí číslice kódu: kolik je římská číslice VII?",
    "Čtvrtá číslice kódu: kolik století uplynulo od roku 1000 do roku 1200?",
  ],
  things: {
    key: { name: "Klíč ke zbrojnici", symbol: "🗝", description: "Těžký železný klíč se znakem lva." },
    partB: { name: "Železný hák", symbol: "🪝", description: "Ostrý železný hák." },
    partC: { name: "Dlouhé lano", symbol: "🧵", description: "Pevné konopné lano." },
    tool: { name: "Hák na laně", symbol: "🪝", description: "Hák uvázaný na laně. Dosáhne do vysokého výklenku." },
    card: { name: "Královská pečeť", symbol: "🔱", description: "Pečeť, která uvede do chodu padací most." },
  },
  recipeMessage: "Hák jsi uvázal/a na lano. Máš pomůcku, která dosáhne do vysokého výklenku!",
  places: {
    a: { label: "Erb na zdi", icon: "🛡️" },
    b: { label: "Zbrojnice", icon: "⚔️" },
    c: { label: "Rytířský stůl", icon: "📜" },
    d: { label: "Vysoký výklenek", icon: "🕯️" },
    e: { label: "Padací most", icon: "🌉" },
    door: { label: "Hradní brána", icon: "🚪" },
    examine: { label: "Rytířské brnění", icon: "🛡️", message: "Brnění stojí jako živé. Je těžké a s útěkem ti nepomůže." },
    robot: "Pomocník Atom",
  },
  lockedB: "Zbrojnice je zamčená. Potřebuješ klíč. Vyber ho v inventáři a klikni na zbrojnici.",
  lockedD: "Ve vysokém výklenku je něco užitečného, ale nedosáhneš tam. Potřebuješ lano s hákem.",
  lockedE: "Mechanismus mostu chce královskou pečeť. Vyber ji v inventáři a klikni na most.",
  lockedDoor: "Brána je zamčená. Nejdřív musíš spustit padací most.",
  useMessage: "Hákem na laně jsi z vysokého výklenku vytáhl/a královskou pečeť a lísteček s poznámkou.",
  a: {
    title: "Erb na zdi",
    prompt: "Pod erbem stojí: „Hrad Karlštejn nechal postavit český král a pozdější císař Karel ___.“ Doplň, kolikátý Karel to byl, arabskou číslicí.",
    answers: ["4", "iv", "ctvrty", "čtvrtý"],
    placeholder: "číslice",
    hints: ["Karel IV. byl český král a římský císař ve 14. století.", "Číslo je zapsané římsky jako IV.", "Odpověď je 4."],
    rewardMessage: "Za erbem je skrytý klíč a lísteček s číslem.",
  },
  b: {
    title: "Zbrojnice",
    prompt: "Zámek zbrojnice se odemkne, když přiřadíš ke každému povolání středověku to, co k němu patří.",
    pairs: [
      ["Rytíř", "Meč a brnění"],
      ["Rolník", "Pluh"],
      ["Mnich", "Klášter"],
      ["Hradní pán", "Hrad"],
    ],
    hints: ["Rytíř bojoval, potřeboval zbraň a ochranu.", "Rolník obdělával pole, a k tomu slouží pluh.", "Mniši žili v klášterech."],
    rewardMessage: "Zbrojnice se otevřela. Uvnitř je železný hák a lístek s číslem.",
  },
  c: {
    title: "Rytířský stůl",
    prompt: "Na stole leží svitek o cestě chlapce k rytířskému řádu. Seřaď kroky od dětství po službu.",
    items: ["Dětství na hradě", "Páže u cizího pána", "Panoš a výcvik", "Pasování na rytíře", "Služba králi"],
    hints: ["Nejdřív je chlapec dítě.", "Páže je mladší než panoš.", "Pasování je až po výcviku."],
    rewardMessage: "Svitek je v pořádku. Pod ním je dlouhé lano a lístek.",
  },
  e: {
    title: "Padací most",
    prompt: "Mechanismus mostu se zeptá: „Jak se jmenuje hrad v Praze, kde sídlí čeští panovníci?“",
    options: ["Pražský hrad", "Karlštejn", "Křivoklát", "Hluboká"],
    correct: 0,
    hints: ["Je to největší hradní areál v Praze.", "Stojí nad Vltavou a vidíš ho z Karlova mostu.", "Správně je Pražský hrad."],
    rewardMessage: "Most se se skřípotem spustil a zámek brány se odblokoval. Zbývá zadat kód.",
  },
  door: {
    title: "Hradní brána",
    prompt: "Na bráně svítí čtyřmístný kód. Přečti si všechny čtyři poznámky ve svém inventáři a odvoď z nich číslice.",
    answers: ["5472"],
    placeholder: "čtyři číslice",
    hints: ["Otevři inventář a přečti si všechny čtyři poznámky.", "Století má 100 let, 100 děleno 20 je 5. Věž má 4 rohy.", "VII je 7 a mezi lety 1000 a 1200 uplynula dvě století. Kód je 5472."],
    rewardMessage: "Zámek cvakl a brána se otevřela!",
  },
};

export const CASTLE_ROOM = buildRoom(CASTLE_KIT);
