import { Component, inject, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { SourceService } from '../../../sources/services/source.service';
import { ArticleService } from '../../../articles/services/article.service';
import { AiService } from '../../../ai-actions/services/ai.service';

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
export class ProjectWorkspace implements OnInit{
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly projectService = inject(ProjectService);
  private readonly sourceService = inject(SourceService);
  private readonly articleService = inject(ArticleService);
  private readonly aiService = inject(AiService);

  /** Get the project ID from the URL parameter. */
  private readonly projectId = this.route.snapshot.paramMap.get('id') ?? '';

  /** Reactive project — auto-updates if project data changes. */
  readonly project = computed(() => this.projectService.getById(this.projectId));

  /** Source count for this project (reactive). */
  readonly sourceCount = this.sourceService.countByProject(this.projectId);
  readonly activeSourceCount = this.sourceService.countActiveByProject(this.projectId);

  /** Article source for this project (reactive)*/
  readonly articleCount = this.articleService.totalCount;

  /** Generated content count for this project (reactive). */
  readonly generatedContentCount = this.aiService.contentCount;

  /** Navigate to edit form. */
  onEdit(): void {
    this.router.navigate(['/projects', this.projectId, 'edit']);
  }

  /** Delete project and go back to list. */
  onDelete(): void {
    this.projectService.delete(this.projectId);
    this.router.navigate(['/projects']);
  }

  ngOnInit(): void {
    const projectId = this.route.snapshot.paramMap.get('id') ?? '';
    this.articleService.setCurrentProject(projectId);
    this.aiService.setCurrentProject(projectId);
  }
}