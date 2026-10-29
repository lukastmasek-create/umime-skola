import type { Locale } from "./config";
import type { StallKey } from "@/lib/market-worlds";
import { getMarketText } from "./market";

// Texty jednotlivých světů obchodu (stánky, obchodníci, interaktivní věci) a odemykání dalších světů.
// Pirátský přístav bere texty z market.ts, ostatní světy jsou tady.

export type StallText = { name: string; npc: string; hello: string[] };
export type WorldText = {
  title: string;
  subtitle: string;
  stalls: Record<StallKey, StallText>;
  fireLabel: string;
  boom: string;
  talk: Record<string, { label: string; lines: string[] }>;
};
export type UnlockText = { title: string; text: string; button: string; needLevel: string; needPoints: string; done: string; locked: string };

const space: Record<Locale, WorldText> = {
  cs: {
    title: "Vesmírná stanice",
    subtitle: "Promenáda na oběžné dráze: roboti, mimozemšťané a astronauti ti prodají vesmírné zboží za body z učení.",
    stalls: {
      avatary: { name: "Převlékárna", npc: "Admirál Hvězdička", hello: ["Pozor, kadete! Skafandr ti padne jako ulitý.", "Nový kostým pro novou misi?"] },
      tituly: { name: "Hvězdná kancelář", npc: "Robot Bip-7", hello: ["Bip bup! Zapíšu ti titul do hvězdného katalogu.", "Zpracovávám tvou žádost… hotovo!"] },
      ramecky: { name: "Dílna rámců", npc: "Inženýrka Matka", hello: ["Rámeček z kosmické oceli, odolá i meteoritům!", "Dej mi chvilku a seřídím ti ho."] },
      pozadi: { name: "Galerie mlhovin", npc: "Zorgla z Alfy", hello: ["Zbarvím ti pozadí do mlhoviny, kterou jsi ještě neviděl.", "Zogli! Vyber si hvězdnou oblohu."] },
      mazlicci: { name: "Biokoutek", npc: "Doktorka Pipetka", hello: ["Mazlíček pro tvou základnu? Tenhle blob je roztomilý.", "Doplňky pro vesmírná zvířátka mám všechny."] },
      lod: { name: "Dok raket", npc: "Raketoplán", hello: ["Stavby pro tvé město se vyrábějí v doku raket."] },
    },
    fireLabel: "Vyslat sondu",
    boom: "BZZZ!",
    talk: {
      pet: { label: "Pohladit blob", lines: ["Blub! Blub!", "Pip pip!", "Jsem tvůj nový kamarád!", "Mlask! Nemáš nějakou hvězdu?"] },
      bot: { label: "Promluvit s robotem", lines: ["Bip bup, uklízím!", "Prach ve vesmíru neexistuje… ale já ho najdu.", "Čistota je půl mise!"] },
    },
  },
  en: {
    title: "Space station",
    subtitle: "A promenade in orbit: robots, aliens and astronauts sell space goods for the points you earn from learning.",
    stalls: {
      avatary: { name: "Changing room", npc: "Admiral Starlet", hello: ["Attention, cadet! That spacesuit fits like a glove.", "A new costume for a new mission?"] },
      tituly: { name: "Star office", npc: "Robot Bip-7", hello: ["Beep boop! I'll write your title into the star catalogue.", "Processing your request… done!"] },
      ramecky: { name: "Frame workshop", npc: "Engineer Mother", hello: ["A frame of space steel, it survives even meteorites!", "Give me a moment and I'll tune it for you."] },
      pozadi: { name: "Nebula gallery", npc: "Zorgla of Alpha", hello: ["I'll paint your background in a nebula you've never seen.", "Zogli! Pick your starry sky."] },
      mazlicci: { name: "Bio corner", npc: "Doctor Pipette", hello: ["A pet for your base? This blob is adorable.", "I have accessories for every space pet."] },
      lod: { name: "Rocket dock", npc: "Space shuttle", hello: ["Buildings for your city are made in the rocket dock."] },
    },
    fireLabel: "Launch a probe",
    boom: "BZZZ!",
    talk: {
      pet: { label: "Pet the blob", lines: ["Blub! Blub!", "Peep peep!", "I'm your new friend!", "Yum! Got any stars?"] },
      bot: { label: "Talk to the robot", lines: ["Beep boop, cleaning!", "There's no dust in space… but I'll find it.", "Cleanliness is half the mission!"] },
    },
  },
  de: {
    title: "Raumstation",
    subtitle: "Eine Promenade im Orbit: Roboter, Außerirdische und Astronauten verkaufen dir Weltraumwaren für deine Lernpunkte.",
    stalls: {
      avatary: { name: "Umkleide", npc: "Admiral Sternchen", hello: ["Achtung, Kadett! Der Raumanzug sitzt wie angegossen.", "Ein neues Kostüm für eine neue Mission?"] },
      tituly: { name: "Sternenbüro", npc: "Roboter Bip-7", hello: ["Bip bup! Ich trage deinen Titel in den Sternenkatalog ein.", "Verarbeite deine Anfrage… fertig!"] },
      ramecky: { name: "Rahmenwerkstatt", npc: "Ingenieurin Mutter", hello: ["Ein Rahmen aus Weltraumstahl, übersteht sogar Meteoriten!", "Gib mir einen Moment, ich stelle ihn ein."] },
      pozadi: { name: "Nebelgalerie", npc: "Zorgla von Alpha", hello: ["Ich färbe deinen Hintergrund in einen Nebel, den du noch nie gesehen hast.", "Zogli! Such dir den Sternenhimmel aus."] },
      mazlicci: { name: "Bio-Ecke", npc: "Doktorin Pipette", hello: ["Ein Haustier für deine Basis? Dieser Blob ist niedlich.", "Zubehör für alle Weltraumtiere habe ich da."] },
      lod: { name: "Raketendock", npc: "Raumfähre", hello: ["Gebäude für deine Stadt entstehen im Raketendock."] },
    },
    fireLabel: "Sonde starten",
    boom: "BZZZ!",
    talk: {
      pet: { label: "Blob streicheln", lines: ["Blub! Blub!", "Piep piep!", "Ich bin dein neuer Freund!", "Mampf! Hast du einen Stern?"] },
      bot: { label: "Mit dem Roboter reden", lines: ["Bip bup, ich putze!", "Im All gibt es keinen Staub… aber ich finde ihn.", "Sauberkeit ist die halbe Mission!"] },
    },
  },
  ru: {
    title: "Космическая станция",
    subtitle: "Променад на орбите: роботы, пришельцы и астронавты продают космические товары за баллы.",
    stalls: {
      avatary: { name: "Раздевалка", npc: "Адмирал Звёздочка", hello: ["Внимание, кадет! Скафандр сидит как влитой.", "Новый костюм для новой миссии?"] },
      tituly: { name: "Звёздная канцелярия", npc: "Робот Бип-7", hello: ["Бип буп! Впишу звание в звёздный каталог.", "Обрабатываю запрос… готово!"] },
      ramecky: { name: "Мастерская рамок", npc: "Инженер Мать", hello: ["Рамка из космической стали выдержит даже метеориты!", "Минутку, и я её настрою."] },
      pozadi: { name: "Галерея туманностей", npc: "Зорлга с Альфы", hello: ["Раскрашу твой фон туманностью, какой ты ещё не видел.", "Зогли! Выбери звёздное небо."] },
      mazlicci: { name: "Биоуголок", npc: "Доктор Пипетка", hello: ["Питомец для базы? Этот блоб очарователен.", "Аксессуары для космических зверей у меня есть."] },
      lod: { name: "Док ракет", npc: "Шаттл", hello: ["Постройки для твоего города делают в доке ракет."] },
    },
    fireLabel: "Запустить зонд",
    boom: "БЗЗЗ!",
    talk: {
      pet: { label: "Погладить блоба", lines: ["Блаб! Блаб!", "Пип пип!", "Я твой новый друг!", "Ням! Звёздочки не найдётся?"] },
      bot: { label: "Поговорить с роботом", lines: ["Бип буп, убираю!", "В космосе нет пыли… но я найду.", "Чистота — половина миссии!"] },
    },
  },
};


