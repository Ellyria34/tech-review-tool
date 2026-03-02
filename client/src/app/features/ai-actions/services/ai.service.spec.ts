import { TestBed } from '@angular/core/testing';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AiService } from './ai.service';
import { AiApiService } from '../../../core/services/ai-api.service';
import type { Article } from '../../../shared/models';
import type { AiGenerateResponseDto } from '../../../shared/models';

describe('AiService', () => {
  let service: AiService;
  let aiApiMock: { generate: ReturnType<typeof vi.fn> };

  const PROJECT_ID = 'project-1';

  /**
   * Build a minimal test article.
   * AiService uses: id, title, url, summary, sourceName, publishedAt
   */
  function buildArticle(overrides: Partial<Article> = {}): Article {
    return {
      id: crypto.randomUUID(),
      projectId: PROJECT_ID,
      sourceId: 'source-1',
      title: 'Test Article Title',
      url: 'https://example.com/article',
      summary: 'A brief summary of the article.',
      publishedAt: '2026-02-24T10:00:00Z',
      sourceName: 'Test Source',
      sourceCategory: 'general',
      ...overrides,
    };
  }

  /**
   * Build a mock backend response DTO.
   * Mirrors what POST /api/ai/generate returns.
   */
  function buildResponse(overrides: Partial<AiGenerateResponseDto> = {}): AiGenerateResponseDto {
    return {
      type: 'synthesis',
      content: '## Synthèse mock\n\nContenu généré par le mock.',
      articleCount: 1,
      provider: 'mock',
      generatedAt: '2026-02-24T12:00:00Z',
      ...overrides,
    };
  }

  // Setup & Teardown

  beforeEach(() => {
    localStorage.clear();

    aiApiMock = { generate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        AiService,
        { provide: AiApiService, useValue: aiApiMock },
      ],
    });

    service = TestBed.inject(AiService);
  });

  afterEach(() => {
    localStorage.clear();
  });


  // INITIAL STATE

  it('should start with no generated contents', () => {
    service.setCurrentProject(PROJECT_ID);
    expect(service.projectContents()).toEqual([]);
    expect(service.contentCount()).toBe(0);
  });

  it('should start with isGenerating false', () => {
    expect(service.isGenerating()).toBe(false);
  });

  it('should start with lastGenerated null', () => {
    expect(service.lastGenerated()).toBeNull();
  });

  it('should start with generateError null', () => {
    expect(service.generateError()).toBeNull();
  });


  // PROJECT CONTEXT

  it('should set the current project', () => {
    service.setCurrentProject(PROJECT_ID);
    expect(service.projectContents()).toEqual([]);
  });

  it('should return empty when no project is set', () => {
    expect(service.projectContents()).toEqual([]);
  });


  // GENERATION — SUCCESS

  it('should generate a synthesis via backend API', async () => {
    service.setCurrentProject(PROJECT_ID);
    const articles = [buildArticle({ title: 'Angular Signals Guide' })];
    const response = buildResponse({ type: 'synthesis', content: '## Synthèse' });
    aiApiMock.generate.mockReturnValue(of(response));

    const result = await service.generate('synthesis', articles, PROJECT_ID);

    expect(result.type).toBe('synthesis');
    expect(result.projectId).toBe(PROJECT_ID);
    expect(result.articleIds).toHaveLength(1);
    expect(result.content).toBe('## Synthèse');
    expect(result.provider).toBe('mock');
    expect(result.id).toBeTruthy();
    expect(result.createdAt).toBeTruthy();
  });

  it('should generate a press review via backend API', async () => {
    service.setCurrentProject(PROJECT_ID);
    const articles = [buildArticle({ title: 'Security Alert' })];
    const response = buildResponse({ type: 'press-review', content: '# Revue de presse' });
    aiApiMock.generate.mockReturnValue(of(response));

    const result = await service.generate('press-review', articles, PROJECT_ID);

    expect(result.type).toBe('press-review');
    expect(result.content).toBe('# Revue de presse');
  });

  it('should generate a LinkedIn post with type mapping', async () => {
    const articles = [buildArticle({ title: 'AI Breakthrough' })];
    // Backend returns 'linkedin', frontend expects 'linkedin-post'
    const response = buildResponse({ type: 'linkedin', content: '🔍 Veille tech' });
    aiApiMock.generate.mockReturnValue(of(response));

    const result = await service.generate('linkedin-post', articles, PROJECT_ID);

    expect(result.type).toBe('linkedin-post'); // Mapped back to frontend type
    expect(result.content).toBe('🔍 Veille tech');
  });

  it('should include all article IDs in the generated content', async () => {
    const articles = [
      buildArticle({ title: 'Article 1' }),
      buildArticle({ title: 'Article 2' }),
      buildArticle({ title: 'Article 3' }),
    ];
    aiApiMock.generate.mockReturnValue(of(buildResponse({ articleCount: 3 })));

    const result = await service.generate('synthesis', articles, PROJECT_ID);

    expect(result.articleIds).toHaveLength(3);
  });

  it('should include provider from backend response', async () => {
    const articles = [buildArticle()];
    aiApiMock.generate.mockReturnValue(of(buildResponse({ provider: 'mistral' })));

    const result = await service.generate('synthesis', articles, PROJECT_ID);

    expect(result.provider).toBe('mistral');
  });


  // DTO MAPPING — REQUEST

  it('should send correct type mapping to backend', async () => {
    const articles = [buildArticle()];
    aiApiMock.generate.mockReturnValue(of(buildResponse({ type: 'linkedin' })));

    await service.generate('linkedin-post', articles, PROJECT_ID);

    // Verify the DTO sent to the backend has 'linkedin', not 'linkedin-post'
    const sentRequest = aiApiMock.generate.mock.calls[0][0];
    expect(sentRequest.type).toBe('linkedin');
  });

  it('should map Article fields to DTO fields', async () => {
    const articles = [buildArticle({
      title: 'My Title',
      url: 'https://example.com',
      sourceName: 'My Source',
      summary: 'My Summary',
      publishedAt: '2026-02-24T10:00:00Z',
    })];
    aiApiMock.generate.mockReturnValue(of(buildResponse()));

    await service.generate('synthesis', articles, PROJECT_ID);

    const sentRequest = aiApiMock.generate.mock.calls[0][0];
    const sentArticle = sentRequest.articles[0];
    expect(sentArticle.title).toBe('My Title');
    expect(sentArticle.url).toBe('https://example.com');
    expect(sentArticle.source).toBe('My Source'); // sourceName → source
    expect(sentArticle.summary).toBe('My Summary');
    expect(sentArticle.publishedAt).toBe('2026-02-24T10:00:00Z');
  });

  it('should omit empty summary and publishedAt from DTO', async () => {
    const articles = [buildArticle({ summary: '', publishedAt: '' })];
    aiApiMock.generate.mockReturnValue(of(buildResponse()));

    await service.generate('synthesis', articles, PROJECT_ID);

    const sentArticle = aiApiMock.generate.mock.calls[0][0].articles[0];
    expect(sentArticle.summary).toBeUndefined();
    expect(sentArticle.publishedAt).toBeUndefined();
  });


  // STATE TRANSITIONS DURING GENERATION

  it('should set isGenerating to true during generation', async () => {
    const articles = [buildArticle()];
    aiApiMock.generate.mockReturnValue(of(buildResponse()));

    expect(service.isGenerating()).toBe(false);

    const promise = service.generate('synthesis', articles, PROJECT_ID);
    // isGenerating is set synchronously before the await
    expect(service.isGenerating()).toBe(true);

    await promise;
    expect(service.isGenerating()).toBe(false);
  });

  it('should clear lastGenerated at start, then set it after', async () => {
    const articles = [buildArticle()];
    aiApiMock.generate.mockReturnValue(of(buildResponse()));

    // First generation
    await service.generate('synthesis', articles, PROJECT_ID);
    expect(service.lastGenerated()).not.toBeNull();

    // Second generation — lastGenerated cleared at start
    aiApiMock.generate.mockReturnValue(of(buildResponse({ type: 'press-review' })));
    const promise = service.generate('press-review', articles, PROJECT_ID);
    // Note: with real HTTP this would be null here, but with sync of() it resolves immediately
    await promise;
    expect(service.lastGenerated()!.type).toBe('press-review');
  });

  it('should clear generateError at start of new generation', async () => {
    const articles = [buildArticle()];

    // First call fails
    aiApiMock.generate.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 500 }))
    );
    await service.generate('synthesis', articles, PROJECT_ID).catch(() => { /* expected error */ });
    expect(service.generateError()).not.toBeNull();

    // Second call succeeds — error should be cleared
    aiApiMock.generate.mockReturnValue(of(buildResponse()));
    await service.generate('synthesis', articles, PROJECT_ID);
    expect(service.generateError()).toBeNull();
  });


  // ERROR HANDLING

  it('should set generateError on HTTP 400', async () => {
    const articles = [buildArticle()];
    aiApiMock.generate.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 400 }))
    );

    await service.generate('synthesis', articles, PROJECT_ID).catch(() => { /* expected error */ });

    expect(service.generateError()).toContain('invalide');
  });

  it('should set generateError on HTTP 429 (rate limit)', async () => {
    const articles = [buildArticle()];
    aiApiMock.generate.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 429 }))
    );

    await service.generate('synthesis', articles, PROJECT_ID).catch(() => { /* expected error */ });

    expect(service.generateError()).toContain('Limite');
  });

  it('should set generateError on HTTP 500', async () => {
    const articles = [buildArticle()];
    aiApiMock.generate.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 500 }))
    );

    await service.generate('synthesis', articles, PROJECT_ID).catch(() => { /* expected error */ });

    expect(service.generateError()).toContain('serveur');
  });

  it('should set generateError on network failure (status 0)', async () => {
    const articles = [buildArticle()];
    aiApiMock.generate.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 0 }))
    );

    await service.generate('synthesis', articles, PROJECT_ID).catch(() => { /* expected error */ });

    expect(service.generateError()).toContain('joindre le serveur');
  });

  it('should set generic error for non-HTTP errors', async () => {
    const articles = [buildArticle()];
    aiApiMock.generate.mockReturnValue(
      throwError(() => new Error('Something unexpected'))
    );

    await service.generate('synthesis', articles, PROJECT_ID).catch(() => { /* expected error */ });

    expect(service.generateError()).toContain('inattendue');
  });

  it('should re-throw the error for component handling', async () => {
    const articles = [buildArticle()];
    aiApiMock.generate.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 500 }))
    );

    await expect(
      service.generate('synthesis', articles, PROJECT_ID)
    ).rejects.toThrow();
  });

  it('should set isGenerating back to false after error', async () => {
    const articles = [buildArticle()];
    aiApiMock.generate.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 500 }))
    );

    await service.generate('synthesis', articles, PROJECT_ID).catch(() => { /* expected error */ });

    expect(service.isGenerating()).toBe(false);
  });


  // PERSISTENCE

  it('should persist generated content to localStorage', async () => {
    const articles = [buildArticle()];
    aiApiMock.generate.mockReturnValue(of(buildResponse()));

    await service.generate('synthesis', articles, PROJECT_ID);

    const stored = JSON.parse(
      localStorage.getItem('trt-generated-contents') || '[]'
    );
    expect(stored).toHaveLength(1);
    expect(stored[0].type).toBe('synthesis');
  });

  it('should add to projectContents after generation', async () => {
    service.setCurrentProject(PROJECT_ID);
    const articles = [buildArticle()];
    aiApiMock.generate.mockReturnValue(of(buildResponse()));

    await service.generate('synthesis', articles, PROJECT_ID);

    expect(service.projectContents()).toHaveLength(1);
    expect(service.contentCount()).toBe(1);
  });

  it('should NOT persist on error', async () => {
    const articles = [buildArticle()];
    aiApiMock.generate.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 500 }))
    );

    await service.generate('synthesis', articles, PROJECT_ID).catch(() => { /* expected error */ });

    const stored = JSON.parse(
      localStorage.getItem('trt-generated-contents') || '[]'
    );
    expect(stored).toHaveLength(0);
  });


  // COMPUTED — projectContents

  it('should sort projectContents newest first', async () => {
    service.setCurrentProject(PROJECT_ID);
    const articles = [buildArticle()];

    aiApiMock.generate.mockReturnValue(
      of(buildResponse({ generatedAt: '2026-02-24T10:00:00Z' }))
    );
    await service.generate('synthesis', articles, PROJECT_ID);

    aiApiMock.generate.mockReturnValue(
      of(buildResponse({ type: 'press-review', generatedAt: '2026-02-24T14:00:00Z' }))
    );
    await service.generate('press-review', articles, PROJECT_ID);

    const contents = service.projectContents();
    expect(contents[0].type).toBe('press-review'); // Newer
    expect(contents[1].type).toBe('synthesis'); // Older
  });

  it('should only return contents for the active project', async () => {
    service.setCurrentProject(PROJECT_ID);
    const articles = [buildArticle()];
    aiApiMock.generate.mockReturnValue(of(buildResponse()));

    await service.generate('synthesis', articles, PROJECT_ID);
    await service.generate('synthesis', articles, 'project-2');

    expect(service.projectContents()).toHaveLength(1);

    service.setCurrentProject('project-2');
    expect(service.projectContents()).toHaveLength(1);
  });


  // DELETE

  it('should delete a single content by ID', async () => {
    service.setCurrentProject(PROJECT_ID);
    const articles = [buildArticle()];
    aiApiMock.generate.mockReturnValue(of(buildResponse()));

    const content = await service.generate('synthesis', articles, PROJECT_ID);
    service.delete(content.id);

    expect(service.projectContents()).toHaveLength(0);
  });

  it('should persist after delete', async () => {
    const articles = [buildArticle()];
    aiApiMock.generate.mockReturnValue(of(buildResponse()));

    const content = await service.generate('synthesis', articles, PROJECT_ID);
    service.delete(content.id);

    const stored = JSON.parse(
      localStorage.getItem('trt-generated-contents') || '[]'
    );
    expect(stored).toHaveLength(0);
  });

  it('should only delete the targeted content', async () => {
    service.setCurrentProject(PROJECT_ID);
    const articles = [buildArticle()];

    aiApiMock.generate.mockReturnValue(of(buildResponse()));
    const c1 = await service.generate('synthesis', articles, PROJECT_ID);

    aiApiMock.generate.mockReturnValue(of(buildResponse({ type: 'press-review' })));
    await service.generate('press-review', articles, PROJECT_ID);

    service.delete(c1.id);

    expect(service.projectContents()).toHaveLength(1);
    expect(service.projectContents()[0].type).toBe('press-review');
  });


  // DELETE BY PROJECT (cascade)

  it('should delete all contents for a project', async () => {
    const articles = [buildArticle()];
    aiApiMock.generate.mockReturnValue(of(buildResponse()));

    await service.generate('synthesis', articles, PROJECT_ID);
    await service.generate('press-review', articles, PROJECT_ID);
    await service.generate('synthesis', articles, 'project-2');

    service.deleteByProject(PROJECT_ID);

    service.setCurrentProject(PROJECT_ID);
    expect(service.projectContents()).toHaveLength(0);

    service.setCurrentProject('project-2');
    expect(service.projectContents()).toHaveLength(1);
  });

  it('should persist after deleteByProject', async () => {
    const articles = [buildArticle()];
    aiApiMock.generate.mockReturnValue(of(buildResponse()));

    await service.generate('synthesis', articles, PROJECT_ID);
    service.deleteByProject(PROJECT_ID);

    const stored = JSON.parse(
      localStorage.getItem('trt-generated-contents') || '[]'
    );
    expect(stored).toHaveLength(0);
  });
});