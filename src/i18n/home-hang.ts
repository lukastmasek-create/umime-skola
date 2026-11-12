import type { Locale } from "./config";

// Panel se zavěšenými štítky na úvodní stránce (jen dekorativní text).
export type HomeHangText = { title: string; lead: string; tags: string[]; feed: string[] };

const cs: HomeHangText = {
  feed: [
    "Našel jsi chybu. Skvělé!",
    "Oprava hotová, jdeš dál",
    "Tentokrát to bylo o vlásek",
    "Série pokračuje: 5 správně v řadě",
    "Z chyby se učíš nejrychleji",
    "Nový pokus, nové štěstí",
    "Mozek právě o kousek povyrostl",
    "Teď už to znáš!",
  ],
  title: "Chyby se dějí každý den",
  lead: "Chybovat je normální, ale s tím správným postupem chaos nevznikne.",
  tags: ["Důkaz, jinak to neplatí", "Skvělý rytmus", "Vše sedí", "Chyba opravena", "Splněno"],
};
const en: HomeHangText = {
  feed: [
    "You spotted a mistake. Nice!",
    "Fixed, on to the next one",
    "That was close this time",
    "Streak continues: 5 right in a row",
    "Mistakes are the fastest teacher",
    "New try, fresh luck",
    "Your brain just grew a little",
    "Now you've got it!",
  ],
  title: "Mistakes happen every day",
  lead: "Getting things wrong is normal, but with the right approach, chaos isn't.",
  tags: ["Proof or it's not real", "Perfect rhythm", "All systems stable", "Fix pushed", "Incidents resolved"],
};
const de: HomeHangText = {
  feed: [
    "Fehler gefunden. Super!",
    "Behoben, weiter geht's",
    "Diesmal war es knapp",
    "Serie läuft: 5 richtig in Folge",
    "Aus Fehlern lernt man am schnellsten",
    "Neuer Versuch, neues Glück",
    "Dein Gehirn ist ein Stück gewachsen",
    "Jetzt sitzt es!",
  ],
  title: "Fehler passieren jeden Tag",
  lead: "Fehler sind normal, aber mit dem richtigen Vorgehen entsteht kein Chaos.",
  tags: ["Beweis oder es zählt nicht", "Perfekter Rhythmus", "Alles stabil", "Fehler behoben", "Erledigt"],
};
const ru: HomeHangText = {
  feed: [
    "Ты нашёл ошибку. Отлично!",
    "Исправлено, идём дальше",
    "В этот раз было близко",
    "Серия продолжается: 5 верно подряд",
    "На ошибках учатся быстрее всего",
    "Новая попытка, новая удача",
    "Мозг стал чуть сильнее",
    "Теперь ты это знаешь!",
  ],
  title: "Ошибки случаются каждый день",
  lead: "Ошибаться нормально, но при правильном подходе хаоса не будет.",
  tags: ["Докажи, иначе не считается", "Идеальный ритм", "Всё стабильно", "Ошибка исправлена", "Готово"],
};

const uk: HomeHangText = {
  feed: [
    "Ти знайшов помилку. Чудово!",
    "Виправлено, йдемо далі",
    "Цього разу ледь-ледь",
    "Серія триває: 5 правильних підряд",
    "На помилках вчаться найшвидше",
    "Нова спроба, нова удача",
    "Мозок щойно трохи підріс",
    "Тепер ти це знаєш!",
  ],
  title: "Помилки трапляються щодня",
  lead: "Помилятися нормально, але з правильним підходом хаосу не буде.",
  tags: ["Доведи, інакше не рахується", "Ідеальний ритм", "Усе сходиться", "Помилку виправлено", "Виконано"],
};
const ja: HomeHangText = {
  feed: [
    "ミスを見つけたね。すごい！",
    "直したので、次へ進もう",
    "今回はきわどかった",
    "連続記録継続中: 5問連続正解",
    "失敗から学ぶのがいちばん早い",
    "新しい挑戦、新しいチャンス",
    "脳が少しだけ成長した",
    "もうわかったね！",
  ],
  title: "ミスは毎日起きるもの",
  lead: "間違えるのは普通のこと。正しい進め方をすれば、混乱にはなりません。",
  tags: ["証明がなければ認めない", "リズムばっちり", "すべて順調", "修正済み", "完了"],
};
const es: HomeHangText = {
  feed: [
    "Encontraste un error. ¡Genial!",
    "Arreglado, a por el siguiente",
    "Esta vez por poco",
    "Racha en marcha: 5 seguidas bien",
    "Equivocarse es la forma más rápida de aprender",
    "Nuevo intento, nueva suerte",
    "Tu cerebro acaba de crecer un poco",
    "¡Ahora ya lo sabes!",
  ],
  title: "Los errores pasan cada día",
  lead: "Equivocarse es normal, pero con el método correcto no se convierte en caos.",
  tags: ["Demuéstralo o no vale", "Ritmo perfecto", "Todo en orden", "Error corregido", "Hecho"],
};
const fr: HomeHangText = {
  feed: [
    "Tu as repéré une erreur. Bravo !",
    "Corrigé, on passe à la suite",
    "Cette fois, c'était serré",
    "La série continue : 5 bonnes réponses d'affilée",
    "On apprend le plus vite de ses erreurs",
    "Nouvel essai, nouvelle chance",
    "Ton cerveau vient de grandir un peu",
    "Maintenant tu l'as !",
  ],
  title: "Les erreurs arrivent chaque jour",
  lead: "Se tromper est normal, mais avec la bonne méthode, ça ne tourne pas au chaos.",
  tags: ["La preuve avant tout", "Rythme parfait", "Tout est stable", "Erreur corrigée", "Terminé"],
};

const all: Record<Locale, HomeHangText> = { cs, en, de, ru, uk, ja, es, fr };
export function getHomeHangText(locale: Locale): HomeHangText {
  return all[locale];
}
