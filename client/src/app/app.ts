import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './core/components/header/header';
import { BottomNav } from './core/components/bottom-nav/bottom-nav';
import { SidebarComponent } from "./core/components/sidebar/sidebar";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, BottomNav, SidebarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('tech-review-tool');
}
