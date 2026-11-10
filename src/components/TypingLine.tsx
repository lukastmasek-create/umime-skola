"use client";

import { useEffect, useState } from "react";

// Řádek, který se píše sám: postupně střídá slova (předměty webu). Pro čtečky a bez pohybu je celý seznam
// v textu, takže nic nezávisí na animaci.
export function TypingLine({ prefix, words, className = "" }: { prefix: string; words: string[]; className?: string }) {
  const [text, setText] = useState(words[0] ?? "");
  useEffect(() => {
    if (words.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.getAttribute("data-motion") === "off") return;
    let i = 0;
    let n = 0;
    let erasing = false;
    let t: ReturnType<typeof setTimeout>;
    function tick() {
      const word = words[i % words.length];
      if (!erasing) {
        n++;
        setText(word.slice(0, n));
        if (n >= word.length) {
          erasing = true;
          t = setTimeout(tick, 1500);
          return;
        }
        t = setTimeout(tick, 80);
      } else {
        n--;
        setText(word.slice(0, n));
        if (n <= 0) {
          erasing = false;
          i++;
          t = setTimeout(tick, 300);
          return;
        }
        t = setTimeout(tick, 35);
      }
    }
    t = setTimeout(tick, 900);
    return () => clearTimeout(t);
  }, [words]);
  return (
    <p className={className}>
      <span className="sr-only">{prefix} {words.join(", ")}</span>
      <span aria-hidden="true">
        {prefix} <b className="text-[var(--accent-yellow)]">{text}</b>
        <span className="sc-caret" />
      </span>
    </p>
  );
}
