import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GlobalFooterComponent } from './shared/components/layout/global-footer/global-footer.component';
import { GlobalSidebarComponent } from './shared/components/layout/global-sidebar/global-sidebar.component';
import { GlobalHeaderComponent } from './shared/components/layout/global-header/global-header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [GlobalFooterComponent, GlobalSidebarComponent, GlobalHeaderComponent, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly router = inject(Router);

  protected readonly currentUrl = signal(this.router.url);

  // Unificando as regras: esconde a estrutura padrão do app tanto na rota admin quanto na Home de apresentação
  protected readonly hideShell = computed(() => {
    const url = this.currentUrl();
    return url === '/' || url === '/home' || url === '/attendance' || url.startsWith('/admin-access');
  });

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe((event) => this.currentUrl.set(event.urlAfterRedirects));
  }
}