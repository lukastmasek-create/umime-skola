import type { Locale } from "@/i18n/config";
import type { Puzzle, Room } from "../types";
import { LAB_ROOM } from "./lab";

// Překlady Laboratoře doktora Atoma. Struktura, odpovědi (značky a kód) a souřadnice zůstávají,
// mění se jen texty podle id předmětů, hádanek a klikacích míst.
type PuzzleText = {
  title: string;
  prompt: string;
  hints: [string, string, string];
  rewardMessage: string;
  placeholder?: string;
  pairs?: [string, string][];
  items?: string[];
  options?: string[];
};
type LabText = {
  intro: string;
  winMessage: string;
  items: Record<string, { name: string; description: string; note?: string }>;
  recipe: string;
  puzzles: Record<string, PuzzleText>;
  hotspots: Record<string, { label?: string; message?: string; lockedMessage?: string }>;
};

function translateLab(t: LabText): Room {
  return {
    ...LAB_ROOM,
    intro: t.intro,
    winMessage: t.winMessage,
    items: LAB_ROOM.items.map((i) => ({ ...i, ...t.items[i.id] })),
    recipes: LAB_ROOM.recipes.map((r) => ({ ...r, message: t.recipe })),
    puzzles: LAB_ROOM.puzzles.map((p) => ({ ...p, ...t.puzzles[p.id] }) as Puzzle),
    hotspots: LAB_ROOM.hotspots.map((h) => ({ ...h, ...t.hotspots[h.id] })),
  };
}

