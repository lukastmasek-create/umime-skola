"use client";

import { useId, useState, type ReactNode } from "react";

// Karta, která po kliknutí plynule rozbalí celý obsah (Pro, O nás).
export function ExpandCard({
  index,
  title,
  lead,
  color = "var(--accent-green)",
  children,
  className = "",
}: {
  index?: string;
  title: string;
  lead: string;
  color?: string;
  children?: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <article className={`xc ${open ? "is-open" : ""} ${className}`} style={{ ["--xc" as string]: color }}>
      <button type="button" className="xc-head" aria-expanded={open} aria-controls={children ? id : undefined} onClick={() => setOpen((v) => !v)}>
        {index && <span className="xc-idx" aria-hidden>{index}</span>}
        <span className="xc-main">
          <span className="xc-title">{title}</span>
          <span className="xc-lead">{lead}</span>
        </span>
        <span className="xc-plus" aria-hidden />
      </button>
      {children && (
        <div id={id} className="xc-body" role="region">
          <div className="xc-inner">{children}</div>
        </div>
      )}
    </article>
  );
}
