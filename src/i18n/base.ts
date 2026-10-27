import type { Locale } from "./config";
import type { BaseCat, BaseError, ShipType } from "@/lib/idle/base";

// Vzdělávací karta: jak věc funguje a zajímavost.
export type Lesson = { how: string; fact: string };
export type DestText = { blurb: string; fact: string; question: string; options: [string, string, string, string]; explanation: string };

export type BaseText = {
  title: string;
  intro: string;
  loginPrompt: string;
  login: string;
  loading: string;
  unavailable: string;
  tabs: { build: string; fleet: string; map: string; codex: string };
  stats: {
    credits: string;
    science: string;
    points: string;
    energy: string;
    crew: string;
    life: string;
    efficiency: string;
    perHour: string;
    bonuses: string;
    learning: string;
    pet: string;
    city: string;
    modules: string;
  };
  cats: Record<BaseCat, string>;
  build: {
    palette: string;
    demolish: string;
    rotate: string;
    cancel: string;
    hint: string;
    needLevel: string;
    howTitle: string;
    factTitle: string;
    cost: string;
    produces: string;
    needs: string;
    disconnected: string;
    lowPower: string;
    lowCrew: string;
    lowLife: string;
    built: string;
  };
  fleet: {
    title: string;
    empty: string;
    slots: string;
    buildShip: string;
    needShipyard: string;
    building: string;
    docked: string;
    onMission: string;
    arrived: string;
    send: string;
    collect: string;
    returnsIn: string;
    chooseDest: string;
    tier: string;
    speed: string;
    buildTime: string;
  };
  map: {
    title: string;
    hint: string;
    earth: string;
    sun: string;
    research: string;
    researched: string;
    needScience: string;
    travel: string;
    reward: string;
    tooWeak: string;
    locked: string;
    chooseShip: string;
    noShip: string;
  };
  codex: {
    title: string;
    intro: string;
    modules: string;
    worlds: string;
    unknown: string;
    found: string;
  };
  debrief: { title: string; correct: string; wrong: string; bonus: string; next: string; science: string };
  units: { minutes: string; hours: string; seconds: string };
  errors: Record<BaseError | "login-required" | "unavailable" | "conflict" | "unknown-action", string>;
  modules: Record<string, Lesson>;
  ships: Record<ShipType, { desc: string }>;
  dests: Record<string, DestText>;
};

