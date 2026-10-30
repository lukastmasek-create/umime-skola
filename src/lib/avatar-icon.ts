import { prisma } from "@/lib/prisma";
import { avatarIconUrl } from "@/lib/avatar-icon-url";

// Vlastní ikonky avatarů: po přebarvení postavy pošle profil malý snímek (webp/png jako data URL).
// Ukládá se do IdleState pod hrou ICON_GAME, pro každý avatar zvlášť: { icons: { [avatar]: { img, v } } }.
export const ICON_GAME = "profile-icon";
const MAX_LEN = 80_000;

export type IconStore = { icons: Record<string, { img: string; v: number }> };

export function isIconData(v: unknown): v is string {
  return typeof v === "string" && v.length < MAX_LEN && /^data:image\/(webp|png);base64,[A-Za-z0-9+/=]+$/.test(v);
}

function normalize(raw: unknown): IconStore {
  const icons = (raw as IconStore | null)?.icons;
  const out: IconStore = { icons: {} };
  if (!icons || typeof icons !== "object") return out;
  for (const [id, val] of Object.entries(icons)) {
    if (val && isIconData(val.img) && typeof val.v === "number") out.icons[id] = { img: val.img, v: val.v };
  }
  return out;
}

export async function saveAvatarIcon(userId: string, avatar: string, img: string | null) {
  const row = await prisma.idleState.findUnique({ where: { userId_game: { userId, game: ICON_GAME } } });
  const store = normalize(row?.data);
  if (img) store.icons[avatar] = { img, v: Date.now() };
  else delete store.icons[avatar];
  await prisma.idleState.upsert({
    where: { userId_game: { userId, game: ICON_GAME } },
    create: { userId, game: ICON_GAME, data: store },
    update: { data: store },
  });
}

export async function readAvatarIcon(userId: string): Promise<string | null> {
  const [user, row] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { avatar: true } }),
    prisma.idleState.findUnique({ where: { userId_game: { userId, game: ICON_GAME } } }),
  ]);
  if (!user || !row) return null;
  return normalize(row.data).icons[user.avatar ?? "robot"]?.img ?? null;
}

// Verze ikonek pro seznam hráčů (jen u těch, kdo mají ikonku pro avatar, který právě nosí).
// Obrázky se z databáze nenačítají, jen čísla verzí.
export async function avatarIconVersions(userIds: string[]): Promise<Record<string, number>> {
  const ids = [...new Set(userIds)].filter(Boolean);
  if (ids.length === 0) return {};
  try {
    const rows = await prisma.$queryRaw<{ id: string; v: string | null }[]>`
      SELECT s."userId" AS id, (s.data->'icons'->COALESCE(u.avatar, 'robot')->>'v') AS v
      FROM "IdleState" s JOIN "User" u ON u.id = s."userId"
      WHERE s.game = ${ICON_GAME} AND s."userId" = ANY(${ids})`;
    const out: Record<string, number> = {};
    for (const r of rows) if (r.v) out[r.id] = Number(r.v);
    return out;
  } catch {
    return {};
  }
}

// Pohodlná verze: rovnou adresy ikonek podle id hráče.
export async function avatarIcons(userIds: string[]): Promise<Record<string, string>> {
  const versions = await avatarIconVersions(userIds);
  const out: Record<string, string> = {};
  for (const [id, v] of Object.entries(versions)) out[id] = avatarIconUrl(id, v) as string;
  return out;
}
