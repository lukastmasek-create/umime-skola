// Texty přehledu týmů ve stylu dashboardu (asistent, produktivita, rozvrh termínů).
// Zatím česky a anglicky, ostatní jazyky se vracejí k angličtině.
import type { Locale } from "./config";

const cs = {
  navDashboard: "Přehled", navSchedule: "Rozvrh", navCourses: "Kurzy", navTeams: "Týmy", navRating: "Žebříčky", navTeachers: "Učitelé",
  aiTitle: "AI asistent", aiToday: "Dnes", aiPh: "Napiš odpověď…", aiSend: "Odeslat",
  aiMorning: "Dobré ráno, jsi připravený na hodinu?", aiDay: "Dobrý den, jsi připravený na hodinu?", aiEve: "Dobrý večer, pojďme se podívat, co tě čeká.",
  aiNext: "Nejbližší termín: {0} ({1}).", aiNone: "Žádný blížící se termín, máš volno.", aiOpen: "Máš {0} nesplněných zadání.",
  aiOverdue: "Z toho {0} po termínu.", aiTeams: "Jsi v {0} týmech.", aiNoTeams: "Zatím nejsi v žádném týmu. Založ si ho nebo se připoj kódem.",
  aiThinking: "Přemýšlím…", aiHelp: "Zeptej se mě na termíny, zadání nebo týmy.", aiQ1: "Nejbližší termín", aiQ2: "Nesplněná zadání", aiQ3: "Moje týmy",
  proTitle: "Přejít na PRO", proText: "Neomezený přístup ke všem kurzům, podpoře a dalším funkcím!", proTag: "PRO",
  prodTitle: "Produktivita", prodTasks: "Zadání", prodTeams: "Týmy", prodRate: "Splněno", prodAssigned: "Zadáno", prodDone: "Splněno", prodEmpty: "Zatím tu nejsou žádná zadání.",
  progSub: "Celkový postup v týmech", progInProgress: "Probíhá", progUpcoming: "Blíží se", progDone: "Splněno",
  groupTitle: "Naléhavé úkoly", prioHigh: "Vysoká", prioLow: "Nízká",
  pointsTitle: "Splněno po týmech",
  schTitle: "Termíny a zadání", schFilter: "Filtr", schAll: "Všechny týmy", schWeek: "Týden", schMonth: "Měsíc", schNone: "Žádný termín",
  schDone: "Hotovo", schPlanned: "Naplánováno", schPrev: "Předchozí", schNext: "Další", schToday: "Dnes",
} as const;
export type TeamsEdx = Record<keyof typeof cs, string>;

const en: TeamsEdx = {
  navDashboard: "Dashboard", navSchedule: "Schedule", navCourses: "Courses", navTeams: "Teams", navRating: "Rating", navTeachers: "Teachers",
  aiTitle: "AI assistant", aiToday: "Today", aiPh: "Write your answer…", aiSend: "Send",
  aiMorning: "Good morning, are you ready for class?", aiDay: "Good afternoon, are you ready for class?", aiEve: "Good evening, let's see what is coming up.",
  aiNext: "Next deadline: {0} ({1}).", aiNone: "No deadline coming up, you are free.", aiOpen: "You have {0} open assignments.",
  aiOverdue: "{0} of them are past due.", aiTeams: "You are in {0} teams.", aiNoTeams: "You are not in any team yet. Create one or join with a code.",
  aiThinking: "Thinking…", aiHelp: "Ask me about deadlines, assignments or teams.", aiQ1: "Next deadline", aiQ2: "Open assignments", aiQ3: "My teams",
  proTitle: "Upgrade to PRO", proText: "Enjoy unlimited access to all courses, support, and more!", proTag: "PRO",
  prodTitle: "Productivity", prodTasks: "Tasks", prodTeams: "Teams", prodRate: "Done", prodAssigned: "Assigned", prodDone: "Done", prodEmpty: "No assignments yet.",
  progSub: "Total progress across teams", progInProgress: "In progress", progUpcoming: "Upcoming", progDone: "Completed",
  groupTitle: "Urgent tasks", prioHigh: "High", prioLow: "Low",
  pointsTitle: "Completed per team",
  schTitle: "Deadlines & assignments", schFilter: "Filter", schAll: "All teams", schWeek: "Week", schMonth: "Month", schNone: "No deadline",
  schDone: "Done", schPlanned: "Planned", schPrev: "Previous", schNext: "Next", schToday: "Today",
};

const more: Partial<Record<Locale, TeamsEdx>> = { cs, en };
export const getTeamsEdx = (locale: Locale): TeamsEdx => more[locale] ?? en;
