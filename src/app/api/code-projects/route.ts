import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MAX_FILE_BYTES, checkName, ENTRY } from "@/lib/code-sandbox";

// Projekty z Čistého listu. Přihlášený uživatel vidí jen svoje. Host dostane loggedIn: false
// a projekt se mu ukládá jen v prohlížeči.

const MAX_FILES = 60;
const MAX_TOTAL_BYTES = 2 * 1024 * 1024;
const MAX_PROJECTS = 50;
const MAX_TITLE = 60;

async function currentUserId() {
  const session = await auth();
  return session?.user?.id ?? null;
}

// Kontrola souborů na serveru: stejná pravidla jako v prohlížeči, navíc celkový limit.
function parseFiles(v: unknown): { files: Record<string, string> } | { error: string } {
  if (!v || typeof v !== "object" || Array.isArray(v)) return { error: "Soubory musí být objekt." };
  const entries = Object.entries(v as Record<string, unknown>);
  if (entries.length === 0 || entries.length > MAX_FILES) return { error: `Projekt má mít 1 až ${MAX_FILES} souborů.` };
  if (!entries.some(([n]) => n === ENTRY)) return { error: `Chybí ${ENTRY}.` };
  const files: Record<string, string> = {};
  let total = 0;
  for (const [name, content] of entries) {
    const check = checkName(name, Object.keys(files));
    if ("error" in check || check.name !== name) return { error: `Neplatné jméno souboru: ${name}` };
    if (typeof content !== "string") return { error: `Obsah souboru ${name} není text.` };
    const size = new TextEncoder().encode(content).length;
    if (size > MAX_FILE_BYTES) return { error: `Soubor ${name} je větší než 512 kB.` };
    total += size;
    files[name] = content;
  }
  if (total > MAX_TOTAL_BYTES) return { error: "Projekt je větší než 2 MB." };
  return { files };
}

function parseTitle(v: unknown, fallback: string) {
  if (typeof v !== "string") return fallback;
  const t = v.trim().slice(0, MAX_TITLE);
  return t || fallback;
}

// GET: seznam projektů, nebo ?id=… jeden projekt se soubory.
export async function GET(request: Request) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ loggedIn: false });

  const id = new URL(request.url).searchParams.get("id");
  if (id) {
    const project = await prisma.codeProject.findFirst({ where: { id, userId } });
    if (!project) return NextResponse.json({ error: "Projekt nenalezen." }, { status: 404 });
    return NextResponse.json({ loggedIn: true, project: { id: project.id, title: project.title, files: project.files } });
  }

  const projects = await prisma.codeProject.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, updatedAt: true },
  });
  return NextResponse.json({ loggedIn: true, projects });
}

// POST: nový projekt.
export async function POST(request: Request) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ loggedIn: false }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { title?: unknown; files?: unknown } | null;
  const count = await prisma.codeProject.count({ where: { userId } });
  if (count >= MAX_PROJECTS) return NextResponse.json({ error: `Máš už ${MAX_PROJECTS} projektů. Některý smaž.` }, { status: 400 });

  const parsed = parseFiles(body?.files ?? { [ENTRY]: "<!DOCTYPE html>\n<html lang=\"cs\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>Můj projekt</title>\n</head>\n<body>\n\n</body>\n</html>" });
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const project = await prisma.codeProject.create({
    data: {
      userId,
      title: parseTitle(body?.title, `Projekt ${count + 1}`),
      files: parsed.files as Prisma.InputJsonValue,
    },
    select: { id: true, title: true, updatedAt: true },
  });
  return NextResponse.json({ project });
}

// PUT: uložení změn (soubory, název).
export async function PUT(request: Request) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ loggedIn: false }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { id?: unknown; title?: unknown; files?: unknown } | null;
  if (!body || typeof body.id !== "string") return NextResponse.json({ error: "Chybí id projektu." }, { status: 400 });

  const data: { title?: string; files?: Prisma.InputJsonValue } = {};
  if (body.title !== undefined) data.title = parseTitle(body.title, "Projekt");
  if (body.files !== undefined) {
    const parsed = parseFiles(body.files);
    if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
    data.files = parsed.files as Prisma.InputJsonValue;
  }
  // updateMany hlídá vlastníka: cizí projekt se nezmění.
  const result = await prisma.codeProject.updateMany({ where: { id: body.id, userId }, data });
  if (result.count === 0) return NextResponse.json({ error: "Projekt nenalezen." }, { status: 404 });
  return NextResponse.json({ ok: true, updatedAt: new Date().toISOString() });
}

// DELETE: smazání projektu.
export async function DELETE(request: Request) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ loggedIn: false }, { status: 401 });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Chybí id projektu." }, { status: 400 });
  await prisma.codeProject.deleteMany({ where: { id, userId } });
  return NextResponse.json({ ok: true });
}
