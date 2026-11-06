// Občanská výchova pro 6.–9. třídu, další kurzy (doplnění na 10). Řádek otázky: [obtížnost 1-5, otázka, správná, [3 špatné], vysvětlení]
module.exports = {
  subject: "OBCANKA",
  courses: [
    {
      slug: "obc-rodina-vztahy",
      title: "Rodina a mezilidské vztahy",
      desc: "Role v rodině, respekt, pomoc druhým a řešení konfliktů.",
      section: "Člověk a společnost",
      grade: 6,
      qs: [
        [1,"Co je základní buňkou společnosti?","Rodina",["Stát","Obec","Škola"],"Rodina je první společenské prostředí člověka."],
        [1,"Co znamená slovo respekt?","Uznání a úcta k druhému",["Strach z druhých","Lhostejnost","Soutěživost"],"Respekt znamená ohleduplnost a úctu."],
        [2,"Jak se řeší konflikt v rodině nebo mezi přáteli?","Rozhovorem a vzájemným naslouchání",["Křikem a urážkami","Mlčením bez řešení","Ignorováním problému"],"Dialog pomáhá najít dohodu."],
        [2,"Která povinnost patří dítěti v rodině?","Pomáhat s domácími pracemi",["Rozhodovat o rodinném rozpočtu","Nosit na rodiče hněv","Nechodit do školy"],"Děti přispívají podle svého věku."],
        [2,"Co je to tolerance?","Přijímání odlišností druhých lidí",["Souhlas se vším","Lhostejnost k problémům","Stálé přesvědčování druhých"],"Tolerance znamená respektovat jiné názory."],
        [3,"Co je to empatie?","Schopnost vcítit se do pocitů druhého",["Schopnost zvítězit v hádce","Lhostejnost","Vynucování pravidel"],"Empatie pomáhá porozumět druhým."],
        [3,"Jak se správně chovat ke spolužákovi, který je v nouzi?","Nabídnout pomoc",["Vysmát se mu","Nechat ho být","Nahlásit ho učiteli za každou chybu"],"Solidarita a pomoc patří k dobrým vztahům."],
        [3,"Co je to šikana?","Opakované záměrné ubližování jedince nebo skupiny",["Jednorázová hádka","Soutěž ve třídě","Vtip mezi kamarády"],"Šikana je opakované a úmyslné ubližování."],
        [3,"Na koho se obrátit, když se stane šikana?","Na důvěryhodného dospělého, třeba učitele nebo rodiče",["Na nikoho","Na samotného agresora","Na internet"],"Pomoc dospělých je důležitá."],
        [4,"Co patří k zdravému vztahu mezi dětmi a rodiči?","Vzájemná důvěra a komunikace",["Trvalé příkazy bez vysvětlení","Strach z trestu","Zákaz rozhovorů"],"Zdravý vztah stojí na důvěře."],
        [4,"Co je to rodinný rozpočet?","Plán příjmů a výdajů rodiny",["Seznam členů rodiny","Pravidla domácnosti","Rodokmen"],"Rozpočet pomáhá hospodařit."],
        [4,"Co je to asertivní chování?","Vyjádřit svůj názor slušně a respektovat druhé",["Křičet na druhé","Nic neříkat","Vždy ustoupit"],"Asertivita je prostřední cesta."],
        [5,"Které právo má každé dítě podle Úmluvy o právech dítěte?","Právo na ochranu a vzdělání",["Právo řídit auto","Právo volit","Právo na hypotéku"],"Úmluva o právech dítěte chrání děti."],
        [5,"Co je to vrstevnický tlak?","Tlak skupiny vrstevníků na chování jednotlivce",["Nátlak rodičů na školní výsledky","Soutěž v kroužku","Osobní rozhodnutí"],"Vrstevníci mohou ovlivnit chování."]
      ]
    },
    {
      slug: "obc-obec-samosprava",
      title: "Obec, kraj a samospráva",
      desc: "Jak fungují obce a kraje a kdo je řídí.",
      section: "Samospráva",
      grade: 7,
      qs: [
        [1,"Co je to obec?","Základní územní samosprávný celek",["Stát v malém","Krajské město","Církevní farnost"],"Obec je nejmenší samosprávný celek."],
        [1,"Kdo řídí obec mezi volbami?","Zastupitelstvo obce a starosta",["Prezident","Vláda","Senát"],"Zastupitelstvo a starosta řídí obec."],
        [2,"Kdo volí zastupitelstvo obce?","Občané obce ve volbách",["Prezident republiky","Premiér","Ministerstvo vnitra"],"Zastupitelé se volí přímo občany."],
        [2,"Co je obecní úřad?","Úřad pro správu obce",["Soud","Policejní stanice","Velvyslanectví"],"Úřad vyřizuje záležitosti obce."],
        [2,"Co je hlavní úkol obce?","Pečovat o potřeby svých občanů",["Vydávat zákony","Vést válku","Řídit zahraniční politiku"],"Obec zajišťuje služby pro občany."],
        [3,"Co je to kraj v České republice?","Vyšší územní samosprávný celek",["Obec s více domy","Církevní oblast","Jen zeměpisný pojem"],"Kraj je vyšší samosprávný celek."],
        [3,"Kdo je volený zástupce v čele kraje?","Hejtman",["Starosta","Primátor","Velvyslanec"],"Hejtman stojí v čele kraje."],
        [3,"Co je to samospráva?","Vlastní správa věcí veřejných místní komunitou",["Vláda cizího státu","Správa jen státním úřadem","Vojenská organizace"],"Samospráva je vlastní řízení obce nebo kraje."],
        [3,"Který orgán schvaluje rozpočet obce?","Zastupitelstvo obce",["Senát","Ústavní soud","Vláda ČR"],"Rozpočet schvaluje zastupitelstvo."],
        [4,"Jaký je rozdíl mezi státní správou a samosprávou?","Státní správa vykonává úkoly státu, samospráva řeší záležitosti obce nebo kraje",["Nemá žádný rozdíl","Samospráva řeší zahraničí","Státní správa řeší jen školy"],"Obě úrovně mají jiné pravomoci."],
        [4,"Co je místní referendum?","Hlasování obyvatel obce o místní záležitosti",["Volba prezidenta","Schůze parlamentu","Soudní jednání"],"Referendum se koná na místní úrovni."],
        [4,"Co je to městská část?","Část velkého města s vlastní samosprávou",["Park v centru","Dopravní uzel","Obchodní centrum"],"Velká města mají městské části."],
        [5,"Kdo může podávat návrhy zastupitelstvu obce?","Zastupitelé a obyvatelé obce",["Pouze cizí státy","Jen soudci","Nikdo"],"Obyvatelé mohou uplatňovat své podněty."],
        [5,"Jaký je rozdíl mezi obcí a městem?","Město může mít statut podle velikosti a funkce",["Nic","Město nemá zastupitelstvo","Obec nemá starostu"],"Statut města je dán zákonem."]
      ]
    },
    {
      slug: "obc-ustava-cr",
      title: "Ústava a Listina základních práv",
      desc: "Ústava České republiky, Listina práv a svobod a orgány státu.",
      section: "Stát a politika",
      grade: 8,
      qs: [
        [1,"Co je ústava?","Nejvyšší zákon státu",["Běžný zákon o daních","Vyhláška města","Učebnice dějepisu"],"Ústava je nejvyšší právní norma."],
        [1,"Jak se jmenuje dokument, který zaručuje základní práva a svobody v ČR?","Listina základních práv a svobod",["Občanský zákoník","Živnostenský zákon","Zákoník práce"],"Listina je součástí ústavního pořádku."],
        [2,"Kolik komor má Parlament České republiky?","Dvě",["Jednu","Tři","Čtyři"],"Parlament tvoří Poslanecká sněmovna a Senát."],
        [2,"Jak se jmenují dvě komory Parlamentu ČR?","Poslanecká sněmovna a Senát",["Rada a Komise","Vláda a Soud","Krajská a obecní rada"],"Obě komory tvoří Parlament."],
        [2,"Kdo je hlavou státu v ČR?","Prezident republiky",["Premiér","Předseda Senátu","Hejtman"],"Prezident reprezentuje stát."],
        [3,"Který orgán rozhoduje o souladu zákonů s ústavou?","Ústavní soud",["Nejvyšší soud","Městský soud","Ministerstvo spravedlnosti"],"Ústavní soud chrání ústavnost."],
        [3,"Kdo předkládá návrh zákona v ČR?","Například poslanci, Senát nebo vláda",["Pouze prezident","Pouze učitelé","Nikdo"],"Zákonodárná iniciativa je rozdělena."],
        [3,"Co zaručuje svoboda projevu?","Právo vyjadřovat své názory",["Povinnost mlčet","Zákaz kritiky vlády","Právo vlastnit zbraně"],"Svoboda projevu je základní právo."],
        [3,"Co je to rovnost před zákonem?","Všichni jsou před zákonem stejní",["Všichni mají stejný plat","Všichni musí mít stejný názor","Všichni jsou úředníci"],"Rovnost před zákonem je základní zásada."],
        [4,"Kolik let je funkční období poslance Poslanecké sněmovny?","4 roky",["2 roky","6 let","5 let"],"Volební období je čtyřleté."],
        [4,"Jak dlouho je funkční období senátora?","6 let",["4 roky","2 roky","10 let"],"Senátoři jsou voleni na šest let."],
        [4,"Jak je volen prezident republiky?","Přímou volbou občany",["Poslanci","Vládou","Soudci"],"Od roku 2013 volí prezidenta občané přímo."],
        [5,"Jaký je název české ústavy přijaté v roce 1992?","Ústava České republiky",["Zákon o státní moci","Kodex občanského práva","Charta obcí"],"Ústava ČR vznikla v roce 1992."],
        [5,"Co znamená zásada dělby moci?","Oddělení zákonodárné, výkonné a soudní moci",["Sloučení moci v jedné osobě","Moc pouze v rukou prezidenta","Moc pouze v rukou soudů"],"Trojí dělba moci brání zneužití."]
      ]
    },
    {
      slug: "obc-media-informace",
      title: "Média a ověřování informací",
      desc: "Typy médií, dezinformace a jak si ověřit zprávu.",
      section: "Svět kolem nás",
      grade: 9,
      qs: [
        [1,"Co jsou média?","Prostředky, které šíří informace veřejnosti",["Jen televize","Jen kniha","Jen rozhlas"],"Média zahrnují tisk, rozhlas, televizi a internet."],
        [1,"Co je to dezinformace?","Záměrně nepravdivá informace",["Omyl bez úmyslu","Pravdivá zpráva","Názor autora"],"Dezinformace se šíří záměrně."],
        [2,"Jak se nazývá veřejnoprávní média v ČR?","Česká televize a Český rozhlas",["Seznam.cz a Google","Facebook a Instagram","Komerční stanice"],"Veřejnoprávní média spravuje stát v zákonném rámci."],
        [2,"Co je to zpravodajství?","Předávání aktuálních zpráv",["Umělecký film","Reklama","Hudební klip"],"Zpravodajství informuje o dění."],
        [2,"Co je to reklama?","Placená prezentace produktu nebo služby",["Pravdivý zpravodajský článek","Vědecký výzkum","Úřední sdělení"],"Reklama je placená."],
        [3,"Jak ověřit zprávu z internetu?","Porovnat ji s více nezávislými zdroji",["Věřit prvnímu článku","Sdílet ji hned","Ověřit jen podle titulku"],"Více zdrojů snižuje riziko omylu."],
        [3,"Co je to „fake news“?","Falešné zprávy vydávané za pravdivé",["Vtipné video","Vědecký článek","Oficiální vyhláška"],"Fake news jsou záměrně klamavé."],
        [3,"Který údaj u článku je důležitý pro ověření?","Autor a datum publikace",["Barva pozadí","Počet obrázků","Velikost písma"],"Autor a datum pomáhají ověřit kontext."],
        [3,"Co je to algoritmus na sociálních sítích?","Pravidla, která určují, co uživatel uvidí",["Typ počítačové hry","Právní předpis","Druh reklamy na billboardu"],"Algoritmus řadí obsah podle zájmů."],
        [4,"Co je to zpravodajská bublina?","Prostředí, kde člověk vidí jen názory podobné jeho vlastním",["Druh mýdlové bubliny","Výzkumný projekt","Reklamní kampaň"],"Filtrační bubliny omezují pohled na svět."],
        [4,"Co znamená pojem mediální gramotnost?","Schopnost kriticky vyhodnocovat zprávy",["Umění psát romány","Ovládání kamery","Znalost jazyků"],"Mediální gramotnost chrání před manipulací."],
        [4,"Co je to svoboda tisku?","Právo médií informovat bez cenzury",["Povinnost psát pochvalně","Zákaz kritiky","Zákaz internetu"],"Svoboda tisku je součástí svobody projevu."],
        [5,"Jaký je úkol redakce v procesu ověřování?","Kontrolovat fakta před zveřejněním",["Psát reklamy","Vydávat knihy","Stavět web"],"Redakce ručí za pravdivost."],
        [5,"Který nástroj pomáhá ověřit původ obrázku?","Zpětné vyhledávání obrázků",["Kalkulačka","Mapa","Diář"],"Zpětné vyhledávání ukáže původ."]
      ]
    },
    {
      slug: "obc-spotrebitel-trh",
      title: "Spotřebitel a trh",
      desc: "Práva spotřebitele, reklamace, nabídka a poptávka.",
      section: "Ekonomika",
      grade: 9,
      qs: [
        [1,"Kdo je spotřebitel?","Člověk, který kupuje zboží nebo služby pro vlastní potřebu",["Výrobce","Obchodník","Stát"],"Spotřebitel nakupuje pro osobní potřebu."],
        [1,"Co je to trh?","Místo, kde se setkává nabídka a poptávka",["Obchodní zákon","Druh peněz","Typ banky"],"Trh je místo směny zboží."],
        [2,"Co je to reklamace?","Uplatnění práva na opravu nebo výměnu vadného zboží",["Nákup zboží v akci","Vrácení daní","Rozhodnutí soudu"],"Reklamace je uplatnění vady."],
        [2,"Jak dlouho trvá obvykle zákonná záruka na spotřební zboží?","24 měsíců",["6 měsíců","1 měsíc","10 let"],"Záruka je 24 měsíců."],
        [2,"Co znamená nabídka na trhu?","Množství zboží, které prodávající chce prodat",["Počet kupujících","Cena nájmu","Výdaje státu"],"Nabídka je to, co výrobci nabízejí."],
        [3,"Co je to poptávka?","Množství zboží, které kupující chtějí koupit",["Počet prodejců","Zisk firmy","Daň z příjmu"],"Poptávka je přání kupujících."],
        [3,"Jak ovlivní vyšší poptávka cenu při stejné nabídce?","Cena vzroste",["Cena klesne","Cena zůstane stejná","Trh zanikne"],"Vyšší poptávka tlačí cenu nahoru."],
        [3,"Co je to reklamační lhůta?","Čas, během kterého lze reklamovat vadu",["Doba dodání zboží","Čas placení daní","Lhůta pro soud"],"Lhůta chrání spotřebitele."],
        [3,"Co je to inflace?","Trvalý růst cenové hladiny",["Pokles cen","Stabilní cena","Růst mezd bez cen"],"Inflace snižuje kupní sílu."],
        [4,"Jak lze odstoupit od smlouvy uzavřené na dálku?","Do 14 dnů od převzetí zboží",["Do 2 dnů","Do 3 měsíců","Nelze odstoupit"],"Zákon dává spotřebiteli 14 dnů."],
        [4,"Co je to kupní smlouva?","Smlouva o prodeji zboží za peníze",["Smlouva o nájmu bytu","Úvěrová smlouva","Pracovní smlouva"],"Kupní smlouva řeší prodej zboží."],
        [4,"Které zboží je nejvíce chráněno jako vadné?","Zboží, které neodpovídá popisu",["Zboží zakoupené v akci","Zboží slevněné","Zboží v zahraničí"],"Vada je rozpor s popisem nebo smlouvou."],
        [5,"Co je to spotřebitelské úvěrování?","Půjčka na nákup zboží nebo služby",["Dar od státu","Pojištění auta","Daňová sleva"],"Úvěr se splácí s úroky."],
        [5,"Který orgán chrání spotřebitele v ČR?","Česká obchodní inspekce",["Česká národní banka","Ministerstvo zahraničí","Nejvyšší kontrolní úřad"],"ČOI dohlíží na trh."]
      ]
    }
  ]
};
