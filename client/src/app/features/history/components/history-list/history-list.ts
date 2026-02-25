import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AiService } from '../../../ai-actions/services/ai.service';
import { CONTENT_TYPE_OPTIONS } from '../../../../shared/models';
import { GeneratedContentComponent } from '../../../ai-actions/components/generated-content/generated-content';

@Component({
  selector: 'app-history-list',
  imports: [RouterLink, GeneratedContentComponent],
  templateUrl: './history-list.html',
  styleUrl: './history-list.scss',
})
export class HistoryListComponent implements OnInit{

  //Injections
  private readonly route = inject(ActivatedRoute);
  private readonly aiService = inject(AiService);

  projectId = '';

  /** All generated contents for this project, newest first. */
  readonly contents = this.aiService.projectContents;
  readonly contentCount = this.aiService.contentCount;

  /** Expose content type metadata to the template. */
  readonly contentTypeOptions = CONTENT_TYPE_OPTIONS;

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id') ?? '';
    this.aiService.setCurrentProject(this.projectId);
  }

  /** Delete a single generated content. */
  onDelete(contentId: string): void {
    this.aiService.delete(contentId);
  }
}
