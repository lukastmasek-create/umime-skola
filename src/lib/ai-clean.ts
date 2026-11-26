// Úklid odpovědí modelů (čistá funkce, aby šla testovat bez Workers kontextu).

/** Odstraní stopy „přemýšlení“ a zbytečné obaly, které modely občas vrací. */
export function cleanReply(text: string): string {
  return text
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/^\s*<\/?think>\s*/gi, "")
    .replace(/^(?:assistant|asistent)\s*:\s*/i, "")
    .trim();
}
