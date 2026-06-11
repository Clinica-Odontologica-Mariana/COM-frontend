import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';

interface SidebarItem {
  label: string;
  icon: string;
  link: string;
  match: readonly string[];
}

@Component({
  selector: 'app-global-sidebar',
  imports: [RouterLink, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside [class]="sidebarClass()">
      <!-- Mobile close row -->
      <div class="mb-4 flex items-center justify-between lg:hidden">
        <span
          style="font-family: Manrope, sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #78716C;"
          >Menu</span
        >
        <button
          type="button"
          class="grid h-8 w-8 place-items-center rounded-full transition hover:bg-[#EDE8E6]"
          style="color: #7C5145;"
          (click)="closeMobile.emit()"
          aria-label="Fechar menu"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M1 1l12 12M13 1L1 13"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>

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
            <p class="p-2 text-sm font-bold text-[#7c5145b6]">Olá, Usuário</p>
          </div>
        </div>

        <nav class="mt-5 space-y-1" aria-label="Area administrativa">
          @for (item of items; track item.label) {
            <a
              [routerLink]="item.link"
              [attr.aria-current]="isItemActive(item) ? 'page' : null"
              class="flex h-11 items-center gap-3 rounded-xl px-4 text-sm tracking-wide transition"
              [class.bg-[#EDE8E6]]="isItemActive(item)"
              [class.font-semibold]="isItemActive(item)"
              [class.text-[#8B574B]]="isItemActive(item)"
              [class.text-[#78716C]]="!isItemActive(item)"
              (click)="closeMobile.emit()"
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
          (click)="closeMobile.emit()"
        >
          <span class="text-lg leading-none">+</span>
          Novo Atendimento
        </a>
      </div>
    </aside>
  `,
})
export class GlobalSidebarComponent {
  mobileOpen = input(false);
  closeMobile = output<void>();

  private router = inject(Router);

  private currentUrl = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e) => (e as NavigationEnd).urlAfterRedirects),
      startWith(this.router.url),
    ),
  );

  protected readonly items: SidebarItem[] = [
    {
      label: 'Painel',
      icon: '/Painel_icon.svg',
      link: '/medical-records/1',
      match: ['/dashboard'],
    },
    {
      label: 'Pacientes',
      icon: '/pacientes.svg',
      link: '/medical-records/1',
      match: ['/patients'],
    },
    { label: 'Agenda', icon: '/agenda.svg', link: '/medical-records/1', match: ['/agenda'] },
    {
      label: 'Prontuários',
      icon: '/prontuarios.svg',
      link: '/medical-records/1',
      match: ['/medical-records'],
    },
    {
      label: 'Tratamentos',
      icon: '/tratamentos.svg',
      link: '/treatments',
      match: ['/treatments'],
    },
    { label: 'Estoque', icon: '/estoque.svg', link: '/medical-records/1', match: ['/stock'] },
    { label: 'Clínicas', icon: '/Clinicas.svg', link: '/clinics', match: ['/clinics'] },
    {
      label: 'Certificados',
      icon: '/certificados.svg',
      link: '/medical-records/1',
      match: ['/certificates'],
    },
  ];
  protected readonly logo = { label: 'Logo', icon: '/Logo_clinica.svg' };

  protected sidebarClass = computed(() => {
    const base = 'bg-[#FAFAF9] px-4 py-6 flex-col overflow-y-auto';
    if (this.mobileOpen()) {
      return `${base} fixed left-0 top-0 h-screen w-64 z-50 flex shadow-2xl`;
    }
    return `${base} hidden lg:flex lg:h-full lg:min-h-fit`;
  });

  protected isItemActive(item: SidebarItem): boolean {
    return item.match.some((prefix) => (this.currentUrl() ?? '').startsWith(prefix));
  }
}
