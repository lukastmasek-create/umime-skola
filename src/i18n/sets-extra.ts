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
  kindLabel: string;
  kindChoice: string;
  kindPairs: string;
  kindWord: string;
  kindOrder: string;
  orderPrompt: string;
  orderHint: string;
  orderItem: string;
  wordLabel: string;
  clueLabel: string;
  pairsHint: string;
  pairLeft: string;
  pairRight: string;
  addPair: string;
  removePair: string;
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
  kindLabel: "Typ položky",
  kindChoice: "Otázka se čtyřmi možnostmi",
  kindPairs: "Spojování (dvojice)",
  kindWord: "Slovo do křížovky",
  kindOrder: "Seřazení (4 položky)",
  orderPrompt: "Zadání (např. Seřaď události od nejstarší)",
  orderHint: "Zapiš 4 položky ve správném pořadí, první nahoře. Ve hře se zamíchají.",
  orderItem: "{n}. položka (ve správném pořadí)",
  wordLabel: "Slovo (jen písmena, 3 až 11)",
  clueLabel: "Nápověda (zadání)",
  pairsHint: "Zadej 4 až 8 dvojic: vlevo zadání, vpravo správná odpověď. Ve hře se promíchají.",
  pairLeft: "Vlevo",
  pairRight: "Vpravo",
  addPair: "Přidat dvojici",
  removePair: "Odebrat dvojici",
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
  kindLabel: "Item type",
  kindChoice: "Multiple-choice question",
  kindPairs: "Matching (pairs)",
  kindWord: "Crossword word",
  kindOrder: "Ordering (4 items)",
  orderPrompt: "Task (e.g. Put these events in order, oldest first)",
  orderHint: "Enter 4 items in the correct order, first at the top. The game shuffles them.",
  orderItem: "Item {n} (in correct order)",
  wordLabel: "Word (letters only, 3 to 11)",
  clueLabel: "Clue",
  pairsHint: "Enter 4 to 8 pairs: left is the prompt, right is the correct answer. The game shuffles them.",
  pairLeft: "Left",
  pairRight: "Right",
  addPair: "Add pair",
  removePair: "Remove pair",
};

const de: SetsExtraText = {
  play: "Spielen",
  playTitle: "Set spielen",
  playSubtitle: "Wähle ein Spiel. Es werden die Fragen aus deinem Set verwendet, genau wie in den Kursen.",
  playNeedMore: "Es braucht mehr Fragen oder Antworten aus einem Wort.",
  playLogin: "Sets sind für angemeldete Spieler.",
  backToSet: "Zurück zu den Sets",
  duplicate: "Duplizieren",
  moveUp: "Nach oben",
  moveDown: "Nach unten",
  addImage: "Bild hinzufügen",
  changeImage: "Bild ändern",
  removeImage: "Bild entfernen",
  imageBad: "Diese Datei kann nicht verwendet werden. Wähle ein Bild im Format JPG, PNG oder WebP.",
  imageHint: "Das Bild wird verkleinert und mit dem Set gespeichert. Es erscheint bei der Frage in den Spielen im klassischen Modus.",
  tooLarge: "Die Bilder in diesem Set sind zusammen zu groß. Entferne oder verkleinere einige.",
  importTitle: "Schnell einfügen",
  importHint: "Eine Frage pro Zeile: Frage; richtige Antwort; falsch 1; falsch 2; falsch 3 (Trennzeichen ist Semikolon oder Tabulator, so kannst du auch aus Excel einfügen).",
  importButton: "Viele Fragen auf einmal einfügen",
  importApply: "Fragen hinzufügen",
  importDone: "Fragen hinzugefügt: {n}",
  importNone: "Keine gültige Zeile gefunden (benötigt werden eine Frage und vier Antworten).",
  shortcuts: "Tipps: Enter springt zum nächsten Feld, Strg+Enter fügt eine Frage hinzu, Strg+S speichert das Set.",
  counter: "{n} von 100 Fragen",
  unsaved: "Du hast ungespeicherte Änderungen. Trotzdem verlassen?",
  needFour: "Zum Spielen werden nur Fragen mit vier Antwortmöglichkeiten verwendet.",
  kindLabel: "Art des Elements",
  kindChoice: "Frage mit vier Antworten",
  kindPairs: "Zuordnen (Paare)",
  kindWord: "Kreuzworträtsel-Wort",
  kindOrder: "Sortieren (4 Elemente)",
  orderPrompt: "Aufgabe (z. B. Ordne diese Ereignisse vom ältesten zum neuesten)",
  orderHint: "Gib 4 Elemente in der richtigen Reihenfolge ein, das erste oben. Im Spiel werden sie gemischt.",
  orderItem: "{n}. Element (in der richtigen Reihenfolge)",
  wordLabel: "Wort (nur Buchstaben, 3 bis 11)",
  clueLabel: "Hinweis (Aufgabe)",
  pairsHint: "Gib 4 bis 8 Paare ein: links die Aufgabe, rechts die richtige Antwort. Im Spiel werden sie gemischt.",
  pairLeft: "Links",
  pairRight: "Rechts",
  addPair: "Paar hinzufügen",
  removePair: "Paar entfernen",
};

