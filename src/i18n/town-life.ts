import type { Locale } from "./config";
import type { GiftId, NpcKey } from "@/lib/town-npc";

// Texty života v městečku: obyvatelé (dialogy, dárky, otázky), úvodní projížďka, denní události a oslava po splnění úkolů.
export type NpcText = { name: string; role: string; greet: string[]; chat: string[]; likeHint: string };
export type EventText = { id: "festival" | "fireworks" | "rain" | "balloons" | "market"; title: string; caption: string };
export type TownLifeText = {
  npc: Record<NpcKey, NpcText>;
  ui: {
    talk: string;
    ask: string;
    gift: string;
    close: string;
    friendship: string;
    login: string;
    notEnough: string;
    alreadyTalked: string;
    alreadyGifted: string;
    noMoreQuestions: string;
    noQuestions: string;
    questionIntro: string;
    correct: string;
    wrong: string;
    explanation: string;
    giftLiked: string;
    giftOther: string;
    levelUp: string;
    gained: string;
    chooseGift: string;
    points: string;
    replay: string;
    error: string;
    thanks: string;
    nextQuestion: string;
  };
  gifts: Record<GiftId, string>;
  // úvodní prohlídka: vypravěčka provede hrdinu městečkem
  tour: { hello: string; top: string; you: string; heroHi: string; npcs: string; school: string; harbor: string; rocket: string; controls: string };
  locked: string;
  next: string;
  events: EventText[];
  reward: { title: string; caption: string };
  ambient: string[];
  morning: string;
  evening: string;
};

