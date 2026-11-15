"use client";
import { withFallbacks } from "@/i18n/config";

import { useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

// Volba role (stejná jako u přihlášení), souhlas s podmínkami a upozornění pro děti do 15 let.
const EXTRA_TEXT = withFallbacks({
  cs: {
    who: "Kdo se registruje",
    roles: ["Žák", "Učitel", "Rodič"],
    sub: {
      student: "Účet zdarma: sbírej body, plň úkoly a sleduj, jak se zlepšuješ.",
      teacher: "Zdarma a bez reklam: po registraci založíš třídu a zadáš první úkol.",
      parent: "Zdarma: po registraci propojíš účet s dítětem a uvidíš jeho pokrok.",
    },
    consentPre: "Registrací souhlasíš s",
    terms: "podmínkami používání",
    and: "a bereš na vědomí",
    privacy: "zásady ochrany soukromí",
    under15: "Je ti méně než 15 let? Požádej rodiče, ať si podmínky přečte s tebou a souhlasí s registrací.",
  },
  en: {
    who: "Who is signing up",
    roles: ["Student", "Teacher", "Parent"],
    sub: {
      student: "Free account: collect points, complete tasks and see how you improve.",
      teacher: "Free and ad-free: after signing up you create a class and set the first task.",
      parent: "Free: after signing up you link your child's account and see their progress.",
    },
    consentPre: "By signing up you agree to the",
    terms: "terms of use",
    and: "and acknowledge the",
    privacy: "privacy policy",
    under15: "Under 15? Ask a parent to read the terms with you and agree to the sign-up.",
  },
  de: {
    who: "Wer registriert sich",
    roles: ["Schüler", "Lehrer", "Eltern"],
    sub: {
      student: "Kostenloses Konto: sammle Punkte, löse Aufgaben und sieh, wie du besser wirst.",
      teacher: "Kostenlos und werbefrei: Nach der Registrierung legst du eine Klasse an.",
      parent: "Kostenlos: Nach der Registrierung verknüpfst du das Konto deines Kindes.",
    },
    consentPre: "Mit der Registrierung stimmst du den",
    terms: "Nutzungsbedingungen",
    and: "zu und nimmst die",
    privacy: "Datenschutzerklärung zur Kenntnis",
    under15: "Unter 15? Bitte deine Eltern, die Bedingungen mit dir zu lesen und zuzustimmen.",
  },
  ru: {
    who: "Кто регистрируется",
    roles: ["Ученик", "Учитель", "Родитель"],
    sub: {
      student: "Бесплатный аккаунт: собирай баллы, выполняй задания и следи за успехами.",
      teacher: "Бесплатно и без рекламы: после регистрации создашь класс и первое задание.",
      parent: "Бесплатно: после регистрации свяжешь аккаунт с ребёнком и увидишь его прогресс.",
    },
    consentPre: "Регистрируясь, ты соглашаешься с",
    terms: "условиями использования",
    and: "и принимаешь к сведению",
    privacy: "политику конфиденциальности",
    under15: "Тебе меньше 15 лет? Попроси родителей прочитать условия вместе с тобой и дать согласие.",
  },
});
const ROLES = ["student", "teacher", "parent"] as const;
type RoleKey = (typeof ROLES)[number];
// Kam se po registraci jde, když nepřišel odkaz s cílem (stejně jako po přihlášení).
const ROLE_HOME: Record<RoleKey, string> = { student: "kurzy", teacher: "tymy", parent: "nastaveni" };

function parseRole(r: string | string[] | undefined): RoleKey {
  return typeof r === "string" && (ROLES as readonly string[]).includes(r) ? (r as RoleKey) : "student";
}

export default function RegistracePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ role?: string | string[] }>;
}) {
  const { locale } = use(params);
  const { role: roleParam } = use(searchParams);
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale as Locale);
  const x = EXTRA_TEXT[locale as Locale];

  const router = useRouter();
  const [role, setRole] = useState<RoleKey>(() => parseRole(roleParam));
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
      router.push(next ?? `/${locale}/${ROLE_HOME[role]}`);
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
        <p className="mb-4 text-sm text-[var(--muted)]">{role === "student" ? dict.auth.register.subtitle : x.sub[role]}</p>
        <div className="lg-roles mb-5" role="radiogroup" aria-label={x.who} style={{ ["--i" as string]: ROLES.indexOf(role) }}>
          <span className="lg-thumb" aria-hidden="true" />
          {ROLES.map((k, i) => (
            <button key={k} type="button" role="radio" aria-checked={role === k} onClick={() => setRole(k)}>
              {x.roles[i]}
            </button>
          ))}
        </div>
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
          <p className="text-xs text-[var(--muted)]">
            {x.consentPre}{" "}
            <Link href={`/${locale}/podminky`} className="font-semibold underline">{x.terms}</Link>{" "}
            {x.and}{" "}
            <Link href={`/${locale}/ochrana-soukromi`} className="font-semibold underline">{x.privacy}</Link>.
          </p>
          {role === "student" && <p className="text-xs text-[var(--muted)]">{x.under15}</p>}
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
