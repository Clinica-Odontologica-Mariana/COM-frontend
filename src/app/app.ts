import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { GlobalFooterComponent } from './shared/components/layout/global-footer/global-footer.component';
import { GlobalHeaderComponent } from './shared/components/layout/global-header/global-header.component';
import { GlobalSidebarComponent } from './shared/components/layout/global-sidebar/global-sidebar.component';

@Component({
  selector: 'app-root',
  imports: [GlobalFooterComponent, GlobalHeaderComponent, GlobalSidebarComponent, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly router = inject(Router);
  private readonly publicPaths = new Set(['/unidades']);

  protected readonly isPublicRoute = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects.split('?')[0].split('#')[0]),
      startWith(this.router.url.split('?')[0].split('#')[0]),
      map((path) => this.publicPaths.has(path)),
    ),
    { initialValue: this.publicPaths.has(this.router.url) },
  );
}
