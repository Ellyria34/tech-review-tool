import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SourceService } from './source.service';
import type { CreateSourceData } from '../../../shared/models';

describe('SourceService', () => {
  let service: SourceService;

  // Reusable test data factory — keeps tests DRY
  const validSource: CreateSourceData = {
    name: 'Hacker News',
    url: 'https://news.ycombinator.com/rss',
    category: 'general',
    description: 'Tech news aggregator',
  };

  const secondSource: CreateSourceData = {
    name: 'Krebs on Security',
    url: 'https://krebsonsecurity.com/feed/',
    category: 'cybersecurity',
    description: 'Security blog',
  };

  // Setup & Teardown

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [SourceService],
    });

    service = TestBed.inject(SourceService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  // Initial state

  it('should start with empty catalog and no liaisons', () => {
    expect(service.sources()).toEqual([]);
    expect(service.projectSources()).toEqual([]);
  });


  // CATALOG CRUD
  //  createSource()
  it('should create a source with correct properties', () => {
    const source = service.createSource(validSource);

    expect(source.name).toBe('Hacker News');
    expect(source.url).toBe('https://news.ycombinator.com/rss');
    expect(source.category).toBe('general');
    expect(source.description).toBe('Tech news aggregator');
    expect(source.id).toBeTruthy();
    expect(source.createdAt).toBeTruthy();
  });

  it('should add the source to the catalog signal', () => {
    service.createSource(validSource);

    expect(service.sources()).toHaveLength(1);
    expect(service.sources()[0].name).toBe('Hacker News');
  });

  it('should trim whitespace from name, URL and description', () => {
    const source = service.createSource({
      name: '  Trimmed Source  ',
      url: '  https://example.com/rss  ',
      category: 'ai',
      description: '  Some description  ',
    });

    expect(source.name).toBe('Trimmed Source');
    expect(source.url).toBe('https://example.com/rss');
    expect(source.description).toBe('Some description');
  });

  it('should throw when name is empty', () => {
    expect(() => service.createSource({
      ...validSource,
      name: '',
    })).toThrowError('Source name cannot be empty');
  });

  it('should throw when name is only whitespace', () => {
    expect(() => service.createSource({
      ...validSource,
      name: '   ',
    })).toThrowError('Source name cannot be empty');
  });

  it('should throw when URL is empty', () => {
    expect(() => service.createSource({
      ...validSource,
      url: '',
    })).toThrowError('Source URL cannot be empty');
  });

  it('should throw when URL has no protocol', () => {
    expect(() => service.createSource({
      ...validSource,
      url: 'news.ycombinator.com/rss',
    })).toThrowError('Source URL must start with http:// or https://');
  });

  it('should persist catalog to localStorage after create', () => {
    service.createSource(validSource);

    const stored = JSON.parse(localStorage.getItem('techreviewtool_sources') || '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe('Hacker News');
  });


  // getById()
  it('should find a source by ID', () => {
    const created = service.createSource(validSource);

    const found = service.getById(created.id);
    expect(found).toBeDefined();
    expect(found!.name).toBe('Hacker News');
  });

  it('should return undefined for non-existent ID', () => {
    expect(service.getById('non-existent')).toBeUndefined();
  });


  // updateSource()
  it('should update source name', () => {
    const source = service.createSource(validSource);

    service.updateSource(source.id, { name: 'HN Updated' });

    expect(service.getById(source.id)!.name).toBe('HN Updated');
  });

  it('should update only specified fields', () => {
    const source = service.createSource(validSource);

    service.updateSource(source.id, { name: 'Changed' });

    const updated = service.getById(source.id)!;
    expect(updated.name).toBe('Changed');
    expect(updated.url).toBe('https://news.ycombinator.com/rss'); // Untouched
    expect(updated.category).toBe('general'); // Untouched
  });

  it('should persist catalog to localStorage after update', () => {
    const source = service.createSource(validSource);

    service.updateSource(source.id, { name: 'Persisted Update' });

    const stored = JSON.parse(localStorage.getItem('techreviewtool_sources') || '[]');
    expect(stored[0].name).toBe('Persisted Update');
  });


  // deleteSource()
  it('should remove a source from the catalog', () => {
    const source = service.createSource(validSource);

    service.deleteSource(source.id);

    expect(service.sources()).toHaveLength(0);
    expect(service.getById(source.id)).toBeUndefined();
  });

  it('should remove all liaisons when a source is deleted (cascade)', () => {
    const source = service.createSource(validSource);
    service.linkToProject('project-1', source.id);
    service.linkToProject('project-2', source.id);
    expect(service.projectSources()).toHaveLength(2);

    service.deleteSource(source.id);

    // Source gone from catalog AND all liaisons cleaned up
    expect(service.sources()).toHaveLength(0);
    expect(service.projectSources()).toHaveLength(0);
  });

  it('should only delete the targeted source', () => {
    const s1 = service.createSource(validSource);
    const s2 = service.createSource(secondSource);

    service.deleteSource(s1.id);

    expect(service.sources()).toHaveLength(1);
    expect(service.getById(s2.id)).toBeDefined();
  });


  // LIAISON MANAGEMENT (Many-to-Many)
  // linkToProject()
  it('should link a source to a project', () => {
    const source = service.createSource(validSource);

    const link = service.linkToProject('project-1', source.id);

    expect(link.projectId).toBe('project-1');
    expect(link.sourceId).toBe(source.id);
    expect(link.isActive).toBe(true); // Active by default
    expect(link.id).toBeTruthy();
    expect(service.projectSources()).toHaveLength(1);
  });

  it('should link the same source to multiple projects', () => {
    const source = service.createSource(validSource);

    service.linkToProject('project-1', source.id);
    service.linkToProject('project-2', source.id);

    expect(service.projectSources()).toHaveLength(2);
  });

  it('should persist liaisons to localStorage after link', () => {
    const source = service.createSource(validSource);

    service.linkToProject('project-1', source.id);

    const stored = JSON.parse(
      localStorage.getItem('techreviewtool_project_sources') || '[]'
    );
    expect(stored).toHaveLength(1);
    expect(stored[0].projectId).toBe('project-1');
  });


  // unlinkFromProject()
  it('should unlink a source from a project by linkId', () => {
    const source = service.createSource(validSource);
    const link = service.linkToProject('project-1', source.id);

    service.unlinkFromProject(link.id);

    expect(service.projectSources()).toHaveLength(0);
    // Source still exists in catalog — unlink ≠ delete
    expect(service.getById(source.id)).toBeDefined();
  });

  // toggleActive()
  it('should toggle a liaison from active to inactive', () => {
    const source = service.createSource(validSource);
    const link = service.linkToProject('project-1', source.id);
    expect(link.isActive).toBe(true);

    service.toggleActive(link.id);

    const updated = service.projectSources().find(ps => ps.id === link.id);
    expect(updated!.isActive).toBe(false);
  });

  it('should toggle back from inactive to active', () => {
    const source = service.createSource(validSource);
    const link = service.linkToProject('project-1', source.id);

    service.toggleActive(link.id); // true → false
    service.toggleActive(link.id); // false → true

    const updated = service.projectSources().find(ps => ps.id === link.id);
    expect(updated!.isActive).toBe(true);
  });


  // unlinkAllFromProject()
  it('should remove all liaisons for a project', () => {
    const s1 = service.createSource(validSource);
    const s2 = service.createSource(secondSource);
    service.linkToProject('project-1', s1.id);
    service.linkToProject('project-1', s2.id);
    service.linkToProject('project-2', s1.id); // Different project

    service.unlinkAllFromProject('project-1');

    // Project-1 liaisons removed, project-2 liaison untouched
    expect(service.projectSources()).toHaveLength(1);
    expect(service.projectSources()[0].projectId).toBe('project-2');
    // Sources still in catalog
    expect(service.sources()).toHaveLength(2);
  });


  // COMPUTED QUERIES
  // getByProject()
  it('should return linked sources enriched with active status', () => {
    const source = service.createSource(validSource);
    service.linkToProject('project-1', source.id);

    const linked = service.getByProject('project-1')();

    expect(linked).toHaveLength(1);
    expect(linked[0].name).toBe('Hacker News');
    expect(linked[0].isActive).toBe(true);
    expect(linked[0].linkId).toBeTruthy();
  });

  it('should return empty array for a project with no sources', () => {
    const linked = service.getByProject('empty-project')();
    expect(linked).toEqual([]);
  });

  it('should not include sources from other projects', () => {
    const source = service.createSource(validSource);
    service.linkToProject('project-1', source.id);

    const linked = service.getByProject('project-2')();
    expect(linked).toEqual([]);
  });

  // countActiveByProject()

  it('should count only active sources for a project', () => {
    const s1 = service.createSource(validSource);
    const s2 = service.createSource(secondSource);
    const link1 = service.linkToProject('project-1', s1.id);
    service.linkToProject('project-1', s2.id);

    // Deactivate one source
    service.toggleActive(link1.id);

    expect(service.countActiveByProject('project-1')()).toBe(1);
  });

  // countByProject()
  it('should count all sources for a project regardless of active status', () => {
    const s1 = service.createSource(validSource);
    const s2 = service.createSource(secondSource);
    const link1 = service.linkToProject('project-1', s1.id);
    service.linkToProject('project-1', s2.id);

    service.toggleActive(link1.id); // Deactivate one

    expect(service.countByProject('project-1')()).toBe(2); // Still 2
  });

  // getAvailableForProject()
  it('should return sources NOT linked to a project', () => {
    const s1 = service.createSource(validSource);
    const s2 = service.createSource(secondSource);
    service.linkToProject('project-1', s1.id); // Link only s1

    const available = service.getAvailableForProject('project-1')();

    expect(available).toHaveLength(1);
    expect(available[0].id).toBe(s2.id);
  });

  it('should return all sources when none are linked', () => {
    service.createSource(validSource);
    service.createSource(secondSource);

    const available = service.getAvailableForProject('project-1')();
    expect(available).toHaveLength(2);
  });

  it('should return empty when all sources are linked', () => {
    const s1 = service.createSource(validSource);
    const s2 = service.createSource(secondSource);
    service.linkToProject('project-1', s1.id);
    service.linkToProject('project-1', s2.id);

    const available = service.getAvailableForProject('project-1')();
    expect(available).toHaveLength(0);
  });

  // CONVENIENCE METHOD
  // createAndLink()

  it('should create a source AND link it to a project in one call', () => {
    const source = service.createAndLink('project-1', validSource);

    // Source exists in catalog
    expect(service.sources()).toHaveLength(1);
    expect(service.getById(source.id)).toBeDefined();

    // Liaison exists
    expect(service.projectSources()).toHaveLength(1);
    expect(service.projectSources()[0].sourceId).toBe(source.id);
    expect(service.projectSources()[0].projectId).toBe('project-1');

    // Appears in project's linked sources
    const linked = service.getByProject('project-1')();
    expect(linked).toHaveLength(1);
    expect(linked[0].name).toBe('Hacker News');
  });
});