const forest: Record<Locale, WorldText> = {
  cs: {
    title: "Pohádkový les",
    subtitle: "Mýtina plná světlušek: víly, hajní a lesní řemeslníci ti prodají kouzelné zboží za body z učení.",
    stalls: {
      avatary: { name: "Lesní krejčovna", npc: "Víla Lupínka", hello: ["Listové šaty ti sednou jako ulité!", "Pojď, ušiju ti něco z mechu a lupínků."] },
      tituly: { name: "Hájenka", npc: "Hajný Mechomil", hello: ["Zapíšu ti titul do lesní kroniky.", "Kdo se učí, toho les ctí."] },
      ramecky: { name: "Řezbářská dílna", npc: "Řezbář Šiška", hello: ["Rámeček z větvičky, vyřezávaný ručně!", "Dřevo voní, jen si přivoň."] },
      pozadi: { name: "Světluščí galerie", npc: "Malířka Světluška", hello: ["Namaluji ti pozadí zářící jako světlušky.", "Vyber si barvy lesa."] },
      mazlicci: { name: "Bylinkářství", npc: "Bylinkářka Meduňka", hello: ["Pro mazlíčka mám bylinky i ozdoby.", "Ten králíček je můj nejlepší zákazník."] },
      lod: { name: "Domek v koruně", npc: "Domek", hello: ["Stavby pro tvé město vznikají v domku na stromě."] },
    },
    fireLabel: "Mávnout kouzelnou hůlkou",
    boom: "ŠIM!",
    talk: {
      kralik: { label: "Pohladit králíčka", lines: ["Čich, čich… mrkev?", "Hop hop!", "Tady je krásně, že?"] },
      kocka: { label: "Pohladit kočku", lines: ["Mňau!", "Prrr… škrábej za uchem.", "Mňau mňau!"] },
    },
  },
  en: {
    title: "Fairy forest",
    subtitle: "A glade full of fireflies: fairies, rangers and forest crafters sell you magical goods for learning points.",
    stalls: {
      avatary: { name: "Forest tailor", npc: "Fairy Petal", hello: ["Leaf dresses fit like a dream!", "Come, I'll sew you something from moss and petals."] },
      tituly: { name: "Ranger's lodge", npc: "Ranger Mossy", hello: ["I'll write your title in the forest chronicle.", "The forest honours those who learn."] },
      ramecky: { name: "Carver's workshop", npc: "Carver Pinecone", hello: ["A twig frame, carved by hand!", "Smell the wood, it's lovely."] },
      pozadi: { name: "Firefly gallery", npc: "Painter Glimmer", hello: ["I'll paint you a background that glows like fireflies.", "Pick the colours of the forest."] },
      mazlicci: { name: "Herbalist", npc: "Herbalist Melissa", hello: ["I have herbs and trinkets for your pet.", "This bunny is my best customer."] },
      lod: { name: "Treehouse", npc: "Treehouse", hello: ["Buildings for your city are made in the treehouse."] },
    },
    fireLabel: "Wave the magic wand",
    boom: "SHIM!",
    talk: {
      kralik: { label: "Pet the bunny", lines: ["Sniff, sniff… carrot?", "Hop hop!", "It's lovely here, isn't it?"] },
      kocka: { label: "Pet the cat", lines: ["Meow!", "Purr… scratch behind my ear.", "Meow meow!"] },
    },
  },
  de: {
    title: "Märchenwald",
    subtitle: "Eine Lichtung voller Glühwürmchen: Feen, Förster und Waldhandwerker verkaufen dir Zauberwaren für deine Lernpunkte.",
    stalls: {
      avatary: { name: "Waldschneiderei", npc: "Fee Blütenblatt", hello: ["Blätterkleider sitzen wie angegossen!", "Komm, ich nähe dir etwas aus Moos und Blüten."] },
      tituly: { name: "Försterhaus", npc: "Förster Moosmann", hello: ["Ich schreibe deinen Titel in die Waldchronik.", "Der Wald ehrt, wer lernt."] },
      ramecky: { name: "Schnitzwerkstatt", npc: "Schnitzer Zapfen", hello: ["Ein Zweigrahmen, von Hand geschnitzt!", "Riech mal am Holz, wie das duftet."] },
      pozadi: { name: "Glühwürmchen-Galerie", npc: "Malerin Glimmer", hello: ["Ich male dir einen Hintergrund, der wie Glühwürmchen leuchtet.", "Such dir die Farben des Waldes aus."] },
      mazlicci: { name: "Kräuterladen", npc: "Kräuterfrau Melisse", hello: ["Für dein Haustier habe ich Kräuter und Schmuck.", "Dieses Häschen ist mein bester Kunde."] },
      lod: { name: "Baumhaus", npc: "Baumhaus", hello: ["Gebäude für deine Stadt entstehen im Baumhaus."] },
    },
    fireLabel: "Zauberstab schwingen",
    boom: "SCHIMM!",
    talk: {
      kralik: { label: "Häschen streicheln", lines: ["Schnuppern… Karotte?", "Hopp hopp!", "Hier ist es schön, oder?"] },
      kocka: { label: "Katze streicheln", lines: ["Miau!", "Schnurr… kraul mich hinterm Ohr.", "Miau miau!"] },
    },
  },
  ru: {
    title: "Сказочный лес",
    subtitle: "Поляна, полная светлячков: феи, лесники и лесные мастера продают волшебные товары за баллы.",
    stalls: {
      avatary: { name: "Лесная швейная", npc: "Фея Лепесток", hello: ["Платья из листьев сидят как влитые!", "Иди, сошью тебе что-нибудь из мха и лепестков."] },
      tituly: { name: "Сторожка", npc: "Лесник Мшистый", hello: ["Запишу звание в лесную летопись.", "Лес чтит тех, кто учится."] },
      ramecky: { name: "Резная мастерская", npc: "Резчик Шишка", hello: ["Рамка из веточки, вырезана вручную!", "Понюхай, как пахнет дерево."] },
      pozadi: { name: "Галерея светлячков", npc: "Художница Светлячок", hello: ["Нарисую фон, который светится, как светлячки.", "Выбери краски леса."] },
      mazlicci: { name: "Травница", npc: "Травница Мелисса", hello: ["Для питомца у меня есть травы и украшения.", "Этот кролик — мой лучший покупатель."] },
      lod: { name: "Домик на дереве", npc: "Домик", hello: ["Постройки для твоего города делают в домике на дереве."] },
    },
    fireLabel: "Взмахнуть волшебной палочкой",
    boom: "ШИМ!",
    talk: {
      kralik: { label: "Погладить кролика", lines: ["Ню-ню… морковка?", "Прыг-скок!", "Здесь красиво, правда?"] },
      kocka: { label: "Погладить кошку", lines: ["Мяу!", "Мур… почеши за ушком.", "Мяу мяу!"] },
    },
  },
};

