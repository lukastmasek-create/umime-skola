"use client";

import { useCallback, useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";
import { getDilnaText, type DilnaText } from "@/i18n/dilna";
import { DILNA_MAX_PAIRS, DILNA_MIN_PAIRS, isMatch, isPlayable, type Pair } from "@/lib/pro-tools/dilna";
import { shuffle } from "@/lib/teams/logic";
import { imageToDataUrl, proFetch } from "./api";

type Draft = { id?: string; title: string; pairs: Pair[] };
type Saved = { id: string; title: string; pairs: Pair[]; updatedAt: string };

const input = "w-full rounded-xl border-2 border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm";

function errorMessage(t: DilnaText, code: string): string {
  if (code === "network") return t.errNetwork;
  if (code === "ai-unavailable") return t.errAi;
  if (code === "rate-limited") return t.errLimit;
  if (code === "library-full") return t.errLibraryFull;
  return t.errGeneric;
}

export function DilnaTool({ locale }: { locale: Locale }) {
  const t = getDilnaText(locale);
  const [text, setText] = useState("");
  const [image, setImage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [library, setLibrary] = useState<Saved[] | null>(null);
  const [playing, setPlaying] = useState<Pair[] | null>(null);

  const loadLibrary = useCallback(() => {
    void proFetch<{ games: Saved[] }>("/api/pro/dilna").then((r) => {
      if (r.ok) setLibrary(r.data.games);
      else setError(errorMessage(t, r.error));
    });
  }, [t]);

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  async function generate() {
    setBusy(true);
    setError("");
    setNotice("");
    const r = await proFetch<{ title: string; pairs: Pair[] }>("/api/pro/dilna", { action: "generate", text: image ? undefined : text, image: image || undefined, locale });
    setBusy(false);
    if (!r.ok) return setError(errorMessage(t, r.error));
    setDraft({ title: r.data.title, pairs: r.data.pairs });
  }

  async function photo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(await imageToDataUrl(file));
  }

  async function save() {
    if (!draft) return;
    if (!isPlayable(draft.pairs)) return setError(t.tooFew);
    setBusy(true);
    setError("");
    const r = await proFetch<{ id: string }>("/api/pro/dilna", { action: "save", id: draft.id, title: draft.title, pairs: draft.pairs });
    setBusy(false);
    if (!r.ok) return setError(errorMessage(t, r.error));
    setDraft({ ...draft, id: r.data.id });
    setNotice(t.saved);
    void loadLibrary();
  }

  async function remove(id: string) {
    const r = await proFetch<{ ok: boolean }>("/api/pro/dilna", { action: "delete", id });
    if (!r.ok) return setError(errorMessage(t, r.error));
    if (draft?.id === id) setDraft(null);
    void loadLibrary();
  }

  function setPair(i: number, side: "left" | "right", value: string) {
    if (!draft) return;
    setDraft({ ...draft, pairs: draft.pairs.map((p, j) => (j === i ? { ...p, [side]: value } : p)) });
  }

  if (playing) return <Play pairs={playing} t={t} onExit={() => setPlaying(null)} />;

  return (
    <div className="grid gap-5">
      <section className="card grid gap-3 p-5">
        <h2 className="text-lg font-bold">{t.title}</h2>
        <p className="text-sm text-[var(--muted)]">{t.intro}</p>
        <div className="grid gap-3">
          <label className="grid gap-1 text-sm font-bold">
            {t.sourceTitle}
            <textarea value={text} onChange={(e) => setText(e.target.value)} disabled={!!image} rows={5} maxLength={6000} placeholder={t.textPlaceholder} className={input} />
          </label>
          <label className="flex items-center gap-2 text-sm font-bold">
            <input type="file" accept="image/*" capture="environment" onChange={photo} />
            {t.photo}
          </label>
          {image && (
            <button type="button" onClick={() => setImage("")} className="btn-secondary w-fit px-3 py-1 text-sm font-bold">
              {t.remove}
            </button>
          )}
          <button type="button" disabled={busy || (!text.trim() && !image)} onClick={generate} className="btn-bouncy btn-lg w-fit bg-[var(--brand-500)] font-bold text-white disabled:opacity-50">
            {busy ? t.generating : t.generate}
          </button>
        </div>
        {error && <p role="alert" className="text-sm font-semibold">{error}</p>}
      </section>

      {draft && (
        <section className="card grid gap-3 p-5">
          <h3 className="font-bold">{t.draftTitle}</h3>
          <label className="grid gap-1 text-sm font-bold">
            {t.gameTitle}
            <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} maxLength={80} className={input} />
          </label>
          <div className="grid gap-2">
            {draft.pairs.map((p, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <input aria-label={t.left} value={p.left} maxLength={120} onChange={(e) => setPair(i, "left", e.target.value)} className={input} />
                <input aria-label={t.right} value={p.right} maxLength={120} onChange={(e) => setPair(i, "right", e.target.value)} className={input} />
                <button type="button" onClick={() => setDraft({ ...draft, pairs: draft.pairs.filter((_, j) => j !== i) })} className="btn-secondary px-3 py-2 text-sm font-bold">
                  {t.removePair}
                </button>
              </div>
            ))}
          </div>
          {draft.pairs.length >= DILNA_MAX_PAIRS ? (
            <p className="text-sm text-[var(--muted)]">{t.pairsLimit}</p>
          ) : (
            <button type="button" onClick={() => setDraft({ ...draft, pairs: [...draft.pairs, { left: "", right: "" }] })} className="btn-secondary w-fit px-3 py-1.5 text-sm font-bold">
              {t.addPair}
            </button>
          )}
          {draft.pairs.length < DILNA_MIN_PAIRS && <p className="text-sm">{t.tooFew}</p>}
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={busy || !isPlayable(draft.pairs)} onClick={save} className="btn-bouncy bg-[var(--brand-500)] px-4 py-2 font-bold text-white disabled:opacity-50">
              {t.save}
            </button>
            <button type="button" disabled={!isPlayable(draft.pairs)} onClick={() => setPlaying(draft.pairs)} className="btn-secondary px-4 py-2 font-bold disabled:opacity-50">
              {t.play}
            </button>
            <button type="button" onClick={() => setDraft(null)} className="btn-secondary px-4 py-2 font-bold">
              {t.newDraft}
            </button>
          </div>
          {notice && <p className="text-sm font-semibold">{notice}</p>}
        </section>
      )}

      <section className="card grid gap-3 p-5">
        <h3 className="font-bold">{t.libraryTitle}</h3>
        {library === null && <p className="text-sm text-[var(--muted)]">…</p>}
        {library?.length === 0 && <p className="text-sm text-[var(--muted)]">{t.libraryEmpty}</p>}
        <ul className="grid gap-2">
          {library?.map((g) => (
            <li key={g.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border-2 border-[var(--line)] p-3">
              <span className="text-sm font-bold">{g.title}</span>
              <span className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setPlaying(g.pairs)} className="btn-secondary px-3 py-1 text-sm font-bold">{t.play}</button>
                <button type="button" onClick={() => setDraft({ id: g.id, title: g.title, pairs: g.pairs })} className="btn-secondary px-3 py-1 text-sm font-bold">{t.edit}</button>
                <button type="button" onClick={() => remove(g.id)} className="btn-secondary px-3 py-1 text-sm font-bold">{t.remove}</button>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/** Hra na společné obrazovce: učitel klepá střídavě na levou a pravou stranu. */
function Play({ pairs, t, onExit }: { pairs: Pair[]; t: DilnaText; onExit: () => void }) {
  const [lefts, setLefts] = useState(() => shuffle(pairs.map((_, i) => i)));
  const [rights, setRights] = useState(() => shuffle(pairs.map((_, i) => i)));
  const [sel, setSel] = useState<number | null>(null);
  const [done, setDone] = useState<number[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [wrongAt, setWrongAt] = useState<number | null>(null);

  useEffect(() => {
    if (wrongAt === null) return;
    const id = window.setTimeout(() => setWrongAt(null), 700);
    return () => window.clearTimeout(id);
  }, [wrongAt]);

  function pickRight(j: number) {
    if (sel === null || done.includes(j)) return;
    if (isMatch(sel, j)) {
      setDone((d) => [...d, j]);
    } else {
      setMistakes((m) => m + 1);
      setWrongAt(j);
    }
    setSel(null);
  }

  function restart() {
    setDone([]);
    setMistakes(0);
    setSel(null);
    setLefts(shuffle(pairs.map((_, i) => i)));
    setRights(shuffle(pairs.map((_, i) => i)));
  }

  if (done.length === pairs.length) {
    return (
      <section className="card grid gap-4 p-6 text-center">
        <h2 className="text-2xl font-bold">{t.finishedTitle}</h2>
        <p className="font-semibold">{t.mistakes}: {mistakes}</p>
        <div className="flex flex-wrap justify-center gap-2">
          <button type="button" onClick={restart} className="btn-bouncy bg-[var(--brand-500)] px-4 py-2 font-bold text-white">{t.playAgain}</button>
          <button type="button" onClick={onExit} className="btn-secondary px-4 py-2 font-bold">{t.backToEdit}</button>
        </div>
      </section>
    );
  }

  return (
    <section className="card grid gap-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold">{sel === null ? t.pickLeft : t.pickRight} · {done.length}/{pairs.length} · {t.mistakes}: {mistakes}</p>
        <button type="button" onClick={onExit} className="btn-secondary px-3 py-1 text-sm font-bold">{t.backToEdit}</button>
      </div>
      <p className="text-sm text-[var(--muted)]">{t.playHint}</p>
      {wrongAt !== null && <p role="status" className="text-sm font-bold">{t.wrong}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-2">
          {lefts.map((i) => (
            <button
              key={`l${i}`}
              type="button"
              aria-pressed={sel === i}
              disabled={done.includes(i)}
              onClick={() => setSel(i)}
              className={`rounded-xl border-2 p-4 text-left text-lg font-bold ${done.includes(i) ? "opacity-30" : ""} ${sel === i ? "border-[var(--brand-500)] bg-[var(--brand-500)] text-white" : "border-[var(--line)]"}`}
            >
              {pairs[i].left}
            </button>
          ))}
        </div>
        <div className="grid gap-2">
          {rights.map((j) => (
            <button
              key={`r${j}`}
              type="button"
              disabled={done.includes(j) || sel === null}
              onClick={() => pickRight(j)}
              className={`rounded-xl border-2 p-4 text-left text-lg font-bold ${done.includes(j) ? "border-[var(--brand-500)] opacity-40" : ""} ${wrongAt === j ? "border-red-500" : "border-[var(--line)]"}`}
            >
              {pairs[j].right}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
