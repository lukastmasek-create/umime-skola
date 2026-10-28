import type { Locale } from "./config";
import type { ChGame } from "@/lib/idle/challenge";

export type Chapter = { name: string; intro: string; win: string };

export type ChallengeText = {
  title: string;
  subtitle: string;
  loginRequired: string;
  loading: string;
  unavailable: string;
  tabs: { quiz: string; boss: string; compete: string };
  currency: Record<ChGame, string>;
  needsGame: string;
  // Kvíz
  quickTitle: string;
  quickHint: string;
  ask: string;
  streak: string; // {n}
  best: string; // {n}
  multiplier: string; // {n}
  boost: string; // {n} {m}
  noBoost: string;
  shields: string; // {n}
  hints: string; // {n}
  useHint: string;
  accuracy: string; // {n}
  adaptive: string;
  weakBadge: string;
  fastBadge: string;
  seconds: string; // {n}
  correct: string;
  wrong: string;
  shieldSaved: string;
  gainedShield: string;
  gainedHint: string;
  reward: string; // {coins} {unit} {xp} {points}
  next: string;
  giveUp: string;
  course: string; // {n}
  // Boss
  bossTitle: string;
  chapterLabel: string; // {n}
  bossQuestion: string; // {i} {n}
  lives: string;
  locked: string; // {n}
  need: Record<ChGame, string>; // {n}
  fight: string;
  bossWon: string;
  bossLost: string;
  allDone: string;
  flawless: string;
  story: Record<ChGame, Chapter[]>;
  // Soutěž
  boardTitle: string;
  boardEmpty: string;
  boardMine: string; // {n}
  boardUnit: string;
  you: string;
  weekTitle: string;
  weekScore: string; // {n}
  weekEnds: string; // {d} {h}
  weekHow: string;
  tier: { bronze: string; silver: string; gold: string };
  tierReward: string; // {points} {xp}
  lastWeek: string; // {n}
  lastWeekRank: string; // {n}
  claim: string;
  claimed: string;
  partyTitle: string;
  partyEmpty: string;
  partyOrder: string; // {name}
  partyProgress: string; // {n} {m}
  partyReward: string; // {n}
  partyRanking: string;
  giftsTitle: string;
  giftsHint: string; // {n}
  giftTo: string;
  giftSend: string;
  giftSent: string;
  giftInbox: string;
  giftFrom: string; // {name}
  giftNone: string;
  giftReceived: string; // {n} {unit}
  errors: Record<string, string>;
};

type Raw = Record<ChGame, [string, string, string][]>;
const chapters = (raw: Raw): Record<ChGame, Chapter[]> => {
  const map = (rows: [string, string, string][]) => rows.map(([name, intro, win]) => ({ name, intro, win }));
  return { farm: map(raw.farm), city: map(raw.city), base: map(raw.base), pets: map(raw.pets) };
};