const en: LabText = {
  intro:
    "You woke up locked in Doctor Atom's laboratory. The reactor in the corner is starting up and the door opens only with the right code. Search the room, solve the riddles and run before the laboratory overloads!",
  winMessage: "The door flew open and you ran outside just as the reactor shut down. Doctor Atom winked at you curiously from the monitor: \"You're a true chemist!\"",
  items: {
    key: { name: "Cabinet key", description: "A small key that belongs to the cabinet with the chemicals." },
    note1: { name: "Note 1", description: "A crumpled paper with the number 1.", note: "First digit of the code: the atomic number of oxygen." },
    note2: { name: "Note 2", description: "A paper with the number 2.", note: "Second digit of the code: the number of hydrogen atoms in one water molecule." },
    note3: { name: "Note 3", description: "A paper with the number 3.", note: "Third digit of the code: the atomic number of carbon." },
    note4: { name: "Note 4", description: "A paper with the number 4.", note: "Fourth digit of the code: how many basic states of matter do you learn about at school (solid, liquid, gas)?" },
    acid: { name: "Hydrochloric acid (HCl)", description: "Be careful with it. It reacts with metals." },
    zinc: { name: "Zinc strip (Zn)", description: "A shiny metal strip." },
    hydrogen: { name: "Hydrogen balloon (H₂)", description: "Hydrogen is lighter than air, so the balloon rises to the ceiling." },
    card: { name: "Access card", description: "A card with a magnetic stripe for the laboratory computer." },
  },
  recipe: "Zn + 2 HCl → ZnCl₂ + H₂↑. The metal zinc reacts with the acid and the gas hydrogen is released. It inflated a balloon that rises up!",
  puzzles: {
    periodic: {
      title: "Periodic table",
      prompt: "One square is torn out of the poster with the periodic table. It belonged to gold. Write the chemical symbol of gold.",
      placeholder: "element symbol",
      hints: ["Gold is a heavy yellow metal used for jewellery.", "The symbol comes from the Latin name aurum.", "The symbol has two letters and starts with A."],
      rewardMessage: "A key and a crumpled note are hidden behind the torn-out square.",
    },
    cabinet: {
      title: "Chemical cabinet",
      prompt: "The cabinet lock opens when you match each formula with the right substance.",
      pairs: [
        ["H₂O", "water"],
        ["NaCl", "table salt"],
        ["CO₂", "carbon dioxide"],
        ["O₂", "oxygen"],
      ],
      hints: ["Start with what you know from the kitchen: table salt is sodium chloride.", "Oxygen and water differ: water has two different elements, oxygen only one.", "We breathe out CO₂, breathe in O₂, drink H₂O and salt food with NaCl."],
      rewardMessage: "The cabinet clicked. Inside are a bottle of acid and a note.",
    },
    safety: {
      title: "Work desk",
      prompt: "The drawer is locked by a safety rule. Put the steps of a safe experiment in order from first to last.",
      items: ["Put on safety goggles", "Check what is in the container", "Measure the right amount of substance", "Mix the substances carefully", "Write down the result of the experiment"],
      hints: ["Safety always comes first.", "First you prepare and check, only then mix.", "Writing down results comes at the end, when the experiment is done."],
      rewardMessage: "The drawer unlocked. Inside are a zinc strip and a note.",
    },
    computer: {
      title: "Laboratory computer",
      prompt: "The computer reports: \"Reactor cooling is off.\" To log in, answer: which gas is produced when zinc reacts with hydrochloric acid?",
      options: ["Oxygen, O₂", "Hydrogen, H₂", "Chlorine, Cl₂", "Methane, CH₄"],
      hints: ["This gas is just what keeps the balloon in the air.", "It is the lightest gas of all.", "The formula has two identical atoms and the name starts with H."],
      rewardMessage: "Cooling switched on, the reactor calmed down and the door lock released. Now enter the code.",
    },
    door: {
      title: "Door",
      prompt: "A four-digit code glows on the door. Read all four notes in your inventory and work out the digits.",
      placeholder: "four digits",
      hints: ["Open your inventory and read all four notes.", "Oxygen has atomic number 8 and carbon 6.", "Water H₂O has two hydrogen atoms and substances have three common states. The code is 8263."],
      rewardMessage: "The lock clicked and the door opened!",
    },
  },
  hotspots: {
    poster: { label: "Periodic table" },
    cabinet: { label: "Chemical cabinet", lockedMessage: "The cabinet is locked. You need a key. Select it in your inventory and click the cabinet." },
    desk: { label: "Work desk" },
    vent: {
      label: "Ceiling fan",
      message: "The hydrogen balloon floated up to the fan and blew an access card and a note out of the grille. You caught them!",
      lockedMessage: "Something is wedged in the fan, but you can't reach it. Something light could float up there.",
    },
    computer: { label: "Computer", lockedMessage: "The computer wants a card login. Select the card in your inventory and click the computer." },
    door: { label: "Door", lockedMessage: "The door has an electronic lock. First you must switch off the cooling on the computer." },
    reactor: { label: "Reactor", message: "The reactor hums and flashes. It won't stop until you solve all the riddles." },
    robot: { label: "Robot Atom" },
  },
};

