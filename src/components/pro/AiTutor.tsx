"use client";

import { useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import { getProToolsText } from "@/i18n/pro-tools";
import { errorText, imageToDataUrl, proFetch } from "./api";

// `image` slouží jen k zobrazení v konverzaci; na server se posílá fotka pouze u poslední zprávy.
type Msg = { role: "user" | "assistant"; content: string; image?: string };

// AI doučovač: vede žáka k výsledku, nehází hotová řešení. Žák může přiložit i fotku úlohy.
export function AiTutor({ locale }: { locale: Locale }) {
  const t = getProToolsText(locale);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const end = useRef<HTMLDivElement>(null);

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    try {
      setPhoto(await imageToDataUrl(file));
    } catch {
      setError(t.errGeneric);
    }
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const typed = text.trim();
    if ((!typed && !photo) || busy) return;
    const content = typed || t.tutorPhotoDefault;
    const next: Msg[] = [...msgs, { role: "user", content, image: photo ?? undefined }];
    setMsgs(next);
    setText("");
    setError("");
    setBusy(true);
    const r = await proFetch<{ reply: string }>("/api/pro/ai", {
      mode: "tutor",
      locale,
      messages: next.map(({ role, content }) => ({ role, content })),
      image: photo ?? undefined,
    });
    setPhoto(null);
    setBusy(false);
    if (r.ok) setMsgs([...next, { role: "assistant", content: r.data.reply }]);
    else setError(errorText(t, r.error));
    setTimeout(() => end.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  return (
    <div className="grid gap-3">
      <p className="text-sm text-[var(--muted)]">{t.tutorIntro}</p>
      <div className="card grid min-h-64 content-start gap-3 p-4" aria-live="polite">
        {msgs.length === 0 && <p className="text-sm text-[var(--faint)]">{t.tutorEmpty}</p>}
        {msgs.map((m, i) => (
          <div key={i} className={`grid max-w-[85%] gap-2 rounded-2xl px-4 py-2 text-sm ${m.role === "user" ? "justify-self-end bg-[var(--brand-500)] text-white" : "justify-self-start bg-[var(--surface-muted)]"}`}>
            {m.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img loading="lazy" decoding="async" src={m.image} alt={t.tutorPhotoAlt} className="max-h-48 rounded-xl object-contain" />
            )}
            <p className="whitespace-pre-wrap">{m.content}</p>
          </div>
        ))}
        {busy && <p className="text-sm text-[var(--muted)]">{t.thinking}</p>}
        <div ref={end} />
      </div>
      {error && <p className="text-sm font-semibold text-[#ff5d73]">{error}</p>}
      {photo && (
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img loading="lazy" decoding="async" src={photo} alt={t.tutorPhotoAlt} className="h-16 rounded-lg border-2 border-[var(--edge)] object-cover" />
          <button type="button" onClick={() => setPhoto(null)} className="text-sm font-semibold text-[var(--muted)] underline">
            {t.tutorRemovePhoto}
          </button>
        </div>
      )}
      <form onSubmit={send} className="flex gap-2">
        <label className="btn-bouncy flex cursor-pointer items-center bg-[var(--surface-muted)] px-3 py-2 text-sm font-bold" title={t.tutorAttach}>
          <span aria-hidden="true">📷</span>
          <span className="sr-only">{t.tutorAttach}</span>
          <input type="file" accept="image/*" onChange={pick} disabled={busy} className="sr-only" />
        </label>
        <input value={text} onChange={(e) => setText(e.target.value)} maxLength={500} placeholder={t.tutorPlaceholder} className="min-w-0 flex-1 rounded-xl border-2 border-[var(--edge)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--faint)] focus:border-[var(--accent-green)]" />
        <button type="submit" disabled={busy || (!text.trim() && !photo)} className="btn-bouncy btn-cta btn-primary px-4 py-2 text-sm font-bold disabled:opacity-50">
          {t.send}
        </button>
      </form>
    </div>
  );
}
