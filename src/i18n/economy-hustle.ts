import type { Locale } from "./config";
import type { HustleId } from "@/lib/idle/economy";

// Texty sekce Hustle. Každý projekt má tři fáze (nákup, provoz, prodej), v každé tři volby s názvem a nápovědou.
// Zástupné znaky {n}, {m}, {t}, {lo}, {hi} doplní UI.
// Tři volby fáze, každá jako [název, nápověda].
type Choice3 = [[string, string], [string, string], [string, string]];

export type HustleText = {
  title: string;
  intro: string;
  running: string;
  none: string;
  stakeLabel: string;
  all: string;
  topUp: string;
  startBtn: string;
  due: string;
  next: string;
  locked: string;
  streak: string;
  logLine: string;
  sec: string;
  startTitle: string;
  openCard: string;
  experience: string;
  hintUp: string;
  hintDown: string;
  hintNone: string;
  marketHidden: string;
  range: string;
  breakEven: string;
  lostText: string;
  lostTotal: string;
  profitText: string;
  lossText: string;
  stakeTotal: string;
  value: string;
  phaseOf: string;
  chartLabel: string;
  commissionShown: string;
  phases: [string, string, string];
  event: [string, string];
  chips: { stake: string; time: string; commission: string; risk: string; experience: string; upkeep: string };
  names: Record<HustleId, string>;
  desc: Record<HustleId, string>;
  situations: Record<HustleId, [string, string, string]>;
  options: Record<HustleId, [Choice3, Choice3, Choice3]>;
};

const cs: HustleText = {
  title: "Hustle",
  intro: "Projekty ve třech fázích, jako v reálu: nákup, provoz, prodej. Každou fázi rozhoduješ ty. Výsledek je rozsah, ne jistota.",
  running: "Rozjeté projekty",
  none: "Nic neběží. Vyber projekt níže.",
  stakeLabel: "Vklad",
  all: "Vše",
  topUp: "Dokoupit {n}",
  startBtn: "Začít s vkladem {n}",
  due: "Rozhodni teď",
  next: "Další fáze za {t}",
  locked: "Odemkne se při Vzdělání {n}",
  streak: "Série {n}",
  logLine: "Fáze {n}: ×{m}",
  sec: "{n} s",
  startTitle: "Spustit nový projekt",
  openCard: "Otevřít",
  experience: "Zkušenost {n}/5",
  hintUp: "Zkušenost: trh jde nahoru",
  hintDown: "Zkušenost: trh klesá",
  hintNone: "Zatím bez zkušenosti. První nápověda přijde po dokončeném běhu.",
  marketHidden: "Tržní koeficient se ukáže až při prodeji.",
  range: "×{lo}–{hi}",
  breakEven: "Zisk od ×1,00",
  lostText: "Riziko se naplnilo: výplata klesla.",
  lostTotal: "Kupec nezaplatil.",
  profitText: "Zisk {n}",
  lossText: "Ztráta {n}",
  stakeTotal: "Vloženo",
  value: "Hodnota",
  phaseOf: "Fáze {n} z 3",
  chartLabel: "Vývoj hodnoty",
  commissionShown: "Provize {n} %",
  phases: ["Nákup", "Provoz", "Prodej"],
  event: ["Příležitost", "Náhodná nabídka: vyšší výdělek, o něco dražší."],
  chips: { stake: "Vklad", time: "Celkem", commission: "Provize", risk: "Podvod nebo bankrot", experience: "Zkušenost", upkeep: "Průběžné náklady" },
  names: { lemonade: "Limonádový stánek", reselling: "Reselling", carflip: "Flipování aut", houseflip: "Flipování domů", startup: "Startup", freelance: "Freelance zakázka" },
  desc: {
    lemonade: "Nakoupíš suroviny, postavíš stánek u parku nebo školy a prodáváš. Počasí rozhoduje víc než cena.",
    reselling: "Kupuješ zboží na bazaru pod cenou, čistíš, fotíš a prodáváš. Kupci smlouvají a někteří podvádějí. Platforma bere provizi.",
    carflip: "Kupuješ auto z aukce nebo od soukromníka. Vady nejsou vidět. Opravy zvyšují cenu, pokud je uděláš dobře.",
    houseflip: "Kupuješ starý dům pod cenou, většinou na hypotéku. Opravy se protahují, úroky běží a trh se mění.",
    startup: "Založíš firmu, najdeš investora, vyvíjíš produkt a rosteš. Většina firem zkrachuje, pár se prodá nebo jde na burzu.",
    freelance: "Bereš zakázky na platformě. Klient chce revize a někdy nezaplatí. Platforma bere 10 %.",
  },
  situations: {
    lemonade: ["Kde nakoupíš suroviny?", "Jakou cenu a akci zvolíš?", "Co uděláš s koncem dne?"],
    reselling: ["Co koupíš z bazaru?", "Jak inzerovat a kdo je kupec?", "Jak uzavřeš prodej?"],
    carflip: ["Od koho a za kolik auto koupíš?", "Co opravíš?", "Jak auto prodáš?"],
    houseflip: ["Který dům koupíš?", "Co se bude rekonstruovat?", "Jak dům prodáš?"],
    startup: ["Jak zafinancuješ firmu?", "Jak budeš vyvíjet produkt?", "Jak skončíš?"],
    freelance: ["Kterou zakázku přijmeš?", "Jak ji odvedeš?", "Jak klient přijme dílo?"],
  },
  options: {
    lemonade: [
      [["Velkoobchod", "Levné, ale citrony jsou vysušené"], ["Trh u náměstí", "Čerstvé ovoce, dražší"], ["Vlastní zahrada", "Zadarmo, ale málo a nepravidelně"]],
      [["Cena jako všude", "Bezpečná cena, průměrný zájem"], ["Ledová vlna za 25", "Při vedru zlatý důl, jinak prodělek"], ["Akce 2 za 1", "Víc lidí, nižší marže"]],
      [["Prodat všechno hned", "Jistota, bez čekání"], ["Stát do večera", "Víc zákazníků, ale led taje"], ["Přesunout k parku", "Lepší místo, ale nájem"]],
    ],
    reselling: [
      [["Hromada 5 kusů", "Jeden kus je vadný"], ["Jeden kus v dobrém stavu", "Dražší, ale jistý"], ["Podle fotek", "Levné, ale nejisté"]],
      [["Standardní inzerát", "Bez ochrany, kupec může podvádět"], ["Ověřit kupce", "Platba předem, poplatek navíc"], ["Rychlá sleva", "Kupec odnese levněji"]],
      [["Přijmout první nabídku", "Rychle, ale levněji"], ["Vyjednávat", "Někdy víc, jindy kupec odejde"], ["Počkat na lepšího kupce", "Možná víc, ale trh se hýbe"]],
    ],
    carflip: [
      [["Aukce bez prohlídky", "Levné, ale riziko skryté vady"], ["Soukromník se servisní knížkou", "Poctivější, o trochu dražší"], ["Dovoz ze zahraničí", "Drahé dovozem a cly, ale dobrý stav"]],
      [["Jen nejnutnější", "Brzdy a pneu, rychle a levně"], ["Prohlídka u mechanika", "Najde vady, chrání před reklamací"], ["Kompletní renovace", "Drahé, ale auto zazáří"]],
      [["Bazar hned", "Rychle, za nižší cenu"], ["Inzerát a prohlídky", "Trh rozhodne, zájemci přijdou"], ["Čekat na dobrou cenu", "Vyšší cena, ale trvá to"]],
    ],
    houseflip: [
      [["Dům k rekonstrukci", "Nejlevnější, největší práce"], ["Byt v dobré lokalitě", "Jistější, menší zisk"], ["Pozemek na stavbu", "Drahý, ale největší potenciál"]],
      [["Jen kosmetika", "Rychlé a levné, malý efekt"], ["Posudek a oprava základů", "Chrání před zkázou, drahé"], ["Přestavba půdy a koupelen", "Velký efekt, velké náklady"]],
      [["Realitka hned", "Provize 3 %, rychlé"], ["Vlastní inzerát", "Bez provize, pomalejší"], ["Čekat na jarní sezónu", "Lepší trh, ale úroky běží"]],
    ],
    startup: [
      [["Vlastní úspory", "Nezředíš podíl, ale málo peněz"], ["Malý investor za 20 %", "Peníze a rada, část firmy pryč"], ["Velký investor za 45 %", "Hodně peněz, velký podíl pryč"]],
      [["Rychle vydat MVP", "Levné a rychlé, ale chyby"], ["Kvalitní vývoj a testy", "Méně bankrotů, pomalejší"], ["Marketingová kampaň", "Velký růst, velké výdaje"]],
      [["Prodat velké firmě", "Jistý exit, střední výnos"], ["Jít na burzu (IPO)", "Velký výnos, velké riziko"], ["Dál vydělávat bez exitu", "Stabilní, ale pomalé"]],
    ],
    freelance: [
      [["Malá práce na 2 hodiny", "Málo peněz, hotovo rychle"], ["Střední projekt na týden", "Solidní výdělek"], ["Velký projekt s pevným termínem", "Největší výplata, největší tlak"]],
      [["Běž na jistotu", "Bezpečné, bez přesčasů"], ["Přesčasy", "Rychlejší, ale kvalita kolísá"], ["Zkratka ze šablony", "Levné, ale klient to pozná"]],
      [["Klient schválí hned", "Bez komplikací"], ["Revize zdarma", "Klient chce změny, ale zaplatí"], ["Spor o platbu", "Může zaplatit méně, nebo vůbec"]],
    ],
  },
};