const cs: ChallengeText = {
  title: "Výzvy",
  subtitle: "Odpovídej na otázky z kurzů, budováním série získáš bonusy a v každé kapitole tě čeká boss.",
  loginRequired: "Pro výzvy se přihlas.",
  loading: "Načítám výzvy…",
  unavailable: "Výzvy se teď nepodařilo načíst.",
  tabs: { quiz: "Kvíz", boss: "Boss", compete: "Soutěž" },
  currency: { farm: "mincí", city: "mincí", base: "kreditů", pets: "mincí" },
  needsGame: "Nejdřív ve hře něco postav, pak se ti výzvy odemknou.",
  quickTitle: "Rychlá otázka",
  quickHint: "Správná odpověď dá odměnu ve hře. Čím delší série, tím větší násobič a zrychlení hry.",
  ask: "Dej mi otázku",
  streak: "Série {n}",
  best: "rekord {n}",
  multiplier: "násobič ×{n}",
  boost: "Zrychlení hry +{n} % ještě {m} min",
  noBoost: "Zodpověz otázku a hra se na chvíli zrychlí.",
  shields: "Štíty {n}",
  hints: "Nápovědy {n}",
  useHint: "50:50",
  accuracy: "Úspěšnost {n} %",
  adaptive: "Otázky se přizpůsobují: čím líp ti to jde, tím jsou těžší, a občas se vrátí to, co jsi dřív zkazil/a.",
  weakBadge: "Slabé místo",
  fastBadge: "Rychle! +25 %",
  seconds: "{n} s",
  correct: "Správně!",
  wrong: "Tentokrát ne.",
  shieldSaved: "Štít tě zachránil, série zůstává.",
  gainedShield: "Nový štít",
  gainedHint: "Nová nápověda 50:50",
  reward: "+{coins} {unit}, +{xp} XP, +{points} bodů",
  next: "Další",
  giveUp: "Vzdát",
  course: "Kurz: {n}",
  bossTitle: "Bossové a příběh",
  chapterLabel: "Kapitola {n}",
  bossQuestion: "Otázka {i} z {n}",
  lives: "Životy",
  locked: "Odemkne se: {n}",
  need: { farm: "úroveň farmy {n}", city: "{n} budov ve městě", base: "{n} modulů základny", pets: "mazlíček na úrovni {n}" },
  fight: "Vyzvat bosse",
  bossWon: "Boss poražen!",
  bossLost: "Boss tentokrát vyhrál. Zkus to znovu, otázky se přizpůsobí.",
  allDone: "Všechny kapitoly jsou hotové. Díky, hrdino!",
  flawless: "Bez ztráty života: bonus navíc!",
  story: chapters({
    farm: [
      ["Hladová vrána", "Na tvé pole přiletěla vrána a chystá se sezobat úrodu.", "Vrána odletěla a pole je v bezpečí."],
      ["Krtek Kopáč", "Někdo ti podkopává záhony. Je to krtek, který zná všechny tajné tunely.", "Krtek se přestěhoval pod les a záhony zůstaly celé."],
      ["Liška lupička", "Liška se plíží ke kurníku a má v hlavě chytrý plán.", "Liška couvla s prázdnou. Kurník je v klidu."],
      ["Obří slimák", "Ze zahrady se ozývá mlaskání. Obří slimák ohlodává zelí.", "Slimák se zahrabal pod keř a zelí zůstalo."],
      ["Bouře nad polem", "Nad farmou se stahují černé mraky. Poslední zkouška farmáře!", "Bouře se přehnala a farma září jako nikdy."],
    ],
    city: [
      ["Dopravní zácpa", "Ve městě stojí auta. Starosta potřebuje, abys křižovatky rozmotal/a.", "Doprava zase plyne a lidé jsou spokojení."],
      ["Výpadek proudu", "Půlka města je ve tmě a elektrárna nereaguje.", "Světla se rozsvítila a město ožilo."],
      ["Velký požár", "Hoří sklad na kraji města a hasiči čekají na tvůj plán.", "Oheň je uhašen a nikomu se nic nestalo."],
      ["Smogová clona", "Nad městem leží smog. Lidé kašlou a tovární komíny pořád dýmají.", "Vítr smog rozehnal a vzduch je čistý."],
      ["Povodeň", "Řeka stoupá a město se musí bránit. Poslední velká zkouška!", "Hráze vydržely. Město tě oslavuje jako zachránce."],
    ],
    base: [
      ["Meteorický roj", "Kolem základny létají úlomky. Štíty musí vydržet.", "Roj proletěl a základna se ani nepoškrábala."],
      ["Porouchaný reaktor", "Reaktor kolísá a hlásí chybu za chybou.", "Reaktor se ustálil a energie teče."],
      ["Sluneční bouře", "Záření ruší komunikaci. Posádka se schovala do krytu.", "Bouře odezněla a spojení je zpět."],
      ["Rebelující robot", "Pomocný robot odmítá poslouchat a zamyká dveře.", "Robot se restartoval a zase pomáhá."],
      ["Cizí signál", "Z hlubokého vesmíru přišel záhadný signál. Poslední zkouška velitele!", "Signál byl dešifrován: je to pozvánka do galaktického klubu."],
    ],
    pets: [
      ["Ztracená ponožka", "Mazlíček našel ponožku a nechce ji pustit. Přemluv ho.", "Ponožka je zpátky v šuplíku a mazlíček je hrdý."],
      ["Strašidelný vysavač", "Hlučný vysavač mazlíčka děsí. Pomoz mu najít odvahu.", "Mazlíček vysavač přežil a dokonce na něm teď jezdí."],
      ["Velká koupel", "Dnes je den koupele a mazlíček zmizel pod postelí.", "Mazlíček voní jako louka a je spokojený."],
      ["Noční dobrodruh", "Mazlíček v noci vylezl ven a nemůže najít cestu domů.", "Doma je v teple a vypráví o hvězdách."],
      ["Soutěž o nejlepšího mazlíčka", "Dnes se koná velká přehlídka mazlíčků. Poslední zkouška!", "Vítězství! Mazlíček je největší hvězda sousedství."],
    ],
  }),
  boardTitle: "Žebříček nejlepších",
  boardEmpty: "Zatím tu nikdo není.",
  boardMine: "Tvoje pořadí: {n}.",
  boardUnit: "výdělek celkem",
  you: "ty",
  weekTitle: "Týdenní turnaj",
  weekScore: "Skóre tento týden: {n}",
  weekEnds: "Končí za {d} d {h} h",
  weekHow: "Skóre sbíráš za správné odpovědi (rychlé za víc), poražené bossy a poslané dárky. Odměny se vyzvedávají za uplynulý týden.",
  tier: { bronze: "Bronz", silver: "Stříbro", gold: "Zlato" },
  tierReward: "{points} bodů a {xp} XP",
  lastWeek: "Minulý týden: skóre {n}",
  lastWeekRank: "Skončil/a jsi {n}. v partě",
  claim: "Vyzvednout",
  claimed: "Vyzvednuto",
  partyTitle: "Parta",
  partyEmpty: "Dárky a společné zakázky potřebují partu. Založ ji nebo se k ní připoj ve svém profilu.",
  partyOrder: "Společná zakázka: {name}",
  partyProgress: "Skóre party {n} z {m}",
  partyReward: "Každý člen: {n} bodů",
  partyRanking: "Pořadí v partě tento týden",
  giftsTitle: "Dárky pro kamarády",
  giftsHint: "Pošli kamarádovi z party trochu měny z této hry. Dnes můžeš poslat ještě {n}×.",
  giftTo: "Komu",
  giftSend: "Poslat",
  giftSent: "Dárek odeslán.",
  giftInbox: "Dárky pro tebe",
  giftFrom: "Od {name}",
  giftNone: "Zatím žádné dárky.",
  giftReceived: "Přijato {n} {unit}.",
  errors: {
    "no-game": "Nejdřív ve hře něco postav.",
    pending: "Nejdřív dokonči rozdělanou otázku.",
    "no-pending": "Žádná otázka neběží.",
    "no-question": "Teď nemám žádnou otázku. Zkus to později.",
    locked: "Tenhle boss je zatím zamčený.",
    "all-done": "Všechny kapitoly jsou hotové.",
    "no-hint": "Nápovědu teď nelze použít.",
    claimed: "Už vyzvednuto.",
    nothing: "Není co vyzvednout.",
    limit: "Dnešní limit dárků je vyčerpán.",
    "not-in-party": "Tohle jde jen v partě.",
    "not-enough-coins": "Na dárek ti nestačí měna.",
    "inbox-full": "Kamarádova schránka je plná.",
    "not-done": "Zakázka ještě není hotová.",
    conflict: "Hra se změnila v jiném okně. Zkus to znovu.",
    "bad-request": "Tohle nejde.",
    unavailable: "Teď to nejde, zkus to za chvíli.",
  },
};

