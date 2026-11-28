"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { tr8, type Locale } from "@/i18n/config";

const text = {
  eyebrow: tr8("Vyzkoušej si to", "Try it now", "Probiere es aus", "Попробуй", "Спробуй", "試してみよう", "Pruébalo", "Essaie"),
  sample: tr8("Ukázková otázka · Matematika", "Sample question · Maths", "Beispielfrage · Mathe", "Пример · Математика", "Приклад · Математика", "お試し問題・算数", "Pregunta de ejemplo · Matemáticas", "Exemple · Maths"),
  question: tr8("Kolik je 7 × 8?", "What is 7 × 8?", "Was ist 7 × 8?", "Сколько будет 7 × 8?", "Скільки буде 7 × 8?", "7 × 8 はいくつ？", "¿Cuánto es 7 × 8?", "Combien font 7 × 8 ?"),
  correct: tr8("Správně!", "Correct!", "Richtig!", "Верно!", "Правильно!", "正解！", "¡Correcto!", "Bravo !"),
  retry: tr8("Ještě ne. Zkus to znovu.", "Not quite. Try again.", "Noch nicht. Versuch es noch einmal.", "Пока нет. Попробуй ещё раз.", "Ще ні. Спробуй знову.", "もう一度考えてみよう。", "Aún no. Inténtalo otra vez.", "Pas encore. Réessaie."),
  explanation: tr8("7 skupin po 8 je 56. Ke každé odpovědi v kurzu dostaneš vysvětlení.", "Seven groups of eight make 56. Course questions explain every answer.", "Sieben Gruppen mit je acht ergeben 56. Im Kurs wird jede Antwort erklärt.", "Семь групп по восемь — это 56. В курсе объясняется каждый ответ.", "Сім груп по вісім — це 56. У курсі пояснюється кожна відповідь.", "8 が 7 つで 56。コースでは答えの理由も説明します。", "Siete grupos de ocho son 56. En el curso se explica cada respuesta.", "Sept groupes de huit font 56. Le cours explique chaque réponse."),
  browse: tr8("Procvičit matematiku", "Practise maths", "Mathe üben", "Практиковать математику", "Тренувати математику", "算数を練習", "Practicar matemáticas", "S’entraîner en maths"),
  note: tr8("Ukázka bez účtu a bez bodů", "Demo with no account or points", "Demo ohne Konto und Punkte", "Демо без аккаунта и баллов", "Демо без акаунта й балів", "アカウントやポイント不要のお試し", "Demo sin cuenta ni puntos", "Démo sans compte ni points"),
};

export function HomeExercisePreview({ locale }: { locale: Locale }) {
  const [answer, setAnswer] = useState<number | null>(null);
  return (
    <section className="home-exercise" aria-labelledby="home-exercise-title">
      <div className="home-exercise-top">
        <span className="home-exercise-icon"><Icon name="matematika" size={48} /></span>
        <div>
          <p className="home-exercise-eyebrow">{text.eyebrow[locale]}</p>
          <p className="home-exercise-subject">{text.sample[locale]}</p>
        </div>
      </div>
      <h2 id="home-exercise-title">{text.question[locale]}</h2>
      <div className="home-exercise-answers">
        {[54, 56, 64].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setAnswer(n)}
            aria-pressed={answer === n}
            className="home-exercise-answer"
            data-result={answer === n ? n === 56 ? "correct" : "incorrect" : undefined}
          >
            {n}
          </button>
        ))}
      </div>
      {answer === 56 && (
        <div className="home-exercise-proof" aria-hidden="true">
          <div className="home-exercise-dots">{Array.from({ length: 56 }, (_, i) => <span key={i} style={{ animationDelay: `${Math.floor(i / 8) * 65 + (i % 8) * 12}ms` }} />)}</div>
          <span className="home-exercise-equals">= 56</span>
          <svg viewBox="0 0 48 48" className="home-exercise-check"><path d="M7 24 L19 36 L41 10" /></svg>
        </div>
      )}
      <div className="home-exercise-feedback" aria-live="polite">
        {answer === null ? <p>{text.note[locale]}</p> : (
          <p><strong>{answer === 56 ? text.correct[locale] : text.retry[locale]}</strong>{" "}{answer === 56 ? text.explanation[locale] : ""}</p>
        )}
      </div>
      <Link className="home-exercise-link" href={`/${locale}/kurzy/zakladni?predmet=matematika#vyber-kurzu`}>
        {text.browse[locale]} <span aria-hidden>→</span>
      </Link>
    </section>
  );
}
