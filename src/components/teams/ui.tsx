import { Children, isValidElement, useEffect, useState, type ReactNode } from "react";

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

/** Dvousloupcový layout sdílený v sekci Týmy: vedlejší sloupec vlevo (na širokém displeji), hlavní obsah vpravo.
 *  Na úzkém displeji jde hlavní obsah nahoru a vedlejší sloupec pod něj. */
export function SideLayout({ side, children }: { side: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start lg:gap-6">
      <aside className="order-last flex flex-col gap-4 lg:order-none lg:sticky lg:top-24">{side}</aside>
      <div className="flex min-w-0 flex-col gap-5">{children}</div>
    </div>
  );
}

/** Obal jedné karty uvnitř <Reorderable>. Samotný obal nic nevykresluje, jen nese `id` pro pořadí. */
export function ReorderItem({ id, children }: { id: string; children: ReactNode }) {
  void id;
  return <>{children}</>;
}

// Sloučí uložené pořadí s aktuálními kartami: známé zachová, nové přidá na konec.
function mergeOrder(saved: string[], ids: string[]) {
  const known = Array.from(new Set(saved)).filter((x) => ids.includes(x));
  return [...known, ...ids.filter((x) => !known.includes(x))];
}

/** Karty, které si uživatel může přetáhnout nebo posunout tlačítky. Pořadí se ukládá do localStorage
 *  pod `storageKey` (jen v tomto prohlížeči). Bez localStorage funguje dál s výchozím pořadím. */
export function Reorderable({ storageKey, t, className, children }: { storageKey: string; t: { moveCard: string; moveUp: string; moveDown: string }; className?: string; children: ReactNode }) {
  const items: { id: string; node: ReactNode }[] = [];
  Children.forEach(children, (c) => {
    if (isValidElement<{ id?: string; children?: ReactNode }>(c) && typeof c.props.id === "string") items.push({ id: c.props.id, node: c.props.children });
  });
  const ids = items.map((i) => i.id);
  const [saved, setSaved] = useState<string[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);

  useEffect(() => {
    try {
      const v: unknown = JSON.parse(localStorage.getItem(storageKey) ?? "null");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (Array.isArray(v)) setSaved(v.filter((x): x is string => typeof x === "string"));
    } catch {
      /* bez localStorage zůstane výchozí pořadí */
    }
  }, [storageKey]);

  const order = mergeOrder(saved, ids);
  const save = (next: string[]) => {
    setSaved(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      /* uložení se nepovedlo, pořadí platí do obnovení stránky */
    }
  };
  const moveBefore = (from: string, to: string) => {
    if (from === to) return;
    const next = order.filter((x) => x !== from);
    next.splice(next.indexOf(to), 0, from);
    save(next);
  };
  const step = (id: string, dir: -1 | 1) => {
    const i = order.indexOf(id);
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[i], next[j]] = [next[j], next[i]];
    save(next);
  };
  const byId = new Map(items.map((i) => [i.id, i]));
  const btn = "grid size-6 place-items-center rounded-md border border-[var(--edge)] bg-[var(--surface)] text-xs font-bold text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-30";

  return (
    <div className={className}>
      {order.map((id, idx) => {
        const it = byId.get(id);
        if (!it) return null;
        return (
          <div
            key={id}
            className={`relative ${dragging === id ? "opacity-50" : ""}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const from = e.dataTransfer.getData("text/plain");
              if (from) moveBefore(from, id);
            }}
          >
            <div className="absolute -right-2 -top-2 z-10 flex items-center gap-1 rounded-full border border-[var(--edge)] bg-[var(--surface)] px-1 py-0.5 shadow-sm">
              <span
                draggable="true"
                title={t.moveCard}
                aria-label={t.moveCard}
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", id);
                  e.dataTransfer.effectAllowed = "move";
                  setDragging(id);
                }}
                onDragEnd={() => setDragging(null)}
                className="cursor-grab select-none px-1 text-sm leading-none text-[var(--muted)]"
              >
                ⠿
              </span>
              <button type="button" className={btn} onClick={() => step(id, -1)} disabled={idx === 0} aria-label={t.moveUp} title={t.moveUp}>↑</button>
              <button type="button" className={btn} onClick={() => step(id, 1)} disabled={idx === order.length - 1} aria-label={t.moveDown} title={t.moveDown}>↓</button>
            </div>
            {it.node}
          </div>
        );
      })}
    </div>
  );
}
