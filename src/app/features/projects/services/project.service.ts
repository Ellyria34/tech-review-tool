import { Injectable, signal, computed, inject  } from '@angular/core';
import type { ReviewProject } from '../../../shared/models';
import { SourceService } from '../../sources/services/source.service';
import { loadFromStorage, saveToStorage } from '../../../core/services/storage.helper';

/**
* Manages the lifecycle of review projects.
* Singleton service — single source of truth for all project data.
* Persists projects to localStorage for offline-first behavior.
*/
@Injectable({ providedIn: 'root' })
export class ProjectService {

  /** localStorage key for projects persistence. */
  private readonly STORAGE_KEY = 'trt_projects';

  /** Reactive list of all projects. */
  private readonly _projects = signal<ReviewProject[]>(
    loadFromStorage<ReviewProject[]>(this.STORAGE_KEY, [])
  );
  
  private readonly sourceService = inject(SourceService);

  /** Public read-only access to projects. */
  readonly projects = this._projects.asReadonly();

  /** Total number of projects. */
  readonly count = computed(() => this._projects().length);

  /** Retrieve a single project by its ID. */
  getById(id: string): ReviewProject | undefined {
    return this._projects().find(project => project.id === id);
  }

  /** Create a new project and persist it. */
  create(data: Pick<ReviewProject, 'name' | 'description' | 'icon' | 'color'>): ReviewProject {
    const name = data.name.trim();
    if (!name) {
      throw new Error('Project name is required');
    }

    const now = new Date().toISOString();
    const project: ReviewProject = {
      id: crypto.randomUUID(),
      name,
      description: data.description.trim(),
      icon: data.icon,
      color: data.color,
      createdAt: now,
      updatedAt: now,
    };

    this._projects.update(projects => [...projects, project]);
    this.saveToStorage();

    return project;
  }

  /** Update an existing project and persist changes. */
  update(id: string, data: Partial<Pick<ReviewProject, 'name' | 'description' | 'icon' | 'color'>>): void {
    this._projects.update(projects =>
      projects.map(project =>
        project.id === id
          ? { ...project, ...data, updatedAt: new Date().toISOString() }
          : project
      )
    );
    this.saveToStorage();
  }

/** Delete a project, clean up source liaisons, and persist changes. */
  delete(id: string): void {
    // Remove source liaisons first (sources stay in catalog)
    this.sourceService.unlinkAllFromProject(id);

    this._projects.update(projects =>
      projects.filter(project => project.id !== id)
    );
    this.saveToStorage();
  }

  /** Save current projects to localStorage. */
  private saveToStorage(): void {
    saveToStorage(this.STORAGE_KEY, this._projects());
  }
}