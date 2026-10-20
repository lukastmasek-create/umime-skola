import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const clean = (value: unknown, max: number) =>
  typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";

const schoolSelect = { id: true, name: true, city: true } as const;

export async function GET(request: Request) {
  const q = clean(new URL(request.url).searchParams.get("q"), 80);
  const session = await auth();
  const userId = session?.user?.id;

  try {
    const [me, schools] = await Promise.all([
      userId
        ? prisma.user.findUnique({
            where: { id: userId },
            select: { school: { select: schoolSelect } },
          })
        : Promise.resolve(null),
      q.length >= 2
        ? prisma.school.findMany({
            where: { name: { contains: q, mode: "insensitive" } },
            orderBy: { name: "asc" },
            take: 6,
            select: schoolSelect,
          })
        : Promise.resolve([]),
    ]);
    return NextResponse.json({ loggedIn: !!userId, school: me?.school ?? null, schools });
  } catch {
    return NextResponse.json({ error: "Databáze není dostupná." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Nejsi přihlášený/á." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const name = clean(body?.name, 80);
  const city = clean(body?.city, 60);
  if (name.length < 3) {
    return NextResponse.json({ error: "Název školy je příliš krátký." }, { status: 400 });
  }

  try {
    const existingWhere = {
      name: { equals: name, mode: "insensitive" as const },
      city: { equals: city, mode: "insensitive" as const },
    };
    let school = await prisma.school.findFirst({ where: existingWhere, select: schoolSelect });
    if (!school) {
      try {
        school = await prisma.school.create({ data: { name, city }, select: schoolSelect });
      } catch {
        school = await prisma.school.findFirst({ where: existingWhere, select: schoolSelect });
      }
    }
    if (!school) {
      return NextResponse.json({ error: "Školu se nepodařilo uložit." }, { status: 500 });
    }
    await prisma.user.update({ where: { id: userId }, data: { schoolId: school.id } });
    return NextResponse.json({ school });
  } catch {
    return NextResponse.json({ error: "Databáze není dostupná." }, { status: 503 });
  }
}

export async function DELETE() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Nejsi přihlášený/á." }, { status: 401 });
  }
  try {
    await prisma.user.update({ where: { id: userId }, data: { schoolId: null } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Databáze není dostupná." }, { status: 503 });
  }
}
