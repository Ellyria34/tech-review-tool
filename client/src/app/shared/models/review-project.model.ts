/**
 * Represents a review project — the root entity of the application.
 * Every source, article and generated content belongs to a project.
 */
export interface ReviewProject {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}