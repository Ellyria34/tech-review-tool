import { Component, input, output } from '@angular/core';
import {Source } from '../../../../shared/models';
import { getCategoryLabel, getCategoryColor, } from '../../../../shared/data/categories';

@Component({
  selector: 'app-source-card',
  imports: [],
  templateUrl: './source-card.html',
  styleUrl: './source-card.scss',
})
export class SourceCard {
  // Data received from parent — required means parent MUST provide it
  readonly source = input.required<Source>();
  readonly toggleActive = output<Source>();

  // Events sent to parent when user interacts
  readonly toogle = output<Source>();
  readonly edit = output<Source>();
  readonly delete = output<Source>();

  // Get display label for the category (e.g., 'cybersecurity' → 'Cybersécurité'). */
  getCategoryLabel(): string {
    return getCategoryLabel(this.source().category);
  }

  // Get hex color for the category (e.g., '#EF4444').
  getCategoryColor(): string {
    return getCategoryColor(this.source().category);
  }

}