const en: ChallengeText = {
  title: "Challenges",
  subtitle: "Answer questions from the courses, build a streak for bonuses, and face a boss in every chapter.",
  loginRequired: "Log in to take on challenges.",
  loading: "Loading challenges…",
  unavailable: "Challenges could not be loaded right now.",
  tabs: { quiz: "Quiz", boss: "Boss", compete: "Compete" },
  currency: { farm: "coins", city: "coins", base: "credits", pets: "coins" },
  needsGame: "Build something in the game first and the challenges will unlock.",
  quickTitle: "Quick question",
  quickHint: "A correct answer pays out in the game. The longer your streak, the bigger the multiplier and game speed-up.",
  ask: "Give me a question",
  streak: "Streak {n}",
  best: "best {n}",
  multiplier: "multiplier ×{n}",
  boost: "Game speed +{n}% for {m} more min",
  noBoost: "Answer a question and the game speeds up for a while.",
  shields: "Shields {n}",
  hints: "Hints {n}",
  useHint: "50:50",
  accuracy: "Accuracy {n}%",
  adaptive: "Questions adapt: the better you do, the harder they get, and things you got wrong come back now and then.",
  weakBadge: "Weak spot",
  fastBadge: "Fast! +25%",
  seconds: "{n} s",
  correct: "Correct!",
  wrong: "Not this time.",
  shieldSaved: "The shield saved you, your streak stays.",
  gainedShield: "New shield",
  gainedHint: "New 50:50 hint",
  reward: "+{coins} {unit}, +{xp} XP, +{points} points",
  next: "Next",
  giveUp: "Give up",
  course: "Course: {n}",
  bossTitle: "Bosses and story",
  chapterLabel: "Chapter {n}",
  bossQuestion: "Question {i} of {n}",
  lives: "Lives",
  locked: "Unlocks at: {n}",
  need: { farm: "farm level {n}", city: "{n} buildings in the city", base: "{n} base modules", pets: "a pet at level {n}" },
  fight: "Challenge the boss",
  bossWon: "Boss defeated!",
  bossLost: "The boss won this time. Try again, the questions will adapt.",
  allDone: "All chapters are done. Thanks, hero!",
  flawless: "No life lost: extra bonus!",
  story: chapters({
    farm: [
      ["Hungry Crow", "A crow landed on your field and is about to peck at the crops.", "The crow flew off and the field is safe."],
      ["Digger the Mole", "Somebody is undermining your beds. It's a mole who knows every secret tunnel.", "The mole moved to the forest and the beds are intact."],
      ["Sly Fox", "A fox is creeping towards the henhouse with a secret plan.", "The fox backed off empty-handed. The henhouse is calm."],
      ["Giant Slug", "Munching sounds come from the garden. A giant slug is gnawing the cabbage.", "The slug slid under a bush and the cabbage survived."],
      ["Storm over the Field", "Dark clouds gather over the farm. The farmer's final test!", "The storm passed and the farm shines like never before."],
    ],
    city: [
      ["Traffic Jam", "Cars are stuck all over town. The mayor needs you to untangle the junctions.", "Traffic flows again and everyone is happy."],
      ["Power Outage", "Half of the city is dark and the power plant does not respond.", "The lights came on and the city is alive again."],
      ["Great Fire", "A warehouse on the edge of town is burning and the firefighters wait for your plan.", "The fire is out and nobody was hurt."],
      ["Smog Cloud", "Smog hangs over the city. People cough and the factory chimneys keep puffing.", "A wind blew the smog away and the air is clean."],
      ["Flood", "The river is rising and the city must defend itself. The final big test!", "The dams held. The city celebrates you as its saviour."],
    ],
    base: [
      ["Meteor Shower", "Debris is flying around the base. The shields have to hold.", "The shower passed and the base is not even scratched."],
      ["Faulty Reactor", "The reactor fluctuates and reports error after error.", "The reactor settled and energy flows."],
      ["Solar Storm", "Radiation jams communications. The crew hid in the shelter.", "The storm faded and the link is back."],
      ["Rogue Robot", "The helper robot refuses orders and locks the doors.", "The robot rebooted and helps again."],
      ["Alien Signal", "A mysterious signal came from deep space. The commander's final test!", "The signal was decoded: it's an invitation to the galactic club."],
    ],
    pets: [
      ["The Lost Sock", "Your pet found a sock and will not let go. Talk it round.", "The sock is back in the drawer and your pet is proud."],
      ["Scary Vacuum", "The loud vacuum cleaner frightens your pet. Help it find courage.", "Your pet survived the vacuum and now even rides it."],
      ["Bath Day", "Today is bath day and your pet vanished under the bed.", "Your pet smells like a meadow and is happy."],
      ["Night Adventurer", "Your pet slipped out at night and cannot find the way home.", "It is home and warm, telling stories about the stars."],
      ["Best Pet Contest", "A big pet show is on today. The final test!", "Victory! Your pet is the biggest star of the neighbourhood."],
    ],
  }),
  boardTitle: "Leaderboard",
  boardEmpty: "Nobody here yet.",
  boardMine: "Your rank: {n}.",
  boardUnit: "total earned",
  you: "you",
  weekTitle: "Weekly tournament",
  weekScore: "Score this week: {n}",
  weekEnds: "Ends in {d} d {h} h",
  weekHow: "You score for correct answers (fast ones count more), defeated bosses and gifts sent. Rewards are claimed for the finished week.",
  tier: { bronze: "Bronze", silver: "Silver", gold: "Gold" },
  tierReward: "{points} points and {xp} XP",
  lastWeek: "Last week: score {n}",
  lastWeekRank: "You finished {n}. in your party",
  claim: "Claim",
  claimed: "Claimed",
  partyTitle: "Party",
  partyEmpty: "Gifts and shared orders need a party. Create or join one in your profile.",
  partyOrder: "Shared order: {name}",
  partyProgress: "Party score {n} of {m}",
  partyReward: "Every member: {n} points",
  partyRanking: "Party ranking this week",
  giftsTitle: "Gifts for friends",
  giftsHint: "Send a party friend some currency from this game. You can send {n} more today.",
  giftTo: "To",
  giftSend: "Send",
  giftSent: "Gift sent.",
  giftInbox: "Gifts for you",
  giftFrom: "From {name}",
  giftNone: "No gifts yet.",
  giftReceived: "Received {n} {unit}.",
  errors: {
    "no-game": "Build something in the game first.",
    pending: "Finish the question you've started first.",
    "no-pending": "No question is running.",
    "no-question": "I have no question right now. Try again later.",
    locked: "This boss is still locked.",
    "all-done": "All chapters are done.",
    "no-hint": "The hint cannot be used now.",
    claimed: "Already claimed.",
    nothing: "Nothing to claim.",
    limit: "Today's gift limit is used up.",
    "not-in-party": "This only works in a party.",
    "not-enough-coins": "You don't have enough currency for this gift.",
    "inbox-full": "Your friend's inbox is full.",
    "not-done": "The order isn't finished yet.",
    conflict: "The game changed in another window. Try again.",
    "bad-request": "That's not possible.",
    unavailable: "Not possible right now, try again in a moment.",
  },
};

