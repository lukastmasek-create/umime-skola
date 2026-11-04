import { withFallbacks } from "./config";
import type { Locale } from "./config";

export type Line = { who: "hrdina" | "knihovnice" | "pekar" | "kluk" | "farmar" | "babicka"; text: string };
export type ChapterText = { title: string; intro: Line[]; outro: Line[] };

export type TownStoryText = {
  button: string;
  title: string;
  chapter: string; // {a} {b}
  login: string;
  claim: string;
  reward: string; // {n}
  next: string;
  close: string;
  finished: string;
  objective: { talked: string; hearts: string; minis: string; sumfp: string };
  notReady: string;
  error: string;
  who: Record<Line["who"], string>;
  chapters: Record<string, ChapterText>;
};

const cs: TownStoryText = {
  button: "Příběh městečka",
  title: "Hvězdná mapa",
  chapter: "Kapitola {a} / {b}",
  login: "Pro příběh se přihlas, ať si městečko pamatuje, kam jsi došel/došla.",
  claim: "Dokončit kapitolu",
  reward: "+{n} bodů",
  next: "Dál",
  close: "Zavřít",
  finished: "Příběh je u konce. Díky, že jsi nám pomohl/a!",
  objective: { talked: "Popovídej si s {n} obyvateli", hearts: "Dosáhni {h} srdíček u {n} obyvatel", minis: "Zahraj každou minihru aspoň jednou", sumfp: "Nasbírej {n} bodů přátelství" },
  notReady: "Cíl ještě není splněný.",
  error: "Nepodařilo se uložit postup.",
  who: { hrdina: "Ty", knihovnice: "Knihovnice", pekar: "Pekař", kluk: "Kluk", farmar: "Farmář", babicka: "Babička" },
  chapters: {
    arrival: {
      title: "Ztracená mapa",
      intro: [
        { who: "knihovnice", text: "Ach, jsi tu! V knihovně jsem našla roztrhanou hvězdnou mapu. Každý kus má u sebe někdo z městečka." },
        { who: "hrdina", text: "Hvězdná mapa? A kam vede?" },
        { who: "knihovnice", text: "Nikdo neví. Ale obyvatelé ti kus nesvěří, dokud si s nimi nepopovídáš. Zkus to aspoň u tří z nich." },
      ],
      outro: [
        { who: "knihovnice", text: "Skvělé! Všichni o tobě mluví. První kus mapy je tvůj." },
        { who: "hrdina", text: "Vypadá jako souhvězdí. Co bude dál?" },
      ],
    },
    friends: {
      title: "Pravé přátelství",
      intro: [
        { who: "pekar", text: "Zdravím! Druhý kus mapy hlídám pod koláčem. Dám ti ho jen skutečnému příteli." },
        { who: "hrdina", text: "A jak poznáš skutečného přítele?" },
        { who: "pekar", text: "Dva srdíčka v rozhovoru, to je pro mě důkaz. Povídej, ptej se, nebo někomu dones dárek." },
      ],
      outro: [
        { who: "pekar", text: "Dvě srdíčka! Tady máš druhý kus, ještě teplý." },
        { who: "kluk", text: "Hele, mapa se skládá! Pojďme hledat další!" },
      ],
    },
    skills: {
      title: "Šikovné ruce",
      intro: [
        { who: "farmar", text: "Třetí kus visí na vrbě u laguny, ale já ho nedosáhnu. Pomůžeš mi se zbytkem práce?" },
        { who: "hrdina", text: "Jasně. Co je potřeba?" },
        { who: "farmar", text: "Zalov rybu v laguně, sklidím zeleninu na poli a pomoz pekaři se surovinami. Každé aspoň jednou." },
      ],
      outro: [
        { who: "farmar", text: "Šikulka! Máš zručné ruce. Třetí kus mapy je tvůj." },
        { who: "hrdina", text: "Už vidím, že mapa ukazuje na vesmír." },
      ],
    },
    together: {
      title: "Společná věc",
      intro: [
        { who: "babicka", text: "Čtvrtý kus mám ve skříni s receptáři. Ale chci, abychom se v městečku měli rádi navzájem." },
        { who: "hrdina", text: "Co mám udělat, babičko?" },
        { who: "babicka", text: "Najdi si dva dobré kamarády mezi obyvateli. Tři srdíčka u každého z nich, to je radost pro celé městečko." },
      ],
      outro: [
        { who: "babicka", text: "Dva kamarádi a tolik srdíček! Čtvrtý kus je tvůj, mládenče." },
        { who: "knihovnice", text: "Zbývá poslední. Ten ukáže, kde se mapa skrývá." },
      ],
    },
    starmap: {
      title: "Hvězdná mapa",
      intro: [
        { who: "knihovnice", text: "Poslední kus si nese celé městečko pospolu. Čím víc přátel, tím jasněji září." },
        { who: "hrdina", text: "Tak to ještě chvíli budu povídat, ptát se a hrát!" },
        { who: "kluk", text: "A já ti pomůžu! Tohle bude největší tajemství městečka." },
      ],
      outro: [
        { who: "knihovnice", text: "Mapa je kompletní! Ukazuje na hvězdy nad městečkem, kde na každého čeká další dobrodružství." },
        { who: "hrdina", text: "Díky všem. Bez vás bych ji nikdy nesložil/a." },
        { who: "pekar", text: "To je přece to nejlepší na městečku: společně dojdeme dál. Na zdraví koláčem!" },
      ],
    },
  },
};

