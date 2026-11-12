// Osobní plán učení (PRO): týdenní plán po 15 minutách denně podle slabých míst.
// Čistá logika bez databáze, aby šla testovat.

export const DAILY_MINUTES = 15;

export type WeakCourse = { courseId: string; title: string; href: string; low: number; count: number };
export type FreshCourse = { courseId: string; title: string; href: string };

export type PlanTask =
  | { kind: "review"; minutes: number; due: number }
  | { kind: "weak"; minutes: number; courseId: string; title: string; href: string }
  | { kind: "fresh"; minutes: number; courseId: string; title: string; href: string }
  | { kind: "exam"; minutes: number }
  | { kind: "rest"; minutes: number };

export type PlanDay = { date: string; tasks: PlanTask[] };

export type PlanInput = {
  /** Sedm dní plánu (YYYY-MM-DD), první je dnes. */
  days: string[];
  /** Kolik otázek je dnes k opakování. */
  due: number;
  weak: WeakCourse[];
  fresh: FreshCourse[];
};

/**
 * Pravidla: každý den 5 minut opakování chyb (když je co opakovat), 10 minut na nejslabší kurzy
 * po řadě, šestý den zkouška nanečisto a poslední den jen lehké opakování. Bez slabých míst se
 * místo nich nabídnou nové kurzy.
 */
export function buildStudyPlan({ days, due, weak, fresh }: PlanInput): PlanDay[] {
  const focus = weak.slice(0, 3);
  return days.map((date, i) => {
    const tasks: PlanTask[] = [];
    if (i === days.length - 1) {
      tasks.push({ kind: "rest", minutes: 5 });
      return { date, tasks };
    }
    if (i === days.length - 2) {
      tasks.push({ kind: "exam", minutes: DAILY_MINUTES });
      return { date, tasks };
    }
    const review = i === 0 ? due : Math.max(0, due - i * 10);
    if (review > 0 || focus.length === 0) tasks.push({ kind: "review", minutes: 5, due: review });
    const left = DAILY_MINUTES - tasks.reduce((s, t) => s + t.minutes, 0);
    if (focus.length > 0) {
      const w = focus[i % focus.length];
      tasks.push({ kind: "weak", minutes: left, courseId: w.courseId, title: w.title, href: w.href });
    } else if (fresh.length > 0) {
      const f = fresh[i % fresh.length];
      tasks.push({ kind: "fresh", minutes: left, courseId: f.courseId, title: f.title, href: f.href });
    }
    return { date, tasks };
  });
}

export function planMinutes(plan: PlanDay[]): number {
  return plan.reduce((s, d) => s + d.tasks.reduce((x, t) => x + t.minutes, 0), 0);
}
