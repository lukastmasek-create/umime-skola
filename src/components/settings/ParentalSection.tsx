"use client";

import { useEffect, useState } from "react";
import { getSettingsExtraText } from "@/i18n/settings-extra";
import { withFallbacks, type Locale } from "@/i18n/config";
import { inputClass, primaryButtonClass, headingStyle, post } from "./ui";

type Parental = { enabled: boolean; minutes: number; blockShop: boolean; blockTogether: boolean };
type Report = { days: number; threshold: number; doneThisWeek: number; doneTotal: number; titles: string[] };

const REPORT_TEXT: Record<Locale, { title: string; done: string; none: string; total: string; hint: string }> = withFallbacks({
  cs: { title: "Týdenní přehled", done: "Dokončené kurzy za posledních {days} dní: {n}", none: "Za posledních {days} dní zatím žádný kurz dokončen.", total: "Dokončeno celkem: {n}", hint: "Kurz se počítá jako dokončený, když má v testu aspoň {p} %." },
  en: { title: "Weekly summary", done: "Courses completed in the last {days} days: {n}", none: "No course completed in the last {days} days yet.", total: "Completed in total: {n}", hint: "A course counts as completed with at least {p}% on its test." },
  de: { title: "Wochenübersicht", done: "Abgeschlossene Kurse in den letzten {days} Tagen: {n}", none: "In den letzten {days} Tagen wurde noch kein Kurs abgeschlossen.", total: "Insgesamt abgeschlossen: {n}", hint: "Ein Kurs gilt als abgeschlossen, wenn der Test mindestens {p} % hat." },
  ru: { title: "Недельная сводка", done: "Пройдено курсов за последние {days} дней: {n}", none: "За последние {days} дней курсы ещё не пройдены.", total: "Всего пройдено: {n}", hint: "Курс считается пройденным, если тест сдан на {p} % и выше." },
});

const fill = (s: string, vars: Record<string, string | number>) => Object.entries(vars).reduce((acc, [k, v]) => acc.replace(`{${k}}`, String(v)), s);

// Sekce Rodičovská kontrola: PIN, denní limit a zákazy. Po zapnutí se změny dělají jen s PINem.
export function ParentalSection({ locale }: { locale: Locale }) {
  const t = getSettingsExtraText(locale);
  const [pc, setPc] = useState<Parental | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [pcForm, setPcForm] = useState<Parental & { pin: string; newPin: string }>({ enabled: false, minutes: 0, blockShop: false, blockTogether: false, pin: "", newPin: "" });
  const [unlocked, setUnlocked] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const rt = REPORT_TEXT[locale];

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
        {t.parental}
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
                // Odemčení PINem zároveň načte týdenní přehled (server ho vrací jen s platným PINem).
                const r = await post("/api/ucet/rodic", { action: "report", pin: pcForm.pin });
                if (r.ok) {
                  setUnlocked(true);
                  setReport(r.data as unknown as Report);
                } else say(r);
              }}
            >
              <span className="text-sm font-semibold">{t.locked}</span>
              <input className={`${inputClass} max-w-[10rem]`} type="password" inputMode="numeric" placeholder={t.pin} value={pcForm.pin} onChange={(e) => setPcForm({ ...pcForm, pin: e.target.value })} />
              <button className={primaryButtonClass} type="submit">
                {t.unlock}
              </button>
            </form>
          )}
          {pc.enabled && unlocked && report && (
            <div className="flex flex-col gap-2 rounded-xl bg-[var(--surface-muted)] p-4">
              <h3 className="text-base font-bold" style={headingStyle}>
                {rt.title}
              </h3>
              <p className="text-sm font-semibold">{fill(report.doneThisWeek > 0 ? rt.done : rt.none, { days: report.days, n: report.doneThisWeek })}</p>
              {report.titles.length > 0 && (
                <ul className="list-disc pl-5 text-sm">
                  {report.titles.map((title) => (
                    <li key={title}>{title}</li>
                  ))}
                </ul>
              )}
              <p className="text-sm text-[var(--muted)]">{fill(rt.total, { n: report.doneTotal })}</p>
              <p className="text-xs text-[var(--muted)]">{fill(rt.hint, { p: report.threshold })}</p>
            </div>
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
