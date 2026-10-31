"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { fmt, getLiveText } from "@/i18n/live";
import { getSetsExtraText } from "@/i18n/sets-extra";
import type { Locale } from "@/i18n/config";
import { MAX_IMAGE_CHARS } from "@/lib/live/logic";
import type { SetQuestion } from "@/lib/live/types";
import { liveApi } from "./api";
import { errorText } from "./LiveRoom";
import { OPTION_STYLES } from "./shared";

type SetRow = { id: string; title: string; questions: SetQuestion[] };
type DraftQuestion = { uid: number; prompt: string; options: string[]; correctIndex: number; explanation: string; image: string };
type Draft = { id: string | null; title: string; questions: DraftQuestion[] };

const MAX_QUESTIONS = 100;
let uidCounter = 0;
const nextUid = () => ++uidCounter;
const blankQuestion = (): DraftQuestion => ({ uid: nextUid(), prompt: "", options: ["", "", "", ""], correctIndex: 0, explanation: "", image: "" });
const fromStored = (q: SetQuestion): DraftQuestion => ({
  uid: nextUid(),
  prompt: q.prompt,
  options: [...q.options, "", "", "", ""].slice(0, 4),
  correctIndex: q.correctIndex,
  explanation: q.explanation ?? "",
  image: q.image ?? "",
});

/** Načte obrázek, zmenší ho (delší strana max 640 px) a vrátí JPEG jako data URL, které se vejde do limitu. */
async function shrinkImage(file: File): Promise<string | null> {
  if (!/^image\/(jpeg|png|webp|gif|bmp)$/.test(file.type)) return null;
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = url;
    });
    for (const [max, quality] of [[640, 0.78], [520, 0.7], [420, 0.6], [320, 0.5]] as const) {
      const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const data = canvas.toDataURL("image/jpeg", quality);
      if (data.length <= Math.min(MAX_IMAGE_CHARS, 90_000)) return data;
    }
    return null;
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Řádky „otázka; správná; špatná; špatná; špatná“ (středník nebo tabulátor) na otázky se zamíchanými možnostmi. */
function parseBulk(text: string): DraftQuestion[] {
  const out: DraftQuestion[] = [];
  for (const line of text.split(/\r?\n/)) {
    const parts = (line.includes("\t") ? line.split("\t") : line.split(";")).map((p) => p.trim());
    if (parts.length < 5 || parts.slice(0, 5).some((p) => !p)) continue;
    const [prompt, ...opts] = parts.slice(0, 5);
    const order = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
    out.push({
      uid: nextUid(),
      prompt: prompt.slice(0, 300),
      options: order.map((i) => opts[i].slice(0, 120)),
      correctIndex: order.indexOf(0),
      explanation: "",
      image: "",
    });
  }
  return out;
}

