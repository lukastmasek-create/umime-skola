import type { Locale } from "./config";

// Učitelský přehled na stránce Týmy: souhrn přes všechny týmy, kde je uživatel učitel.
export type TeamsOverviewText = {
  title: string;
  hello: string;
  loading: string;
  failed: string;
  empty: string;
  kpi: { students: string; done: string; avg: string; late: string; ofTotal: string; noAvg: string };
  table: { title: string; all: string; risk: string; student: string; team: string; progress: string; score: string; status: string; search: string };
  status: { ok: string; watch: string; risk: string };
  detail: { title: string; close: string; assignments: string; none: string; best: string; attempts: string; late: string; overdue: string; open: string };
  cell: { done: string; tried: string; viewed: string; new: string };
};

const cs: TeamsOverviewText = {
  title: "Přehled pro učitele",
  hello: "Souhrn tvých tříd",
  loading: "Načítám přehled…",
  failed: "Přehled se nepodařilo načíst.",
  empty: "Zatím tu nejsou žádní žáci ani zadání. Přehled se objeví, jakmile se žáci připojí a dostanou úkol.",
  kpi: { students: "Žáků celkem", done: "Splněná zadání", avg: "Průměrná úspěšnost", late: "Po termínu", ofTotal: "z {n} zadání", noAvg: "zatím bez pokusů" },
  table: { title: "Žáci a postup", all: "Všichni", risk: "Ohrožení", student: "Žák", team: "Tým", progress: "Postup", score: "Úspěšnost", status: "Stav", search: "Hledat žáka" },
  status: { ok: "V pořádku", watch: "Sleduj", risk: "Ohrožen" },
  detail: { title: "Detail žáka", close: "Zavřít", assignments: "Zadání", none: "Žák zatím nemá žádné zadání.", best: "nejlepší", attempts: "pokusů", late: "pozdě", overdue: "po termínu", open: "Otevřít tým" },
  cell: { done: "Splněno", tried: "Zkoušeno", viewed: "Zobrazeno", new: "Nové" },
};

const en: TeamsOverviewText = {
  title: "Teacher overview",
  hello: "Summary of your classes",
  loading: "Loading overview…",
  failed: "The overview could not be loaded.",
  empty: "No students or assignments yet. The overview appears once students join and get a task.",
  kpi: { students: "Students in total", done: "Completed assignments", avg: "Average score", late: "Past due", ofTotal: "of {n} assignments", noAvg: "no attempts yet" },
  table: { title: "Students and progress", all: "Everyone", risk: "At risk", student: "Student", team: "Team", progress: "Progress", score: "Score", status: "Status", search: "Search student" },
  status: { ok: "On track", watch: "Keep an eye", risk: "At risk" },
  detail: { title: "Student detail", close: "Close", assignments: "Assignments", none: "This student has no assignments yet.", best: "best", attempts: "attempts", late: "late", overdue: "past due", open: "Open team" },
  cell: { done: "Done", tried: "Tried", viewed: "Viewed", new: "New" },
};

const de: TeamsOverviewText = {
  title: "Übersicht für Lehrkräfte",
  hello: "Zusammenfassung deiner Klassen",
  loading: "Übersicht wird geladen…",
  failed: "Die Übersicht konnte nicht geladen werden.",
  empty: "Noch keine Schüler oder Aufgaben. Die Übersicht erscheint, sobald Schüler beitreten und eine Aufgabe bekommen.",
  kpi: { students: "Schüler insgesamt", done: "Erledigte Aufgaben", avg: "Durchschnittliche Erfolgsquote", late: "Überfällig", ofTotal: "von {n} Aufgaben", noAvg: "noch keine Versuche" },
  table: { title: "Schüler und Fortschritt", all: "Alle", risk: "Gefährdet", student: "Schüler/in", team: "Team", progress: "Fortschritt", score: "Erfolgsquote", status: "Status", search: "Schüler suchen" },
  status: { ok: "Auf Kurs", watch: "Beobachten", risk: "Gefährdet" },
  detail: { title: "Schülerdetails", close: "Schließen", assignments: "Aufgaben", none: "Dieser Schüler hat noch keine Aufgaben.", best: "bestes", attempts: "Versuche", late: "verspätet", overdue: "überfällig", open: "Team öffnen" },
  cell: { done: "Erledigt", tried: "Versucht", viewed: "Angesehen", new: "Neu" },
};

const ru: TeamsOverviewText = {
  title: "Обзор для учителя",
  hello: "Сводка по твоим классам",
  loading: "Загружаем обзор…",
  failed: "Не удалось загрузить обзор.",
  empty: "Пока нет учеников и заданий. Обзор появится, как только ученики присоединятся и получат задание.",
  kpi: { students: "Всего учеников", done: "Выполненные задания", avg: "Средний результат", late: "Просрочено", ofTotal: "из {n} заданий", noAvg: "попыток пока нет" },
  table: { title: "Ученики и прогресс", all: "Все", risk: "Под угрозой", student: "Ученик", team: "Команда", progress: "Прогресс", score: "Результат", status: "Статус", search: "Найти ученика" },
  status: { ok: "В порядке", watch: "Следить", risk: "Под угрозой" },
  detail: { title: "Карточка ученика", close: "Закрыть", assignments: "Задания", none: "У этого ученика пока нет заданий.", best: "лучший", attempts: "попыток", late: "поздно", overdue: "просрочено", open: "Открыть команду" },
  cell: { done: "Выполнено", tried: "Пробовали", viewed: "Просмотрено", new: "Новое" },
};

