"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Locale } from "@/i18n/config";
import { getProToolsText } from "@/i18n/pro-tools";
import { compareWords, pronunciationScore, type WordCheck } from "@/lib/pro-tools/pronunciation";
import { listenOnce, speechRecognition } from "./api";

const LANGS = [
  { code: "en-US", label: "English" },
  { code: "de-DE", label: "Deutsch" },
  { code: "fr-FR", label: "Français" },
  { code: "es-ES", label: "Español" },
  { code: "ru-RU", label: "Русский" },
  { code: "cs-CZ", label: "Čeština" },
];

// Hlasové procvičování výslovnosti: žák řekne větu a porovná se s tím, co rozpoznávání řeči slyšelo.
export function Pronunciation({ locale }: { locale: Locale }) {
  const t = getProToolsText(locale);
  const [lang, setLang] = useState("en-US");
  const [target, setTarget] = useState("");
  const [heard, setHeard] = useState("");
  const [listening, setListening] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [words, setWords] = useState<WordCheck[]>([]);
  const stop = useRef<(() => void) | null>(null);
  const supported = useSyncExternalStore(
    () => () => {},
    () => !!speechRecognition(),
    () => true,
  );

  useEffect(() => () => stop.current?.(), []);

  function hear() {
    if (!target.trim()) return;
    if (listening) return stop.current?.();
    setHeard("");
    setScore(null);
    setListening(true);
    let got = "";
    stop.current = listenOnce(
      lang,
      (s) => {
        got = s;
        setHeard(s);
        setScore(pronunciationScore(target, s));
        setWords(compareWords(target, s));
      },
      () => {
        setListening(false);
        if (!got) setScore(0);
      },
    );
    if (!stop.current) setListening(false);
  }

  function play() {
    if (!target.trim() || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(target);
    u.lang = lang;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  return (
    <div className="card grid gap-4 p-5">
      <p className="text-sm text-[var(--muted)]">{t.pronIntro}</p>
      {!supported && <p className="text-sm font-semibold text-[#ff5d73]">{t.pronUnsupported}</p>}
      <div className="flex flex-wrap gap-2">
        {LANGS.map((l) => (
          <button key={l.code} type="button" onClick={() => setLang(l.code)} className={`btn-bouncy px-3 py-1.5 text-sm font-bold ${lang === l.code ? "bg-[var(--brand-500)] text-white" : "btn-secondary"}`}>
            {l.label}
          </button>
        ))}
      </div>
      <input value={target} onChange={(e) => setTarget(e.target.value)} maxLength={120} placeholder={t.pronPlaceholder} className="rounded-xl border-2 border-[var(--edge)] bg-[var(--surface)] px-3 py-2 text-sm" />
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={play} disabled={!target.trim()} className="btn-bouncy btn-secondary btn-lg disabled:opacity-50">
          🔊 {t.pronListen}
        </button>
        <button type="button" onClick={hear} disabled={!supported || !target.trim()} className={`btn-bouncy btn-lg font-bold disabled:opacity-50 ${listening ? "bg-[#ff5d73] text-white" : "bg-[var(--brand-500)] text-white"}`}>
          🎤 {listening ? t.pronStop : t.pronSpeak}
        </button>
      </div>
      {score !== null && (
        <div className="grid gap-2">
          <p className="text-4xl font-extrabold tabular-nums">{score} %</p>
          {heard && (
            <p className="text-sm">
              <span className="font-bold">{t.pronHeard}: </span>
              {heard}
            </p>
          )}
          {words.length > 0 && (
            <p className="flex flex-wrap gap-1.5 text-sm font-semibold">
              {words.map((w, i) => (
                <span key={i} className={`rounded-lg px-2 py-0.5 ${w.ok ? "bg-[var(--accent-green)] text-[#16132b]" : "bg-[#ff5d73] text-white"}`}>
                  {w.word}
                </span>
              ))}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