const de: LabText = {
  intro:
    "Du bist im Labor von Doktor Atom eingesperrt aufgewacht. Der Reaktor in der Ecke fährt hoch, und die Tür öffnet sich nur mit dem richtigen Code. Durchsuche den Raum, löse die Rätsel und lauf, bevor das Labor überlastet wird!",
  winMessage: "Die Tür flog auf, und du bist hinausgelaufen, genau als der Reaktor ausging. Doktor Atom zwinkerte dir neugierig vom Monitor zu: „Du bist ein echter Chemiker!“",
  items: {
    key: { name: "Schrankschlüssel", description: "Ein kleiner Schlüssel, der zum Chemikalienschrank gehört." },
    note1: { name: "Notiz 1", description: "Ein zerknülltes Papier mit der Nummer 1.", note: "Erste Ziffer des Codes: die Ordnungszahl von Sauerstoff." },
    note2: { name: "Notiz 2", description: "Ein Zettel mit der Nummer 2.", note: "Zweite Ziffer des Codes: die Anzahl der Wasserstoffatome in einem Wassermolekül." },
    note3: { name: "Notiz 3", description: "Ein Zettel mit der Nummer 3.", note: "Dritte Ziffer des Codes: die Ordnungszahl von Kohlenstoff." },
    note4: { name: "Notiz 4", description: "Ein Zettel mit der Nummer 4.", note: "Vierte Ziffer des Codes: Wie viele grundlegende Aggregatzustände lernst du in der Schule (fest, flüssig, gasförmig)?" },
    acid: { name: "Salzsäure (HCl)", description: "Vorsicht damit. Sie reagiert mit Metallen." },
    zinc: { name: "Zinkplättchen (Zn)", description: "Ein glänzendes Metallplättchen." },
    hydrogen: { name: "Wasserstoffballon (H₂)", description: "Wasserstoff ist leichter als Luft, deshalb steigt der Ballon zur Decke." },
    card: { name: "Zugangskarte", description: "Eine Karte mit Magnetstreifen für den Laborcomputer." },
  },
  recipe: "Zn + 2 HCl → ZnCl₂ + H₂↑. Das Metall Zink reagiert mit der Säure, und es entsteht das Gas Wasserstoff. Daraus hat sich ein Ballon aufgeblasen, der nach oben steigt!",
  puzzles: {
    periodic: {
      title: "Periodensystem",
      prompt: "Auf dem Plakat mit dem Periodensystem ist ein Kästchen herausgerissen. Es gehörte zu Gold. Schreibe das chemische Symbol von Gold.",
      placeholder: "Elementsymbol",
      hints: ["Gold ist ein schweres gelbes Metall, das für Schmuck verwendet wird.", "Das Symbol stammt vom lateinischen Namen aurum.", "Das Symbol hat zwei Buchstaben und beginnt mit A."],
      rewardMessage: "Hinter dem herausgerissenen Kästchen sind ein Schlüssel und eine zerknüllte Notiz versteckt.",
    },
    cabinet: {
      title: "Chemikalienschrank",
      prompt: "Das Schloss des Schranks öffnet sich, wenn du jede Formel dem richtigen Stoff zuordnest.",
      pairs: [
        ["H₂O", "Wasser"],
        ["NaCl", "Kochsalz"],
        ["CO₂", "Kohlendioxid"],
        ["O₂", "Sauerstoff"],
      ],
      hints: ["Beginne mit dem, was du aus der Küche kennst: Kochsalz ist Natriumchlorid.", "Sauerstoff und Wasser unterscheiden sich: Wasser hat zwei verschiedene Elemente, Sauerstoff nur eines.", "CO₂ atmen wir aus, O₂ atmen wir ein, H₂O trinken wir und mit NaCl salzen wir."],
      rewardMessage: "Der Schrank klickte. Darin sind eine Flasche Säure und eine Notiz.",
    },
    safety: {
      title: "Arbeitstisch",
      prompt: "Die Schublade ist durch eine Sicherheitsregel verschlossen. Ordne die Schritte eines sicheren Experiments vom ersten bis zum letzten.",
      items: ["Setze die Schutzbrille auf", "Prüfe, was im Behälter ist", "Miss die richtige Menge des Stoffes ab", "Mische die Stoffe vorsichtig", "Notiere das Ergebnis des Experiments"],
      hints: ["Sicherheit kommt immer zuerst.", "Zuerst bereitest du vor und prüfst, erst dann wird gemischt.", "Das Notieren der Ergebnisse kommt am Ende, wenn das Experiment fertig ist."],
      rewardMessage: "Die Schublade hat sich entsperrt. Darin sind ein Zinkplättchen und eine Notiz.",
    },
    computer: {
      title: "Laborcomputer",
      prompt: "Der Computer meldet: „Die Reaktorkühlung ist ausgeschaltet.“ Um dich anzumelden, antworte: Welches Gas entsteht, wenn Zink mit Salzsäure reagiert?",
      options: ["Sauerstoff, O₂", "Wasserstoff, H₂", "Chlor, Cl₂", "Methan, CH₄"],
      hints: ["Dieses Gas hält gerade den Ballon in der Luft.", "Es ist das leichteste aller Gase.", "Die Formel hat zwei gleiche Atome, und der Name beginnt mit W."],
      rewardMessage: "Die Kühlung hat sich eingeschaltet, der Reaktor hat sich beruhigt, und das Türschloss wurde entsperrt. Jetzt fehlt nur noch der Code.",
    },
    door: {
      title: "Tür",
      prompt: "An der Tür leuchtet ein vierstelliger Code. Lies alle vier Notizen in deinem Inventar und leite die Ziffern ab.",
      placeholder: "vier Ziffern",
      hints: ["Öffne das Inventar und lies alle vier Notizen.", "Sauerstoff hat die Ordnungszahl 8 und Kohlenstoff 6.", "Wasser H₂O hat zwei Wasserstoffatome, und Stoffe haben drei übliche Zustände. Der Code ist 8263."],
      rewardMessage: "Das Schloss klickte, und die Tür öffnete sich!",
    },
  },
  hotspots: {
    poster: { label: "Periodensystem" },
    cabinet: { label: "Chemikalienschrank", lockedMessage: "Der Schrank ist verschlossen. Du brauchst einen Schlüssel. Wähle ihn im Inventar aus und klicke auf den Schrank." },
    desk: { label: "Arbeitstisch" },
    vent: {
      label: "Deckenventilator",
      message: "Der Wasserstoffballon stieg zum Ventilator auf und blies eine Zugangskarte und eine Notiz aus dem Gitter. Du hast sie gefangen!",
      lockedMessage: "Im Ventilator steckt etwas fest, aber du kommst nicht heran. Etwas Leichtes könnte dort hinaufsteigen.",
    },
    computer: { label: "Computer", lockedMessage: "Der Computer will eine Anmeldung per Karte. Wähle die Karte im Inventar aus und klicke auf den Computer." },
    door: { label: "Tür", lockedMessage: "Die Tür hat ein elektronisches Schloss. Zuerst musst du am Computer die Kühlung ausschalten." },
    reactor: { label: "Reaktor", message: "Der Reaktor brummt und blinkt. Er hält nicht an, bis du alle Rätsel gelöst hast." },
    robot: { label: "Roboter Atom" },
  },
};

