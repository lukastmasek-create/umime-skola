import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { clientIp, withinRateLimit } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    return await register(request);
  } catch (error) {
    console.error("Registrace selhala:", error);
    return NextResponse.json(
      { error: "Registraci se teď nepodařilo dokončit. Zkus to prosím za chvíli." },
      { status: 500 }
    );
  }
}

async function register(request: Request) {
  if (!(await withinRateLimit(`reg:${clientIp(request)}`, 5, 3600))) {
    return NextResponse.json({ error: "Příliš mnoho pokusů. Zkus to za chvíli." }, { status: 429 });
  }
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  // Ověření, že jde o člověka (Cloudflare Turnstile).
  if (!(await verifyTurnstile(request, body?.turnstileToken))) {
    return NextResponse.json({ error: "Ověření, že nejsi robot, se nepovedlo. Zkus to prosím znovu." }, { status: 400 });
  }
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const name = typeof body?.name === "string" ? body.name.replace(/\s+/g, " ").trim().slice(0, 80) : "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email a heslo jsou povinné." },
      { status: 400 }
    );
  }
  if (!EMAIL.test(email) || email.length > 200) {
    return NextResponse.json({ error: "Zadej platný e-mail." }, { status: 400 });
  }
  // Stejná pravidla jako při změně hesla v účtu (src/app/api/ucet/heslo).
  if (password.length < 8 || password.length > 200) {
    return NextResponse.json({ error: "Heslo musí mít 8 až 200 znaků." }, { status: 400 });
  }

  // Kontrola bez ohledu na velikost písmen, aby nevznikly duplicitní účty (např. Jan@x.cz a jan@x.cz).
  const existing = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Uživatel s tímto emailem už existuje." },
      { status: 409 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name: name || null,
      email,
      password: hashedPassword,
    },
  });

  return NextResponse.json(
    { id: user.id, email: user.email },
    { status: 201 }
  );
}
