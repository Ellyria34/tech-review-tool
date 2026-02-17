// source.model.ts — Data model for RSS sources
//
// Each source belongs to ONE project (projectId = foreign key).
// Multi-Tenant pattern: all queries filter by project.

// Union type for categories — zero runtime cost (erased at compilation)
export type SourceCategory =
  | 'cybersecurity'
  | 'ai'
  | 'frontend'
  | 'backend'
  | 'devops'
  | 'cloud'
  | 'general';

export interface Source {
  id: string;
  projectId: string;
  name: string;
  url: string;
  category: SourceCategory;
  isActive: boolean;
  description?: string;
  createdAt: string;          // ISO 8601 date string (JSON-safe)
}

// DTO for the creation form — excludes id and projectId
// (generated/injected by the service)
export type CreateSourceData = Pick<Source, 'name' | 'url' | 'category' | 'description'>;