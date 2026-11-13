"use client";

import type { KeyboardEvent, RefObject } from "react";

// Textové pole kódu s čísly řádků. Bez zalamování se čísla posouvají spolu s kódem.
export function CodeArea({
  value,
  onChange,
  onKeyDown,
  textRef,
  wrap,
  label,
  minHeight = 18,
}: {
  value: string;
  onChange: (v: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  textRef: RefObject<HTMLTextAreaElement | null>;
  wrap: boolean;
  label: string;
  minHeight?: number;
}) {
  const lines = value.split("\n");
  const longest = lines.reduce((m, l) => Math.max(m, l.length), 0);
  return (
    <div className={wrap ? "bg-[#0f0d24]" : "max-h-[460px] overflow-auto bg-[#0f0d24]"}>
      <div className="flex min-w-full">
        {!wrap && (
          <div
            aria-hidden
            className="sticky left-0 z-[2] shrink-0 select-none border-r-2 border-[#1d1a3a] bg-[#0f0d24] py-3 pl-3 pr-3 text-right font-mono text-[13px] leading-6 text-[#5b5480] sm:text-sm"
          >
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
        )}
        <textarea
          ref={textRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          rows={wrap ? minHeight : lines.length + 1}
          wrap={wrap ? "soft" : "off"}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          aria-label={label}
          style={wrap ? undefined : { minWidth: `${longest + 8}ch` }}
          className={`block min-w-0 flex-1 resize-none bg-transparent px-4 py-3 font-mono text-[13px] leading-6 text-[#f6f1e4] caret-[#ffc933] outline-none sm:text-sm ${
            wrap ? "w-full whitespace-pre-wrap break-words" : "overflow-hidden whitespace-pre"
          }`}
        />
      </div>
    </div>
  );
}
