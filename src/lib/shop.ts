import { tr8 } from "@/i18n/config";
// Katalog uživatelského obchodu. Nabídku sestavujeme my, vývojáři: nové zboží stačí
// dopsat sem. Kupuje se za body z učení a koupená věc se uloží jako odemčení
// (tabulka Unlock) s klíčem "<druh>:<ref>", stejně jako avatary a tituly z úspěchů.
//
// `asset3d` je název modelu, který má dodat 3D tým (viz SHOP_ASSETS.md). Dokud model
// není, hra kreslí náhradní vzhled kódem.

import type { Locale } from "@/i18n/config";

export type ShopKind = "avatar" | "title" | "frame" | "banner" | "pet" | "city";

export const SHOP_KINDS: ShopKind[] = ["avatar", "title", "frame", "banner", "pet", "city"];

export type ShopItem = {
  id: string;
  kind: ShopKind;
  // Id věci v příslušné hře nebo profilu (avatar, titul, rámeček, doplněk, budova).
  ref: string;
  price: number;
  names: Record<Locale, string>;
  tag?: "new" | "popular";
  asset3d?: string;
};

const n = (cs: string, en: string, de: string, ru: string, uk?: string, ja?: string, es?: string, fr?: string): Record<Locale, string> =>
  tr8(cs, en, de, ru, uk, ja, es, fr);

