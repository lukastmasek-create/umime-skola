import { tr8 } from "./config";
import type { Locale } from "./config";
import type { GameKey, MetricId } from "@/lib/idle/hub";

type L4 = Record<Locale, string>;
const n = (cs: string, en: string, de: string, ru: string, uk?: string, ja?: string, es?: string, fr?: string): L4 =>
  tr8(cs, en, de, ru, uk, ja, es, fr);

export const HUB_TEXT = {
  title: n("Úkoly a úspěchy", "Quests and achievements", "Aufgaben und Erfolge", "Задания и достижения", "Завдання та досягнення", "クエストと実績", "Misiones y logros", "Quêtes et succès"),
  daily: n("Denní úkoly", "Daily quests", "Tägliche Aufgaben", "Задания на день", "Щоденні завдання", "デイリークエスト", "Misiones diarias", "Quêtes quotidiennes"),
  dailyHint: n("Nové úkoly se objeví každý den. Odměnou jsou body.", "New quests appear every day. You get points as a reward.", "Jeden Tag gibt es neue Aufgaben. Als Belohnung gibt es Punkte.", "Каждый день появляются новые задания. Награда: очки.", "Нові завдання з'являтимуться щодня. Нагорода — бали.", "毎日新しいクエストが登場します。ごほうびはポイントです。", "Cada día aparecen misiones nuevas. La recompensa son puntos.", "De nouvelles quêtes apparaissent chaque jour. La récompense : des points."),
  achievements: n("Úspěchy", "Achievements", "Erfolge", "Достижения", "Досягнення", "実績", "Logros", "Succès"),
  claim: n("Vybrat", "Claim", "Abholen", "Забрать", "Забрати", "受け取る", "Recoger", "Récupérer"),
  claimed: n("Vybráno", "Claimed", "Abgeholt", "Получено", "Отримано", "受け取り済み", "Recogido", "Récupéré"),
  points: n("bodů", "points", "Punkte", "очков", "балів", "ポイント", "puntos", "points"),
  loginHint: n("Přihlas se, ať se ti úkoly a úspěchy počítají.", "Sign in so your quests and achievements count.", "Melde dich an, damit deine Aufgaben und Erfolge zählen.", "Войди, чтобы задания и достижения засчитывались.", "Увійди, щоб твої завдання та досягнення зараховувалися.", "ログインすると、クエストと実績が記録されます。", "Inicia sesión para que tus misiones y logros cuenten.", "Connecte-toi pour que tes quêtes et succès comptent."),
  login: n("Přihlásit se", "Sign in", "Anmelden", "Войти", "Увійти", "ログイン", "Iniciar sesión", "Se connecter"),
  error: n("Něco se nepovedlo, zkus to znovu.", "Something went wrong, try again.", "Etwas ist schiefgelaufen, versuche es noch einmal.", "Что-то пошло не так, попробуй ещё раз.", "Щось пішло не так, спробуй ще раз.", "問題が発生しました。もう一度お試しください。", "Algo salió mal, inténtalo de nuevo.", "Un problème est survenu, réessaie."),
  got: n("Získal jsi {n} bodů!", "You got {n} points!", "Du hast {n} Punkte bekommen!", "Ты получил {n} очков!", "Ти отримав {n} балів!", "{n} ポイントを獲得しました！", "¡Has ganado {n} puntos!", "Tu as gagné {n} points !"),
  weekly: n("Týdenní cíle", "Weekly goals", "Wochenziele", "Цели недели", "Тижневі цілі", "週間目標", "Objetivos semanales", "Objectifs de la semaine"),
  weeklyHint: n("Nové cíle každé pondělí. Větší úkoly, větší odměna.", "New goals every Monday. Bigger tasks, bigger rewards.", "Jeden Montag gibt es neue Ziele. Größere Aufgaben, größere Belohnung.", "Новые цели каждый понедельник. Задания больше, награда больше.", "Нові цілі щопонеділка. Більші завдання — більша нагорода.", "毎週月曜日に新しい目標。大きな課題、大きなごほうび。", "Objetivos nuevos cada lunes. Tareas más grandes, recompensas más grandes.", "De nouveaux objectifs chaque lundi. Des tâches plus grandes, des récompenses plus grosses."),
  showAll: n("Zobrazit všechny", "Show all", "Alle anzeigen", "Показать все", "Показати всі", "すべて表示", "Mostrar todas", "Tout afficher"),
  showLess: n("Zobrazit méně", "Show less", "Weniger anzeigen", "Показать меньше", "Показати менше", "表示を減らす", "Mostrar menos", "Afficher moins"),
} satisfies Record<string, L4>;

