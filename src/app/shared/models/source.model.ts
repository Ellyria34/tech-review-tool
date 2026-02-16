/**
 * Represents an RSS source configured within a project.
 * Each source belongs to one project and produces articles.
 */
export interface Source {
  id: string;
  projectId: string;
  name: string;
  url: string;
  category: string;
  isActive: boolean;
  createdAt: string;
}