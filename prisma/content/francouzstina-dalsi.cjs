// Francouzština pro 6.–9. třídu, další kurzy (doplnění na 10). Řádek otázky: [obtížnost 1-5, otázka, správná, [3 špatné], vysvětlení]
module.exports = {
  subject: "FRANCOUZSTINA",
  courses: [
    {
      slug: "fr-cislovky-vek",
      title: "Čísla do sta a můj věk",
      desc: "Čísla od 11 do 100 a jak se představit a říct věk.",
      section: "Slovní zásoba",
      grade: 7,
      qs: [
        [1,"Číslo 11 francouzsky je…","onze",["douze","dix","treize"],"11 = onze, 12 = douze."],
        [1,"Číslo 15 francouzsky je…","quinze",["seize","quatorze","vingt"],"15 = quinze."],
        [2,"Číslo 20 francouzsky je…","vingt",["vint","vingts","dix-vingt"],"20 = vingt."],
        [2,"Číslo 30 francouzsky je…","trente",["trent","tranche","trois-dix"],"30 = trente."],
        [2,"Číslo 100 francouzsky je…","cent",["cents","centu","dix"],"100 = cent."],
        [3,"Číslo 17 francouzsky je…","dix-sept",["sept-dix","dix-sep","seize-un"],"17 = dix-sept (10 + 7)."],
        [3,"Číslo 19 francouzsky je…","dix-neuf",["neuf-dix","dix-huit","vingt-neuf"],"19 = dix-neuf."],
        [3,"Co znamená „J'ai douze ans.“?","Je mi dvanáct let.",["Mám dvanáct bratrů.","Jsem dvanáctý.","Je dvanáct hodin."],"avoir ... ans = být starý."],
        [3,"Jak se řekne „Je mi patnáct let.“?","J'ai quinze ans.",["Je quinze ans.","Tu as quinze ans.","Je suis quinze."],"avoir ans = mít roky, tedy J'ai quinze ans."],
        [4,"Číslo 40 francouzsky je…","quarante",["quatre-vingt","cinquante","quatorze"],"40 = quarante."],
        [4,"Číslo 60 francouzsky je…","soixante",["soixante-dix","cinquante","soixante-dix-neuf"],"60 = soixante."],
        [4,"Číslo 80 francouzsky je…","quatre-vingts",["quatre-vingt-dix","quarante","huitante"],"80 = quatre-vingts (4 × 20)."],
        [4,"Číslo 90 francouzsky je…","quatre-vingt-dix",["quatre-vingts","nonante","cent-dix"],"90 = quatre-vingt-dix (4 × 20 + 10)."],
        [5,"Jak se řekne „Kolik ti je let?“ (neformálně)?","Quel âge as-tu ?",["Quelle heure est-il ?","Combien coûte ça ?","Comment tu t'appelles ?"],"Quel âge as-tu = kolik ti je let."],
        [5,"Co znamená „soixante-dix“?","sedmdesát",["šedesát","osmdesát","padesát"],"70 = soixante-dix (60 + 10)."]
      ]
    },
    {
      slug: "fr-jidlo-restaurace",
      title: "V restauraci",
      desc: "Jídlo, pití a fráze při objednávání.",
      section: "Slovní zásoba",
      grade: 7,
      qs: [
        [1,"Co znamená „l'eau“?","voda",["mléko","víno","chléb"],"l'eau = voda."],
        [1,"Co znamená „le pain“?","chléb",["sýr","maso","dezert"],"le pain = chléb."],
        [1,"Co znamená „le fromage“?","sýr",["máslo","vejce","šunka"],"le fromage = sýr."],
        [2,"Co znamená „le poulet“?","kuře",["ryba","hovězí","vepřové"],"le poulet = kuře."],
        [2,"Co znamená „le poisson“?","ryba",["maso","zelenina","ovoce"],"le poisson = ryba."],
        [2,"Co znamená „le dessert“?","dezert",["polévka","předkrm","salát"],"le dessert = dezert."],
        [2,"Co znamená „le jus d'orange“?","pomerančový džus",["jablečný džus","víno","pivo"],"jus d'orange = pomerančový džus."],
        [3,"Jak se řekne „Chtěl bych vodu, prosím.“?","Je voudrais de l'eau, s'il vous plaît.",["Je suis de l'eau, s'il vous plaît.","J'ai de l'eau, merci bonjour.","Je veux être l'eau."],"Je voudrais = chtěl bych (zdvořile)."],
        [3,"Co znamená „L'addition, s'il vous plaît.“?","Účet, prosím.",["Jídelní lístek, prosím.","Sůl, prosím.","Příbor, prosím."],"L'addition = účet."],
        [3,"Co znamená „la carte“ v restauraci?","jídelní lístek",["účet","stůl","talíř"],"la carte = jídelní lístek."],
        [3,"Co znamená „Je n'ai pas faim.“?","Nemám hlad.",["Mám hlad.","Nemám žízeň.","Jsem nemocný."],"avoir faim = mít hlad, ne ... pas = nemám."],
        [4,"Co znamená „un café au lait“?","káva s mlékem",["černá káva","čaj s citronem","horká čokoláda"],"café au lait = káva s mlékem."],
        [4,"Co znamená „Le menu du jour“?","denní menu",["večerní menu","dětské menu","snídaňové menu"],"menu du jour = denní nabídka."],
        [4,"Jak se řekne „Jsem vegetarián.“?","Je suis végétarien.",["Je mange végétarien.","Je suis viande.","Je bois végétarien."],"végétarien = vegetarián."],
        [5,"Co znamená „Je voudrais réserver une table pour deux.“?","Chtěl bych rezervovat stůl pro dva.",["Chtěl bych dva stoly.","Chtěl bych koupit stůl.","Chtěl bych dva talíře."],"réserver = rezervovat, table = stůl."],
        [5,"Co znamená „Bon appétit !“?","Dobrou chuť!",["Dobrý den!","Na zdraví!","Dobrou noc!"],"Bon appétit se říká před jídlem."]
      ]
    },
    {
      slug: "fr-pridavna-jmena",
      title: "Přídavná jména a shoda",
      desc: "Rod a číslo přídavných jmen a jejich postavení.",
      section: "Gramatika",
      grade: 8,
      qs: [
        [2,"Ženský tvar „grand“ (velký) je…","grande",["grand","grands","grandes"],"Ženský rod přidá -e: grand → grande."],
        [2,"Ženský tvar „petit“ (malý) je…","petite",["petit","petis","petites"],"petit → petite."],
        [2,"Ženský tvar „blanc“ (bílý) je…","blanche",["blanc","blanque","blancs"],"blanc → blanche."],
        [2,"Množné číslo „beau“ (krásný) je…","beaux",["beaus","belles","beau"],"Množné číslo přidá -x."],
        [3,"Ženský tvar „beau“ je…","belle",["bele","beaux","beaue"],"Ženský tvar beau je belle."],
        [3,"Ženský tvar „nouveau“ (nový) je…","nouvelle",["nouveaux","nouveau","nouvel"],"nouveau → nouvelle."],
        [3,"Jak se řekne „Mám malý dům.“?","J'ai une petite maison.",["J'ai un petit maison.","J'ai une petit maison.","J'ai un petite maison."],"maison je ženský rod, shoda: petite."],
        [3,"Kde obvykle stojí přídavné jméno „grand“?","Před podstatným jménem",["Za podstatným jménem","Na konci věty","Mezi slovesem a předmětem"],"grand, petit, beau stojí většinou před jménem."],
        [4,"Jak se řekne „Velká červená kniha“?","Un grand livre rouge",["Un livre grand rouge","Un rouge grand livre","Une grande rouge livre"],"Přídavné jméno „grand“ stojí před, „rouge“ za jménem."],
        [4,"Množné číslo „un vieux monsieur“ je…","des vieux messieurs",["des vieux monsieurs","des vieuxs messieurs","des vieilles messieurs"],"monsieur → messieurs, vieux → vieux."],
        [4,"Ženský tvar „heureux“ (šťastný) je…","heureuse",["heureux","heureuxe","heureuses"],"heureux → heureuse."],
        [4,"Ženský tvar „actif“ (aktivní) je…","active",["actife","actifs","actives"],"actif → active."],
        [5,"Který tvar je správný: „Ty jsi šťastná.“?","Tu es heureuse.",["Tu es heureux.","Tu es heureuses.","Tu es heureuxe."],"Ženský rod ženy: heureuse."],
        [5,"Jak se řekne „Moje ženské sestry jsou krásné.“?","Mes sœurs sont belles.",["Mes sœurs sont beaux.","Mes sœurs sont beau.","Mes soeurs sont beaux."],"belles = krásné (ženský rod, množné číslo)."]
      ]
    },
    {
      slug: "fr-passe-compose",
      title: "Minulost: passé composé",
      desc: "Jak vyprávět o tom, co se stalo, s avoir a être.",
      section: "Gramatika",
      grade: 9,
      qs: [
        [2,"Jak se řekne „Včera jsem mluvil.“ (passé composé)?","J'ai parlé.",["Je parle.","Je parlerai.","Je parlais."],"avoir + příčestí parlé."],
        [2,"Příčestí slovesa „manger“ je…","mangé",["mangiez","mangeant","manger"],"manger → mangé."],
        [2,"Příčestí slovesa „finir“ je…","fini",["finit","finé","finissant"],"finir → fini."],
        [3,"Pomocné sloveso pro „aller“ v passé composé je…","être",["avoir","faire","pouvoir"],"Některá pohybová slovesa (aller, venir) se pojí s être."],
        [3,"Jak se řekne „Šel jsem do Paříže.“?","Je suis allé à Paris.",["J'ai allé à Paris.","Je vais allé à Paris.","Je suis aller à Paris."],"aller se pojí s être, příčestí allé."],
        [3,"Jak se řekne „Viděl jsem film.“?","J'ai vu un film.",["Je suis vu un film.","J'ai voir un film.","J'ai vue un film."],"voir → vu, s avoir."],
        [3,"Příčestí „faire“ (dělat) je…","fait",["faire","fé","faisé"],"faire → fait."],
        [4,"Jak se řekne „Ona přišla.“ (venir)?","Elle est venue.",["Elle a venu.","Elle est venu.","Elle a venue."],"venir se pojí s être a shoda rodu: venue."],
        [4,"Příčestí „prendre“ (vzít) je…","pris",["prendu","prend","prise"],"prendre → pris."],
        [4,"Jaký je negativní tvar „Nezměnil jsem.“ (changer)?","Je n'ai pas changé.",["Je pas n'ai changé.","Je n'ai changé pas.","Je ne suis pas changé."],"Ne ... pas obaluje pomocné sloveso."],
        [4,"Jak se řekne „Oni odešli.“ (partir, ils)?","Ils sont partis.",["Ils ont partis.","Ils sont parti.","Ils ont parti."],"partir se pojí s être, množné číslo partis."],
        [5,"Který časový výraz se hodí k passé composé?","hier (včera)",["demain (zítra)","maintenant (teď)","souvent (často)"],"Hier = včera, jde o hotový děj."],
        [5,"Co znamená „Nous avons mangé ensemble.“?","Jedli jsme spolu.",["Budeme jíst spolu.","Jíme spolu teď.","Jedl jsem sám."],"nous avons mangé = jedli jsme."]
      ]
    },
    {
      slug: "fr-mesta-francie",
      title: "Města a reálie Francie",
      desc: "Hlavní města, řeky, hory a známé památky Francie.",
      section: "Praxe a reálie",
      grade: 9,
      qs: [
        [1,"Hlavní město Francie je…","Paříž",["Lyon","Marseille","Nice"],"Paříž (Paris) je hlavní město."],
        [1,"Které město leží na jihu u Středozemního moře?","Marseille",["Strasbourg","Lille","Rennes"],"Marseille je přístavní město na jihu."],
        [2,"Která řeka protéká Paříží?","Seina",["Rhône","Loira","Garonna"],"La Seine protéká Paříží."],
        [2,"Jak se jmenuje nejdelší řeka Francie?","Loira",["Seina","Rhône","Marna"],"Loira je nejdelší francouzská řeka."],
        [2,"Jaké je nejvyšší pohoří ve Francii?","Alpy (Mont Blanc)",["Pyreneje","Vogézy","Massif Central"],"Mont Blanc leží v Alpách na hranici s Itálií."],
        [3,"Které město leží na řece Rhône a je druhé největší ve Francii?","Lyon",["Nice","Lille","Toulouse"],"Lyon leží na soutoku Rhôny a Saôny."],
        [3,"Ve kterém městě je slavná Notre-Dame?","Paříž",["Lyon","Nice","Bordeaux"],"Notre-Dame stojí v Paříži."],
        [3,"Které město je centrem alsaského regionu?","Strasbourg",["Marseille","Toulouse","Caen"],"Strasbourg leží v Alsasku na hranici s Německem."],
        [3,"Kterým městem je známé víno Bordeaux?","Bordeaux",["Nantes","Reims","Dijon"],"Bordeaux je centrum vinařství."],
        [4,"Jaký je název regionu s vinicemi a šampaňským?","Champagne",["Bretaň","Provence","Korsika"],"Champagne je region na severovýchodě."],
        [4,"Které moře omývá jih Francie?","Středozemní moře",["Severní moře","Baltské moře","Černé moře"],"Provence a Azurové pobřeží leží u Středozemního moře."],
        [4,"Jaký ostrov patří Francii ve Středozemním moři?","Korsika",["Sicílie","Malta","Kréta"],"Korsika je francouzský ostrov."],
        [5,"Co je „TGV“?","Francouzský vysokorychlostní vlak",["Pařížské metro","Francouzská letecká společnost","Typ sýra"],"Train à grande vitesse je rychlovlak."],
        [5,"Jaké je heslo Francouzské republiky?","Liberté, Égalité, Fraternité",["Unité, Force, Foi","Dieu et mon droit","E pluribus unum"],"Svoboda, rovnost, bratrství."]
      ]
    }
  ]
};
