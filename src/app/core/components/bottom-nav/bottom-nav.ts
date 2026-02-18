import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

@Component({
  selector: 'app-bottom-nav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './bottom-nav.html',
  styleUrl: './bottom-nav.scss',
})
export class BottomNav {
  private readonly router = inject(Router);

  /**
   * Extract the current project ID from the URL.
   * Matches /projects/:id or /projects/:id/anything.
   */
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e) => (e as NavigationEnd).urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  /** Reactive project ID — null when not inside a project. */
  readonly projectId = computed(() => {
    const match = this.currentUrl().match(/^\/projects\/([^/]+)/);
    if (!match || match[1] === 'new') return null;
    return match[1];
  });

  /** Nav items — routes update reactively based on active project. */
  readonly navItems = computed(() => {
    const id = this.projectId();
    return [
      { icon: '📂', label: 'Projets', route: '/projects', enabled: true },
      { icon: '📰', label: 'Articles', route: id ? `/projects/${id}/articles` : null, enabled: !!id },
      { icon: '🤖', label: 'Générer', route: id ? `/projects/${id}/generate` : null, enabled: !!id },
      { icon: '⚙️', label: 'Sources', route: id ? `/projects/${id}/sources` : null, enabled: !!id },
    ];
  });
}
