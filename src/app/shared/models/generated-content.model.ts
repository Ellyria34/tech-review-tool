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
}