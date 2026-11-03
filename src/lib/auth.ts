import { grantFullAccessOnce, hasFullAccessEmail } from "@/lib/full-access";
import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { prisma } from "@/lib/prisma";
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
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
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
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        // Účty s plným přístupem dostanou všechna odemčení (jednou za běh serveru).
        if (token.sub && hasFullAccessEmail(token.email)) await grantFullAccessOnce(token.sub);
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
