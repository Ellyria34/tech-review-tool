import { Component, input, output } from '@angular/core';
import { getCategoryLabel, getCategoryColor, } from '../../../../shared/data/categories';
import { LinkedSource } from '../../../../shared/models';


@Component({
  selector: 'app-source-card',
  imports: [],
  templateUrl: './source-card.html',
  styleUrl: './source-card.scss',
})
export class SourceCard {
  // Data received from parent — required means parent MUST provide it
  readonly source = input.required<LinkedSource>();
  readonly toggleActive = output<LinkedSource>();

  // Events sent to parent when user interacts
  readonly edit = output<LinkedSource>();
  readonly delete = output<LinkedSource>();

  // Get display label for the category (e.g., 'cybersecurity' → 'Cybersécurité'). */
  getCategoryLabel(): string {
    return getCategoryLabel(this.source().category);
  }

  // Get hex color for the category (e.g., '#EF4444').
  getCategoryColor(): string {
    return getCategoryColor(this.source().category);
  }

}
