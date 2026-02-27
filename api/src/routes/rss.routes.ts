import type { FastifyInstance } from "fastify";
import { fetchRssFeed, fetchMultipleRssFeeds } from "../services/rss.service.js";
import type { FetchMultipleRequest } from "../models/rss-article.model.js";

// Register RSS-related routes on the Fastify instance
export async function rssRoutes(app: FastifyInstance): Promise<void> {
  // GET /api/rss/fetch?url=https://example.com/feed.xml
  app.get("/api/rss/fetch", async (request, reply) => {
    const { url } = request.query as { url?: string };

    if (!url) {
      return reply.status(400).send({
        error: "Missing required query parameter: url",
      });
    }

    try {
      new URL(url);
    } catch {
      return reply.status(400).send({
        error: "Invalid URL format",
      });
    }

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

  // POST /api/rss/fetch-multiple — batch fetch for multiple feeds
  app.post<{ Body: FetchMultipleRequest }>(
    "/api/rss/fetch-multiple",
    async (request, reply) => {
      const { urls } = request.body;

      // Validate: must be a non-empty array
      if (!Array.isArray(urls) || urls.length === 0) {
        return reply.status(400).send({
          error: 'Request body must contain a non-empty "urls" array',
        });
      }

      // Security: limit batch size to prevent abuse
      const MAX_BATCH_SIZE = 20;
      if (urls.length > MAX_BATCH_SIZE) {
        return reply.status(400).send({
          error: `Batch size limited to ${MAX_BATCH_SIZE} URLs`,
        });
      }

      // Validate each URL format
      for (const url of urls) {
        if (typeof url !== "string" || !url.startsWith("http")) {
          return reply.status(400).send({
            error: `Invalid URL: ${url}`,
          });
        }
      }

      const results = await fetchMultipleRssFeeds(urls);
      return reply.send(results);
    }
  );
}