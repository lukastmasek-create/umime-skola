"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import { getProToolsText } from "@/i18n/pro-tools";
import { errorText, listenOnce, proFetch, speechRecognition } from "./api";

type Msg = { role: "user" | "assistant"; content: string };
type Verdict = { score: number; right: string[]; missing: string[]; advice: string };

const SPEECH_LANG: Record<string, string> = { cs: "cs-CZ", en: "en-US", de: "de-DE", ru: "ru-RU", uk: "uk-UA", ja: "ja-JP", es: "es-ES", fr: "fr-FR" };

// Ústní zkoušení: zkoušející se ptá nahlas (volitelně), žák odpovídá hlasem nebo textem, na konci dostane hodnocení.
export function OralExam({ locale }: { locale: Locale }) {
  const t = getProToolsText(locale);
  const [topic, setTopic] = useState("");
  const [started, setStarted] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [speak, setSpeak] = useState(false);
  const [error, setError] = useState("");
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const stop = useRef<(() => void) | null>(null);
  const canListen = typeof window !== "undefined" && !!speechRecognition();

  useEffect(() => () => { stop.current?.(); window.speechSynthesis?.cancel(); }, []);

  function say(s: string) {
    if (!speak || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(s);
    u.lang = SPEECH_LANG[locale] ?? "cs-CZ";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  async function ask(history: Msg[]) {
    setBusy(true);
    setError("");
    const r = await proFetch<{ reply: string }>("/api/pro/ai", { mode: "oral", locale, topic, messages: history });
    setBusy(false);
    if (!r.ok) return setError(errorText(t, r.error));
    setMsgs([...history, { role: "assistant", content: r.data.reply }]);
    say(r.data.reply);
  }

  async function start(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) return;
    setStarted(true);
    setMsgs([]);
    setVerdict(null);
    await ask([]);
  }

  async function answer(e: React.FormEvent) {
    e.preventDefault();
    const content = text.trim();
    if (!content || busy) return;
    const next: Msg[] = [...msgs, { role: "user", content }];
    setMsgs(next);
    setText("");
    await ask(next);
  }

  async function finish() {
    setBusy(true);
    setError("");
    const r = await proFetch<Verdict>("/api/pro/ai", { mode: "oral", locale, topic, finish: true, messages: msgs });
    setBusy(false);
    if (r.ok) setVerdict(r.data);
    else setError(errorText(t, r.error));
  }

  function mic() {
    if (listening) return stop.current?.();
    setListening(true);
    stop.current = listenOnce(SPEECH_LANG[locale] ?? "cs-CZ", (s) => setText((x) => (x ? x + " " : "") + s), () => setListening(false));
    if (!stop.current) setListening(false);
  }

  if (!started) {
    return (
      <form onSubmit={start} className="card grid gap-3 p-5">
        <p className="text-sm text-[var(--muted)]">{t.oralIntro}</p>
        <input value={topic} onChange={(e) => setTopic(e.target.value)} maxLength={120} placeholder={t.oralTopic} className="rounded-xl border-2 border-[var(--edge)] bg-[var(--surface)] px-3 py-2 text-sm" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={speak} onChange={(e) => setSpeak(e.target.checked)} /> {t.oralSpeak}
        </label>
        <button type="submit" disabled={!topic.trim()} className="btn-bouncy btn-lg bg-[var(--brand-500)] font-bold text-white disabled:opacity-50">
          {t.oralStart}
        </button>
      </form>
    );
  }

  return (
    <div className="grid gap-3">
      <div className="card grid min-h-56 content-start gap-3 p-4" aria-live="polite">
        <p className="text-xs font-bold text-[var(--faint)]">{topic}</p>
        {msgs.map((m, i) => (
          <p key={i} className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm ${m.role === "user" ? "justify-self-end bg-[var(--brand-500)] text-white" : "justify-self-start bg-[var(--surface-muted)]"}`}>
            {m.content}
          </p>
        ))}
        {busy && <p className="text-sm text-[var(--muted)]">{t.thinking}</p>}
      </div>
      {error && <p className="text-sm font-semibold text-[#ff5d73]">{error}</p>}
      {verdict ? (
        <section className="card grid gap-2 p-5">
          <p className="text-3xl font-extrabold">{verdict.score}/10</p>
          {verdict.right.length > 0 && (
            <div>
              <p className="text-sm font-bold text-[var(--accent-green)]">{t.oralRight}</p>
              <ul className="list-disc pl-5 text-sm">{verdict.right.map((x, i) => <li key={i}>{x}</li>)}</ul>
            </div>
          )}
          {verdict.missing.length > 0 && (
            <div>
              <p className="text-sm font-bold text-[#ff5d73]">{t.oralMissing}</p>
              <ul className="list-disc pl-5 text-sm">{verdict.missing.map((x, i) => <li key={i}>{x}</li>)}</ul>
            </div>
          )}
          {verdict.advice && <p className="text-sm text-[var(--muted)]">{verdict.advice}</p>}
          <button type="button" onClick={() => { setStarted(false); setVerdict(null); }} className="btn-bouncy btn-secondary btn-lg w-fit">
            {t.oralAgain}
          </button>
        </section>
      ) : (
        <>
          <form onSubmit={answer} className="flex gap-2">
            <input value={text} onChange={(e) => setText(e.target.value)} maxLength={500} placeholder={t.oralAnswer} className="min-w-0 flex-1 rounded-xl border-2 border-[var(--edge)] bg-[var(--surface)] px-3 py-2 text-sm" />
            {canListen && (
              <button type="button" onClick={mic} aria-pressed={listening} className={`btn-bouncy px-3 py-2 text-sm font-bold ${listening ? "bg-[#ff5d73] text-white" : "btn-secondary"}`}>
                🎤
              </button>
            )}
            <button type="submit" disabled={busy || !text.trim()} className="btn-bouncy bg-[var(--brand-500)] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
              {t.send}
            </button>
          </form>
          <button type="button" onClick={() => void finish()} disabled={busy || msgs.filter((m) => m.role === "user").length === 0} className="btn-bouncy btn-secondary btn-lg w-fit disabled:opacity-50">
            {t.oralFinish}
          </button>
        </>
      )}
    </div>
  );
}
