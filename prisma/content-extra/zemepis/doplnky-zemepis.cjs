// Další otázky k Zeměpisu (základní kurzy 3.–6. ročníku, přidáno k existujícím).
// Načítá se přes prisma/build-courses-sql.cjs (content-extra/<název souboru>/*.cjs).
module.exports = {
  extra: {
    "zem-orientace-mapa": [
      [3, "Jak se nazývá zařízení, jehož střelka ukazuje na sever?", "kompas", ["teploměr", "barometr", "hodiny"], "Střelka kompasu se vždy natáčí k severu."],
      [4, "Jakou barvou se na mapě značí lesy?", "zeleně", ["modře", "hnědě", "černě"], "Lesy bývají na mapách zelené."],
      [5, "Jak se nazývá vedlejší světová strana mezi severem a východem?", "severovýchod", ["jihovýchod", "severozápad", "jihozápad"], "Severovýchod leží mezi severem a východem."],
    ],
    "zem-cr-priroda": [
      [3, "Jak se jmenuje nejvyšší hora Beskyd?", "Lysá hora", ["Praděd", "Sněžka", "Boubín"], "Lysá hora je nejvyšší vrchol Beskyd."],
      [4, "Které pohoří leží na severovýchodě Čech?", "Krkonoše", ["Brdy", "Šumava", "Křivoklátsko"], "Krkonoše jsou na severovýchodě Čech."],
      [5, "Jak se jmenuje největší řeka, která z Čech teče do Německa?", "Labe", ["Vltava", "Ohře", "Odra"], "Labe vytéká z Krkonoš a teče do Německa."],
    ],
    "zem-cr-pamatky-mesta": [
      [3, "Kde stojí Lednický zámek?", "na jižní Moravě", ["na Vysočině", "v Krkonoších", "na Šumavě"], "Lednický zámek je na jižní Moravě, ve Valticko-lednickém areálu."],
      [4, "Které město je proslulé Ústavem Gregora Mendela?", "Brno", ["Olomouc", "Opava", "Ostrava"], "Mendel působil v klášteře v Brně."],
      [5, "Které město leží u soutoku Labe a Orlice?", "Hradec Králové", ["Pardubice", "Litomyšl", "Chrudim"], "Hradec Králové leží u soutoku Labe a Orlice."],
    ],
    "zem-evropa-staty": [
      [3, "Které je hlavní město Litvy?", "Vilnius", ["Riga", "Tallinn", "Kyjev"], "Vilnius je hlavní město Litvy."],
      [4, "Které je hlavní město Slovinska?", "Lublaň", ["Záhřeb", "Bělehrad", "Sarajevo"], "Lublaň je hlavní město Slovinska."],
      [5, "Který stát leží na Pyrenejském poloostrově vedle Španělska?", "Portugalsko", ["Itálie", "Francie", "Andorra"], "Portugalsko sdílí Pyrenejský poloostrov se Španělskem."],
    ],
    "zem-evropa-priroda": [
      [3, "Které moře odděluje Itálii od Balkánského poloostrova?", "Jaderské moře", ["Egejské moře", "Tyrhénské moře", "Ligurské moře"], "Jaderské moře leží mezi Itálií a Balkánem."],
      [4, "Které pohoří leží v Norsku a Švédsku?", "Skandinávské pohoří", ["Pyreneje", "Karpaty", "Apeniny"], "Skandinávské pohoří se táhne přes Norsko a Švédsko."],
      [5, "Které moře leží mezi Dánskem a Německem?", "Severní moře", ["Baltské moře", "Středozemní moře", "Černé moře"], "Severní moře sousedí s Dánskem a Německem."],
    ],
    "zem-svet-kontinenty": [
      [3, "Který oceán leží mezi Afrikou a Austrálií?", "Indický oceán", ["Tichý oceán", "Atlantský oceán", "Severní ledový oceán"], "Indický oceán odděluje Afriku od Austrálie."],
      [4, "Který je nejlidnatější kontinent?", "Asie", ["Afrika", "Evropa", "Severní Amerika"], "Asie má nejvíce obyvatel."],
      [5, "Který kontinent má nejvyšší průměrnou nadmořskou výšku?", "Antarktida", ["Asie", "Jižní Amerika", "Afrika"], "Antarktida je nejvýše položený kontinent."],
    ],
    "zem-asie-afrika": [
      [3, "Které je hlavní město Myanmaru?", "Nay Pyi Taw", ["Jangun", "Mandalaj", "Bangkok"], "Hlavní město Myanmaru je Nay Pyi Taw."],
      [4, "Který africký stát je největší rozlohou?", "Alžírsko", ["Súdán", "Libye", "Egypt"], "Alžírsko je největší stát Afriky."],
      [5, "Který je nejmenší stát Asie rozlohou?", "Maledivy", ["Singapur", "Bahrajn", "Brunej"], "Maledivy jsou nejmenší asijský stát."],
    ],
    "zem-ameriky-australie": [
      [3, "Které pohoří je nejdelší na Zemi?", "Andy", ["Skalnaté hory", "Appalačské pohoří", "Ural"], "Andy jsou nejdelší horský systém světa."],
      [4, "Které je největší město Austrálie a leží v Novém Jižním Walesu?", "Sydney", ["Melbourne", "Perth", "Brisbane"], "Sydney je největší město Austrálie."],
      [5, "Který průplav spojuje Atlantský a Tichý oceán?", "Panamský průplav", ["Suezský průplav", "Kielský průplav", "Korintský průplav"], "Panamský průplav spojuje dva oceány."],
    ],
    "zem-pocasi-podnebi": [
      [3, "Jak se nazývá vrstva vzduchu obklopující Zemi?", "atmosféra", ["litosféra", "hydrosféra", "biosféra"], "Atmosféra je vzdušný obal Země."],
      [4, "Jak se nazývá vítr vanoucí z moře na pevninu?", "mořský vánek", ["bóra", "sirocco", "föhn"], "Mořský vánek vane přes den od moře na pevninu."],
      [5, "Co je teplotní inverze?", "stav, kdy teplota s výškou roste", ["teplota s výškou klesá", "vítr ze severu", "suchá půda"], "Při inverzi je teplejší vzduch nad chladnějším."],
    ],
    "zem-voda-krajina": [
      [3, "Jak se nazývá vodní tok menší než řeka?", "potok", ["jezero", "přehrada", "rybník"], "Potok je menší vodní tok než řeka."],
      [4, "Jak se nazývá místo, kde se potok vlévá do řeky?", "soutok", ["pramen", "vodopád", "rozvodí"], "Soutok je místo spojení dvou toků."],
      [5, "Jak se nazývá umělá vodní nádrž za hrází na řece?", "přehrada", ["rybník", "jezero", "studna"], "Přehrada je nádrž vytvořená hrází."],
    ],
    "zem-cr-obyvatele-hospodarstvi": [
      [3, "Které město je sídlem Baťovy obuvnické firmy a centrem výroby obuvi?", "Zlín", ["Brno", "Opava", "Plzeň"], "Zlín je spojen s firmou Baťa."],
      [4, "Jaký je hlavní zdroj elektřiny v Česku?", "uhelné elektrárny", ["větrné elektrárny", "solární elektrárny", "vodní elektrárny"], "Největší podíl elektřiny dávají uhelné elektrárny."],
      [5, "Co je nezaměstnanost?", "podíl lidí bez práce, kteří hledají zaměstnání", ["počet narozených dětí", "počet zemřelých", "počet turistů"], "Nezaměstnanost měří lidi, kteří práci hledají."],
    ],
    "zem-vesmir-zeme": [
      [3, "Která planeta je nejžhavější ve sluneční soustavě?", "Venuše", ["Merkur", "Mars", "Jupiter"], "Venuše má díky skleníkovému efektu nejvyšší teplotu povrchu."],
      [4, "Jak se nazývá síla, která tahá tělesa k zemi?", "tíhová síla", ["třecí síla", "odstředivá síla", "vztlaková síla"], "Tíhová síla působí na tělesa u povrchu Země."],
      [5, "Které měsíce obíhají kolem planety Jupiter?", "Galileovy měsíce", ["Titan", "Phobos", "Triton"], "Galileovy měsíce objevil Galileo Galilei u Jupitera."],
    ],
  },
};
