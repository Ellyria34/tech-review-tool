import { Component, inject, input, output, signal } from '@angular/core';
import { Article, ContentType, GeneratedContent, CONTENT_TYPE_OPTIONS } from '../../../../shared/models';
import { AiService } from '../../services/ai.service';
import { GeneratedContentComponent } from '../generated-content/generated-content';

@Component({
  selector: 'app-ai-action-panel',
  imports: [GeneratedContentComponent],
  templateUrl: './ai-action-panel.html',
  styleUrl: './ai-action-panel.scss',
})
export class AiActionPanelComponent {

  //internal State
  selectedType = signal<ContentType>('synthesis');
  errorMessage = signal<string | null>(null);
  generatedResult = signal<GeneratedContent | null>(null);

  //Dependencies
  private aiService = inject(AiService);

  //Inputs
  articles = input.required<Article[]>();
  projectId =input.required<string>();
  projectName = input('');
  projectIcon = input('📂');
  isOpen = input.required<boolean>();

  //outputs
  closed = output<void>();
  generated = output<GeneratedContent>();

  /** Expose service loading state to the template. */
  readonly isGenerating = this.aiService.isGenerating;

  /** Expose content type metadata to the template. */
  readonly contentTypeOptions = CONTENT_TYPE_OPTIONS;

  /** Content types as iterable for @for in the template. */
  readonly contentTypes : ContentType[] = [
    'synthesis',
    'press-review',
    'linkedin-post',
  ];

  //Methods

  /** Select a content type (radio button behavior). */
  selectType(type: ContentType): void {
    console.log('selectType called with:', type);
    this.selectedType.set(type);
    this.errorMessage.set(null);
  }

  /** Close the panel. Blocked during generation to prevent data loss. */
  close(): void {
    if (this.isGenerating()) return;
    this.generatedResult.set(null);
    this.closed.emit();
  }

  /** Escape key closes the panel. */
  onKeydown(event : KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.close();
    }
  }

  /** Trigger AI content generation. */
  async onGenerate(): Promise<void> {
    if (this.isGenerating()) return;
    this.errorMessage.set(null);

    try {
      const content = await this.aiService.generate(
        this.selectedType(),
        this.articles(),
        this.projectId()
      );
      this.generatedResult.set(content);
      this.generated.emit(content);
    } catch (error) {
      this.errorMessage.set(
        'Une erreur est survenue lors de la génération. Veuillez réessayer.'
      );
      console.error('AI generation failed:', error);
    }
  }

}
