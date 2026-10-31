// Kontaktní formulář: kategorie, témata a kontrola odeslaných dat. Čistý kód bez databáze a Reactu,
// aby se dal použít v API, ve formuláři i v testech (npm test).
//
//  Podpora:        chyba v učivu, chyba ve stránce, chyba s účtem
//  Partnerství:    partnerská škola, influenceři, učebnice pro materiály
//  Přidání školy:  žádost o doplnění školy do seznamu

export const CONTACT_CATEGORIES = ["support", "partner", "school"] as const;
export type ContactCategory = (typeof CONTACT_CATEGORIES)[number];

export const CONTACT_TOPICS = [
  "content-error",
  "site-error",
  "account",
  "partner-school",
  "influencer",
  "textbooks",
  "add-school",
] as const;
export type ContactTopic = (typeof CONTACT_TOPICS)[number];

/** Doplňující pole u témat. Klíče jsou i klíči textů v i18n/contact.ts. */
export const CONTACT_FIELDS = ["where", "url", "accountEmail", "schoolName", "city", "role", "profile", "audience", "publisher", "izo"] as const;
export type ContactField = (typeof CONTACT_FIELDS)[number];

export type FieldDef = { key: ContactField; required: boolean; max: number; type?: "url" | "email" | "text" };

export type TopicDef = { id: ContactTopic; category: ContactCategory; fields: FieldDef[] };

export const TOPICS: TopicDef[] = [
  { id: "content-error", category: "support", fields: [{ key: "where", required: true, max: 200 }, { key: "url", required: false, max: 500, type: "url" }] },
  { id: "site-error", category: "support", fields: [{ key: "url", required: false, max: 500, type: "url" }] },
  { id: "account", category: "support", fields: [{ key: "accountEmail", required: false, max: 200, type: "email" }] },
  { id: "partner-school", category: "partner", fields: [{ key: "schoolName", required: true, max: 120 }, { key: "city", required: false, max: 80 }, { key: "role", required: false, max: 80 }] },
  { id: "influencer", category: "partner", fields: [{ key: "profile", required: true, max: 500 }, { key: "audience", required: false, max: 80 }] },
  { id: "textbooks", category: "partner", fields: [{ key: "publisher", required: true, max: 120 }, { key: "url", required: false, max: 500, type: "url" }] },
  { id: "add-school", category: "school", fields: [{ key: "schoolName", required: true, max: 120 }, { key: "city", required: true, max: 80 }, { key: "izo", required: false, max: 20 }] },
];

export const topicsOf = (category: ContactCategory) => TOPICS.filter((t) => t.category === category);
export const topicDef = (id: string) => TOPICS.find((t) => t.id === id);
export const isCategory = (v: unknown): v is ContactCategory => typeof v === "string" && (CONTACT_CATEGORIES as readonly string[]).includes(v);

export const NAME_MAX = 80;
export const EMAIL_MAX = 200;
export const MESSAGE_MIN = 10;
export const MESSAGE_MAX = 4000;

/** Kolik zpráv může jeden odesílatel (účet nebo e-mail) poslat za RATE_WINDOW_MS. */
export const RATE_LIMIT = 3;
export const RATE_WINDOW_MS = 10 * 60_000;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const isEmail = (v: string) => v.length <= EMAIL_MAX && EMAIL_RE.test(v);

export function isHttpUrl(v: string): boolean {
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

const oneLine = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");
const multiLine = (v: unknown, max: number) =>
  typeof v === "string"
    ? v
        .replace(/\r\n?/g, "\n")
        // řídicí znaky kromě tabulátoru a nového řádku pryč
        .replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
        .slice(0, max)
    : "";

export type ContactInput = {
  topic: ContactTopic;
  category: ContactCategory;
  name: string;
  email: string;
  message: string;
  details: Partial<Record<ContactField, string>>;
};

export type ContactError =
  | "topic"
  | "name"
  | "email"
  | "message-short"
  | `field:${ContactField}`;

export type ContactResult = { ok: true; data: ContactInput } | { ok: false; error: ContactError };

/** Vyčistí a zkontroluje odeslaný formulář. Neznámá pole zahodí. */
export function validateContact(raw: unknown): ContactResult {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const def = typeof r.topic === "string" ? topicDef(r.topic) : undefined;
  if (!def) return { ok: false, error: "topic" };

  const name = oneLine(r.name, NAME_MAX);
  if (name.length < 2) return { ok: false, error: "name" };
  const email = oneLine(r.email, EMAIL_MAX).toLowerCase();
  if (!isEmail(email)) return { ok: false, error: "email" };
  const message = multiLine(r.message, MESSAGE_MAX);
  if (message.length < MESSAGE_MIN) return { ok: false, error: "message-short" };

  const rawDetails = (r.details && typeof r.details === "object" ? r.details : {}) as Record<string, unknown>;
  const details: Partial<Record<ContactField, string>> = {};
  for (const f of def.fields) {
    const value = oneLine(rawDetails[f.key], f.max);
    if (!value) {
      if (f.required) return { ok: false, error: `field:${f.key}` };
      continue;
    }
    if (f.type === "url" && !isHttpUrl(value)) return { ok: false, error: `field:${f.key}` };
    if (f.type === "email" && !isEmail(value.toLowerCase())) return { ok: false, error: `field:${f.key}` };
    details[f.key] = f.type === "email" ? value.toLowerCase() : value;
  }

  return { ok: true, data: { topic: def.id, category: def.category, name, email, message, details } };
}

/** Téma z odkazu (?tema=…): přijme id tématu i kategorie, jinak nic. */
export function topicFromQuery(v: string | undefined | null): { category: ContactCategory | null; topic: ContactTopic | null } {
  if (!v) return { category: null, topic: null };
  const def = topicDef(v);
  if (def) return { category: def.category, topic: def.id };
  if (isCategory(v)) {
    const only = topicsOf(v);
    return { category: v, topic: only.length === 1 ? only[0].id : null };
  }
  return { category: null, topic: null };
}
