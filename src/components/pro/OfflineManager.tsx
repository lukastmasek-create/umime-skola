"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import type { Locale } from "@/i18n/config";
import { getProToolsText } from "@/i18n/pro-tools";
import { errorText, proFetch } from "./api";

type CourseHit = { slug: string; title: string; questions: number };
type OfflineQ = { id: string; prompt: string; options: string[]; correctIndex: number; explanation: string };
type OfflineCourse = { slug: string; title: string; questions: OfflineQ[]; savedAt: number };
type Queued = { id: string; correct: boolean };

const CACHE = "ucime-offline-v1";
const QUEUE_KEY = "ucime-offline-queue";
const keyOf = (slug: string) => `/__offline/${slug}`;

async function readAll(): Promise<OfflineCourse[]> {
  if (!("caches" in window)) return [];
  const cache = await caches.open(CACHE);
  const keys = await cache.keys();
  const out: OfflineCourse[] = [];
  for (const k of keys) {
    const res = await cache.match(k);
    if (res) out.push((await res.json()) as OfflineCourse);
  }
  return out.sort((a, b) => a.title.localeCompare(b.title));
}

function readQueue(): Queued[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? "[]") as Queued[];
  } catch {
    return [];
  }
}

// Offline režim: stažení kurzů do zařízení (Cache Storage) a procvičování bez internetu.
// Výsledky se při nejbližším připojení odešlou do opakování.
export function OfflineManager({ locale }: { locale: Locale }) {
  const t = getProToolsText(locale);
  const [downloaded, setDownloaded] = useState<OfflineCourse[]>([]);
  const [hits, setHits] = useState<CourseHit[]>([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const online = useSyncExternalStore(
    (cb) => {
      window.addEventListener("online", cb);
      window.addEventListener("offline", cb);
      return () => {
        window.removeEventListener("online", cb);
        window.removeEventListener("offline", cb);
      };
    },
    () => navigator.onLine,
    () => true,
  );
  const [playing, setPlaying] = useState<OfflineCourse | null>(null);

  const refresh = useCallback(async () => setDownloaded(await readAll()), []);

  const sync = useCallback(async () => {
    const queue = readQueue();
    if (queue.length === 0) return;
    const r = await proFetch("/api/opakovani", { results: queue.slice(0, 60) });
    if (r.ok) localStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(60)));
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) void navigator.serviceWorker.register("/sw.js").catch(() => {});
    void readAll().then(setDownloaded);
    const on = () => void sync();
    window.addEventListener("online", on);
    if (navigator.onLine) void sync();
    return () => window.removeEventListener("online", on);
  }, [sync]);

  async function search(e?: React.FormEvent) {
    e?.preventDefault();
    setError("");
    const r = await proFetch<{ courses: CourseHit[] }>(`/api/pro/offline?q=${encodeURIComponent(q)}`);
    if (r.ok) setHits(r.data.courses);
    else setError(errorText(t, r.error));
  }

  async function download(slug: string) {
    setBusy(slug);
    setError("");
    const r = await proFetch<OfflineCourse>(`/api/pro/offline?slug=${encodeURIComponent(slug)}`);
    if (r.ok && "caches" in window) {
      const cache = await caches.open(CACHE);
      await cache.put(keyOf(slug), new Response(JSON.stringify(r.data), { headers: { "content-type": "application/json" } }));
      await refresh();
    } else if (!r.ok) setError(errorText(t, r.error));
    setBusy("");
  }

  async function remove(slug: string) {
    const cache = await caches.open(CACHE);
    await cache.delete(keyOf(slug));
    await refresh();
  }

  if (playing) return <OfflineQuiz course={playing} onExit={() => { setPlaying(null); if (navigator.onLine) void sync(); }} t={t} />;

  return (
    <div className="grid gap-6">
      <p className={`card p-3 text-sm font-semibold ${online ? "" : "bg-[var(--accent-yellow)] text-[#16132b]"}`}>{online ? t.offlineOnline : t.offlineOffline}</p>
      <section>
        <h2 className="mb-2 text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          {t.offlineSaved}
        </h2>
        {downloaded.length === 0 ? (
          <p className="card p-4 text-sm text-[var(--muted)]">{t.offlineNone}</p>
        ) : (
          <ul className="grid gap-2">
            {downloaded.map((c) => (
              <li key={c.slug} className="card flex flex-wrap items-center justify-between gap-2 p-3">
                <span className="text-sm font-semibold">
                  {c.title} <span className="text-[var(--muted)]">· {c.questions.length}</span>
                </span>
                <span className="flex gap-2">
                  <button type="button" onClick={() => setPlaying(c)} className="btn-bouncy bg-[var(--brand-500)] px-3 py-1.5 text-sm font-bold text-white">
                    {t.offlinePlay}
                  </button>
                  <button type="button" onClick={() => void remove(c.slug)} className="btn-bouncy btn-secondary px-3 py-1.5 text-sm font-bold">
                    {t.offlineRemove}
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h2 className="mb-2 text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          {t.offlineDownload}
        </h2>
        <form onSubmit={search} className="mb-3 flex gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.offlineSearch} className="min-w-0 flex-1 rounded-xl border-2 border-[var(--edge)] bg-[var(--surface)] px-3 py-2 text-sm" />
          <button type="submit" disabled={!online} className="btn-bouncy bg-[var(--brand-500)] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
            {t.search}
          </button>
        </form>
        {error && <p className="mb-2 text-sm font-semibold text-[#ff5d73]">{error}</p>}
        <ul className="grid gap-2">
          {hits.map((c) => {
            const have = downloaded.some((d) => d.slug === c.slug);
            return (
              <li key={c.slug} className="card flex items-center justify-between gap-2 p-3">
                <span className="text-sm font-semibold">
                  {c.title} <span className="text-[var(--muted)]">· {c.questions}</span>
                </span>
                <button type="button" disabled={busy === c.slug || !online} onClick={() => void download(c.slug)} className="btn-bouncy btn-secondary px-3 py-1.5 text-sm font-bold disabled:opacity-50">
                  {busy === c.slug ? t.loading : have ? t.offlineUpdate : t.offlineGet}
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function OfflineQuiz({ course, onExit, t }: { course: OfflineCourse; onExit: () => void; t: ReturnType<typeof getProToolsText> }) {
  const [order] = useState(() => course.questions.map((_, i) => i).sort(() => Math.random() - 0.5).slice(0, 15));
  const [pos, setPos] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [right, setRight] = useState(0);
  const q = course.questions[order[pos]];

  function pick(i: number) {
    if (picked !== null || !q) return;
    setPicked(i);
    const correct = i === q.correctIndex;
    if (correct) setRight((r) => r + 1);
    try {
      const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) ?? "[]") as Queued[];
      localStorage.setItem(QUEUE_KEY, JSON.stringify([...queue, { id: q.id, correct }].slice(-300)));
    } catch {}
  }

  if (!q) {
    return (
      <div className="card p-6 text-center">
        <p className="mb-3 text-xl font-bold">{t.offlineDone.replace("{c}", String(right)).replace("{n}", String(order.length))}</p>
        <button type="button" onClick={onExit} className="btn-bouncy btn-lg bg-[var(--brand-500)] font-bold text-white">
          {t.back}
        </button>
      </div>
    );
  }
  return (
    <div className="grid gap-4">
      <p className="text-sm font-bold text-[var(--muted)]">
        {course.title} · {pos + 1}/{order.length}
      </p>
      <div className="card p-5">
        <p className="mb-4 text-lg font-semibold">{q.prompt}</p>
        <div className="grid gap-2">
          {q.options.map((o, i) => {
            const state = picked === null ? "" : i === q.correctIndex ? "bg-[var(--accent-green)] text-[#16132b]" : i === picked ? "bg-[#ff5d73] text-white" : "";
            return (
              <button key={i} type="button" onClick={() => pick(i)} className={`rounded-xl border-2 border-[var(--edge)] px-4 py-3 text-left text-sm font-semibold ${state || "bg-[var(--surface)]"}`}>
                {o}
              </button>
            );
          })}
        </div>
        {picked !== null && q.explanation && <p className="mt-3 text-sm text-[var(--muted)]">{q.explanation}</p>}
      </div>
      <div className="flex justify-between">
        <button type="button" onClick={onExit} className="btn-bouncy btn-secondary btn-lg">
          {t.offlineExit}
        </button>
        {picked !== null && (
          <button type="button" onClick={() => { setPicked(null); setPos((p) => p + 1); }} className="btn-bouncy btn-lg bg-[var(--brand-500)] font-bold text-white">
            {t.next}
          </button>
        )}
      </div>
    </div>
  );
}
