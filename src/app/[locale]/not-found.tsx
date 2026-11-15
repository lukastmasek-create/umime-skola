import type { Metadata } from "next";
import { NotFoundView } from "@/components/NotFoundView";

// Vlastní titulek 404 (šablona v layoutu doplní „· Učíme se hrou“). Obsah v jazyce adresy řeší klientská komponenta.
export const metadata: Metadata = { title: "404" };

export default function NotFound() {
  return <NotFoundView />;
}