const en: HustleText = {
  title: "Hustle",
  intro: "Projects in three phases, like in real life: purchase, operation, sale. You decide each phase. The result is a range, not a sure thing.",
  running: "Running projects",
  none: "Nothing is running. Pick a project below.",
  stakeLabel: "Stake",
  all: "All",
  topUp: "Add {n}",
  startBtn: "Start with {n}",
  due: "Decide now",
  next: "Next phase in {t}",
  locked: "Unlocks at Education {n}",
  streak: "Streak {n}",
  logLine: "Phase {n}: ×{m}",
  sec: "{n} s",
  startTitle: "Start a new project",
  openCard: "Open",
  experience: "Experience {n}/5",
  hintUp: "Experience: the market is going up",
  hintDown: "Experience: the market is going down",
  hintNone: "No experience yet. The first hint comes after a finished project.",
  marketHidden: "The market multiplier shows up at the sale.",
  range: "×{lo}–{hi}",
  breakEven: "Profit from ×1.00",
  lostText: "Risk hit: the payout dropped.",
  lostTotal: "The buyer did not pay.",
  profitText: "Profit {n}",
  lossText: "Loss {n}",
  stakeTotal: "Invested",
  value: "Value",
  phaseOf: "Phase {n} of 3",
  chartLabel: "Value over time",
  commissionShown: "Fee {n} %",
  phases: ["Purchase", "Operation", "Sale"],
  event: ["Opportunity", "Random offer: higher payout, a bit more expensive."],
  chips: { stake: "Stake", time: "Total", commission: "Fee", risk: "Scam or bankruptcy", experience: "Experience", upkeep: "Running costs" },
  names: { lemonade: "Lemonade stand", reselling: "Reselling", carflip: "Car flipping", houseflip: "House flipping", startup: "Startup", freelance: "Freelance gig" },
  desc: {
    lemonade: "Buy ingredients, set up a stand by the park or school and sell. Weather matters more than price.",
    reselling: "Buy underpriced goods at a flea market, clean, photograph and sell. Buyers haggle, and some are scammers. The platform takes a fee.",
    carflip: "Buy a car at auction or from a private seller. Faults are hidden. Repairs raise the price, if you do them well.",
    houseflip: "Buy an old house below market, usually with a mortgage. Renovations drag on, interest runs and the market moves.",
    startup: "Found a company, find an investor, build a product and grow. Most fail; a few get sold or listed.",
    freelance: "Take jobs on a platform. Clients ask for revisions and sometimes do not pay. The platform takes 10%.",
  },
  situations: {
    lemonade: ["Where do you buy the ingredients?", "What price and promotion do you choose?", "What do you do at the end of the day?"],
    reselling: ["What do you buy from the flea market?", "How do you advertise, and who is the buyer?", "How do you close the sale?"],
    carflip: ["Where and for how much do you buy the car?", "What do you repair?", "How do you sell the car?"],
    houseflip: ["Which house do you buy?", "What gets renovated?", "How do you sell the house?"],
    startup: ["How do you fund the company?", "How do you build the product?", "How do you exit?"],
    freelance: ["Which job do you accept?", "How do you deliver it?", "How does the client receive the work?"],
  },
  options: {
    lemonade: [
      [["Wholesale", "Cheap, but the lemons are dried out"], ["Market by the square", "Fresh fruit, more expensive"], ["Own garden", "Free, but little and irregular"]],
      [["Price like everyone", "Safe price, average interest"], ["Ice wave at 25", "Gold mine in the heat, loss otherwise"], ["2 for 1 deal", "More customers, thinner margin"]],
      [["Sell everything now", "Certain, no waiting"], ["Stay until evening", "More customers, but the ice melts"], ["Move to the park", "Better spot, but rent"]],
    ],
    reselling: [
      [["Bulk lot of 5", "One item is faulty"], ["One item in good shape", "Pricier, but reliable"], ["Based on photos", "Cheap, but uncertain"]],
      [["Standard listing", "No protection, the buyer may scam"], ["Verify the buyer", "Payment in advance, extra fee"], ["Quick discount", "The buyer takes it cheaper"]],
      [["Take the first offer", "Fast, but cheaper"], ["Negotiate", "Sometimes more, sometimes the buyer leaves"], ["Wait for a better buyer", "Maybe more, but the market moves"]],
    ],
    carflip: [
      [["Auction, no inspection", "Cheap, but a hidden fault risk"], ["Private seller with service book", "More honest, a bit pricier"], ["Import from abroad", "Costly with duty, but good condition"]],
      [["Only the essentials", "Brakes and tyres, fast and cheap"], ["Inspection by a mechanic", "Finds faults, protects from complaints"], ["Full renovation", "Expensive, but the car shines"]],
      [["Sell at the market now", "Fast, at a lower price"], ["Ad and viewings", "The market decides, buyers come"], ["Wait for a good price", "Higher price, but it takes time"]],
    ],
    houseflip: [
      [["House to renovate", "Cheapest, most work"], ["Flat in a good area", "Safer, smaller gain"], ["Land to build on", "Expensive, biggest potential"]],
      [["Cosmetics only", "Quick and cheap, small effect"], ["Survey and foundation repair", "Protects against disaster, costly"], ["Attic and bathroom rebuild", "Big effect, big costs"]],
      [["Estate agent now", "3% fee, quick"], ["Own listing", "No fee, slower"], ["Wait for the spring season", "Better market, but interest runs"]],
    ],
    startup: [
      [["Own savings", "No dilution, little money"], ["Small investor for 20%", "Money and advice, part of the company gone"], ["Big investor for 45%", "Lots of money, big share gone"]],
      [["Ship an MVP fast", "Cheap and quick, but bugs"], ["Quality build and tests", "Fewer bankruptcies, slower"], ["Marketing campaign", "Big growth, big spending"]],
      [["Sell to a big company", "Certain exit, medium return"], ["List on the stock market (IPO)", "Big return, big risk"], ["Keep earning without an exit", "Stable, but slow"]],
    ],
    freelance: [
      [["Small 2-hour job", "Little money, done fast"], ["Mid project for a week", "Solid earnings"], ["Big project with a fixed deadline", "Biggest payout, biggest pressure"]],
      [["Play it safe", "Safe, no overtime"], ["Overtime", "Faster, but quality wobbles"], ["Shortcut from a template", "Cheap, but the client notices"]],
      [["Client approves at once", "No complications"], ["Free revisions", "Client wants changes, but pays"], ["Payment dispute", "May pay less, or nothing"]],
    ],
  },
};

