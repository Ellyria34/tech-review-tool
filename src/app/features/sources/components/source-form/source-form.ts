import { Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SourceService } from '../../services/source.service';
import { SourceCategory } from '../../../../shared/models';
import { CATEGORY_LIST } from '../../../../shared/data/categories';

@Component({
  selector: 'app-source-form',
  imports: [ReactiveFormsModule],
  templateUrl: './source-form.html',
  styleUrl: './source-form.scss',
})
export class SourceForm implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly sourceService = inject(SourceService);

  // IDs from the URL
  projectId = '';
  sourceId: string | null = null;
  isEditMode = false;

  // Category options for the <select> dropdown
  readonly categories = CATEGORY_LIST;

  // Reactive form with validation
  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    url: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
    category: ['general' as SourceCategory, [Validators.required]],
    description: ['', [Validators.maxLength(200)]],
  });

  ngOnInit(): void {
    // Read IDs from the URL
    this.projectId = this.route.snapshot.paramMap.get('id') || '';
    this.sourceId = this.route.snapshot.paramMap.get('sourceId');
    this.isEditMode = !!this.sourceId;

    // If editing, fill the form with existing data
    if (this.isEditMode && this.sourceId) {
      const source = this.sourceService.getById(this.sourceId);
      if (source) {
        this.form.patchValue({
          name: source.name,
          url: source.url,
          category: source.category,
          description: source.description || '',
        });
      }
    }
  }

  /** Submit — create or update, then go back to source list. */
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const data = this.form.getRawValue();

    if (this.isEditMode && this.sourceId) {
      this.sourceService.update(this.sourceId, {
        name: data.name ?? '',
        url: data.url ?? '',
        category: data.category ?? 'general',
        description: data.description ?? '',
      });
    } else {
      this.sourceService.create(this.projectId, {
        name: data.name ?? '',
        url: data.url ?? '',
        category: data.category ?? 'general',
        description: data.description ?? '',
      });
    }

    this.router.navigate(['/projects', this.projectId, 'sources']);
  }

  /** Cancel — go back to source list. */
  onCancel(): void {
    this.router.navigate(['/projects', this.projectId, 'sources']);
  }
}