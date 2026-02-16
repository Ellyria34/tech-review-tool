/**
 * Represents an article fetched from an RSS source.
 * Articles are scoped to a project and linked to their source.
 */
export interface Article {
  id: string;
  projectId: string;
  sourceId: string;
  title: string;
  url: string;
  summary: string;
  publishedAt: string;
  keywords: string[];
}