const de: HustleText = {
  title: "Hustle",
  intro: "Projekte in drei Phasen, wie im echten Leben: Einkauf, Betrieb, Verkauf. Jede Phase entscheidest du. Das Ergebnis ist eine Spanne, keine Sicherheit.",
  running: "Laufende Projekte",
  none: "Nichts läuft. Wähle unten ein Projekt.",
  stakeLabel: "Einsatz",
  all: "Alles",
  topUp: "Nachlegen {n}",
  startBtn: "Mit {n} starten",
  due: "Jetzt entscheiden",
  next: "Nächste Phase in {t}",
  locked: "Wird bei Bildung {n} freigeschaltet",
  streak: "Serie {n}",
  logLine: "Phase {n}: ×{m}",
  sec: "{n} s",
  startTitle: "Neues Projekt starten",
  openCard: "Öffnen",
  experience: "Erfahrung {n}/5",
  hintUp: "Erfahrung: der Markt steigt",
  hintDown: "Erfahrung: der Markt fällt",
  hintNone: "Noch keine Erfahrung. Den ersten Hinweis gibt es nach einem abgeschlossenen Projekt.",
  marketHidden: "Der Marktkoeffizient zeigt sich erst beim Verkauf.",
  range: "×{lo}–{hi}",
  breakEven: "Gewinn ab ×1,00",
  lostText: "Risiko eingetreten: Auszahlung gesunken.",
  lostTotal: "Der Käufer hat nicht gezahlt.",
  profitText: "Gewinn {n}",
  lossText: "Verlust {n}",
  stakeTotal: "Investiert",
  value: "Wert",
  phaseOf: "Phase {n} von 3",
  chartLabel: "Wertverlauf",
  commissionShown: "Gebühr {n} %",
  phases: ["Einkauf", "Betrieb", "Verkauf"],
  event: ["Gelegenheit", "Zufallsangebot: höhere Auszahlung, etwas teurer."],
  chips: { stake: "Einsatz", time: "Gesamt", commission: "Gebühr", risk: "Betrug oder Pleite", experience: "Erfahrung", upkeep: "Laufende Kosten" },
  names: { lemonade: "Limonadenstand", reselling: "Reselling", carflip: "Autos flippen", houseflip: "Häuser flippen", startup: "Startup", freelance: "Freelance-Auftrag" },
  desc: {
    lemonade: "Du kaufst Zutaten, stellst einen Stand am Park oder an der Schule auf und verkaufst. Das Wetter zählt mehr als der Preis.",
    reselling: "Du kaufst Ware unter Preis auf dem Flohmarkt, reinigst, fotografierst und verkaufst. Käufer handeln, manche betrügen. Die Plattform nimmt eine Gebühr.",
    carflip: "Du kaufst ein Auto bei der Auktion oder von Privat. Mängel sind versteckt. Reparaturen erhöhen den Preis, wenn du sie gut machst.",
    houseflip: "Du kaufst ein altes Haus unter Marktwert, meist mit Hypothek. Renovierungen ziehen sich, Zinsen laufen, der Markt bewegt sich.",
    startup: "Du gründest eine Firma, findest einen Investor, baust ein Produkt und wächst. Die meisten scheitern, wenige werden verkauft oder gehen an die Börse.",
    freelance: "Du nimmst Aufträge über eine Plattform an. Kunden wollen Überarbeitungen, manchmal zahlen sie nicht. Die Plattform nimmt 10 %.",
  },
  situations: {
    lemonade: ["Wo kaufst du die Zutaten?", "Welchen Preis und welche Aktion wählst du?", "Was machst du am Tagesende?"],
    reselling: ["Was kaufst du auf dem Flohmarkt?", "Wie inserierst du, und wer ist der Käufer?", "Wie schließt du den Verkauf ab?"],
    carflip: ["Wo und für wie viel kaufst du das Auto?", "Was reparierst du?", "Wie verkaufst du das Auto?"],
    houseflip: ["Welches Haus kaufst du?", "Was wird renoviert?", "Wie verkaufst du das Haus?"],
    startup: ["Wie finanzierst du die Firma?", "Wie baust du das Produkt?", "Wie steigst du aus?"],
    freelance: ["Welchen Auftrag nimmst du an?", "Wie lieferst du ihn?", "Wie nimmt der Kunde die Arbeit an?"],
  },
  options: {
    lemonade: [
      [["Großhandel", "Billig, aber die Zitronen sind vertrocknet"], ["Markt am Platz", "Frisches Obst, teurer"], ["Eigener Garten", "Gratis, aber wenig und unregelmäßig"]],
      [["Preis wie überall", "Sicherer Preis, durchschnittliches Interesse"], ["Eiswelle für 25", "Goldgrube bei Hitze, sonst Verlust"], ["Aktion 2 für 1", "Mehr Kunden, dünnere Marge"]],
      [["Alles jetzt verkaufen", "Sicher, ohne Warten"], ["Bis zum Abend bleiben", "Mehr Kunden, aber das Eis taut"], ["An den Park umziehen", "Besserer Platz, aber Miete"]],
    ],
    reselling: [
      [["Sammelposten mit 5 Stück", "Ein Stück ist defekt"], ["Ein Stück in gutem Zustand", "Teurer, aber verlässlich"], ["Nach Fotos", "Billig, aber unsicher"]],
      [["Standardinserat", "Ohne Schutz, der Käufer kann betrügen"], ["Käufer prüfen", "Vorauszahlung, extra Gebühr"], ["Schneller Rabatt", "Der Käufer nimmt es günstiger mit"]],
      [["Erstes Angebot annehmen", "Schnell, aber billiger"], ["Verhandeln", "Manchmal mehr, manchmal geht der Käufer"], ["Auf besseren Käufer warten", "Vielleicht mehr, aber der Markt bewegt sich"]],
    ],
    carflip: [
      [["Auktion ohne Prüfung", "Billig, aber Risiko versteckter Mängel"], ["Privatverkäufer mit Scheckheft", "Ehrlicher, etwas teurer"], ["Import aus dem Ausland", "Teuer durch Zoll, aber guter Zustand"]],
      [["Nur das Nötigste", "Bremsen und Reifen, schnell und billig"], ["Prüfung beim Mechaniker", "Findet Mängel, schützt vor Reklamation"], ["Komplette Renovierung", "Teuer, aber das Auto glänzt"]],
      [["Jetzt auf den Markt", "Schnell, zu niedrigerem Preis"], ["Inserat und Besichtigungen", "Der Markt entscheidet, Interessenten kommen"], ["Auf guten Preis warten", "Höherer Preis, aber es dauert"]],
    ],
    houseflip: [
      [["Haus zum Renovieren", "Am günstigsten, meiste Arbeit"], ["Wohnung in guter Lage", "Sicherer, kleinerer Gewinn"], ["Grundstück zum Bauen", "Teuer, größtes Potenzial"]],
      [["Nur Kosmetik", "Schnell und billig, kleine Wirkung"], ["Gutachten und Fundamentreparatur", "Schützt vor Schaden, teuer"], ["Umbau von Dachboden und Bad", "Große Wirkung, hohe Kosten"]],
      [["Makler jetzt", "3 % Provision, schnell"], ["Eigenes Inserat", "Ohne Provision, langsamer"], ["Auf die Frühjahrssaison warten", "Besserer Markt, aber Zinsen laufen"]],
    ],
    startup: [
      [["Eigene Ersparnisse", "Kein Verwässern, wenig Geld"], ["Kleiner Investor für 20 %", "Geld und Rat, ein Teil der Firma weg"], ["Großer Investor für 45 %", "Viel Geld, großer Anteil weg"]],
      [["MVP schnell veröffentlichen", "Billig und schnell, aber Fehler"], ["Qualitätsentwicklung und Tests", "Weniger Pleiten, langsamer"], ["Marketingkampagne", "Großes Wachstum, hohe Ausgaben"]],
      [["An großes Unternehmen verkaufen", "Sicherer Ausstieg, mittlerer Ertrag"], ["Börsengang (IPO)", "Großer Ertrag, großes Risiko"], ["Ohne Ausstieg weiterverdienen", "Stabil, aber langsam"]],
    ],
    freelance: [
      [["Kleiner Auftrag für 2 Stunden", "Wenig Geld, schnell fertig"], ["Mittleres Projekt für eine Woche", "Solider Verdienst"], ["Großprojekt mit festem Termin", "Höchste Auszahlung, höchster Druck"]],
      [["Auf Nummer sicher gehen", "Sicher, keine Überstunden"], ["Überstunden", "Schneller, aber Qualität schwankt"], ["Abkürzung aus der Vorlage", "Billig, aber der Kunde merkt es"]],
      [["Kunde nimmt sofort ab", "Ohne Komplikationen"], ["Kostenlose Revision", "Kunde will Änderungen, zahlt aber"], ["Zahlungsstreit", "Zahlt weniger oder gar nichts"]],
    ],
  },
};

