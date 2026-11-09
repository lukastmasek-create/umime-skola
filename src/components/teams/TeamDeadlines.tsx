"use client";

import { DayGridView, Temporal, allDayEvent, type CalendarEvent } from "@savvycal/calendar";
import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { getTeamsAll } from "@/i18n/teams-more";
import { colorOf } from "./ui";

export type Deadline = { teamId: string; teamName: string; assignmentId: string; title: string; dueAt: string; done: boolean };

const TZ = "Europe/Prague";
const RANGE_DAYS = 13;

/** Kalendář termínů: zadání žáka jako celodenní události na dva týdny dopředu. Klik otevře zadání. */
export function TeamDeadlines({ locale, items }: { locale: Locale; items: Deadline[] }) {
  const t = getTeamsAll(locale);
  const router = useRouter();
  const startDate = Temporal.Now.plainDateISO(TZ);
  const endDate = startDate.add({ days: RANGE_DAYS });
  const inRange = items.filter((d) => {
    const day = Temporal.Instant.from(d.dueAt).toZonedDateTimeISO(TZ).toPlainDate();
    return Temporal.PlainDate.compare(day, startDate) >= 0 && Temporal.PlainDate.compare(day, endDate) <= 0;
  });
  const events: CalendarEvent[] = inRange.map((d) => {
    const day = Temporal.Instant.from(d.dueAt).toZonedDateTimeISO(TZ).toPlainDate();
    return allDayEvent({
      id: d.assignmentId,
      title: `${d.done ? "✓ " : ""}${d.title}`,
      ariaLabel: `${d.title} · ${d.teamName}`,
      resourceId: d.teamId,
      color: d.done ? "var(--accent-green)" : colorOf(d.teamName),
      startDate: day,
      endDate: day,
    });
  });
  return (
    <section className="card flex flex-col gap-3 p-4" aria-label={t.deadlinesTitle}>
      <h2 className="text-lg font-extrabold">{t.deadlinesTitle}</h2>
      {events.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">{t.deadlinesEmpty}</p>
      ) : (
        <div className="h-[22rem] overflow-hidden rounded-xl">
          <DayGridView
            activeRange={{ startDate, endDate }}
            timeZone={TZ}
            events={events}
            timeAxis={{ startHour: 8, endHour: 18, intervalMinutes: 60 }}
            onEventClick={(ev) => {
              const hit = inRange.find((d) => d.assignmentId === ev.id);
              if (hit) router.push(`/${locale}/tymy/${hit.teamId}/zadani/${hit.assignmentId}`);
            }}
          />
        </div>
      )}
    </section>
  );
}
