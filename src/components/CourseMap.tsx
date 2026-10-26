"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fill } from "@/i18n/profile";
import { getReviewText } from "@/i18n/review";
import { gradeLabel } from "@/i18n/grades";
import { courseStatus, type CourseProgress, type CourseStatus } from "@/lib/review";
import type { Locale } from "@/i18n/config";

export type MapCourse = { id: string; title: string; slug: string; grade: number | null };
export type MapSubject = { value: string; label: string; emoji: string; color: string; courses: MapCourse[] };

const STATUS_ICON: Record<CourseStatus, string> = { new: "○", started: "◐", done: "●" };

// Osobní mapa kurzů: u každého předmětu jsou kurzy po třídách a barevně se
// ukazuje, co je nové, rozpracované a zvládnuté. Nahoře jsou tipy, kam dál.
export function CourseMap({ locale, subjects }: { locale: Locale; subjects: MapSubject[] }) {
  const t = getReviewText(locale);
  const [progress, setProgress] = useState<Record<string, CourseProgress>>({});
  const [due, setDue] = useState(0);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    fetch("/api/opakovani?map=1")
      .then((r) => r.json())
      .then((d) => {
        if (!d.loggedIn || d.error) return;
        setLoggedIn(true);
        setProgress(d.courses ?? {});
        setDue(d.due ?? 0);
      })
      .catch(() => {});
  }, []);

  const href = (c: MapCourse) => `/${locale}/kurzy/zakladni/${c.slug}`;
  const statusOf = (c: MapCourse) => courseStatus(progress[c.id]);
  const label = (s: CourseStatus) => (s === "done" ? t.statusDone : s === "started" ? t.statusStarted : t.statusNew);

  // Tip: v každém předmětu, kde už hráč něco dělal, nejdřív rozpracovaný kurz,
  // jinak první nový od nejnižší třídy. Bez historie první nový kurz předmětů.
  const touched = subjects.filter((s) => s.courses.some((c) => statusOf(c) !== "new"));
  const pickFrom = touched.length > 0 ? touched : subjects;
  const recommended = pickFrom
    .flatMap((s) => {
      const open = s.courses.find((c) => statusOf(c) === "started") ?? s.courses.find((c) => statusOf(c) === "new");
      return open ? [{ subject: s, course: open }] : [];
    })
    .slice(0, 4);

  const done = subjects.reduce((n, s) => n + s.courses.filter((c) => statusOf(c) === "done").length, 0);
  const heading = { fontFamily: "var(--font-heading)" } as const;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center gap-3">
        {loggedIn && <span className="pill bg-[var(--surface-muted)] px-3 py-1.5 text-sm font-bold">🏁 {fill(t.progress, done)}</span>}
        {loggedIn && due > 0 && (
          <Link href={`/${locale}/opakovani`} className="btn-bouncy bg-[var(--accent-yellow)] px-4 py-2 text-sm font-bold text-[#16132b]">
            🔁 {fill(t.reviewCta, due)}
          </Link>
        )}
      </div>

      {recommended.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-extrabold" style={heading}>
            {t.recommended}
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {recommended.map(({ subject, course }) => (
              <li key={course.id}>
                <Link
                  href={href(course)}
                  className="card card-hover flex items-center gap-3 p-4"
                  style={{ borderColor: subject.color }}
                >
                  <span className="text-3xl" aria-hidden>
                    {subject.emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold">{course.title}</span>
                    <span className="text-xs text-[var(--muted)]">
                      {subject.label} · {label(statusOf(course))}
                    </span>
                  </span>
                  <span className="text-sm font-bold text-[var(--brand-600)]">{t.startCourse} →</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex flex-wrap gap-4 text-xs font-semibold text-[var(--muted)]">
        {(["new", "started", "done"] as CourseStatus[]).map((s) => (
          <span key={s}>
            {STATUS_ICON[s]} {label(s)}
          </span>
        ))}
      </div>

      {subjects.map((subject) => {
        const grades = [...new Set(subject.courses.map((c) => c.grade ?? 0))].sort((a, b) => a - b);
        const finished = subject.courses.filter((c) => statusOf(c) === "done").length;
        return (
          <details key={subject.value} className="card p-4 sm:p-5" open={touched.includes(subject)}>
            <summary className="flex cursor-pointer items-center gap-3">
              <span className="text-2xl" aria-hidden>
                {subject.emoji}
              </span>
              <span className="flex-1 text-lg font-extrabold" style={heading}>
                {subject.label}
              </span>
              <span className="text-sm font-bold text-[var(--muted)]">
                {finished} / {subject.courses.length}
              </span>
            </summary>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full border-2 border-[var(--edge)] bg-[var(--surface-muted)]">
              <div
                className="h-full"
                style={{ width: `${subject.courses.length ? (finished / subject.courses.length) * 100 : 0}%`, background: subject.color }}
              />
            </div>
            {grades.map((grade) => (
              <div key={grade} className="mt-4">
                {grade > 0 && <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--muted)]">{gradeLabel(locale, "zakladni", grade)}</p>}
                <ul className="flex flex-wrap gap-2">
                  {subject.courses
                    .filter((c) => (c.grade ?? 0) === grade)
                    .map((c) => {
                      const status = statusOf(c);
                      const best = progress[c.id]?.best;
                      return (
                        <li key={c.id}>
                          <Link
                            href={href(c)}
                            title={`${label(status)}${best != null && status !== "new" ? ` · ${fill(t.best, best)}` : ""}`}
                            className={`flex items-center gap-1.5 rounded-xl border-2 px-3 py-1.5 text-sm font-semibold ${
                              status === "done"
                                ? "border-[var(--edge)] text-[#16132b]"
                                : status === "started"
                                  ? "border-[var(--edge)] bg-[var(--surface-muted)]"
                                  : "border-[var(--border-soft)] text-[var(--muted)]"
                            }`}
                            style={status === "done" ? { background: subject.color } : undefined}
                          >
                            <span aria-hidden>{STATUS_ICON[status]}</span>
                            {c.title}
                          </Link>
                        </li>
                      );
                    })}
                </ul>
              </div>
            ))}
          </details>
        );
      })}
    </div>
  );
}
