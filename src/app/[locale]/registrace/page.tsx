"use client";
import { withFallbacks } from "@/i18n/config";

import { useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import { notFound } from "next/navigation";
import { AuthShell, type AuthMood } from "@/components/AuthShell";
import { signIn } from "next-auth/react";
import { notifyAccountChanged } from "@/lib/account-events";
import { readNext } from "@/lib/auth-next";
import { TurnstileWidget, type TurnstileHandle } from "@/components/TurnstileWidget";

const GREETING: Record<Locale, string> = {
  ...withFallbacks({
  cs: "Ahoj, jsem tvůj průvodce! Založ si účet a začneme.",
  en: "Hi, I'm your guide! Create an account and let's start.",
  de: "Hallo, ich bin dein Begleiter! Erstelle ein Konto und es geht los.",
  ru: "Привет, я твой проводник! Создай аккаунт, и начнём.",
  }),
  uk: "Привіт, я твій провідник! Створи обліковий запис, і почнемо.",
  ja: "こんにちは、ガイドのキャラクターです！アカウントを作ると始められます。",
  es: "¡Hola, soy tu guía! Crea una cuenta y empezamos.",
  fr: "Salut, je suis ton guide ! Crée un compte et c'est parti.",
};

export default function RegistracePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale as Locale);

  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mood, setMood] = useState<AuthMood>("idle");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<TurnstileHandle>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/registrace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, turnstileToken: captchaToken }),
    });

    setLoading(false);
    // Token platí jen jednou, po každém pokusu se widget resetuje.
    captchaRef.current?.reset();

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? dict.auth.register.genericError);
      setMood("oops");
      setTimeout(() => setMood("idle"), 900);
      return;
    }
    setMood("joy");
    await new Promise((r) => setTimeout(r, 900)); // maskot se stihne zaradovat

    const next = readNext(locale);
    // Rovnou přihlásit stejnými údaji; když se to nepovede, uživatel dokončí přes přihlašovací formulář.
    const login = await signIn("credentials", { email, password, redirect: false }).catch(() => null);
    if (login && !login.error) {
      notifyAccountChanged();
      router.push(next ?? `/${locale}/kurzy`);
      router.refresh();
      return;
    }
    router.push(`/${locale}/prihlaseni${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  }

  return (
    <AuthShell mood={mood} greeting={GREETING[locale as Locale]}>
      <div className="card auth-card w-full p-8">
        <h1 className="mb-1 text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          {dict.auth.register.title}
        </h1>
        <p className="mb-6 text-sm text-[var(--muted)]">{dict.auth.register.subtitle}</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="auth-field flex flex-col gap-1 text-sm font-medium" style={{ ["--d" as string]: "70ms" }}>
            {dict.auth.register.name}
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg border border-[var(--border-soft)] px-3 py-2 outline-none focus:border-[var(--brand-500)] focus:ring-2 focus:ring-[var(--brand-100)]"
            />
          </label>
          <label className="auth-field flex flex-col gap-1 text-sm font-medium" style={{ ["--d" as string]: "140ms" }}>
            {dict.auth.register.email}
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-[var(--border-soft)] px-3 py-2 outline-none focus:border-[var(--brand-500)] focus:ring-2 focus:ring-[var(--brand-100)]"
            />
          </label>
          <label className="auth-field flex flex-col gap-1 text-sm font-medium" style={{ ["--d" as string]: "210ms" }}>
            {dict.auth.register.password}
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-[var(--border-soft)] px-3 py-2 outline-none focus:border-[var(--brand-500)] focus:ring-2 focus:ring-[var(--brand-100)]"
            />
          </label>
          <TurnstileWidget ref={captchaRef} onToken={setCaptchaToken} locale={locale} />
          {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="btn-bouncy rounded-full bg-[var(--brand-500)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-600)] disabled:opacity-50"
          >
            {loading ? dict.auth.register.submitting : dict.auth.register.submit}
          </button>
        </form>
      </div>
    </AuthShell>
  );
}
