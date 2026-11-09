"use client";

import { useEffect, useState } from "react";
import { getSettingsExtraText } from "@/i18n/settings-extra";
import type { Locale } from "@/i18n/config";
import { inputClass, primaryButtonClass, headingStyle, post } from "./ui";
import { notifyAccountChanged } from "@/lib/account-events";

// Sekce Účet: změna e-mailu a hesla.
export function AccountSection({ locale }: { locale: Locale }) {
  const t = getSettingsExtraText(locale);
  const [acct, setAcct] = useState<{ email: string | null; hasPassword: boolean } | null>(null);
  const [loggedIn, setLoggedIn] = useState(true);
  const [email, setEmail] = useState("");
  const [emailPass, setEmailPass] = useState("");
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [msg, setMsg] = useState<{ part: string; text: string } | null>(null);
  const [name, setName] = useState("");
  const [nameLoaded, setNameLoaded] = useState(false);

  useEffect(() => {
    void fetch("/api/ucet/email")
      .then((r) => r.json())
      .then((d) => {
        setLoggedIn(!!d.loggedIn);
        if (d.loggedIn) setAcct({ email: d.email, hasPassword: d.hasPassword });
      })
      .catch(() => {});
  }, []);

  // Aktuální jméno z profilu, aby formulář ukázal, co už je uložené.
  useEffect(() => {
    void fetch("/api/profil")
      .then((r) => r.json())
      .then((d) => {
        if (d.loggedIn) setName(d.name ?? "");
      })
      .catch(() => {})
      .finally(() => setNameLoaded(true));
  }, []);

  const say = (part: string, r: { ok: boolean; data: Record<string, unknown> }) =>
    setMsg({ part, text: r.ok ? t.saved : (t.errors[String(r.data.error)] ?? t.errors.x) });

  return (
    <section className="card flex flex-col gap-4 p-6">
      <h2 className="text-lg font-bold" style={headingStyle}>
        {t.account}
      </h2>
      {!loggedIn && <p className="text-sm text-[var(--muted)]">{t.loginFirst}</p>}
      {acct && (
        <>
          <form
            className="flex flex-col gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              const r = await post("/api/profil", { name: name.trim() });
              say("name", r);
              if (r.ok) {
                setName(String(r.data.name ?? name.trim()));
                notifyAccountChanged();
              }
            }}
          >
            <label className="text-sm font-bold" htmlFor="profile-name">
              {t.profileName}
            </label>
            <p className="text-xs text-[var(--muted)]">{t.nameHint}</p>
            <input
              id="profile-name"
              className={inputClass}
              type="text"
              required
              maxLength={40}
              disabled={!nameLoaded}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="nickname"
            />
            <div className="flex items-center gap-3">
              <button className={primaryButtonClass} type="submit" disabled={!nameLoaded}>
                {t.saveName}
              </button>
              {msg?.part === "name" && <span className="text-sm font-semibold">{msg.text}</span>}
            </div>
          </form>
          <form
            className="flex flex-col gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              const r = await post("/api/ucet/email", { email, password: emailPass });
              say("email", r);
              if (r.ok) {
                setAcct({ ...acct, email: String(r.data.email) });
                setEmail("");
                setEmailPass("");
              }
            }}
          >
            <p className="text-sm">
              {t.email}: <b>{acct.email ?? "—"}</b>
            </p>
            <input className={inputClass} type="email" required placeholder={t.newEmail} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            {acct.hasPassword && <input className={inputClass} type="password" required placeholder={t.currentPassword} value={emailPass} onChange={(e) => setEmailPass(e.target.value)} autoComplete="current-password" />}
            <div className="flex items-center gap-3">
              <button className={primaryButtonClass} type="submit">
                {t.saveEmail}
              </button>
              {msg?.part === "email" && <span className="text-sm font-semibold">{msg.text}</span>}
            </div>
          </form>
          <form
            className="flex flex-col gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              const r = await post("/api/ucet/heslo", { current: cur, next });
              say("pass", r);
              if (r.ok) {
                setCur("");
                setNext("");
                setAcct({ ...acct, hasPassword: true });
              }
            }}
          >
            {acct.hasPassword && <input className={inputClass} type="password" required placeholder={t.currentPassword} value={cur} onChange={(e) => setCur(e.target.value)} autoComplete="current-password" />}
            <input className={inputClass} type="password" required minLength={8} placeholder={t.newPassword} value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" />
            <div className="flex items-center gap-3">
              <button className={primaryButtonClass} type="submit">
                {acct.hasPassword ? t.savePassword : t.setPassword}
              </button>
              {msg?.part === "pass" && <span className="text-sm font-semibold">{msg.text}</span>}
            </div>
          </form>
        </>
      )}
    </section>
  );
}
