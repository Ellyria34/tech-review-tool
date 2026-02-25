// source.model.ts — Data model for RSS sources
//
// A Source is a GLOBAL catalog entry — it does not belong to a project.
// Projects link to sources through ProjectSource (many-to-many).

export type SourceCategory =
  | 'cybersecurity'
  | 'ai'
  | 'frontend'
  | 'backend'
  | 'devops'
  | 'cloud'
  | 'general';

// Global source catalog — no projectId
export interface Source {
  id: string;
  name: string;
  url: string;
  category: SourceCategory;
  description?: string;
  createdAt: string;
}

// Junction table — links a source to a project
export interface ProjectSource {
  id: string;
  projectId: string;
  sourceId: string;
  isActive: boolean;
  addedAt: string;
}

// Source enriched with project-specific info (returned by getByProject)
export interface LinkedSource extends Source {
  isActive: boolean;
  linkId: string;
}

// DTO for creating a new source in the catalog
export type CreateSourceData = Pick<Source, 'name' | 'url' | 'category' | 'description'>;