/**
 * Represents AI-generated content based on a selection of articles.
 * Each generation is persisted within its project for history.
 */
export type ContentType = 'synthesis' | 'press-review' | 'linkedin-post';

export interface GeneratedContent {
  id: string;
  projectId: string;
  type: ContentType;
  articleIds: string[];
  content: string;
  createdAt: string;
  provider?: string; // AI provider that generated this content
}

/**
 * Display metadata for each AI action type.
 * Used by AiActionPanelComponent to render the action selector.
 */
export interface ContentTypeInfo {
  icon : string;
  label : string;
  description: string;
}

/**
 * Exhaustive map: every ContentType MUST have an entry.
 * Adding a new ContentType without adding it here → compile error.
 * Same pattern as CATEGORIES in shared/data/categories.ts.
 */
export const CONTENT_TYPE_OPTIONS : Record<ContentType, ContentTypeInfo> = {
  'synthesis': {
    icon: '📝',
    label: 'Synthèse',
    description: 'Résumé concis des points clés et liens vers les sources',
  },
  'press-review': {
    icon: '📰',
    label: 'Revue de presse',
    description: 'Format journalistique structuré',
  },
  'linkedin-post': {
    icon: '💼',
    label: 'Post LinkedIn',
    description: 'Post engageant à partir de votre veille',
  }
}