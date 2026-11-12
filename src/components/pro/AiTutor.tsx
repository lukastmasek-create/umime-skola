"use client";

import { useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import { getProToolsText } from "@/i18n/pro-tools";
import { errorText, proFetch } from "./api";

type Msg = { role: "user" | "assistant"; content: string };

// AI doučovač: vede žáka k výsledku, nehází hotová řešení.
export function AiTutor({ locale }: { locale: Locale }) {
  const t = getProToolsText(locale);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const end = useRef<HTMLDivElement>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const content = text.trim();
    if (!content || busy) return;
    const next: Msg[] = [...msgs, { role: "user", content }];
    setMsgs(next);
    setText("");
    setError("");
    setBusy(true);
    const r = await proFetch<{ reply: string }>("/api/pro/ai", { mode: "tutor", locale, messages: next });
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
          <p key={i} className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm ${m.role === "user" ? "justify-self-end bg-[var(--brand-500)] text-white" : "justify-self-start bg-[var(--surface-muted)]"}`}>
            {m.content}
          </p>
        ))}
        {busy && <p className="text-sm text-[var(--muted)]">{t.thinking}</p>}
        <div ref={end} />
      </div>
      {error && <p className="text-sm font-semibold text-[#ff5d73]">{error}</p>}
      <form onSubmit={send} className="flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} maxLength={500} placeholder={t.tutorPlaceholder} className="min-w-0 flex-1 rounded-xl border-2 border-[var(--edge)] bg-[var(--surface)] px-3 py-2 text-sm" />
        <button type="submit" disabled={busy || !text.trim()} className="btn-bouncy bg-[var(--brand-500)] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
          {t.send}
        </button>
      </form>
    </div>
  );
}
