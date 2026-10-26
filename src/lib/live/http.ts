import { NextResponse } from "next/server";
import { LiveError } from "./service";

export async function handle(fn: () => Promise<unknown>): Promise<NextResponse> {
  try {
    return NextResponse.json(await fn(), { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    if (e instanceof LiveError) return NextResponse.json({ error: e.code }, { status: e.status });
    console.error("live api failed", e);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}

export async function readJson(request: Request): Promise<Record<string, unknown>> {
  const body = await request.json().catch(() => ({}));
  return body && typeof body === "object" ? (body as Record<string, unknown>) : {};
}

export const hostSecretOf = (request: Request) => request.headers.get("x-host-secret");
export const playerTokenOf = (request: Request) => request.headers.get("x-player-token");
