import { prisma } from "@/lib/prisma";
import { AVATARS } from "@/lib/avatars";
import { TITLES } from "@/lib/titles";
import { SHOP_ITEMS, unlockKey as shopKey } from "@/lib/shop";
import { RECIPES, unlockKey as craftKey } from "@/lib/craft";
import { ROOM_REWARDS, ESCAPE_MASTER_UNLOCK } from "@/lib/escape/rewards";
import { WORLDS } from "@/lib/market-worlds";
import { SPECIES } from "@/lib/idle/pets";
import { CITY_ITEMS } from "@/lib/idle/city";
import { xpForLevel } from "@/lib/progression";

// Účty s plným přístupem: mají odemčené úplně všechno a nejvyšší úroveň.
// Všechny klíče se skládají z katalogů v kódu, takže se nové věci, které
// přidáme do avatarů, titulů, obchodu, craftování, světů, mazlíčků nebo města,
// odemknou samy – není potřeba nic dopisovat sem.
export const FULL_ACCESS_EMAILS: ReadonlySet<string> = new Set([
  "lukaszahorda1011@gmail.com",
  "tuzitv@seznam.cz",
  "ondrej.vrba@infis.cz",
  "natalie.majerovainf@seznam.cz",
  "lukas.zahor@infis.cz",
]);

// Úroveň, kterou plný přístup dosazuje (XP se jen dopočítá, do databáze se nezapisuje).
export const FULL_ACCESS_LEVEL = 100;
export const FULL_ACCESS_XP = xpForLevel(FULL_ACCESS_LEVEL);

export function hasFullAccessEmail(email: string | null | undefined): boolean {
  return !!email && FULL_ACCESS_EMAILS.has(email.trim().toLowerCase());
}

export function allUnlockKeys(): string[] {
  const keys = new Set<string>();
  for (const a of AVATARS) keys.add(`avatar:${a.id}`);
  for (const t of TITLES) keys.add(`title:${t.id}`);
  for (const item of SHOP_ITEMS) keys.add(shopKey(item));
  for (const r of RECIPES) {
    const k = craftKey(r);
    if (k) keys.add(k);
  }
  for (const reward of Object.values(ROOM_REWARDS)) for (const k of reward.unlocks) keys.add(k);
  keys.add(ESCAPE_MASTER_UNLOCK);
  for (const w of WORLDS) keys.add(`world:${w.id}`);
  for (const s of SPECIES) keys.add(`pet:${s.id}`);
  for (const c of CITY_ITEMS) keys.add(`city:${c.id}`);
  return [...keys];
}

export async function isFullAccessUser(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  return hasFullAccessEmail(user?.email);
}

// Doplní chybějící odemčení. Volá se při každém načtení profilu a obchodu,
// takže nově přidané věci dostanou při nejbližší návštěvě.
export async function ensureFullAccess(userId: string): Promise<boolean> {
  if (!(await isFullAccessUser(userId))) return false;
  await prisma.unlock.createMany({
    data: allUnlockKeys().map((key) => ({ userId, key })),
    skipDuplicates: true,
  });
  return true;
}

// Po každém startu serveru (tedy i po každém nasazení s novými věcmi) se
// odemčení doplní jednou za účet; další požadavky už databázi nezatěžují.
const granted = new Set<string>();

export async function grantFullAccessOnce(userId: string): Promise<void> {
  if (granted.has(userId)) return;
  try {
    await prisma.unlock.createMany({
      data: allUnlockKeys().map((key) => ({ userId, key })),
      skipDuplicates: true,
    });
    granted.add(userId);
  } catch {
    // Zkusí se znovu při dalším požadavku.
  }
}
