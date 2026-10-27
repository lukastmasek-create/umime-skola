import type { Block, Section, Topic } from "./types";

// Zkratky pro psaní obsahu, aby soubory s učivem zůstaly přehledné.
export const p = (text: string): Block => ({ type: "p", text });
export const ul = (...items: string[]): Block => ({ type: "list", items });
export const ol = (...items: string[]): Block => ({ type: "list", items, ordered: true });
export const table = (head: string[], ...rows: string[][]): Block => ({ type: "table", head, rows });
export const ex = (...items: string[]): Block => ({ type: "examples", items });
export const tip = (text: string): Block => ({ type: "tip", text });
export const sec = (heading: string, ...blocks: Block[]): Section => ({ heading, blocks });

export function topic(
  slug: string,
  title: string,
  level: Topic["level"],
  intro: string,
  sections: Section[],
  remember: string[],
): Topic {
  return { slug, title, level, intro, sections, remember };
}