export const GAME_LABEL: Record<GameKey, L4> = {
  base: n("Základna", "Base", "Basis", "База", "База", "基地", "Base", "Base"),
  city: n("Město", "City", "Stadt", "Город", "Місто", "都市", "Ciudad", "Ville"),
  farm: n("Farma", "Farm", "Farm", "Ферма", "Ферма", "農場", "Granja", "Ferme"),
  pets: n("Mazlíčci", "Pets", "Haustiere", "Питомцы", "Улюбленці", "ペット", "Mascotas", "Animaux"),
  learn: n("Učení", "Learning", "Lernen", "Учёба", "Навчання", "学習", "Aprendizaje", "Apprentissage"),
};

export const GAME_ICON: Record<GameKey, string> = { base: "🚀", city: "🏙️", farm: "🌾", pets: "🐾", learn: "📚" };

// Šablony úspěchů, {n} se nahradí cílem.
export const ACHIEVEMENT_TEXT: Record<MetricId, L4> = {
  baseModules: n("Postav {n} modulů na Základně", "Build {n} modules on the Base", "Baue {n} Module auf der Basis", "Построй {n} модулей на Базе", "Побудуй {n} модулів на Базі", "基地に{n}個のモジュールを建てる", "Construye {n} módulos en la Base", "Construis {n} modules sur la Base"),
  baseEarned: n("Vydělej {n} kreditů na Základně", "Earn {n} credits on the Base", "Verdiene {n} Credits auf der Basis", "Заработай {n} кредитов на Базе", "Заробити {n} кредитів на Базі", "基地で{n}クレジットを稼ぐ", "Gana {n} créditos en la Base", "Gagne {n} crédits sur la Base"),
  baseShips: n("Vlastni {n} lodí", "Own {n} ships", "Besitze {n} Schiffe", "Владей {n} кораблями", "Май {n} кораблів", "{n}隻の船を所有する", "Ten {n} naves", "Possède {n} vaisseaux"),
  baseResearch: n("Vyzkoumej {n} technologií", "Research {n} technologies", "Erforsche {n} Technologien", "Изучи {n} технологий", "Дослідь {n} технологій", "{n}個の技術を研究する", "Investiga {n} tecnologías", "Recherche {n} technologies"),
  cityBuildings: n("Postav ve městě {n} budov", "Build {n} buildings in the city", "Baue {n} Gebäude in der Stadt", "Построй в городе {n} зданий", "Побудуй у місті {n} будівель", "都市に{n}棟の建物を建てる", "Construye {n} edificios en la ciudad", "Construis {n} bâtiments dans la ville"),
  cityEarned: n("Vydělej ve městě {n} mincí", "Earn {n} coins in the city", "Verdiene {n} Münzen in der Stadt", "Заработай в городе {n} монет", "Заробити в місті {n} монет", "都市で{n}コインを稼ぐ", "Gana {n} monedas en la ciudad", "Gagne {n} pièces dans la ville"),
  farmLevel: n("Dosáhni na farmě úrovně {n}", "Reach farm level {n}", "Erreiche Farm-Stufe {n}", "Достигни уровня фермы {n}", "Досягни на фермі рівня {n}", "農場でレベル{n}に到達する", "Alcanza el nivel {n} en la granja", "Atteins le niveau {n} à la ferme"),
  farmOrders: n("Splň {n} zakázek", "Complete {n} orders", "Erfülle {n} Aufträge", "Выполни {n} заказов", "Виконай {n} замовлень", "{n}件の注文を達成する", "Completa {n} pedidos", "Réalise {n} commandes"),
  farmEarned: n("Vydělej na farmě {n} mincí", "Earn {n} coins on the farm", "Verdiene {n} Münzen auf der Farm", "Заработай на ферме {n} монет", "Заробити на фермі {n} монет", "農場で{n}コインを稼ぐ", "Gana {n} monedas en la granja", "Gagne {n} pièces à la ferme"),
  petsOwned: n("Získej {n} mazlíčků", "Get {n} pets", "Hole dir {n} Haustiere", "Заведи {n} питомцев", "Заведи {n} улюбленців", "{n}匹のペットを手に入れる", "Consigue {n} mascotas", "Obtiens {n} animaux"),
  petLevel: n("Vychovej mazlíčka na úroveň {n}", "Raise a pet to level {n}", "Ziehe ein Haustier auf Stufe {n}", "Вырасти питомца до уровня {n}", "Виховай улюбленця до рівня {n}", "ペットをレベル{n}に育てる", "Cría una mascota hasta el nivel {n}", "Fais monter un animal au niveau {n}"),
  petsEarned: n("Vydělej s mazlíčky {n} mincí", "Earn {n} coins with pets", "Verdiene {n} Münzen mit Haustieren", "Заработай с питомцами {n} монет", "Заробити з улюбленцями {n} монет", "ペットで{n}コインを稼ぐ", "Gana {n} monedas con las mascotas", "Gagne {n} pièces avec les animaux"),
  learnXp: n("Získej učením celkem {n} XP", "Earn {n} XP from learning in total", "Sammle insgesamt {n} XP durch Lernen", "Набери за учёбу {n} XP", "Набери навчанням загалом {n} XP", "学習で合計{n} XPを獲得する", "Consigue un total de {n} XP estudiando", "Gagne {n} XP au total en apprenant"),
  learnXpToday: n("", "", "", ""),
  learnXpWeek: n("", "", "", ""),
};

