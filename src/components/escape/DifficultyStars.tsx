// Obtížnost únikovky jako 1–5 hvězdiček. Bez stavu, funguje na serveru i na klientovi.
export function DifficultyStars({
  value,
  label,
  className = "",
}: {
  value: number;
  // Přístupný popis, např. „Obtížnost: Těžká (4/5)“.
  label: string;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center tracking-tight ${className}`} role="img" aria-label={label} title={label}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} aria-hidden className={n <= value ? "text-[var(--accent-yellow)]" : "text-[var(--border-soft)]"}>
          ★
        </span>
      ))}
    </span>
  );
}
