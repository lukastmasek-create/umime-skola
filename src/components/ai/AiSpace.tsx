"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import { getAiSpaceText, type AiSpaceText } from "@/i18n/ai-space";
import { SPACE_GRADES, SPACE_SUBJECTS, SPACE_TOOLS, chatTitle, type SpaceGrade, type SpaceSubject, type SpaceTool } from "@/lib/pro-tools/ai-space";
import { featureAvailableIn, type ProFeatureSlug } from "@/lib/pro-tools/features";
import { getProToolsText } from "@/i18n/pro-tools";
import { errorText, imageToDataUrl, listenOnce, speechRecognition } from "@/components/pro/api";
import { AiMarkdown } from "./AiMarkdown";

// AI prostor: chaty v postranním panelu (uložené v prohlížeči), režimy (doučovač, vysvětlení, zkoušení…),
// předmět a ročník, fotka úlohy, diktování, čtení nahlas a odkazy na další pomůcky UčímePRO.

type Msg = { role: "user" | "assistant"; content: string; image?: string; hadImage?: boolean; at: number };
type Chat = { id: string; title: string; tool: SpaceTool; subject: SpaceSubject; grade: SpaceGrade; msgs: Msg[]; updated: number };

const STORE_KEY = "umime-ai-space-v1";
const MAX_CHATS = 40;
const SPEECH_LANG: Record<string, string> = { cs: "cs-CZ", en: "en-US", de: "de-DE", ru: "ru-RU", uk: "uk-UA", ja: "ja-JP", es: "es-ES", fr: "fr-FR" };
const TOOL_ICON: Record<SpaceTool, string> = { tutor: "🧑‍🏫", explain: "💡", quiz: "🎯", check: "✏️", summary: "📝", plan: "🗓️", language: "🌍", ideas: "✨" };
const HELPERS: { slug: Extract<ProFeatureSlug, keyof AiSpaceText["links"]> | "code"; icon: string }[] = [
  { slug: "fotka", icon: "📷" },
  { slug: "poznamky", icon: "🗂️" },
  { slug: "ustni", icon: "🎤" },
  { slug: "sesit-chyb", icon: "📕" },
  { slug: "plan", icon: "🗓️" },
  { slug: "zkouska", icon: "🧪" },
  { slug: "vyslovnost", icon: "🔊" },
  { slug: "code", icon: "💻" },
];

// Čas a id jen v obsluze událostí (mimo render), proto pomocné funkce mimo komponentu.
const now = () => Date.now();
const newId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

function loadChats(): Chat[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const list = raw ? (JSON.parse(raw) as Chat[]) : [];
    return Array.isArray(list) ? list.filter((c) => c && typeof c.id === "string" && Array.isArray(c.msgs)) : [];
  } catch {
    return [];
  }
}

function saveChats(chats: Chat[]) {
  try {
    // Fotky se neukládají (velikost úložiště), zůstane jen poznámka, že tam byla.
    const slim = chats.slice(0, MAX_CHATS).map((c) => ({ ...c, msgs: c.msgs.map(({ image, ...m }) => (image ? { ...m, hadImage: true } : m)) }));
    localStorage.setItem(STORE_KEY, JSON.stringify(slim));
  } catch {
    /* plné nebo zakázané úložiště: chat funguje dál bez ukládání */
  }
}

const isToday = (ts: number) => new Date(ts).toDateString() === new Date().toDateString();