const en: TownStoryText = {
  button: "Town story",
  title: "The Star Map",
  chapter: "Chapter {a} / {b}",
  login: "Log in so the town remembers how far you got.",
  claim: "Finish chapter",
  reward: "+{n} points",
  next: "Next",
  close: "Close",
  finished: "The story is complete. Thank you for helping us!",
  objective: { talked: "Chat with {n} townsfolk", hearts: "Reach {h} hearts with {n} townsfolk", minis: "Play every mini-game at least once", sumfp: "Earn {n} friendship points" },
  notReady: "The goal is not complete yet.",
  error: "Could not save your progress.",
  who: { hrdina: "You", knihovnice: "Librarian", pekar: "Baker", kluk: "Kid", farmar: "Farmer", babicka: "Granny" },
  chapters: {
    arrival: {
      title: "The Lost Map",
      intro: [
        { who: "knihovnice", text: "Oh, you're here! I found a torn star map in the library. Each piece is kept by someone in town." },
        { who: "hrdina", text: "A star map? Where does it lead?" },
        { who: "knihovnice", text: "Nobody knows. But the townsfolk won't give you a piece until you've chatted with them. Try at least three of them." },
      ],
      outro: [
        { who: "knihovnice", text: "Wonderful! Everyone is talking about you. The first piece of the map is yours." },
        { who: "hrdina", text: "It looks like a constellation. What's next?" },
      ],
    },
    friends: {
      title: "True Friendship",
      intro: [
        { who: "pekar", text: "Hello! I'm guarding the second piece under a cake. I only give it to a real friend." },
        { who: "hrdina", text: "How do you recognise a real friend?" },
        { who: "pekar", text: "Two hearts in our chat is proof enough. Talk, ask questions, or bring someone a gift." },
      ],
      outro: [
        { who: "pekar", text: "Two hearts! Here's the second piece, still warm." },
        { who: "kluk", text: "Look, the map is coming together! Let's find the next one!" },
      ],
    },
    skills: {
      title: "Clever Hands",
      intro: [
        { who: "farmar", text: "The third piece hangs on the willow by the lagoon, but I can't reach it. Will you help me with the rest of my chores?" },
        { who: "hrdina", text: "Sure. What needs doing?" },
        { who: "farmar", text: "Catch a fish in the lagoon, harvest the veg in the field and help the baker with ingredients. Each at least once." },
      ],
      outro: [
        { who: "farmar", text: "Well done! You've got clever hands. The third piece is yours." },
        { who: "hrdina", text: "I can see the map points at space." },
      ],
    },
    together: {
      title: "Together",
      intro: [
        { who: "babicka", text: "I keep the fourth piece in the recipe cupboard. But I'd like everyone in town to be fond of each other." },
        { who: "hrdina", text: "What should I do, Granny?" },
        { who: "babicka", text: "Find two good friends among the townsfolk. Three hearts with each of them, that makes the whole town happy." },
      ],
      outro: [
        { who: "babicka", text: "Two friends and so many hearts! The fourth piece is yours, dear." },
        { who: "knihovnice", text: "Only the last one remains. It will show where the map is hiding." },
      ],
    },
    starmap: {
      title: "The Star Map",
      intro: [
        { who: "knihovnice", text: "The last piece is carried by the whole town together. The more friends, the brighter it glows." },
        { who: "hrdina", text: "Then I'll keep chatting, asking and playing!" },
        { who: "kluk", text: "And I'll help! This will be the biggest secret in town." },
      ],
      outro: [
        { who: "knihovnice", text: "The map is complete! It points to the stars above town, where another adventure awaits each of us." },
        { who: "hrdina", text: "Thanks, everyone. I'd never have put it together without you." },
        { who: "pekar", text: "That's the best thing about this town: together we go further. Cake for everyone!" },
      ],
    },
  },
};

