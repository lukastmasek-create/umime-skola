import { prisma } from "@/lib/prisma";
import { handle, readJson } from "@/lib/live/http";
import { LiveError } from "@/lib/live/service";
import { choiceOnly, createAssignment, questionSelect, requireSchoolTeacher, requireSchoolTeacherAny } from "@/lib/pro-tools/school-server";
import { withinRateLimit } from "@/lib/rate-limit";
import { extractJson, generateText } from "@/lib/ai";
import { cleanSnapshot } from "@/lib/teams/logic";
import {
  assignmentQuestions, cleanGame, cleanKind, cleanTitle, dilnaPrompt, DILNA_MAX_LIBRARY, gameFromRow, isAssignable, sourceFromQuestions, type DilnaKind, type GameData,
} from "@/lib/pro-tools/dilna";
import { isLocale } from "@/i18n/config";

export const dynamic = "force-dynamic";

const str = (v: unknown) => (typeof v === "string" ? v : "");
const IMAGE_RE = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;

type Row = { id: string; title: string; kind: string; data: unknown; sharedAt: Date | null; updatedAt: Date; ownerName?: string | null };

function toGameRow(r: Row) {
  const game = gameFromRow(r.kind, r.data);
  return game ? { id: r.id, title: r.title, kind: game.kind, game, sharedAt: r.sharedAt, updatedAt: r.updatedAt } : null;
}

/** Kurz z databáze, nebo mapa mezer třídy, jako zdroj otázek pro AI. */
async function courseSource(body: Record<string, unknown>): Promise<{ title: string; text: string }> {
  const where = typeof body.courseId === "string" && body.courseId ? { id: body.courseId } : { slug: str(body.slug) };
  if (!("id" in where) && !where.slug) throw new LiveError("course-not-found", 404);
  const course = await prisma.course.findFirst({ where: { ...where, published: true }, select: { title: true, questions: { select: questionSelect } } });
  if (!course) throw new LiveError("course-not-found", 404);
  const rows = choiceOnly(course.questions).slice(0, 15);
  if (rows.length === 0) throw new LiveError("no-questions");
  return { title: course.title, text: sourceFromQuestions(course.title, rows) };
}

/** Návrh hry z textu, fotky nebo kurzu. Nic se neukládá. */
async function generate(body: Record<string, unknown>, userId: string) {
  if (!(await withinRateLimit(`pro-dilna:${userId}`, 20, 3600))) throw new LiveError("rate-limited", 429);
  const kind: DilnaKind = cleanKind(body.kind);
  const locale = typeof body.locale === "string" && isLocale(body.locale) ? body.locale : "cs";
  const fromCourse = body.source === "course";
  const course = fromCourse ? await courseSource(body) : null;
  const text = course ? course.text : str(body.text).trim().slice(0, 6000);
  const image = course ? "" : str(body.image);
  if (!text && !image) throw new LiveError("invalid-message");
  if (image && (image.length > 1_500_000 || !IMAGE_RE.test(image))) throw new LiveError("invalid-image");

  let out = "";
  try {
    out = await generateText({
      system: dilnaPrompt(kind, locale),
      turns: [{ role: "user", content: text ? `Zdroj:\n${text}` : "Vytvoř hru z textu na fotce." }],
      image: image || undefined,
      maxTokens: 1500,
    });
  } catch (e) {
    if (e instanceof LiveError) throw e;
  }
  const d = extractJson<Record<string, unknown>>(out);
  const game = cleanGame(kind, d);
  if (!game) throw new LiveError("ai-unavailable", 503);
  return { title: cleanTitle(d?.title, course?.title ?? "Hra z dílny"), game };
}

export async function GET(request: Request) {
  return handle(async () => {
    const userId = await requireSchoolTeacherAny();
    const view = new URL(request.url).searchParams.get("view");

    if (view === "shared") {
      // Sdílené hry kolegů ze stejné školy.
      const me = await prisma.user.findUnique({ where: { id: userId }, select: { schoolId: true } });
      if (!me?.schoolId) return { games: [] };
      const rows = await prisma.teacherGame.findMany({
        where: { sharedAt: { not: null }, ownerId: { not: userId }, owner: { schoolId: me.schoolId } },
        orderBy: { sharedAt: "desc" },
        take: 100,
        select: { id: true, title: true, kind: true, data: true, sharedAt: true, updatedAt: true },
      });
      return { games: rows.map(toGameRow).filter((g): g is NonNullable<typeof g> => g !== null) };
    }

    const rows = await prisma.teacherGame.findMany({
      where: { ownerId: userId },
      orderBy: { updatedAt: "desc" },
      take: DILNA_MAX_LIBRARY,
      select: { id: true, title: true, kind: true, data: true, sharedAt: true, updatedAt: true },
    });
    return { games: rows.map(toGameRow).filter((g): g is NonNullable<typeof g> => g !== null) };
  });
}