const ru: SetsExtraText = {
  play: "Играть",
  playTitle: "Играть в набор",
  playSubtitle: "Выбери игру. Она использует вопросы из твоего набора, как в курсах.",
  playNeedMore: "Нужно больше вопросов или ответы из одного слова.",
  playLogin: "Наборы доступны только вошедшим игрокам.",
  backToSet: "Назад к наборам",
  duplicate: "Дублировать",
  moveUp: "Переместить вверх",
  moveDown: "Переместить вниз",
  addImage: "Добавить картинку",
  changeImage: "Изменить картинку",
  removeImage: "Убрать картинку",
  imageBad: "Этот файл нельзя использовать. Выбери картинку JPG, PNG или WebP.",
  imageHint: "Картинка уменьшится и сохранится в наборе. Она будет показана у вопроса в играх классического режима.",
  tooLarge: "Картинки в наборе вместе слишком большие. Убери или уменьши некоторые.",
  importTitle: "Быстрая вставка",
  importHint: "Один вопрос на строку: вопрос; правильный ответ; неверный 1; неверный 2; неверный 3 (разделитель — точка с запятой или табуляция, так можно вставить и из Excel).",
  importButton: "Вставить сразу много вопросов",
  importApply: "Добавить вопросы",
  importDone: "Добавлено вопросов: {n}",
  importNone: "Не нашёл ни одной правильной строки (нужны вопрос и четыре ответа).",
  shortcuts: "Подсказки: Enter переходит к следующему полю, Ctrl+Enter добавляет вопрос, Ctrl+S сохраняет набор.",
  counter: "{n} из 100 вопросов",
  unsaved: "Есть несохранённые изменения. Всё равно уйти?",
  needFour: "В играх используются только вопросы с четырьмя вариантами.",
  kindLabel: "Тип элемента",
  kindChoice: "Вопрос с четырьмя вариантами",
  kindPairs: "Соответствия (пары)",
  kindWord: "Слово для кроссворда",
  kindOrder: "Порядок (4 элемента)",
  orderPrompt: "Задание (например, Расставь события от самого раннего)",
  orderHint: "Введи 4 элемента в правильном порядке, первый сверху. В игре они перемешаются.",
  orderItem: "{n}-й элемент (в правильном порядке)",
  wordLabel: "Слово (только буквы, от 3 до 11)",
  clueLabel: "Подсказка (задание)",
  pairsHint: "Введи от 4 до 8 пар: слева задание, справа правильный ответ. В игре они перемешаются.",
  pairLeft: "Слева",
  pairRight: "Справа",
  addPair: "Добавить пару",
  removePair: "Убрать пару",
};

const uk: SetsExtraText = {
  play: "Грати",
  playTitle: "Грати в набір",
  playSubtitle: "Обери гру. Вона використовує питання з твого набору, як у курсах.",
  playNeedMore: "Потрібно більше питань або відповіді з одного слова.",
  playLogin: "Набори доступні лише для ввійшовших гравців.",
  backToSet: "Назад до наборів",
  duplicate: "Дублювати",
  moveUp: "Перемістити вгору",
  moveDown: "Перемістити вниз",
  addImage: "Додати зображення",
  changeImage: "Змінити зображення",
  removeImage: "Прибрати зображення",
  imageBad: "Цей файл не можна використати. Обери зображення JPG, PNG або WebP.",
  imageHint: "Зображення зменшиться і збережеться з набором. Воно показуватиметься з питанням в іграх класичного режиму.",
  tooLarge: "Зображення в наборі разом завеликі. Прибери або зменш деякі.",
  importTitle: "Швидке вставлення",
  importHint: "Одне питання в рядку: питання; правильна відповідь; неправильна 1; неправильна 2; неправильна 3 (роздільник — крапка з комою або табуляція, тож можна вставити й з Excel).",
  importButton: "Вставити одразу багато питань",
  importApply: "Додати питання",
  importDone: "Додано питань: {n}",
  importNone: "Не знайдено жодного правильного рядка (потрібні питання і чотири відповіді).",
  shortcuts: "Підказки: Enter переходить до наступного поля, Ctrl+Enter додає питання, Ctrl+S зберігає набір.",
  counter: "{n} з 100 питань",
  unsaved: "Є незбережені зміни. Усе одно вийти?",
  needFour: "У іграх використовуються лише питання з чотирма варіантами.",
  kindLabel: "Тип елемента",
  kindChoice: "Питання з чотирма варіантами",
  kindPairs: "Відповідності (пари)",
  kindWord: "Слово для кросворду",
  kindOrder: "Порядок (4 елементи)",
  orderPrompt: "Завдання (наприклад, Упорядкуй ці події від найранішої)",
  orderHint: "Введи 4 елементи в правильному порядку, перший угорі. У грі вони перемішаються.",
  orderItem: "{n}-й елемент (у правильному порядку)",
  wordLabel: "Слово (лише літери, від 3 до 11)",
  clueLabel: "Підказка (завдання)",
  pairsHint: "Введи від 4 до 8 пар: зліва завдання, справа правильна відповідь. У грі вони перемішаються.",
  pairLeft: "Зліва",
  pairRight: "Справа",
  addPair: "Додати пару",
  removePair: "Прибрати пару",
};

