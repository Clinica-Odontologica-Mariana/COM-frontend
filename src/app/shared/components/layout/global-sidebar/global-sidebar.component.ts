import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface SidebarItem {
  label: string;
  icon: string;
  link: string;
  exact?: boolean;
}

@Component({
  selector: 'app-global-sidebar',
  imports: [RouterLink, RouterLinkActive, NgOptimizedImage],
  template: `
    <!-- Mobile header -->
    <div class="flex items-center justify-between border-b border-[#EEE8E5] bg-[#FAFAF9] px-4 py-3 lg:hidden">
      <img
        [ngSrc]="logo.icon"
        alt=""
        draggable="false"
        class="h-8 w-auto"
        width="20"
        height="20"
        aria-hidden="true"
      />
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
      <nav class="mt-2 space-y-1" aria-label="Area administrativa">
        @for (item of items; track item.label) {
          <a
            [routerLink]="item.link"
            routerLinkActive="bg-[#EDE8E6] font-semibold text-[#8B574B]"
            [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
            #mobileNavLink="routerLinkActive"
            [attr.aria-current]="mobileNavLink.isActive ? 'page' : null"
            class="flex h-11 items-center gap-3 rounded-xl px-4 text-sm tracking-wide text-[#78716C] transition"
            (click)="closeMobile()"
          >
            <img [src]="item.icon" alt="" class="h-5 w-5" />
            <span>{{ item.label }}</span>
          </a>
        }
      </nav>
    </aside>

    <!-- Desktop sidebar -->
    <aside class="hidden h-full min-h-fit bg-[#FAFAF9] px-4 py-6 lg:flex lg:flex-col">
      <div class="pb-8">
        <div class="flex-row items-center gap-4 ">
          <img
            [ngSrc]="logo.icon"
            alt=""
            draggable="false"
            class="h-15 w-auto m-3"
            width="20"
            height="20"
            aria-hidden="true"
          />
          <div>
            <p class="text-sm font-bold text-[#7c5145b6] p-2">Olá, Usuário</p>
          </div>
        </div>

        <nav class="mt-5 space-y-1" aria-label="Area administrativa">
          @for (item of items; track item.label) {
            <a
              [routerLink]="item.link"
              routerLinkActive="bg-[#EDE8E6] font-semibold text-[#8B574B]"
              [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
              #navLink="routerLinkActive"
              [attr.aria-current]="navLink.isActive ? 'page' : null"
              class="flex h-11 items-center gap-3 rounded-xl px-4 text-sm tracking-wide text-[#78716C] transition"
            >
              <img
                [src]="item.icon"
                alt=""
                class="h-5 w-5"
                [style.filter]="
                  navLink.isActive
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
            DM
          </div>
          <div>
            <p class="text-sm font-bold text-[#1F2425]">Dra. Mariana</p>
            <p class="text-xs text-[#78716C]">Administração</p>
          </div>
        </div>

        <a
          routerLink="/medical-records/1"
          class="mt-6 flex h-11 items-center justify-center gap-2 rounded-lg bg-[#8B574B] px-4 text-sm font-bold text-white shadow-lg shadow-[#8B574B]/20 transition hover:bg-[#744A40]"
        >
          <span class="text-lg leading-none">+</span>
          Novo Atendimento
        </a>
      </div>
    </aside>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlobalSidebarComponent {
  protected readonly mobileOpen = signal(false);

  protected readonly items: SidebarItem[] = [
    { label: 'Painel', icon: '/Painel_icon.svg', link: '/medical-records/1', exact: true },
    { label: 'Pacientes', icon: '/pacientes.svg', link: '/pacientes' },
    { label: 'Agenda', icon: '/agenda.svg', link: '/medical-records/1', exact: true },
    { label: 'Prontuários', icon: '/prontuarios.svg', link: '/medical-records/1', exact: true },
    { label: 'Tratamentos', icon: '/tratamentos.svg', link: '/medical-records/1', exact: true },
    { label: 'Estoque', icon: '/estoque.svg', link: '/medical-records/1', exact: true },
    { label: 'Clínicas', icon: '/Clinicas.svg', link: '/medical-records/1', exact: true },
    { label: 'Certificados', icon: '/certificados.svg', link: '/medical-records/1', exact: true },
  ];

  protected readonly logo = { label: 'Logo', icon: '/Logo_clinica.svg' };

  protected toggleMobile(): void {
    this.mobileOpen.update((open) => !open);
  }

  protected closeMobile(): void {
    this.mobileOpen.set(false);
  }
}
