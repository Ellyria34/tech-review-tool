import { SourceCategory } from "./source.model";

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
  sourceName: string;
  sourceCategory: SourceCategory;
}

//Available time windows for filtrering articles.
export type TimeWindow = '12h' | '24h' | '48h' | '7d' | 'all';

// Filter criteria applied to the article list (AND logic).
export interface ArticleFilters {
  keywords: string;
  timeWindow: TimeWindow;
  sourceId: string | null;
}

// Default filter values.
export const DEFAULT_FILTERS: ArticleFilters = {
  keywords: '',
  timeWindow: '24h',
  sourceId: null,
};

// Time window options for the UI dropdown.
export const TIME_WINDOW_OPTIONS: { value: TimeWindow; label: string }[] = [
  { value: '12h', label: '12 heures' },
  { value: '24h', label: '24 heures' },
  { value: '48h', label: '48 heures' },
  { value: '7d', label: '7 jours' },
  { value: 'all', label: 'Tout' },
];