const castle: Record<Locale, WorldText> = {
  cs: {
    title: "Hrad a tržiště",
    subtitle: "Středověké tržiště pod hradbami: krejčí, král, kovář i sokolník prodávají zboží za body z učení.",
    stalls: {
      avatary: { name: "Krejčovství", npc: "Krejčí Jehlička", hello: ["Kostým pro rytíře i princeznu, jak si přeješ!", "Změřím tě a ušiju do zítřka."] },
      tituly: { name: "Královská kancelář", npc: "Král Koruna", hello: ["Jménem koruny ti propůjčuji titul!", "Kdo se učí, toho si král váží."] },
      ramecky: { name: "Kovárna", npc: "Kovář Důlek", hello: ["Rámeček z oceli, vykutý v ohni!", "Bum, bum! Tohle vydrží i dračí dech."] },
      pozadi: { name: "Tkalcovna", npc: "Tkadlena Příze", hello: ["Utkám ti pozadí z nejlepších nití.", "Prohlédni si moje gobelíny."] },
      mazlicci: { name: "Sokolna", npc: "Sokolník Pírko", hello: ["Pro mazlíčka mám ozdoby jako pro šlechtice.", "Sokol nesmí na ruku každému."] },
      lod: { name: "Hradní věž", npc: "Věž", hello: ["Stavby pro tvé město vznikají v hradní huti."] },
    },
    fireLabel: "Vystřelit z katapultu",
    boom: "BUM!",
    talk: {
      pes: { label: "Pohladit psa", lines: ["Haf haf!", "Hlídám tržiště!", "Máš pro mě kost?"] },
      slepice: { label: "Promluvit se slepicí", lines: ["Kokodák!", "Dnes snesu zlaté vejce.", "Kdák kdák!"] },
    },
  },
  en: {
    title: "Castle and market",
    subtitle: "A medieval market under the castle walls: the tailor, the king, the blacksmith and the falconer sell goods for learning points.",
    stalls: {
      avatary: { name: "Tailor", npc: "Tailor Needle", hello: ["A costume for a knight or a princess, as you wish!", "I'll measure you and sew it by tomorrow."] },
      tituly: { name: "Royal office", npc: "King Crown", hello: ["By the crown I grant you this title!", "The king values those who learn."] },
      ramecky: { name: "Smithy", npc: "Smith Dent", hello: ["A steel frame, forged in fire!", "Bang, bang! It even survives dragon breath."] },
      pozadi: { name: "Weaver", npc: "Weaver Thread", hello: ["I'll weave you a background from the finest threads.", "Have a look at my tapestries."] },
      mazlicci: { name: "Falconry", npc: "Falconer Feather", hello: ["I have noble trinkets for your pet.", "The falcon doesn't land on everyone's hand."] },
      lod: { name: "Castle tower", npc: "Tower", hello: ["Buildings for your city are made in the castle works."] },
    },
    fireLabel: "Fire the catapult",
    boom: "BOOM!",
    talk: {
      pes: { label: "Pet the dog", lines: ["Woof woof!", "I guard the market!", "Got a bone for me?"] },
      slepice: { label: "Talk to the hen", lines: ["Bawk!", "Today I lay a golden egg.", "Cluck cluck!"] },
    },
  },
  de: {
    title: "Burg und Markt",
    subtitle: "Ein mittelalterlicher Markt unter den Burgmauern: Schneider, König, Schmied und Falkner verkaufen Waren für deine Lernpunkte.",
    stalls: {
      avatary: { name: "Schneiderei", npc: "Schneider Nadel", hello: ["Ein Kostüm für Ritter oder Prinzessin, wie du willst!", "Ich messe dich aus und nähe es bis morgen."] },
      tituly: { name: "Königliches Büro", npc: "König Krone", hello: ["Im Namen der Krone verleihe ich dir diesen Titel!", "Der König schätzt, wer lernt."] },
      ramecky: { name: "Schmiede", npc: "Schmied Beule", hello: ["Ein Stahlrahmen, im Feuer geschmiedet!", "Bumm, bumm! Hält sogar Drachenatem aus."] },
      pozadi: { name: "Weberei", npc: "Weberin Faden", hello: ["Ich webe dir einen Hintergrund aus feinsten Fäden.", "Sieh dir meine Wandteppiche an."] },
      mazlicci: { name: "Falknerei", npc: "Falkner Feder", hello: ["Für dein Haustier habe ich edlen Schmuck.", "Der Falke setzt sich nicht auf jede Hand."] },
      lod: { name: "Burgturm", npc: "Turm", hello: ["Gebäude für deine Stadt entstehen in der Burghütte."] },
    },
    fireLabel: "Katapult abfeuern",
    boom: "BUMM!",
    talk: {
      pes: { label: "Hund streicheln", lines: ["Wau wau!", "Ich bewache den Markt!", "Hast du einen Knochen für mich?"] },
      slepice: { label: "Mit dem Huhn reden", lines: ["Gack!", "Heute lege ich ein goldenes Ei.", "Gack gack!"] },
    },
  },
  ru: {
    title: "Замок и рынок",
    subtitle: "Средневековый рынок под стенами замка: портной, король, кузнец и сокольник продают товары за баллы.",
    stalls: {
      avatary: { name: "Портняжная", npc: "Портной Иголка", hello: ["Костюм для рыцаря или принцессы — как пожелаешь!", "Сниму мерки и сошью к завтрашнему дню."] },
      tituly: { name: "Королевская канцелярия", npc: "Король Корона", hello: ["Именем короны жалую тебе звание!", "Король ценит тех, кто учится."] },
      ramecky: { name: "Кузница", npc: "Кузнец Вмятина", hello: ["Стальная рамка, выкованная в огне!", "Бум, бум! Выдержит даже дыхание дракона."] },
      pozadi: { name: "Ткацкая", npc: "Ткачиха Пряжа", hello: ["Выткаю тебе фон из лучших нитей.", "Взгляни на мои гобелены."] },
      mazlicci: { name: "Соколиный двор", npc: "Сокольник Перо", hello: ["Для питомца у меня благородные украшения.", "Сокол садится не на каждую руку."] },
      lod: { name: "Башня замка", npc: "Башня", hello: ["Постройки для твоего города делают в замковой мастерской."] },
    },
    fireLabel: "Выстрелить из катапульты",
    boom: "БУМ!",
    talk: {
      pes: { label: "Погладить пса", lines: ["Гав-гав!", "Я охраняю рынок!", "Косточка для меня есть?"] },
      slepice: { label: "Поговорить с курицей", lines: ["Ко-ко!", "Сегодня снесу золотое яйцо.", "Куд-кудах!"] },
    },
  },
};

