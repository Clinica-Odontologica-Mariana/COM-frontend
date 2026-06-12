import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { GlobalFooterComponent } from './shared/components/layout/global-footer/global-footer.component';
import { GlobalHeaderComponent } from './shared/components/layout/global-header/global-header.component';
import { GlobalSidebarComponent } from './shared/components/layout/global-sidebar/global-sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [GlobalFooterComponent, GlobalHeaderComponent, GlobalSidebarComponent, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly router = inject(Router);

  protected readonly currentUrl = signal(this.normalizedUrl(this.router.url));
  protected readonly isPublicRoute = computed(() =>
    ['/', '/home', '/attendance', '/unidades'].includes(this.currentUrl()),
  );
  protected readonly isAdminRoute = computed(() => this.currentUrl().startsWith('/admin-access'));
  protected readonly hideShell = computed(() => {
    return this.isPublicRoute() || this.isAdminRoute();
  });

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((event) => this.currentUrl.set(this.normalizedUrl(event.urlAfterRedirects)));
  }

  private normalizedUrl(url: string): string {
    return url.split('?')[0].split('#')[0];
  }
}
