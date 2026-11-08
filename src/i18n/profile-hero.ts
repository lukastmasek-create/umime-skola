import { withFallbacks } from "./config";
import type { Locale } from "./config";

// Hlavička profilu, karta XP, přehled (nejnovější odemčky, oblíbené) a sloučená Sbírka.
export type ProfileHeroText = {
  editProfile: string;
  myTeam: string;
  joinTeam: string;
  statPoints: string;
  statRank: string;
  statPlayers: string;
  xpToNext: string;
  recent: string;
  recentHint: string;
  noRecent: string;
  favorites: string;
  favHint: string;
  noFavorites: string;
  wornNow: string;
  editLook: string;
  noWorn: string;
};

const TEXT = withFallbacks<ProfileHeroText>({
  cs: {
    editProfile: "Upravit profil",
    myTeam: "Můj tým",
    joinTeam: "Založit / připojit tým",
    statPoints: "Body",
    statRank: "Pozice",
    statPlayers: "Hráčů",
    xpToNext: "{n} XP do dalšího levelu",
    recent: "Nejnovější odemčky",
    recentHint: "Co jsi naposledy odemkl.",
    noRecent: "Zatím nic nového. Odemkneš věci v obchodě nebo v craftování.",
    favorites: "Oblíbené",
    favHint: "Věci, které sis připnul hvězdičkou.",
    noFavorites: "Zatím nic připnutého. Hvězdičkou ve sbírce přidáš položku sem.",
    wornNow: "Co mám teď na sobě",
    editLook: "Upravit vzhled",
    noWorn: "Nic nenasazeno",
  },
  en: {
    editProfile: "Edit profile",
    myTeam: "My team",
    joinTeam: "Create / join a team",
    statPoints: "Points",
    statRank: "Rank",
    statPlayers: "Players",
    xpToNext: "{n} XP to the next level",
    recent: "Latest unlocks",
    recentHint: "What you unlocked most recently.",
    noRecent: "Nothing new yet. Unlock items in the shop or in crafting.",
    favorites: "Favourites",
    favHint: "Items you starred.",
    noFavorites: "Nothing starred yet. Star an item in your collection to pin it here.",
    wornNow: "What I'm wearing now",
    editLook: "Edit look",
    noWorn: "Nothing equipped",
  },
  de: {
    editProfile: "Profil bearbeiten",
    myTeam: "Mein Team",
    joinTeam: "Team gründen / beitreten",
    statPoints: "Punkte",
    statRank: "Platz",
    statPlayers: "Spieler",
    xpToNext: "{n} XP bis zum nächsten Level",
    recent: "Neueste Freischaltungen",
    recentHint: "Was du zuletzt freigeschaltet hast.",
    noRecent: "Noch nichts Neues. Schalte Dinge im Shop oder beim Basteln frei.",
    favorites: "Favoriten",
    favHint: "Dinge, die du mit einem Stern markiert hast.",
    noFavorites: "Noch nichts markiert. Markiere in der Sammlung einen Stern, um ihn hier anzuheften.",
    wornNow: "Was ich gerade trage",
    editLook: "Look bearbeiten",
    noWorn: "Nichts angelegt",
  },
  ru: {
    editProfile: "Редактировать профиль",
    myTeam: "Моя команда",
    joinTeam: "Создать / вступить в команду",
    statPoints: "Очки",
    statRank: "Место",
    statPlayers: "Игроков",
    xpToNext: "{n} XP до следующего уровня",
    recent: "Последние открытые",
    recentHint: "Что ты открыл недавно.",
    noRecent: "Пока ничего нового. Открывай предметы в магазине или в крафте.",
    favorites: "Избранное",
    favHint: "Предметы, которые ты отметил звёздочкой.",
    noFavorites: "Пока ничего не отмечено. Отметь предмет звёздочкой в коллекции, и он появится здесь.",
    wornNow: "Что я сейчас ношу",
    editLook: "Изменить внешний вид",
    noWorn: "Ничего не надето",
  },
});

export function getProfileHeroText(locale: Locale): ProfileHeroText {
  return TEXT[locale];
}
