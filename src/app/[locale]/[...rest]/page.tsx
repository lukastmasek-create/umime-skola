import type { Metadata } from "next";
import { notFound } from "next/navigation";

// Titulek neznámé adresy (šablona v layoutu doplní „· Učíme se hrou“).
export const metadata: Metadata = { title: "404", robots: { index: false, follow: false } };

// Neznámé adresy pod jazykem končí v [locale]/not-found.tsx, tedy s hlavičkou a patičkou webu.
export default function CatchAll() {
  notFound();
}
