import type { Locale } from "./config";
import type { RecipeCategory, Rarity, World } from "@/lib/craft";

export type CraftTab = "bonuses" | "avatars" | "accessories" | "materials";

export type CraftText = {
  tab: string;
  title: string;
  intro: string;
  tabs: Record<CraftTab, string>;
  worlds: Record<World, string>;
  rarities: Record<Rarity, string>;
  sections: Record<RecipeCategory, { title: string; hint: string }>;
  craft: string;
  crafting: string;
  owned: string;
  soon: string;
  soonHint: string;
  missing: string;
  inInventory: string;
  use: string;
  active: string;
  activeNone: string;
  until: string;
  capped: string;
  needs: string;
  have: string;
  inventory: string;
  inventoryEmpty: string;
  newMaterials: string;
  focusTitle: string;
  focusHint: string;
  howTitle: string;
  how: { learn: string; quests: string; buy: string; refine: string };
  goLearn: string;
  goQuests: string;
  buyTitle: string;
  buyHint: string;
  buyLeft: string;
  buyFor: string;
  refineTitle: string;
  refineHint: string;
  refineAction: string;
  points: string;
  loginHint: string;
  login: string;
  equipHint: string;
  endlessLabel: string;
  done: {
    crafted: string;
    unlocked: string;
    xp: string;
    endless: string;
    points: string;
    wheel: string;
    shield: string;
    bought: string;
    refined: string;
    focus: string;
  };
  errors: Record<"unknown" | "not-ready" | "missing" | "owned" | "limit" | "cap" | "none" | "points" | "conflict" | "unavailable" | "wheel-ready" | "shield-full", string>;
  hintCraft: string;
};

const cs: CraftText = {
  tab: "Craftování",
  title: "Craftování",
  intro: "Uč se, sbírej materiály a vyráběj z nich bonusy, avatary a doplňky, které nejdou koupit. Každá věc se vyrábí z materiálů svého světa.",
  tabs: { bonuses: "Bonusy", avatars: "Avatary", accessories: "Doplňky", materials: "Materiály" },
  worlds: { obecne: "Obecné", vesmir: "Vesmír", more: "Moře", les: "Les", hrad: "Hrad", kouzla: "Kouzla" },
  rarities: { common: "Běžný", uncommon: "Neobvyklý", rare: "Vzácný", epic: "Epický" },
  sections: {
    bonus: { title: "Bonusy", hint: "Vyrob si nástroje z obecných materiálů. Uloží se do inventáře a použiješ je, kdy chceš. Časové bonusy se sčítají až do stropu (+50 % XP, stálé hry +50 %)." },
    avatar: { title: "Avatary", hint: "Postavy, které existují jen z craftování. Po vyrobení si je nastavíš v Šatníku." },
    "avatar-acc": { title: "Doplňky na avatara", hint: "Čepice, náhrdelníky, pláště a křídla pro tvou postavu." },
    "pet-acc": { title: "Doplňky pro mazlíčky", hint: "Oblečky a obojky pro mazlíčky ve Stálých hrách." },
    profile: { title: "Ozdoby profilu", hint: "Tituly a pozadí, které nejdou koupit. Po vyrobení si je nastavíš v Šatníku." },
    room: { title: "Do pokoje", hint: "Dekorace do tvého 3D pokoje." },
  },
  craft: "Vyrobit",
  crafting: "Vyrábím…",
  owned: "Máš",
  soon: "Brzy",
  soonHint: "3D model se připravuje. Recept už znáš, vyrobit půjde, až bude model hotový.",
  missing: "Chybí materiál",
  inInventory: "V inventáři: {n}",
  use: "Použít",
  active: "Běží",
  activeNone: "Žádný bonus teď neběží.",
  until: "do {time}",
  capped: "Strop je plný",
  needs: "Potřebuješ",
  have: "máš",
  inventory: "Moje materiály",
  inventoryEmpty: "Zatím žádné materiály. Uč se a sbírej!",
  newMaterials: "Nové materiály od minula:",
  focusTitle: "Sbírám pro svět",
  focusHint: "Světové materiály za učení padají do světa, který tu zvolíš. Obecné padají vždycky.",
  howTitle: "Jak získat materiály",
  how: {
    learn: "Učením: každých 10 XP z lekcí, testů, her a kvízů dá materiál. Čím lepší výsledek najednou (30 XP a víc), tím větší šance na vzácný.",
    quests: "Ve Stálých hrách: za každou vybranou odměnu z úkolů a úspěchů dostaneš 2 materiály s nejlepší šancí na vzácné.",
    buy: "Nákupem za body: běžné a neobvyklé materiály, nejvýš 10 kusů denně.",
    refine: "Zušlechtěním: 3 kusy jedné vzácnosti vyměníš za 1 kus vyšší vzácnosti stejného světa.",
  },
  goLearn: "Jít se učit",
  goQuests: "Úkoly ve Stálých hrách",
  buyTitle: "Koupit za body",
  buyHint: "Vzácné a epické materiály koupit nejdou, ty se dají jen vysloužit nebo zušlechtit.",
  buyLeft: "Dnes můžeš koupit ještě {n} ks.",
  buyFor: "Koupit za {n} b.",
  refineTitle: "Zušlechtit",
  refineHint: "3 × materiál → 1 × vyšší vzácnost stejného světa.",
  refineAction: "3 → 1",
  points: "bodů",
  loginHint: "Přihlas se, ať můžeš sbírat materiály a vyrábět.",
  login: "Přihlásit se",
  equipHint: "Nastav si to v Šatníku.",
  endlessLabel: "Stálé hry",
  done: {
    crafted: "Vyrobeno: {name}",
    unlocked: "Odemčeno: {name}. Nastav si to v Šatníku!",
    xp: "Bonus XP běží! Teď máš celkem +{n} % XP.",
    endless: "Stálé hry jsou rychlejší! Celkem +{n} %.",
    points: "Získal(a) jsi {n} bodů!",
    wheel: "Kolo štěstí můžeš roztočit znovu!",
    shield: "Štít série přidán do kvízů ve všech Stálých hrách.",
    bought: "Koupeno.",
    refined: "Zušlechtěno: {name}",
    focus: "Teď sbíráš pro svět {name}.",
  },
  errors: {
    unknown: "Tohle nejde.",
    "not-ready": "Tohle zatím vyrobit nejde, model se připravuje.",
    missing: "Nemáš dost materiálu.",
    owned: "Tohle už máš.",
    limit: "Dnešní limit nákupu je vyčerpaný.",
    cap: "Strop bonusu je plný, počkej, až některý doběhne.",
    none: "Tenhle bonus v inventáři nemáš.",
    points: "Nemáš dost bodů.",
    conflict: "Změnilo se to v jiném okně, zkus to znovu.",
    unavailable: "Něco se nepovedlo, zkus to za chvíli.",
    "wheel-ready": "Kolo štěstí můžeš roztočit i bez žetonu, nech si ho na později.",
    "shield-full": "Štíty v kvízech máš plné, nech si ho na později.",
  },
  hintCraft: "Vyrob v profilu v Craftování.",
};

