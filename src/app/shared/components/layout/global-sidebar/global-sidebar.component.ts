import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService, CurrentUser } from '../../../../core/services/auth.service';

interface SidebarItem {
  label: string;
  icon: string;
  link: string;
  match: readonly string[];
}

@Component({
  selector: 'app-global-sidebar',
  imports: [RouterLink],
  template: `
    <!-- Mobile header -->
    <div
      class="flex items-center justify-between border-b border-[#EEE8E5] bg-[#FAFAF9] px-4 py-3 lg:hidden"
    >
      <img src="/Logo_clinica.svg" alt="" draggable="false" class="h-8 w-auto" aria-hidden="true" />
      <button
        type="button"
        class="rounded-lg p-2 text-[#78716C] hover:bg-[#EDE8E6]"
        [attr.aria-expanded]="mobileOpen()"
        aria-label="Abrir menu"
        (click)="toggleMobile()"
      >
        <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>

    @if (mobileOpen()) {
      <div
        class="fixed inset-0 z-40 bg-black/40 lg:hidden"
        role="presentation"
        (click)="closeMobile()"
      ></div>
    }

    <!-- Mobile drawer -->
    <aside
      class="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#FAFAF9] px-4 py-6 transition-transform lg:hidden"
      [class.translate-x-0]="mobileOpen()"
      [class.-translate-x-full]="!mobileOpen()"
      aria-label="Menu de navegação"
    >
      <nav class="mt-2 flex-1 space-y-1 overflow-y-auto" aria-label="Area administrativa">
        @for (item of items; track item.label) {
          <a
            [routerLink]="item.link"
            [attr.aria-current]="isItemActive(item) ? 'page' : null"
            class="flex h-11 items-center gap-3 rounded-xl px-4 text-sm tracking-wide transition hover:bg-[#EDE8E6] hover:text-[#8B574B]"
            [class.bg-[#EDE8E6]]="isItemActive(item)"
            [class.font-semibold]="isItemActive(item)"
            [class.text-[#8B574B]]="isItemActive(item)"
            [class.text-[#78716C]]="!isItemActive(item)"
            (click)="closeMobile()"
          >
            <img [src]="item.icon" alt="" class="h-5 w-5" />
            <span>{{ item.label }}</span>
          </a>
        }
      </nav>

      <!-- Mobile user section -->
      <div class="mt-4 border-t border-[#EEE8E5] pt-4">
        <div class="flex items-center gap-3 px-2 pb-4">
          <div
            class="grid h-11 w-11 place-items-center rounded-full bg-[#DFA17C] text-sm font-bold text-[#1F2425]"
          >
            {{ initials() }}
          </div>
          <div>
            <p class="text-sm font-bold text-[#1F2425]">{{ displayName() }}</p>
          </div>
        </div>

        <a
          routerLink="/schedule/new"
          class="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#8B574B] px-4 text-sm font-bold text-white shadow-lg shadow-[#8B574B]/20 transition hover:bg-[#744A40]"
          (click)="closeMobile()"
        >
          <span class="text-lg leading-none">+</span>
          Novo Atendimento
        </a>

        <button
          type="button"
          class="mt-3 flex h-11 w-full items-center justify-center rounded-lg border border-[#E3D7D1] bg-white px-4 text-sm font-bold text-[#8B574B] transition hover:bg-[#F5EFEC]"
          (click)="logout()"
        >
          Sair
        </button>
      </div>
    </aside>

    <!-- Desktop sidebar -->
    <aside
      class="hidden self-start bg-[#FAFAF9] px-4 py-6 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:overflow-y-auto"
    >
      <div class="pb-8">
        <div class="flex-row items-center gap-4">
          <a href="">
            <img
              src="/Logo_clinica.svg"
              alt=""
              draggable="false"
              class="m-3 h-15 w-auto"
              aria-hidden="true"
            />
          </a>
          <div>
            <p class="p-2 text-sm font-bold text-[#7c5145b6]">Olá, {{ displayName() }}</p>
          </div>
        </div>

        <nav class="mt-5 space-y-1" aria-label="Area administrativa">
          @for (item of items; track item.label) {
            <a
              [routerLink]="item.link"
              [attr.aria-current]="isItemActive(item) ? 'page' : null"
              class="flex h-11 items-center gap-3 rounded-xl px-4 text-sm tracking-wide transition hover:bg-[#EDE8E6] hover:text-[#8B574B]"
              [class.bg-[#EDE8E6]]="isItemActive(item)"
              [class.font-semibold]="isItemActive(item)"
              [class.text-[#8B574B]]="isItemActive(item)"
              [class.text-[#78716C]]="!isItemActive(item)"
              (click)="closeMobile()"
            >
              <img
                [src]="item.icon"
                alt=""
                class="h-5 w-5"
                [style.filter]="
                  isItemActive(item)
                    ? 'invert(33%) sepia(22%) saturate(560%) hue-rotate(340deg) brightness(95%) contrast(90%)'
                    : 'none'
                "
              />
              <span>{{ item.label }}</span>
            </a>
          }
        </nav>
      </div>

      <div class="mt-auto border-t border-[#EEE8E5] pt-8">
        <div class="flex items-center gap-3 px-2">
          <div
            class="grid h-11 w-11 place-items-center rounded-full bg-[#DFA17C] text-sm font-bold text-[#1F2425]"
          >
            {{ initials() }}
          </div>
          <div>
            <p class="text-sm font-bold text-[#1F2425]">{{ displayName() }}</p>
          </div>
        </div>

        <a
          routerLink="/schedule/new"
          class="mt-6 flex h-11 items-center justify-center gap-2 rounded-lg bg-[#8B574B] px-4 text-sm font-bold text-white shadow-lg shadow-[#8B574B]/20 transition hover:bg-[#744A40]"
          (click)="closeMobile()"
        >
          <span class="text-lg leading-none">+</span>
          Novo Atendimento
        </a>

        <button
          type="button"
          class="mt-3 flex h-11 w-full items-center justify-center rounded-lg border border-[#E3D7D1] bg-white px-4 text-sm font-bold text-[#8B574B] transition hover:bg-[#F5EFEC]"
          (click)="logout()"
        >
          Sair
        </button>
      </div>
    </aside>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlobalSidebarComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  protected readonly mobileOpen = signal(false);
  protected readonly currentUrl = signal(this.router.url);
  protected readonly currentUser = signal<CurrentUser | null>(null);

  protected readonly items: SidebarItem[] = [
    {
      label: 'Painel',
      icon: '/Painel_icon.svg',
      link: '/panel',
      match: ['/panel'],
    },
    {
      label: 'Pacientes',
      icon: '/pacientes.svg',
      link: '/pacientes',
      match: ['/pacientes'],
    },
    { label: 'Agenda', icon: '/agenda.svg', link: '/schedule', match: ['/schedule'] },
    {
      label: 'Prontuários',
      icon: '/prontuarios.svg',
      link: '/medical-records',
      match: ['/medical-records'],
    },
    {
      label: 'Tratamentos',
      icon: '/tratamentos.svg',
      link: '/treatments',
      match: ['/treatments'],
    },
    { label: 'Estoque', icon: '/estoque.svg', link: '/inventories', match: ['/inventories'] },
    { label: 'Clínicas', icon: '/Clinicas.svg', link: '/clinics', match: ['/clinics'] },
    {
      label: 'Certificados',
      icon: '/certificados.svg',
      link: '/certificados',
      match: ['/certificados'],
    },
  ];

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.currentUrl.set(this.router.url));

    if (this.authService.isTokenValid()) {
      this.authService
        .getCurrentUser()
        .pipe(takeUntilDestroyed())
        .subscribe({
          next: (user) => this.currentUser.set(user),
          error: () => this.currentUser.set(null),
        });
    }
  }

  protected toggleMobile(): void {
    this.mobileOpen.update((open) => !open);
  }

  protected closeMobile(): void {
    this.mobileOpen.set(false);
  }

  protected isItemActive(item: SidebarItem): boolean {
    return item.match.some((prefix) =>
      prefix === '/' ? this.currentUrl() === '/' : this.currentUrl().startsWith(prefix),
    );
  }

  protected logout(): void {
    this.authService.logout();
    void this.router.navigateByUrl('/admin-access');
  }

  protected displayName(): string {
    const user = this.currentUser();
    const fullName = this.stringClaim(user?.claims?.['name']);
    const givenName = this.stringClaim(user?.claims?.['given_name']);
    const familyName = this.stringClaim(user?.claims?.['family_name']);

    if (fullName) {
      return fullName;
    }

    const composedName = [givenName, familyName].filter(Boolean).join(' ').trim();
    if (composedName) {
      return composedName;
    }

    if (user?.username) {
      return user.username;
    }

    return 'Usuário';
  }

  protected initials(): string {
    const nameParts = this.displayName().split(/\s+/).filter(Boolean).slice(0, 2);

    if (!nameParts.length) {
      return 'US';
    }

    return nameParts.map((part) => part[0]?.toUpperCase() ?? '').join('');
  }

  private stringClaim(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
  }
}