const ru: HustleText = {
  title: "Подработки",
  intro: "Проекты в трёх фазах, как в жизни: закупка, работа, продажа. Каждую фазу решаешь ты. Результат — диапазон, а не гарантия.",
  running: "Активные проекты",
  none: "Ничего не идёт. Выбери проект ниже.",
  stakeLabel: "Вклад",
  all: "Всё",
  topUp: "Докупить {n}",
  startBtn: "Начать с {n}",
  due: "Решить сейчас",
  next: "Следующая фаза через {t}",
  locked: "Откроется при Образовании {n}",
  streak: "Серия {n}",
  logLine: "Фаза {n}: ×{m}",
  sec: "{n} с",
  startTitle: "Начать новый проект",
  openCard: "Открыть",
  experience: "Опыт {n}/5",
  hintUp: "Опыт: рынок растёт",
  hintDown: "Опыт: рынок падает",
  hintNone: "Опыта пока нет. Первая подсказка появится после завершённого проекта.",
  marketHidden: "Рыночный коэффициент виден только при продаже.",
  range: "×{lo}–{hi}",
  breakEven: "Прибыль от ×1,00",
  lostText: "Риск сработал: выплата снизилась.",
  lostTotal: "Покупатель не заплатил.",
  profitText: "Прибыль {n}",
  lossText: "Убыток {n}",
  stakeTotal: "Вложено",
  value: "Стоимость",
  phaseOf: "Фаза {n} из 3",
  chartLabel: "Динамика стоимости",
  commissionShown: "Комиссия {n} %",
  phases: ["Закупка", "Работа", "Продажа"],
  event: ["Шанс", "Случайное предложение: выше выплата, чуть дороже."],
  chips: { stake: "Вклад", time: "Всего", commission: "Комиссия", risk: "Обман или банкротство", experience: "Опыт", upkeep: "Текущие расходы" },
  names: { lemonade: "Лимонадный стенд", reselling: "Перепродажа", carflip: "Флип автомобилей", houseflip: "Флип домов", startup: "Стартап", freelance: "Фриланс-заказ" },
  desc: {
    lemonade: "Покупаешь продукты, ставишь ларёк у парка или школы и продаёшь. Погода важнее цены.",
    reselling: "Покупаешь товар дешевле на барахолке, чистишь, фотографируешь и продаёшь. Покупатели торгуются, а некоторые обманывают. Площадка берёт комиссию.",
    carflip: "Покупаешь машину на аукционе или у частника. Дефекты скрыты. Ремонт поднимает цену, если сделать его хорошо.",
    houseflip: "Покупаешь старый дом ниже рынка, обычно в ипотеку. Ремонт затягивается, проценты идут, рынок меняется.",
    startup: "Основываешь компанию, находишь инвестора, делаешь продукт и растёшь. Большинство проваливается, некоторые продают или выводят на биржу.",
    freelance: "Берёшь заказы на платформе. Клиент просит правки, иногда не платит. Платформа берёт 10 %.",
  },
  situations: {
    lemonade: ["Где купишь продукты?", "Какую цену и акцию выберешь?", "Что сделаешь в конце дня?"],
    reselling: ["Что купишь на барахолке?", "Как дашь объявление и кто покупатель?", "Как закроешь продажу?"],
    carflip: ["Где и за сколько купишь машину?", "Что будешь ремонтировать?", "Как продашь машину?"],
    houseflip: ["Какой дом купишь?", "Что будешь ремонтировать?", "Как продашь дом?"],
    startup: ["Как будешь финансировать компанию?", "Как будешь делать продукт?", "Как выйдешь?"],
    freelance: ["Какой заказ возьмёшь?", "Как его выполнишь?", "Как клиент примет работу?"],
  },
  options: {
    lemonade: [
      [["Оптовик", "Дёшево, но лимоны подсохли"], ["Рынок на площади", "Свежие фрукты, дороже"], ["Свой огород", "Бесплатно, но мало и нерегулярно"]],
      [["Цена как у всех", "Безопасная цена, средний интерес"], ["Ледяная волна по 25", "Золотая жила в жару, иначе убыток"], ["Акция 2 по цене 1", "Больше покупателей, тоньше маржа"]],
      [["Продать всё сейчас", "Уверенно, без ожидания"], ["Стоять до вечера", "Больше клиентов, но лёд тает"], ["Перенести к парку", "Лучшее место, но аренда"]],
    ],
    reselling: [
      [["Партия из 5 штук", "Одна вещь бракованная"], ["Одна вещь в хорошем состоянии", "Дороже, но надёжно"], ["По фото", "Дёшево, но неизвестно"]],
      [["Обычное объявление", "Без защиты, покупатель может обмануть"], ["Проверить покупателя", "Оплата заранее, доп. комиссия"], ["Быстрая скидка", "Покупатель забирает дешевле"]],
      [["Принять первое предложение", "Быстро, но дешевле"], ["Торговаться", "Иногда больше, иногда покупатель уходит"], ["Ждать лучшего покупателя", "Может быть больше, но рынок меняется"]],
    ],
    carflip: [
      [["Аукцион без проверки", "Дёшево, но риск скрытого дефекта"], ["Частник с сервисной книжкой", "Честнее, немного дороже"], ["Привоз из-за границы", "Дорого из-за пошлины, но состояние хорошее"]],
      [["Только необходимое", "Тормоза и шины, быстро и дёшево"], ["Проверка у механика", "Находит дефекты, защищает от претензий"], ["Полный ремонт", "Дорого, но машина блестит"]],
      [["Продать на барахолке сейчас", "Быстро, но дешевле"], ["Объявление и показы", "Рынок решит, покупатели придут"], ["Ждать хорошей цены", "Выше цена, но дольше"]],
    ],
    houseflip: [
      [["Дом под ремонт", "Дешевле всего, больше всего работы"], ["Квартира в хорошем районе", "Надёжнее, меньше прибыли"], ["Участок под стройку", "Дорого, самый большой потенциал"]],
      [["Только косметика", "Быстро и дёшево, мало эффекта"], ["Экспертиза и ремонт фундамента", "Защищает от беды, дорого"], ["Перестройка чердака и ванных", "Большой эффект, большие расходы"]],
      [["Риелтор сейчас", "Комиссия 3 %, быстро"], ["Своё объявление", "Без комиссии, медленнее"], ["Ждать весеннего сезона", "Лучший рынок, но проценты идут"]],
    ],
    startup: [
      [["Свои накопления", "Доля не размывается, мало денег"], ["Малый инвестор за 20 %", "Деньги и советы, часть компании ушла"], ["Крупный инвестор за 45 %", "Много денег, большая доля ушла"]],
      [["Быстро выпустить MVP", "Дёшево и быстро, но с багами"], ["Качественная разработка и тесты", "Меньше банкротств, медленнее"], ["Маркетинговая кампания", "Большой рост, большие расходы"]],
      [["Продать крупной компании", "Надёжный выход, средний доход"], ["Выход на биржу (IPO)", "Большой доход, большой риск"], ["Зарабатывать дальше без выхода", "Стабильно, но медленно"]],
    ],
    freelance: [
      [["Маленькая работа на 2 часа", "Мало денег, быстро готово"], ["Средний проект на неделю", "Солидный заработок"], ["Большой проект с жёстким сроком", "Самая большая выплата, самое большое давление"]],
      [["Играть наверняка", "Безопасно, без переработок"], ["Сверхурочные", "Быстрее, но качество плавает"], ["Срезать по шаблону", "Дёшево, но клиент заметит"]],
      [["Клиент принимает сразу", "Без осложнений"], ["Бесплатные правки", "Клиент хочет изменений, но платит"], ["Спор об оплате", "Может заплатить меньше или не заплатить"]],
    ],
  },
};