export const SHOP_ITEMS: ShopItem[] = [
  // --- avatary ---
  { id: "avatar-astronaut", kind: "avatar", ref: "astronaut", price: 120, tag: "new", asset3d: "avatar-astronaut", names: n("Astronaut", "Astronaut", "Astronaut", "Астронавт", "Астронавт", "宇宙飛行士", "Astronauta", "Astronaute") },
  { id: "avatar-pirate", kind: "avatar", ref: "pirate", price: 150, asset3d: "avatar-pirate", names: n("Pirát", "Pirate", "Pirat", "Пират", "Пірат", "海賊", "Pirata", "Pirate") },
  { id: "avatar-captain", kind: "avatar", ref: "captain", price: 220, tag: "new", names: n("Kapitán", "Captain", "Kapitän", "Капитан", "Капітан", "キャプテン", "Capitán", "Capitaine") },
  { id: "avatar-sea-wolf", kind: "avatar", ref: "sea-wolf", price: 180, tag: "new", names: n("Mořský vlk", "Sea wolf", "Seebär", "Морской волк", "Морський вовк", "海のオオカミ", "Lobo de mar", "Loup de mer") },
  { id: "avatar-mermaid", kind: "avatar", ref: "mermaid", price: 200, tag: "new", names: n("Mořská panna", "Mermaid", "Meerjungfrau", "Русалка", "Русалка", "人魚", "Sirena", "Sirène") },
  { id: "avatar-fairy", kind: "avatar", ref: "fairy", price: 200, tag: "new", names: n("Víla", "Fairy", "Fee", "Фея", "Фея", "妖精", "Hada", "Fée") },
  { id: "avatar-ranger", kind: "avatar", ref: "ranger", price: 170, tag: "new", names: n("Hajný", "Ranger", "Förster", "Лесник", "Лісник", "森の番人", "Guardabosques", "Garde forestier") },
  { id: "avatar-knight", kind: "avatar", ref: "knight", price: 230, tag: "new", names: n("Rytíř", "Knight", "Ritter", "Рыцарь", "Лицар", "騎士", "Caballero", "Chevalier") },
  { id: "avatar-princess", kind: "avatar", ref: "princess", price: 240, tag: "new", names: n("Princezna", "Princess", "Prinzessin", "Принцесса", "Принцеса", "お姫さま", "Princesa", "Princesse") },
  { id: "avatar-diver", kind: "avatar", ref: "diver", price: 190, tag: "new", names: n("Potápěč", "Diver", "Taucher", "Водолаз", "Водолаз", "ダイバー", "Buzo", "Plongeur") },
  { id: "avatar-octopus", kind: "avatar", ref: "octopus", price: 220, tag: "new", names: n("Chobotnice", "Octopus", "Krake", "Осьминог", "Восьминіг", "タコ", "Pulpo", "Pieuvre") },
  { id: "avatar-wizard", kind: "avatar", ref: "wizard", price: 200, tag: "popular", asset3d: "avatar-wizard", names: n("Čaroděj", "Wizard", "Zauberer", "Волшебник", "Чарівник", "魔法使い", "Mago", "Magicien") },
  { id: "avatar-pumpkin", kind: "avatar", ref: "pumpkin", price: 90, asset3d: "avatar-pumpkin", names: n("Dýně", "Pumpkin", "Kürbis", "Тыква", "Гарбуз", "かぼちゃ", "Calabaza", "Citrouille") },
  { id: "avatar-winter", kind: "avatar", ref: "winter", price: 110, names: n("Zimní", "Winter", "Winter", "Зимний", "Зимовий", "冬", "Invierno", "Hiver") },
  { id: "avatar-piratka", kind: "avatar", ref: "piratka", price: 190, tag: "new", names: n("Pirátka", "Pirate girl", "Piratin", "Пиратка", "Піратка", "女海賊", "Pirata (chica)", "Pirate (fille)") },
  { id: "avatar-kosmonautka", kind: "avatar", ref: "kosmonautka", price: 200, tag: "new", names: n("Kosmonautka", "Cosmonaut", "Kosmonautin", "Космонавтка", "Космонавтка", "女性宇宙飛行士", "Cosmonauta", "Cosmonaute") },
  { id: "avatar-robopes", kind: "avatar", ref: "robopes", price: 220, tag: "new", names: n("Robopes", "Robo-dog", "Roboterhund", "Робопёс", "Робопес", "ロボットいぬ", "Robo-perro", "Robo-chien") },
  { id: "avatar-skritek", kind: "avatar", ref: "skritek", price: 170, tag: "new", names: n("Skřítek", "Gnome", "Wichtel", "Гномик", "Гномик", "こびと", "Duende", "Lutin") },
  { id: "avatar-veverka", kind: "avatar", ref: "veverka", price: 180, tag: "new", names: n("Veverka", "Squirrel", "Eichhörnchen", "Белка", "Білка", "リス", "Ardilla", "Écureuil") },
  { id: "avatar-princ", kind: "avatar", ref: "princ", price: 230, tag: "new", names: n("Princ", "Prince", "Prinz", "Принц", "Принц", "王子さま", "Príncipe", "Prince") },
  { id: "avatar-carodejnice", kind: "avatar", ref: "carodejnice", price: 220, tag: "new", names: n("Čarodějnice", "Witch", "Hexe", "Ведьма", "Відьма", "魔女", "Bruja", "Sorcière") },
  { id: "avatar-zralok", kind: "avatar", ref: "zralok", price: 200, tag: "new", names: n("Žralok", "Shark", "Hai", "Акула", "Акула", "サメ", "Tiburón", "Requin") },

  // --- tituly ---
  { id: "title-scholar", kind: "title", ref: "scholar", price: 80, names: n("Učenec", "Scholar", "Gelehrter", "Учёный", "Учений", "学者", "Erudito", "Savant") },
  { id: "title-bookworm", kind: "title", ref: "bookworm", price: 80, names: n("Knihomol", "Bookworm", "Bücherwurm", "Книголюб", "Книжковий черв'як", "本の虫", "Ratón de biblioteca", "Rat de bibliothèque") },
  { id: "title-mathematician", kind: "title", ref: "mathematician", price: 100, names: n("Matematik", "Mathematician", "Mathematiker", "Математик", "Математик", "数学者", "Matemático", "Mathématicien") },
  { id: "title-star-sailor", kind: "title", ref: "star-sailor", price: 120, tag: "new", names: n("Hvězdný mořeplavec", "Star sailor", "Sternensegler", "Звёздный мореход", "Зоряний мореплавець", "星の航海士", "Navegante estelar", "Navigateur des étoiles") },
  { id: "title-treasure-hunter", kind: "title", ref: "treasure-hunter", price: 110, tag: "new", names: n("Lovec pokladů", "Treasure hunter", "Schatzjäger", "Охотник за сокровищами", "Мисливець за скарбами", "宝さがし", "Cazatesoros", "Chasseur de trésors") },
  { id: "title-rocket-scientist", kind: "title", ref: "rocket-scientist", price: 140, tag: "new", names: n("Raketový vědec", "Rocket scientist", "Raketenforscher", "Ракетный учёный", "Ракетний вчений", "ロケット科学者", "Científico de cohetes", "Scientifique des fusées") },
  { id: "title-planet-explorer", kind: "title", ref: "planet-explorer", price: 130, tag: "new", names: n("Objevitel planet", "Planet explorer", "Planetenentdecker", "Исследователь планет", "Дослідник планет", "惑星の探検家", "Explorador de planetas", "Explorateur de planètes") },
  { id: "title-mushroom-wizard", kind: "title", ref: "mushroom-wizard", price: 120, tag: "new", names: n("Houbový čaroděj", "Mushroom wizard", "Pilzzauberer", "Грибной волшебник", "Грибний чарівник", "きのこの魔法使い", "Mago de los hongos", "Magicien des champignons") },
  { id: "title-dragon-tamer", kind: "title", ref: "dragon-tamer", price: 180, tag: "new", names: n("Krotitel draků", "Dragon tamer", "Drachenzähmer", "Укротитель драконов", "Приборкувач драконів", "ドラゴンつかい", "Domador de dragones", "Dompteur de dragons") },
  { id: "title-royal-architect", kind: "title", ref: "royal-architect", price: 160, tag: "new", names: n("Královský architekt", "Royal architect", "Königlicher Baumeister", "Королевский зодчий", "Королівський архітектор", "王室の建築家", "Arquitecto real", "Architecte royal") },
  { id: "title-coral-keeper", kind: "title", ref: "coral-keeper", price: 120, tag: "new", names: n("Strážce korálů", "Coral keeper", "Korallenhüter", "Хранитель кораллов", "Охоронець коралів", "サンゴの守り人", "Guardián de corales", "Gardien des coraux") },
  { id: "title-quiz-champion", kind: "title", ref: "quiz-champion", price: 150, tag: "new", names: n("Šampion kvízů", "Quiz champion", "Quiz-Champion", "Чемпион викторин", "Чемпіон вікторин", "クイズチャンピオン", "Campeón de preguntas", "Champion de quiz") },
  { id: "title-word-magician", kind: "title", ref: "word-magician", price: 130, tag: "new", names: n("Kouzelník slov", "Word magician", "Wortzauberer", "Волшебник слов", "Чарівник слів", "言葉の魔法使い", "Mago de las palabras", "Magicien des mots") },
  { id: "title-number-ninja", kind: "title", ref: "number-ninja", price: 130, tag: "new", names: n("Nindža čísel", "Number ninja", "Zahlen-Ninja", "Ниндзя чисел", "Ніндзя чисел", "数字の忍者", "Ninja de los números", "Ninja des nombres") },
  { id: "title-time-traveler", kind: "title", ref: "time-traveler", price: 170, tag: "new", names: n("Cestovatel časem", "Time traveler", "Zeitreisender", "Путешественник во времени", "Мандрівник у часі", "時間旅行者", "Viajero del tiempo", "Voyageur du temps") },
  { id: "title-builder", kind: "title", ref: "builder", price: 120, names: n("Stavitel", "Builder", "Baumeister", "Строитель", "Будівничий", "建設者", "Constructor", "Bâtisseur") },
  { id: "title-forest-guardian", kind: "title", ref: "forest-guardian", price: 120, tag: "new", names: n("Strážce lesa", "Forest guardian", "Waldwächter", "Страж леса", "Охоронець лісу", "森の守護者", "Guardián del bosque", "Gardien de la forêt") },
  { id: "title-fairy-friend", kind: "title", ref: "fairy-friend", price: 100, tag: "new", names: n("Přítel víl", "Fairy friend", "Feenfreund", "Друг фей", "Друг фей", "妖精の友だち", "Amigo de las hadas", "Ami des fées") },
  { id: "title-firefly", kind: "title", ref: "firefly", price: 90, tag: "new", names: n("Světluška", "Firefly", "Glühwürmchen", "Светлячок", "Світлячок", "ホタル", "Luciérnaga", "Luciole") },
  { id: "title-knight", kind: "title", ref: "knight", price: 130, tag: "new", names: n("Rytíř", "Knight", "Ritter", "Рыцарь", "Лицар", "騎士", "Caballero", "Chevalier") },
  { id: "title-court-scholar", kind: "title", ref: "court-scholar", price: 140, tag: "new", names: n("Dvorní učenec", "Court scholar", "Hofgelehrter", "Придворный учёный", "Придворний учений", "宮廷の学者", "Erudito de la corte", "Savant de cour") },
  { id: "title-castle-lord", kind: "title", ref: "castle-lord", price: 200, tag: "new", names: n("Pán hradu", "Lord of the castle", "Burgherr", "Владыка замка", "Володар замку", "城の主", "Señor del castillo", "Seigneur du château") },
  { id: "title-sea-sage", kind: "title", ref: "sea-sage", price: 130, tag: "new", names: n("Mořský mudrc", "Sea sage", "Meeresweiser", "Морской мудрец", "Морський мудрець", "海の賢者", "Sabio del mar", "Sage des mers") },
  { id: "title-pearl-hunter", kind: "title", ref: "pearl-hunter", price: 110, tag: "new", names: n("Lovec perel", "Pearl hunter", "Perlenjäger", "Ловец жемчуга", "Мисливець за перлами", "真珠ハンター", "Cazaperlas", "Chasseur de perles") },
  { id: "title-deep-diver", kind: "title", ref: "deep-diver", price: 160, tag: "new", names: n("Hlubinný potápěč", "Deep diver", "Tiefseetaucher", "Глубоководный водолаз", "Глибоководний водолаз", "深海ダイバー", "Buzo de profundidad", "Plongeur des abysses") },
  { id: "title-pet-friend", kind: "title", ref: "pet-friend", price: 100, names: n("Přítel zvířat", "Animal friend", "Tierfreund", "Друг животных", "Друг тварин", "動物の友だち", "Amigo de los animales", "Ami des animaux") },
  { id: "title-legend", kind: "title", ref: "legend", price: 400, tag: "popular", names: n("Legenda", "Legend", "Legende", "Легенда", "Легенда", "伝説", "Leyenda", "Légende") },
  { id: "title-dreamer", kind: "title", ref: "dreamer", price: 90, tag: "new", names: n("Snílek", "Dreamer", "Träumer", "Мечтатель", "Мрійник", "夢みる人", "Soñador", "Rêveur") },
  { id: "title-adventurer", kind: "title", ref: "adventurer", price: 140, tag: "new", names: n("Dobrodruh", "Adventurer", "Abenteurer", "Авантюрист", "Авантюрист", "冒険家", "Aventurero", "Aventurier") },
  { id: "title-navigator", kind: "title", ref: "navigator", price: 140, tag: "new", names: n("Navigátor", "Navigator", "Navigator", "Штурман", "Штурман", "航海士", "Navegante", "Navigateur") },
  { id: "title-captain", kind: "title", ref: "captain", price: 160, tag: "new", names: n("Kapitán", "Captain", "Kapitän", "Капитан", "Капітан", "キャプテン", "Capitán", "Capitaine") },
  { id: "title-golden-hook", kind: "title", ref: "golden-hook", price: 180, tag: "new", names: n("Zlatá ruka", "Golden hook", "Goldhaken", "Золотой крюк", "Золотий гачок", "黄金のフック", "Garfio de oro", "Crochet d'or") },
  { id: "title-sea-wolf", kind: "title", ref: "sea-wolf", price: 200, tag: "new", names: n("Mořský vlk", "Sea wolf", "Seebär", "Морской волк", "Морський вовк", "海のオオカミ", "Lobo de mar", "Loup de mer") },
  { id: "title-treasure-keeper", kind: "title", ref: "treasure-keeper", price: 220, tag: "new", names: n("Strážce pokladu", "Treasure keeper", "Schatzhüter", "Хранитель сокровищ", "Охоронець скарбу", "宝の番人", "Guardián del tesoro", "Gardien du trésor") },
  { id: "title-hero", kind: "title", ref: "hero", price: 300, tag: "new", names: n("Hrdina", "Hero", "Held", "Герой", "Герой", "ヒーロー", "Héroe", "Héros") },

  // --- rámečky avataru ---
  { id: "frame-leaf", kind: "frame", ref: "leaf", price: 100, names: n("Listový rámeček", "Leaf frame", "Blätterrahmen", "Рамка из листьев", "Рамка з листя", "葉っぱのフレーム", "Marco de hojas", "Cadre en feuilles") },
  { id: "frame-gold", kind: "frame", ref: "gold", price: 150, names: n("Zlatý rámeček", "Gold frame", "Goldrahmen", "Золотая рамка", "Золота рамка", "金のフレーム", "Marco dorado", "Cadre doré") },
  { id: "frame-neon", kind: "frame", ref: "neon", price: 200, tag: "new", names: n("Neonový rámeček", "Neon frame", "Neonrahmen", "Неоновая рамка", "Неонова рамка", "ネオンのフレーム", "Marco de neón", "Cadre néon") },
  { id: "frame-rainbow", kind: "frame", ref: "rainbow", price: 250, names: n("Duhový rámeček", "Rainbow frame", "Regenbogenrahmen", "Радужная рамка", "Веселкова рамка", "虹のフレーム", "Marco arcoíris", "Cadre arc-en-ciel") },
  { id: "frame-stars", kind: "frame", ref: "stars", price: 300, names: n("Hvězdný rámeček", "Star frame", "Sternenrahmen", "Звёздная рамка", "Зоряна рамка", "星のフレーム", "Marco de estrellas", "Cadre étoilé") },
  { id: "frame-vine", kind: "frame", ref: "vine", price: 220, tag: "new", names: n("Liánový věnec", "Vine wreath", "Ranken-Kranz", "Венок из лиан", "Вінок з ліан", "つるのリース", "Corona de lianas", "Couronne de lianes") },
  { id: "frame-royal", kind: "frame", ref: "royal", price: 320, tag: "new", names: n("Královský rámeček", "Royal frame", "Königsrahmen", "Королевская рамка", "Королівська рамка", "王室のフレーム", "Marco real", "Cadre royal") },
  { id: "frame-coral", kind: "frame", ref: "coral", price: 260, tag: "new", names: n("Korálový věnec", "Coral wreath", "Korallenkranz", "Коралловый венок", "Кораловий вінок", "サンゴのリース", "Corona de coral", "Couronne de corail") },
  { id: "frame-fire", kind: "frame", ref: "fire", price: 350, tag: "popular", names: n("Ohnivý rámeček", "Fire frame", "Feuerrahmen", "Огненная рамка", "Вогняна рамка", "炎のフレーム", "Marco de fuego", "Cadre de feu") },
  { id: "frame-pirate", kind: "frame", ref: "pirate", price: 240, tag: "new", names: n("Pirátské lano", "Pirate rope", "Piratentau", "Пиратский канат", "Піратський канат", "海賊のロープ", "Cuerda pirata", "Corde de pirate") },
  { id: "frame-space", kind: "frame", ref: "space", price: 300, tag: "new", names: n("Planetární prstenec", "Planet ring", "Planetenring", "Планетное кольцо", "Планетарне кільце", "惑星の輪", "Anillo planetario", "Anneau planétaire") },
  { id: "frame-ice", kind: "frame", ref: "ice", price: 260, tag: "new", names: n("Ledové krystaly", "Ice crystals", "Eiskristalle", "Ледяные кристаллы", "Крижані кристали", "氷の結晶", "Cristales de hielo", "Cristaux de glace") },
  { id: "frame-candy", kind: "frame", ref: "candy", price: 200, tag: "new", names: n("Cukrová hůl", "Candy cane", "Zuckerstange", "Леденцовая трость", "Цукрова тростина", "キャンディケイン", "Bastón de caramelo", "Canne en sucre") },
  { id: "frame-dragon", kind: "frame", ref: "dragon", price: 380, tag: "new", names: n("Dračí šupiny", "Dragon scales", "Drachenschuppen", "Драконья чешуя", "Драконяча луска", "ドラゴンのうろこ", "Escamas de dragón", "Écailles de dragon") },

  // --- pozadí profilu ---
  { id: "banner-sunset", kind: "banner", ref: "sunset", price: 80, names: n("Západ slunce", "Sunset", "Sonnenuntergang", "Закат", "Захід сонця", "夕焼け", "Atardecer", "Coucher de soleil") },
  { id: "banner-ocean", kind: "banner", ref: "ocean", price: 80, names: n("Oceán", "Ocean", "Ozean", "Океан", "Океан", "海", "Océano", "Océan") },
  { id: "banner-forest", kind: "banner", ref: "forest", price: 100, names: n("Les", "Forest", "Wald", "Лес", "Ліс", "森", "Bosque", "Forêt") },
  { id: "banner-candy", kind: "banner", ref: "candy", price: 120, names: n("Bonbóny", "Candy", "Bonbons", "Конфеты", "Цукерки", "キャンディ", "Caramelos", "Bonbons") },
  { id: "banner-snow", kind: "banner", ref: "snow", price: 120, names: n("Sníh", "Snow", "Schnee", "Снег", "Сніг", "雪", "Nieve", "Neige") },
  { id: "banner-night-city", kind: "banner", ref: "night-city", price: 160, names: n("Noční město", "Night city", "Nachtstadt", "Ночной город", "Нічне місто", "夜の街", "Ciudad nocturna", "Ville de nuit") },
  { id: "banner-treasure-map", kind: "banner", ref: "treasure-map", price: 130, tag: "new", names: n("Mapa pokladu", "Treasure map", "Schatzkarte", "Карта сокровищ", "Мапа скарбів", "宝の地図", "Mapa del tesoro", "Carte au trésor") },
  { id: "banner-pirate-night", kind: "banner", ref: "pirate-night", price: 160, tag: "new", names: n("Pirátská noc", "Pirate night", "Piratennacht", "Пиратская ночь", "Піратська ніч", "海賊の夜", "Noche pirata", "Nuit de pirates") },
  { id: "banner-storm", kind: "banner", ref: "storm", price: 180, tag: "new", names: n("Bouře", "Storm", "Sturm", "Буря", "Буря", "嵐", "Tormenta", "Tempête") },
  { id: "banner-forest-glade", kind: "banner", ref: "forest-glade", price: 140, tag: "new", names: n("Lesní mýtina", "Forest glade", "Waldlichtung", "Лесная поляна", "Лісова галявина", "森の空き地", "Claro del bosque", "Clairière") },
  { id: "banner-castle-day", kind: "banner", ref: "castle-day", price: 140, tag: "new", names: n("Hradní nádvoří", "Castle courtyard", "Burghof", "Замковый двор", "Замкове подвір'я", "城の中庭", "Patio del castillo", "Cour du château") },
  { id: "banner-castle-night", kind: "banner", ref: "castle-night", price: 170, tag: "new", names: n("Hradby za noci", "Castle by night", "Burg bei Nacht", "Замок ночью", "Замок уночі", "夜の城", "Castillo de noche", "Château de nuit") },
  { id: "banner-deep-sea", kind: "banner", ref: "deep-sea", price: 150, tag: "new", names: n("Hlubiny", "The deep", "Tiefsee", "Глубины", "Глибини", "深海", "Las profundidades", "Les abysses") },
  { id: "banner-jellyfish", kind: "banner", ref: "jellyfish", price: 190, tag: "new", names: n("Medúzí záře", "Jellyfish glow", "Quallenleuchten", "Сияние медуз", "Сяйво медуз", "クラゲの光", "Resplandor de medusas", "Lueur des méduses") },
  { id: "banner-town-space", kind: "banner", ref: "town-space", price: 210, tag: "new", names: n("Vesmírná stanice", "Space station", "Raumstation", "Космическая станция", "Космічна станція", "宇宙ステーション", "Estación espacial", "Station spatiale") },
  { id: "banner-town-pirate", kind: "banner", ref: "town-pirate", price: 180, tag: "new", names: n("Pirátský přístav", "Pirate harbour", "Piratenhafen", "Пиратская гавань", "Піратська гавань", "海賊の港", "Puerto pirata", "Port pirate") },
  { id: "banner-town-forest", kind: "banner", ref: "town-forest", price: 190, tag: "new", names: n("Kouzelný les", "Magic forest", "Zauberwald", "Волшебный лес", "Чарівний ліс", "魔法の森", "Bosque mágico", "Forêt magique") },
  { id: "banner-town-castle", kind: "banner", ref: "town-castle", price: 180, tag: "new", names: n("Království", "Kingdom", "Königreich", "Королевство", "Королівство", "王国", "Reino", "Royaume") },
  { id: "banner-town-sea", kind: "banner", ref: "town-sea", price: 200, tag: "new", names: n("Podmořské město", "Underwater city", "Unterwasserstadt", "Подводный город", "Підводне місто", "海底の街", "Ciudad submarina", "Ville sous-marine") },
  { id: "banner-spring", kind: "banner", ref: "spring", price: 120, tag: "new", names: n("Jaro", "Spring", "Frühling", "Весна", "Весна", "春", "Primavera", "Printemps") },
  { id: "banner-summer", kind: "banner", ref: "summer", price: 120, tag: "new", names: n("Léto u moře", "Summer beach", "Sommerstrand", "Летний пляж", "Літній пляж", "夏のビーチ", "Playa de verano", "Plage d'été") },
  { id: "banner-autumn", kind: "banner", ref: "autumn", price: 120, tag: "new", names: n("Podzim", "Autumn", "Herbst", "Осень", "Осінь", "秋", "Otoño", "Automne") },
  { id: "banner-christmas", kind: "banner", ref: "christmas", price: 170, tag: "new", names: n("Vánoční vesnička", "Christmas village", "Weihnachtsdorf", "Рождественская деревня", "Різдвяне селище", "クリスマスの村", "Pueblo navideño", "Village de Noël") },
  { id: "banner-halloween", kind: "banner", ref: "halloween", price: 170, tag: "new", names: n("Halloween", "Halloween", "Halloween", "Хэллоуин", "Геловін", "ハロウィン", "Halloween", "Halloween") },
  { id: "banner-volcano", kind: "banner", ref: "volcano", price: 190, tag: "new", names: n("Sopka", "Volcano", "Vulkan", "Вулкан", "Вулкан", "火山", "Volcán", "Volcan") },
  { id: "banner-desert", kind: "banner", ref: "desert", price: 140, tag: "new", names: n("Pyramidy", "Pyramids", "Pyramiden", "Пирамиды", "Піраміди", "ピラミッド", "Pirámides", "Pyramides") },
  { id: "banner-aurora", kind: "banner", ref: "aurora", price: 220, tag: "new", names: n("Polární záře", "Northern lights", "Polarlicht", "Северное сияние", "Північне сяйво", "オーロラ", "Aurora boreal", "Aurores boréales") },
  { id: "banner-dino", kind: "banner", ref: "dino", price: 180, tag: "new", names: n("Pravěk", "Dino land", "Urzeit", "Мир динозавров", "Доісторичний світ", "恐竜の世界", "Tierra de dinosaurios", "Pays des dinosaures") },
  { id: "banner-rainbow", kind: "banner", ref: "rainbow", price: 150, tag: "new", names: n("Duha", "Rainbow", "Regenbogen", "Радуга", "Веселка", "虹", "Arcoíris", "Arc-en-ciel") },
  { id: "banner-galaxy", kind: "banner", ref: "galaxy", price: 200, tag: "popular", names: n("Galaxie", "Galaxy", "Galaxie", "Галактика", "Галактика", "銀河", "Galaxia", "Galaxie") },

  // --- doplňky pro mazlíčky ---
  { id: "pet-bow", kind: "pet", ref: "bow", price: 80, asset3d: "pet-bow", names: n("Mašle", "Bow", "Schleife", "Бантик", "Бантик", "リボン", "Lacito", "Nœud") },
  { id: "pet-flower", kind: "pet", ref: "flower", price: 90, asset3d: "pet-flower", names: n("Kytička", "Flower", "Blümchen", "Цветочек", "Квіточка", "お花", "Florecita", "Petite fleur") },
  { id: "pet-party", kind: "pet", ref: "party", price: 100, asset3d: "pet-party", names: n("Oslavná čepice", "Party hat", "Partyhut", "Праздничная шапка", "Святкова шапка", "パーティーハット", "Gorro de fiesta", "Chapeau de fête") },
  { id: "pet-glasses", kind: "pet", ref: "glasses", price: 120, asset3d: "pet-glasses", names: n("Sluneční brýle", "Sunglasses", "Sonnenbrille", "Солнечные очки", "Сонцезахисні окуляри", "サングラス", "Gafas de sol", "Lunettes de soleil") },
  { id: "pet-scarf", kind: "pet", ref: "scarf", price: 130, asset3d: "pet-scarf", names: n("Šála", "Scarf", "Schal", "Шарф", "Шарф", "マフラー", "Bufanda", "Écharpe") },
  { id: "pet-halo", kind: "pet", ref: "halo", price: 180, tag: "new", names: n("Svatozář", "Halo", "Heiligenschein", "Нимб", "Німб", "天使の輪", "Aureola", "Auréole") },
  { id: "pet-headphones", kind: "pet", ref: "headphones", price: 200, tag: "new", names: n("Sluchátka", "Headphones", "Kopfhörer", "Наушники", "Навушники", "ヘッドホン", "Auriculares", "Casque audio") },
  { id: "pet-crown", kind: "pet", ref: "crown", price: 250, tag: "popular", asset3d: "pet-crown", names: n("Koruna", "Crown", "Krone", "Корона", "Корона", "王冠", "Corona", "Couronne") },

  // --- speciální budovy do města ---
  { id: "city-christmas-tree", kind: "city", ref: "christmas_tree", price: 150, tag: "new", asset3d: "city-christmas-tree", names: n("Vánoční strom", "Christmas tree", "Weihnachtsbaum", "Новогодняя ёлка", "Новорічна ялинка", "クリスマスツリー", "Árbol de Navidad", "Sapin de Noël") },
  { id: "city-windmill", kind: "city", ref: "windmill", price: 250, asset3d: "city-windmill", names: n("Větrný mlýn", "Windmill", "Windmühle", "Ветряная мельница", "Вітряк", "風車", "Molino de viento", "Moulin à vent") },
  { id: "city-ferris-wheel", kind: "city", ref: "ferris_wheel", price: 400, tag: "popular", asset3d: "city-ferris-wheel", names: n("Obří kolo", "Ferris wheel", "Riesenrad", "Колесо обозрения", "Колесо огляду", "観覧車", "Noria", "Grande roue") },
  { id: "city-carousel", kind: "city", ref: "carousel", price: 300, tag: "new", names: n("Kolotoč", "Carousel", "Karussell", "Карусель", "Карусель", "メリーゴーラウンド", "Carrusel", "Manège") },
  { id: "city-lighthouse", kind: "city", ref: "lighthouse", price: 350, tag: "new", names: n("Maják", "Lighthouse", "Leuchtturm", "Маяк", "Маяк", "灯台", "Faro", "Phare") },
  { id: "city-rocket-pad", kind: "city", ref: "rocket_pad", price: 600, tag: "new", names: n("Kosmodrom", "Rocket pad", "Raketenstartplatz", "Космодром", "Космодром", "ロケット発射台", "Plataforma de cohetes", "Pas de tir") },
];

