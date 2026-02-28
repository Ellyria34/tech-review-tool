import type { AiProvider, ContentType, AiArticleInput } from '../models/ai.model.js';

const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
const MISTRAL_MODEL = 'mistral-small-latest';

/**
 * Mistral AI provider — calls the Mistral chat completions API.
 * Uses native fetch (no SDK) for minimal dependencies.
 */
export class MistralAiProvider implements AiProvider {
  readonly name = 'mistral';
  private readonly apiKey: string;

  constructor() {
    const key = process.env['MISTRAL_API_KEY'];
    if (!key) {
      throw new Error('MISTRAL_API_KEY environment variable is required when using Mistral provider');
    }
    this.apiKey = key;
  }

  async generate(
    type: ContentType,
    articles: AiArticleInput[],
    projectName?: string
  ): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(type);
    const userPrompt = this.buildUserPrompt(type, articles, projectName);

    const response = await fetch(MISTRAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: MISTRAL_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.4,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Mistral API error (${response.status}): ${errorBody}`);
    }

    const data = await response.json() as MistralResponse;
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Mistral API returned an empty response');
    }

    return content;
  }

  // --- Prompt engineering ---

  private buildSystemPrompt(type: ContentType): string {
    switch (type) {
      case 'synthesis':
        return [
          'Tu es un expert en veille technologique.',
          'Tu produis des synthèses concises et structurées en Markdown.',
          'Chaque point clé doit citer la source entre parenthèses.',
          'Termine par une section "Tendances" avec 2-3 observations transversales.',
          'Réponds uniquement en français.',
        ].join(' ');

      case 'press-review':
        return [
          'Tu es un journaliste tech spécialisé dans la rédaction de revues de presse.',
          'Tu rédiges en français, dans un style professionnel et factuel.',
          'Structure : titre, introduction contextualisante, une section par article avec analyse,',
          'puis une conclusion sur les tendances. Format Markdown.',
        ].join(' ');

      case 'linkedin':
        return [
          'Tu es un expert en personal branding tech sur LinkedIn.',
          'Tu rédiges des posts engageants en français qui génèrent de l\'interaction.',
          'Style : accroche forte, insights concrets, question ouverte à la fin.',
          'Utilise des emojis avec parcimonie (2-3 max). Ajoute 3-5 hashtags pertinents.',
          'Le post doit faire entre 150 et 300 mots.',
        ].join(' ');
    }
  }

  private buildUserPrompt(
    type: ContentType,
    articles: AiArticleInput[],
    projectName?: string
  ): string {
    const context = projectName ? `Projet de veille : "${projectName}"\n\n` : '';

    const articleList = articles
      .map(
        (a, i) =>
          `### Article ${i + 1}\n` +
          `- **Titre** : ${a.title}\n` +
          `- **Source** : ${a.sourceName}\n` +
          `- **URL** : ${a.url}\n` +
          `- **Résumé** : ${a.summary || 'Non disponible'}\n`
      )
      .join('\n');

    const typeLabel: Record<ContentType, string> = {
      'synthesis': 'une synthèse structurée des points clés',
      'press-review': 'une revue de presse professionnelle',
      'linkedin': 'un post LinkedIn engageant',
    };

    return [
      context,
      `Voici ${articles.length} article(s) de veille technologique :\n\n`,
      articleList,
      `\nGénère ${typeLabel[type]} à partir de ces articles.`,
    ].join('');
  }
}

/** Minimal type for the Mistral API response (only what we need) */
interface MistralResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}