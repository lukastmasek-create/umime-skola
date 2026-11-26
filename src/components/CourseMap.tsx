"use client";

import { useEffect, useId, useState, type CSSProperties } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { tr8, type Locale } from "@/i18n/config";
import { gradeLabel } from "@/i18n/grades";
import { fill } from "@/i18n/profile";
import { getReviewText } from "@/i18n/review";
import { courseStatus, MAX_TRACKED, type CourseProgress, type CourseStatus } from "@/lib/review";
import styles from "./CourseMap.module.css";

export type MapCourse = { id: string; title: string; slug: string; grade: number | null };
export type MapSubject = { value: string; slug: string; label: string; color: string; courses: MapCourse[] };

type MapProgress = { loggedIn?: boolean; due?: number; courses?: Record<string, CourseProgress> };

const continueLabel = tr8("Pokračovat", "Continue", "Weiterlernen", "Продолжить", "Продовжити", "続ける", "Continuar", "Continuer");
const emptyProgress: Record<string, CourseProgress> = {};

function Terrain({ finished, total }: { finished: number; total: number }) {
  const ratio = total > 0 ? finished / total : 0;
  const stage = ratio >= 1 ? 4 : ratio >= 0.5 ? 3 : ratio >= 0.25 ? 2 : finished > 0 ? 1 : 0;

  return (
    <span className={styles.terrain} data-stage={stage} aria-hidden="true">
      <span className={styles.ridge} />
      <span className={styles.foothills} />
      <span className={styles.pine} />
      <span className={styles.pine} />
      <span className={styles.pine} />
      <span className={styles.beacon} />
    </span>
  );
}

function Campfire({ locale, data }: { locale: Locale; data: MapProgress | null }) {
  const t = getReviewText(locale);
  const due = data?.due ?? 0;
  const scale = 0.3 + 1.15 * Math.log1p(Math.min(due, MAX_TRACKED)) / Math.log1p(MAX_TRACKED);

  return (
    <Link href={`/${locale}/opakovani`} className={styles.campfire}>
      <span
        className={styles.hearth}
        style={{ "--fire-scale": scale } as CSSProperties}
        data-lit={due > 0}
        aria-hidden="true"
      >
        <span className={styles.fireGlow} />
        <span className={styles.flame} />
        <span className={styles.logs} />
      </span>
      <span className={styles.campfireLabel}>
        <strong>{data?.loggedIn ? fill(t.reviewCta, due) : t.reviewNav}</strong>
        {data?.loggedIn && due === 0 && <small>{t.nothingDue}</small>}
      </span>
    </Link>
  );
}

