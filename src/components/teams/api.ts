export const ERRORS: Record<string, string> = {
  "login-required": "Pro týmy se musíš přihlásit.",
  "team-not-found": "Tým nenalezen.",
  "unknown-code": "Takový kód neexistuje.",
  "invalid-name": "Název musí mít aspoň 2 znaky.",
  "too-many-teams": "Dosáhl/a jsi maximálního počtu týmů.",
  "user-not-found": "Uživatel s tímto e-mailem nemá účet.",
  "no-questions": "Z vybraného zdroje nevzešly žádné otázky.",
  "no-attempts-left": "Už nemáš žádný další pokus.",
  "rate-limited": "Moc rychle, zkus to za chvíli.",
  "teacher-only": "Tohle může jen učitel.",
};

export async function call<T = Record<string, unknown>>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, body === undefined ? { cache: "no-store" } : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = (await res.json().catch(() => ({}))) as { error?: string } & T;
  if (!res.ok) throw new Error(ERRORS[data.error ?? ""] ?? "Něco se nepovedlo. Zkus to znovu.");
  return data;
}

export const fmtDate = (v: string | Date | null) => (v ? new Date(v).toLocaleString("cs-CZ", { day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" }) : "—");
