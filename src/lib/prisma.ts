import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Na Cloudflare Workers jde připojení přes Hyperdrive (binding HYPERDRIVE).
// Lokálně a při běhu v Node se použije DATABASE_URL.
function resolveConnectionString(): string {
  try {
    const { env } = getCloudflareContext({ async: false });
    const hyperdrive = (env as { HYPERDRIVE?: { connectionString: string } }).HYPERDRIVE;
    if (hyperdrive?.connectionString) return hyperdrive.connectionString;
  } catch {
    // Mimo požadavek na Workers kontext není k dispozici.
  }
  const url = process.env.DATABASE_URL;
  if (url) return url;
  // Při sestavování (next build) se stránky předrenderují a nepotřebují skutečné připojení.
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return "postgresql://build:build@localhost:5432/build";
  }
  throw new Error("DATABASE_URL není nastavena (ani Hyperdrive binding).");
}

function createClient(): PrismaClient {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: resolveConnectionString() }),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

// Ve vývoji se klient sdílí (hot reload). Na Workers se nesmí spojení
// z jednoho požadavku použít v jiném, proto se tam pro každý dotaz vytvoří
// nový klient a po dokončení se odpojí.
const isDev = process.env.NODE_ENV === "development";
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function getDevClient(): PrismaClient {
  if (!globalForPrisma.prisma) globalForPrisma.prisma = createClient();
  return globalForPrisma.prisma;
}

async function runOnFreshClient(path: PropertyKey[], args: unknown[]): Promise<unknown> {
  const client = isDev ? getDevClient() : createClient();
  try {
    const owner = path.slice(0, -1).reduce<any>((obj, key) => obj[key], client);
    const fn = owner[path[path.length - 1]];
    return await fn.apply(owner, args);
  } finally {
    if (!isDev) await client.$disconnect();
  }
}

// Proxy zaznamenává cestu (např. prisma.course.findFirst) a teprve při volání
// ji provede na klientovi pro daný dotaz.
function callPath(path: PropertyKey[]): unknown {
  return new Proxy(function () {}, {
    get(_target, prop) {
      return callPath([...path, prop]);
    },
    apply(_target, _this, args) {
      return runOnFreshClient(path, args);
    },
  });
}

export const prisma = callPath([]) as PrismaClient;
