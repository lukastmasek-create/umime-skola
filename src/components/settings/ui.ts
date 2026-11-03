// Sdílené styly a pomocníci pro sekce Nastavení.
export const inputClass = "w-full rounded-xl border-2 border-[var(--edge)] bg-[var(--surface)] px-3 py-2 text-sm";
export const primaryButtonClass = "btn-bouncy bg-[var(--brand-500)] px-4 py-2 text-sm font-bold text-white disabled:opacity-50";
export const headingStyle = { fontFamily: "var(--font-heading)" } as const;

export type PostResult = { ok: boolean; data: Record<string, unknown> };

export async function post(url: string, body: object): Promise<PostResult> {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
  const data = res ? await res.json().catch(() => ({})) : {};
  return { ok: !!res?.ok, data };
}
