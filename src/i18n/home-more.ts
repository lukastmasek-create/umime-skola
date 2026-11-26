import type { Locale } from "./config";

// Další bloky úvodní stránky: čtyři přednosti s ikonou a závěrečná výzva k akci.
export type HomeMoreText = {
  featuresTitle: string;
  features: [
    { title: string; text: string },
    { title: string; text: string },
    { title: string; text: string },
    { title: string; text: string },
  ];
  ctaTitle: string;
  ctaText: string;
};

const cs: HomeMoreText = {
  featuresTitle: "Co na webu najdeš",
  features: [
    { title: "Vysvětlení u každé odpovědi", text: "Špatná odpověď nekončí jen červeně. Hned vidíš, proč je chybná, a můžeš zkusit znovu." },
    { title: "Pět úrovní obtížnosti", text: "Každý kurz postupuje od lehkých úloh k náročným, takže žák jde krok za krokem." },
    { title: "Přehled pro rodiče", text: "Rodičovský zámek i přehled pokroku ukazují, kolik se procvičilo a kde je potřeba pomoct." },
    { title: "Učitel vidí výsledky třídy", text: "Zadej úkol s termínem a sleduj, kdo je hotový a kde mají žáci největší mezery." },
  ],
  ctaTitle: "Začni dnes, zdarma",
  ctaText: "Registrace trvá minutu. Žáci hrají bez reklam, učitelé používají vše zdarma.",
};

const en: HomeMoreText = {
  featuresTitle: "What you will find here",
  features: [
    { title: "Explanation for every answer", text: "A wrong answer is not just red. You immediately see why it is wrong and can try again." },
    { title: "Five difficulty levels", text: "Every course moves from easy tasks to hard ones, so the student progresses step by step." },
    { title: "An overview for parents", text: "The parental lock and progress overview show how much was practised and where help is needed." },
    { title: "Teachers see class results", text: "Assign work with a deadline and track who is done and where students have the biggest gaps." },
  ],
  ctaTitle: "Start today, for free",
  ctaText: "Sign-up takes a minute. Students play with no ads, and teachers use everything for free.",
};

const de: HomeMoreText = {
  featuresTitle: "Was dich hier erwartet",
  features: [
    { title: "Erklärung zu jeder Antwort", text: "Eine falsche Antwort ist nicht nur rot. Du siehst sofort, warum sie falsch ist, und kannst es erneut versuchen." },
    { title: "Fünf Schwierigkeitsstufen", text: "Jeder Kurs führt von leichten zu schweren Aufgaben, sodass Schüler Schritt für Schritt vorankommen." },
    { title: "Überblick für Eltern", text: "Elternsperre und Fortschrittsübersicht zeigen, wie viel geübt wurde und wo Hilfe nötig ist." },
    { title: "Lehrkräfte sehen die Klassenergebnisse", text: "Gib eine Aufgabe mit Termin vor und verfolge, wer fertig ist und wo die größten Lücken liegen." },
  ],
  ctaTitle: "Heute starten, kostenlos",
  ctaText: "Die Anmeldung dauert eine Minute. Schüler spielen ohne Werbung, Lehrkräfte nutzen alles kostenlos.",
};

const ru: HomeMoreText = {
  featuresTitle: "Что здесь есть",
  features: [
    { title: "Объяснение к каждому ответу", text: "Неверный ответ — не просто красный. Сразу видно, почему он неверный, и можно попробовать снова." },
    { title: "Пять уровней сложности", text: "Каждый курс идёт от простых заданий к сложным, поэтому ученик движется шаг за шагом." },
    { title: "Обзор для родителей", text: "Родительский замок и обзор прогресса показывают, сколько потренировано и где нужна помощь." },
    { title: "Учитель видит результаты класса", text: "Задай работу с дедлайном и следи, кто выполнил и где у учеников самые большие пробелы." },
  ],
  ctaTitle: "Начни сегодня, бесплатно",
  ctaText: "Регистрация занимает минуту. Ученики играют без рекламы, учителя пользуются всем бесплатно.",
};

