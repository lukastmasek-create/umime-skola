import type { ReactNode } from "react";

// Sdílené stavební kameny vzhledu týmů: barevný znak týmu, progress bar, iniciálový avatar.
const PALETTE = ["#3248f0", "#ff5a3c", "#17a864", "#29a3ff", "#8b5cf6", "#e0a100", "#e0409a", "#0f9fa8"];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
export const colorOf = (key: string) => PALETTE[hash(key) % PALETTE.length];
export const initials = (name: string | null | undefined) =>
  (name ?? "?").trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "?";

export function Badge({ name, size = 44, round = false }: { name: string | null | undefined; size?: number; round?: boolean }) {
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center border-2 border-[var(--edge)] font-extrabold text-white ${round ? "rounded-full" : "rounded-xl"}`}
      style={{ width: size, height: size, background: colorOf(name ?? "?"), fontSize: size * 0.4 }}
    >
      {initials(name)}
    </span>
  );
}

export function Progress({ value, max, color = "var(--accent-green)", label }: { value: number; max: number; color?: string; label?: ReactNode }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <span className="flex flex-col gap-1">
      {label && <span className="text-xs font-bold">{label}</span>}
      <span className="h-2.5 w-full overflow-hidden rounded-full border border-[var(--edge)] bg-[var(--surface-muted)]" role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
        <span className="block h-full rounded-full transition-[width]" style={{ width: `${pct}%`, background: color }} />
      </span>
    </span>
  );
}

export function Pill({ children, tone = "plain" }: { children: ReactNode; tone?: "plain" | "danger" | "warn" | "good" | "brand" }) {
  const cls = {
    plain: "bg-[var(--surface-muted)]",
    danger: "bg-[var(--danger)] text-white",
    warn: "bg-[var(--accent-yellow)] text-[#16132b]",
    good: "bg-[var(--accent-green)] text-white",
    brand: "bg-[var(--brand-50)] text-[var(--brand-700)]",
  }[tone];
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${cls}`}>{children}</span>;
}
