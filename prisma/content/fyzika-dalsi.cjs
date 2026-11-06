// Fyzika pro 6.–9. třídu, další kurzy (doplnění na 10). Řádek otázky: [obtížnost 1-5, otázka, správná, [3 špatné], vysvětlení]
module.exports = {
  subject: "FYZIKA",
  courses: [
    {
      slug: "fyz-hustota-latek",
      title: "Hustota látek",
      desc: "Co je hustota, jak se počítá a proč některé látky plují.",
      section: "Látky a jejich vlastnosti",
      grade: 6,
      qs: [
        [1,"Co udává hustota látky?","Hmotnost na jednotku objemu",["Objem na jednotku hmotnosti","Teplotu látky","Tlak v látce"],"Hustota ρ = m / V."],
        [1,"Jaká je jednotka hustoty v soustavě SI?","kg/m³",["m/s","N","J"],"Základní jednotka hustoty je kilogram na metr krychlový."],
        [2,"Jaký je vzorec pro hustotu?","ρ = m / V",["ρ = m · V","ρ = V / m","ρ = m + V"],"Hustota se získá dělením hmotnosti objemem."],
        [2,"Jaká je hustota vody přibližně?","1000 kg/m³ (1 g/cm³)",["100 kg/m³","10 kg/m³","10000 kg/m³"],"Voda má hustotu 1 g/cm³."],
        [2,"Proč plove dřevo na vodě?","Má menší hustotu než voda",["Je lehčí než vzduch","Má větší hustotu než voda","Je tvrdší"],"Předměty s menší hustotou než voda plují."],
        [3,"Jakou hmotnost má 2 m³ vody (ρ = 1000 kg/m³)?","2000 kg",["200 kg","20 kg","2 kg"],"m = ρ · V = 1000 · 2."],
        [3,"Který materiál má největší hustotu z uvedených?","Železo",["Dřevo","Led","Hliník"],"Železo je těžší než hliník a dřevo."],
        [3,"Proč led plove na vodě?","Je méně hustý než kapalná voda",["Je těžší","Je tepelně izolovaný","Má menší objem"],"Led má hustotu přibližně 0,92 g/cm³."],
        [3,"Jak se vypočítá objem kostky o hraně 2 cm?","8 cm³",["4 cm³","6 cm³","2 cm³"],"V = a³ = 2³ = 8."],
        [4,"Tělo o hmotnosti 50 g má objem 20 cm³. Jaká je jeho hustota?","2,5 g/cm³",["0,4 g/cm³","1000 g/cm³","50 g/cm³"],"ρ = m / V = 50 / 20 = 2,5."],
        [4,"Jaký je objem tělesa o hmotnosti 270 g z hliníku (ρ = 2,7 g/cm³)?","100 cm³",["10 cm³","270 cm³","2,7 cm³"],"V = m / ρ = 270 / 2,7 = 100."],
        [4,"Jak se mění hustota vzduchu s rostoucí teplotou?","Klesá",["Roste","Nemění se","Roste jen v zimě"],"Teplý vzduch je řidší."],
        [5,"Kolik gramů váží 1 litr vody?","1000 g",["100 g","10 g","1 g"],"1 l = 1 dm³ = 1000 cm³, hustota 1 g/cm³."],
        [5,"Co se stane s tělesem o hustotě větší než hustota kapaliny?","Klesne ke dnu",["Vyplave","Zůstane ve vzduchu","Odpaří se"],"Těleso tone, když je hustší než kapalina."]
      ]
    },
    {
      slug: "fyz-magnetismus",
      title: "Magnety a magnetické pole",
      desc: "Póly magnetu, magnetické pole a Země jako magnet.",
      section: "Magnetismus",
      grade: 9,
      qs: [
        [1,"Který materiál se přitahuje k magnetu?","Železo",["Dřevo","Plast","Sklo"],"Feromagnetické materiály se magnetem přitahují."],
        [1,"Kolik pólů má magnet?","Dva (severní a jižní)",["Jeden","Tři","Čtyři"],"Každý magnet má dva póly."],
        [2,"Co se stane, když přiblížíme dva severní póly k sobě?","Odpudí se",["Přitáhnou se","Nic se nestane","Zničí se"],"Stejné póly se odpuzují."],
        [2,"Co se stane, když přiblížíme severní a jižní pól?","Přitáhnou se",["Odpudí se","Nic se nestane","Vzniknou dva severní póly"],"Různé póly se přitahují."],
        [2,"Jak se nazývá oblast kolem magnetu, kde působí magnetická síla?","Magnetické pole",["Elektrické pole","Gravitační pole","Tepelné pole"],"Magnetické pole je prostor působení magnetu."],
        [3,"Jak se nazývají čáry, které znázorňují magnetické pole?","Indukční čáry (siločáry)",["Vodorovné čáry","Izotermy","Rychlostní čáry"],"Siločáry ukazují směr pole."],
        [3,"Kam směřuje severní pól střelky kompasu?","K severnímu zemskému pólu",["K jižnímu zemskému pólu","K východu","K západu"],"Severní pól střelky ukazuje k severu."],
        [3,"Proč kompas ukazuje na sever?","Země je velký magnet",["Kompas je poháněn větrem","Sever je nejteplejší","Působí na něj Měsíc"],"Zemské magnetické pole působí na střelku."],
        [3,"Jak se nazývá magnet, který si ponechá magnetismus i po odstranění vnějšího pole?","Trvalý magnet",["Dočasný magnet","Elektromagnet","Neutron"],"Trvalé magnety se nazývají permanentní."],
        [4,"Jak lze zvýšit sílu elektromagnetu?","Zvětšit počet závitů nebo proud",["Snížit proud","Odstranit jádro","Ochladit cívku na 0 K"],"Počet závitů a proud určují sílu."],
        [4,"Co je to elektromagnet?","Cívka s proudem a železným jádrem",["Magnet z plastu","Baterie","Rezistor"],"Elektromagnet funguje díky proudu."],
        [4,"Kam směřují siločáry uvnitř tyčového magnetu?","Od jižního k severnímu pólu",["Od severního k jižnímu","Nikam","Kolmo k magnetu"],"Uvnitř magnetu jdou siločáry od S k N."],
        [5,"Který jev vzniká, když vodič s proudem přiblížíme k magnetce?","Magnetka se vychýlí",["Magnetka se zahřeje","Magnetka se rozpadne","Nic se nestane"],"Vodič s proudem vytváří magnetické pole."],
        [5,"Co je to elektromagnetická indukce?","Vznik napětí změnou magnetického pole",["Vznik světla","Ohřev vody","Pohyb plynu"],"Změna magnetického toku vyvolá napětí."]
      ]
    },
    {
      slug: "fyz-prace-vykon",
      title: "Práce a výkon",
      desc: "Mechanická práce, výkon a jednotky energie.",
      section: "Energie",
      grade: 9,
      qs: [
        [1,"Co je to mechanická práce?","Síla působící po dráze",["Rychlost tělesa","Hmotnost tělesa","Čas, který uplyne"],"Práce vzniká při působení síly na dráze."],
        [1,"Jaká je jednotka práce?","Joule (J)",["Newton (N)","Watt (W)","Pascal (Pa)"],"Práce se udává v joulech."],
        [2,"Jaký je vzorec pro práci?","W = F · s",["W = F / s","W = m · v","W = F · t"],"Práce je součin síly a dráhy."],
        [2,"Jaká je jednotka výkonu?","Watt (W)",["Joule (J)","Newton (N)","Pascal (Pa)"],"Výkon se udává ve wattech."],
        [2,"Jaký je vzorec pro výkon?","P = W / t",["P = W · t","P = F · t","P = m / t"],"Výkon je práce za čas."],
        [3,"Kolik joulů práce vykoná síla 10 N na dráze 5 m?","50 J",["2 J","15 J","500 J"],"W = F · s = 10 · 5."],
        [3,"Jak velký výkon má těleso, které vykoná práci 100 J za 2 s?","50 W",["200 W","0,02 W","102 W"],"P = W / t = 100 / 2."],
        [3,"Co je to 1 kilowatthodina (kWh) v jednotkách energie?","3,6 MJ",["1 kJ","1 MJ","36 kJ"],"1 kWh = 1000 W · 3600 s = 3,6 MJ."],
        [3,"Kdy vykoná síla nulovou práci?","Když je kolmá na směr pohybu",["Když je rovnoběžná s pohybem","Když těleso stojí na místě a síla je kolmá","Vždy"],"Kolmá složka síly nekoná práci (jen pokud se těleso nepohybuje po směru síly)."],
        [4,"Jaká práce se vykoná při zvednutí tělesa o hmotnosti 2 kg do výšky 3 m (g = 10 m/s²)?","60 J",["6 J","20 J","600 J"],"W = m · g · h = 2 · 10 · 3."],
        [4,"Jak velká je potenciální energie tělesa o hmotnosti 1 kg ve výšce 10 m (g = 10 m/s²)?","100 J",["10 J","1 J","1000 J"],"E_p = m · g · h = 1 · 10 · 10."],
        [4,"Co je to účinnost stroje?","Poměr užitečné práce k dodané práci",["Rychlost stroje","Hmotnost stroje","Počet kol stroje"],"Účinnost je vždy menší než 100 %."],
        [5,"Jaký výkon má motor, který vykoná 3600 J za 1 hodinu?","1 W",["3600 W","60 W","1 kW"],"P = 3600 J / 3600 s = 1 W."],
        [5,"Které zařízení má obvykle větší výkon?","Elektrický vařič než žárovka",["Žárovka než vařič","Oba stejný","Nelze porovnat"],"Vařič má výkon typicky kilowatty, žárovka desítky wattů."]
      ]
    },
    {
      slug: "fyz-jednotky-mereni",
      title: "Jednotky a měření",
      desc: "Soustava SI, délka, hmotnost, čas a převody jednotek.",
      section: "Měření",
      grade: 6,
      qs: [
        [1,"Jaká je základní jednotka délky v SI?","metr (m)",["centimetr (cm)","kilometr (km)","palec"],"Základní jednotka délky je metr."],
        [1,"Jaká je základní jednotka hmotnosti v SI?","kilogram (kg)",["gram (g)","tuna (t)","libra"],"Základní jednotka hmotnosti je kilogram."],
        [1,"Jaká je základní jednotka času v SI?","sekunda (s)",["minuta (min)","hodina (h)","den"],"Sekunda je základní jednotka času."],
        [2,"Kolik centimetrů je 1 metr?","100 cm",["10 cm","1000 cm","1 cm"],"1 m = 100 cm."],
        [2,"Kolik gramů je 1 kilogram?","1000 g",["100 g","10 g","10000 g"],"1 kg = 1000 g."],
        [2,"Kolik sekund má 1 minuta?","60 s",["100 s","30 s","1000 s"],"1 min = 60 s."],
        [3,"Kolik metrů je 2,5 km?","2500 m",["250 m","25 m","25000 m"],"1 km = 1000 m."],
        [3,"Kolik litrů je 1 m³?","1000 l",["100 l","10 l","1 l"],"1 m³ = 1000 dm³ = 1000 l."],
        [3,"Který přístroj slouží k měření hmotnosti?","Váha",["Teploměr","Tlakoměr","Pravítko"],"Hmotnost měříme vahou."],
        [3,"Který přístroj měří teplotu?","Teploměr",["Váha","Dynamometr","Stopky"],"Teplotu měříme teploměrem."],
        [4,"Kolik milimetrů je 3 cm?","30 mm",["3 mm","300 mm","0,3 mm"],"1 cm = 10 mm."],
        [4,"Převeď 2 hodiny na sekundy.","7200 s",["120 s","3600 s","720 s"],"2 · 60 · 60 = 7200."],
        [4,"Jaká je jednotka síly v SI?","newton (N)",["joule (J)","watt (W)","pascal (Pa)"],"Síla se udává v newtonech."],
        [5,"Kolik gramů je 0,5 kg?","500 g",["50 g","5 g","5000 g"],"0,5 · 1000 = 500."],
        [5,"Který údaj je správně zapsaný?","0,25 m",["0,25 metrů","0,25 m.","25 m/100"],"Značka m se píše bez tečky, číslo s desetinnou čárkou."]
      ]
    }
  ]
};
