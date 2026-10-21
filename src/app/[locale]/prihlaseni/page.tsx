"use client";

import { useState, use } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { notifyAccountChanged } from "@/lib/account-events";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import { notFound } from "next/navigation";

export default function PrihlaseniPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale as Locale);

  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(dict.auth.login.error);
      return;
    }

    notifyAccountChanged();
    router.push(`/${locale}/kurzy`);
    router.refresh();
  }

  return (
    <div className="gradient-hero flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-10 sm:px-6 sm:py-16">
      <div className="card w-full max-w-sm p-8">
        <h1 className="mb-1 text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          {dict.auth.login.title}
        </h1>
        <p className="mb-6 text-sm text-[var(--muted)]">{dict.auth.login.subtitle}</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium">
            {dict.auth.login.email}
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-[var(--border-soft)] px-3 py-2 outline-none focus:border-[var(--brand-500)] focus:ring-2 focus:ring-[var(--brand-100)]"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            {dict.auth.login.password}
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-[var(--border-soft)] px-3 py-2 outline-none focus:border-[var(--brand-500)] focus:ring-2 focus:ring-[var(--brand-100)]"
            />
          </label>
          {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="btn-bouncy rounded-full bg-[var(--brand-500)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-600)] disabled:opacity-50"
          >
            {loading ? dict.auth.login.submitting : dict.auth.login.submit}
          </button>
        </form>
      </div>
    </div>
  );
}