const uk: TeamsOverviewText = {
  title: "Огляд для вчителя",
  hello: "Підсумок твоїх класів",
  loading: "Завантажуємо огляд…",
  failed: "Не вдалося завантажити огляд.",
  empty: "Поки немає учнів і завдань. Огляд з'явиться, щойно учні приєднаються і отримають завдання.",
  kpi: { students: "Усього учнів", done: "Виконані завдання", avg: "Середній результат", late: "Після терміну", ofTotal: "з {n} завдань", noAvg: "спроб поки немає" },
  table: { title: "Учні та прогрес", all: "Усі", risk: "У зоні ризику", student: "Учень", team: "Команда", progress: "Прогрес", score: "Результат", status: "Стан", search: "Пошук учня" },
  status: { ok: "Усе добре", watch: "Стежити", risk: "У зоні ризику" },
  detail: { title: "Картка учня", close: "Закрити", assignments: "Завдання", none: "У цього учня ще немає завдань.", best: "найкращий", attempts: "спроб", late: "пізно", overdue: "після терміну", open: "Відкрити команду" },
  cell: { done: "Виконано", tried: "Спробовано", viewed: "Переглянуто", new: "Нове" },
};

const ja: TeamsOverviewText = {
  title: "先生向けの概要",
  hello: "クラスの概要",
  loading: "概要を読み込み中…",
  failed: "概要を読み込めませんでした。",
  empty: "まだ生徒も課題もありません。生徒が参加して課題を受け取ると、ここに概要が表示されます。",
  kpi: { students: "生徒数の合計", done: "完了した課題", avg: "平均正答率", late: "期限切れ", ofTotal: "課題 {n} 件中", noAvg: "まだ挑戦がありません" },
  table: { title: "生徒と進捗", all: "全員", risk: "要注意", student: "生徒", team: "チーム", progress: "進捗", score: "正答率", status: "状態", search: "生徒を検索" },
  status: { ok: "順調", watch: "要確認", risk: "要注意" },
  detail: { title: "生徒の詳細", close: "閉じる", assignments: "課題", none: "この生徒にはまだ課題がありません。", best: "最高", attempts: "回", late: "遅れ", overdue: "期限切れ", open: "チームを開く" },
  cell: { done: "完了", tried: "挑戦済み", viewed: "閲覧済み", new: "新規" },
};

const es: TeamsOverviewText = {
  title: "Resumen para profesores",
  hello: "Resumen de tus clases",
  loading: "Cargando resumen…",
  failed: "No se pudo cargar el resumen.",
  empty: "Todavía no hay alumnos ni tareas. El resumen aparecerá cuando los alumnos se unan y reciban una tarea.",
  kpi: { students: "Alumnos en total", done: "Tareas completadas", avg: "Acierto medio", late: "Fuera de plazo", ofTotal: "de {n} tareas", noAvg: "sin intentos todavía" },
  table: { title: "Alumnos y progreso", all: "Todos", risk: "En riesgo", student: "Alumno", team: "Equipo", progress: "Progreso", score: "Acierto", status: "Estado", search: "Buscar alumno" },
  status: { ok: "Al día", watch: "Vigilar", risk: "En riesgo" },
  detail: { title: "Detalle del alumno", close: "Cerrar", assignments: "Tareas", none: "Este alumno todavía no tiene tareas.", best: "mejor", attempts: "intentos", late: "tarde", overdue: "fuera de plazo", open: "Abrir equipo" },
  cell: { done: "Hecho", tried: "Probado", viewed: "Visto", new: "Nuevo" },
};

const fr: TeamsOverviewText = {
  title: "Vue d'ensemble enseignant",
  hello: "Résumé de tes classes",
  loading: "Chargement de la vue d'ensemble…",
  failed: "La vue d'ensemble n'a pas pu être chargée.",
  empty: "Aucun élève ni exercice pour l'instant. La vue apparaîtra dès que des élèves rejoindront une classe et recevront un exercice.",
  kpi: { students: "Élèves au total", done: "Exercices terminés", avg: "Réussite moyenne", late: "En retard", ofTotal: "sur {n} exercices", noAvg: "pas encore de tentatives" },
  table: { title: "Élèves et progression", all: "Tous", risk: "En difficulté", student: "Élève", team: "Équipe", progress: "Progression", score: "Réussite", status: "Statut", search: "Chercher un élève" },
  status: { ok: "Dans les temps", watch: "À surveiller", risk: "En difficulté" },
  detail: { title: "Détail de l'élève", close: "Fermer", assignments: "Exercices", none: "Cet élève n'a pas encore d'exercice.", best: "meilleur", attempts: "tentatives", late: "en retard", overdue: "en retard", open: "Ouvrir l'équipe" },
  cell: { done: "Fait", tried: "Essayé", viewed: "Consulté", new: "Nouveau" },
};

const all: Record<Locale, TeamsOverviewText> = { cs, en, de, ru, uk, ja, es, fr };

export function getTeamsOverviewText(locale: Locale): TeamsOverviewText {
  return all[locale];
}
