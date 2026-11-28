"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { tr8, type Locale } from "@/i18n/config";

const questions = [
  { prompt: "7 × 8", options: [54, 56, 64], correct: 56, explanation: "8 + 8 + 8 + 8 + 8 + 8 + 8 = 56" },
  { prompt: "36 ÷ 4", options: [8, 10, 9], correct: 9, explanation: "9 × 4 = 36" },
  { prompt: "15 + 6 × 3", options: [33, 63, 45], correct: 33, explanation: "6 × 3 = 18 → 15 + 18 = 33" },
];

const copy = {
  math: tr8("Matematika", "Maths", "Mathe", "Математика", "Математика", "算数", "Matemáticas", "Maths"),
  correct: tr8("Správně!", "Correct!", "Richtig!", "Верно!", "Правильно!", "正解！", "¡Correcto!", "Bravo !"),
  answer: tr8("Správná odpověď", "Correct answer", "Richtige Antwort", "Правильный ответ", "Правильна відповідь", "正解", "Respuesta correcta", "Bonne réponse"),
  next: tr8("Další otázka", "Next question", "Nächste Frage", "Следующий вопрос", "Наступне запитання", "次の問題", "Siguiente pregunta", "Question suivante"),
  result: tr8("Výsledek", "Result", "Ergebnis", "Результат", "Результат", "結果", "Resultado", "Résultat"),
  replay: tr8("Zkusit znovu", "Try again", "Erneut versuchen", "Ещё раз", "Спробувати ще раз", "もう一度", "Reintentar", "Réessayer"),
  map: tr8("Otevřít mapu kurzů", "Open the course map", "Kurskarte öffnen", "Открыть карту курсов", "Відкрити карту курсів", "コースマップを開く", "Abrir el mapa de cursos", "Ouvrir la carte des cours"),
  browse: tr8("Procvičit matematiku", "Practise maths", "Mathe üben", "Практиковать математику", "Тренувати математику", "算数を練習", "Practicar matemáticas", "S’entraîner en maths"),
};

export function HomeExercisePreview({ locale }: { locale: Locale }) {
  const [answers, setAnswers] = useState<number[]>([]);
  const [step, setStep] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const question = questions[step];
  const answer = answers[step];
  const score = answers.filter((choice, i) => choice === questions[i].correct).length;

  function move(to: number) {
    setStep(to);
    requestAnimationFrame(() => heading.current?.focus({ preventScroll: true }));
  }

  return (
    <section className="home-exercise refresh-demo" id="zkusit" aria-labelledby="home-exercise-title">
      <div className="home-exercise-top">
        <span className="home-exercise-icon" aria-hidden><Icon name="matematika" size={42} /></span>
        <div>
          <p className="home-exercise-eyebrow">{copy.math[locale]}</p>
          <p className="home-exercise-subject">{Math.min(step + 1, questions.length)} / {questions.length}</p>
        </div>
        <div className="refresh-demo-track" aria-hidden>
          {questions.map((item, i) => <span key={item.prompt} data-state={i < answers.length ? "done" : i === step ? "current" : undefined} />)}
        </div>
      </div>

      <h2 id="home-exercise-title" ref={heading} tabIndex={-1}>
        {question ? <>{question.prompt} = ?</> : <>{copy.result[locale]} <strong>{score}/{questions.length}</strong></>}
      </h2>

      {question ? (
        <>
          <div className="home-exercise-answers" role="group" aria-labelledby="home-exercise-title">
            {question.options.map((option) => (
              <button
                key={option}
                type="button"
                aria-disabled={answer !== undefined}
                aria-pressed={answer === option}
                onClick={() => setAnswers((previous) => previous.length === step ? [...previous, option] : previous)}
                className="home-exercise-answer"
                data-result={answer === undefined ? undefined : option === question.correct ? "correct" : option === answer ? "incorrect" : undefined}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="home-exercise-feedback" aria-live="polite">
            {answer !== undefined && <p><strong>{answer === question.correct ? copy.correct[locale] : `${copy.answer[locale]}: ${question.correct}.`}</strong> {question.explanation}</p>}
          </div>
          <button type="button" disabled={answer === undefined} className="btn-bouncy btn-primary btn-lg" onClick={() => move(step + 1)}>
            {step === questions.length - 1 ? copy.result[locale] : copy.next[locale]} <span aria-hidden>→</span>
          </button>
        </>
      ) : (
        <div className="refresh-demo-result">
          <Link className="btn-bouncy btn-primary btn-lg" href={`/${locale}/mapa`}>{copy.map[locale]} <span aria-hidden>→</span></Link>
          <Link className="home-exercise-link" href={`/${locale}/kurzy/zakladni?predmet=matematika#vyber-kurzu`}>{copy.browse[locale]}</Link>
          <button type="button" className="home-exercise-link" onClick={() => { setAnswers([]); move(0); }}>{copy.replay[locale]}</button>
        </div>
      )}
    </section>
  );
}
