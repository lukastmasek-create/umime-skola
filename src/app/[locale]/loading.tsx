// Načítací stav při přechodu mezi stránkami: kroužek a kostra obsahu místo prázdné obrazovky.
export default function Loading() {
  return (
    <div className="page-enter mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-16 sm:px-6" role="status" aria-busy="true" aria-label="…">
      <span className="spinner" aria-hidden />
      <div className="w-full max-w-xl space-y-3">
        <div className="h-8 w-2/3 animate-pulse rounded-xl bg-[var(--surface-muted)]" />
        <div className="h-4 w-full animate-pulse rounded-lg bg-[var(--surface-muted)]" />
        <div className="h-4 w-5/6 animate-pulse rounded-lg bg-[var(--surface-muted)]" />
      </div>
    </div>
  );
}
