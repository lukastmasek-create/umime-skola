"use client";

import { setAssistContext } from "@/lib/code-assist";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { CodeArea } from "@/components/CodeArea";
import { SketchIcon } from "@/components/SketchIcons";
import { useCodeKeys } from "@/components/useCodeKeys";
import { modeAt, type CommentMode } from "@/lib/code-editing";
import type { FileKind } from "@/lib/code-complete";
import {
  ALLOWED_EXT,
  ENTRY,
  MAX_FILE_BYTES,
  buildPreview,
  checkName,
  extOf,
  renameReferences,
  uniqueName,
} from "@/lib/code-sandbox";

// Čistý list: prázdný projekt s více soubory a složkami. Soubory můžeš vytvořit, přejmenovat,
// nahrát (jednotlivě nebo celou složku) a stáhnout. Projekt se ukládá v tomto prohlížeči.

const SKELETON = `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <title>Můj projekt</title>
</head>
<body>

</body>
</html>`;
const STORE_KEY = "kod-na-hrani-list-v1";
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

// Podle přípony souboru: co se má našeptávat (null = nic, třeba u JSON nebo TXT).
function fileKindFor(name: string): FileKind | null {
  const ext = extOf(name);
  if (ext === "js" || ext === "mjs") return "js";
  if (ext === "css") return "css";
  if (ext === "html" || ext === "htm" || ext === "svg") return "html";
  return null;
}

function downloadText(name: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name.split("/").pop() ?? name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function loadSaved(): Record<string, string> | null {
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    const f = JSON.parse(raw) as unknown;
    if (f && typeof f === "object" && ENTRY in f) return f as Record<string, string>;
  } catch {
    // Prohlížeč může úložiště zablokovat, pak prostě začneme od začátku.
  }
  return null;
}

