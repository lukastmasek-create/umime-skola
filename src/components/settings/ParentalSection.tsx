"use client";

import { useEffect, useState } from "react";
import { getSettingsExtraText } from "@/i18n/settings-extra";
import type { Locale } from "@/i18n/config";
import { inputClass, primaryButtonClass, headingStyle, post } from "./ui";

type Parental = { enabled: boolean; minutes: number; blockShop: boolean; blockTogether: boolean };

// Sekce Rodičovská kontrola: PIN, denní limit a zákazy. Po zapnutí se změny dělají jen s PINem.
export function ParentalSection({ locale }: { locale: Locale }) {
  const t = getSettingsExtraText(locale);
  const [pc, setPc] = useState<Parental | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [pcForm, setPcForm] = useState<Parental & { pin: string; newPin: string }>({ enabled: false, minutes: 0, blockShop: false, blockTogether: false, pin: "", newPin: "" });
  const [unlocked, setUnlocked] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/ucet/rodic")
      .then((r) => r.json())
      .then((d) => {
        if (d.loggedIn === false || d.error) return;
        setPc(d);
        setPcForm((f) => ({ ...f, ...d }));
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const say = (r: { ok: boolean; data: Record<string, unknown> }) => setMsg(r.ok ? t.saved : (t.errors[String(r.data.error)] ?? t.errors.x));
  const editable = !pc?.enabled || unlocked;

  return (
    <section className="card flex flex-col gap-3 p-6">
      <h2 className="text-lg font-bold" style={headingStyle}>
        👪 {t.parental}
      </h2>
      {loaded && !pc && <p className="text-sm text-[var(--muted)]">{t.loginFirst}</p>}
      {pc && (
        <>
          <p className="text-sm text-[var(--muted)]">{t.parentalHint}</p>
          {pc.enabled && !unlocked && (
            <form
              className="flex flex-wrap items-center gap-2"
              onSubmit={async (e) => {
                e.preventDefault();
                const r = await post("/api/ucet/rodic", { action: "verify", pin: pcForm.pin });
                if (r.ok) setUnlocked(true);
                else say(r);
              }}
            >
              <span className="text-sm font-semibold">🔒 {t.locked}</span>
              <input className={`${inputClass} max-w-[10rem]`} type="password" inputMode="numeric" placeholder={t.pin} value={pcForm.pin} onChange={(e) => setPcForm({ ...pcForm, pin: e.target.value })} />
              <button className={primaryButtonClass} type="submit">
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
                say(r);
                if (r.ok) {
                  const d = r.data as unknown as Parental;
                  setPc(d);
                  setPcForm((f) => ({ ...f, newPin: "", pin: f.newPin || f.pin }));
                }
              }}
            >
              <label className="flex flex-col gap-1 text-sm font-semibold">
                {pc.enabled ? t.newPin : t.pin} {!pc.enabled && <span className="text-xs font-normal text-[var(--muted)]">(4–8)</span>}
                <input className={`${inputClass} max-w-[12rem]`} type="password" inputMode="numeric" value={pcForm.newPin} onChange={(e) => setPcForm({ ...pcForm, newPin: e.target.value })} required={!pc.enabled} />
              </label>
              <label className="flex flex-col gap-1 text-sm font-semibold">
                {t.minutes} <span className="text-xs font-normal text-[var(--muted)]">{t.noLimit}</span>
                <input className={`${inputClass} max-w-[8rem]`} type="number" min={0} max={600} step={5} value={pcForm.minutes} onChange={(e) => setPcForm({ ...pcForm, minutes: Number(e.target.value) })} />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={pcForm.blockShop} onChange={(e) => setPcForm({ ...pcForm, blockShop: e.target.checked })} /> {t.blockShop}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={pcForm.blockTogether} onChange={(e) => setPcForm({ ...pcForm, blockTogether: e.target.checked })} /> {t.blockTogether}
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <button className={primaryButtonClass} type="submit">
                  {pc.enabled ? t.save : t.enable}
                </button>
                {pc.enabled && (
                  <button
                    type="button"
                    className="btn-bouncy bg-[var(--surface-muted)] px-4 py-2 text-sm font-bold"
                    onClick={async () => {
                      const r = await post("/api/ucet/rodic", { action: "disable", pin: pcForm.pin });
                      say(r);
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
          {msg && <span className="text-sm font-semibold">{msg}</span>}
        </>
      )}
    </section>
  );
}
