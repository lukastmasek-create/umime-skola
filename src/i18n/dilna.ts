import type { Locale } from "./config";

// Texty Učitelské dílny (záložka Škola). Ostatní jazyky dostanou angličtinu.
export type DilnaText = {
  title: string;
  intro: string;
  tabMake: string;
  tabLibrary: string;
  tabShared: string;
  kindLabel: string;
  kinds: Record<"pairs" | "order" | "story" | "speak", { name: string; hint: string }>;
  sourceLabel: string;
  sourceText: string;
  sourceCourse: string;
  sourceGap: string;
  textPlaceholder: string;
  photo: string;
  searchCourse: string;
  search: string;
  searchEmpty: string;
  pickedCourse: string;
  gapEmpty: string;
  chooseTeam: string;
  generate: string;
  generating: string;
  blankGame: string;
  draftTitle: string;
  gameTitle: string;
  left: string;
  right: string;
  addPair: string;
  addItem: string;
  moveUp: string;
  moveDown: string;
  remove: string;
  stepClue: string;
  stepQuestion: string;
  stepOption: string;
  correctOption: string;
  addOption: string;
  addStep: string;
  promptLabel: string;
  modelLabel: string;
  addPrompt: string;
  limitReached: string;
  tooFew: string;
  save: string;
  saved: string;
  newDraft: string;
  play: string;
  edit: string;
  share: string;
  unshare: string;
  sharedBadge: string;
  assign: string;
  assigned: string;
  copy: string;
  copied: string;
  libraryTitle: string;
  libraryEmpty: string;
  sharedTitle: string;
  sharedEmpty: string;
  playHint: string;
  orderHint: string;
  storyHint: string;
  speakHint: string;
  pickLeft: string;
  pickRight: string;
  pickNext: string;
  wrong: string;
  rightAnswer: string;
  nextStep: string;
  showAnswer: string;
  markRight: string;
  markWrong: string;
  finishedTitle: string;
  mistakes: string;
  scoreOf: string;
  playAgain: string;
  backToEdit: string;
  errNetwork: string;
  errAi: string;
  errLimit: string;
  errLibraryFull: string;
  errNotAssignable: string;
  errNoQuestions: string;
  errCourse: string;
  errGeneric: string;
};

const cs: DilnaText = {
  title: "Učitelská dílna",
  intro: "Připrav hru z textu, fotky nebo kurzu. Upravíš ji, uložíš do knihovny, sdílíš kolegům a zahraješ na společné obrazovce nebo zadáš třídě.",
  tabMake: "Připravit hru",
  tabLibrary: "Moje hry",
  tabShared: "Od kolegů",
  kindLabel: "Typ hry",
  kinds: {
    pairs: { name: "Párování", hint: "Spojuješ pojmy s jejich výkladem nebo překladem." },
    order: { name: "Řazení", hint: "Seřaď kroky, události nebo data ve správném pořadí." },
    story: { name: "Detektivka", hint: "Příběh po krocích. Každá správná odpověď odemkne další stopu." },
    speak: { name: "Mluvená hra", hint: "Žáci nahlas splní úkoly, učitel označí správně nebo špatně." },
  },
  sourceLabel: "Zdroj",
  sourceText: "Text nebo fotka",
  sourceCourse: "Kurz z UčímePRO",
  sourceGap: "Mezera třídy",
  textPlaceholder: "Vlož text z učebnice nebo poznámek…",
  photo: "Vyfotit nebo vybrat fotku",
  searchCourse: "Hledat kurz",
  search: "Hledat",
  searchEmpty: "Nic nenalezeno.",
  pickedCourse: "Vybráno:",
  gapEmpty: "Třída zatím nemá žádné mezery.",
  chooseTeam: "Třída",
  generate: "Vytvořit hru",
  blankGame: "Napsat hru ručně",
  generating: "Dílna pracuje…",
  draftTitle: "Návrh hry",
  gameTitle: "Název hry",
  left: "Levá strana",
  right: "Pravá strana",
  addPair: "Přidat dvojici",
  addItem: "Přidat položku",
  moveUp: "Nahoru",
  moveDown: "Dolů",
  remove: "Smazat",
  stepClue: "Stopa",
  stepQuestion: "Otázka",
  stepOption: "Možnost",
  correctOption: "Správná",
  addOption: "Přidat možnost",
  addStep: "Přidat krok",
  promptLabel: "Úkol",
  modelLabel: "Vzorová odpověď",
  addPrompt: "Přidat úkol",
  limitReached: "Dosažen maximální počet položek.",
  tooFew: "Hra je příliš krátká. Doplň obsah.",
  save: "Uložit do knihovny",
  saved: "Uloženo do knihovny.",
  newDraft: "Nová hra",
  play: "Hrát",
  edit: "Upravit",
  share: "Sdílet kolegům",
  unshare: "Zrušit sdílení",
  sharedBadge: "Sdíleno",
  assign: "Zadat třídě",
  assigned: "Úkol je zadaný třídě.",
  copy: "Kopírovat do mé knihovny",
  copied: "Hra je ve tvé knihovně.",
  libraryTitle: "Moje hry",
  libraryEmpty: "Zatím tu nejsou žádné hry. Připrav první.",
  sharedTitle: "Hry od kolegů ze školy",
  sharedEmpty: "Kolegové zatím nesdíleli žádné hry.",
  playHint: "Klepni na pojem vlevo a pak na jeho protějšek vpravo.",
  orderHint: "Klepej na položky ve správném pořadí.",
  storyHint: "Přečti stopu a vyber odpověď. Správná odemkne další krok.",
  speakHint: "Žák řekne odpověď nahlas. Ty označ, jestli byla správná.",
  pickLeft: "Vyber pojem vlevo",
  pickRight: "Vyber protějšek vpravo",
  pickNext: "Vyber další položku",
  wrong: "Tohle není správně.",
  rightAnswer: "Správně!",
  nextStep: "Další krok",
  showAnswer: "Ukázat vzorovou odpověď",
  markRight: "Správně",
  markWrong: "Špatně",
  finishedTitle: "Hotovo!",
  mistakes: "Chyb",
  scoreOf: "správně z",
  playAgain: "Hrát znovu",
  backToEdit: "Zpět na úpravy",
  errNetwork: "Spojení selhalo. Zkus to znovu.",
  errAi: "Dílna teď nemůže odpovědět. Zkus to za chvíli.",
  errLimit: "Dosáhl jsi limitu. Zkus to později.",
  errLibraryFull: "Knihovna je plná. Smaž některé hry.",
  errNotAssignable: "Tenhle typ hry se nedá zadat jako úkol.",
  errNoQuestions: "Kurz nemá otázky, ze kterých jde hra vytvořit.",
  errCourse: "Kurz nebyl nalezen.",
  errGeneric: "Něco se pokazilo.",
};

