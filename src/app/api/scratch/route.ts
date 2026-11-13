import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { MAX_SAVE_CHARS, sanitizeBlocks } from "@/lib/scratch/engine";
import { saveScratchProject } from "@/lib/scratch/store";

// Uložení skriptů přihlášeného žáka. Data se vždy vyčistí na povolené bloky.
export async function PUT(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "login-required" }, { status: 401 });

  const text = await request.text();
  if (text.length > MAX_SAVE_CHARS) return NextResponse.json({ error: "too-large" }, { status: 413 });

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "bad-json" }, { status: 400 });
  }

  const blocks = sanitizeBlocks(body);
  try {
    await saveScratchProject(userId, blocks);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "save-failed" }, { status: 500 });
  }
}