const cs: TownLifeText = {
  npc: {
    knihovnice: { name: "Knihovnice Lenka", role: "Strážkyně knih", greet: ["Ahoj! Už jsi dnes něco přečetl/a?", "Pšt, tady se čte!"], chat: ["Kdo čte, ten ví. A kdo ví, ten vyhrává!", "Nejlepší knihy mají dobrou vůni a ještě lepší konec.", "Zkus si dnes zopakovat to, co ti nejde. Půjde to!", "Věděl/a jsi, že slovo „knihovna“ je starší než tisk?"], likeHint: "Má ráda knížky." },
    pekar: { name: "Pekař Honza", role: "Mistr pečiva", greet: ["Čerstvé rohlíky! Ještě teplé!", "Dobré ráno! Rohlík?"], chat: ["Pečení je matematika: půl hrnku, dvě lžíce a špetka trpělivosti.", "Nejlepší vůně na světě? Čerstvý chleba!", "Když se ti nedaří, zkus to znovu. Těsto taky vždy nevyjde na poprvé.", "Pětkrát osm, to je čtyřicet rohlíků za dnešek!"], likeHint: "Miluje sladké dobroty." },
    kluk: { name: "Kuba", role: "Kluk s míčem", greet: ["Ahoj! Dáš si se mnou míčovou?", "Hele, vidíš ten míč?"], chat: ["Ve škole jsem dnes dostal jedničku! Skoro.", "Jsem rychlejší než pes. Skoro!", "Když se učím, hned mi jde i fotbal.", "Víš, kde je nejlepší hřiště? U fontány!"], likeHint: "Rád si pochutná na koláči." },
    farmar: { name: "Farmář Vláďa", role: "Farmář", greet: ["Nazdar! Slunce svítí, tak se dává!", "Ahoj, sousede!"], chat: ["Slepice snesly dnes celých dvanáct vajec!", "Půda dá, co do ní vložíš. Učení je stejné.", "Když svítí slunce a prší zároveň, bývá duha.", "Ovečky mají nejraději jetel."], likeHint: "Potěší ho kytička." },
    babicka: { name: "Babička Růžena", role: "Babička s košíkem", greet: ["Dobrý den, zlatíčko!", "Pojď si sednout, vyprávím ti příběh."], chat: ["Za mých časů jsme se učili básničky nazpaměť.", "Kdo se učí, nemůže zestárnout!", "V košíku nesu čerstvý chleba a jablka.", "Kdo se směje naposled, ten se směje nejlíp."], likeHint: "Má ráda květiny." },
    kocka: { name: "Micka", role: "Kočka", greet: ["Mňau!", "Mrrr…"], chat: ["Mňau! (Dnes jsem spala jen šestnáct hodin.)", "Mrrr… (škrábej mě za uchem)", "Mňau. (Nejradši bych dostala koláč.)"], likeHint: "Mňau, mlsná." },
    ovce: { name: "Ovečka Bělka", role: "Ovečka", greet: ["Bééé!", "Béé? Ahoj!"], chat: ["Béééé! (Vlna už zase roste!)", "Bé! (Tráva dnes chutná výborně.)", "Bébé. (Počítám sama sebe, abych usnula.)"], likeHint: "Béé, kytičky!" },
    slepice: { name: "Slepička Kvočna", role: "Slepice", greet: ["Kvok kvok!", "Kvokvok!"], chat: ["Kvok! (Dnes jsem snesla zlaté vejce!)", "Kvokvokvok! (Nesu a nesu.)", "Kvok. (Najdeš ten pytlík zrní?)"], likeHint: "Kvok, kytička!" },
  },
  ui: {
    talk: "Popovídat si",
    ask: "Otázka z učiva",
    gift: "Dát dárek",
    close: "Zavřít",
    friendship: "Přátelství",
    login: "Přihlas se, ať ti městečko pamatuje přátele.",
    notEnough: "Na dárek nemáš dost bodů.",
    alreadyTalked: "Dnes jste si už povídali. Zítra zase!",
    alreadyGifted: "Dnes už dárek dostal/a. Zítra zase!",
    noMoreQuestions: "Na dnes už otázek stačilo.",
    noQuestions: "Tenhle obyvatel se neptá.",
    questionIntro: "Poradíš mi?",
    correct: "Správně! Skvělá práce!",
    wrong: "Tohle se nepovedlo, ale nevadí.",
    explanation: "Vysvětlení",
    giftLiked: "Tohle je přesně to, co mám ráda! Děkuju!",
    giftOther: "Děkuju, to je od tebe hezké!",
    levelUp: "Nové srdíčko! Bonus {n} bodů",
    gained: "Získal/a jsi {n} bodů",
    chooseGift: "Co dáš?",
    points: "bodů",
    replay: "Přehrát úvod",
    error: "Něco se nepovedlo, zkus to znovu.",
    thanks: "Díky!",
    nextQuestion: "Další otázka",
  },
  gifts: { flower: "Kytička", book: "Kniha", cake: "Koláč" },
  tour: { hello: "Vítej v našem městečku! Jsem knihovnice Lenka a provedu tě.", top: "Nahoře na kopci je pohádkový les a starý hrad. Brány se otevřou, až je odemkneš.", you: "A tohle jsi ty! Pojďme se seznámit se sousedy.", heroHi: "Ahoj!", npcs: "Na obyvatele klikni a popovídej si. Ptají se na učivo, a když jim pomůžeš nebo dáš dárek, získáš srdíčka.", school: "Ve škole najdeš kurzy, v herně hry a na nástěnce úkoly na každý den.", harbor: "Z přístavu vyplouvá pirátská loď do obchodu s odměnami.", rocket: "A raketa tě vezme až do vesmíru!", controls: "Chodíš šipkami nebo WASD, do budov vejdeš klávesou E nebo kliknutím. A hledej poklady dne!" },
  locked: "Sem se zatím nedostaneš: {name} se odemyká v obchodě. Pojďme se tam podívat!",
  next: "Dál",
  events: [
    { id: "festival", title: "Slavnost lampionů", caption: "Dnes je v městečku slavnost lampionů!" },
    { id: "fireworks", title: "Ohňostroj", caption: "Pozor, nad městečkem vzlétají rakety ohňostroje!" },
    { id: "rain", title: "Duha po dešti", caption: "Právě přešel déšť a na obloze se objevila duha." },
    { id: "balloons", title: "Balónková show", caption: "Nad městečkem létají barevné balóny." },
    { id: "market", title: "Trhy", caption: "Dnes jsou v městečku trhy a všude to voní." },
  ],
  reward: { title: "Všechno hotovo!", caption: "Splnil/a jsi všechno, co městečko dnes potřebovalo. Hurá!" },
  ambient: ["Dnes je krásně!", "Slyšel/a jsi to?", "Až budu velká, budu učitelka.", "Kdo má chuť na rohlík?"],
  morning: "Dobré ráno!",
  evening: "Dobrý večer!",
};

