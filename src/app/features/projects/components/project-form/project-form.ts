import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { CATEGORY_LIST } from '../../../../shared/data/categories';

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

// Default category fallback (first in the list)
  private readonly defaultCategory = CATEGORY_LIST[0][1]; // { label, icon, color }

  // Icon options for the picker — { value, label } to match the template
  readonly icons = CATEGORY_LIST.map(([, info]) => ({
    value: info.icon,   // '🛡️'  ← the template uses icon.value
    label: info.label,  // 'Cybersécurité'  ← the template uses icon.label
  }));

  // Color options for the picker — just hex strings
  readonly colors = CATEGORY_LIST.map(([, info]) => info.color);

  /** ID of the project being edited (null if creating). */
  readonly editId = this.route.snapshot.paramMap.get('id');

  /** True if we are editing an existing project. */
  readonly isEditMode = !!this.editId;

  /** Reactive form definition with validation rules. */
  readonly projectForm = this.formBuilder.group({
    name: ['', [Validators.required, Validators.maxLength(50)]],
    description: ['', Validators.maxLength(200)],
    icon: [this.defaultCategory.icon, Validators.required],
    color: [this.defaultCategory.color, Validators.required],
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
    return this.projectForm.get('icon')!.value ?? this.defaultCategory.icon;
  }

  /** Currently selected color (for visual highlight). */
  get selectedColor(): string {
    return this.projectForm.get('color')!.value ?? this.defaultCategory.color;
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
      icon: icon ?? this.defaultCategory.icon,
      color: color ?? this.defaultCategory.color,
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