export async function POST(request: Request) {
  return handle(async () => {
    const body = await readJson(request);
    const action = body.action;

    if (action === "generate") {
      const userId = await requireSchoolTeacherAny();
      return generate(body, userId);
    }

    if (action === "save") {
      const userId = await requireSchoolTeacherAny();
      const kind = cleanKind(body.kind);
      const game = cleanGame(kind, body.game) as GameData | null;
      if (!game) throw new LiveError("invalid-game");
      const title = cleanTitle(body.title);
      const id = str(body.id);
      if (id) {
        const res = await prisma.teacherGame.updateMany({ where: { id, ownerId: userId }, data: { title, kind, data: game as object } });
        if (res.count === 0) throw new LiveError("not-found", 404);
        return { id };
      }
      const count = await prisma.teacherGame.count({ where: { ownerId: userId } });
      if (count >= DILNA_MAX_LIBRARY) throw new LiveError("library-full", 409);
      const created = await prisma.teacherGame.create({ data: { ownerId: userId, title, kind, data: game as object }, select: { id: true } });
      return { id: created.id };
    }

    if (action === "delete") {
      const userId = await requireSchoolTeacherAny();
      const id = str(body.id);
      if (!id) throw new LiveError("not-found", 404);
      await prisma.teacherGame.deleteMany({ where: { id, ownerId: userId } });
      return { ok: true };
    }

    // Sdílení hry kolegům ze stejné školy (zapnout / vypnout).
    if (action === "share") {
      const userId = await requireSchoolTeacherAny();
      const id = str(body.id);
      const res = await prisma.teacherGame.updateMany({ where: { id, ownerId: userId }, data: { sharedAt: body.shared === true ? new Date() : null } });
      if (res.count === 0) throw new LiveError("not-found", 404);
      return { ok: true };
    }

    // Kopie sdílené hry do vlastní knihovny.
    if (action === "copy") {
      const userId = await requireSchoolTeacherAny();
      const me = await prisma.user.findUnique({ where: { id: userId }, select: { schoolId: true } });
      if (!me?.schoolId) throw new LiveError("not-found", 404);
      const src = await prisma.teacherGame.findFirst({
        where: { id: str(body.id), sharedAt: { not: null }, ownerId: { not: userId }, owner: { schoolId: me.schoolId } },
        select: { title: true, kind: true, data: true },
      });
      if (!src) throw new LiveError("not-found", 404);
      const game = gameFromRow(src.kind, src.data);
      if (!game) throw new LiveError("not-found", 404);
      const count = await prisma.teacherGame.count({ where: { ownerId: userId } });
      if (count >= DILNA_MAX_LIBRARY) throw new LiveError("library-full", 409);
      const created = await prisma.teacherGame.create({ data: { ownerId: userId, title: src.title, kind: game.kind, data: game as object }, select: { id: true } });
      return { id: created.id };
    }

    // Zadání hry třídě jako úkolu s výběrem z možností.
    if (action === "assign") {
      const userId = await requireSchoolTeacherAny();
      const row = await prisma.teacherGame.findFirst({ where: { id: str(body.id), ownerId: userId }, select: { title: true, kind: true, data: true } });
      const game = row ? gameFromRow(row.kind, row.data) : null;
      if (!game) throw new LiveError("not-found", 404);
      if (!isAssignable(game)) throw new LiveError("not-assignable");
      const teamId = str(body.teamId);
      await requireSchoolTeacher(teamId);
      const locale = typeof body.locale === "string" && isLocale(body.locale) ? body.locale : "cs";
      const questions = cleanSnapshot(assignmentQuestions(game, locale));
      if (questions.length === 0) throw new LiveError("not-assignable");
      const assignmentId = await createAssignment({ teamId, title: row!.title, questions, passPercent: 50 });
      return { assignmentId };
    }

    throw new LiveError("bad-action");
  });
}
