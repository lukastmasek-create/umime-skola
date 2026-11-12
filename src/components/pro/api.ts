// Pomocné volání API UčímePRO z prohlížeče.
export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string; status: number };

export async function proFetch<T>(url: string, body?: unknown): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, body === undefined ? undefined : { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const data = (await res.json().catch(() => ({}))) as T & { error?: string };
    if (!res.ok) return { ok: false, error: data.error ?? "unavailable", status: res.status };
    return { ok: true, data };
  } catch {
    return { ok: false, error: "network", status: 0 };
  }
}

export function errorText(t: { errNetwork: string; errAi: string; errLimit: string; errGeneric: string; errNoQuestions: string }, error: string): string {
  if (error === "network") return t.errNetwork;
  if (error === "ai-unavailable") return t.errAi;
  if (error === "rate-limited") return t.errLimit;
  if (error === "not-enough-questions") return t.errNoQuestions;
  return t.errGeneric;
}

/** Přečte obrázek, zmenší ho (delší strana nejvýš 1280 px) a vrátí JPEG jako data URL. */
export async function imageToDataUrl(file: File, maxSide = 1280): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.8);
}

type SpeechCtor = new () => {
  lang: string;
  interimResults: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
};

export function speechRecognition(): SpeechCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: SpeechCtor; webkitSpeechRecognition?: SpeechCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** Jednorázové rozpoznání řeči; `onEnd` se zavolá vždy. Vrací funkci, která nahrávání zastaví. */
export function listenOnce(lang: string, onText: (text: string) => void, onEnd: () => void): (() => void) | null {
  const Ctor = speechRecognition();
  if (!Ctor) return null;
  const rec = new Ctor();
  rec.lang = lang;
  rec.interimResults = false;
  rec.onresult = (e) => onText(Array.from(e.results).map((r) => r[0]?.transcript ?? "").join(" ").trim());
  rec.onerror = () => {};
  rec.onend = onEnd;
  rec.start();
  return () => rec.stop();
}
