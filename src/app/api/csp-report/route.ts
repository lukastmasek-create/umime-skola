const MAX_REPORT_BYTES = 4096;
const directives = new Set(["script-src", "script-src-attr", "script-src-elem", "object-src", "base-uri", "form-action"]);

export async function POST(request: Request) {
  const type = request.headers.get("content-type")?.split(";")[0].trim();
  if (type !== "application/csp-report") return new Response(null, { status: 415 });
  const reader = request.body?.getReader();
  if (!reader) return new Response(null, { status: 400 });
  const decoder = new TextDecoder();
  let size = 0;
  let payload = "";
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_REPORT_BYTES) {
        await reader.cancel();
        return new Response(null, { status: 413 });
      }
      payload += decoder.decode(value, { stream: true });
    }
    const report = JSON.parse(payload + decoder.decode())?.["csp-report"];
    const directive = report?.["effective-directive"];
    if (typeof directive === "string" && directives.has(directive) && Math.random() < 0.05) {
      // Deliberately omit document URLs, script URLs and inline samples.
      const blocked = report["blocked-uri"];
      console.info("[csp-report]", directive, blocked === "inline" || blocked === "eval" ? blocked : "other");
    }
    return new Response(null, { status: 204 });
  } catch {
    return new Response(null, { status: 400 });
  }
}
