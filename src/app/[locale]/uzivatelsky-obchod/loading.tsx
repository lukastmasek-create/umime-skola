// Okamžitá kostra při vstupu do obchodu, než dorazí stránka a 3D scéna.
export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16" role="status" aria-busy="true" aria-label="…">
      <div className="mb-4 h-9 w-64 animate-pulse rounded-xl bg-[var(--surface-muted)]" />
      <div className="mb-4 h-5 w-full max-w-xl animate-pulse rounded-lg bg-[var(--surface-muted)]" />
      <div className="mb-3 flex gap-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-9 w-24 animate-pulse rounded-full bg-[var(--surface-muted)]" />
        ))}
      </div>
      <div className="animate-pulse rounded-3xl border-2 border-[var(--edge)] bg-[var(--surface-muted)]" style={{ aspectRatio: "16 / 9", minHeight: 420 }} />
    </div>
  );
}
