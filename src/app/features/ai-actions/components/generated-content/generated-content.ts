import { Component, input, signal } from '@angular/core';
import {GeneratedContent,  CONTENT_TYPE_OPTIONS } from '../../../../shared/models';

@Component({
  selector: 'app-generated-content',
  imports: [],
  templateUrl: './generated-content.html',
  styleUrl: './generated-content.scss',
})
export class GeneratedContentComponent {
  /** The generated content to display. */
  content = input.required<GeneratedContent>();

  /** Feedback after copy: shows "Copié !" for 2 seconds. */
  copySuccess = signal(false);

  /** Expose content type options for display. */
  readonly contentTypeOptions = CONTENT_TYPE_OPTIONS;

  /**
   * Copy the generated content to the clipboard.
   * Uses the modern async Clipboard API (requires HTTPS or localhost).
   */
  async copyToClipboard(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.content().content);
      this.copySuccess.set(true);
      setTimeout(() => this.copySuccess.set(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  }

  /**
   * Export the generated content as a downloadable .md file.
   * Creates a Blob in memory and triggers a download via a temporary link.
   */
  exportMarkdown(): void {
    const contentData = this.content();
    const typeInfo = this.contentTypeOptions[contentData.type];
    const date = new Date(contentData.createdAt)
      .toISOString()
      .split('T')[0];

    // Sanitize filename: remove accents and special characters
    const filename = `${typeInfo.label}-${date}.md`
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9.-]/g, '-')
      .replace(/-+/g, '-');

    const blob = new Blob([contentData.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();

    // Release the object URL to free memory
    URL.revokeObjectURL(url);
  }
}