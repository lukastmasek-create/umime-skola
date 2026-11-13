"use client";

import type { FormEvent, KeyboardEvent, RefObject } from "react";
import type { Suggest } from "@/components/useCodeKeys";

const KIND: Record<Suggest["items"][number]["kind"], { label: string; cls: string }> = {
  tag: { label: "tag", cls: "bg-[#ff8a6b] text-[#16132b]" },
  attr: { label: "atr", cls: "bg-[#8fd0ff] text-[#16132b]" },
  css: { label: "css", cls: "bg-[#7ee0b0] text-[#16132b]" },
  js: { label: "js", cls: "bg-[#ffc933] text-[#16132b]" },
};

// Textové pole kódu s čísly řádků a našeptávacím seznamem u kurzoru.
export function CodeArea({
  value,
  onChange,
  onKeyDown,
  onInput,
  onBlur,
  completion,
  onAccept,
  textRef,
  wrap,
  label,
  minHeight = 18,
}: {
  value: string;
  onChange: (v: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  onInput: (e: FormEvent<HTMLTextAreaElement>) => void;
  onBlur: () => void;
  completion: Suggest | null;
  onAccept: (i: number) => void;
  textRef: RefObject<HTMLTextAreaElement | null>;
  wrap: boolean;
  label: string;
  minHeight?: number;
}) {
  const lines = value.split("\n");
  const longest = lines.reduce((m, l) => Math.max(m, l.length), 0);
  return (
    <div className={`relative ${wrap ? "bg-[#0f0d24]" : "max-h-[460px] overflow-auto bg-[#0f0d24]"}`}>
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
          onInput={onInput}
          onBlur={onBlur}
          rows={wrap ? minHeight : lines.length + 1}
          wrap={wrap ? "soft" : "off"}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          aria-label={label}
          aria-autocomplete="list"
          style={wrap ? undefined : { minWidth: `${longest + 8}ch` }}
          className={`block min-w-0 flex-1 resize-none bg-transparent px-4 py-3 font-mono text-[13px] leading-6 text-[#f6f1e4] caret-[#ffc933] outline-none sm:text-sm ${
            wrap ? "w-full whitespace-pre-wrap break-words" : "overflow-hidden whitespace-pre"
          }`}
        />
      </div>

      {completion && completion.items.length > 0 && (
        <ul
          role="listbox"
          aria-label="Návrhy"
          className="absolute z-30 max-h-56 w-[280px] overflow-y-auto rounded-md border-2 border-[#35305f] bg-[#1b1838] py-1 shadow-[4px_4px_0_#0a0818]"
          style={{ left: completion.x, top: completion.y }}
        >
          {completion.items.map((it, i) => {
            const active = i === completion.index;
            return (
              <li
                key={`${it.kind}-${it.label}`}
                role="option"
                aria-selected={active}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onAccept(i);
                }}
                className={`flex cursor-pointer items-center gap-2 px-2 py-1 text-sm ${
                  active ? "bg-[#2c2a52] text-white" : "text-[#cfc8e4] hover:bg-[#25215a]"
                }`}
              >
                <span className={`rounded px-1 font-sans text-[10px] font-extrabold uppercase ${KIND[it.kind].cls}`}>
                  {KIND[it.kind].label}
                </span>
                <span className="font-mono">{it.label}</span>
                <span className="ml-auto truncate pl-2 font-sans text-[11px] text-[#7d76a3]">{it.detail}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
