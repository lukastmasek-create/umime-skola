import { prisma } from "@/lib/prisma";
import { handle, readJson } from "@/lib/live/http";
import { LiveError } from "@/lib/live/service";
import { requireSchoolTeacherAny } from "@/lib/pro-tools/school-server";
import { withinRateLimit } from "@/lib/rate-limit";
import { extractJson, generateText } from "@/lib/ai";
import { cleanPairs, cleanTitle, dilnaPrompt, DILNA_MAX_LIBRARY, isPlayable, pairsFromData } from "@/lib/pro-tools/dilna";
import { isLocale } from "@/i18n/config";

export const dynamic = "force-dynamic";

const str = (v: unknown) => (typeof v === "string" ? v : "");
const IMAGE_RE = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;

/** Knihovna her učitele. */
export async function GET() {
  return handle(async () => {
    const userId = await requireSchoolTeacherAny();
    const rows = await prisma.teacherGame.findMany({
      where: { ownerId: userId },
      orderBy: { updatedAt: "desc" },
      take: DILNA_MAX_LIBRARY,
      select: { id: true, title: true, data: true, updatedAt: true },
    });
    return {
      games: rows.map((r) => ({ id: r.id, title: r.title, pairs: pairsFromData(r.data), updatedAt: r.updatedAt })),
    };
  });
}

export async function POST(request: Request) {
  return handle(async () => {
    const body = await readJson(request);
    const action = body.action;

    // Vytvoření návrhu hry z textu nebo fotky. Nic se neukládá, učitel si návrh upraví.
    if (action === "generate") {
      const userId = await requireSchoolTeacherAny();
      if (!(await withinRateLimit(`pro-dilna:${userId}`, 20, 3600))) throw new LiveError("rate-limited", 429);
      const text = str(body.text).trim().slice(0, 6000);
      const image = str(body.image);
      if (!text && !image) throw new LiveError("invalid-message");
      if (image && (image.length > 1_500_000 || !IMAGE_RE.test(image))) throw new LiveError("invalid-image");
      const locale = typeof body.locale === "string" && isLocale(body.locale) ? body.locale : "cs";
      let out = "";
      try {
        out = await generateText({
          system: dilnaPrompt(locale),
          turns: [{ role: "user", content: text ? `Text:\n${text}` : "Vytvoř dvojice z textu na fotce." }],
          image: image || undefined,
          maxTokens: 1200,
        });
      } catch (e) {
        if (e instanceof LiveError) throw e;
      }
      const d = extractJson<{ title?: unknown; pairs?: unknown }>(out);
      const pairs = cleanPairs(d?.pairs);
      if (!isPlayable(pairs)) throw new LiveError("ai-unavailable", 503);
      return { title: cleanTitle(d?.title), pairs };
    }

    // Uložení hry do knihovny (nová, nebo úprava vlastní).
    if (action === "save") {
      const userId = await requireSchoolTeacherAny();
      const pairs = cleanPairs(body.pairs);
      if (!isPlayable(pairs)) throw new LiveError("invalid-pairs");
      const title = cleanTitle(body.title);
      const id = str(body.id);
      const data = { pairs } as object;
      if (id) {
        const res = await prisma.teacherGame.updateMany({ where: { id, ownerId: userId }, data: { title, data } });
        if (res.count === 0) throw new LiveError("not-found", 404);
        return { id };
      }
      const count = await prisma.teacherGame.count({ where: { ownerId: userId } });
      if (count >= DILNA_MAX_LIBRARY) throw new LiveError("library-full", 409);
      const created = await prisma.teacherGame.create({ data: { ownerId: userId, title, kind: "pairs", data }, select: { id: true } });
      return { id: created.id };
    }

    if (action === "delete") {
      const userId = await requireSchoolTeacherAny();
      const id = str(body.id);
      if (!id) throw new LiveError("not-found", 404);
      await prisma.teacherGame.deleteMany({ where: { id, ownerId: userId } });
      return { ok: true };
    }

    throw new LiveError("bad-action");
  });
}