// Šablony denních úkolů (id úkolu = klíč).
export const DAILY_TEXT: Record<string, L4> = {
  learnXpToday: n("Získej dnes {n} XP učením", "Earn {n} XP from learning today", "Sammle heute {n} XP durch Lernen", "Набери сегодня {n} XP за учёбу", "Набери сьогодні {n} XP навчанням", "今日学習で{n} XPを獲得する", "Consigue {n} XP estudiando hoy", "Gagne {n} XP en apprenant aujourd'hui"),
  farmEarned: n("Vydělej dnes na farmě {n} mincí", "Earn {n} coins on the farm today", "Verdiene heute {n} Münzen auf der Farm", "Заработай сегодня на ферме {n} монет", "Заробити сьогодні на фермі {n} монет", "今日農場で{n}コインを稼ぐ", "Gana hoy {n} monedas en la granja", "Gagne {n} pièces à la ferme aujourd'hui"),
  cityEarned: n("Vydělej dnes ve městě {n} mincí", "Earn {n} coins in the city today", "Verdiene heute {n} Münzen in der Stadt", "Заработай сегодня в городе {n} монет", "Заробити сьогодні в місті {n} монет", "今日都市で{n}コインを稼ぐ", "Gana hoy {n} monedas en la ciudad", "Gagne {n} pièces dans la ville aujourd'hui"),
  baseEarned: n("Vydělej dnes na Základně {n} kreditů", "Earn {n} credits on the Base today", "Verdiene heute {n} Credits auf der Basis", "Заработай сегодня на Базе {n} кредитов", "Заробити сьогодні на Базі {n} кредитів", "今日基地で{n}クレジットを稼ぐ", "Gana hoy {n} créditos en la Base", "Gagne {n} crédits sur la Base aujourd'hui"),
  petsEarned: n("Vydělej dnes s mazlíčky {n} mincí", "Earn {n} coins with pets today", "Verdiene heute {n} Münzen mit Haustieren", "Заработай сегодня с питомцами {n} монет", "Заробити сьогодні з улюбленцями {n} монет", "今日ペットで{n}コインを稼ぐ", "Gana hoy {n} monedas con las mascotas", "Gagne {n} pièces avec les animaux aujourd'hui"),
  farmOrders: n("Splň dnes {n} zakázky na farmě", "Complete {n} farm orders today", "Erfülle heute {n} Farm-Aufträge", "Выполни сегодня {n} заказа на ферме", "Виконай сьогодні {n} замовлення на фермі", "今日農場で{n}件の注文を達成する", "Completa hoy {n} pedidos en la granja", "Réalise {n} commandes à la ferme aujourd'hui"),
  cityBuildings: n("Postav dnes ve městě {n} budovy", "Build {n} buildings in the city today", "Baue heute {n} Gebäude in der Stadt", "Построй сегодня в городе {n} здания", "Побудуй сьогодні в місті {n} будівлі", "今日都市に{n}棟の建物を建てる", "Construye hoy {n} edificios en la ciudad", "Construis {n} bâtiments dans la ville aujourd'hui"),
};

