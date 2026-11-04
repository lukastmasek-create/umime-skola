import { withFallbacks } from "@/i18n/config";
import type { Locale } from "@/i18n/config";

export type TitleDef = {
  id: string;
  unlock: { level: number } | { event: string };
  names: Record<Locale, string>;
};

export const TITLES: TitleDef[] = [
  { id: "rookie", unlock: { level: 1 }, names: { ...withFallbacks({ cs: "Nováček", en: "Rookie", de: "Neuling", ru: "Новичок" }), uk: "Новачок", ja: "ルーキー", es: "Novato", fr: "Débutant" } },
  { id: "explorer", unlock: { level: 5 }, names: { ...withFallbacks({ cs: "Průzkumník", en: "Explorer", de: "Entdecker", ru: "Исследователь" }), uk: "Дослідник", ja: "探検家", es: "Explorador", fr: "Explorateur" } },
  { id: "expert", unlock: { level: 12 }, names: { ...withFallbacks({ cs: "Expert", en: "Expert", de: "Experte", ru: "Эксперт" }), uk: "Експерт", ja: "エキスパート", es: "Experto", fr: "Expert" } },
  // Odkaz na fyzika Wernera Heisenberga (princip neurčitosti), titul za Laboratoř.
  { id: "heisenberg", unlock: { event: "escape-lab" }, names: { ...withFallbacks({ cs: "Heisenberg", en: "Heisenberg", de: "Heisenberg", ru: "Гейзенберг" }), uk: "Гайзенберг", ja: "ハイゼンベルク", es: "Heisenberg", fr: "Heisenberg" } },
  { id: "scholar", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Učenec", en: "Scholar", de: "Gelehrter", ru: "Учёный" }), uk: "Учений", ja: "学者", es: "Erudito", fr: "Savant" } },
  { id: "bookworm", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Knihomol", en: "Bookworm", de: "Bücherwurm", ru: "Книголюб" }), uk: "Книжковий черв'як", ja: "本の虫", es: "Ratón de biblioteca", fr: "Rat de bibliothèque" } },
  { id: "mathematician", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Matematik", en: "Mathematician", de: "Mathematiker", ru: "Математик" }), uk: "Математик", ja: "数学者", es: "Matemático", fr: "Mathématicien" } },
  { id: "builder", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Stavitel", en: "Builder", de: "Baumeister", ru: "Строитель" }), uk: "Будівничий", ja: "建設者", es: "Constructor", fr: "Bâtisseur" } },
  { id: "pet-friend", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Přítel zvířat", en: "Animal friend", de: "Tierfreund", ru: "Друг животных" }), uk: "Друг тварин", ja: "動物の友だち", es: "Amigo de los animales", fr: "Ami des animaux" } },
  { id: "legend", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Legenda", en: "Legend", de: "Legende", ru: "Легенда" }), uk: "Легенда", ja: "伝説", es: "Leyenda", fr: "Légende" } },
  { id: "forest-guardian", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Strážce lesa", en: "Forest guardian", de: "Waldwächter", ru: "Страж леса" }), uk: "Охоронець лісу", ja: "森の守護者", es: "Guardián del bosque", fr: "Gardien de la forêt" } },
  { id: "fairy-friend", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Přítel víl", en: "Fairy friend", de: "Feenfreund", ru: "Друг фей" }), uk: "Друг фей", ja: "妖精の友だち", es: "Amigo de las hadas", fr: "Ami des fées" } },
  { id: "firefly", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Světluška", en: "Firefly", de: "Glühwürmchen", ru: "Светлячок" }), uk: "Світлячок", ja: "ホタル", es: "Luciérnaga", fr: "Luciole" } },
  { id: "knight", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Rytíř", en: "Knight", de: "Ritter", ru: "Рыцарь" }), uk: "Лицар", ja: "騎士", es: "Caballero", fr: "Chevalier" } },
  { id: "court-scholar", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Dvorní učenec", en: "Court scholar", de: "Hofgelehrter", ru: "Придворный учёный" }), uk: "Придворний учений", ja: "宮廷の学者", es: "Erudito de la corte", fr: "Savant de cour" } },
  { id: "castle-lord", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Pán hradu", en: "Lord of the castle", de: "Burgherr", ru: "Владыка замка" }), uk: "Володар замку", ja: "城の主", es: "Señor del castillo", fr: "Seigneur du château" } },
  { id: "sea-sage", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Mořský mudrc", en: "Sea sage", de: "Meeresweiser", ru: "Морской мудрец" }), uk: "Морський мудрець", ja: "海の賢者", es: "Sabio del mar", fr: "Sage des mers" } },
  { id: "pearl-hunter", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Lovec perel", en: "Pearl hunter", de: "Perlenjäger", ru: "Ловец жемчуга" }), uk: "Мисливець за перлами", ja: "真珠ハンター", es: "Cazaperlas", fr: "Chasseur de perles" } },
  { id: "deep-diver", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Hlubinný potápěč", en: "Deep diver", de: "Tiefseetaucher", ru: "Глубоководный водолаз" }), uk: "Глибоководний водолаз", ja: "深海ダイバー", es: "Buzo de profundidad", fr: "Plongeur des abysses" } },
  { id: "star-sailor", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Hvězdný mořeplavec", en: "Star sailor", de: "Sternensegler", ru: "Звёздный мореход" }), uk: "Зоряний мореплавець", ja: "星の航海士", es: "Navegante estelar", fr: "Navigateur des étoiles" } },
  { id: "treasure-hunter", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Lovec pokladů", en: "Treasure hunter", de: "Schatzjäger", ru: "Охотник за сокровищами" }), uk: "Мисливець за скарбами", ja: "宝さがし", es: "Cazatesoros", fr: "Chasseur de trésors" } },
  { id: "rocket-scientist", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Raketový vědec", en: "Rocket scientist", de: "Raketenforscher", ru: "Ракетный учёный" }), uk: "Ракетний вчений", ja: "ロケット科学者", es: "Científico de cohetes", fr: "Scientifique des fusées" } },
  { id: "planet-explorer", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Objevitel planet", en: "Planet explorer", de: "Planetenentdecker", ru: "Исследователь планет" }), uk: "Дослідник планет", ja: "惑星の探検家", es: "Explorador de planetas", fr: "Explorateur de planètes" } },
  { id: "mushroom-wizard", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Houbový čaroděj", en: "Mushroom wizard", de: "Pilzzauberer", ru: "Грибной волшебник" }), uk: "Грибний чарівник", ja: "きのこの魔法使い", es: "Mago de los hongos", fr: "Magicien des champignons" } },
  { id: "dragon-tamer", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Krotitel draků", en: "Dragon tamer", de: "Drachenzähmer", ru: "Укротитель драконов" }), uk: "Приборкувач драконів", ja: "ドラゴンつかい", es: "Domador de dragones", fr: "Dompteur de dragons" } },
  { id: "royal-architect", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Královský architekt", en: "Royal architect", de: "Königlicher Baumeister", ru: "Королевский зодчий" }), uk: "Королівський архітектор", ja: "王室の建築家", es: "Arquitecto real", fr: "Architecte royal" } },
  { id: "coral-keeper", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Strážce korálů", en: "Coral keeper", de: "Korallenhüter", ru: "Хранитель кораллов" }), uk: "Охоронець коралів", ja: "サンゴの守り人", es: "Guardián de corales", fr: "Gardien des coraux" } },
  { id: "quiz-champion", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Šampion kvízů", en: "Quiz champion", de: "Quiz-Champion", ru: "Чемпион викторин" }), uk: "Чемпіон вікторин", ja: "クイズチャンピオン", es: "Campeón de preguntas", fr: "Champion de quiz" } },
  { id: "word-magician", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Kouzelník slov", en: "Word magician", de: "Wortzauberer", ru: "Волшебник слов" }), uk: "Чарівник слів", ja: "言葉の魔法使い", es: "Mago de las palabras", fr: "Magicien des mots" } },
  { id: "number-ninja", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Nindža čísel", en: "Number ninja", de: "Zahlen-Ninja", ru: "Ниндзя чисел" }), uk: "Ніндзя чисел", ja: "数字の忍者", es: "Ninja de los números", fr: "Ninja des nombres" } },
  { id: "time-traveler", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Cestovatel časem", en: "Time traveler", de: "Zeitreisender", ru: "Путешественник во времени" }), uk: "Мандрівник у часі", ja: "時間旅行者", es: "Viajero del tiempo", fr: "Voyageur du temps" } },
  // Za úroveň.
  { id: "brainiac", unlock: { level: 18 }, names: { ...withFallbacks({ cs: "Mozek", en: "Brainiac", de: "Schlauberger", ru: "Умник" }), uk: "Розумник", ja: "頭脳派", es: "Cerebrito", fr: "Cerveau" } },
  { id: "champion", unlock: { level: 30 }, names: { ...withFallbacks({ cs: "Šampion", en: "Champion", de: "Champion", ru: "Чемпион" }), uk: "Чемпіон", ja: "チャンピオン", es: "Campeón", fr: "Champion" } },
  { id: "sage", unlock: { level: 50 }, names: { ...withFallbacks({ cs: "Mudrc", en: "Sage", de: "Weiser", ru: "Мудрец" }), uk: "Мудрець", ja: "賢者", es: "Sabio", fr: "Sage" } },
  { id: "grandmaster", unlock: { level: 80 }, names: { ...withFallbacks({ cs: "Velmistr", en: "Grandmaster", de: "Großmeister", ru: "Гроссмейстер" }), uk: "Гросмейстер", ja: "グランドマスター", es: "Gran maestro", fr: "Grand maître" } },
  // Za únikovky (odemknou se při prvním dokončení místnosti, "escape-master" po dokončení všech).
  { id: "librarian", unlock: { event: "escape-library" }, names: { ...withFallbacks({ cs: "Knihovník", en: "Librarian", de: "Bibliothekar", ru: "Библиотекарь" }), uk: "Бібліотекар", ja: "司書", es: "Bibliotecario", fr: "Bibliothécaire" } },
  { id: "astronomer", unlock: { event: "escape-observatory" }, names: { ...withFallbacks({ cs: "Astronom", en: "Astronomer", de: "Astronom", ru: "Астроном" }), uk: "Астроном", ja: "天文学者", es: "Astrónomo", fr: "Astronome" } },
  { id: "castellan", unlock: { event: "escape-castle" }, names: { ...withFallbacks({ cs: "Kastelán", en: "Castellan", de: "Burgvogt", ru: "Кастелян" }), uk: "Кастелян", ja: "城代", es: "Castellano", fr: "Castellan" } },
  { id: "escape-master", unlock: { event: "escape-all" }, names: { ...withFallbacks({ cs: "Mistr útěku", en: "Escape master", de: "Ausbruchsmeister", ru: "Мастер побега" }), uk: "Майстер втеч", ja: "脱出マスター", es: "Maestro de escapes", fr: "Maître de l'évasion" } },
  // Z obchodu.
  { id: "dreamer", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Snílek", en: "Dreamer", de: "Träumer", ru: "Мечтатель" }), uk: "Мрійник", ja: "夢みる人", es: "Soñador", fr: "Rêveur" } },
  { id: "adventurer", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Dobrodruh", en: "Adventurer", de: "Abenteurer", ru: "Авантюрист" }), uk: "Авантюрист", ja: "冒険家", es: "Aventurero", fr: "Aventurier" } },
  { id: "captain", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Kapitán", en: "Captain", de: "Kapitän", ru: "Капитан" }), uk: "Капітан", ja: "キャプテン", es: "Capitán", fr: "Capitaine" } },
  { id: "golden-hook", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Zlatá ruka", en: "Golden hook", de: "Goldhaken", ru: "Золотой крюк" }), uk: "Золотий гачок", ja: "黄金のフック", es: "Garfio de oro", fr: "Crochet d'or" } },
  { id: "sea-wolf", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Mořský vlk", en: "Sea wolf", de: "Seebär", ru: "Морской волк" }), uk: "Морський вовк", ja: "海のオオカミ", es: "Lobo de mar", fr: "Loup de mer" } },
  { id: "treasure-keeper", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Strážce pokladu", en: "Treasure keeper", de: "Schatzhüter", ru: "Хранитель сокровищ" }), uk: "Охоронець скарбу", ja: "宝の番人", es: "Guardián del tesoro", fr: "Gardien du trésor" } },
  { id: "navigator", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Navigátor", en: "Navigator", de: "Navigator", ru: "Штурман" }), uk: "Штурман", ja: "航海士", es: "Navegante", fr: "Navigateur" } },
  { id: "hero", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Hrdina", en: "Hero", de: "Held", ru: "Герой" }), uk: "Герой", ja: "ヒーロー", es: "Héroe", fr: "Héros" } },
  // Jen z craftování (profil → Craftování).
  { id: "comet-maker", unlock: { event: "craft" }, names: { ...withFallbacks({ cs: "Strůjce komet", en: "Comet maker", de: "Kometenschmied", ru: "Творец комет" }), uk: "Творець комет", ja: "彗星づくり", es: "Creador de cometas", fr: "Créateur de comètes" } },
  { id: "tide-master", unlock: { event: "craft" }, names: { ...withFallbacks({ cs: "Pán přílivu", en: "Master of tides", de: "Herr der Gezeiten", ru: "Повелитель приливов" }), uk: "Володар припливів", ja: "潮の主", es: "Señor de las mareas", fr: "Maître des marées" } },
  { id: "forest-voice", unlock: { event: "craft" }, names: { ...withFallbacks({ cs: "Hlas lesa", en: "Voice of the forest", de: "Stimme des Waldes", ru: "Голос леса" }), uk: "Голос лісу", ja: "森の声", es: "Voz del bosque", fr: "Voix de la forêt" } },
  { id: "master-smith", unlock: { event: "craft" }, names: { ...withFallbacks({ cs: "Mistr kovář", en: "Master smith", de: "Schmiedemeister", ru: "Мастер-кузнец" }), uk: "Майстер-коваль", ja: "名匠の鍛冶師", es: "Maestro herrero", fr: "Maître forgeron" } },
  { id: "alchemist", unlock: { event: "craft" }, names: { ...withFallbacks({ cs: "Alchymista", en: "Alchemist", de: "Alchemist", ru: "Алхимик" }), uk: "Алхімік", ja: "錬金術師", es: "Alquimista", fr: "Alchimiste" } },
  { id: "cartographer", unlock: { event: "craft" }, names: { ...withFallbacks({ cs: "Hvězdný kartograf", en: "Star cartographer", de: "Sternenkartograf", ru: "Звёздный картограф" }), uk: "Зоряний картограф", ja: "星の地図製作者", es: "Cartógrafo estelar", fr: "Cartographe des étoiles" } },
  { id: "reef-singer", unlock: { event: "craft" }, names: { ...withFallbacks({ cs: "Zpěvák útesu", en: "Reef singer", de: "Riffsänger", ru: "Певец рифа" }), uk: "Співак рифу", ja: "岩礁の歌い手", es: "Cantor del arrecife", fr: "Chanteur du récif" } },
  { id: "druid", unlock: { event: "craft" }, names: { ...withFallbacks({ cs: "Druid", en: "Druid", de: "Druide", ru: "Друид" }), uk: "Друїд", ja: "ドルイド", es: "Druida", fr: "Druide" } },
  { id: "steward", unlock: { event: "craft" }, names: { ...withFallbacks({ cs: "Správce hradu", en: "Castle steward", de: "Burgverwalter", ru: "Управитель замка" }), uk: "Управитель замку", ja: "城の管理人", es: "Administrador del castillo", fr: "Intendant du château" } },
  { id: "dragon-whisperer", unlock: { event: "craft" }, names: { ...withFallbacks({ cs: "Šeptač draků", en: "Dragon whisperer", de: "Drachenflüsterer", ru: "Шепчущий с драконами" }), uk: "Шепіт драконів", ja: "ドラゴンのささやき手", es: "Susurrador de dragones", fr: "Murmurant des dragons" } },
];

export function getTitle(id: string | null | undefined) {
  return TITLES.find((t) => t.id === id) ?? null;
}

export function isTitleUnlocked(title: TitleDef, level: number, unlocks: string[]): boolean {
  if ("level" in title.unlock) return level >= title.unlock.level;
  return unlocks.includes(`title:${title.id}`);
}
