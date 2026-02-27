import { Injectable, inject, signal, computed } from '@angular/core';
import { SourceService } from '../../sources/services/source.service';
import { RssApiService } from '../../../core/services/rss-api.service';
import { Article, ArticleFilters, TimeWindow, DEFAULT_FILTERS, FeedResult } from '../../../shared/models';
import { MOCK_ARTICLE_TEMPLATES } from '../../../shared/data/mock-articles';
import { loadFromStorage, saveToStorage } from '../../../core/services/storage.helper';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ArticleService {
  private readonly STORAGE_KEY = 'trt-articles';

  private readonly sourceService = inject(SourceService);
  private readonly rssApi = inject(RssApiService);
  
  // Loading and error state for backend fetching
  private readonly _isLoading = signal(false);
  private readonly _fetchError = signal<string | null>(null);
  readonly isLoading = this._isLoading.asReadonly();
  readonly fetchError = this._fetchError.asReadonly();
  
  // State signals
  private readonly _articles = signal<Article[]>(
    loadFromStorage<Article[]>(this.STORAGE_KEY, [])
  );
  private readonly _filters = signal<ArticleFilters>({ ...DEFAULT_FILTERS });
  private readonly _currentProjectId = signal<string | null>(null);
  private readonly _selectedIds = signal<Set<string>>(new Set());

  // Public read-only access
  readonly filters = this._filters.asReadonly();
  readonly currentProjectId = this._currentProjectId.asReadonly();
  readonly selectedIds = this._selectedIds.asReadonly();

  // Computed signals
  // All articles for the active project (before filtering)
  readonly projectArticles = computed(() => {
    const projectId = this._currentProjectId();
    if(!projectId) return [];
    return this._articles().filter(a => a.projectId === projectId);
  });

  // All articles for the active project (after filtering)
  readonly filteredArticles = computed( () => {
    const articles = this.projectArticles();
    const filters = this.filters();
    let result = [...articles];

    //Keyword search (AND logic — all terms must match)
    if(filters.keywords.trim()) {
      const terms = filters.keywords.toLowerCase().split(/\s+/).filter((t) => t.length > 0);
      result = result.filter((article) => {
        const searchable = `${article.title} ${article.summary}`.toLowerCase();
        return terms.every((term) => searchable.includes(term));
      });
    }

    // Time window filter
    if (filters.timeWindow !== 'all') {
      const cutoff = this.getTimeCutoff(filters.timeWindow);
      result = result.filter((a) => new Date(a.publishedAt) >= cutoff);
    }

    // Source filter
    if (filters.sourceId) {
      result = result.filter((a) => a.sourceId === filters.sourceId);
    }

    // Sort by date (newest first)
    result.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    return result;
  });

  readonly filteredCount = computed(() => this.filteredArticles().length);
  readonly totalCount = computed(() => this.projectArticles().length);
  readonly selectedCount = computed(() => this.selectedIds().size);
  //Selected article objects (ready for AI actions)
  readonly selectedArticles = computed(() => {
    const ids = this._selectedIds();
    return this.filteredArticles().filter((a) => ids.has(a.id));
  });

  // Project context
  
  // Set the active project. Resets filters and selection on change.
  setCurrentProject(projectId: string): void {
    if (this._currentProjectId() !== projectId) {
      this._currentProjectId.set(projectId);
      this._filters.set({ ...DEFAULT_FILTERS });
      this.clearSelection();
    }
  }
  
  // Filters
  updateFilters(partial : Partial<ArticleFilters>): void {
    this._filters.update((current) => ({...current, ...partial}));
    this.clearSelection();
  }
  
  resetFilters(): void {
    this._filters.set({ ...DEFAULT_FILTERS});
    this.clearSelection();
  }
  
  // Selection
  toggleSelection(articleId: string): void {
    this._selectedIds.update((ids) => {
      const next = new Set(ids);
      if (next.has(articleId)){
        next.delete(articleId);
      } else {
        next.add(articleId);
      }
      return next;
    });
  }

  isSelected(articleId: string): boolean {
    return this._selectedIds().has(articleId);
  }

  selectAll(): void {
    const allIds = new Set(this.filteredArticles().map((a) => a.id));
    this._selectedIds.set(allIds);
  }

  clearSelection(): void {
    this._selectedIds.set(new Set());
  }
  
  // Article management
  addArticles(articles : Article[]): void {
    this._articles.update((current) => {
      const existingUrls = new Set(current.map((a) => `${a.projectId} : ${a.url}`));
      const newArticles = articles.filter((a) => !existingUrls.has(`${a.projectId} : ${a.url}`)
      );
    return [ ...current, ...newArticles];
    });
    this.saveToStorage();
  }

  removeByProject(projectId: string): void {
    this._articles.update((current) => current.filter((a) => a.projectId !== projectId));
    this.saveToStorage();
  }

/**
 * @deprecated Use fetchArticlesForProject() instead.
 * Kept as fallback during development — will be removed at Step 13.
 */  loadMockArticles(projectId: string): void {
    const linkedSources = this.sourceService.getByProject(projectId)();
    const activeSources = linkedSources.filter((s) => s.isActive);

    if (activeSources.length === 0) return;

    const mockArticles = this.generateMockArticles(projectId, activeSources);
    this.addArticles(mockArticles);
  }

/**
 * Fetch real articles from backend for all active sources of a project.
 * Replaces the former loadMockArticles() method.
 */
async fetchArticlesForProject(projectId: string): Promise<void> {
  this._isLoading.set(true);
  this._fetchError.set(null);

  try {
    // 1. Get active sources for this project
    const linkedSources = this.sourceService.getByProject(projectId)();
    const activeSources = linkedSources.filter(s => s.isActive);

    if (activeSources.length === 0) {
      this._articles.update(articles =>
        articles.filter(a => a.projectId !== projectId)
      );
      return;
    }

    // 2. Collect feed URLs and call backend
    const feedUrls = activeSources.map(s => s.url);
    const feedResults = await firstValueFrom(
      this.rssApi.fetchMultipleFeeds(feedUrls)
    );

    // 3. Map backend DTOs to frontend Article model
    const newArticles = this.mapFeedResultsToArticles(
      feedResults, activeSources, projectId
    );

    // 4. Replace articles for this project (keep other projects' articles)
    this._articles.update(articles => [
      ...articles.filter(a => a.projectId !== projectId),
      ...newArticles,
    ]);
    this.saveToStorage();

    // 5. Report partial failures
    const errors = feedResults.filter(r => r.error);
    if (errors.length > 0) {
      this._fetchError.set(
        `${errors.length}/${feedResults.length} source(s) failed to load`
      );
    }
  } catch (error) {
    this._fetchError.set(
      error instanceof Error ? error.message : 'Failed to fetch articles'
    );
  } finally {
    this._isLoading.set(false);
  }
}

/**
 * Map backend RssArticleDto[] to frontend Article[].
 * Adds project context (projectId, sourceId, sourceName, sourceCategory).
 */
private mapFeedResultsToArticles(
  feedResults: FeedResult[],
  activeSources: { id: string; name: string; url: string; category: string }[],
  projectId: string
): Article[] {
  const articles: Article[] = [];

  for (const result of feedResults) {
    const source = activeSources.find(s => s.url === result.url);
    if (!source || result.error) continue;

    for (const dto of result.articles) {
      articles.push({
        id: crypto.randomUUID(),
        projectId,
        sourceId: source.id,
        title: dto.title,
        url: dto.link,
        summary: dto.snippet ?? '',
        publishedAt: dto.pubDate ?? new Date().toISOString(),
        sourceName: source.name,
        sourceCategory: source.category as Article['sourceCategory'],
      });
    }
  }
  return articles;
}


  // HELPERS
  private getTimeCutoff(window: TimeWindow): Date {
    const now = new Date();
    const hours: Record<TimeWindow, number> = {
      '12h': 12,
      '24h': 24,
      '48h': 48,
      '7d': 168,
      'all': 0,
    };
    return new Date(now.getTime() - hours[window] * 60 * 60 * 1000);
  }

  //Storage

  private saveToStorage(): void {
      saveToStorage(this.STORAGE_KEY, this._articles());
  }
    
  private generateMockArticles(
  projectId: string,
  sources: { id: string; name: string; category: string }[]
): Article[] {
  const templates = MOCK_ARTICLE_TEMPLATES;
  const articles: Article[] = [];
  const now = Date.now();

  sources.forEach((source) => {
    const catTemplates = templates[source.category] || templates['general'];
    const sourcesInCategory = sources.filter(s => s.category === source.category);
    const rankInCategory = sourcesInCategory.indexOf(source);
    const totalInCategory = sourcesInCategory.length;

    catTemplates
      .filter((_, i) => i % totalInCategory === rankInCategory)
      .forEach((template, index) => {
        const hoursOffsets = [1, 4, 10, 20, 36, 72, 140];
        const hoursAgo = hoursOffsets[index % hoursOffsets.length];
        articles.push({
          id: crypto.randomUUID(),
          projectId,
          sourceId: source.id,
          title: template.title,
          url: `https://example.com/article-${source.id}-${index}`,
          summary: template.summary,
          publishedAt: new Date(now - hoursAgo * 3600000).toISOString(),
          sourceName: source.name,
          sourceCategory: source.category as Article['sourceCategory'],
        });
      });
  });

  return articles;
}
}
