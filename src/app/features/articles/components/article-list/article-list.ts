import { Component, inject, OnInit } from '@angular/core';
import { ArticleService } from '../../services/article.service';
import { ArticleCard } from "../article-card/article-card";
import { ArticleFiltersComponent } from "../article-filters/article-filters";
import { ActivatedRoute, RouterLink } from '@angular/router';

/**
 * Container (smart) component for the article list page.
 *
 * Reads the project ID from the route, sets up the service context,
 * and composes child components (filters, cards, selection bar).
 */
@Component({
  selector: 'app-article-list',
  imports: [ArticleCard, ArticleFiltersComponent, RouterLink],
  templateUrl: './article-list.html',
  styleUrl: './article-list.scss',
})
export class ArticleListComponent implements OnInit{
private readonly route = inject(ActivatedRoute);
  private readonly articleService = inject(ArticleService);

  projectId = '';

  readonly articles = this.articleService.filteredArticles;
  readonly filteredCount = this.articleService.filteredCount;
  readonly totalCount = this.articleService.totalCount;
  readonly selectedCount = this.articleService.selectedCount;

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id') ?? '';
    this.articleService.setCurrentProject(this.projectId);

    // Load mock articles if none exist for this project
    if (this.articleService.totalCount() === 0) {
      this.articleService.loadMockArticles(this.projectId);
    }
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

  onRefresh(): void {
    this.articleService.removeByProject(this.projectId);
    this.articleService.loadMockArticles(this.projectId);
  }
}
