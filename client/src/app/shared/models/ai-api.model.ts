/**
 * DTOs matching the backend POST /api/ai/generate endpoint.
 *
 * @important These interfaces must stay manually synchronized with
 * api/src/models/ai.model.ts — any backend change requires an update here.
 *
 * The DTO is a faithful mirror of the API contract.
 * Field renaming happens in the mapping layer (AiService), not here.
 */

/** Content generation types supported by the backend */
export type AiContentType = 'synthesis' | 'press-review' | 'linkedin-post';

/** Article data sent to the backend for AI generation */
export interface AiArticleInputDto {
  title: string;
  url: string;
  source: string;
  summary?: string;
  publishedAt?: string; // ISO 8601 string (backend expects string, not Date)
}

/** Request body for POST /api/ai/generate */
export interface AiGenerateRequestDto {
  type: AiContentType;
  articles: AiArticleInputDto[];
  projectName?: string;
}

/** Successful response from POST /api/ai/generate */
export interface AiGenerateResponseDto {
  type: AiContentType;
  content: string;
  articleCount: number;
  provider: string;     // 'mock' | 'claude' | 'ollama'
  generatedAt: string;  // ISO 8601 string
}