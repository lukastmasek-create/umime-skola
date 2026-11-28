export function sameOriginMutation(request: Request): boolean {
  if (request.headers.get("sec-fetch-site") === "cross-site") return false;
  const origin = request.headers.get("origin");
  return origin === null || origin === new URL(request.url).origin;
}
