import type { AiProvider, ContentType, AiArticleInput } from '../models/ai.model.js';

/**
 * Mock AI provider for development and testing.
 * Generates realistic structured content without external API calls.
 */
export class MockAiProvider implements AiProvider {
  readonly name = 'mock';

  async generate(
    type: ContentType,
    articles: AiArticleInput[],
    projectName?: string
  ): Promise<string> {
    // Simulate network latency
    await this.delay(400, 900);

    switch (type) {
      case 'synthesis':
        return this.buildSynthesis(articles, projectName);
      case 'press-review':
        return this.buildPressReview(articles, projectName);
      case 'linkedin':
        return this.buildLinkedIn(articles, projectName);
    }
  }

  private buildSynthesis(articles: AiArticleInput[], projectName?: string): string {
    const ctx = projectName ? ` — ${projectName}` : '';
    const articleList = articles
      .map((a) => `- **${a.title}** (${a.sourceName}) : ${this.truncate(a.summary, 120)}`)
      .join('\n');

    return [
      `# Synthèse${ctx}`,
      '',
      `> ${articles.length} article(s) analysé(s) le ${this.formatDate()}`,
      '',
      '## Points clés',
      '',
      articleList,
      '',
      '## Tendances identifiées',
      '',
      '1. **Évolution rapide** — Les sujets couverts montrent une accélération des innovations.',
      '2. **Convergence** — Plusieurs sources abordent des thématiques liées.',
      '3. **Impact pratique** — Les articles sélectionnés ont des implications concrètes pour les développeurs.',
      '',
      '---',
      `*Synthèse générée par TechReviewTool (provider: mock)*`,
    ].join('\n');
  }

  private buildPressReview(articles: AiArticleInput[], projectName?: string): string {
    const ctx = projectName ? ` — ${projectName}` : '';
    const sections = articles
      .map(
        (a) =>
          `### ${a.title}\n**Source** : ${a.sourceName} — [Lire l'article](${a.url})\n\n${this.truncate(a.summary, 200)}\n`
      )
      .join('\n');

    return [
      `# Revue de presse${ctx}`,
      '',
      `*${this.formatDate()} — ${articles.length} article(s)*`,
      '',
      '## Les faits marquants',
      '',
      sections,
      '## Analyse',
      '',
      'Les publications de cette période montrent une dynamique forte sur les sujets sélectionnés. '
        + 'Plusieurs acteurs majeurs convergent vers des solutions similaires, '
        + 'ce qui confirme les tendances observées ces dernières semaines.',
      '',
      '---',
      `*Revue de presse générée par TechReviewTool (provider: mock)*`,
    ].join('\n');
  }

  private buildLinkedIn(articles: AiArticleInput[], projectName?: string): string {
    const topArticle = articles[0];
    const otherTitles = articles
      .slice(1, 4)
      .map((a) => `→ ${a.title}`)
      .join('\n');

    return [
      `🔍 Veille tech${projectName ? ` #${projectName.replace(/\s+/g, '')}` : ''}`,
      '',
      `${topArticle ? `Je viens de lire "${topArticle.title}" et ${articles.length > 1 ? `${articles.length - 1} autres articles` : "c'est passionnant"}.` : ''}`,
      '',
      articles.length > 1 ? `Autres lectures :\n${otherTitles}` : '',
      '',
      '💡 Ce que j\'en retiens :',
      '- L\'innovation s\'accélère dans ce domaine',
      '- Les outils évoluent vers plus de simplicité',
      '- La communauté dev est plus active que jamais',
      '',
      'Et vous, quelles sont vos sources de veille préférées ? 👇',
      '',
      '#TechWatch #Dev #Veille #Innovation',
      '',
      '---',
      `*Post LinkedIn généré par TechReviewTool (provider: mock)*`,
    ].join('\n');
  }

  // --- Helpers ---

  private delay(min: number, max: number): Promise<void> {
    const ms = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private truncate(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) return text || '';
    return text.slice(0, maxLength).trimEnd() + '…';
  }

  private formatDate(): string {
    return new Date().toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
}