const uk: HustleText = {
  title: "Підробіток",
  intro: "Проєкти у трьох фазах, як у житті: купівля, робота, продаж. Кожну фазу вирішуєш ти. Результат — діапазон, а не гарантія.",
  running: "Активні проєкти",
  none: "Нічого не працює. Обери проєкт нижче.",
  stakeLabel: "Внесок",
  all: "Усі",
  topUp: "Докупити {n}",
  startBtn: "Почати з внеском {n}",
  due: "Вирішіть зараз",
  next: "Наступна фаза через {t}",
  locked: "Відкриється з Навчанням {n}",
  streak: "Серія {n}",
  logLine: "Фаза {n}: ×{m}",
  sec: "{n} с",
  startTitle: "Почати новий проєкт",
  openCard: "Відкрити",
  experience: "Досвід {n}/5",
  hintUp: "Досвід: ринок росте",
  hintDown: "Досвід: ринок падає",
  hintNone: "Досвіду поки немає. Перша підказка з'явиться після завершеного циклу.",
  marketHidden: "Коефіцієнт ринку покажеться лише під час продажу.",
  range: "×{lo}–{hi}",
  breakEven: "Прибуток від ×1,00",
  lostText: "Ризик спрацював: виплата впала.",
  lostTotal: "Покупець не заплатив.",
  profitText: "Прибуток {n}",
  lossText: "Збиток {n}",
  stakeTotal: "Вкладено",
  value: "Вартість",
  phaseOf: "Фаза {n} з 3",
  chartLabel: "Зміна вартості",
  commissionShown: "Комісія {n} %",
  phases: ["Купівля", "Робота", "Продаж"],
  event: ["Можливість", "Випадкова пропозиція: вищий заробіток, трохи дорожче."],
  chips: { stake: "Внесок", time: "Разом", commission: "Комісія", risk: "Шахрайство або банкрутство", experience: "Досвід", upkeep: "Поточні витрати" },
  names: { lemonade: "Лимонадний кіоск", reselling: "Перепродаж", carflip: "Перепродаж авто", houseflip: "Перепродаж будинків", startup: "Стартап", freelance: "Фриланс-замовлення" },
  desc: {
    lemonade: "Купуєш інгредієнти, ставиш кіоск біля парку чи школи і продаєш. Погода важить більше за ціну.",
    reselling: "Купуєш товар на блошиному ринку дешевше, чистиш, фотографуєш і продаєш. Покупці торгуються, а деякі шахраюють. Платформа бере комісію.",
    carflip: "Купуєш авто на аукціоні або у приватної особи. Дефекти не видно. Ремонт піднімає ціну, якщо зробити його добре.",
    houseflip: "Купуєш старий будинок нижче ринку, зазвичай з іпотекою. Ремонт затягується, відсотки йдуть, а ринок змінюється.",
    startup: "Засновуєш компанію, знаходиш інвестора, розробляєш продукт і зростаєш. Більшість зазнає невдачі, кілька продаються або виходять на біржу.",
    freelance: "Береш замовлення на платформі. Клієнт просить правки, а іноді не платить. Платформа бере 10 %.",
  },
  situations: {
    lemonade: ["Де купиш інгредієнти?", "Яку ціну й акцію обереш?", "Що зробиш наприкінці дня?"],
    reselling: ["Що купиш на блошиному ринку?", "Як рекламувати і хто покупець?", "Як завершиш продаж?"],
    carflip: ["У кого і за скільки купиш авто?", "Що відремонтуєш?", "Як продаси авто?"],
    houseflip: ["Який будинок купиш?", "Що буде перебудовуватися?", "Як продаси будинок?"],
    startup: ["Як профінансуєш компанію?", "Як розроблятимеш продукт?", "Як вийдеш з проєкту?"],
    freelance: ["Яке замовлення приймеш?", "Як його виконаєш?", "Як клієнт прийме роботу?"],
  },
  options: {
    lemonade: [
      [["Оптова база", "Дешево, але лимони підсохли"], ["Ринок на площі", "Свіжі фрукти, дорожче"], ["Власний садок", "Безкоштовно, але мало і нерегулярно"]],
      [["Ціна як у всіх", "Безпечна ціна, середній інтерес"], ["Льодова хвиля за 25", "Золота жила в спеку, інакше збиток"], ["Акція 2 за 1", "Більше людей, менша маржа"]],
      [["Продати все зараз", "Гарантовано, без очікування"], ["Стояти до вечора", "Більше клієнтів, але лід тане"], ["Перенести до парку", "Краще місце, але оренда"]],
    ],
    reselling: [
      [["Партія з 5 штук", "Один виріб із дефектом"], ["Один виріб у гарному стані", "Дорожче, але надійно"], ["За фотографіями", "Дешево, але невідомо"]],
      [["Стандартне оголошення", "Без захисту, покупець може шахраювати"], ["Перевірити покупця", "Оплата наперед, додатковий збір"], ["Швидка знижка", "Покупець забере дешевше"]],
      [["Прийняти першу пропозицію", "Швидко, але дешевше"], ["Торгуватися", "Інколи більше, інколи покупець піде"], ["Чекати кращого покупця", "Можливо більше, але ринок рухається"]],
    ],
    carflip: [
      [["Аукціон без огляду", "Дешево, але можливий прихований дефект"], ["Приватна особа з сервісною книжкою", "Чесніше, трохи дорожче"], ["Імпорт з-за кордону", "Дорого через доставку й мито, але стан добрий"]],
      [["Тільки найнеобхідніше", "Гальма й шини, швидко й дешево"], ["Огляд у механіка", "Знайде дефекти, захистить від претензій"], ["Повна реставрація", "Дорого, але авто засяє"]],
      [["Одразу на ринок", "Швидко, за нижчою ціною"], ["Оголошення і огляди", "Ринок вирішить, прийдуть охочі"], ["Чекати гарної ціни", "Вища ціна, але довго"]],
    ],
    houseflip: [
      [["Будинок під ремонт", "Найдешевший, найбільше роботи"], ["Квартира в гарному районі", "Надійніше, менший прибуток"], ["Ділянка під забудову", "Дорого, але найбільший потенціал"]],
      [["Тільки косметика", "Швидко й дешево, малий ефект"], ["Експертиза і ремонт фундаменту", "Захищає від біди, дорого"], ["Перебудова горища і ванних", "Великий ефект, великі витрати"]],
      [["Ріелтор одразу", "Комісія 3 %, швидко"], ["Власне оголошення", "Без комісії, повільніше"], ["Чекати весняного сезону", "Кращий ринок, але відсотки йдуть"]],
    ],
    startup: [
      [["Власні заощадження", "Частка не розмивається, мало грошей"], ["Малий інвестор за 20 %", "Гроші та порада, частина компанії пішла"], ["Великий інвестор за 45 %", "Багато грошей, велика частка пішла"]],
      [["Швидко випустити MVP", "Дешево й швидко, але з помилками"], ["Якісна розробка і тести", "Менше банкрутств, повільніше"], ["Маркетингова кампанія", "Великий ріст, великі витрати"]],
      [["Продати великій компанії", "Надійний вихід, середній дохід"], ["Вихід на біржу (IPO)", "Великий дохід, великий ризик"], ["Далі заробляти без виходу", "Стабільно, але повільно"]],
    ],
    freelance: [
      [["Невелика робота на 2 години", "Мало грошей, швидко готово"], ["Середній проєкт на тиждень", "Солідний заробіток"], ["Великий проєкт із жорстким терміном", "Найбільша виплата, найбільший тиск"]],
      [["Грати напевно", "Безпечно, без надурочних"], ["Надурочні", "Швидше, але якість коливається"], ["Скоротити за шаблоном", "Дешево, але клієнт помітить"]],
      [["Клієнт погоджує одразу", "Без ускладнень"], ["Безкоштовні правки", "Клієнт хоче змін, але заплатить"], ["Суперечка про оплату", "Може заплатити менше або взагалі нічого"]],
    ],
  },
};

