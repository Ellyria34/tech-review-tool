import { Injectable, signal, computed } from '@angular/core';
import type { ReviewProject } from '../../../shared/models';

/** localStorage key for projects persistence. */
const STORAGE_KEY = 'trt_projects';

/**
 * Manages the lifecycle of review projects.
 * Singleton service — single source of truth for all project data.
 * Persists projects to localStorage for offline-first behavior.
 */
@Injectable({ providedIn: 'root' })
export class ProjectService {
  /** Reactive list of all projects. */
  private readonly _projects = signal<ReviewProject[]>(this.loadFromStorage());

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
    const now = new Date().toISOString();
    const project: ReviewProject = {
      id: crypto.randomUUID(),
      name: data.name,
      description: data.description,
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

  /** Delete a project and persist changes. */
  delete(id: string): void {
    this._projects.update(projects =>
      projects.filter(project => project.id !== id)
    );
    this.saveToStorage();
  }

  /** Load projects from localStorage. */
  private loadFromStorage(): ReviewProject[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  /** Save current projects to localStorage. */
  private saveToStorage(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._projects()));
  }
}