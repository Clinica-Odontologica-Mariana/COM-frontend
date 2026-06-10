import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { GlobalFooterComponent } from './shared/components/layout/global-footer/global-footer.component';
import { GlobalSidebarComponent } from './shared/components/layout/global-sidebar/global-sidebar.component';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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

  protected readonly isPublicRoute = computed(
    () => this.currentUrl() === '/' || this.currentUrl() === '/home',
  );

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.currentUrl.set(this.router.url));
  }
}