const en: CraftText = {
  tab: "Crafting",
  title: "Crafting",
  intro: "Learn, collect materials and craft bonuses, avatars and accessories you can't buy. Every item is made from materials of its own world.",
  tabs: { bonuses: "Bonuses", avatars: "Avatars", accessories: "Accessories", materials: "Materials" },
  worlds: { obecne: "General", vesmir: "Space", more: "Sea", les: "Forest", hrad: "Castle", kouzla: "Magic" },
  rarities: { common: "Common", uncommon: "Uncommon", rare: "Rare", epic: "Epic" },
  sections: {
    bonus: { title: "Bonuses", hint: "Craft tools from general materials. They go to your inventory and you use them whenever you like. Timed bonuses stack up to a cap (+50% XP, endless games +50%)." },
    avatar: { title: "Avatars", hint: "Characters that only exist through crafting. Once crafted, pick them in the Wardrobe." },
    "avatar-acc": { title: "Avatar accessories", hint: "Hats, necklaces, capes and wings for your character." },
    "pet-acc": { title: "Pet accessories", hint: "Outfits and collars for your pets in Endless games." },
    profile: { title: "Profile decorations", hint: "Titles and banners you can't buy. Once crafted, pick them in the Wardrobe." },
    room: { title: "For your room", hint: "Decorations for your 3D room." },
  },
  craft: "Craft",
  crafting: "Crafting…",
  owned: "Owned",
  soon: "Soon",
  soonHint: "The 3D model is being made. You already know the recipe; you can craft it once the model is ready.",
  missing: "Missing materials",
  inInventory: "In inventory: {n}",
  use: "Use",
  active: "Active",
  activeNone: "No bonus is running right now.",
  until: "until {time}",
  capped: "Cap reached",
  needs: "You need",
  have: "you have",
  inventory: "My materials",
  inventoryEmpty: "No materials yet. Learn and collect!",
  newMaterials: "New materials since last time:",
  focusTitle: "Collecting for world",
  focusHint: "World materials from learning drop into the world you pick here. General ones always drop.",
  howTitle: "How to get materials",
  how: {
    learn: "By learning: every 10 XP from lessons, tests, games and quizzes gives a material. The better the result at once (30 XP or more), the higher the chance of a rare one.",
    quests: "In Endless games: every reward you claim from quests and achievements gives 2 materials with the best chance of rare ones.",
    buy: "With points: common and uncommon materials, up to 10 a day.",
    refine: "By refining: trade 3 of one rarity for 1 of the next rarity from the same world.",
  },
  goLearn: "Go learn",
  goQuests: "Endless games quests",
  buyTitle: "Buy with points",
  buyHint: "Rare and epic materials can't be bought, only earned or refined.",
  buyLeft: "You can buy {n} more today.",
  buyFor: "Buy for {n} pts",
  refineTitle: "Refine",
  refineHint: "3 × material → 1 × next rarity of the same world.",
  refineAction: "3 → 1",
  points: "points",
  loginHint: "Sign in to collect materials and craft.",
  login: "Sign in",
  equipHint: "Set it in the Wardrobe.",
  endlessLabel: "Endless games",
  done: {
    crafted: "Crafted: {name}",
    unlocked: "Unlocked: {name}. Set it in the Wardrobe!",
    xp: "XP bonus is on! You now have +{n}% XP in total.",
    endless: "Endless games are faster! +{n}% in total.",
    points: "You got {n} points!",
    wheel: "You can spin the wheel of fortune again!",
    shield: "Streak shield added to quizzes in all Endless games.",
    bought: "Bought.",
    refined: "Refined: {name}",
    focus: "You're now collecting for {name}.",
  },
  errors: {
    unknown: "That's not possible.",
    "not-ready": "This can't be crafted yet, the model is being made.",
    missing: "You don't have enough materials.",
    owned: "You already have this.",
    limit: "Today's purchase limit is used up.",
    cap: "The bonus cap is full, wait until one runs out.",
    none: "You don't have this bonus in your inventory.",
    points: "You don't have enough points.",
    conflict: "It changed in another window, try again.",
    unavailable: "Something went wrong, try again in a moment.",
    "wheel-ready": "You can spin the wheel without a token, save it for later.",
    "shield-full": "Your quiz shields are full, save it for later.",
  },
  hintCraft: "Craft it in your profile under Crafting.",
};