const ja: HustleText = {
  title: "副業",
  intro: "実生活のように3つの段階があるプロジェクト：仕入れ、運営、販売。各段階はあなたが決めます。結果は確実なものではなく、幅のある結果です。",
  running: "進行中のプロジェクト",
  none: "進行中のものはありません。下からプロジェクトを選んでください。",
  stakeLabel: "投資額",
  all: "すべて",
  topUp: "{n}を追加",
  startBtn: "{n}の投資で開始",
  due: "今すぐ決める",
  next: "次の段階まで {t}",
  locked: "教育 {n} で解放",
  streak: "連続 {n}",
  logLine: "段階 {n}: ×{m}",
  sec: "{n} 秒",
  startTitle: "新しいプロジェクトを始める",
  openCard: "開く",
  experience: "経験 {n}/5",
  hintUp: "経験: 市場は上昇中",
  hintDown: "経験: 市場は下落中",
  hintNone: "まだ経験はありません。最初のヒントは1回完了すると出ます。",
  marketHidden: "市場係数は販売時に表示されます。",
  range: "×{lo}〜{hi}",
  breakEven: "×1.00 からの利益",
  lostText: "リスクが発生：支払いが減りました。",
  lostTotal: "買い手が支払いませんでした。",
  profitText: "利益 {n}",
  lossText: "損失 {n}",
  stakeTotal: "投資済み",
  value: "価値",
  phaseOf: "段階 {n} / 3",
  chartLabel: "価値の推移",
  commissionShown: "手数料 {n} %",
  phases: ["仕入れ", "運営", "販売"],
  event: ["チャンス", "ランダムな依頼: 報酬は高めですが、少し割高です。"],
  chips: { stake: "投資", time: "合計", commission: "手数料", risk: "詐欺や倒産", experience: "経験", upkeep: "運営費" },
  names: { lemonade: "レモネードの屋台", reselling: "転売", carflip: "車の転売", houseflip: "住宅の転売", startup: "スタートアップ", freelance: "フリーランスの仕事" },
  desc: {
    lemonade: "材料を買い、公園や学校の近くに屋台を出して売ります。価格より天気の方が重要です。",
    reselling: "フリマで安く仕入れ、きれいにして写真を撮り、売ります。買い手は値切り、中には詐欺もあります。プラットフォームが手数料を取ります。",
    carflip: "オークションや個人から車を買います。欠陥は見えません。うまく修理すれば価格は上がります。",
    houseflip: "相場より安い古い家を、多くは住宅ローンで買います。改修は長引き、利息もかかり、相場も変わります。",
    startup: "会社を立ち上げ、投資家を探し、製品を開発して成長させます。多くは失敗しますが、一部は売却や上場します。",
    freelance: "プラットフォームで仕事を受けます。依頼主は修正を求め、時には支払わないこともあります。プラットフォームは10%を取ります。",
  },
  situations: {
    lemonade: ["材料はどこで買う？", "価格と販促はどうする？", "一日の終わりにどうする？"],
    reselling: ["フリマで何を買う？", "どう宣伝し、買い手は誰？", "どう取引を締める？"],
    carflip: ["どこでいくらで車を買う？", "何を修理する？", "どう車を売る？"],
    houseflip: ["どの家を買う？", "何をリフォームする？", "どう家を売る？"],
    startup: ["会社の資金はどう集める？", "製品はどう開発する？", "どう撤退する？"],
    freelance: ["どの仕事を引き受ける？", "どう仕上げる？", "依頼主はどう受け取る？"],
  },
  options: {
    lemonade: [
      [["卸売業者", "安いけれど、レモンが乾いている"], ["広場の市場", "新鮮な果物、高め"], ["自宅の庭", "無料だけど少なく不安定"]],
      [["みんなと同じ価格", "無難な価格、平均的な人気"], ["25円の氷キャンペーン", "暑い日は大当たり、それ以外は赤字"], ["2個で1個分", "客は増えるが利益は薄い"]],
      [["今すぐ全部売る", "確実で待たなくていい"], ["夕方まで粘る", "客は増えるが氷が溶ける"], ["公園へ移動", "良い場所だが家賃がかかる"]],
    ],
    reselling: [
      [["5点のまとめ売り", "1点は欠陥品"], ["状態の良い1点", "高いけれど確実"], ["写真を見て判断", "安いけれど不確か"]],
      [["通常の出品", "保護なし、詐欺もありうる"], ["買い手を確認", "前払いで、手数料も追加"], ["すぐ値下げ", "買い手は安く持っていく"]],
      [["最初の申し出を受ける", "素早いが安い"], ["交渉する", "高くなることも、買い手が去ることも"], ["より良い買い手を待つ", "高くなるかも、でも相場は動く"]],
    ],
    carflip: [
      [["確認なしのオークション", "安いが隠れた欠陥のリスク"], ["整備記録のある個人", "誠実で少し高め"], ["海外からの輸入", "輸送費と関税で高いが状態は良い"]],
      [["必要最低限だけ", "ブレーキとタイヤ、早くて安い"], ["整備士による点検", "欠陥を見つけ、クレームから守る"], ["フルレストア", "高いが車が輝く"]],
      [["すぐ売りに出す", "早いが安い価格"], ["広告と内覧", "市場が決め、希望者が来る"], ["良い価格を待つ", "高い価格だが時間がかかる"]],
    ],
    houseflip: [
      [["改修が必要な家", "最も安いが作業量が最大"], ["良い立地のマンション", "確実だが利益は小さい"], ["建築用の土地", "高いが最大の可能性"]],
      [["見た目だけの改装", "早くて安いが効果は小さい"], ["調査と基礎の修理", "大惨事を防ぐが高い"], ["屋根裏と浴室の改築", "大きな効果、大きな出費"]],
      [["すぐ不動産業者へ", "手数料3%、早い"], ["自分で広告を出す", "手数料なし、ゆっくり"], ["春のシーズンまで待つ", "より良い市場だが利息がかかる"]],
    ],
    startup: [
      [["自己資金", "持ち分は薄まらないが資金は少ない"], ["20%で小口の投資家", "資金と助言が得られるが会社の一部を手放す"], ["45%で大口の投資家", "多くの資金、大きな持ち分を手放す"]],
      [["MVPをすぐ出す", "安くて速いがバグがある"], ["丁寧な開発とテスト", "倒産は減るが遅い"], ["マーケティングキャンペーン", "大きな成長、大きな出費"]],
      [["大企業へ売却", "確実な出口、中程度の収益"], ["株式公開（IPO）", "大きな収益、大きなリスク"], ["出口なしで稼ぎ続ける", "安定しているが遅い"]],
    ],
    freelance: [
      [["2時間の小さな仕事", "報酬は少ないがすぐ終わる"], ["1週間の中規模プロジェクト", "堅実な収入"], ["締め切りの厳しい大規模プロジェクト", "最大の報酬、最大のプレッシャー"]],
      [["確実に行く", "安全で残業なし"], ["残業", "早いが品質にばらつき"], ["テンプレートで手抜き", "安いが依頼主にばれる"]],
      [["依頼主がすぐ承認", "問題なし"], ["無料の修正", "依頼主は変更を求めるが支払う"], ["支払いをめぐる争い", "少なく払われるか、全く払われない"]],
    ],
  },
};

