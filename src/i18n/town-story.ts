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

const texts: Record<Locale, TownStoryText> = { cs, en, de, ru };
export const getTownStoryText = (locale: Locale) => texts[locale];
