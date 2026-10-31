"use client";

import { useEffect, useState } from "react";
import { getSettingsExtraText } from "@/i18n/settings-extra";
import type { Locale } from "@/i18n/config";

// Nové části Nastavení: animace zapnout/vypnout, změna e-mailu a hesla, rodičovská kontrola s PINem.
type Parental = { enabled: boolean; minutes: number; blockShop: boolean; blockTogether: boolean };

const input = "w-full rounded-xl border-2 border-[var(--edge)] bg-[var(--surface)] px-3 py-2 text-sm";
const btn = "btn-bouncy bg-[var(--brand-500)] px-4 py-2 text-sm font-bold text-white disabled:opacity-50";

async function post(url: string, body: object) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
  const data = res ? await res.json().catch(() => ({})) : {};
  return { ok: !!res?.ok, data } as { ok: boolean; data: Record<string, unknown> };
}

export function AccountSettings({ locale }: { locale: Locale }) {
  const t = getSettingsExtraText(locale);
  const [motionOff, setMotionOff] = useState(false);
  const [acct, setAcct] = useState<{ email: string | null; hasPassword: boolean } | null>(null);
  const [loggedIn, setLoggedIn] = useState(true);
  const [email, setEmail] = useState("");
  const [emailPass, setEmailPass] = useState("");
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [msg, setMsg] = useState<{ part: string; text: string } | null>(null);
  const [pc, setPc] = useState<Parental | null>(null);
  const [pcForm, setPcForm] = useState<Parental & { pin: string; newPin: string }>({ enabled: false, minutes: 0, blockShop: false, blockTogether: false, pin: "", newPin: "" });
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      setMotionOff(localStorage.getItem("motion") === "off");
    } catch {
      // bez localStorage zůstanou animace zapnuté
    }
    /* eslint-enable react-hooks/set-state-in-effect */
    void fetch("/api/ucet/email")
      .then((r) => r.json())
      .then((d) => {
        setLoggedIn(!!d.loggedIn);
        if (d.loggedIn) setAcct({ email: d.email, hasPassword: d.hasPassword });
      })
      .catch(() => {});
    void fetch("/api/ucet/rodic")
      .then((r) => r.json())
      .then((d) => {
        if (d.loggedIn === false || d.error) return;
        setPc(d);
        setPcForm((f) => ({ ...f, ...d }));
      })
      .catch(() => {});
  }, []);

  function toggleMotion(off: boolean) {
    setMotionOff(off);
    try {
      if (off) localStorage.setItem("motion", "off");
      else localStorage.removeItem("motion");
    } catch {
      // ignorovat
    }
    if (off) document.documentElement.setAttribute("data-motion", "off");
    else document.documentElement.removeAttribute("data-motion");
  }
  const say = (part: string, r: { ok: boolean; data: Record<string, unknown> }) =>
    setMsg({ part, text: r.ok ? t.saved : (t.errors[String(r.data.error)] ?? t.errors.x) });

  const heading = { fontFamily: "var(--font-heading)" } as const;
  const opt = (on: boolean) => `btn-bouncy rounded-full px-4 py-2 text-sm font-medium ${on ? "bg-[var(--brand-500)] text-white" : "bg-[var(--surface-muted)] text-[var(--muted)]"}`;
  const editable = !pc?.enabled || unlocked;

  return (
    <>
      <section className="card p-6">
        <h2 className="mb-2 text-lg font-bold" style={heading}>
          {t.motion}
        </h2>
        <p className="mb-3 text-sm text-[var(--muted)]">{t.motionHint}</p>
        <div className="flex gap-2">
          <button type="button" className={opt(!motionOff)} onClick={() => toggleMotion(false)}>
            {t.motionOn}
          </button>
          <button type="button" className={opt(motionOff)} onClick={() => toggleMotion(true)}>
            {t.motionOff}
          </button>
        </div>
      </section>

      <section className="card flex flex-col gap-4 p-6">
        <h2 className="text-lg font-bold" style={heading}>
          {t.account}
        </h2>
        {!loggedIn && <p className="text-sm text-[var(--muted)]">{t.loginFirst}</p>}
        {acct && (
          <>
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
              <input className={input} type="email" required placeholder={t.newEmail} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              {acct.hasPassword && <input className={input} type="password" required placeholder={t.currentPassword} value={emailPass} onChange={(e) => setEmailPass(e.target.value)} autoComplete="current-password" />}
              <div className="flex items-center gap-3">
                <button className={btn} type="submit">
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
              {acct.hasPassword && <input className={input} type="password" required placeholder={t.currentPassword} value={cur} onChange={(e) => setCur(e.target.value)} autoComplete="current-password" />}
              <input className={input} type="password" required minLength={8} placeholder={t.newPassword} value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" />
              <div className="flex items-center gap-3">
                <button className={btn} type="submit">
                  {acct.hasPassword ? t.savePassword : t.setPassword}
                </button>
                {msg?.part === "pass" && <span className="text-sm font-semibold">{msg.text}</span>}
              </div>
            </form>
          </>
        )}
      </section>

      {pc && (
        <section className="card flex flex-col gap-3 p-6">
          <h2 className="text-lg font-bold" style={heading}>
            👪 {t.parental}
          </h2>
          <p className="text-sm text-[var(--muted)]">{t.parentalHint}</p>
          {pc.enabled && !unlocked && (
            <form
              className="flex flex-wrap items-center gap-2"
              onSubmit={async (e) => {
                e.preventDefault();
                const r = await post("/api/ucet/rodic", { action: "verify", pin: pcForm.pin });
                if (r.ok) setUnlocked(true);
                else say("pc", r);
              }}
            >
              <span className="text-sm font-semibold">🔒 {t.locked}</span>
              <input className={`${input} max-w-[10rem]`} type="password" inputMode="numeric" placeholder={t.pin} value={pcForm.pin} onChange={(e) => setPcForm({ ...pcForm, pin: e.target.value })} />
              <button className={btn} type="submit">
                {t.unlock}
              </button>
            </form>
          )}
          {editable && (
            <form
              className="flex flex-col gap-3"
              onSubmit={async (e) => {
                e.preventDefault();
                const r = await post("/api/ucet/rodic", { action: "set", ...pcForm });
                say("pc", r);
                if (r.ok) {
                  const d = r.data as unknown as Parental;
                  setPc(d);
                  setPcForm((f) => ({ ...f, newPin: "", pin: f.newPin || f.pin }));
                }
              }}
            >
              <label className="flex flex-col gap-1 text-sm font-semibold">
                {pc.enabled ? t.newPin : t.pin} {!pc.enabled && <span className="text-xs font-normal text-[var(--muted)]">(4–8)</span>}
                <input className={`${input} max-w-[12rem]`} type="password" inputMode="numeric" value={pcForm.newPin} onChange={(e) => setPcForm({ ...pcForm, newPin: e.target.value })} required={!pc.enabled} />
              </label>
              <label className="flex flex-col gap-1 text-sm font-semibold">
                {t.minutes} <span className="text-xs font-normal text-[var(--muted)]">{t.noLimit}</span>
                <input className={`${input} max-w-[8rem]`} type="number" min={0} max={600} step={5} value={pcForm.minutes} onChange={(e) => setPcForm({ ...pcForm, minutes: Number(e.target.value) })} />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={pcForm.blockShop} onChange={(e) => setPcForm({ ...pcForm, blockShop: e.target.checked })} /> {t.blockShop}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={pcForm.blockTogether} onChange={(e) => setPcForm({ ...pcForm, blockTogether: e.target.checked })} /> {t.blockTogether}
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <button className={btn} type="submit">
                  {pc.enabled ? t.save : t.enable}
                </button>
                {pc.enabled && (
                  <button
                    type="button"
                    className="btn-bouncy bg-[var(--surface-muted)] px-4 py-2 text-sm font-bold"
                    onClick={async () => {
                      const r = await post("/api/ucet/rodic", { action: "disable", pin: pcForm.pin });
                      say("pc", r);
                      if (r.ok) {
                        setPc(r.data as unknown as Parental);
                        setUnlocked(false);
                      }
                    }}
                  >
                    {t.disable}
                  </button>
                )}
              </div>
            </form>
          )}
          {msg?.part === "pc" && <span className="text-sm font-semibold">{msg.text}</span>}
        </section>
      )}
    </>
  );
}
