import { SUBJECTS } from "@/lib/taxonomy";
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
};

export function getTopics(subjectSlug: string): Topic[] {
  return MATERIALS[subjectSlug] ?? [];
}

export function getTopic(subjectSlug: string, topicSlug: string) {
  const topics = getTopics(subjectSlug);
  const index = topics.findIndex((t) => t.slug === topicSlug);
  if (index < 0) return null;
  return { topic: topics[index], prev: topics[index - 1] ?? null, next: topics[index + 1] ?? null };
}

export function getMaterialSubjects() {
  return SUBJECTS.filter((s) => getTopics(s.slug).length > 0);
}
