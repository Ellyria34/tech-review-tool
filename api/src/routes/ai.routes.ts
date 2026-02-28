import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { AiGenerateRequest } from '../models/ai.model.js';
import { generateContent } from '../services/ai.service.js';

const VALID_TYPES = ['synthesis', 'press-review', 'linkedin'] as const;
const MAX_ARTICLES = 10;

/**
 * AI generation routes — Fastify plugin.
 * POST /api/ai/generate
 */
export async function aiRoutes(app: FastifyInstance): Promise<void> {
  app.post('/api/ai/generate', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as AiGenerateRequest | undefined;

    // --- Validation ---
    if (!body || typeof body !== 'object') {
      return reply.status(400).send({
        error: 'Request body is required',
      });
    }

    if (!body.type || !VALID_TYPES.includes(body.type)) {
      return reply.status(400).send({
        error: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}`,
      });
    }

    if (!Array.isArray(body.articles) || body.articles.length === 0) {
      return reply.status(400).send({
        error: 'At least one article is required',
      });
    }

    if (body.articles.length > MAX_ARTICLES) {
      return reply.status(400).send({
        error: `Too many articles. Maximum is ${MAX_ARTICLES}`,
      });
    }

    // Validate each article has required fields
    for (const [index, article] of body.articles.entries()) {
      if (!article.title || !article.url) {
        return reply.status(400).send({
          error: `Article at index ${index} is missing required fields (title, url)`,
        });
      }
    }

    // --- Generation ---
    try {
      const response = await generateContent(
        body.type,
        body.articles,
        body.projectName
      );
      return reply.status(200).send(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[AI] Generation failed: ${message}`);
      return reply.status(500).send({
        error: `AI generation failed: ${message}`,
      });
    }
  });
}