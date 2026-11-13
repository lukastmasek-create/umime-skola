"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { CodeArea } from "@/components/CodeArea";
import { SketchIcon } from "@/components/SketchIcons";
import { useCodeKeys } from "@/components/useCodeKeys";
import { modeAt, type CommentMode } from "@/lib/code-editing";
import { ALLOWED_EXT, MAX_FILE_BYTES, buildPreview, checkName, extOf, uniqueName } from "@/lib/code-sandbox";

// Čistý list: prázdný projekt s více soubory. Soubory můžeš vytvořit, nahrát z počítače
// a stáhnout zpátky. Náhled se skládá z propojených souborů a fetch() čte soubory z projektu.

const ENTRY = "index.html";
const SKELETON = `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <title>Můj projekt</title>
</head>
<body>

</body>
</html>`;
const LIVE_DELAY = 250;

// Který způsob komentáře patří k souboru podle přípony.
function commentModeFor(name: string, v: string, pos: number): CommentMode | null {
  const ext = extOf(name);
  if (ext === "js" || ext === "mjs") return "js";
  if (ext === "css") return "css";
  if (ext === "html" || ext === "htm") return modeAt(v, pos);
  if (ext === "svg") return "html";
  return null;
}

function downloadText(name: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function CodeSandbox() {
  const [files, setFiles] = useState<Record<string, string>>({ [ENTRY]: SKELETON });
  const [active, setActive] = useState(ENTRY);
  const [wrap, setWrap] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newError, setNewError] = useState("");
  const [notes, setNotes] = useState<string[]>([]);
  const importRef = useRef<HTMLInputElement>(null);

  const names = Object.keys(files);
  const content = files[active] ?? "";
  const live = useMemo(() => buildPreview(files), [files]);
  const [shown, setShown] = useState(live);

  useEffect(() => {
    const t = window.setTimeout(() => setShown(live), LIVE_DELAY);
    return () => window.clearTimeout(t);
  }, [live]);

  function setContent(v: string) {
    setFiles((f) => ({ ...f, [active]: v }));
  }

  const { textRef, onKeyDown } = useCodeKeys(content, setContent, {
    onRun: () => setShown(live),
    toggleWrap: () => setWrap((w) => !w),
    commentMode: (v, pos) => commentModeFor(active, v, pos),
  });

  function createFile() {
    const r = checkName(newName, names);
    if ("error" in r) {
      setNewError(r.error);
      return;
    }
    setFiles((f) => ({ ...f, [r.name]: "" }));
    setActive(r.name);
    setNewName("");
    setNewError("");
    setCreating(false);
  }

  function deleteFile(name: string) {
    if (name === ENTRY) return;
    if (!window.confirm(`Smazat soubor ${name}?`)) return;
    setFiles((f) => {
      const next = { ...f };
      delete next[name];
      return next;
    });
    if (active === name) setActive(ENTRY);
  }

  function onImport(e: ChangeEvent<HTMLInputElement>) {
    const list = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (list.length === 0) return;
    const msgs: string[] = [];
    const taken = Object.keys(files);
    list.forEach(async (file) => {
      if (file.size > MAX_FILE_BYTES) {
        msgs.push(`${file.name}: je větší než 512 kB.`);
      } else {
        // Diakritika v názvu se zjednoduší, aby prošel stejný kontrolní filtr jako u nových souborů.
        const base = file.name.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-");
        const check = checkName(base, []);
        if ("error" in check) {
          msgs.push(`${file.name}: ${check.error}`);
        } else {
          const text = await file.text();
          const name = uniqueName(check.name, taken);
          taken.push(name);
          setFiles((f) => ({ ...f, [name]: text }));
          setActive(name);
          msgs.push(`Nahráno: ${name}`);
        }
      }
      setNotes([...msgs]);
    });
  }

  function exportAll() {
    names.forEach((n, i) => window.setTimeout(() => downloadText(n, files[n]), i * 200));
  }

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-[#35305f] bg-[#0f0d24] shadow-[6px_6px_0_#0a0818]">
      {/* Titulek okna */}
      <div className="flex items-center gap-3 border-b-2 border-[#35305f] bg-[#1b1838] px-3 py-2">
        <div className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff8a6b]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#ffc933]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#7ee0b0]" />
        </div>
        <span className="truncate font-mono text-xs text-[#9d96bf]">cisty-list — {active}</span>
        <span className="ml-auto flex items-center gap-1.5 text-xs font-bold text-[#7ee0b0]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#7ee0b0]" aria-hidden />
          Živý náhled
        </span>
      </div>

      <div className="grid lg:grid-cols-[250px_1fr]">
        {/* Soubory */}
        <aside className="flex flex-col border-b-2 border-[#35305f] bg-[#1b1838] lg:border-b-0 lg:border-r-2">
          <div className="flex flex-col gap-2 p-3">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#9d96bf]">Soubory projektu</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setCreating((c) => !c)}
                aria-expanded={creating}
                className="rounded-md border-2 border-[#ffc933] bg-[#ffc933] px-2 py-1 text-xs font-bold text-[#16132b]"
              >
                + Nový soubor
              </button>
              <label className="cursor-pointer rounded-md border-2 border-[#35305f] px-2 py-1 text-xs font-bold text-[#cfc8e4] hover:border-[#8d99ff]">
                Nahrát
                <input
                  ref={importRef}
                  type="file"
                  multiple
                  accept={ALLOWED_EXT.map((x) => "." + x).join(",")}
                  onChange={onImport}
                  className="sr-only"
                />
              </label>
              <button
                type="button"
                onClick={exportAll}
                className="rounded-md border-2 border-[#35305f] px-2 py-1 text-xs font-bold text-[#cfc8e4] hover:border-[#8d99ff]"
              >
                Stáhnout vše
              </button>
            </div>

            {creating && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createFile();
                }}
                className="flex flex-col gap-1.5"
              >
                <input
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    setNewError("");
                  }}
                  placeholder="např. style.css"
                  aria-label="Jméno nového souboru"
                  autoFocus
                  className="w-full rounded-md border-2 border-[#35305f] bg-[#0f0d24] px-2.5 py-1.5 font-mono text-sm text-white outline-none placeholder:text-[#5b5480] focus:border-[#ffc933]"
                />
                {newError && <p className="text-xs text-[#ff9a8a]">{newError}</p>}
                <button type="submit" className="self-start rounded-md bg-[#17a864] px-3 py-1 text-xs font-bold text-white">
                  Vytvořit
                </button>
              </form>
            )}

            {notes.length > 0 && (
              <ul className="flex flex-col gap-0.5 text-xs text-[#cfc8e4]" aria-live="polite">
                {notes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            )}
          </div>

          <nav aria-label="Soubory projektu" className="flex max-h-[260px] flex-col gap-0.5 overflow-y-auto px-2 pb-3 lg:max-h-[600px]">
            {names.map((n) => {
              const isActive = n === active;
              return (
                <div
                  key={n}
                  className={`flex items-center gap-1 border-l-2 pr-1 ${
                    isActive ? "border-[#ffc933] bg-[#2c2a52]" : "border-transparent hover:bg-[#25215a]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActive(n)}
                    aria-current={isActive ? "true" : undefined}
                    className="flex min-w-0 flex-1 items-center gap-2 py-1.5 pl-3 text-left font-mono text-sm text-white"
                  >
                    <span className="truncate">{n}</span>
                    <span className="ml-auto shrink-0 text-[11px] text-[#7d76a3]">{files[n].split("\n").length} ř.</span>
                  </button>
                  {n !== ENTRY && (
                    <button
                      type="button"
                      onClick={() => deleteFile(n)}
                      aria-label={`Smazat ${n}`}
                      className="grid h-6 w-6 shrink-0 place-items-center rounded text-[#9d96bf] hover:bg-[#3a2a4a] hover:text-[#ff9a8a]"
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Editor a náhled */}
        <div className="flex min-w-0 flex-col">
          <div className="flex items-stretch border-b-2 border-[#35305f] bg-[#1b1838]">
            <div className="flex items-center gap-2 border-t-2 border-t-[#ffc933] bg-[#0f0d24] px-4 py-2 font-mono text-sm text-white">
              <SketchIcon kind="scroll" size={13} />
              {active}
            </div>
            <div className="ml-auto flex flex-wrap items-center gap-2 px-3 py-1.5">
              <button
                type="button"
                onClick={() => downloadText(active, content)}
                className="rounded-md border-2 border-[#35305f] px-2 py-1 text-xs font-bold text-[#cfc8e4] hover:border-[#8d99ff]"
              >
                Stáhnout soubor
              </button>
              <button
                type="button"
                onClick={() => setWrap((w) => !w)}
                aria-pressed={wrap}
                className="rounded-md border-2 border-[#35305f] px-2 py-1 text-xs font-bold text-[#cfc8e4] hover:border-[#8d99ff]"
              >
                Zalamování {wrap ? "zap" : "vyp"} (Alt+Z)
              </button>
              <button
                type="button"
                onClick={() => setShowPreview((v) => !v)}
                aria-pressed={showPreview}
                className="rounded-md border-2 border-[#35305f] px-2 py-1 text-xs font-bold text-[#cfc8e4] hover:border-[#8d99ff]"
              >
                Náhled {showPreview ? "skrýt" : "ukázat"}
              </button>
            </div>
          </div>

          <div className="border-b-2 border-[#35305f] bg-[#16132b] px-4 py-3 text-xs leading-relaxed text-[#9d96bf]">
            Propoj soubory přes {"<link href=\"style.css\">"} a {"<script src=\"app.js\">"}. Skript může načíst JSON přes {"fetch(\"data.json\")"}.
          </div>

          <div className="grid min-w-0 xl:grid-cols-2">
            <CodeArea value={content} onChange={setContent} onKeyDown={onKeyDown} textRef={textRef} wrap={wrap} label={`Kód souboru ${active}`} minHeight={20} />

            {showPreview && (
              <div className="flex min-w-0 flex-col border-t-2 border-[#35305f] bg-white xl:border-l-2 xl:border-t-0">
                <div className="flex items-center justify-between border-b border-[#d8d2c2] bg-[#f7efe0] px-3 py-1 text-[11px] font-bold text-[#16132b]">
                  <span>Náhled stránky</span>
                  <span className="font-normal text-[#5b5480]">Ctrl+S = hned</span>
                </div>
                <iframe title="Živý náhled" srcDoc={shown} sandbox="allow-scripts" className="h-[460px] w-full bg-white" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stavový řádek */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t-2 border-[#35305f] bg-[#ffc933] px-3 py-1.5 text-xs font-bold text-[#16132b]">
        <span>{extOf(active).toUpperCase() || "TXT"}</span>
        <span>{content.split("\n").length} řádků</span>
        <span>{names.length} souborů</span>
        <span className="ml-auto hidden md:inline">Ctrl+/ komentář · Tab odsadí · Esc opustí editor</span>
      </div>
    </div>
  );
}