export function AiSpace({ locale }: { locale: Locale }) {
  const t = getAiSpaceText(locale);
  const errT = getProToolsText(locale);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Pick<Chat, "tool" | "subject" | "grade">>({ tool: "tutor", subject: "auto", grade: "auto" });
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [drawer, setDrawer] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState<number | null>(null);
  const [copied, setCopied] = useState<number | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [canDictate, setCanDictate] = useState(false);
  const abort = useRef<AbortController | null>(null);
  const stopListen = useRef<(() => void) | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Načtení z localStorage až v prohlížeči (server nemá přístup k úložišti).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChats(loadChats());
    setCanDictate(!!speechRecognition());
    return () => {
      abort.current?.abort();
      stopListen.current?.();
      if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
    };
  }, []);

  const active = chats.find((c) => c.id === activeId) ?? null;
  const settings = active ?? draft;
  const msgs = useMemo(() => active?.msgs ?? [], [active]);
  const toolT = t.tools[settings.tool];

  useEffect(() => {
    box.current?.scrollTo({ top: box.current.scrollHeight, behavior: "smooth" });
  }, [msgs.length, busy]);

  const updateChats = useCallback((fn: (list: Chat[]) => Chat[]) => {
    setChats((prev) => {
      const next = fn(prev).sort((a, b) => b.updated - a.updated);
      saveChats(next);
      return next;
    });
  }, []);

  function setSetting<K extends "tool" | "subject" | "grade">(key: K, value: Chat[K]) {
    if (active) updateChats((list) => list.map((c) => (c.id === active.id ? { ...c, [key]: value } : c)));
    else setDraft((d) => ({ ...d, [key]: value }));
  }

  function newChat(tool?: SpaceTool) {
    abort.current?.abort();
    setActiveId(null);
    setDraft((d) => ({ ...d, tool: tool ?? d.tool }));
    setText("");
    setPhoto(null);
    setError("");
    setDrawer(false);
    setTimeout(() => input.current?.focus(), 0);
  }

  async function request(chat: Chat, history: Msg[]) {
    setBusy(true);
    setError("");
    const ctrl = new AbortController();
    abort.current = ctrl;
    const last = history[history.length - 1];
    try {
      const res = await fetch("/api/pro/ai", {
        method: "POST",
        headers: { "content-type": "application/json" },
        signal: ctrl.signal,
        body: JSON.stringify({
          mode: "chat",
          locale,
          tool: chat.tool,
          subject: chat.subject,
          grade: chat.grade,
          messages: history.map(({ role, content, hadImage }) => ({ role, content: hadImage ? `[${t.photoNote}] ${content}` : content })),
          image: last?.role === "user" ? last.image : undefined,
        }),
      });
      const d = (await res.json().catch(() => ({}))) as { reply?: string; error?: string };
      if (!res.ok || !d.reply) {
        setError(errorText(errT, d.error ?? "unavailable"));
      } else {
        const reply: Msg = { role: "assistant", content: d.reply, at: now() };
        updateChats((list) => list.map((c) => (c.id === chat.id ? { ...c, msgs: [...history, reply], updated: now() } : c)));
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError(errorText(errT, "network"));
    }
    if (abort.current === ctrl) abort.current = null;
    setBusy(false);
  }

  function send(raw?: string) {
    const typed = (raw ?? text).trim();
    if ((!typed && !photo) || busy) return;
    const content = typed || t.photoDefault;
    const userMsg: Msg = { role: "user", content, image: photo ?? undefined, at: now() };
    let chat: Chat;
    if (active) {
      chat = { ...active, msgs: [...active.msgs, userMsg], updated: now() };
      updateChats((list) => list.map((c) => (c.id === chat.id ? chat : c)));
    } else {
      chat = { id: newId(), title: chatTitle(content), ...draft, msgs: [userMsg], updated: now() };
      updateChats((list) => [chat, ...list]);
      setActiveId(chat.id);
    }
    setText("");
    setPhoto(null);
    void request(chat, chat.msgs);
  }

  function regenerate() {
    if (!active || busy) return;
    const lastUser = active.msgs.map((m) => m.role).lastIndexOf("user");
    if (lastUser < 0) return;
    const history = active.msgs.slice(0, lastUser + 1);
    updateChats((list) => list.map((c) => (c.id === active.id ? { ...c, msgs: history } : c)));
    void request(active, history);
  }

  function retry() {
    if (!active || busy) return;
    const last = active.msgs[active.msgs.length - 1];
    if (last?.role === "user") void request(active, active.msgs);
  }

  function stop() {
    abort.current?.abort();
    abort.current = null;
    setBusy(false);
  }

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      setPhoto(await imageToDataUrl(file));
    } catch {
      setError(errT.errGeneric);
    }
  }

  function dictate() {
    if (listening) {
      stopListen.current?.();
      return;
    }
    setListening(true);
    stopListen.current = listenOnce(SPEECH_LANG[locale] ?? "cs-CZ", (s) => setText((x) => (x ? x + " " : "") + s), () => setListening(false));
    if (!stopListen.current) setListening(false);
  }

  function readAloud(i: number, content: string) {
    if (typeof speechSynthesis === "undefined") return;
    speechSynthesis.cancel();
    if (speaking === i) {
      setSpeaking(null);
      return;
    }
    const plain = content.replace(/```[\s\S]*?```/g, "").replace(/[*_#>`~|]/g, "").replace(/\[(.*?)\]\(.*?\)/g, "$1");
    const u = new SpeechSynthesisUtterance(plain);
    u.lang = SPEECH_LANG[locale] ?? "cs-CZ";
    u.onend = () => setSpeaking(null);
    setSpeaking(i);
    speechSynthesis.speak(u);
  }

  function copy(i: number, content: string) {
    void navigator.clipboard?.writeText(content).then(() => {
      setCopied(i);
      setTimeout(() => setCopied(null), 1500);
    });
  }

  function remove(id: string) {
    if (!confirm(t.delConfirm)) return;
    updateChats((list) => list.filter((c) => c.id !== id));
    if (activeId === id) newChat();
  }

  function rename(id: string, title: string) {
    const v = title.trim().slice(0, 60);
    if (v) updateChats((list) => list.map((c) => (c.id === id ? { ...c, title: v } : c)));
    setRenaming(null);
  }

  const q = query.trim().toLowerCase();
  const filtered = q ? chats.filter((c) => c.title.toLowerCase().includes(q) || c.msgs.some((m) => m.content.toLowerCase().includes(q))) : chats;
  const groups = [
    { label: t.today, items: filtered.filter((c) => isToday(c.updated)) },
    { label: t.earlier, items: filtered.filter((c) => !isToday(c.updated)) },
  ].filter((g) => g.items.length);
  const lastIsUser = msgs[msgs.length - 1]?.role === "user";

  const sidebar = (
    <nav aria-label={t.menu} className="flex h-full min-h-0 flex-col gap-3">
      <button type="button" onClick={() => newChat()} className="btn-bouncy btn-cta btn-primary flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-extrabold">
        <span aria-hidden>＋</span> {t.newChat}
      </button>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t.search}
        aria-label={t.search}
        className="rounded-xl border-2 border-[var(--border-soft)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--faint)] focus:border-[var(--accent-green)]"
      />
      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {groups.length === 0 && <p className="px-1 py-2 text-xs text-[var(--faint)]">{t.noChats}</p>}
        {groups.map((g) => (
          <div key={g.label} className="mb-3">
            <p className="mb-1 px-1 text-[11px] font-extrabold uppercase tracking-wider text-[var(--faint)]">{g.label}</p>
            <ul className="grid gap-0.5">
              {g.items.map((c) => (
                <li key={c.id} className={`group flex items-center gap-1 rounded-xl ${c.id === activeId ? "bg-[var(--surface-muted)]" : "hover:bg-[var(--surface-muted)]"}`}>
                  {renaming === c.id ? (
                    <input
                      autoFocus
                      defaultValue={c.title}
                      aria-label={t.rename}
                      onBlur={(e) => rename(c.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") rename(c.id, e.currentTarget.value);
                        if (e.key === "Escape") setRenaming(null);
                      }}
                      className="m-1 min-w-0 flex-1 rounded-lg border-2 border-[var(--accent-green)] bg-[var(--surface)] px-2 py-1 text-sm"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveId(c.id);
                        setError("");
                        setDrawer(false);
                      }}
                      aria-current={c.id === activeId ? "page" : undefined}
                      className="flex min-w-0 flex-1 items-center gap-2 px-2 py-2 text-left text-sm"
                    >
                      <span aria-hidden>{TOOL_ICON[c.tool] ?? "💬"}</span>
                      <span className="truncate font-semibold">{c.title}</span>
                    </button>
                  )}
                  {renaming !== c.id && (
                    <span className="flex shrink-0 opacity-100 sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
                      <button type="button" onClick={() => setRenaming(c.id)} title={t.rename} aria-label={`${t.rename}: ${c.title}`} className="rounded-md px-1.5 py-1 text-xs hover:bg-[var(--surface)]">
                        ✎
                      </button>
                      <button type="button" onClick={() => remove(c.id)} title={t.del} aria-label={`${t.del}: ${c.title}`} className="rounded-md px-1.5 py-1 text-xs hover:bg-[var(--surface)]">
                        🗑
                      </button>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t-2 border-[var(--border-soft)] pt-3">
        <p className="mb-1.5 px-1 text-[11px] font-extrabold uppercase tracking-wider text-[var(--faint)]">{t.helpers}</p>
        <ul className="grid grid-cols-2 gap-1">
          {HELPERS.filter((h) => h.slug === "code" || featureAvailableIn(h.slug, locale)).map((h) => (
            <li key={h.slug}>
              <Link href={h.slug === "code" ? `/${locale}/code` : `/${locale}/pro/${h.slug}`} className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-bold hover:bg-[var(--surface-muted)]">
                <span aria-hidden>{h.icon}</span>
                <span className="truncate">{t.links[h.slug]}</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-2 px-1 text-[11px] text-[var(--faint)]">{t.savedLocal}</p>
      </div>
    </nav>
  );

  const selectCls = "rounded-lg border-2 border-[var(--border-soft)] bg-[var(--surface-muted)] px-2 py-1 text-xs font-bold text-[var(--foreground)] focus:border-[var(--accent-green)]";

  return (
    <div className="card relative grid h-[min(85dvh,56rem)] min-h-[32rem] grid-cols-1 overflow-hidden p-0 md:grid-cols-[16.5rem_1fr]">
      {/* Postranní panel: na mobilu jako vysouvací zásuvka. */}
      <aside className="hidden min-h-0 border-r-2 border-[var(--border-soft)] p-3 md:block">{sidebar}</aside>
      {drawer && (
        <div className="absolute inset-0 z-20 flex md:hidden">
          <div className="h-full w-[min(18rem,85%)] bg-[var(--surface)] p-3 shadow-xl">{sidebar}</div>
          <button type="button" aria-label={t.close} onClick={() => setDrawer(false)} className="flex-1 bg-black/40" />
        </div>
      )}

      <section className="flex min-h-0 min-w-0 flex-col">
        <header className="flex flex-wrap items-center gap-2 border-b-2 border-[var(--border-soft)] px-3 py-2">
          <button type="button" onClick={() => setDrawer(true)} aria-label={t.menu} className="rounded-lg px-2 py-1 text-lg md:hidden">
            ☰
          </button>
          <label className="flex items-center gap-1 text-xs font-bold text-[var(--muted)]">
            <span className="sr-only sm:not-sr-only">{t.tool}</span>
            <select value={settings.tool} onChange={(e) => setSetting("tool", e.target.value as SpaceTool)} className={selectCls}>
              {SPACE_TOOLS.map((k) => (
                <option key={k} value={k}>
                  {TOOL_ICON[k]} {t.tools[k].name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-1 text-xs font-bold text-[var(--muted)]">
            <span className="sr-only sm:not-sr-only">{t.subject}</span>
            <select value={settings.subject} onChange={(e) => setSetting("subject", e.target.value as SpaceSubject)} className={selectCls}>
              {SPACE_SUBJECTS.map((k) => (
                <option key={k} value={k}>
                  {t.subjects[k]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-1 text-xs font-bold text-[var(--muted)]">
            <span className="sr-only sm:not-sr-only">{t.grade}</span>
            <select value={settings.grade} onChange={(e) => setSetting("grade", e.target.value as SpaceGrade)} className={selectCls}>
              {SPACE_GRADES.map((k) => (
                <option key={k} value={k}>
                  {t.grades[k]}
                </option>
              ))}
            </select>
          </label>
          {active && <h2 className="ml-auto hidden max-w-[40%] truncate text-sm font-extrabold lg:block">{active.title}</h2>}
        </header>

        <div ref={box} role="log" aria-live="polite" className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-6">
          {msgs.length === 0 ? (
            <div className="mx-auto grid max-w-2xl gap-5 py-4">
              <div className="text-center">
                <p className="text-4xl" aria-hidden>
                  {TOOL_ICON[settings.tool]}
                </p>
                <h2 className="mt-2 text-xl font-extrabold">{t.hello}</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">{t.helloSub}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {SPACE_TOOLS.map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setSetting("tool", k)}
                    aria-pressed={settings.tool === k}
                    className={`grid gap-0.5 rounded-2xl border-2 p-2.5 text-left transition-colors ${
                      settings.tool === k ? "border-[var(--accent-green)] bg-[var(--surface-muted)]" : "border-[var(--border-soft)] hover:border-[var(--field-border)]"
                    }`}
                  >
                    <span className="text-lg" aria-hidden>
                      {TOOL_ICON[k]}
                    </span>
                    <span className="text-sm font-extrabold leading-tight">{t.tools[k].name}</span>
                    <span className="text-[11px] leading-snug text-[var(--muted)]">{t.tools[k].desc}</span>
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {toolT.ideas.map((idea) => (
                  <button key={idea} type="button" onClick={() => send(idea)} className="rounded-full border-2 border-[var(--border-soft)] px-3 py-1.5 text-xs font-bold text-[var(--muted)] hover:border-[var(--accent-green)] hover:text-[var(--foreground)]">
                    {idea}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto grid max-w-3xl gap-4">
              {msgs.map((m, i) =>
                m.role === "user" ? (
                  <div key={i} className="grid max-w-[85%] justify-self-end gap-2 rounded-2xl rounded-br-md bg-[var(--brand-500)] px-4 py-2 text-sm text-white">
                    {m.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.image} alt={t.photoAlt} className="max-h-56 rounded-xl object-contain" />
                    )}
                    {m.hadImage && !m.image && <span className="text-xs opacity-80">📷 {t.photoNote}</span>}
                    <p className="whitespace-pre-wrap break-words">{m.content}</p>
                  </div>
                ) : (
                  <div key={i} className="flex gap-3">
                    <span aria-hidden className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full text-sm" style={{ background: "radial-gradient(circle at 30% 30%, #d9ccff, #6c3df0 55%, #2a1a7a)" }}>
                      ✦
                    </span>
                    <div className="min-w-0 flex-1">
                      <AiMarkdown text={m.content} copyLabel={t.copy} copiedLabel={t.copied} />
                      <div className="mt-1.5 flex flex-wrap gap-1 text-xs text-[var(--muted)]">
                        <button type="button" onClick={() => copy(i, m.content)} className="rounded-md px-2 py-1 font-bold hover:bg-[var(--surface-muted)]">
                          {copied === i ? `✓ ${t.copied}` : `⧉ ${t.copy}`}
                        </button>
                        <button type="button" onClick={() => readAloud(i, m.content)} className="rounded-md px-2 py-1 font-bold hover:bg-[var(--surface-muted)]">
                          {speaking === i ? `■ ${t.stopReading}` : `🔊 ${t.readAloud}`}
                        </button>
                        {i === msgs.length - 1 && !busy && (
                          <button type="button" onClick={regenerate} className="rounded-md px-2 py-1 font-bold hover:bg-[var(--surface-muted)]">
                            ↻ {t.regenerate}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ),
              )}
              {busy && (
                <p className="flex items-center gap-2 text-sm text-[var(--muted)]" role="status">
                  <span className="inline-flex gap-1" aria-hidden>
                    <span className="size-1.5 animate-bounce rounded-full bg-current" />
                    <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:120ms]" />
                    <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:240ms]" />
                  </span>
                  {t.thinking}
                </p>
              )}
              {error && (
                <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[var(--danger)]" role="alert">
                  {error}
                  {lastIsUser && !busy && (
                    <button type="button" onClick={retry} className="rounded-md border-2 border-current px-2 py-0.5 text-xs">
                      {t.retry}
                    </button>
                  )}
                </p>
              )}
            </div>
          )}
          {msgs.length === 0 && error && (
            <p className="mt-2 text-center text-sm font-semibold text-[var(--danger)]" role="alert">
              {error}
            </p>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="border-t-2 border-[var(--border-soft)] px-3 pb-2 pt-2 sm:px-6"
        >
          <div className="mx-auto max-w-3xl">
            {photo && (
              <div className="mb-2 flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo} alt={t.photoAlt} className="h-14 rounded-lg border-2 border-[var(--edge)] object-cover" />
                <button type="button" onClick={() => setPhoto(null)} className="text-xs font-bold text-[var(--muted)] underline">
                  {t.removePhoto}
                </button>
              </div>
            )}
            <div className="flex items-end gap-1.5 rounded-2xl border-2 border-[var(--field-border)] bg-[var(--surface-muted)] p-1.5 focus-within:border-[var(--accent-green)]">
              <label className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-xl hover:bg-[var(--surface)]" title={t.attach}>
                <span aria-hidden>📷</span>
                <span className="sr-only">{t.attach}</span>
                <input type="file" accept="image/*" onChange={pick} disabled={busy} className="sr-only" />
              </label>
              {canDictate && (
                <button type="button" onClick={dictate} title={listening ? t.listening : t.dictate} aria-label={listening ? t.listening : t.dictate} aria-pressed={listening} className={`grid size-9 shrink-0 place-items-center rounded-xl hover:bg-[var(--surface)] ${listening ? "animate-pulse bg-[var(--surface)]" : ""}`}>
                  🎙️
                </button>
              )}
              <textarea
                ref={input}
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 180) + "px";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={1}
                maxLength={2000}
                placeholder={listening ? t.listening : toolT.ph}
                aria-label={toolT.ph}
                className="ai-composer max-h-44 min-h-9 min-w-0 flex-1 resize-none px-1 py-2 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--faint)]"
              />
              {busy ? (
                <button type="button" onClick={stop} className="btn-bouncy shrink-0 rounded-xl bg-[var(--surface)] px-3 py-2 text-sm font-extrabold">
                  ■ {t.stop}
                </button>
              ) : (
                <button type="submit" disabled={!text.trim() && !photo} className="btn-bouncy btn-cta btn-primary shrink-0 px-3 py-2 text-sm font-extrabold disabled:opacity-50">
                  {t.send}
                </button>
              )}
            </div>
            <p className="mt-1 flex flex-wrap justify-between gap-x-3 text-[11px] text-[var(--faint)]">
              <span>{t.disclaimer}</span>
              <span className="hidden sm:inline">{t.hint}</span>
            </p>
          </div>
        </form>
      </section>
    </div>
  );
}
