import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { AuthService, CurrentUser } from '../../../../core/services/auth.service';

interface SidebarItem {
  label: string;
  icon: string;
  link: string;
  match: readonly string[];
  adminOnly?: boolean;
}

@Component({
  selector: 'app-global-sidebar',
  imports: [RouterLink, NgOptimizedImage],
  template: `
    <aside
      class="hidden self-start bg-[#FAFAF9] px-4 py-6 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:overflow-y-auto"
    >
      <div class="pb-8">
        <div class="flex-row items-center gap-4">
          <img
            [ngSrc]="logo.icon"
            alt=""
            draggable="false"
            class="m-3 h-15 w-auto"
            width="20"
            height="20"
            aria-hidden="true"
          />
          <div>
            <p class="p-2 text-sm font-bold text-[#7c5145b6]">Olá, {{ displayName() }}</p>
          </div>
        </div>

        <nav class="mt-5 space-y-1" aria-label="Area administrativa">
          @for (item of visibleItems(); track item.label) {
            <a
              [routerLink]="item.link"
              [attr.aria-current]="isItemActive(item) ? 'page' : null"
              class="flex h-11 items-center gap-3 rounded-xl px-4 text-sm tracking-wide transition"
              [class.bg-[#EDE8E6]]="isItemActive(item)"
              [class.font-semibold]="isItemActive(item)"
              [class.text-[#8B574B]]="isItemActive(item)"
              [class.text-[#78716C]]="!isItemActive(item)"
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
        <a
          routerLink="/meu-perfil"
          [attr.aria-current]="isItemActive(profileItem) ? 'page' : null"
          class="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-[#EDE8E6]"
          [class.bg-[#EDE8E6]]="isItemActive(profileItem)"
          title="Ver meu perfil"
        >
          <div
            class="grid h-11 w-11 place-items-center rounded-full bg-[#DFA17C] text-sm font-bold text-[#1F2425]"
          >
            {{ initials() }}
          </div>
          <div>
            <p class="text-sm font-bold text-[#1F2425]">{{ displayName() }}</p>
            <p class="text-xs font-medium text-[#8B574B]">Meu Perfil</p>
          </div>
        </a>

        <a
          routerLink="/medical-records/1"
          class="mt-6 flex h-11 items-center justify-center gap-2 rounded-lg bg-[#8B574B] px-4 text-sm font-bold text-white shadow-lg shadow-[#8B574B]/20 transition hover:bg-[#744A40]"
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

  protected readonly currentUrl = signal(this.router.url);
  protected readonly currentUser = signal<CurrentUser | null>(null);
  protected readonly items: SidebarItem[] = [
    { label: 'Painel', icon: '/Painel_icon.svg', link: '/medical-records/1', match: ['/dashboard'] },
    { label: 'Pacientes', icon: '/pacientes.svg', link: '/medical-records/1', match: ['/patients'] },
    { label: 'Agenda', icon: '/agenda.svg', link: '/medical-records/1', match: ['/agenda'] },
    { label: 'Prontuários', icon: '/prontuarios.svg', link: '/medical-records/1', match: ['/medical-records'] },
    {
      label: 'Tratamentos',
      icon: '/tratamentos.svg',
      link: '/patients/a3f7c291-5e4b-4d82-b913-0f2c8e7a1d56/treatments',
      match: ['/treatments', '/patients/'],
    },
    { label: 'Estoque', icon: '/estoque.svg', link: '/medical-records/1', match: ['/stock'] },
    { label: 'Funcionários', icon: '/pacientes.svg', link: '/colaboradores', match: ['/colaboradores', '/profissionais'], adminOnly: true },
    { label: 'Clínicas', icon: '/Clinicas.svg', link: '/clinics', match: ['/clinics'] },
    { label: 'Certificados', icon: '/certificados.svg', link: '/medical-records/1', match: ['/certificates'] },
  ];

  protected readonly profileItem: SidebarItem = {
    label: 'Meu Perfil',
    icon: '/pacientes.svg',
    link: '/meu-perfil',
    match: ['/meu-perfil'],
  };

  protected readonly isAdmin = computed(() =>
    (this.currentUser()?.roles ?? []).some((role) => role.toUpperCase() === 'ADMIN'),
  );

  protected readonly visibleItems = computed(() =>
    this.items.filter((item) => !item.adminOnly || this.isAdmin()),
  );
  protected readonly logo = { label: 'Logo', icon: '/Logo_clinica.svg' };

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

  protected isItemActive(item: SidebarItem): boolean {
    return item.match.some((prefix) => this.currentUrl().startsWith(prefix));
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
    const nameParts = this.displayName()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2);

    if (!nameParts.length) {
      return 'US';
    }

    return nameParts.map((part) => part[0]?.toUpperCase() ?? '').join('');
  }

  private stringClaim(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
  }
}
