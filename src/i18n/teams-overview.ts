import { withFallbacks } from "./config";
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

const all = withFallbacks({ cs, en, de: en, ru: en });

export function getTeamsOverviewText(locale: Locale): TeamsOverviewText {
  return all[locale];
}
