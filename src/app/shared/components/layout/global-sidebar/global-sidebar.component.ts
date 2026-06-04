import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface SidebarItem {
  label: string;
  icon: string;
  link: string | null;
}

@Component({
  selector: 'app-global-sidebar',
  imports: [RouterLink, RouterLinkActive, NgOptimizedImage],
  template: `
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
            @if (item.link) {
              <a
                [routerLink]="item.link"
                routerLinkActive="bg-[rgba(124,81,69,0.1)] font-bold text-[#7C5145]"
                class="flex h-11 items-center gap-3 rounded-xl px-4 text-sm tracking-wide text-[#78716C] transition hover:bg-[#EDE8E6]/50"
                #rla="routerLinkActive"
                [attr.aria-current]="rla.isActive ? 'page' : null"
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
                <span>{{ item.label }}</span>
              </a>
            } @else {
              <a
                href="#"
                class="flex h-11 items-center gap-3 rounded-xl px-4 text-sm tracking-wide text-[#78716C] transition hover:bg-[#EDE8E6]/50"
              >
                <img [src]="item.icon" alt="" class="h-5 w-5" />
                <span>{{ item.label }}</span>
              </a>
            }
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
          routerLink="/agenda/novo"
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
  protected readonly items: SidebarItem[] = [
    { label: 'Painel', icon: '/Painel_icon.svg', link: null },
    { label: 'Pacientes', icon: '/pacientes.svg', link: null },
    { label: 'Agenda', icon: '/agenda.svg', link: '/agenda' },
    { label: 'Prontuários', icon: '/prontuarios.svg', link: null },
    { label: 'Tratamentos', icon: '/tratamentos.svg', link: null },
    { label: 'Estoque', icon: '/estoque.svg', link: null },
    { label: 'Clínicas', icon: '/Clinicas.svg', link: null },
    { label: 'Certificados', icon: '/certificados.svg', link: null },
  ];

  protected readonly logo = { label: 'Logo', icon: '/Logo_clinica.svg' };
}