const de: TownStoryText = {
  button: "Stadtgeschichte",
  title: "Die Sternenkarte",
  chapter: "Kapitel {a} / {b}",
  login: "Melde dich an, damit sich die Stadt merkt, wie weit du bist.",
  claim: "Kapitel abschließen",
  reward: "+{n} Punkte",
  next: "Weiter",
  close: "Schließen",
  finished: "Die Geschichte ist zu Ende. Danke, dass du uns geholfen hast!",
  objective: { talked: "Sprich mit {n} Bewohnern", hearts: "Erreiche {h} Herzen bei {n} Bewohnern", minis: "Spiele jedes Minispiel mindestens einmal", sumfp: "Sammle {n} Freundschaftspunkte" },
  notReady: "Das Ziel ist noch nicht erreicht.",
  error: "Der Fortschritt konnte nicht gespeichert werden.",
  who: { hrdina: "Du", knihovnice: "Bibliothekarin", pekar: "Bäcker", kluk: "Junge", farmar: "Bauer", babicka: "Oma" },
  chapters: {
    arrival: {
      title: "Die verlorene Karte",
      intro: [
        { who: "knihovnice", text: "Oh, da bist du! In der Bibliothek habe ich eine zerrissene Sternenkarte gefunden. Jedes Stück hat jemand aus der Stadt." },
        { who: "hrdina", text: "Eine Sternenkarte? Wohin führt sie?" },
        { who: "knihovnice", text: "Das weiß niemand. Aber die Bewohner geben dir kein Stück, bevor du mit ihnen geredet hast. Versuch es bei mindestens dreien." },
      ],
      outro: [
        { who: "knihovnice", text: "Wunderbar! Alle sprechen von dir. Das erste Kartenstück gehört dir." },
        { who: "hrdina", text: "Es sieht aus wie ein Sternbild. Was kommt jetzt?" },
      ],
    },
    friends: {
      title: "Echte Freundschaft",
      intro: [
        { who: "pekar", text: "Hallo! Das zweite Stück bewache ich unter einem Kuchen. Ich gebe es nur einem echten Freund." },
        { who: "hrdina", text: "Woran erkennst du einen echten Freund?" },
        { who: "pekar", text: "Zwei Herzen im Gespräch sind mir Beweis genug. Rede, frag etwas oder bring jemandem ein Geschenk." },
      ],
      outro: [
        { who: "pekar", text: "Zwei Herzen! Hier ist das zweite Stück, noch warm." },
        { who: "kluk", text: "Guck, die Karte setzt sich zusammen! Suchen wir das nächste!" },
      ],
    },
    skills: {
      title: "Geschickte Hände",
      intro: [
        { who: "farmar", text: "Das dritte Stück hängt an der Weide an der Lagune, aber ich komme nicht ran. Hilfst du mir mit dem Rest meiner Arbeit?" },
        { who: "hrdina", text: "Klar. Was ist zu tun?" },
        { who: "farmar", text: "Fang einen Fisch in der Lagune, ernte das Gemüse auf dem Feld und hilf dem Bäcker mit den Zutaten. Jedes mindestens einmal." },
      ],
      outro: [
        { who: "farmar", text: "Gut gemacht! Du hast geschickte Hände. Das dritte Stück gehört dir." },
        { who: "hrdina", text: "Ich sehe, die Karte zeigt ins Weltall." },
      ],
    },
    together: {
      title: "Gemeinsam",
      intro: [
        { who: "babicka", text: "Das vierte Stück liegt in meinem Rezeptschrank. Aber ich möchte, dass sich in der Stadt alle gern haben." },
        { who: "hrdina", text: "Was soll ich tun, Oma?" },
        { who: "babicka", text: "Such dir zwei gute Freunde unter den Bewohnern. Drei Herzen bei jedem, das freut die ganze Stadt." },
      ],
      outro: [
        { who: "babicka", text: "Zwei Freunde und so viele Herzen! Das vierte Stück gehört dir, mein Kind." },
        { who: "knihovnice", text: "Nur das letzte fehlt noch. Es zeigt, wo sich die Karte versteckt." },
      ],
    },
    starmap: {
      title: "Die Sternenkarte",
      intro: [
        { who: "knihovnice", text: "Das letzte Stück trägt die ganze Stadt gemeinsam. Je mehr Freunde, desto heller leuchtet es." },
        { who: "hrdina", text: "Dann rede, frage und spiele ich noch eine Weile!" },
        { who: "kluk", text: "Und ich helfe dir! Das wird das größte Geheimnis der Stadt." },
      ],
      outro: [
        { who: "knihovnice", text: "Die Karte ist vollständig! Sie zeigt auf die Sterne über der Stadt, wo auf jeden ein neues Abenteuer wartet." },
        { who: "hrdina", text: "Danke euch allen. Ohne euch hätte ich sie nie zusammengesetzt." },
        { who: "pekar", text: "Das ist das Beste an dieser Stadt: Gemeinsam kommen wir weiter. Kuchen für alle!" },
      ],
    },
  },
};