const en: TownLifeText = {
  npc: {
    knihovnice: { name: "Librarian Lenka", role: "Keeper of books", greet: ["Hello! Have you read anything today?", "Shh, this is a reading place!"], chat: ["Who reads, knows. And who knows, wins!", "The best books smell lovely and end even better.", "Try repeating what is hard today. You can do it!", "Did you know the word “library” is older than printing?"], likeHint: "She loves books." },
    pekar: { name: "Baker Joe", role: "Master of pastry", greet: ["Fresh rolls! Still warm!", "Good morning! A roll?"], chat: ["Baking is maths: half a cup, two spoons and a pinch of patience.", "The best smell in the world? Fresh bread!", "If it fails, try again. Dough does not work out the first time either.", "Five times eight is forty rolls for today!"], likeHint: "He adores sweets." },
    kluk: { name: "Jake", role: "Boy with a ball", greet: ["Hi! Want to play ball with me?", "Hey, see that ball?"], chat: ["I almost got an A at school today!", "I am faster than the dog. Almost!", "When I study, football gets easier too.", "The best pitch is by the fountain!"], likeHint: "He likes pie." },
    farmar: { name: "Farmer Ben", role: "Farmer", greet: ["Hello! The sun is shining, let us get going!", "Hi, neighbour!"], chat: ["The hens laid twelve eggs today!", "The soil gives what you put in. Learning is the same.", "When sun and rain come together, there is a rainbow.", "Sheep love clover best."], likeHint: "He enjoys flowers." },
    babicka: { name: "Granny Rose", role: "Granny with a basket", greet: ["Hello, dear!", "Come and sit, I will tell you a story."], chat: ["In my day we learned poems by heart.", "Those who learn never grow old!", "In my basket: fresh bread and apples.", "He who laughs last laughs best."], likeHint: "She loves flowers." },
    kocka: { name: "Mitzi", role: "Cat", greet: ["Meow!", "Purr…"], chat: ["Meow! (I only slept sixteen hours today.)", "Purr… (scratch me behind the ear)", "Meow. (I would love a pie.)"], likeHint: "Meow, a sweet tooth." },
    ovce: { name: "Fluffy", role: "Sheep", greet: ["Baaa!", "Baa? Hi!"], chat: ["Baaa! (My wool is growing again!)", "Baa! (The grass tastes great today.)", "Baabaa. (I count myself to fall asleep.)"], likeHint: "Baa, flowers!" },
    slepice: { name: "Cluck", role: "Hen", greet: ["Cluck cluck!", "Bawk!"], chat: ["Cluck! (Today I laid a golden egg!)", "Cluck cluck! (I lay and lay.)", "Cluck. (Can you find the grain sack?)"], likeHint: "Cluck, a flower!" },
  },
  ui: {
    talk: "Have a chat",
    ask: "School question",
    gift: "Give a gift",
    close: "Close",
    friendship: "Friendship",
    login: "Log in so the town remembers your friends.",
    notEnough: "You do not have enough points for a gift.",
    alreadyTalked: "You already chatted today. See you tomorrow!",
    alreadyGifted: "Already got a gift today. Tomorrow again!",
    noMoreQuestions: "That is enough questions for today.",
    noQuestions: "This resident does not ask questions.",
    questionIntro: "Can you help me?",
    correct: "Correct! Great job!",
    wrong: "That one did not work out, never mind.",
    explanation: "Explanation",
    giftLiked: "Exactly what I love! Thank you!",
    giftOther: "Thank you, that is kind of you!",
    levelUp: "New heart! Bonus {n} points",
    gained: "You earned {n} points",
    chooseGift: "What will you give?",
    points: "points",
    replay: "Replay intro",
    error: "Something went wrong, try again.",
    thanks: "Thanks!",
    nextQuestion: "Next question",
  },
  gifts: { flower: "Flower", book: "Book", cake: "Pie" },
  tour: { hello: "Welcome to our little town! I'm Lenka the librarian and I'll show you around.", top: "Up on the hill are the fairy forest and the old castle. Their gates open once you unlock them.", you: "And this is you! Let's meet the neighbours.", heroHi: "Hi!", npcs: "Click a resident to chat. They ask about school topics, and helping them or giving gifts earns you hearts.", school: "The school has courses, the arcade has games and the board has daily quests.", harbor: "From the harbour a pirate ship sails to the reward shop.", rocket: "And the rocket takes you all the way to space!", controls: "Walk with the arrow keys or WASD, enter buildings with E or a click. And look for today's treasures!" },
  locked: "You can't go here yet: {name} is unlocked in the shop. Let's take a look there!",
  next: "Next",
  events: [
    { id: "festival", title: "Lantern festival", caption: "Today is the lantern festival in town!" },
    { id: "fireworks", title: "Fireworks", caption: "Look out, fireworks are flying over the town!" },
    { id: "rain", title: "Rainbow after rain", caption: "The rain has just passed and a rainbow appeared." },
    { id: "balloons", title: "Balloon show", caption: "Colourful balloons float over the town." },
    { id: "market", title: "Market day", caption: "It is market day and everything smells wonderful." },
  ],
  reward: { title: "All done!", caption: "You finished everything the town needed today. Hooray!" },
  ambient: ["What a lovely day!", "Did you hear that?", "When I grow up I will be a teacher.", "Who wants a roll?"],
  morning: "Good morning!",
  evening: "Good evening!",
};