const sea: Record<Locale, WorldText> = {
  cs: {
    title: "Podmořské město",
    subtitle: "Perleťové město na mořském dně: mořské panny, potápěči a mágové ti prodají mořské zboží za body z učení.",
    stalls: {
      avatary: { name: "Mušlová převlékárna", npc: "Mořská panna Perla", hello: ["Ploutve nebo skafandr? Vyber si!", "Mušle ti sluší, věř mi."] },
      tituly: { name: "Perlová kancelář", npc: "Kapitán Hlubina", hello: ["Zapíšu ti titul do lodního deníku hlubin.", "Bublinky, bublinky… hotovo!"] },
      ramecky: { name: "Korálová dílna", npc: "Perlař Perlík", hello: ["Rámeček z korálu a perel, jedinečný!", "Perla k perle se skvěle hodí."] },
      pozadi: { name: "Galerie medúz", npc: "Mág Mušle", hello: ["Vyčaruji ti pozadí z mořských světel.", "Medúzy tě rády osvětlí."] },
      mazlicci: { name: "Akvárium", npc: "Delfínka", hello: ["Pro tvého mazlíčka mám ozdoby z moře.", "Ryby jsou moje nejlepší kamarádky."] },
      lod: { name: "Ponorka", npc: "Ponorka", hello: ["Stavby pro tvé město se vyrábějí v ponorkovém doku."] },
    },
    fireLabel: "Vypustit bublinu",
    boom: "BLUB!",
    talk: {
      ryba: { label: "Promluvit s rybkou", lines: ["Bublub!", "Plav se mnou!", "Mám hlad, máš krmení?"] },
      krab: { label: "Promluvit s krabem", lines: ["Klap klap!", "Bokem se jde nejlíp.", "Pozor na mé kleště!"] },
    },
  },
  en: {
    title: "Underwater city",
    subtitle: "A pearly city on the seabed: mermaids, divers and mages sell sea goods for your learning points.",
    stalls: {
      avatary: { name: "Shell dressing room", npc: "Mermaid Pearl", hello: ["Fins or a diving suit? Your pick!", "Shells suit you, trust me."] },
      tituly: { name: "Pearl office", npc: "Captain Deep", hello: ["I'll write your title in the deep-sea logbook.", "Bubbles, bubbles… done!"] },
      ramecky: { name: "Coral workshop", npc: "Pearl smith Perlie", hello: ["A frame of coral and pearls, one of a kind!", "Pearl to pearl, a perfect match."] },
      pozadi: { name: "Jellyfish gallery", npc: "Mage Mussel", hello: ["I'll conjure a background from sea lights.", "The jellyfish love to light you up."] },
      mazlicci: { name: "Aquarium", npc: "Dolphina", hello: ["I have sea trinkets for your pet.", "Fish are my best friends."] },
      lod: { name: "Submarine", npc: "Submarine", hello: ["Buildings for your city are made in the submarine dock."] },
    },
    fireLabel: "Release a bubble",
    boom: "BLUB!",
    talk: {
      ryba: { label: "Talk to the fish", lines: ["Blubble!", "Swim with me!", "I'm hungry, got any food?"] },
      krab: { label: "Talk to the crab", lines: ["Click clack!", "Sideways is the best way.", "Mind my claws!"] },
    },
  },
  de: {
    title: "Unterwasserstadt",
    subtitle: "Eine perlmuttfarbene Stadt auf dem Meeresgrund: Meerjungfrauen, Taucher und Magier verkaufen dir Meereswaren für deine Lernpunkte.",
    stalls: {
      avatary: { name: "Muschel-Umkleide", npc: "Meerjungfrau Perle", hello: ["Flossen oder Taucheranzug? Such dir was aus!", "Muscheln stehen dir, glaub mir."] },
      tituly: { name: "Perlenbüro", npc: "Kapitän Tiefe", hello: ["Ich trage deinen Titel ins Tiefsee-Logbuch ein.", "Blubb, blubb… fertig!"] },
      ramecky: { name: "Korallenwerkstatt", npc: "Perlmeister Perli", hello: ["Ein Rahmen aus Koralle und Perlen, ein Unikat!", "Perle zu Perle, passt perfekt."] },
      pozadi: { name: "Quallen-Galerie", npc: "Magier Muschel", hello: ["Ich zaubere dir einen Hintergrund aus Meereslichtern.", "Die Quallen leuchten dich gern an."] },
      mazlicci: { name: "Aquarium", npc: "Delfina", hello: ["Für dein Haustier habe ich Meeresschmuck.", "Fische sind meine besten Freunde."] },
      lod: { name: "U-Boot", npc: "U-Boot", hello: ["Gebäude für deine Stadt entstehen im U-Boot-Dock."] },
    },
    fireLabel: "Blase aufsteigen lassen",
    boom: "BLUBB!",
    talk: {
      ryba: { label: "Mit dem Fisch reden", lines: ["Blubber!", "Schwimm mit mir!", "Ich habe Hunger, hast du Futter?"] },
      krab: { label: "Mit der Krabbe reden", lines: ["Klack klack!", "Seitwärts geht es am besten.", "Vorsicht, meine Scheren!"] },
    },
  },
  ru: {
    title: "Подводный город",
    subtitle: "Жемчужный город на морском дне: русалки, водолазы и маги продают морские товары за баллы.",
    stalls: {
      avatary: { name: "Раковинная раздевалка", npc: "Русалка Жемчужинка", hello: ["Плавники или скафандр? Выбирай!", "Ракушки тебе к лицу, поверь."] },
      tituly: { name: "Жемчужная канцелярия", npc: "Капитан Глубина", hello: ["Запишу звание в судовой журнал глубин.", "Пузырьки, пузырьки… готово!"] },
      ramecky: { name: "Коралловая мастерская", npc: "Жемчужник Перлик", hello: ["Рамка из кораллов и жемчуга, единственная!", "Жемчужинка к жемчужинке — идеально."] },
      pozadi: { name: "Галерея медуз", npc: "Маг Ракушка", hello: ["Наколдую фон из морских огней.", "Медузы с радостью тебя осветят."] },
      mazlicci: { name: "Аквариум", npc: "Дельфинка", hello: ["Для питомца у меня морские украшения.", "Рыбки — мои лучшие подружки."] },
      lod: { name: "Подлодка", npc: "Подлодка", hello: ["Постройки для твоего города делают в доке подлодок."] },
    },
    fireLabel: "Выпустить пузырь",
    boom: "БУЛЬК!",
    talk: {
      ryba: { label: "Поговорить с рыбкой", lines: ["Бульк-бульк!", "Плыви со мной!", "Я голодна, есть корм?"] },
      krab: { label: "Поговорить с крабом", lines: ["Клац-клац!", "Боком ходить лучше всего.", "Осторожно, мои клешни!"] },
    },
  },
};

