import { withFallbacks } from "@/i18n/config";
import type { Locale } from "@/i18n/config";

export type EarsKind = "none" | "cat" | "bear" | "fox" | "antenna" | "horns" | "crown" | "band" | "hair";
export type EyesKind = "dots" | "big" | "visor" | "one" | "sleepy" | "goggles";
export type MouthKind = "smile" | "open" | "teeth" | "cat" | "flat";
export type HeadKind = "round" | "box" | "ghost";

export type AvatarDef = {
  id: string;
  bg: string;
  skin: string;
  head: HeadKind;
  ears: EarsKind;
  eyes: EyesKind;
  mouth: MouthKind;
  // Odemkne se na této úrovni, nebo speciální událostí (zatím nedostupné).
  unlock: { level: number } | { event: string };
  names: Record<Locale, string>;
};

export const AVATARS: AvatarDef[] = [
  { id: "robot", bg: "#8fd0ff", skin: "#d9e2ee", head: "box", ears: "antenna", eyes: "visor", mouth: "flat", unlock: { level: 1 }, names: { ...withFallbacks({ cs: "Robot", en: "Robot", de: "Roboter", ru: "Робот" }), uk: "Робот", ja: "ロボット", es: "Robot", fr: "Robot" } },
  { id: "cat", bg: "#ffc933", skin: "#ffb26b", head: "round", ears: "cat", eyes: "dots", mouth: "cat", unlock: { level: 1 }, names: { ...withFallbacks({ cs: "Kočka", en: "Cat", de: "Katze", ru: "Кошка" }), uk: "Кішка", ja: "ねこ", es: "Gato", fr: "Chat" } },
  { id: "alien", bg: "#7ee0b0", skin: "#9be15d", head: "round", ears: "antenna", eyes: "big", mouth: "smile", unlock: { level: 2 }, names: { ...withFallbacks({ cs: "Vetřelec", en: "Alien", de: "Alien", ru: "Пришелец" }), uk: "Прибулець", ja: "宇宙人", es: "Extraterrestre", fr: "Alien" } },
  { id: "ghost", bg: "#c9b8ff", skin: "#ffffff", head: "ghost", ears: "none", eyes: "dots", mouth: "open", unlock: { level: 3 }, names: { ...withFallbacks({ cs: "Duch", en: "Ghost", de: "Geist", ru: "Призрак" }), uk: "Привид", ja: "おばけ", es: "Fantasma", fr: "Fantôme" } },
  { id: "fox", bg: "#ff8a6b", skin: "#ff9d3d", head: "round", ears: "fox", eyes: "dots", mouth: "smile", unlock: { level: 5 }, names: { ...withFallbacks({ cs: "Liška", en: "Fox", de: "Fuchs", ru: "Лиса" }), uk: "Лисичка", ja: "きつね", es: "Zorro", fr: "Renard" } },
  { id: "owl", bg: "#f2d58a", skin: "#b98a5a", head: "round", ears: "horns", eyes: "big", mouth: "flat", unlock: { level: 7 }, names: { ...withFallbacks({ cs: "Sova", en: "Owl", de: "Eule", ru: "Сова" }), uk: "Сова", ja: "ふくろう", es: "Búho", fr: "Hibou" } },
  { id: "panda", bg: "#b8e3a6", skin: "#fbfbfb", head: "round", ears: "bear", eyes: "sleepy", mouth: "smile", unlock: { level: 10 }, names: { ...withFallbacks({ cs: "Panda", en: "Panda", de: "Panda", ru: "Панда" }), uk: "Панда", ja: "パンダ", es: "Panda", fr: "Panda" } },
  { id: "dragon", bg: "#ff6f91", skin: "#44c27a", head: "round", ears: "horns", eyes: "dots", mouth: "teeth", unlock: { level: 13 }, names: { ...withFallbacks({ cs: "Drak", en: "Dragon", de: "Drache", ru: "Дракон" }), uk: "Дракон", ja: "ドラゴン", es: "Dragón", fr: "Dragon" } },
  { id: "ninja", bg: "#9aa4c4", skin: "#ffd5a8", head: "round", ears: "band", eyes: "sleepy", mouth: "flat", unlock: { level: 16 }, names: { ...withFallbacks({ cs: "Nindža", en: "Ninja", de: "Ninja", ru: "Ниндзя" }), uk: "Ніндзя", ja: "忍者", es: "Ninja", fr: "Ninja" } },
  { id: "king", bg: "#ffd24d", skin: "#ffd5a8", head: "round", ears: "crown", eyes: "dots", mouth: "smile", unlock: { level: 20 }, names: { ...withFallbacks({ cs: "Král", en: "King", de: "König", ru: "Король" }), uk: "Король", ja: "王さま", es: "Rey", fr: "Roi" } },
  { id: "founder", bg: "#5a6cff", skin: "#ffe3b0", head: "round", ears: "crown", eyes: "one", mouth: "open", unlock: { event: "founder" }, names: { ...withFallbacks({ cs: "Zakladatel", en: "Founder", de: "Gründer", ru: "Основатель" }), uk: "Засновник", ja: "創設者", es: "Fundador", fr: "Fondateur" } },
  { id: "chemik", bg: "#7ee0b0", skin: "#ffd5a8", head: "round", ears: "hair", eyes: "goggles", mouth: "smile", unlock: { event: "escape-lab" }, names: { ...withFallbacks({ cs: "Chemik", en: "Chemist", de: "Chemiker", ru: "Химик" }), uk: "Хімік", ja: "化学者", es: "Químico", fr: "Chimiste" } },
  { id: "winter", bg: "#d6efff", skin: "#ffffff", head: "round", ears: "bear", eyes: "big", mouth: "teeth", unlock: { event: "winter" }, names: { ...withFallbacks({ cs: "Zimní", en: "Winter", de: "Winter", ru: "Зимний" }), uk: "Зимовий", ja: "冬", es: "Invierno", fr: "Hiver" } },
  { id: "astronaut", bg: "#243b7a", skin: "#eef1f7", head: "round", ears: "antenna", eyes: "visor", mouth: "smile", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Astronaut", en: "Astronaut", de: "Astronaut", ru: "Астронавт" }), uk: "Астронавт", ja: "宇宙飛行士", es: "Astronauta", fr: "Astronaute" } },
  { id: "pirate", bg: "#7fd0e8", skin: "#ffd5a8", head: "round", ears: "band", eyes: "one", mouth: "teeth", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Pirát", en: "Pirate", de: "Pirat", ru: "Пират" }), uk: "Пірат", ja: "海賊", es: "Pirata", fr: "Pirate" } },
  { id: "captain", bg: "#d6362b", skin: "#ffd5a8", head: "round", ears: "crown", eyes: "one", mouth: "teeth", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Kapitán", en: "Captain", de: "Kapitän", ru: "Капитан" }), uk: "Капітан", ja: "キャプテン", es: "Capitán", fr: "Capitaine" } },
  { id: "sea-wolf", bg: "#3b7be0", skin: "#e0b48a", head: "round", ears: "band", eyes: "goggles", mouth: "flat", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Mořský vlk", en: "Sea wolf", de: "Seebär", ru: "Морской волк" }), uk: "Морський вовк", ja: "海のオオカミ", es: "Lobo de mar", fr: "Loup de mer" } },
  { id: "mermaid", bg: "#7ee0d0", skin: "#ffd5a8", head: "round", ears: "hair", eyes: "big", mouth: "smile", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Mořská panna", en: "Mermaid", de: "Meerjungfrau", ru: "Русалка" }), uk: "Русалка", ja: "人魚", es: "Sirena", fr: "Sirène" } },
  { id: "wizard", bg: "#7a5cff", skin: "#ffd5a8", head: "round", ears: "horns", eyes: "big", mouth: "open", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Čaroděj", en: "Wizard", de: "Zauberer", ru: "Волшебник" }), uk: "Чарівник", ja: "魔法使い", es: "Mago", fr: "Magicien" } },
  { id: "fairy", bg: "#e6c8ff", skin: "#ffe0c8", head: "round", ears: "hair", eyes: "big", mouth: "smile", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Víla", en: "Fairy", de: "Fee", ru: "Фея" }), uk: "Фея", ja: "妖精", es: "Hada", fr: "Fée" } },
  { id: "ranger", bg: "#b8e3a6", skin: "#e8c8a0", head: "round", ears: "band", eyes: "dots", mouth: "smile", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Hajný", en: "Ranger", de: "Förster", ru: "Лесник" }), uk: "Лісник", ja: "森の番人", es: "Guardabosques", fr: "Garde forestier" } },
  { id: "knight", bg: "#c9ced8", skin: "#ffd5a8", head: "box", ears: "none", eyes: "visor", mouth: "flat", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Rytíř", en: "Knight", de: "Ritter", ru: "Рыцарь" }), uk: "Лицар", ja: "騎士", es: "Caballero", fr: "Chevalier" } },
  { id: "princess", bg: "#ffc2e0", skin: "#ffe0c8", head: "round", ears: "crown", eyes: "big", mouth: "smile", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Princezna", en: "Princess", de: "Prinzessin", ru: "Принцесса" }), uk: "Принцеса", ja: "お姫さま", es: "Princesa", fr: "Princesse" } },
  { id: "diver", bg: "#7fd0e8", skin: "#ffd5a8", head: "round", ears: "none", eyes: "goggles", mouth: "open", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Potápěč", en: "Diver", de: "Taucher", ru: "Водолаз" }), uk: "Водолаз", ja: "ダイバー", es: "Buzo", fr: "Plongeur" } },
  { id: "octopus", bg: "#d6a8ff", skin: "#a86ad8", head: "ghost", ears: "none", eyes: "big", mouth: "open", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Chobotnice", en: "Octopus", de: "Krake", ru: "Осьминог" }), uk: "Восьминіг", ja: "タコ", es: "Pulpo", fr: "Pieuvre" } },
  { id: "pumpkin", bg: "#ffb259", skin: "#ff8a1f", head: "round", ears: "none", eyes: "dots", mouth: "teeth", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Dýně", en: "Pumpkin", de: "Kürbis", ru: "Тыква" }), uk: "Гарбуз", ja: "かぼちゃ", es: "Calabaza", fr: "Citrouille" } },

  // --- zvířata ---
  { id: "frog", bg: "#c9f0a8", skin: "#6fcf5a", head: "round", ears: "none", eyes: "big", mouth: "smile", unlock: { level: 4 }, names: { ...withFallbacks({ cs: "Žabák", en: "Frog", de: "Frosch", ru: "Лягушонок" }), uk: "Жабеня", ja: "カエル", es: "Ranita", fr: "Grenouille" } },
  { id: "penguin", bg: "#bfe6ff", skin: "#2d3a5c", head: "round", ears: "none", eyes: "dots", mouth: "open", unlock: { level: 6 }, names: { ...withFallbacks({ cs: "Tučňák", en: "Penguin", de: "Pinguin", ru: "Пингвин" }), uk: "Пінгвін", ja: "ペンギン", es: "Pingüino", fr: "Pingouin" } },
  { id: "unicorn", bg: "#ffd0ec", skin: "#fff4fb", head: "round", ears: "horns", eyes: "sleepy", mouth: "smile", unlock: { level: 8 }, names: { ...withFallbacks({ cs: "Jednorožec", en: "Unicorn", de: "Einhorn", ru: "Единорог" }), uk: "Єдиноріг", ja: "ユニコーン", es: "Unicornio", fr: "Licorne" } },
  { id: "koala", bg: "#d9e4ef", skin: "#b8bfc9", head: "round", ears: "bear", eyes: "dots", mouth: "flat", unlock: { level: 9 }, names: { ...withFallbacks({ cs: "Koala", en: "Koala", de: "Koala", ru: "Коала" }), uk: "Коала", ja: "コアラ", es: "Koala", fr: "Koala" } },
  { id: "llama", bg: "#ffe7b3", skin: "#f3dcc0", head: "round", ears: "cat", eyes: "sleepy", mouth: "cat", unlock: { level: 11 }, names: { ...withFallbacks({ cs: "Lama", en: "Llama", de: "Lama", ru: "Лама" }), uk: "Лама", ja: "ラマ", es: "Llama", fr: "Lama" } },
  { id: "octopus", bg: "#e3c8ff", skin: "#c06bd8", head: "ghost", ears: "none", eyes: "big", mouth: "open", unlock: { level: 12 }, names: { ...withFallbacks({ cs: "Chobotnice", en: "Octopus", de: "Krake", ru: "Осьминог" }), uk: "Восьминіг", ja: "タコ", es: "Pulpo", fr: "Pieuvre" } },
  { id: "capybara", bg: "#f0dcb8", skin: "#b0804f", head: "box", ears: "bear", eyes: "sleepy", mouth: "flat", unlock: { level: 14 }, names: { ...withFallbacks({ cs: "Kapybara", en: "Capybara", de: "Wasserschwein", ru: "Капибара" }), uk: "Капібара", ja: "カピバラ", es: "Capibara", fr: "Capybara" } },
  { id: "yeti", bg: "#d8f0ff", skin: "#f4fbff", head: "round", ears: "bear", eyes: "one", mouth: "teeth", unlock: { level: 22 }, names: { ...withFallbacks({ cs: "Yetti", en: "Yeti", de: "Yeti", ru: "Йети" }), uk: "Єті", ja: "イエティ", es: "Yeti", fr: "Yéti" } },

  // --- povolání ---
  { id: "doctor", bg: "#c9f3ee", skin: "#ffd5a8", head: "round", ears: "band", eyes: "dots", mouth: "smile", unlock: { level: 15 }, names: { ...withFallbacks({ cs: "Doktor", en: "Doctor", de: "Arzt", ru: "Доктор" }), uk: "Лікар", ja: "おいしゃさん", es: "Doctor", fr: "Docteur" } },
  { id: "chef", bg: "#ffe0c2", skin: "#ffd5a8", head: "round", ears: "hair", eyes: "dots", mouth: "smile", unlock: { event: "escape-kitchen" }, names: { ...withFallbacks({ cs: "Kuchař", en: "Chef", de: "Koch", ru: "Повар" }), uk: "Кухар", ja: "コック", es: "Chef", fr: "Cuisinier" } },
  { id: "firefighter", bg: "#ff9b8a", skin: "#ffd5a8", head: "round", ears: "crown", eyes: "goggles", mouth: "flat", unlock: { level: 18 }, names: { ...withFallbacks({ cs: "Hasič", en: "Firefighter", de: "Feuerwehrmann", ru: "Пожарный" }), uk: "Пожежник", ja: "消防士", es: "Bombero", fr: "Pompier" } },
  { id: "detective", bg: "#c4b8a2", skin: "#ffd5a8", head: "round", ears: "band", eyes: "goggles", mouth: "flat", unlock: { level: 24 }, names: { ...withFallbacks({ cs: "Detektiv", en: "Detective", de: "Detektiv", ru: "Детектив" }), uk: "Детектив", ja: "たんてい", es: "Detective", fr: "Détective" } },
  { id: "pilot", bg: "#9fd2ff", skin: "#ffd5a8", head: "round", ears: "band", eyes: "visor", mouth: "smile", unlock: { level: 26 }, names: { ...withFallbacks({ cs: "Pilot", en: "Pilot", de: "Pilot", ru: "Пилот" }), uk: "Пілот", ja: "パイロット", es: "Piloto", fr: "Pilote" } },
  { id: "inventor", bg: "#fff0a8", skin: "#ffd5a8", head: "round", ears: "hair", eyes: "goggles", mouth: "open", unlock: { level: 28 }, names: { ...withFallbacks({ cs: "Vynálezce", en: "Inventor", de: "Erfinder", ru: "Изобретатель" }), uk: "Винахідник", ja: "発明家", es: "Inventor", fr: "Inventeur" } },
  { id: "archaeologist", bg: "#e8cf9b", skin: "#e0b48a", head: "round", ears: "band", eyes: "dots", mouth: "smile", unlock: { event: "escape-museum" }, names: { ...withFallbacks({ cs: "Archeolog", en: "Archaeologist", de: "Archäologe", ru: "Археолог" }), uk: "Археолог", ja: "考古学者", es: "Arqueólogo", fr: "Archéologue" } },
  { id: "sailor", bg: "#a8d8f0", skin: "#ffd5a8", head: "round", ears: "band", eyes: "dots", mouth: "teeth", unlock: { event: "escape-pirate" }, names: { ...withFallbacks({ cs: "Námořník", en: "Sailor", de: "Seemann", ru: "Моряк" }), uk: "Моряк", ja: "水夫", es: "Marinero", fr: "Marin" } },
  { id: "explorer", bg: "#f2d9a0", skin: "#e0b48a", head: "round", ears: "band", eyes: "goggles", mouth: "smile", unlock: { event: "escape-expedition" }, names: { ...withFallbacks({ cs: "Cestovatel", en: "Explorer", de: "Entdecker", ru: "Путешественник" }), uk: "Мандрівник", ja: "たびびと", es: "Viajero", fr: "Voyageur" } },
  { id: "ranger", bg: "#b8e3a6", skin: "#ffd5a8", head: "round", ears: "hair", eyes: "dots", mouth: "smile", unlock: { event: "escape-jungle" }, names: { ...withFallbacks({ cs: "Hajný", en: "Ranger", de: "Förster", ru: "Лесник" }), uk: "Лісник", ja: "森の番人", es: "Guardabosques", fr: "Garde forestier" } },
  { id: "knight", bg: "#c8cfe0", skin: "#dfe5f0", head: "box", ears: "crown", eyes: "visor", mouth: "flat", unlock: { level: 36 }, names: { ...withFallbacks({ cs: "Rytíř", en: "Knight", de: "Ritter", ru: "Рыцарь" }), uk: "Лицар", ja: "騎士", es: "Caballero", fr: "Chevalier" } },

  // --- fantasy ---
  { id: "fairy", bg: "#ffd9f2", skin: "#ffe1d0", head: "round", ears: "antenna", eyes: "big", mouth: "smile", unlock: { level: 40 }, names: { ...withFallbacks({ cs: "Víla", en: "Fairy", de: "Fee", ru: "Фея" }), uk: "Фея", ja: "妖精", es: "Hada", fr: "Fée" } },
  { id: "elf", bg: "#c8f2c0", skin: "#ffe6c8", head: "round", ears: "fox", eyes: "dots", mouth: "smile", unlock: { level: 44 }, names: { ...withFallbacks({ cs: "Elf", en: "Elf", de: "Elf", ru: "Эльф" }), uk: "Ельф", ja: "エルフ", es: "Elfo", fr: "Elfe" } },
  { id: "dwarf", bg: "#e4c9a8", skin: "#f0b98a", head: "box", ears: "hair", eyes: "dots", mouth: "teeth", unlock: { level: 48 }, names: { ...withFallbacks({ cs: "Trpaslík", en: "Dwarf", de: "Zwerg", ru: "Гном" }), uk: "Гном", ja: "ドワーフ", es: "Enano", fr: "Nain" } },
  { id: "vampire", bg: "#c9a6d6", skin: "#f1e8f4", head: "round", ears: "fox", eyes: "sleepy", mouth: "teeth", unlock: { level: 52 }, names: { ...withFallbacks({ cs: "Upír", en: "Vampire", de: "Vampir", ru: "Вампир" }), uk: "Вампір", ja: "吸血鬼", es: "Vampiro", fr: "Vampire" } },
  { id: "mummy", bg: "#e8dcc0", skin: "#f0e6cc", head: "box", ears: "band", eyes: "one", mouth: "flat", unlock: { level: 56 }, names: { ...withFallbacks({ cs: "Mumie", en: "Mummy", de: "Mumie", ru: "Мумия" }), uk: "Мумія", ja: "ミイラ", es: "Momia", fr: "Momie" } },
  { id: "mermaid", bg: "#a8f0e6", skin: "#ffd9c4", head: "round", ears: "hair", eyes: "big", mouth: "smile", unlock: { level: 60 }, names: { ...withFallbacks({ cs: "Mořská panna", en: "Mermaid", de: "Meerjungfrau", ru: "Русалка" }), uk: "Русалка", ja: "人魚", es: "Sirena", fr: "Sirène" } },
  { id: "robot-dino", bg: "#b8f0d0", skin: "#58c48a", head: "box", ears: "horns", eyes: "visor", mouth: "teeth", unlock: { level: 66 }, names: { ...withFallbacks({ cs: "Robodinosaurus", en: "Robo-dino", de: "Robo-Dino", ru: "Робо-динозавр" }), uk: "Рободинозавр", ja: "ロボ恐竜", es: "Robodinosaurio", fr: "Robo-dinosaure" } },
  { id: "phoenix", bg: "#ffc29a", skin: "#ff6a3d", head: "round", ears: "crown", eyes: "big", mouth: "open", unlock: { level: 75 }, names: { ...withFallbacks({ cs: "Fénix", en: "Phoenix", de: "Phönix", ru: "Феникс" }), uk: "Фенікс", ja: "フェニックス", es: "Fénix", fr: "Phénix" } },
  { id: "cosmic", bg: "#3a2b7a", skin: "#a98bff", head: "ghost", ears: "antenna", eyes: "visor", mouth: "smile", unlock: { level: 90 }, names: { ...withFallbacks({ cs: "Kosmický", en: "Cosmic", de: "Kosmisch", ru: "Космический" }), uk: "Космічний", ja: "宇宙の", es: "Cósmico", fr: "Cosmique" } },

  // --- nové z generátoru avatarů (umime-art/blender/avatary3d.py), v obchodě podle světů ---
  { id: "piratka", bg: "#7fd0e8", skin: "#f0c8a0", head: "round", ears: "band", eyes: "one", mouth: "smile", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Pirátka", en: "Pirate girl", de: "Piratin", ru: "Пиратка" }), uk: "Піратка", ja: "女海賊", es: "Pirata (chica)", fr: "Pirate (fille)" } },
  { id: "kosmonautka", bg: "#243b7a", skin: "#ffd5a8", head: "round", ears: "antenna", eyes: "big", mouth: "smile", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Kosmonautka", en: "Cosmonaut", de: "Kosmonautin", ru: "Космонавтка" }), uk: "Космонавтка", ja: "女性宇宙飛行士", es: "Cosmonauta", fr: "Cosmonaute" } },
  { id: "robopes", bg: "#9fd2ff", skin: "#c8d0dc", head: "box", ears: "antenna", eyes: "visor", mouth: "flat", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Robopes", en: "Robo-dog", de: "Roboterhund", ru: "Робопёс" }), uk: "Робопес", ja: "ロボットいぬ", es: "Robo-perro", fr: "Robo-chien" } },
  { id: "skritek", bg: "#c9f0a8", skin: "#ffd5a8", head: "round", ears: "band", eyes: "dots", mouth: "smile", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Skřítek", en: "Gnome", de: "Wichtel", ru: "Гномик" }), uk: "Гномик", ja: "こびと", es: "Duende", fr: "Lutin" } },
  { id: "veverka", bg: "#ffe0b8", skin: "#d8843a", head: "round", ears: "fox", eyes: "big", mouth: "cat", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Veverka", en: "Squirrel", de: "Eichhörnchen", ru: "Белка" }), uk: "Білка", ja: "リス", es: "Ardilla", fr: "Écureuil" } },
  { id: "princ", bg: "#c8d8ff", skin: "#ffd5a8", head: "round", ears: "crown", eyes: "dots", mouth: "smile", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Princ", en: "Prince", de: "Prinz", ru: "Принц" }), uk: "Принц", ja: "王子さま", es: "Príncipe", fr: "Prince" } },
  { id: "carodejnice", bg: "#e3c8ff", skin: "#ffe0c8", head: "round", ears: "hair", eyes: "big", mouth: "smile", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Čarodějnice", en: "Witch", de: "Hexe", ru: "Ведьма" }), uk: "Відьма", ja: "魔女", es: "Bruja", fr: "Sorcière" } },
  { id: "zralok", bg: "#bfe6ff", skin: "#7a8ca8", head: "round", ears: "none", eyes: "big", mouth: "teeth", unlock: { event: "shop" }, names: { ...withFallbacks({ cs: "Žralok", en: "Shark", de: "Hai", ru: "Акула" }), uk: "Акула", ja: "サメ", es: "Tiburón", fr: "Requin" } },
  // Jen z craftování (profil → Craftování), každý z materiálů svého světa. 3D model zatím není, kreslí se jako SVG.
  { id: "star-wanderer", bg: "#2b2d6e", skin: "#c9d6ff", head: "round", ears: "antenna", eyes: "big", mouth: "smile", unlock: { event: "craft" }, names: { ...withFallbacks({ cs: "Hvězdný poutník", en: "Star wanderer", de: "Sternenwanderer", ru: "Звёздный странник" }), uk: "Зоряний мандрівник", ja: "星の旅人", es: "Viajero estelar", fr: "Voyageur des étoiles" } },
  { id: "coral-guardian", bg: "#3fc1ff", skin: "#ff8a7a", head: "round", ears: "horns", eyes: "goggles", mouth: "smile", unlock: { event: "craft" }, names: { ...withFallbacks({ cs: "Korálový strážce", en: "Coral guardian", de: "Korallenwächter", ru: "Коралловый страж" }), uk: "Охоронець коралів", ja: "サンゴの守護者", es: "Guardián coralino", fr: "Gardien de corail" } },
  { id: "forest-spirit", bg: "#6ee7a8", skin: "#a7d36b", head: "ghost", ears: "none", eyes: "sleepy", mouth: "smile", unlock: { event: "craft" }, names: { ...withFallbacks({ cs: "Lesní duch", en: "Forest spirit", de: "Waldgeist", ru: "Лесной дух" }), uk: "Лісовий дух", ja: "森の精霊", es: "Espíritu del bosque", fr: "Esprit de la forêt" } },
  { id: "blacksmith", bg: "#c9a27a", skin: "#ffd5a8", head: "box", ears: "band", eyes: "dots", mouth: "teeth", unlock: { event: "craft" }, names: { ...withFallbacks({ cs: "Hradní kovář", en: "Castle blacksmith", de: "Burgschmied", ru: "Замковый кузнец" }), uk: "Замковий коваль", ja: "城の鍛冶師", es: "Herrero del castillo", fr: "Forgeron du château" } },
  { id: "moon-witch", bg: "#7c3aed", skin: "#e7dcff", head: "round", ears: "hair", eyes: "big", mouth: "cat", unlock: { event: "craft" }, names: { ...withFallbacks({ cs: "Měsíční čarodějka", en: "Moon witch", de: "Mondhexe", ru: "Лунная колдунья" }), uk: "Місячна відьма", ja: "月の魔女", es: "Bruja lunar", fr: "Sorcière de la lune" } },
  { id: "comet-rider", bg: "#1c2a6e", skin: "#ffd0a8", head: "round", ears: "antenna", eyes: "visor", mouth: "smile", unlock: { event: "craft" }, names: { ...withFallbacks({ cs: "Jezdec komet", en: "Comet rider", de: "Kometenreiter", ru: "Наездник комет" }), uk: "Вершник комет", ja: "彗星のりて", es: "Jinete de cometas", fr: "Chevaucheur de comètes" } },
  { id: "pearl-diver", bg: "#6fe0e8", skin: "#ffd9c4", head: "round", ears: "hair", eyes: "goggles", mouth: "smile", unlock: { event: "craft" }, names: { ...withFallbacks({ cs: "Lovkyně perel", en: "Pearl diver", de: "Perlentaucherin", ru: "Ловица жемчуга" }), uk: "Ловчиня перлів", ja: "真珠ダイバー", es: "Buceadora de perlas", fr: "Plongeuse de perles" } },
  { id: "amber-druid", bg: "#e8c870", skin: "#c8e08a", head: "ghost", ears: "horns", eyes: "sleepy", mouth: "flat", unlock: { event: "craft" }, names: { ...withFallbacks({ cs: "Jantarový druid", en: "Amber druid", de: "Bernsteindruide", ru: "Янтарный друид" }), uk: "Бурштиновий друїд", ja: "琥珀のドルイド", es: "Druida de ámbar", fr: "Druide d'ambre" } },
  { id: "royal-guard", bg: "#b8c4e8", skin: "#ffd5a8", head: "box", ears: "crown", eyes: "visor", mouth: "flat", unlock: { event: "craft" }, names: { ...withFallbacks({ cs: "Královský strážce", en: "Royal guard", de: "Königswache", ru: "Королевский страж" }), uk: "Королівський страж", ja: "王室の衛兵", es: "Guardia real", fr: "Garde royal" } },
  { id: "dragon-mage", bg: "#9a4cff", skin: "#6fd08a", head: "round", ears: "horns", eyes: "big", mouth: "teeth", unlock: { event: "craft" }, names: { ...withFallbacks({ cs: "Dračí mág", en: "Dragon mage", de: "Drachenmagier", ru: "Драконий маг" }), uk: "Драконячий маг", ja: "ドラゴンの魔法使い", es: "Mago dragón", fr: "Mage dragon" } },
];

export const DEFAULT_AVATAR = "robot";

export function getAvatar(id: string | null | undefined) {
  return AVATARS.find((a) => a.id === id) ?? AVATARS[0];
}

// Událostní avatary se odemykají záznamem v tabulce Unlock (klíč "avatar:<id>").
export function isAvatarUnlocked(avatar: AvatarDef, level: number, unlocks: string[] = []): boolean {
  if ("level" in avatar.unlock) return level >= avatar.unlock.level;
  return unlocks.includes(`avatar:${avatar.id}`);
}
