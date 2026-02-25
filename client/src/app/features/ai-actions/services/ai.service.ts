import { Injectable, signal, computed } from '@angular/core';
import { GeneratedContent, ContentType, Article } from '../../../shared/models';
import { loadFromStorage, saveToStorage } from '../../../core/services/storage.helper';

@Injectable({
  providedIn: 'root',
})
export class AiService {
  private readonly STORAGE_KEY = 'trt-generated-contents'

  // Private signals (only the service can mutate)
  private readonly _generatedContents = signal<GeneratedContent[]>(
    loadFromStorage<GeneratedContent[]>(this.STORAGE_KEY, [])
  );
  private readonly _isGenerating = signal(false);
  private readonly _lastGenerated = signal<GeneratedContent | null>(null);
  private readonly _currentProjectId = signal<string | null>(null);

  //Public readonly access

  /** Whether a generation is currently in progress. */
  readonly isGenerating = this._isGenerating.asReadonly();

  /** The last generated content (displayed in the panel after generation). */
  readonly lastGenerated = this._lastGenerated.asReadonly();

  /** All generated contents for the current project, newest first. */
  readonly projectContents = computed(() => {
    const projectId = this._currentProjectId();
    if(!projectId) return [];
    return this._generatedContents()
      .filter((c) => c.projectId === projectId)
      .sort((a,b) => new Date(b.createdAt).getTime()- new Date(a.createdAt).getTime());
  });

  /** Number of generated contents for the current project. */
  readonly contentCount = computed(() => this.projectContents().length);

  // Public methods
  /**
   * Set the current project context.
   * Must be called in ngOnInit (not in a computed — side effect rule).
   */
  setCurrentProject(projectId: string): void {
    this._currentProjectId.set(projectId);
  }

  /**
   * Generate AI content from selected articles.
   * Currently uses mock generation with a simulated delay.
   * The generateMockContent() method is the ONLY thing to replace
   * when switching to a real AI API.
   */
  async generate(
      type: ContentType, 
      articles : Article[], 
      projectId: string
    ): Promise<GeneratedContent> {
    this._isGenerating.set(true);
    this._lastGenerated.set(null);
    try{
      // Simulate API delay (300-800ms)
      await this.simulateDelay(300, 800);
      const content : GeneratedContent = {
        id: crypto.randomUUID(),
        projectId,
        type,
        articleIds : articles.map((a) => a.id),
        content: this.generateMockContent(type, articles),
        createdAt : new Date().toISOString(),
      };
        
      // Immutable update (same pattern as all other services)
      this._generatedContents.update((contents) => [...contents, content]);
      this._lastGenerated.set(content);
      saveToStorage(this.STORAGE_KEY,this._generatedContents());
        
      return content;
    } finally {
      this._isGenerating.set(false);
    }
  }

  /** Delete a single generated content by id. */
  delete(contentId: string): void {
    this._generatedContents.update((contents) =>
      contents.filter((c) => c.id !== contentId)
    );
    saveToStorage(this.STORAGE_KEY, this._generatedContents());
  }

  /** Delete all generated contents for a project (cascade delete). */
  deleteByProject(projectId: string): void {
    this._generatedContents.update((contents) =>
      contents.filter((c) => c.projectId !== projectId)
    );
    saveToStorage(this.STORAGE_KEY, this._generatedContents());
  }

   // Private helpers

    /** Simulate network latency for mock generation. */
    private simulateDelay(minMs: number, maxMs: number) : Promise<void> {
      const delay = Math.floor(Math.random()* (maxMs - minMs + 1)) + minMs;
      return new Promise((resolve) => setTimeout(resolve,delay));
    }

    /**
   * Generate mock content based on the type and articles.
   * This is the ONLY method to replace when switching to a real AI API.
   */
  private generateMockContent(type: ContentType, articles: Article[]): string {
    const titles = articles.map((a) => a.title);
    const sources = [...new Set(articles.map((a) => a.sourceName))];

    switch (type) {
      case 'synthesis':
        return this.generateMockSynthesis(articles, titles, sources);
      case 'press-review':
        return this.generateMockPressReview(articles, titles, sources);
      case 'linkedin-post':
        return this.generateMockLinkedInPost(titles, sources);
    }
  }

  private generateMockSynthesis(
    articles: Article[],
    titles: string[],
    sources: string[]
  ): string {
    return [
      `## Synthèse — ${titles.length} articles analysés`,
      '',
      `**Sources** : ${sources.join(', ')}`,
      '',
      '### Points clés',
      '',
      ...articles.map(
        (a, i) =>
          `${i + 1}. **${a.title}**\n` +
          `   ${a.summary || 'Point clé extrait de cet article.'}\n` +
          `   🔗 [Lire l'article original](${a.url})`
      ),
      '',
      '### Analyse transversale',
      '',
      'Les articles sélectionnés convergent sur plusieurs tendances majeures. ' +
        "L'évolution rapide du domaine nécessite une veille constante. " +
        'Les implications pour les équipes techniques sont significatives.',
      '',
      `*Synthèse générée le ${new Date().toLocaleDateString('fr-FR')} à partir de ${titles.length} articles.*`,
    ].join('\n');
  }

  private generateMockPressReview(
    articles: Article[],
    titles: string[],
    sources: string[]
  ): string {
    return [
      `# 📰 Revue de presse — ${new Date().toLocaleDateString('fr-FR')}`,
      '',
      `> ${titles.length} articles de ${sources.length} source(s) : ${sources.join(', ')}`,
      '',
      '---',
      '',
      ...articles.map(
        (a) =>
          `### ${a.title}\n\n` +
          `**${a.sourceName}** — ${new Date(a.publishedAt).toLocaleDateString('fr-FR')}\n\n` +
          `${a.summary || "Cet article aborde un sujet d'actualité technologique avec des implications importantes pour les professionnels du secteur."}\n`
      ),
      '---',
      '',
      '*Revue de presse générée automatiquement. Consultez les articles originaux pour le détail.*',
    ].join('\n');
  }

  private generateMockLinkedInPost(
    titles: string[],
    sources: string[]
  ): string {
    const hashtags = sources.map(
      (s) => `#${s.replace(/[^a-zA-Z0-9]/g, '')}`
    );
    return [
      "🔍 Veille tech du jour — Ce que j'ai retenu",
      '',
      `J'ai analysé ${titles.length} articles récents et voici les points qui m'ont marqué :`,
      '',
      ...titles.map((t) => `→ ${t}`),
      '',
      "Ce qui ressort : le rythme d'innovation s'accélère et les impacts " +
        'sur nos pratiques de développement sont concrets.',
      '',
      '💬 Et vous, quelles tendances suivez-vous en ce moment ?',
      '',
      `${hashtags.join(' ')} #VeilleTech #Dev`,
    ].join('\n');
  }
}
