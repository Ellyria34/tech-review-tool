import { parseFeed } from "@rowanmanning/feed-parser";
import type { FeedResult, RssArticle } from "../models/rss-article.model.js";

/** Fetches and parses a single RSS feed URL, returns normalized articles */
export async function fetchRssFeed(feedUrl: string): Promise<RssArticle[]> {
    // Step 1: Download the raw XML (native Node.js fetch — no library needed)
    const response = await fetch(feedUrl, {
    headers: {
      "User-Agent": "TechReviewTool/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const xml = await response.text();
  const feed = parseFeed(xml);

  return feed.items.map((item) => ({
    title: item.title ?? "Untitled",
    link: item.url ?? "",
    pubDate: item.published?.toISOString() ?? item.updated?.toISOString(),
    author: item.authors?.[0]?.name ?? undefined,
    snippet: item.description?.slice(0, 200),
    source: feed.title ?? feedUrl,
  }));
}

/** Fetch multiple RSS feeds concurrently. */
export async function fetchMultipleRssFeeds(
  urls: string[]
): Promise<FeedResult[]> {
  const results = await Promise.allSettled(
    urls.map(async (url) => {
      const articles = await fetchRssFeed(url);
      return { url, articles } satisfies FeedResult;
    })
  );

  return results.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    }
    return {
      url: urls[index]!,
      articles: [],
      error:
        result.reason instanceof Error
          ? result.reason.message
          : "Unknown error",
    } satisfies FeedResult;
  });
}