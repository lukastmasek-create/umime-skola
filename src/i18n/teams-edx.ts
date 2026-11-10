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
  stStudents: "Aktivní žáci", stTasks: "Zadání", stDoneOf: "Splněno {0} z {1}", stWaiting: "Čeká na splnění", stAvg: "Průměr nejlepších výsledků",
  listTitle: "Zadání v týmu", listSub: "Výsledek a splnění u každého zadání", play: "Hrát", openTask: "Otevřít zadání", missing: "Chybí {0}",
  dBest: "Nejlepší výsledek", dPass: "Hranice splnění", dAttempts: "Pokusy", dDue: "Termín", dLeft: "Zbývá pokusů", noDue: "Bez termínu", pickTask: "Vyber zadání ze seznamu.",
  rDonut: "Splnění zadání", rDonutSub: "všech zadání žáků", rRadar: "Průměr po zadáních", rBars: "Splnění podle skupin", rNoGroup: "Bez skupiny",
  rDone: "Splněno", rTried: "Zkoušeli", rWaiting: "Čeká", rMissing: "Chybí", rAll: "Vše", rMid: "Rozpracováno", rSearch: "Hledat žáka…",
  rColValue: "Splněno", rColRange: "Průměr a hranice splnění", rColStatus: "Stav", rMatrix: "Podrobně po zadáních", rAvg: "Průměr", rNoData: "Bez výsledků",
  gSearch: "Hledat skupinu…", gAdd: "Přidat skupinu", gAssignments: "Zadání skupině", gMembers: "Členů", gMenu: "Menu skupiny", gDrop: "Přetáhni sem žáky", gStudents: "žáků", gCancel: "Zrušit",
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
  stStudents: "Active students", stTasks: "Assignments", stDoneOf: "{0} of {1} done", stWaiting: "Waiting to be done", stAvg: "Average best score",
  listTitle: "Team assignments", listSub: "Score and completion for each assignment", play: "Play", openTask: "Open assignment", missing: "{0} missing",
  dBest: "Best score", dPass: "Pass threshold", dAttempts: "Attempts", dDue: "Deadline", dLeft: "Attempts left", noDue: "No deadline", pickTask: "Pick an assignment from the list.",
  rDonut: "Assignment completion", rDonutSub: "student assignments", rRadar: "Average by assignment", rBars: "Completion by group", rNoGroup: "No group",
  rDone: "Done", rTried: "Tried", rWaiting: "Waiting", rMissing: "Missing", rAll: "All", rMid: "In progress", rSearch: "Search students…",
  rColValue: "Done", rColRange: "Average and pass threshold", rColStatus: "Status", rMatrix: "Details by assignment", rAvg: "Average", rNoData: "No results",
  gSearch: "Search groups…", gAdd: "Add group", gAssignments: "Assignments for group", gMembers: "Members", gMenu: "Group menu", gDrop: "Drag students here", gStudents: "students", gCancel: "Cancel",
};

const more: Partial<Record<Locale, TeamsEdx>> = { cs, en };
export const getTeamsEdx = (locale: Locale): TeamsEdx => more[locale] ?? en;
