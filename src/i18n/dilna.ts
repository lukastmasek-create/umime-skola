import type { Locale } from "./config";

// Texty Učitelské dílny (záložka Škola). Ostatní jazyky dostanou angličtinu.
export type DilnaText = {
  title: string;
  intro: string;
  sourceTitle: string;
  textPlaceholder: string;
  photo: string;
  generate: string;
  generating: string;
  draftTitle: string;
  gameTitle: string;
  left: string;
  right: string;
  addPair: string;
  removePair: string;
  save: string;
  saved: string;
  newDraft: string;
  libraryTitle: string;
  libraryEmpty: string;
  play: string;
  edit: string;
  remove: string;
  tooFew: string;
  pairsLimit: string;
  playHint: string;
  pickLeft: string;
  pickRight: string;
  wrong: string;
  finishedTitle: string;
  mistakes: string;
  playAgain: string;
  backToEdit: string;
  errNetwork: string;
  errAi: string;
  errLimit: string;
  errLibraryFull: string;
  errGeneric: string;
};

const cs: DilnaText = {
  title: "Učitelská dílna",
  intro: "Vlož text nebo fotku učebnice. Dílna z ní připraví hru na párování, kterou si upravíš a zahraješ na společné obrazovce.",
  sourceTitle: "Zdroj",
  textPlaceholder: "Vlož text z učebnice nebo poznámek…",
  photo: "Nebo vyfotit / vybrat fotku",
  generate: "Vytvořit hru",
  generating: "Dílna pracuje…",
  draftTitle: "Návrh hry",
  gameTitle: "Název hry",
  left: "Levá strana",
  right: "Pravá strana",
  addPair: "Přidat dvojici",
  removePair: "Odebrat",
  save: "Uložit do knihovny",
  saved: "Uloženo do knihovny.",
  newDraft: "Nová hra",
  libraryTitle: "Knihovna her",
  libraryEmpty: "Zatím tu nejsou žádné hry. Vytvoř první.",
  play: "Hrát",
  edit: "Upravit",
  remove: "Smazat",
  tooFew: "Hra potřebuje aspoň tři dvojice.",
  pairsLimit: "Víc než deset dvojic v jedné hře nejde.",
  playHint: "Klepni na pojem vlevo a pak na jeho protějšek vpravo.",
  pickLeft: "Vyber pojem vlevo",
  pickRight: "Vyber protějšek vpravo",
  wrong: "Tahle dvojice k sobě nepatří.",
  finishedTitle: "Hotovo!",
  mistakes: "Chyb",
  playAgain: "Hrát znovu",
  backToEdit: "Zpět na úpravy",
  errNetwork: "Spojení selhalo. Zkus to znovu.",
  errAi: "Dílna teď nemůže odpovědět. Zkus to za chvíli.",
  errLimit: "Dosáhl jsi limitu. Zkus to později.",
  errLibraryFull: "Knihovna je plná. Smaž některé hry.",
  errGeneric: "Něco se pokazilo.",
};

const en: DilnaText = {
  title: "Teacher workshop",
  intro: "Paste a text or photo of a textbook page. The workshop turns it into a matching game you can edit and play on the shared screen.",
  sourceTitle: "Source",
  textPlaceholder: "Paste text from a textbook or notes…",
  photo: "Or take / choose a photo",
  generate: "Create game",
  generating: "The workshop is working…",
  draftTitle: "Game draft",
  gameTitle: "Game title",
  left: "Left side",
  right: "Right side",
  addPair: "Add pair",
  removePair: "Remove",
  save: "Save to library",
  saved: "Saved to library.",
  newDraft: "New game",
  libraryTitle: "Game library",
  libraryEmpty: "No games yet. Create your first one.",
  play: "Play",
  edit: "Edit",
  remove: "Delete",
  tooFew: "A game needs at least three pairs.",
  pairsLimit: "A game can have at most ten pairs.",
  playHint: "Tap a term on the left, then its match on the right.",
  pickLeft: "Pick a term on the left",
  pickRight: "Pick its match on the right",
  wrong: "Those two do not belong together.",
  finishedTitle: "Done!",
  mistakes: "Mistakes",
  playAgain: "Play again",
  backToEdit: "Back to editing",
  errNetwork: "Connection failed. Try again.",
  errAi: "The workshop cannot answer right now. Try again later.",
  errLimit: "You have reached the limit. Try again later.",
  errLibraryFull: "The library is full. Delete some games.",
  errGeneric: "Something went wrong.",
};

export function getDilnaText(locale: Locale): DilnaText {
  return locale === "cs" ? cs : en;
}
