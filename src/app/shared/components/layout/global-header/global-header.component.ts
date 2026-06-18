import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  link: string;
  fragment?: string;
  exact: boolean;
}

interface MobileNavItem extends NavItem {
  icon: string;
}

@Component({
  selector: 'app-global-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header
      class="sticky top-0 left-0 right-0 z-50 h-24 bg-[#F8F5F2] border-b border-[#E5DCD5]"
      style="box-shadow: 0px 1px 2px 0px #E7E5E47F"
    >
      <div class="flex justify-between items-center h-full px-8">
        <div class="flex items-center justify-between w-full lg:hidden">
          <button
            (click)="toggleMenu()"
            class="p-1 rounded-full text-[#8C6255]"
            aria-label="Abrir Menu"
          >
            <svg
              width="18"
              height="12"
              viewBox="0 0 18 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0 12V10H18V12H0ZM0 7V5H18V7H0ZM0 2V0H18V2H0Z" fill="#8C6255" />
            </svg>
          </button>
          <a routerLink="/" class="ml-auto">
            <img
              src="/Logo_clinica.svg"
              alt="Dra. Mariana Dias"
              class="h-8 w-auto object-contain"
            />
          </a>
        </div>

        <a routerLink="/" class="hidden lg:flex items-center">
          <img src="/Logo_clinica.svg" alt="Dra. Mariana Dias" class="w-35 h-16 object-fill" />
        </a>

        <nav class="hidden lg:flex flex-1 justify-center items-center gap-8">
          @for (item of desktopNavItems; track item.label) {
            <a
              [routerLink]="item.link"
              [fragment]="item.fragment"
              routerLinkActive="active-link"
              [routerLinkActiveOptions]="{ exact: item.exact }"
              class="nav-link text-stone-600 text-lg transition-colors duration-200 relative group hover:text-[#7C5145]"
            >
              {{ item.label }}
              <span
                class="absolute -bottom-1 left-0 w-0 h-px bg-[#7C5145] transition-all duration-200 group-hover:w-full"
              ></span>
            </a>
          }
        </nav>

        <a
          routerLink="/admin-access"
          class="hidden lg:inline-block rounded-lg bg-[#89594C] px-7 py-3 text-base font-medium text-white shadow-sm transition hover:bg-[#744A40] sm:text-lg"
        >
          <span class="text-base">Entrar</span>
        </a>
      </div>
    </header>

    @if (isMenuOpen()) {
      <div
        class="lg:hidden fixed inset-0 z-50 bg-black/30"
        (click)="toggleMenu()"
        aria-hidden="true"
      ></div>

      <aside
        class="lg:hidden fixed top-0 left-0 z-60 h-full w-72 bg-[#F8F5F2] flex flex-col"
        style="box-shadow: 38px 25px 50px 0px rgba(0,0,0,0.25)"
      >
        <div class="flex flex-col h-full p-8">
          <div class="mb-8">
            <span class="text-[#8C6255] text-xl font-serif leading-7"
              >Clínica Dra. Mariana Dias</span
            >
          </div>

          <nav class="flex flex-col gap-2 flex-1" aria-label="Menu principal">
            @for (item of mobileNavItems; track item.label) {
              <a
                [routerLink]="item.link"
                [fragment]="item.fragment"
                routerLinkActive
                #rla="routerLinkActive"
                [routerLinkActiveOptions]="{ exact: item.exact }"
                (click)="toggleMenu()"
                class="flex items-center gap-4 px-4 py-4 rounded-lg transition-colors hover:bg-[#EDE9E6]"
                [class.border-l-4]="rla.isActive"
                [class.border-[#8C6255]]="rla.isActive"
                [class.bg-[#F5F5F4]]="rla.isActive"
              >
                <img
                  [src]="item.icon"
                  alt=""
                  class="h-5 w-5"
                  [style.filter]="
                    rla.isActive
                      ? 'invert(33%) sepia(22%) saturate(560%) hue-rotate(340deg) brightness(95%) contrast(90%)'
                      : 'none'
                  "
                />
                <span
                  class="text-base font-serif leading-6"
                  [class.text-[#8C6255]]="rla.isActive"
                  [class.text-[#57534E]]="!rla.isActive"
                >
                  {{ item.label }}
                </span>
              </a>
            }
          </nav>
        </div>
      </aside>
    }
  `,
  styles: [
    `
      a.active-link {
        color: #7c5145 !important;
        font-weight: 700;
      }
      a.active-link span {
        width: 100% !important;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlobalHeaderComponent {
  isMenuOpen = signal(false);

  toggleMenu() {
    this.isMenuOpen.update((v) => !v);
  }

  protected readonly desktopNavItems: NavItem[] = [
    { label: 'Sobre', link: '/', exact: true },
    { label: 'Atendimento', link: '/attendance', exact: true },
    { label: 'Unidades', link: '/locations', exact: true },
  ];

  protected readonly mobileNavItems: MobileNavItem[] = [
    { label: 'Início', link: '/', exact: true, icon: '/Painel_icon.svg' },
    { label: 'Unidades', link: '/locations', exact: true, icon: '/Clinicas.svg' },
    { label: 'Atendimento', link: '/attendance', exact: true, icon: '/prontuarios.svg' },
    { label: 'Acesso Administrativo', link: '/admin-access', exact: true, icon: '/pacientes.svg' },
  ];
}