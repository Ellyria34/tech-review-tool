/**
 * Supported AI generation types.
 * Each type produces a different content format.
 */
export type ContentType = 'synthesis' | 'press-review' | 'linkedin';

/**
 * Input article data sent to the AI provider.
 * Minimal shape — only what the AI needs to generate content.
 */
export interface AiArticleInput {
  title: string;
  url: string;
  summary: string;
  sourceName: string;
}

/**
 * Request payload for the AI generation endpoint.
 */
export interface AiGenerateRequest {
  type: ContentType;
  articles: AiArticleInput[];
  projectName?: string;
}

/**
 * Response from the AI generation endpoint.
 */
export interface AiGenerateResponse {
  type: ContentType;
  content: string;
  articleCount: number;
  provider: string;
  generatedAt: string;
}

/**
 * Strategy Pattern interface — all AI providers must implement this.
 * Adding a new provider (Claude, Ollama, Mistral...) only requires
 * implementing this interface + registering it in the factory.
 */
export interface AiProvider {
  /** Unique identifier for logging and response metadata */
  readonly name: string;

  /**
   * Generate content from a list of articles.
   * @param type - The format to generate (synthesis, press-review, linkedin)
   * @param articles - The source articles
   * @param projectName - Optional project context for better prompts
   * @returns The generated text content
   */
  generate(
    type: ContentType,
    articles: AiArticleInput[],
    projectName?: string
  ): Promise<string>;
}