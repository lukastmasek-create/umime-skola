import { createHash } from "node:crypto";

export function rankingAlias(userId: string): string {
  return `#${createHash("sha256").update("ush:rank:").update(userId).digest("hex").slice(0, 8).toUpperCase()}`;
}
