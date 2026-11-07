import type { Locale } from "@/i18n/config";

export class ApiError extends Error {
  constructor(public code: string) {
    super(code);
  }
}

export async function call<T = Record<string, unknown>>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, body === undefined ? { cache: "no-store" } : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = (await res.json().catch(() => ({}))) as { error?: string } & T;
  if (!res.ok) throw new ApiError(data.error ?? "unavailable");
  return data;
}

export const errorCode = (e: unknown) => (e instanceof ApiError ? e.code : "unavailable");

export const fmtDate = (locale: Locale, v: string | Date | null) =>
  v ? new Date(v).toLocaleString(locale, { day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
