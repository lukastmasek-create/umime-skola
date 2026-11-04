// Další otázky k Zeměpisu 7.–9. ročník (přidáno k existujícím).
// Načítá se přes prisma/build-courses-sql.cjs (content-extra/<název souboru>/*.cjs).
module.exports = {
  extra: {
    "zem-7-cina-japonsko": [
      [3, "Který ostrov je nejsevernější z hlavních ostrovů Japonska?", "Hokkaidó", ["Honšú", "Kjúšú", "Šikoku"], "Hokkaidó je nejsevernější hlavní ostrov Japonska."],
      [4, "Jak se nazývá nejvyšší náhorní plošina světa?", "Tibetská náhorní plošina", ["Kolorádská plošina", "Dekánská plošina", "Patagonská plošina"], "Tibetská plošina leží v průměru ve výšce přes 4 000 m."],
      [5, "Jak se jmenuje rozsáhlá poušť na severozápadě Číny?", "Taklamakan", ["Atacama", "Kalahari", "Thar"], "Taklamakan leží v Sin-ťiangu."],
    ],
    "zem-7-indie-jihovychodni-asie": [
      [3, "Které město leží na řece Ganze a je jedním z nejposvátnějších míst hinduistů?", "Váránasí", ["Dillí", "Kalkata", "Madrás"], "Váránasí leží na břehu Gangy."],
      [4, "Jak se jmenuje hlavní město Myanmaru?", "Nay Pyi Taw", ["Jangun", "Mandalaj", "Bangkok"], "Hlavní město se od roku 2005 přesunulo do Nay Pyi Taw."],
      [5, "Který ostrov Indonésie je nejlidnatější a leží na něm Jakarta?", "Jáva", ["Sumatra", "Bali", "Celebes"], "Jakarta leží na severním pobřeží Jávy."],
    ],
    "zem-7-blizky-vychod": [
      [3, "Které město je hlavním městem Íránu?", "Teherán", ["Bagdád", "Dubaj", "Bejrút"], "Teherán je hlavní město Íránu."],
      [4, "Jak se jmenuje hlavní město Iráku?", "Bagdád", ["Damašek", "Teherán", "Amman"], "Bagdád je hlavní město Iráku."],
      [5, "Které moře odděluje Arabský poloostrov od Afriky?", "Rudé moře", ["Arabské moře", "Mrtvé moře", "Středozemní moře"], "Rudé moře leží mezi Arábií a Afrikou."],
    ],
    "zem-7-sahara-nil-jizni-afrika": [
      [3, "Jak se jmenuje hlavní město Nigérie?", "Abuja", ["Lagos", "Accra", "Nairobi"], "Abuja je hlavní město Nigérie, Lagos je největší město."],
      [4, "Které město leží na Nilu a je hlavním městem Súdánu?", "Chartúm", ["Káhira", "Addis Abeba", "Kampala"], "Chartúm leží na soutoku Bílého a Modrého Nilu."],
      [5, "Jak se jmenuje největší jezero Afriky?", "Viktoriino jezero", ["Malawi", "Tanganika", "Čadské jezero"], "Viktoriino jezero je největší africké jezero rozlohou."],
    ],
    "zem-7-usa-kanada": [
      [3, "Které město je sídlem OSN v USA?", "New York", ["Washington", "Chicago", "Boston"], "Sídlo OSN je v New Yorku."],
      [4, "Jak se jmenuje nejvyšší hora Kanady?", "Mount Logan", ["Denali", "Mount Whitney", "Mount Robson"], "Mount Logan je nejvyšší hora Kanady."],
      [5, "Která kanadská provincie je nejlidnatější?", "Ontario", ["Quebec", "Alberta", "Britská Kolumbie"], "Nejvíce obyvatel žije v Ontariu."],
    ],
    "zem-7-amazonie-andy": [
      [3, "Které město je hlavním městem Peru?", "Lima", ["Quito", "La Paz", "Bogotá"], "Lima je hlavní město Peru."],
      [4, "Jak se jmenuje hlavní město Uruguaye?", "Montevideo", ["Asunción", "Buenos Aires", "Santiago"], "Montevideo je hlavní město Uruguaye."],
      [5, "Který domorodý jazyk se vedle španělštiny úředně používá v Paraguayi?", "guaraní", ["kečuánština", "ajmarština", "nahuatl"], "V Paraguayi je úředním jazykem guaraní."],
    ],
    "zem-8-cr-relief-vody": [
      [3, "Která řeka protéká Brnem?", "Svratka", ["Dyje", "Morava", "Odra"], "Brno leží na řece Svratce."],
      [4, "Která řeka protéká Prahou a ústí do Labe?", "Vltava", ["Berounka", "Sázava", "Jizera"], "Vltava se u Mělníka vlévá do Labe."],
    ],
    "zem-8-cr-obyvatelstvo": [
      [3, "Které město je po Brně největší v Jihomoravském kraji?", "Znojmo", ["Hodonín", "Břeclav", "Blansko"], "Znojmo je největší město kraje po Brně."],
      [4, "Jak se nazývá pohyb obyvatel mezi státy?", "migrace", ["natalita", "mortalita", "urbanizace"], "Migrace je stěhování lidí mezi zeměmi."],
      [5, "Co je mortalita?", "počet zemřelých na 1 000 obyvatel", ["počet narozených", "počet sňatků", "počet rozvodů"], "Mortalita je úmrtnost."],
    ],
    "zem-8-cr-hospodarstvi": [
      [3, "Ve kterém městě na Moravě sídlí automobilka Tatra?", "Kopřivnice", ["Vsetín", "Zlín", "Přerov"], "Tatra sídlí v Kopřivnici."],
      [4, "Které město v Čechách je centrem sklářství?", "Nový Bor", ["Kladno", "Plzeň", "Hodonín"], "Nový Bor je známý sklářskou výrobou."],
      [5, "Co znamená dovoz?", "nákup zboží ze zahraničí", ["prodej zboží do zahraničí", "těžba surovin", "doprava osob"], "Dovoz je opakem vývozu."],
    ],
    "zem-8-cr-kraje": [
      [3, "Které je sídlo Plzeňského kraje?", "Plzeň", ["Cheb", "Klatovy", "Domažlice"], "Plzeň je krajské město Plzeňského kraje."],
      [4, "Který kraj je nejlidnatější v ČR mimo Prahu?", "Středočeský kraj", ["Jihomoravský kraj", "Moravskoslezský kraj", "Ústecký kraj"], "Středočeský kraj má nejvíce obyvatel."],
    ],
    "zem-8-slovensko-polsko": [
      [3, "Které město je rodištěm Mikuláše Koperníka?", "Toruň", ["Krakov", "Varšava", "Gdaňsk"], "Koperník se narodil v Toruni."],
      [4, "Jaký je hlavní přístav Polska na Baltu?", "Gdaňsk", ["Krakov", "Lodž", "Poznaň"], "Gdaňsk je významný přístav u Baltského moře."],
      [5, "Jak se jmenuje největší řeka Polska?", "Visla", ["Odra", "Warta", "Bug"], "Visla je nejdelší řeka Polska."],
    ],
    "zem-8-nemecko-rakousko": [
      [3, "Které město je hlavním městem spolkové země Bavorsko?", "Mnichov", ["Berlín", "Hamburk", "Drážďany"], "Mnichov je hlavní město Bavorska."],
      [4, "Jak se jmenuje největší jezero Rakouska?", "Neusiedlersee", ["Attersee", "Wörthersee", "Traunsee"], "Neusiedlersee leží na hranici s Maďarskem."],
      [5, "Která řeka protéká Mnichovem?", "Isar", ["Rýn", "Labe", "Mohan"], "Mnichov leží na řece Isaře."],
    ],
    "zem-9-litosfera-tektonika": [
      [3, "Jak se nazývá proces, při kterém se litosférické desky od sebe oddalují?", "divergence", ["konvergence", "subdukce", "transformace"], "Při divergenci vzniká nová kůra."],
      [4, "Jak se nazývá plastická vrstva pod litosférou?", "astenosféra", ["mezosféra", "stratosféra", "exosféra"], "Astenosféra je část svrchního pláště."],
      [5, "Která je největší litosférická deska?", "Pacifická", ["Eurasijská", "Africká", "Antarktická"], "Pacifická deska je největší."],
    ],
    "zem-9-atmosfera-podnebi": [
      [3, "Jak se nazývá vodní pára ve vzduchu?", "vlhkost vzduchu", ["ozón", "kyslík", "dusík"], "Vlhkost vzduchu udává obsah vodní páry."],
      [4, "Jak se nazývá jev, při kterém se teplý vzduch zvedá a tvoří mraky?", "konvekce", ["advekce", "inverze", "subsidence"], "Konvekce je vertikální pohyb vzduchu."],
      [5, "Jak se jmenuje teplý suchý vítr v Alpách, který vane do údolí?", "föhn", ["bóra", "mistral", "chamsin"], "Föhn je teplý suchý vítr z hor."],
    ],
    "zem-9-hydrosfera-oceany": [
      [3, "Které vodní těleso je nejslanější na Zemi?", "Mrtvé moře", ["Rudé moře", "Kaspické moře", "Černé moře"], "Mrtvé moře má nejvyšší obsah soli."],
      [4, "Které vodní těleso je největším jezerem světa?", "Kaspické moře", ["Viktoriino jezero", "Bajkal", "Superior"], "Kaspické moře je slané jezero rozlohou největší."],
      [5, "Jak se jmenuje nejvyšší vodopád světa?", "Salto Ángel", ["Niagara", "Iguazú", "Victoria"], "Salto Ángel ve Venezuele je nejvyšší vodopád."],
    ],
    "zem-9-obyvatelstvo-sveta": [
      [3, "Který světadíl má nejvyšší hustotu zalidnění?", "Asie", ["Evropa", "Afrika", "Severní Amerika"], "Asie je nejlidnatější světadíl."],
      [4, "Které je nejlidnatější město světa?", "Tokio", ["Dillí", "Šanghaj", "Káhira"], "Aglomerace Tokia je největší na světě."],
      [5, "Jak se nazývá počet dětí, které žena v průměru porodí?", "celková plodnost", ["natalita", "mortalita", "migrace"], "Plodnost ukazuje, kolik dětí žena porodí."],
    ],
    "zem-9-globalni-problemy": [
      [3, "Co je eutrofizace?", "nadměrné obohacení vod živinami", ["odlesňování", "desertifikace", "smog"], "Eutrofizace vede k přemnožení řas."],
      [4, "Co je fosilní palivo?", "uhlí, ropa a zemní plyn", ["jaderné palivo", "biomasa", "sluneční energie"], "Fosilní paliva vznikla z pradávných organismů."],
      [5, "Co znamená zkratka OSN?", "Organizace spojených národů", ["Organizace severních národů", "Obchodní společenství národů", "Ochrana světových národů"], "OSN je mezinárodní organizace se sídlem v New Yorku."],
    ],
    "zem-9-mapy-gps-gis": [
      [3, "Co je zeměpisná délka?", "úhel od nultého poledníku", ["vzdálenost od rovníku", "nadmořská výška", "úhel od severu"], "Délka se měří od nultého poledníku."],
      [4, "Kolik metrů odpovídá 1 cm na mapě v měřítku 1 : 10 000?", "100 m", ["10 m", "1 km", "10 km"], "1 cm · 10 000 = 10 000 cm = 100 m."],
      [5, "Co je ortofotomapa?", "letecký snímek upravený do přesné mapy", ["mapa s vrstevnicemi", "mapa hustoty zalidnění", "mapa počasí"], "Ortofotomapa vzniká z leteckých snímků bez zkreslení."],
    ],
  },
};
