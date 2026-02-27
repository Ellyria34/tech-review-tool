import { TestBed } from '@angular/core/testing';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { of } from 'rxjs';
import { ArticleService } from './article.service';
import { SourceService } from '../../sources/services/source.service';
import { RssApiService } from '../../../core/services/rss-api.service';
import type { Article, FeedResult } from '../../../shared/models';

describe('ArticleService', () => {
  let service: ArticleService;

  // Test data factory
  const PROJECT_ID = 'project-1';
  const SOURCE_A_ID = 'source-a';
  const SOURCE_B_ID = 'source-b';

  /**
   * Build a test article with sensible defaults.
   * Override any field via the partial parameter.
   */
  function buildArticle(overrides: Partial<Article> = {}): Article {
    return {
      id: crypto.randomUUID(),
      projectId: PROJECT_ID,
      sourceId: SOURCE_A_ID,
      title: 'Default Test Article',
      url: `https://example.com/article-${crypto.randomUUID()}`,
      summary: 'A default summary for testing purposes.',
      publishedAt: new Date().toISOString(),
      sourceName: 'Source A',
      sourceCategory: 'general',
      ...overrides,
    };
  }

  // Setup & Teardown
  beforeEach(() => {
  localStorage.clear();

  TestBed.configureTestingModule({
    providers: [
      ArticleService,
      { provide: SourceService, useValue: { getByProject: () => () => [] } },
      { provide: RssApiService, useValue: { fetchMultipleFeeds: vi.fn() } },
    ],
  });

    service = TestBed.inject(ArticleService);
  });

  afterEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  // Initial state
  it('should start with no articles and default filters', () => {
    expect(service.projectArticles()).toEqual([]);
    expect(service.filteredArticles()).toEqual([]);
    expect(service.filters().keywords).toBe('');
    expect(service.filters().timeWindow).toBe('24h');
    expect(service.filters().sourceId).toBeNull();
  });

  it('should start with no selection', () => {
    expect(service.selectedCount()).toBe(0);
    expect(service.selectedArticles()).toEqual([]);
  });


  // PROJECT CONTEXT
  it('should set the current project', () => {
    service.setCurrentProject(PROJECT_ID);
    expect(service.currentProjectId()).toBe(PROJECT_ID);
  });

  it('should reset filters when switching projects', () => {
    service.setCurrentProject(PROJECT_ID);
    service.updateFilters({ keywords: 'angular' });

    service.setCurrentProject('project-2');

    expect(service.filters().keywords).toBe('');
    expect(service.filters().timeWindow).toBe('24h');
  });

  it('should clear selection when switching projects', () => {
    service.setCurrentProject(PROJECT_ID);
    const article = buildArticle();
    service.addArticles([article]);
    service.toggleSelection(article.id);
    expect(service.selectedCount()).toBe(1);

    service.setCurrentProject('project-2');

    expect(service.selectedCount()).toBe(0);
  });

  it('should not reset if setting the same project again', () => {
    service.setCurrentProject(PROJECT_ID);
    service.updateFilters({ keywords: 'keep me' });

    service.setCurrentProject(PROJECT_ID); // Same project

    expect(service.filters().keywords).toBe('keep me');
  });


  // ADD ARTICLES + DEDUPLICATION
  it('should add articles to the collection', () => {
    service.setCurrentProject(PROJECT_ID);
    const articles = [buildArticle(), buildArticle()];

    service.addArticles(articles);

    expect(service.projectArticles()).toHaveLength(2);
  });

  it('should deduplicate by projectId + URL', () => {
    service.setCurrentProject(PROJECT_ID);
    const article = buildArticle({ url: 'https://example.com/same-url' });

    service.addArticles([article]);
    service.addArticles([{ ...article, id: 'different-id' }]); // Same URL

    expect(service.projectArticles()).toHaveLength(1);
  });

  it('should allow same URL in different projects', () => {
    const url = 'https://example.com/shared-article';
    const a1 = buildArticle({ projectId: 'project-1', url });
    const a2 = buildArticle({ projectId: 'project-2', url });

    service.addArticles([a1, a2]);

    service.setCurrentProject('project-1');
    expect(service.projectArticles()).toHaveLength(1);

    service.setCurrentProject('project-2');
    expect(service.projectArticles()).toHaveLength(1);
  });

  it('should persist to localStorage after adding articles', () => {
    service.addArticles([buildArticle()]);

    const stored = JSON.parse(localStorage.getItem('trt-articles') || '[]');
    expect(stored).toHaveLength(1);
  });


  // COMPUTED: projectArticles (filter by project)
  it('should only return articles for the active project', () => {
    const a1 = buildArticle({ projectId: 'project-1' });
    const a2 = buildArticle({ projectId: 'project-2' });
    service.addArticles([a1, a2]);

    service.setCurrentProject('project-1');

    expect(service.projectArticles()).toHaveLength(1);
    expect(service.projectArticles()[0].projectId).toBe('project-1');
  });

  it('should return empty array when no project is set', () => {
    service.addArticles([buildArticle()]);

    // No setCurrentProject called
    expect(service.projectArticles()).toEqual([]);
  });


  // FILTERS
  // Keyword filter
  it('should filter by single keyword in title', () => {
    service.setCurrentProject(PROJECT_ID);
    // timeWindow 'all' to avoid time-based filtering
    service.updateFilters({ timeWindow: 'all' });

    service.addArticles([
      buildArticle({ title: 'Angular 21 released' }),
      buildArticle({ title: 'React 20 news' }),
      buildArticle({ title: 'Vue 4 update' }),
    ]);

    service.updateFilters({ keywords: 'angular', timeWindow: 'all' });

    expect(service.filteredArticles()).toHaveLength(1);
    expect(service.filteredArticles()[0].title).toContain('Angular');
  });

  it('should filter by keyword in summary', () => {
    service.setCurrentProject(PROJECT_ID);
    service.addArticles([
      buildArticle({ title: 'News', summary: 'A critical ransomware attack' }),
      buildArticle({ title: 'Other', summary: 'Nothing relevant here' }),
    ]);

    service.updateFilters({ keywords: 'ransomware', timeWindow: 'all' });

    expect(service.filteredArticles()).toHaveLength(1);
  });

  it('should use AND logic for multiple keywords', () => {
    service.setCurrentProject(PROJECT_ID);
    service.addArticles([
      buildArticle({ title: 'Angular 21 signals tutorial' }),
      buildArticle({ title: 'Angular 21 routing guide' }),
      buildArticle({ title: 'React hooks tutorial' }),
    ]);

    service.updateFilters({ keywords: 'angular tutorial', timeWindow: 'all' });

    // Only the article with BOTH "angular" AND "tutorial"
    expect(service.filteredArticles()).toHaveLength(1);
    expect(service.filteredArticles()[0].title).toContain('signals');
  });

  it('should be case-insensitive', () => {
    service.setCurrentProject(PROJECT_ID);
    service.addArticles([
      buildArticle({ title: 'ANGULAR Signals' }),
    ]);

    service.updateFilters({ keywords: 'angular signals', timeWindow: 'all' });

    expect(service.filteredArticles()).toHaveLength(1);
  });

  it('should ignore extra whitespace in keywords', () => {
    service.setCurrentProject(PROJECT_ID);
    service.addArticles([
      buildArticle({ title: 'Angular testing' }),
    ]);

    service.updateFilters({ keywords: '  angular   testing  ', timeWindow: 'all' });

    expect(service.filteredArticles()).toHaveLength(1);
  });

  // Time window filter
  it('should filter by 24h time window', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-24T12:00:00Z'));

    service.setCurrentProject(PROJECT_ID);
    service.addArticles([
      buildArticle({ publishedAt: '2026-02-24T10:00:00Z' }), // 2h ago ✅
      buildArticle({ publishedAt: '2026-02-23T08:00:00Z' }), // 28h ago ❌
    ]);

    service.updateFilters({ timeWindow: '24h' });

    expect(service.filteredArticles()).toHaveLength(1);
  });

  it('should filter by 12h time window', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-24T12:00:00Z'));

    service.setCurrentProject(PROJECT_ID);
    service.addArticles([
      buildArticle({ publishedAt: '2026-02-24T06:00:00Z' }), // 6h ago ✅
      buildArticle({ publishedAt: '2026-02-23T22:00:00Z' }), // 14h ago ❌
    ]);

    service.updateFilters({ timeWindow: '12h' });

    expect(service.filteredArticles()).toHaveLength(1);
  });

  it('should return all articles with "all" time window', () => {
    service.setCurrentProject(PROJECT_ID);
    service.addArticles([
      buildArticle({ publishedAt: '2025-01-01T00:00:00Z' }), // Very old
      buildArticle({ publishedAt: new Date().toISOString() }), // Just now
    ]);

    service.updateFilters({ timeWindow: 'all' });

    expect(service.filteredArticles()).toHaveLength(2);
  });

  // Source filter
  it('should filter by source ID', () => {
    service.setCurrentProject(PROJECT_ID);
    service.addArticles([
      buildArticle({ sourceId: SOURCE_A_ID }),
      buildArticle({ sourceId: SOURCE_B_ID }),
    ]);

    service.updateFilters({ sourceId: SOURCE_A_ID, timeWindow: 'all' });

    expect(service.filteredArticles()).toHaveLength(1);
    expect(service.filteredArticles()[0].sourceId).toBe(SOURCE_A_ID);
  });

  it('should return all sources when sourceId is null', () => {
    service.setCurrentProject(PROJECT_ID);
    service.addArticles([
      buildArticle({ sourceId: SOURCE_A_ID }),
      buildArticle({ sourceId: SOURCE_B_ID }),
    ]);

    service.updateFilters({ sourceId: null, timeWindow: 'all' });

    expect(service.filteredArticles()).toHaveLength(2);
  });

  // Sort order
  it('should sort articles by date, newest first', () => {
    service.setCurrentProject(PROJECT_ID);
    service.addArticles([
      buildArticle({ title: 'Old', publishedAt: '2026-02-20T10:00:00Z' }),
      buildArticle({ title: 'New', publishedAt: '2026-02-24T10:00:00Z' }),
      buildArticle({ title: 'Mid', publishedAt: '2026-02-22T10:00:00Z' }),
    ]);

    service.updateFilters({ timeWindow: 'all' });

    const titles = service.filteredArticles().map(a => a.title);
    expect(titles).toEqual(['New', 'Mid', 'Old']);
  });

  // Combined filters
  it('should apply keyword + source filters together', () => {
    service.setCurrentProject(PROJECT_ID);
    service.addArticles([
      buildArticle({ title: 'Angular news', sourceId: SOURCE_A_ID }),
      buildArticle({ title: 'Angular update', sourceId: SOURCE_B_ID }),
      buildArticle({ title: 'React news', sourceId: SOURCE_A_ID }),
    ]);

    service.updateFilters({
      keywords: 'angular',
      sourceId: SOURCE_A_ID,
      timeWindow: 'all',
    });

    expect(service.filteredArticles()).toHaveLength(1);
    expect(service.filteredArticles()[0].title).toBe('Angular news');
  });

  // resetFilters()
  it('should reset all filters to defaults', () => {
    service.setCurrentProject(PROJECT_ID);
    service.updateFilters({ keywords: 'test', timeWindow: '7d', sourceId: SOURCE_A_ID });

    service.resetFilters();

    expect(service.filters().keywords).toBe('');
    expect(service.filters().timeWindow).toBe('24h');
    expect(service.filters().sourceId).toBeNull();
  });

  // Computed counts
  it('should compute totalCount and filteredCount correctly', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-24T12:00:00Z'));

    service.setCurrentProject(PROJECT_ID);
    service.addArticles([
      buildArticle({ publishedAt: '2026-02-24T10:00:00Z' }), // Within 24h
      buildArticle({ publishedAt: '2026-02-24T08:00:00Z' }), // Within 24h
      buildArticle({ publishedAt: '2026-02-20T10:00:00Z' }), // Outside 24h
    ]);

    service.updateFilters({ timeWindow: '24h' });

    expect(service.totalCount()).toBe(3); // All project articles
    expect(service.filteredCount()).toBe(2); // After time filter
  });


  // SELECTION
  it('should toggle selection on', () => {
    service.toggleSelection('article-1');

    expect(service.isSelected('article-1')).toBe(true);
    expect(service.selectedCount()).toBe(1);
  });

  it('should toggle selection off', () => {
    service.toggleSelection('article-1');
    service.toggleSelection('article-1'); // Toggle off

    expect(service.isSelected('article-1')).toBe(false);
    expect(service.selectedCount()).toBe(0);
  });

  it('should select multiple articles independently', () => {
    service.toggleSelection('article-1');
    service.toggleSelection('article-2');

    expect(service.isSelected('article-1')).toBe(true);
    expect(service.isSelected('article-2')).toBe(true);
    expect(service.selectedCount()).toBe(2);
  });

  it('should select all filtered articles', () => {
    service.setCurrentProject(PROJECT_ID);
    const articles = [buildArticle(), buildArticle(), buildArticle()];
    service.addArticles(articles);
    service.updateFilters({ timeWindow: 'all' });

    service.selectAll();

    expect(service.selectedCount()).toBe(3);
  });

  it('should clear all selections', () => {
    service.toggleSelection('article-1');
    service.toggleSelection('article-2');

    service.clearSelection();

    expect(service.selectedCount()).toBe(0);
  });

  it('should clear selection when filters change', () => {
    service.toggleSelection('article-1');
    expect(service.selectedCount()).toBe(1);

    service.updateFilters({ keywords: 'new search' });

    expect(service.selectedCount()).toBe(0);
  });

  it('should return selected article objects', () => {
    service.setCurrentProject(PROJECT_ID);
    const a1 = buildArticle({ title: 'Selected' });
    const a2 = buildArticle({ title: 'Not selected' });
    service.addArticles([a1, a2]);
    service.updateFilters({ timeWindow: 'all' });

    service.toggleSelection(a1.id);

    expect(service.selectedArticles()).toHaveLength(1);
    expect(service.selectedArticles()[0].title).toBe('Selected');
  });


  // REMOVE ARTICLES
  it('should remove all articles for a project', () => {
    service.addArticles([
      buildArticle({ projectId: 'project-1' }),
      buildArticle({ projectId: 'project-1' }),
      buildArticle({ projectId: 'project-2' }),
    ]);

    service.removeByProject('project-1');

    service.setCurrentProject('project-1');
    expect(service.projectArticles()).toHaveLength(0);

    service.setCurrentProject('project-2');
    expect(service.projectArticles()).toHaveLength(1);
  });

  // FETCH FROM BACKEND
  describe('fetchArticlesForProject', () => {
    const FEED_URL = 'https://example.com/feed';

    function setupWithSources(): { rssApiMock: { fetchMultipleFeeds: ReturnType<typeof vi.fn> } } {
      localStorage.clear();

      const rssApiMock = { fetchMultipleFeeds: vi.fn() };

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          ArticleService,
          {
            provide: SourceService,
            useValue: {
              getByProject: () => () => [
                { id: 'src-1', name: 'Test Source', url: FEED_URL, category: 'ai', isActive: true },
              ],
            },
          },
          { provide: RssApiService, useValue: rssApiMock },
        ],
      });

      service = TestBed.inject(ArticleService);
      return { rssApiMock };
    }

    it('should fetch and map articles from backend', async () => {
      const { rssApiMock } = setupWithSources();

      const feedResults: FeedResult[] = [
        {
          url: FEED_URL,
          articles: [
            {
              title: 'Real Article',
              link: 'https://example.com/real-article',
              snippet: 'A real summary',
              pubDate: '2026-02-27T10:00:00Z',
              author: 'Author',
              source: 'Test Feed',
            },
          ],
        },
      ];
      rssApiMock.fetchMultipleFeeds.mockReturnValue(of(feedResults));

      service.setCurrentProject(PROJECT_ID);
      await service.fetchArticlesForProject(PROJECT_ID);

      service.updateFilters({ timeWindow: 'all' });

      expect(service.projectArticles()).toHaveLength(1);
      expect(service.projectArticles()[0].title).toBe('Real Article');
      expect(service.projectArticles()[0].url).toBe('https://example.com/real-article');
      expect(service.projectArticles()[0].summary).toBe('A real summary');
      expect(service.projectArticles()[0].sourceId).toBe('src-1');
      expect(service.projectArticles()[0].sourceName).toBe('Test Source');
    });

    it('should report partial failures without losing successful results', async () => {
      localStorage.clear();

      const rssApiMock = { fetchMultipleFeeds: vi.fn() };

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          ArticleService,
          {
            provide: SourceService,
            useValue: {
              getByProject: () => () => [
                { id: 'src-1', name: 'Good Source', url: 'https://good.com/feed', category: 'ai', isActive: true },
                { id: 'src-2', name: 'Bad Source', url: 'https://bad.com/feed', category: 'ai', isActive: true },
              ],
            },
          },
          { provide: RssApiService, useValue: rssApiMock },
        ],
      });

      service = TestBed.inject(ArticleService);

      const feedResults: FeedResult[] = [
        {
          url: 'https://good.com/feed',
          articles: [
            { title: 'Good Article', link: 'https://good.com/1', snippet: '', pubDate: '2026-02-27T10:00:00Z', author: undefined, source: 'Good' },
          ],
        },
        {
          url: 'https://bad.com/feed',
          articles: [],
          error: 'Connection refused',
        },
      ];
      rssApiMock.fetchMultipleFeeds.mockReturnValue(of(feedResults));

      service.setCurrentProject(PROJECT_ID);
      await service.fetchArticlesForProject(PROJECT_ID);

      service.updateFilters({ timeWindow: 'all' });

      // Good source articles are present
      expect(service.projectArticles()).toHaveLength(1);
      expect(service.projectArticles()[0].title).toBe('Good Article');

      // Error is reported
      expect(service.fetchError()).toBe('1/2 source(s) failed to load');
    });

    it('should set isLoading during fetch', async () => {
      const { rssApiMock } = setupWithSources();

      rssApiMock.fetchMultipleFeeds.mockReturnValue(of([]));

      expect(service.isLoading()).toBe(false);

      const fetchPromise = service.fetchArticlesForProject(PROJECT_ID);
      // After await, loading should be false again
      await fetchPromise;

      expect(service.isLoading()).toBe(false);
    });

    it('should clear articles when project has no active sources', async () => {
      // First add some articles
      service.setCurrentProject(PROJECT_ID);
      service.addArticles([buildArticle()]);
      service.updateFilters({ timeWindow: 'all' });
      expect(service.projectArticles()).toHaveLength(1);

      // Now fetch with default mock (no sources)
      await service.fetchArticlesForProject(PROJECT_ID);

      expect(service.projectArticles()).toHaveLength(0);
    });
  });
});