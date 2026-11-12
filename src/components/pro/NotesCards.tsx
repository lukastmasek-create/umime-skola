"use client";

import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { getProToolsText } from "@/i18n/pro-tools";
import { errorText, imageToDataUrl, proFetch } from "./api";

type Card = { front: string; back: string };

// Import z poznámek: z textu nebo fotky vzniknou kartičky na učení.
export function NotesCards({ locale }: { locale: Locale }) {
  const t = getProToolsText(locale);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});

  async function make(image?: string) {
    setBusy(true);
    setError("");
    setFlipped({});
    const r = await proFetch<{ title: string; cards: Card[] }>("/api/pro/ai", { mode: "notes", locale, text: image ? undefined : text, image });
    setBusy(false);
    if (!r.ok) return setError(errorText(t, r.error));
    if (r.data.cards.length === 0) return setError(t.notesNone);
    setTitle(r.data.title);
    setCards(r.data.cards);
  }

  async function photo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await make(await imageToDataUrl(file));
    } catch {
      setError(t.errGeneric);
    }
  }

  return (
    <div className="grid gap-4">
      <p className="text-sm text-[var(--muted)]">{t.notesIntro}</p>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={7} maxLength={4000} placeholder={t.notesPlaceholder} className="rounded-xl border-2 border-[var(--edge)] bg-[var(--surface)] p-3 text-sm" />
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => void make()} disabled={busy || text.trim().length < 20} className="btn-bouncy btn-lg bg-[var(--brand-500)] font-bold text-white disabled:opacity-50">
          {busy ? t.thinking : t.notesMake}
        </button>
        <label className="btn-bouncy btn-secondary btn-lg cursor-pointer">
          {t.notesPhoto}
          <input type="file" accept="image/*" onChange={photo} disabled={busy} className="sr-only" />
        </label>
      </div>
      {error && <p className="text-sm font-semibold text-[#ff5d73]">{error}</p>}
      {cards.length > 0 && (
        <section>
          {title && (
            <h2 className="mb-2 text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>
              {title}
            </h2>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            {cards.map((c, i) => (
              <button key={i} type="button" onClick={() => setFlipped((f) => ({ ...f, [i]: !f[i] }))} className="card min-h-24 p-4 text-left text-sm font-semibold">
                <span className="mb-1 block text-xs font-bold text-[var(--faint)]">{flipped[i] ? t.notesBack : t.notesFront}</span>
                {flipped[i] ? c.back : c.front}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
