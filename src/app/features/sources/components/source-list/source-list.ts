import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SourceService } from '../../services/source.service';
import { SourceCard } from '../source-card/source-card';
import { LinkedSource } from '../../../../shared/models';

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
  onToggle(source: LinkedSource): void {
    this.sourceService.toggleActive(source.linkId);
  }

  // Navigate to edit form.
  onEdit(source: LinkedSource): void {
    this.router.navigate([
      '/projects', this.projectId, 'sources', source.id, 'edit',
    ]);
  }

  //Delete a source after confirmation.
  onDelete(source: LinkedSource): void {
  const confirmed = window.confirm(
    `Retirer la source "${source.name}" de ce projet ?\nLa source restera disponible dans le catalogue.`
  );
  if (confirmed) {
    this.sourceService.unlinkFromProject(source.linkId);
  }
}
}
