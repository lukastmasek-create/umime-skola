"use client";

import { useState } from "react";
import Link from "next/link";
import { getDictionary } from "@/i18n/dictionaries";
import { getHomeStartText } from "@/i18n/home-start";
import type { Locale } from "@/i18n/config";

export function HomeTryQuestion({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).templates;
  const c = getHomeStartText(locale);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  return (
    <section id="vyzkouset" className="home-anchor home-start-section" aria-labelledby="try-title">
      <div className="home-section-heading">
        <span className="home-eyebrow">{c.sample}</span>
        <h2 id="try-title" className="home-h2">{c.tryTitle}</h2>
        <p>{c.tryHint}</p>
      </div>
      <div className="home-question card">
        <fieldset disabled={checked}>
          <legend>{t.question}</legend>
          <div className="home-answer-grid">
            {t.options.map((option, i) => (
              <label key={option} className="home-answer" data-selected={selected === i} data-correct={checked && i === t.correctIndex} data-wrong={checked && selected === i && i !== t.correctIndex}>
                <input type="radio" name="home-answer" value={i} checked={selected === i} onChange={() => setSelected(i)} />
                <span>{option}</span>
                {checked && i === t.correctIndex && <span aria-hidden>✓</span>}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="home-question-feedback" role="status" aria-live="polite" aria-atomic="true">
          {checked && <><strong>{selected === t.correctIndex ? t.correct : t.incorrect}</strong><p><b>{t.explanationTitle}: </b>{c.explanation}</p></>}
        </div>
        <div className="home-question-actions">
          {checked ? <button type="button" className="btn-secondary" onClick={() => { setSelected(null); setChecked(false); }}>{c.again}</button>
            : <button type="button" className="btn-primary" disabled={selected === null} onClick={() => setChecked(true)}>{t.checkAnswer}</button>}
          {checked && <Link href="#stupne" className="home-text-link">{c.choose} →</Link>}
        </div>
      </div>
    </section>
  );
}