const de: TownLifeText = {
  npc: {
    knihovnice: { name: "Bibliothekarin Lena", role: "Hüterin der Bücher", greet: ["Hallo! Hast du heute schon gelesen?", "Pst, hier wird gelesen!"], chat: ["Wer liest, weiß. Und wer weiß, gewinnt!", "Die besten Bücher duften gut und enden noch besser.", "Wiederhole heute, was schwerfällt. Du schaffst das!", "Wusstest du, dass „Bibliothek“ älter als der Buchdruck ist?"], likeHint: "Sie liebt Bücher." },
    pekar: { name: "Bäcker Jo", role: "Meister des Gebäcks", greet: ["Frische Brötchen! Noch warm!", "Guten Morgen! Ein Brötchen?"], chat: ["Backen ist Mathe: eine halbe Tasse, zwei Löffel und eine Prise Geduld.", "Der beste Duft der Welt? Frisches Brot!", "Wenn es misslingt, versuch es nochmal. Teig klappt auch nicht gleich.", "Fünfmal acht sind vierzig Brötchen für heute!"], likeHint: "Er liebt Süßes." },
    kluk: { name: "Kuno", role: "Junge mit Ball", greet: ["Hi! Spielst du Ball mit mir?", "Hey, siehst du den Ball?"], chat: ["Heute hätte ich fast eine Eins bekommen!", "Ich bin schneller als der Hund. Fast!", "Wenn ich lerne, klappt auch Fußball besser.", "Der beste Platz ist am Brunnen!"], likeHint: "Er mag Kuchen." },
    farmar: { name: "Bauer Ben", role: "Bauer", greet: ["Hallo! Die Sonne scheint, auf geht's!", "Hallo, Nachbar!"], chat: ["Die Hühner haben heute zwölf Eier gelegt!", "Der Boden gibt, was man hineinsteckt. Lernen auch.", "Wenn Sonne und Regen zusammen kommen, gibt es einen Regenbogen.", "Schafe lieben Klee am meisten."], likeHint: "Er freut sich über Blumen." },
    babicka: { name: "Oma Rosa", role: "Oma mit Korb", greet: ["Guten Tag, Schatz!", "Komm, setz dich, ich erzähle dir eine Geschichte."], chat: ["Zu meiner Zeit lernten wir Gedichte auswendig.", "Wer lernt, wird nie alt!", "In meinem Korb: frisches Brot und Äpfel.", "Wer zuletzt lacht, lacht am besten."], likeHint: "Sie liebt Blumen." },
    kocka: { name: "Mieze", role: "Katze", greet: ["Miau!", "Schnurr…"], chat: ["Miau! (Ich habe heute nur sechzehn Stunden geschlafen.)", "Schnurr… (kraul mich hinterm Ohr)", "Miau. (Ich hätte gern ein Stück Kuchen.)"], likeHint: "Miau, Naschkatze." },
    ovce: { name: "Wolli", role: "Schaf", greet: ["Mäh!", "Mäh? Hallo!"], chat: ["Määäh! (Meine Wolle wächst wieder!)", "Mäh! (Das Gras schmeckt heute prima.)", "Mähmäh. (Ich zähle mich selbst zum Einschlafen.)"], likeHint: "Mäh, Blumen!" },
    slepice: { name: "Glucke", role: "Henne", greet: ["Gack gack!", "Gackgack!"], chat: ["Gack! (Heute habe ich ein goldenes Ei gelegt!)", "Gackgackgack! (Ich lege und lege.)", "Gack. (Findest du den Kornsack?)"], likeHint: "Gack, eine Blume!" },
  },
  ui: {
    talk: "Plaudern",
    ask: "Lernfrage",
    gift: "Geschenk machen",
    close: "Schließen",
    friendship: "Freundschaft",
    login: "Melde dich an, damit die Stadt sich deine Freunde merkt.",
    notEnough: "Für ein Geschenk hast du nicht genug Punkte.",
    alreadyTalked: "Ihr habt heute schon geplaudert. Bis morgen!",
    alreadyGifted: "Heute schon ein Geschenk bekommen. Morgen wieder!",
    noMoreQuestions: "Für heute reichen die Fragen.",
    noQuestions: "Dieser Bewohner stellt keine Fragen.",
    questionIntro: "Kannst du mir helfen?",
    correct: "Richtig! Tolle Arbeit!",
    wrong: "Das hat nicht geklappt, macht nichts.",
    explanation: "Erklärung",
    giftLiked: "Genau das liebe ich! Danke!",
    giftOther: "Danke, das ist nett von dir!",
    levelUp: "Neues Herz! Bonus {n} Punkte",
    gained: "Du hast {n} Punkte bekommen",
    chooseGift: "Was schenkst du?",
    points: "Punkte",
    replay: "Intro erneut ansehen",
    error: "Etwas ging schief, versuch es nochmal.",
    thanks: "Danke!",
    nextQuestion: "Nächste Frage",
  },
  gifts: { flower: "Blume", book: "Buch", cake: "Kuchen" },
  tour: { hello: "Willkommen in unserem Städtchen! Ich bin Lena, die Bibliothekarin, und zeige dir alles.", top: "Oben auf dem Hügel liegen der Märchenwald und die alte Burg. Ihre Tore öffnen sich, sobald du sie freischaltest.", you: "Und das bist du! Lass uns die Nachbarn kennenlernen.", heroHi: "Hallo!", npcs: "Klick auf die Bewohner und plaudere mit ihnen. Sie stellen Fragen zum Lernstoff, und für Hilfe oder Geschenke bekommst du Herzen.", school: "In der Schule findest du Kurse, in der Spielhalle Spiele und am Brett die Tagesaufgaben.", harbor: "Vom Hafen segelt ein Piratenschiff zum Belohnungsladen.", rocket: "Und die Rakete bringt dich bis ins All!", controls: "Laufe mit den Pfeiltasten oder WASD, betritt Gebäude mit E oder per Klick. Und such die Schätze des Tages!" },
  locked: "Hier kommst du noch nicht hin: {name} wird im Laden freigeschaltet. Schauen wir mal hin!",
  next: "Weiter",
  events: [
    { id: "festival", title: "Laternenfest", caption: "Heute ist Laternenfest im Städtchen!" },
    { id: "fireworks", title: "Feuerwerk", caption: "Achtung, über dem Städtchen steigen Feuerwerksraketen auf!" },
    { id: "rain", title: "Regenbogen nach dem Regen", caption: "Der Regen ist vorbei und ein Regenbogen erscheint." },
    { id: "balloons", title: "Ballonshow", caption: "Bunte Ballons schweben über dem Städtchen." },
    { id: "market", title: "Markttag", caption: "Heute ist Markt und überall duftet es herrlich." },
  ],
  reward: { title: "Alles geschafft!", caption: "Du hast alles erledigt, was das Städtchen heute brauchte. Hurra!" },
  ambient: ["Was für ein schöner Tag!", "Hast du das gehört?", "Wenn ich groß bin, werde ich Lehrerin.", "Wer möchte ein Brötchen?"],
  morning: "Guten Morgen!",
  evening: "Guten Abend!",
};

