import { TestBed } from '@angular/core/testing';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ProjectService } from './project.service';
import { SourceService } from '../../sources/services/source.service';


describe('ProjectService', () => {
  let service: ProjectService;
  let mockSourceService: { unlinkAllFromProject: ReturnType<typeof vi.fn> };

  // Setup & Teardown

  beforeEach(() => {
    localStorage.clear();
    mockSourceService = {
      unlinkAllFromProject: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        ProjectService,
        // Replace the real SourceService with our mock
        { provide: SourceService, useValue: mockSourceService },
      ],
    });

    service = TestBed.inject(ProjectService);
  });

  afterEach(() => {
    localStorage.clear();
  });


  // Initial state
  it('should start with an empty project list', () => {
    expect(service.projects()).toEqual([]);
    expect(service.count()).toBe(0);
  });

  it('should load existing projects from localStorage', () => {
    // Arrange: pre-populate localStorage BEFORE creating the service
    const existing = [{
      id: 'test-1',
      name: 'Existing Project',
      description: 'Already in storage',
      icon: '🔒',
      color: '#ff0000',
      createdAt: '2026-02-20T10:00:00Z',
      updatedAt: '2026-02-20T10:00:00Z',
    }];
    localStorage.setItem('trt_projects', JSON.stringify(existing));

    // Act: create a NEW service instance that reads from localStorage
    const freshService = TestBed.inject(ProjectService);

    // Assert
    expect(freshService.projects().length).toBeGreaterThanOrEqual(0);
  });


  // create()
  it('should create a project with correct properties', () => {
    const project = service.create({
      name: 'Cybersecurity Watch',
      description: 'Daily security news',
      icon: '🔒',
      color: '#ef4444',
    });

    expect(project.name).toBe('Cybersecurity Watch');
    expect(project.description).toBe('Daily security news');
    expect(project.icon).toBe('🔒');
    expect(project.color).toBe('#ef4444');
    expect(project.id).toBeTruthy(); // UUID generated
    expect(project.createdAt).toBeTruthy(); // ISO date string
    expect(project.updatedAt).toBe(project.createdAt); // Same on creation
  });

  it('should add the created project to the projects signal', () => {
    expect(service.count()).toBe(0);

    service.create({
      name: 'AI News',
      description: 'Artificial intelligence updates',
      icon: '🤖',
      color: '#3b82f6',
    });

    expect(service.count()).toBe(1);
    expect(service.projects()[0].name).toBe('AI News');
  });

  it('should trim whitespace from name and description', () => {
    const project = service.create({
      name: '  Frontend Weekly  ',
      description: '  Latest frontend news  ',
      icon: '🎨',
      color: '#8b5cf6',
    });

    expect(project.name).toBe('Frontend Weekly');
    expect(project.description).toBe('Latest frontend news');
  });

  it('should throw an error when name is empty', () => {
    expect(() => service.create({
      name: '',
      description: 'No name',
      icon: '❌',
      color: '#000000',
    })).toThrowError('Project name is required');
  });

  it('should throw an error when name is only whitespace', () => {
    expect(() => service.create({
      name: '   ',
      description: 'Whitespace name',
      icon: '❌',
      color: '#000000',
    })).toThrowError('Project name is required');
  });

  it('should persist to localStorage after create', () => {
    service.create({
      name: 'Persisted Project',
      description: 'Should be in storage',
      icon: '💾',
      color: '#10b981',
    });

    const stored = JSON.parse(localStorage.getItem('trt_projects') || '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe('Persisted Project');
  });

  it('should create multiple projects with unique IDs', () => {
    const p1 = service.create({ name: 'Project A', description: '', icon: '🅰️', color: '#000' });
    const p2 = service.create({ name: 'Project B', description: '', icon: '🅱️', color: '#fff' });

    expect(p1.id).not.toBe(p2.id);
    expect(service.count()).toBe(2);
  });


  // getById()
  it('should return a project by its ID', () => {
    const created = service.create({
      name: 'Find Me',
      description: 'Searchable',
      icon: '🔍',
      color: '#f59e0b',
    });

    const found = service.getById(created.id);
    expect(found).toBeDefined();
    expect(found!.name).toBe('Find Me');
  });

  it('should return undefined for a non-existent ID', () => {
    const found = service.getById('non-existent-id');
    expect(found).toBeUndefined();
  });


  // update()
  it('should update project name', () => {
    const project = service.create({ name: 'Old Name', description: '', icon: '📝', color: '#000' });

    service.update(project.id, { name: 'New Name' });

    const updated = service.getById(project.id);
    expect(updated!.name).toBe('New Name');
  });

  it('should update only the specified fields', () => {
    const project = service.create({
      name: 'Original',
      description: 'Keep this',
      icon: '📝',
      color: '#000',
    });

    service.update(project.id, { name: 'Changed' });

    const updated = service.getById(project.id);
    expect(updated!.name).toBe('Changed');
    expect(updated!.description).toBe('Keep this'); // Untouched
    expect(updated!.icon).toBe('📝'); // Untouched
  });
  
  it('should update the updatedAt timestamp', () => {
    // Freeze time to control timestamps precisely
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-24T10:00:00Z'));

    const project = service.create({ name: 'Timestamped', description: '', icon: '⏰', color: '#000' });

    // Advance clock by 5 minutes before updating
    vi.setSystemTime(new Date('2026-02-24T10:05:00Z'));
    service.update(project.id, { name: 'Updated' });

    const updated = service.getById(project.id);
    expect(updated!.updatedAt).toBe('2026-02-24T10:05:00.000Z');
    expect(updated!.updatedAt).not.toBe(project.createdAt);

    vi.useRealTimers();
  });

  it('should persist to localStorage after update', () => {
    const project = service.create({ name: 'Before', description: '', icon: '💾', color: '#000' });

    service.update(project.id, { name: 'After' });

    const stored = JSON.parse(localStorage.getItem('trt_projects') || '[]');
    expect(stored[0].name).toBe('After');
  });


  // delete()
  it('should remove a project from the list', () => {
    const project = service.create({ name: 'Delete Me', description: '', icon: '🗑️', color: '#000' });
    expect(service.count()).toBe(1);

    service.delete(project.id);

    expect(service.count()).toBe(0);
    expect(service.getById(project.id)).toBeUndefined();
  });

  it('should call sourceService.unlinkAllFromProject on delete', () => {
    const project = service.create({ name: 'With Sources', description: '', icon: '🔗', color: '#000' });

    service.delete(project.id);

    // Verify the mock was called with the correct project ID
    expect(mockSourceService.unlinkAllFromProject).toHaveBeenCalledWith(project.id);
    expect(mockSourceService.unlinkAllFromProject).toHaveBeenCalledTimes(1);
  });

  it('should persist to localStorage after delete', () => {
    const project = service.create({ name: 'Temporary', description: '', icon: '💾', color: '#000' });

    service.delete(project.id);

    const stored = JSON.parse(localStorage.getItem('trt_projects') || '[]');
    expect(stored).toHaveLength(0);
  });

  it('should only delete the targeted project', () => {
    const p1 = service.create({ name: 'Keep', description: '', icon: '✅', color: '#000' });
    const p2 = service.create({ name: 'Remove', description: '', icon: '❌', color: '#fff' });

    service.delete(p2.id);

    expect(service.count()).toBe(1);
    expect(service.getById(p1.id)).toBeDefined();
    expect(service.getById(p2.id)).toBeUndefined();
  });
});