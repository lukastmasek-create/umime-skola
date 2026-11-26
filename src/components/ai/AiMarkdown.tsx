"use client";

import { useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

// Vykreslení odpovědí AI: Markdown bez HTML (react-markdown HTML ve výchozím stavu neprovádí),
// odkazy jen http(s), bloky kódu s tlačítkem Kopírovat.

function CodeBlock({ code, lang, dark, copyLabel, copiedLabel }: { code: string; lang: string; dark: boolean; copyLabel: string; copiedLabel: string }) {
  const [done, setDone] = useState(false);
  return (
    <div className={`my-2 overflow-hidden rounded-xl border ${dark ? "border-[#35305f] bg-[#0f0d24]" : "border-[var(--border-soft)] bg-[#16132b]"}`}>
      <div className="flex items-center justify-between px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#9d96bf]">
        <span>{lang || "kód"}</span>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard?.writeText(code).then(() => {
              setDone(true);
              setTimeout(() => setDone(false), 1500);
            });
          }}
          className="rounded px-1.5 py-0.5 normal-case tracking-normal text-[#cfc8e4] hover:bg-[#2c2a52]"
        >
          {done ? copiedLabel : copyLabel}
        </button>
      </div>
      <pre className="overflow-x-auto px-3 pb-3 font-mono text-xs leading-5 text-[#f6f1e4]">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function AiMarkdown({ text, dark = false, copyLabel = "Kopírovat", copiedLabel = "Zkopírováno" }: { text: string; dark?: boolean; copyLabel?: string; copiedLabel?: string }) {
  const components: Components = {
    p: ({ children }) => <p className="my-1.5 leading-relaxed first:mt-0 last:mb-0">{children}</p>,
    h1: ({ children }) => <h3 className="mb-1.5 mt-3 text-base font-extrabold first:mt-0">{children}</h3>,
    h2: ({ children }) => <h3 className="mb-1.5 mt-3 text-base font-extrabold first:mt-0">{children}</h3>,
    h3: ({ children }) => <h3 className="mb-1 mt-3 text-[0.95rem] font-extrabold first:mt-0">{children}</h3>,
    h4: ({ children }) => <h4 className="mb-1 mt-2 font-bold first:mt-0">{children}</h4>,
    ul: ({ children }) => <ul className="my-1.5 list-disc space-y-1 pl-5">{children}</ul>,
    ol: ({ children }) => <ol className="my-1.5 list-decimal space-y-1 pl-5">{children}</ol>,
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    strong: ({ children }) => <strong className="font-extrabold">{children}</strong>,
    del: ({ children }) => <del className="opacity-70">{children}</del>,
    blockquote: ({ children }) => <blockquote className="my-2 border-l-4 border-[var(--accent-yellow)] pl-3 italic opacity-90">{children}</blockquote>,
    hr: () => <hr className="my-3 border-[var(--border-soft)]" />,
    a: ({ href, children }) =>
      href && /^https?:\/\//.test(href) ? (
        <a href={href} target="_blank" rel="noopener noreferrer nofollow" className="font-bold text-[var(--accent-blue)] underline">
          {children}
        </a>
      ) : (
        <span>{children}</span>
      ),
    img: () => null,
    table: ({ children }) => (
      <div className="my-2 overflow-x-auto">
        <table className="w-full border-collapse text-left text-[0.85em]">{children}</table>
      </div>
    ),
    th: ({ children }) => <th className="border-b-2 border-[var(--border-soft)] px-2 py-1 font-extrabold">{children}</th>,
    td: ({ children }) => <td className="border-b border-[var(--border-soft)] px-2 py-1 align-top">{children}</td>,
    pre: ({ children }) => <>{children}</>,
    code: ({ className, children }) => {
      const raw = String(children ?? "");
      const lang = /language-(\w+)/.exec(className ?? "")?.[1] ?? "";
      if (lang || raw.includes("\n")) {
        return <CodeBlock code={raw.replace(/\n$/, "")} lang={lang} dark={dark} copyLabel={copyLabel} copiedLabel={copiedLabel} />;
      }
      return <code className={`rounded px-1 py-0.5 font-mono text-[0.85em] ${dark ? "bg-[#0f0d24] text-[#ffd24d]" : "bg-[var(--surface-muted)]"}`}>{raw}</code>;
    },
  };
  return (
    <div className="ai-md break-words text-sm">
      <ReactMarkdown components={components} remarkPlugins={[remarkGfm]} skipHtml>
        {text}
      </ReactMarkdown>
    </div>
  );
}