const cs: BaseText = {
  title: "Základna",
  intro: "Postav si vlastní vesmírnou stanici, stavěj lodě a posílej je na výpravy ke planetám. U všeho se dozvíš, jak to doopravdy funguje.",
  loginPrompt: "Přihlas se, ať se tvoje základna uloží.",
  login: "Přihlásit se",
  loading: "Načítám základnu…",
  unavailable: "Základnu se teď nepodařilo načíst. Zkus to za chvíli.",
  tabs: { build: "Stavba", fleet: "Flotila", map: "Vesmír", codex: "Kodex" },
  stats: {
    credits: "Kredity",
    science: "Věda",
    points: "Body z učení",
    energy: "Energie",
    crew: "Posádka",
    life: "Podpora života",
    efficiency: "Výkon stanice",
    perHour: "za hodinu",
    bonuses: "Bonusy",
    learning: "Učení (posledních 24 h)",
    pet: "Mazlíček",
    city: "Město",
    modules: "Moduly",
  },
  cats: { core: "Základ", energy: "Energie", life: "Život", science: "Věda", industry: "Výroba", ships: "Lodě" },
  build: {
    palette: "Moduly",
    demolish: "Zbourat",
    rotate: "Otočit",
    cancel: "Zrušit výběr",
    hint: "Vyber modul a klepni na mřížku. Všechny moduly musí být spojené s velitelským modulem.",
    needLevel: "Od úrovně",
    howTitle: "Jak to funguje",
    factTitle: "Víš, že…",
    cost: "Cena",
    produces: "Dává",
    needs: "Potřebuje",
    disconnected: "Není spojený s velitelským modulem, takže nefunguje.",
    lowPower: "Chybí energie. Postav solární panely nebo reaktor.",
    lowCrew: "Chybí posádka. Postav ubytování.",
    lowLife: "Chybí podpora života. Postav skleník nebo recyklaci vody.",
    built: "Postaveno",
  },
  fleet: {
    title: "Flotila",
    empty: "Zatím nemáš žádnou loď. Postav loděnici a hangár a pak loď.",
    slots: "Místa v hangárech",
    buildShip: "Postavit loď",
    needShipyard: "Potřebuješ loděnici",
    building: "Staví se",
    docked: "V doku",
    onMission: "Na misi",
    arrived: "Dorazila",
    send: "Poslat na misi",
    collect: "Vyzvednout odměny",
    returnsIn: "Dorazí za",
    chooseDest: "Vyber cíl",
    tier: "Třída",
    speed: "Rychlost",
    buildTime: "Stavba",
  },
  map: {
    title: "Vesmír",
    hint: "Klepni na planetu. Nejdřív ji musíš prozkoumat za vědu, potom k ní pošleš loď.",
    earth: "Základna",
    sun: "Slunce",
    research: "Prozkoumat",
    researched: "Prozkoumáno",
    needScience: "Chybí věda",
    travel: "Cesta",
    reward: "Odměna",
    tooWeak: "Tvoje lodě tam nedoletí, potřebuješ lepší třídu.",
    locked: "Nejdřív ji prozkoumej.",
    chooseShip: "Vyber loď",
    noShip: "Nemáš volnou loď.",
  },
  codex: {
    title: "Kodex",
    intro: "Sem se zapisuje všechno, co postavíš nebo objevíš. Přečti si, jak to funguje.",
    modules: "Moduly",
    worlds: "Světy",
    unknown: "Zatím neobjeveno",
    found: "Objeveno",
  },
  debrief: {
    title: "Otázka po misi",
    correct: "Správně!",
    wrong: "Tentokrát ne, ale teď to víš.",
    bonus: "Bonus",
    next: "Pokračovat",
    science: "vědy",
  },
  units: { minutes: "min", hours: "h", seconds: "s" },
  errors: {
    "unknown-item": "Tenhle modul neznám.",
    "out-of-bounds": "Tam už mřížka nesahá.",
    occupied: "Tohle místo je obsazené.",
    "not-enough-credits": "Nemáš dost kreditů.",
    "not-enough-points": "Nemáš dost bodů z učení.",
    "not-enough-science": "Nemáš dost vědy.",
    locked: "Na to máš zatím nízkou úroveň.",
    "nothing-there": "Tady není co dělat.",
    "too-many": "Moc najednou.",
    "only-one-core": "Velitelský modul může být jen jeden.",
    "core-protected": "Velitelský modul zbourat nejde.",
    "no-shipyard": "Nejdřív postav loděnici.",
    "no-hangar-slot": "V hangárech není místo. Postav další hangár.",
    "unknown-ship": "Tuhle loď neznám.",
    "unknown-dest": "Tenhle cíl neznám.",
    "ship-busy": "Loď je na misi.",
    "ship-not-ready": "Loď se ještě staví.",
    "ship-too-weak": "Tahle loď tam nedoletí.",
    "dest-locked": "Cíl nejdřív prozkoumej.",
    "no-mission": "Žádná loď zatím nedorazila.",
    "nothing-to-answer": "Žádná otázka nečeká.",
    "already-researched": "To už máš prozkoumané.",
    "login-required": "Přihlas se.",
    unavailable: "Teď to nejde, zkus to za chvíli.",
    conflict: "Základna se mezitím změnila jinde. Načítám znovu.",
    "unknown-action": "Neznámá akce.",
  },
  modules: {
    core: { how: "Řídí celou stanici a dodává základní energii, bydlení a vzduch. Všechny ostatní moduly musí být s ním propojené.", fact: "Mezinárodní kosmická stanice ISS je poskládaná z modulů a obletí Zemi zhruba za 90 minut." },
    corridor: { how: "Chodba spojuje moduly, aby jimi mohla procházet posádka, elektřina i vzduch.", fact: "Na ISS se astronauti mezi moduly přenášejí plavbou ve stavu beztíže a drží se madel." },
    solar: { how: "Fotovoltaické články mění světlo na elektřinu (fotovoltaický jev). Čím víc světla, tím víc energie.", fact: "Solární křídla ISS mají dohromady rozpětí asi 73 metrů." },
    reactor: { how: "Při štěpení jader uranu se uvolňuje teplo a z něj se vyrábí elektřina. Z malého množství paliva je spousta energie.", fact: "Sonda Voyager 1 a rover Curiosity berou energii z radioizotopových zdrojů, ne ze Slunce." },
    quarters: { how: "Posádka tu spí a odpočívá. Víc ubytování znamená víc lidí, kteří mohou obsluhovat moduly.", fact: "Astronauti na ISS spí v kajutách ve spacích pytlích přichycených ke stěně, protože ve stavu beztíže není nahoře ani dole." },
    greenhouse: { how: "Rostliny při fotosyntéze vyrábějí ze světla, vody a oxidu uhličitého cukry a uvolňují kyslík. Dávají vzduch i jídlo.", fact: "Na ISS astronauti vypěstovali salát a dokonce kvetoucí zinie." },
    water: { how: "Čistí vodu z potu, dechu a moči zpátky na pitnou. Ve vesmíru je každý litr drahý, protože ho není kde vzít.", fact: "Systém na ISS vrací zpátky víc než 90 % vody." },
    lab: { how: "Vědci tu dělají pokusy, které na Zemi nejdou, třeba v beztíži. Laboratoř vyrábí vědu.", fact: "V beztíži hoří plamen kulatě a krystaly rostou pravidelněji než na Zemi." },
    observatory: { how: "Dalekohledy nad atmosférou vidí hvězdy a planety ostře, bez rozmazání vzduchem. Pozorování dává hodně vědy.", fact: "Hubbleův dalekohled obíhá Zemi nad atmosférou, proto vidí ostřeji než většina dalekohledů na zemi." },
    antenna: { how: "Vysílá a přijímá rádiové vlny. Lepší spojení znamená větší odměny z misí (každá anténa +8 %, nejvýš tři).", fact: "Rádiový signál se šíří rychlostí světla. Ze Země na Měsíc letí asi 1,3 sekundy." },
    workshop: { how: "Opravuje díly a vyrábí náhradní součástky. Prodává je a vydělává kredity.", fact: "Na ISS je 3D tiskárna, na které astronauti tisknou náhradní díly." },
    trade: { how: "Obchoduje se zásobami a výrobky. Vydělává hodně kreditů, ale potřebuje větší posádku.", fact: "Dopravit jeden kilogram nákladu na oběžnou dráhu stálo dříve desítky tisíc dolarů. Proto je ve vesmíru každý gram cenný." },
    hangar: { how: "Zaparkuje lodě a chrání je před zářením a prachem. Každý hangár má dvě místa.", fact: "Mikrometeority jsou zrnka prachu, která létají desítky tisíc kilometrů za hodinu a na lodi mohou udělat díru." },
    shipyard: { how: "Z dílů a kovů skládá nové lodě. Bez loděnice nemůžeš stavět lodě.", fact: "Raketoplán Discovery uskutečnil 39 letů. Raketoplány se opravovaly a létaly znovu." },
    fusion: { how: "Slučuje lehká atomová jádra vodíku na hélium a uvolňuje obrovské množství energie, stejně jako Slunce.", fact: "Ve Slunci se každou sekundu přemění přibližně 600 milionů tun vodíku na hélium." },
    biolab: { how: "Zkoumá živé organismy a pěstuje buňky a rostliny pro budoucí mise.", fact: "Na Mezinárodní kosmické stanici astronauti vypěstovali salát, ředkvičky i chilli papričky." },
    mining: { how: "Získává z asteroidů a měsíců kovy a vodu, které se prodávají nebo se z nich staví.", fact: "Asteroid Psyche je podle vědců tvořen převážně železem a niklem." },
    dock: { how: "Sem se k základně připojují lodě. V doku se vejde víc lodí najednou než do hangáru.", fact: "Kosmické lodě se ke stanici připojují přesným manévrem a spojí se dokovacím mechanismem." },
  },
  ships: {
    probe: { desc: "Malá bezpilotní loď. Doletí na Měsíc a k nejbližším cílům." },
    shuttle: { desc: "Větší loď s výkonnějšími motory. Doletí k planetám." },
    explorer: { desc: "Rychlá dálková loď. Doletí až na vnější planety a jejich měsíce." },
  },
  dests: {
    moon: { blurb: "Nejbližší cizí svět, 384 400 km od Země.", fact: "Měsíc se vzdaluje od Země asi o 3,8 centimetru za rok.", question: "Proč vidíme z Měsíce od Země pořád stejnou stranu?", options: ["Měsíc se vůbec neotáčí", "Otočí se kolem osy za stejnou dobu, za jakou oběhne Zemi", "Země ho drží na laně", "Druhá strana je pořád ve tmě"], explanation: "Měsíc se otočí kolem své osy přesně za tak dlouho, jako oběhne Zemi. Proto k nám míří pořád stejná tvář." },
    venus: { blurb: "Nejžhavější planeta, kolem 465 °C.", fact: "Venuše se otáčí opačným směrem než většina planet a den na ní trvá déle než rok.", question: "Proč je Venuše žhavější než Merkur, i když je dál od Slunce?", options: ["Má vlastní zdroj tepla", "Je ke Slunci blíž", "Hustá atmosféra z oxidu uhličitého zadržuje teplo (skleníkový efekt)", "Je celá z lávy"], explanation: "Hustá atmosféra z oxidu uhličitého zachytí teplo jako skleník, proto je Venuše žhavější než Merkur." },
    mars: { blurb: "Rudá planeta, má největší sopku sluneční soustavy.", fact: "Olympus Mons na Marsu je asi 22 km vysoký, zhruba dvaapůlkrát víc než Mount Everest.", question: "Proč je Mars červený?", options: ["Železo v prachu a půdě zrezivělo", "Je pokrytý červenými rostlinami", "Moc se ohřívá od Slunce", "Svítí vlastním světlem"], explanation: "V marťanské půdě je železo, které zrezivělo, a proto má planeta rudou barvu." },
    asteroids: { blurb: "Zbytky z vzniku sluneční soustavy, mezi Marsem a Jupiterem.", fact: "Největší těleso pásu, Ceres, je trpasličí planeta.", question: "Kde se nachází hlavní pás planetek?", options: ["Mezi Zemí a Marsem", "Mezi Venuší a Zemí", "Za Neptunem", "Mezi Marsem a Jupiterem"], explanation: "Hlavní pás planetek leží mezi Marsem a Jupiterem." },
    europa: { blurb: "Měsíc Jupiteru pokrytý ledem.", fact: "Pod ledem Europy je pravděpodobně oceán, který má víc vody než všechny oceány na Zemi dohromady.", question: "Co je pravděpodobně pod ledovou krustou Europy?", options: ["Roztavená skála", "Oceán tekuté vody", "Hustý les", "Prázdno"], explanation: "Pod ledem je pravděpodobně oceán tekuté vody. Tam by mohl být život, proto se Europa zkoumá." },
    saturn: { blurb: "Planeta s nejnápadnějšími prstenci.", fact: "Saturn je tak lehký, že by se v obří vaně vody udržel na hladině (jeho hustota je menší než vody).", question: "Z čeho jsou Saturnovy prstence?", options: ["Z plynu", "Z pevné desky", "Hlavně z kousků ledu a kamení", "Z mraků"], explanation: "Prstence tvoří miliardy kousků ledu a kamení, od zrnek po velké balvany." },
    mercury: { blurb: "Nejmenší planeta a nejblíž Slunci. Přes den je tu horko, v noci mráz.", fact: "Merkur obletí Slunce za pouhých 88 pozemských dnů.", question: "Která planeta je nejblíž Slunci?", options: ["Venuše", "Merkur", "Mars", "Země"], explanation: "Nejblíž Slunci je Merkur." },
    jupiter: { blurb: "Největší planeta sluneční soustavy, plynný obr s pruhy mraků.", fact: "Velká rudá skvrna je bouře větší než celá Země a trvá už stovky let.", question: "Z čeho je Jupiter převážně složen?", options: ["Ze skály", "Z vodního ledu", "Z vodíku a hélia", "Ze železa"], explanation: "Jupiter je plynný obr tvořený hlavně vodíkem a héliem." },
    titan: { blurb: "Největší měsíc Saturnu s hustou oranžovou atmosférou a jezery z metanu.", fact: "Sonda Huygens na Titanu přistála v roce 2005.", question: "Který měsíc Saturnu má hustou atmosféru a jezera z metanu?", options: ["Europa", "Titan", "Io", "Triton"], explanation: "Titan je největší měsíc Saturnu a jako jediný měsíc má hustou atmosféru." },
  },
};