const unlock: Record<Locale, UnlockText> = {
  cs: { title: "Odemknout svět", text: "Svět „{name}“ se odemkne na úrovni {level} a stojí {points} bodů.", button: "Odemknout za {points} ⭐", needLevel: "Chybí ti úroveň {level}", needPoints: "Chybí ti {n} bodů", done: "Svět je odemčený!", locked: "Zamčeno" },
  en: { title: "Unlock world", text: "The world “{name}” unlocks at level {level} and costs {points} points.", button: "Unlock for {points} ⭐", needLevel: "You need level {level}", needPoints: "You need {n} more points", done: "World unlocked!", locked: "Locked" },
  de: { title: "Welt freischalten", text: "Die Welt „{name}“ wird ab Level {level} freigeschaltet und kostet {points} Punkte.", button: "Für {points} ⭐ freischalten", needLevel: "Dir fehlt Level {level}", needPoints: "Dir fehlen {n} Punkte", done: "Welt freigeschaltet!", locked: "Gesperrt" },
  ru: { title: "Открыть мир", text: "Мир «{name}» откроется на уровне {level} и стоит {points} баллов.", button: "Открыть за {points} ⭐", needLevel: "Нужен уровень {level}", needPoints: "Не хватает {n} баллов", done: "Мир открыт!", locked: "Закрыто" },
};

