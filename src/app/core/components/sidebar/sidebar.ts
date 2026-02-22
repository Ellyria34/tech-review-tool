import { Component, computed, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ProjectService } from '../../../features/projects/services/project.service';
import { filter, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

/**
 * Desktop sidebar — visible only on lg+ screens (≥ 1024px).
 * Two zones:
 * - Top: project list with active indicator
 * - Bottom: contextual navigation inside the active project
 *
 * Hidden on mobile via CSS class "hidden lg:flex" on the host element.
 * This is the desktop equivalent of BottomNavComponent.
 */
@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class SidebarComponent {
  private readonly router = inject(Router);
  private readonly projectService= inject(ProjectService);

  /** All projects from the service */
  readonly projects = this.projectService.projects;

  /**
   * Extract the active project ID from the current URL.
   * Uses toSignal() to convert Router events (Observable) into a Signal.
   * Same pattern as BottomNavComponent — DRY would suggest extracting this
   * into a shared service, but for now 2 usages don't justify the abstraction.
   *
   * C# parallel: like reading RouteData["id"] from HttpContext in a Layout.
   */
  private readonly url$ = this.router.events.pipe(
    filter((e) : e is NavigationEnd => e instanceof NavigationEnd),
    map((e) => e.urlAfterRedirects),
  );

  private readonly currentUrl = toSignal(this.url$, { initialValue : this.router.url });

  readonly activeProjectId = computed(() => {
    const url = this.currentUrl();
    const match = url.match(/\/projects\/([^/]+)/);
    return match ? match[1] : null;
  });

  /** Active project object (for displaying name, icon, color in nav header) */
  readonly activeProject = computed(() => {
    const id = this.activeProjectId();
    if (!id) return null;
    return this.projects().find((p) => p.id === id) ?? null;
  });
  
  /** Navigation items inside a project — same routes as BottomNav */
  readonly projectNavItems = computed(() => {
    const id = this.activeProjectId();
    if(!id) return [];
    return [
      { path: `/projects/${id}`, label: 'Workspace', icon: '📊', exact: true },
      { path: `/projects/${id}/sources`, label: 'Sources', icon: '⚙️', exact: false },
      { path: `/projects/${id}/articles`, label: 'Articles', icon: '📰', exact: false },
      { path: `/projects/${id}/history`, label: 'Historique', icon: '📋', exact: false },
    ];
  });

}
