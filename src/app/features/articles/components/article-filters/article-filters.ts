import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ArticleService } from '../../services/article.service';
import { SourceService } from '../../../sources/services/source.service';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { TIME_WINDOW_OPTIONS, TimeWindow } from '../../../../shared/models';

/**
 * Filter bar for the article list.
 * Uses RxJS debounce on keyword input to avoid
 * recalculating filters on every keystroke.
 */
@Component({
  selector: 'app-article-filters',
  imports: [ReactiveFormsModule],
  templateUrl: './article-filters.html',
  styleUrl: './article-filters.scss',
})
export class ArticleFiltersComponent implements OnInit, OnDestroy {
  private readonly articleService = inject(ArticleService);
  private readonly sourceService = inject(SourceService);
  private readonly destroy$ = new Subject<void>();

  readonly timeWindows = TIME_WINDOW_OPTIONS;

  readonly sources = this.sourceService.getByProject(
    this.articleService.currentProjectId()?? ''
  );

  readonly filters = this.articleService.filters;

  readonly filteredCount = this.articleService.filteredCount;
  readonly totalCount = this.articleService.totalCount;

  keywordControl = new FormControl('');

  ngOnInit(): void {
    this.keywordControl.setValue(this.filters().keywords, {
      emitEvent : false,
    });
    this.keywordControl.valueChanges.pipe (
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    )
    .subscribe((value) => {
      this.articleService.updateFilters({ keywords : value ?? ''});
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onTimeWindowChange(event : Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.articleService.updateFilters({
    timeWindow: value as TimeWindow,
    });
  }

  onSourceChange(event : Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.articleService.updateFilters({
      sourceId: value || null,
    });
  }

  onReset(): void {
    this.keywordControl.setValue('', { emitEvent : false});
    this.articleService.resetFilters();
  }

}
