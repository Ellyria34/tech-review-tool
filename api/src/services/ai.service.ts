import type { AiProvider, ContentType, AiArticleInput, AiGenerateResponse } from '../models/ai.model.js';
import { MockAiProvider } from '../providers/mock-ai.provider.js';
import { MistralAiProvider } from '../providers/mistral-ai.provider.js';

/** Supported provider identifiers */
type ProviderName = 'mock' | 'mistral';

/**
 * Factory function — instantiates the correct AI provider
 * based on the AI_PROVIDER environment variable.
 *
 * Default: 'mock' (no external dependency required).
 */
function createProvider(): AiProvider {
  const providerName = (process.env['AI_PROVIDER'] ?? 'mock') as ProviderName;

  switch (providerName) {
    case 'mistral': 
      return new MistralAiProvider();
    case 'mock':
    default:
      return new MockAiProvider();
  }
}

/** Singleton provider instance — created once at server startup */
const provider: AiProvider = createProvider();

/**
 * Generate AI content from a list of articles.
 * Delegates to the active provider (Mock, Claude, ...).
 *
 * @param type - The content format to generate
 * @param articles - Source articles (1 to 10)
 * @param projectName - Optional project context
 * @returns Full response with content, metadata, and provider info
 */
export async function generateContent(
  type: ContentType,
  articles: AiArticleInput[],
  projectName?: string
): Promise<AiGenerateResponse> {
  console.log(`[AI] Generating "${type}" with provider "${provider.name}" (${articles.length} articles)`);

  const content = await provider.generate(type, articles, projectName);

  return {
    type,
    content,
    articleCount: articles.length,
    provider: provider.name,
    generatedAt: new Date().toISOString(),
  };
}

/** Expose active provider name (useful for health check / debugging) */
export function getProviderName(): string {
  return provider.name;
}