export function getUnlockText(locale: Locale): UnlockText {
  return unlock[locale];
}

export function getWorldText(locale: Locale, world: string): WorldText {
  if (world === "space") return space[locale];
  if (world === "forest") return forest[locale];
  if (world === "castle") return castle[locale];
  if (world === "sea") return sea[locale];
  const m = getMarketText(locale);
  return {
    title: m.title,
    subtitle: m.subtitle,
    stalls: m.stalls,
    fireLabel: m.cannon,
    boom: m.boom,
    talk: { papousek: { label: m.parrotLabel, lines: m.parrot } },
  };
}

export type TownText = { tab: string; title: string; subtitle: string; walking: string; sheet: string; locked: string; talk: Record<string, { label: string; lines: string[] }> };
const town: Record<Locale, TownText> = {
  cs: {
    tab: "Městečko",
    title: "Městečko",
    subtitle: "Začni procházkou po městečku. Po schodech dolů je pirátský přístav, na louce stojí raketa na vesmírnou stanici. Klikni na místo, kam chceš jít.",
    walking: "Jdeme…",
    sheet: "Raketa na vesmírnou stanici",
    locked: "zamčeno",
    talk: {
      knihovnice: { label: "Promluvit s knihovnicí", lines: ["Kdo čte, ten roste!", "Nové knížky jsou na polici u okna.", "Pšt! V knihovně se šeptá."] },
      pekar: { label: "Promluvit s pekařem", lines: ["Čerstvé rohlíky, ještě teplé!", "Za učení si zasloužíš koláč.", "Mňam, to voní!"] },
      kluk: { label: "Promluvit s klukem", lines: ["Hele, v přístavu je pravá loď!", "Až budu velký, poletím na stanici!", "Honem, ať nepromeškáme zábavu."] },
      kocka: { label: "Pohladit kočku", lines: ["Mňau!", "Prrr…", "Mňau mňau!"] },
    },
  },
  en: {
    tab: "Town",
    title: "Town",
    subtitle: "Start with a walk around town. Down the stairs is the pirate harbour, and on the meadow stands the rocket to the space station. Click where you want to go.",
    walking: "On our way…",
    sheet: "Rocket to the space station",
    locked: "locked",
    talk: {
      knihovnice: { label: "Talk to the librarian", lines: ["Who reads, grows!", "New books are on the shelf by the window.", "Shh! We whisper in the library."] },
      pekar: { label: "Talk to the baker", lines: ["Fresh rolls, still warm!", "You deserve a cake for learning.", "Yum, smells great!"] },
      kluk: { label: "Talk to the boy", lines: ["Look, there's a real ship in the harbour!", "When I grow up I'll fly to the station!", "Hurry, we'll miss the fun."] },
      kocka: { label: "Pet the cat", lines: ["Meow!", "Purr…", "Meow meow!"] },
    },
  },
  de: {
    tab: "Städtchen",
    title: "Städtchen",
    subtitle: "Beginne mit einem Spaziergang durchs Städtchen. Die Treppe hinunter liegt der Piratenhafen, auf der Wiese steht die Rakete zur Raumstation. Klicke, wohin du willst.",
    walking: "Wir gehen…",
    sheet: "Rakete zur Raumstation",
    locked: "gesperrt",
    talk: {
      knihovnice: { label: "Mit der Bibliothekarin sprechen", lines: ["Wer liest, wächst!", "Neue Bücher stehen im Regal am Fenster.", "Psst! In der Bibliothek flüstert man."] },
      pekar: { label: "Mit dem Bäcker sprechen", lines: ["Frische Brötchen, noch warm!", "Fürs Lernen verdienst du einen Kuchen.", "Mmm, wie das duftet!"] },
      kluk: { label: "Mit dem Jungen sprechen", lines: ["Schau, im Hafen liegt ein echtes Schiff!", "Wenn ich groß bin, fliege ich zur Station!", "Schnell, sonst verpassen wir den Spaß."] },
      kocka: { label: "Katze streicheln", lines: ["Miau!", "Schnurr…", "Miau miau!"] },
    },
  },
  ru: {
    tab: "Городок",
    title: "Городок",
    subtitle: "Начни с прогулки по городку. По лестнице вниз — пиратская гавань, а на лугу стоит ракета на космическую станцию. Нажми, куда хочешь пойти.",
    walking: "Идём…",
    sheet: "Ракета на космическую станцию",
    locked: "закрыто",
    talk: {
      knihovnice: { label: "Поговорить с библиотекарем", lines: ["Кто читает, тот растёт!", "Новые книги на полке у окна.", "Тсс! В библиотеке говорят шёпотом."] },
      pekar: { label: "Поговорить с пекарем", lines: ["Свежие булочки, ещё тёплые!", "За учёбу ты заслужил пирог.", "Ммм, как пахнет!"] },
      kluk: { label: "Поговорить с мальчиком", lines: ["Смотри, в гавани настоящий корабль!", "Вырасту — полечу на станцию!", "Скорее, а то пропустим веселье."] },
      kocka: { label: "Погладить кошку", lines: ["Мяу!", "Мур…", "Мяу мяу!"] },
    },
  },
};
export function getTownText(locale: Locale): TownText {
  return town[locale];
}

export function getSkipText(locale: Locale): { skip: string; soundOn: string; soundOff: string } {
  return {
    cs: { skip: "Přeskočit", soundOn: "Vypnout zvuky", soundOff: "Zapnout zvuky" },
    en: { skip: "Skip", soundOn: "Mute sounds", soundOff: "Unmute sounds" },
    de: { skip: "Überspringen", soundOn: "Ton ausschalten", soundOff: "Ton einschalten" },
    ru: { skip: "Пропустить", soundOn: "Выключить звук", soundOff: "Включить звук" },
  }[locale];
}
