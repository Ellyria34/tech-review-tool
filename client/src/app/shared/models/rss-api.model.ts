/**
 * DTOs for the RSS backend API.
 * These interfaces mirror the backend response shapes (api/src/models/).
 * @important : If a field is added/changed in the backend, update this file too.
 */

/** Raw article shape returned by GET */
export interface RssArticleDto {
  readonly title: string;
  readonly url: string;
  readonly summary: string;
  readonly publishedAt: string; // ISO 8601 date string
  readonly author?: string;
  readonly imageUrl?: string;
}

/** Request body for POST */
export interface FetchMultipleRequest {
  readonly urls: string[];
}

/** Single feed result in the batch response */
export interface FeedResult {
  readonly url: string;
  readonly articles: RssArticleDto[];
  readonly error?: string;
}