const en: DilnaText = {
  title: "Teacher workshop",
  intro: "Prepare a game from a text, photo or course. Edit it, save it, share it with colleagues, and play it on the shared screen or assign it to a class.",
  tabMake: "Prepare a game",
  tabLibrary: "My games",
  tabShared: "From colleagues",
  kindLabel: "Game type",
  kinds: {
    pairs: { name: "Matching", hint: "Match terms with their explanations or translations." },
    order: { name: "Ordering", hint: "Put steps, events or dates in the correct order." },
    story: { name: "Detective story", hint: "A story in steps. Each correct answer unlocks the next clue." },
    speak: { name: "Speaking game", hint: "Pupils complete tasks aloud, you mark them right or wrong." },
  },
  sourceLabel: "Source",
  sourceText: "Text or photo",
  sourceCourse: "UčímePRO course",
  sourceGap: "Class gap",
  textPlaceholder: "Paste text from a textbook or notes…",
  photo: "Take or choose a photo",
  searchCourse: "Search for a course",
  search: "Search",
  searchEmpty: "Nothing found.",
  pickedCourse: "Selected:",
  gapEmpty: "The class has no gaps yet.",
  chooseTeam: "Class",
  generate: "Create game",
  blankGame: "Write a game by hand",
  generating: "The workshop is working…",
  draftTitle: "Game draft",
  gameTitle: "Game title",
  left: "Left side",
  right: "Right side",
  addPair: "Add pair",
  addItem: "Add item",
  moveUp: "Up",
  moveDown: "Down",
  remove: "Delete",
  stepClue: "Clue",
  stepQuestion: "Question",
  stepOption: "Option",
  correctOption: "Correct",
  addOption: "Add option",
  addStep: "Add step",
  promptLabel: "Task",
  modelLabel: "Model answer",
  addPrompt: "Add task",
  limitReached: "Maximum number of items reached.",
  tooFew: "The game is too short. Add more content.",
  save: "Save to library",
  saved: "Saved to library.",
  newDraft: "New game",
  play: "Play",
  edit: "Edit",
  share: "Share with colleagues",
  unshare: "Stop sharing",
  sharedBadge: "Shared",
  assign: "Assign to class",
  assigned: "The task has been assigned to the class.",
  copy: "Copy to my library",
  copied: "The game is in your library.",
  libraryTitle: "My games",
  libraryEmpty: "No games yet. Prepare your first one.",
  sharedTitle: "Games from colleagues at your school",
  sharedEmpty: "Colleagues have not shared any games yet.",
  playHint: "Tap a term on the left, then its match on the right.",
  orderHint: "Tap the items in the correct order.",
  storyHint: "Read the clue and pick an answer. The correct one unlocks the next step.",
  speakHint: "The pupil says the answer aloud. Mark whether it was correct.",
  pickLeft: "Pick a term on the left",
  pickRight: "Pick its match on the right",
  pickNext: "Pick the next item",
  wrong: "That is not right.",
  rightAnswer: "Correct!",
  nextStep: "Next step",
  showAnswer: "Show model answer",
  markRight: "Correct",
  markWrong: "Wrong",
  finishedTitle: "Done!",
  mistakes: "Mistakes",
  scoreOf: "correct out of",
  playAgain: "Play again",
  backToEdit: "Back to editing",
  errNetwork: "Connection failed. Try again.",
  errAi: "The workshop cannot answer right now. Try again later.",
  errLimit: "You have reached the limit. Try again later.",
  errLibraryFull: "The library is full. Delete some games.",
  errNotAssignable: "This game type cannot be assigned as a task.",
  errNoQuestions: "The course has no questions to build a game from.",
  errCourse: "The course was not found.",
  errGeneric: "Something went wrong.",
};

export function getDilnaText(locale: Locale): DilnaText {
  return locale === "cs" ? cs : en;
}
