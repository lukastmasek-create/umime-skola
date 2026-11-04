import { withFallbacks } from "./config";
import type { Locale } from "./config";

export type IdleGame = { name: string; description: string };

export type IdleText = {
  nav: string;
  title: string;
  subtitle: string;
  soon: string;
  play: string;
  note: string;
  games: [IdleGame, IdleGame, IdleGame, IdleGame, IdleGame];
};

const cs: IdleText = {
  nav: "Stálé hry",
  title: "Stálé hry",
  subtitle: "Hry, které nikdy nekončí. Body za učení v nich pracují: stavíš, vylepšuješ a staráš se o své věci.",
  soon: "Brzy",
  play: "Hrát",
  note: "Všech pět her už je hratelných.",
  games: [
    { name: "Základna", description: "Postav si vlastní základnu a postupně ji vylepšuj za body, které získáš učením." },
    { name: "Mazlíčci", description: "Vychovávej mazlíčky, krm je, hraj si s nimi a sleduj, jak rostou." },
    { name: "Farma", description: "Pěstuj úrodu a zvířata. Čím víc se učíš, tím víc farma vydělává." },
    { name: "Město", description: "Rozvíjej vlastní město od malé vesnice až po velké město." },
    { name: "Ekonomika", description: "Zbohatni: najdi práci, postav firmy, investuj a zkus štěstí v obchodech. Body z učení ti vydělávají víc." },
  ],
};

const en: IdleText = {
  nav: "Endless games",
  title: "Endless games",
  subtitle: "Games that never end. Points from learning keep them going: you build, upgrade and take care of your stuff.",
  soon: "Soon",
  play: "Play",
  note: "All five games are playable now.",
  games: [
    { name: "Base", description: "Build your own base and keep upgrading it with the points you earn by learning." },
    { name: "Pets", description: "Raise pets, feed them, play with them and watch them grow." },
    { name: "Farm", description: "Grow crops and animals. The more you learn, the more your farm earns." },
    { name: "City", description: "Grow your own city from a small village into a big town." },
    { name: "Economy", description: "Get rich: take a job, build companies, invest and hustle. Points from learning make you earn more." },
  ],
};

const de: IdleText = {
  nav: "Endlosspiele",
  title: "Endlosspiele",
  subtitle: "Spiele, die nie enden. Punkte vom Lernen treiben sie an: Du baust, verbesserst und kümmerst dich um deine Sachen.",
  soon: "Bald",
  play: "Spielen",
  note: "Alle fünf Spiele sind jetzt spielbar.",
  games: [
    { name: "Basis", description: "Baue deine eigene Basis und verbessere sie nach und nach mit den Punkten vom Lernen." },
    { name: "Haustiere", description: "Zieh Haustiere groß, füttere sie, spiel mit ihnen und sieh zu, wie sie wachsen." },
    { name: "Farm", description: "Baue Pflanzen an und halte Tiere. Je mehr du lernst, desto mehr verdient deine Farm." },
    { name: "Stadt", description: "Entwickle deine eigene Stadt vom kleinen Dorf zur großen Stadt." },
    { name: "Wirtschaft", description: "Werde reich: such dir einen Job, gründe Firmen, investiere und versuch dein Glück bei Deals. Punkte vom Lernen lassen dich mehr verdienen." },
  ],
};

const ru: IdleText = {
  nav: "Вечные игры",
  title: "Вечные игры",
  subtitle: "Игры, которые никогда не заканчиваются. Баллы за учёбу двигают их вперёд: ты строишь, улучшаешь и заботишься о своём.",
  soon: "Скоро",
  play: "Играть",
  note: "Все пять игр уже доступны.",
  games: [
    { name: "База", description: "Построй свою базу и постепенно улучшай её за баллы, которые получаешь за учёбу." },
    { name: "Питомцы", description: "Выращивай питомцев, кормите их, играй с ними и смотри, как они растут." },
    { name: "Ферма", description: "Выращивай урожай и животных. Чем больше учишься, тем больше доход фермы." },
    { name: "Город", description: "Развивай свой город от маленькой деревни до большого города." },
    { name: "Экономика", description: "Разбогатей: найди работу, строй компании, инвестируй и рискуй в сделках. Баллы за учёбу помогают зарабатывать больше." },
  ],
};

const texts: Record<Locale, IdleText> = withFallbacks({ cs, en, de, ru });

export function getIdleText(locale: Locale): IdleText {
  return texts[locale];
}
