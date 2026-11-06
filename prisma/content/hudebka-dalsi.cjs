// Hudební výchova pro 6.–9. třídu, další kurzy (doplnění na 10). Řádek otázky: [obtížnost 1-5, otázka, správná, [3 špatné], vysvětlení]
module.exports = {
  subject: "HUDEBKA",
  courses: [
    {
      slug: "hud-lidova-hudba",
      title: "Lidová hudba a písně",
      desc: "Lidové písně, tance a jejich význam v české kultuře.",
      section: "Hudba v životě",
      grade: 6,
      qs: [
        [1,"Co je lidová píseň?","Píseň vzniklá mezi lidem a předávaná ústně",["Píseň složená pro operu","Píseň z rozhlasu","Chorál v kostele"],"Lidové písně se předávají po generace."],
        [1,"Jak se jmenuje tanec z Čech, který tančí dvě páry v kruhu?","Polka",["Valčík","Tango","Menuet"],"Polka je český lidový tanec v rychlém dvoudobém rytmu."],
        [2,"Který tanec je typicky moravský a známý ze Slovácka?","Verbuňk",["Kankán","Mazurka","Čardáš"],"Verbuňk je tanec z jižní Moravy."],
        [2,"Jak se nazývá strunný nástroj tlučený paličkami, typický pro cimbálovou muziku?","Cimbál",["Harfa","Piano","Varhany"],"Cimbál je strunný nástroj tlučený paličkami."],
        [2,"Jaké je hlavní téma většiny lidových písní?","Práce, láska, rok a příroda",["Válka a politika","Jen náboženství","Vesmír"],"Lidové písně odrážejí život venkova."],
        [3,"Co znamená výraz „zpěv a tanec v kroji“?","Lidové vystoupení v tradičním oděvu",["Opera v kostýmech","Balet na ledě","Sborový zpěv v kostele"],"Kroj je tradiční lidový oděv."],
        [3,"Jaký je typický rytmus polky?","Dvoudobý, rychlý",["Tříčtvrťový, pomalý","Synkopický","Bez rytmu"],"Polka má rychlé dvoudobé metrum."],
        [3,"Který skladatel se věnoval sběru lidových písní na Moravě?","Leoš Janáček",["Antonín Dvořák","Bedřich Smetana","Josef Suk"],"Janáček zapisoval moravské lidové písně."],
        [3,"Kdo složil hudbu k písni „Kde domov můj“?","František Škroup",["Bedřich Smetana","Antonín Dvořák","Leoš Janáček"],"Hudbu k Kde domov můj složil František Škroup, text napsal Josef Kajetán Tyl."],
        [4,"Co je to tradiční lidový nástroj dudy?","Dechový nástroj s měchem",["Smyčcový nástroj","Bicí nástroj","Klávesový nástroj"],"Dudy mají vak se vzduchem a píšťalu."],
        [4,"Které české hudební těleso hraje lidovou hudbu?","Cimbálová muzika",["Symfonický orchestr","Jazzový kvartet","Dechový kvintet"],"Cimbálová muzika hraje na cimbál, housle, basy."],
        [4,"Co je to zpěvník?","Kniha se zapsanými písněmi a notami",["Nástroj na doprovod","Druh tance","Taneční kroky"],"Zpěvník obsahuje texty a melodie písní."],
        [4,"Jak se říká písni, která vypráví příběh?","Balada",["Hymnus","Ária","Kantáta"],"Balada je vyprávěcí píseň."],
        [5,"Jak se nazývá rozdíl mezi lidovou a uměleckou hudbou?","Lidová je anonymní a tradiční, umělecká má autora",["Lidová je elektronická","Umělecká je jen instrumentální","Není rozdíl"],"Umělecká hudba má autora a záznam."],
        [5,"Co je to „verbuňk“?","Tanec z jižní Moravy",["Druh opery","Zpěv v chrámu","Typ piana"],"Verbuňk je tanec z jižní Moravy, tančí se v kroji."]
      ]
    },
    {
      slug: "hud-jazz-rock-pop",
      title: "Jazz, rock a pop",
      desc: "Populární hudební styly 20. století a jejich znaky.",
      section: "Hudební styly",
      grade: 8,
      qs: [
        [1,"Který styl vznikl v New Orleans na přelomu 19. a 20. století?","Jazz",["Opera","Gregoriánský chorál","Baroko"],"Jazz vznikl v USA mezi černošskými hudebníky."],
        [1,"Který hudební styl je typický elektrickými kytarami a bicími?","Rock",["Gregoriánský chorál","Madrigal","Menuet"],"Rock využívá zesílené nástroje."],
        [1,"Jak se říká hudbě, která je krátká a srozumitelná pro široké publikum?","Pop",["Opera","Oratorium","Symfonie"],"Pop je zkratka populární hudby."],
        [2,"Co je to improvizace v jazzu?","Spontánní hra během skladby",["Přesně zapsaná část","Hra bez rytmu","Opakování první věty"],"Jazzoví hudebníci improvizují sóla."],
        [2,"Co je to synkopa?","Posun přízvuku na slabou dobu",["Zrychlení tempa","Hra nahlas","Zvýšení výšky tónu"],"Synkopa dává rytmu přízvuk mimo takt."],
        [2,"Který nástroj je typický pro jazz a hraje se dechem?","Saxofon",["Harfa","Cimbál","Varhany"],"Saxofon je dechový nástroj vynalezený Adolphem Saxem."],
        [3,"Jak se nazývá styl vzniklý v jižních státech USA s melancholickou náladou?","Blues",["Polka","Madrigal","Barokní fuga"],"Blues vyjadřuje smutek a naději."],
        [3,"Kdo je znám jako „král rock and rollu“?","Elvis Presley",["Frank Sinatra","Louis Armstrong","Glenn Miller"],"Elvis Presley popularizoval rock and roll v 50. letech."],
        [3,"Který styl se objevil v 60. letech jako reakce na konzumní hudbu a často měl protestní texty?","Folk / protestní píseň",["Opera","Dixieland","Barok"],"Folkové písně komentovaly společnost."],
        [3,"Který nástroj přinesl do rocku zesílení?","Elektrická kytara",["Lesní roh","Cembalo","Kontrabas"],"Elektrická kytara dala rocku hlasitost a zkreslení."],
        [4,"Jak se nazývá tanečně zaměřený jazz z 30. let?","Swing",["Tango","Rumba","Polonéza"],"Swing je tanečně zaměřený jazz."],
        [4,"Které město je často považováno za kolébku moderního jazzu?","New Orleans",["Paříž","Vídeň","Praha"],"New Orleans je rodištěm jazzu."],
        [4,"Jaké je hlavní rozdělení populární hudby?","Podle stylu, rytmu a nástrojů",["Podle barvy kůže","Podle barvy obalu","Podle ceny"],"Styly se liší harmonií, rytmem a nástroji."],
        [5,"Co znamená zkratka „DJ“?","Disk jockey",["Dance junior","Digital jazz","Duo jamming"],"DJ přehrává a mixuje hudbu."],
        [5,"Jak se nazývá elektronický styl vzniklý z disca a techna?","EDM / elektronická taneční hudba",["Gregoriánský chorál","Madrigal","Symfonická báseň"],"EDM zahrnuje techno a house."]
      ]
    },
    {
      slug: "hud-opera-muzikal",
      title: "Opera, opereta a muzikál",
      desc: "Divadelní hudební žánry a jejich hlavní díla.",
      section: "Dějiny hudby",
      grade: 7,
      qs: [
        [1,"Co je opera?","Divadelní představení, kde se zpívá",["Tanec bez hudby","Hra bez zpěvu","Film pro děti"],"Opera spojuje zpěv, orchestr a divadlo."],
        [1,"Jak se nazývá sólová píseň v opeře?","Árie",["Kantáta","Fuga","Motet"],"Árie je sólový zpěv s doprovodem."],
        [2,"Která česká opera je nejznámější od Bedřicha Smetany?","Prodaná nevěsta",["Rusalka","Její pastorkyňa","Carmen"],"Prodaná nevěsta je veselohra."],
        [2,"Která opera Antonína Dvořáka je založena na vodní víle?","Rusalka",["Prodaná nevěsta","Libuše","Otello"],"Rusalka je pohádková opera."],
        [2,"Který skladatel složil operu „Její pastorkyňa“?","Leoš Janáček",["Bedřich Smetana","Antonín Dvořák","Josef Suk"],"Její pastorkyňa je Janáčkova opera."],
        [3,"Jak se nazývá veselý žánr divadla s hudbou, který vznikl v 19. století?","Opereta",["Oratorium","Kantáta","Cantus firmus"],"Opereta má dialogy a populární melodie."],
        [3,"Který skladatel složil operetu „Netopýr“?","Johann Strauss mladší",["Wolfgang Amadeus Mozart","Giuseppe Verdi","Richard Wagner"],"Netopýr je vídeňská operetta."],
        [3,"Co je muzikál?","Divadelní žánr, kde se střídá zpěv a mluvené slovo a tanec",["Hudba bez textu","Opera o zvířatech","Sbor bez doprovodu"],"Muzikál spojuje zpěv, tanec a dialog."],
        [3,"Který muzikál je inspirovaný románem Victora Huga?","Les Misérables",["Hamilton","Cats","Chicago"],"Les Misérables vychází z románu Bídníci."],
        [4,"Co je libreto?","Text opery nebo muzikálu",["Partitura","Dirigentská hůl","Program koncertu"],"Libreto je text, který zpívají pěvci."],
        [4,"Jak se jmenuje hlavní část opery, kde zpívají sbor i sólisté?","Finále",["Předehra","Coda","Preludium"],"Finále bývá závěrečný dějový oddíl."],
        [4,"Kdo je autor opery „Carmen“?","Georges Bizet",["Giuseppe Verdi","Gioachino Rossini","Pyotr Čajkovskij"],"Carmen složil Bizet."],
        [5,"Který italský skladatel je autorem oper „Aida“ a „La traviata“?","Giuseppe Verdi",["Richard Strauss","Claude Debussy","Franz Liszt"],"Verdi je velký italský operní skladatel."],
        [5,"Jak se nazývá hudební žánr, který vznikl z italské opery buffa?","Komická opera",["Oratorium","Requiem","Symfonická báseň"],"Opera buffa je komická opera."]
      ]
    },
    {
      slug: "hud-skladatele-cesti",
      title: "Čeští skladatelé",
      desc: "Smetana, Dvořák, Janáček a další čeští hudební skladatelé.",
      section: "Dějiny hudby",
      grade: 9,
      qs: [
        [1,"Který skladatel složil cyklus symfonických básní „Má vlast“?","Bedřich Smetana",["Antonín Dvořák","Leoš Janáček","Josef Suk"],"Má vlast je Smetanův cyklus."],
        [1,"Která skladba Smetany popisuje řeku Vltavu?","Vltava",["Šárka","Tábor","Bohemia"],"Vltava je druhá část Má vlasti."],
        [2,"Jaká je nejznámější symfonie Antonína Dvořáka?","Z Nového světa (Novosvětská)",["Z Čech","Z Moravy","Z Vídně"],"Novosvětská je 9. symfonie."],
        [2,"Jaké jsou názvy Dvořákových tanců inspirovaných slovanskou hudbou?","Slovanské tance",["Lašské tance","Valašské rozmarné","Tance bez hranic"],"Slovanské tance složil Dvořák."],
        [2,"Který skladatel byl z Hukvaldů a složil „Lašské tance“?","Leoš Janáček",["Bedřich Smetana","Antonín Dvořák","Vítězslav Novák"],"Janáček pocházel z Hukvald."],
        [3,"Jaká je Smetanova nejznámější opera?","Prodaná nevěsta",["Rusalka","Libuše","Jenůfa"],"Prodaná nevěsta je nejhranější česká opera."],
        [3,"Který český skladatel napsal operu „Jenůfa“?","Leoš Janáček",["Antonín Dvořák","Bedřich Smetana","Josef Suk"],"Jenůfa je Janáčkova opera (jiný název Její pastorkyňa)."],
        [3,"Který skladatel byl ředitelem Pražské konzervatoře?","Antonín Dvořák",["Bedřich Smetana","Leoš Janáček","Josef Suk"],"Dvořák byl ředitelem konzervatoře."],
        [3,"Jak se jmenuje Smetanův smyčcový kvartet, který je autobiografický?","Z mého života",["Z Nového světa","Lašské tance","Má vlast"],"Z mého života je Smetanův kvartet."],
        [4,"Který skladatel složil „Requiem“ a byl z Nelahozevsi?","Antonín Dvořák",["Bedřich Smetana","Leoš Janáček","Bohuslav Martinů"],"Dvořák se narodil v Nelahozevsi."],
        [4,"Kterého českého skladatele se připomíná jako autora Rusalky?","Antonín Dvořák",["Bedřich Smetana","Leoš Janáček","Josef Suk"],"Rusalka je Dvořákova opera."],
        [5,"Jaký je název opery Leoše Janáčka o Kátě Kabanové?","Káťa Kabanová",["Rusalka","Libuše","Ostrov"],"Káťa Kabanová je Janáčkova opera."],
        [5,"Který český skladatel složil kantátu „Stabat mater“?","Antonín Dvořák",["Bedřich Smetana","Leoš Janáček","Josef Suk"],"Stabat mater je Dvořákova skladba."]
      ]
    },
    {
      slug: "hud-hudebni-formy",
      title: "Hudební formy: sonáta, rondo a variace",
      desc: "Jak je skladba stavěna: sonáta, rondo, variace a fuga.",
      section: "Hudební teorie",
      grade: 9,
      qs: [
        [2,"Co je to forma skladby?","Způsob, jak jsou části skladby uspořádány",["Počet nástrojů","Tempo skladby","Hlasitost"],"Forma určuje stavbu skladby."],
        [2,"Co je to rondo?","Forma, kde se hlavní téma opakuje mezi epizodami",["Forma bez opakování","Krátká píseň bez textu","Druh tance"],"Rondo má refrén a epizody."],
        [2,"Co je to variace?","Úprava tématu ve více podobách",["Nová melodie bez tématu","Přechod mezi tóny","Typ rytmu"],"Variace mění téma."],
        [3,"Ze kterých hlavních oddílů se skládá sonátová forma?","Expozice, vývoj a repríza",["Dvě části bez vývoje","Pět částí bez reprízy","Jedna část"],"Sonátová forma má tři hlavní oddíly."],
        [3,"Jaká je typická forma prvního věty symfonie?","Sonátová forma",["Rondo","Fuga","Menuet"],"První věta bývá sonátová."],
        [3,"Co je to fuga?","Polyfonní skladba, kde se téma opakuje v různých hlasech",["Tanec v 3/4","Zpěv bez textu","Opera"],"Fuga se rozvíjí imitací."],
        [3,"Co je to menuet?","Tanec ve tříčtvrťovém taktu",["Pochod ve 4/4","Rychlý tanec v 6/8","Pomalá hymnická píseň"],"Menuet je tanec v 3/4."],
        [4,"Jak se nazývá forma, kde se opakují dvě hlavní témata?","Sonátová forma",["Variace","Rondo","Aria"],"Sonátová forma pracuje s dvěma tématy."],
        [4,"Co je to kontrapunkt?","Souběh několika samostatných melodií",["Jeden tón bez doprovodu","Akord z jednoho nástroje","Rytmický doprovod"],"Kontrapunkt je polyfonie."],
        [4,"Jaký je rozdíl mezi homofonií a polyfonií?","Homofonie má melodii s doprovodem, polyfonie více rovnocenných hlasů",["Nic","Homofonie je bez rytmu","Polyfonie je jen pro sbor"],"Homofonie je jeden hlavní hlas."],
        [4,"Kolik dob má takt 3/4?","3",["2","4","6"],"3/4 znamená tři čtvrťové doby."],
        [5,"Jak se nazývá část symfonie ve tvaru tance v rychlém tempu?","Scherzo",["Adagio","Largo","Lento"],"Scherzo je živá tanečně laděná část."],
        [5,"Který skladatel je spojován s fugou?","Johann Sebastian Bach",["Johann Strauss","Antonín Dvořák","Claude Debussy"],"Bach je mistrem fugy."]
      ]
    }
  ]
};