export function CourseMap({ locale, subjects }: { locale: Locale; subjects: MapSubject[] }) {
  const t = getReviewText(locale);
  const [data, setData] = useState<MapProgress | null>(null);
  const [selection, setSelection] = useState<string | null>();
  const mapId = useId();

  useEffect(() => {
    let request: AbortController | undefined;

    async function loadProgress() {
      request?.abort();
      const controller = new AbortController();
      request = controller;

      try {
        const response = await fetch("/api/opakovani?map=1", { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error("Could not load course progress");
        const result: MapProgress = await response.json();
        if (!controller.signal.aborted) setData(result);
      } catch {
        if (!controller.signal.aborted) setData((previous) => previous ?? {});
      }
    }

    function restoreProgress(event: PageTransitionEvent) {
      if (event.persisted) void loadProgress();
    }

    void loadProgress();
    window.addEventListener("pageshow", restoreProgress);

    return () => {
      request?.abort();
      window.removeEventListener("pageshow", restoreProgress);
    };
  }, []);

  const progress = data?.courses ?? emptyProgress;
  const href = (course: MapCourse) => `/${locale}/kurzy/zakladni/${course.slug}`;
  const label: Record<CourseStatus, string> = { new: t.statusNew, started: t.statusStarted, done: t.statusDone };
  const routes = subjects.map((subject) => {
    const checkpoints = subject.courses.map((course) => ({ course, status: courseStatus(progress[course.id]) }));
    const finished = checkpoints.filter(({ status }) => status === "done").length;
    const touched = checkpoints.some(({ status }) => status !== "new");
    return { subject, checkpoints, finished, touched };
  });

  const started = routes.flatMap(({ subject, checkpoints }) =>
    checkpoints.filter(({ status }) => status === "started").map(({ course }) => ({ subject, course })),
  );
  started.sort((a, b) => progress[b.course.id].last.localeCompare(progress[a.course.id].last));
  const nextRoute = routes.find(({ touched, finished, checkpoints }) => touched && finished < checkpoints.length)
    ?? routes.find(({ finished, checkpoints }) => finished < checkpoints.length);
  const nextCourse = nextRoute?.checkpoints.find(({ status }) => status === "new")?.course;
  const next = started[0] ?? (nextRoute && nextCourse ? { subject: nextRoute.subject, course: nextCourse } : undefined);
  const active = selection === undefined ? (data ? next?.subject.value ?? subjects[0]?.value : undefined) : selection;

  const done = routes.reduce((count, route) => count + route.finished, 0);
  const total = subjects.reduce((count, subject) => count + subject.courses.length, 0);

  return (
    <div className={styles.map}>
      <div className={styles.overview}>
        <Terrain finished={done} total={total} />
        <div className={styles.journey}>
          {data?.loggedIn && <p className={styles.total}>{fill(t.progress, done)}</p>}
          {data && next && (
            <>
              <p className={styles.eyebrow}>{t.recommended}</p>
              <p className={styles.nextTitle}>{next.course.title}</p>
              <p className={styles.nextSubject}>{next.subject.label}</p>
              <Link href={href(next.course)} className={styles.continue}>
                {continueLabel[locale]} <span aria-hidden="true">→</span>
              </Link>
            </>
          )}
        </div>
        <Campfire locale={locale} data={data} />
      </div>

      {routes.length > 0 && (
        <ul className={styles.legend}>
          {(["new", "started", "done"] as const).map((status) => (
            <li key={status}><span className={styles.marker} data-status={status} aria-hidden="true" />{label[status]}</li>
          ))}
        </ul>
      )}

      <div className={styles.regions}>
        {routes.map(({ subject, checkpoints, finished }) => {
          const open = active === subject.value;
          const headingId = `${mapId}-${subject.slug}`;
          const grades = new Map<number | null, typeof checkpoints>();

          if (open) {
            for (const checkpoint of checkpoints) {
              const grade = checkpoint.course.grade || null;
              const group = grades.get(grade);
              if (group) group.push(checkpoint);
              else grades.set(grade, [checkpoint]);
            }
          }

          return (
            <section key={subject.value} className={styles.region} style={{ "--region": subject.color } as CSSProperties}>
              <h2 className={styles.regionHeading}>
                <button
                  id={headingId}
                  type="button"
                  className={styles.regionButton}
                  aria-expanded={open}
                  aria-controls={`${headingId}-courses`}
                  onClick={() => setSelection(open ? null : subject.value)}
                >
                  <Terrain finished={finished} total={checkpoints.length} />
                  <span className={styles.subjectIcon}><Icon name={subject.slug} size={38} /></span>
                  <span className={styles.subject}>{subject.label}</span>
                  <span className={styles.count}>{finished}/{checkpoints.length}</span>
                  <span className={styles.expand} aria-hidden="true">{open ? "−" : "+"}</span>
                  <span className={styles.progress} aria-hidden="true" style={{ width: `${100 * finished / checkpoints.length}%` }} />
                </button>
              </h2>
              <div id={`${headingId}-courses`} role="region" aria-labelledby={headingId} hidden={!open} className={styles.trail}>
                {[...grades].sort(([a], [b]) => (a ?? 0) - (b ?? 0)).map(([grade, group]) => (
                  <div key={grade ?? "ungraded"} className={styles.grade}>
                    {grade !== null && <h3 className={styles.gradeLabel}>{gradeLabel(locale, "zakladni", grade)}</h3>}
                    <ul className={styles.checkpoints}>
                      {group.map(({ course, status }) => (
                        <li key={course.id}>
                          <Link href={href(course)} prefetch={false} className={styles.checkpoint} data-status={status}>
                            <span className={styles.marker} data-status={status} aria-hidden="true" />
                            <span className={styles.checkpointInfo}>
                              <strong>{course.title}</strong>
                              <small>
                                {label[status]}
                                {status !== "new" && ` · ${fill(t.best, progress[course.id].best)}`}
                              </small>
                            </span>
                            <span className={styles.arrow} aria-hidden="true">→</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