export function CodeSandbox() {
  const [files, setFiles] = useState<Record<string, string>>({ [ENTRY]: SKELETON });
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(ENTRY);
  const [wrap, setWrap] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newError, setNewError] = useState("");
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameTo, setRenameTo] = useState("");
  const [renameError, setRenameError] = useState("");
  const [notes, setNotes] = useState<string[]>([]);
  const folderRef = useRef<HTMLInputElement>(null);

  const names = Object.keys(files);
  const content = files[active] ?? "";
  useEffect(() => {
    setAssistContext({ label: `Čistý list: ${active}`, code: content });
    return () => setAssistContext(null);
  }, [active, content]);
  const live = useMemo(() => buildPreview(files), [files]);
  const [shown, setShown] = useState(live);

  // Účet: projekty jsou v databázi a jsou dostupné na všech zařízeních.
  // Host má jeden projekt v localStorage prohlížeče.
  const [loggedIn, setLoggedIn] = useState(false);
  const [projects, setProjects] = useState<{ id: string; title: string }[]>([]);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">("saved");

  async function openProject(id: string) {
    const res = await fetch(`/api/code-projects?id=${encodeURIComponent(id)}`, { cache: "no-store" });
    if (!res.ok) return false;
    const data = (await res.json()) as { project: { id: string; files: Record<string, string> } };
    setFiles(data.project.files);
    setProjectId(data.project.id);
    setActive(ENTRY);
    setNotes([]);
    return true;
  }

  async function createProject(title?: string) {
    const res = await fetch("/api/code-projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, files: { [ENTRY]: SKELETON } }),
    });
    if (!res.ok) {
      setSaveState("error");
      return null;
    }
    const data = (await res.json()) as { project: { id: string; title: string } };
    setProjects((p) => [...p, data.project]);
    setFiles({ [ENTRY]: SKELETON });
    setProjectId(data.project.id);
    setActive(ENTRY);
    setNotes([]);
    return data.project.id;
  }

  // Při přepnutí se rozdělaná změna nejdřív uloží, aby se neztratila.
  async function saveNow() {
    if (!projectId) return;
    await fetch("/api/code-projects", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: projectId, files }),
    }).catch(() => setSaveState("error"));
  }

  async function selectProject(id: string) {
    if (id === projectId) return;
    await saveNow();
    await openProject(id);
  }

  function renameProject() {
    if (!projectId) return;
    const current = projects.find((p) => p.id === projectId)?.title ?? "";
    const title = window.prompt("Nový název projektu", current)?.trim();
    if (!title) return;
    void fetch("/api/code-projects", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: projectId, title }),
    });
    setProjects((ps) => ps.map((p) => (p.id === projectId ? { ...p, title } : p)));
  }

  async function deleteProject() {
    if (!projectId) return;
    if (!window.confirm("Smazat tenhle projekt i se všemi soubory? Nejde to vrátit.")) return;
    const id = projectId;
    await fetch(`/api/code-projects?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    const rest = projects.filter((p) => p.id !== id);
    setProjects(rest);
    if (rest.length) await openProject(rest[0].id);
    else await createProject();
  }

  // Načtení: přihlášený uživatel dostane svůj první projekt (nebo nový), host svůj lokální projekt.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/code-projects", { cache: "no-store" });
        const data = (await res.json()) as { loggedIn: boolean; projects?: { id: string; title: string }[] };
        if (cancelled) return;
        if (data.loggedIn) {
          setLoggedIn(true);
          setProjects(data.projects ?? []);
          if (data.projects?.length) await openProject(data.projects[0].id);
          else await createProject();
        } else {
          const saved = loadSaved();
          // Úložiště je externí zdroj dostupný až v prohlížeči, takže načtení musí být v effectu.
          if (saved) setFiles(saved);
        }
      } catch {
        if (!cancelled) setSaveState("error");
      }
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Ukládání, až když je projekt načtený, aby se nepřepsal prázdným začátkem.
  useEffect(() => {
    if (!ready) return;
    if (!loggedIn) {
      const t = window.setTimeout(() => {
        try {
          window.localStorage.setItem(STORE_KEY, JSON.stringify(files));
        } catch {
          // Plná nebo zablokovaná paměť: projekt zůstane aspoň v okně.
        }
      }, 400);
      return () => window.clearTimeout(t);
    }
    if (!projectId) return;
    const id = projectId;
    const t = window.setTimeout(() => {
      setSaveState("saving");
      fetch("/api/code-projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, files }),
      })
        .then((r) => setSaveState(r.ok ? "saved" : "error"))
        .catch(() => setSaveState("error"));
    }, 800);
    return () => window.clearTimeout(t);
  }, [files, ready, loggedIn, projectId]);

  useEffect(() => {
    const t = window.setTimeout(() => setShown(live), LIVE_DELAY);
    return () => window.clearTimeout(t);
  }, [live]);

  function setContent(v: string) {
    setFiles((f) => ({ ...f, [active]: v }));
  }

  const keys = useCodeKeys(content, setContent, {
    onRun: () => setShown(live),
    toggleWrap: () => setWrap((w) => !w),
    commentMode: (v, pos) => commentModeFor(active, v, pos),
    fileKind: () => fileKindFor(active),
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

  function renameFile(from: string) {
    const r = checkName(renameTo, names.filter((n) => n !== from));
    if ("error" in r) {
      setRenameError(r.error);
      return;
    }
    // Přejmenování zachová pořadí souborů a opraví odkazy a importy, které na soubor ukazují.
    setFiles((f) => renameReferences(f, from, r.name));
    if (active === from) setActive(r.name);
    setRenaming(null);
    setRenameError("");
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

  function resetProject() {
    if (!window.confirm("Smazat celý projekt a začít od prázdné stránky?")) return;
    setFiles({ [ENTRY]: SKELETON });
    setActive(ENTRY);
    setNotes([]);
  }

  // Nahrání souborů i složky. Složka se nahrává přes webkitdirectory a první díl cesty (jméno složky) se vynechá.
  async function importFiles(list: File[], relative: boolean) {
    const msgs: string[] = [];
    const taken = Object.keys(files);
    const added: Record<string, string> = {};
    for (const file of list) {
      const rel = relative ? (file as File & { webkitRelativePath?: string }).webkitRelativePath ?? file.name : file.name;
      const path = relative ? rel.split("/").slice(1).join("/") : rel;
      if (!path) continue;
      if (file.size > MAX_FILE_BYTES) {
        msgs.push(`${path}: je větší než 512 kB.`);
        continue;
      }
      // Diakritika v názvu se zjednoduší, aby prošel stejný kontrolní filtr jako u nových souborů.
      const base = path.normalize("NFD").replace(/[̀-ͯ]/g, "");
      const check = checkName(base, []);
      if ("error" in check) {
        msgs.push(`${path}: ${check.error}`);
        continue;
      }
      const name = uniqueName(check.name, taken);
      taken.push(name);
      added[name] = await file.text();
      msgs.push(`Nahráno: ${name}`);
    }
    const keys = Object.keys(added);
    if (keys.length) {
      setFiles((f) => ({ ...f, ...added }));
      setActive(keys[keys.length - 1]);
    }
    setNotes(msgs);
  }

  function onImport(e: ChangeEvent<HTMLInputElement>) {
    const list = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (list.length) void importFiles(list, false);
  }

  function onFolder(e: ChangeEvent<HTMLInputElement>) {
    const list = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (list.length) void importFiles(list, true);
  }

  function exportAll() {
    names.forEach((n, i) => window.setTimeout(() => downloadText(n, files[n]), i * 200));
  }

  // Seskupení podle složek: nejdřív soubory v kořeni, pak složky.
  const groups = useMemo(() => {
    const root: string[] = [];
    const dirs = new Map<string, string[]>();
    for (const n of names) {
      if (!n.includes("/")) root.push(n);
      else {
        const dir = n.slice(0, n.lastIndexOf("/"));
        dirs.set(dir, [...(dirs.get(dir) ?? []), n]);
      }
    }
    return [{ dir: "", items: root }, ...Array.from(dirs.entries()).map(([dir, items]) => ({ dir, items }))];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  function fileRow(n: string) {
    const isActive = n === active;
    if (renaming === n) {
      return (
        <form
          key={n}
          onSubmit={(e) => {
            e.preventDefault();
            renameFile(n);
          }}
          className="flex flex-col gap-1 py-1 pl-3 pr-1"
        >
          <input
            value={renameTo}
            onChange={(e) => {
              setRenameTo(e.target.value);
              setRenameError("");
            }}
            aria-label={`Nové jméno pro ${n}`}
            autoFocus
            className="w-full rounded-md border-2 border-[#ffc933] bg-[#0f0d24] px-2 py-1 font-mono text-sm text-white outline-none"
          />
          {renameError && <p className="text-xs text-[#ff9a8a]">{renameError}</p>}
          <div className="flex gap-1.5">
            <button type="submit" className="rounded bg-[#17a864] px-2 py-0.5 text-xs font-bold text-white">
              Přejmenovat
            </button>
            <button type="button" onClick={() => setRenaming(null)} className="rounded px-2 py-0.5 text-xs text-[#9d96bf]">
              Zrušit
            </button>
          </div>
        </form>
      );
    }
    return (
      <div
        key={n}
        className={`flex items-center gap-0.5 border-l-2 pr-1 ${isActive ? "border-[#ffc933] bg-[#2c2a52]" : "border-transparent hover:bg-[#25215a]"}`}
      >
        <button
          type="button"
          onClick={() => setActive(n)}
          aria-current={isActive ? "true" : undefined}
          className="flex min-w-0 flex-1 items-center gap-2 py-1.5 pl-3 text-left font-mono text-sm text-white"
        >
          <span className="truncate">{n.includes("/") ? n.slice(n.lastIndexOf("/") + 1) : n}</span>
          <span className="ml-auto shrink-0 text-[11px] text-[#7d76a3]">{files[n].split("\n").length} ř.</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setRenaming(n);
            setRenameTo(n);
            setRenameError("");
          }}
          aria-label={`Přejmenovat ${n}`}
          className="grid h-6 w-6 shrink-0 place-items-center rounded text-[11px] text-[#9d96bf] hover:bg-[#3a2a4a] hover:text-white"
        >
          ✎
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
  }

  return (
    <div className="sk-rough overflow-hidden rounded-2xl border-2 border-transparent bg-[#0f0d24] shadow-[6px_6px_0_#0a0818]">
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
          Živý náhled · {!loggedIn ? "uloženo v tomhle prohlížeči" : saveState === "saved" ? "uloženo na účtu" : saveState === "saving" ? "ukládám…" : "nepodařilo se uložit"}
        </span>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr]">
        {/* Soubory */}
        <aside className="flex flex-col border-b-2 border-[#35305f] bg-[#1b1838] lg:border-b-0 lg:border-r-2">
          <div className="flex flex-col gap-2 p-3">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#9d96bf]">Soubory projektu</span>
            {loggedIn ? (
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-extrabold uppercase tracking-widest text-[#9d96bf]" htmlFor="projekt-vyber">
                  Projekt
                </label>
                <select
                  id="projekt-vyber"
                  value={projectId ?? ""}
                  onChange={(e) => void selectProject(e.target.value)}
                  className="w-full rounded-md border-2 border-[#35305f] bg-[#0f0d24] px-2 py-1.5 text-sm text-white outline-none focus:border-[#ffc933]"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
                <div className="flex flex-wrap gap-1.5">
                  <button type="button" onClick={() => void createProject(`Projekt ${projects.length + 1}`)} className="rounded-md border-2 border-[#35305f] px-2 py-1 text-xs font-bold text-[#cfc8e4] hover:border-[#8d99ff]">
                    + Projekt
                  </button>
                  <button type="button" onClick={renameProject} className="rounded-md border-2 border-[#35305f] px-2 py-1 text-xs font-bold text-[#cfc8e4] hover:border-[#8d99ff]">
                    Přejmenovat
                  </button>
                  <button type="button" onClick={() => void deleteProject()} className="rounded-md border-2 border-[#35305f] px-2 py-1 text-xs font-bold text-[#ff9a8a] hover:border-[#ff8a6b]">
                    Smazat projekt
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs leading-relaxed text-[#9d96bf]">
                Projekt je jen v tomhle prohlížeči. <Link href="/cs/prihlaseni" className="font-bold text-[#ffc933] underline">Přihlas se</Link>, ulož ho na účet a otevři ho na jakémkoli zařízení.
              </p>
            )}
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
                <input type="file" multiple accept={ALLOWED_EXT.map((x) => "." + x).join(",")} onChange={onImport} className="sr-only" />
              </label>
              <button
                type="button"
                onClick={() => folderRef.current?.click()}
                className="rounded-md border-2 border-[#35305f] px-2 py-1 text-xs font-bold text-[#cfc8e4] hover:border-[#8d99ff]"
              >
                Nahrát složku
              </button>
              <input
                ref={folderRef}
                type="file"
                onChange={onFolder}
                className="hidden"
                {...({ webkitdirectory: "", directory: "" } as Record<string, string>)}
              />
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
                  placeholder="např. js/app.js"
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
              <ul className="flex max-h-24 flex-col gap-0.5 overflow-y-auto text-xs text-[#cfc8e4]" aria-live="polite">
                {notes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            )}
          </div>

          <nav aria-label="Soubory projektu" className="flex max-h-[280px] flex-col gap-1 overflow-y-auto px-2 pb-3 lg:max-h-[600px]">
            {groups.map((g) => (
              <div key={g.dir || "root"}>
                {g.dir && (
                  <div className="px-2 py-1 font-mono text-[11px] font-bold text-[#9d96bf]"><span className="inline-flex items-center gap-1.5"><SketchIcon kind="folder" size={14} />{g.dir}/</span></div>
                )}
                {g.items.map((n) => fileRow(n))}
              </div>
            ))}
            <button
              type="button"
              onClick={resetProject}
              className="mt-2 self-start px-2 text-xs text-[#9d96bf] underline underline-offset-4 hover:text-white"
            >
              Smazat celý projekt
            </button>
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
            Propoj soubory přes {"<link href=\"css/style.css\">"}, {"<script src=\"js/app.js\">"} nebo {"<script type=\"module\" src=\"js/main.js\">"} s {"import"}. Skript načte JSON přes {"fetch(\"data.json\")"}.
          </div>

          <div className="grid min-w-0 xl:grid-cols-2">
            <CodeArea
              value={content}
              onChange={setContent}
              onKeyDown={keys.onKeyDown}
              onInput={keys.onInput}
              onBlur={keys.onBlur}
              completion={keys.completion}
              onAccept={(i) => keys.completion && keys.accept(keys.completion, i)}
              textRef={keys.textRef}
              wrap={wrap}
              label={`Kód souboru ${active}`}
              minHeight={20}
            />

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
