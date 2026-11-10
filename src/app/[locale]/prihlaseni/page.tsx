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
  cs: { badEmail: "Zadej platný e-mail", showPass: "Zobrazit heslo", hidePass: "Skrýt heslo", done: "Přihlášeno", who: "Kdo se přihlašuje", roles: ["Žák", "Učitel", "Rodič"], streak: "Série 7 dní", streakSub: "Dneska ještě jedna lekce", unlocked: "Odemčeno: Zeměpis Evropy", unlockedSub: "Za splněný kvíz na 70 %" },
  en: { badEmail: "Enter a valid e-mail", showPass: "Show password", hidePass: "Hide password", done: "Logged in", who: "Who is logging in", roles: ["Student", "Teacher", "Parent"], streak: "7-day streak", streakSub: "One more lesson today", unlocked: "Unlocked: Geography of Europe", unlockedSub: "For a quiz passed at 70 %" },
  de: { badEmail: "Gib eine gültige E-Mail ein", showPass: "Passwort anzeigen", hidePass: "Passwort verbergen", done: "Angemeldet", who: "Wer meldet sich an", roles: ["Schüler", "Lehrer", "Eltern"], streak: "7 Tage in Folge", streakSub: "Heute noch eine Lektion", unlocked: "Freigeschaltet: Geografie Europas", unlockedSub: "Für ein Quiz mit 70 %" },
  ru: { badEmail: "Введи действительный e-mail", showPass: "Показать пароль", hidePass: "Скрыть пароль", done: "Вход выполнен", who: "Кто входит", roles: ["Ученик", "Учитель", "Родитель"], streak: "Серия 7 дней", streakSub: "Сегодня ещё один урок", unlocked: "Открыто: География Европы", unlockedSub: "За тест на 70 %" },
});
const ROLES = ["student", "teacher", "parent"] as const;
// Kam se po přihlášení jde, když nepřišel odkaz s cílem: podle zvolené role.
const ROLE_HOME = { student: "kurzy", teacher: "tymy", parent: "nastaveni" } as const;
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
  const [role, setRole] = useState<(typeof ROLES)[number]>("student");
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
    router.push(readNext(locale) ?? `/${locale}/${ROLE_HOME[role]}`);
    router.refresh();
  }

  return (
    <AuthShell
      mood={mood}
      greeting={GREETING[locale as Locale]}
      aside={
        <div className="lg-aside mt-4 hidden w-full max-w-[16rem] flex-col gap-3 md:flex" aria-hidden="true">
          <div className="lg-float rounded-2xl border-2 border-[var(--edge)] bg-[var(--surface)] p-3 shadow-[0_4px_0_var(--shadow-ink)]">
            <b className="block text-sm">🔥 {f.streak}</b>
            <small className="text-[var(--muted)]">{f.streakSub}</small>
            <span className="mt-2 block h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]"><i className="lg-meter block h-full rounded-full" /></span>
          </div>
          <div className="lg-float lg-float-b rounded-2xl border-2 border-[var(--edge)] bg-[var(--surface)] p-3 shadow-[0_4px_0_var(--shadow-ink)]">
            <b className="block text-sm">🌍 {f.unlocked}</b>
            <small className="text-[var(--muted)]">{f.unlockedSub}</small>
          </div>
        </div>
      }
    >
      <div className="card auth-card w-full p-8">
        <h1 className="mb-1 text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          {dict.auth.login.title}
        </h1>
        <p className="mb-4 text-sm text-[var(--muted)]">{dict.auth.login.subtitle}</p>
        <div className="lg-roles mb-5" role="radiogroup" aria-label={f.who} style={{ ["--i" as string]: ROLES.indexOf(role) }}>
          <span className="lg-thumb" aria-hidden="true" />
          {ROLES.map((k, i) => (
            <button key={k} type="button" role="radio" aria-checked={role === k} onClick={() => setRole(k)}>
              {f.roles[i]}
            </button>
          ))}
        </div>
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
