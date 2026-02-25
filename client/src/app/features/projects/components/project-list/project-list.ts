import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { ProjectCard } from '../project-card/project-card';
import type { ReviewProject } from '../../../../shared/models';

/**
 * Displays the list of all projects — the app's home screen.
 * Uses ProjectService as single source of truth.
 */
@Component({
  selector: 'app-project-list',
  imports: [ProjectCard],
  templateUrl: './project-list.html',
  styleUrl: './project-list.scss',
})
export class ProjectList {
  private readonly router = inject(Router);
  private readonly projectService = inject(ProjectService);

  /** Reactive list of projects — auto-updates when service changes. */
  readonly projects = this.projectService.projects;

  onProjectSelected(project: ReviewProject): void {
      this.router.navigate(['/projects', project.id]);
    }

  onProjectDeleted(project: ReviewProject): void {
    this.projectService.delete(project.id);
  }

  navigateToCreate(): void {
    this.router.navigate(['/projects/new']);
  }
}
