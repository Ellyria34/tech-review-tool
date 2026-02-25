import { TestBed } from '@angular/core/testing';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AiService } from './ai.service';
import type { Article } from '../../../shared/models';


describe('AiService', () => {
  let service: AiService;

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


  // Setup & Teardown

  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();

    TestBed.configureTestingModule({
      providers: [AiService],
    });

    service = TestBed.inject(AiService);
  });

  afterEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });


  // Initial state
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


  // PROJECT CONTEXT
  it('should set the current project', () => {
    service.setCurrentProject(PROJECT_ID);

    // projectContents should now filter by this project
    expect(service.projectContents()).toEqual([]);
  });

  it('should return empty when no project is set', () => {
    expect(service.projectContents()).toEqual([]);
  });


  // GENERATION
  it('should generate a synthesis', async () => {
    service.setCurrentProject(PROJECT_ID);
    const articles = [buildArticle({ title: 'Angular Signals Guide' })];

    const promise = service.generate('synthesis', articles, PROJECT_ID);
    // Advance timers to resolve the simulated delay
    await vi.advanceTimersByTimeAsync(1000);
    const result = await promise;

    expect(result.type).toBe('synthesis');
    expect(result.projectId).toBe(PROJECT_ID);
    expect(result.articleIds).toHaveLength(1);
    expect(result.content).toContain('Synthèse');
    expect(result.content).toContain('Angular Signals Guide');
    expect(result.id).toBeTruthy();
    expect(result.createdAt).toBeTruthy();
  });

  it('should generate a press review', async () => {
    service.setCurrentProject(PROJECT_ID);
    const articles = [buildArticle({ title: 'Security Alert' })];

    const promise = service.generate('press-review', articles, PROJECT_ID);
    await vi.advanceTimersByTimeAsync(1000);
    const result = await promise;

    expect(result.type).toBe('press-review');
    expect(result.content).toContain('Revue de presse');
    expect(result.content).toContain('Security Alert');
  });

  it('should generate a LinkedIn post', async () => {
    service.setCurrentProject(PROJECT_ID);
    const articles = [buildArticle({ title: 'AI Breakthrough' })];

    const promise = service.generate('linkedin-post', articles, PROJECT_ID);
    await vi.advanceTimersByTimeAsync(1000);
    const result = await promise;

    expect(result.type).toBe('linkedin-post');
    expect(result.content).toContain('Veille tech');
    expect(result.content).toContain('AI Breakthrough');
  });

  it('should include all article IDs in the generated content', async () => {
    const articles = [
      buildArticle({ title: 'Article 1' }),
      buildArticle({ title: 'Article 2' }),
      buildArticle({ title: 'Article 3' }),
    ];

    const promise = service.generate('synthesis', articles, PROJECT_ID);
    await vi.advanceTimersByTimeAsync(1000);
    const result = await promise;

    expect(result.articleIds).toHaveLength(3);
  });

  // State transitions during generation
  it('should set isGenerating to true during generation', async () => {
    const articles = [buildArticle()];
    expect(service.isGenerating()).toBe(false);

    const promise = service.generate('synthesis', articles, PROJECT_ID);

    // During generation — before timers resolve
    expect(service.isGenerating()).toBe(true);

    await vi.advanceTimersByTimeAsync(1000);
    await promise;

    // After generation
    expect(service.isGenerating()).toBe(false);
  });

  it('should clear lastGenerated at start, then set it after', async () => {
    const articles = [buildArticle()];

    // First generation
    const promise1 = service.generate('synthesis', articles, PROJECT_ID);
    await vi.advanceTimersByTimeAsync(1000);
    await promise1;
    expect(service.lastGenerated()).not.toBeNull();

    // Second generation — lastGenerated should be null during generation
    const promise2 = service.generate('press-review', articles, PROJECT_ID);
    expect(service.lastGenerated()).toBeNull(); // Cleared at start
    await vi.advanceTimersByTimeAsync(1000);
    await promise2;
    expect(service.lastGenerated()!.type).toBe('press-review');
  });


  // Persistence
  it('should persist generated content to localStorage', async () => {
    const articles = [buildArticle()];

    const promise = service.generate('synthesis', articles, PROJECT_ID);
    await vi.advanceTimersByTimeAsync(1000);
    await promise;

    const stored = JSON.parse(
      localStorage.getItem('trt-generated-contents') || '[]'
    );
    expect(stored).toHaveLength(1);
    expect(stored[0].type).toBe('synthesis');
  });

  it('should add to projectContents after generation', async () => {
    service.setCurrentProject(PROJECT_ID);
    const articles = [buildArticle()];

    const promise = service.generate('synthesis', articles, PROJECT_ID);
    await vi.advanceTimersByTimeAsync(1000);
    await promise;

    expect(service.projectContents()).toHaveLength(1);
    expect(service.contentCount()).toBe(1);
  });


  // projectContents computed
  it('should sort projectContents newest first', async () => {
    service.setCurrentProject(PROJECT_ID);
    const articles = [buildArticle()];

    // Generate two contents with different timestamps
    vi.setSystemTime(new Date('2026-02-24T10:00:00Z'));
    const p1 = service.generate('synthesis', articles, PROJECT_ID);
    await vi.advanceTimersByTimeAsync(1000);
    await p1;

    vi.setSystemTime(new Date('2026-02-24T14:00:00Z'));
    const p2 = service.generate('press-review', articles, PROJECT_ID);
    await vi.advanceTimersByTimeAsync(1000);
    await p2;

    const contents = service.projectContents();
    expect(contents[0].type).toBe('press-review'); // Newer
    expect(contents[1].type).toBe('synthesis'); // Older
  });

  it('should only return contents for the active project', async () => {
    service.setCurrentProject(PROJECT_ID);
    const articles = [buildArticle()];

    const p1 = service.generate('synthesis', articles, PROJECT_ID);
    await vi.advanceTimersByTimeAsync(1000);
    await p1;

    const p2 = service.generate('synthesis', articles, 'project-2');
    await vi.advanceTimersByTimeAsync(1000);
    await p2;

    // Only project-1 content visible
    expect(service.projectContents()).toHaveLength(1);

    // Switch to project-2
    service.setCurrentProject('project-2');
    expect(service.projectContents()).toHaveLength(1);
  });


  // DELETE
  it('should delete a single content by ID', async () => {
    service.setCurrentProject(PROJECT_ID);
    const articles = [buildArticle()];

    const promise = service.generate('synthesis', articles, PROJECT_ID);
    await vi.advanceTimersByTimeAsync(1000);
    const content = await promise;

    service.delete(content.id);

    expect(service.projectContents()).toHaveLength(0);
  });

  it('should persist after delete', async () => {
    const articles = [buildArticle()];

    const promise = service.generate('synthesis', articles, PROJECT_ID);
    await vi.advanceTimersByTimeAsync(1000);
    const content = await promise;

    service.delete(content.id);

    const stored = JSON.parse(
      localStorage.getItem('trt-generated-contents') || '[]'
    );
    expect(stored).toHaveLength(0);
  });

  it('should only delete the targeted content', async () => {
    service.setCurrentProject(PROJECT_ID);
    const articles = [buildArticle()];

    const p1 = service.generate('synthesis', articles, PROJECT_ID);
    await vi.advanceTimersByTimeAsync(1000);
    const c1 = await p1;

    const p2 = service.generate('press-review', articles, PROJECT_ID);
    await vi.advanceTimersByTimeAsync(1000);
    await p2;

    service.delete(c1.id);

    expect(service.projectContents()).toHaveLength(1);
    expect(service.projectContents()[0].type).toBe('press-review');
  });

  // deleteByProject() (cascade)
  it('should delete all contents for a project', async () => {
    const articles = [buildArticle()];

    const p1 = service.generate('synthesis', articles, PROJECT_ID);
    await vi.advanceTimersByTimeAsync(1000);
    await p1;

    const p2 = service.generate('press-review', articles, PROJECT_ID);
    await vi.advanceTimersByTimeAsync(1000);
    await p2;

    // Content from another project
    const p3 = service.generate('synthesis', articles, 'project-2');
    await vi.advanceTimersByTimeAsync(1000);
    await p3;

    service.deleteByProject(PROJECT_ID);

    // Project-1 contents gone
    service.setCurrentProject(PROJECT_ID);
    expect(service.projectContents()).toHaveLength(0);

    // Project-2 content untouched
    service.setCurrentProject('project-2');
    expect(service.projectContents()).toHaveLength(1);
  });

  it('should persist after deleteByProject', async () => {
    const articles = [buildArticle()];

    const p1 = service.generate('synthesis', articles, PROJECT_ID);
    await vi.advanceTimersByTimeAsync(1000);
    await p1;

    service.deleteByProject(PROJECT_ID);

    const stored = JSON.parse(
      localStorage.getItem('trt-generated-contents') || '[]'
    );
    expect(stored).toHaveLength(0);
  });
});