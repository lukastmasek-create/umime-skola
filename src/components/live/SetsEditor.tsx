"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { fmt, getLiveText } from "@/i18n/live";
import type { Locale } from "@/i18n/config";
import type { LiveQuestion } from "@/lib/live/types";
import { liveApi } from "./api";
import { errorText } from "./LiveRoom";
import { OPTION_STYLES } from "./shared";

type SetRow = { id: string; title: string; questions: LiveQuestion[] };
type Draft = { id: string | null; title: string; questions: { prompt: string; options: string[]; correctIndex: number; explanation: string }[] };

const blankQuestion = () => ({ prompt: "", options: ["", "", "", ""], correctIndex: 0, explanation: "" });

export function SetsEditor({ locale }: { locale: Locale }) {
  const t = getLiveText(locale);
  const [sets, setSets] = useState<SetRow[] | null>(null);
  const [login, setLogin] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const r = await liveApi<{ sets: SetRow[] }>("/sets");
    if (r.ok) setSets(r.sets);
    else if (r.status === 401) setLogin(true);
    else setError(r.error);
  }, []);

  useEffect(() => {
    // Načtení při otevření stránky; výsledek se uloží do stavu až po odpovědi serveru.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function save() {
    if (!draft) return;
    const questions = draft.questions.map((q) => ({
      prompt: q.prompt.trim(),
      options: q.options.map((o) => o.trim()),
      correctIndex: q.correctIndex,
      ...(q.explanation.trim() ? { explanation: q.explanation.trim() } : {}),
    }));
    if (!draft.title.trim() || questions.length === 0 || questions.some((q) => !q.prompt || q.options.some((o) => !o))) {
      setError("invalid");
      return;
    }
    setBusy(true);
    setError(null);
    const body = { title: draft.title.trim(), questions };
    const r = draft.id ? await liveApi(`/sets/${draft.id}`, { method: "PUT", body }) : await liveApi("/sets", { body });
    setBusy(false);
    if (!r.ok) return setError(r.error);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
    setDraft(null);
    void load();
  }

  async function remove(id: string) {
    if (!window.confirm(t.sets.confirmRemove)) return;
    await liveApi(`/sets/${id}`, { method: "DELETE" });
    void load();
  }

  const field = "rounded-lg border-2 px-3 py-2 outline-none focus:border-[var(--brand-500)]";
  const errMsg = error && (
    <p role="alert" className="font-semibold text-[var(--danger)]">
      {error === "invalid" ? t.sets.invalid : errorText(t, error)}
    </p>
  );

  if (login) {
    return (
      <div className="card mx-auto flex max-w-md flex-col items-center gap-3 p-6 text-center">
        <p>{t.sets.loginRequired}</p>
        <Link href={`/${locale}/prihlaseni`} className="btn-bouncy btn-primary btn-lg">
          {t.join.button}
        </Link>
      </div>
    );
  }

  if (draft) {
    const update = (patch: Partial<Draft>) => setDraft({ ...draft, ...patch });
    const setQ = (i: number, patch: Partial<Draft["questions"][number]>) =>
      update({ questions: draft.questions.map((q, k) => (k === i ? { ...q, ...patch } : q)) });
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-5">
        <label className="flex flex-col gap-1 text-sm font-semibold">
          {t.sets.setTitle}
          <input value={draft.title} onChange={(e) => update({ title: e.target.value })} maxLength={80} className={`${field} text-lg`} />
        </label>
        {draft.questions.map((q, i) => (
          <fieldset key={i} className="card flex flex-col gap-3 p-4">
            <legend className="sr-only">
              {t.sets.prompt} {i + 1}
            </legend>
            <div className="flex items-start gap-2">
              <label className="flex flex-1 flex-col gap-1 text-sm font-semibold">
                {t.sets.prompt} {i + 1}
                <input value={q.prompt} onChange={(e) => setQ(i, { prompt: e.target.value })} maxLength={300} className={field} />
              </label>
              {draft.questions.length > 1 && (
                <button type="button" onClick={() => update({ questions: draft.questions.filter((_, k) => k !== i) })} className="btn-bouncy mt-6 bg-[var(--surface)] px-3 py-2 text-sm font-bold" aria-label={t.sets.removeQuestion}>
                  ✕
                </button>
              )}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {q.options.map((o, k) => (
                <div key={k} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${i}`}
                    checked={q.correctIndex === k}
                    onChange={() => setQ(i, { correctIndex: k })}
                    aria-label={`${t.sets.correct}: ${fmt(t.sets.option, { n: k + 1 })}`}
                    className="h-5 w-5 shrink-0"
                  />
                  <span aria-hidden className="text-lg" style={{ color: OPTION_STYLES[k].bg }}>
                    {OPTION_STYLES[k].shape}
                  </span>
                  <input
                    value={o}
                    onChange={(e) => setQ(i, { options: q.options.map((x, n) => (n === k ? e.target.value : x)) })}
                    placeholder={fmt(t.sets.option, { n: k + 1 })}
                    aria-label={fmt(t.sets.option, { n: k + 1 })}
                    maxLength={120}
                    className={`${field} min-w-0 flex-1`}
                  />
                </div>
              ))}
            </div>
            <label className="flex flex-col gap-1 text-sm font-semibold">
              {t.sets.explanation}
              <input value={q.explanation} onChange={(e) => setQ(i, { explanation: e.target.value })} maxLength={400} className={field} />
            </label>
          </fieldset>
        ))}
        <button type="button" onClick={() => update({ questions: [...draft.questions, blankQuestion()] })} disabled={draft.questions.length >= 100} className="btn-bouncy btn-secondary self-start px-4 py-2 font-bold">
          + {t.sets.addQuestion}
        </button>
        {errMsg}
        <div className="flex gap-3">
          <button type="button" onClick={save} disabled={busy} className="btn-bouncy btn-primary btn-lg">
            {t.sets.save}
          </button>
          <button type="button" onClick={() => { setDraft(null); setError(null); }} className="btn-bouncy btn-secondary btn-lg">
            {t.sets.cancel}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
            {t.sets.title}
          </h1>
          <p className="text-[var(--muted)]">{t.sets.subtitle}</p>
        </div>
        <button type="button" onClick={() => setDraft({ id: null, title: "", questions: [blankQuestion()] })} className="btn-bouncy btn-primary btn-lg">
          + {t.sets.newSet}
        </button>
      </div>
      {saved && <p className="pill self-start bg-[var(--accent-green)] px-3 py-1 text-white">{t.sets.saved}</p>}
      {errMsg}
      {sets === null ? (
        <p className="text-[var(--muted)]">{t.create.loading}</p>
      ) : sets.length === 0 ? (
        <p className="text-[var(--muted)]">{t.sets.empty}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {sets.map((s) => (
            <li key={s.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-bold">{s.title}</p>
                <p className="text-sm text-[var(--muted)]">{fmt(t.sets.questions, { n: s.questions.length })}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setDraft({
                      id: s.id,
                      title: s.title,
                      questions: s.questions.map((q) => ({ prompt: q.prompt, options: [...q.options, "", "", "", ""].slice(0, 4), correctIndex: q.correctIndex, explanation: q.explanation ?? "" })),
                    })
                  }
                  className="btn-bouncy btn-secondary px-4 py-2 text-sm font-bold"
                >
                  {t.sets.edit}
                </button>
                <button type="button" onClick={() => remove(s.id)} className="btn-bouncy btn-secondary px-4 py-2 text-sm font-bold">
                  {t.sets.remove}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Link href={`/${locale}/hrat-spolecne/nova`} className="text-sm font-bold text-[var(--brand-600)] hover:underline">
        ← {t.sets.back}
      </Link>
    </div>
  );
}