const de: CraftText = {
  tab: "Basteln",
  title: "Basteln",
  intro: "Lerne, sammle Materialien und bastle daraus Boni, Avatare und Zubehör, die man nicht kaufen kann. Jedes Ding wird aus Materialien seiner Welt gemacht.",
  tabs: { bonuses: "Boni", avatars: "Avatare", accessories: "Zubehör", materials: "Materialien" },
  worlds: { obecne: "Allgemein", vesmir: "Weltall", more: "Meer", les: "Wald", hrad: "Burg", kouzla: "Magie" },
  rarities: { common: "Gewöhnlich", uncommon: "Ungewöhnlich", rare: "Selten", epic: "Episch" },
  sections: {
    bonus: { title: "Boni", hint: "Bastle Werkzeuge aus allgemeinen Materialien. Sie kommen ins Inventar und du benutzt sie, wann du willst. Zeitboni addieren sich bis zu einer Grenze (+50 % XP, Endlosspiele +50 %)." },
    avatar: { title: "Avatare", hint: "Figuren, die es nur durch Basteln gibt. Danach wählst du sie im Kleiderschrank." },
    "avatar-acc": { title: "Avatar-Zubehör", hint: "Mützen, Ketten, Umhänge und Flügel für deine Figur." },
    "pet-acc": { title: "Haustier-Zubehör", hint: "Kleidung und Halsbänder für deine Haustiere in den Endlosspielen." },
    profile: { title: "Profilschmuck", hint: "Titel und Hintergründe, die man nicht kaufen kann. Danach wählst du sie im Kleiderschrank." },
    room: { title: "Fürs Zimmer", hint: "Deko für dein 3D-Zimmer." },
  },
  craft: "Basteln",
  crafting: "Wird gebastelt…",
  owned: "Hast du",
  soon: "Bald",
  soonHint: "Das 3D-Modell entsteht gerade. Das Rezept kennst du schon, basteln kannst du es, sobald das Modell fertig ist.",
  missing: "Material fehlt",
  inInventory: "Im Inventar: {n}",
  use: "Benutzen",
  active: "Aktiv",
  activeNone: "Gerade läuft kein Bonus.",
  until: "bis {time}",
  capped: "Grenze erreicht",
  needs: "Du brauchst",
  have: "du hast",
  inventory: "Meine Materialien",
  inventoryEmpty: "Noch keine Materialien. Lerne und sammle!",
  newMaterials: "Neue Materialien seit dem letzten Mal:",
  focusTitle: "Ich sammle für die Welt",
  focusHint: "Weltmaterialien vom Lernen fallen in die Welt, die du hier wählst. Allgemeine fallen immer.",
  howTitle: "So bekommst du Materialien",
  how: {
    learn: "Durch Lernen: Alle 10 XP aus Lektionen, Tests, Spielen und Quiz geben ein Material. Je besser das Ergebnis auf einmal (ab 30 XP), desto größer die Chance auf ein seltenes.",
    quests: "In den Endlosspielen: Jede abgeholte Belohnung aus Aufgaben und Erfolgen gibt 2 Materialien mit der besten Chance auf seltene.",
    buy: "Mit Punkten: gewöhnliche und ungewöhnliche Materialien, höchstens 10 pro Tag.",
    refine: "Durch Veredeln: 3 Stück einer Seltenheit gegen 1 Stück der nächsten Seltenheit derselben Welt.",
  },
  goLearn: "Lernen gehen",
  goQuests: "Aufgaben in den Endlosspielen",
  buyTitle: "Mit Punkten kaufen",
  buyHint: "Seltene und epische Materialien kann man nicht kaufen, nur verdienen oder veredeln.",
  buyLeft: "Heute kannst du noch {n} Stück kaufen.",
  buyFor: "Für {n} P. kaufen",
  refineTitle: "Veredeln",
  refineHint: "3 × Material → 1 × nächste Seltenheit derselben Welt.",
  refineAction: "3 → 1",
  points: "Punkte",
  loginHint: "Melde dich an, um Materialien zu sammeln und zu basteln.",
  login: "Anmelden",
  equipHint: "Stell es im Kleiderschrank ein.",
  endlessLabel: "Endlosspiele",
  done: {
    crafted: "Gebastelt: {name}",
    unlocked: "Freigeschaltet: {name}. Stell es im Kleiderschrank ein!",
    xp: "XP-Bonus läuft! Jetzt hast du insgesamt +{n} % XP.",
    endless: "Endlosspiele sind schneller! Insgesamt +{n} %.",
    points: "Du hast {n} Punkte bekommen!",
    wheel: "Du kannst das Glücksrad noch einmal drehen!",
    shield: "Serienschild zu den Quiz in allen Endlosspielen hinzugefügt.",
    bought: "Gekauft.",
    refined: "Veredelt: {name}",
    focus: "Du sammelst jetzt für {name}.",
  },
  errors: {
    unknown: "Das geht nicht.",
    "not-ready": "Das kann man noch nicht basteln, das Modell entsteht gerade.",
    missing: "Du hast nicht genug Material.",
    owned: "Das hast du schon.",
    limit: "Das heutige Kauflimit ist erreicht.",
    cap: "Die Bonusgrenze ist voll, warte, bis einer abläuft.",
    none: "Diesen Bonus hast du nicht im Inventar.",
    points: "Du hast nicht genug Punkte.",
    conflict: "Es hat sich in einem anderen Fenster geändert, versuch es noch einmal.",
    unavailable: "Etwas ist schiefgelaufen, versuch es gleich noch einmal.",
    "wheel-ready": "Du kannst das Rad auch ohne Chip drehen, heb ihn dir auf.",
    "shield-full": "Deine Quiz-Schilde sind voll, heb ihn dir auf.",
  },
  hintCraft: "Bastle es im Profil unter Basteln.",
};