const de: ChallengeText = {
  title: "Herausforderungen",
  subtitle: "Beantworte Fragen aus den Kursen, sammle Serien für Boni und stelle dich in jedem Kapitel einem Boss.",
  loginRequired: "Melde dich an, um Herausforderungen zu spielen.",
  loading: "Herausforderungen werden geladen …",
  unavailable: "Die Herausforderungen konnten gerade nicht geladen werden.",
  tabs: { quiz: "Quiz", boss: "Boss", compete: "Wettbewerb" },
  currency: { farm: "Münzen", city: "Münzen", base: "Credits", pets: "Münzen" },
  needsGame: "Baue zuerst etwas im Spiel, dann schalten sich die Herausforderungen frei.",
  quickTitle: "Schnelle Frage",
  quickHint: "Eine richtige Antwort bringt eine Belohnung im Spiel. Je länger deine Serie, desto größer Multiplikator und Spieltempo.",
  ask: "Gib mir eine Frage",
  streak: "Serie {n}",
  best: "Rekord {n}",
  multiplier: "Multiplikator ×{n}",
  boost: "Spieltempo +{n} % noch {m} Min.",
  noBoost: "Beantworte eine Frage und das Spiel wird kurz schneller.",
  shields: "Schilde {n}",
  hints: "Hinweise {n}",
  useHint: "50:50",
  accuracy: "Trefferquote {n} %",
  adaptive: "Die Fragen passen sich an: je besser du bist, desto schwerer werden sie, und Fehler von früher kommen wieder vor.",
  weakBadge: "Schwachstelle",
  fastBadge: "Schnell! +25 %",
  seconds: "{n} s",
  correct: "Richtig!",
  wrong: "Diesmal nicht.",
  shieldSaved: "Das Schild hat dich gerettet, die Serie bleibt.",
  gainedShield: "Neues Schild",
  gainedHint: "Neuer 50:50-Hinweis",
  reward: "+{coins} {unit}, +{xp} XP, +{points} Punkte",
  next: "Weiter",
  giveUp: "Aufgeben",
  course: "Kurs: {n}",
  bossTitle: "Bosse und Geschichte",
  chapterLabel: "Kapitel {n}",
  bossQuestion: "Frage {i} von {n}",
  lives: "Leben",
  locked: "Wird freigeschaltet bei: {n}",
  need: { farm: "Farm-Stufe {n}", city: "{n} Gebäude in der Stadt", base: "{n} Basis-Module", pets: "ein Haustier auf Stufe {n}" },
  fight: "Boss herausfordern",
  bossWon: "Boss besiegt!",
  bossLost: "Diesmal hat der Boss gewonnen. Versuch es nochmal, die Fragen passen sich an.",
  allDone: "Alle Kapitel sind geschafft. Danke, Held!",
  flawless: "Kein Leben verloren: Extra-Bonus!",
  story: chapters({
    farm: [
      ["Hungrige Krähe", "Eine Krähe ist auf dein Feld geflogen und will die Ernte anpicken.", "Die Krähe ist davongeflogen, das Feld ist sicher."],
      ["Maulwurf Buddel", "Jemand untergräbt deine Beete. Es ist ein Maulwurf, der jeden Geheimgang kennt.", "Der Maulwurf zog in den Wald, die Beete sind heil."],
      ["Schlauer Fuchs", "Ein Fuchs schleicht mit einem Geheimplan zum Hühnerstall.", "Der Fuchs zog mit leeren Pfoten ab. Der Stall ist ruhig."],
      ["Riesenschnecke", "Aus dem Garten hört man Schmatzen. Eine Riesenschnecke knabbert den Kohl an.", "Die Schnecke kroch unter einen Busch, der Kohl blieb übrig."],
      ["Sturm über dem Feld", "Dunkle Wolken ziehen über der Farm auf. Die letzte Prüfung des Bauern!", "Der Sturm ist vorbei und die Farm glänzt wie nie."],
    ],
    city: [
      ["Verkehrsstau", "Überall in der Stadt stehen Autos. Der Bürgermeister braucht dich, um die Kreuzungen zu entwirren.", "Der Verkehr fließt wieder und alle sind zufrieden."],
      ["Stromausfall", "Die halbe Stadt liegt im Dunkeln und das Kraftwerk reagiert nicht.", "Die Lichter gehen an und die Stadt lebt wieder."],
      ["Großbrand", "Am Stadtrand brennt ein Lager und die Feuerwehr wartet auf deinen Plan.", "Das Feuer ist gelöscht und niemand wurde verletzt."],
      ["Smogwolke", "Smog hängt über der Stadt. Die Leute husten und die Fabrikschlote qualmen weiter.", "Ein Wind hat den Smog vertrieben, die Luft ist rein."],
      ["Hochwasser", "Der Fluss steigt und die Stadt muss sich wehren. Die letzte große Prüfung!", "Die Deiche hielten. Die Stadt feiert dich als Retter."],
    ],
    base: [
      ["Meteoritenschauer", "Trümmer fliegen um die Basis. Die Schilde müssen halten.", "Der Schauer ist durch und die Basis hat nicht einmal einen Kratzer."],
      ["Defekter Reaktor", "Der Reaktor schwankt und meldet einen Fehler nach dem anderen.", "Der Reaktor hat sich stabilisiert und die Energie fließt."],
      ["Sonnensturm", "Strahlung stört den Funk. Die Crew versteckt sich im Schutzraum.", "Der Sturm ist vorbei und die Verbindung steht wieder."],
      ["Rebellischer Roboter", "Der Hilfsroboter gehorcht nicht mehr und sperrt die Türen ab.", "Der Roboter wurde neu gestartet und hilft wieder."],
      ["Fremdes Signal", "Aus dem tiefen All kam ein rätselhaftes Signal. Die letzte Prüfung des Kommandanten!", "Das Signal ist entschlüsselt: eine Einladung in den galaktischen Club."],
    ],
    pets: [
      ["Die verlorene Socke", "Dein Haustier hat eine Socke gefunden und lässt sie nicht los. Überrede es.", "Die Socke liegt wieder in der Schublade und dein Haustier ist stolz."],
      ["Gruseliger Staubsauger", "Der laute Staubsauger macht deinem Haustier Angst. Hilf ihm, Mut zu finden.", "Dein Haustier hat den Staubsauger überlebt und fährt jetzt sogar darauf."],
      ["Badetag", "Heute ist Badetag und dein Haustier ist unter dem Bett verschwunden.", "Dein Haustier duftet wie eine Wiese und ist glücklich."],
      ["Nachtabenteurer", "Dein Haustier ist nachts hinausgeschlichen und findet nicht heim.", "Es ist zu Hause im Warmen und erzählt von den Sternen."],
      ["Wettbewerb der Haustiere", "Heute findet eine große Tierschau statt. Die letzte Prüfung!", "Sieg! Dein Haustier ist der größte Star der Nachbarschaft."],
    ],
  }),
  boardTitle: "Bestenliste",
  boardEmpty: "Noch niemand hier.",
  boardMine: "Dein Platz: {n}.",
  boardUnit: "insgesamt verdient",
  you: "du",
  weekTitle: "Wochenturnier",
  weekScore: "Punkte diese Woche: {n}",
  weekEnds: "Endet in {d} T {h} Std.",
  weekHow: "Punkte gibt es für richtige Antworten (schnelle zählen mehr), besiegte Bosse und verschickte Geschenke. Belohnungen holst du für die vergangene Woche ab.",
  tier: { bronze: "Bronze", silver: "Silber", gold: "Gold" },
  tierReward: "{points} Punkte und {xp} XP",
  lastWeek: "Letzte Woche: {n} Punkte",
  lastWeekRank: "Du warst {n}. in deiner Gruppe",
  claim: "Abholen",
  claimed: "Abgeholt",
  partyTitle: "Gruppe",
  partyEmpty: "Geschenke und gemeinsame Aufträge brauchen eine Gruppe. Erstelle oder betritt eine in deinem Profil.",
  partyOrder: "Gemeinsamer Auftrag: {name}",
  partyProgress: "Gruppenpunkte {n} von {m}",
  partyReward: "Jedes Mitglied: {n} Punkte",
  partyRanking: "Gruppenrangliste dieser Woche",
  giftsTitle: "Geschenke für Freunde",
  giftsHint: "Schicke einem Freund aus der Gruppe etwas Währung aus diesem Spiel. Heute kannst du noch {n}× senden.",
  giftTo: "An",
  giftSend: "Senden",
  giftSent: "Geschenk gesendet.",
  giftInbox: "Geschenke für dich",
  giftFrom: "Von {name}",
  giftNone: "Noch keine Geschenke.",
  giftReceived: "{n} {unit} erhalten.",
  errors: {
    "no-game": "Baue zuerst etwas im Spiel.",
    pending: "Beende zuerst die angefangene Frage.",
    "no-pending": "Es läuft keine Frage.",
    "no-question": "Ich habe gerade keine Frage. Versuch es später.",
    locked: "Dieser Boss ist noch gesperrt.",
    "all-done": "Alle Kapitel sind geschafft.",
    "no-hint": "Der Hinweis kann jetzt nicht genutzt werden.",
    claimed: "Schon abgeholt.",
    nothing: "Nichts abzuholen.",
    limit: "Das heutige Geschenk-Limit ist erreicht.",
    "not-in-party": "Das geht nur in einer Gruppe.",
    "not-enough-coins": "Du hast nicht genug Währung für das Geschenk.",
    "inbox-full": "Das Postfach deines Freundes ist voll.",
    "not-done": "Der Auftrag ist noch nicht fertig.",
    conflict: "Das Spiel hat sich in einem anderen Fenster geändert. Versuch es nochmal.",
    "bad-request": "Das geht nicht.",
    unavailable: "Gerade nicht möglich, versuch es gleich nochmal.",
  },
};

