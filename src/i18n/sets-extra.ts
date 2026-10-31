import type { Locale } from "./config";

// Doplňkové texty pro „Moje sady“: ovládání editoru, obrázky, import a hraní v klasických hrách.
export type SetsExtraText = {
  play: string;
  playTitle: string;
  playSubtitle: string;
  playNeedMore: string;
  playLogin: string;
  backToSet: string;
  duplicate: string;
  moveUp: string;
  moveDown: string;
  addImage: string;
  changeImage: string;
  removeImage: string;
  imageBad: string;
  imageHint: string;
  tooLarge: string;
  importTitle: string;
  importHint: string;
  importButton: string;
  importApply: string;
  importDone: string;
  importNone: string;
  shortcuts: string;
  counter: string;
  unsaved: string;
  needFour: string;
};

const cs: SetsExtraText = {
  play: "Hrát",
  playTitle: "Hrát sadu",
  playSubtitle: "Vyber hru. Hraje se na otázkách z tvojí sady, stejně jako v kurzech.",
  playNeedMore: "Potřebuje víc otázek nebo jednoslovné odpovědi.",
  playLogin: "Sady jsou pro přihlášené.",
  backToSet: "Zpět na sady",
  duplicate: "Duplikovat",
  moveUp: "Posunout nahoru",
  moveDown: "Posunout dolů",
  addImage: "Přidat obrázek",
  changeImage: "Změnit obrázek",
  removeImage: "Odebrat obrázek",
  imageBad: "Tenhle soubor nejde použít. Vyber obrázek JPG, PNG nebo WebP.",
  imageHint: "Obrázek se zmenší a uloží do sady. Ukáže se u otázky ve hrách pod klasickým módem.",
  tooLarge: "Obrázky v sadě jsou dohromady moc velké. Odeber nebo zmenši některé.",
  importTitle: "Rychle vložit otázky",
  importHint: "Jedna otázka na řádek: otázka; správná odpověď; špatná 1; špatná 2; špatná 3 (oddělovač je středník nebo tabulátor, takže jde vložit i z Excelu).",
  importButton: "Vložit víc otázek najednou",
  importApply: "Přidat otázky",
  importDone: "Přidáno otázek: {n}",
  importNone: "Nenašel jsem žádný platný řádek (potřebuju otázku a čtyři odpovědi).",
  shortcuts: "Tipy: Enter skočí na další pole, Ctrl+Enter přidá novou otázku, Ctrl+S uloží sadu.",
  counter: "{n} z 100 otázek",
  unsaved: "Máš neuložené změny. Opravdu odejít?",
  needFour: "Do hraní se berou jen otázky se čtyřmi možnostmi.",
};

const en: SetsExtraText = {
  play: "Play",
  playTitle: "Play this set",
  playSubtitle: "Pick a game. It plays on the questions from your set, just like in the courses.",
  playNeedMore: "It needs more questions or one-word answers.",
  playLogin: "Sets are for signed-in players.",
  backToSet: "Back to sets",
  duplicate: "Duplicate",
  moveUp: "Move up",
  moveDown: "Move down",
  addImage: "Add image",
  changeImage: "Change image",
  removeImage: "Remove image",
  imageBad: "This file can't be used. Choose a JPG, PNG or WebP image.",
  imageHint: "The image is shrunk and saved with the set. It shows with the question in the classic-mode games.",
  tooLarge: "The images in this set are too large together. Remove or shrink some.",
  importTitle: "Quick paste",
  importHint: "One question per line: question; correct answer; wrong 1; wrong 2; wrong 3 (separate with a semicolon or tab, so you can paste from Excel).",
  importButton: "Paste many questions at once",
  importApply: "Add questions",
  importDone: "Questions added: {n}",
  importNone: "No valid line found (a question and four answers are needed).",
  shortcuts: "Tips: Enter jumps to the next field, Ctrl+Enter adds a question, Ctrl+S saves the set.",
  counter: "{n} of 100 questions",
  unsaved: "You have unsaved changes. Leave anyway?",
  needFour: "Only questions with four options are used for playing.",
};

export function getSetsExtraText(locale: Locale): SetsExtraText {
  return locale === "cs" ? cs : en;
}