const ru: CraftText = {
  tab: "Крафт",
  title: "Крафт",
  intro: "Учись, собирай материалы и создавай из них бонусы, аватары и аксессуары, которые нельзя купить. Каждая вещь делается из материалов своего мира.",
  tabs: { bonuses: "Бонусы", avatars: "Аватары", accessories: "Аксессуары", materials: "Материалы" },
  worlds: { obecne: "Общие", vesmir: "Космос", more: "Море", les: "Лес", hrad: "Замок", kouzla: "Магия" },
  rarities: { common: "Обычный", uncommon: "Необычный", rare: "Редкий", epic: "Эпический" },
  sections: {
    bonus: { title: "Бонусы", hint: "Создавай инструменты из общих материалов. Они попадают в инвентарь, и ты используешь их, когда захочешь. Временные бонусы складываются до предела (+50 % XP, вечные игры +50 %)." },
    avatar: { title: "Аватары", hint: "Персонажи, которые есть только в крафте. После создания выбери их в Гардеробе." },
    "avatar-acc": { title: "Аксессуары для аватара", hint: "Шапки, ожерелья, плащи и крылья для твоего персонажа." },
    "pet-acc": { title: "Аксессуары для питомцев", hint: "Одежда и ошейники для питомцев в Вечных играх." },
    profile: { title: "Украшения профиля", hint: "Титулы и фоны, которые нельзя купить. После создания выбери их в Гардеробе." },
    room: { title: "Для комнаты", hint: "Украшения для твоей 3D-комнаты." },
  },
  craft: "Создать",
  crafting: "Создаю…",
  owned: "Есть",
  soon: "Скоро",
  soonHint: "3D-модель готовится. Рецепт ты уже знаешь, создать вещь можно будет, когда модель будет готова.",
  missing: "Не хватает материалов",
  inInventory: "В инвентаре: {n}",
  use: "Использовать",
  active: "Действует",
  activeNone: "Сейчас не действует ни один бонус.",
  until: "до {time}",
  capped: "Предел достигнут",
  needs: "Нужно",
  have: "есть",
  inventory: "Мои материалы",
  inventoryEmpty: "Пока нет материалов. Учись и собирай!",
  newMaterials: "Новые материалы с прошлого раза:",
  focusTitle: "Собираю для мира",
  focusHint: "Материалы мира за учёбу выпадают в мир, который ты выберешь здесь. Общие выпадают всегда.",
  howTitle: "Как получить материалы",
  how: {
    learn: "Учёбой: каждые 10 XP за уроки, тесты, игры и викторины дают материал. Чем лучше результат за раз (от 30 XP), тем выше шанс на редкий.",
    quests: "В Вечных играх: за каждую полученную награду за задания и достижения — 2 материала с лучшим шансом на редкие.",
    buy: "За баллы: обычные и необычные материалы, не больше 10 штук в день.",
    refine: "Улучшением: 3 штуки одной редкости меняешь на 1 штуку следующей редкости того же мира.",
  },
  goLearn: "Пойти учиться",
  goQuests: "Задания в Вечных играх",
  buyTitle: "Купить за баллы",
  buyHint: "Редкие и эпические материалы купить нельзя, их можно только заработать или улучшить.",
  buyLeft: "Сегодня можно купить ещё {n} шт.",
  buyFor: "Купить за {n} б.",
  refineTitle: "Улучшить",
  refineHint: "3 × материал → 1 × следующая редкость того же мира.",
  refineAction: "3 → 1",
  points: "баллов",
  loginHint: "Войди, чтобы собирать материалы и создавать вещи.",
  login: "Войти",
  equipHint: "Выбери это в Гардеробе.",
  endlessLabel: "Вечные игры",
  done: {
    crafted: "Создано: {name}",
    unlocked: "Открыто: {name}. Выбери это в Гардеробе!",
    xp: "Бонус XP действует! Сейчас у тебя всего +{n} % XP.",
    endless: "Вечные игры быстрее! Всего +{n} %.",
    points: "Ты получил(а) {n} баллов!",
    wheel: "Колесо фортуны можно крутить снова!",
    shield: "Щит серии добавлен в викторины во всех Вечных играх.",
    bought: "Куплено.",
    refined: "Улучшено: {name}",
    focus: "Теперь ты собираешь для мира {name}.",
  },
  errors: {
    unknown: "Так нельзя.",
    "not-ready": "Это пока нельзя создать, модель готовится.",
    missing: "Не хватает материалов.",
    owned: "Это у тебя уже есть.",
    limit: "Дневной лимит покупок исчерпан.",
    cap: "Предел бонуса заполнен, подожди, пока какой-то закончится.",
    none: "Этого бонуса нет в инвентаре.",
    points: "Не хватает баллов.",
    conflict: "Что-то изменилось в другом окне, попробуй ещё раз.",
    unavailable: "Что-то пошло не так, попробуй чуть позже.",
    "wheel-ready": "Колесо можно крутить и без жетона, прибереги его.",
    "shield-full": "Щиты в викторинах заполнены, прибереги его.",
  },
  hintCraft: "Создай это в профиле в разделе Крафт.",
};

const texts: Record<Locale, CraftText> = { cs, en, de, ru };

export function getCraftText(locale: Locale): CraftText {
  return texts[locale] ?? cs;
}
