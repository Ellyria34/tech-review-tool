// DTO representing a normalized RSS article across all feed sources
export interface RssArticle {
  title: string;
  link: string;
  pubDate: string | undefined;
  author: string | undefined;
  snippet: string | undefined;
  source: string;
}