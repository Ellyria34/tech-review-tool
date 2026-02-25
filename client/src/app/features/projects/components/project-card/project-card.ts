import { Component, input, output } from '@angular/core';
import type { ReviewProject } from '../../../../shared/models';
import { DatePipe } from '@angular/common';

/**
 * Displays a single project as a card with colored left border.
 * Emits events for selection and deletion — the parent decides what to do.
 */
@Component({
  selector: 'app-project-card',
  imports:[DatePipe],
  templateUrl: './project-card.html',
  styleUrl: './project-card.scss',
})
export class ProjectCard {
  /** The project to display. Required input. */
  readonly project = input.required<ReviewProject>();

  /** Emitted when the user clicks on the card. */
  readonly selected = output<ReviewProject>();

  /** Emitted when the user clicks the delete button. */
  readonly deleted = output<ReviewProject>();

  onSelect(): void {
    this.selected.emit(this.project());
  }

  onDelete(event: Event): void {
    event.stopPropagation();
    this.deleted.emit(this.project());
  }
}
