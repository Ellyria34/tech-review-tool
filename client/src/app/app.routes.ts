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
  {
    path: 'projects/:id/sources',
    loadComponent: () =>
      import(
        './features/sources/components/source-list/source-list'
      ).then((m) => m.SourceList),
  },
  {
    path: 'projects/:id/sources/new',
    loadComponent: () =>
      import(
        './features/sources/components/source-form/source-form'
      ).then((m) => m.SourceForm),
  },
  {
    path: 'projects/:id/sources/:sourceId/edit',
    loadComponent: () =>
      import(
        './features/sources/components/source-form/source-form'
      ).then((m) => m.SourceForm),
  },
  {
  path: 'projects/:id/articles',
  loadComponent: () =>
    import('./features/articles/components/article-list/article-list').then(
      (m) => m.ArticleListComponent
    ),
},
{
  path : 'projects/:id/history',
  loadComponent: () =>
    import('./features/history/components/history-list/history-list').then(
      m => m.HistoryListComponent
    ),
},
];