const ja: SetsExtraText = {
  play: "プレイ",
  playTitle: "このセットをプレイ",
  playSubtitle: "ゲームを選んでください。コースと同じように、セットの問題で遊べます。",
  playNeedMore: "問題数を増やすか、一語で答える問題が必要です。",
  playLogin: "セットはログインしたプレイヤー向けです。",
  backToSet: "セット一覧に戻る",
  duplicate: "複製",
  moveUp: "上へ移動",
  moveDown: "下へ移動",
  addImage: "画像を追加",
  changeImage: "画像を変更",
  removeImage: "画像を削除",
  imageBad: "このファイルは使えません。JPG、PNG、WebP の画像を選んでください。",
  imageHint: "画像は縮小されてセットと一緒に保存されます。クラシックモードのゲームで問題と一緒に表示されます。",
  tooLarge: "このセットの画像は合計サイズが大きすぎます。一部を削除するか、縮小してください。",
  importTitle: "まとめて貼り付け",
  importHint: "1行に1問: 問題; 正解; 不正解1; 不正解2; 不正解3（区切りはセミコロンまたはタブ。Excel からも貼り付けられます）。",
  importButton: "問題をまとめて貼り付ける",
  importApply: "問題を追加",
  importDone: "追加した問題: {n}",
  importNone: "有効な行が見つかりませんでした（問題1つと答え4つが必要です）。",
  shortcuts: "ヒント: Enter で次の欄へ、Ctrl+Enter で問題を追加、Ctrl+S でセットを保存します。",
  counter: "100問中 {n} 問",
  unsaved: "保存されていない変更があります。このまま離れますか？",
  needFour: "ゲームでは選択肢が4つある問題だけを使います。",
  kindLabel: "項目の種類",
  kindChoice: "4択問題",
  kindPairs: "マッチング（ペア）",
  kindWord: "クロスワードの単語",
  kindOrder: "並べ替え（4項目）",
  orderPrompt: "課題（例: これらの出来事を古い順に並べなさい）",
  orderHint: "4つの項目を正しい順番で、一番上を最初にして入力してください。ゲームでは並び順がシャッフルされます。",
  orderItem: "{n}番目の項目（正しい順番）",
  wordLabel: "単語（文字のみ、3〜11文字）",
  clueLabel: "ヒント（課題）",
  pairsHint: "4〜8組のペアを入力: 左に課題、右に正しい答え。ゲームでは順番がシャッフルされます。",
  pairLeft: "左",
  pairRight: "右",
  addPair: "ペアを追加",
  removePair: "ペアを削除",
};

