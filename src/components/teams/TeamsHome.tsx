"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { call } from "./api";

type TeamRow = { id: string; name: string; role: string; code: string | null; members: number; assignments: number; open: number };

export function TeamsHome({ locale }: { locale: string }) {
  const router = useRouter();
  const [teams, setTeams] = useState<TeamRow[] | null>(null);
  const [auth, setAuth] = useState(true);
  const [name, setName] = useState("");
  const [teacher, setTeacher] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setTeams((await call<{ teams: TeamRow[] }>("/api/tymy")).teams);
    } catch (e) {
      if ((e as Error).message.includes("přihlásit")) setAuth(false);
      else setError((e as Error).message);
      setTeams([]);
    }
  }, []);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function act(body: object) {
    setError("");
    try {
      const { id } = await call<{ id: string }>("/api/tymy", body);
      router.push(`/${locale}/tymy/${id}`);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (!auth)
    return (
      <div className="card flex flex-col items-start gap-3 p-6">
        <p className="text-[var(--muted)]">Přihlas se, ať můžeš zakládat týmy a plnit zadání.</p>
        <Link href={`/${locale}/prihlaseni`} className="btn-bouncy bg-[var(--brand-500)] px-5 py-2.5 text-sm font-bold text-white">Přihlásit se</Link>
      </div>
    );

  return (
    <div className="flex flex-col gap-8">
      {error && <p className="card p-3 text-sm font-semibold text-[var(--danger)]">{error}</p>}
      <section className="grid gap-4 sm:grid-cols-2">
        <form className="card flex flex-col gap-3 p-5" onSubmit={(e) => { e.preventDefault(); void act({ action: "create", name, asTeacher: teacher }); }}>
          <h2 className="text-lg font-extrabold">Založit tým / třídu</h2>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder="Název (třeba 5. B – matematika)" aria-label="Název týmu" className="rounded-xl border-2 border-[var(--field-border)] bg-[var(--surface)] px-3 py-2 text-sm" />
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={teacher} onChange={(e) => setTeacher(e.target.checked)} className="size-4" />
            Jsem učitel (budu zadávat úkoly a přidávat žáky)
          </label>
          <button className="btn-bouncy self-start bg-[var(--brand-500)] px-5 py-2 text-sm font-bold text-white">Vytvořit</button>
        </form>
        <form className="card flex flex-col gap-3 p-5" onSubmit={(e) => { e.preventDefault(); void act({ action: "join", code }); }}>
          <h2 className="text-lg font-extrabold">Připojit se kódem</h2>
          <p className="text-sm text-[var(--muted)]">Kód ti dá učitel. Můžeš být přidán/a i podle e-mailu, pak se tým objeví tady.</p>
          <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={12} placeholder="Kód týmu" aria-label="Kód týmu" className="rounded-xl border-2 border-[var(--field-border)] bg-[var(--surface)] px-3 py-2 text-sm uppercase tracking-widest" />
          <button className="btn-bouncy self-start bg-[var(--accent-green)] px-5 py-2 text-sm font-bold text-white">Připojit se</button>
        </form>
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-extrabold">Moje týmy</h2>
        {teams === null && <div className="card h-24 animate-pulse bg-[var(--surface-muted)]" aria-hidden />}
        {teams?.length === 0 && <p className="text-[var(--muted)]">Zatím v žádném týmu nejsi.</p>}
        <ul className="grid gap-3 sm:grid-cols-2">
          {teams?.map((t) => (
            <li key={t.id}>
              <Link href={`/${locale}/tymy/${t.id}`} className="card flex h-full flex-col gap-1 p-4 hover:-translate-y-0.5">
                <span className="flex items-center justify-between gap-2">
                  <b className="truncate text-lg">{t.name}</b>
                  <span className="rounded-full bg-[var(--brand-50)] px-2 py-0.5 text-xs font-bold text-[var(--brand-700)]">{t.role === "TEACHER" ? "Učitel" : "Žák"}</span>
                </span>
                <span className="text-sm text-[var(--muted)]">{t.members} členů · {t.assignments} zadání{t.role === "STUDENT" && t.open > 0 ? ` · ${t.open} čeká na splnění` : ""}</span>
                {t.code && <span className="text-xs text-[var(--muted)]">Kód: <b className="tracking-widest">{t.code}</b></span>}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
