import type { Subject } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { handle, readJson } from "@/lib/live/http";
import { LiveError } from "@/lib/live/service";
import { requireProUserId } from "@/lib/pro-server";
import { loadGameState, saveGameState } from "@/lib/pro-tools/server";
import { clampSize, examMinutes, sample, scoreExam } from "@/lib/pro-tools/exam";
import { dayKey } from "@/lib/gamify";
import { withinRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// Zkouška nanečisto (PRO): samostatná sekce z otázek kurzů v kategorii Přijímačky, s časovým limitem a odhadem bodů.
// Kurzy samotné zůstávají zdarma. Správné odpovědi se klientovi posílají až po odevzdání.
const SUBJECTS: Subject[] = ["MATEMATIKA", "CESTINA", "ANGLICTINA"];
const HISTORY_GAME = "pro-exams";
const MAX_HISTORY = 20;

type ExamRecord = { date: string; subject: string; percent: number; points: number; total: number };

function parseSubject(raw: unknown): Subject {
  return SUBJECTS.find((s) => s === raw) ?? "MATEMATIKA";
}

export async function GET(request: Request) {
  return handle(async () => {
    const userId = await requireProUserId();
    const params = new URL(request.url).searchParams;
    if (params.get("history")) {
      const raw = await loadGameState(userId, HISTORY_GAME);
      return { history: Array.isArray(raw) ? (raw as ExamRecord[]) : [] };
    }
    const subject = parseSubject(params.get("predmet"));
    const n = clampSize(params.get("n"));
    const where = { course: { published: true, category: "PRIJIMACKY" as const, subject } };
    const ids = await prisma.question.findMany({ where: { ...where, options: { isEmpty: false } }, select: { id: true }, take: 3000 });
    if (ids.length < 10) throw new LiveError("not-enough-questions", 404);
    const picked = sample(ids, Math.min(n, ids.length)).map((q) => q.id);
    const rows = await prisma.question.findMany({
      where: { id: { in: picked } },
      select: { id: true, prompt: true, options: true, course: { select: { title: true } } },
    });
    const order = new Map(picked.map((id, i) => [id, i]));
    rows.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
    return {
      subject,
      minutes: examMinutes(rows.length),
      questions: rows.map((q) => ({ id: q.id, prompt: q.prompt, options: q.options, courseTitle: q.course.title })),
    };
  });
}

export async function POST(request: Request) {
  return handle(async () => {
    const userId = await requireProUserId();
    if (!(await withinRateLimit(`pro-exam:${userId}`, 30, 3600))) throw new LiveError("rate-limited", 429);
    const body = await readJson(request);
    const raw = body.answers && typeof body.answers === "object" ? (body.answers as Record<string, unknown>) : {};
    const ids = Object.keys(raw).slice(0, 60);
    if (ids.length === 0) throw new LiveError("invalid-answers");
    const rows = await prisma.question.findMany({
      where: { id: { in: ids } },
      select: { id: true, prompt: true, options: true, correctIndex: true, explanation: true, course: { select: { id: true, title: true } } },
    });
    if (rows.length === 0) throw new LiveError("invalid-answers");
    const answers: Record<string, number | null> = {};
    const key: Record<string, number> = {};
    for (const q of rows) {
      const a = raw[q.id];
      answers[q.id] = typeof a === "number" && Number.isInteger(a) && a >= 0 && a < q.options.length ? a : null;
      key[q.id] = q.correctIndex;
    }
    const score = scoreExam(answers, key);
    const subject = parseSubject(body.subject);
    const prev = await loadGameState(userId, HISTORY_GAME);
    const history: ExamRecord[] = [
      ...(Array.isArray(prev) ? (prev as ExamRecord[]) : []),
      { date: dayKey(new Date()), subject, percent: score.percent, points: score.points, total: score.total },
    ].slice(-MAX_HISTORY);
    await saveGameState(userId, HISTORY_GAME, history);
    return {
      score,
      review: rows.map((q) => ({
        id: q.id,
        prompt: q.prompt,
        options: q.options,
        correctIndex: q.correctIndex,
        chosen: answers[q.id],
        explanation: q.explanation,
        courseId: q.course.id,
      })),
      history,
    };
  });
}
