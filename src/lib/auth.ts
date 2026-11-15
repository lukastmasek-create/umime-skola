import { grantFullAccessOnce, hasFullAccessRole } from "@/lib/full-access";
import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { prisma } from "@/lib/prisma";
import { clientIp, withinRateLimit } from "@/lib/rate-limit";
import { defaultLocale } from "@/i18n/config";

// Na Workers nemusí být secrety z dashboardu v process.env, proto se čtou z bindingů.
function authSecret(): string | undefined {
  try {
    const { env } = getCloudflareContext({ async: false });
    const secret = (env as { AUTH_SECRET?: string }).AUTH_SECRET;
    if (secret) return secret;
  } catch {
    // Mimo požadavek na Workers kontext není k dispozici.
  }
  return process.env.AUTH_SECRET;
}

// Jak často se role v přihlašovacím tokenu ověřuje proti databázi.
const ROLE_REFRESH_MS = 10 * 60 * 1000;

const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: `/${defaultLocale}/prihlaseni`,
  },
  providers: [
    Credentials({
      name: "Email a heslo",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Heslo", type: "password" },
      },
      authorize: async (credentials, request) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) return null;
        // 10 pokusů za 15 minut na jeden účet (proti hádání hesla).
        if (!(await withinRateLimit(`login:${email.trim().toLowerCase()}`, 10, 900))) return null;
        // A 30 pokusů za 15 minut z jedné IP adresy (proti zkoušení hesel napříč účty).
        const ip = request ? clientIp(request) : "unknown";
        if (ip !== "unknown" && !(await withinRateLimit(`login-ip:${ip}`, 30, 900))) return null;

        // E-mail se hledá bez ohledu na velikost písmen, stejně jako kontrola při registraci.
        const user = await prisma.user.findFirst({
          where: { email: { equals: email.trim(), mode: "insensitive" } },
        });
        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.roleCheckedAt = Date.now();
      } else if (token.sub && Date.now() - ((token.roleCheckedAt as number | undefined) ?? 0) > ROLE_REFRESH_MS) {
        // Role se v tokenu obnovuje z databáze, aby se změna (nebo odebrání) role projevila bez odhlášení.
        const fresh = await prisma.user.findUnique({ where: { id: token.sub }, select: { role: true } }).catch(() => undefined);
        if (fresh === null) return null;
        if (fresh) token.role = fresh.role;
        token.roleCheckedAt = Date.now();
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        // Účty s plným přístupem dostanou všechna odemčení (jednou za běh serveru).
        if (token.sub && hasFullAccessRole(token.role as string | undefined)) await grantFullAccessOnce(token.sub);
        (session.user as { role?: string }).role = token.role as string | undefined;
      }
      return session;
    },
  },
};

// Konfigurace se skládá při každém požadavku, aby se načetl secret z bindingů.
// trustHost: aplikace běží za Cloudflare na vlastní doméně.
export const { handlers, signIn, signOut, auth } = NextAuth(() => ({
  ...authConfig,
  secret: authSecret(),
  trustHost: true,
}));
