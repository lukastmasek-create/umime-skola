// Čistá logika e-mailových připomínek termínů zadání (bez databáze, aby šla testovat).
// Žák dostane připomínku den před termínem, pokud zadání ještě nesplnil.
// Učitel dostane po termínu souhrn, kolik žáků zadání splnilo.

export const REMIND_BEFORE_HOURS = 24;
export const SUMMARY_WITHIN_HOURS = 24;

export type NotifyPrefs = { deadline: boolean };

/** Výchozí stav je vypnuto: e-maily chodí jen tomu, kdo si je zapnul. */
export function parseNotifyPrefs(raw: unknown): NotifyPrefs {
  const deadline = typeof raw === "object" && raw !== null && (raw as { deadline?: unknown }).deadline === true;
  return { deadline };
}

const HOUR = 3600_000;

/** Termín nastane během příštích 24 hodin. */
export function studentReminderDue(dueAt: Date | null, now: Date): boolean {
  if (!dueAt) return false;
  const ms = dueAt.getTime() - now.getTime();
  return ms > 0 && ms <= REMIND_BEFORE_HOURS * HOUR;
}

/** Termín skončil před méně než 24 hodinami. */
export function teacherSummaryDue(dueAt: Date | null, now: Date): boolean {
  if (!dueAt) return false;
  const ms = now.getTime() - dueAt.getTime();
  return ms >= 0 && ms <= SUMMARY_WITHIN_HOURS * HOUR;
}

/** Klíč záznamu „už odesláno“ (jeden e-mail na uživatele, zadání a druh). */
export const sentKey = (kind: "student" | "teacher", assignmentId: string) => `pripominka:${kind}:${assignmentId}`;

/** Jeden řádek bez zalomení, aby nešlo do předmětu vložit další hlavičky. */
const line = (v: string) => v.replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim();

const fmt = (d: Date) =>
  new Intl.DateTimeFormat("cs-CZ", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Prague" }).format(d);

export type Mail = { subject: string; text: string };

const footer = (settingsUrl: string) =>
  ["", "—", `Tyto e-maily dostáváš, protože sis je zapnul/a. Vypnout je můžeš v Nastavení → Oznámení: ${settingsUrl}`].join("\n");

export function buildStudentMail(o: { title: string; teamName: string; dueAt: Date; url: string; settingsUrl: string }): Mail {
  return {
    subject: line(`Připomínka: zadání „${o.title}“ má termín ${fmt(o.dueAt)}`).slice(0, 150),
    text: [
      `Ahoj, třída ${line(o.teamName)} má zadání „${line(o.title)}“ s termínem ${fmt(o.dueAt)}.`,
      "Zatím jsi ho nesplnil/a, tak se na to podívej:",
      o.url,
      footer(o.settingsUrl),
    ].join("\n"),
  };
}

export function buildTeacherMail(o: { title: string; teamName: string; dueAt: Date; done: number; total: number; url: string; settingsUrl: string }): Mail {
  return {
    subject: line(`Termín zadání „${o.title}“ skončil: splnilo ${o.done} z ${o.total}`).slice(0, 150),
    text: [
      `Termín zadání „${line(o.title)}“ ve třídě ${line(o.teamName)} (${fmt(o.dueAt)}) skončil.`,
      `Splnilo ho ${o.done} z ${o.total} žáků.`,
      "Výsledky najdeš tady:",
      o.url,
      footer(o.settingsUrl),
    ].join("\n"),
  };
}

/** Nastavený CRON_SECRET musí sedět s hlavičkou Authorization: Bearer ...; bez secretu se nepustí nikdo. */
export function cronAuthorized(secret: string | undefined, header: string | null): boolean {
  if (!secret || secret.length < 16 || !header) return false;
  const expected = `Bearer ${secret}`;
  if (header.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= header.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}
