import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sanitizeBlocks, type Block } from "./engine";

// Projekt se ukládá do tabulky IdleState (jeden řádek na uživatele a hru), takže není potřeba žádná migrace.
export const SCRATCH_GAME = "scratch";

export async function loadScratchProject(userId: string): Promise<Block[] | null> {
  try {
    const row = await prisma.idleState.findUnique({
      where: { userId_game: { userId, game: SCRATCH_GAME } },
      select: { data: true },
    });
    return row ? sanitizeBlocks(row.data) : null;
  } catch {
    return null;
  }
}

export async function saveScratchProject(userId: string, blocks: Block[]): Promise<void> {
  const data = { version: 1, blocks } as unknown as Prisma.InputJsonValue;
  await prisma.idleState.upsert({
    where: { userId_game: { userId, game: SCRATCH_GAME } },
    create: { userId, game: SCRATCH_GAME, data },
    update: { data },
  });
}
