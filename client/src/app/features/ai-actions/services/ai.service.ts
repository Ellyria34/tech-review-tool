import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { GeneratedContent, ContentType, Article, AiContentType } from '../../../shared/models';
import type { AiGenerateRequestDto, AiGenerateResponseDto } from '../../../shared/models';
import { loadFromStorage, saveToStorage } from '../../../core/services/storage.helper';
import { AiApiService } from '../../../core/services/ai-api.service';

@Injectable({
  providedIn: 'root',
})
export class AiService {
  private readonly STORAGE_KEY = 'trt-generated-contents'
  
  // HTTP client for backend AI API
  private readonly aiApiService = inject(AiApiService);
  private readonly _generateError = signal<string | null>(null);

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
  
  /** Error message from the last failed generation attempt. */
  readonly generateError = this._generateError.asReadonly();

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
   * Generate AI content from selected articles via the backend API.
   * Replaces the former mock generation (step 5) with a real HTTP call.
   *
   * Flow: build DTO → POST /api/ai/generate → map response → store
   * Same async pattern as ArticleService.fetchArticlesForProject()
   */
  async generate(
    type: ContentType,
    articles: Article[],
    projectId: string
  ): Promise<GeneratedContent> {
    this._isGenerating.set(true);
    this._lastGenerated.set(null);
    this._generateError.set(null);
    try {
      // 1. Build the request DTO from frontend models
      const request = this.buildRequest(type, articles);

      // 2. Call the backend (Observable → Promise via firstValueFrom)
      const response = await firstValueFrom(this.aiApiService.generate(request));

      // 3. Map the response DTO to the frontend model
      const content = this.mapResponseToContent(response, articles, projectId);

      // 4. Store in signal + localStorage (same pattern as before)
      this._generatedContents.update((contents) => [...contents, content]);
      this._lastGenerated.set(content);
      saveToStorage(this.STORAGE_KEY, this._generatedContents());

      return content;
    } catch (error: unknown) {
      const message = this.extractErrorMessage(error);
      this._generateError.set(message);
      throw error; // Re-throw so the component can handle it too
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

   // Private helpers

  /**
   * Build the backend request DTO from frontend models.
   * Maps Article fields to AiArticleInputDto fields.
   */
  private buildRequest(
    type: ContentType,
    articles: Article[]
  ): AiGenerateRequestDto {
    return {
      type: this.mapContentTypeToApi(type),
      articles: articles.map((a) => ({
        title: a.title,
        url: a.url,
        source: a.sourceName,
        summary: a.summary || undefined,
        publishedAt: a.publishedAt || undefined,
      })),
    };
  }

  /**
   * Map frontend ContentType to the backend API type value.
   * The frontend uses 'linkedin-post', the backend expects 'linkedin'.
   * This is the DTO layer's job — translate between the two contracts.
   */
    private mapContentTypeToApi(type: ContentType): AiContentType {
    const mapping: Record<ContentType, AiContentType> = {
      'synthesis': 'synthesis',
      'press-review': 'press-review',
      'linkedin-post': 'linkedin',
    };
    return mapping[type];
  }

  /**
   * Reverse mapping: backend API type → frontend ContentType.
   * The backend returns 'linkedin', the frontend uses 'linkedin-post'.
   */
  private mapApiTypeToContentType(apiType: AiContentType): ContentType {
    const mapping: Record<AiContentType, ContentType> = {
      'synthesis': 'synthesis',
      'press-review': 'press-review',
      'linkedin': 'linkedin-post',
    };
    return mapping[apiType];
  }
  
  /**
   * Map the backend response DTO to the frontend GeneratedContent model.
   * Adds frontend-specific fields not present in the API response:
   * id (client-side UUID), projectId, articleIds.
   */
  private mapResponseToContent(
    response: AiGenerateResponseDto,
    articles: Article[],
    projectId: string
  ): GeneratedContent {
    return {
      id: crypto.randomUUID(),
      projectId,
      type: this.mapApiTypeToContentType(response.type),
      articleIds: articles.map((a) => a.id),
      content: response.content,
      createdAt: response.generatedAt,
      provider: response.provider,
    };
  }

  /**
   * Extract a user-friendly error message from an HTTP error.
   * Maps technical HTTP status codes to French messages for the UI.
   */
  private extractErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      switch (error.status) {
        case 400:
          return 'Requête invalide — vérifiez la sélection d\'articles.';
        case 429:
          return 'Limite de requêtes atteinte — réessayez dans quelques minutes.';
        case 500:
          return 'Erreur du serveur IA — le provider est peut-être indisponible.';
        case 503:
          return 'Service IA temporairement indisponible.';
        case 0:
          return 'Impossible de joindre le serveur — vérifiez que le backend est démarré.';
        default:
          return `Erreur inattendue (${error.status}).`;
      }
    }
    return 'Une erreur inattendue s\'est produite.';
  }
}
