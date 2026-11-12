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

const TEXT: Record<Locale, ProfileHeroText> = {
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
  uk: {
    editProfile: "Редагувати профіль",
    myTeam: "Моя команда",
    joinTeam: "Створити / приєднатися до команди",
    statPoints: "Бали",
    statRank: "Місце",
    statPlayers: "Гравців",
    xpToNext: "{n} XP до наступного рівня",
    recent: "Останні відкриття",
    recentHint: "Що ти відкрив востаннє.",
    noRecent: "Поки нічого нового. Відкривай речі в магазині або під час крафту.",
    favorites: "Обране",
    favHint: "Речі, які ти позначив зірочкою.",
    noFavorites: "Поки нічого не позначено. Постав зірочку на речі в колекції, і вона з'явиться тут.",
    wornNow: "Що я зараз ношу",
    editLook: "Змінити вигляд",
    noWorn: "Нічого не одягнено",
  },
  ja: {
    editProfile: "プロフィールを編集",
    myTeam: "マイチーム",
    joinTeam: "チームを作成 / 参加",
    statPoints: "ポイント",
    statRank: "順位",
    statPlayers: "プレイヤー数",
    xpToNext: "次のレベルまであと {n} XP",
    recent: "最近の解放",
    recentHint: "最近解放したアイテムです。",
    noRecent: "まだ新しい解放はありません。ショップやクラフトでアイテムを解放しましょう。",
    favorites: "お気に入り",
    favHint: "星をつけたアイテムです。",
    noFavorites: "まだ星をつけたアイテムはありません。コレクションでアイテムに星をつけると、ここに表示されます。",
    wornNow: "今身につけているもの",
    editLook: "見た目を変更",
    noWorn: "装備なし",
  },
  es: {
    editProfile: "Editar perfil",
    myTeam: "Mi equipo",
    joinTeam: "Crear / unirse a un equipo",
    statPoints: "Puntos",
    statRank: "Puesto",
    statPlayers: "Jugadores",
    xpToNext: "{n} XP para el siguiente nivel",
    recent: "Últimos desbloqueos",
    recentHint: "Lo último que has desbloqueado.",
    noRecent: "Todavía nada nuevo. Desbloquea cosas en la tienda o en la artesanía.",
    favorites: "Favoritos",
    favHint: "Objetos que has marcado con una estrella.",
    noFavorites: "Todavía nada marcado. Marca un objeto con una estrella en tu colección para verlo aquí.",
    wornNow: "Lo que llevo puesto",
    editLook: "Editar aspecto",
    noWorn: "No llevas nada puesto",
  },
  fr: {
    editProfile: "Modifier le profil",
    myTeam: "Mon équipe",
    joinTeam: "Créer / rejoindre une équipe",
    statPoints: "Points",
    statRank: "Rang",
    statPlayers: "Joueurs",
    xpToNext: "{n} XP avant le niveau suivant",
    recent: "Derniers déblocages",
    recentHint: "Ce que tu as débloqué récemment.",
    noRecent: "Rien de neuf pour l'instant. Débloque des objets dans la boutique ou en artisanat.",
    favorites: "Favoris",
    favHint: "Les objets que tu as marqués d'une étoile.",
    noFavorites: "Rien de marqué pour l'instant. Marque un objet d'une étoile dans ta collection pour l'épingler ici.",
    wornNow: "Ce que je porte maintenant",
    editLook: "Modifier l'apparence",
    noWorn: "Rien d'équipé",
  },
};

export function getProfileHeroText(locale: Locale): ProfileHeroText {
  return TEXT[locale];
}