const es: SetsExtraText = {
  play: "Jugar",
  playTitle: "Jugar este set",
  playSubtitle: "Elige un juego. Juega con las preguntas de tu set, igual que en los cursos.",
  playNeedMore: "Necesita más preguntas o respuestas de una sola palabra.",
  playLogin: "Los sets son para jugadores con sesión iniciada.",
  backToSet: "Volver a los sets",
  duplicate: "Duplicar",
  moveUp: "Subir",
  moveDown: "Bajar",
  addImage: "Añadir imagen",
  changeImage: "Cambiar imagen",
  removeImage: "Quitar imagen",
  imageBad: "No se puede usar este archivo. Elige una imagen JPG, PNG o WebP.",
  imageHint: "La imagen se reduce y se guarda con el set. Aparece junto a la pregunta en los juegos del modo clásico.",
  tooLarge: "Las imágenes del set ocupan demasiado en total. Quita o reduce algunas.",
  importTitle: "Pegado rápido",
  importHint: "Una pregunta por línea: pregunta; respuesta correcta; incorrecta 1; incorrecta 2; incorrecta 3 (el separador es punto y coma o tabulador, así puedes pegar desde Excel).",
  importButton: "Pegar muchas preguntas a la vez",
  importApply: "Añadir preguntas",
  importDone: "Preguntas añadidas: {n}",
  importNone: "No se ha encontrado ninguna línea válida (hacen falta una pregunta y cuatro respuestas).",
  shortcuts: "Consejos: Enter pasa al siguiente campo, Ctrl+Enter añade una pregunta, Ctrl+S guarda el set.",
  counter: "{n} de 100 preguntas",
  unsaved: "Tienes cambios sin guardar. ¿Salir de todos modos?",
  needFour: "Para jugar solo se usan preguntas con cuatro opciones.",
  kindLabel: "Tipo de elemento",
  kindChoice: "Pregunta con cuatro opciones",
  kindPairs: "Emparejar (parejas)",
  kindWord: "Palabra de crucigrama",
  kindOrder: "Ordenar (4 elementos)",
  orderPrompt: "Consigna (p. ej. Ordena estos sucesos del más antiguo)",
  orderHint: "Escribe 4 elementos en el orden correcto, el primero arriba. En el juego se mezclan.",
  orderItem: "Elemento {n} (en el orden correcto)",
  wordLabel: "Palabra (solo letras, de 3 a 11)",
  clueLabel: "Pista (consigna)",
  pairsHint: "Escribe de 4 a 8 parejas: a la izquierda la consigna, a la derecha la respuesta correcta. En el juego se mezclan.",
  pairLeft: "Izquierda",
  pairRight: "Derecha",
  addPair: "Añadir pareja",
  removePair: "Quitar pareja",
};

const fr: SetsExtraText = {
  play: "Jouer",
  playTitle: "Jouer ce set",
  playSubtitle: "Choisis un jeu. Il utilise les questions de ton set, comme dans les parcours.",
  playNeedMore: "Il faut plus de questions ou des réponses en un seul mot.",
  playLogin: "Les sets sont réservés aux joueurs connectés.",
  backToSet: "Retour aux sets",
  duplicate: "Dupliquer",
  moveUp: "Monter",
  moveDown: "Descendre",
  addImage: "Ajouter une image",
  changeImage: "Changer l'image",
  removeImage: "Retirer l'image",
  imageBad: "Ce fichier ne peut pas être utilisé. Choisis une image JPG, PNG ou WebP.",
  imageHint: "L'image est réduite et enregistrée avec le set. Elle s'affiche avec la question dans les jeux du mode classique.",
  tooLarge: "Les images de ce set sont trop lourdes ensemble. Retire-en ou réduis-en quelques-unes.",
  importTitle: "Collage rapide",
  importHint: "Une question par ligne : question ; bonne réponse ; mauvaise 1 ; mauvaise 2 ; mauvaise 3 (séparateur : point-virgule ou tabulation, tu peux donc coller depuis Excel).",
  importButton: "Coller plusieurs questions d'un coup",
  importApply: "Ajouter les questions",
  importDone: "Questions ajoutées : {n}",
  importNone: "Aucune ligne valide trouvée (il faut une question et quatre réponses).",
  shortcuts: "Astuces : Entrée passe au champ suivant, Ctrl+Entrée ajoute une question, Ctrl+S enregistre le set.",
  counter: "{n} questions sur 100",
  unsaved: "Tu as des modifications non enregistrées. Quitter quand même ?",
  needFour: "Seules les questions à quatre options sont utilisées pour jouer.",
  kindLabel: "Type d'élément",
  kindChoice: "Question à quatre choix",
  kindPairs: "Association (paires)",
  kindWord: "Mot de mots croisés",
  kindOrder: "Remise en ordre (4 éléments)",
  orderPrompt: "Consigne (ex. Mets ces événements dans l'ordre, du plus ancien)",
  orderHint: "Saisis 4 éléments dans le bon ordre, le premier en haut. Le jeu les mélange.",
  orderItem: "Élément {n} (dans le bon ordre)",
  wordLabel: "Mot (lettres uniquement, de 3 à 11)",
  clueLabel: "Indice (consigne)",
  pairsHint: "Saisis de 4 à 8 paires : à gauche la consigne, à droite la bonne réponse. Le jeu les mélange.",
  pairLeft: "Gauche",
  pairRight: "Droite",
  addPair: "Ajouter une paire",
  removePair: "Retirer une paire",
};

export function getSetsExtraText(locale: Locale): SetsExtraText {
  switch (locale) {
    case "cs":
      return cs;
    case "de":
      return de;
    case "ru":
      return ru;
    case "uk":
      return uk;
    case "ja":
      return ja;
    case "es":
      return es;
    case "fr":
      return fr;
    default:
      return en;
  }
}
