"use client";

import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { getProToolsText } from "@/i18n/pro-tools";
import { SaveAsSet } from "./SaveAsSet";
import { errorText, imageToDataUrl, proFetch } from "./api";

type Result = { task: string; method: string; examples: { question: string; answer: string }[] };

// Fotka úlohy → pět podobných příkladů na procvičení stejného postupu.
export function PhotoTasks({ locale }: { locale: Locale }) {
  const t = getProToolsText(locale);
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [shown, setShown] = useState<Record<number, boolean>>({});

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setResult(null);
    setShown({});
    setBusy(true);
    try {
      const image = await imageToDataUrl(file);
      setPreview(image);
      const r = await proFetch<Result>("/api/pro/ai", { mode: "photo", locale, image });
      if (!r.ok) setError(errorText(t, r.error));
      else if (r.data.examples.length === 0) setError(t.photoNone);
      else setResult(r.data);
    } catch {
      setError(t.errGeneric);
    }
    setBusy(false);
  }

  return (
    <div className="grid gap-4">
      <p className="text-sm text-[var(--muted)]">{t.photoIntro}</p>
      <label className="btn-bouncy btn-cta btn-primary btn-lg inline-block w-fit cursor-pointer">
        {busy ? t.thinking : t.photoPick}
        <input type="file" accept="image/*" capture="environment" onChange={pick} disabled={busy} className="sr-only" />
      </label>
      {error && <p className="text-sm font-semibold text-[#ff5d73]">{error}</p>}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {preview && <img loading="lazy" decoding="async" src={preview} alt="" className="max-h-56 w-fit rounded-xl border-2 border-[var(--edge)]" />}
      {result && (
        <section className="pcard-slot grid gap-3 rounded-[22px] border-2 border-[var(--ink)] bg-[color-mix(in_srgb,var(--ac)_15%,#1b1a30)] p-5 shadow-[7px_9px_0_rgba(8,8,24,0.55)]" style={{ ["--ac" as string]: "#7ee0b0" }}>
          {result.task && (
            <p className="text-sm">
              <span className="font-bold">{t.photoTask}: </span>
              {result.task}
            </p>
          )}
          {result.method && (
            <p className="text-sm">
              <span className="font-bold">{t.photoMethod}: </span>
              {result.method}
            </p>
          )}
          <ol className="grid gap-3">
            {result.examples.map((ex, i) => (
              <li key={i} className="border-t border-[var(--edge)] pt-3">
                <p className="font-semibold">
                  {i + 1}. {ex.question}
                </p>
                {shown[i] ? (
                  <p className="mt-1 text-sm text-[var(--accent-green)]">
                    {t.correctAnswer}: {ex.answer}
                  </p>
                ) : (
                  <button type="button" onClick={() => setShown((s) => ({ ...s, [i]: true }))} className="mt-1 text-sm font-bold text-[var(--brand-600)] hover:underline">
                    {t.showAnswer}
                  </button>
                )}
              </li>
            ))}
          </ol>
          <SaveAsSet locale={locale} title={result.task.slice(0, 80)} items={result.examples} />
        </section>
      )}
    </div>
  );
}