const en: BaseText = {
  title: "Base",
  intro: "Build your own space station, make ships and send them on trips to the planets. Everything tells you how it really works.",
  loginPrompt: "Log in so your base can be saved.",
  login: "Log in",
  loading: "Loading your base…",
  unavailable: "Your base couldn't be loaded right now. Try again in a moment.",
  tabs: { build: "Build", fleet: "Fleet", map: "Space", codex: "Codex" },
  stats: {
    credits: "Credits",
    science: "Science",
    points: "Learning points",
    energy: "Energy",
    crew: "Crew",
    life: "Life support",
    efficiency: "Station output",
    perHour: "per hour",
    bonuses: "Bonuses",
    learning: "Learning (last 24 h)",
    pet: "Pet",
    city: "City",
    modules: "Modules",
  },
  cats: { core: "Core", energy: "Energy", life: "Life", science: "Science", industry: "Industry", ships: "Ships" },
  build: {
    palette: "Modules",
    demolish: "Demolish",
    rotate: "Rotate",
    cancel: "Cancel selection",
    hint: "Pick a module and tap the grid. Every module has to be connected to the command module.",
    needLevel: "From level",
    howTitle: "How it works",
    factTitle: "Did you know…",
    cost: "Cost",
    produces: "Gives",
    needs: "Needs",
    disconnected: "Not connected to the command module, so it doesn't work.",
    lowPower: "Not enough energy. Build solar panels or a reactor.",
    lowCrew: "Not enough crew. Build quarters.",
    lowLife: "Not enough life support. Build a greenhouse or a water recycler.",
    built: "Built",
  },
  fleet: {
    title: "Fleet",
    empty: "You have no ship yet. Build a shipyard and a hangar, then a ship.",
    slots: "Hangar slots",
    buildShip: "Build a ship",
    needShipyard: "You need a shipyard",
    building: "Being built",
    docked: "Docked",
    onMission: "On a mission",
    arrived: "Arrived",
    send: "Send on a mission",
    collect: "Collect rewards",
    returnsIn: "Arrives in",
    chooseDest: "Choose a destination",
    tier: "Class",
    speed: "Speed",
    buildTime: "Build time",
  },
  map: {
    title: "Space",
    hint: "Tap a planet. You have to research it with science first, then send a ship.",
    earth: "Base",
    sun: "Sun",
    research: "Research",
    researched: "Researched",
    needScience: "Not enough science",
    travel: "Trip",
    reward: "Reward",
    tooWeak: "Your ships can't reach it, you need a better class.",
    locked: "Research it first.",
    chooseShip: "Choose a ship",
    noShip: "You have no free ship.",
  },
  codex: {
    title: "Codex",
    intro: "Everything you build or discover is written here. Read how it works.",
    modules: "Modules",
    worlds: "Worlds",
    unknown: "Not discovered yet",
    found: "Discovered",
  },
  debrief: {
    title: "Mission question",
    correct: "Correct!",
    wrong: "Not this time, but now you know.",
    bonus: "Bonus",
    next: "Continue",
    science: "science",
  },
  units: { minutes: "min", hours: "h", seconds: "s" },
  errors: {
    "unknown-item": "I don't know this module.",
    "out-of-bounds": "The grid doesn't reach there.",
    occupied: "This spot is taken.",
    "not-enough-credits": "Not enough credits.",
    "not-enough-points": "Not enough learning points.",
    "not-enough-science": "Not enough science.",
    locked: "Your level is too low for that.",
    "nothing-there": "Nothing to do here.",
    "too-many": "Too many at once.",
    "only-one-core": "There can be only one command module.",
    "core-protected": "The command module can't be demolished.",
    "no-shipyard": "Build a shipyard first.",
    "no-hangar-slot": "No room in the hangars. Build another hangar.",
    "unknown-ship": "I don't know this ship.",
    "unknown-dest": "I don't know this destination.",
    "ship-busy": "The ship is on a mission.",
    "ship-not-ready": "The ship is still being built.",
    "ship-too-weak": "This ship can't get there.",
    "dest-locked": "Research the destination first.",
    "no-mission": "No ship has arrived yet.",
    "nothing-to-answer": "No question is waiting.",
    "already-researched": "You've already researched it.",
    "login-required": "Log in.",
    unavailable: "Not possible right now, try again in a moment.",
    conflict: "The base changed elsewhere in the meantime. Reloading.",
    "unknown-action": "Unknown action.",
  },
  modules: {
    core: { how: "It runs the whole station and provides basic energy, housing and air. Every other module has to be connected to it.", fact: "The International Space Station is built from modules and orbits the Earth about every 90 minutes." },
    corridor: { how: "A corridor joins modules so crew, electricity and air can pass through.", fact: "On the ISS astronauts float between modules and hold on to handrails." },
    solar: { how: "Photovoltaic cells turn light into electricity (the photovoltaic effect). More light means more energy.", fact: "The ISS solar wings have a total span of about 73 metres." },
    reactor: { how: "Splitting uranium nuclei releases heat, which makes electricity. A small amount of fuel gives a lot of energy.", fact: "The Voyager 1 probe and the Curiosity rover get power from radioisotope sources, not from the Sun." },
    quarters: { how: "The crew sleeps and rests here. More quarters means more people to run modules.", fact: "ISS astronauts sleep in small cabins in sleeping bags fixed to the wall, because in weightlessness there is no up or down." },
    greenhouse: { how: "In photosynthesis plants turn light, water and carbon dioxide into sugars and release oxygen. They give air and food.", fact: "On the ISS astronauts grew lettuce and even flowering zinnias." },
    water: { how: "It cleans water from sweat, breath and urine back into drinking water. In space every litre is precious because there's nowhere to get more.", fact: "The ISS system returns more than 90% of the water." },
    lab: { how: "Scientists run experiments that can't be done on Earth, for example in weightlessness. The lab makes science.", fact: "In weightlessness a flame burns round and crystals grow more regularly than on Earth." },
    observatory: { how: "Telescopes above the atmosphere see stars and planets sharply, without air blurring them. Observations give a lot of science.", fact: "The Hubble telescope orbits above the atmosphere, so it sees sharper than most telescopes on the ground." },
    antenna: { how: "It sends and receives radio waves. A better link means bigger mission rewards (+8% per antenna, up to three).", fact: "Radio signals travel at the speed of light. From Earth to the Moon takes about 1.3 seconds." },
    workshop: { how: "It repairs parts and makes spare components. It sells them and earns credits.", fact: "The ISS has a 3D printer on which astronauts print spare parts." },
    trade: { how: "It trades supplies and goods. It earns a lot of credits but needs a bigger crew.", fact: "Getting one kilogram of cargo to orbit used to cost tens of thousands of dollars. That's why every gram matters in space." },
    hangar: { how: "It parks ships and protects them from radiation and dust. Each hangar has two slots.", fact: "Micrometeoroids are specks of dust flying tens of thousands of kilometres per hour that can make a hole in a ship." },
    shipyard: { how: "It assembles new ships from parts and metal. You can't build ships without a shipyard.", fact: "The space shuttle Discovery flew 39 missions. Shuttles were repaired and flew again." },
    fusion: { how: "It fuses light hydrogen nuclei into helium and releases a huge amount of energy, just like the Sun.", fact: "Every second the Sun turns roughly 600 million tonnes of hydrogen into helium." },
    biolab: { how: "It studies living organisms and grows cells and plants for future missions.", fact: "On the International Space Station astronauts have grown lettuce, radishes and chili peppers." },
    mining: { how: "It gets metals and water from asteroids and moons, which are sold or used for building.", fact: "Scientists think the asteroid Psyche is made mostly of iron and nickel." },
    dock: { how: "Ships connect to the base here. A docking bay holds more ships at once than a hangar.", fact: "Spacecraft join a station with a precise manoeuvre and lock on with a docking mechanism." },
  },
  ships: {
    probe: { desc: "A small uncrewed ship. It reaches the Moon and the nearest targets." },
    shuttle: { desc: "A bigger ship with stronger engines. It reaches the planets." },
    explorer: { desc: "A fast long-range ship. It reaches the outer planets and their moons." },
  },
  dests: {
    moon: { blurb: "The nearest other world, 384,400 km from Earth.", fact: "The Moon is moving away from Earth by about 3.8 centimetres a year.", question: "Why do we always see the same side of the Moon from Earth?", options: ["The Moon doesn't rotate at all", "It turns once on its axis in the same time it orbits Earth", "Earth holds it on a rope", "The other side is always dark"], explanation: "The Moon turns once on its axis in exactly the time it takes to orbit Earth. That's why the same face always points at us." },
    venus: { blurb: "The hottest planet, around 465 °C.", fact: "Venus spins the opposite way from most planets, and a day on Venus is longer than its year.", question: "Why is Venus hotter than Mercury even though it's farther from the Sun?", options: ["It has its own heat source", "It is closer to the Sun", "A thick carbon dioxide atmosphere traps heat (greenhouse effect)", "It is all made of lava"], explanation: "The thick carbon dioxide atmosphere traps heat like a greenhouse, so Venus is hotter than Mercury." },
    mars: { blurb: "The red planet with the biggest volcano in the solar system.", fact: "Olympus Mons on Mars is about 22 km high, about two and a half times Mount Everest.", question: "Why is Mars red?", options: ["Iron in the dust and soil has rusted", "It is covered in red plants", "It gets too hot from the Sun", "It shines with its own light"], explanation: "The Martian soil contains iron that has rusted, which gives the planet its red colour." },
    asteroids: { blurb: "Leftovers from the birth of the solar system, between Mars and Jupiter.", fact: "The biggest object of the belt, Ceres, is a dwarf planet.", question: "Where is the main asteroid belt?", options: ["Between Earth and Mars", "Between Venus and Earth", "Beyond Neptune", "Between Mars and Jupiter"], explanation: "The main asteroid belt lies between Mars and Jupiter." },
    europa: { blurb: "A moon of Jupiter covered in ice.", fact: "Under Europa's ice there is probably an ocean with more water than all of Earth's oceans put together.", question: "What is probably under Europa's icy crust?", options: ["Molten rock", "An ocean of liquid water", "A dense forest", "Nothing"], explanation: "Under the ice there is probably an ocean of liquid water. Life might exist there, which is why Europa is studied." },
    saturn: { blurb: "The planet with the most striking rings.", fact: "Saturn is so light it would float in a giant bathtub of water (its density is less than water's).", question: "What are Saturn's rings made of?", options: ["Gas", "A solid disc", "Mostly pieces of ice and rock", "Clouds"], explanation: "The rings are made of billions of pieces of ice and rock, from specks to big boulders." },
    mercury: { blurb: "The smallest planet and the closest to the Sun. Scorching by day, freezing at night.", fact: "Mercury orbits the Sun in just 88 Earth days.", question: "Which planet is closest to the Sun?", options: ["Venus", "Mercury", "Mars", "Earth"], explanation: "Mercury is the closest planet to the Sun." },
    jupiter: { blurb: "The biggest planet in the solar system, a gas giant with bands of clouds.", fact: "The Great Red Spot is a storm bigger than the whole Earth and has lasted for hundreds of years.", question: "What is Jupiter mostly made of?", options: ["Rock", "Water ice", "Hydrogen and helium", "Iron"], explanation: "Jupiter is a gas giant made mainly of hydrogen and helium." },
    titan: { blurb: "Saturn’s largest moon, with a thick orange atmosphere and lakes of methane.", fact: "The Huygens probe landed on Titan in 2005.", question: "Which moon of Saturn has a thick atmosphere and methane lakes?", options: ["Europa", "Titan", "Io", "Triton"], explanation: "Titan is Saturn’s largest moon and the only moon with a thick atmosphere." },
  },
};

