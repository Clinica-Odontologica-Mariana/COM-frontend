import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { GlobalFooterComponent } from './shared/components/layout/global-footer/global-footer.component';
import { GlobalSidebarComponent } from './shared/components/layout/global-sidebar/global-sidebar.component';

@Component({
  selector: 'app-root',
  imports: [GlobalFooterComponent, GlobalSidebarComponent, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly router = inject(Router);

  protected readonly currentUrl = signal(this.router.url);
  protected readonly hideShell = computed(() => this.currentUrl().startsWith('/admin-access'));

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => this.currentUrl.set(event.urlAfterRedirects));
  }
}
