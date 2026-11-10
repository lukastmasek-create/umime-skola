"use client";
import { readNext } from "@/lib/auth-next";
import { withFallbacks } from "@/i18n/config";

import { useState, use } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { notifyAccountChanged } from "@/lib/account-events";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import { notFound } from "next/navigation";
import { AuthShell, type AuthMood } from "@/components/AuthShell";

const GREETING: Record<Locale, string> = {
  ...withFallbacks({
  cs: "Ahoj! Přihlas se a pokračuj ve hře.",
  en: "Hi! Log in and keep playing.",
  de: "Hallo! Melde dich an und spiel weiter.",
  ru: "Привет! Войди и продолжай играть.",
  }),
  uk: "Привіт! Увійди і продовжуй гру.",
  ja: "こんにちは！ログインしてゲームを続けよう。",
  es: "¡Hola! Inicia sesión y sigue jugando.",
  fr: "Salut ! Connecte-toi et continue de jouer.",
};

// Doplňkové texty formuláře (pole s plovoucími popisky, zobrazení hesla, stav tlačítka).
const FORM_TEXT = withFallbacks({
  cs: { badEmail: "Zadej platný e-mail", showPass: "Zobrazit heslo", hidePass: "Skrýt heslo", done: "Přihlášeno" },
  en: { badEmail: "Enter a valid e-mail", showPass: "Show password", hidePass: "Hide password", done: "Logged in" },
  de: { badEmail: "Gib eine gültige E-Mail ein", showPass: "Passwort anzeigen", hidePass: "Passwort verbergen", done: "Angemeldet" },
  ru: { badEmail: "Введи действительный e-mail", showPass: "Показать пароль", hidePass: "Скрыть пароль", done: "Вход выполнен" },
});
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const inputCls =
  "peer w-full rounded-xl border-2 border-[var(--field-border)] bg-[var(--surface)] px-3.5 pb-2 pt-5 text-sm outline-none transition-colors focus:border-[var(--brand-500)] focus:ring-2 focus:ring-[var(--brand-100)] aria-[invalid=true]:border-[var(--danger)]";
const labelCls =
  "pointer-events-none absolute left-3.5 top-3.5 origin-left text-sm text-[var(--muted)] transition-all peer-focus:top-1.5 peer-focus:text-[11px] peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[11px]";

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
  const [mood, setMood] = useState<AuthMood>("idle");
  const [showPass, setShowPass] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [done, setDone] = useState(false);
  const f = FORM_TEXT[locale as Locale];
  const emailBad = emailTouched && email.length > 0 && !EMAIL_RE.test(email);

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
      setMood("oops");
      setTimeout(() => setMood("idle"), 900);
      return;
    }
    setMood("joy");
    setDone(true);

    notifyAccountChanged();
    await new Promise((r) => setTimeout(r, 700)); // maskot se stihne zaradovat
    router.push(readNext(locale) ?? `/${locale}/kurzy`);
    router.refresh();
  }

  return (
    <AuthShell mood={mood} greeting={GREETING[locale as Locale]}>
      <div className="card auth-card w-full p-8">
        <h1 className="mb-1 text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          {dict.auth.login.title}
        </h1>
        <p className="mb-6 text-sm text-[var(--muted)]">{dict.auth.login.subtitle}</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="auth-field" style={{ ["--d" as string]: "70ms" }}>
            <div className="relative">
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                placeholder=" "
                value={email}
                aria-invalid={emailBad}
                aria-describedby={emailBad ? "login-email-msg" : undefined}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setEmailTouched(true)}
                className={inputCls}
              />
              <label htmlFor="login-email" className={labelCls}>{dict.auth.login.email}</label>
            </div>
            {emailBad && <p id="login-email-msg" className="mt-1 text-xs font-semibold text-[var(--danger)]">{f.badEmail}</p>}
          </div>
          <div className="auth-field relative" style={{ ["--d" as string]: "140ms" }}>
            <input
              id="login-password"
              type={showPass ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputCls} pr-11`}
            />
            <label htmlFor="login-password" className={labelCls}>{dict.auth.login.password}</label>
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              aria-pressed={showPass}
              aria-label={showPass ? f.hidePass : f.showPass}
              className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--muted)] hover:bg-[var(--surface-muted)]"
            >
              <span aria-hidden>{showPass ? "🙈" : "👁️"}</span>
            </button>
          </div>
          {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
          <button
            type="submit"
            disabled={loading || done}
            className={`btn-bouncy rounded-full px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-80 ${done ? "bg-[var(--accent-green)]" : "bg-[var(--brand-500)] hover:bg-[var(--brand-600)]"}`}
          >
            {done ? `✓ ${f.done}` : loading ? dict.auth.login.submitting : dict.auth.login.submit}
          </button>
        </form>
      </div>
    </AuthShell>
  );
}
