import { TestBed } from '@angular/core/testing';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ArticleFiltersComponent } from './article-filters';
import { ArticleService } from '../../services/article.service';
import { SourceService } from '../../../sources/services/source.service';

// We test the LOGIC: debounce timing, reset coordination, cleanup.

describe('ArticleFiltersComponent', () => {
  let component: ArticleFiltersComponent;
  let mockArticleService: {
    filters: ReturnType<typeof vi.fn>;
    filteredCount: ReturnType<typeof vi.fn>;
    totalCount: ReturnType<typeof vi.fn>;
    currentProjectId: ReturnType<typeof vi.fn>;
    updateFilters: ReturnType<typeof vi.fn>;
    resetFilters: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();

    mockArticleService = {
      filters: vi.fn(() => ({ keywords: '', timeWindow: '24h', sourceId: null })),
      filteredCount: vi.fn(() => 0),
      totalCount: vi.fn(() => 0),
      currentProjectId: vi.fn(() => null),
      updateFilters: vi.fn(),
      resetFilters: vi.fn(),
    };

    TestBed.configureTestingModule({
      imports: [ArticleFiltersComponent],
      providers: [
        { provide: ArticleService, useValue: mockArticleService },
        {
          provide: SourceService,
          useValue: { getByProject: () => () => [] },
        },
      ],
    });

    const fixture = TestBed.createComponent(ArticleFiltersComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  afterEach(() => {
    // Trigger destroy to test cleanup
    component.ngOnDestroy();
    vi.useRealTimers();
    localStorage.clear();
  });

  // Debounce behavior

  it('should NOT call updateFilters immediately on keystroke', () => {
    component.keywordControl.setValue('angular');
    // Before debounce delay — service should NOT be called yet
    expect(mockArticleService.updateFilters).not.toHaveBeenCalled();
  });

  it('should call updateFilters after 300ms debounce', () => {
    component.keywordControl.setValue('angular');

    // After debounce delay
    vi.advanceTimersByTime(300);
    expect(mockArticleService.updateFilters).toHaveBeenCalledWith({
      keywords: 'angular',
    });
  });

  it('should only call once for rapid keystrokes (debounce resets)', () => {
    // User types "a", then "an", then "ang" quickly
    component.keywordControl.setValue('a');
    component.keywordControl.setValue('an');
    component.keywordControl.setValue('ang');
    vi.advanceTimersByTime(300);

    // Only the last value should trigger a call
    expect(mockArticleService.updateFilters).toHaveBeenCalledTimes(1);
    expect(mockArticleService.updateFilters).toHaveBeenCalledWith({
      keywords: 'ang',
    });
  });

  it('should not call updateFilters when same value is set twice (distinctUntilChanged)', () => {
    component.keywordControl.setValue('angular');
    vi.advanceTimersByTime(300);
    expect(mockArticleService.updateFilters).toHaveBeenCalledTimes(1);

    // Same value again
    mockArticleService.updateFilters.mockClear();
    component.keywordControl.setValue('angular');
    vi.advanceTimersByTime(300);

    // Still only 1 call — distinctUntilChanged blocked the duplicate
    expect(mockArticleService.updateFilters).toHaveBeenCalledTimes(1);
  });

  // Reset

  it('should reset the keyword FormControl on reset', () => {
    component.keywordControl.setValue('something');

    component.onReset();

    expect(component.keywordControl.value).toBe('');
  });

  it('should call service resetFilters on reset', () => {
    component.onReset();

    expect(mockArticleService.resetFilters).toHaveBeenCalledTimes(1);
  });

  it('should NOT trigger debounce when resetting (emitEvent: false)', () => {
    component.onReset();
    vi.advanceTimersByTime(300);

    // resetFilters was called, but NOT updateFilters
    // because setValue('', { emitEvent: false }) skips the Observable
    expect(mockArticleService.updateFilters).not.toHaveBeenCalled();
    expect(mockArticleService.resetFilters).toHaveBeenCalledTimes(1);
  });

  // Cleanup

  it('should stop listening to keyword changes after destroy', () => {
    component.ngOnDestroy();

    component.keywordControl.setValue('after destroy');
    vi.advanceTimersByTime(300);

    // No call — the subscription was killed by takeUntil(destroy$)
    expect(mockArticleService.updateFilters).not.toHaveBeenCalled();
  });
});