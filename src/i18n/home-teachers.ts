import { withFallbacks } from "./config";
import type { Locale } from "./config";

// Texty pro dvě cesty v hero sekci (žák / učitel) a sekci „Pro učitele“ na úvodní stránce.
export type HomeAudienceText = {
  playCta: string;
  teacherCta: string;
  teacherHint: string;
  accountLink: string;
  teachers: {
    eyebrow: string;
    title: string;
    lead: string;
    points: { title: string; text: string }[];
    cta: string;
    ctaHint: string;
    previewTitle: string;
    previewSample: string;
    previewDue: string;
    previewDone: string;
  };
};

const cs: HomeAudienceText = {
  playCta: "Jsem žák: začni hrát",
  teacherCta: "Jsem učitel: založ třídu",
  teacherHint: "Pro učitele zdarma, bez reklam.",
  accountLink: "Vytvořit účet",
  teachers: {
    eyebrow: "Pro učitele",
    title: "Procvičování pro celou třídu na jednom místě",
    lead: "Založ třídu, zadej žákům úkol s termínem a hned uvidíš, kdo ho splnil a kde se zasekli. Žáci se přitom učí hrou, takže procvičují rádi.",
    points: [
      { title: "Založ třídu za minutu", text: "Žáci se připojí kódem třídy. Přijetí schvaluješ ty, takže se k tobě nedostane nikdo cizí." },
      { title: "Zadej úkol s termínem", text: "Vyber kurz nebo test, nastav termín a komu úkol patří: celé třídě, nebo jen skupině." },
      { title: "Sleduj výsledky", text: "Přehled ukazuje, kdo úkol splnil, jak mu šel a které otázky dělají třídě potíže." },
      { title: "Bezpečné pro děti", text: "Bez reklam, s rodičovským zámkem. Registrace i všechny funkce pro učitele jsou zdarma." },
    ],
    cta: "Založit třídu zdarma",
    ctaHint: "Stačí se zaregistrovat a v sekci Týmy vytvořit třídu.",
    previewTitle: "Zlomky, 5. třída",
    previewSample: "Ukázka",
    previewDue: "Termín: pátek",
    previewDone: "splněno",
  },
};

const en: HomeAudienceText = {
  playCta: "I'm a student: start playing",
  teacherCta: "I'm a teacher: create a class",
  teacherHint: "Free for teachers, no ads.",
  accountLink: "Create an account",
  teachers: {
    eyebrow: "For teachers",
    title: "Practice for the whole class in one place",
    lead: "Create a class, assign pupils a task with a deadline and see right away who finished it and where they got stuck. Pupils learn through play, so they actually enjoy practising.",
    points: [
      { title: "Create a class in a minute", text: "Pupils join with a class code. You approve every request, so no outsiders get in." },
      { title: "Assign a task with a deadline", text: "Pick a course or test, set the deadline and who it is for: the whole class or just a group." },
      { title: "Track the results", text: "The overview shows who completed the task, how it went and which questions the class struggles with." },
      { title: "Safe for children", text: "No ads, with a parental lock. Registration and all teacher features are free." },
    ],
    cta: "Create a class for free",
    ctaHint: "Just sign up and create a class in the Teams section.",
    previewTitle: "Fractions, grade 5",
    previewSample: "Preview",
    previewDue: "Due: Friday",
    previewDone: "done",
  },
};

const de: HomeAudienceText = {
  playCta: "Ich bin Schüler: los geht's",
  teacherCta: "Ich bin Lehrer: Klasse anlegen",
  teacherHint: "Für Lehrkräfte kostenlos, ohne Werbung.",
  accountLink: "Konto erstellen",
  teachers: {
    eyebrow: "Für Lehrkräfte",
    title: "Üben für die ganze Klasse an einem Ort",
    lead: "Lege eine Klasse an, gib den Schülern eine Aufgabe mit Frist und sieh sofort, wer sie erledigt hat und wo es hakt. Die Schüler lernen spielerisch und üben dadurch gern.",
    points: [
      { title: "Klasse in einer Minute", text: "Schüler treten mit dem Klassencode bei. Du bestätigst jede Anfrage, es kommt also niemand Fremdes hinein." },
      { title: "Aufgabe mit Frist", text: "Wähle einen Kurs oder Test, setze die Frist und lege fest, für wen er gilt: die ganze Klasse oder nur eine Gruppe." },
      { title: "Ergebnisse verfolgen", text: "Die Übersicht zeigt, wer die Aufgabe erledigt hat, wie es lief und welche Fragen der Klasse Probleme machen." },
      { title: "Sicher für Kinder", text: "Keine Werbung, mit Kindersicherung. Registrierung und alle Lehrerfunktionen sind kostenlos." },
    ],
    cta: "Klasse kostenlos anlegen",
    ctaHint: "Einfach registrieren und im Bereich Teams eine Klasse erstellen.",
    previewTitle: "Brüche, 5. Klasse",
    previewSample: "Vorschau",
    previewDue: "Frist: Freitag",
    previewDone: "erledigt",
  },
};

const ru: HomeAudienceText = {
  playCta: "Я ученик: начать играть",
  teacherCta: "Я учитель: создать класс",
  teacherHint: "Для учителей бесплатно, без рекламы.",
  accountLink: "Создать аккаунт",
  teachers: {
    eyebrow: "Для учителей",
    title: "Тренировка для всего класса в одном месте",
    lead: "Создайте класс, задайте ученикам задание со сроком и сразу увидите, кто его выполнил и где возникли трудности. Ученики учатся в игре, поэтому занимаются охотно.",
    points: [
      { title: "Класс за минуту", text: "Ученики входят по коду класса. Каждую заявку подтверждаете вы, так что посторонние не попадут." },
      { title: "Задание со сроком", text: "Выберите курс или тест, задайте срок и кому он адресован: всему классу или только группе." },
      { title: "Следите за результатами", text: "Обзор показывает, кто выполнил задание, как у него получилось и какие вопросы вызывают трудности у класса." },
      { title: "Безопасно для детей", text: "Без рекламы, с родительским замком. Регистрация и все функции для учителей бесплатны." },
    ],
    cta: "Создать класс бесплатно",
    ctaHint: "Достаточно зарегистрироваться и создать класс в разделе «Команды».",
    previewTitle: "Дроби, 5 класс",
    previewSample: "Пример",
    previewDue: "Срок: пятница",
    previewDone: "выполнено",
  },
};

const all = withFallbacks({ cs, en, de, ru });

export function getHomeAudienceText(locale: Locale): HomeAudienceText {
  return all[locale];
}
