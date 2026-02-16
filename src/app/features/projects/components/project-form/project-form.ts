import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ProjectService } from '../../services/project.service';

/** Available icons for project creation. */
const PROJECT_ICONS = ['🛡️', '🤖', '🎨', '☁️', '⚡', '🔬', '📊', '🧪'];

/** Available colors for project creation. */
const PROJECT_COLORS = [
  '#ef4444', '#8b5cf6', '#0ea5e9', '#14b8a6',
  '#f59e0b', '#6366f1', '#ec4899', '#10b981',
];

/**
 * Form to create a new review project.
 * Uses Angular Reactive Forms for validation and data handling.
 */
@Component({
  selector: 'app-project-form',
  imports: [ReactiveFormsModule],
  templateUrl: './project-form.html',
  styleUrl: './project-form.scss',
})
export class ProjectForm {
  private readonly formBuilder  = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly projectService = inject(ProjectService);

  /** Expose icon and color options to the template. */
  readonly icons = PROJECT_ICONS;
  readonly colors = PROJECT_COLORS;

  /** Reactive form definition with validation rules. */
  readonly projectForm = this.formBuilder .group({
    name: ['', [Validators.required, Validators.maxLength(50)]],
    description: ['', Validators.maxLength(200)],
    icon: [PROJECT_ICONS[0], Validators.required],
    color: [PROJECT_COLORS[0], Validators.required],
  });

  /** Currently selected icon (for visual highlight). */
  get selectedIcon(): string {
    return this.projectForm.get('icon')!.value ?? PROJECT_ICONS[0];
  }

  /** Currently selected color (for visual highlight). */
  get selectedColor(): string {
    return this.projectForm.get('color')!.value ?? PROJECT_COLORS[0];
  }

  /** Select an icon and update the form. */
  selectIcon(icon: string): void {
    this.projectForm.patchValue({ icon });
  }

  /** Select a color and update the form. */
  selectColor(color: string): void {
    this.projectForm.patchValue({ color });
  }

  /** Submit the form — create the project and navigate back. */
  onSubmit(): void {
      if (this.projectForm.invalid) {
        return;
      }

      const { name, description, icon, color } = this.projectForm.getRawValue();
      this.projectService.create({
        name: name ?? '',
        description: description ?? '',
        icon: icon ?? PROJECT_ICONS[0],
        color: color ?? PROJECT_COLORS[0],
      });

      this.router.navigate(['/projects']);
    }

  /** Cancel and go back to project list. */
  onCancel(): void {
    this.router.navigate(['/projects']);
  }
}