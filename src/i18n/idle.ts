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

const uk: IdleText = {
  nav: "Постійні ігри",
  title: "Постійні ігри",
  subtitle: "Ігри, які ніколи не закінчуються. Бали за навчання їх рухають: ти будуєш, покращуєш і дбаєш про своє.",
  soon: "Незабаром",
  play: "Грати",
  note: "Усі п'ять ігор уже доступні.",
  games: [
    { name: "База", description: "Побудуй власну базу і поступово покращуй її за бали, які отримуєш за навчання." },
    { name: "Улюбленці", description: "Виховуй улюбленців, годуй їх, грайся з ними і спостерігай, як вони ростуть." },
    { name: "Ферма", description: "Вирощуй урожай і тварин. Чим більше ти вчишся, тим більше заробляє ферма." },
    { name: "Місто", description: "Розвивай своє місто від маленького села до великого міста." },
    { name: "Економіка", description: "Збагачуйся: знайди роботу, засновуй компанії, інвестуй і ризикуй в угодах. Бали за навчання допомагають заробляти більше." },
  ],
};

const ja: IdleText = {
  nav: "いつでも遊べるゲーム",
  title: "いつでも遊べるゲーム",
  subtitle: "終わらないゲームです。学習で得たポイントがゲームを動かします。建てたり、強化したり、自分のものを大切に育てたりしましょう。",
  soon: "近日公開",
  play: "遊ぶ",
  note: "5つのゲームすべてで遊べるようになりました。",
  games: [
    { name: "基地", description: "自分だけの基地を建てて、学習で得たポイントで少しずつ強化しましょう。" },
    { name: "ペット", description: "ペットを育て、えさをあげ、一緒に遊び、成長を見守りましょう。" },
    { name: "ファーム", description: "作物と動物を育てましょう。学習するほど、ファームの収入が増えます。" },
    { name: "町", description: "小さな村から大きな町まで、自分の町を育てましょう。" },
    { name: "経済", description: "お金持ちを目指しましょう。仕事に就き、会社を作り、投資して、取引に挑戦できます。学習ポイントでより多く稼げます。" },
  ],
};

const es: IdleText = {
  nav: "Juegos sin fin",
  title: "Juegos sin fin",
  subtitle: "Juegos que nunca terminan. Los puntos de aprendizaje los mantienen en marcha: construyes, mejoras y cuidas tus cosas.",
  soon: "Pronto",
  play: "Jugar",
  note: "Los cinco juegos ya se pueden jugar.",
  games: [
    { name: "Base", description: "Construye tu propia base y mejórala poco a poco con los puntos que consigues aprendiendo." },
    { name: "Mascotas", description: "Cría mascotas, dales de comer, juega con ellas y mira cómo crecen." },
    { name: "Granja", description: "Cultiva cosechas y animales. Cuanto más aprendes, más gana tu granja." },
    { name: "Ciudad", description: "Haz crecer tu propia ciudad desde un pequeño pueblo hasta una gran urbe." },
    { name: "Economía", description: "Hazte rico: consigue un trabajo, crea empresas, invierte y prueba suerte en los negocios. Los puntos de aprendizaje te hacen ganar más." },
  ],
};

const fr: IdleText = {
  nav: "Jeux sans fin",
  title: "Jeux sans fin",
  subtitle: "Des jeux qui ne finissent jamais. Les points d'apprentissage les font avancer : tu construis, améliores et prends soin de tes affaires.",
  soon: "Bientôt",
  play: "Jouer",
  note: "Les cinq jeux sont maintenant jouables.",
  games: [
    { name: "Base", description: "Construis ta propre base et améliore-la petit à petit avec les points gagnés en apprenant." },
    { name: "Animaux de compagnie", description: "Élève tes animaux de compagnie, nourris-les, joue avec eux et regarde-les grandir." },
    { name: "Ferme", description: "Fais pousser des cultures et des animaux. Plus tu apprends, plus ta ferme rapporte." },
    { name: "Ville", description: "Fais grandir ta propre ville, du petit village à la grande métropole." },
    { name: "Économie", description: "Deviens riche : trouve un emploi, crée des entreprises, investis et tente ta chance dans les affaires. Les points d'apprentissage te font gagner plus." },
  ],
};

const texts: Record<Locale, IdleText> = { ...withFallbacks({ cs, en, de, ru }), uk, ja, es, fr };

export function getIdleText(locale: Locale): IdleText {
  return texts[locale];
}
