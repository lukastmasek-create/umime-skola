import { tr8, type Locale } from "./config";

const copy = {
  line1: tr8("Další level?", "Next level?", "Nächstes Level?", "Новый уровень?", "Новий рівень?", "次のレベルへ？", "¿Siguiente nivel?", "Niveau suivant ?"),
  line2: tr8("Lepší známky.", "Better grades.", "Bessere Noten.", "Лучшие оценки.", "Кращі оцінки.", "もっといい成績。", "Mejores notas.", "De meilleures notes."),
  start: tr8("Začít procvičovat", "Start practising", "Jetzt üben", "Начать заниматься", "Почати навчання", "練習を始める", "Empezar a practicar", "Commencer à pratiquer"),
  sample: tr8("Ukázka procvičování", "Practice preview", "Übungsvorschau", "Пример упражнения", "Приклад вправи", "練習のプレビュー", "Ejemplo de práctica", "Aperçu des exercices"),
  explanation: tr8("Paříž je hlavním městem Francie. Londýn je hlavním městem Spojeného království, Berlín Německa a Madrid Španělska.", "Paris is the capital of France. London is the capital of the United Kingdom, Berlin of Germany and Madrid of Spain.", "Paris ist die Hauptstadt Frankreichs. London ist die Hauptstadt des Vereinigten Königreichs, Berlin Deutschlands und Madrid Spaniens.", "Париж — столица Франции. Лондон — столица Великобритании, Берлин — Германии, Мадрид — Испании.", "Париж — столиця Франції. Лондон — столиця Великої Британії, Берлін — Німеччини, Мадрид — Іспанії.", "フランスの首都はパリです。ロンドンはイギリス、ベルリンはドイツ、マドリードはスペインの首都です。", "París es la capital de Francia. Londres es la capital del Reino Unido, Berlín de Alemania y Madrid de España.", "Paris est la capitale de la France. Londres est la capitale du Royaume-Uni, Berlin de l’Allemagne et Madrid de l’Espagne."),
  tryTitle: tr8("Zkus jednu otázku", "Try a question", "Probiere eine Frage", "Попробуй один вопрос", "Спробуй одне питання", "1問試してみよう", "Prueba una pregunta", "Essaie une question"),
  tryHint: tr8("Vyber odpověď a hned zjistíš proč. Bez přihlášení.", "Pick an answer and find out why. No sign-in needed.", "Wähle eine Antwort und erfahre warum. Ohne Anmeldung.", "Выбери ответ и узнай почему. Без входа.", "Обери відповідь і дізнайся чому. Без входу.", "答えを選んで理由を確認。ログイン不要。", "Elige una respuesta y descubre por qué. Sin iniciar sesión.", "Choisis une réponse et découvre pourquoi. Sans connexion."),
  again: tr8("Zkusit znovu", "Try again", "Erneut versuchen", "Ещё раз", "Спробувати знову", "もう一度", "Intentar de nuevo", "Réessayer"),
  last: tr8("Naposledy otevřené cvičení", "Your last exercise", "Deine letzte Übung", "Последнее упражнение", "Остання вправа", "前回の練習", "Tu último ejercicio", "Ton dernier exercice"),
  choose: tr8("Vybrat cvičení", "Choose an exercise", "Übung wählen", "Выбрать упражнение", "Обрати вправу", "練習を選ぶ", "Elegir un ejercicio", "Choisir un exercice"),
  finish: tr8("První krok k lepším známkám?", "Ready for better grades?", "Bereit für bessere Noten?", "Готов к лучшим оценкам?", "Готовий до кращих оцінок?", "もっといい成績を目指そう", "¿Listo para mejorar tus notas?", "Prêt à progresser ?"),
  finishHint: tr8("Vyber si školu, předmět a první cvičení. Svým tempem.", "Pick your school, subject and first exercise. At your own pace.", "Wähle Schule, Fach und erste Übung. In deinem Tempo.", "Выбери школу, предмет и упражнение. В своём темпе.", "Обери школу, предмет і вправу. У своєму темпі.", "学校・教科・練習を選んで、自分のペースで。", "Elige etapa, asignatura y ejercicio. A tu ritmo.", "Choisis ton niveau, ta matière et un exercice. À ton rythme."),
  story: tr8("Náš příběh a tým", "Our story and team", "Unsere Geschichte und unser Team", "Наша история и команда", "Наша історія та команда", "私たちのストーリーとチーム", "Nuestra historia y equipo", "Notre histoire et notre équipe"),
  parents: tr8("Pro rodiče", "For parents", "Für Eltern", "Для родителей", "Для батьків", "保護者の方へ", "Para familias", "Pour les parents"),
  parentText: tr8("Rodičovský zámek, denní limit a přehled o učení. Děti objevují, ty máš přehled.", "Parental controls, a daily limit and learning reports. Let children explore while you stay informed.", "Kindersicherung, Tageslimit und Lernübersicht. Kinder entdecken, Eltern behalten den Überblick.", "Родительский контроль, дневной лимит и отчёты об учёбе.", "Батьківський контроль, денний ліміт і звіти про навчання.", "保護者ロック、1日の時間制限、学習レポートで見守れます。", "Control parental, límite diario e informes para seguir su aprendizaje.", "Contrôle parental, limite quotidienne et suivi des apprentissages."),
};

export function getHomeStartText(locale: Locale) {
  return Object.fromEntries(Object.entries(copy).map(([key, values]) => [key, values[locale]])) as Record<keyof typeof copy, string>;
}
