// Vstup workeru: běžný OpenNext worker + plánovač (cron v wrangler.jsonc) pro e-mailové připomínky.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore vzniká až při `opennextjs-cloudflare build`
import handler from "./.open-next/worker.js";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore vzniká až při `opennextjs-cloudflare build`
export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from "./.open-next/worker.js";

type Env = { CRON_SECRET?: string } & Record<string, unknown>;

const worker = {
  fetch: handler.fetch,
  async scheduled(_event: unknown, env: Env, ctx: { waitUntil(p: Promise<unknown>): void }) {
    if (!env.CRON_SECRET) {
      console.warn("Plánovač: chybí secret CRON_SECRET, připomínky se nespouští.");
      return;
    }
    const request = new Request("https://ucimesehrou.org/api/cron/pripominky", {
      headers: { authorization: `Bearer ${env.CRON_SECRET}` },
    });
    ctx.waitUntil(handler.fetch(request, env, ctx).then((r: Response) => console.log("Připomínky:", r.status)));
  },
};

export default worker;
