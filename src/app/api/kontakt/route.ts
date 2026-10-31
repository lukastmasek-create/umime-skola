import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RATE_LIMIT, RATE_WINDOW_MS, validateContact } from "@/lib/contact";
import { isLocale } from "@/i18n/config";

// Kontaktní formulář: uloží zprávu do ContactMessage. Přihlášenému uživateli se zpráva přiřadí k účtu.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "topic" }, { status: 400 });

  // Past na roboty: skryté pole, které člověk nevyplní. Robotovi tváříme úspěch, ale nic neuložíme.
  if (typeof body.website === "string" && body.website.trim() !== "") return NextResponse.json({ ok: true });

  const result = validateContact(body);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  const { data } = result;
  const locale = typeof body.locale === "string" && isLocale(body.locale) ? body.locale : "cs";

  try {
    const session = await auth();
    const userId = session?.user?.id ?? null;
    const since = new Date(Date.now() - RATE_WINDOW_MS);
    const recent = await prisma.contactMessage.count({
      where: { createdAt: { gte: since }, OR: userId ? [{ userId }, { email: data.email }] : [{ email: data.email }] },
    });
    if (recent >= RATE_LIMIT) return NextResponse.json({ error: "rate" }, { status: 429 });

    await prisma.contactMessage.create({
      data: {
        category: data.category,
        topic: data.topic,
        name: data.name,
        email: data.email,
        message: data.message,
        details: data.details as Prisma.InputJsonValue,
        locale,
        userId,
      },
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("kontakt POST failed", error);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
