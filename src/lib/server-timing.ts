// Diagnostika latence. Hlavička Server-Timing se přidá jen když požadavek nese ?timing=1,
// jinak se nic neměří do odpovědi a nic se neposílá navíc.
export type Timing = {
  /** Zaznamená čas od posledního kroku pod zadaným názvem. */
  lap(name: string): void;
  /** Zaznamená hodnotu v ms, kterou změřil někdo jiný. */
  note(name: string, ms: number): void;
  apply<T extends Response>(response: T): T;
};

export function startTiming(request: Request): Timing {
  const enabled = new URL(request.url).searchParams.has("timing");
  const parts: string[] = [];
  let last = performance.now();
  const start = last;
  const fmt = (name: string, ms: number) => `${name};dur=${ms.toFixed(1)}`;
  return {
    lap(name) {
      const now = performance.now();
      if (enabled) parts.push(fmt(name, now - last));
      last = now;
    },
    note(name, ms) {
      if (enabled) parts.push(fmt(name, ms));
    },
    apply(response) {
      if (enabled) {
        parts.push(fmt("total", performance.now() - start));
        response.headers.set("Server-Timing", parts.join(", "));
      }
      return response;
    },
  };
}