export function SetsEditor({ locale }: { locale: Locale }) {
  const t = getLiveText(locale);
  const x = getSetsExtraText(locale);
  const [sets, setSets] = useState<SetRow[] | null>(null);
  const [login, setLogin] = useState(false);
  const [draft, setDraftState] = useState<Draft | null>(null);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulk, setBulk] = useState("");
  const focusUid = useRef<number | null>(null);
  const root = useRef<HTMLDivElement>(null);

  const setDraft = (d: Draft | null, markDirty = true) => {
    setDraftState(d);
    setDirty(d !== null && markDirty);
  };

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

  // Neuložené změny: upozornění při zavření nebo obnovení stránky.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // Po přidání otázky se kurzor přesune do jejího prvního pole.
  useEffect(() => {
    if (focusUid.current === null) return;
    const el = root.current?.querySelector<HTMLElement>(`[data-f="${focusUid.current}-0"]`);
    focusUid.current = null;
    el?.focus();
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [draft]);

  async function save() {
    if (!draft || busy) return;
    const questions = draft.questions.map((q) => ({
      prompt: q.prompt.trim(),
      options: q.options.map((o) => o.trim()),
      correctIndex: q.correctIndex,
      ...(q.explanation.trim() ? { explanation: q.explanation.trim() } : {}),
      ...(q.image ? { image: q.image } : {}),
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

  function leaveDraft() {
    if (dirty && !window.confirm(x.unsaved)) return;
    setDraft(null);
    setError(null);
    setNotice(null);
    setBulkOpen(false);
  }

  const field = "rounded-lg border-2 px-3 py-2 outline-none focus:border-[var(--brand-500)]";
  const errMsg = error && (
    <p role="alert" className="font-semibold text-[var(--danger)]">
      {error === "invalid" ? t.sets.invalid : error === "images-too-large" ? x.tooLarge : errorText(t, error)}
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
    const setQ = (i: number, patch: Partial<DraftQuestion>) =>
      update({ questions: draft.questions.map((q, k) => (k === i ? { ...q, ...patch } : q)) });
    const addQuestion = (at = draft.questions.length) => {
      if (draft.questions.length >= MAX_QUESTIONS) return;
      const q = blankQuestion();
      focusUid.current = q.uid;
      update({ questions: [...draft.questions.slice(0, at), q, ...draft.questions.slice(at)] });
    };
    const move = (i: number, dir: -1 | 1) => {
      const j = i + dir;
      if (j < 0 || j >= draft.questions.length) return;
      const list = [...draft.questions];
      [list[i], list[j]] = [list[j], list[i]];
      update({ questions: list });
    };
    const duplicate = (i: number) => {
      if (draft.questions.length >= MAX_QUESTIONS) return;
      const copy = { ...draft.questions[i], uid: nextUid(), options: [...draft.questions[i].options] };
      focusUid.current = copy.uid;
      update({ questions: [...draft.questions.slice(0, i + 1), copy, ...draft.questions.slice(i + 1)] });
    };
    const attachImage = async (i: number, file: File | undefined) => {
      if (!file) return;
      const data = await shrinkImage(file);
      if (!data) return setError("bad-image");
      setError(null);
      setQ(i, { image: data });
    };
    const applyBulk = () => {
      const room = MAX_QUESTIONS - draft.questions.length;
      const parsed = parseBulk(bulk).slice(0, Math.max(0, room));
      if (parsed.length === 0) return setNotice(x.importNone);
      // Prázdná první otázka (výchozí stav nové sady) se nahradí importem.
      const base = draft.questions.length === 1 && !draft.questions[0].prompt.trim() ? [] : draft.questions;
      update({ questions: [...base, ...parsed] });
      setNotice(fmt(x.importDone, { n: parsed.length }));
      setBulk("");
      setBulkOpen(false);
    };
    // Enter v poli skočí na další pole (otázka → 4 možnosti → vysvětlení → další otázka), Ctrl+Enter přidá otázku.
    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, i: number, n: number) => {
      if (e.key !== "Enter" || e.nativeEvent.isComposing) return;
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) return addQuestion(i + 1);
      const q = draft.questions[i];
      const next = root.current?.querySelector<HTMLElement>(`[data-f="${q.uid}-${n + 1}"]`);
      if (next) return next.focus();
      const nextQ = draft.questions[i + 1];
      if (nextQ) return root.current?.querySelector<HTMLElement>(`[data-f="${nextQ.uid}-0"]`)?.focus();
      addQuestion();
    };
    const imageError = error === "bad-image";
    return (
      <div
        ref={root}
        className="mx-auto flex max-w-3xl flex-col gap-5"
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
            e.preventDefault();
            void save();
          }
        }}
      >
        <label className="flex flex-col gap-1 text-sm font-semibold">
          {t.sets.setTitle}
          <input value={draft.title} onChange={(e) => update({ title: e.target.value })} maxLength={80} className={`${field} text-lg`} />
        </label>
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-[var(--muted)]">
          <span>{fmt(x.counter, { n: draft.questions.length })}</span>
          <span>{x.shortcuts}</span>
        </div>
        {draft.questions.map((q, i) => (
          <fieldset key={q.uid} className="card flex flex-col gap-3 p-4">
            <legend className="sr-only">
              {t.sets.prompt} {i + 1}
            </legend>
            <div className="flex flex-wrap items-center gap-2">
              <span className="pill bg-[var(--surface-muted)] px-3 py-1 text-sm font-bold">{i + 1}</span>
              <span className="flex-1" />
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="btn-bouncy bg-[var(--surface)] px-3 py-1 text-sm font-bold disabled:opacity-40" aria-label={x.moveUp} title={x.moveUp}>
                ↑
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === draft.questions.length - 1} className="btn-bouncy bg-[var(--surface)] px-3 py-1 text-sm font-bold disabled:opacity-40" aria-label={x.moveDown} title={x.moveDown}>
                ↓
              </button>
              <button type="button" onClick={() => duplicate(i)} disabled={draft.questions.length >= MAX_QUESTIONS} className="btn-bouncy bg-[var(--surface)] px-3 py-1 text-sm font-bold disabled:opacity-40" aria-label={x.duplicate} title={x.duplicate}>
                ⧉
              </button>
              {draft.questions.length > 1 && (
                <button type="button" onClick={() => update({ questions: draft.questions.filter((_, k) => k !== i) })} className="btn-bouncy bg-[var(--surface)] px-3 py-1 text-sm font-bold" aria-label={t.sets.removeQuestion} title={t.sets.removeQuestion}>
                  ✕
                </button>
              )}
            </div>
            <label className="flex flex-col gap-1 text-sm font-semibold">
              {t.sets.prompt} {i + 1}
              <input data-f={`${q.uid}-0`} value={q.prompt} onChange={(e) => setQ(i, { prompt: e.target.value })} onKeyDown={(e) => onKeyDown(e, i, 0)} maxLength={300} className={field} />
            </label>
            <div className="flex flex-wrap items-start gap-3">
              {q.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={q.image} alt="" className="max-h-32 w-auto rounded-xl border border-[var(--border)] object-contain" />
              ) : null}
              <div className="flex flex-col gap-1">
                <label className="btn-bouncy btn-secondary cursor-pointer self-start px-4 py-2 text-sm font-bold">
                  🖼 {q.image ? x.changeImage : x.addImage}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      void attachImage(i, e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </label>
                {q.image && (
                  <button type="button" onClick={() => setQ(i, { image: "" })} className="self-start text-sm font-bold text-[var(--danger)] hover:underline">
                    {x.removeImage}
                  </button>
                )}
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {q.options.map((o, k) => (
                <div key={k} className="flex items-center gap-2 rounded-xl border-2 p-1.5" style={{ borderColor: q.correctIndex === k ? "var(--accent-green)" : "transparent", background: q.correctIndex === k ? "rgba(126,224,176,0.18)" : undefined }}>
                  <input
                    type="radio"
                    name={`correct-${q.uid}`}
                    checked={q.correctIndex === k}
                    onChange={() => setQ(i, { correctIndex: k })}
                    aria-label={`${t.sets.correct}: ${fmt(t.sets.option, { n: k + 1 })}`}
                    title={t.sets.correct}
                    className="h-5 w-5 shrink-0"
                  />
                  <span aria-hidden className="text-lg" style={{ color: OPTION_STYLES[k].bg }}>
                    {OPTION_STYLES[k].shape}
                  </span>
                  <input
                    data-f={`${q.uid}-${k + 1}`}
                    value={o}
                    onChange={(e) => setQ(i, { options: q.options.map((v, n) => (n === k ? e.target.value : v)) })}
                    onKeyDown={(e) => onKeyDown(e, i, k + 1)}
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
              <input data-f={`${q.uid}-5`} value={q.explanation} onChange={(e) => setQ(i, { explanation: e.target.value })} onKeyDown={(e) => onKeyDown(e, i, 5)} maxLength={400} className={field} />
            </label>
          </fieldset>
        ))}
        <p className="text-sm text-[var(--faint)]">{x.imageHint}</p>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => addQuestion()} disabled={draft.questions.length >= MAX_QUESTIONS} className="btn-bouncy btn-secondary px-4 py-2 font-bold">
            + {t.sets.addQuestion}
          </button>
          <button type="button" onClick={() => setBulkOpen((v) => !v)} className="btn-bouncy btn-secondary px-4 py-2 font-bold" aria-expanded={bulkOpen}>
            📋 {x.importButton}
          </button>
        </div>
        {bulkOpen && (
          <div className="card flex flex-col gap-2 p-4">
            <h2 className="font-bold">{x.importTitle}</h2>
            <p className="text-sm text-[var(--muted)]">{x.importHint}</p>
            <textarea value={bulk} onChange={(e) => setBulk(e.target.value)} rows={6} className={`${field} font-mono text-sm`} placeholder="Hlavní město Francie; Paříž; Řím; Madrid; Berlín" />
            <button type="button" onClick={applyBulk} className="btn-bouncy btn-primary self-start px-4 py-2 font-bold">
              {x.importApply}
            </button>
          </div>
        )}
        {notice && (
          <p role="status" className="font-semibold text-[var(--muted)]">
            {notice}
          </p>
        )}
        {imageError ? (
          <p role="alert" className="font-semibold text-[var(--danger)]">
            {x.imageBad}
          </p>
        ) : (
          errMsg
        )}
        <div className="sticky bottom-3 flex gap-3">
          <button type="button" onClick={save} disabled={busy} className="btn-bouncy btn-primary btn-lg">
            {t.sets.save}
          </button>
          <button type="button" onClick={leaveDraft} className="btn-bouncy btn-secondary btn-lg">
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
        <button type="button" onClick={() => setDraft({ id: null, title: "", questions: [blankQuestion()] }, false)} className="btn-bouncy btn-primary btn-lg">
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
                <p className="text-sm text-[var(--muted)]">
                  {fmt(t.sets.questions, { n: s.questions.length })}
                  {s.questions.some((q) => q.image) ? " · 🖼" : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/${locale}/hrat-spolecne/sady/${s.id}`} className="btn-bouncy btn-primary px-4 py-2 text-sm font-bold">
                  ▶ {x.play}
                </Link>
                <button type="button" onClick={() => setDraft({ id: s.id, title: s.title, questions: s.questions.map(fromStored) }, false)} className="btn-bouncy btn-secondary px-4 py-2 text-sm font-bold">
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
