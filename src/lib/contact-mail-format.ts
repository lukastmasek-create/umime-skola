import type { ContactInput } from "./contact";
import { getContactText } from "../i18n/contact";

// E-mail pro tým podpory, který přijde po každé zprávě z kontaktního formuláře.
// Čistý kód bez databáze a Workers bindingů, aby šel otestovat v `npm test`.
// Tělo je prostý text (žádné HTML), takže se uživatelský vstup nevkládá do markupu.

export type SupportMail = { subject: string; text: string; replyTo: string };

const SUBJECT_MAX = 150;
const t = getContactText("cs");

/** Jeden řádek bez zalomení, aby nešlo do hlaviček vložit další. */
const line = (v: string) => v.replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim();

export function buildSupportMail(input: ContactInput, id: string, createdAt: Date): SupportMail {
  const category = t.categories[input.category].title;
  const topic = t.topics[input.topic].title;
  const subject = line(`[Učíme se hrou] ${category}: ${topic} — ${input.name}`).slice(0, SUBJECT_MAX);

  const details = Object.entries(input.details).map(([key, value]) => `  ${t.fields[key as keyof typeof t.fields]}: ${value}`);

  const text = [
    "Nová zpráva z kontaktního formuláře.",
    "",
    `Kategorie: ${category}`,
    `Téma: ${topic}`,
    `Od: ${line(input.name)} <${input.email}>`,
    `Čas: ${createdAt.toISOString()}`,
    `ID zprávy: ${id}`,
    ...(details.length ? ["", "Podrobnosti:", ...details] : []),
    "",
    "Zpráva:",
    input.message,
    "",
    "Odpovíš jednoduše tak, že odpovíš na tento e-mail (adresa odesílatele je v Reply-To).",
  ].join("\n");

  return { subject, text, replyTo: input.email };
}
