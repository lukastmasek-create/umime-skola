import type { Locale } from "./config";
import type { ShopKind } from "@/lib/shop";

export type ShopText = {
  title: string;
  subtitle: string;
  loginRequired: string;
  login: string;
  unavailable: string;
  loading: string;
  yourPoints: string;
  howToEarn: string;
  learn: string;
  tabAll: string;
  tabs: Record<ShopKind, string>;
  hints: Record<ShopKind, string>;
  buy: string;
  owned: string;
  equip: string;
  equipped: string;
  unequip: string;
  useInPets: string;
  useInCity: string;
  needPoints: string; // {n}
  bought: string; // {name}
  tagNew: string;
  tagPopular: string;
  errors: Record<"owned" | "not-enough-points" | "login-required" | "unknown-item" | "unavailable" | "generic" | "locked", string>;
};

const cs: ShopText = {
  title: "Uživatelský obchod",
  subtitle: "Za body z učení si tu koupíš avatary, tituly, rámečky a pozadí profilu, doplňky pro mazlíčky i speciální budovy do města. Nabídku pro tebe pořád rozšiřujeme.",
  loginRequired: "Nakupovat můžeš po přihlášení. Prohlížet si nabídku můžeš už teď.",
  login: "Přihlásit se",
  unavailable: "Obchod se teď nenačetl. Zkus to za chvíli.",
  loading: "Načítám obchod…",
  yourPoints: "Tvoje body",
  howToEarn: "Body získáš v kurzech, hrách a únikovkách.",
  learn: "Jít se učit",
  tabAll: "Vše",
  tabs: { avatar: "Avatary", title: "Tituly", frame: "Rámečky", banner: "Pozadí profilu", pet: "Pro mazlíčky", city: "Do města" },
  hints: {
    avatar: "Nový obličej pro tvůj profil.",
    title: "Zobrazí se pod tvým jménem.",
    frame: "Rámeček kolem avataru.",
    banner: "Pozadí tvé profilové karty.",
    pet: "Doplněk, který mazlíček nosí.",
    city: "Speciální budova, kterou postavíš ve městě.",
  },
  buy: "Koupit",
  owned: "Vlastníš",
  equip: "Nasadit",
  equipped: "Nasazeno",
  unequip: "Sundat",
  useInPets: "Použít u mazlíčků",
  useInCity: "Postavit ve městě",
  needPoints: "Chybí {n} bodů",
  bought: "Koupeno: {name}",
  tagNew: "Novinka",
  tagPopular: "Oblíbené",
  errors: {
    owned: "Tohle už vlastníš.",
    "not-enough-points": "Nemáš dost bodů z učení.",
    "login-required": "Pro nákup se přihlas.",
    "unknown-item": "Taková věc v obchodě není.",
    unavailable: "Obchod se teď nepodařilo načíst. Zkus to za chvíli.",
    generic: "Něco se nepovedlo. Zkus to znovu.",
    locked: "Tohle ještě nemáš odemčené.",
  },
};

const en: ShopText = {
  title: "User shop",
  subtitle: "Spend learning points on avatars, titles, frames and profile backgrounds, accessories for your pets and special buildings for your city. We keep adding more.",
  loginRequired: "Log in to buy things. You can browse the shop right now.",
  login: "Log in",
  unavailable: "The shop couldn't load right now. Try again in a moment.",
  loading: "Loading the shop…",
  yourPoints: "Your points",
  howToEarn: "You earn points in courses, games and escape rooms.",
  learn: "Go and learn",
  tabAll: "All",
  tabs: { avatar: "Avatars", title: "Titles", frame: "Frames", banner: "Profile backgrounds", pet: "For pets", city: "For the city" },
  hints: {
    avatar: "A new face for your profile.",
    title: "Shows under your name.",
    frame: "A frame around your avatar.",
    banner: "The background of your profile card.",
    pet: "An accessory your pet wears.",
    city: "A special building you can place in your city.",
  },
  buy: "Buy",
  owned: "Owned",
  equip: "Equip",
  equipped: "Equipped",
  unequip: "Remove",
  useInPets: "Use with pets",
  useInCity: "Build in the city",
  needPoints: "{n} points short",
  bought: "Bought: {name}",
  tagNew: "New",
  tagPopular: "Popular",
  errors: {
    owned: "You already own this.",
    "not-enough-points": "Not enough learning points.",
    "login-required": "Log in to buy.",
    "unknown-item": "That item isn't in the shop.",
    unavailable: "The shop couldn't be loaded right now. Try again in a moment.",
    generic: "Something went wrong. Try again.",
    locked: "You haven't unlocked this yet.",
  },
};

