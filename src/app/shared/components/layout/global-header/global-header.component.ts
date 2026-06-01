import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-global-header',
  imports: [RouterLink],
  template: `
    <header class="border-b border-[#E8DED8] bg-white">
      <div class="flex min-h-24 items-center justify-between gap-6 px-6 py-4 lg:min-h-28 lg:px-12">
        <a routerLink="/" class="shrink-0 text-[#B77D6F]" aria-label="Dra. Mariana Dias">
          <div class="text-center leading-none">
            <div class="mx-auto mb-2 h-10 w-12 text-4xl font-light leading-8 tracking-[-0.08em]">
              MD
            </div>
            <div class="text-xl font-light tracking-[0.28em] sm:text-2xl">MARIANA DIAS</div>
            <div class="mt-1 text-[0.55rem] font-semibold tracking-[0.48em]">ODONTOLOGIA ESTETICA</div>
          </div>
        </a>

        <nav class="hidden items-center gap-12 text-2xl font-semibold text-[#5E514B] md:flex" aria-label="Principal">
          @for (item of navItems; track item.label) {
            <a
              [routerLink]="item.link"
              class="border-b-4 border-transparent pb-2 transition hover:text-[#89594C]"
              [class.border-[#89594C]]="item.active"
              [class.text-[#89594C]]="item.active"
            >
              {{ item.label }}
            </a>
          }
        </nav>

        <a
          routerLink="/medical-records/1"
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
    { label: 'Sobre', link: '/', active: true },
    { label: 'Atendimento', link: '/', active: false },
    { label: 'Unidades', link: '/', active: false },
  ];
}