const ru: ChallengeText = {
  title: "Испытания",
  subtitle: "Отвечай на вопросы из курсов, набирай серию ради бонусов и побеждай босса в каждой главе.",
  loginRequired: "Войди, чтобы проходить испытания.",
  loading: "Загружаю испытания…",
  unavailable: "Сейчас не удалось загрузить испытания.",
  tabs: { quiz: "Викторина", boss: "Босс", compete: "Соревнование" },
  currency: { farm: "монет", city: "монет", base: "кредитов", pets: "монет" },
  needsGame: "Сначала построй что-нибудь в игре, и испытания откроются.",
  quickTitle: "Быстрый вопрос",
  quickHint: "Верный ответ даёт награду в игре. Чем длиннее серия, тем больше множитель и ускорение игры.",
  ask: "Дай вопрос",
  streak: "Серия {n}",
  best: "рекорд {n}",
  multiplier: "множитель ×{n}",
  boost: "Ускорение игры +{n} % ещё {m} мин",
  noBoost: "Ответь на вопрос, и игра ненадолго ускорится.",
  shields: "Щиты {n}",
  hints: "Подсказки {n}",
  useHint: "50:50",
  accuracy: "Точность {n} %",
  adaptive: "Вопросы подстраиваются: чем лучше получается, тем они сложнее, а ошибки возвращаются для повторения.",
  weakBadge: "Слабое место",
  fastBadge: "Быстро! +25 %",
  seconds: "{n} с",
  correct: "Верно!",
  wrong: "В этот раз нет.",
  shieldSaved: "Щит спас тебя, серия сохраняется.",
  gainedShield: "Новый щит",
  gainedHint: "Новая подсказка 50:50",
  reward: "+{coins} {unit}, +{xp} XP, +{points} баллов",
  next: "Дальше",
  giveUp: "Сдаться",
  course: "Курс: {n}",
  bossTitle: "Боссы и история",
  chapterLabel: "Глава {n}",
  bossQuestion: "Вопрос {i} из {n}",
  lives: "Жизни",
  locked: "Откроется: {n}",
  need: { farm: "уровень фермы {n}", city: "{n} зданий в городе", base: "{n} модулей базы", pets: "питомец {n}-го уровня" },
  fight: "Вызвать босса",
  bossWon: "Босс побеждён!",
  bossLost: "В этот раз победил босс. Попробуй снова, вопросы подстроятся.",
  allDone: "Все главы пройдены. Спасибо, герой!",
  flawless: "Без потери жизни: дополнительный бонус!",
  story: chapters({
    farm: [
      ["Голодная ворона", "На твоё поле села ворона и собирается склевать урожай.", "Ворона улетела, поле в безопасности."],
      ["Крот-землекоп", "Кто-то подрывает твои грядки. Это крот, который знает все тайные ходы.", "Крот переехал в лес, грядки целы."],
      ["Хитрая лиса", "Лиса крадётся к курятнику с тайным планом.", "Лиса ушла ни с чем. В курятнике тихо."],
      ["Огромный слизень", "Из сада слышно чавканье. Огромный слизень грызёт капусту.", "Слизень уполз под куст, капуста уцелела."],
      ["Гроза над полем", "Над фермой собираются тёмные тучи. Последнее испытание фермера!", "Гроза прошла, и ферма сияет как никогда."],
    ],
    city: [
      ["Пробка", "По городу стоят машины. Мэру нужно, чтобы ты распутал перекрёстки.", "Движение снова идёт, и все довольны."],
      ["Отключение света", "Половина города в темноте, электростанция не отвечает.", "Свет включился, и город ожил."],
      ["Большой пожар", "На окраине горит склад, пожарные ждут твоего плана.", "Огонь потушен, никто не пострадал."],
      ["Смог", "Над городом висит смог. Люди кашляют, а заводские трубы всё дымят.", "Ветер разогнал смог, воздух чист."],
      ["Наводнение", "Река поднимается, городу нужно защищаться. Последнее большое испытание!", "Дамбы выдержали. Город славит тебя как спасителя."],
    ],
    base: [
      ["Метеоритный дождь", "Вокруг базы летят обломки. Щиты должны выдержать.", "Дождь прошёл, а на базе ни царапины."],
      ["Неисправный реактор", "Реактор скачет и сообщает об ошибке за ошибкой.", "Реактор стабилизировался, энергия идёт."],
      ["Солнечная буря", "Излучение глушит связь. Экипаж спрятался в убежище.", "Буря стихла, связь вернулась."],
      ["Взбунтовавшийся робот", "Робот-помощник не слушается и запирает двери.", "Робот перезагрузился и снова помогает."],
      ["Чужой сигнал", "Из глубин космоса пришёл загадочный сигнал. Последнее испытание командира!", "Сигнал расшифрован: это приглашение в галактический клуб."],
    ],
    pets: [
      ["Потерянный носок", "Питомец нашёл носок и не отдаёт. Уговори его.", "Носок снова в ящике, а питомец гордится."],
      ["Страшный пылесос", "Громкий пылесос пугает питомца. Помоги ему набраться смелости.", "Питомец пережил пылесос и теперь даже катается на нём."],
      ["День купания", "Сегодня день купания, а питомец спрятался под кроватью.", "Питомец пахнет лугом и доволен."],
      ["Ночной путешественник", "Питомец ночью выбрался на улицу и не найдёт дорогу домой.", "Он дома в тепле и рассказывает о звёздах."],
      ["Конкурс питомцев", "Сегодня большая выставка питомцев. Последнее испытание!", "Победа! Питомец стал главной звездой района."],
    ],
  }),
  boardTitle: "Таблица лидеров",
  boardEmpty: "Пока здесь никого нет.",
  boardMine: "Твоё место: {n}.",
  boardUnit: "заработано всего",
  you: "ты",
  weekTitle: "Недельный турнир",
  weekScore: "Очки за неделю: {n}",
  weekEnds: "Закончится через {d} д {h} ч",
  weekHow: "Очки дают верные ответы (быстрые ценнее), побеждённые боссы и отправленные подарки. Награды забирают за прошедшую неделю.",
  tier: { bronze: "Бронза", silver: "Серебро", gold: "Золото" },
  tierReward: "{points} баллов и {xp} XP",
  lastWeek: "Прошлая неделя: {n} очков",
  lastWeekRank: "Ты занял(а) {n}-е место в группе",
  claim: "Забрать",
  claimed: "Забрано",
  partyTitle: "Группа",
  partyEmpty: "Для подарков и общих заказов нужна группа. Создай её или вступи в профиле.",
  partyOrder: "Общий заказ: {name}",
  partyProgress: "Очки группы {n} из {m}",
  partyReward: "Каждому участнику: {n} баллов",
  partyRanking: "Рейтинг группы на этой неделе",
  giftsTitle: "Подарки друзьям",
  giftsHint: "Отправь другу из группы немного валюты этой игры. Сегодня можно отправить ещё {n}.",
  giftTo: "Кому",
  giftSend: "Отправить",
  giftSent: "Подарок отправлен.",
  giftInbox: "Подарки тебе",
  giftFrom: "От {name}",
  giftNone: "Подарков пока нет.",
  giftReceived: "Получено {n} {unit}.",
  errors: {
    "no-game": "Сначала построй что-нибудь в игре.",
    pending: "Сначала закончи начатый вопрос.",
    "no-pending": "Сейчас нет активного вопроса.",
    "no-question": "Сейчас нет вопроса. Попробуй позже.",
    locked: "Этот босс пока закрыт.",
    "all-done": "Все главы пройдены.",
    "no-hint": "Сейчас подсказку использовать нельзя.",
    claimed: "Уже забрано.",
    nothing: "Нечего забирать.",
    limit: "Лимит подарков на сегодня исчерпан.",
    "not-in-party": "Это работает только в группе.",
    "not-enough-coins": "Не хватает валюты на подарок.",
    "inbox-full": "У друга переполнен ящик.",
    "not-done": "Заказ ещё не выполнен.",
    conflict: "Игра изменилась в другом окне. Попробуй снова.",
    "bad-request": "Так нельзя.",
    unavailable: "Сейчас не получается, попробуй через минуту.",
  },
};

const TEXTS: Record<Locale, ChallengeText> = { cs, en, de, ru };

export function getChallengeText(locale: Locale): ChallengeText {
  return TEXTS[locale] ?? cs;
}

/** Dosadí {klíče} v šabloně. */
export function fillTokens(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => (key in values ? String(values[key]) : `{${key}}`));
}
