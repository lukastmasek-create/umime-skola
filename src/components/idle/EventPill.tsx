import type { Locale } from "@/i18n/config";
import { EVENT_TEXT, eventLabel } from "@/i18n/events";

export type EventInfo = { total: number; events: string[]; focus: boolean };

/** Malý štítek s bonusem ze sezónní události nebo hry týdne; když nic neběží, nezobrazí se nic. */
export function EventPill({ event, locale }: { event?: EventInfo | null; locale: Locale }) {
  if (!event || event.total <= 0) return null;
  const label = eventLabel(event.events, event.focus, locale);
  return (
    <span className="pill bg-[var(--accent-500)] px-3 py-1 text-sm text-white" title={`${label}. ${EVENT_TEXT.hint[locale]}`}>
      🎉 {EVENT_TEXT.pill[locale].replace("{n}", String(Math.round(event.total * 100)))}
      <span className="ml-1.5 hidden text-xs font-medium opacity-90 sm:inline">{label}</span>
    </span>
  );
}
