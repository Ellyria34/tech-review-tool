// DTO representing a normalized RSS article across all feed sources
export interface RssArticle {
  title: string;
  link: string;
  pubDate: string | undefined;
  author: string | undefined;
  snippet: string | undefined;
  source: string;
}

// Request body for POST /api/rss/fetch-multiple
export interface FetchMultipleRequest {
  urls: string[];
}

// Single feed result in the batch response (supports partial failures)
export interface FeedResult {
  url: string;
  articles: RssArticle[];
  error?: string;
}