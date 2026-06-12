import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GlobalSidebarComponent } from './shared/components/layout/global-sidebar/global-sidebar.component';
import { ToastContainerComponent } from './shared/components/feedback/toast-container/toast-container.component';

@Component({
  selector: 'app-root',
  imports: [GlobalSidebarComponent, RouterOutlet, ToastContainerComponent],
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
    return url === '/' || url === '/home' || url.startsWith('/admin-access');
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
