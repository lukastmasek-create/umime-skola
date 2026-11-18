// Blesk: výbojový šíp s vnitřním žhavým jádrem, jiskrami a elektrickými oblouky v pozadí.
import { INK, o, c, ln, dots } from "../kit.mjs";
export default function (A) {
  A.add(`<path d="M14 60Q24 54 20 44M112 70Q104 76 110 86" fill="none" stroke="#9ad4ff" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 6"/>`);
  A.add(`<path d="M16 30L26 34L20 42M110 96L100 92L106 84" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" stroke-opacity=".9"/>`);
  const bolt = "M78 4L30 70H58L46 124L100 48H70L88 4Z";
  A.add(o(bolt, A.lin([[0, "#fff6a8"], [0.5, "#ffd24d"], [1, "#e8861a"]]), 3.4));
  A.add(`<path d="M76 18L44 66H66L56 102L88 54H62L78 18Z" fill="${A.lin([[0, "#fffbe0"], [1, "#ffe27a"]])}" opacity=".9"/>`);
  A.add(`<path d="M88 4L70 48H100L90 62L70 48" fill="#c4621a" fill-opacity=".28"/>`);
  A.add(ln("M72 12L38 64", "#fff", 0.9, 2.2)); A.add(ln("M64 52H88", "#fff", 0.45, 1.4));
  A.add(`<path d="M32 70L58 70" stroke="#a5580f" stroke-opacity=".45" stroke-width="1.4"/>`);
  A.add(A.spark(100, 20, 7, "#fffbe0", "#e8861a")); A.add(A.spark(26, 26, 5.5, "#fffbe0", "#e8861a")); A.add(A.spark(104, 100, 5, "#fffbe0", "#e8861a"));
  return { shadow: [60, 124, 34, 4, 0.3], sparkles: true };
}
