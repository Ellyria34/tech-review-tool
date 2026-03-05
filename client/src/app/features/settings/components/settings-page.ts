import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings-page',
  imports: [RouterLink],
  templateUrl: './settings-page.html',
  styleUrl: './settings-page.scss',
})
export class SettingsPage {
  private readonly router = inject(Router);

  /** GDPR Article 17 — Right to erasure. */
  onDeleteAll(): void {
    // 1. Confirm (same pattern as source deletion)
    const confirmed = window.confirm(
      'Êtes-vous sûr de vouloir effacer toutes vos données ?\n\n'
      + 'Cette action est irréversible. Tous vos projets, sources, '
      + 'articles et contenus générés seront supprimés.'
    );
    if (!confirmed) return;

    // 2. Clear all localStorage
    localStorage.clear();

    // 3. Redirect to home (clean state)
    this.router.navigate(['/projects']);
  }

  /** GDPR Article 20 — Right to data portability. */
  onExport(): void {
    // 1. Collect all data from localStorage
    const data = {
      exportDate: new Date().toISOString(),
      projects: JSON.parse(localStorage.getItem('trt_projects') ?? '[]'),
      sources: JSON.parse(localStorage.getItem('techreviewtool_sources') ?? '[]'),
      projectSources: JSON.parse(localStorage.getItem('techreviewtool_project_sources') ?? '[]'),
      articles: JSON.parse(localStorage.getItem('trt-articles') ?? '[]'),
      generatedContents: JSON.parse(localStorage.getItem('trt-generated-contents') ?? '[]'),
    };

    // 2. Create a downloadable JSON file (same Blob pattern as markdown export)
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // 3. Trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `techreviewtool-export-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();

    // 4. Cleanup memory
    URL.revokeObjectURL(url);
  }
}