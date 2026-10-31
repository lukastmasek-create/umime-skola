import type { Locale } from "./config";
import type { MiniId } from "@/lib/town-mini";

export type TownMiniText = {
  names: Record<MiniId, string>;
  intro: Record<MiniId, string>;
  start: string;
  playsLeft: string; // {n}
  noPlays: string;
  login: string;
  error: string;
  close: string;
  score: string; // {n}
  points: string;
  cast: string; // {a} {b}
  waiting: string;
  hook: string;
  reel: string;
  caught: string; // {n}
  escaped: string;
  next: string;
  finish: string;
  harvestHint: string;
  round: string;
  watch: string;
  repeat: string;
  bakeOver: string; // {n}
};

const cs: TownMiniText = {
  names: { fishing: "Rybaření v laguně", harvest: "Sklizeň na farmě", bakery: "Pekárna", cashier: "Pokladna v pekárně", library: "Knihovna: abeceda", stars: "Hvězdárna: vesmír a svět", flowers: "Květinářství: co kam patří" },
  intro: {
    fishing: "Hoď udici a počkej na záběr. Až se objeví ❗, rychle zasekni! Potom třikrát klikni, když je jezdec v zelené zóně. Pět rybolovů.",
    harvest: "Zelenina vyskakuje z políček. Klikej na ni, ať ji sklidíš za 30 sekund. Pozor na housenky 🐛, ty ti ubírají body!",
    bakery: "Pekař ti ukáže pořadí surovin. Zopakuj ho přesně a každé kolo bude o jednu surovinu delší.",
    cashier: "Zákazníci nakupují pečivo. Spočítej, kolik zaplatí, a později i kolik jim vrátíš. Deset zákazníků.",
    library: "Knihy se rozsypaly! Klikej na ně v abecedním pořadí, ať je polička zase srovnaná. Šest poliček.",
    stars: "Hvězdář se ptá na planety a světadíly: která je větší, která blíž ke Slunci? Deset otázek.",
    flowers: "Do květinářství přišla dodávka. Rozděl každou věc: ovoce, zelenina, květina, nebo strom? Dvanáct kousků.",
  },
  start: "Hrát",
  playsLeft: "Dnes ti zbývá kol: {n}",
  noPlays: "Dnes už jsi hrál/a všechna kola. Zkus to zítra!",
  login: "Pro odměny se přihlas.",
  error: "Výsledek se nepodařilo uložit.",
  close: "Hotovo",
  score: "Skóre: {n}",
  points: "bodů",
  cast: "Rybolov {a} / {b}",
  waiting: "Čekám na záběr…",
  hook: "Zasekni!",
  reel: "Navíjej!",
  caught: "Ryba chycena! +{n}",
  escaped: "Ryba uplavala…",
  next: "Další rybolov",
  finish: "Dokončit",
  harvestHint: "Mrkev, rajče a kukuřice dávají bod, housenka bere dva.",
  round: "Kolo",
  watch: "Sleduj pořadí…",
  repeat: "Teď ty!",
  bakeOver: "Hotovo! Zvládl/a jsi {n} kol.",
};
const en: TownMiniText = {
  names: { fishing: "Fishing in the lagoon", harvest: "Farm harvest", bakery: "Bakery", cashier: "Bakery till", library: "Library: ABC", stars: "Observatory: space & world", flowers: "Flower shop: sort it out" },
  intro: {
    fishing: "Cast your rod and wait for a bite. When ❗ appears, hook it fast! Then click three times while the slider is in the green zone. Five casts.",
    harvest: "Veggies pop out of the patches. Click them to harvest as many as you can in 30 seconds. Watch out for caterpillars 🐛, they cost points!",
    bakery: "The baker shows you a sequence of ingredients. Repeat it exactly; every round adds one more.",
    cashier: "Customers are buying pastries. Work out how much they pay, and later how much change they get. Ten customers.",
    library: "The books fell over! Click them in alphabetical order to tidy the shelf. Six shelves.",
    stars: "The astronomer asks about planets and continents: which is bigger, which is closer to the Sun? Ten questions.",
    flowers: "A delivery has arrived. Sort each thing: fruit, vegetable, flower or tree? Twelve items.",
  },
  start: "Play",
  playsLeft: "Rounds left today: {n}",
  noPlays: "You've played all rounds today. Try again tomorrow!",
  login: "Log in to earn rewards.",
  error: "Could not save your result.",
  close: "Done",
  score: "Score: {n}",
  points: "points",
  cast: "Cast {a} / {b}",
  waiting: "Waiting for a bite…",
  hook: "Hook it!",
  reel: "Reel in!",
  caught: "Caught! +{n}",
  escaped: "The fish got away…",
  next: "Next cast",
  finish: "Finish",
  harvestHint: "Carrot, tomato and corn give a point, a caterpillar takes two.",
  round: "Round",
  watch: "Watch the order…",
  repeat: "Your turn!",
  bakeOver: "Done! You got through {n} rounds.",
};
const de: TownMiniText = {
  names: { fishing: "Angeln in der Lagune", harvest: "Ernte auf dem Hof", bakery: "Bäckerei", cashier: "Bäckereikasse", library: "Bibliothek: ABC", stars: "Sternwarte: Weltall und Welt", flowers: "Blumenladen: Was gehört wohin?" },
  intro: {
    fishing: "Wirf die Angel aus und warte auf einen Biss. Wenn ❗ erscheint, schnell anschlagen! Dann dreimal klicken, solange der Regler im grünen Bereich ist. Fünf Würfe.",
    harvest: "Gemüse springt aus den Beeten. Klicke es an und ernte in 30 Sekunden so viel du kannst. Vorsicht vor Raupen 🐛, sie kosten Punkte!",
    bakery: "Der Bäcker zeigt dir eine Reihenfolge von Zutaten. Wiederhole sie genau; jede Runde kommt eine dazu.",
    cashier: "Kunden kaufen Gebäck. Rechne aus, wie viel sie zahlen, und später auch das Wechselgeld. Zehn Kunden.",
    library: "Die Bücher sind umgefallen! Klicke sie in alphabetischer Reihenfolge an, damit das Regal wieder ordentlich ist. Sechs Regale.",
    stars: "Die Astronomin fragt nach Planeten und Kontinenten: Was ist größer, was ist näher an der Sonne? Zehn Fragen.",
    flowers: "Eine Lieferung ist da. Sortiere alles: Obst, Gemüse, Blume oder Baum? Zwölf Stück.",
  },
  start: "Spielen",
  playsLeft: "Heute übrig: {n} Runden",
  noPlays: "Du hast heute alle Runden gespielt. Versuch es morgen wieder!",
  login: "Melde dich an, um Belohnungen zu bekommen.",
  error: "Das Ergebnis konnte nicht gespeichert werden.",
  close: "Fertig",
  score: "Punkte: {n}",
  points: "Punkte",
  cast: "Wurf {a} / {b}",
  waiting: "Warte auf einen Biss…",
  hook: "Anschlagen!",
  reel: "Einholen!",
  caught: "Gefangen! +{n}",
  escaped: "Der Fisch ist entkommen…",
  next: "Nächster Wurf",
  finish: "Beenden",
  harvestHint: "Karotte, Tomate und Mais geben einen Punkt, eine Raupe nimmt zwei.",
  round: "Runde",
  watch: "Merke dir die Reihenfolge…",
  repeat: "Du bist dran!",
  bakeOver: "Fertig! Du hast {n} Runden geschafft.",
};
const ru: TownMiniText = {
  names: { fishing: "Рыбалка в лагуне", harvest: "Урожай на ферме", bakery: "Пекарня", cashier: "Касса в пекарне", library: "Библиотека: алфавит", stars: "Обсерватория: космос и мир", flowers: "Цветочный магазин: что куда" },
  intro: {
    fishing: "Закинь удочку и жди поклёвки. Когда появится ❗, быстро подсекай! Потом трижды нажми, пока ползунок в зелёной зоне. Пять забросов.",
    harvest: "Овощи выскакивают из грядок. Кликай по ним и собери как можно больше за 30 секунд. Берегись гусениц 🐛, они отнимают очки!",
    bakery: "Пекарь показывает порядок ингредиентов. Повтори его точно; с каждым раундом на один ингредиент больше.",
    cashier: "Покупатели берут выпечку. Посчитай, сколько они платят, а потом и сколько сдачи. Десять покупателей.",
    library: "Книги рассыпались! Нажимай на них по алфавиту, чтобы навести порядок на полке. Шесть полок.",
    stars: "Астроном спрашивает о планетах и материках: что больше, что ближе к Солнцу? Десять вопросов.",
    flowers: "Пришла поставка. Разложи всё: фрукт, овощ, цветок или дерево? Двенадцать предметов.",
  },
  start: "Играть",
  playsLeft: "Осталось раундов сегодня: {n}",
  noPlays: "Сегодня ты уже сыграл все раунды. Приходи завтра!",
  login: "Войди, чтобы получать награды.",
  error: "Не удалось сохранить результат.",
  close: "Готово",
  score: "Счёт: {n}",
  points: "очков",
  cast: "Заброс {a} / {b}",
  waiting: "Жду поклёвку…",
  hook: "Подсекай!",
  reel: "Тяни!",
  caught: "Поймана! +{n}",
  escaped: "Рыба ушла…",
  next: "Следующий заброс",
  finish: "Закончить",
  harvestHint: "Морковь, помидор и кукуруза дают очко, гусеница отнимает два.",
  round: "Раунд",
  watch: "Запомни порядок…",
  repeat: "Твоя очередь!",
  bakeOver: "Готово! Ты прошёл {n} раундов.",
};
const texts: Record<Locale, TownMiniText> = { cs, en, de, ru };
export const getTownMiniText = (locale: Locale) => texts[locale];
