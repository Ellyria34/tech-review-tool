import { Injectable, computed, signal } from '@angular/core';
import { Source, CreateSourceData, ProjectSource, LinkedSource } from '../../../shared/models';

// Two separate storage keys — catalog and liaisons
const SOURCES_KEY = 'techreviewtool_sources';
const PROJECT_SOURCES_KEY = 'techreviewtool_project_sources';

@Injectable({
  providedIn: 'root',
})
export class SourceService {

  // Global source catalog (shared across all projects)
  private readonly _sources = signal<Source[]>(this.loadFromStorage(SOURCES_KEY));

  // Project-source liaisons (which project uses which source)
  private readonly _projectSources = signal<ProjectSource[]>(this.loadFromStorage(PROJECT_SOURCES_KEY));

  // Public read-only accessors
  readonly sources = this._sources.asReadonly();
  readonly projectSources = this._projectSources.asReadonly();

  // ═══ Read methods ═══

  /** Get all sources linked to a project (with their active status). */
  getByProject(projectId: string) {
    return computed(() => {
      const liaisons = this._projectSources().filter(
        (ps) => ps.projectId === projectId
      );

      return liaisons
        .map((liaison) => {
          const source = this._sources().find((s) => s.id === liaison.sourceId);
          if (!source) return null;

          return {
            ...source,
            isActive: liaison.isActive,
            linkId: liaison.id,
          } as LinkedSource;
        })
        .filter((s) => s !== null);
    });
  }

  /** Count active sources for a project. */
  countActiveByProject(projectId: string) {
    return computed(
      () =>
        this._projectSources().filter(
          (ps) => ps.projectId === projectId && ps.isActive
        ).length
    );
  }

  /** Count all sources for a project. */
  countByProject(projectId: string) {
    return computed(
      () =>
        this._projectSources().filter(
          (ps) => ps.projectId === projectId
        ).length
    );
  }

  /** Find a source in the catalog by ID. */
  getById(sourceId: string): Source | undefined {
    return this._sources().find((s) => s.id === sourceId);
  }

  /** Get sources NOT yet linked to a project (for "add from catalog"). */
  getAvailableForProject(projectId: string) {
    return computed(() => {
      const linkedIds = this._projectSources()
        .filter((ps) => ps.projectId === projectId)
        .map((ps) => ps.sourceId);

      return this._sources().filter((s) => !linkedIds.includes(s.id));
    });
  }

  // ═══ Catalog methods (global sources) ═══

  /** Add a new source to the global catalog. */
  createSource(data: CreateSourceData): Source {
    const trimmedName = data.name.trim();
    if (!trimmedName) {
      throw new Error('Source name cannot be empty');
    }

    const trimmedUrl = data.url.trim();
    if (!trimmedUrl) {
      throw new Error('Source URL cannot be empty');
    }

    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      throw new Error('Source URL must start with http:// or https://');
    }

    const newSource: Source = {
      id: crypto.randomUUID(),
      name: trimmedName,
      url: trimmedUrl,
      category: data.category,
      description: data.description?.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    this._sources.update((current) => [...current, newSource]);
    this.saveToStorage(SOURCES_KEY, this._sources());

    return newSource;
  }

  /** Update a source in the catalog. */
  updateSource(sourceId: string, changes: Partial<CreateSourceData>): void {
    this._sources.update((current) =>
      current.map((source) => {
        if (source.id !== sourceId) return source;
        return {
          ...source,
          ...changes,
          name: changes.name?.trim() || source.name,
          url: changes.url?.trim() || source.url,
          description: changes.description?.trim() || source.description,
        };
      })
    );

    this.saveToStorage(SOURCES_KEY, this._sources());
  }

  /** Delete a source from the catalog and all its liaisons. */
  deleteSource(sourceId: string): void {
    this._sources.update((current) =>
      current.filter((s) => s.id !== sourceId)
    );

    this._projectSources.update((current) =>
      current.filter((ps) => ps.sourceId !== sourceId)
    );

    this.saveToStorage(SOURCES_KEY, this._sources());
    this.saveToStorage(PROJECT_SOURCES_KEY, this._projectSources());
  }

  // ═══ Liaison methods (project ↔ source) ═══

  /** Link a source to a project. */
  linkToProject(projectId: string, sourceId: string): ProjectSource {
    const link: ProjectSource = {
      id: crypto.randomUUID(),
      projectId,
      sourceId,
      isActive: true,
      addedAt: new Date().toISOString(),
    };

    this._projectSources.update((current) => [...current, link]);
    this.saveToStorage(PROJECT_SOURCES_KEY, this._projectSources());

    return link;
  }

  /** Unlink a source from a project (does NOT delete the source). */
  unlinkFromProject(linkId: string): void {
    this._projectSources.update((current) =>
      current.filter((ps) => ps.id !== linkId)
    );

    this.saveToStorage(PROJECT_SOURCES_KEY, this._projectSources());
  }

  /** Toggle active status for a source in a specific project. */
  toggleActive(linkId: string): void {
    this._projectSources.update((current) =>
      current.map((ps) =>
        ps.id === linkId
          ? { ...ps, isActive: !ps.isActive }
          : ps
      )
    );

    this.saveToStorage(PROJECT_SOURCES_KEY, this._projectSources());
  }

  /** Remove all liaisons for a project (when project is deleted).
   *  Sources stay in the catalog. */
  unlinkAllFromProject(projectId: string): void {
    this._projectSources.update((current) =>
      current.filter((ps) => ps.projectId !== projectId)
    );

    this.saveToStorage(PROJECT_SOURCES_KEY, this._projectSources());
  }

  // ═══ Convenience: create + link in one step ═══

  /** Create a new source AND link it to a project. */
  createAndLink(projectId: string, data: CreateSourceData): Source {
    const source = this.createSource(data);
    this.linkToProject(projectId, source.id);
    return source;
  }

  // ═══ localStorage persistence ═══

  private loadFromStorage<T>(key: string): T[] {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T[]) : [];
    } catch {
      console.error(`Failed to load ${key} from localStorage`);
      return [];
    }
  }

  private saveToStorage<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`Failed to save ${key} to localStorage`, e);
    }
  }
}