const es: HustleText = {
  title: "Trabajo extra",
  intro: "Proyectos en tres fases, como en la vida real: compra, operación, venta. Decides cada fase. El resultado es un rango, no una certeza.",
  running: "Proyectos en curso",
  none: "No hay nada en marcha. Elige un proyecto abajo.",
  stakeLabel: "Inversión",
  all: "Todo",
  topUp: "Añadir {n}",
  startBtn: "Empezar con {n}",
  due: "Decide ahora",
  next: "Siguiente fase en {t}",
  locked: "Se desbloquea con Formación {n}",
  streak: "Racha {n}",
  logLine: "Fase {n}: ×{m}",
  sec: "{n} s",
  startTitle: "Empezar un proyecto nuevo",
  openCard: "Abrir",
  experience: "Experiencia {n}/5",
  hintUp: "Experiencia: el mercado sube",
  hintDown: "Experiencia: el mercado baja",
  hintNone: "Todavía sin experiencia. La primera pista llega tras terminar una ronda.",
  marketHidden: "El coeficiente del mercado aparece al vender.",
  range: "×{lo}–{hi}",
  breakEven: "Beneficio desde ×1,00",
  lostText: "Se cumplió el riesgo: el pago bajó.",
  lostTotal: "El comprador no pagó.",
  profitText: "Beneficio {n}",
  lossText: "Pérdida {n}",
  stakeTotal: "Invertido",
  value: "Valor",
  phaseOf: "Fase {n} de 3",
  chartLabel: "Evolución del valor",
  commissionShown: "Comisión {n} %",
  phases: ["Compra", "Operación", "Venta"],
  event: ["Oportunidad", "Oferta aleatoria: más ganancia, algo más caro."],
  chips: { stake: "Inversión", time: "Total", commission: "Comisión", risk: "Estafa o quiebra", experience: "Experiencia", upkeep: "Gastos corrientes" },
  names: { lemonade: "Puesto de limonada", reselling: "Reventa", carflip: "Compraventa de coches", houseflip: "Compraventa de casas", startup: "Startup", freelance: "Encargo freelance" },
  desc: {
    lemonade: "Compras los ingredientes, montas un puesto junto al parque o al colegio y vendes. El tiempo importa más que el precio.",
    reselling: "Compras mercancía barata en el rastro, la limpias, la fotografías y la vendes. Los compradores regatean y algunos estafan. La plataforma cobra comisión.",
    carflip: "Compras un coche en subasta o a un particular. Los defectos no se ven. Las reparaciones suben el precio, si las haces bien.",
    houseflip: "Compras una casa vieja por debajo del mercado, normalmente con hipoteca. Las reformas se alargan, los intereses corren y el mercado cambia.",
    startup: "Fundas una empresa, buscas inversor, desarrollas un producto y creces. La mayoría fracasa; unas pocas se venden o salen a bolsa.",
    freelance: "Aceptas encargos en una plataforma. El cliente pide revisiones y a veces no paga. La plataforma cobra el 10 %.",
  },
  situations: {
    lemonade: ["¿Dónde compras los ingredientes?", "¿Qué precio y promoción eliges?", "¿Qué haces al final del día?"],
    reselling: ["¿Qué compras en el rastro?", "¿Cómo anuncias y quién es el comprador?", "¿Cómo cierras la venta?"],
    carflip: ["¿A quién y por cuánto compras el coche?", "¿Qué reparas?", "¿Cómo vendes el coche?"],
    houseflip: ["¿Qué casa compras?", "¿Qué se reforma?", "¿Cómo vendes la casa?"],
    startup: ["¿Cómo financias la empresa?", "¿Cómo desarrollas el producto?", "¿Cómo sales del proyecto?"],
    freelance: ["¿Qué encargo aceptas?", "¿Cómo lo entregas?", "¿Cómo recibe el cliente el trabajo?"],
  },
  options: {
    lemonade: [
      [["Mayorista", "Barato, pero los limones están secos"], ["Mercado de la plaza", "Fruta fresca, más cara"], ["Huerto propio", "Gratis, pero poca y irregular"]],
      [["Precio como todos", "Precio seguro, interés medio"], ["Ola de hielo a 25", "Mina de oro con calor, si no pérdida"], ["Oferta 2 por 1", "Más clientes, margen menor"]],
      [["Vender todo ya", "Seguro, sin esperar"], ["Aguantar hasta la tarde", "Más clientes, pero el hielo se derrite"], ["Mudarse al parque", "Mejor sitio, pero con alquiler"]],
    ],
    reselling: [
      [["Lote de 5 unidades", "Un artículo está defectuoso"], ["Un artículo en buen estado", "Más caro, pero seguro"], ["Según las fotos", "Barato, pero incierto"]],
      [["Anuncio estándar", "Sin protección, el comprador puede estafar"], ["Verificar al comprador", "Pago por adelantado, tasa extra"], ["Descuento rápido", "El comprador se lo lleva más barato"]],
      [["Aceptar la primera oferta", "Rápido, pero más barato"], ["Negociar", "A veces más, a veces el comprador se va"], ["Esperar a un mejor comprador", "Quizá más, pero el mercado se mueve"]],
    ],
    carflip: [
      [["Subasta sin revisión", "Barato, pero riesgo de defecto oculto"], ["Particular con libro de mantenimiento", "Más honrado, algo más caro"], ["Importación del extranjero", "Caro por transporte y aduana, pero buen estado"]],
      [["Solo lo imprescindible", "Frenos y neumáticos, rápido y barato"], ["Revisión en el taller", "Encuentra defectos, protege de reclamaciones"], ["Restauración completa", "Caro, pero el coche brilla"]],
      [["Poner a la venta ya", "Rápido, a menor precio"], ["Anuncio y visitas", "El mercado decide, llegan interesados"], ["Esperar un buen precio", "Precio más alto, pero tarda"]],
    ],
    houseflip: [
      [["Casa para reformar", "La más barata, con más trabajo"], ["Piso en buena zona", "Más seguro, menor beneficio"], ["Terreno para construir", "Caro, pero el mayor potencial"]],
      [["Solo cosmética", "Rápido y barato, poco efecto"], ["Peritaje y reparación de cimientos", "Evita el desastre, caro"], ["Reforma del desván y baños", "Gran efecto, grandes gastos"]],
      [["Inmobiliaria ya", "Comisión del 3 %, rápido"], ["Anuncio propio", "Sin comisión, más lento"], ["Esperar a la temporada de primavera", "Mejor mercado, pero los intereses corren"]],
    ],
    startup: [
      [["Ahorros propios", "No diluyes la participación, pero hay poco dinero"], ["Inversor pequeño por el 20 %", "Dinero y consejo, sale parte de la empresa"], ["Inversor grande por el 45 %", "Mucho dinero, sale una gran parte"]],
      [["Lanzar el MVP rápido", "Barato y rápido, pero con errores"], ["Desarrollo de calidad y pruebas", "Menos quiebras, más lento"], ["Campaña de marketing", "Gran crecimiento, grandes gastos"]],
      [["Vender a una gran empresa", "Salida segura, rentabilidad media"], ["Salir a bolsa (OPV)", "Gran rentabilidad, gran riesgo"], ["Seguir ganando sin salida", "Estable, pero lento"]],
    ],
    freelance: [
      [["Trabajo pequeño de 2 horas", "Poco dinero, listo enseguida"], ["Proyecto medio de una semana", "Ingresos sólidos"], ["Proyecto grande con plazo fijo", "El pago más alto, la mayor presión"]],
      [["Ir a lo seguro", "Seguro, sin horas extra"], ["Horas extra", "Más rápido, pero la calidad varía"], ["Atajo con plantilla", "Barato, pero el cliente lo notará"]],
      [["El cliente aprueba enseguida", "Sin complicaciones"], ["Revisiones gratis", "El cliente quiere cambios, pero paga"], ["Disputa por el pago", "Puede pagar menos o nada"]],
    ],
  },
};

