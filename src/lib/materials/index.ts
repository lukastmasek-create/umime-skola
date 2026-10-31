import { SUBJECTS, type SubjectValue } from "@/lib/taxonomy";
import type { Locale } from "@/i18n/config";
import { getSubjectText } from "@/i18n/subjects";
import type { Topic } from "./types";
import { cestina } from "./cestina";
import { literatura } from "./literatura";
import { anglictina } from "./anglictina";
import { nemcina } from "./nemcina";
import { rustina } from "./rustina";
import { matematika } from "./matematika";
import { dejepis } from "./dejepis";
import { zemepis } from "./zemepis";
import { prirodopis } from "./prirodopis";
import { fyzika } from "./fyzika";
import { chemie } from "./chemie";
import { obcanka } from "./obcanka";
import { hudebka } from "./hudebka";
import { francouzstina } from "./francouzstina";
import { informatika } from "./informatika";
import { vytvarka } from "./vytvarka";

// Klíč = slug předmětu z taxonomy.ts.
const MATERIALS: Record<string, Topic[]> = {
  cestina,
  literatura,
  anglictina,
  nemcina,
  rustina,
  matematika,
  dejepis,
  zemepis,
  prirodopis,
  fyzika,
  chemie,
  obcanka,
  hudebka,
  francouzstina,
  informatika,
  vytvarka,
};

// Předmět v materiálech: z kurzů (taxonomy.ts) nebo jen pro materiály (bez kurzů, s vlastními názvy).
export type MaterialSubject = { slug: string; value: SubjectValue | null; emoji: string; color: string; names?: Record<Locale, string> };
const EXTRA_SUBJECTS: MaterialSubject[] = [
  { slug: "informatika", value: null, emoji: "💻", color: "#6fc3ff", names: { cs: "Informatika", en: "Computer science", de: "Informatik", ru: "Информатика" } },
  { slug: "vytvarka", value: null, emoji: "🎨", color: "#ffb3d9", names: { cs: "Výtvarná výchova", en: "Art", de: "Kunst", ru: "Изобразительное искусство" } },
];

export function getTopics(subjectSlug: string): Topic[] {
  return MATERIALS[subjectSlug] ?? [];
}

export function getTopic(subjectSlug: string, topicSlug: string) {
  const topics = getTopics(subjectSlug);
  const index = topics.findIndex((t) => t.slug === topicSlug);
  if (index < 0) return null;
  return { topic: topics[index], prev: topics[index - 1] ?? null, next: topics[index + 1] ?? null };
}

export function getMaterialSubjects(): MaterialSubject[] {
  return [...SUBJECTS, ...EXTRA_SUBJECTS].filter((s) => getTopics(s.slug).length > 0);
}

export function getMaterialSubject(slug: string): MaterialSubject | null {
  return getMaterialSubjects().find((s) => s.slug === slug) ?? null;
}

export function materialSubjectLabel(subject: MaterialSubject, locale: Locale): string {
  return subject.names?.[locale] ?? (subject.value ? getSubjectText(locale).labels[subject.value] : subject.slug);
}