const ru: TownStoryText = {
  button: "История города",
  title: "Звёздная карта",
  chapter: "Глава {a} / {b}",
  login: "Войди, чтобы город запомнил, докуда ты дошёл.",
  claim: "Завершить главу",
  reward: "+{n} очков",
  next: "Дальше",
  close: "Закрыть",
  finished: "История окончена. Спасибо, что помог нам!",
  objective: { talked: "Поговори с {n} жителями", hearts: "Набери {h} сердца у {n} жителей", minis: "Сыграй в каждую мини-игру хотя бы раз", sumfp: "Накопи {n} очков дружбы" },
  notReady: "Цель ещё не выполнена.",
  error: "Не удалось сохранить прогресс.",
  who: { hrdina: "Ты", knihovnice: "Библиотекарь", pekar: "Пекарь", kluk: "Мальчик", farmar: "Фермер", babicka: "Бабушка" },
  chapters: {
    arrival: {
      title: "Потерянная карта",
      intro: [
        { who: "knihovnice", text: "Ах, ты здесь! В библиотеке я нашла разорванную звёздную карту. Каждый кусок хранит кто-то из города." },
        { who: "hrdina", text: "Звёздная карта? Куда она ведёт?" },
        { who: "knihovnice", text: "Никто не знает. Но жители не отдадут кусок, пока ты с ними не поговоришь. Попробуй хотя бы с тремя." },
      ],
      outro: [
        { who: "knihovnice", text: "Отлично! Все о тебе говорят. Первый кусок карты твой." },
        { who: "hrdina", text: "Похоже на созвездие. Что дальше?" },
      ],
    },
    friends: {
      title: "Настоящая дружба",
      intro: [
        { who: "pekar", text: "Здравствуй! Второй кусок я прячу под пирогом. Отдам только настоящему другу." },
        { who: "hrdina", text: "Как ты узнаёшь настоящего друга?" },
        { who: "pekar", text: "Два сердца в разговоре — для меня достаточное доказательство. Болтай, спрашивай или принеси подарок." },
      ],
      outro: [
        { who: "pekar", text: "Два сердца! Вот второй кусок, ещё тёплый." },
        { who: "kluk", text: "Смотри, карта складывается! Давай искать следующий!" },
      ],
    },
    skills: {
      title: "Ловкие руки",
      intro: [
        { who: "farmar", text: "Третий кусок висит на иве у лагуны, но мне не достать. Поможешь мне с остальной работой?" },
        { who: "hrdina", text: "Конечно. Что нужно сделать?" },
        { who: "farmar", text: "Поймай рыбу в лагуне, собери овощи на поле и помоги пекарю с ингредиентами. Всё хотя бы по разу." },
      ],
      outro: [
        { who: "farmar", text: "Молодец! У тебя ловкие руки. Третий кусок твой." },
        { who: "hrdina", text: "Вижу, карта указывает на космос." },
      ],
    },
    together: {
      title: "Общее дело",
      intro: [
        { who: "babicka", text: "Четвёртый кусок лежит в шкафу с рецептами. Но я хочу, чтобы в городе все любили друг друга." },
        { who: "hrdina", text: "Что мне сделать, бабушка?" },
        { who: "babicka", text: "Найди двух хороших друзей среди жителей. Три сердца у каждого — радость всему городу." },
      ],
      outro: [
        { who: "babicka", text: "Два друга и столько сердец! Четвёртый кусок твой, дитя." },
        { who: "knihovnice", text: "Остался последний. Он покажет, где спрятана карта." },
      ],
    },
    starmap: {
      title: "Звёздная карта",
      intro: [
        { who: "knihovnice", text: "Последний кусок несёт весь город вместе. Чем больше друзей, тем ярче он светится." },
        { who: "hrdina", text: "Тогда я буду ещё болтать, спрашивать и играть!" },
        { who: "kluk", text: "А я помогу! Это будет главная тайна города." },
      ],
      outro: [
        { who: "knihovnice", text: "Карта собрана! Она указывает на звёзды над городом, где каждого ждёт новое приключение." },
        { who: "hrdina", text: "Спасибо всем. Без вас я бы её не собрал." },
        { who: "pekar", text: "Это лучшее в нашем городе: вместе мы доходим дальше. Пирог всем!" },
      ],
    },
  },
};

