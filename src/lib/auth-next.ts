// Bezpečné „kam po přihlášení“: povolí jen cestu uvnitř stejného jazyka (např. /cs/tymy).
export function safeNext(locale: string, raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (!raw.startsWith(`/${locale}/`)) return null;
  if (raw.includes("//", 1) || raw.includes("\\") || /[\r\n]/.test(raw)) return null;
  return raw;
}

// Přečte ?next= z adresy v prohlížeči (volat jen v klientu, např. v obsluze formuláře).
export function readNext(locale: string): string | null {
  if (typeof window === "undefined") return null;
  return safeNext(locale, new URLSearchParams(window.location.search).get("next"));
}
