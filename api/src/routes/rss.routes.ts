import type { FastifyInstance } from "fastify";
import { fetchRssFeed } from "../services/rss.service.js";

// Register RSS-related routes on the Fastify instance
export async function rssRoutes(app: FastifyInstance): Promise<void> {
  // GET /api/rss/fetch?url=https://example.com/feed.xml
  app.get("/api/rss/fetch", async (request, reply) => {
    const { url } = request.query as { url?: string };

    // Validate required parameter
    if (!url) {
      return reply.status(400).send({
        error: "Missing required query parameter: url",
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return reply.status(400).send({
        error: "Invalid URL format",
      });
    }

    // Fetch and parse the RSS feed
    try {
      const articles = await fetchRssFeed(url);
      return reply.send({
        feedUrl: url,
        count: articles.length,
        articles,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      return reply.status(502).send({
        error: "Failed to fetch RSS feed",
        detail: message,
      });
    }
  });
}