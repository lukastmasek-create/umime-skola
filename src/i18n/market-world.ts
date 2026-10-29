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
