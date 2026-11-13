"use client";

import { useLayoutEffect, useRef, type KeyboardEvent } from "react";
import { backspace, comment, enter, tab, typeChar, type CommentMode, type Edit } from "@/lib/code-editing";

// Klávesy editoru jako ve VS Code (odsazení, párování, komentáře). Sdílí je všechny režimy editoru.
export function useCodeKeys(
  value: string,
  setValue: (v: string) => void,
  opts: {
    onRun: () => void;
    toggleWrap: () => void;
    commentMode: (v: string, pos: number) => CommentMode | null;
  },
) {
  const textRef = useRef<HTMLTextAreaElement>(null);
  const pendingSel = useRef<[number, number] | null>(null);

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

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.nativeEvent.isComposing) return;
    const el = e.currentTarget;
    const v = el.value;
    const s = el.selectionStart;
    const t = el.selectionEnd;
    const mod = e.ctrlKey || e.metaKey;

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

  return { textRef, onKeyDown };
}
