import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ProjectService } from '../../services/project.service';

/** Available icons for project creation. */
const PROJECT_ICONS = [
  { value: '🛡️', label: 'Cyber' },
  { value: '🤖', label: 'IA & Machine Learning' },
  { value: '🎨', label: 'Front-end & Design' },
  { value: '☁️', label: 'Cloud & DevOps' },
  { value: '⚡', label: 'Back-end & API' },
  { value: '🔬', label: 'R&D & Veille générale' },
  { value: '📊', label: 'Data & Analytics' },
  { value: '🧪', label: 'Tests & Qualité' },
];

/** Available colors for project creation. */
const PROJECT_COLORS = [
  '#ef4444', '#8b5cf6', '#0ea5e9', '#14b8a6',
  '#f59e0b', '#6366f1', '#ec4899', '#10b981',
];

/**
 * Form to create or edit a review project.
 * Detects mode from the route: /projects/new = create, /projects/:id/edit = edit.
 */
@Component({
  selector: 'app-project-form',
  imports: [ReactiveFormsModule],
  templateUrl: './project-form.html',
  styleUrl: './project-form.scss',
})
export class ProjectForm {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly projectService = inject(ProjectService);

  /** Expose icon and color options to the template. */
  readonly icons = PROJECT_ICONS;
  readonly colors = PROJECT_COLORS;

  /** ID of the project being edited (null if creating). */
  readonly editId = this.route.snapshot.paramMap.get('id');

  /** True if we are editing an existing project. */
  readonly isEditMode = !!this.editId;

  /** Reactive form definition with validation rules. */
  readonly projectForm = this.formBuilder.group({
    name: ['', [Validators.required, Validators.maxLength(50)]],
    description: ['', Validators.maxLength(200)],
    icon: [PROJECT_ICONS[0].value, Validators.required],
    color: [PROJECT_COLORS[0], Validators.required],
  });

  constructor() {
    if (this.isEditMode) {
      const project = this.projectService.getById(this.editId!);
      if (project) {
        this.projectForm.patchValue({
          name: project.name,
          description: project.description,
          icon: project.icon,
          color: project.color,
        });
      }
    }
  }

  /** Currently selected icon (for visual highlight). */
  get selectedIcon(): string {
    return this.projectForm.get('icon')!.value ?? PROJECT_ICONS[0].value;
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

  /** Submit the form — create or update, then navigate back. */
  onSubmit(): void {
    if (this.projectForm.invalid) {
      return;
    }

    const { name, description, icon, color } = this.projectForm.getRawValue();
    const data = {
      name: name ?? '',
      description: description ?? '',
      icon: icon ?? PROJECT_ICONS[0].value,
      color: color ?? PROJECT_COLORS[0],
    };

    if (this.isEditMode) {
      this.projectService.update(this.editId!, data);
      this.router.navigate(['/projects', this.editId]);
    } else {
      this.projectService.create(data);
      this.router.navigate(['/projects']);
    }
  }

  /** Cancel and go back. */
  onCancel(): void {
    if (this.isEditMode) {
      this.router.navigate(['/projects', this.editId]);
    } else {
      this.router.navigate(['/projects']);
    }
  }
}