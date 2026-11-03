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

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Klient se vytváří líně, až při prvním dotazu (uvnitř požadavku),
// aby se Hyperdrive binding stihl načíst.
function getClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString: resolveConnectionString() }),
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }
  return globalForPrisma.prisma;
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getClient();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
}) as PrismaClient;
