import type { Locale } from "./config";

export type ProfileText = {
  nav: string;
  title: string;
  level: string;
  xp: string;
  toNext: string;
  points: string;
  school: string;
  noSchool: string;
  chooseSchool: string;
  avatars: string;
  avatarsHint: string;
  unlockAtLevel: string;
  event: string;
  eventHint: string;
  selected: string;
  choose: string;
  error: string;
  loginRequired: string;
  degraded: string;
  anonymous: string;
  xpGained: string;
  titles: string;
  titlesHint: string;
  noTitle: string;
  fullProfile: string;
  settings: string;
  logout: string;
  totalXp: string;
  unlockedCount: string;
  locked: string;
  frames: string;
  framesHint: string;
  banners: string;
  bannersHint: string;
  none: string;
  shop: string;
  inShop: string;
  stats: string;
};

const cs: ProfileText = {
  nav: "Profil",
  title: "Můj profil",
  level: "Úroveň",
  xp: "XP",
  toNext: "Do další úrovně zbývá {n} XP",
  points: "Body",
  school: "Škola",
  noSchool: "Zatím bez školy",
  chooseSchool: "Vybrat školu",
  avatars: "Avatary",
  avatarsHint: "Žádné fotky. Avatary se odemykají úrovní a později i speciálními událostmi.",
  unlockAtLevel: "Úroveň {n}",
  event: "Událost",
  eventHint: "Speciální událost",
  selected: "Vybráno",
  choose: "Vybrat",
  error: "Avatar se nepodařilo změnit.",
  loginRequired: "Pro profil se musíš přihlásit.",
  degraded: "Data profilu se teď nepodařilo načíst. Úroveň a body se ukážou, až to půjde.",
  anonymous: "Hráč",
  xpGained: "+{n} XP",
  titles: "Tituly",
  titlesHint: "Titul se ukáže pod tvým jménem. Odemykají se úrovněmi a úspěchy.",
  noTitle: "Bez titulu",
  fullProfile: "Celý profil",
  settings: "Nastavení",
  logout: "Odhlásit se",
  totalXp: "XP celkem",
  unlockedCount: "Odemčeno",
  locked: "Zamčeno",
  frames: "Rámečky",
  framesHint: "Rámeček se ukáže kolem tvého avataru. Kupují se v obchodě.",
  banners: "Pozadí",
  bannersHint: "Pozadí tvé profilové karty. Kupují se v obchodě.",
  none: "Žádný",
  shop: "Obchod",
  inShop: "V obchodě",
  stats: "Přehled",
};

const en: ProfileText = {
  nav: "Profile",
  title: "My profile",
  level: "Level",
  xp: "XP",
  toNext: "{n} XP to the next level",
  points: "Points",
  school: "School",
  noSchool: "No school yet",
  chooseSchool: "Pick a school",
  avatars: "Avatars",
  avatarsHint: "No photos. Avatars unlock with levels and, later, special events.",
  unlockAtLevel: "Level {n}",
  event: "Event",
  eventHint: "Special event",
  selected: "Selected",
  choose: "Select",
  error: "Couldn't change the avatar.",
  loginRequired: "You need to log in to see your profile.",
  degraded: "Profile data couldn't be loaded right now. Level and points will show once it works.",
  anonymous: "Player",
  xpGained: "+{n} XP",
  titles: "Titles",
  titlesHint: "A title shows under your name. They unlock with levels and achievements.",
  noTitle: "No title",
  fullProfile: "Full profile",
  settings: "Settings",
  logout: "Log out",
  totalXp: "Total XP",
  unlockedCount: "Unlocked",
  locked: "Locked",
  frames: "Frames",
  framesHint: "A frame shows around your avatar. Buy them in the shop.",
  banners: "Backgrounds",
  bannersHint: "The background of your profile card. Buy them in the shop.",
  none: "None",
  shop: "Shop",
  inShop: "In the shop",
  stats: "Overview",
};

const de: ProfileText = {
  nav: "Profil",
  title: "Mein Profil",
  level: "Level",
  xp: "XP",
  toNext: "Noch {n} XP bis zum nächsten Level",
  points: "Punkte",
  school: "Schule",
  noSchool: "Noch keine Schule",
  chooseSchool: "Schule wählen",
  avatars: "Avatare",
  avatarsHint: "Keine Fotos. Avatare werden durch Level und später durch besondere Events freigeschaltet.",
  unlockAtLevel: "Level {n}",
  event: "Event",
  eventHint: "Besonderes Event",
  selected: "Ausgewählt",
  choose: "Wählen",
  error: "Der Avatar konnte nicht geändert werden.",
  loginRequired: "Für dein Profil musst du dich anmelden.",
  degraded: "Die Profildaten konnten gerade nicht geladen werden. Level und Punkte erscheinen, sobald es klappt.",
  anonymous: "Spieler",
  xpGained: "+{n} XP",
  titles: "Titel",
  titlesHint: "Ein Titel erscheint unter deinem Namen. Sie werden durch Level und Erfolge freigeschaltet.",
  noTitle: "Kein Titel",
  fullProfile: "Ganzes Profil",
  settings: "Einstellungen",
  logout: "Abmelden",
  totalXp: "XP gesamt",
  unlockedCount: "Freigeschaltet",
  locked: "Gesperrt",
  frames: "Rahmen",
  framesHint: "Ein Rahmen erscheint um deinen Avatar. Im Shop erhältlich.",
  banners: "Hintergründe",
  bannersHint: "Der Hintergrund deiner Profilkarte. Im Shop erhältlich.",
  none: "Keiner",
  shop: "Shop",
  inShop: "Im Shop",
  stats: "Überblick",
};

const ru: ProfileText = {
  nav: "Профиль",
  title: "Мой профиль",
  level: "Уровень",
  xp: "XP",
  toNext: "До следующего уровня осталось {n} XP",
  points: "Баллы",
  school: "Школа",
  noSchool: "Школа не выбрана",
  chooseSchool: "Выбрать школу",
  avatars: "Аватары",
  avatarsHint: "Без фото. Аватары открываются уровнями, а позже и особыми событиями.",
  unlockAtLevel: "Уровень {n}",
  event: "Событие",
  eventHint: "Особое событие",
  selected: "Выбрано",
  choose: "Выбрать",
  error: "Не удалось сменить аватар.",
  loginRequired: "Чтобы увидеть профиль, нужно войти.",
  degraded: "Не удалось загрузить данные профиля. Уровень и баллы появятся, когда получится.",
  anonymous: "Игрок",
  xpGained: "+{n} XP",
  titles: "Звания",
  titlesHint: "Звание отображается под твоим именем. Они открываются уровнями и достижениями.",
  noTitle: "Без звания",
  fullProfile: "Весь профиль",
  settings: "Настройки",
  logout: "Выйти",
  totalXp: "Всего XP",
  unlockedCount: "Открыто",
  locked: "Закрыто",
  frames: "Рамки",
  framesHint: "Рамка отображается вокруг аватара. Покупаются в магазине.",
  banners: "Фоны",
  bannersHint: "Фон карточки профиля. Покупаются в магазине.",
  none: "Нет",
  shop: "Магазин",
  inShop: "В магазине",
  stats: "Обзор",
};

const texts: Record<Locale, ProfileText> = { cs, en, de, ru };

export function getProfileText(locale: Locale): ProfileText {
  return texts[locale];
}

export function fill(template: string, n: number | string): string {
  return template.replace("{n}", String(n));
}
