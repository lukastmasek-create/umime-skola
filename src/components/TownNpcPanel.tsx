"use client";

import { useEffect, useState } from "react";
import { getTownLifeText } from "@/i18n/town-life";
import { ASKS_PER_DAY, GIFTS, HEART_AT, MAX_HEARTS, NPC_DEF, type GiftId, type NpcKey, type NpcSnapshot } from "@/lib/town-npc";
import { notifyAccountChanged } from "@/lib/account-events";
import { sfx } from "@/lib/market-sfx";
import { Portrait, useTypewriter, type Art } from "@/components/TownNarrator";
import type { Locale } from "@/i18n/config";

const pickLine = (lines: string[]) => lines[Math.floor(Math.random() * lines.length)];

type View = "menu" | "gift" | "question" | "answer";
type Question = { prompt: string; options: string[] };
type Answer = { correct: boolean; correctIndex: number; explanation: string; choice: number };

// Rozhovor s obyvatelem městečka: srdíčka (přátelství), povídání, otázka z učiva a dárky. Server drží stav (api/mestecko/npc).
export function TownNpcPanel({
  locale,
  npc,
  art,
  loggedIn,
  snap,
  points,
  onClose,
  onUpdate,
  onTalking,
}: {
  locale: Locale;
  npc: NpcKey;
  art: Art;
  loggedIn: boolean;
  snap: NpcSnapshot | null;
  points: number;
  onClose: () => void;
  onUpdate: (snap: NpcSnapshot, points: number, levelUp: boolean) => void;
  onTalking?: (talking: boolean) => void; // figurka v městečku poskakuje, dokud mluví
}) {
  const t = getTownLifeText(locale);
  const text = t.npc[npc];
  const def = NPC_DEF[npc];
  const [view, setView] = useState<View>("menu");
  const [line, setLine] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const state = snap?.[npc];
  const hearts = state?.hearts ?? 0;

  const pick = pickLine;
  useEffect(() => {
    const id = window.setTimeout(() => {
      const h = new Date().getHours();
      const base = pickLine(text.greet);
      const hello = h < 11 ? t.morning : h >= 18 ? t.evening : "";
      // „Dobré ráno!“ jen tehdy, když ho pozdrav už neobsahuje
      setLine(hello && !base.toLowerCase().includes(hello.toLowerCase().replace(/[!.]/g, "")) ? `${hello} ${base}` : base);
    }, 0);
    return () => window.clearTimeout(id);
  }, [npc, text, t]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function post(body: Record<string, unknown>) {
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch("/api/mestecko/npc", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ npc, ...body }) });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        onUpdate(json.npc, json.points, !!json.levelUp);
        if (json.gained > 0 || json.xp > 0) notifyAccountChanged();
        return json as { gained: number; levelUp: boolean; hearts: number } & Record<string, unknown>;
      }
      return { error: json.error ?? "unavailable" } as { error: string };
    } catch {
      return { error: "unavailable" } as { error: string };
    } finally {
      setBusy(false);
    }
  }

  function bonusNote(r: { gained?: number; levelUp?: boolean; hearts?: number }) {
    const parts: string[] = [];
    if (r.gained && r.gained > 0) parts.push(t.ui.gained.replace("{n}", String(r.gained)));
    if (r.levelUp) parts.push(t.ui.levelUp.replace("{n}", String(5 * (r.hearts ?? 1))));
    return parts.length ? parts.join(" · ") : null;
  }

  async function talk() {
    setView("menu");
    if (!loggedIn) {
      setLine(pick(text.chat));
      setNote(t.ui.login);
      sfx.pop();
      return;
    }
    const r = await post({ action: "talk" });
    setLine(pick(text.chat));
    sfx.pop();
    if ("error" in r) setNote(r.error === "done" ? t.ui.alreadyTalked : r.error === "unavailable" ? t.ui.error : t.ui.error);
    else {
      setNote(bonusNote(r));
      if (r.levelUp) sfx.dock();
    }
  }

  async function ask() {
    if (!loggedIn) return setNote(t.ui.login);
    const r = await post({ action: "ask" });
    if ("error" in r) {
      setNote(r.error === "limit" ? t.ui.noMoreQuestions : r.error === "no-questions" ? t.ui.noQuestions : t.ui.error);
      return;
    }
    setQuestion(r.question as Question);
    setAnswer(null);
    setView("question");
    setLine(t.ui.questionIntro);
    sfx.pop();
  }

  async function reply(choice: number) {
    const r = await post({ action: "answer", choice });
    if ("error" in r) {
      setNote(t.ui.error);
      setView("menu");
      return;
    }
    setAnswer({ correct: !!r.correct, correctIndex: Number(r.correctIndex), explanation: String(r.explanation ?? ""), choice });
    setView("answer");
    setLine(r.correct ? t.ui.correct : t.ui.wrong);
    setNote(bonusNote(r));
    if (r.correct) sfx.dock();
    else sfx.creak();
  }

  async function give(g: GiftId) {
    const r = await post({ action: "gift", gift: g });
    setView("menu");
    if ("error" in r) {
      setNote(r.error === "done" ? t.ui.alreadyGifted : r.error === "not-enough" ? t.ui.notEnough : t.ui.error);
      return;
    }
    setLine(r.liked ? t.ui.giftLiked : t.ui.giftOther);
    setNote(bonusNote(r));
    sfx.dock();
  }

  const typed = useTypewriter(line, 48);
  useEffect(() => {
    onTalking?.(!typed.done);
  }, [typed.done, onTalking]);
  const next = hearts < MAX_HEARTS ? HEART_AT[hearts + 1] : null;
  const fp = state?.fp ?? 0;
  const from = HEART_AT[hearts];
  const progress = next === null ? 1 : (fp - from) / Math.max(1, next - from);
  const btn = "btn-bouncy bg-[var(--surface)] px-3 py-2 text-sm font-bold disabled:opacity-50";

  return (
    <div role="dialog" aria-label={text.name} className="town-panel-in pointer-events-auto absolute inset-x-2 bottom-2 z-[80] sm:inset-x-8">
      <div className="mx-auto flex max-w-3xl gap-3 rounded-3xl border-2 border-[var(--edge)] bg-[var(--surface)] p-3 shadow-[0_6px_0_var(--shadow-ink)] sm:p-4">
        <div className="flex shrink-0 flex-col items-center gap-1">
          <Portrait art={art} talking={!typed.done} className="h-20 w-20 sm:h-24 sm:w-24" />
          <div className="text-center text-[11px] font-extrabold leading-tight">
            <div>{text.name}</div>
            <div className="font-semibold text-[var(--muted)]">{text.role}</div>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div aria-label={`${t.ui.friendship}: ${hearts}/${MAX_HEARTS}`} className="flex items-center gap-1 text-lg leading-none">
              {Array.from({ length: MAX_HEARTS }, (_, i) => (
                <span key={i} className={i < hearts ? "" : "opacity-30 grayscale"}>
                  ❤️
                </span>
              ))}
              <span className="ml-2 h-2 w-16 overflow-hidden rounded-full bg-[var(--surface-muted)]" aria-hidden>
                <span className="block h-full rounded-full bg-[#ff5d73]" style={{ width: `${Math.round(progress * 100)}%` }} />
              </span>
            </div>
            <button type="button" onClick={onClose} className="rounded-full px-2 text-lg font-bold leading-none hover:bg-[var(--surface-muted)]" aria-label={t.ui.close}>
              ×
            </button>
          </div>
          <p onClick={typed.finish} className="relative mb-2 min-h-[2.6rem] rounded-2xl bg-[var(--surface-muted)] px-3 py-2 text-sm font-semibold sm:text-base" aria-live="polite">
            {typed.text}
            {!typed.done && <span className="town-caret" aria-hidden />}
          </p>
          {note && (
            <p role="status" className="mb-2 text-xs font-bold text-[var(--brand-500)]">
              {note}
            </p>
          )}
          {view === "menu" && (
            <div className="flex flex-wrap gap-2">
              <button type="button" className={btn} onClick={talk} disabled={busy}>
                💬 {t.ui.talk}
              </button>
              {def.asks && (
                <button type="button" className={btn} onClick={ask} disabled={busy || (state ? state.asksLeft <= 0 : false)}>
                  ❓ {t.ui.ask}
                  {loggedIn && state ? ` (${state.asksLeft}/${ASKS_PER_DAY})` : ""}
                </button>
              )}
              <button type="button" className={btn} onClick={() => (loggedIn ? setView("gift") : setNote(t.ui.login))} disabled={busy}>
                🎁 {t.ui.gift}
              </button>
            </div>
          )}
          {view === "gift" && (
            <div>
              <p className="mb-1 text-xs font-bold text-[var(--muted)]">
                {t.ui.chooseGift} · {points} {t.ui.points} · {text.likeHint}
              </p>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(GIFTS) as GiftId[]).map((g) => (
                  <button key={g} type="button" className={btn} onClick={() => give(g)} disabled={busy || points < GIFTS[g].cost || !!state?.gifted}>
                    {GIFTS[g].icon} {t.gifts[g]} · {GIFTS[g].cost}
                  </button>
                ))}
                <button type="button" className={btn} onClick={() => setView("menu")}>
                  ←
                </button>
              </div>
            </div>
          )}
          {view === "question" && question && (
            <div>
              <p className="mb-2 text-sm font-extrabold">{question.prompt}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {question.options.map((o, i) => (
                  <button key={i} type="button" className={`${btn} text-left`} onClick={() => reply(i)} disabled={busy}>
                    {o}
                  </button>
                ))}
              </div>
            </div>
          )}
          {view === "answer" && question && answer && (
            <div>
              <p className="mb-2 text-sm">
                <span className="font-extrabold">{question.options[answer.correctIndex]}</span>
                {answer.explanation && (
                  <span className="text-[var(--muted)]">
                    {" "}
                    · {t.ui.explanation}: {answer.explanation}
                  </span>
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                {(state?.asksLeft ?? 0) > 0 && (
                  <button type="button" className={btn} onClick={ask} disabled={busy}>
                    ❓ {t.ui.nextQuestion}
                  </button>
                )}
                <button type="button" className={btn} onClick={() => setView("menu")}>
                  {t.ui.thanks}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
