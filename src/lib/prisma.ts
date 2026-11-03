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

// Workers: jeden klient na jeden požadavek (klíčovaný podle jeho ExecutionContext).
// Spojení z jednoho požadavku se nesmí použít v jiném, proto se klient nesdílí napříč požadavky.
const clientsByRequest = new WeakMap<object, PrismaClient>();
// Node / vývoj: jeden sdílený klient (hot reload).
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function getClient(): PrismaClient {
  try {
    const { ctx } = getCloudflareContext({ async: false });
    let client = clientsByRequest.get(ctx);
    if (!client) {
      client = createClient();
      clientsByRequest.set(ctx, client);
    }
    return client;
  } catch {
    // Není Workers požadavek (next dev, next start, sestavení).
    if (!globalForPrisma.prisma) globalForPrisma.prisma = createClient();
    return globalForPrisma.prisma;
  }
}

// Proxy zaznamenává cestu (např. prisma.course.findFirst) a provede ji
// na klientovi aktuálního požadavku až při volání.
function callPath(path: PropertyKey[]): unknown {
  return new Proxy(function () {}, {
    get(_target, prop) {
      return callPath([...path, prop]);
    },
    apply(_target, _this, args) {
      const client = getClient();
      const owner = path.slice(0, -1).reduce<any>((obj, key) => obj[key], client);
      const fn = owner[path[path.length - 1]];
      return fn.apply(owner, args);
    },
  });
}

export const prisma = callPath([]) as PrismaClient;