const uk: HomeMoreText = {
  featuresTitle: "Що тут є",
  features: [
    { title: "Пояснення до кожної відповіді", text: "Неправильна відповідь — не просто червона. Одразу видно, чому вона хибна, і можна спробувати знову." },
    { title: "П'ять рівнів складності", text: "Кожен курс іде від легких завдань до складних, тож учень рухається крок за кроком." },
    { title: "Огляд для батьків", text: "Батьківський замок і огляд прогресу показують, скільки відпрацьовано і де потрібна допомога." },
    { title: "Вчитель бачить результати класу", text: "Дай завдання з терміном і стеж, хто виконав і де в учнів найбільші прогалини." },
  ],
  ctaTitle: "Почни сьогодні, безкоштовно",
  ctaText: "Реєстрація займає хвилину. Учні грають без реклами, учителі користуються всім безкоштовно.",
};

const ja: HomeMoreText = {
  featuresTitle: "ここでできること",
  features: [
    { title: "すべての答えに解説", text: "間違えても赤いバツで終わりません。なぜ間違いかすぐに分かり、もう一度挑戦できます。" },
    { title: "5段階の難易度", text: "各コースは易しい問題から難しい問題へ進むので、生徒は一歩ずつ上達できます。" },
    { title: "保護者向けの概要", text: "ペアレンタルロックと進捗の概要で、どれだけ練習したか、どこで手助けが必要かが分かります。" },
    { title: "先生はクラスの結果を確認", text: "期限付きで課題を出し、誰が終えたか、どこに弱点があるかを追えます。" },
  ],
  ctaTitle: "今日から無料で始めよう",
  ctaText: "登録は1分で完了。生徒は広告なしで遊べ、先生はすべて無料で使えます。",
};

const es: HomeMoreText = {
  featuresTitle: "Lo que encontrarás aquí",
  features: [
    { title: "Explicación en cada respuesta", text: "Una respuesta incorrecta no es solo roja. Ves al instante por qué está mal y puedes volver a intentarlo." },
    { title: "Cinco niveles de dificultad", text: "Cada curso avanza de tareas fáciles a difíciles, así el alumno progresa paso a paso." },
    { title: "Resumen para las familias", text: "El control parental y el resumen de progreso muestran cuánto se ha practicado y dónde hace falta ayuda." },
    { title: "El docente ve los resultados de la clase", text: "Asigna trabajo con fecha límite y sigue quién lo ha terminado y dónde están las mayores lagunas." },
  ],
  ctaTitle: "Empieza hoy, gratis",
  ctaText: "El registro lleva un minuto. Los alumnos juegan sin anuncios y los docentes usan todo gratis.",
};

const fr: HomeMoreText = {
  featuresTitle: "Ce que tu trouveras ici",
  features: [
    { title: "Explication pour chaque réponse", text: "Une mauvaise réponse n'est pas juste rouge. Tu vois tout de suite pourquoi elle est fausse et tu peux réessayer." },
    { title: "Cinq niveaux de difficulté", text: "Chaque cours passe des exercices faciles aux plus difficiles, pour que l'élève progresse étape par étape." },
    { title: "Un aperçu pour les parents", text: "Le contrôle parental et le suivi des progrès montrent ce qui a été travaillé et où il faut aider." },
    { title: "Les enseignants voient les résultats de la classe", text: "Donne un devoir avec une échéance et suis qui l'a fait et où se trouvent les plus grosses lacunes." },
  ],
  ctaTitle: "Commence aujourd'hui, gratuitement",
  ctaText: "L'inscription prend une minute. Les élèves jouent sans publicité, et les enseignants utilisent tout gratuitement.",
};

const texts: Record<Locale, HomeMoreText> = { cs, en, de, ru, uk, ja, es, fr };

export function getHomeMoreText(locale: Locale): HomeMoreText {
  return texts[locale];
}
