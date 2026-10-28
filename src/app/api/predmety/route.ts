import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { REVIEW_GAME, courseStatus, dueIds, normalizeReview } from "@/lib/review";
import { CATEGORIES, SUBJECTS } from "@/lib/taxonomy";

type CourseRow = { id: string; slug: string; title: string; category: string; grade: number | null; subject: string | null };

// Seznam kurzů se mění zřídka a čte se při každém načtení úvodní stránky, takže ho chvíli držíme v paměti.
const TTL_MS = 5 * 60 * 1000;
let cache: { at: number; rows: CourseRow[] } | null = null;

async function loadCourses(): Promise<CourseRow[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.rows;
  const rows = await prisma.course.findMany({
    where: { published: true, subject: { not: null } },
    select: { id: true, slug: true, title: true, category: true, grade: true, subject: true },
  });
  cache = { at: Date.now(), rows };
  return rows;
}

export type SubjectSummary = {
  total: number;
  done: number;
  started: number;
  /** Kam pokračovat: nejnověji rozdělaný kurz, jinak první nový od nejnižší třídy. */
  next: { category: string; slug: string; title: string; started: boolean } | null;
  /** Otázek k opakování dnes z kurzů tohoto předmětu. */
  due: number;
};

// GET: postup přihlášeného hráče po předmětech (pro globus na úvodní stránce).
export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ loggedIn: false });

  try {
    const [courses, row] = await Promise.all([
      loadCourses(),
      prisma.idleState.findUnique({ where: { userId_game: { userId, game: REVIEW_GAME } } }),
    ]);
    const state = normalizeReview(row?.data);
    const subjectOf = new Map(courses.map((c) => [c.id, c.subject]));
    const due = dueIds(state, Date.now());
    const categoryRank = (value: string) => CATEGORIES.findIndex((c) => c.value === value);
    const slugOf = (value: string) => CATEGORIES.find((c) => c.value === value)?.slug ?? "zakladni";

    const subjects: Record<string, SubjectSummary> = {};
    for (const s of SUBJECTS) {
      const mine = courses
        .filter((c) => c.subject === s.value)
        .sort((a, b) => categoryRank(a.category) - categoryRank(b.category) || (a.grade ?? 0) - (b.grade ?? 0) || a.title.localeCompare(b.title));
      let done = 0;
      let started = 0;
      let lastStarted: { c: CourseRow; last: string } | null = null;
      for (const c of mine) {
        const progress = state.courses[c.id];
        const status = courseStatus(progress);
        if (status === "done") done++;
        if (status === "started") {
          started++;
          if (!lastStarted || progress.last > lastStarted.last) lastStarted = { c, last: progress.last };
        }
      }
      const fresh = mine.find((c) => courseStatus(state.courses[c.id]) === "new");
      const pick = lastStarted?.c ?? fresh ?? null;
      subjects[s.slug] = {
        total: mine.length,
        done,
        started,
        next: pick ? { category: slugOf(pick.category), slug: pick.slug, title: pick.title, started: pick === lastStarted?.c } : null,
        due: due.filter((id) => {
          const course = state.items[id]?.course;
          return course ? subjectOf.get(course) === s.value : false;
        }).length,
      };
    }
    return NextResponse.json({ loggedIn: true, subjects });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
