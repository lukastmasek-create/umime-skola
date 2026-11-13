import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// AI boty, které jen sbírají data pro trénink modelů, a SEO scrapery. Ty se vzdálí, když jim to robots.txt řekne.
const BLOCKED_BOTS = [
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "GPTBot",
  "CCBot",
  "Google-Extended",
  "Bytespider",
  "Amazonbot",
  "Meta-ExternalAgent",
  "FacebookBot",
  "Applebot-Extended",
  "cohere-ai",
  "Diffbot",
  "ImagesiftBot",
  "Omgilibot",
  "AhrefsBot",
  "SemrushBot",
  "MJ12bot",
  "DotBot",
  "PetalBot",
];

// AI vyhledávání a asistenti, kteří stránku načtou, když se na ni uživatel sám zeptá nebo ji hledají.
// Díky nim AI odpovědi o Učíme se hrou popisují správně a odkazují na web.
const ALLOWED_AI_BOTS = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: BLOCKED_BOTS, disallow: "/" },
      { userAgent: ALLOWED_AI_BOTS, allow: "/", disallow: ["/api/", "/*/test/"] },
      { userAgent: "*", allow: "/", disallow: ["/api/", "/*/test/"] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
