import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-global-header',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="border-b border-[#E8DED8] bg-white">
      <div class="flex min-h-24 items-center justify-between gap-6 px-6 py-4 lg:min-h-20 lg:px-12">
        <a routerLink="/" class="shrink-0" aria-label="Dra. Mariana Dias">
          <img
            src="/mariana-dias-logo.png"
            alt="Mariana Dias Odontologia Estética"
            class="h-auto w-[190px] max-w-[44vw] object-contain sm:w-[130px]"
          />
        </a>

        <nav
          class="hidden items-center gap-12 text-base font-semibold text-[#5E514B] md:flex"
          aria-label="Principal"
        >
          @for (item of navItems; track item.label) {
            <a
              [routerLink]="item.link"
              [fragment]="item.fragment"
              routerLinkActive="border-[#89594C] text-[#89594C]"
              [routerLinkActiveOptions]="{ exact: item.exact }"
              class="border-b-4 border-transparent pb-2 transition hover:text-[#89594C]"
            >
              {{ item.label }}
            </a>
          }
        </nav>

        <a
          routerLink="/medical-records"
          class="rounded-lg bg-[#89594C] px-7 py-3 text-base font-medium text-white shadow-sm transition hover:bg-[#744A40] sm:text-lg"
        >
          Entrar
        </a>
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlobalHeaderComponent {
  protected readonly navItems = [
    { label: 'Sobre', link: '/', fragment: 'sobre', exact: true },
    { label: 'Atendimento', link: '/', fragment: 'atendimento', exact: true },
    { label: 'Unidades', link: '/unidades', fragment: undefined, exact: true },
  ];
}
