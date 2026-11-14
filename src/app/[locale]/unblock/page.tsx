import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { UnblockGame } from "@/components/unblock/UnblockGame";

export default async function UnblockPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-bold sm:text-4xl" style={{ fontFamily: "var(--font-heading)" }}>
          Unblock
        </h1>
        <p className="max-w-2xl text-[var(--muted)]">
          Answer a block&apos;s question to free it, slide it along its track, and clear the key block out through the exit.
        </p>
      </header>
      <UnblockGame />
    </div>
  );
}
