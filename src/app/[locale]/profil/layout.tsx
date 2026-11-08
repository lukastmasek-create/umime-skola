import type { Metadata } from "next";

// Osobní stránka bez významu pro vyhledávače.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
