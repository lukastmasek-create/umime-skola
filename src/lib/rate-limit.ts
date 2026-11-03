import { prisma } from "@/lib/prisma";

// Společný limit počtu požadavků v databázi (funguje napříč Workers instancemi).
// Vrací true, pokud je požadavek v limitu. Při chybě (např. tabulka ještě není vytvořená) vrací true,
// aby se web nerozbil; chybu zaloguje.
export async function withinRateLimit(key: string, limit: number, windowSec: number): Promise<boolean> {
  try {
    const rows = await prisma.$queryRaw<{ count: number }[]>`
      INSERT INTO "RateLimit" ("key", "count", "windowStart") VALUES (${key}, 1, now())
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE WHEN "RateLimit"."windowStart" < now() - make_interval(secs => ${windowSec}::double precision)
                       THEN 1 ELSE "RateLimit"."count" + 1 END,
        "windowStart" = CASE WHEN "RateLimit"."windowStart" < now() - make_interval(secs => ${windowSec}::double precision)
                       THEN now() ELSE "RateLimit"."windowStart" END
      RETURNING "count"`;
    return Number(rows[0]?.count ?? 0) <= limit;
  } catch (error) {
    console.error("Limit požadavků selhal:", error);
    return true;
  }
}

// IP klienta. Na Cloudflare přichází v cf-connecting-ip (nelze ji podvrhnout přes proxy).
export function clientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}
