// Čistá logika ústního zkoušení (bez sítě a AI), aby šla testovat.

export type OralTurn = { role: "user" | "assistant"; content: string };

export const ORAL_MAX_CHARS = 500;
export const ORAL_START = "Jsem připravený/á, začni zkoušet.";

/** Zahodí neplatné zprávy, ořízne délky a slévá za sebou jdoucí zprávy stejné role. */
function normalize(raw: unknown): OralTurn[] {
  if (!Array.isArray(raw)) return [];
  const out: OralTurn[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const r = item as Record<string, unknown>;
    const content = typeof r.content === "string" ? r.content.trim().slice(0, ORAL_MAX_CHARS) : "";
    if ((r.role !== "user" && r.role !== "assistant") || !content) continue;
    const last = out[out.length - 1];
    if (last && last.role === r.role) last.content += "\n" + content;
    else out.push({ role: r.role, content });
  }
  return out;
}

/**
 * Historie pro položení další otázky. Zkoušející musí vidět i svou předchozí otázku,
 * proto se nezahazuje úvodní zkoušející zpráva. Konverzace začíná žákem (API to vyžaduje)
 * a končí jeho odpovědí.
 */
export function oralTurns(raw: unknown, maxTurns = 12): OralTurn[] {
  let turns = normalize(raw).slice(-maxTurns);
  if (turns.length === 0 || turns[0].role !== "user") turns = [{ role: "user", content: ORAL_START }, ...turns];
  return turns;
}

/** Přepis celého zkoušení pro hodnocení na konci. Neřeší, jakou zprávou konverzace končí. */
export function oralTranscript(raw: unknown, maxTurns = 40): OralTurn[] {
  return normalize(raw).slice(-maxTurns);
}
