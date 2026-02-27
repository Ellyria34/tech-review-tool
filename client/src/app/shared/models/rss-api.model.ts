/**
 * DTOs for the RSS backend API.
 * @important If a field is added/changed in the backend, update this file too.
 */

/** Mirrors api/src/models/rss-article.model.ts */
export interface RssArticleDto {
  readonly title: string;
  readonly link: string;
  readonly snippet: string | undefined;
  readonly pubDate: string | undefined;
  readonly author: string | undefined;
  readonly source: string;
}

/** Response wrapper from GET /api/rss/fetch */
export interface FeedResponse {
  readonly feedUrl: string;
  readonly count: number;
  readonly articles: RssArticleDto[];
}

/** Request body for POST /api/rss/fetch-multiple */
export interface FetchMultipleRequest {
  readonly urls: string[];
}

/** Single feed result in the batch response */
export interface FeedResult {
  readonly url: string;
  readonly articles: RssArticleDto[];
  readonly error?: string;
}