const fr: HustleText = {
  title: "Petits boulots",
  intro: "Des projets en trois phases, comme dans la vraie vie : achat, exploitation, vente. Tu décides à chaque phase. Le résultat est une fourchette, pas une certitude.",
  running: "Projets en cours",
  none: "Rien n'est en cours. Choisis un projet ci-dessous.",
  stakeLabel: "Mise",
  all: "Tout",
  topUp: "Ajouter {n}",
  startBtn: "Commencer avec {n}",
  due: "Décide maintenant",
  next: "Phase suivante dans {t}",
  locked: "Se débloque à Formation {n}",
  streak: "Série {n}",
  logLine: "Phase {n} : ×{m}",
  sec: "{n} s",
  startTitle: "Lancer un nouveau projet",
  openCard: "Ouvrir",
  experience: "Expérience {n}/5",
  hintUp: "Expérience : le marché monte",
  hintDown: "Expérience : le marché baisse",
  hintNone: "Pas encore d'expérience. Le premier indice arrive après un projet terminé.",
  marketHidden: "Le coefficient du marché apparaît lors de la vente.",
  range: "×{lo}–{hi}",
  breakEven: "Bénéfice à partir de ×1,00",
  lostText: "Le risque s'est réalisé : le paiement a baissé.",
  lostTotal: "L'acheteur n'a pas payé.",
  profitText: "Bénéfice {n}",
  lossText: "Perte {n}",
  stakeTotal: "Investi",
  value: "Valeur",
  phaseOf: "Phase {n} sur 3",
  chartLabel: "Évolution de la valeur",
  commissionShown: "Commission {n} %",
  phases: ["Achat", "Exploitation", "Vente"],
  event: ["Opportunité", "Offre aléatoire : gain plus élevé, un peu plus cher."],
  chips: { stake: "Mise", time: "Total", commission: "Commission", risk: "Arnaque ou faillite", experience: "Expérience", upkeep: "Frais courants" },
  names: { lemonade: "Stand de limonade", reselling: "Revente", carflip: "Revente de voitures", houseflip: "Revente de maisons", startup: "Startup", freelance: "Mission freelance" },
  desc: {
    lemonade: "Tu achètes les ingrédients, installes un stand près du parc ou de l'école et tu vends. La météo compte plus que le prix.",
    reselling: "Tu achètes des articles bon marché à la brocante, tu les nettoies, les photographies et les vends. Les acheteurs marchandent et certains arnaquent. La plateforme prend une commission.",
    carflip: "Tu achètes une voiture aux enchères ou à un particulier. Les défauts ne se voient pas. Les réparations font monter le prix si tu les fais bien.",
    houseflip: "Tu achètes une vieille maison sous le prix du marché, en général avec un prêt. Les travaux traînent, les intérêts courent et le marché bouge.",
    startup: "Tu crées une entreprise, trouves un investisseur, développes un produit et grandis. La plupart échouent ; quelques-unes sont rachetées ou introduites en bourse.",
    freelance: "Tu acceptes des missions sur une plateforme. Le client demande des retouches et ne paie parfois pas. La plateforme prend 10 %.",
  },
  situations: {
    lemonade: ["Où achètes-tu les ingrédients ?", "Quel prix et quelle promotion choisis-tu ?", "Que fais-tu en fin de journée ?"],
    reselling: ["Que rachètes-tu à la brocante ?", "Comment fais-tu la publicité et qui est l'acheteur ?", "Comment conclus-tu la vente ?"],
    carflip: ["Où et pour combien achètes-tu la voiture ?", "Que réparles-tu ?", "Comment vends-tu la voiture ?"],
    houseflip: ["Quelle maison achètes-tu ?", "Que rénoves-tu ?", "Comment vends-tu la maison ?"],
    startup: ["Comment finances-tu l'entreprise ?", "Comment développes-tu le produit ?", "Comment sors-tu du projet ?"],
    freelance: ["Quelle mission acceptes-tu ?", "Comment la livres-tu ?", "Comment le client reçoit-il le travail ?"],
  },
  options: {
    lemonade: [
      [["Grossiste", "Pas cher, mais les citrons sont desséchés"], ["Marché de la place", "Fruits frais, plus cher"], ["Jardin perso", "Gratuit, mais peu et irrégulier"]],
      [["Prix comme tout le monde", "Prix sûr, intérêt moyen"], ["Vague de glace à 25", "Mine d'or par la chaleur, sinon perte"], ["Offre 2 pour 1", "Plus de clients, marge plus faible"]],
      [["Tout vendre maintenant", "Sûr, sans attendre"], ["Rester jusqu'au soir", "Plus de clients, mais la glace fond"], ["Déménager près du parc", "Meilleur emplacement, mais un loyer"]],
    ],
    reselling: [
      [["Lot de 5 pièces", "Un article est défectueux"], ["Un article en bon état", "Plus cher, mais fiable"], ["D'après les photos", "Pas cher, mais incertain"]],
      [["Annonce standard", "Sans protection, l'acheteur peut arnaquer"], ["Vérifier l'acheteur", "Paiement d'avance, frais en plus"], ["Remise rapide", "L'acheteur l'emporte moins cher"]],
      [["Accepter la première offre", "Rapide, mais moins cher"], ["Négocier", "Parfois plus, parfois l'acheteur part"], ["Attendre un meilleur acheteur", "Peut-être plus, mais le marché bouge"]],
    ],
    carflip: [
      [["Enchère sans contrôle", "Pas cher, mais risque de défaut caché"], ["Particulier avec carnet d'entretien", "Plus honnête, un peu plus cher"], ["Import de l'étranger", "Cher à cause du transport et des droits, mais bon état"]],
      [["Seulement l'indispensable", "Freins et pneus, vite et pas cher"], ["Contrôle chez le mécanicien", "Trouve les défauts, protège des réclamations"], ["Restauration complète", "Cher, mais la voiture brille"]],
      [["Mettre en vente tout de suite", "Rapide, à petit prix"], ["Annonce et visites", "Le marché décide, les intéressés viennent"], ["Attendre un bon prix", "Prix plus haut, mais ça prend du temps"]],
    ],
    houseflip: [
      [["Maison à rénover", "La moins chère, le plus de travaux"], ["Appartement bien situé", "Plus sûr, bénéfice plus faible"], ["Terrain à bâtir", "Cher, mais le plus fort potentiel"]],
      [["Seulement la décoration", "Rapide et pas cher, peu d'effet"], ["Expertise et réparation des fondations", "Évite le désastre, cher"], ["Transformation des combles et des salles de bain", "Grand effet, gros frais"]],
      [["Agence immobilière tout de suite", "Commission de 3 %, rapide"], ["Annonce personnelle", "Sans commission, plus lent"], ["Attendre la saison de printemps", "Meilleur marché, mais les intérêts courent"]],
    ],
    startup: [
      [["Économies personnelles", "Pas de dilution, mais peu d'argent"], ["Petit investisseur à 20 %", "Argent et conseils, une partie de l'entreprise part"], ["Gros investisseur à 45 %", "Beaucoup d'argent, une grosse part part"]],
      [["Sortir le MVP vite", "Pas cher et rapide, mais avec des bugs"], ["Développement soigné et tests", "Moins de faillites, plus lent"], ["Campagne marketing", "Forte croissance, grosses dépenses"]],
      [["Vendre à une grande entreprise", "Sortie sûre, rendement moyen"], ["Entrer en bourse (IPO)", "Gros rendement, gros risque"], ["Continuer à gagner sans sortie", "Stable, mais lent"]],
    ],
    freelance: [
      [["Petit travail de 2 heures", "Peu d'argent, vite fait"], ["Projet moyen d'une semaine", "Revenu solide"], ["Gros projet à échéance fixe", "Le plus gros paiement, la plus grosse pression"]],
      [["Jouer la sécurité", "Sûr, sans heures sup'"], ["Heures supplémentaires", "Plus rapide, mais la qualité varie"], ["Raccourci avec un modèle", "Pas cher, mais le client le remarquera"]],
      [["Le client valide tout de suite", "Sans complication"], ["Retouches gratuites", "Le client veut des changements, mais il paie"], ["Litige sur le paiement", "Il peut payer moins, ou pas du tout"]],
    ],
  },
};

export function getEconomyHustle(locale: Locale): HustleText {
  switch (locale) {
    case "cs":
      return cs;
    case "de":
      return de;
    case "ru":
      return ru;
    case "uk":
      return uk;
    case "ja":
      return ja;
    case "es":
      return es;
    case "fr":
      return fr;
    default:
      return en;
  }
}
