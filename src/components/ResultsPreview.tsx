// Ilustrační ukázka přehledu výsledků ve stylu dashboardu (není to živá data).
type Row = { who: string; pct: number };

export function ResultsPreview({
  title,
  due,
  badge,
  doneLabel,
  rows,
  className = "",
}: {
  title: string;
  due: string;
  badge: string;
  doneLabel: string;
  rows: Row[];
  className?: string;
}) {
  const heading = { fontFamily: "var(--font-heading)" };
  const avg = Math.round(rows.reduce((s, r) => s + r.pct, 0) / Math.max(rows.length, 1));
  const done = rows.filter((r) => r.pct === 100).length;
  return (
    <div aria-hidden style={{ ["--gc" as string]: "#6ee7b7" }} className={`gcard gcard-dark p-5 sm:p-6 ${className}`}>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="gcard-title text-lg" style={heading}>{title}</p>
          <p className="gcard-sub">{due}</p>
        </div>
        <span className="gcard-tag">{badge}</span>
      </div>
      <div className="mb-5 flex items-end gap-4">
        <p className="gcard-big">{avg}<small>%</small></p>
        <span className="gcard-tag mb-1">{done} / {rows.length} {doneLabel}</span>
      </div>
      <ul className="space-y-3">
        {rows.map((row) => {
          const full = row.pct === 100;
          return (
            <li key={row.who}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-semibold">
                  <span className="h-2 w-2 rounded-full" style={{ background: full ? "#6ee7b7" : "#ffd24d" }} />
                  {row.who}
                </span>
                <span className="text-xs font-bold text-[var(--muted)]">{row.pct} %</span>
              </div>
              <span className="gcard-track block">
                <span
                  className="gcard-fill"
                  style={{ width: `${row.pct}%`, ["--fc" as string]: full ? "#6ee7b7" : "#ffd24d" }}
                />
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