const ru: LabText = {
  intro:
    "Ты проснулся запертым в лаборатории доктора Атома. Реактор в углу запускается, а дверь откроется только правильным кодом. Обыщи комнату, реши загадки и беги, пока лаборатория не перегрузилась!",
  winMessage: "Дверь распахнулась, и ты выбежал наружу, как раз когда реактор погас. Доктор Атом любопытно подмигнул тебе с монитора: «Ты настоящий химик!»",
  items: {
    key: { name: "Ключ от шкафчика", description: "Маленький ключ, который подходит к шкафчику с химикатами." },
    note1: { name: "Записка 1", description: "Помятая бумажка с номером 1.", note: "Первая цифра кода: порядковый номер кислорода." },
    note2: { name: "Записка 2", description: "Бумажка с номером 2.", note: "Вторая цифра кода: число атомов водорода в одной молекуле воды." },
    note3: { name: "Записка 3", description: "Бумажка с номером 3.", note: "Третья цифра кода: порядковый номер углерода." },
    note4: { name: "Записка 4", description: "Бумажка с номером 4.", note: "Четвёртая цифра кода: сколько основных агрегатных состояний вещества изучают в школе (твёрдое, жидкое, газообразное)?" },
    acid: { name: "Соляная кислота (HCl)", description: "Осторожно с ней. Она реагирует с металлами." },
    zinc: { name: "Цинковая пластинка (Zn)", description: "Блестящая металлическая пластинка." },
    hydrogen: { name: "Шарик с водородом (H₂)", description: "Водород легче воздуха, поэтому шарик поднимается к потолку." },
    card: { name: "Карта доступа", description: "Карта с магнитной полосой для компьютера в лаборатории." },
  },
  recipe: "Zn + 2 HCl → ZnCl₂ + H₂↑. Металл цинк реагирует с кислотой, и выделяется газ водород. Из него надулся шарик, который поднимается вверх!",
  puzzles: {
    periodic: {
      title: "Периодическая таблица",
      prompt: "На плакате с периодической таблицей вырвана одна клеточка. Она принадлежала золоту. Напиши химический символ золота.",
      placeholder: "символ элемента",
      hints: ["Золото — тяжёлый жёлтый металл, из него делают украшения.", "Символ происходит от латинского названия aurum.", "В символе две буквы, и он начинается на A."],
      rewardMessage: "За вырванной клеточкой спрятаны ключ и помятая записка.",
    },
    cabinet: {
      title: "Шкафчик с химикатами",
      prompt: "Замок шкафчика откроется, когда ты подберёшь каждой формуле правильное вещество.",
      pairs: [
        ["H₂O", "вода"],
        ["NaCl", "поваренная соль"],
        ["CO₂", "углекислый газ"],
        ["O₂", "кислород"],
      ],
      hints: ["Начни с того, что знаешь с кухни: поваренная соль — это хлорид натрия.", "Кислород и вода различаются: в воде два разных элемента, в кислороде только один.", "CO₂ мы выдыхаем, O₂ вдыхаем, H₂O пьём, а NaCl солим еду."],
      rewardMessage: "Шкафчик щёлкнул. Внутри пузырёк с кислотой и записка.",
    },
    safety: {
      title: "Рабочий стол",
      prompt: "Ящик заперт правилом безопасности. Расставь шаги безопасного опыта от первого до последнего.",
      items: ["Надень защитные очки", "Проверь, что в ёмкости", "Отмерь нужное количество вещества", "Осторожно смешай вещества", "Запиши результат опыта"],
      hints: ["Безопасность всегда на первом месте.", "Сначала готовишься и проверяешь, только потом смешиваешь.", "Запись результатов в конце, когда опыт закончен."],
      rewardMessage: "Ящик открылся. Внутри цинковая пластинка и записка.",
    },
    computer: {
      title: "Компьютер в лаборатории",
      prompt: "Компьютер сообщает: «Охлаждение реактора выключено». Чтобы войти, ответь: какой газ образуется, когда цинк реагирует с соляной кислотой?",
      options: ["Кислород, O₂", "Водород, H₂", "Хлор, Cl₂", "Метан, CH₄"],
      hints: ["Этот газ как раз удерживает шарик в воздухе.", "Это самый лёгкий из всех газов.", "В формуле два одинаковых атома, а название начинается на В."],
      rewardMessage: "Охлаждение включилось, реактор успокоился, и замок двери разблокировался. Осталось ввести код.",
    },
    door: {
      title: "Дверь",
      prompt: "На двери светится четырёхзначный код. Прочитай все четыре записки в инвентаре и выведи из них цифры.",
      placeholder: "четыре цифры",
      hints: ["Открой инвентарь и прочитай все четыре записки.", "У кислорода порядковый номер 8, у углерода 6.", "В воде H₂O два атома водорода, а у веществ три обычных состояния. Код — 8263."],
      rewardMessage: "Замок щёлкнул, и дверь открылась!",
    },
  },
  hotspots: {
    poster: { label: "Периодическая таблица" },
    cabinet: { label: "Шкафчик с химикатами", lockedMessage: "Шкафчик заперт. Нужен ключ. Выбери его в инвентаре и нажми на шкафчик." },
    desk: { label: "Рабочий стол" },
    vent: {
      label: "Потолочный вентилятор",
      message: "Шарик с водородом поднялся к вентилятору и выдул из решётки карту доступа и записку. Ты их поймал!",
      lockedMessage: "В вентиляторе что-то застряло, но ты не достаёшь. Что-нибудь лёгкое могло бы подняться туда.",
    },
    computer: { label: "Компьютер", lockedMessage: "Компьютер требует вход по карте. Выбери карту в инвентаре и нажми на компьютер." },
    door: { label: "Дверь", lockedMessage: "Дверь закрыта электронным замком. Сначала нужно отключить охлаждение на компьютере." },
    reactor: { label: "Реактор", message: "Реактор гудит и мигает. Он не остановится, пока ты не решишь все загадки." },
    robot: { label: "Робот Атом" },
  },
};

export const LAB_VARIANTS: Partial<Record<Locale, Room>> = { en: translateLab(en), de: translateLab(de), ru: translateLab(ru) };
