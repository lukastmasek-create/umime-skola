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

export function getEconomyHustle(locale: Locale): HustleText {
  switch (locale) {
    case "cs":
      return cs;
    case "de":
      return de;
    case "ru":
      return ru;
    default:
      return en;
  }
}
