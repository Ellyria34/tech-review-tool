import { Component, inject, OnInit, signal } from '@angular/core';
import { ArticleService } from '../../services/article.service';
import { ArticleCard } from "../article-card/article-card";
import { ArticleFiltersComponent } from "../article-filters/article-filters";
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AiActionPanelComponent } from '../../../ai-actions/components/ai-action-panel/ai-action-panel';
import { AiService } from '../../../ai-actions/services/ai.service';

/**
 * Container (smart) component for the article list page.
 *
 * Reads the project ID from the route, sets up the service context,
 * and composes child components (filters, cards, selection bar).
 */
@Component({
  selector: 'app-article-list',
  imports: [ArticleCard, ArticleFiltersComponent, AiActionPanelComponent, RouterLink],
  templateUrl: './article-list.html',
  styleUrl: './article-list.scss',
})
export class ArticleListComponent implements OnInit{
  private readonly route = inject(ActivatedRoute);
  private readonly articleService = inject(ArticleService);
  private readonly aiService = inject(AiService);
  
  isPanelOpen = signal(false);
  projectId = '';
  
  readonly articles = this.articleService.filteredArticles;
  readonly filteredCount = this.articleService.filteredCount;
  readonly totalCount = this.articleService.totalCount;
  readonly selectedCount = this.articleService.selectedCount;
  readonly selectedArticles = this.articleService.selectedArticles;
  readonly isLoading = this.articleService.isLoading;
  readonly fetchError = this.articleService.fetchError;
  
  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id') ?? '';
    this.articleService.setCurrentProject(this.projectId);
    this.aiService.setCurrentProject(this.projectId);

    // Fetch real articles from backend
    this.loadArticles();
  }

  isSelected(articleId: string): boolean {
    return this.articleService.isSelected(articleId);
  }

  onToggleSelect(articleId: string): void {
    this.articleService.toggleSelection(articleId);
  }

  onSelectAll(): void {
    this.articleService.selectAll();
  }

  onClearSelection(): void {
    this.articleService.clearSelection();
  }


  async onRefresh(): Promise<void> {
    this.articleService.resetFilters();
    this.articleService.clearSelection();
    await this.loadArticles();
  }

  openAiPanel(): void {
    this.isPanelOpen.set(true);
  }

  closeAiPanel(): void {
    this.isPanelOpen.set(false);
  }

  onContentGenerated() : void {
    this.isPanelOpen.set(false);
  }

  async loadArticles(): Promise<void> {
    await this.articleService.fetchArticlesForProject(this.projectId);
  }

}
