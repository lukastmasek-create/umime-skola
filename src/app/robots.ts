import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// AI crawlery a SEO scrapery, které se vzdálí, když jim to robots.txt řekne.
// Vyhledávače (Googlebot, Bingbot) nechávám povolené, aby web zůstal ve výsledcích hledání.
const BLOCKED_BOTS = [
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "CCBot",
  "Google-Extended",
  "PerplexityBot",
  "Perplexity-User",
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

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: BLOCKED_BOTS, disallow: "/" },
      { userAgent: "*", allow: "/", disallow: ["/api/", "/*/test/"] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
