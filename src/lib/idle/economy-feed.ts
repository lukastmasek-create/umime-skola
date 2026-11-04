// Veřejná oznámení Ekonomiky: založení firmy a předehnání hráče v žebříčku.
// Čistá logika bez databáze. Zápis do tabulky dělá economy-server.ts (ve stejné transakci jako uložení stavu).
import type { CompanyId, EconomyState } from "./economy.ts";

export const FEED_KEEP = 15; // kolik posledních oznámení se zobrazí
export const OVERTAKE_MAX = 10; // nejvýš tolik předehnaných hráčů z jednoho skoku rekordu (ať nevzniká spam)

// Firmy, které hráč tímto krokem založil: první kus daného oboru (0 → 1).
export function foundedCompanies(prev: EconomyState, next: EconomyState): CompanyId[] {
  return (Object.keys(next.companies) as CompanyId[]).filter((id) => (prev.companies[id] ?? 0) <= 0 && (next.companies[id] ?? 0) > 0);
}

// Rekord hráče vzrostl z `prevBest` na `nextBest`. Předehnaní jsou hráči s rekordem v (prevBest, nextBest].
// Hráč bez rekordu (0) ještě není v žebříčku, takže nikoho nepředhání: jen se do něj dostává.
export function overtakeRange(prevBest: number, nextBest: number): { low: number; high: number } | null {
  if (prevBest <= 0 || nextBest <= prevBest) return null;
  return { low: prevBest, high: nextBest };
}
