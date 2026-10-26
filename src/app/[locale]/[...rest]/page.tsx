import { notFound } from "next/navigation";

// Neznámé adresy pod jazykem končí v [locale]/not-found.tsx, tedy s hlavičkou a patičkou webu.
export default function CatchAll() {
  notFound();
}
