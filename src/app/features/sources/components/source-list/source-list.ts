import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SourceService } from '../../services/source.service';
import { Source } from '../../../../shared/models';
import { SourceCard } from '../source-card/source-card';

@Component({
  selector: 'app-source-list',
  imports: [RouterLink, SourceCard],
  templateUrl: './source-list.html',
  styleUrl: './source-list.scss',
})
export class SourceList {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject (Router);
  private readonly sourceService = inject(SourceService);

  // Project ID from the URL (/projects/:id/sources)
  readonly projectId = this.route.snapshot.paramMap.get('id') || '';

  // Sources for this project (reactive — auto-updates when data changes)
  readonly sources = this.sourceService.getByProject(this.projectId);

  // Counts for the header
  readonly activeCount = this.sourceService.countActiveByProject(this.projectId);
  readonly totalCount = computed(() => this.sources().length);

  // Toggle a source on/off
  onToggle(source: Source): void {
    this.sourceService.toggleActive(source.id);
  }

  // Navigate to edit form.
  onEdit(source: Source): void {
    this.router.navigate([
      '/projects', this.projectId, 'sources', source.id, 'edit',
    ]);
  }

  //Delete a source after confirmation.
  onDelete(source: Source): void {
    const confirmed = window.confirm(
      `Supprimer la source "${source.name}" ?`
    );
    if (confirmed) {
      this.sourceService.delete(source.id);
    }
  }
}
