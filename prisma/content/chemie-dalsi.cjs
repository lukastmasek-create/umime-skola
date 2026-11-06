// Chemie pro 8.–9. třídu, další kurzy (doplnění na 10). Řádek otázky: [obtížnost 1-5, otázka, správná, [3 špatné], vysvětlení]
module.exports = {
  subject: "CHEMIE",
  courses: [
    {
      slug: "chem-prvky-slouceniny",
      title: "Prvky a sloučeniny",
      desc: "Rozdíl mezi prvkem a sloučeninou, chemické značky a vzorce.",
      section: "Stavba látek",
      grade: 8,
      qs: [
        [1,"Co je to prvek?","Látka tvořená jedním druhem atomů",["Směs dvou látek","Látka tvořená více druhy atomů","Roztok soli ve vodě"],"Prvek má atomy stejného protonového čísla."],
        [1,"Co je to sloučenina?","Látka tvořená dvěma nebo více prvky chemicky spojenými",["Směs prvků bez chemické vazby","Jediný atom vzácného plynu","Roztok cukru"],"Sloučenina vzniká chemickou reakcí prvků."],
        [2,"Jaká je značka pro kyslík?","O",["K","Ky","Os"],"Kyslík má značku O."],
        [2,"Jaká je značka pro vodík?","H",["V","Vo","Hy"],"Vodík má značku H."],
        [2,"Jaký je vzorec vody?","H2O",["HO2","H2O2","OH3"],"Voda má dva atomy vodíku a jeden kyslíku."],
        [3,"Kolik atomů je v molekule kyseliny sírové H2SO4?","7",["5","6","8"],"2 H + 1 S + 4 O = 7 atomů."],
        [3,"Který z uvedených vzorců patří sloučenině?","NaCl",["O2","N2","Fe"],"NaCl je chlorid sodný, sloučenina dvou prvků."],
        [3,"Který vzorec patří prvku?","Cl2",["CO2","H2O","NaOH"],"Cl2 tvoří dva atomy chloru, jde o prvek."],
        [3,"Co udává indexová číslice ve vzorci (např. H2O)?","Počet atomů daného prvku",["Náboj iontu","Hmotnost molekuly","Skupenství"],"Index udává počet atomů v molekule."],
        [4,"Kolik atomů kyslíku je v molekule CO2?","2",["1","3","4"],"CO2 obsahuje jeden uhlík a dva kyslíky."],
        [4,"Která částice je v jádře atomu?","Proton",["Elektron","Foton","Iont"],"Jádro tvoří protony a neutrony."],
        [4,"Co určuje protonové číslo prvku?","Počet protonů v jádře",["Počet elektronů v obalu","Počet neutronů","Hmotnost atomu v gramech"],"Protonové číslo je výchozí identitou prvku."],
        [4,"Jaký je vzorec chloridu vápenatého?","CaCl2",["CaCl","Ca2Cl","CaCl3"],"Ca2+ potřebuje dva ionty Cl- k vyrovnání náboje."],
        [5,"Kolik elektronů má neutrální atom kyslíku (protonové číslo 8)?","8",["6","10","16"],"Neutrální atom má stejný počet elektronů jako protonů."],
        [5,"Jak se nazývá složení, které ukazuje zastoupení prvků v molekule?","Chemický vzorec",["Rovnice","Stechiometrie tepla","Periodický zákon"],"Vzorec ukazuje druhy a počty atomů."]
      ]
    },
    {
      slug: "chem-vzduch-kyslik",
      title: "Vzduch a kyslík",
      desc: "Složení vzduchu, vlastnosti kyslíku a hoření.",
      section: "Chemie prvků",
      grade: 8,
      qs: [
        [1,"Který plyn je ve vzduchu zastoupen nejvíce?","Dusík",["Kyslík","Oxid uhličitý","Argon"],"Dusík tvoří asi 78 % vzduchu."],
        [1,"Který plyn je ve vzduchu zastoupen přibližně z 21 %?","Kyslík",["Dusík","Vodík","Oxid uhličitý"],"Kyslík tvoří asi pětinu vzduchu."],
        [1,"Který plyn je nutný pro hoření?","Kyslík",["Dusík","Argon","Helium"],"Hoření je reakce s kyslíkem."],
        [2,"Jaký je vzorec kyslíku?","O2",["O","O3","2O"],"Kyslík se v přírodě vyskytuje jako O2 (ozón O3 je jiná forma)."],
        [2,"Jaký plyn vzniká při dýchání a fotosyntéze?","Oxid uhličitý",["Dusík","Vodík","Helium"],"Dýcháním vzniká CO2, fotosyntézou se spotřebovává."],
        [2,"Jak se říká reakci látky s kyslíkem za vzniku tepla a světla?","Hoření",["Tání","Vypařování","Krystalizace"],"Hoření je exotermní reakce s kyslíkem."],
        [3,"Který plyn podporuje hoření?","Kyslík",["Oxid uhličitý","Dusík","Argon"],"Kyslík hoření podporuje, dusík a argon ne."],
        [3,"Který plyn hasí oheň (není hořlavý, těžší než vzduch)?","Oxid uhličitý",["Vodík","Metan","Propan"],"CO2 se používá v hasicích přístrojích."],
        [3,"Jak se nazývá proces, při kterém se kov spojuje s kyslíkem?","Oxidace",["Redukce","Destilace","Filtrace"],"Oxidace je přijetí kyslíku nebo odevzdání elektronů."],
        [3,"Který oxid vzniká při hoření uhlíku v dostatku kyslíku?","CO2",["CO","SO2","NO"],"C + O2 → CO2."],
        [4,"Jaký je produkt hoření vodíku?","Voda",["Oxid uhličitý","Amoniak","Metan"],"2 H2 + O2 → 2 H2O."],
        [4,"Proč se ve vzduchu nepálí dusík?","Je inertní (málo reaktivní)",["Je příliš těžký","Je radioaktivní","Je kapalný"],"Trojná vazba v N2 je velmi pevná."],
        [4,"Co je to oxid?","Sloučenina prvku s kyslíkem",["Sloučenina s dusíkem","Kov ve vodě","Plyn bez vazby"],"Oxidy jsou sloučeniny s O v oxidačním čísle -II."],
        [5,"Jaký je produkt reakce železa s kyslíkem za vlhka?","Rez (oxid železitý)",["Zlato","Hliník","Stříbro"],"Rezivění je koroze železa."],
        [5,"Jaké je oxidační číslo kyslíku ve většině sloučenin?","-II",["+II","0","-I"],"Kyslík ve sloučeninách většinou -II."]
      ]
    },
    {
      slug: "chem-vodik-voda",
      title: "Vodík a voda",
      desc: "Vlastnosti vodíku, vody a jejích roztoků.",
      section: "Chemie prvků",
      grade: 8,
      qs: [
        [1,"Který plyn je nejlehčí?","Vodík",["Helium","Dusík","Kyslík"],"Vodík má nejmenší hustotu."],
        [1,"Jaká je chemická značka vodíku?","H",["V","Vo","Hy"],"H je značka vodíku."],
        [1,"Jaký plyn vzniká reakcí kyseliny se zinkem?","Vodík",["Kyslík","Dusík","Oxid uhličitý"],"Zn + 2 HCl → ZnCl2 + H2."],
        [2,"Jaký je vzorec vody?","H2O",["HO2","H2O2","OH"],"Voda je H2O."],
        [2,"Co vznikne spálením vodíku?","Voda",["Oxid uhličitý","Metan","Amoniak"],"2 H2 + O2 → 2 H2O."],
        [2,"Která vlastnost je typická pro vodu?","Je dobré rozpouštědlo",["Hoří na vzduchu","Je plyn za pokojové teploty","Má nulovou hustotu"],"Voda je univerzální rozpouštědlo."],
        [3,"Při jaké teplotě voda mrzne (za normálního tlaku)?","0 °C",["4 °C","100 °C","-10 °C"],"Bod tuhnutí vody je 0 °C."],
        [3,"Při jaké teplotě voda vře (za normálního tlaku)?","100 °C",["0 °C","50 °C","212 °C"],"Bod varu vody je 100 °C."],
        [3,"Která látka je v kyselém prostředí?","Roztok s pH menším než 7",["Roztok s pH 7","Roztok s pH větším než 7","Destilovaná voda"],"pH pod 7 znamená kyselé prostředí."],
        [3,"Jak se nazývá směs vodíku a kyslíku, která silně reaguje?","Třaskavá směs",["Pivní směs","Destilát","Amalgám"],"Třaskavá směs vybuchuje po zapálení."],
        [4,"Kolik gramů vodíku je v 18 g vody?","2 g",["1 g","16 g","18 g"],"Ve vodě je 2/18 hmotnostně vodík."],
        [4,"Které pH má neutrální voda při 25 °C?","7",["0","1","14"],"Čistá voda má pH 7."],
        [4,"Proč je voda polární látka?","Kyslík přitahuje elektrony silněji než vodík",["Má iontovou vazbu","Je tvořena jen kovy","Je plyn"],"Dipól vzniká nerovnoměrným rozložením elektronů."],
        [5,"Jak se jmenuje sůl vzniklá reakcí kyseliny chlorovodíkové s hydroxidem sodným?","Chlorid sodný",["Síran sodný","Uhličitan sodný","Dusičnan sodný"],"HCl + NaOH → NaCl + H2O."],
        [5,"Jaké produkty vzniknou při elektrolýze vody?","Vodík a kyslík",["Oxid uhličitý a vodík","Kyslík a dusík","Chlor a vodík"],"2 H2O → 2 H2 + O2 (elektrolýza)."]
      ]
    },
    {
      slug: "chem-kovy-koroze",
      title: "Kovy a koroze",
      desc: "Vlastnosti kovů, slitiny a rezivění.",
      section: "Kovy",
      grade: 9,
      qs: [
        [1,"Který kov je nejlepší vodič elektřiny?","Stříbro",["Železo","Hliník","Olovo"],"Stříbro má nejvyšší elektrickou vodivost."],
        [1,"Který kov je lehký a používá se na plechovky?","Hliník",["Olovo","Zlato","Měď"],"Hliník je lehký a odolný proti korozi."],
        [1,"Jak se nazývá směs kovů?","Slitina",["Sloučenina","Krystal","Oxid"],"Např. ocel je slitina železa a uhlíku."],
        [2,"Jaká je hlavní složka oceli?","Železo",["Měď","Zlato","Hliník"],"Ocel je slitina železa s uhlíkem."],
        [2,"Jak se nazývá rezivění železa?","Koroze",["Destilace","Sublimace","Krystalizace"],"Koroze je chemické narušení kovu prostředím."],
        [2,"Co je nutné ke korozi železa?","Vlhkost a kyslík",["Jen teplo","Jen světlo","Jen sůl"],"Rez vzniká působením vody a kyslíku."],
        [3,"Proč se hliník nerozkládá na vzduchu?","Na povrchu vzniká ochranná vrstva oxidu",["Je ušlechtilý kov","Je pokryt zlatem","Neobsahuje kyslík"],"Oxidová vrstva chrání kov před dalším působením."],
        [3,"Který kov je ušlechtilý a nekoroduje?","Zlato",["Železo","Zinek","Hořčík"],"Zlato je ušlechtilý kov."],
        [3,"Jak se chrání ocel proti korozi?","Pozinkováním",["Ohřátím","Zalitím vodou","Vystavením světlu"],"Zinek chrání železo před rezivěním."],
        [3,"Který kov reaguje s kyselinou chlorovodíkovou za vzniku vodíku?","Zinek",["Zlato","Stříbro","Platina"],"Zn + 2 HCl → ZnCl2 + H2."],
        [4,"Co je to ušlechtilý kov?","Kov málo reaktivní",["Kov s vysokou teplotou tání","Kov s nízkou hustotou","Kov bez elektronů"],"Ušlechtilé kovy se obtížně oxidují."],
        [4,"Jaká je hlavní složka bronzu?","Měď a cín",["Železo a uhlík","Zlato a stříbro","Hliník a hořčík"],"Bronz je slitina mědi a cínu."],
        [4,"Která vlastnost je typická pro kovy?","Kujnost a tažnost",["Křehkost","Nízká vodivost","Plynné skupenství"],"Kovy se dají tvarovat."],
        [5,"Který kov je nejreaktivnější mezi uvedenými: Cu, Fe, Mg?","Hořčík (Mg)",["Měď (Cu)","Železo (Fe)","Všechny stejně"],"Hořčík je reaktivnější než železo a měď."],
        [5,"Jak se nazývá vrstva oxidu vznikající na hliníku?","Pasivační vrstva",["Galvanická vrstva","Emailová vrstva","Krystalová mřížka"],"Oxidová vrstva chrání hliník před korozí."]
      ]
    },
    {
      slug: "chem-sacharidy-tuky-bilkoviny",
      title: "Sacharidy, tuky a bílkoviny",
      desc: "Základní živiny: sacharidy, tuky a bílkoviny.",
      section: "Organická chemie",
      grade: 9,
      qs: [
        [1,"Která živina je hlavním zdrojem energie?","Sacharidy",["Vitamíny","Voda","Minerály"],"Sacharidy jsou hlavní zdroj energie."],
        [1,"Z čeho jsou tvořeny bílkoviny?","Z aminokyselin",["Z cukrů","Z tuků","Z vody"],"Bílkoviny jsou polypeptidy."],
        [1,"Který sacharid je cukr hroznový (glukóza)?","C6H12O6",["C12H22O11","(C6H10O5)n","C2H5OH"],"Glukóza má sumární vzorec C6H12O6."],
        [2,"Jaký sacharid je polysacharid zásobní látky v rostlinách?","Škrob",["Glukóza","Sacharóza","Fruktóza"],"Škrob je zásobní polysacharid."],
        [2,"Jaký je hlavní stavební prvek tuků?","Glycerol a mastné kyseliny",["Aminokyseliny","Glukóza a voda","Dusík a fosfor"],"Tuky jsou estery glycerolu."],
        [2,"Z čeho jsou tvořeny sacharidy hlavně?","Uhlík, vodík a kyslík",["Dusík a síra","Sodík a chlor","Železo a měď"],"Sacharidy mají vzorec Cn(H2O)m."],
        [3,"Který sacharid je disacharid?","Sacharóza",["Glukóza","Škrob","Celulóza"],"Sacharóza se skládá ze dvou monosacharidů."],
        [3,"Co je celulóza?","Polysacharid tvořící buněčné stěny rostlin",["Tuk v mléce","Bílkovina krve","Vitamin"],"Celulóza je stavební látka rostlinných buněk."],
        [3,"Co vzniká hydrolýzou bílkovin?","Aminokyseliny",["Glukóza","Mastné kyseliny","Glycerol"],"Hydrolýza rozkládá bílkoviny na aminokyseliny."],
        [3,"Jak se nazývá vazba mezi aminokyselinami v bílkovině?","Peptidová",["Iontová","Kovová","Vodíková"],"Peptidová vazba spojuje aminokyseliny."],
        [4,"Které tuky jsou nasycené?","Tuky bez dvojných vazeb v řetězci",["Tuky s dvojnými vazbami","Oleje rostlinné","Tuky z ryb"],"Nasycené mastné kyseliny mají jen jednoduché vazby."],
        [4,"Jak se nazývá reakce tuku s hydroxidem sodným?","Zmýdelnění",["Esterifikace","Hydrogenace","Polymerace"],"Zmýdelněním vzniká mýdlo a glycerol."],
        [4,"Který prvek je v bílkovinách navíc oproti sacharidům?","Dusík",["Uhlík","Kyslík","Vodík"],"Bílkoviny obsahují dusík."],
        [5,"Jaký je sumární vzorec škrobu (monomer glukóza)?","(C6H10O5)n",["C6H12O6","C12H22O11","C2H6O"],"Škrob je polymer glukózy."],
        [5,"Co je podstatou enzymů z hlediska chemické povahy?","Bílkoviny",["Tuky","Sacharidy","Minerály"],"Enzymy jsou bílkovinné katalyzátory."]
      ]
    }
  ]
};