const de: ShopText = {
  title: "Nutzer-Shop",
  subtitle: "Kaufe mit Lernpunkten Avatare, Titel, Rahmen und Profilhintergründe, Zubehör für deine Haustiere und besondere Gebäude für deine Stadt. Wir erweitern das Angebot laufend.",
  loginRequired: "Zum Kaufen musst du angemeldet sein. Stöbern kannst du schon jetzt.",
  login: "Anmelden",
  unavailable: "Der Shop konnte gerade nicht geladen werden. Versuch es gleich noch einmal.",
  loading: "Shop wird geladen…",
  yourPoints: "Deine Punkte",
  howToEarn: "Punkte bekommst du in Kursen, Spielen und Escape Rooms.",
  learn: "Zum Lernen",
  tabAll: "Alle",
  tabs: { avatar: "Avatare", title: "Titel", frame: "Rahmen", banner: "Profilhintergründe", pet: "Für Haustiere", city: "Für die Stadt" },
  hints: {
    avatar: "Ein neues Gesicht für dein Profil.",
    title: "Erscheint unter deinem Namen.",
    frame: "Ein Rahmen um deinen Avatar.",
    banner: "Der Hintergrund deiner Profilkarte.",
    pet: "Zubehör, das dein Haustier trägt.",
    city: "Ein besonderes Gebäude für deine Stadt.",
  },
  buy: "Kaufen",
  owned: "Im Besitz",
  equip: "Anlegen",
  equipped: "Angelegt",
  unequip: "Ablegen",
  useInPets: "Bei Haustieren nutzen",
  useInCity: "In der Stadt bauen",
  needPoints: "Es fehlen {n} Punkte",
  bought: "Gekauft: {name}",
  tagNew: "Neu",
  tagPopular: "Beliebt",
  errors: {
    owned: "Das besitzt du schon.",
    "not-enough-points": "Nicht genug Lernpunkte.",
    "login-required": "Zum Kaufen anmelden.",
    "unknown-item": "Diesen Artikel gibt es nicht.",
    unavailable: "Der Shop konnte gerade nicht geladen werden. Versuch es gleich noch einmal.",
    generic: "Etwas ist schiefgegangen. Versuch es erneut.",
    locked: "Das hast du noch nicht freigeschaltet.",
  },
};

const ru: ShopText = {
  title: "Магазин игроков",
  subtitle: "За баллы за учёбу здесь можно купить аватары, звания, рамки и фоны профиля, аксессуары для питомцев и особые здания для города. Мы постоянно добавляем новое.",
  loginRequired: "Покупать можно после входа. Смотреть ассортимент можно уже сейчас.",
  login: "Войти",
  unavailable: "Магазин сейчас не загрузился. Попробуй чуть позже.",
  loading: "Загружаю магазин…",
  yourPoints: "Твои баллы",
  howToEarn: "Баллы можно получить в курсах, играх и квестах.",
  learn: "Учиться",
  tabAll: "Всё",
  tabs: { avatar: "Аватары", title: "Звания", frame: "Рамки", banner: "Фоны профиля", pet: "Для питомцев", city: "Для города" },
  hints: {
    avatar: "Новое лицо для твоего профиля.",
    title: "Показывается под твоим именем.",
    frame: "Рамка вокруг аватара.",
    banner: "Фон карточки профиля.",
    pet: "Аксессуар, который носит питомец.",
    city: "Особое здание, которое можно построить в городе.",
  },
  buy: "Купить",
  owned: "Куплено",
  equip: "Надеть",
  equipped: "Надето",
  unequip: "Снять",
  useInPets: "Использовать у питомцев",
  useInCity: "Построить в городе",
  needPoints: "Не хватает {n} баллов",
  bought: "Куплено: {name}",
  tagNew: "Новинка",
  tagPopular: "Популярное",
  errors: {
    owned: "Это у тебя уже есть.",
    "not-enough-points": "Не хватает баллов за учёбу.",
    "login-required": "Чтобы купить, войди.",
    "unknown-item": "Такого товара нет в магазине.",
    unavailable: "Магазин сейчас не удалось загрузить. Попробуй чуть позже.",
    generic: "Что-то пошло не так. Попробуй снова.",
    locked: "Это у тебя ещё не открыто.",
  },
};

const texts: Record<Locale, ShopText> = { cs, en, de, ru };

export function getShopText(locale: Locale): ShopText {
  return texts[locale];
}