const texts: Record<Locale, TownStoryText> = {
  ...withFallbacks({ cs, en, de, ru }),
  uk: {
    button: "Історія містечка",
    title: "Зоряна карта",
    chapter: "Розділ {a} / {b}",
    login: "Увійди, щоб містечко пам'ятало, як далеко ти зайшов(ла).",
    claim: "Завершити розділ",
    reward: "+{n} балів",
    next: "Далі",
    close: "Закрити",
    finished: "Історія завершена. Дякую, що допоміг(ла) нам!",
    objective: { talked: "Поговори з {n} мешканцями", hearts: "Набери {h} серденьок у {n} мешканців", minis: "Зіграй кожну міні-гру хоча б раз", sumfp: "Збери {n} балів дружби" },
    notReady: "Ціль ще не виконана.",
    error: "Не вдалося зберегти прогрес.",
    who: { hrdina: "Ти", knihovnice: "Бібліотекарка", pekar: "Пекар", kluk: "Хлопчик", farmar: "Фермер", babicka: "Бабуся" },
    chapters: {
      arrival: {
        title: "Загублена карта",
        intro: [
          { who: "knihovnice", text: "Ой, ти тут! У бібліотеці я знайшла порвану зоряну карту. Кожен шматок тримає хтось із містечка." },
          { who: "hrdina", text: "Зоряна карта? А куди вона веде?" },
          { who: "knihovnice", text: "Ніхто не знає. Але мешканці не віддадуть шматок, поки ти з ними не поговориш. Спробуй хоча б із трьома." },
        ],
        outro: [
          { who: "knihovnice", text: "Чудово! Усі говорять про тебе. Перший шматок карти твій." },
          { who: "hrdina", text: "Схоже на сузір'я. Що далі?" },
        ],
      },
      friends: {
        title: "Справжня дружба",
        intro: [
          { who: "pekar", text: "Вітаю! Другий шматок я стерегу під пирогом. Віддам його лише справжньому другові." },
          { who: "hrdina", text: "А як ти розпізнаєш справжнього друга?" },
          { who: "pekar", text: "Два серденька в розмові — для мене достатній доказ. Розмовляй, став запитання або принеси комусь подарунок." },
        ],
        outro: [
          { who: "pekar", text: "Два серденька! Ось другий шматок, ще теплий." },
          { who: "kluk", text: "Диви, карта складається! Шукаймо наступний!" },
        ],
      },
      skills: {
        title: "Вправні руки",
        intro: [
          { who: "farmar", text: "Третій шматок висить на вербі біля лагуни, але я не дотягнуся. Допоможеш мені з рештою роботи?" },
          { who: "hrdina", text: "Звісно. Що треба зробити?" },
          { who: "farmar", text: "Зловити рибу в лагуні, зібрати овочі на полі й допомогти пекарю з інгредієнтами. Кожне хоча б раз." },
        ],
        outro: [
          { who: "farmar", text: "Молодець! У тебе вправні руки. Третій шматок твій." },
          { who: "hrdina", text: "Бачу, що карта вказує на космос." },
        ],
      },
      together: {
        title: "Спільна справа",
        intro: [
          { who: "babicka", text: "Четвертий шматок лежить у шафі з рецептами. Але я хочу, щоб у містечку всі любили одне одного." },
          { who: "hrdina", text: "Що мені зробити, бабусю?" },
          { who: "babicka", text: "Знайди двох добрих друзів серед мешканців. Три серденька в кожного — це радість для всього містечка." },
        ],
        outro: [
          { who: "babicka", text: "Два друзі й стільки серденьок! Четвертий шматок твій, дитино." },
          { who: "knihovnice", text: "Лишився останній. Він покаже, де ховається карта." },
        ],
      },
      starmap: {
        title: "Зоряна карта",
        intro: [
          { who: "knihovnice", text: "Останній шматок несе ціле містечко разом. Чим більше друзів, тим яскравіше він світиться." },
          { who: "hrdina", text: "Тоді я ще трохи поговорю, поспитаю й пограю!" },
          { who: "kluk", text: "А я допоможу! Це буде найбільша таємниця містечка." },
        ],
        outro: [
          { who: "knihovnice", text: "Карта завершена! Вона вказує на зорі над містечком, де на кожного чекає нова пригода." },
          { who: "hrdina", text: "Дякую всім. Без допомоги кожного я б її ніколи не склав(ла)." },
          { who: "pekar", text: "Найкраще в нашому містечку те, що разом ми заходимо далі. Пиріг для всіх!" },
        ],
      },
    },
  },
  ja: {
    button: "まちのおはなし",
    title: "星の地図",
    chapter: "第{a}章 / {b}",
    login: "ログインすると、まちがどこまで進んだかを覚えてくれます。",
    claim: "章をクリア",
    reward: "+{n}ポイント",
    next: "次へ",
    close: "閉じる",
    finished: "おはなしはこれで終わりです。手伝ってくれてありがとう！",
    objective: { talked: "{n}人の住人とおしゃべりする", hearts: "{n}人の住人から{h}個のハートを集める", minis: "どのミニゲームも一度は遊ぶ", sumfp: "なかよしポイントを{n}点集める" },
    notReady: "まだ目標を達成していません。",
    error: "進み具合を保存できませんでした。",
    who: { hrdina: "あなた", knihovnice: "司書さん", pekar: "パン屋さん", kluk: "男の子", farmar: "農場主さん", babicka: "おばあさん" },
    chapters: {
      arrival: {
        title: "なくした地図",
        intro: [
          { who: "knihovnice", text: "あら、来てくれたのね！図書館で、破れた星の地図を見つけたの。切れ端はそれぞれ、まちの誰かが持っているのよ。" },
          { who: "hrdina", text: "星の地図ですか？どこへつながっているのでしょう？" },
          { who: "knihovnice", text: "それは誰にもわからないの。でも住人たちは、おしゃべりするまで切れ端をくれないのよ。まずは3人に話しかけてみて。" },
        ],
        outro: [
          { who: "knihovnice", text: "すばらしいわ！みんながあなたの話をしているの。地図の最初の切れ端は、あなたのものよ。" },
          { who: "hrdina", text: "星座みたいですね。次は何をすればいいですか？" },
        ],
      },
      friends: {
        title: "本当の友だち",
        intro: [
          { who: "pekar", text: "こんにちは！二つ目の切れ端は、ケーキの下で見張っているんだ。本当の友だちにしかあげないよ。" },
          { who: "hrdina", text: "本当の友だちは、どうやって見分けるんですか？" },
          { who: "pekar", text: "会話でハートが二つ集まれば、それが証拠さ。話をしたり、質問したり、プレゼントを渡したりしてみて。" },
        ],
        outro: [
          { who: "pekar", text: "ハートが二つ！はい、二つ目の切れ端。まだ温かいよ。" },
          { who: "kluk", text: "見て、地図がそろってきた！次のを探そうよ！" },
        ],
      },
      skills: {
        title: "器用な手",
        intro: [
          { who: "farmar", text: "三つ目の切れ端は、ラグーンのヤナギの木に引っかかっているんだけど、わしには届かなくてね。残りの仕事を手伝ってくれないかい？" },
          { who: "hrdina", text: "もちろんです。何をすればいいですか？" },
          { who: "farmar", text: "ラグーンで魚をつって、畑の野菜を収穫して、パン屋さんの材料を手伝ってほしいんだ。どれも一度ずつね。" },
        ],
        outro: [
          { who: "farmar", text: "お見事！器用な手をしているね。三つ目の切れ端はあなたのものだ。" },
          { who: "hrdina", text: "地図は宇宙を指しているみたいですね。" },
        ],
      },
      together: {
        title: "みんなで一緒に",
        intro: [
          { who: "babicka", text: "四つ目の切れ端は、わたしのレシピ棚にしまってあるの。でもね、まちのみんなが仲良くなってほしいのよ。" },
          { who: "hrdina", text: "おばあさん、わたしは何をすればいいですか？" },
          { who: "babicka", text: "住人の中から、仲良しを二人見つけてちょうだい。それぞれとハートを三つずつ。まち中が喜ぶわ。" },
        ],
        outro: [
          { who: "babicka", text: "二人のお友だちと、こんなにたくさんのハート！四つ目の切れ端は、あなたのものよ。" },
          { who: "knihovnice", text: "あと一つだけ残っているわ。それが地図の隠れ場所を教えてくれるはず。" },
        ],
      },
      starmap: {
        title: "星の地図",
        intro: [
          { who: "knihovnice", text: "最後の切れ端は、まち全体で一緒に持っているの。友だちが多いほど、明るく光るのよ。" },
          { who: "hrdina", text: "では、もう少しおしゃべりしたり、質問したり、遊んだりしてみます！" },
          { who: "kluk", text: "ぼくも手伝うよ！これがまち最大のひみつになるんだ。" },
        ],
        outro: [
          { who: "knihovnice", text: "地図が完成しました！まちの上の星を指していて、そこでは一人ひとりを待っている新しい冒険があるわ。" },
          { who: "hrdina", text: "みなさん、ありがとう。みんながいなければ、完成できませんでした。" },
          { who: "pekar", text: "このまちのいいところはね、みんなで一緒なら遠くまで行けることさ。みんなにケーキを！" },
        ],
      },
    },
  },
  es: {
    button: "Historia del pueblo",
    title: "El mapa estelar",
    chapter: "Capítulo {a} / {b}",
    login: "Inicia sesión para que el pueblo recuerde hasta dónde has llegado.",
    claim: "Terminar capítulo",
    reward: "+{n} puntos",
    next: "Siguiente",
    close: "Cerrar",
    finished: "La historia ha terminado. ¡Gracias por ayudarnos!",
    objective: { talked: "Charla con {n} vecinos", hearts: "Consigue {h} corazones con {n} vecinos", minis: "Juega al menos una vez a cada minijuego", sumfp: "Consigue {n} puntos de amistad" },
    notReady: "El objetivo todavía no está completado.",
    error: "No se pudo guardar tu progreso.",
    who: { hrdina: "Tú", knihovnice: "Bibliotecaria", pekar: "Panadero", kluk: "Chico", farmar: "Granjero", babicka: "Abuela" },
    chapters: {
      arrival: {
        title: "El mapa perdido",
        intro: [
          { who: "knihovnice", text: "¡Ah, estás aquí! En la biblioteca encontré un mapa estelar roto. Cada trozo lo guarda alguien del pueblo." },
          { who: "hrdina", text: "¿Un mapa estelar? ¿Adónde lleva?" },
          { who: "knihovnice", text: "Nadie lo sabe. Pero los vecinos no te darán un trozo hasta que hables con ellos. Prueba con al menos tres." },
        ],
        outro: [
          { who: "knihovnice", text: "¡Estupendo! Todos hablan de ti. El primer trozo del mapa es tuyo." },
          { who: "hrdina", text: "Parece una constelación. ¿Qué sigue?" },
        ],
      },
      friends: {
        title: "La verdadera amistad",
        intro: [
          { who: "pekar", text: "¡Hola! Guardo el segundo trozo debajo de una tarta. Solo se lo doy a un verdadero amigo." },
          { who: "hrdina", text: "¿Y cómo reconoces a un verdadero amigo?" },
          { who: "pekar", text: "Dos corazones en la conversación me bastan como prueba. Charla, haz preguntas o lleva un regalo a alguien." },
        ],
        outro: [
          { who: "pekar", text: "¡Dos corazones! Aquí tienes el segundo trozo, ¡todavía calentito!" },
          { who: "kluk", text: "¡Mira, el mapa se está completando! ¡A buscar el siguiente!" },
        ],
      },
      skills: {
        title: "Manos hábiles",
        intro: [
          { who: "farmar", text: "El tercer trozo cuelga del sauce junto a la laguna, pero no llego. ¿Me ayudas con el resto del trabajo?" },
          { who: "hrdina", text: "Claro. ¿Qué hay que hacer?" },
          { who: "farmar", text: "Pesca un pez en la laguna, recoge la verdura del campo y ayuda al panadero con los ingredientes. Cada cosa al menos una vez." },
        ],
        outro: [
          { who: "farmar", text: "¡Muy bien! Tienes manos hábiles. El tercer trozo es tuyo." },
          { who: "hrdina", text: "Veo que el mapa apunta al espacio." },
        ],
      },
      together: {
        title: "Juntos",
        intro: [
          { who: "babicka", text: "El cuarto trozo lo guardo en el armario de las recetas. Pero quiero que todos en el pueblo se quieran." },
          { who: "hrdina", text: "¿Qué debo hacer, abuela?" },
          { who: "babicka", text: "Encuentra a dos buenos amigos entre los vecinos. Tres corazones con cada uno, ¡eso alegra a todo el pueblo!" },
        ],
        outro: [
          { who: "babicka", text: "¡Dos amigos y tantos corazones! El cuarto trozo es tuyo, cariño." },
          { who: "knihovnice", text: "Solo queda el último. Mostrará dónde se esconde el mapa." },
        ],
      },
      starmap: {
        title: "El mapa estelar",
        intro: [
          { who: "knihovnice", text: "El último trozo lo lleva todo el pueblo unido. Cuantos más amigos, más brilla." },
          { who: "hrdina", text: "¡Pues seguiré charlando, preguntando y jugando un rato más!" },
          { who: "kluk", text: "¡Y yo te ayudo! Será el mayor secreto del pueblo." },
        ],
        outro: [
          { who: "knihovnice", text: "¡El mapa está completo! Señala las estrellas sobre el pueblo, donde espera una nueva aventura para cada uno." },
          { who: "hrdina", text: "Gracias a todos. Sin la ayuda de cada uno nunca lo habría completado." },
          { who: "pekar", text: "Lo mejor de este pueblo es que, juntos, llegamos más lejos. ¡Tarta para todos!" },
        ],
      },
    },
  },
  fr: {
    button: "Histoire du bourg",
    title: "La carte des étoiles",
    chapter: "Chapitre {a} / {b}",
    login: "Connecte-toi pour que le bourg se souvienne de ta progression.",
    claim: "Terminer le chapitre",
    reward: "+{n} points",
    next: "Suivant",
    close: "Fermer",
    finished: "L'histoire est terminée. Merci de nous avoir aidés !",
    objective: { talked: "Discute avec {n} habitants", hearts: "Obtiens {h} cœurs auprès de {n} habitants", minis: "Joue au moins une fois à chaque mini-jeu", sumfp: "Gagne {n} points d'amitié" },
    notReady: "L'objectif n'est pas encore atteint.",
    error: "Impossible de sauvegarder ta progression.",
    who: { hrdina: "Toi", knihovnice: "Bibliothécaire", pekar: "Boulanger", kluk: "Garçon", farmar: "Fermier", babicka: "Mamie" },
    chapters: {
      arrival: {
        title: "La carte perdue",
        intro: [
          { who: "knihovnice", text: "Oh, te voilà ! J'ai trouvé une carte des étoiles déchirée à la bibliothèque. Chaque morceau est gardé par quelqu'un du bourg." },
          { who: "hrdina", text: "Une carte des étoiles ? Où mène-t-elle ?" },
          { who: "knihovnice", text: "Personne ne le sait. Mais les habitants ne te donneront pas un morceau tant que tu n'auras pas discuté avec eux. Essaie avec au moins trois d'entre eux." },
        ],
        outro: [
          { who: "knihovnice", text: "Formidable ! Tout le monde parle de toi. Le premier morceau de la carte est à toi." },
          { who: "hrdina", text: "Ça ressemble à une constellation. Et ensuite ?" },
        ],
      },
      friends: {
        title: "La vraie amitié",
        intro: [
          { who: "pekar", text: "Bonjour ! Je garde le deuxième morceau sous un gâteau. Je ne le donne qu'à un vrai ami." },
          { who: "hrdina", text: "Comment reconnaît-on un vrai ami ?" },
          { who: "pekar", text: "Deux cœurs pendant la conversation, pour moi, c'est une preuve. Discute, pose des questions ou offre un cadeau à quelqu'un." },
        ],
        outro: [
          { who: "pekar", text: "Deux cœurs ! Voilà le deuxième morceau, encore tout chaud." },
          { who: "kluk", text: "Regarde, la carte se reforme ! Cherchons la suite !" },
        ],
      },
      skills: {
        title: "Des mains habiles",
        intro: [
          { who: "farmar", text: "Le troisième morceau est accroché au saule près de la lagune, mais je ne l'atteins pas. Tu m'aides pour le reste du travail ?" },
          { who: "hrdina", text: "Bien sûr. Que faut-il faire ?" },
          { who: "farmar", text: "Pêche un poisson dans la lagune, récolte les légumes du champ et aide le boulanger avec les ingrédients. Chacun au moins une fois." },
        ],
        outro: [
          { who: "farmar", text: "Bravo ! Tu as des mains habiles. Le troisième morceau est à toi." },
          { who: "hrdina", text: "Je vois que la carte pointe vers l'espace." },
        ],
      },
      together: {
        title: "Ensemble",
        intro: [
          { who: "babicka", text: "Le quatrième morceau est rangé dans mon placard à recettes. Mais je voudrais que tout le monde dans le bourg s'apprécie." },
          { who: "hrdina", text: "Que dois-je faire, mamie ?" },
          { who: "babicka", text: "Trouve deux bons amis parmi les habitants. Trois cœurs avec chacun, ça fait plaisir à tout le bourg." },
        ],
        outro: [
          { who: "babicka", text: "Deux amis et autant de cœurs ! Le quatrième morceau est à toi, mon petit." },
          { who: "knihovnice", text: "Il ne reste que le dernier. Il montrera où la carte se cache." },
        ],
      },
      starmap: {
        title: "La carte des étoiles",
        intro: [
          { who: "knihovnice", text: "Le dernier morceau, c'est tout le bourg qui le porte ensemble. Plus il y a d'amis, plus il brille." },
          { who: "hrdina", text: "Alors je vais continuer à discuter, à poser des questions et à jouer !" },
          { who: "kluk", text: "Et moi, je t'aiderai ! Ce sera le plus grand secret du bourg." },
        ],
        outro: [
          { who: "knihovnice", text: "La carte est complète ! Elle montre les étoiles au-dessus du bourg, où une nouvelle aventure attend chacun." },
          { who: "hrdina", text: "Merci à tous. Sans l'aide de chacun, je ne l'aurais jamais reconstituée." },
          { who: "pekar", text: "Ce qu'il y a de mieux dans ce bourg, c'est qu'ensemble on va plus loin. Un gâteau pour tout le monde !" },
        ],
      },
    },
  },
};
export const getTownStoryText = (locale: Locale) => texts[locale];
