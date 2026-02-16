import { Component, inject, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProjectService } from '../../services/project.service';

/**
 * Workspace for a single project — shows project details and will host
 * sources, articles and AI actions in future steps.
 */
@Component({
  selector: 'app-project-workspace',
  imports: [RouterLink],
  templateUrl: './project-workspace.html',
  styleUrl: './project-workspace.scss',
})
export class ProjectWorkspace {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly projectService = inject(ProjectService);

  /** Get the project ID from the URL parameter. */
  private readonly projectId = this.route.snapshot.paramMap.get('id') ?? '';

  /** Reactive project — auto-updates if project data changes. */
  readonly project = computed(() => this.projectService.getById(this.projectId));

  /** Navigate to edit form. */
  onEdit(): void {
    this.router.navigate(['/projects', this.projectId, 'edit']);
  }

  /** Delete project and go back to list. */
  onDelete(): void {
    this.projectService.delete(this.projectId);
    this.router.navigate(['/projects']);
  }
}