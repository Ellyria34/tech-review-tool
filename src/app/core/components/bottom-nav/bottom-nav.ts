import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-bottom-nav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './bottom-nav.html',
  styleUrl: './bottom-nav.scss',
})
export class BottomNav {
  readonly navItems = [
    { icon: '📂', label: 'Projets', route: '/projects' },
    { icon: '📰', label: 'Articles', route: '/articles' },
    { icon: '🤖', label: 'Générer', route: '/generate' },
    { icon: '⚙️', label: 'Sources', route: '/sources' },
  ]
}