export function getShopItem(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find((i) => i.id === id);
}

// Klíč odemčení uložený v tabulce Unlock.
export function unlockKey(item: ShopItem): string {
  return `${item.kind}:${item.ref}`;
}

// --- Denní nabídka, balíčky a dárky ---

export const DEAL_COUNT = 3;
export const DEAL_DISCOUNT = 0.3;
export const BUNDLE_DISCOUNT = 0.25;

// Den ve tvaru RRRR-MM-DD podle UTC: server i prohlížeč z něj dostanou stejnou denní nabídku.
export function dayKey(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

// Kdy se nabídka mění (půlnoc UTC).
export function nextDealReset(now: Date = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
}

function seededRandom(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

// Id zboží, které je v daný den ve slevě.
export function dailyDealIds(day: string): string[] {
  const rand = seededRandom(`deals:${day}`);
  const pool = [...SHOP_ITEMS];
  const picked: string[] = [];
  while (picked.length < DEAL_COUNT && pool.length > 0) {
    picked.push(pool.splice(Math.floor(rand() * pool.length), 1)[0].id);
  }
  return picked;
}

// Cena, kterou za zboží v daný den zaplatíš.
export function salePrice(item: ShopItem, day: string): number {
  return dailyDealIds(day).includes(item.id) ? Math.max(1, Math.round(item.price * (1 - DEAL_DISCOUNT))) : item.price;
}

export type ShopBundle = {
  id: string;
  itemIds: string[];
  color: string;
  names: Record<Locale, string>;
};

export const SHOP_BUNDLES: ShopBundle[] = [
  { id: "pirate", itemIds: ["avatar-pirate", "frame-gold", "pet-glasses", "banner-ocean"], color: "#7fd0e8", names: n("Pirátská sada", "Pirate set", "Piraten-Set", "Пиратский набор", "Піратський набір", "海賊セット", "Conjunto pirata", "Ensemble pirate") },
  { id: "space", itemIds: ["avatar-astronaut", "frame-stars", "banner-galaxy", "city-rocket-pad"], color: "#8c7cff", names: n("Vesmírná sada", "Space set", "Weltraum-Set", "Космический набор", "Космічний набір", "宇宙セット", "Conjunto espacial", "Ensemble spatial") },
  { id: "winter", itemIds: ["avatar-winter", "banner-snow", "pet-scarf", "city-christmas-tree"], color: "#bfe6ff", names: n("Zimní sada", "Winter set", "Winter-Set", "Зимний набор", "Зимовий набір", "冬セット", "Conjunto de invierno", "Ensemble d'hiver") },
  { id: "forest", itemIds: ["avatar-fairy", "frame-vine", "banner-forest-glade", "title-forest-guardian"], color: "#7ee0a0", names: n("Lesní sada", "Forest set", "Wald-Set", "Лесной набор", "Лісовий набір", "森セット", "Conjunto del bosque", "Ensemble forestier") },
  { id: "castle", itemIds: ["avatar-knight", "frame-royal", "banner-castle-day", "title-knight"], color: "#d6a84a", names: n("Hradní sada", "Castle set", "Burg-Set", "Замковый набор", "Замковий набір", "城セット", "Conjunto del castillo", "Ensemble château") },
  { id: "sea", itemIds: ["avatar-diver", "frame-coral", "banner-deep-sea", "title-sea-sage"], color: "#5fd0ee", names: n("Podmořská sada", "Underwater set", "Unterwasser-Set", "Подводный набор", "Підводний набір", "海底セット", "Conjunto submarino", "Ensemble sous-marin") },
  { id: "magic", itemIds: ["avatar-wizard", "frame-neon", "pet-party", "title-scholar"], color: "#c9a8ff", names: n("Kouzelná sada", "Magic set", "Zauber-Set", "Волшебный набор", "Чарівний набір", "魔法セット", "Conjunto mágico", "Ensemble magique") },
  { id: "treasure", itemIds: ["avatar-captain", "frame-pirate", "banner-treasure-map", "title-treasure-hunter"], color: "#e8b860", names: n("Sada lovce pokladů", "Treasure hunter set", "Schatzjäger-Set", "Набор охотника за сокровищами", "Набір мисливця за скарбами", "宝さがしセット", "Conjunto del cazatesoros", "Ensemble chasseur de trésors") },
  { id: "planets", itemIds: ["frame-space", "banner-town-space", "title-planet-explorer", "title-rocket-scientist"], color: "#6fa8ff", names: n("Planetární sada", "Planet set", "Planeten-Set", "Планетный набор", "Планетарний набір", "惑星セット", "Conjunto planetario", "Ensemble planétaire") },
  { id: "dragon", itemIds: ["frame-dragon", "banner-volcano", "title-dragon-tamer", "pet-crown"], color: "#5ad08a", names: n("Dračí sada", "Dragon set", "Drachen-Set", "Драконий набор", "Драконячий набір", "ドラゴンセット", "Conjunto dragón", "Ensemble dragon") },
  { id: "frost", itemIds: ["frame-ice", "banner-aurora", "banner-christmas", "avatar-winter"], color: "#bfe8ff", names: n("Mrazivá sada", "Frost set", "Frost-Set", "Морозный набор", "Морозний набір", "霜セット", "Conjunto gélido", "Ensemble givré") },
  { id: "sweet", itemIds: ["frame-candy", "banner-candy", "banner-rainbow", "pet-bow"], color: "#ff9fd0", names: n("Sladká sada", "Sweet set", "Süßes Set", "Сладкий набор", "Солодкий набір", "スイーツセット", "Conjunto dulce", "Ensemble sucré") },
  { id: "brainy", itemIds: ["title-quiz-champion", "title-word-magician", "title-number-ninja", "title-time-traveler"], color: "#ffd24d", names: n("Sada chytrých hlav", "Brainy set", "Schlaukopf-Set", "Набор умников", "Набір розумників", "頭脳セット", "Conjunto de cerebritos", "Ensemble malin") },
];

export function getBundle(id: string): ShopBundle | undefined {
  return SHOP_BUNDLES.find((b) => b.id === id);
}

// Cena balíčku za to, co ještě nevlastníš: základní ceny mínus sleva za sadu.
export function bundlePrice(bundle: ShopBundle, ownedIds: ReadonlySet<string>): { price: number; full: number; missing: string[] } {
  const missing = bundle.itemIds.filter((id) => !ownedIds.has(id));
  const full = missing.reduce((sum, id) => sum + (getShopItem(id)?.price ?? 0), 0);
  return { price: Math.round(full * (1 - BUNDLE_DISCOUNT)), full, missing };
}