// Týdenní cíle: stejné šablony jako denní, jen s „týdně“ (id začíná „w:“).
export const WEEKLY_TEXT: Record<string, L4> = {
  "w:learnXpWeek": n("Získej tento týden {n} XP učením", "Earn {n} XP from learning this week", "Sammle diese Woche {n} XP durch Lernen", "Набери на этой неделе {n} XP за учёбу", "Набери цього тижня {n} XP навчанням", "今週学習で{n} XPを獲得する", "Consigue {n} XP estudiando esta semana", "Gagne {n} XP en apprenant cette semaine"),
  "w:farmEarned": n("Vydělej tento týden na farmě {n} mincí", "Earn {n} coins on the farm this week", "Verdiene diese Woche {n} Münzen auf der Farm", "Заработай на этой неделе на ферме {n} монет", "Заробити цього тижня на фермі {n} монет", "今週農場で{n}コインを稼ぐ", "Gana {n} monedas en la granja esta semana", "Gagne {n} pièces à la ferme cette semaine"),
  "w:cityEarned": n("Vydělej tento týden ve městě {n} mincí", "Earn {n} coins in the city this week", "Verdiene diese Woche {n} Münzen in der Stadt", "Заработай на этой неделе в городе {n} монет", "Заробити цього тижня в місті {n} монет", "今週都市で{n}コインを稼ぐ", "Gana {n} monedas en la ciudad esta semana", "Gagne {n} pièces dans la ville cette semaine"),
  "w:baseEarned": n("Vydělej tento týden na Základně {n} kreditů", "Earn {n} credits on the Base this week", "Verdiene diese Woche {n} Credits auf der Basis", "Заработай на этой неделе на Базе {n} кредитов", "Заробити цього тижня на Базі {n} кредитів", "今週基地で{n}クレジットを稼ぐ", "Gana {n} créditos en la Base esta semana", "Gagne {n} crédits sur la Base cette semaine"),
  "w:petsEarned": n("Vydělej tento týden s mazlíčky {n} mincí", "Earn {n} coins with pets this week", "Verdiene diese Woche {n} Münzen mit Haustieren", "Заработай на этой неделе с питомцами {n} монет", "Заробити цього тижня з улюбленцями {n} монет", "今週ペットで{n}コインを稼ぐ", "Gana {n} monedas con las mascotas esta semana", "Gagne {n} pièces avec les animaux cette semaine"),
  "w:farmOrders": n("Splň tento týden {n} zakázek na farmě", "Complete {n} farm orders this week", "Erfülle diese Woche {n} Farm-Aufträge", "Выполни на этой неделе {n} заказов на ферме", "Виконай цього тижня {n} замовлень на фермі", "今週農場で{n}件の注文を達成する", "Completa {n} pedidos en la granja esta semana", "Réalise {n} commandes à la ferme cette semaine"),
  "w:cityBuildings": n("Postav tento týden ve městě {n} budov", "Build {n} buildings in the city this week", "Baue diese Woche {n} Gebäude in der Stadt", "Построй на этой неделе в городе {n} зданий", "Побудуй цього тижня в місті {n} будівель", "今週都市に{n}棟の建物を建てる", "Construye {n} edificios en la ciudad esta semana", "Construis {n} bâtiments dans la ville cette semaine"),
};

export function tr(text: L4, locale: Locale): string {
  return text[locale] ?? text.cs;
}

export function fill(text: string, values: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (_, k: string) => String(values[k] ?? ""));
}
