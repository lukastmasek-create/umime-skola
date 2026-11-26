const course = (slug, title, desc, subject, section, grade, qs) => ({ slug, title, desc, section, grade, subject, qs });
const q = (d, p, c, w, e) => [d, p, c, w, e];

module.exports = {
  subject: "CESTINA",
  courses: [
    course("cj-vyjmenovana-slova", "Vyjmenovaná slova v praxi", "Procvičení i/y po obojetných souhláskách.", "CESTINA", "Pravopis", 5, [
      q(1,"Doplň slovo: b__t (existovat).","být",["bít","biýt","byť"],"Sloveso existovat píšeme být."),
      q(1,"Které slovo patří mezi vyjmenovaná po B?","být",["bytost","bílý","bunda"],"Být je vyjmenované slovo po B."),
      q(2,"Doplň: s__tý oběd.","sytý",["sitý","sítý","sytí"],"Přídavné jméno sytý píšeme s y."),
      q(3,"Které slovo má správný pravopis?","myš",["miš","míš","myšš"],"Myš patří mezi vyjmenovaná slova po M."),
      q(4,"Proč píšeme y ve slově vysoký?","po vyjmenovaném slově vysoko",["protože je na začátku věty","protože jde o jméno","bez pravidla"],"Vysoký souvisí s vyjmenovaným slovem vysoký/vysoko."),
    ]),
    course("lit-roman-a-povidka", "Román a povídka", "Rozdíly mezi základními prozaickými žánry.", "LITERATURA", "Próza", 7, [
      q(1,"Co je próza?","text psaný ve větách a odstavcích",["pouze báseň","hudební skladba","divadelní kulisa"],"Próza není vázaná verši."),
      q(1,"Co je povídka?","kratší prozaický útvar",["dlouhá encyklopedie","báseň","slovník"],"Povídka bývá kratší a má omezený počet postav."),
      q(2,"Co je román?","rozsáhlé prozaické dílo",["jedna věta","krátká hádanka","píseň"],"Román má obvykle delší děj a více postav."),
      q(3,"Kdo vypravuje příběh?","vypravěč",["nakladatel","čtenář vždy","ilustrátor vždy"],"Vypravěč zprostředkovává děj."),
      q(4,"Co je zápletka?","problém, který rozvíjí děj",["jméno knihy","konec tisku","popis obálky"],"Zápletka vytváří napětí a posouvá příběh."),
    ]),
    course("aj-sport-a-volny-cas", "English: Sport and free time", "Slovní zásoba a věty o sportu a volném čase.", "ANGLICTINA", "Slovní zásoba", 6, [
      q(1,"What does swimming mean?","plavání",["běh","lyžování","tanec"],"Swimming znamená plavání."),
      q(1,"I play football on Sundays. Který tvar slovesa je správně?","play",["plays","playing","played"],"Po I v přítomném čase používáme play."),
      q(2,"What is a team?","tým",["stadion","trenér","výhra"],"Team znamená tým."),
      q(3,"Choose the correct sentence.","She likes playing tennis.",["She like playing tennis.","She likes play tennis.","She liking tennis."],"Ve 3. osobě jednotného čísla má like koncovku -s."),
      q(4,"What does win mean?","vyhrát",["prohrát","trénovat","odpočívat"],"Win znamená vyhrát."),
    ]),
    course("nj-rodina-a-domov", "Němčina: rodina a domov", "Slovní zásoba pro rodinu, pokoje a bydlení.", "NEMCINA", "Slovní zásoba", 5, [
      q(1,"Co znamená die Mutter?","matka",["otec","sestra","bratr"],"Die Mutter znamená matka."),
      q(1,"Jak se německy řekne dům?","das Haus",["die Schule","der Tisch","das Buch"],"Das Haus je dům."),
      q(2,"Das ist mein Vater. Které zájmeno je správně?","mein",["meine","meinen","meiner"],"U mužského rodu v tomto spojení použijeme mein."),
      q(3,"Co znamená das Schlafzimmer?","ložnice",["kuchyně","koupelna","obývací pokoj"],"Schlafzimmer je ložnice."),
      q(4,"Jak se zeptáš Kde bydlíš?","Wo wohnst du?",["Wie heißt du?","Was machst du?","Woher kommst du?"],"Wo wohnst du? znamená Kde bydlíš?"),
    ]),
    course("rj-rodina-a-skola", "Ruština: rodina a škola", "Základní slovní zásoba pro rodinu a školní prostředí.", "RUSTINA", "Slovní zásoba", 5, [
      q(1,"Co znamená ruské слово школа?","škola",["rodina","kniha","město"],"Школа znamená škola."),
      q(1,"Jak se rusky řekne matka?","мать",["отец","брат","сестра"],"Мать znamená matka."),
      q(2,"Co znamená учитель?","učitel",["žák","ředitelna","sešit"],"Учитель je učitel."),
      q(3,"Jak se rusky řekne kniha?","книга",["ручка","доска","тетрадь"],"Книга znamená kniha."),
      q(4,"Co znamená моя семья?","moje rodina",["moje škola","můj dům","můj kamarád"],"Моя семья znamená moje rodina."),
    ]),
    course("mat-rovnice", "Základní rovnice", "Jednoduché lineární rovnice a ověřování výsledků.", "MATEMATIKA", "Algebra", 7, [
      q(1,"Kolik je x v rovnici x + 3 = 8?","5",["3","8","11"],"Od obou stran odečteme 3."),
      q(1,"Kolik je x v rovnici x - 4 = 6?","10",["2","4","24"],"K oběma stranám přičteme 4."),
      q(2,"Kolik je x v rovnici 2x = 14?","7",["6","12","28"],"Obě strany vydělíme dvěma."),
      q(3,"Kolik je x v rovnici 3x + 1 = 10?","3",["2","9","11"],"Nejprve odečteme 1 a potom vydělíme 3."),
      q(4,"Co znamená ověřit řešení rovnice?","dosadit výsledek zpět do rovnice",["smazat rovnici","vynásobit vše nulou","změnit znaménka"],"Dosazením zjistíme, zda platí levá i pravá strana."),
    ]),
    course("dej-prvni-svetova-valka", "První světová válka", "Příčiny, průběh a důsledky první světové války.", "DEJEPIS", "20. století", 9, [
      q(1,"Kdy začala první světová válka?","1914",["1918","1939","1905"],"Válka začala v roce 1914."),
      q(1,"Kdy skončila první světová válka?","1918",["1914","1929","1945"],"Válka skončila v roce 1918."),
      q(2,"Co bylo bezprostřední záminkou války?","atentát v Sarajevu",["pád Bastily","objev Ameriky","Velká francouzská revoluce"],"Po atentátu na Františka Ferdinanda d’Este vypukla krize."),
      q(3,"Který vynález byl ve válce významný?","tank",["parní lokomotiva z 18. století","tiskárna","kompas"],"Tanky se staly novou zbraní průmyslové války."),
      q(4,"Jaký byl jeden důsledek války?","rozpad Rakouska-Uherska",["vznik Římské říše","zánik průmyslu všude","objevení Ameriky"],"Po válce vznikly nové státy včetně Československa."),
    ]),
    course("zem-obyvatelstvo-sveta", "Obyvatelstvo světa", "Počet obyvatel, hustota zalidnění, migrace a sídla.", "ZEMEPIS", "Obyvatelstvo", 8, [
      q(1,"Co je hustota zalidnění?","počet obyvatel na jednotku plochy",["počet měst v zemi","rozloha oceánu","počet řek"],"Hustota vyjadřuje, kolik lidí žije na určité ploše."),
      q(1,"Co je migrace?","stěhování obyvatel",["růst teploty","těžba uhlí","vznik hor"],"Migrace je přesun lidí z místa na místo."),
      q(2,"Kde bývá hustota zalidnění vysoká?","v úrodných nížinách",["v ledových pouštích","na vysokých vrcholech","uprostřed oceánu"],"Lidé se často soustřeďují v úrodných a dobře dostupných oblastech."),
      q(3,"Co je městská aglomerace?","souvislé území města a jeho okolí",["samotná vesnice","poušť","národní park"],"Aglomerace propojuje město s okolními sídly."),
      q(4,"Proč lidé migrují?","za prací, bezpečím nebo lepšími podmínkami",["jen kvůli počasí","protože mizí mapy","bez důvodu vždy"],"Migrace má ekonomické, politické i sociální příčiny."),
    ]),
    course("prir-ekosystemy", "Ekosystémy", "Potravní řetězce, producenti, konzumenti a rovnováha v přírodě.", "PRIRODOPIS", "Ekologie", 7, [
      q(1,"Co je ekosystém?","organismy a jejich neživé prostředí",["jen jeden živočich","pouze les","druh horniny"],"Ekosystém tvoří živé organismy i prostředí."),
      q(1,"Kdo je producent?","zelená rostlina vyrábějící organické látky",["masožravý živočich","rozkladač vždy","kámen"],"Rostliny využívají fotosyntézu."),
      q(2,"Kdo je konzument?","organismus, který přijímá potravu",["sluneční paprsek","voda","nerost"],"Konzumenti získávají energii potravou."),
      q(3,"Co je potravní řetězec?","pořadí, ve kterém se organismy požírají",["seznam stromů","mapa lesa","chemický vzorec"],"Řetězec ukazuje tok energie mezi organismy."),
      q(4,"Jakou roli mají rozkladači?","rozkládají odumřelou organickou hmotu",["vyrábějí světlo","zastavují déšť","tvoří horniny z kovu"],"Bakterie a houby vracejí látky do prostředí."),
    ]),
    course("obc-lidska-prava", "Lidská práva", "Základní práva, svobody, rovnost a odpovědnost.", "OBCANKA", "Člověk a společnost", 8, [
      q(1,"Co jsou lidská práva?","základní práva každého člověka",["výhody jen pro vládu","pravidla sportu","druhy daní"],"Lidská práva náleží všem lidem bez rozdílu."),
      q(1,"Co znamená rovnost před zákonem?","zákon platí pro všechny stejně",["zákon platí jen pro dospělé","nikdo nemusí dodržovat zákon","každý má jiný zákon"],"Rovnost chrání před diskriminací."),
      q(2,"Která svoboda chrání možnost vyjádřit názor?","svoboda projevu",["svoboda pohybu pouze","právo na vlastnictví vždy","volební období"],"Svoboda projevu umožňuje vyjadřovat názory v mezích zákona."),
      q(3,"Co je diskriminace?","nerovné zacházení bez oprávněného důvodu",["pomoc slabším","dodržování pravidel","svobodná volba"],"Diskriminace znevýhodňuje člověka kvůli jeho vlastnosti nebo původu."),
      q(4,"Proč mají práva i povinnosti?","svoboda jednoho nesmí poškozovat druhé",["povinnosti neexistují","práva platí jen ve škole","povinnosti ruší zákony"],"Odpovědnost udržuje soužití lidí."),
    ]),
    course("hudba-noty-a-rytmus", "Noty a rytmus", "Základní notová osnova, délky not a rytmické hodnoty.", "HUDEBKA", "Hudební nauka", 4, [
      q(1,"Kolik linek má notová osnova?","pět",["čtyři","šest","deset"],"Notová osnova má pět linek."),
      q(1,"Co určuje délku noty?","její rytmická hodnota",["barva noty","název skladatele","výška pódia"],"Rytmická hodnota určuje trvání tónu."),
      q(2,"Kolik dob trvá celá nota v běžném 4/4 taktu?","čtyři",["jednu","dvě","tři"],"Celá nota vyplní čtyřdobý takt."),
      q(3,"Co je takt?","pravidelně se opakující skupina dob",["druh nástroje","text písně","pauza mezi koncerty"],"Takt organizuje rytmus skladby."),
      q(4,"Co znamená pomlka?","místo, kdy se nezpívá ani nehraje",["nejvyšší tón","zrychlení","opakování slova"],"Pomlka má vlastní rytmickou hodnotu."),
    ]),
    course("fr-pozdravy-a-predstaveni", "Francouzština: pozdravy a představení", "Jednoduché fráze pro pozdrav a představení.", "FRANCOUZSTINA", "Konverzace", 6, [
      q(1,"Co znamená salut?","ahoj",["děkuji","promiňte","dobrou noc"],"Salut je neformální pozdrav."),
      q(1,"Jak se řekne Jak se jmenuješ?","Comment tu t’appelles?",["Où habites-tu?","Quel âge as-tu?","Ça va?"],"Tato otázka se ptá na jméno."),
      q(2,"Co znamená je m’appelle Anna?","jmenuji se Anna",["bydlím v Anně","mám Annu","vidím Annu"],"Je m’appelle uvádí jméno."),
      q(3,"Jak se řekne těší mě?","Enchanté",["Pardon","Bonsoir","Au revoir"],"Enchanté používáme při seznamování."),
      q(4,"Co znamená au revoir?","na shledanou",["dobré ráno","prosím","ano"],"Au revoir je rozloučení."),
    ]),
    course("es-rodina-a-domov", "Španělština: rodina a domov", "Základní slovní zásoba o rodině a bydlení.", "SPANELSTINA", "Slovní zásoba", 6, [
      q(1,"Co znamená madre?","matka",["otec","sestra","bratr"],"Madre znamená matka."),
      q(1,"Jak se španělsky řekne dům?","casa",["escuela","calle","mesa"],"Casa znamená dům."),
      q(2,"Co znamená mi hermano?","můj bratr",["moje sestra","můj otec","moje matka"],"Hermano znamená bratr."),
      q(3,"Jak se řekne pokoj?","habitación",["cocina","puerta","jardín"],"Habitación znamená pokoj."),
      q(4,"Co znamená Vivo en Praga?","Bydlím v Praze.",["Jedu do Prahy.","Vidím Prahu.","Pracuji v Praze."],"Vivo en znamená bydlím v."),
    ]),
  ],
};
