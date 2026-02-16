import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'projects',
    pathMatch: 'full',
  },
  {
    path: 'projects',
    loadComponent: () =>
      import('./features/projects/components/project-list/project-list').then(
        m => m.ProjectList
      ),
  },
  {
    path: 'projects/new',
    loadComponent: () =>
      import('./features/projects/components/project-form/project-form').then(
        m => m.ProjectForm
      ),
  },
  {
    path: 'projects/:id',
    loadComponent: () =>
      import('./features/projects/components/project-workspace/project-workspace').then(
        m => m.ProjectWorkspace
      ),
  },
  {
    path: 'projects/:id/edit',
    loadComponent: () =>
      import('./features/projects/components/project-form/project-form').then(
        m => m.ProjectForm
      ),
  },
];