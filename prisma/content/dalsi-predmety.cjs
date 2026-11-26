// Další kurzy napříč předměty. Každý kurz má vlastní předmět a otázky.
const course = (slug, title, desc, subject, section, grade, qs) => ({ slug, title, desc, section, grade, qs });
const q = (difficulty, prompt, correct, wrong, explanation) => [difficulty, prompt, correct, wrong, explanation];

module.exports = {
  subject: "CESTINA",
  courses: [
    course("cj-c-tenari-a-knihy", "Čtenáři a knihy", "Práce s krátkým textem, hlavní myšlenka a informace v textu.", "CESTINA", "Čtenářská gramotnost", 5, [
      q(1, "Co je hlavní myšlenka textu?", "nejdůležitější sdělení", ["nejdelší věta", "jméno autora", "poslední slovo"], "Hlavní myšlenka shrnuje, co chce text říct."),
      q(1, "Kdo text napsal?", "autor", ["čtenář", "ilustrátor vždy", "postava"], "Autor je člověk, který text vytvořil."),
      q(2, "Co je odstavec?", "část textu s jedním tematickým celkem", ["jedno písmeno", "název knihy", "znaménko"], "Odstavec sdružuje věty k jednomu tématu."),
      q(3, "Co znamená vyhledat informaci v textu?", "najít odpověď přímo v textu", ["vymyslet si odpověď", "přepsat nadpis", "spočítat písmena"], "Informaci ověřujeme v přečteném textu."),
      q(4, "Co je přímá řeč?", "doslovná slova postavy", ["popis počasí", "název kapitoly", "shrnutí knihy"], "Přímá řeč zachycuje přesné vyjádření mluvčího."),
    ]),
    course("lit-basne-a-rymy", "Báseň a rým", "Základní pojmy poezie, verš, sloka a rým.", "LITERATURA", "Poezie", 6, [
      q(1, "Jak se nazývá jeden řádek básně?", "verš", ["kapitola", "odstavec", "děj"], "Verš je jeden řádek básně."),
      q(1, "Co je sloka?", "skupina veršů", ["jedno písmeno", "název autora", "knižní obálka"], "Sloka je část básně složená z veršů."),
      q(2, "Co je rým?", "zvuková shoda na konci veršů", ["hlavní postava", "druh prózy", "název básně"], "Rým spojuje verše podobným zakončením."),
      q(3, "Jaký rým má schéma ABAB?", "střídavý", ["sdružený", "obkročný", "bez rýmu"], "U střídavého rýmu se střídají první a třetí verš s druhým a čtvrtým."),
      q(4, "Co v básni vyjadřuje náladu?", "obrazy a jazyk básně", ["číslo stránky", "cena knihy", "jméno nakladatele"], "Náladu vytvářejí volená slova, obrazy a rytmus."),
    ]),
    course("nj-kazdodenni-komunikace", "Němčina v každodenním životě", "Pozdravy, nakupování, čas a jednoduché věty v němčině.", "NEMCINA", "Konverzace", 6, [
      q(1, "Co znamená Guten Morgen?", "Dobré ráno", ["Dobrou noc", "Na shledanou", "Děkuji"], "Guten Morgen používáme ráno."),
      q(1, "Jak se německy řekne děkuji?", "Danke", ["Bitte", "Hallo", "Tschüss"], "Danke znamená děkuji."),
      q(2, "Ich bin zwölf Jahre alt. Který tvar slovesa je správně?", "bin", ["bist", "ist", "sind"], "Se zájmenem ich používáme bin."),
      q(2, "Co znamená Wie viel kostet das?", "Kolik to stojí?", ["Kde bydlíš?", "Kolik je hodin?", "Jak se jmenuješ?"], "Tato věta se ptá na cenu."),
      q(3, "Jaký člen má slovo Haus?", "das", ["der", "die", "den"], "Říkáme das Haus."),
    ]),
    course("rj-cestovani", "Ruština: cestování", "Základní ruská slovíčka pro cestu, město a dopravu.", "RUSTINA", "Slovní zásoba", 7, [
      q(1, "Co znamená ruské слово город?", "město", ["vesnice", "škola", "letiště"], "Город znamená město."),
      q(1, "Jak se rusky řekne vlak?", "поезд", ["самолёт", "автобус", "корабль"], "Поезд znamená vlak."),
      q(2, "Co znamená Где находится вокзал?", "Kde je nádraží?", ["Kdy jede vlak?", "Kolik stojí lístek?", "Kde je hotel?"], "Вокзал je nádraží."),
      q(3, "Jak se rusky řekne jízdenka?", "билет", ["паспорт", "карта", "сумка"], "Билет znamená jízdenka nebo lístek."),
      q(4, "Co znamená направо?", "doprava", ["doleva", "rovně", "zpět"], "Направо znamená doprava."),
    ]),
    course("mat-procenta-v-praxi", "Procenta v praxi", "Výpočty s procenty, slevami a zdražením.", "MATEMATIKA", "Procenta", 7, [
      q(1, "Kolik je 10 % ze 100?", "10", ["1", "50", "100"], "Deset procent ze sta je deset."),
      q(1, "Kolik je 50 % z 80?", "40", ["20", "30", "60"], "Polovina z 80 je 40."),
      q(2, "Kolik korun je sleva 20 % z 500 Kč?", "100 Kč", ["20 Kč", "80 Kč", "400 Kč"], "500 · 0,20 = 100 Kč."),
      q(3, "Kolik stojí věc za 500 Kč po slevě 20 %?", "400 Kč", ["300 Kč", "480 Kč", "600 Kč"], "Po slevě zůstává 80 % ceny: 500 · 0,8 = 400."),
      q(4, "Kolik je 25 % jako desetinné číslo?", "0,25", ["2,5", "25", "0,025"], "Procenta dělíme stem: 25 % = 0,25."),
    ]),
    course("zem-voda-na-zemi", "Voda na Zemi", "Oceány, řeky, jezera, koloběh vody a význam vody.", "ZEMEPIS", "Hydrosféra", 6, [
      q(1, "Který oceán je největší?", "Tichý oceán", ["Atlantský oceán", "Indický oceán", "Severní ledový oceán"], "Tichý oceán má největší rozlohu."),
      q(1, "Co je řeka?", "vodní tok", ["hora", "poušť", "město"], "Řeka je přirozený vodní tok."),
      q(2, "Co je pramen?", "místo, kde řeka začíná", ["místo ústí", "nejhlubší jezero", "vodopád vždy"], "Pramen je začátek vodního toku."),
      q(3, "Jak se nazývá přechod vody do páry?", "výpar", ["srážky", "mrznutí", "tání"], "Při výparu se kapalná voda mění na páru."),
      q(4, "Proč je voda důležitá pro člověka?", "je nutná pro život", ["jen ochlazuje auta", "vyrábí všechny kovy", "nahrazuje kyslík"], "Voda je základní podmínkou života."),
    ]),
    course("prir-lidske-telo", "Lidské tělo", "Orgány, orgánové soustavy a péče o zdraví.", "PRIRODOPIS", "Člověk", 8, [
      q(1, "Který orgán pumpuje krev?", "srdce", ["plíce", "žaludek", "mozek"], "Srdce pohání krevní oběh."),
      q(1, "Kde probíhá výměna kyslíku a oxidu uhličitého?", "v plicích", ["v játrech", "v žaludku", "v kostech"], "V plicních sklípcích probíhá výměna plynů."),
      q(2, "Která soustava řídí tělo pomocí nervových vzruchů?", "nervová", ["trávicí", "dýchací", "kosterní"], "Nervová soustava přijímá a zpracovává informace."),
      q(3, "K čemu slouží tenké střevo?", "vstřebávání živin", ["pumpování krve", "tvorbě moči", "výměně plynů"], "V tenkém střevě se vstřebává většina živin."),
      q(4, "Co pomáhá udržovat zdravé kosti?", "pohyb a dostatek vápníku", ["nedostatek spánku", "kouření", "dlouhé sezení"], "Kosti potřebují pohyb, vápník a vitamin D."),
    ]),
    course("obc-financni-gramotnost", "Finanční gramotnost", "Rozpočet, příjmy, výdaje, spoření a bezpečné placení.", "OBCANKA", "Hospodářství", 8, [
      q(1, "Co je příjem?", "peníze, které získáváme", ["dluh", "nákup", "pokuta vždy"], "Příjem zvyšuje množství peněz."),
      q(1, "Co je výdaj?", "peníze, které utratíme", ["mzda", "úspora", "dárek, který dostaneme"], "Výdaj snižuje peníze, které máme k dispozici."),
      q(2, "K čemu slouží rozpočet?", "plánuje příjmy a výdaje", ["měří teplotu", "nahrazuje účet", "určuje počasí"], "Rozpočet pomáhá plánovat hospodaření."),
      q(3, "Co znamená spořit?", "odkládat peníze na později", ["utratit vše hned", "půjčit si bez smlouvy", "ztratit účet"], "Spoření vytváří finanční rezervu."),
      q(4, "Jak chránit platební kartu?", "nesdělovat PIN a údaje cizím lidem", ["psát PIN na kartu", "posílat PIN do chatu", "nechat kartu bez dozoru"], "PIN a citlivé údaje musí zůstat tajné."),
    ]),
    course("hudba-nastroje-a-zvuk", "Nástroje a zvuk", "Hudební nástroje, vlastnosti zvuku a základní hudební pojmy.", "HUDEBKA", "Hudební nauka", 5, [
      q(1, "Který nástroj patří mezi smyčcové?", "housle", ["flétna", "buben", "trubka"], "Housle vydávají zvuk pomocí smyčce a strun."),
      q(1, "Co určuje výšku tónu?", "frekvence kmitání", ["barva papíru", "délka skladby", "počet posluchačů"], "Vyšší frekvence znamená vyšší tón."),
      q(2, "Který nástroj patří mezi dechové?", "flétna", ["klavír", "kytara", "triangl"], "Flétna zní díky proudění vzduchu."),
      q(3, "Co je tempo?", "rychlost hudebního proudu", ["síla světla", "druh nástroje", "text písně"], "Tempo určuje, jak rychle skladba zní."),
      q(4, "Co znamená forte?", "silně", ["slabě", "pomalu", "rychle"], "Forte je dynamická značka pro silnou hru."),
    ]),
    course("fr-jidlo-a-rodina", "Francouzština: jídlo a rodina", "Základní slovní zásoba pro rodinu, jídlo a jednoduché věty.", "FRANCOUZSTINA", "Slovní zásoba", 7, [
      q(1, "Co znamená bonjour?", "dobrý den", ["děkuji", "na shledanou", "prosím"], "Bonjour je běžný pozdrav."),
      q(1, "Jak se francouzsky řekne matka?", "mère", ["père", "frère", "soeur"], "Mère znamená matka."),
      q(2, "Co znamená pain?", "chléb", ["sýr", "mléko", "jablko"], "Pain je francouzsky chléb."),
      q(3, "Je suis étudiant. Který tvar slovesa je správně?", "suis", ["es", "est", "sommes"], "Se zájmenem je používáme suis."),
      q(4, "Jak se řekne děkuji?", "merci", ["salut", "pardon", "soir"], "Merci znamená děkuji."),
    ]),
    course("es-mesto-a-smer", "Španělština: město a směry", "Slovní zásoba pro orientaci ve městě a cestování.", "SPANELSTINA", "Konverzace", 7, [
      q(1, "Co znamená calle?", "ulice", ["náměstí", "škola", "obchod"], "Calle znamená ulice."),
      q(1, "Jak se španělsky řekne vlevo?", "izquierda", ["derecha", "recto", "cerca"], "Izquierda znamená vlevo."),
      q(2, "Co znamená ¿Dónde está el hotel?", "Kde je hotel?", ["Kolik stojí hotel?", "Kdy hotel otevírá?", "Jaký je hotel?"], "Dónde está se používá pro otázku Kde je."),
      q(3, "Jak se španělsky řekne nádraží?", "estación", ["aeropuerto", "puente", "parque"], "Estación znamená nádraží nebo stanice."),
      q(4, "Co znamená a la derecha?", "doprava", ["doleva", "rovně", "daleko"], "A la derecha znamená doprava."),
    ]),
  ],
};