const ru: TownLifeText = {
  npc: {
    knihovnice: { name: "Библиотекарь Лена", role: "Хранительница книг", greet: ["Привет! Ты сегодня уже читал(а)?", "Тсс, здесь читают!"], chat: ["Кто читает, тот знает. А кто знает, тот побеждает!", "Лучшие книги вкусно пахнут и ещё лучше кончаются.", "Повтори сегодня то, что не получается. Всё получится!", "А ты знал(а), что слово «библиотека» старше книгопечатания?"], likeHint: "Она любит книги." },
    pekar: { name: "Пекарь Йося", role: "Мастер выпечки", greet: ["Свежие булочки! Ещё тёплые!", "Доброе утро! Булочку?"], chat: ["Выпечка — это математика: полчашки, две ложки и щепотка терпения.", "Лучший запах на свете? Свежий хлеб!", "Не получилось — попробуй ещё. Тесто тоже не всегда выходит с первого раза.", "Пять умножить на восемь — сорок булочек на сегодня!"], likeHint: "Он обожает сладкое." },
    kluk: { name: "Кубик", role: "Мальчик с мячом", greet: ["Привет! Поиграешь со мной в мяч?", "Эй, видишь мяч?"], chat: ["Сегодня в школе я почти получил пятёрку!", "Я быстрее собаки. Почти!", "Когда я учусь, и футбол лучше идёт.", "Лучшее поле — у фонтана!"], likeHint: "Любит пирожные." },
    farmar: { name: "Фермер Вова", role: "Фермер", greet: ["Привет! Солнце светит, за дело!", "Здравствуй, сосед!"], chat: ["Куры сегодня снесли целых двенадцать яиц!", "Земля отдаёт то, что в неё вложишь. Учёба — так же.", "Когда светит солнце и идёт дождь, бывает радуга.", "Овечки больше всего любят клевер."], likeHint: "Любит цветочки." },
    babicka: { name: "Бабушка Роза", role: "Бабушка с корзинкой", greet: ["Здравствуй, золотко!", "Садись, расскажу тебе сказку."], chat: ["В мои времена мы учили стихи наизусть.", "Кто учится, тот не стареет!", "В корзинке у меня свежий хлеб и яблоки.", "Хорошо смеётся тот, кто смеётся последним."], likeHint: "Любит цветы." },
    kocka: { name: "Мурка", role: "Кошка", greet: ["Мяу!", "Мррр…"], chat: ["Мяу! (Сегодня я спала всего шестнадцать часов.)", "Мррр… (почеши меня за ушком)", "Мяу. (Я бы съела пирожное.)"], likeHint: "Мяу, сладкоежка." },
    ovce: { name: "Белка", role: "Овечка", greet: ["Бееее!", "Бе? Привет!"], chat: ["Бееее! (Шерсть снова отрастает!)", "Бе! (Трава сегодня очень вкусная.)", "Беебе. (Я считаю саму себя, чтобы уснуть.)"], likeHint: "Бе, цветочки!" },
    slepice: { name: "Хохлатка", role: "Курочка", greet: ["Ко-ко!", "Кудах!"], chat: ["Ко! (Сегодня я снесла золотое яйцо!)", "Кококо! (Несу и несу.)", "Ко. (Найдёшь мешок с зерном?)"], likeHint: "Ко, цветочек!" },
  },
  ui: {
    talk: "Поболтать",
    ask: "Вопрос по учёбе",
    gift: "Подарить подарок",
    close: "Закрыть",
    friendship: "Дружба",
    login: "Войди, чтобы городок запомнил твоих друзей.",
    notEnough: "На подарок не хватает очков.",
    alreadyTalked: "Сегодня вы уже болтали. До завтра!",
    alreadyGifted: "Сегодня подарок уже получен. До завтра!",
    noMoreQuestions: "На сегодня вопросов хватит.",
    noQuestions: "Этот житель не задаёт вопросов.",
    questionIntro: "Поможешь мне?",
    correct: "Верно! Отличная работа!",
    wrong: "Эта не получилась, ничего страшного.",
    explanation: "Объяснение",
    giftLiked: "Это именно то, что я люблю! Спасибо!",
    giftOther: "Спасибо, как мило с твоей стороны!",
    levelUp: "Новое сердечко! Бонус {n} очков",
    gained: "Ты получил(а) {n} очков",
    chooseGift: "Что подаришь?",
    points: "очков",
    replay: "Показать вступление",
    error: "Что-то пошло не так, попробуй ещё раз.",
    thanks: "Спасибо!",
    nextQuestion: "Следующий вопрос",
  },
  gifts: { flower: "Цветок", book: "Книга", cake: "Пирожное" },
  tour: { hello: "Добро пожаловать в наш городок! Я библиотекарь Лена и всё тебе покажу.", top: "На холме — сказочный лес и старый замок. Их ворота откроются, когда ты их разблокируешь.", you: "А это ты! Давай познакомимся с соседями.", heroHi: "Привет!", npcs: "Нажми на жителя и поболтай с ним. Они задают вопросы по учёбе, а за помощь и подарки ты получишь сердечки.", school: "В школе — курсы, в игровом зале — игры, а на доске — задания на каждый день.", harbor: "Из гавани в магазин наград отплывает пиратский корабль.", rocket: "А ракета унесёт тебя прямо в космос!", controls: "Ходи стрелками или WASD, в здания заходи клавишей E или кликом. И ищи сокровища дня!" },
  locked: "Сюда пока нельзя: {name} открывается в магазине. Давай заглянем туда!",
  next: "Дальше",
  events: [
    { id: "festival", title: "Праздник фонариков", caption: "Сегодня в городке праздник фонариков!" },
    { id: "fireworks", title: "Фейерверк", caption: "Внимание, над городком взлетают ракеты фейерверка!" },
    { id: "rain", title: "Радуга после дождя", caption: "Дождь только что прошёл, и появилась радуга." },
    { id: "balloons", title: "Шоу воздушных шаров", caption: "Над городком летают разноцветные шары." },
    { id: "market", title: "День ярмарки", caption: "Сегодня ярмарка, и везде чудесно пахнет." },
  ],
  reward: { title: "Всё готово!", caption: "Ты сделал(а) всё, что сегодня нужно городку. Ура!" },
  ambient: ["Какой чудесный день!", "Ты это слышал(а)?", "Когда вырасту, стану учительницей.", "Кому булочку?"],
  morning: "Доброе утро!",
  evening: "Добрый вечер!",
};

const TEXTS: Record<Locale, TownLifeText> = { cs, en, de, ru };
export function getTownLifeText(locale: Locale): TownLifeText {
  return TEXTS[locale] ?? cs;
}
