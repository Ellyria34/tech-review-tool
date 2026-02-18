import { Component, input, output } from '@angular/core';
import type {Article} from '../../../../shared/models';
import { getCategoryColor, getCategoryIcon } from '../../../../shared/data/categories';

@Component({
  selector: 'app-article-card',
  imports: [],
  templateUrl: './article-card.html',
  styleUrl: './article-card.scss',
})
export class ArticleCard {
  article = input.required<Article>();
  selected = input<boolean>(false);
  toggleSelect = output<string>();

  getCategoryColor = getCategoryColor;
  getCategoryIcon = getCategoryIcon;
  
  //Format relative time
  getRelativeTime(dateStr : string): string {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);

    if(minutes < 60 ) return `il y a ${minutes}min`;
    if(hours < 24 ) return `il y a ${hours}h`;
    if(days < 7 ) return `il y a ${days}j`;
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day : 'numeric',
      month : 'short',
    });
  }

  onToggle(): void {
    this.toggleSelect.emit(this.article().id);
  }

  onOpenArticle(event: Event): void {
    event.stopPropagation();
    window.open(this.article().url, '_blank', 'noopener,noreferrer');
  }
}