const de: BaseText = {
  title: "Basis",
  intro: "Baue deine eigene Raumstation, bau Schiffe und schick sie zu den Planeten. Bei allem erfährst du, wie es wirklich funktioniert.",
  loginPrompt: "Melde dich an, damit deine Basis gespeichert wird.",
  login: "Anmelden",
  loading: "Basis wird geladen…",
  unavailable: "Deine Basis konnte gerade nicht geladen werden. Versuche es gleich noch einmal.",
  tabs: { build: "Bauen", fleet: "Flotte", map: "Weltraum", codex: "Kodex" },
  stats: {
    credits: "Credits",
    science: "Wissenschaft",
    points: "Lernpunkte",
    energy: "Energie",
    crew: "Besatzung",
    life: "Lebenserhaltung",
    efficiency: "Stationsleistung",
    perHour: "pro Stunde",
    bonuses: "Boni",
    learning: "Lernen (letzte 24 h)",
    pet: "Haustier",
    city: "Stadt",
    modules: "Module",
  },
  cats: { core: "Kern", energy: "Energie", life: "Leben", science: "Wissenschaft", industry: "Produktion", ships: "Schiffe" },
  build: {
    palette: "Module",
    demolish: "Abreißen",
    rotate: "Drehen",
    cancel: "Auswahl aufheben",
    hint: "Wähle ein Modul und tippe aufs Raster. Jedes Modul muss mit dem Kommandomodul verbunden sein.",
    needLevel: "Ab Stufe",
    howTitle: "So funktioniert es",
    factTitle: "Wusstest du…",
    cost: "Preis",
    produces: "Liefert",
    needs: "Braucht",
    disconnected: "Nicht mit dem Kommandomodul verbunden, daher funktioniert es nicht.",
    lowPower: "Zu wenig Energie. Baue Solarpaneele oder einen Reaktor.",
    lowCrew: "Zu wenig Besatzung. Baue Unterkünfte.",
    lowLife: "Zu wenig Lebenserhaltung. Baue ein Gewächshaus oder eine Wasseraufbereitung.",
    built: "Gebaut",
  },
  fleet: {
    title: "Flotte",
    empty: "Du hast noch kein Schiff. Baue eine Werft und einen Hangar, dann ein Schiff.",
    slots: "Hangarplätze",
    buildShip: "Schiff bauen",
    needShipyard: "Du brauchst eine Werft",
    building: "Im Bau",
    docked: "Im Dock",
    onMission: "Auf Mission",
    arrived: "Angekommen",
    send: "Auf Mission schicken",
    collect: "Belohnungen abholen",
    returnsIn: "Ankunft in",
    chooseDest: "Ziel wählen",
    tier: "Klasse",
    speed: "Tempo",
    buildTime: "Bauzeit",
  },
  map: {
    title: "Weltraum",
    hint: "Tippe auf einen Planeten. Du musst ihn zuerst mit Wissenschaft erforschen, dann schickst du ein Schiff.",
    earth: "Basis",
    sun: "Sonne",
    research: "Erforschen",
    researched: "Erforscht",
    needScience: "Zu wenig Wissenschaft",
    travel: "Reise",
    reward: "Belohnung",
    tooWeak: "Deine Schiffe schaffen das nicht, du brauchst eine bessere Klasse.",
    locked: "Erforsche es zuerst.",
    chooseShip: "Schiff wählen",
    noShip: "Du hast kein freies Schiff.",
  },
  codex: {
    title: "Kodex",
    intro: "Hier steht alles, was du baust oder entdeckst. Lies nach, wie es funktioniert.",
    modules: "Module",
    worlds: "Welten",
    unknown: "Noch nicht entdeckt",
    found: "Entdeckt",
  },
  debrief: {
    title: "Frage zur Mission",
    correct: "Richtig!",
    wrong: "Diesmal nicht, aber jetzt weißt du es.",
    bonus: "Bonus",
    next: "Weiter",
    science: "Wissenschaft",
  },
  units: { minutes: "Min", hours: "Std", seconds: "Sek" },
  errors: {
    "unknown-item": "Dieses Modul kenne ich nicht.",
    "out-of-bounds": "Dort reicht das Raster nicht hin.",
    occupied: "Der Platz ist belegt.",
    "not-enough-credits": "Nicht genug Credits.",
    "not-enough-points": "Nicht genug Lernpunkte.",
    "not-enough-science": "Nicht genug Wissenschaft.",
    locked: "Dafür ist deine Stufe noch zu niedrig.",
    "nothing-there": "Hier gibt es nichts zu tun.",
    "too-many": "Zu viel auf einmal.",
    "only-one-core": "Es kann nur ein Kommandomodul geben.",
    "core-protected": "Das Kommandomodul lässt sich nicht abreißen.",
    "no-shipyard": "Baue zuerst eine Werft.",
    "no-hangar-slot": "Kein Platz in den Hangars. Baue einen weiteren Hangar.",
    "unknown-ship": "Dieses Schiff kenne ich nicht.",
    "unknown-dest": "Dieses Ziel kenne ich nicht.",
    "ship-busy": "Das Schiff ist auf Mission.",
    "ship-not-ready": "Das Schiff ist noch im Bau.",
    "ship-too-weak": "Dieses Schiff kommt dort nicht hin.",
    "dest-locked": "Erforsche das Ziel zuerst.",
    "no-mission": "Noch kein Schiff ist angekommen.",
    "nothing-to-answer": "Keine Frage wartet.",
    "already-researched": "Das hast du schon erforscht.",
    "login-required": "Melde dich an.",
    unavailable: "Gerade nicht möglich, versuche es gleich noch einmal.",
    conflict: "Die Basis hat sich inzwischen woanders geändert. Lade neu.",
    "unknown-action": "Unbekannte Aktion.",
  },
  modules: {
    core: { how: "Es steuert die ganze Station und liefert Grundenergie, Unterkunft und Luft. Jedes andere Modul muss damit verbunden sein.", fact: "Die Internationale Raumstation besteht aus Modulen und umrundet die Erde etwa alle 90 Minuten." },
    corridor: { how: "Ein Korridor verbindet Module, damit Besatzung, Strom und Luft hindurch können.", fact: "Auf der ISS schweben Astronauten zwischen den Modulen und halten sich an Griffen fest." },
    solar: { how: "Photovoltaikzellen wandeln Licht in Strom um (photovoltaischer Effekt). Mehr Licht heißt mehr Energie.", fact: "Die Solarflügel der ISS haben zusammen eine Spannweite von etwa 73 Metern." },
    reactor: { how: "Beim Spalten von Urankernen wird Wärme frei, daraus wird Strom. Aus wenig Brennstoff entsteht viel Energie.", fact: "Die Sonde Voyager 1 und der Rover Curiosity beziehen Energie aus Radioisotopenquellen, nicht von der Sonne." },
    quarters: { how: "Hier schläft und ruht die Besatzung. Mehr Unterkünfte heißen mehr Leute, die Module bedienen.", fact: "ISS-Astronauten schlafen in Kabinen in Schlafsäcken an der Wand, weil es in der Schwerelosigkeit kein Oben und Unten gibt." },
    greenhouse: { how: "Bei der Photosynthese machen Pflanzen aus Licht, Wasser und Kohlendioxid Zucker und geben Sauerstoff ab. Sie liefern Luft und Nahrung.", fact: "Auf der ISS haben Astronauten Salat und sogar blühende Zinnien gezüchtet." },
    water: { how: "Sie reinigt Wasser aus Schweiß, Atem und Urin wieder zu Trinkwasser. Im All ist jeder Liter kostbar, weil es keinen Nachschub gibt.", fact: "Das System der ISS gewinnt mehr als 90 % des Wassers zurück." },
    lab: { how: "Forscher machen hier Versuche, die auf der Erde nicht gehen, zum Beispiel in Schwerelosigkeit. Das Labor erzeugt Wissenschaft.", fact: "In der Schwerelosigkeit brennt eine Flamme rund und Kristalle wachsen regelmäßiger als auf der Erde." },
    observatory: { how: "Teleskope über der Atmosphäre sehen Sterne und Planeten scharf, ohne Luftunruhe. Beobachtungen bringen viel Wissenschaft.", fact: "Das Hubble-Teleskop kreist über der Atmosphäre und sieht deshalb schärfer als die meisten Teleskope am Boden." },
    antenna: { how: "Sie sendet und empfängt Funkwellen. Eine bessere Verbindung heißt größere Missionsbelohnungen (+8 % pro Antenne, höchstens drei).", fact: "Funksignale breiten sich mit Lichtgeschwindigkeit aus. Von der Erde zum Mond brauchen sie etwa 1,3 Sekunden." },
    workshop: { how: "Sie repariert Teile und stellt Ersatzteile her. Die verkauft sie und verdient Credits.", fact: "Auf der ISS steht ein 3D-Drucker, mit dem Astronauten Ersatzteile drucken." },
    trade: { how: "Sie handelt mit Vorräten und Waren. Sie verdient viele Credits, braucht aber eine größere Besatzung.", fact: "Ein Kilogramm Fracht in die Umlaufbahn zu bringen kostete früher Zehntausende Dollar. Deshalb zählt im All jedes Gramm." },
    hangar: { how: "Er parkt Schiffe und schützt sie vor Strahlung und Staub. Jeder Hangar hat zwei Plätze.", fact: "Mikrometeoriten sind Staubkörnchen, die mit Zehntausenden km/h fliegen und ein Loch in ein Schiff schlagen können." },
    shipyard: { how: "Sie baut neue Schiffe aus Teilen und Metall. Ohne Werft kannst du keine Schiffe bauen.", fact: "Das Space Shuttle Discovery absolvierte 39 Flüge. Shuttles wurden repariert und flogen wieder." },
    fusion: { how: "Er verschmilzt leichte Wasserstoffkerne zu Helium und setzt dabei riesige Energiemengen frei, genau wie die Sonne.", fact: "In der Sonne werden jede Sekunde etwa 600 Millionen Tonnen Wasserstoff zu Helium." },
    biolab: { how: "Es erforscht lebende Organismen und züchtet Zellen und Pflanzen für künftige Missionen.", fact: "Auf der Internationalen Raumstation haben Astronauten Salat, Radieschen und Chilischoten angebaut." },
    mining: { how: "Es gewinnt Metalle und Wasser von Asteroiden und Monden, die verkauft oder zum Bauen verwendet werden.", fact: "Der Asteroid Psyche besteht nach Ansicht von Forschern hauptsächlich aus Eisen und Nickel." },
    dock: { how: "Hier legen Schiffe an der Basis an. Eine Dockbucht fasst mehr Schiffe gleichzeitig als ein Hangar.", fact: "Raumschiffe docken mit einem präzisen Manöver an eine Station an und verriegeln sich mit einem Kopplungsmechanismus." },
  },
  ships: {
    probe: { desc: "Ein kleines unbemanntes Schiff. Es erreicht den Mond und die nächsten Ziele." },
    shuttle: { desc: "Ein größeres Schiff mit stärkeren Triebwerken. Es erreicht die Planeten." },
    explorer: { desc: "Ein schnelles Langstreckenschiff. Es erreicht die äußeren Planeten und ihre Monde." },
  },
  dests: {
    moon: { blurb: "Die nächste fremde Welt, 384 400 km von der Erde.", fact: "Der Mond entfernt sich von der Erde um etwa 3,8 Zentimeter pro Jahr.", question: "Warum sehen wir von der Erde immer dieselbe Seite des Mondes?", options: ["Der Mond dreht sich gar nicht", "Er dreht sich in derselben Zeit einmal um sich, in der er die Erde umrundet", "Die Erde hält ihn an einem Seil", "Die andere Seite ist immer dunkel"], explanation: "Der Mond dreht sich in genau der Zeit einmal um seine Achse, die er für eine Erdumrundung braucht. Darum zeigt uns immer dieselbe Seite." },
    venus: { blurb: "Der heißeste Planet, rund 465 °C.", fact: "Die Venus dreht sich entgegengesetzt zu den meisten Planeten, und ein Tag dauert dort länger als ein Jahr.", question: "Warum ist die Venus heißer als der Merkur, obwohl sie weiter von der Sonne entfernt ist?", options: ["Sie hat eine eigene Wärmequelle", "Sie ist näher an der Sonne", "Die dichte Kohlendioxid-Atmosphäre hält die Wärme fest (Treibhauseffekt)", "Sie besteht ganz aus Lava"], explanation: "Die dichte Kohlendioxid-Atmosphäre hält die Wärme wie ein Treibhaus fest, deshalb ist die Venus heißer als der Merkur." },
    mars: { blurb: "Der rote Planet mit dem größten Vulkan des Sonnensystems.", fact: "Der Olympus Mons auf dem Mars ist etwa 22 km hoch, etwa zweieinhalbmal so hoch wie der Mount Everest.", question: "Warum ist der Mars rot?", options: ["Eisen im Staub und Boden ist verrostet", "Er ist mit roten Pflanzen bedeckt", "Er wird von der Sonne zu heiß", "Er leuchtet selbst"], explanation: "Im Marsboden steckt Eisen, das verrostet ist. Darum ist der Planet rot." },
    asteroids: { blurb: "Überreste aus der Entstehung des Sonnensystems, zwischen Mars und Jupiter.", fact: "Das größte Objekt des Gürtels, Ceres, ist ein Zwergplanet.", question: "Wo liegt der Hauptgürtel der Asteroiden?", options: ["Zwischen Erde und Mars", "Zwischen Venus und Erde", "Hinter dem Neptun", "Zwischen Mars und Jupiter"], explanation: "Der Hauptgürtel der Asteroiden liegt zwischen Mars und Jupiter." },
    europa: { blurb: "Ein eisbedeckter Jupitermond.", fact: "Unter dem Eis der Europa liegt vermutlich ein Ozean mit mehr Wasser als alle Ozeane der Erde zusammen.", question: "Was liegt vermutlich unter der Eiskruste der Europa?", options: ["Geschmolzenes Gestein", "Ein Ozean aus flüssigem Wasser", "Ein dichter Wald", "Nichts"], explanation: "Unter dem Eis liegt vermutlich ein Ozean aus flüssigem Wasser. Dort könnte Leben sein, deshalb wird die Europa erforscht." },
    saturn: { blurb: "Der Planet mit den auffälligsten Ringen.", fact: "Der Saturn ist so leicht, dass er in einer riesigen Badewanne schwimmen würde (seine Dichte ist kleiner als die von Wasser).", question: "Woraus bestehen die Saturnringe?", options: ["Aus Gas", "Aus einer festen Scheibe", "Hauptsächlich aus Eis- und Gesteinsbrocken", "Aus Wolken"], explanation: "Die Ringe bestehen aus Milliarden Eis- und Gesteinsbrocken, von Körnchen bis zu großen Felsen." },
    mercury: { blurb: "Der kleinste Planet und der Sonne am nächsten. Tagsüber glühend heiß, nachts eiskalt.", fact: "Der Merkur umkreist die Sonne in nur 88 Erdentagen.", question: "Welcher Planet ist der Sonne am nächsten?", options: ["Venus", "Merkur", "Mars", "Erde"], explanation: "Der Merkur ist der Sonne am nächsten." },
    jupiter: { blurb: "Der größte Planet des Sonnensystems, ein Gasriese mit Wolkenbändern.", fact: "Der Große Rote Fleck ist ein Sturm, größer als die ganze Erde, und tobt seit Hunderten von Jahren.", question: "Woraus besteht der Jupiter hauptsächlich?", options: ["Aus Gestein", "Aus Wassereis", "Aus Wasserstoff und Helium", "Aus Eisen"], explanation: "Der Jupiter ist ein Gasriese, der hauptsächlich aus Wasserstoff und Helium besteht." },
    titan: { blurb: "Der größte Mond des Saturn mit dichter oranger Atmosphäre und Methanseen.", fact: "Die Sonde Huygens landete 2005 auf dem Titan.", question: "Welcher Saturnmond hat eine dichte Atmosphäre und Methanseen?", options: ["Europa", "Titan", "Io", "Triton"], explanation: "Der Titan ist der größte Saturnmond und der einzige Mond mit dichter Atmosphäre." },
  },
};

