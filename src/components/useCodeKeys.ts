"use client";

import { useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { backspace, comment, enter, tab, typeChar, type CommentMode, type Edit } from "@/lib/code-editing";
import { applyCompletion, completionAt, type Completion, type FileKind } from "@/lib/code-complete";

// Našeptávací seznam: návrhy + vybraný řádek + pozice u kurzoru v textarea.
export type Suggest = Completion & { index: number; x: number; y: number };

let measureCtx: CanvasRenderingContext2D | null = null;

// Poloha kurzoru v textarea (v px od levého horního rohu obalu). Používá šířku znaku z fontu textarea.
function caretXY(el: HTMLTextAreaElement, v: string, pos: number) {
  const before = v.slice(0, pos);
  const line = before.split("\n").length - 1;
  const col = pos - (before.lastIndexOf("\n") + 1);
  const cs = window.getComputedStyle(el);
  if (!measureCtx) measureCtx = document.createElement("canvas").getContext("2d");
  if (measureCtx) measureCtx.font = `${cs.fontSize} ${cs.fontFamily}`;
  const charW = measureCtx ? measureCtx.measureText("0000000000").width / 10 : 8;
  const padLeft = parseFloat(cs.paddingLeft) || 16;
  const padTop = parseFloat(cs.paddingTop) || 12;
  const lineH = parseFloat(cs.lineHeight) || 24;
  const x = el.offsetLeft + padLeft + col * charW - el.scrollLeft;
  const y = el.offsetTop + padTop + (line + 1) * lineH - el.scrollTop;
  // Seznam se nevejde mimo viditelnou část editoru (obal s posuvníkem).
  const box = el.offsetParent as HTMLElement | null;
  const maxX = (box ? box.scrollLeft + box.clientWidth : el.clientWidth) - 280;
  return { x: Math.max(0, Math.min(x, maxX)), y };
}

// Klávesy editoru jako ve VS Code (odsazení, párování, komentáře, našeptávání).
export function useCodeKeys(
  value: string,
  setValue: (v: string) => void,
  opts: {
    onRun: () => void;
    toggleWrap: () => void;
    commentMode: (v: string, pos: number) => CommentMode | null;
    // Jaký typ souboru se doplňuje (null = bez našeptávání, např. u JSON).
    fileKind: (v: string, pos: number) => FileKind | null;
  },
) {
  const textRef = useRef<HTMLTextAreaElement>(null);
  const pendingSel = useRef<[number, number] | null>(null);
  const [completion, setCompletion] = useState<Suggest | null>(null);

  // Po změně kódu nastaví kurzor tam, kam ho chceme (když se změna nevešla do vloženého textu).
  useLayoutEffect(() => {
    const el = textRef.current;
    const sel = pendingSel.current;
    if (el && sel) {
      pendingSel.current = null;
      el.setSelectionRange(sel[0], sel[1]);
    }
  }, [value]);

  // Změnu aplikujeme přes insertText, aby zůstala v historii Ctrl+Z jako u běžného psaní.
  function apply(next: Edit) {
    const el = textRef.current;
    if (!el) return;
    const old = el.value;
    const nv = next.value;
    if (old !== nv) {
      let p = 0;
      while (p < old.length && p < nv.length && old[p] === nv[p]) p++;
      let q = 0;
      while (q < old.length - p && q < nv.length - p && old[old.length - 1 - q] === nv[nv.length - 1 - q]) q++;
      el.setSelectionRange(p, old.length - q);
      let ok = false;
      try {
        ok = document.execCommand("insertText", false, nv.slice(p, nv.length - q));
      } catch {
        ok = false;
      }
      if (!ok || el.value !== nv) {
        pendingSel.current = [next.start, next.end];
        setValue(nv);
      }
    }
    el.setSelectionRange(next.start, next.end);
  }

  // Přepočet návrhů po psaní (a po Ctrl+Space, pak i bez písmen).
  function refresh(el: HTMLTextAreaElement, manual = false) {
    const v = el.value;
    const pos = el.selectionStart;
    const kind = opts.fileKind(v, pos);
    const c = el.selectionStart === el.selectionEnd && kind ? completionAt(v, pos, kind, manual) : null;
    if (!c) {
      setCompletion(null);
      return;
    }
    setCompletion({ ...c, index: 0, ...caretXY(el, v, pos) });
  }

  function accept(c: Suggest, i: number) {
    const el = textRef.current;
    const item = c.items[i];
    if (!el || !item) return;
    apply(applyCompletion(el.value, c.start, c.end, item));
    setCompletion(null);
  }

  function onInput(e: FormEvent<HTMLTextAreaElement>) {
    refresh(e.currentTarget);
  }

  function onBlur() {
    setCompletion(null);
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.nativeEvent.isComposing) return;
    const el = e.currentTarget;
    const v = el.value;
    const s = el.selectionStart;
    const t = el.selectionEnd;
    const mod = e.ctrlKey || e.metaKey;

    // Když je otevřený seznam návrhů, šipky a Enter/Tab patří jemu.
    if (completion) {
      const n = completion.items.length;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setCompletion({ ...completion, index: (completion.index + 1) % n });
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setCompletion({ ...completion, index: (completion.index - 1 + n) % n });
        return;
      }
      if ((e.key === "Enter" || e.key === "Tab") && !mod && !e.altKey) {
        e.preventDefault();
        accept(completion, completion.index);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setCompletion(null);
        return;
      }
    }
    if (mod && e.key === " ") {
      e.preventDefault();
      refresh(el, true);
      return;
    }

    if (e.key === "Escape") {
      el.blur();
      return;
    }
    if (mod && (e.key === "s" || e.key === "Enter")) {
      e.preventDefault();
      opts.onRun();
      return;
    }
    if (e.altKey && e.key.toLowerCase() === "z") {
      e.preventDefault();
      opts.toggleWrap();
      return;
    }
    if (mod && e.key === "/") {
      const mode = opts.commentMode(v, s);
      if (!mode) return;
      e.preventDefault();
      apply(comment(v, s, t, mode));
      return;
    }
    if (mod || e.altKey) return;

    let r: Edit | null = null;
    if (e.key === "Enter") r = enter(v, s, t);
    else if (e.key === "Tab") r = tab(v, s, t, e.shiftKey);
    else if (e.key === "Backspace") r = backspace(v, s, t);
    else if (e.key.length === 1) r = typeChar(v, s, t, e.key);
    if (r) {
      e.preventDefault();
      apply(r);
    }
  }

  return { textRef, onKeyDown, onInput, onBlur, completion, accept };
}
