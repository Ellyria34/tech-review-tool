import { Injectable, computed, signal } from '@angular/core';
import { Source, CreateSourceData } from '../../../shared/models';

// All sources are stored under this key in localStorage
const STORAGE_KEY = 'techreviewtool_sources';

@Injectable({
  providedIn: 'root',
})
export class SourceService {
  // Only the service can modify this data
  private readonly _sources = signal<Source[]>(this.loadFromStorage());

  // Components read sources through this (read-only)
  readonly sources = this._sources.asReadonly();

  // Load sources from localStorage at startup.
  private loadFromStorage(): Source[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Source[]) : [];
    } catch {
      // Corrupted JSON — start fresh (better to lose data than crash)
      console.error('Failed to load sources from localStorage');
      return [];
    }
  }

  // Save all sources to localStorage.
  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._sources()));
    } catch (e) {
      // localStorage can be full (~5-10 MB depending on browser)
      console.error('Failed to save sources to localStorage', e);
    }
  }

  //Get all sources for a project (reactive — auto-updates the UI).
  getByProject(projectId: string) {
    return computed(() =>
      this._sources().filter((s) => s.projectId === projectId)
    );
  }

  // Count active sources for a project.
  countActiveByProject(projectId: string) {
    return computed(
      () =>
        this._sources().filter(
          (s) => s.projectId === projectId && s.isActive
        ).length
    );
  }

  // Counts all sources for a project (active + inactive).
  countByProject(projectId: string) {
    return computed(
      () => this._sources().filter((s) => s.projectId === projectId).length
    );
  }

  // Find a source by its ID.
  getById(sourceId: string): Source | undefined {
    return this._sources().find((s) => s.id === sourceId);
  }

  // Add a new source to a project.
  create(projectId: string, data: CreateSourceData): Source {
    // Validation — defense in depth
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
      projectId,
      name: trimmedName,
      url: trimmedUrl,
      category: data.category,
      description: data.description?.trim() || undefined,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    // Spread creates a new array so the signal detects the change
    this._sources.update((current) => [...current, newSource]);
    this.saveToStorage();

    return newSource;
  }

  // Update some fields of an existing source.
  update(sourceId: string, changes: Partial<CreateSourceData>): void {
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

    this.saveToStorage();
  }

  // Toggle a source on/off.
  toggleActive(sourceId: string): void {
    this._sources.update((current) =>
      current.map((source) =>
        source.id === sourceId
          ? { ...source, isActive: !source.isActive }
          : source
      )
    );

    this.saveToStorage();
  }

  // Deletes a source.
  delete(sourceId: string): void {
    this._sources.update((current) =>
      current.filter((source) => source.id !== sourceId)
    );

    this.saveToStorage();
  }

  // Delete all sources of a project (when the project is deleted).
  deleteByProject(projectId: string): void {
    this._sources.update((current) =>
      current.filter((source) => source.projectId !== projectId)
    );

    this.saveToStorage();
  }
}