const ru: BaseText = {
  title: "База",
  intro: "Построй свою космическую станцию, создавай корабли и отправляй их к планетам. Про всё узнаешь, как это устроено на самом деле.",
  loginPrompt: "Войди, чтобы твоя база сохранялась.",
  login: "Войти",
  loading: "Загружаю базу…",
  unavailable: "Сейчас не удалось загрузить базу. Попробуй чуть позже.",
  tabs: { build: "Стройка", fleet: "Флот", map: "Космос", codex: "Кодекс" },
  stats: {
    credits: "Кредиты",
    science: "Наука",
    points: "Очки за учёбу",
    energy: "Энергия",
    crew: "Экипаж",
    life: "Жизнеобеспечение",
    efficiency: "Мощность станции",
    perHour: "в час",
    bonuses: "Бонусы",
    learning: "Учёба (последние 24 ч)",
    pet: "Питомец",
    city: "Город",
    modules: "Модули",
  },
  cats: { core: "Основа", energy: "Энергия", life: "Жизнь", science: "Наука", industry: "Производство", ships: "Корабли" },
  build: {
    palette: "Модули",
    demolish: "Снести",
    rotate: "Повернуть",
    cancel: "Снять выбор",
    hint: "Выбери модуль и коснись сетки. Каждый модуль должен быть соединён с командным.",
    needLevel: "С уровня",
    howTitle: "Как это работает",
    factTitle: "А ты знаешь…",
    cost: "Цена",
    produces: "Даёт",
    needs: "Нужно",
    disconnected: "Не соединён с командным модулем, поэтому не работает.",
    lowPower: "Не хватает энергии. Построй солнечные панели или реактор.",
    lowCrew: "Не хватает экипажа. Построй жилой модуль.",
    lowLife: "Не хватает жизнеобеспечения. Построй оранжерею или переработку воды.",
    built: "Построено",
  },
  fleet: {
    title: "Флот",
    empty: "У тебя пока нет кораблей. Построй верфь и ангар, потом корабль.",
    slots: "Места в ангарах",
    buildShip: "Построить корабль",
    needShipyard: "Нужна верфь",
    building: "Строится",
    docked: "В доке",
    onMission: "На миссии",
    arrived: "Прибыл",
    send: "Отправить на миссию",
    collect: "Забрать награды",
    returnsIn: "Прибудет через",
    chooseDest: "Выбери цель",
    tier: "Класс",
    speed: "Скорость",
    buildTime: "Строительство",
  },
  map: {
    title: "Космос",
    hint: "Коснись планеты. Сначала исследуй её за науку, потом отправь корабль.",
    earth: "База",
    sun: "Солнце",
    research: "Исследовать",
    researched: "Исследовано",
    needScience: "Не хватает науки",
    travel: "Дорога",
    reward: "Награда",
    tooWeak: "Твои корабли туда не долетят, нужен класс выше.",
    locked: "Сначала исследуй её.",
    chooseShip: "Выбери корабль",
    noShip: "Нет свободного корабля.",
  },
  codex: {
    title: "Кодекс",
    intro: "Сюда записывается всё, что ты построишь или откроешь. Прочитай, как это работает.",
    modules: "Модули",
    worlds: "Миры",
    unknown: "Пока не открыто",
    found: "Открыто",
  },
  debrief: {
    title: "Вопрос после миссии",
    correct: "Верно!",
    wrong: "В этот раз нет, зато теперь ты знаешь.",
    bonus: "Бонус",
    next: "Дальше",
    science: "науки",
  },
  units: { minutes: "мин", hours: "ч", seconds: "с" },
  errors: {
    "unknown-item": "Не знаю такого модуля.",
    "out-of-bounds": "Сетка туда не доходит.",
    occupied: "Это место занято.",
    "not-enough-credits": "Не хватает кредитов.",
    "not-enough-points": "Не хватает очков за учёбу.",
    "not-enough-science": "Не хватает науки.",
    locked: "Твой уровень для этого ещё мал.",
    "nothing-there": "Здесь нечего делать.",
    "too-many": "Слишком много сразу.",
    "only-one-core": "Командный модуль может быть только один.",
    "core-protected": "Командный модуль снести нельзя.",
    "no-shipyard": "Сначала построй верфь.",
    "no-hangar-slot": "В ангарах нет места. Построй ещё один ангар.",
    "unknown-ship": "Не знаю такого корабля.",
    "unknown-dest": "Не знаю такой цели.",
    "ship-busy": "Корабль на миссии.",
    "ship-not-ready": "Корабль ещё строится.",
    "ship-too-weak": "Этот корабль туда не долетит.",
    "dest-locked": "Сначала исследуй цель.",
    "no-mission": "Пока ни один корабль не прибыл.",
    "nothing-to-answer": "Вопросов нет.",
    "already-researched": "Это уже исследовано.",
    "login-required": "Войди.",
    unavailable: "Сейчас не получается, попробуй чуть позже.",
    conflict: "База тем временем изменилась в другом месте. Загружаю заново.",
    "unknown-action": "Неизвестное действие.",
  },
  modules: {
    core: { how: "Управляет всей станцией и даёт базовую энергию, жильё и воздух. Все остальные модули должны быть с ним соединены.", fact: "Международная космическая станция собрана из модулей и облетает Землю примерно за 90 минут." },
    corridor: { how: "Коридор соединяет модули, чтобы по нему проходили экипаж, электричество и воздух.", fact: "На МКС космонавты перемещаются между модулями в невесомости, держась за поручни." },
    solar: { how: "Фотоэлементы превращают свет в электричество (фотоэффект). Чем больше света, тем больше энергии.", fact: "Размах солнечных батарей МКС составляет около 73 метров." },
    reactor: { how: "При делении ядер урана выделяется тепло, из него получают электричество. Из малого количества топлива получается много энергии.", fact: "Зонд «Вояджер-1» и марсоход «Кьюриосити» берут энергию из радиоизотопных источников, а не от Солнца." },
    quarters: { how: "Здесь экипаж спит и отдыхает. Больше жилья значит больше людей, которые обслуживают модули.", fact: "Космонавты на МКС спят в каютах в спальных мешках, закреплённых на стене, потому что в невесомости нет верха и низа." },
    greenhouse: { how: "При фотосинтезе растения из света, воды и углекислого газа делают сахара и выделяют кислород. Они дают воздух и еду.", fact: "На МКС космонавты вырастили салат и даже цветущие циннии." },
    water: { how: "Очищает воду из пота, дыхания и мочи обратно до питьевой. В космосе каждый литр дорог, ведь взять больше негде.", fact: "Система МКС возвращает больше 90 % воды." },
    lab: { how: "Учёные ставят опыты, которые невозможны на Земле, например в невесомости. Лаборатория даёт науку.", fact: "В невесомости пламя горит шаром, а кристаллы растут правильнее, чем на Земле." },
    observatory: { how: "Телескопы над атмосферой видят звёзды и планеты чётко, без искажений воздуха. Наблюдения дают много науки.", fact: "Телескоп «Хаббл» летает над атмосферой, поэтому видит чётче большинства наземных телескопов." },
    antenna: { how: "Передаёт и принимает радиоволны. Лучше связь значит больше награды за миссии (+8 % за антенну, не больше трёх).", fact: "Радиосигнал идёт со скоростью света. С Земли до Луны он летит около 1,3 секунды." },
    workshop: { how: "Чинит детали и делает запчасти. Продаёт их и зарабатывает кредиты.", fact: "На МКС есть 3D-принтер, на котором космонавты печатают запчасти." },
    trade: { how: "Торгует припасами и товарами. Много зарабатывает, но нужен экипаж побольше.", fact: "Доставить килограмм груза на орбиту раньше стоило десятки тысяч долларов. Поэтому в космосе дорог каждый грамм." },
    hangar: { how: "Паркует корабли и защищает их от радиации и пыли. В каждом ангаре два места.", fact: "Микрометеориты — это пылинки, летящие со скоростью десятки тысяч километров в час, они могут пробить корабль." },
    shipyard: { how: "Собирает новые корабли из деталей и металла. Без верфи корабли не построить.", fact: "Шаттл «Дискавери» совершил 39 полётов. Шаттлы ремонтировали и запускали снова." },
    fusion: { how: "Он сливает лёгкие ядра водорода в гелий и выделяет огромное количество энергии, как Солнце.", fact: "В Солнце каждую секунду около 600 миллионов тонн водорода превращается в гелий." },
    biolab: { how: "Она изучает живые организмы и выращивает клетки и растения для будущих миссий.", fact: "На Международной космической станции астронавты вырастили салат, редис и перец чили." },
    mining: { how: "Он добывает на астероидах и спутниках металлы и воду, которые продаются или идут на строительство.", fact: "Учёные считают, что астероид Психея состоит в основном из железа и никеля." },
    dock: { how: "Сюда причаливают корабли. В доке помещается больше кораблей одновременно, чем в ангаре.", fact: "Космические корабли стыкуются со станцией точным манёвром и фиксируются стыковочным механизмом." },
  },
  ships: {
    probe: { desc: "Маленький беспилотный корабль. Долетает до Луны и ближайших целей." },
    shuttle: { desc: "Корабль побольше с мощными двигателями. Долетает до планет." },
    explorer: { desc: "Быстрый дальний корабль. Долетает до внешних планет и их спутников." },
  },
  dests: {
    moon: { blurb: "Ближайший чужой мир, 384 400 км от Земли.", fact: "Луна удаляется от Земли примерно на 3,8 сантиметра в год.", question: "Почему с Земли мы всегда видим одну и ту же сторону Луны?", options: ["Луна вообще не вращается", "Она делает один оборот вокруг оси за то же время, за которое облетает Землю", "Земля держит её на верёвке", "Другая сторона всегда тёмная"], explanation: "Луна делает оборот вокруг оси ровно за то время, за которое облетает Землю. Поэтому к нам всегда повёрнута одна сторона." },
    venus: { blurb: "Самая горячая планета, около 465 °C.", fact: "Венера вращается в обратную сторону, чем большинство планет, и сутки на ней длиннее года.", question: "Почему Венера горячее Меркурия, хотя дальше от Солнца?", options: ["У неё свой источник тепла", "Она ближе к Солнцу", "Плотная атмосфера из углекислого газа удерживает тепло (парниковый эффект)", "Она вся из лавы"], explanation: "Плотная атмосфера из углекислого газа удерживает тепло, как в теплице, поэтому Венера горячее Меркурия." },
    mars: { blurb: "Красная планета с самым большим вулканом Солнечной системы.", fact: "Олимп на Марсе высотой около 22 км, примерно в два с половиной раза выше Эвереста.", question: "Почему Марс красный?", options: ["Железо в пыли и почве заржавело", "Он покрыт красными растениями", "Он слишком греется от Солнца", "Он светится сам"], explanation: "В марсианской почве есть железо, которое заржавело, поэтому планета красная." },
    asteroids: { blurb: "Остатки от рождения Солнечной системы, между Марсом и Юпитером.", fact: "Самое большое тело пояса, Церера, — карликовая планета.", question: "Где находится главный пояс астероидов?", options: ["Между Землёй и Марсом", "Между Венерой и Землёй", "За Нептуном", "Между Марсом и Юпитером"], explanation: "Главный пояс астероидов находится между Марсом и Юпитером." },
    europa: { blurb: "Покрытый льдом спутник Юпитера.", fact: "Под льдом Европы, вероятно, океан, в котором воды больше, чем во всех океанах Земли вместе.", question: "Что, вероятно, находится под ледяной коркой Европы?", options: ["Расплавленная порода", "Океан жидкой воды", "Густой лес", "Ничего"], explanation: "Под льдом, вероятно, океан жидкой воды. Там может быть жизнь, поэтому Европу изучают." },
    saturn: { blurb: "Планета с самыми заметными кольцами.", fact: "Сатурн такой лёгкий, что плавал бы в гигантской ванне с водой (его плотность меньше плотности воды).", question: "Из чего состоят кольца Сатурна?", options: ["Из газа", "Из твёрдого диска", "В основном из кусков льда и камня", "Из облаков"], explanation: "Кольца состоят из миллиардов кусков льда и камня — от песчинок до больших глыб." },
    mercury: { blurb: "Самая маленькая планета и ближайшая к Солнцу. Днём жарко, ночью мороз.", fact: "Меркурий обращается вокруг Солнца всего за 88 земных суток.", question: "Какая планета ближе всех к Солнцу?", options: ["Венера", "Меркурий", "Марс", "Земля"], explanation: "Ближе всех к Солнцу находится Меркурий." },
    jupiter: { blurb: "Самая большая планета Солнечной системы, газовый гигант с полосами облаков.", fact: "Большое красное пятно — буря больше всей Земли, она бушует сотни лет.", question: "Из чего в основном состоит Юпитер?", options: ["Из камня", "Из водяного льда", "Из водорода и гелия", "Из железа"], explanation: "Юпитер — газовый гигант, состоящий в основном из водорода и гелия." },
    titan: { blurb: "Крупнейший спутник Сатурна с плотной оранжевой атмосферой и метановыми озёрами.", fact: "Зонд «Гюйгенс» сел на Титан в 2005 году.", question: "У какого спутника Сатурна плотная атмосфера и метановые озёра?", options: ["Европа", "Титан", "Ио", "Тритон"], explanation: "Титан — крупнейший спутник Сатурна и единственный спутник с плотной атмосферой." },
  },
};

const T: Record<Locale, BaseText> = { cs, en, de, ru };

export function getBaseText(locale: Locale): BaseText {
  return T[locale];
}

// Textový zápis doby: "1 h 05 min", "12 min", "45 s".
export function formatDuration(ms: number, units: BaseText["units"]): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h} ${units.hours} ${String(m).padStart(2, "0")} ${units.minutes}`;
  if (m > 0) return `${m} ${units.minutes}`;
  return `${s} ${units.seconds}`;
}
